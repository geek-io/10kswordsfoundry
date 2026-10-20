# 0.1.41 Sect catalog checks

Local checks completed 2026-10-17. No live Foundry world or remote server was used. Installed Foundry components are 14.364; the deployment target remains 14.367.

- `npm test`: 146 tests passed, including five catalog tests for counts, unique IDs, folder hierarchy, reciprocal License links, printed rank exceptions, wrapped prerequisites, costs, Mudras, and browser filtering.
- `npm run check`: manifest, versioned module graph, referenced files, pack availability, and JavaScript syntax passed.
- `node tools/check-sect-models.mjs "C:/Program Files/Foundry Virtual Tabletop/resources/app"`: all 282 new item systems validate with the installed Foundry v14 fields and retain their structured values. Existing importer and resource harness checks also pass. This uses local models and transport stand-ins, not a live world.
- `node tools/build-packs.mjs`: all five packs built and read back (428 items total). The actual installed Foundry server embedded collection reader reconstructs all 44 existing Active Effects; the new Sect content adds no Active Effects.
- Source review: all 156 license cards on pp.127–185 were compared by title/type/rank and prerequisite text. Visual PDF inspection included pp.128, 173, and 185 for wrapped costs, rank exceptions, and duplicate headings.

- Release ZIP inspection: all five packs are present. All 282 new item records and all new folder records match the source catalogs exactly after extraction. Foundry’s embedded collection reader also loads all 44 existing effects from the extracted ZIP.

## Live checks still required

1. Install 0.1.41 on the v14.367 server and open each of the three new compendiums. Confirm Sect → Rank folders and item descriptions.
2. Import Scathe and its linked License; verify reciprocal links, numeric prerequisites, DIA vs SPI, +2 bonus, 2 AP / 1 Burn cost, and two-hand Mudra restriction.
3. Import Spirit Seeking Thread; verify 1 AP / 1 Burn / 1 Install and Release behavior.
4. Check that old/homebrew Technicks and Magicks with no rank still load and edit normally.
5. Review variable-cost and conditional entries with the GM before using them; those mechanics remain manual as documented in the catalog notes.
