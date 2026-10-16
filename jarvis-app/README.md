# Jarvis.app (macOS)

Click **Jarvis** and you get the JARVIS app: a dark, modern window with today's to-do list as cards (Needs you, Drafts, Club admin, Enquiries, Coming up, Last 24 hours), a Bookings tab, an "Ask JARVIS" bar (⌘K) and a "Draft reply" button on each thread.

```bash
bash jarvis-app/build.sh              # build, install to /Applications, open once
NO_LAUNCH=1 bash jarvis-app/build.sh  # build and install without opening
```

## How it works

- `Jarvis.app` (compiled from `Jarvis.applescript.template`) starts a small helper, `app/server.js` (Node, no dependencies), on `127.0.0.1:4777`, then opens the window. It uses a chromeless app window in Chrome, Edge or Brave if one is installed, otherwise Safari.
- The helper runs `claude -p` in this folder for each screen, so `CLAUDE.md` applies. It uses only your claude.ai Gmail and Google Drive connectors. Sending, forwarding, deleting, trashing and sharing tools are blocked on the command line, as are Bash and file editing.
- The page talks only to this machine, and every request carries a per-launch token, so other websites can't drive it.
- Results are cached in `app/data/state.json`, so the window opens instantly with the last list and refreshes when it's more than 20 minutes old.
- Voice: the headline is spoken with `say -v Daniel`. Toggle it with the speaker button.

`build.sh` finds `claude` and `node`, bakes their full paths and this folder's path into the app, sets the arc-reactor icon (`jarvis_icon.png`, made by `make_icon.py`), re-signs the bundle, stops any old helper and installs to `/Applications`. Re-run it if you move this folder or reinstall Claude Code or Node.

`Jarvis-Terminal.applescript.template` is the older launcher that opens JARVIS in Terminal instead.

Testing without Gmail: `JARVIS_CLAUDE_BIN=app/dev/mock-claude.js node app/server.js`, then open http://127.0.0.1:4777.

## Older Claude Code versions

Claude Code 2.1.78 (the last that runs on macOS 11) reads `CLAUDE.md` but not this folder's `.claude/commands` or `.claude/settings.json`. For Terminal use:

```bash
mkdir -p ~/.claude/skills && cp -R .claude/skills/* ~/.claude/skills/   # slash commands
bash jarvis-app/install-voice.sh                                        # voice hook (JARVIS folder only)
```
