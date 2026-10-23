# v0.1.51 — PDF importing and manual World Being creation

Includes the updates from v0.1.48 through v0.1.51:

- World Being names containing commas now import correctly, including in batches.
- Added a dedicated **World Being · Manual** tab with identity, destination folder, resources, movement, Siddhi, Magnetite, and Cultivation fields.
- Manual World Being creation accepts starting items dragged from the compendium browser or Items directory, preserving embedded Active Effects. Items start inactive to avoid adding bonuses twice to entered stats.
- Added PDF text extraction and English OCR to **Mass Importer** and **World Being · Text**. Select pages, review extracted text, then preview and import. Processing runs locally in the browser with bundled libraries.
- PDF reading supports up to 20 pages per operation and files up to 100 MB. Review OCR output for column order, names, numbers, and game symbols.
- Cleaned up importer layouts, matched the numbered step bubbles, and kept the Force OCR label next to its checkbox.

The installable ZIP includes all eight complete compendiums, folders, embedded effects, and supporting catalog data. For Foundry VTT 14.

Use the attached `system.json` manifest and `10kswordsfoundry-0.1.51.zip`, rather than GitHub's generated source archive.
