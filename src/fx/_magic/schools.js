// The 25 schools of magic. Each one is a palette plus the stuff its spells are made of:
//   spark  the particle a burst throws (spark mote streak flake star ember grit)
//   puff   its soft volume (vapour smoke dust fire, or null)
//   bit    its debris (shard chunk drip, or null)
//   flow   how its loose particles move (rise fall swirl pull drift jitter)
//   glyph  the marks in its circles (runes teeth spokes dots)
//   dark   true when its heart is a hole, not a light (void, gravity)
//   arc    true when it crackles with forked lightning
//   chunk  a ramp for shaded chunks (dark to bright), when bit is "chunk"
// plus words for names and descriptions.

export const SCHOOLS = [
  { id: "blood", name: "Blood", palette: ["#0e0306", "#2a0610", "#560c18", "#8a1220", "#c01e28", "#e8403a", "#ff7a68", "#ffc8b8"],
    spark: "mote", puff: "vapour", bit: "drip", flow: "fall", glyph: "teeth", adj: "crimson", matter: "blood", motes: "droplets", fade: "the last of it drips away" },
  { id: "wind", name: "Wind", palette: ["#0c1a1c", "#173a3a", "#2a6060", "#4a9088", "#78c0b0", "#a8e2d0", "#d8fff0", "#ffffff"],
    spark: "streak", puff: "vapour", bit: null, flow: "swirl", glyph: "spokes", adj: "gusting", matter: "air", motes: "wisps", fade: "the gust blows itself out" },
  { id: "flame", name: "Flame", palette: ["#1f0b10", "#4a1118", "#8c1d1c", "#cc3a1a", "#f2701f", "#ffae35", "#ffe27a", "#fff8d6"],
    spark: "ember", puff: "fire", bit: null, flow: "rise", glyph: "runes", adj: "blazing", matter: "fire", motes: "embers", fade: "it cools into smoke" },
  { id: "frost", name: "Frost", palette: ["#0c1430", "#162c5c", "#1f4f94", "#2f7fcc", "#58b4ec", "#9bdcff", "#d8f4ff", "#ffffff"],
    spark: "flake", puff: "vapour", bit: "shard", flow: "drift", glyph: "spokes", adj: "freezing", matter: "frost", motes: "snowflakes", fade: "the cold mists away" },
  { id: "storm", name: "Storm", palette: ["#0a0f2e", "#141f5a", "#2238a0", "#2f62e0", "#4f98ff", "#8cc8ff", "#d0efff", "#ffffff"],
    spark: "spark", puff: null, bit: null, flow: "jitter", glyph: "runes", arc: true, adj: "crackling", matter: "lightning", motes: "sparks", fade: "the charge crackles out" },
  { id: "earth", name: "Earth", palette: ["#140e0a", "#2a1e14", "#47321e", "#69492a", "#8e6638", "#b88a52", "#dcb47c", "#f4e2c0"],
    spark: "grit", puff: "dust", bit: "chunk", flow: "fall", glyph: "teeth", chunk: ["#1a120c", "#3e2c1c", "#6a4c2e", "#9a7448", "#c8a070"], adj: "rumbling", matter: "stone", motes: "pebbles", fade: "the dust settles" },
  { id: "verdant", name: "Verdant", palette: ["#0c1a0e", "#163418", "#225224", "#357530", "#4f9a3a", "#7cc048", "#b4e070", "#e4ffb0"],
    spark: "flake", puff: null, bit: "shard", flow: "drift", glyph: "dots", adj: "blooming", matter: "growth", motes: "leaves", fade: "the petals drift down" },
  { id: "tide", name: "Tide", palette: ["#081830", "#0e2e5a", "#14508c", "#1c76bc", "#36a2e0", "#78ccf4", "#c4ecff", "#ffffff"],
    spark: "mote", puff: "vapour", bit: "drip", flow: "fall", glyph: "dots", adj: "surging", matter: "water", motes: "droplets", fade: "the spray falls back" },
  { id: "void", name: "Void", palette: ["#050308", "#0f0a18", "#1c1230", "#2c1a4a", "#432468", "#5e3290", "#8048b8", "#c8a0f0"],
    spark: "mote", puff: "smoke", bit: null, flow: "pull", glyph: "runes", dark: true, adj: "hungering", matter: "darkness", motes: "motes of night", fade: "the dark swallows itself" },
  { id: "holy", name: "Holy", palette: ["#2a1c08", "#5a3e10", "#9a6c18", "#d8a428", "#ffd84a", "#fff09a", "#fffbe6", "#ffffff"],
    spark: "star", puff: "vapour", bit: null, flow: "rise", glyph: "spokes", adj: "radiant", matter: "light", motes: "motes of light", fade: "the glow lifts away" },
  { id: "arcane", name: "Arcane", palette: ["#140a26", "#2b1252", "#481c88", "#6b2cc0", "#9a48ec", "#c684ff", "#ecc8ff", "#ffffff"],
    spark: "star", puff: "vapour", bit: "shard", flow: "swirl", glyph: "runes", adj: "arcane", matter: "mana", motes: "glints", fade: "the runes go dark" },
  { id: "necrotic", name: "Necrotic", palette: ["#060a06", "#10200e", "#1c3a18", "#2e5e22", "#4e8a30", "#88c048", "#c8f088", "#f0ffe0"],
    spark: "mote", puff: "smoke", bit: "chunk", flow: "rise", glyph: "teeth", chunk: ["#1a1814", "#5e5648", "#8a806c", "#b8ad96", "#e4dcc8"], adj: "deathly", matter: "grave-light", motes: "wisps", fade: "the grave-light gutters" },
  { id: "plague", name: "Plague", palette: ["#0d1a0c", "#173a14", "#265e18", "#3f8a1e", "#6cb82a", "#a8e04a", "#d8f078", "#f4ffc0"],
    spark: "mote", puff: "vapour", bit: "drip", flow: "rise", glyph: "dots", adj: "festering", matter: "miasma", motes: "bubbles", fade: "the miasma thins" },
  { id: "chrono", name: "Chrono", palette: ["#1e1206", "#4a2c08", "#86520c", "#c48412", "#f0b424", "#ffe066", "#fff6c4", "#ffffff"],
    spark: "star", puff: null, bit: "shard", flow: "swirl", glyph: "spokes", adj: "ticking", matter: "time", motes: "seconds", fade: "time catches up" },
  { id: "gravity", name: "Gravity", palette: ["#04060e", "#0a1028", "#121c48", "#1c2e6e", "#2a4a96", "#4c78c0", "#90b8e8", "#e0f0ff"],
    spark: "streak", puff: "dust", bit: "chunk", flow: "pull", glyph: "dots", dark: true, chunk: ["#0e0e12", "#2c2c38", "#5c5c6b", "#7d7d8c", "#a4a4b2"], adj: "crushing", matter: "weight", motes: "debris", fade: "the pull lets go" },
  { id: "crystal", name: "Crystal", palette: ["#1a0a1e", "#3a1240", "#6a2070", "#a83aa0", "#e060c0", "#ff9ad8", "#ffd8f0", "#ffffff"],
    spark: "star", puff: null, bit: "shard", flow: "drift", glyph: "spokes", adj: "faceted", matter: "crystal", motes: "shards", fade: "the facets shatter to glitter" },
  { id: "sonic", name: "Sonic", palette: ["#1a0516", "#3d0a33", "#701560", "#b0228f", "#f53cd1", "#ff86e6", "#ffd2f6", "#ffffff"],
    spark: "streak", puff: null, bit: null, flow: "jitter", glyph: "dots", adj: "resonant", matter: "sound", motes: "pulses", fade: "the echo dies" },
  { id: "astral", name: "Astral", palette: ["#030414", "#080c30", "#101a5a", "#1e2e90", "#3c50c8", "#7a8cf0", "#c0caff", "#ffffff"],
    spark: "star", puff: "vapour", bit: null, flow: "drift", glyph: "runes", adj: "starlit", matter: "starlight", motes: "stars", fade: "the stars wink out" },
  { id: "sand", name: "Sand", palette: ["#1c1610", "#33281c", "#4f3f2c", "#6e5a40", "#927a58", "#b89f78", "#dcc8a2", "#fff4dc"],
    spark: "grit", puff: "dust", bit: null, flow: "swirl", glyph: "teeth", adj: "scouring", matter: "sand", motes: "grains", fade: "the sand pours away" },
  { id: "magma", name: "Magma", palette: ["#14060a", "#380a10", "#6e1210", "#ac2410", "#e8501a", "#ff8c2a", "#ffd25a", "#fff4c0"],
    spark: "ember", puff: "smoke", bit: "chunk", flow: "rise", glyph: "teeth", chunk: ["#14060a", "#3a1410", "#ac2410", "#ff8c2a", "#ffd25a"], adj: "molten", matter: "magma", motes: "cinders", fade: "it crusts over and smokes" },
  { id: "spirit", name: "Spirit", palette: ["#041418", "#08303a", "#0c5260", "#108088", "#18b4b0", "#4ce8d8", "#b4fff0", "#ffffff"],
    spark: "mote", puff: "vapour", bit: null, flow: "rise", glyph: "dots", adj: "spectral", matter: "spirit", motes: "wisps", fade: "the spirits drift off" },
  { id: "iron", name: "Iron", palette: ["#0c0e14", "#1c2230", "#2e3648", "#4a5468", "#6e7a90", "#9aa6ba", "#d0d8e6", "#ffffff"],
    spark: "spark", puff: "smoke", bit: "shard", flow: "fall", glyph: "spokes", adj: "forged", matter: "steel", motes: "sparks", fade: "the metal rings still" },
  { id: "prism", name: "Prism", palette: ["#0e0a1a", "#2a1a4a", "#5a2a8a", "#3c8ad0", "#4ad0a0", "#f0d040", "#ff9ad0", "#ffffff"],
    spark: "star", puff: null, bit: "shard", flow: "swirl", glyph: "spokes", adj: "prismatic", matter: "colour", motes: "glints", fade: "the colours split and fade" },
  { id: "rot", name: "Rot", palette: ["#0c0a06", "#211a0e", "#3a2e16", "#58461e", "#7a6428", "#a08a3a", "#c8b45a", "#ece0a0"],
    spark: "mote", puff: "smoke", bit: "drip", flow: "drift", glyph: "teeth", adj: "rotting", matter: "decay", motes: "flies", fade: "it sinks into mould" },
  { id: "lunar", name: "Lunar", palette: ["#0a0816", "#1a1430", "#2e2452", "#4a3c7c", "#7262a8", "#a494d4", "#d8ccf6", "#ffffff"],
    spark: "star", puff: "vapour", bit: null, flow: "drift", glyph: "runes", adj: "moonlit", matter: "moonlight", motes: "moonmotes", fade: "the moonlight pales" },
];

export const SCHOOL = Object.fromEntries(SCHOOLS.map((s) => [s.id, s]));
