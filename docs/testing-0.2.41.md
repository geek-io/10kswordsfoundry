# 0.2.41 testing and validation

Scope: the importer under Rules 2.1 (item text, World Being text, World Being manual form, Item Importer form, PDF column reading). 2.0.3 import paths are unchanged. No compendium changed.

## Tests

`node --test`: **326 pass / 0 fail** (314 before; 12 new in `tests/import21.test.mjs`). The fixtures use the rulebook's layouts with made-up entries.

- Sect Technicks: multi-line titles, License, Needs (burn / install counts, weapon requirement), Sect, `sect21` flags.
- Magicks: Mantra, Mudra, Check and Charge Time; a missing CHECK is reported.
- Item cards: weapon Profile, Grip, Mods, FEROCIOUS, Affinity; an unknown Mod is reported and not invented; accessory with a d6 number and a trailing price line; armor Soak from glyphs; a one-Arm piece; a consumable's healing.
- Sect Gear: License joined to the card, Material Grade, `N/A` price reported.
- Assets (known and custom) and labelled records for a weapon, armor and a Technick.
- Page furniture before the first entry is not imported; ratings are named in the book's spelling.
- `parseImport` under 2.1 keeps names and only the system's own flags; pasted JSON cannot carry other flags or ownership; 2.0.3 parsing gives the same result as before.
- World Beings: three actors from a 0/3/5 block and one from a beast; Cores, Cultivations, Esoteric Cultivations, Part HP bonus, Soak with armor gates, Morale bonus, Flame, readied weapons with ammunition, NOETIC, License gates, Assets, Traits, Drops, custom Parts fitted onto the six; a single version can be chosen.
- World Beings take a matching Technick from the world, keeping its flags.
- The preview under Rules 2.1 uses the 2.1 reader and refuses a 2.0.3 block with a reason; the 2.0.3 preview is unchanged.
- Manual 2.1 World Being and typed Cultivations.
- Two-column PDF pages read left column first; one-column pages and the old line reader are unchanged.

## Checks against the rulebook PDF

Run outside Foundry, on text laid out by the new column reader from the PDF's word positions (a stand-in for pdf.js, which was not run):

- Bestiary pp.332–355: **65 World Beings** read with no errors (13 Folk at three Sidhi versions each, 26 beasts, dragons and INTRA-INTs). Printed Part HP matched the sheet's arithmetic on every Folk entry.
- Item and Sect pages pp.186–207, 211–218, 224–303: 446 entries read with no errors — 176 Technicks, 65 Magicks, 47 weapons, 35 armor pieces, 14 accessories, 73 gear, 6 salvage, 31 Assets (the 2.1 Sects catalog holds 242 Technicks and Magicks).
- Every item produced on those pages uses only fields the item data models define (compared with the fields in the 2.1 catalogs).
- The Item Importer form was built for all eleven 2.1 types against a stand-in for the data-field classes: 2.1 fields present, the 2.0.3-only ones absent.
- `node --check` on every changed script; the template's block tags are balanced.

## Known gaps seen in the PDF check

- Five of the 36 Assets are not picked up from PDF text because their code and Star range land in different columns. They are already in the 2.1 Assets compendium.
- Two names lost their first letter in the extracted text ("Oncealed Knife", "Ovenant"); this is in the PDF's text layer as read by the stand-in. Correct the name in the preview.
- Section headings do not travel across columns, so the "card kind differs from heading" note can be wrong on two-column pages.

## Not verified here (pending in Foundry)

Nothing in 0.2.41 has been run inside Foundry. To check:

- Reading rulebook pages with the real PDF reader, with Read columns separately on, gives text in the same order as the stand-in did. Opening the full 160 MB book works in the browser.
- Mass Importer under 2.1: preview and import a Sect page and a market page; the items open with the right fields.
- World Being · Text: import a Folk block at all three Sidhi versions and one beast; the sheet shows the printed HP, Soak, Morale and Flame, and the weapons roll.
- World Being · Manual and the Item Importer form under 2.1.
- A 2.0.3 world: all four importer tabs look and behave as in 0.2.40.
