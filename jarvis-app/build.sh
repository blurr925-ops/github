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
echo "JARVIS folder: $JARVIS_DIR"
echo "claude:        $CLAUDE_BIN"

rm -rf "$BUILD"; mkdir -p "$BUILD"

# 2. Compile the AppleScript with the absolute paths filled in.
sed -e "s|__JARVIS_DIR__|$JARVIS_DIR|" -e "s|__CLAUDE_BIN__|$CLAUDE_BIN|" \
  "$APP_SRC_DIR/Jarvis.applescript.template" > "$BUILD/Jarvis.applescript"
osacompile -o "$APP" "$BUILD/Jarvis.applescript"

# 3. Icon: 1024px PNG -> iconset -> .icns -> replace applet.icns.
python3 "$APP_SRC_DIR/make_icon.py" "$BUILD/icon_1024.png"
ICONSET="$BUILD/Jarvis.iconset"; mkdir -p "$ICONSET"
for s in 16 32 128 256 512; do
  sips -z $s $s "$BUILD/icon_1024.png" --out "$ICONSET/icon_${s}x${s}.png" >/dev/null
  d=$((s * 2))
  sips -z $d $d "$BUILD/icon_1024.png" --out "$ICONSET/icon_${s}x${s}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$BUILD/Jarvis.icns"
cp "$BUILD/Jarvis.icns" "$APP/Contents/Resources/applet.icns"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.obtennis.jarvis" "$APP/Contents/Info.plist" 2>/dev/null \
  || /usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string com.obtennis.jarvis" "$APP/Contents/Info.plist"
touch "$APP"

# 4. Install into /Applications (Launchpad + Spotlight).
rm -rf /Applications/Jarvis.app
cp -R "$APP" /Applications/
touch /Applications/Jarvis.app
echo "Installed /Applications/Jarvis.app"

# 5. Test launch (skip with: NO_LAUNCH=1 bash build.sh).
[ -n "${NO_LAUNCH:-}" ] || open /Applications/Jarvis.app
