# Magic

3000 generated spell effects: 25 schools × 24 archetypes × 5 forms.
Each file in `src/fx/magic-<school>/` is two lines that call the generator in `src/fx/_magic/`; change an archetype or a school there and all its effects change with it.

Forms: **standard**, **lesser** (smaller, quicker), **greater** (bigger, denser), **wild** (twice the particles, more chaos), **ancient** (slower, an extra ring or glyph).

## Schools

| school | palette | particles | debris | volume | motion | glyphs |
|---|---|---|---|---|---|---|
| Blood | `#0e0306` `#2a0610` `#560c18` `#8a1220` `#c01e28` `#e8403a` `#ff7a68` `#ffc8b8` | mote | drip | vapour | fall | teeth |
| Wind | `#0c1a1c` `#173a3a` `#2a6060` `#4a9088` `#78c0b0` `#a8e2d0` `#d8fff0` `#ffffff` | streak | — | vapour | swirl | spokes |
| Flame | `#1f0b10` `#4a1118` `#8c1d1c` `#cc3a1a` `#f2701f` `#ffae35` `#ffe27a` `#fff8d6` | ember | — | fire | rise | runes |
| Frost | `#0c1430` `#162c5c` `#1f4f94` `#2f7fcc` `#58b4ec` `#9bdcff` `#d8f4ff` `#ffffff` | flake | shard | vapour | drift | spokes |
| Storm | `#0a0f2e` `#141f5a` `#2238a0` `#2f62e0` `#4f98ff` `#8cc8ff` `#d0efff` `#ffffff` | spark | — | — | jitter | runes |
| Earth | `#140e0a` `#2a1e14` `#47321e` `#69492a` `#8e6638` `#b88a52` `#dcb47c` `#f4e2c0` | grit | chunk | dust | fall | teeth |
| Verdant | `#0c1a0e` `#163418` `#225224` `#357530` `#4f9a3a` `#7cc048` `#b4e070` `#e4ffb0` | flake | shard | — | drift | dots |
| Tide | `#081830` `#0e2e5a` `#14508c` `#1c76bc` `#36a2e0` `#78ccf4` `#c4ecff` `#ffffff` | mote | drip | vapour | fall | dots |
| Void | `#050308` `#0f0a18` `#1c1230` `#2c1a4a` `#432468` `#5e3290` `#8048b8` `#c8a0f0` | mote | — | smoke | pull | runes |
| Holy | `#2a1c08` `#5a3e10` `#9a6c18` `#d8a428` `#ffd84a` `#fff09a` `#fffbe6` `#ffffff` | star | — | vapour | rise | spokes |
| Arcane | `#140a26` `#2b1252` `#481c88` `#6b2cc0` `#9a48ec` `#c684ff` `#ecc8ff` `#ffffff` | star | shard | vapour | swirl | runes |
| Necrotic | `#060a06` `#10200e` `#1c3a18` `#2e5e22` `#4e8a30` `#88c048` `#c8f088` `#f0ffe0` | mote | chunk | smoke | rise | teeth |
| Plague | `#0d1a0c` `#173a14` `#265e18` `#3f8a1e` `#6cb82a` `#a8e04a` `#d8f078` `#f4ffc0` | mote | drip | vapour | rise | dots |
| Chrono | `#1e1206` `#4a2c08` `#86520c` `#c48412` `#f0b424` `#ffe066` `#fff6c4` `#ffffff` | star | shard | — | swirl | spokes |
| Gravity | `#04060e` `#0a1028` `#121c48` `#1c2e6e` `#2a4a96` `#4c78c0` `#90b8e8` `#e0f0ff` | streak | chunk | dust | pull | dots |
| Crystal | `#1a0a1e` `#3a1240` `#6a2070` `#a83aa0` `#e060c0` `#ff9ad8` `#ffd8f0` `#ffffff` | star | shard | — | drift | spokes |
| Sonic | `#1a0516` `#3d0a33` `#701560` `#b0228f` `#f53cd1` `#ff86e6` `#ffd2f6` `#ffffff` | streak | — | — | jitter | dots |
| Astral | `#030414` `#080c30` `#101a5a` `#1e2e90` `#3c50c8` `#7a8cf0` `#c0caff` `#ffffff` | star | — | vapour | drift | runes |
| Sand | `#1c1610` `#33281c` `#4f3f2c` `#6e5a40` `#927a58` `#b89f78` `#dcc8a2` `#fff4dc` | grit | — | dust | swirl | teeth |
| Magma | `#14060a` `#380a10` `#6e1210` `#ac2410` `#e8501a` `#ff8c2a` `#ffd25a` `#fff4c0` | ember | chunk | smoke | rise | teeth |
| Spirit | `#041418` `#08303a` `#0c5260` `#108088` `#18b4b0` `#4ce8d8` `#b4fff0` `#ffffff` | mote | — | vapour | rise | dots |
| Iron | `#0c0e14` `#1c2230` `#2e3648` `#4a5468` `#6e7a90` `#9aa6ba` `#d0d8e6` `#ffffff` | spark | shard | smoke | fall | spokes |
| Prism | `#0e0a1a` `#2a1a4a` `#5a2a8a` `#3c8ad0` `#4ad0a0` `#f0d040` `#ff9ad0` `#ffffff` | star | shard | — | swirl | spokes |
| Rot | `#0c0a06` `#211a0e` `#3a2e16` `#58461e` `#7a6428` `#a08a3a` `#c8b45a` `#ece0a0` | mote | drip | smoke | drift | teeth |
| Lunar | `#0a0816` `#1a1430` `#2e2452` `#4a3c7c` `#7262a8` `#a494d4` `#d8ccf6` `#ffffff` | star | — | vapour | drift | runes |

## Archetypes

| archetype | id suffix | | size (standard) | what it does (blood) |
|---|---|---|---|---|
| Bolt | `-bolt` | loop 0.8s | 128×56 | A crimson bolt in flight: a bright head of blood with a crackling tail and droplets streaming off behind it. |
| Orb | `-orb` | loop 2.4s | 104×104 | A hovering orb of blood: it bobs and pulses while a ring of droplets circles it. |
| Nova | `-nova` | one-shot 2.3s | 232×150 | A crimson nova: blood gathers above the caster, flashes, and a ring of it races out across the floor before the last of it drips away. |
| Pillar | `-pillar` | one-shot 2.5s | 128×232 | A pillar of blood: a circle opens on the floor, a column of it roars up into the sky, holds, then narrows to a thread as the last of it drips away. |
| Circle | `-circle` | loop 4s | 168×84 | A crimson magic circle on the floor: two rings turning opposite ways, glyphs glowing in turn, droplets lifting off the rim. |
| Aura | `-aura` | loop 2s | 104×104 | A crimson aura to stand in: tongues of blood licking up round the feet, droplets lifting, a glow pooled on the floor. |
| Burst | `-burst` | one-shot 1.7s | 168×150 | A crimson burst in mid-air: a white flash, a shockring, droplets flung in every direction, then the last of it drips away. |
| Rain | `-rain` | one-shot 2.9s | 224×176 | A rain of blood: a sigil opens overhead and droplets pour down onto the floor, each landing with a splash, until the last of it drips away. |
| Beam | `-beam` | loop 1.2s | 232×64 | A sustained beam of blood: a flaring muzzle, a churning core streaming forward, a splash where it hits. |
| Vortex | `-vortex` | loop 2s | 144×140 | A crimson vortex: a funnel of blood spinning up from the floor, droplets whirled round it. |
| Ward | `-shield` | loop 3s | 136×120 | A crimson ward: a dome of blood over the caster, a lattice shimmering on its skin, a glint sweeping across it. |
| Rift | `-portal` | loop 2.4s | 120×136 | A standing rift of blood: a spiralling heart inside a crackling rim, droplets drawn into it. |
| Spikes | `-spikes` | one-shot 2.3s | 264×120 | A line of blood spikes bursting from the floor one after another, throwing droplets, then sinking back as the last of it drips away. |
| Charge | `-charge` | one-shot 1.7s | 128×128 | Charging up blood: droplets spiral in to a point above the hands, rings tighten round it, and it pops with a flash. |
| Strike | `-impact` | one-shot 0.8s | 136×104 | A snappy crimson hit: a white frame, a star of blood, a ring and droplets knocked loose. |
| Wave | `-wave` | one-shot 1.9s | 264×104 | A crimson wave of blood rolling out along the floor, cresting as it goes and leaving droplets in its wake. |
| Summoning | `-summon` | one-shot 3.3s | 184×168 | A summoning: a circle of blood draws itself, its glyphs ignite, a shape knits together from droplets, holds, and breaks apart. |
| Orbit | `-orbit` | loop 2.4s | 120×112 | Shards of blood orbiting the caster on a tilted ring, trailing droplets, the far ones passing behind. |
| Mark | `-sigil` | loop 2s | 72×88 | A crimson mark hanging over a target's head: a turning glyph of blood that pulses and sheds droplets. |
| Crescent | `-crescent` | one-shot 0.8s | 168×120 | A crescent slash of blood: a fast arc that sweeps forward, a hot leading edge, droplets flicked off along it. |
| Meteor | `-meteor` | one-shot 2.5s | 232×208 | A meteor of blood streaking down from the sky, trailing droplets, and slamming into the floor in a burst before the last of it drips away. |
| Cloud | `-cloud` | loop 3s | 168×152 | A crimson cloud hanging overhead, roiling and lit from inside, letting fall a steady sprinkle of droplets. |
| Dash | `-dash` | one-shot 1.1s | 248×88 | A crimson dash: a streak of blood tearing across the floor, speed lines peeling off and droplets hanging in the air behind. |
| Flare | `-flare` | one-shot 1.3s | 128×128 | A crimson flare: a turning star of blood blazes open, eight rays shoot out, and droplets twinkle as it dims. |

Ids look like `magic-<school>/<school>-<archetype>[-<form>]`, e.g. `magic-frost/frost-nova-greater`.

## Regenerating

From the repo root:

```sh
node tools/magic/gen.mjs .                  # rewrite all 3000 files (measures each one; about 5 minutes)
node tools/magic/gen.mjs . frost,storm      # just some schools
node tools/magic/check.mjs .                # every magic effect: renders, fits its canvas, ends empty, loops clean
node tools/magic/preview.mjs . out.png blood nova,orb "*" 8 2   # contact sheet: schools, archetypes, forms, frames, zoom
```

`gen.mjs` renders each effect once and writes its measured canvas, pivot and length into its file, so run it after any
change to `src/fx/_magic/`.

## Gallery

`magic-gallery/magic-gallery.html` browses all 3000 live and makes sprite sheets. It loads `magic-gallery/pfx.js`, a
bundle of `src/fx/index.js` and `src/core`; rebuild it after regenerating:

```sh
npx esbuild magic-gallery/entry.js --bundle --minify --format=iife --global-name=PFX --outfile=magic-gallery/pfx.js
```
