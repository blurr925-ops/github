"""Pandora charm sniping tracker.

Usage:
    python main.py --config config.yaml
    python main.py --config config.yaml --once        # single pass, exit
    python main.py --config config.yaml --open        # auto-open deals

Create config.yaml by copying config.example.yaml.
"""
import argparse
import logging
import sys

from pandora_tracker import config, tracker


def main() -> int:
    p = argparse.ArgumentParser(description="Snipe Pandora charms on Vinted.")
    p.add_argument("--config", "-c", default="config.yaml")
    p.add_argument("--once", action="store_true", help="Run a single cycle then exit")
    p.add_argument("--open", action="store_true", help="Open each deal in your browser")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    cfg = config.load(args.config)
    try:
        tracker.run(cfg, once=args.once, open_in_browser=args.open)
    except KeyboardInterrupt:
        print("\nbye.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
