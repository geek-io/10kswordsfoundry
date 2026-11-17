# 0.2.40 testing and validation

Scope: Core pictures on the 2.1 sheet, and hiding 2.0.3-only material while the world runs 2.1. 2.0.3 worlds are untouched. No compendium changed.

## Tests

`node --test`: **314 pass / 0 fail** (310 before; 4 new in `tests/rules-mode.test.mjs`).

- The eight packs labelled "Rules 2.0.3" in `system.json` are recognised and the twelve 2.1 packs are not; a world's own pack with the same label is left alone.
- The Compendium Browser's item list has no 2.0.3 catalog rows under 2.1 and all twenty packs under 2.0.3.
- Each Core maps to one of the six Cultivation pictures, and the sheet template shows it.
- The item sheet template tags the 2.0.3-only fieldsets and fields, keeps the 2.1 ones untagged, and the style sheet hides tagged elements only inside a sheet marked as 2.1 mode. The 2.1 character sheet no longer mentions the 2.0.3 Job, sheet or catalog.

## Other checks

- `node --check` on every script.
- The six pictures (`assets/cultivations/vio, grc, dia, sav, wrd, spi .png`) are present on the server and in the device folder.

## Assumptions recorded

- "2.0.3 stuff" was read as: the 2.0.3 compendiums, the 2.0.3-only parts of item sheets, and the 2.0.3 leftovers on the 2.1 character sheet. Fields that 2.1 still reads (Gear Slot, Ammo, Flame costs, Meridian cost, Area Template, Flame increase, mudra hands) stay visible.
- Hidden fields keep their stored values; they are hidden with a style rule, not removed.
- Grimoire Traits and the other 2.0.3 catalogs cannot be reached from the Compendium tab while 2.1 is on. Items already on characters are unaffected.

## Not verified here (pending at the table)

Nothing in 0.2.40 has been run inside Foundry. To check:

- The Core pictures load and the cards still fit three across.
- The Compendium tab hides the 2.0.3 packs under 2.1, and shows them again after switching the Rules version back (a reload may be needed).
- A 2.1 weapon, Technick, Magick, armor piece and consumable each open without the hidden sections, and still save.
- A 2.0.3 world shows every section as before.
