#!/bin/bash
# Builds Jarvis.app (macOS) and installs it in /Applications.
# Run on your Mac from anywhere:  bash jarvis-app/build.sh
set -euo pipefail

[ "$(uname)" = "Darwin" ] || { echo "Jarvis.app can only be built on macOS."; exit 1; }

APP_SRC_DIR="$(cd "$(dirname "$0")" && pwd -P)"
JARVIS_DIR="$(cd "$APP_SRC_DIR/.." && pwd -P)"   # folder with CLAUDE.md
BUILD="$APP_SRC_DIR/build"
APP="$BUILD/Jarvis.app"

# 1. Find the full path to claude. Apps don't load your shell's PATH.
CLAUDE_BIN="$(command -v claude || true)"
[ -n "$CLAUDE_BIN" ] || CLAUDE_BIN="$(zsh -lic 'command -v claude' 2>/dev/null | tail -n1 || true)"
for p in "$HOME/.local/bin/claude" "$HOME/.claude/local/claude" /opt/homebrew/bin/claude /usr/local/bin/claude; do
  [ -n "$CLAUDE_BIN" ] && [ -x "$CLAUDE_BIN" ] && break
  [ -x "$p" ] && CLAUDE_BIN="$p"
done
[ -x "$CLAUDE_BIN" ] || { echo "Couldn't find the claude command. Install Claude Code first, then re-run."; exit 1; }
# 1b. Find node (the JARVIS app's helper runs on it).
NODE_BIN="$(command -v node || true)"
for p in /usr/local/bin/node /opt/homebrew/bin/node; do
  [ -n "$NODE_BIN" ] && [ -x "$NODE_BIN" ] && break
  [ -x "$p" ] && NODE_BIN="$p"
done
[ -x "$NODE_BIN" ] || { echo "Couldn't find node. Install Node.js (nodejs.org), then re-run."; exit 1; }
echo "JARVIS folder: $JARVIS_DIR"
echo "claude:        $CLAUDE_BIN"
echo "node:          $NODE_BIN"

# Stop an older copy of the helper so the new files are used.
OLD_PID="$(lsof -ti tcp:4777 -sTCP:LISTEN 2>/dev/null || true)"
[ -n "$OLD_PID" ] && kill $OLD_PID 2>/dev/null || true

rm -rf "$BUILD"; mkdir -p "$BUILD"

# 2. Compile the AppleScript with the absolute paths filled in.
sed -e "s|__JARVIS_DIR__|$JARVIS_DIR|" -e "s|__CLAUDE_BIN__|$CLAUDE_BIN|" -e "s|__NODE_BIN__|$NODE_BIN|" \
  "$APP_SRC_DIR/Jarvis.applescript.template" > "$BUILD/Jarvis.applescript"
osacompile -o "$APP" "$BUILD/Jarvis.applescript"

# 3. Icon: bundled 1024px PNG -> iconset -> .icns -> replace applet.icns.
# (Uses jarvis_icon.png so no python3 / Xcode tools are needed; make_icon.py regenerates it.)
cp "$APP_SRC_DIR/jarvis_icon.png" "$BUILD/icon_1024.png"
ICONSET="$BUILD/Jarvis.iconset"; mkdir -p "$ICONSET"
for s in 16 32 128 256 512; do
  sips -z $s $s "$BUILD/icon_1024.png" --out "$ICONSET/icon_${s}x${s}.png" >/dev/null
  d=$((s * 2))
  sips -z $d $d "$BUILD/icon_1024.png" --out "$ICONSET/icon_${s}x${s}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$BUILD/Jarvis.icns"
cp "$BUILD/Jarvis.icns" "$APP/Contents/Resources/applet.icns"
plutil -replace CFBundleIdentifier -string "com.obtennis.jarvis" "$APP/Contents/Info.plist"
plutil -replace NSAppleEventsUsageDescription -string "JARVIS opens Terminal to start Claude." "$APP/Contents/Info.plist"
# Changing the icon and Info.plist breaks osacompile's signature; re-sign so macOS
# will ask "Jarvis wants to control Terminal" instead of refusing (error -1743).
codesign --force --deep --sign - "$APP"
touch "$APP"

# 4. Install into /Applications (Launchpad + Spotlight).
rm -rf /Applications/Jarvis.app
cp -R "$APP" /Applications/
touch /Applications/Jarvis.app
tccutil reset AppleEvents com.obtennis.jarvis >/dev/null 2>&1 || true  # forget any earlier "Don't Allow"
echo "Installed /Applications/Jarvis.app"

# 5. Test launch (skip with: NO_LAUNCH=1 bash build.sh).
[ -n "${NO_LAUNCH:-}" ] || open /Applications/Jarvis.app
