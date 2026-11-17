# 0.2.16 testing and validation

Scope: finalize the 2.1 player-facing book ingestion (prepared as the unreleased 0.2.15) and add three extras (Names, Sapphire Star preview, the 2.1 World Beings pack). 2.0.3 is untouched. No deploy, no LevelDB build, no Git actions in this session.

## Completeness check — the book is fully ingested

Re-ran every 2.1 catalog generator against the attached player-facing PDF (`10_000_SWORDS_AGAINST_HEAVEN_2_1_PLAYER_FACING_SIDE-compressed.pdf`, 187 pages) and diffed the output against the committed `data/*-21.json` by item name and by a hash of each `system` object:

| Catalog | Items | Regenerated vs committed |
|---|---|---|
| options-21 (Cultivator Discovery) | 116 → 117 | identical, + Names |
| sects-21 | 189 → 190 | identical, + Sapphire Star preview |
| sect-gear-21 | 41 | identical |
| weapons-21 | 59 | identical |
| armor-21 | 26 | identical |
| accessories-21 | 12 | identical |
| ammunition-21 | 5 | identical |
| consumables-21 | 15 | identical |
| goods-21 (Market Goods) | 24 | identical |
| assets-21 | 36 | identical |
| barang-21 | 16 | identical |

Result: 0.2.15 was already a faithful, complete ingestion of this book — no new weapons, armor, items, Sects, jobs or options were missing from it.

## What was added in 0.2.16

- **Names** (book p.63): one reference item in the Cultivator Discovery pack holding the 2d6×2 syllable grid. `tools/options21/gen.py`.
- **Sapphire Star** (book p.266): a flavor-only preview Sect (folder + one `trait` item) appended in `tools/sects21/gen.py`. The book prints only the concept and the two cultivation names (Dual Cultivation, Sorcerous Diplomacy) — no Technicks, Magicks, License or Barang exist to add.
- **2.1 World Beings** pack (`data/worldbeings-21.json`, new `tools/worldbeings21/gen.py`): 16 Traits (3d6, pp.295–296), 11 Gambits (2d6, p.297), 9 Templates with full stat blocks (pp.298–299), and the Inhabitants (d66, p.285) and Material (2d6, p.289) discovery tables. 38 items, 4 folders. Transcribed from the pages; nothing invented.

Not added (GM-side or not printed): the Intercessor narrative/design-notes text, and the Sapphire Star mechanics (absent from the book).

## Local validation

- Replicated the `tools/build-packs.mjs` assertions over all 20 packs / 1072 items: every `_id` matches `^[a-z0-9]{16}$`, every item's `folder` resolves to a folder in the same pack, every item has a name, `system.source` and `system.description`, and item/folder ids are unique. **All pass.**
- Icons referenced by the new items (`assets/icons/trait.svg`, `assets/icons/magick.svg`) are present.
- Version bump: `system.json` and `package.json` at 0.2.16; 226 `?v=0.2.15` → `?v=0.2.16` cache-bust strings across 47 scripts; new `scripts/entry-0.2.16.mjs`; `worldbeings-21` pack registered; download/changelog URLs updated.

## Test suite — 249 pass / 13 fail (all 13 pre-existing)

`node --test`: 249 pass, 13 fail. The additions in this session are **net-zero** on the suite: the one failure the Sapphire Star preview introduced (the "one Barang per Sect" check counted the preview as a 17th Sect) was fixed by excluding preview Sects in `tests/sects21-catalog.test.mjs`.

The remaining **13 failures predate this session** — they come from the 0.2.15 book regeneration, which rebuilt the catalogs from the player-facing book but did not update the tests. They still assert the earlier 0.2.13 "playtest Sects" / "2.1 Alpha" state:

- **Catalog counts & sources** (tests expect the old numbers/attributions): 2.1 Sects "211 Technicks across 16 Sects" (now 189 across 16, sourced to the book), the `sects-21`/`sect-gear-21` `source` regex `(2.1 playtest Sects)`, 2.1 Assets "35 d36 Assets … (2.1 Alpha)" (now 36), the pp.64–69 item catalogs, weapons/armor/consumables profiles, and the Cores/Cultivations list.
- **Evolved behavior** (fixtures predate rules changes): Suppression Fire now requires the AUTO mod (the fixture Pistol lacks it); the Apply-damage card prefill shape changed.

None of these are regressions from 0.2.16; they are reconciliation debt the book ingestion left behind. Recommend updating these tests to the book's authoritative numbers/sources (the catalogs were verified to regenerate exactly from the book) before cutting a release.

## Not done here (needs a Foundry install / the device or server)

- **LevelDB compile.** `classic-level` can't be installed in this sandbox (registry unreachable), so the compiled packs were not built. Build them on the device (`node tools/build-packs.mjs`) or server (`sh /home/foundry/swords-build/build-21.sh --install`) before release.
- **`tools/check-package.mjs`.** It checks that referenced assets exist; binary fonts (`assets/fonts/*.ttf`) are not synced into this working copy, so it can't run here. Run it where the full assets are present.
- **In-Foundry verification.** Opening the new compendiums in a 2.1 world and confirming the Cultivator Discovery, Market Goods and World Beings entries drag in correctly remains pending.
