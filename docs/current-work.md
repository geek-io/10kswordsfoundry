# Current work status

Deployed **0.1.47** on 2026-10-21: importer destination folders no longer depend on transient sidebar visibility. All eight compendiums included. Uploaded checksum verified; `sh /exd/updatepush.sh` completed; PM2 0 online; installed version confirmed; uploaded ZIP deleted. Backup: `/exd/foundrydata/system-backups/10kswordsfoundry-20261021-121723`. No Git actions. See [testing](testing-047.md).

Deployed **0.1.46** on 2026-10-21: World Being Traits, Sect Fashion & Gear, and Jobs compendiums; 65 new entries and 35 Job grants. All eight packs ship in the release. Uploaded checksum verified; `sh /exd/updatepush.sh` completed; PM2 0 online; installed version 0.1.46 confirmed; uploaded ZIP deleted. Backup: `/exd/foundrydata/system-backups/10kswordsfoundry-20261021-120134`. No Git actions. Interactive gameplay verification remains pending. See [catalog details](expansion-catalogs.md) and [testing](testing-046.md).

Prepared **0.1.45** on 2026-10-20: Hermetic Robes' transferable Magick area effect, existing-item repair, and effect-aware area size calculation. See [testing](testing-045.md). Deployment succeeded: uploaded checksum verified, sh /exd/updatepush.sh completed, PM2 0 online, installed version 0.1.45 confirmed, uploaded ZIP deleted. Backup: /exd/foundrydata/system-backups/10kswordsfoundry-20261020-185932. No Git actions. Interactive verification remains pending.

Prepared **0.1.44** on 2026-10-20: native Foundry 14 area selection for Magicks, Technicks and Special Abilities, automatic targeting, placement range checks, and cancellation without resource spending. Includes all five complete compendiums. See [area targeting](area-targeting.md) and [testing](testing-044.md). Deployed successfully to 23.94.177.10 as foundry. The uploaded SHA-256 matched; sh /exd/updatepush.sh completed; PM2 process 0 is online with system version 0.1.44; the uploaded ZIP was deleted. Backup: /exd/foundrydata/system-backups/10kswordsfoundry-20261020-185429. Interactive Foundry area placement still requires gameplay verification. No Git actions were performed.

Deployed **0.1.43** to `23.94.177.10` as `foundry` on 2026-10-18. Includes 69 configured Special Abilities across 64 Sect Technicks, weapon-aware attacks, and a one-time GM repair for matching imports with empty action lists.

Release assets: `dist/system.json`, `dist/10kswordsfoundry-0.1.43.zip`, `dist/SHA256SUMS.txt`. See [Technick action notes](technick-actions.md) and [local checks/live checklist](testing-043.md).

Deployment verified the uploaded SHA-256, installed the system at `/exd/foundrydata/Data/systems/10kswordsfoundry/`, ran `sh /exd/updatepush.sh` successfully, checked PM2 process 0 online and manifest version 0.1.43, then deleted the uploaded ZIP. Backup: `/exd/foundrydata/system-backups/10kswordsfoundry-20261018-131019`.

No interactive world verification was performed. Open the world as active GM to run the client-side repair. No Git actions or GitHub publishing occurred.
