#!/bin/bash
# Fixes Claude Code 2.1.78 on macOS 11 (Big Sur), Apple silicon:
#  1. Node 18 is too old ("A.with is not a function") -> install Node 22 LTS (supports macOS 11).
#  2. Claude Code's bundled ripgrep needs Homebrew's pcre2 ("Library not loaded ... libpcre2")
#     -> install the self-contained Intel ripgrep (runs under Rosetta) and tell Claude Code to use it.
set -euo pipefail
cd "$(mktemp -d)"

echo "== 1/3 Node 22 =="
SUMS=$(curl -fsSL https://nodejs.org/dist/latest-v22.x/SHASUMS256.txt)
F=$(printf '%s\n' "$SUMS" | awk '/\.pkg$/{print $2}')
curl -fLO "https://nodejs.org/dist/latest-v22.x/$F"
printf '%s\n' "$SUMS" | grep " $F\$" | shasum -a 256 -c -
sudo installer -pkg "$F" -target /

echo "== 2/3 ripgrep =="
/usr/bin/pgrep -q oahd || sudo softwareupdate --install-rosetta --agree-to-license
RG=ripgrep-14.1.1-x86_64-apple-darwin
curl -fLO "https://github.com/BurntSushi/ripgrep/releases/download/14.1.1/$RG.tar.gz"
echo "fc87e78f7cb3fea12d69072e7ef3b21509754717b746368fd40d88963630e2b3  $RG.tar.gz" | shasum -a 256 -c -
tar xzf "$RG.tar.gz"
sudo mkdir -p /usr/local/bin && sudo cp "$RG/rg" /usr/local/bin/rg

echo "== 3/3 Claude Code settings =="
mkdir -p ~/.claude
[ -s ~/.claude/settings.json ] && cp ~/.claude/settings.json ~/.claude/settings.json.bak3
perl -MJSON::PP -e '
  my $p = "$ENV{HOME}/.claude/settings.json"; my $s = {};
  if (-s $p) { open my $f, "<", $p or die; local $/; $s = JSON::PP->new->utf8->relaxed->decode(<$f>); }
  $s->{env}{USE_BUILTIN_RIPGREP} = "0";
  open my $o, ">", $p or die; print $o JSON::PP->new->utf8->pretty->canonical->encode($s);'

echo; echo "node: $(node --version)   rg: $(/usr/local/bin/rg --version | head -1)"
OLD=$(lsof -ti tcp:4777 -sTCP:LISTEN 2>/dev/null || true); [ -n "$OLD" ] && kill $OLD || true
echo "All set. Open Jarvis again."
