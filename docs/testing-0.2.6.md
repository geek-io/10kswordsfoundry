# Testing 0.2.6

Local checks on 2026-10-29, outside Foundry:

- `node --test tests/*.test.mjs`: 234 tests passed, including `tests/exchange21.test.mjs` (tier timing and lapsing Openings, Counter rank and tier limits, Greater and Overwhelming bonuses and Counter-against-Counter, fusion and the one-extra-Perfect limit, Sidhi upgrades, late joiners, card parsing and rendering).
- `node tools/check-package.mjs`: manifest, module cache versions (`?v=0.2.6`) and JavaScript syntax passed (fonts and compiled packs stubbed in a scratch copy).

The manifest now sets `"socket": true`; Foundry must be restarted to open the system socket.

Not yet verified in Foundry 14: starting and joining exchanges from live cards, Respond joining automatically, player actions relayed through the GM socket, and Apply damage from a maneuver.
