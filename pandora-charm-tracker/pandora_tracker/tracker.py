import logging
import time
from typing import Dict

from . import pricing
from .config import Config
from .ebay import EbayPriceLookup
from .notifier import Deal, Notifier, SeenStore
from .vinted import VintedClient

log = logging.getLogger(__name__)


def _extract_price(item: Dict) -> float:
    p = item.get("price")
    if isinstance(p, dict):
        return float(p.get("amount") or 0)
    try:
        return float(p)
    except (TypeError, ValueError):
        return 0.0


def run(cfg: Config, once: bool = False, open_in_browser: bool = False) -> None:
    vinted = VintedClient(domain=cfg.vinted.domain)
    ebay = EbayPriceLookup(
        domain=cfg.ebay.domain,
        sample_size=cfg.ebay.sold_sample_size,
        cache_ttl_hours=cfg.ebay.cache_ttl_hours,
    )
    notifier = Notifier(
        desktop=cfg.notify.desktop,
        webhook_url=cfg.notify.webhook_url,
        open_in_browser=open_in_browser,
    )
    seen = SeenStore(cfg.notify.seen_file)

    log.info(
        "tracker starting: %d queries, every %ds",
        len(cfg.vinted.queries),
        cfg.vinted.poll_interval_seconds,
    )

    while True:
        cycle_start = time.time()
        for query in cfg.vinted.queries:
            try:
                items = vinted.search_newest(
                    query, catalog_ids=cfg.vinted.catalog_ids
                )
            except Exception as e:
                log.warning("vinted search %r failed: %s", query, e)
                continue
            log.info("vinted %r returned %d items", query, len(items))
            for item in items:
                _process(item, cfg, ebay, notifier, seen)
            seen.save()
        if once:
            return
        elapsed = time.time() - cycle_start
        sleep_for = max(5.0, cfg.vinted.poll_interval_seconds - elapsed)
        time.sleep(sleep_for)


def _process(item: Dict, cfg: Config, ebay, notifier, seen) -> None:
    vid = item.get("id")
    if vid is None or vid in seen:
        return
    seen.add(int(vid))

    title = item.get("title") or ""
    if not pricing.title_passes_filters(
        title, cfg.filters.allowlist, cfg.filters.blocklist
    ):
        return

    buy = _extract_price(item)
    if buy <= 0 or buy > cfg.vinted.max_buy_price:
        return

    query = pricing.build_ebay_query(title)
    median, sample = ebay.estimate(query)
    if median is None or sample < 3:
        log.debug("skip (no ebay data) %r -> %r", title, query)
        return

    ok, est_profit = pricing.is_worth_sniping(
        buy_price=buy,
        resale_median=median,
        min_profit_gbp=cfg.profit.min_profit_gbp,
        min_profit_ratio=cfg.profit.min_profit_ratio,
        fee_fraction=cfg.ebay.fee_fraction,
        shipping_cost=cfg.ebay.shipping_cost,
    )
    if not ok:
        return

    url = item.get("url") or f"https://www.{cfg.vinted.domain}/items/{vid}"
    photo = None
    photo_obj = item.get("photo") or {}
    if isinstance(photo_obj, dict):
        photo = photo_obj.get("url") or photo_obj.get("full_size_url")

    notifier.send(
        Deal(
            vinted_id=int(vid),
            title=title,
            url=url,
            buy_price=buy,
            currency=cfg.vinted.currency,
            resale_median=median,
            resale_sample=sample,
            profit=est_profit,
            image_url=photo,
        )
    )
