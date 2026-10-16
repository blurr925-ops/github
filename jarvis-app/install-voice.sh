#!/bin/bash
# Adds the JARVIS voice hook to ~/.claude/settings.json (for Claude Code versions
# that don't read this folder's .claude/settings.json). Keeps all other settings;
# backs the file up first. Safe to run twice.
set -euo pipefail
JARVIS_DIR="$(cd "$(dirname "$0")/.." && pwd -P)"
HOOK="$JARVIS_DIR/.claude/hooks/speak.sh"
chmod +x "$HOOK"
mkdir -p "$HOME/.claude"
SETTINGS="$HOME/.claude/settings.json"
[ -s "$SETTINGS" ] && cp "$SETTINGS" "$SETTINGS.bak"
HOOK="$HOOK" SETTINGS="$SETTINGS" perl -MJSON::PP -e '
  my $p = $ENV{SETTINGS}; my $s = {};
  if (-s $p) { open my $f, "<", $p or die "Cannot read $p\n"; local $/;
               $s = JSON::PP->new->utf8->relaxed->decode(<$f>); }
  my $stop = $s->{hooks}{Stop} //= [];
  if (grep { JSON::PP->new->encode($_) =~ /speak\.sh/ } @$stop) { print "Voice hook already installed.\n"; exit 0 }
  push @$stop, { hooks => [ { type => "command", command => "\"$ENV{HOOK}\"" } ] };
  open my $o, ">", $p or die "Cannot write $p\n";
  print $o JSON::PP->new->utf8->pretty->canonical->encode($s);
  print "Voice hook added to $p\n";
'
