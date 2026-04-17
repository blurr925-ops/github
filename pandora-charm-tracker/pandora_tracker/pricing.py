import re
from typing import Iterable, Optional

# Pandora's internal catalog codes look like "ALE 790123" or "S925 ALE 791234".
_ALE_RE = re.compile(r"\bALE\s*[- ]?\s*(\d{5,7})\b", re.IGNORECASE)
# Anything that looks like a 6-digit Pandora SKU on its own.
_SKU_RE = re.compile(r"\b(79\d{4}|78\d{4}|39\d{4})\b")


def build_ebay_query(title: str) -> str:
    """Reduce a noisy Vinted title to a high-signal eBay query.

    Prefer the ALE / SKU code if we can spot one — that's the only way to
    reliably match the exact charm. Otherwise fall back to the cleaned title
    with Pandora prefixed.
    """
    ale = _ALE_RE.search(title)
    if ale:
        return f"pandora ALE {ale.group(1)}"
    sku = _SKU_RE.search(title)
    if sku:
        return f"pandora {sku.group(1)}"

    t = title.lower()
    for junk in ("genuine", "authentic", "real", "pandora", "s925",
                 "sterling silver", "silver", "ale", "charm", "bead",
                 "new", "used", "rare"):
        t = t.replace(junk, " ")
    t = re.sub(r"[^a-z0-9 ]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return f"pandora charm {t}".strip()


def title_passes_filters(
    title: str,
    allowlist: Iterable[str],
    blocklist: Iterable[str],
) -> bool:
    low = title.lower()
    for w in blocklist:
        if w and w.lower() in low:
            return False
    al = [w.lower() for w in allowlist if w]
    if al and not any(w in low for w in al):
        return False
    return True


def profit(
    buy_price: float,
    resale_median: float,
    fee_fraction: float,
    shipping_cost: float,
) -> float:
    net = resale_median * (1 - fee_fraction) - shipping_cost
    return net - buy_price


def is_worth_sniping(
    buy_price: float,
    resale_median: Optional[float],
    min_profit_gbp: float,
    min_profit_ratio: float,
    fee_fraction: float,
    shipping_cost: float,
) -> tuple[bool, float]:
    if resale_median is None or buy_price <= 0:
        return False, 0.0
    p = profit(buy_price, resale_median, fee_fraction, shipping_cost)
    ratio = (p + buy_price) / buy_price
    return (p >= min_profit_gbp and ratio >= min_profit_ratio), p
