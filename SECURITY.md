# Security

## Report a vulnerability

Do not open a public issue for a vulnerability. Use
[Report a vulnerability](https://github.com/ozcberkay/herdr-coban/security/advisories/new)
on GitHub. Only the owner of the repository sees the report.

Tell us:

- which file or mod has the problem,
- what a person must do or have for the problem to occur,
- what an attacker can read, write or run.

## Scope

Only the `main` branch gets fixes. These parts need the most care:

- `claude-status/mods/claude-status/statusline.sh` runs for each response of
  each Claude Code session and writes to `~/.config/herdr-app/claude-status/`.
- `statusline.sh` also runs the person's own status line command with
  `sh -c`.
- The mods run programs (`iostat`, `vm_stat`, `sysctl`, `df`, `pmset`, `ps`,
  and `open` on a click) and delete files that they wrote themselves.

A problem in Herdr itself goes to
[herdrdev/herdr-app](https://github.com/herdrdev/herdr-app).
