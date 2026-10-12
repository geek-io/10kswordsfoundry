# Publish a Foundry release manually

Repository: https://github.com/geek-io/10kswordsfoundry

## Prepared release

Version: **0.1.40**. GitHub release tag: **v0.1.40**.

Upload these files from `dist/` as assets of the same GitHub release:

- `system.json` — standalone Foundry manifest.
- `10kswordsfoundry-0.1.40.zip` — complete installable system.
- `SHA256SUMS.txt` — checksums for the two files above.

Use the supplied ZIP, not GitHub's automatically generated Source code archive. The supplied ZIP contains one `10kswordsfoundry/` folder with `system.json` and all runtime assets, including compiled compendiums, embedded effects, fonts, and the catalog data needed by repairs.

## Your publishing steps

1. Commit and push the prepared project yourself. Include `system.json`, `package.json`, `README.md`, `LICENSE`, and the `scripts`, `templates`, `styles`, `lang`, `assets`, `data`, `packs`, `docs`, `tools`, and `tests` directories. Generated release assets in `dist/` are intentionally ignored; attach them to the release instead.
2. In GitHub, create a release with tag **v0.1.40**, targeting the commit you intend to ship.
3. Attach all three files above. Add your release notes, then publish as a normal release and mark it as Latest. A draft or prerelease will not serve the intended latest-release install channel.
4. Confirm both URLs below download publicly without signing in. They will not exist until you publish the release.
5. In Foundry Setup → Game Systems → Install System, paste the manifest URL below. Existing manifest-installed copies will use that same stable URL for update checks.

Stable installation/update manifest:

`https://github.com/geek-io/10kswordsfoundry/releases/latest/download/system.json`

Pinned ZIP for this release:

`https://github.com/geek-io/10kswordsfoundry/releases/download/v0.1.40/10kswordsfoundry-0.1.40.zip`

An existing manually installed copy may need one manual replacement with this prepared package, or installation via the manifest URL, to acquire the update metadata. Back up world data before upgrading.

## Preparing later releases

Update the software version in `system.json` and `package.json`, the entry module, and runtime import cache versions. Update `download` and `changelog` to the new `vVERSION` release tag; keep `manifest` pointed at the stable latest URL.

Rebuild packs only when needed using `node tools/build-packs.mjs`. This currently requires the local Foundry installation used by the project’s build tools. Do not rebuild packs while Foundry has them open. Compiled packs are included in the repository so consumers do not need Foundry development tools.

Run `npm test` and `npm run check`, then `python tools/package.py --release` with an available Python 3 interpreter. This command writes matching manifest/ZIP/checksums without running Git, uploading files, or creating a release. It rejects stale release URLs. Rerun it after any change to shipped files.

Keep LevelDB numeric `.log`, `.ldb`, `CURRENT`, and `MANIFEST-*` files. They contain database data. Only `LOCK`, `LOG`, and `LOG.old` are omitted as runtime/diagnostic files.

Foundry describes manifest-based distribution in its [system development guide](https://foundryvtt.com/article/system-development/). Listing in Foundry’s public package browser is a separate submission; hosting a GitHub release does not automatically create that listing.
