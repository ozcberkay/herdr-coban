# Tab notes

A notes panel for [Herdr](https://herdr.dev) that follows the tab you're
looking at. Each tab gets its own markdown note: what the agent in it is
doing, what's left, what you decided.

![Tab notes](preview.png)

## Install

Tell your coding agent:

```
Read ~/.config/herdr-app/AGENTS.md, then add this mod: https://github.com/ozcberkay/herdr-coban/tree/main/tab-notes
```

It reads this folder, copies `mods/tab-notes/` into `~/.config/herdr-app/mods/`
and puts the panel in a layout of yours. Herdr's own layouts are read-only, so
it clones one first.

## What it does

- Switch tabs and the note switches with them.
- Saves as you type, within a second.
- Closing a tab deletes its note. Notes are scratch space for the work in
  that tab, not a place to keep things.
- Notes are plain files in `~/.config/herdr-app/tab-notes/`, one per tab.
- No programs, no network.

To update, replace `~/.config/herdr-app/mods/tab-notes/` with the new folder.
Your notes stay.

[RECIPE.md](RECIPE.md) is the full brief: everything an agent needs to build
the mod again from an empty folder.
