# 0.2.20 testing and validation

Scope: a runtime pass on the opt-in 2.1 ruleset — Part HP, Ferocious, Dice So Nice bonus dice, temporary Core boosts, an Esoteric XP button and an ammo readout. Code only; no catalog or compendium-pack change. 2.0.3 untouched.

## What changed, and how it was checked

### 1. Part HP = 7 + Physique + Sidhi Stage (all Parts)
`scripts/rules21.mjs`: `BASE_PART_HP` 3 → 7; `partMaximum(key, {bonus, assets, physique, sidhi})` now adds the Sidhi Stage, and `derive21` passes `system.sidhi`. Mountain Frame / Anvil Head / HP bonus still stack; Disabled at 0 and Cleaved at negative half maximum are unchanged. Interpretation confirmed with the user: the new base applies to **every** Body Part, per "Each Body Part has [7 + PHYSIQUE + SIDHI STAGE] HP."
Tests (`tests/rules21.test.mjs`): `partMaximum` for torso/head/limbs at the new base, with Physique, Sidhi, Mountain Frame and Anvil Head; the derived-data torso HP; and the apply-damage integration in `tests/roll21.test.mjs` (12 damage − 2 Soak disables an arm at max 10).

### 2. Ferocious
`weaponProfile21` now grants **FEROCIOUS 1 from the GREAT modifier** (matching 2.0 `modifiers.mjs` and the GREAT rules text); a direct, higher FEROCIOUS rating on the weapon still wins. The roll path (`killTheBuddha` → `ferociousDice`) already rolled one exploding d6 per 6 up to the rating — the gap was that GREAT weapons carried a rating of 0, so no dice were rolled. Tests assert GREAT → ferocious 1, a direct rating is kept, GREAT does not lower a higher rating, and no rating/GREAT → 0.

### 3. Dice So Nice — bonus dice
Ferocious and Precise bonus dice are rolled as their own `Roll` objects (so the result HTML can show them); they now also animate through `game.dice3d.showForRoll(roll, user, true)`, guarded so it is a no-op when Dice So Nice is not installed. The **main pool already posts through `roll.toMessage`**, which is Dice So Nice's standard integration point, so it was already animated and per-player-themed.

### 4. Temporary Core increases from Technicks / Traits
The six Cores (`system.cores.phy … spi`) are now valid special-ability modifier keys: added to the `effectKey` choices in `scripts/data-models.mjs` and to the allow-list in `scripts/ability-effects.mjs` (`applyAbilityEffect`). Traits already reached the Cores through the standard Active-Effect dropdown (`effects.mjs` registers `system.cores.*`). A Technick's special ability can now apply a temporary +/- to a Core on its targets (yourself included, by targeting your own token). Test: a `system.cores.phy +2` ability creates the expected Active Effect; an unknown core key is rejected.

### 5. Experience-spend button for Esoteric Cultivations
`scripts/sheet21.mjs`: new `advanceEso21` action and a `+ XP` button on each Esoteric Cultivation row (`templates/actor-21.hbs`), mirroring the basic-Cultivation button. Cost is `advancementCost('cultivation', value)` = 3 × the new rating, capped at 5 Stars; it confirms, checks XP and writes `system.esoteric.<i>.value` and `system.xp`. The cost formula is already unit-tested via `advancementCost`; the action handler mirrors the tested `advance21`.

### 6. Ammo tracker
`scripts/ammunition.mjs`: new `ammoSummary21(actor, weapon)` returns the remaining ammo for a ranged weapon — a loaded magazine (`system.ammo`), a linked stack (`system.ammoId`), or the total of the matching family the actor carries (`system.ammoFamily`). Shown in the sheet weapon panel and the KILL THE BUDDHA weapon picker. New `tests/ammunition.test.mjs` covers all four paths (magazine, stack, family sum, none).

## Tests

`node --test`: **258 pass / 9 fail**. No new failures — the 9 are the same pre-existing failures carried since the 0.2.15 book regeneration and the 0.2.17 combat change (Suppression Fire, the pp.64–69 item catalogs, the Asset-list migration, the Cores/Cultivations map and the apply-damage card). `node --check` passes on every changed script.

## Not implemented in 0.2.20 (pending user mechanics)

- **Extra limbs (add / name / HP / soak).** The player can already not add limbs beyond the six fixed Parts. Building this needs the missing rule: how an extra limb is *hit* (the hit-location roll is a d6 mapped to the six Parts), whether extra limbs are hittable and share Soak, and whether they are added in pairs. Recorded rather than invented (per AGENTS.md).
- **"Automatic" health tracking.** HP, Soak, Disabled/Cleaved status and the Incapacitation Check ("most beings stop fighting once any Part is Disabled") already track and derive automatically; damage is applied from the KILL THE BUDDHA card. Which manual step should become automatic (one-click apply vs. the confirm dialog, token HP bars, auto-apply on hit) needs confirming before changing the damage flow.

## Not verified here

In-Foundry checks, pending at the table: a Part sheet showing 7 + Physique + Sidhi HP; a GREAT (or FEROCIOUS-rated) weapon rolling exploding dice in KILL THE BUDDHA with Dice So Nice animating the bonus dice; a Technick applying a temporary Core boost; the Esoteric `+ XP` button raising a rating and spending XP; and the ammo readout matching a weapon's magazine / stack / family.
