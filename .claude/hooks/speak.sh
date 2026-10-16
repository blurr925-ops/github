#!/bin/bash
# JARVIS voice: speaks the first sentence of each reply (macOS `say`).
# Switch off with JARVIS_VOICE=off. Voice can be changed with JARVIS_VOICE_NAME (default: Daniel).
[ "${JARVIS_VOICE:-on}" = "off" ] && exit 0

input=$(cat)

# Latest reply: use last_assistant_message if Claude Code provides it, else read the transcript.
if command -v jq >/dev/null 2>&1; then
  text=$(printf '%s' "$input" | jq -r '.last_assistant_message // empty' 2>/dev/null)
else  # macOS before 15 has no jq; plutil reads JSON too
  text=$(printf '%s' "$input" | plutil -extract last_assistant_message raw -o - - 2>/dev/null)
fi
if [ -z "$text" ] && command -v jq >/dev/null 2>&1; then
  transcript=$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)
  [ -f "$transcript" ] && text=$(jq -rs '
    [ .[] | select(.type == "assistant") | .message.content[]? | select(.type == "text") | .text ]
    | last // empty' "$transcript" 2>/dev/null)
fi
[ -z "$text" ] && exit 0

# Strip markdown, flatten to one line, keep the first sentence.
sentence=$(printf '%s' "$text" \
  | sed -E 's/\[([^]]*)\]\([^)]*\)/\1/g; s/[*_`#>|]//g; s/^[[:space:]]*-[[:space:]]+//' \
  | tr '\n' ' ' \
  | sed -E 's/[[:space:]]+/ /g; s/^ //' \
  | sed -E 's/([.!?])( |$).*/\1/' \
  | cut -c1-220)
[ -z "$sentence" ] && exit 0

if [ -n "$JARVIS_VOICE_DRYRUN" ]; then echo "$sentence"; exit 0; fi
command -v say >/dev/null 2>&1 || exit 0
(say -v "${JARVIS_VOICE_NAME:-Daniel}" "$sentence" >/dev/null 2>&1 &)
exit 0
