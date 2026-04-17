from dataclasses import dataclass, field
from pathlib import Path
from typing import List

import yaml


@dataclass
class VintedCfg:
    domain: str = "vinted.co.uk"
    queries: List[str] = field(default_factory=lambda: ["pandora charm"])
    catalog_ids: List[int] = field(default_factory=list)
    poll_interval_seconds: int = 45
    max_buy_price: float = 25.0
    currency: str = "GBP"


@dataclass
class EbayCfg:
    domain: str = "ebay.co.uk"
    sold_sample_size: int = 60
    cache_ttl_hours: int = 6
    fee_fraction: float = 0.15
    shipping_cost: float = 3.50


@dataclass
class ProfitCfg:
    min_profit_gbp: float = 8.0
    min_profit_ratio: float = 1.5


@dataclass
class NotifyCfg:
    desktop: bool = True
    webhook_url: str = ""
    seen_file: str = ".seen.json"


@dataclass
class FiltersCfg:
    allowlist: List[str] = field(default_factory=list)
    blocklist: List[str] = field(default_factory=list)


@dataclass
class Config:
    vinted: VintedCfg = field(default_factory=VintedCfg)
    ebay: EbayCfg = field(default_factory=EbayCfg)
    profit: ProfitCfg = field(default_factory=ProfitCfg)
    notify: NotifyCfg = field(default_factory=NotifyCfg)
    filters: FiltersCfg = field(default_factory=FiltersCfg)


def load(path: str | Path) -> Config:
    with open(path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}
    return Config(
        vinted=VintedCfg(**(raw.get("vinted") or {})),
        ebay=EbayCfg(**(raw.get("ebay") or {})),
        profit=ProfitCfg(**(raw.get("profit") or {})),
        notify=NotifyCfg(**(raw.get("notify") or {})),
        filters=FiltersCfg(**(raw.get("filters") or {})),
    )
