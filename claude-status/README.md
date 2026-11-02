# Claude status

Two panels for [Herdr](https://herdr.dev) from the data Claude Code gives its
own status line:

- **Limits**: your Claude subscription limits, the 5-hour and the weekly
  window, each with a mark for how much of the window has passed. A fill ahead
  of the mark means you use the limit faster than the window passes.
- **Session**: the Claude Code session in the shown tab: model and effort,
  context, cost, time, lines, prompt cache and your status line's badges. It
  shows only while the tab has a Claude Code agent.

![Claude status](preview.png)

## Install

Tell your coding agent:

```
Read ~/.config/herdr-app/AGENTS.md, then add this mod: https://github.com/ozcberkay/herdr-coban/tree/main/claude-status
```

It copies `mods/claude-status/` into `~/.config/herdr-app/mods/`, puts the
panels in a layout of yours and puts `statusline.sh` in front of your Claude
Code status line in `~/.claude/settings.json`:

```json
"statusLine": { "type": "command",
  "command": "sh ~/.config/herdr-app/mods/claude-status/statusline.sh --hide-in-herdr <your earlier command>" }
```

The two parts are one mod with different props:

```json
{ "id": "claude-limits", "type": "block", "size": { "px": 80 },
  "content": { "mod": "claude-status", "props": { "part": "limits" } } }
{ "id": "claude-session", "type": "block", "size": { "weight": 3 }, "min": 300,
  "content": { "mod": "claude-status", "props": { "part": "session", "block": "claude-session" } } }
```

## Where the numbers come from

Claude Code gives its status line the limits and the session after each
response. `statusline.sh` runs your own status line and keeps the last copy
in `~/.config/herdr-app/claude-status/`. With `--hide-in-herdr`, the status
line is empty inside Herdr (the panels show it) and unchanged everywhere
else. No token, no network, no undocumented endpoint.

To update, replace `~/.config/herdr-app/mods/claude-status/` with the new
folder. The data folder stays.

[RECIPE.md](RECIPE.md) is the full brief: everything an agent needs to build
the mod again from an empty folder.
