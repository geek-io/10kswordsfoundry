# Testing 0.2.1

Local checks on 2026-10-28, outside Foundry:

- `node --test`: 209 tests passed, including 36 new 2.1 tests (`tests/rules21.test.mjs`, `tests/roll21.test.mjs`, `tests/sects21-catalog.test.mjs`, `tests/items21-catalog.test.mjs`). The 173 existing tests pass unchanged.
- 2.1 Sect catalogs were extracted from the PDF text layer and checked against rendered pages; gear statblocks were transcribed by hand. The compiled LevelDB packs were not built here (`tools/build-packs.mjs` needs the local Foundry install).
- `node tools/check-package.mjs`: manifest, module cache versions (`?v=0.2.1`) and JavaScript syntax passed (fonts and compiled packs were stubbed in a scratch copy because they were not copied into the test environment).
- `templates/actor-21.hbs` and the 2.1 blocks in `templates/item.hbs` were parsed and rendered with an offline Handlebars subset and the system stylesheets, then inspected visually.

Not yet verified in Foundry 14:

- Rules version setting appears for the GM, re-renders open sheets, and defaults to 2.0.3.
- 2.0.3 sheets and rolls behave exactly as in 0.1.51 with the default setting.
- 2.1 sheet: editing Cores, Cultivations, lists (Attachments, Assets, Esoteric Cultivations), Part tracks, Morale track, conditions.
- KILL THE BUDDHA chat output, ammunition spending, Full Auto random Parts, FEROCIOUS extra dice.
- Magick Charges across several casts; Ardor burn on unleash.
- Armor coverage from equipped Fashion and Active Effects on 2.1 variables.
- 2.1 Sects, 2.1 Sect Gear, and the five 2.1 item compendiums load after `node tools/build-packs.mjs`; dragging Magicks onto a 2.1 sheet and casting them; wearing several armor pieces; Use on consumables.
