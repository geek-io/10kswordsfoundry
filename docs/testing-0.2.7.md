# Testing 0.2.7

Local checks on 2026-10-29, outside Foundry:

- `node --test tests/*.test.mjs`: 239 tests passed, including `tests/social21.test.mjs` (leverage, Disposition, mob and material-shift modifiers; Disposition from 2d6; Social Defense with cancelling Attachments; ties to the defender; mob and written Demands; Persistence costs and invoked Attachments; the full initiate → defend → persist flow; Threatening with Physique; Disposition rolls).
- `node tools/check-package.mjs`: manifest, module cache versions (`?v=0.2.7`) and JavaScript syntax passed (fonts and compiled packs stubbed in a scratch copy).
- The 2.1 sheet template was rendered outside Foundry with the Change God's Mind button and Disposition selector.

Not yet verified in Foundry 14: Defend and Persistence clicked by a player who owns the target, NPC defense by the GM, and the Disposition field on existing actors.
