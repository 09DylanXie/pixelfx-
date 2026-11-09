// Contact sheets for generated magic effects, without the repo's own tools.
//   node preview.mjs <repo> <out.png> <school,school|*> <arch,arch|*> [variant] [frames] [zoom]
// One row per effect, `frames` evenly spaced samples (loops: across one period; one-shots: across the life).
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const [repo, out, schoolArg, archArg, variantArg = "0", framesArg = "8", zoomArg = "2"] = process.argv.slice(2);
const core = await import(pathToFileURL(join(repo, "src/core/index.js")).href);
const magic = await import(pathToFileURL(join(repo, "src/fx/_magic/index.js")).href);
const { createFrame, clearFrame, createFx, composite } = core;
const schools = schoolArg === "*" ? magic.SCHOOLS.map((s) => s.id) : schoolArg.split(",");
const archs = archArg === "*" ? magic.ARCHETYPES.map((a) => a.id) : archArg.split(",");
const variants = variantArg === "*" ? [0, 1, 2, 3, 4] : variantArg.split(",").map(Number);
const F = +framesArg, Z = +zoomArg;

const rows = [];
let maxW = 0;
for (const sc of schools) for (const ar of archs) for (const v of variants) {
  const mod = magic.make(sc, ar, v), m = mod.meta, [w, h] = m.size;
  const frame = createFrame(w, h), inst = createFx(mod, { x: m.origin[0], y: m.origin[1] });
  const fps = 30, total = Math.round(m.duration * fps), want = new Set();
  for (let i = 0; i < F; i++) want.add(Math.round((i / (m.loop ? F : F - 1)) * (m.loop ? total : total - 1)));
  const shots = [];
  let ms = 0;
  for (let f = 0; f <= total && shots.length < F; f++) {
    if (want.has(f)) {
      const t0 = performance.now();
      clearFrame(frame); inst.draw(frame, "back"); inst.draw(frame, "front");
      ms = Math.max(ms, performance.now() - t0);
      const px = new Uint8ClampedArray(w * h * 4);
      composite(frame, px, m.bg === "dark" ? core.hex("#101018") : core.hex("#1e2430"));
      shots.push(px);
    }
    inst.update(1 / fps);
  }
  // ground line so floor effects can be judged
  rows.push({ w, h, shots, oy: m.origin[1], name: m.name, ms });
  maxW = Math.max(maxW, w * shots.length + (shots.length - 1) * 4);
}
const H = rows.reduce((a, r) => a + r.h + 4, 0), W = maxW;
const img = new Uint8Array(W * H * 4).fill(40);
let y0 = 0;
for (const r of rows) {
  r.shots.forEach((px, i) => {
    const x0 = i * (r.w + 4);
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      const s = (y * r.w + x) * 4, d = ((y0 + y) * W + x0 + x) * 4;
      img[d] = px[s]; img[d + 1] = px[s + 1]; img[d + 2] = px[s + 2]; img[d + 3] = 255;
      if (y === r.oy && px[s] < 60 && px[s + 1] < 60) { img[d] = 70; img[d + 1] = 64; img[d + 2] = 56; }
    }
  });
  y0 += r.h + 4;
}
// zoom and encode
const ZW = W * Z, ZH = H * Z, raw = Buffer.alloc((ZW * 4 + 1) * ZH);
for (let y = 0; y < ZH; y++) {
  raw[y * (ZW * 4 + 1)] = 0;
  for (let x = 0; x < ZW; x++) {
    const s = (((y / Z) | 0) * W + ((x / Z) | 0)) * 4, d = y * (ZW * 4 + 1) + 1 + x * 4;
    raw[d] = img[s]; raw[d + 1] = img[s + 1]; raw[d + 2] = img[s + 2]; raw[d + 3] = 255;
  }
}
const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(ZW, 0); ihdr.writeUInt32BE(ZH, 4); ihdr[8] = 8; ihdr[9] = 6;
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
console.log(rows.map((r) => `${r.name}: ${r.w}x${r.h}, slowest sampled frame ${r.ms.toFixed(2)} ms`).join("\n"));
