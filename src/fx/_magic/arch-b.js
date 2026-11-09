// Spell archetypes 13-24 (see arch-a.js for the shape of an archetype).

import { P, band, flare, sparkle, crystal, clamp, smooth, ease, seg, bump, loopNoise, cycle, fly, rand, scale, mix, star, ngon, TAU, WHITE } from "../../core/index.js";
import { setup, ramp8, ambient, mote, ellipse, glyphRing, ball, crackle, rune, FAR, NEAR } from "./kit.js";

// ---------------------------------------------------------------------------------------------- spikes
const spikes = {
  id: "spikes", name: "Spikes", size: [264, 120], origin: [24, 100], duration: 2.3, loop: false, bg: "ground",
  desc: (S) => `A line of ${S.matter} spikes bursting from the floor one after another, throwing ${S.motes}, then sinking back as ${S.fade}.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, n = Math.round(7 * (V.wild ? 1.4 : 1)), HOLD = 1.3;
    const sites = [];
    for (let i = 0; i < n; i++) {
      const u = (i + 1) / n, h = (18 + 34 * Math.sin(Math.PI * Math.min(1, u * 1.15))) * s * R.range(0.8, 1.15);
      sites.push({ x: (14 + u * 196) * s, h, w: h * R.range(0.34, 0.45), lean: R.range(-0.15, 0.25) * h, t0: 0.08 + i * 0.07, up: false, glint: R.next() });
    }
    let t = 0;
    return {
      update(dt) {
        t += dt;
        for (const q of sites) if (!q.up && t >= q.t0) {
          q.up = true;
          x.burst(q.x, -2, 6 + q.h / 8, 60 * s, 170 * s, -Math.PI + 0.3, -0.3, 0.6);
          x.puff(q.x, -1, R.range(-20, 20), -R.range(3, 10), R.range(3, 5) * s, R.range(0.6, 1));
          x.lights.add(q.x, -q.h * 0.5, q.h * 1.4, C[5], 0.6, 0.35);
        }
        if (t > 0.3 && t < HOLD) x.ambient(R.pick(sites).x, -10 * s, 8 * s, 0.4);
        x.update(dt);
      },
      drawBack(p) { x.drawBack(p); },
      draw(p) {
        const sink = smooth(HOLD, HOLD + 0.6, t);
        for (const q of sites) {
          if (!q.up || sink >= 1) continue;
          const g = ease.outBack(clamp((t - q.t0) / 0.1), 2.4), sw = ((t - q.t0) * 0.8 + q.glint) % 1.4;
          crystal(p, q.x, 0, q.h * g * (1 - sink), q.w * (1 - sink * 0.3), q.lean * g * (1 - sink), C, { white: t < q.t0 + 0.03, glint: sw <= 1 ? sw : -1 });
          p.glow(q.x, -3, q.w * 2, C[4], 0.2 * (1 - sink));
        }
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- charge
const charge = {
  id: "charge", name: "Charge", size: [128, 128], origin: [64, 100], duration: 1.7, loop: false, bg: "ground",
  desc: (S) => `Charging up ${S.matter}: ${S.motes} spiral in to a point above the hands, rings tighten round it, and it pops with a flash.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, CORE = -36 * s, POP = 1.15;
    let t = 0, fired = false;
    return {
      update(dt) {
        t += dt;
        if (t < POP - 0.08) {
          const k = t / POP;
          for (let j = 0; j < 2; j++) if (R.chance((0.5 + k) * V.n * 0.8)) {
            const a = R.range(0, TAU), d = R.range(30, 54) * s, T = R.range(0.22, 0.32);
            x.ps.spawn(P.STREAK, Math.cos(a) * d, CORE + Math.sin(a) * d, -Math.cos(a) * d / T * 0.9, -Math.sin(a) * d / T * 0.9, T, R.chance(0.5) ? C[7] : C[6]);
          }
          if (R.chance(0.15 * V.n)) x.puff(R.sign() * R.range(20, 40) * s, -1, 0, -R.range(4, 10), R.range(2, 3.5) * s, 0.6);
        }
        if (t >= POP && !fired) { fired = true; x.flash(0, CORE, 60 * s, 0.9, 0.45); x.burst(0, CORE, 20, 60 * s, 180 * s, 0, TAU, 0.5); }
        x.update(dt);
      },
      drawBack(p) { x.drawBack(p); },
      draw(p) {
        const k = clamp(t / POP);
        if (t < POP) {
          for (let j = 0; j < 3; j++) {
            const u = ((k * 3 + j / 3) % 1), r = (30 - 26 * u) * s;
            p.ring(0, CORE, r, 1, u > 0.7 ? C[7] : C[5], 0.3 + u * 0.7);
          }
          ball(p, S, C, 0, CORE, (1 + 5 * k * k) * s, k);
          glyphRing(p, S, C, 0, 0, 22 * s, 0.25, t * 3, k * 0.8);
          if (S.arc) crackle(p, C, 0, CORE, Math.cos(t * 41) * 26 * s, CORE + Math.sin(t * 29) * 26 * s, Math.floor(t * 18), k);
        } else if (t < POP + 0.22) {
          const a = (t - POP) / 0.22;
          flare(p, 0, CORE, 30 * s * (1 - a) ** 1.4, 1 - a, C);
        }
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- impact
const impact = {
  id: "impact", name: "Strike", size: [136, 104], origin: [68, 64], duration: 0.8, loop: false, bg: "dark",
  desc: (S) => `A snappy ${S.adj} hit: a white frame, a star of ${S.matter}, a ring and ${S.motes} knocked loose.`,
  create(S, o, V) {
    const x = setup(S, o, V, { air: true }), { C, R } = x, s = V.s, rays = [];
    for (let i = 0; i < 7; i++) rays.push({ a: (i / 7) * TAU + R.range(-0.3, 0.3), L: R.range(18, 34) * s });
    let t = 0, fired = false;
    return {
      update(dt) {
        t += dt;
        if (!fired) { fired = true; x.flash(0, 0, 44 * s, 0.9, 0.3); x.burst(0, 0, 18, 90 * s, 240 * s, 0, TAU, 0.45); }
        x.update(dt);
      },
      drawBack(p) { x.drawBack(p); },
      draw(p) {
        if (t < 0.05) p.circle(0, 0, 10 * s, WHITE);
        const u = clamp(t / 0.22);
        if (u < 1) for (const r of rays) {
          const L0 = r.L * ease.outQuart(u) * 0.35, L1 = r.L * ease.outQuart(u);
          p.line(Math.cos(r.a) * L0, Math.sin(r.a) * L0, Math.cos(r.a) * L1, Math.sin(r.a) * L1, u < 0.4 ? WHITE : C[6], 1 - u);
        }
        const v = clamp(t / 0.35);
        if (v < 1) p.ring(0, 0, 6 * s + 26 * s * ease.outCubic(v), Math.max(1, 3 * s * (1 - v)), C[6], 1 - v);
        if (S.arc && t < 0.3) for (let j = 0; j < 3; j++) crackle(p, C, 0, 0, Math.cos(j * 2.1) * 30 * s, Math.sin(j * 2.1) * 30 * s, j + 9, 1 - t / 0.3);
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- wave
const wave = {
  id: "wave", name: "Wave", size: [264, 104], origin: [20, 88], duration: 1.9, loop: false, bg: "ground",
  desc: (S) => `A ${S.adj} wave of ${S.matter} rolling out along the floor, cresting as it goes and leaving ${S.motes} in its wake.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, TRAVEL = 1.1, L = 220 * s;
    let t = 0;
    const head = () => L * ease.outQuad(clamp(t / TRAVEL));
    const hgt = () => 34 * s * Math.sin(Math.PI * clamp(t / TRAVEL) ** 0.6) * (V.wild ? 1.2 : 1);
    return {
      update(dt) {
        t += dt;
        if (t < TRAVEL) {
          const hx = head();
          for (let j = 0; j < 2; j++) if (R.chance(0.7 * V.n)) x.spark(hx - R.range(0, 10), -R.range(0, hgt()), R.range(20, 90), -R.range(40, 120), R.range(0.3, 0.7));
          if (R.chance(0.5 * V.n)) x.puff(hx - R.range(4, 20), -2, R.range(-10, 10), -R.range(4, 12), R.range(3, 5) * s, R.range(0.5, 0.9));
          if (R.chance(0.2)) x.bit(hx, -hgt() * 0.6, R.range(20, 80), -R.range(60, 140));
        }
        x.update(dt);
      },
      drawBack(p) { x.drawBack(p); },
      draw(p) {
        if (t < TRAVEL + 0.2) {
          const hx = head(), h = hgt() * (1 - smooth(TRAVEL, TRAVEL + 0.2, t)), back = 40 * s;
          p.shade(hx - back, -h - 2, hx + 10 * s, 0, (px, py, out) => {
            const u = (px - (hx - back)) / (back + 10 * s);
            const crest = u < 0.8 ? Math.sin((u / 0.8) * Math.PI / 2) : 1 - (u - 0.8) / 0.2 * 1.1;
            const top = -h * crest;
            if (py < top || crest <= 0) return;
            const d = (py - top) / Math.max(1, -top);
            out.c = d < 0.12 ? WHITE : d < 0.35 ? C[7] : d < 0.65 ? C[6] : C[5];
            out.a = 0.55 + 0.45 * u; out.k = 0.1 * (1 - d); out.l = C[5];
          });
          p.glow(hx, -h * 0.5, 30 * s, C[5], 0.3);
        }
        // a lit trail along the floor that fades behind it
        for (let gx = 0; gx < head(); gx += 2) {
          const age = t - (TRAVEL * (1 - Math.sqrt(1 - Math.min(1, gx / L)))), a = 1 - clamp(age / 0.8);
          if (a > 0) p.dot(gx, 0, gx % 6 < 2 ? C[6] : C[5], a);
        }
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- summon
const summon = {
  id: "summon", name: "Summoning", size: [184, 168], origin: [92, 136], duration: 3.3, loop: false, bg: "ground",
  desc: (S) => `A summoning: a circle of ${S.matter} draws itself, its glyphs ignite, a shape knits together from ${S.motes}, holds, and breaks apart.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, R1 = 64 * s, DRAW = 0.7, LIGHT = 1.0, FORM = 1.6, BREAK = 2.4, SY = 0.3;
    let t = 0, broke = false;
    const shapeY = -52 * s;
    return {
      update(dt) {
        t += dt;
        if (t > LIGHT && t < FORM) {
          for (let j = 0; j < 2; j++) if (R.chance(0.8 * V.n)) {
            const a = R.range(0, TAU);
            x.spark(Math.cos(a) * R1, Math.sin(a) * R1 * SY, -Math.cos(a) * R1 * 1.6, shapeY * 2 - Math.sin(a) * R1 * SY, 0.45);
          }
        }
        if (t >= BREAK && !broke) { broke = true; x.flash(0, shapeY, 70 * s, 0.8, 0.5); x.burst(0, shapeY, 32, 60 * s, 200 * s, 0, TAU, 0.8); }
        if (t > FORM && t < BREAK) x.ambient(0, shapeY, 18 * s, 0.4);
        x.update(dt);
      },
      ring(p, keep) {
        const a = 1 - smooth(BREAK, BREAK + 0.6, t), drawn = clamp(t / DRAW) * TAU;
        if (a <= 0) return;
        const k = (g) => keep(g) && g <= drawn;
        ellipse(p, 0, 0, R1, R1 * SY, C[6], a, k);
        ellipse(p, 0, 0, R1 * 0.78, R1 * 0.78 * SY, C[5], a, k);
        if (t > DRAW) glyphRing(p, S, C, 0, 0, R1 * 0.89, SY, 0, a * clamp((t - DRAW) / 0.3), keep);
        // the pen drawing the circle
        if (t < DRAW) { const g = drawn % TAU; if (keep(g)) sparkle(p, Math.cos(g) * R1, Math.sin(g) * R1 * SY, 3, C[6], C[5], 0.5); }
      },
      drawBack(p) { this.ring(p, FAR); x.drawBack(p); },
      draw(p) {
        this.ring(p, NEAR);
        const a = 1 - smooth(BREAK, BREAK + 0.6, t);
        if (t > LIGHT && a > 0) {
          p.glow(0, -4, R1, C[4], 0.25 * a);
          // the column of light that the shape forms in
          const c = bump(t, LIGHT, LIGHT + 0.5);
          if (c > 0) for (let yy = 0; yy > shapeY * 2; yy -= 1) p.dot(0, yy, C[7], c * (1 + yy / (-shapeY * 2)));
          p.glowLine(0, 0, 0, shapeY * 2, 10 * s, C[5], 0.3 * c);
        }
        if (t > FORM - 0.3 && t < BREAK) {
          const f = clamp((t - FORM + 0.3) / 0.3), bob = Math.sin(t * 4) * 2 * s, r = 16 * s * ease.outBack(f), spin = t * 1.2;
          const pts = star(0, shapeY + bob, r, r * 0.45, 4 + (V.extra ? 2 : 0), spin);
          p.poly(pts, C[5]);
          for (let i = 0; i < pts.length; i++) { const q = pts[i], w = pts[(i + 1) % pts.length]; p.line(q[0], q[1], w[0], w[1], C[7]); }
          ball(p, S, C, 0, shapeY + bob, 4 * s * f, 0.5);
          p.glow(0, shapeY + bob, 30 * s, C[5], 0.35 * f);
        }
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- orbit
const orbit = {
  id: "orbit", name: "Orbit", size: [120, 112], origin: [60, 96], duration: 2.4, loop: true, bg: "ground",
  desc: (S) => `Shards of ${S.matter} orbiting the caster on a tilted ring, trailing ${S.motes}, the far ones passing behind.`,
  back(S, o, V, p, t) { this.shards(S, o, V, p, t, true); },
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s;
    this.shards(S, o, V, p, t, false);
    p.glow(0, -30 * s, 30 * s, C[4], 0.12);
  },
  shards(S, o, V, p, t, back) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, n = Math.round((V.extra ? 6 : 4) * Math.max(0.75, V.n)), CY = -30 * s, RX = 36 * s, RY = 11 * s;
    for (let i = 0; i < n; i++) {
      const g = ph * TAU * (V.wild ? 2 : 1) + (i / n) * TAU, behind = Math.sin(g) < 0;
      if (behind !== back) continue;
      const tilt = Math.cos(g) * 5 * s;
      const cx = Math.cos(g) * RX, cy = CY + Math.sin(g) * RY + tilt;
      // a short trail of afterimages
      for (let k = 6; k >= 1; k--) {
        const gk = g - k * 0.09, tx = Math.cos(gk) * RX, ty = CY + Math.sin(gk) * RY + Math.cos(gk) * 5 * s;
        p.dot(tx, ty, k < 3 ? C[6] : C[4], (1 - k / 7) * (behind ? 0.6 : 1));
      }
      const h = 15 * s, w = 7 * s, col = behind ? [C[0], C[1], C[2], C[3], C[4], C[5], C[5], C[6]] : C;
      crystal(p, cx, cy + h / 2, h, w, Math.sin(g) * 2 * s, col, { glint: ((ph * 2 + i / n) % 1) });
      if (!behind) p.glow(cx, cy, 8 * s, C[5], 0.3);
    }
    if (!back) ambient(p, S, C, t, this.duration, 0, CY, RX, RY * 2, 8 * V.n, 81);
  },
};

// ---------------------------------------------------------------------------------------------- sigil
const sigil = {
  id: "sigil", name: "Mark", size: [72, 88], origin: [36, 80], duration: 2, loop: true, bg: "dark",
  desc: (S) => `A ${S.adj} mark hanging over a target's head: a turning glyph of ${S.matter} that pulses and sheds ${S.motes}.`,
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, bob = Math.sin(ph * TAU) * 2 * s, CY = -56 * s + bob, pulse = 0.5 + 0.5 * Math.sin(ph * TAU * 2);
    const R0 = 12 * s, sq = Math.cos(ph * TAU);
    ellipse(p, 0, CY, R0 * Math.max(0.15, Math.abs(sq)), R0, C[6], 1);
    const n = { runes: 3, teeth: 6, spokes: 4, dots: 5 }[S.glyph] ?? 4;
    const pts = star(0, CY, R0 * 0.85, R0 * 0.35, n, -Math.PI / 2);
    for (let i = 0; i < pts.length; i++) { const q = pts[i], w = pts[(i + 1) % pts.length]; p.line(q[0] * Math.abs(sq) + 0, q[1], w[0] * Math.abs(sq), w[1], i % 2 ? C[7] : C[5]); }
    rune(p, 0, CY, 7 + (S.id.length % 5), WHITE);
    p.glow(0, CY, 18 * s, C[5], 0.35 + 0.2 * pulse);
    const flow = S.flow === "pull" || S.flow === "swirl" ? "fall" : S.flow;
    ambient(p, { ...S, flow }, C, t, this.duration, 0, CY + 10 * s, 10 * s, 14 * s, 6 * V.n, 91);
    // the faint light it throws down onto the head below
    p.glow(0, -6 * s, 12 * s, C[4], 0.12 + 0.08 * pulse);
  },
};

// ---------------------------------------------------------------------------------------------- crescent
const crescent = {
  id: "crescent", name: "Crescent", size: [168, 120], origin: [44, 84], duration: 0.8, loop: false, bg: "dark",
  desc: (S) => `A crescent slash of ${S.matter}: a fast arc that sweeps forward, a hot leading edge, ${S.motes} flicked off along it.`,
  create(S, o, V) {
    const x = setup(S, o, V, { air: true }), { C, R } = x, s = V.s, CX = 18 * s, CY = -26 * s, RAD = 50 * s, A0 = -2.1, A1 = 1.1, SWEEP = 0.16;
    let t = 0;
    const lead = () => A0 + (A1 - A0) * ease.outCubic(clamp(t / SWEEP));
    return {
      update(dt) {
        t += dt;
        if (t < SWEEP + 0.05) {
          const g = lead();
          for (let j = 0; j < 2; j++) if (R.chance(0.8 * V.n)) x.spark(CX + Math.cos(g) * RAD, CY + Math.sin(g) * RAD, -Math.sin(g) * 160 + R.range(-30, 30), Math.cos(g) * 160 + R.range(-30, 30), R.range(0.25, 0.5));
        }
        x.update(dt);
      },
      drawBack(p) { x.drawBack(p); },
      draw(p) {
        const g1 = lead(), fade = 1 - smooth(SWEEP, 0.55, t), tailLen = 1.8 * (1 - smooth(SWEEP, 0.5, t) * 0.7);
        if (fade > 0) {
          p.arc(CX, CY, RAD, (u) => (1 - u) * 9 * s * fade + 1, g1 - tailLen, g1, (u) => (u > 0.85 ? WHITE : u > 0.5 ? C[7] : u > 0.25 ? C[6] : C[4]), (u) => 0.3 + 0.7 * u);
          p.glowLine(CX + Math.cos(g1 - 0.5) * RAD, CY + Math.sin(g1 - 0.5) * RAD, CX + Math.cos(g1) * RAD, CY + Math.sin(g1) * RAD, 8 * s, C[5], 0.4 * fade);
        }
        if (S.arc && t < 0.3) crackle(p, C, CX + Math.cos(g1) * RAD, CY + Math.sin(g1) * RAD, CX + Math.cos(g1 - 1) * RAD, CY + Math.sin(g1 - 1) * RAD, Math.floor(t * 30), 1 - t / 0.3);
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- meteor
const meteor = {
  id: "meteor", name: "Meteor", size: [232, 208], origin: [140, 188], duration: 2.5, loop: false, bg: "ground",
  desc: (S) => `A meteor of ${S.matter} streaking down from the sky, trailing ${S.motes}, and slamming into the floor in a burst before ${S.fade}.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, FALL = 0.55, X0 = -120 * s, Y0 = -170 * s;
    let t = 0, hit = false;
    const pos = () => { const u = ease.inQuad(clamp(t / FALL)); return [X0 * (1 - u), Y0 * (1 - u)]; };
    return {
      update(dt) {
        t += dt;
        if (t < FALL) {
          const [mx, my] = pos();
          for (let j = 0; j < 2; j++) if (R.chance(0.8 * V.n)) x.spark(mx + R.range(-3, 3), my + R.range(-3, 3), R.range(-40, 10), R.range(-40, 10), R.range(0.3, 0.6));
          if (R.chance(0.5)) x.puff(mx, my, -30, -30, R.range(2.5, 4) * s, 0.6);
        }
        if (t >= FALL && !hit) {
          hit = true;
          x.flash(0, -8 * s, 90 * s, 1, 0.7);
          x.burst(0, -3, 40, 80 * s, 260 * s, -Math.PI, 0, 0.9);
          for (let j = 0; j < ctxN(V, 8); j++) x.puff(R.range(-20, 20) * s, -2, R.range(-50, 50), -R.range(6, 24), R.range(4, 7) * s, R.range(0.8, 1.4));
        }
        if (t > FALL && t < FALL + 1) x.ambient(0, -6, 30 * s, 0.3);
        x.update(dt);
      },
      drawBack(p) {
        if (t > FALL) {
          const u = clamp((t - FALL) / 0.6);
          if (u < 1) band(p, 0, 0, 10 * s + 60 * s * ease.outCubic(u), 0.22, Math.max(2, 8 * s * (1 - u)), 1 - u, C, FAR, u < 0.15);
        }
        x.drawBack(p);
      },
      draw(p) {
        if (t < FALL) {
          const [mx, my] = pos(), dx = -X0, dy = -Y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
          for (let d = 30 * s; d >= 0; d -= 0.5) {
            const w = 4 * s * (1 - d / (30 * s));
            for (let k = -w; k <= w; k += 1) p.dot(mx - ux * d - uy * k, my - uy * d + ux * k, d < 6 ? C[7] : d < 16 * s ? C[6] : C[4], 1.1 - d / (30 * s));
          }
          ball(p, S, C, mx, my, 5 * s, 1);
        }
        if (t > FALL) {
          const u = clamp((t - FALL) / 0.6);
          if (u < 1) band(p, 0, 0, 10 * s + 60 * s * ease.outCubic(u), 0.22, Math.max(2, 8 * s * (1 - u)), 1 - u, C, NEAR, u < 0.15);
          if (t < FALL + 0.2) flare(p, 0, -8 * s, 40 * s * (1 - (t - FALL) / 0.2), 1, C);
          const scorch = 1 - smooth(FALL + 0.5, FALL + 1.7, t);
          if (scorch > 0) { ellipse(p, 0, 0, 22 * s, 4 * s, C[3], scorch); p.glow(0, -2, 30 * s, C[4], 0.25 * scorch); }
        }
        x.drawFront(p);
      },
    };
  },
};
const ctxN = (V, k) => Math.max(1, Math.round(k * V.n));

// ---------------------------------------------------------------------------------------------- cloud
const cloud = {
  id: "cloud", name: "Cloud", size: [168, 152], origin: [84, 140], duration: 3, loop: true, bg: "ground",
  desc: (S) => `A ${S.adj} cloud hanging overhead, roiling and lit from inside, letting fall a steady sprinkle of ${S.motes}.`,
  draw(S, o, V, p, t) {
    const C = ramp8(o), s = V.s, ph = t / this.duration, CY = -104 * s;
    // falling motes first, so the cloud sits over their start
    cycle(t, this.duration, Math.round(22 * V.n), 101, (g) => g.range(0.6, 0.9), (age, life, r, i) => {
      const u = age / life, mx = r.range(-46, 46) * s, my = CY + 8 * s + u * u * (-CY - 8 * s) * 1.05;
      if (my > -1) return;
      mote(p, S, C, mx, my, 0, 140, 1 - u * 0.3, i);
    });
    const puffs = 9;
    for (let i = 0; i < puffs; i++) {
      const u = i / (puffs - 1), bx = (u - 0.5) * 92 * s, by = CY - Math.sin(u * Math.PI) * 10 * s + loopNoise(ph, 0.8, i) * 2 * s;
      const r = (12 + 8 * Math.sin(u * Math.PI)) * s * (1 + 0.08 * loopNoise(ph, 1, i + 20));
      // dark body, a lit rim along the top, a soft translucent edge
      p.disc(bx, by, r, (d, ang) => (Math.sin(ang) < -0.35 && d > 0.72 ? C[4] : Math.sin(ang) < 0 && d > 0.5 ? C[2] : C[1]), (d) => 0.62 * (1 - d * d * 0.7));
    }
    const flick = S.arc ? (rand(Math.floor(ph * 18), 3) > 0.8 ? 1 : 0) : 0.5 + 0.5 * Math.sin(ph * TAU * 3);
    p.glow(0, CY, 50 * s, C[5], 0.18 + 0.25 * flick * (S.arc ? 1.4 : 0.4));
    if (S.arc && flick) crackle(p, C, rand(Math.floor(ph * 18), 1) * 60 * s - 30 * s, CY + 8 * s, rand(Math.floor(ph * 18), 2) * 80 * s - 40 * s, -2, Math.floor(ph * 18), 1);
    p.glow(0, -2, 40 * s, C[4], 0.08);
  },
};

// ---------------------------------------------------------------------------------------------- dash
const dash = {
  id: "dash", name: "Dash", size: [248, 88], origin: [24, 66], duration: 1.1, loop: false, bg: "ground",
  desc: (S) => `A ${S.adj} dash: a streak of ${S.matter} tearing across the floor, speed lines peeling off and ${S.motes} hanging in the air behind.`,
  create(S, o, V) {
    const x = setup(S, o, V), { C, R } = x, s = V.s, RUN = 0.22, L = 200 * s, Y = -18 * s;
    let t = 0, ended = false;
    const hx = () => L * ease.outCubic(clamp(t / RUN));
    return {
      update(dt) {
        t += dt;
        if (t < RUN) {
          const h = hx();
          for (let j = 0; j < 3; j++) if (R.chance(0.8 * V.n)) x.spark(h - R.range(0, 30) * s, Y + R.range(-10, 10) * s, -R.range(20, 80), R.range(-20, 20), R.range(0.4, 0.8));
          if (R.chance(0.5)) x.puff(h - 10 * s, -2, -R.range(10, 40), -R.range(2, 8), R.range(2.5, 4) * s, 0.6);
        }
        if (t >= RUN && !ended) { ended = true; x.flash(L, Y, 40 * s, 0.7, 0.35); x.burst(L, Y, 14, 40 * s, 140 * s, 0, TAU, 0.5); }
        x.update(dt);
      },
      drawBack(p) { x.drawBack(p); },
      draw(p) {
        const h = hx(), fade = 1 - smooth(RUN, 0.75, t);
        if (fade > 0) {
          for (let k = 0; k < 5; k++) {
            const yy = Y + (k - 2) * 4 * s, start = h * (0.15 + 0.15 * Math.abs(k - 2)) + (1 - fade) * h * 0.6;
            p.line(start, yy, h, Y + (yy - Y) * 0.2, (u) => (u > 0.9 ? WHITE : u > 0.5 ? C[6] : C[4]), (u) => fade * (0.2 + 0.8 * u));
          }
          p.glowLine(h * 0.4, Y, h, Y, 8 * s, C[5], 0.35 * fade);
        }
        if (t < RUN) ball(p, S, C, h, Y, 4 * s, 1);
        x.drawFront(p);
      },
    };
  },
};

// ---------------------------------------------------------------------------------------------- flare
const starburst = {
  id: "flare", name: "Flare", size: [128, 128], origin: [64, 64], duration: 1.3, loop: false, bg: "dark",
  desc: (S) => `A ${S.adj} flare: a turning star of ${S.matter} blazes open, eight rays shoot out, and ${S.motes} twinkle as it dims.`,
  create(S, o, V) {
    const x = setup(S, o, V, { air: true }), { C, R } = x, s = V.s;
    let t = 0, fired = false;
    return {
      update(dt) {
        t += dt;
        if (!fired) { fired = true; x.flash(0, 0, 60 * s, 0.9, 0.7); x.burst(0, 0, 14, 30 * s, 100 * s, 0, TAU, 0.8); }
        if (t < 0.8) x.ambient(0, 0, 28 * s, 0.5);
        x.update(dt);
      },
      drawBack(p) { x.drawBack(p); },
      draw(p) {
        const u = clamp(t / 0.9), open = ease.outBack(clamp(t / 0.15)), k = 1 - u;
        if (k > 0) {
          flare(p, 0, 0, 34 * s * open * (0.6 + 0.4 * k), k, C);
          const pts = star(0, 0, 14 * s * open * k + 1, 6 * s * open * k + 0.5, V.extra ? 8 : 6, t * 3);
          for (let i = 0; i < pts.length; i++) { const q = pts[i], w = pts[(i + 1) % pts.length]; p.line(q[0], q[1], w[0], w[1], C[6], k + 0.2); }
          p.circle(0, 0, 3 * s * k + 0.5, WHITE);
          p.glow(0, 0, 30 * s, C[5], 0.4 * k);
          if (S.arc) for (let j = 0; j < 3; j++) crackle(p, C, 0, 0, Math.cos(j * 2.1 + t * 5) * 30 * s, Math.sin(j * 2.1 + t * 5) * 30 * s, j + Math.floor(t * 20) * 3, k);
        }
        x.drawFront(p);
      },
    };
  },
};

export const ARCH_B = [spikes, charge, impact, wave, summon, orbit, sigil, crescent, meteor, cloud, dash, starburst];
