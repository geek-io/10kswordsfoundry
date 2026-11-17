# 0.2.35 testing and validation

Scope: **weapon Affinities, Material Grades, REACH, MORPH and VISCERAL** (plan step 12; 2.1 rulebook pp.194-195), and the regenerated `weapons-21` and `sect-gear-21` catalogs. 2.0.3 untouched.

## Tests

`node --test`: **289 pass / 0 fail**.

- New test "Affinities, Material Grades, REACH, VISCERAL and MORPH": Affinity damage with and without the Affinity's Core (Saber, Sword), every Grade, Grade with GREAT and a damage bonus, REACH on a Profile and on a range override, `visceralBonus21`, `morphOptions21` with messy input, `morphChanges21`.
- Catalog tests: Affinity, Grade and VISCERAL on the printed weapons; Personal Vajra REACH 3 = 4 m; MORPH lists of the Tonggong and Huojianqiang.
- Three tests that had been failing for several versions were stale rather than showing a fault, and were brought in line with the current rules: the Asset count (36), the Apply damage defaults (now include Ignores Soak and VISCERAL), and the Suppression Fire refusal message (AUTO).

## How the catalogs were checked

- Both generators were re-run; every weapon whose new fields are set was listed (10 in 2.1 Weapons, 9 in 2.1 Sect Gear) and compared with its printed card. Ids unchanged; the other five item catalogs are byte-identical to 0.2.33.

## Assumptions and gaps recorded

- An Affinity applies only when the roll uses its Core; the dialog does not pre-select it.
- Grade is read from the printed category ("Divine Dagger", "Prestige Refined Sword").
- The Morph button does not spend an Action on the Ticks tracker.
- VISCERAL checks the Part's Soak at the moment damage is applied, including Soak from Armor Mods.
- Weapons already on characters keep their old values until re-imported or edited.

## Not verified here (pending at the table)

- The new fields showing and saving on the item sheet.
- A RAZOR weapon rolled with MOT showing MOT damage on the card.
- The Morph button switching a Huojianqiang to a Polearm and back.
- The VISCERAL tick box arriving pre-ticked from the attack card.
