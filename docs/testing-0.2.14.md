# Testing 0.2.14

Reports on 2026-11-06 from the 0.1.51 / 2.0.3 table (world `10k-test` on the second Foundry instance). They were reproduced on a private copy of that world, run by a temporary Foundry 14.369 instance with headless Chromium 158 on the server, logged in as the GM and as a player.

| Report | Result on the copy | Cause | 0.2.14 |
| --- | --- | --- | --- |
| Free attacks for special attacks | Reproduced: a 0 AP, 0-Flame Special Ability warns "Ability costs could not be saved." | `Actor#update` returns nothing when no field changes; the system read that as a cancelled save | Fixed (`scripts/save-changes.mjs`; also the 2.1 Technick Flame save) |
| Arrow keys should move tokens | Reproduced: with a token selected the arrows pan the map | Foundry 14 default: WASD moves tokens, arrows pan | System keybindings move the selected token with the arrows; with nothing selected they still pan |
| Camera snaps back to the centre while moving | Reproduced: moving a token re-centres the view | The **Aeris Cinematic View** module (v13.0.2, verified for Foundry 13 only) pans the camera onto the owned tokens on every token update; Aeris Smooth Camera wraps `canvas.pan`. Foundry itself only pans when the moved token leaves the screen | Not a system change; disable Aeris Cinematic View (or set its options) |
| Job import put every description in one tab | Confirmed in the Jobs compendium: each Description held the whole book block, and each starting weapon copied it | Catalog generation in 0.1.46 | Catalog tidied; one-time repair of world and character copies; book-format Job import fills Cultivations |
| "'ownKeys' on proxy: trap result did not include 'Symbol(DataFieldOperatorValue)'" when editing a character sheet | Not reproduced: Cultivation, Movement, item name and Job edits on the GM's and the player's sheets saved first time with no error | Foundry 14 raises this when one of its `ForcedReplacement` update proxies is frozen or sealed. The system never freezes update data | Open: need the browser console stack (F12) from the next occurrence |
| "elevation must be finite" when right-clicking a character token | Not reproduced: right-click opens the Token HUD for the GM and the player without errors; all tokens in the world have elevation 0 | Foundry 14 rejects a token move whose elevation is not a number. The system never sets token elevation; several modules do (hover-distance, aedifs-tactical-grid, aeris-*) | Open: need the console stack |

Local checks:

- `node --test tests/*.test.mjs`: 262 tests passed, including the new `tests/fixes-0214.test.mjs` (Job text parsing, the tidied Jobs catalog, the one-time character repair, book-format Job import, saving an unchanged 0-cost ability, arrow-key movement falling through to panning).
- `tools/jobs/clean-descriptions.mjs` changed only `description` fields in `data/jobs.json` (11 Jobs, 13 starting items); Cultivations and grants are identical.

Not yet verified in a live session of the real world: the one-time Job repair notice, arrow-key movement on hex grids, and a free special attack posting its chat card.
