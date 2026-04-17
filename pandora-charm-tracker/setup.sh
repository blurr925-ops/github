#!/usr/bin/env bash
# One-shot setup for Mac/Linux. Run from inside pandora-charm-tracker/:
#   bash setup.sh
set -euo pipefail

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 not found. Install from https://python.org/downloads then rerun."
  exit 1
fi

echo "-> creating virtual environment (.venv)"
python3 -m venv .venv
# shellcheck source=/dev/null
source .venv/bin/activate

echo "-> installing dependencies"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if [ ! -f config.yaml ]; then
  echo "-> creating config.yaml from example"
  cp config.example.yaml config.yaml
else
  echo "-> config.yaml already exists, leaving it alone"
fi

echo
echo "Setup complete. To run:"
echo "   source .venv/bin/activate"
echo "   python main.py -c config.yaml --once -v       # test scan"
echo "   python main.py -c config.yaml --open          # live sniping"
