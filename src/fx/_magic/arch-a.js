// Spell archetypes 1-12. Each is { id, name, desc(S), size, origin, duration, loop, bg } plus either
// create(S, o, V) for a simulated one-shot or draw(S, o, V, p, t) / back(S, o, V, p, t) for a pure loop.
// Sizes are at V.s = 1; the generator scales canvas and drawing together.

import { band, flare, sparkle, clamp, smooth, ease, seg, bump, tileFbm, loopNoise, cycle, fly, rand, at, scale, mix, TAU, WHITE } from "../../core/index.js";
import { setup, ramp8, ambient, mote, ellipse, glyphRing, ball, crackle, FAR, NEAR } from "./kit.js";

// ---------------------------------------------------------------------------------------------- bolt
const bolt = {
  id: "bolt", name: "Bolt", size: [128, 56], origin: [100, 28], duration: 0.8, loop: true, bg: "dark",
  desc: (S) => `A ${S.adj} bolt in flight: a bright head of ${S.matter} with a crackling tail and ${S.motes} streaming off behind it.`,
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, D = this.duration, ph = t / D, len = 70 * s;
    // the tail: three tapering ribbons that wobble along their length
    for (let k = 0; k < 4; k++) {
      const w = [7, 5, 3, 1.5][k] * s, col = [C[3], C[5], C[6], WHITE][k];
      for (let x = 0; x <= len * (1 - k * 0.18); x += 1) {
        const u = x / (len * (1 - k * 0.18)), wob = loopNoise(ph - u * 1.5, 1.2, 9) * 4 * s * u;
        const half = w * (1 - u) ** 0.9 + 0.5;
        for (let y = -half; y <= half; y += 1) p.dot(-x, y + wob, col, 1.2 - u * (k === 0 ? 1.1 : 0.9));
        if (k === 0 && x % 6 === 0) p.glow(-x, wob, 8 * s, C[5], 0.16 * (1 - u));
      }
    }
    // loose motes thrown off the tail
    cycle(t, D, Math.round(14 * V.n), 31, (g) => g.range(0.3, 0.7), (age, life, r, i) => {
      const u = age / life, side = r.sign(), drift = S.flow === "fall" ? 30 : S.flow === "rise" ? -30 : side * 18;
      let x = -r.range(4, 16) * s - u * 90 * s, y = r.range(-3, 3) * s + drift * u * s;
      if (S.flow === "swirl") y = Math.sin(u * 9 + i) * 7 * s;
      if (S.flow === "jitter") y = (rand(i, Math.floor(u * 8)) - 0.5) * 12 * s;
      mote(p, S, C, x, y, -90, drift, 1 - u, i);
    });
    if (S.arc) for (let j = 0; j < 2; j++) crackle(p, C, 0, 0, -len * 0.7, (rand(Math.floor(ph * 8), j) - 0.5) * 18 * s, Math.floor(ph * 8) * 3 + j, 0.8);
    const pulse = 0.5 + 0.5 * Math.sin(ph * TAU * 2);
    ball(p, S, C, 0, 0, (4.5 + pulse) * s, pulse);
    p.glow(0, 0, 18 * s, C[5], 0.35);
  },
};

// ---------------------------------------------------------------------------------------------- orb
const orb = {
  id: "orb", name: "Orb", size: [104, 104], origin: [52, 60], duration: 2.4, loop: true, bg: "dark",
  desc: (S) => `A hovering orb of ${S.matter}: it bobs and pulses while a ring of ${S.motes} circles it.`,
  back(S, o, V, p, t) { this.ring(S, o, V, p, t, true); },
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, bob = Math.sin(ph * TAU) * 3 * s, pulse = 0.5 + 0.5 * Math.sin(ph * TAU * 2);
    ambient(p, S, C, t, this.duration, 0, bob, 26 * s, 26 * s, 12 * V.n, 5);
    ball(p, S, C, 0, bob, (9 + pulse * 1.5) * s, pulse);
    if (S.arc) crackle(p, C, 0, bob, Math.cos(ph * 37) * 20 * s, bob + Math.sin(ph * 23) * 16 * s, Math.floor(ph * 12), 0.8);
    this.ring(S, o, V, p, t, false);
    // its light on the floor below
    p.glow(0, 36 * s, 22 * s, C[4], 0.12 + 0.06 * pulse);
  },
  ring(S, o, V, p, t, back) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, bob = Math.sin(ph * TAU) * 3 * s, n = Math.round((V.extra ? 10 : 6) * V.n);
    for (let i = 0; i < n; i++) {
      const g = (i / n) * TAU + ph * TAU, behind = Math.sin(g) < 0;
      if (behind !== back) continue;
      const x = Math.cos(g) * 20 * s, y = bob + Math.sin(g) * 6 * s - Math.cos(g) * 3 * s;
      mote(p, S, C, x, y, -Math.sin(g) * 40, Math.cos(g) * 10, behind ? 0.5 : 1, i);
      if (!behind) p.glow(x, y, 4, C[6], 0.25);
    }
  },
};

// ---------------------------------------------------------------------------------------------- nova
const nova = {
  id: "nova", name: "Nova", size: [232, 150], origin: [116, 120], duration: 2.3, loop: false, bg: "ground",
  desc: (S) => `A ${S.adj} nova: ${S.matter} gathers above the caster, flashes, and a ring of it races out across the floor before ${S.fade}.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, CORE = -20 * s, CH = 0.35, REACH = 96 * s, rings = V.extra ? 2 : 1;
    let t = 0, fired = false;
    const front = (tt, d = 0) => REACH * ease.outCubic(clamp((tt - CH - d) / 0.7));
    return {
      update(dt) {
        t += dt;
        if (t < CH - 0.05 && R.chance(0.9)) {
          const a = R.range(0, TAU), d = R.range(24, 50) * s;
          x.spark(Math.cos(a) * d, CORE + Math.sin(a) * d * 0.7, -Math.cos(a) * d * 3, -Math.sin(a) * d * 2.1, 0.3);
        }
        if (t >= CH && !fired) {
          fired = true;
          x.flash(0, CORE, 80 * s, 0.85, 0.6);
          x.burst(0, CORE, 26, 80 * s, 220 * s, -Math.PI, 0.2, 0.7);
        }
        for (let k = 0; k < rings; k++) {
          const d = k * 0.25, fr = front(t, d);
          if (t > CH + d && t < CH + d + 0.7)
            for (const side of [-1, 1]) {
              if (R.chance(0.5 * V.n)) x.puff(side * fr, -1, side * R.range(10, 40), -R.range(2, 10), R.range(2.5, 4.5) * s, R.range(0.5, 0.9));
              if (R.chance(0.4 * V.n)) x.spark(side * fr, -2, side * R.range(10, 50), -R.range(30, 90), R.range(0.4, 0.8));
            }
        }
        if (t > CH && t < 1.4) x.ambient(0, -4, REACH * 0.7, 0.4);
        x.update(dt);
      },
      drawBack(p) {
        for (let k = 0; k < rings; k++) this.ring(p, k, FAR);
        x.drawBack(p);
      },
      ring(p, k, keep) {
        const d = k * 0.25, u = clamp((t - CH - d) / 0.9);
        if (t < CH + d || u >= 1) return;
        band(p, 0, 0, front(t, d) + 2, 0.2, Math.max(2, 10 * s * (1 - u) ** 0.7), u < 0.7 ? 1 : (1 - u) / 0.3, C, keep, t - CH - d < 0.1);
        glyphRing(p, S, C, 0, 0, front(t, d) * 0.7, 0.2, t * 0.8, (1 - u) * 0.9, keep, k);
      },
      draw(p) {
        for (let k = 0; k < rings; k++) this.ring(p, k, NEAR);
        if (t < CH) ball(p, S, C, 0, CORE, (1.5 + 6 * (t / CH) ** 2) * s, t / CH);
        else if (t < CH + 0.24) {
          const a = (t - CH) / 0.24;
          flare(p, 0, CORE, 40 * s * (1 - a) ** 1.5, 1 - a, C);
        }
        if (t > CH) p.glow(0, -4, REACH * 0.6, C[4], 0.22 * (1 - smooth(CH, 1.8, t)));
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- pillar
const pillar = {
  id: "pillar", name: "Pillar", size: [128, 232], origin: [64, 212], duration: 2.5, loop: false, bg: "ground",
  desc: (S) => `A pillar of ${S.matter}: a circle opens on the floor, a column of it roars up into the sky, holds, then narrows to a thread as ${S.fade}.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, OPEN = 0.35, UP = 0.12, HOLD = 1.5, H = 190 * s, W = 14 * s;
    let t = 0, fired = false;
    const width = () => (t < OPEN ? 0 : W * ease.outBack(clamp((t - OPEN) / UP)) * (1 - smooth(HOLD, HOLD + 0.6, t)));
    const height = () => H * ease.outQuart(clamp((t - OPEN) / UP));
    return {
      update(dt) {
        t += dt;
        if (t >= OPEN && !fired) {
          fired = true;
          x.flash(0, -20 * s, 70 * s, 0.9, 0.5);
          x.burst(0, -2, 18, 60 * s, 180 * s, -Math.PI, 0, 0.7);
        }
        if (t > OPEN && t < HOLD + 0.4) {
          const w = width();
          if (R.chance(0.7 * V.n)) x.spark(R.range(-w, w), -R.range(0, height() * 0.8), R.range(-10, 10), -R.range(60, 160), R.range(0.4, 0.8));
          if (R.chance(0.3 * V.n)) x.puff(R.sign() * R.range(w, w + 8), -2, R.sign() * R.range(10, 30), -R.range(4, 14), R.range(3, 5) * s, R.range(0.6, 1));
        }
        x.update(dt);
      },
      drawBack(p) {
        const a = Math.min(1, t / OPEN) * (1 - smooth(HOLD, HOLD + 0.8, t));
        if (a > 0) { ellipse(p, 0, 0, 30 * s, 6 * s, C[5], a, FAR); glyphRing(p, S, C, 0, 0, 24 * s, 0.22, t, a, FAR); }
        x.drawBack(p);
      },
      draw(p) {
        const w = width(), h = height(), a = Math.min(1, t / OPEN) * (1 - smooth(HOLD, HOLD + 0.8, t));
        if (w > 0.5)
          p.shade(-w - 3, -h, w + 3, 0, (px, py, out) => {
            const n = tileFbm(px * 0.18, py * 0.05 + t * 9, 0, 0, 3), u = Math.abs(px) / w + n * 0.28, v = -py / h;
            const edge = u + Math.max(0, v - 0.85) * 4;
            if (edge > 1) return;
            out.c = edge < 0.25 ? WHITE : edge < 0.5 ? C[7] : edge < 0.75 ? C[6] : edge < 0.92 ? C[5] : C[3];
            out.k = 0.18 * (1 - edge);
            out.l = C[5];
          });
        if (w > 0.5) p.glow(0, -h * 0.4, w * 4, C[5], 0.3);
        if (a > 0) {
          ellipse(p, 0, 0, 30 * s, 6 * s, C[6], a, NEAR);
          glyphRing(p, S, C, 0, 0, 24 * s, 0.22, t, a, NEAR);
          p.glow(0, -2, 34 * s, C[4], 0.25 * a);
        }
        if (S.arc && w > 1) for (let j = 0; j < 2; j++) { const f = Math.floor(t * 20) * 5 + j; crackle(p, C, 0, -rand(f, 1) * h, (rand(f, 2) < 0.5 ? -1 : 1) * w * (1 + rand(f, 3) * 1.5), -rand(f, 4) * h, f, 0.7); }
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- circle
const circle = {
  id: "circle", name: "Circle", size: [168, 84], origin: [84, 52], duration: 4, loop: true, bg: "ground",
  desc: (S) => `A ${S.adj} magic circle on the floor: two rings turning opposite ways, glyphs glowing in turn, ${S.motes} lifting off the rim.`,
  back(S, o, V, p, t) { this.rings(S, o, V, p, t, FAR); },
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, ph = t / this.duration;
    this.rings(S, o, V, p, t, NEAR);
    p.glow(0, 0, 50 * s, C[4], 0.14 + 0.05 * Math.sin(ph * TAU * 2));
    ambient(p, S, C, t, this.duration, 0, -12 * s, 52 * s, 14 * s, 16 * V.n, 7);
  },
  rings(S, o, V, p, t, keep) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, R1 = 64 * s, R2 = 48 * s, sy = 0.32;
    ellipse(p, 0, 0, R1, R1 * sy, C[6], 1, keep);
    ellipse(p, 0, 0, R1 - 2, (R1 - 2) * sy, C[4], 0.8, keep);
    ellipse(p, 0, 0, R2, R2 * sy, C[5], 1, keep);
    glyphRing(p, S, C, 0, 0, (R1 + R2) / 2, sy, ph * TAU, 0.9, keep);
    if (V.extra) glyphRing(p, S, C, 0, 0, R2 * 0.55, sy, -ph * TAU * 2, 0.8, keep, 3);
    // a star drawn through the inner ring, turning the other way
    if (keep === NEAR)
      for (let i = 0, n = 5; i < n; i++) {
        const g0 = -ph * TAU + (i / n) * TAU, g1 = -ph * TAU + (((i + 2) % n) / n) * TAU;
        p.line(Math.cos(g0) * R2, Math.sin(g0) * R2 * sy, Math.cos(g1) * R2, Math.sin(g1) * R2 * sy, C[5], 0.8);
      }
    // a bright spark running round the outer ring
    const g = ((ph * TAU * 2) % TAU + TAU) % TAU;
    if (keep(g)) { p.px(Math.cos(g) * R1, Math.sin(g) * R1 * sy, WHITE); p.glow(Math.cos(g) * R1, Math.sin(g) * R1 * sy, 8, C[6], 0.5); }
  },
};

// ---------------------------------------------------------------------------------------------- aura
const aura = {
  id: "aura", name: "Aura", size: [104, 104], origin: [52, 90], duration: 2, loop: true, bg: "ground",
  desc: (S) => `A ${S.adj} aura to stand in: tongues of ${S.matter} licking up round the feet, ${S.motes} lifting, a glow pooled on the floor.`,
  back(S, o, V, p, t) { this.tongues(S, o, V, p, t, true); },
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, D = this.duration;
    this.tongues(S, o, V, p, t, false);
    ellipse(p, 0, 0, 22 * s, 5 * s, C[5], 0.8);
    p.glow(0, -2, 28 * s, C[4], 0.22 + 0.06 * Math.sin((t / D) * TAU * 2));
    const flow = S.flow === "fall" ? "fall" : S.flow;
    ambient(p, { ...S, flow }, C, t, D, 0, -26 * s, 20 * s, 26 * s, 14 * V.n, 13);
  },
  tongues(S, o, V, p, t, back) {
    const C = ramp8(o), s = V.s, D = this.duration, n = Math.round(22 * V.n);
    cycle(t, D, n, 21, (g) => g.range(0.45, 0.8), (age, life, r, i) => {
      const g = r.range(0, TAU), behind = Math.sin(g) < 0;
      if (behind !== back) return;
      const u = age / life, rr = r.range(0.55, 1) * 20 * s, bx = Math.cos(g) * rr, by = Math.sin(g) * 4.5 * s * (rr / (20 * s));
      const h = r.range(14, 40) * s * Math.sin(Math.PI * Math.min(1, u * 1.3)) * (1 - u * 0.3);
      const sway = S.flow === "swirl" ? Math.sin(u * 6 + i) * 4 * s : (loopNoise(t / D, 1, i) * 3) * s;
      for (let y = 0; y <= h; y += 0.5) {
        const v = y / Math.max(1, h), w = 2.6 * s * (1 - v) ** 0.8;
        const col = v > 0.75 ? C[7] : v > 0.4 ? C[6] : C[5];
        for (let xx = -w; xx <= w; xx += 1) p.dot(bx + xx + sway * v, by - y, behind ? scale(col, 0.75) : col, (1 - v * 0.4) * (behind ? 0.8 : 1));
      }
    });
  },
};

// ---------------------------------------------------------------------------------------------- burst
const burst = {
  id: "burst", name: "Burst", size: [168, 150], origin: [84, 76], duration: 1.7, loop: false, bg: "dark",
  desc: (S) => `A ${S.adj} burst in mid-air: a white flash, a shockring, ${S.motes} flung in every direction, then ${S.fade}.`,
  create(S, o, V) {
    const x = setup(S, o, V, { air: true }), { C, R } = x, s = V.s;
    let t = 0, fired = false;
    return {
      update(dt) {
        t += dt;
        if (!fired) { fired = true; x.flash(0, 0, 70 * s, 0.9, 0.6); x.burst(0, 0, 40, 80 * s, 260 * s, 0, TAU, 0.8); }
        if (t < 0.5) x.ambient(0, 0, 30 * s, 0.6);
        x.update(dt);
      },
      drawBack(p) { x.drawBack(p); },
      draw(p) {
        const u = clamp(t / 0.45);
        if (t < 0.07) { p.circle(0, 0, 6 * s, WHITE); p.ring(0, 0, 9 * s, 1.5, C[7]); p.glow(0, 0, 30 * s, WHITE, 0.6); }
        else if (u < 1) {
          const r = 8 * s + 50 * s * ease.outQuart(u), w = Math.max(1, 6 * s * (1 - u));
          p.ring(0, 0, r, w, u < 0.3 ? C[7] : C[6], 1 - u * 0.6);
          p.ring(0, 0, r - w, 1, C[4], 1 - u);
          p.glowRing(0, 0, r, 8, C[5], 0.3 * (1 - u));
        }
        if (t < 0.25) flare(p, 0, 0, 30 * s * (1 - t / 0.25), 1 - t / 0.25, C);
        if (S.arc && t < 0.6) for (let j = 0; j < 4; j++) { const a = rand(j, 4) * TAU, L = 40 * s * (1 - t / 0.6); crackle(p, C, 0, 0, Math.cos(a) * L, Math.sin(a) * L, j * 7 + Math.floor(t * 20), 1 - t / 0.6); }
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- rain
const rain = {
  id: "rain", name: "Rain", size: [224, 176], origin: [112, 156], duration: 2.9, loop: false, bg: "ground",
  desc: (S) => `A rain of ${S.matter}: a sigil opens overhead and ${S.motes} pour down onto the floor, each landing with a splash, until ${S.fade}.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, TOP = -128 * s, HW = 72 * s, START = 0.4, STOP = 1.9;
    const drops = [];
    let t = 0;
    return {
      update(dt) {
        t += dt;
        if (t > START && t < STOP)
          for (let k = 0; k < 3; k++) if (R.chance(0.55 * V.n)) drops.push({ x: R.range(-HW, HW), y: TOP + R.range(0, 10), vy: R.range(160, 240) * (V.wild ? R.range(0.7, 1.4) : 1), i: drops.length });
        for (let i = drops.length - 1; i >= 0; i--) {
          const d = drops[i];
          d.y += d.vy * dt;
          if (d.y >= 0) {
            drops.splice(i, 1);
            for (let j = 0; j < 3; j++) x.spark(d.x, -1, R.range(-40, 40), -R.range(40, 100), R.range(0.25, 0.5));
            if (R.chance(0.4)) x.bit(d.x, -1, R.range(-30, 30), -R.range(40, 90), 0.8);
            if (R.chance(0.3)) x.puff(d.x, -1, R.range(-10, 10), -R.range(2, 8), R.range(2, 3.5) * s, R.range(0.4, 0.7));
            x.lights.add(d.x, -3, 10, C[5], 0.4, 0.2);
          }
        }
        x.update(dt);
      },
      drawBack(p) {
        const a = clamp(t / START) * (1 - smooth(STOP, STOP + 0.5, t));
        if (a > 0) {
          ellipse(p, 0, TOP, HW + 6, 8 * s, C[5], a);
          glyphRing(p, S, C, 0, TOP, HW * 0.75, 0.11, t * 0.7, a);
          p.glow(0, TOP, HW, C[4], 0.2 * a);
        }
        x.drawBack(p);
      },
      draw(p) {
        for (const d of drops) {
          p.line(d.x, d.y - 7 * s, d.x, d.y - 3, C[5], 0.8);
          p.line(d.x, d.y - 3, d.x, d.y, C[7]);
          p.glow(d.x, d.y, 4, C[5], 0.3);
        }
        const a = clamp((t - START) / 0.3) * (1 - smooth(STOP, STOP + 0.8, t));
        if (a > 0) p.glow(0, -4, HW, C[4], 0.14 * a);
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- beam
const beam = {
  id: "beam", name: "Beam", size: [232, 64], origin: [16, 32], duration: 1.2, loop: true, bg: "dark",
  desc: (S) => `A sustained beam of ${S.matter}: a flaring muzzle, a churning core streaming forward, a splash where it hits.`,
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, D = this.duration, ph = t / D, L = 196 * s, W = 7 * s;
    p.shade(0, -W - 3, L, W + 3, (px, py, out) => {
      const u = px / L, wob = loopNoise(ph * 2 - u * 3, 0.9, 5) * 1.5 * s;
      const n = tileFbm(px * 0.08 - ph * 16, py * 0.25, 16, 0, 11, 2);
      const w = W * (0.75 + 0.25 * Math.sin(ph * TAU * 3 + px * 0.05)) * Math.min(1, px / 10 + 0.3);
      const e = Math.abs(py - wob) / w + n * 0.3;
      if (e > 1) return;
      out.c = e < 0.22 ? WHITE : e < 0.48 ? C[7] : e < 0.74 ? C[6] : C[4];
      out.k = 0.12 * (1 - e); out.l = C[5];
    });
    // the muzzle and the splash at the end
    const pulse = 0.5 + 0.5 * Math.sin(ph * TAU * 4);
    sparkle(p, 0, 0, (5 + pulse * 3) * s, C[6], C[5], 0.5);
    p.glow(L, 0, 20 * s, C[5], 0.4);
    cycle(t, D, Math.round(16 * V.n), 41, (g) => g.range(0.15, 0.35), (age, life, r, i) => {
      const a = r.range(-2.2, 2.2) + Math.PI, sp = r.range(60, 140) * s, u = age / life;
      const [mx, my] = fly(L, 0, Math.cos(a) * sp, Math.sin(a) * sp, age, 300, 3);
      mote(p, S, C, mx, my, Math.cos(a) * sp, Math.sin(a) * sp, 1 - u, i);
    });
    // motes riding the beam
    cycle(t, D, Math.round(10 * V.n), 43, 0.6, (age, life, r, i) => {
      const u = age / life, y0 = r.range(-W, W) * 1.2;
      mote(p, S, C, u * L, y0 + Math.sin(u * 10 + i) * 2, 200, 0, 1 - u * 0.6, i);
    });
    if (S.arc) for (let j = 0; j < 2; j++) crackle(p, C, 0, 0, L, 0, Math.floor(ph * 16) * 4 + j, 0.6);
  },
};

// ---------------------------------------------------------------------------------------------- vortex
const vortex = {
  id: "vortex", name: "Vortex", size: [144, 140], origin: [72, 124], duration: 2, loop: true, bg: "ground",
  desc: (S) => `A ${S.adj} vortex: a funnel of ${S.matter} spinning up from the floor, ${S.motes} whirled round it.`,
  back(S, o, V, p, t) { this.funnel(S, o, V, p, t, true); },
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s;
    this.funnel(S, o, V, p, t, false);
    p.glow(0, -40 * s, 40 * s, C[4], 0.16);
    ellipse(p, 0, 0, 22 * s, 5 * s, C[4], 0.6);
  },
  funnel(S, o, V, p, t, back) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, H = 104 * s, rows = 14;
    for (let j = 0; j < rows; j++) {
      const v = j / (rows - 1), y = -v * H, r = (6 + 34 * v ** 1.4) * s, sway = loopNoise(ph - v * 0.5, 0.8, 3) * 6 * s * v;
      const strokes = 3 + Math.round(v * 3), spin = ph * TAU * (S.dark ? -2 : 2) + v * 2.2;
      for (let k = 0; k < strokes; k++) {
        const g0 = spin + (k / strokes) * TAU;
        for (let d = 0; d < 1.4; d += 0.08) {
          const g = g0 + d, behind = Math.sin(g) < 0;
          if (behind !== back) continue;
          const col = d < 0.3 ? C[7] : d < 0.8 ? C[6] : C[4];
          p.dot(sway + Math.cos(g) * r, y + Math.sin(g) * r * 0.28, behind ? scale(col, 0.7) : col, (1 - d / 1.4) * (behind ? 0.7 : 1));
        }
      }
    }
    if (!back) {
      cycle(t, this.duration, Math.round(12 * V.n), 51, (g) => g.range(0.8, 1.6), (age, life, r, i) => {
        const u = age / life, g = r.range(0, TAU) + u * 8, v = u, rr = (8 + 34 * v) * s;
        mote(p, S, C, Math.cos(g) * rr, -v * H, -Math.sin(g) * 40, -20, 1 - u, i);
      });
      if (S.arc) crackle(p, C, 0, -H, rand(Math.floor(ph * 10), 1) * 40 * s - 20 * s, -H * 0.3, Math.floor(ph * 10), 0.7);
    }
  },
};

// ---------------------------------------------------------------------------------------------- shield
const shield = {
  id: "shield", name: "Ward", size: [136, 120], origin: [68, 104], duration: 3, loop: true, bg: "ground",
  desc: (S) => `A ${S.adj} ward: a dome of ${S.matter} over the caster, a lattice shimmering on its skin, a glint sweeping across it.`,
  back(S, o, V, p, t) {
    const C = ramp8(o), s = V.s;
    ellipse(p, 0, 0, 52 * s, 10 * s, C[5], 0.9, FAR);
  },
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, RX = 52 * s, RY = 84 * s, sweep = (ph * 2) % 1;
    p.shade(-RX - 1, -RY - 1, RX + 1, 1, (px, py, out) => {
      const d = Math.hypot(px / RX, py / RY);
      if (d > 1 || py > 0) return;
      const hexA = ((Math.floor(px / (5 * s)) + Math.floor((py + (Math.floor(px / (5 * s)) % 2) * 2.5 * s) / (5 * s))) % 2 + 2) % 2;
      const sw = Math.abs(px / RX - (sweep * 2.6 - 1.3) - py / RY * 0.4);
      if (d > 0.93) { out.c = d > 0.97 ? C[7] : C[6]; out.k = 0.1; out.l = C[5]; return; }
      if (sw < 0.06) { out.c = C[7]; out.a = 0.8; return; }
      out.c = hexA ? C[5] : C[4];
      out.a = (0.08 + 0.32 * d ** 4) * (V.extra ? 1.3 : 1);
      out.k = 0.04 * d; out.l = C[5];
    });
    ellipse(p, 0, 0, RX, 10 * s, C[6], 1, NEAR);
    glyphRing(p, S, C, 0, 0, RX * 0.86, 10 / 52, ph * TAU, 0.8, NEAR);
    ambient(p, S, C, t, this.duration, 0, -RY * 0.5, RX * 0.8, RY * 0.4, 10 * V.n, 61);
    p.glow(0, -RY * 0.4, RX, C[4], 0.12 + 0.04 * Math.sin(ph * TAU * 3));
  },
};

// ---------------------------------------------------------------------------------------------- portal
const portal = {
  id: "portal", name: "Rift", size: [120, 136], origin: [60, 124], duration: 2.4, loop: true, bg: "ground",
  desc: (S) => `A standing rift of ${S.matter}: a spiralling heart inside a crackling rim, ${S.motes} drawn into it.`,
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, RX = 30 * s, RY = 50 * s, CY = -58 * s;
    p.shade(-RX - 4, CY - RY - 4, RX + 4, CY + RY + 4, (px, py, out) => {
      const dx = px / RX, dy = (py - CY) / RY, d = Math.hypot(dx, dy);
      const rim = 1 + loopNoise(ph + Math.atan2(dy, dx) / TAU, 1.5, 3) * 0.06;
      if (d > rim) return;
      if (d > rim - 0.12) { out.c = d > rim - 0.05 ? C[7] : C[6]; out.k = 0.2; out.l = C[5]; return; }
      const a = Math.atan2(dy, dx), v = (((a / TAU) * 3 + d * 2.2 - ph * 3) % 1 + 1) % 1;
      const step = Math.floor(v * 4);
      out.c = S.dark ? [C[0], C[1], C[2], C[3]][step] : [C[3], C[4], C[5], C[6]][(step + Math.floor(d * 2)) % 4];
      if (d < 0.18 && !S.dark) out.c = WHITE;
      out.k = S.dark ? 0 : 0.06 * (1 - d); out.l = C[5];
    });
    p.glow(0, CY, RX * 2.4, C[5], 0.25);
    ellipse(p, 0, 0, RX * 0.9, 4 * s, C[5], 0.7);
    p.glow(0, -2, RX * 1.6, C[4], 0.18);
    cycle(t, this.duration, Math.round(16 * V.n), 71, (g) => g.range(0.5, 0.9), (age, life, r, i) => {
      const u = ease.inQuad(age / life), a = r.range(0, TAU), rr = (1 - u) * r.range(44, 60) * s + RX * 0.3 * u;
      mote(p, S, C, Math.cos(a) * rr * 0.9, CY + Math.sin(a) * rr * 1.2, -Math.cos(a) * 50, -Math.sin(a) * 50, 1 - u * 0.5, i);
    });
    if (S.arc) for (let j = 0; j < 2; j++) { const a = rand(Math.floor(ph * 10), j) * TAU; crackle(p, C, Math.cos(a) * RX, CY + Math.sin(a) * RY, Math.cos(a) * RX * 1.5, CY + Math.sin(a) * RY * 1.3, Math.floor(ph * 10) * 3 + j, 0.8); }
  },
};

export const ARCH_A = [bolt, orb, nova, pillar, circle, aura, burst, rain, beam, vortex, shield, portal];
