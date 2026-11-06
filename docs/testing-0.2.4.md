# Testing 0.2.4

Local checks on 2026-10-29, outside Foundry:

- `node --test tests/*.test.mjs`: 224 tests passed, including `tests/technick21.test.mjs` (Sect formulas, weapon requirements, License parsing and Stars, burning and installing Ardor, Release, blocking by License, weapon, Ardor and Sidhi Deviation, Deviation in Checks, Technick card targets).
- `node tools/check-package.mjs`: manifest, module cache versions (`?v=0.2.4`) and JavaScript syntax passed (fonts and compiled packs stubbed in a scratch copy).
- The 2.1 sheet template was rendered outside Foundry with sample Technicks (ready, installed and License-blocked rows) and the Sidhi Realm selector.

Not yet verified in Foundry 14: activating, installing and releasing Technicks from the 2.1 Sects compendium on a live sheet, area placement from a Technick, and the follow-up KILL THE BUDDHA.
