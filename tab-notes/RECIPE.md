# Tab notes

A notes panel that follows the tab you're looking at. Each tab gets its own
markdown note: what the agent in it is doing, what's left, what you decided.
Switch tabs and the note switches with them. Close the tab and its note goes
too. This is a piece you add to your layout, not a whole window.

![Tab notes](preview.png)

This file is the brief: enough to build Tab notes from an empty folder. The
files next to it are one build of it. If they don't work on your Herdr, or you
want it different, build it again from here.

## What you see

- One panel, 320px wide when Herdr docks it, with 10px corners, a 1px border
  in the theme's `border` color and the theme's `background` behind it.
- A 42px header with a bottom border, 14px side padding and an 8px gap:
  "Notes" on the left (semibold), the shown tab's name on the right (12px,
  the theme's `dim` color, truncated).
- Below, the rest of the panel is a markdown editor with 6px padding: soft
  wrap, no line numbers, no folding, 13px, in the person's terminal font
  (`settings().font_family`).
- "Loading note…" while a note is read, "No tab" when no tab is shown, both
  in `dim` with 12px padding.
- A save or read error appears as one 11px line under the header (14px by
  6px padding) in the theme's `ansi1` (red): "Save failed: …" or
  "Cannot read note: …".

## How it behaves

- The panel always shows the note of the shown tab, in any space and on any
  machine. Showing another tab starts saving the current note, and the next
  note is read only after that save ends.
- Typing saves within 0.8s. A failed save shows its error and retries every
  0.8s while the tab is shown. A note of only spaces and newlines counts as
  empty: clearing a note deletes its file, so only tabs with something
  written have a file. A tab that no longer exists is never saved.
- If a note can't be read, the panel shows the error and no editor, so typing
  can't overwrite the note on disk.
- Closing a tab deletes its note. A machine's notes are only judged when its
  layout is `ready` and it has listed spaces since the panel started, so a
  machine that is loading, offline or failed its first read never loses
  notes. Closing a machine's last tab still deletes that tab's note.
- Notes live on this computer, also for tabs on other machines.
- Closing the app tries to save the note being typed. A quit can cut that
  save short, so up to 0.8s of typing can be lost.
- There are no agent statuses, keys, clicks or animations.

## Built from

- **One mod**, `mods/tab-notes/`: `main.js`, `mod.json`
  (`{ "place": "right", "size": 320, "title": "Notes" }`), `notes.svg`
  (Lucide `file-text`, for a layout that wants a button for the panel) and
  `LICENSE-lucide`, the icon's ISC license.
- **Storage:** one file per tab at
  `~/.config/herdr-app/tab-notes/<encodeURIComponent(tab id)>.md`
  (`appHome()`), written with `fs/promises` (`mkdir`, `writeFile`, `unlink`,
  `readdir`, `exists`) and read with `readTextFile`. Remote tab ids carry a
  `<machine>/` prefix, which the encoding keeps in the file name.
- **Live data:** `spaces()` for the shown tab and the tabs that still exist,
  `machines()` for which machines are `ready`, `theme()` and `settings()` for
  the look. A re-render compares tab ids and machine states, and only a
  change starts a cleanup pass. The pass checks each file's tab against the
  live `spaces()` right before deleting it and skips file names that don't
  decode.
- **Editor:** `EditorState.new({ language: "md", ... })` and `Editor.new()`
  from `gpui-base`. A `change` event marks the note dirty and a
  `cx.timer.every(800)` writes it. Each save sets a pending promise that the
  next read awaits. `close()` writes a dirty note on quit.
- No programs (`exec`, `hc`), no network, no shipped mod needed.

## Watch out

- It writes outside its own folder: `~/.config/herdr-app/tab-notes/`. It
  deletes the notes of tabs that no longer exist. Tell the person before
  installing.
- Herdr's own layouts are read-only. Clone one (`layout.clone`) and put the
  panel in the clone, for example as a block after `panel` in `main`'s
  `work-body` row:

  ```json
  { "id": "tab-notes", "type": "block", "size": { "px": 320 }, "content": { "mod": "tab-notes" } }
  ```

- There's no tab-bar button. Herdr's `tabs` mod hard-codes its Files and
  Changes buttons, so a Notes button means cloning `tabs` too and adding one
  that selects the panel (`layout.select`, `layout.show`).
- Don't keep notes inside `mods/tab-notes/`: saving a file there reloads the
  mod, and updating the mod replaces the folder.
- Notes for tabs on a machine that never comes back stay on disk.
- One editor per copy: two copies of the panel showing the same tab each keep
  their own unsaved text, and the last save wins.
- Updating: replace the `mods/tab-notes/` folder with the new one. Don't
  install the new version next to the old one under another name. The notes
  in `~/.config/herdr-app/tab-notes/` stay as they are.

## Done when

- `herdr-app check mods/tab-notes` passes.
- Typing in a tab's note creates its `.md` file within a second; clearing the
  note removes it.
- Switching tabs shows each tab's own note, and the header shows that tab's
  name.
- Closing a tab removes its note file, and the other notes stay.
- Quitting and reopening Herdr shows the same notes.
