# 0.1.42 Automated Animations checks

Local checks completed 2026-10-17. No live Foundry/Sequencer playback has been verified.

- Reviewed upstream `src/system-support/external.js`, `src/index.js`, `src/system-handlers/workflow-data.js`, generic chat support, and `module.json`. Uses the actual lower-case `AutomatedAnimations.playAnimation` export, not the deprecated `AutoAnimations` API.
- `npm test`: 150 tests passed. New tests cover source selection, unlinked actors, target snapshots, private messages, absent/disabled module, missing API, scene changes, caught API failures, and duplicate-workflow veto. The existing ability workflow test now verifies a successful use requests playback, cancellation does not, and failed chat restores costs without replaying.
- `npm run check`: versioned module graph, manifest references, pack paths, JSON, and JavaScript syntax passed.

## Live checks required

1. Enable a Foundry v14-compatible Automated Animations release, Sequencer, socketlib, and animation assets. Configure one weapon and one Magick via the item header controls.
2. Attack a selected target and cast the Magick. Verify one animation per use on both the initiating and observing clients.
3. Use an automatic Technick and a Special Ability; verify the parent item animation. Cancel a use and attempt an invalid/insufficient-resource use; verify no animation.
4. Confirm linked and unlinked token sources, no targets, multiple linked token copies, and a character with no scene token.
5. Test private/blind rolls, module disabled, and system integration setting disabled. They must not trigger this integration.
6. Confirm linked Defense still resolves independently and never repeats the attack animation.
