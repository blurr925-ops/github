import logging
import time
from typing import Dict, Iterable, List

import requests

log = logging.getLogger(__name__)

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


class VintedClient:
    """Thin wrapper around Vinted's public catalog endpoint.

    Vinted requires a session cookie set by the homepage before the /api/v2
    endpoints will respond. We refresh the cookie jar if we get a 401/403.
    """

    def __init__(self, domain: str = "vinted.co.uk"):
        self.domain = domain
        self.base = f"https://www.{domain}"
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": UA,
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-GB,en;q=0.9",
                "Referer": f"{self.base}/",
            }
        )
        self._bootstrap()

    def _bootstrap(self) -> None:
        try:
            self.session.get(self.base + "/", timeout=15)
        except requests.RequestException as e:
            log.warning("vinted bootstrap failed: %s", e)

    def search_newest(
        self,
        query: str,
        catalog_ids: Iterable[int] = (),
        per_page: int = 96,
    ) -> List[Dict]:
        params = {
            "search_text": query,
            "order": "newest_first",
            "per_page": per_page,
            "page": 1,
        }
        cat = ",".join(str(c) for c in catalog_ids)
        if cat:
            params["catalog_ids"] = cat
        url = f"{self.base}/api/v2/catalog/items"

        for attempt in (1, 2):
            r = self.session.get(url, params=params, timeout=20)
            if r.status_code in (401, 403, 429):
                log.info("vinted %s — refreshing cookies", r.status_code)
                self.session.cookies.clear()
                self._bootstrap()
                time.sleep(2 * attempt)
                continue
            r.raise_for_status()
            return r.json().get("items", [])
        return []
