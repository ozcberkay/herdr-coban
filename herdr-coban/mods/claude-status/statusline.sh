#!/bin/sh
# Claude Code status line wrapper for the Herdr claude-status mod.
#
# It runs your status line command with the same input and prints its output.
# Give the command as one quoted argument; the script runs it with `sh -c`, so
# pipes, `$(...)` and `VAR=value` work. Then it keeps two copies of the input
# for the panels in ~/.config/herdr-app/claude-status/:
#   limits.json             the last input that has rate limits
#   sessions/<terminal>.*   the last input and output of each Herdr terminal
# A failed write never stops the status line.
#
# --hide-in-herdr: print nothing in a Herdr terminal (the panels show it all),
# and the usual status line everywhere else. The output is still kept, for the
# badges in the session panel.
#
#   "statusLine": { "type": "command",
#     "command": "sh ~/.config/herdr-app/mods/claude-status/statusline.sh --hide-in-herdr 'npx -y ccstatusline'" }
hide=false
if [ "${1:-}" = "--hide-in-herdr" ]; then
  [ -n "${HC_TERMINAL_ID:-}" ] && hide=true
  shift
fi
in=$(cat)
out=""
if [ $# -eq 1 ]; then
  out=$(printf '%s\n' "$in" | sh -c "$1")
elif [ $# -gt 1 ]; then
  out=$(printf '%s\n' "$in" | "$@")
fi
[ -n "$out" ] && [ "$hide" = false ] && printf '%s\n' "$out"

dir="${HERDR_APP_HOME:-$HOME/.config/herdr-app}/claude-status"
now=$(date +%s)

# Write $2 to the file $1 through a temporary file, so a reader never sees half a file.
keep() {
  tmp="$1.tmp.$$"
  { printf '%s\n' "$2" > "$tmp" && mv -f "$tmp" "$1"; } 2>/dev/null || rm -f "$tmp"
}

# Keep only input that looks like Claude Code's JSON object.
case $in in '{'*) ;; *) exit 0 ;; esac
mkdir -p "$dir/sessions" 2>/dev/null || exit 0
case $in in
  *'"rate_limits"'*) keep "$dir/limits.json" "{\"at\":$now,\"input\":$in}" ;;
esac
# HC_TERMINAL_ID: the herdr-core address of the terminal Claude Code runs in.
case ${HC_TERMINAL_ID:-} in
  '' | *[!A-Za-z0-9_-]*) ;;
  *)
    keep "$dir/sessions/$HC_TERMINAL_ID.json" "{\"at\":$now,\"input\":$in}"
    keep "$dir/sessions/$HC_TERMINAL_ID.line" "$out"
    ;;
esac
exit 0
