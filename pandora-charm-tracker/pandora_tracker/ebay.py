import logging
import re
import statistics
import time
from typing import Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup

log = logging.getLogger(__name__)

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

_PRICE_RE = re.compile(r"([\d]+(?:[.,]\d{2})?)")


class EbayPriceLookup:
    """Fetches recently-sold prices from eBay search HTML and returns a
    robust central estimate (interquartile median).

    eBay does not offer a free API for sold data; this parses the public
    completed-listings page. Cache aggressively to be polite.
    """

    def __init__(
        self,
        domain: str = "ebay.co.uk",
        sample_size: int = 60,
        cache_ttl_hours: int = 6,
    ):
        self.domain = domain
        self.sample_size = sample_size
        self.cache_ttl = cache_ttl_hours * 3600
        self._cache: Dict[str, Tuple[float, Optional[float], int]] = {}

    def estimate(self, query: str) -> Tuple[Optional[float], int]:
        """Return (median_price, sample_count). None if insufficient data."""
        key = query.strip().lower()
        now = time.time()
        hit = self._cache.get(key)
        if hit and now - hit[0] < self.cache_ttl:
            return hit[1], hit[2]

        prices = self._fetch_sold_prices(query)
        est = self._iqr_median(prices) if prices else None
        self._cache[key] = (now, est, len(prices))
        return est, len(prices)

    def _fetch_sold_prices(self, query: str) -> List[float]:
        url = f"https://www.{self.domain}/sch/i.html"
        params = {
            "_nkw": query,
            "LH_Sold": "1",
            "LH_Complete": "1",
            "_ipg": str(min(self.sample_size, 240)),
        }
        headers = {"User-Agent": UA, "Accept-Language": "en-GB,en;q=0.9"}
        try:
            r = requests.get(url, params=params, headers=headers, timeout=20)
            r.raise_for_status()
        except requests.RequestException as e:
            log.warning("ebay fetch failed for %r: %s", query, e)
            return []

        soup = BeautifulSoup(r.text, "html.parser")
        prices: List[float] = []
        for item in soup.select("li.s-item"):
            # Skip the template placeholder eBay sometimes renders first.
            if item.select_one(".s-item__title--tagblock"):
                continue
            el = item.select_one(".s-item__price")
            if not el:
                continue
            text = el.get_text(" ", strip=True)
            # Range listings "£5.00 to £7.50" — take the low end.
            text = text.split(" to ")[0]
            # Strip currency symbols and thousands separators.
            cleaned = text.replace(",", "")
            m = _PRICE_RE.search(cleaned)
            if not m:
                continue
            try:
                prices.append(float(m.group(1)))
            except ValueError:
                continue
        return prices

    @staticmethod
    def _iqr_median(prices: List[float]) -> Optional[float]:
        if len(prices) < 4:
            return statistics.median(prices) if prices else None
        s = sorted(prices)
        lo = len(s) // 4
        hi = 3 * len(s) // 4 or len(s)
        trimmed = s[lo:hi] or s
        return statistics.median(trimmed)
