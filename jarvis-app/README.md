# Jarvis.app (macOS)

Builds a clickable Mac app that opens a Terminal window titled **JARVIS** in this folder and runs `claude "/brief"`.

```bash
bash jarvis-app/build.sh            # build, install to /Applications, launch once
NO_LAUNCH=1 bash jarvis-app/build.sh  # build and install without launching
```

What it does: finds the full path of `claude`, fills the absolute folder path and that `claude` path into `Jarvis.applescript.template`, compiles it with `osacompile`, takes the arc-reactor icon `jarvis_icon.png` (made by `make_icon.py`; no Python needed at build time), converts it with `sips` + `iconutil`, swaps it in for `applet.icns`, touches the bundle and copies it to `/Applications`.

The window gets a dark background and light blue text. To use a saved Terminal profile instead, create one called **JARVIS** in Terminal → Settings → Profiles and the app will use it automatically.

Re-run `build.sh` if you move this folder or reinstall Claude Code.

## Older Claude Code versions

Some Claude Code versions (e.g. 2.1.78, the last that runs on macOS 11) read `CLAUDE.md` but not this folder's `.claude/commands` or `.claude/settings.json`. Workaround:

```bash
mkdir -p ~/.claude/commands && cp .claude/commands/*.md ~/.claude/commands/   # slash commands
bash jarvis-app/install-voice.sh                                              # voice hook (JARVIS folder only)
```
