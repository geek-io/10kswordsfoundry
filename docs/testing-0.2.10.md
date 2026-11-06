# Testing 0.2.10

Local checks on 2026-10-30, outside Foundry:

- `node --test tests/*.test.mjs` and `node tools/check-package.mjs` passed (`?v=0.2.10`).
- A mock 2.0.3 dice tooltip and a 2.1 roll card were rendered in Chromium: 6s show as bold white on magenta, distinct from blue 4/5 Strikes (2.0.3) and the blue Quick and gold Solid dice (2.1).

Not yet verified in Foundry 14: the colors inside Foundry's own dice tooltip in a live chat log.
