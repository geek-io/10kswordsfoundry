# 0.2.32 testing and validation

Scope: **2.1 Sect Gear re-imported from the 303-page 2.1 rulebook** (plan step 10, part 2): `data/sect-gear-21.json` and its compiled pack. No script behaviour changed. The item catalogs are not part of this version. 2.0.3 untouched.

## How the import was checked

- All 41 parsed gear entries (book pp.224-303) were read in full: License, Stars, statblock (weight, category, grip, profile, material, mods, Soak glyphs, morale) and rules text.
- Each record of the earlier gear table was compared with its new entry. Text markers that no longer matched (Yajist Robes, Atardar's Fang, Five Thunder Japamala) were fixed; the generator fails if any parsed gear entry is left unused.
- The generated catalog was listed item by item (profile, grip, damage bonus, FEROCIOUS, Range, Rate, mods switched on; Soak by Part, Morale, max Flame, weight, effects) and compared with the previous catalog: 42 ids kept, 2 added, 2 removed, 2 new folders (Metomian), 1 folder gone (Sword Dialectician Armor & Fashion).
- Weapon mod keys are read from `WEAPON_MODS_21`, so every weapon carries the full current set, including COVER, WALL and UNBLOCKABLE.

## Tests

`node --test`: **278 pass / 9 fail** - no new failures (the same nine as 0.2.31). `tests/sects21-catalog.test.mjs`: both Sect catalogs must cite `Rules 2.1 (2.1 rulebook), p.224-303`; Sect Gear checks the exact mod key set, no ARTIFACT, the new Soak values, FEROCIOUS numbers, Personal Vajra, Benzaiten's Drum Range, the removed Sword Runner pieces and the kept COMP id.

## Assumptions and gaps recorded

- Soak glyph counts come from the PDF text layer. Readings for pieces without printed Parts, limb pieces, [SAGE BODY] Soak and the Adamantite Shell are listed in `docs/sect-catalog-2.1.md`.
- Item abilities (for example Dragoncharge, Umbra Body, Diplomatic Immunity) are rules text on the item, not automation. Only +movement, max Flame and Morale bonuses are applied.
- Removed items stay on characters and in worlds that already imported them.

## Not verified here (pending at the table)

- The rebuilt `2.1 Sect Gear` compendium opening in Foundry with its folders, and importing over existing entries.
- Equipping a re-imported piece and seeing the new Soak on the sheet.
