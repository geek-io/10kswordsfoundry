# 0.2.18 testing and validation

Scope: two new 2.1 Sects imported from `New_Sects.pdf` (the 2.1 player-facing book) — **Bidadari** (Sound Law, book pp.230–233) and **Sapphire Star** (Dual Cultivation, book pp.270–273). Catalog + runtime roster change only; 2.0.3 untouched.

## What was added

- **Bidadari** — 12 Technicks (Orchestral Revival, Sound Bubble Echo, Steel Song Meditation, Celestial Road Meter, Battle Beat Resonance, Singing Soul Method, High Melody, Let Sorrow Name the Moons, Miraculous Song of the Multitude, High Pacification, Akashic Resonant Note, Mountain Breaking Thunder), 2 Sect Gear (Apsara's Flowing Hagoromo fashion, Benzaiten's Drum weapon), 1 Barang (Golden Dawn Cricket).
- **Sapphire Star** — 12 Technicks and 2 Magicks (Sapphire Silk Lattice; On Earth We're Briefly Gorgeous), 1 Sect Gear (Plenipotentiary's Sapphire Vestments fashion/armor), 1 Barang (Sapphire Silkworm). Replaces the flavor-only Sapphire Star preview from 0.2.16 (the preview trait and its folder are removed).

## Catalog counts (committed `data/*.json`)

- `sects-21`: **215 items** (149 Technicks + 66 Magicks) across **18 Sects**, 104 folders (was 190 items / 16 Sects + preview).
- `sect-gear-21`: **44 items** (15 weapons, incl. the Benzaiten Drum; 22 armor/Fashion; 7 accessories).
- `barang-21`: **18 items** — one Barang per Sect.
- `scripts/rules21.mjs` `SECT_CULTIVATIONS_21`: **18** cultivations (added Sound Law, Dual Cultivation).

## How it was built

The sect build intermediates (`raw.json`/`parsed.json`) are not in the repo, so the two Sects are injected into the committed catalogs by **`tools/sects21/newsects.py`** (idempotent: it strips any prior copy and the old preview before re-adding), using the same item schema and `uid()` as `tools/sects21/gen.py`. The Barang are also added to `tools/assets21/gen.py`'s `BARANG` list for future full regens. The script also normalises every 2.1 weapon's `r21.mods` to the current 21-key `WEAPON_MODS_21` model (gen.py predates the `worn`/`almighty`/`thundering`/`toxic` additions).

## Tests

`node --test`: **253 pass / 9 fail**. Up from 249/9→ the four sect/gear catalog tests (`sects-21`/`sect-gear-21` id+source checks, the 18-Sect roster/count test, the Sect Gear data-model test) now pass. The change introduced **no new failures**; the remaining 9 are the same pre-existing failures carried since the 0.2.15 book regeneration and the 0.2.17 combat change (Suppression Fire, the pp.64–69 item catalogs, Asset list migration, the Cores/Cultivations map, and the apply-damage card — none touch Sects).

Alongside updating the sect counts/roster, three stale magick-field expectations in the sects-21 catalog test were aligned to the regenerated player-facing-book data: Adamantite Body (Charge 24, "Ritual: 5 days per Check"), Partition (Charge 2, no printed cast time) and Calamity (no printed cast time).

## Decisions and ambiguities

- **Sapphire Star cultivation.** Abilities are all licensed `DUAL`; recorded under the cultivation **Dual Cultivation** (the book: "The Sapphire Star cultivates Dual Cultivation"). The Sect's second listed road, **Sorcerous Diplomacy**, is named on the intro spread but prints no abilities yet — not added.
- **On Earth We're Briefly Gorgeous** is printed under a Technick heading but carries a Mantra, Mudra, Check and Charge Time, so it is filed as a **Magick** (same handling as GRAV elsewhere).
- **Plenipotentiary's Sapphire Vestments** is printed under a `ZHONGKUI PRESTIGE` statblock tag — a book layout error; it is a Sapphire Star / Dual item (License DUAL ✦✦✦✦✦) and filed under Sapphire Star. Its Soak is printed as a shield icon on Torso and both Arms with no number; recorded as **1 Soak each** — confirm at the table.
- **New weapon mods.** The Benzaiten Drum prints ARTIFACT, THUNDERING, PIERCING and LYRICAL; ARTIFACT/THUNDERING/PIERCING map to the 2.1 model, LYRICAL (also on the Hagoromo sleeves) is kept in the description/flags only. The Drum's 12 m sonic range is in its ability text (profile stays Bludgeon).
- Minor printed typos in the book ("attemptes", "succeds", "obfusciation", "infilitrates") are transcribed verbatim, as with the rest of the 2.1 catalog.

## Not verified here

LevelDB pack compile (needs Foundry/`classic-level`, absent in the cloud) — built on the server with `sh /home/foundry/swords-build/build-21.sh --install` at deploy, and the compiled packs copied back to the device. In-Foundry import/display of both Sects and their Gear/Barang is pending at the table.
