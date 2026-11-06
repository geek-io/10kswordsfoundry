# Testing 0.2.11

Local checks on 2026-10-30, outside Foundry:

- `node --test tests/*.test.mjs`: all tests passed, including a new `tests/areas.test.mjs` case: a confirmed area is created as a Region visible to everyone, owned by the placing user, tagged with the running combat, and a warning appears when no GM can create it for a player.
- `node tools/check-package.mjs` passed (`?v=0.2.11`).
- Foundry 14's Region placement, visibility constants and Region-creation permission (players by default) were checked against the server's installed Foundry source.

Not yet verified in Foundry 14: the kept area on a live scene for a player and the GM, and removal when a combat ends.
