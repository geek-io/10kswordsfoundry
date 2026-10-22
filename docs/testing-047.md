# 0.1.47 testing

All 165 regression tests passed. Manifest, version, JSON and JavaScript checks passed. Foundry's embedded pack reader loaded all 60 effects. Release packaging verified all eight compiled packs. Remote deployment confirmed system 0.1.47 and PM2 online.

Foundry v14's Folder initializes `displayed` to false; its directory collection sets that flag when preparing the sidebar tree. It is not destination eligibility. The importer now enumerates world Item folders and validates their existence and document type without depending on that transient flag.

Regression coverage includes selecting a folder with displayed=false, nested folders with displayed=false, hierarchy and sibling ordering, root selection, and rejecting deleted or non-Item folders. The single-item, queued-item, and mass-import paths share this folder validation.

Interactive Foundry verification remains: open the importer before visiting the Items sidebar, select a nested Item folder, and import both single and multiple items into it.
