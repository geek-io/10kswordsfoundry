# Testing 0.2.5

Local checks on 2026-10-29, outside Foundry:

- `node --test tests/*.test.mjs`: 228 tests passed, including `tests/swords21.test.mjs` (Sword defaults and Cut marks, the tip and the end, ascending Speed order with unset initiative last, interject placement and its limits, and Combat/Combatant classes that switch only under 2.1).
- `node tools/check-package.mjs`: manifest, module cache versions (`?v=0.2.5`) and JavaScript syntax passed (fonts and compiled packs stubbed in a scratch copy).
- Foundry 14's combat tracker template, sorting, initiative formula and context-menu hook were checked against the server's installed Foundry source.

Not yet verified in Foundry 14: the Sword panel in the live Combat tracker, Speed initiative and reset at each Cut, the Cut and end-of-Sword chat notes, and Interject from the combatant context menu.
