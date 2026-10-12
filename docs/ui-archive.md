# UI and Archive — 0.1.22

## Reference review

Requested reference: https://gitdiagram.com/righthandofvecna/fvtt-ptr/

The GitDiagram page was inaccessible to the web reader. Its linked public repository was inspected over HTTP, including:

- https://github.com/righthandofvecna/fvtt-ptr
- https://github.com/righthandofvecna/fvtt-ptr/blob/release/src/module/apps/compendium-browser/index.js
- https://github.com/righthandofvecna/fvtt-ptr/blob/release/src/module/apps/compendium-browser/tabs/base.js
- https://github.com/righthandofvecna/fvtt-ptr/blob/release/static/templates/apps/compendium-browser/compendium-browser.hbs

Useful architectural patterns: index-first pack loading, source/type filters, cached index data, bounded result lists, and drag-and-drop document references. The Archive is an original, smaller ApplicationV2 implementation for this system. No PTR code, templates, game content, rule elements, external services, or dependencies were copied. No Git commands or repository mutations were performed.

## Interface

Character navigation keeps combat checks/resources in Overview, conditions/actions in State, equipment in Inventory, and identity/travel fields in Identity. Notes and Effects have separate sections. Weapon items split general details from weapon configuration. Navigation preserves fields in the form so hidden panels remain part of normal document submission.

Archive is available through the character sheet button or `game.system.api.openCompendium()`. It includes world Item documents visible at Observer permission and visible Item packs. Search matches all entered words against name/type/source. Filters combine with search. Results load 60 at a time. Refresh clears the local pack-index cache. Opening an entry rechecks document permission. Dragging uses Foundry's standard Item UUID payload and the receiving sheet's normal drop validation. The browser does not silently import or alter entries.

No new rulebook packs are supplied; an empty world with no Item packs has a clear empty state. A failed pack does not prevent other sources from loading. Full Item documents are fetched only when opened or resolved by a receiving sheet.

## Fonts and assets

Google Fonts Barlow (Regular and SemiBold) and Rajdhani (SemiBold) are bundled locally, with their SIL Open Font License texts in assets/fonts. Font source:

- https://github.com/google/fonts/tree/main/ofl/barlow
- https://github.com/google/fonts/tree/main/ofl/rajdhani

The project software license does not replace those font licenses. No remote font or style service is needed during play.

## Validation and boundaries

Automated tests cover library filtering, permission exclusion, index caching and partial-load failures. Existing game-mechanics tests remain unchanged and passing. Templates were compiled and representative Overview, Inventory and Archive layouts rendered in isolated headless Edge using locally installed Foundry CSS; previews use sample data, not a running Foundry world. Local screenshots are in tmp/ui. Runtime 14.367 confirmation is still needed for navigation with live document updates, editor focus, compendium drag-and-drop, and differing display sizes.

New system UI styles are scoped to this system's sheets/dialogs. No global Foundry sidebar restyling or PTR theme reproduction is included.
