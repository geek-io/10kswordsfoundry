# Installation and development

## Install through Foundry

After the release is published, use Foundry Setup → Game Systems → Install System with:

`https://github.com/geek-io/10kswordsfoundry/releases/latest/download/system.json`

This stable manifest lets Foundry find later published releases. Maintainers: see [manual publishing](publishing.md).

## Manual install or update

Extract the complete release ZIP into your Foundry User Data `Data/systems` folder. The result must be `Data/systems/10kswordsfoundry/system.json`, without another nested system folder. Restart Foundry and reload the browser. Do not replace world data. Updating just the manifest does not update the code. Check the installed version in Foundry Setup; versions are no longer displayed on character sheets.

No build or npm dependencies are needed to run the system. For a manual source install, include `system.json`, `README.md`, `LICENSE`, and the `scripts`, `templates`, `styles`, `lang`, `assets`, `data`, `packs`, and `docs` folders. Compiled packs and bundled assets are required.

## Local validation

Run `npm test` and `npm run check` with Node 22+. Optional checks against an installed Foundry distribution require Node 24.13+:

- `node tools/check-foundry-dice.mjs "<Foundry resources/app path>"`
- `node tools/check-foundry-resources.mjs "<Foundry resources/app path>"`

These use actual local Foundry components with UI/document-transport stand-ins, not a live remote browser. See [smoke-test.md](smoke-test.md) for user-confirmed results.

**No Git actions without the user's explicit request.**
