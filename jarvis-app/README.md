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
- "Today" runs as three Claude Code sessions in parallel (inbox, drafts, deadlines and the last 24 hours) and each card fills in as its part finishes.
- Only email from a start date onwards is checked (default: the day the app was first used; change it with "Checking email from … · Change" at the bottom).
- Results are cached in `app/data/state.json`, so the window opens instantly with the last list, and it refreshes quietly every 15 minutes while open.
- **Done ✓** hides an item (Undo, or Restore later); it comes back by itself if someone replies.
- Voice: the headline is spoken with `say -v Daniel`. Toggle it with the speaker button.

`build.sh` finds `claude` and `node`, bakes their full paths and this folder's path into the app, sets the arc-reactor icon (`jarvis_icon.png`, made by `make_icon.py`), re-signs the bundle, stops any old helper and installs to `/Applications`. Re-run it if you move this folder or reinstall Claude Code or Node.

`Jarvis-Terminal.applescript.template` is the older launcher that opens JARVIS in Terminal instead.

Background helper: `build.sh` installs `~/Library/LaunchAgents/com.obtennis.jarvis.plist`, so the helper starts at login and checks the Gmail/Drive connection every 30 minutes (which keeps the sign-in fresh). If a connector drops, the app shows a banner with **Fix it** (opens Terminal in this folder ready for `/mcp` → Authenticate, or `/login`) and **Check again**. To remove the background helper: `launchctl unload ~/Library/LaunchAgents/com.obtennis.jarvis.plist && rm ~/Library/LaunchAgents/com.obtennis.jarvis.plist`.

Testing without Gmail: `JARVIS_CLAUDE_BIN=app/dev/mock-claude.js node app/server.js`, then open http://127.0.0.1:4777.

## macOS 11 (Big Sur) fixes

Claude Code 2.1.78 needs Node 20+ (Node 18 crashes with `A.with is not a function`), and its bundled ripgrep needs Homebrew's pcre2 (`Library not loaded … libpcre2`). Without ripgrep, Claude Code also can't find `.claude/commands` or `.claude/skills` ("Unknown skill"). `bash jarvis-app/fix-bigsur.sh` installs Node 22 LTS and a self-contained ripgrep (Intel build, via Rosetta), and sets `USE_BUILTIN_RIPGREP=0`.

## Older Claude Code versions

Claude Code 2.1.78 (the last that runs on macOS 11) reads `CLAUDE.md` but not this folder's `.claude/commands` or `.claude/settings.json`. For Terminal use:

```bash
mkdir -p ~/.claude/skills && cp -R .claude/skills/* ~/.claude/skills/   # slash commands
bash jarvis-app/install-voice.sh                                        # voice hook (JARVIS folder only)
```
