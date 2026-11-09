// Check every generated magic effect the way pixelfx's check does, without running the repo's tools:
// it loads, every frame renders without throwing, nothing lands outside the canvas, one-shots end empty,
// loops match at 0 and D, and frames are quick.   node check.mjs <repo> [filter]
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const [repo, filter = "magic-"] = process.argv.slice(2);
const core = await import(pathToFileURL(join(repo, "src/core/index.js")).href);
const { effects } = await import(pathToFileURL(join(repo, "src/fx/index.js")).href);
const { createFrame, clearFrame, createFx, painterFor } = core;
const M = 24, issues = { throw: [], outside: [], notEmpty: [], seam: [], slow: [] };
let count = 0, worst = 0, worstId = "";
const lit = (f, inside) => { let n = 0; for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) { const i = y * f.w + x, on = f.color[i] >>> 24 || (f.light[i] & 0xffffff) !== 0; if (on && inside(x, y) !== false) n++; } return n; };
for (const [id, mod] of Object.entries(effects)) {
  if (!id.startsWith(filter)) continue;
  count++;
  const m = mod.meta, [w, h] = m.size, [ox, oy] = m.origin;
  try {
    const f = createFrame(w + M * 2, h + M * 2, -M, -M), inst = createFx(mod, { x: ox, y: oy });
    const n = Math.round(m.duration * 30) + (m.loop ? 0 : 1);
    let out = 0, ms = 0;
    for (let i = 0; i < n; i++) {
      clearFrame(f);
      const t0 = performance.now(); inst.draw(f); ms = Math.max(ms, performance.now() - t0);
      // light glows are allowed to spill; color pixels are not
      for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
        const fx = x - M, fy = y - M;
        if ((fx < 0 || fy < 0 || fx >= w || fy >= h) && f.color[y * f.w + x] >>> 24) out++;
      }
      if (i < n - 1) inst.update(1 / 30);
    }
    if (out) issues.outside.push(`${id} (${out} px over the run)`);
    if (!m.loop) {
      inst.update(1 / 30); clearFrame(f); inst.draw(f);
      const left = lit(f, () => true);
      if (left > 0) issues.notEmpty.push(`${id} (${left} px at the end)`);
    } else {
      const a = createFrame(w, h), b = createFrame(w, h);
      for (const [fr, t] of [[a, 0], [b, m.duration]]) { const p = painterFor(clearFrame(fr)); p.place(ox, oy); mod.drawBack?.(p, t, { ...m.options }); mod.draw(p, t, { ...m.options }); }
      let diff = 0; for (let i = 0; i < a.color.length; i++) if (a.color[i] !== b.color[i]) diff++;
      if (diff > 4) issues.seam.push(`${id} (${diff} px differ)`);
    }
    if (ms > 6) issues.slow.push(`${id} (${ms.toFixed(1)} ms)`);
    if (ms > worst) (worst = ms), (worstId = id);
  } catch (e) {
    issues.throw.push(`${id}: ${e.message}`);
  }
}
console.log(`${count} effects checked; slowest frame ${worst.toFixed(1)} ms (${worstId})`);
for (const [k, list] of Object.entries(issues)) {
  console.log(`${k}: ${list.length}`);
  for (const s of list.slice(0, 80)) console.log("   " + s);
}
