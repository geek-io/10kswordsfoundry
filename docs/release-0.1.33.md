# 0.1.33 testing checklist

Target: Foundry 14.367. Rules authority remains 2.0.3.

- On a Wanderer and a World Being (including a token sheet), right-click an owned item and choose Remove. Confirm its world/compendium original remains intact.
- Give a Technick and a Magick AP 2, Burn 1, Install 2. Confirm Internalize spends those costs once, changes to Release, and makes configured transferred effects active. Release frees 2 installed Ardor only.
- Give an ability Install 0 and Burn 1. Confirm Activate works without equipping first and spends its AP/Burn costs on each successful use.
- Verify insufficient AP/Ardor and occupied hands for Magick block use. Cancel a prompt and confirm no costs change.
- Remove an internalized ability and confirm its tracked installation is freed. Full Rest clears installations, deactivates the abilities, and retains equipped weapons/Fashion.
- Confirm Inventory and Combat both display AP, Burn, and Install costs.

Existing worlds: old equipped abilities have no per-item installation record. Review any previously entered Installed Ardor before internalizing them; the system cannot infer which ability owned a manually entered total. Full Rest clears old totals and starts fresh tracking. Release does not remove arbitrary narrative effects or effects previously applied to other Actors.

Local validation: 134 automated tests; installed Foundry 14.364 model fields and dice engines; simulated document transport for activation/removal/rest; isolated headless Edge template controls. No live server verification, deployment, or Git actions.
