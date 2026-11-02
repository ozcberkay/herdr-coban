import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, parseProcs, gb } from "../machine-vitals/mods/machine-vitals/stats.js";

const SAMPLE = `@cpu
      cpu    load average
 us sy id   1m   5m   15m
 12  7 81  5.11 8.68 10.81
 17 21 62  5.11 8.68 10.81
@vm
Mach Virtual Memory Statistics: (page size of 16384 bytes)
Pages wired down:                             100000.
Pages purgeable:                               10000.
Anonymous pages:                              500000.
Pages occupied by compressor:                 200000.
@sys
34359738368
2
vm.swapusage: total = 2048.00M  used = 1024.00M  free = 1024.00M  (encrypted)
@df
Filesystem     1024-blocks      Used Available Capacity iused      ifree %iused  Mounted on
/dev/disk3s1s1   971350180  12346684 378308060     4%  458732 3783080600    0%   /
@batt
Now drawing from 'AC Power'
 -InternalBattery-0 (id=35979363)	79%; charging; 0:46 remaining present: true
`;

test("parse reads every part of one sample", () => {
  const s = parse(SAMPLE);
  assert.equal(s.cpu, 38); // the last iostat row: 100 - 62
  assert.equal(s.mem.used, (500000 - 10000 + 100000 + 200000) * 16384);
  assert.equal(s.mem.total, 34359738368);
  assert.equal(s.mem.pressure, 2);
  assert.equal(s.swap, 1024 * 2 ** 20);
  assert.deepEqual(s.disk, { total: 971350180 * 1024, free: 378308060 * 1024 });
  assert.deepEqual(s.battery, { pct: 79, state: "charging", ac: true });
});

test("parse tolerates missing parts", () => {
  const s = parse("@cpu\n@vm\n@sys\n@df\n@batt\n");
  assert.equal(s.cpu, null);
  assert.equal(s.disk, null);
  assert.equal(s.battery, null);
});

test("parseProcs skips the programs of the panel itself", () => {
  const out = " 95.9 opendirectoryd\n 12.0 ps\n 23.3 Google Chrome He\n  1.0 head\n 14.7 claude\n  3.0 node\n";
  assert.deepEqual(parseProcs(out), [
    { name: "opendirectoryd", cpu: 95.9 },
    { name: "Google Chrome He", cpu: 23.3 },
    { name: "claude", cpu: 14.7 },
  ]);
});

test("gb rounds like the panel shows it", () => {
  assert.equal(gb(32 * 2 ** 30), "32");
  assert.equal(gb(25.74 * 2 ** 30), "25.7");
  assert.equal(gb(361.4 * 2 ** 30), "361");
});
