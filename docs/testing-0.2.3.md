# Testing 0.2.3

Local checks on 2026-10-29, outside Foundry:

- `node --test tests/*.test.mjs`: 216 tests passed, including `tests/targeting21.test.mjs` (Reach and range warnings, grid and straight-line distance, target collection, distance prefill, chat buttons, Apply damage defaults and ownership, Respond aimed back at the attacker, area Magick targets).
- `node tools/check-package.mjs`: manifest, module cache versions (`?v=0.2.3`) and JavaScript syntax passed (fonts and compiled packs stubbed in a scratch copy).

Not yet verified in Foundry 14: targeting tokens before a KILL THE BUDDHA, grid distance on hex and gridless scenes, the Respond and Apply damage buttons for a player and the GM, and placing an unleashed Magick's area.
