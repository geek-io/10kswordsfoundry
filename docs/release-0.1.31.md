# Version 0.1.31

## Delivered package

`dist/10kswordsfoundry-0.1.31.zip` contains the `10kswordsfoundry` system folder. Install its contents in the same systems location used for the previous release, replacing the system files while Foundry is stopped, then restart and reload the client. World data is not included in the ZIP. The manifest, package version, entry point, and module cache versions are 0.1.31; the rules remain 2.0.3.

## Validation

- 129 automated tests cover existing mechanics and new Trait parsing, World Being matching/inline Magicks, metadata queries, Job grant snapshots/application, Trait suppression, and blank-item creation/failure recovery.
- Package checks cover JSON, module references/cache versions, local assets, and JavaScript syntax.
- Installed Foundry 14.364 model checks cover all 13 import types, persistent preview failure/partial/success behavior, embedded World Being item validation and Carry accounting, and Job grant serialization. Document transport is simulated.
- Installed Foundry's real dice engine passes 108 fallback cases, positive pools, sheet Check actions, cancellation, injury penalties, and KO blocking.
- Headless Edge renders actual templates against installed Foundry CSS. All importer tabs scroll with their footer visible; six Cultivation images load; grouped Inventory, Job grants, and Gambit fields render.
- The ZIP is opened after creation and checked for corruption and its manifest version.

These are local checks, not a running-world test. Target Foundry version is 14.367; no remote deployment or Git actions were performed.

## Foundry QA checklist

1. Confirm the installed system reports 0.1.31. Open Item Importer and Mass Importer from both Items and Compendiums; confirm they select tabs in the same window.
2. Paste two numbered Traits, preview two names, and import into a chosen folder. Verify the window stays open. Try malformed JSON; correct it without reopening. Switch tabs and check drafts remain.
3. Paste a complete World Being block from pp.216–217. Check the stats, match notes, and placeholders in preview before importing. Confirm Microcosmic Orbit ignores matching names of other item types. Printed resources remain authoritative; imported equipment and Trait effects start inactive.
4. Hover the six Cultivations and character items. Confirm descriptions, symbol art, and labels appear.
5. Drag items to reorder within a section, close/reopen the sheet, then try Auto-sort. Use Add New in Inventory and confirm the owned blank item editor opens.
6. Create a Trait with a transferred Movement effect. Activate/deactivate it from Combat and confirm Movement changes without rewriting its base value.
7. Create Gambit and Salvage items. Confirm a Gambit can be added to a World Being and is rejected on a Wanderer; Salvage accounts for Carry.
8. Drop a Trait and Gear item into a Job. Apply the Job, then apply it again: grants must not duplicate, Carry must not be charged twice, and manually added Cultivation adjustments must remain.
9. Roll and expand results containing 4, 5, and 6. Confirm cyan Strikes, green Perfect Strikes, and unchanged totals.

## Boundaries and source pages

- Cultivation artwork and tooltip prose: supplied rulebook pp.26–27. Job starting loadouts: pp.40–43; grant replacement/idempotence follows the user's requested software behavior.
- Trait numbered headings: pp.114–122 and World Being Traits p.213. Gambits: p.214. World Being import layouts: pp.216–217.
- Missing/ambiguous matches become reviewable embedded placeholders. Exact printed details are kept in Description; no rule is inferred from an item name alone. Full stat-block text remains in Actor Notes, including movement qualifiers such as Flight.
- Existing world templates remain independent. Copied grants and World Being items retain their own descriptions/effects. Editing a source item does not retroactively change its copies.
- Trait Activate controls configured effects only. Descriptions alone do not implement arbitrary rules.
