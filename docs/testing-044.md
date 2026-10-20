# 0.1.44 testing

- All 160 Node tests pass, including area dimensions, description defaults, target filtering, placement range, cancellation, and sheet restoration after errors.
- Manifest references, versions, JSON, and JavaScript syntax pass `npm run check`.
- All 282 Sect entries round-trip through the installed Foundry v14 data models. The existing headless Edge Special Ability editor/control check passes.
- Rebuilt all five complete compendiums (428 items); Foundry's server embedded reader reconstructs all 44 embedded effects.
- Native API inspection: Foundry v14 RegionLayer.placeRegion supports transient previews and preConfirm range checks; TokenLayer.setTargets replaces targets. Deprecated MeasuredTemplate APIs are not used.
- Interactive Foundry verification remains required: player casts Scathe, moves/cancels/confirms the preview, checks range rejection, targets allies/enemies, and resolves linked Defense. Check square, hex and gridless scenes, and user visibility permissions.
- Documented limits: horizontal centre inclusion, no wall occlusion or vertical-volume calculation, manual branch choice and self-centred positioning.
