// The magic generator: make(school, archetype, variant) gives an ordinary pixelfx effect module
// ({ meta, create } for one-shots, { meta, draw, drawBack } for loops). 25 schools x 24 archetypes x
// 5 variants = 3000 effects, each written out as a two-line file in src/fx/magic-<school>/ by
// tools/gen-magic.mjs so every pixelfx tool sees them.

import { SCHOOLS, SCHOOL } from "./schools.js";
import { ARCH_A } from "./arch-a.js";
import { ARCH_B } from "./arch-b.js";

export const ARCHETYPES = [...ARCH_A, ...ARCH_B];
export const ARCH = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a]));
export { SCHOOLS, SCHOOL };

// s: size, n: density, wild: more chaos, extra: an extra ring, glyph or wave, slow: duration factor
export const VARIANTS = [
  { id: "", label: "", s: 1, n: 1 },
  { id: "lesser", label: "Lesser", s: 0.75, n: 0.6 },
  { id: "greater", label: "Greater", s: 1.3, n: 1.4 },
  { id: "wild", label: "Wild", s: 1, n: 1.8, wild: true },
  { id: "ancient", label: "Ancient", s: 1.15, n: 1, extra: true, slow: 1.25 },
];

const round4 = (v) => Math.max(16, Math.ceil(v / 4) * 4);

/** The effect id for a combination, e.g. "magic-blood/blood-nova-greater". */
export function idFor(school, arch, variant) {
  const v = VARIANTS[variant];
  return `magic-${school}/${school}-${arch}${v.id ? "-" + v.id : ""}`;
}

/**
 * fit: { size, origin, duration } measured by the generator from a real render, so the canvas holds
 * every pixel and one-shots end exactly when the last particle is gone. Without it, the archetype's
 * own estimate is used.
 */
export function make(schoolId, archId, variant = 0, fit = null) {
  const S = SCHOOL[schoolId], A = ARCH[archId], V = VARIANTS[variant];
  if (!S || !A || !V) throw new Error(`unknown magic ${schoolId}/${archId}/${variant}`);
  const si = SCHOOLS.indexOf(S), ai = ARCHETYPES.indexOf(A);
  // loops keep their exact duration (their motion is built on it); one-shots stretch for the ancient form
  const duration = A.loop ? A.duration : +(A.duration * (V.slow ?? 1)).toFixed(2);
  const pad = V.wild ? 1.08 : 1;
  const meta = {
    name: `${V.label ? V.label + " " : ""}${S.name} ${A.name.toLowerCase()}`,
    desc: A.desc(S) + (V.wild ? " This one runs wild, with twice the particles." : V.extra ? " An ancient form, slower and more ornate." : V.label === "Lesser" ? " A smaller, quicker casting." : V.label === "Greater" ? " A bigger, denser casting." : ""),
    tags: ["magic", S.id, A.id, A.loop ? "loop" : "one-shot", ...(V.id ? [V.id] : [])],
    size: [round4(A.size[0] * V.s * pad), round4(A.size[1] * V.s * pad)],
    origin: [Math.round(A.origin[0] * V.s * pad), Math.round(A.origin[1] * V.s * pad)],
    duration,
    loop: A.loop,
    fps: 30,
    bg: A.bg,
    options: { palette: [...S.palette], seed: 1 + si * 31 + ai * 7 + variant * 1009 },
  };
  if (fit) {
    if (fit.size) meta.size = [...fit.size];
    if (fit.origin) meta.origin = [...fit.origin];
    if (fit.duration && !A.loop) meta.duration = fit.duration;
  }
  if (A.loop) {
    // wrapping t makes t = duration draw exactly the frame at 0, so the loop has no seam
    const D = A.duration;
    return {
      meta,
      draw: (p, t, o) => A.draw(S, o, V, p, t % D),
      drawBack: A.back ? (p, t, o) => A.back(S, o, V, p, t % D) : undefined,
    };
  }
  return {
    meta,
    create: (o) => {
      const impl = A.create(S, o, V), k = 1 / (V.slow ?? 1);
      if (k === 1) return impl;
      // the ancient form plays the same choreography slowed down
      return { update: (dt, oo) => impl.update(dt * k, oo), draw: (p) => impl.draw(p), drawBack: impl.drawBack ? (p) => impl.drawBack(p) : undefined };
    },
  };
}
