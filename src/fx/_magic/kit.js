// The shared kit behind the generated magic effects: a school's particles, debris, puffs and runes, for
// simulated one-shots (setup) and for pure loops (mote, ambient, glyphRing), built on src/core.

import { Particles, Bits, Lights, P, PF, B, Rng, fit, scale, mix, clamp, rand, rng, cycle, TAU, WHITE, hex } from "../../core/index.js";

const KIND = { spark: P.SPARK, mote: P.MOTE, streak: P.STREAK, flake: P.FLAKE, star: P.STAR, ember: P.EMBER, grit: P.GRIT };

/** The school's 8-step ramp from the caller's palette. */
export const ramp8 = (o) => fit(o.palette, 8);

/**
 * A simulation context for one-shots: particles, debris and lights that know the school.
 * V is the variant ({ s: size, n: density, wild, extra }).
 */
export function setup(S, o, V, { air = false } = {}) {
  const C = ramp8(o), R = new Rng(o.seed), floor = () => 0;
  const ps = new Particles({ rng: R, ground: floor, sparks: [C[7], C[6], C[5], C[4]], haze: S.puff === "vapour" ? C[5] : undefined });
  const bits = new Bits({ ground: floor }), lights = new Lights();
  const chunkRamp = S.chunk ?? [C[0], C[2], C[4], C[5], C[6]];
  const bright = () => R.pick([C[7], C[6], C[6], C[5]]);
  const ctx = {
    S, V, C, R, ps, bits, lights,
    n: (k) => Math.max(1, Math.round(k * V.n)),
    /** One loose particle of the school's spark kind. */
    spark(x, y, vx, vy, life, size = 1) {
      const k = KIND[S.spark];
      // in mid-air there's no floor to land on, so grains drift as motes instead of falling forever
      if (S.spark === "grit" && air) return ps.spawn(P.MOTE, x, y, vx * 0.6, vy * 0.6, life, R.pick([C[4], C[5], C[6]]), 0.7);
      // grit only lands when it falls onto the floor from above, so it never starts below it;
      // it has almost no air drag, so it gets half the sideways speed or it skids off the canvas
      if (S.spark === "grit") return ps.spawn(k, x, Math.min(y, -0.5), vx * 0.5, vy - 40, life + 0.4, R.pick([C[3], C[4], C[5]]), R.chance(0.3) ? 2 : 1);
      if (S.spark === "flake") return ps.spawn(k, x, y, vx, vy, life + 0.5, R.chance(0.5) ? C[7] : C[6], R.range(0.6, 1.8) * size);
      if (S.spark === "star") return ps.spawn(k, x, y, vx * 0.6, vy * 0.6, life + 0.2, bright(), R.chance(0.35) ? R.range(1.5, 3) * size : R.range(0.4, 0.9));
      if (S.spark === "ember") return ps.spawn(k, x, y, vx * 0.7, vy * 0.7, life + 0.6, C[6], R.range(1, 2));
      if (S.spark === "streak") return ps.spawn(k, x, y, vx * 0.35, vy * 0.35, Math.min(0.35, life * 0.5), bright());
      if (S.spark === "mote") return ps.spawn(k, x, y, vx, vy, life, bright(), R.range(0.7, 1.3) * size);
      return ps.spawn(k, x, y, vx, vy, life, C[7]);
    },
    /** One piece of debris, if the school has any. */
    bit(x, y, vx, vy, size = 1) {
      if (!S.bit) return;
      if (S.bit === "drip") return bits.add({ kind: B.DRIP, x, y, vx: vx * 0.5, vy: vy * 0.5, g: 0.7, life: 1.4, c: R.pick([C[4], C[5], C[6]]) });
      if (S.bit === "chunk" && air) return bits.add({ kind: B.CHUNK, x, y, vx: vx * 0.6, vy: vy * 0.6, g: 0, drag: 2.5, life: R.range(0.5, 0.9), a: R.range(0, TAU), va: R.range(-14, 14), s: R.range(1.2, 2.2) * size, ramp: chunkRamp });
      if (S.bit === "chunk") return bits.add({ kind: B.CHUNK, x, y: Math.min(y, -0.5), vx, vy, g: 0.9, drag: 0.4, bounce: 0.35, life: R.range(0.9, 1.6), a: R.range(0, TAU), va: R.range(-14, 14), s: R.range(1.2, 2.6) * size, ramp: chunkRamp });
      return bits.add({ kind: B.SHARD, x, y, vx, vy, g: 0.7, drag: 0.6, bounce: 0.3, life: R.range(0.8, 1.5), a: R.range(0, TAU), va: R.range(-20, 20), s: R.range(1.5, 3.5) * size, c: R.pick([C[7], C[6], C[5]]) });
    },
    /** One soft puff (vapour, smoke, dust or a ball of fire), if the school has one. */
    puff(x, y, vx, vy, size, life) {
      if (!S.puff) return;
      if (S.puff === "fire") return ps.spawn(P.FIRE, x, y, vx, vy - 10, life * 0.5, 0, size * 0.8, 0, PF.SMOKES);
      if (S.puff === "smoke") return ps.spawn(P.SMOKE, x, y, vx, vy, life * 1.2, S.dark ? C[2] : C[3], size);
      if (S.puff === "dust") return ps.spawn(P.DUST, x, y, vx, vy, life, R.pick([C[4], C[5]]), size);
      return ps.spawn(P.VAPOUR, x, y, vx, vy, life, R.chance(0.6) ? C[6] : C[5], size);
    },
    /** A radial burst: sparks, a share of debris, a few puffs, thrown between angles a0..a1. */
    burst(x, y, n, sp0, sp1, a0 = 0, a1 = TAU, life = 0.6) {
      for (let i = 0, m = ctx.n(n); i < m; i++) {
        const a = R.range(a0, a1), sp = R.range(sp0, sp1) * (V.wild ? R.range(0.6, 1.5) : 1);
        ctx.spark(x, y, Math.cos(a) * sp, Math.sin(a) * sp, R.range(life * 0.6, life * 1.3));
        if (i % 3 === 0) ctx.bit(x, y, Math.cos(a) * sp * 0.8, Math.sin(a) * sp * 0.8);
        if (i % 4 === 0) ctx.puff(x, y, Math.cos(a) * sp * 0.25, Math.sin(a) * sp * 0.25, R.range(2.5, 4.5) * V.s, R.range(0.6, 1.1));
      }
    },
    /** Loose particles around (x, y) moving the school's way: call every update while something is live. */
    ambient(x, y, spread, rate) {
      if (!R.chance(rate * V.n)) return;
      const px = x + R.range(-spread, spread), py = y + R.range(-spread * 0.4, spread * 0.4);
      switch (S.flow) {
        case "rise": return ctx.spark(px, py, R.range(-8, 8), -R.range(20, 50), R.range(0.6, 1.1));
        case "fall": return S.bit === "drip" && R.chance(0.5) ? ctx.bit(px, py, 0, R.range(10, 40)) : ctx.spark(px, py, R.range(-6, 6), R.range(10, 40), R.range(0.5, 0.9));
        case "swirl": {
          const a = R.range(0, TAU), r = spread * R.range(0.5, 1);
          return ctx.spark(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.4, -Math.sin(a) * 60, Math.cos(a) * 24 - 10, R.range(0.4, 0.8));
        }
        case "pull": {
          const a = R.range(0, TAU), r = spread * R.range(1, 1.6);
          return ctx.spark(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, -Math.cos(a) * r * 1.6, -Math.sin(a) * r, R.range(0.4, 0.6));
        }
        case "jitter": return ps.spawn(P.STAR, px, py, 0, 0, R.range(0.1, 0.25), R.chance(0.5) ? C[7] : C[6], R.range(0.5, 2));
        default: return ctx.spark(px, py, R.range(-12, 12), R.range(-14, 6), R.range(0.8, 1.4));
      }
    },
    flash(x, y, r, k = 0.8, life = 0.5) {
      lights.add(x, y, r, C[5], k, life);
      lights.add(x, y, r * 0.5, WHITE, k * 0.8, Math.min(0.14, life * 0.3));
    },
    update(dt) { ps.update(dt); bits.update(dt); lights.update(dt); },
    drawBack(p) { ps.draw(p, "back"); },
    drawFront(p) { bits.draw(p); ps.draw(p, "front"); lights.draw(p); },
  };
  return ctx;
}

// ---------------------------------------------------------------------------------------------
// Pure drawing, for loops: everything here is a function of t, so loops stay seamless.

/**
 * One loose particle drawn in the school's style at (x, y), moving (vx, vy), k its remaining life 0..1.
 */
export function mote(p, S, C, x, y, vx, vy, k, i = 0) {
  const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp, a = Math.min(1, k * 3);
  const c = i % 3 === 0 ? C[7] : i % 3 === 1 ? C[6] : C[5];
  switch (S.spark) {
    case "mote": case "streak": case "spark": {
      const len = Math.min(S.spark === "streak" ? 8 : 5, 1 + sp * 0.03);
      p.line(x - ux * len, y - uy * len, x - ux * len * 0.4, y - uy * len * 0.4, scale(c, 0.6), a);
      p.line(x - ux * len * 0.4, y - uy * len * 0.4, x, y, c, a);
      p.glow(x, y, 3, c, 0.35 * k);
      break;
    }
    case "flake":
      p.dot(x, y, c, a);
      if (i % 4 === 0) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) p.dot(x + dx, y + dy, scale(c, 0.8), a * 0.8);
      break;
    case "ember":
      if (k < 0.25 && (i + Math.floor(k * 40)) % 2) break;
      p.px(x, y, k > 0.5 ? C[7] : C[6]);
      p.glow(x, y, 3, C[5], 0.4 * k);
      break;
    case "grit":
      p.dot(x, y, i % 2 ? C[4] : C[5], a);
      if (i % 5 === 0) p.dot(x + 1, y, C[3], a);
      break;
    default: { // star
      const tw = 0.5 + 0.5 * Math.sin(k * 18 + i);
      if (i % 4 === 0 && k > 0.3) {
        const arm = Math.round(1 + tw * 1.5);
        for (let d = 1; d <= arm; d++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) p.dot(x + dx * d, y + dy * d, d === arm ? C[5] : C[6], a);
        p.px(x, y, WHITE);
        p.glow(x, y, 5, C[5], 0.4 * k);
      } else {
        if (tw * k > 0.2) p.px(x, y, tw > 0.75 ? WHITE : c);
        p.glow(x, y, 3, c, 0.3 * k * tw);
      }
    }
  }
}

/**
 * Loose particles in a loop D long, moving the school's way, inside the box around (cx, cy) of half-width
 * hw and half-height hh. count scales with density.
 */
export function ambient(p, S, C, t, D, cx, cy, hw, hh, count, seed) {
  cycle(t, D, Math.round(count), seed, (g) => g.range(0.5, 1) * Math.min(D, 1.6), (age, life, r, i) => {
    const u = age / life, k = 1 - u;
    let x, y, vx, vy;
    switch (S.flow) {
      case "rise": {
        x = cx + r.range(-hw, hw) + Math.sin(u * 6 + i) * 2; y = cy + hh - u * hh * 2 * r.range(0.6, 1); vx = 0; vy = -30; break;
      }
      case "fall": {
        x = cx + r.range(-hw, hw); y = cy - hh + u * u * hh * 2; vx = 0; vy = 20 + 60 * u; break;
      }
      case "swirl": {
        const a0 = r.range(0, TAU), a = a0 + u * r.range(3, 5), rad = hw * r.range(0.4, 1);
        x = cx + Math.cos(a) * rad; y = cy + hh * 0.6 - u * hh * 1.4 + Math.sin(a) * rad * 0.3; vx = -Math.sin(a) * 40; vy = Math.cos(a) * 12; break;
      }
      case "pull": {
        const a = r.range(0, TAU), rad = hw * (1 - u * u) * r.range(0.7, 1.1);
        x = cx + Math.cos(a) * rad; y = cy + Math.sin(a) * rad * (hh / hw); vx = -Math.cos(a) * 40; vy = -Math.sin(a) * 40; break;
      }
      case "jitter": {
        x = cx + r.range(-hw, hw); y = cy + r.range(-hh, hh); vx = r.range(-30, 30); vy = r.range(-30, 30);
        if (u > 0.35) return;
        break;
      }
      default: {
        x = cx + r.range(-hw, hw) + r.range(-8, 8) * u; y = cy + r.range(-hh, hh) - u * r.range(2, 10); vx = r.range(-10, 10); vy = -6; break;
      }
    }
    mote(p, S, C, x, y, vx, vy, k, i);
  });
}

/** A ring on a tilted plane drawn dot by dot: keep(angle) picks the part, c and a may be numbers. */
export function ellipse(p, cx, cy, rx, ry, c, a = 1, keep = null) {
  const m = Math.max(12, Math.ceil(Math.max(rx, ry) * TAU * 1.3));
  for (let j = 0; j < m; j++) {
    const g = (j / m) * TAU;
    if (keep && !keep(g)) continue;
    p.dot(cx + Math.cos(g) * rx, cy + Math.sin(g) * ry, c, a);
  }
}

/** A tiny rune: a 3x5 glyph chosen by n, drawn upright at (x, y). */
export function rune(p, x, y, n, c, a = 1) {
  const h = rand(n, 77) * 32768;
  for (let r = 0; r < 5; r++)
    for (let q = 0; q < 3; q++) {
      const bit = q === 1 ? (r === 0 || r === 4 || (h >> (r + 9)) & 1) : (h >> (r * 2 + (q ? 1 : 0))) & 1;
      if (bit) p.dot(x - 1 + q, y - 2 + r, c, a);
    }
}

/**
 * Marks around a ring on a tilted plane (sy squashes it), turning by rot: the school's glyph style.
 * keep(angle) picks which part to draw (far half behind, near half in front).
 */
export function glyphRing(p, S, C, cx, cy, r, sy, rot, a, keep = null, seed = 0) {
  const n = Math.max(6, Math.round(r / 5));
  for (let i = 0; i < n; i++) {
    const g = rot + (i / n) * TAU;
    if (keep && !keep(((g % TAU) + TAU) % TAU)) continue;
    const x = cx + Math.cos(g) * r, y = cy + Math.sin(g) * r * sy, near = Math.sin(g) > 0, c = near ? C[6] : C[5];
    switch (S.glyph) {
      case "runes": rune(p, x, y, i + seed * 13, c, a); break;
      case "teeth": {
        const ox = Math.cos(g), oy = Math.sin(g) * sy;
        for (let d = 0; d < 3; d++) p.dot(x + ox * d, y + oy * d, d === 2 ? C[7] : c, a);
        p.dot(x - oy * 1.2, y + ox * 1.2, c, a); p.dot(x + oy * 1.2, y - ox * 1.2, c, a);
        break;
      }
      case "spokes": {
        const r0 = r * 0.82;
        p.line(cx + Math.cos(g) * r0, cy + Math.sin(g) * r0 * sy, x, y, c, a);
        p.dot(x, y, C[7], a);
        break;
      }
      default: { // dots
        p.dot(x, y, i % 2 ? C[7] : c, a);
        if (i % 2 === 0) { p.dot(x + 1, y, c, a); p.dot(x, y - 1, c, a); }
      }
    }
    p.glow(x, y, 4, C[5], 0.12 * a);
  }
}

/** The far half of a ring on the floor (behind things) or the near half (in front). */
export const FAR = (g) => Math.sin(g) < 0;
export const NEAR = (g) => Math.sin(g) >= 0;

/** A shaded ball: dark rim, lit top-left, hot heart; or for dark schools a hole with a bright rim. */
export function ball(p, S, C, x, y, r, pulse = 0) {
  if (r < 0.8) return;
  if (S.dark) {
    p.circle(x, y, r + 1, C[5]);
    p.circle(x, y, r, C[0]);
    p.circle(x - r * 0.15, y - r * 0.15, r * 0.6, hex("#000000") | 0xff000000);
    p.glow(x, y, r * 3 + 6, C[5], 0.35 + pulse * 0.2);
    return;
  }
  p.circle(x, y, r + 1, C[3]);
  p.circle(x, y, r, C[5]);
  p.circle(x - r * 0.2, y - r * 0.2, r * 0.7, C[6]);
  p.circle(x - r * 0.3, y - r * 0.3, r * 0.35, WHITE);
  p.glow(x, y, r * 3 + 6, C[5], 0.45 + pulse * 0.25);
  p.glow(x, y, r * 1.4 + 2, WHITE, 0.25 + pulse * 0.2);
}

/** A forked crackle between two points (for storm schools), seeded by n so it holds for a few frames. */
export function crackle(p, C, x0, y0, x1, y1, n, a = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const seg = Math.max(4, Math.round(L / 9)), jag = Math.min(L * 0.35, 12);
  const pts = [[x0, y0]];
  for (let i = 1; i < seg; i++) {
    const u = i / seg, j = (rand(n, i) - 0.5) * jag;
    pts.push([x0 + dx * u + nx * j, y0 + dy * u + ny * j]);
  }
  pts.push([x1, y1]);
  for (let i = 0; i < pts.length - 1; i++) {
    p.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], i % 2 ? C[7] : C[6], a);
    p.glowLine(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 4, C[5], 0.35 * a);
  }
}

export { clamp, rand, rng, mix, scale, TAU, WHITE };
