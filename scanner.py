"""
Vinted Instax scanner. Polls Vinted UK for new Instax listings under £20
and posts to a Discord channel the moment one appears.

Setup:
  1. In Discord: Server Settings -> Integrations -> Webhooks -> New Webhook,
     pick a channel, click "Copy Webhook URL".
  2. Copy .env.example to .env and paste the URL as DISCORD_WEBHOOK_URL.
  3. Enable phone notifications for that channel (channel name -> bell icon
     -> All Messages, and make sure Discord push notifications are on).
  4. pip install -r requirements.txt
  5. python scanner.py
"""
from __future__ import annotations

import json
import logging
import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

VINTED_BASE = "https://www.vinted.co.uk"
SEARCH_URL = f"{VINTED_BASE}/api/v2/catalog/items"
SEEN_FILE = Path(__file__).with_name("seen.json")

QUERY = "instax"
MAX_PRICE_GBP = 20.0
POLL_SECONDS = 30
PER_PAGE = 30

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("vinted")


def load_seen() -> set[int]:
    if not SEEN_FILE.exists():
        return set()
    try:
        return set(json.loads(SEEN_FILE.read_text()))
    except json.JSONDecodeError:
        return set()


def save_seen(seen: set[int]) -> None:
    # Cap stored ids so the file doesn't grow forever.
    trimmed = sorted(seen)[-5000:]
    SEEN_FILE.write_text(json.dumps(trimmed))


def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-GB,en;q=0.9",
            "Referer": f"{VINTED_BASE}/catalog?search_text={QUERY}",
        }
    )
    # Hit the homepage so Vinted sets the anonymous session cookies the API needs.
    s.get(VINTED_BASE, timeout=15)
    return s


def fetch_listings(session: requests.Session) -> list[dict]:
    params = {
        "search_text": QUERY,
        "price_to": MAX_PRICE_GBP,
        "currency": "GBP",
        "order": "newest_first",
        "per_page": PER_PAGE,
        "page": 1,
    }
    r = session.get(SEARCH_URL, params=params, timeout=15)
    if r.status_code in (401, 403):
        # Cookies expired — caller will rebuild the session.
        raise PermissionError(f"vinted returned {r.status_code}")
    r.raise_for_status()
    return r.json().get("items", [])


def parse_price(item: dict) -> float | None:
    price = item.get("price") or item.get("total_item_price")
    if isinstance(price, dict):
        amount = price.get("amount")
    else:
        amount = price
    try:
        return float(amount) if amount is not None else None
    except (TypeError, ValueError):
        return None


def notify(text: str) -> None:
    if not DISCORD_WEBHOOK_URL:
        log.warning("discord webhook not configured; would send: %s", text)
        return
    try:
        r = requests.post(
            DISCORD_WEBHOOK_URL,
            json={"content": text},
            timeout=10,
        )
        if r.status_code == 429:
            retry_after = float(r.headers.get("Retry-After", "1"))
            log.warning("discord rate-limited, sleeping %.1fs", retry_after)
            time.sleep(retry_after)
        elif not r.ok:
            log.error("discord send failed: %s %s", r.status_code, r.text)
    except requests.RequestException as e:
        log.error("discord send error: %s", e)


def format_alert(item: dict, price: float) -> str:
    title = item.get("title", "Untitled")
    url = item.get("url") or f"{VINTED_BASE}/items/{item.get('id')}"
    size = item.get("size_title") or ""
    brand = item.get("brand_title") or ""
    bits = [b for b in (brand, size) if b]
    suffix = f" — {' / '.join(bits)}" if bits else ""
    return f"NEW £{price:.2f}: {title}{suffix}\n{url}"


def main() -> int:
    if not DISCORD_WEBHOOK_URL:
        log.warning("DISCORD_WEBHOOK_URL not set — running in dry-run mode.")

    seen = load_seen()
    log.info("loaded %d seen ids", len(seen))
    session = make_session()
    first_pass = not seen

    while True:
        try:
            items = fetch_listings(session)
        except PermissionError as e:
            log.warning("%s — refreshing session", e)
            session = make_session()
            time.sleep(POLL_SECONDS)
            continue
        except requests.RequestException as e:
            log.error("fetch failed: %s", e)
            time.sleep(POLL_SECONDS)
            continue

        new_items = []
        for item in items:
            item_id = item.get("id")
            if item_id is None or item_id in seen:
                continue
            price = parse_price(item)
            if price is None or price > MAX_PRICE_GBP:
                seen.add(item_id)
                continue
            seen.add(item_id)
            new_items.append((item, price))

        if first_pass:
            # On the first poll just record what's there — don't spam old listings.
            log.info("first pass: indexed %d existing listings", len(items))
            first_pass = False
        else:
            for item, price in new_items:
                msg = format_alert(item, price)
                log.info("ALERT %s", msg.replace("\n", " | "))
                notify(msg)

        save_seen(seen)
        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        log.info("stopped")
