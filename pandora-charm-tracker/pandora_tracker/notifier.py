import json
import logging
import webbrowser
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Set

import requests

log = logging.getLogger(__name__)


@dataclass
class Deal:
    vinted_id: int
    title: str
    url: str
    buy_price: float
    currency: str
    resale_median: float
    resale_sample: int
    profit: float
    image_url: Optional[str] = None


class Notifier:
    def __init__(
        self,
        desktop: bool = True,
        webhook_url: str = "",
        open_in_browser: bool = False,
    ):
        self.desktop = desktop
        self.webhook_url = webhook_url
        self.open_in_browser = open_in_browser

    def send(self, deal: Deal) -> None:
        headline = (
            f"SNIPE £{deal.buy_price:.2f} → ~£{deal.resale_median:.2f} "
            f"(profit £{deal.profit:.2f})"
        )
        body = f"{deal.title}\n{deal.url}"

        print("\n" + "=" * 72)
        print(headline)
        print(body)
        print(f"eBay sample: {deal.resale_sample} sold listings")
        print("=" * 72, flush=True)

        if self.desktop:
            self._desktop(headline, body)
        if self.webhook_url:
            self._webhook(deal, headline)
        if self.open_in_browser:
            try:
                webbrowser.open(deal.url, new=2)
            except Exception as e:
                log.warning("browser open failed: %s", e)

    def _desktop(self, title: str, body: str) -> None:
        try:
            from plyer import notification  # type: ignore
            notification.notify(title=title, message=body, timeout=10)
        except Exception as e:
            log.debug("desktop notify unavailable: %s", e)

    def _webhook(self, deal: Deal, headline: str) -> None:
        payload = {
            "content": headline,
            "embeds": [
                {
                    "title": deal.title[:256],
                    "url": deal.url,
                    "description": (
                        f"Buy: £{deal.buy_price:.2f}\n"
                        f"Median resale: £{deal.resale_median:.2f} "
                        f"(n={deal.resale_sample})\n"
                        f"Estimated profit: £{deal.profit:.2f}"
                    ),
                    "image": {"url": deal.image_url} if deal.image_url else None,
                }
            ],
        }
        try:
            requests.post(self.webhook_url, json=payload, timeout=10)
        except requests.RequestException as e:
            log.warning("webhook post failed: %s", e)


class SeenStore:
    """Persists Vinted listing IDs we've already processed so a restart
    doesn't cause a notification storm."""

    def __init__(self, path: str, cap: int = 5000):
        self.path = Path(path)
        self.cap = cap
        self.ids: Set[int] = set()
        if self.path.exists():
            try:
                self.ids = set(json.loads(self.path.read_text()))
            except (json.JSONDecodeError, OSError) as e:
                log.warning("could not read %s: %s", self.path, e)

    def __contains__(self, vinted_id: int) -> bool:
        return vinted_id in self.ids

    def add(self, vinted_id: int) -> None:
        self.ids.add(vinted_id)

    def save(self) -> None:
        trimmed = list(self.ids)[-self.cap :]
        try:
            self.path.write_text(json.dumps(trimmed))
        except OSError as e:
            log.warning("could not write %s: %s", self.path, e)
