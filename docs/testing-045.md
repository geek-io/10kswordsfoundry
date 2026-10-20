# 0.1.45 testing

- All 162 Node tests pass. Added coverage for recognized Hermetic Robes names, actual transferable effect records, preserving custom/disabled changes, equipment suppression, and Magick-only area increases.
- Manifest, JSON, versions and JavaScript syntax pass `npm run check`.
- Installed Foundry v14 Active Effect field application adds 1 to prepared `system.magickAreaBonus` while the stored base remains 0.
- Rules authority: p.135 increases area pattern size, not ranged weapon range or Magick casting distance. Only the area bonus is automated in this update; the robes' other benefits are outside this change.
- Interactive Foundry verification remains: GM reconnect, inspect existing robes' Effects tab, equip, cast Scathe with a 2 m radius inside 6 m, unequip and confirm radius returns to 1 m. Disable the effect and confirm it stays disabled across reloads.
