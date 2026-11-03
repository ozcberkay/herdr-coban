# Contributing

Issues and pull requests are welcome.

## Layout of the repository

- `tab-notes/`, `machine-vitals/`, `claude-status/`: one mod each. The mod
  folder under `mods/` is the source.
- `herdr-coban/`: the layout. `herdr-coban/mods/coban-tabs/` lives only here.
  The other folders in `herdr-coban/mods/` are copies that
  `scripts/sync-layout-mods.sh` makes. Do not edit the copies.
- `tests/`: Node tests for the parts that do not need Herdr.

## Before you open a pull request

1. If you changed a mod that the layout uses, run `scripts/sync-layout-mods.sh`.
2. Run `node --test tests/*.test.mjs` (Node 22 or later).
3. Copy the mod to `~/.config/herdr-app/mods/` and run
   `herdr-app check ~/.config/herdr-app/mods/<name>`. Try it in the app.
4. Update the folder's `RECIPE.md` and `README.md` if what a person sees or
   does changes. The recipe describes the real files, nothing more.
5. If what you see changes, take a new `preview.png`. Use made-up data only:
   no real names, folders, tickets or terminal content.

## Style

- Comments and documents are in ASD-STE100 Simplified Technical English: one
  idea per sentence, active voice, imperative instructions.
- Keep mods free of dependencies. Use the `herdr` and `gpui-kit` modules and
  programs that ship with macOS.
- A mod deletes only files that it wrote itself, and matches their names
  exactly before it deletes them.
