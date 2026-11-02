#!/bin/sh
# Copy each standalone mod of this repository into the herdr-coban layout folder,
# so the layout folder installs on its own. The mod folders at the top level are
# the source; herdr-coban/mods/coban-tabs lives only in the layout.
#
#   scripts/sync-layout-mods.sh          copy
#   scripts/sync-layout-mods.sh --check  fail if a copy differs from its source
#
# A copy is built next to its target first and then moved into place. The old
# copy goes only after the new one is complete, and only from a path that this
# script built from its own fixed list.
set -eu
root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd -P)
layout_mods="$root/herdr-coban/mods"
mods="tab-notes machine-vitals claude-status"

[ -d "$layout_mods" ] && [ ! -L "$layout_mods" ] || { echo "missing: $layout_mods" >&2; exit 1; }

status=0
for mod in $mods; do
  src="$root/$mod/mods/$mod"
  dst="$layout_mods/$mod"
  [ -d "$src" ] || { echo "missing source: $mod/mods/$mod" >&2; exit 1; }

  if [ "${1:-}" = "--check" ]; then
    if ! diff -r "$src" "$dst" >/dev/null 2>&1; then
      echo "out of date: herdr-coban/mods/$mod (run scripts/sync-layout-mods.sh)" >&2
      status=1
    fi
    continue
  fi

  [ ! -L "$dst" ] || { echo "refusing a symlink: $dst" >&2; exit 1; }
  new=$(mktemp -d "$layout_mods/.$mod.new.XXXXXX")
  cp -R "$src/." "$new/"
  if [ -d "$dst" ]; then
    old=$(mktemp -d "$layout_mods/.$mod.old.XXXXXX")
    mv "$dst" "$old/$mod"
    mv "$new" "$dst"
    rm -r -- "${old:?}/$mod"
    rmdir -- "${old:?}"
  else
    mv "$new" "$dst"
  fi
done
exit $status
