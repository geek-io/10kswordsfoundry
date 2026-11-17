# 0.2.31 testing and validation

Scope: **2.1 Sects re-imported from the 303-page 2.1 rulebook** (plan step 10, part 1): `data/sects-21.json`, `data/barang-21.json`, their compiled packs, and three small rule helpers. Sect Gear and the item catalogs are not part of this version. 2.0.3 untouched.

## How the import was checked

- The Sect parser was run over book pp.224-303: 286 raw entries, 20 Sects; after the build step 242 abilities and 41 gear entries, with no entry missing a License, Stars or a recognised Sect Cultivation.
- Every parsed entry was listed (Sect, page, title, type, Stars, NEEDS) and compared with the previous catalog: 4 names gone, 5 new outside the two new Sects, 26 NEEDS differences, 3 Star differences. Each difference was read against the book text; nine wrapped NEEDS rows and one missed title ("ON EARTH WE'RE BRIEFLY GORGEOUS technick", a lower-case type label) were parser faults and were fixed.
- Effects were scanned for layout damage: column separators, letter-spaced text, License or NEEDS rows inside an effect, stat blocks, Magicks without a Mantra. Findings: Samadhi Fire (decorative text, fixed); Pill Refinement, Elixir Crafting, Five Dragons Pill, Chakra Rod and Adamantine Noose print item blocks inside the entry (kept); seven Magicks have no Mantra in the book (kept as printed, as before).
- Ids: 211 of the previous 215 entries keep their id, including the Bidadari and Sapphire Star entries first imported under another id scheme.

## Tests

`node --test`: **278 pass / 9 fail** - no new failures. `tests/sects21-catalog.test.mjs` updated for 242 entries, 20 Sects, 67 Magicks, the new source label, the removed and added entries, alternative costs, Six Demon Cutting Sword, Samadhi Fire and the two new Sects; the Barang test now covers 20. `tests/alpha21.test.mjs`: 20 Sect Cultivations. One new test in `tests/rules21.test.mjs` for variable costs and the MELEE WEAPON / LAUNCHER requirements.

## Assumptions and gaps recorded

- Text is taken from the PDF's text layer; a 242-entry word-for-word proofread against the page images was not done. The checks above catch structure, not single wrong characters.
- The book prints item stat blocks inside some Technicks; they are not separate items.
- Sect Gear (41 entries) is parsed but not generated: the gear table still describes the earlier book.
- Removed entries stay on characters and in worlds that already imported them.

## Not verified here (pending at the table)

- The rebuilt `2.1 Sects` and `2.1 Barang` compendiums opening in Foundry with their folders, and importing over existing entries.
- A Luciferian or Metomian Technick passing its License check with the Sect Cultivation on the sheet.
