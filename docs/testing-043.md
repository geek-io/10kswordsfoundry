# 0.1.43 local checks

2026-10-18. No interactive Foundry world verification is claimed.

- 156 Node tests passed, including new cases for Six Demon Cutting Sword’s weapon requirements, upgrade bonus, Crushing/Blaze and extra damage; Critical-only cancellation; stock repair preserving custom lists/costs; AP/Burn/ammo transactions and refund on failed chat; and installation/release without duplicate payment.
- Manifest/module graph, JSON, pack paths, and JavaScript syntax passed.
- All 282 Sect item systems, including every configured Special Ability field, round-trip through installed Foundry 14.364 data models. The deployment server reports 14.369; it remains a v14 target.
- All five LevelDB packs rebuilt; all 44 pre-existing Active Effects still load through the actual installed Foundry embedded-record reader.
- Headless Edge checks verify the populated heavy-weapon requirement and extra-Wound editor inputs, the Combat Special Ability button, and absence of a duplicate stock activation button. The editor screenshot was visually inspected and checkbox controls corrected. Existing generic Activate/Internalize/Release controls still pass their UI check.

## Live checks after deployment

1. Open a world as active GM and inspect a matching old Six Demon Cutting Sword import with an empty action list. Confirm it gains the action without changing current resources. Confirm a customized action list remains intact.
2. On a character with a Great/Colossal weapon, use the action from Combat. Check 2 AP / 1 Burn, selected weapon bonuses, Crushing Armor loss, Blaze suggestion on a surviving Strike, and extra Wounds from surviving 5s/6s. An ordinary weapon should not qualify.
3. Cancel the prompt and try insufficient AP or empty ammunition; no costs should remain spent.
4. Activate Glinting Light Sword Draw and use its release attack; confirm its installed Ardor returns once and it does not pay the activation twice.
5. Inspect rite/automatic/check actions and their manual-resolution notes; test variable Burn costs.
6. Check the migration on Wanderer, World Being, and unlinked token copies. A server restart alone does not execute the client-side GM repair.

## Deployment check

2026-10-18: ZIP SHA-256 matched on upload. The requested update script exited successfully; PM2 process 0 reported online and the installed manifest reported 0.1.43. Uploaded ZIP deleted. This confirms deployment/service state, not interactive world behavior or completion of the GM-side item repair.
