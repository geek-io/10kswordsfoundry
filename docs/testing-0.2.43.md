# 0.2.43 testing and validation

Scope: differences between the 303-page 2.1 rulebook and the 357-page "2.1 NO LORE" edition, applied to the 2.1 rules and catalogs. 2.0.3 is untouched.

## How the books were compared

- Text of pages 1–303, page by page, ignoring spacing: 290 pages identical, 13 differ (listed in `docs/rules-basis-2.1.md`, "Added in 0.2.43").
- 40 pages with little or no text layer, including the image-only weapon pages 196–197 and the market pages 186–191, were rendered from both PDFs and compared as images. Only chapter art on pages 108–109 and 130–131 differs.
- Pages 304–357 were read for anything that belongs in a catalog: none beyond the Bestiary.

## Tests

`node --test`: **326 pass / 0 fail**.

- GREAT: +1 damage, Speed modifier +2, no -1 to Checks. COLOSSAL: Speed modifier +3, no -1 to Checks. UNDODGEABLE is reported on the weapon profile.
- Catalog tests: every weapon's Mods map matches the Mod list (now with UNDODGEABLE); Kongo Helm effect is +2 Speed.

## Other checks

- `tools/book357/patch_no_lore.py` run twice: eleven changes the first time, none the second.
- The BEYOND HEAVEN page (p.356) now reads as two World Beings, with arms and legs on their own Parts and the halo and wings reported as needing hand tracking.
- All 65 Bestiary entries from 0.2.41 still read, plus these two (67).
- `node --check` on every script.

## Not verified here (pending in Foundry)

Nothing in 0.2.43 has been run inside Foundry. To check:

- A GREAT weapon shows 2 more Speed on the sheet and in the Ticks tracker than the same weapon without it, and its attack pool is no longer 1 lower.
- Dodge is refused against an UNDODGEABLE weapon.
- The Stun Check dialog opens at Demand 3.
- The Kongo Helm from the compendium adds 2 to the Speed modifier.
