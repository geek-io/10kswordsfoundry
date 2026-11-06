# Testing 0.2.2

Local checks on 2026-10-28, outside Foundry:

- `node --test`: 209 tests passed, including `tests/items21-catalog.test.mjs` (catalog contents, 2.1 armor slots and two-handed mods, item weights, consumable recovery).
- `node tools/check-package.mjs`: manifest, module cache versions (`?v=0.2.2`) and JavaScript syntax passed (fonts and compiled packs stubbed in a scratch copy).

Not yet verified in Foundry 14: the five 2.1 item compendiums after `node tools/build-packs.mjs`, wearing several armor pieces, Use on consumables, and equipping Licenses under 2.1.
