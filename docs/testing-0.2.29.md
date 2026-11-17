# 0.2.29 testing and validation

Scope: **2.1 Firefight** (plan step 8) in the Strikes engine. Openings engine and 2.0.3 untouched. No catalog or pack change.

## What changed, and how it was checked

- **Aim**: `aimBonus21` caps at Motorics. Driven through `killTheBuddha` against the stand-in: 5 Ticks entered with Motorics 2 gives "Aim (2 Ticks): +2".
- **Height**: "+1 above the target" appears in the pool (MOT 2 + Hand-Eye 2 + Aim 2 + 1 = 7).
- **Full Cover**: the attack is refused before any ammunition is spent.
- **Out of range**: 45 m with a 30 m Handgun: d6 = 3 goes wide and the card carries 0 Strikes; d6 = 5 stays on target with all 4; at exactly 30 m no roll is made.
- **Cover**: Heavy Cover on a non-AUTO hit rolls one die on the defender's card (4 hits the cover, 5 gets through); a melee attack with the same data rolls none.
- **Halved pools**: an Ambushed defender and a defender holding Magick Charges both Block with 5 dice halved to 2; an ordinary defender is not halved.
- **Shield / mods**: the Shield profile (SPD 0, Light Cover, PHYS damage), COVER, WALL (Heavy), UNBLOCKABLE and ALMIGHTY (both unblockable). A lone target with a Shield preselects Light Cover in the dialog; an UNBLOCKABLE attack refuses a Block.

## Tests

`node --test`: **275 pass / 9 fail** - no new failures. New: `tests/firefight21.test.mjs` (5) and one test in `tests/rules21.test.mjs`. `tests/sects21-catalog.test.mjs` no longer requires catalog weapons to list every mod key (the three new mods default to false in the data model).

## Assumptions and gaps recorded

- Cover for an AUTO weapon rolls one die per leftover Strike, to be used in order per instance of damage bought.
- A halved pool rounds down in both cases; Ambush and Casting together halve once.
- "Casting" means holding one or more Magick Charges.
- Height +1 is offered for any KILL THE BUDDHA although the book files it under hand-to-hand.
- Aim Ticks are typed in; the Ticks tracker does not count them or stop movement.
- Reload and capacity are unchanged; ranged weapons as bludgeons in melee are not modelled.
- Profile damage figures on p.192 differ from the system (Sword, Bludgeon, Polearm + 1; Empty Hand = PHYS). Not changed here.

## Not verified here (pending at the table)

Nothing in this version has been run inside Foundry. To check:

- The KILL THE BUDDHA dialog shows the Aim field, the new cover choices and the height option when the engine is Strikes, and the old fields when it is Openings.
- The out-of-range and cover dice show on the cards (they are rolled without the 3D dice animation).
- The item sheet lists the Shield profile and the COVER, WALL and UNBLOCKABLE mods, and saving them works on existing weapons.
