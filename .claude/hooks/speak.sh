#!/bin/bash
# JARVIS voice: speaks the first sentence of each reply (macOS `say`).
# Off: JARVIS_VOICE=off. Voice: JARVIS_VOICE_NAME (default Daniel).
# Uses perl (built into macOS) to read JSON, so no jq or python needed.
[ "${JARVIS_VOICE:-on}" = "off" ] && exit 0
JARVIS_DIR="$(cd "$(dirname "$0")/../.." && pwd -P)"

sentence=$(JARVIS_DIR="$JARVIS_DIR" perl -MJSON::PP -e '
  binmode STDOUT, ":utf8";
  my $raw = do { local $/; <STDIN> };
  my $in = eval { JSON::PP->new->utf8->decode($raw) } || {};
  # Only speak inside the JARVIS folder (matters if installed in ~/.claude/settings.json).
  exit 0 if $in->{cwd} && index($in->{cwd}, $ENV{JARVIS_DIR}) != 0;
  my $t = $in->{last_assistant_message} // "";
  if ($t eq "" && $in->{transcript_path} && open(my $fh, "<", $in->{transcript_path})) {
    while (my $l = <$fh>) {
      my $e = eval { JSON::PP->new->utf8->decode($l) } or next;
      next unless ($e->{type} // "") eq "assistant" && ref $e->{message}{content} eq "ARRAY";
      for my $c (@{ $e->{message}{content} }) {
        $t = $c->{text} if ref $c eq "HASH" && ($c->{type} // "") eq "text";
      }
    }
  }
  $t =~ s/\[([^\]]*)\]\([^)]*\)/$1/g;   # links -> text
  $t =~ s/[*_`#>|]//g;                  # markdown symbols
  $t =~ s/^\s*[-\x{2022}]\s+//mg;       # bullets
  $t =~ s/\s+/ /g; $t =~ s/^ //;
  $t =~ s/^(.*?[.!?])(?:\s.*)?$/$1/s;   # first sentence
  print substr($t, 0, 220);
')
[ -z "$sentence" ] && exit 0

if [ -n "$JARVIS_VOICE_DRYRUN" ]; then echo "$sentence"; exit 0; fi
command -v say >/dev/null 2>&1 || exit 0
(say -v "${JARVIS_VOICE_NAME:-Daniel}" "$sentence" >/dev/null 2>&1 &)
exit 0
