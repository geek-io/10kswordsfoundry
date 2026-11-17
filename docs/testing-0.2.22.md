# 0.2.22 testing and validation

Scope: **combat overhaul, patch 1 of 6 — foundations.** The first slice of the 2.1 KILL THE BUDDHA rewrite (user docs captured in `claude/kill-the-buddha-2.1.md` and `claude/ticks-2.1.md`). Additive: the existing Openings/exchange combat engine and the Rounds/Cuts tracker are untouched this patch. 2.0.3 untouched. No catalog or pack change.

## What changed, and how it was checked

### Damage types (Cut / Crush / Pierce / Blast / True)
`scripts/rules21.mjs`: new `DAMAGE_TYPES_21`, `DAMAGE_TYPE_KEYS` and `damageOptions21(type)`. `applyPartDamage` gains `ignoreSoakUpTo` so a type can ignore *part* of the Soak (Pierce = 2), alongside the existing `ignoreSoak` (all) and `crushing`. Effects by type: Cut → Bleeding; Crush → −1 Part Soak after; Pierce → ignore up to 2 Soak; Blast → ignore all Soak and −1 Soak after; True → ignore all Soak.

`scripts/roll21.mjs`: the Apply-damage dialog (`damagePart`) gains a **Damage type (2.1)** dropdown. A chosen type overrides the crushing / ignore-Soak checkboxes: it feeds the Soak handling into `applyPartDamage`, adds its Soak reduction to the Part's `soakLost` (Crush / Blast), and sets the **Bleeding** condition when Cut deals HP damage. The damage chat card names the type.

Tests (`tests/rules21.test.mjs`): `DAMAGE_TYPE_KEYS` order; `damageOptions21` for all five types and an unknown type; and `applyPartDamage` against a Soak-4 Part — Pierce absorbs 2 (4 lands), plain absorbs 4 (2 lands), True absorbs 0 (6 lands). The existing apply-damage integration test (`tests/roll21.test.mjs`, arm Disabled) still passes with the dialog's new field (read defensively).

### Conditions
`CONDITIONS_21` gains **Off-Balanced** (−2 on the next KILL THE BUDDHA Check) and **Control** (a named Part grappled/pinned, cannot move). Because the actor `conditions21` schema is built from `Object.keys(CONDITIONS_21)`, both are now storable booleans on every 2.1 actor.

### Bleeding
The Bleeding condition text is rewritten to the 2.1 rule: a Bleeding Part loses **[10 − Physique] HP** after a minute and gives **−1 to physical Checks**; it does not stack on the same Part, but each Bleeding Part adds its −1.

### Already matched (no change)
- **Incapacitation Check** — `incapacitationCheck` already spends 1 Morale and rolls **Heart + Adamance vs Demand 2 + Disabled Parts**, exactly the new rule.
- **Healing** — `healingDays` already heals **1 per X days, X = current damage**, doubled when not sheltered. Matches the new rule (Disabled recovers only when fully healed; Cleaved needs thaumaturgy — GM-facing).

## Tests

`node --test`: **259 pass / 9 fail** — no new failures (the 9 are the same pre-existing ones). `node --check` passes on `rules21.mjs`, `roll21.mjs` and `entry-0.2.22.mjs`.

## Not verified here (pending at the table)

- The Apply-damage dialog's damage-type dropdown: each type soaks correctly, Crush/Blast lower the Part's Soak, and Cut sets Bleeding on the target.
- Off-Balanced and Control appear and clear as conditions on a 2.1 actor.

## Still to come (combat overhaul patches 2–6)

2. New KILL THE BUDDHA core (WEAPON vs Block/Dodge, Strikes cancel, buy 1/2/3/4 effects) behind a world setting, alongside the existing Openings/exchange engine.
3. The 7 "Find an Opening" maneuvers (Onslaught, Volley, Analyze, Feint, Control, Throw, Disarm).
4. Flurry.
5. Ticks initiative (replaces the Rounds/Cuts tracker).
6. Firefight / ranged / Fulmination / Aim / positioning rules.
