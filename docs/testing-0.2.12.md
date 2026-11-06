# Testing 0.2.12

Local checks on 2026-11-01, outside Foundry:

- `node --test tests/*.test.mjs`: 250 tests passed, including the new `tests/assets21.test.mjs` (Asset rows and Star raise cost, Barang ingest ejecting the previous one, legacy asset migration) and updated rules21/roll21/social21/catalog tests (Face/Heart/Flame labels and aliases, part HP = 3 + Physique, Openings 1 whiff / 2-3 quick / 4-5 solid / 6 perfect).
- `node tools/check-package.mjs` passed (`?v=0.2.12`).
- On the server: both changed templates (`actor-21.hbs`, `item.hbs`) compiled with Foundry's handlebars; every script passed `node --check`; `build-21.sh --install` built and read back all nine 2.1 packs, including `assets-21` (35) and `barang-21` (13); the test world migrated to 0.2.12 on restart.

Not yet verified in Foundry 14: the Asset and Barang item sheets, Ingest/Eject and "+ ✦ XP" on the 2.1 sheet, the one-time conversion of existing Asset rows into Asset items, the Flame "Set maximum" button, and KILL THE BUDDHA Opening dice on a live roll card.
