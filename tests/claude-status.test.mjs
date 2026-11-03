import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WINDOWS, span, windowState, tokens, money, xterm, badges, shortPath, safeId } from "../claude-status/mods/claude-status/data.js";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "../claude-status/mods/claude-status/statusline.sh");
const [fiveHour, sevenDay, spend] = WINDOWS;

test("span", () => {
  assert.equal(span(59), "1m");
  assert.equal(span(2 * 3600 + 13 * 60), "2h 13m");
  assert.equal(span(2 * 86400 + 5 * 3600), "2d 5h");
});

test("windowState: pace and the mark", () => {
  assert.equal(windowState(fiveHour, {}, 0), null);
  const half = windowState(fiveHour, { five_hour: { used_percentage: 50, resets_at: 9000 } }, 0);
  assert.equal(half.passed, 0.5);
  assert.equal(half.pace, 100);
  const early = windowState(fiveHour, { five_hour: { used_percentage: 3, resets_at: 18000 } }, 100);
  assert.equal(early.pace, null);
  const reset = windowState(sevenDay, { seven_day: { used_percentage: 40, resets_at: 10 } }, 20);
  assert.equal(reset.reset, true);
  assert.equal(reset.used, 0);
  const dollars = windowState(spend, { spend_limit: { used_percentage: 60, resets_at: 100, used_usd: 300, limit_usd: 500 } }, 0);
  assert.equal(dollars.passed, null);
  assert.equal(dollars.usd, 300);
});

test("tokens and money", () => {
  assert.equal(tokens(240900), "240.9k");
  assert.equal(tokens(1000000), "1M");
  assert.equal(tokens(950), "950");
  assert.equal(tokens(undefined), "–");
  assert.equal(money(4.6135), "$4.61");
  assert.equal(money(21.94), "$21.9");
});

test("xterm 256 colors", () => {
  assert.equal(xterm(108), "#87af87");
  assert.equal(xterm(173), "#d7875f");
  assert.equal(xterm(244), "#808080");
  assert.equal(xterm(3), null);
});

test("badges come from the rendered status line with their colors", () => {
  const line = "\x1b[38;5;173m[TDD]\x1b[0m \x1b[38;5;108m[REVIEW]\x1b[0m [PLAIN] [lower] 240.9k/1.0M";
  assert.deepEqual(badges(line), [
    { text: "TDD", color: "#d7875f" },
    { text: "REVIEW", color: "#87af87" },
    { text: "PLAIN", color: null },
  ]);
  assert.deepEqual(badges(""), []);
});

test("shortPath and safeId", () => {
  assert.equal(shortPath("/Users/me/work/acme-api", "/Users/me"), "~/work/acme-api");
  assert.equal(shortPath("/Users/me/a/b/c/d", "/Users/me"), "…/c/d");
  assert.equal(safeId("t1r"), true);
  assert.equal(safeId("vps/t7"), false);
  assert.equal(safeId("../x"), false);
});

const homes = [];
const fresh = () => {
  const home = mkdtempSync(join(tmpdir(), "claude-status-"));
  homes.push(home);
  return home;
};
after(() => homes.forEach((home) => rmSync(home, { recursive: true, force: true })));

const run = (home, input, env = {}, args = ["cat"]) =>
  execFileSync("sh", [SCRIPT, ...args], { input, env: { PATH: process.env.PATH, HOME: home, HERDR_APP_HOME: home, ...env } }).toString();

test("statusline.sh passes the status line through and keeps the data", () => {
  const home = fresh();
  const input = '{"model":{"display_name":"Opus"},"rate_limits":{"five_hour":{"used_percentage":46,"resets_at":1}}}';
  const out = run(home, input, { HC_TERMINAL_ID: "t7" }, ["sh", "-c", "cat >/dev/null; printf '\\033[38;5;108m[REVIEW]\\033[0m'"]);
  assert.equal(out, "\x1b[38;5;108m[REVIEW]\x1b[0m\n");
  const limits = JSON.parse(readFileSync(join(home, "claude-status/limits.json"), "utf8"));
  assert.equal(limits.input.rate_limits.five_hour.used_percentage, 46);
  assert.equal(typeof limits.at, "number");
  assert.equal(JSON.parse(readFileSync(join(home, "claude-status/sessions/t7.json"), "utf8")).input.model.display_name, "Opus");
  assert.equal(readFileSync(join(home, "claude-status/sessions/t7.line"), "utf8"), "\x1b[38;5;108m[REVIEW]\x1b[0m\n");
});

test("statusline.sh keeps the old limits for input without them, and refuses unsafe ids", () => {
  const home = fresh();
  run(home, '{"rate_limits":{"five_hour":{"used_percentage":5,"resets_at":1}}}');
  run(home, '{"model":{}}', { HC_TERMINAL_ID: "../evil" });
  assert.equal(JSON.parse(readFileSync(join(home, "claude-status/limits.json"), "utf8")).input.rate_limits.five_hour.used_percentage, 5);
  assert.equal(existsSync(join(home, "claude-status/evil.json")), false);
  assert.deepEqual(readdirSync(join(home, "claude-status/sessions")), []);
});

test("statusline.sh runs a one-string command with sh -c", () => {
  const home = fresh();
  const out = run(home, '{"model":{"display_name":"Opus"}}', {}, ['input=$(cat); NAME=x; echo "$input" | grep -o Opus; echo $NAME']);
  assert.equal(out, "Opus\nx\n");
});

test("statusline.sh writes nothing for input that is not a JSON object", () => {
  const home = fresh();
  assert.equal(run(home, "", { HC_TERMINAL_ID: "t4" }), "");
  assert.equal(existsSync(join(home, "claude-status")), false);
});

test("statusline.sh never fails the status line", () => {
  const out = execFileSync("sh", [SCRIPT, "cat"], { input: '{"rate_limits":{}}', env: { PATH: process.env.PATH, HERDR_APP_HOME: "/nonexistent/readonly" } }).toString();
  assert.equal(out, '{"rate_limits":{}}\n');
});

test("statusline.sh --hide-in-herdr prints nothing in Herdr and keeps the line", () => {
  const home = fresh();
  const inHerdr = run(home, '{"model":{}}', { HC_TERMINAL_ID: "t3" }, ["--hide-in-herdr", "sh", "-c", "cat >/dev/null; echo '[REVIEW]'"]);
  assert.equal(inHerdr, "");
  assert.equal(readFileSync(join(home, "claude-status/sessions/t3.line"), "utf8"), "[REVIEW]\n");
  const elsewhere = run(home, '{"model":{}}', {}, ["--hide-in-herdr", "sh", "-c", "cat >/dev/null; echo '[REVIEW]'"]);
  assert.equal(elsewhere, "[REVIEW]\n");
});
