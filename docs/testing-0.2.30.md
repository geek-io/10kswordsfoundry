# 0.2.30 testing and validation

Scope: **2.1 Armor Mods and profile damage** (plan step 9). 2.0.3 untouched. No catalog or pack change.

## What changed, and how it was checked

- **Armor Mods list**: the eight Mods of p.202; four carry +1 Soak. Tested.
- **Soak**: a Mourning Lacquer vest (Torso 3) and a Retributive Script suit (Torso 2, Head 2, Left Arm 2) give Torso 3 + 1 + 2 + 1, Left Arm 3, Head 2 (Retributive Script does not fit the Head); a Featherweight cap adds its own Head Soak only. An unequipped piece adds nothing; a Part the piece does not cover gets nothing. Tested through `derive21`.
- **Featherweight**: a 4 kg piece counts 2 kg. Tested.
- **Profile damage** with Physique 3, Motorics 2: Dagger 2, Saber 4, Sword 4 (PHYS) / 3 (MOT), Bludgeon 4, Cleaver 5, Polearm 4, Whip 3, Shield 3, Launcher 2, Bow 3, Crossbow 3, Handgun 3, Longgun 4, Empty Hand 3. Tested; the older Empty Hand test now expects PHYS.
- **Stored data**: `data/weapons-21.json` and `data/sect-gear-21.json` were scanned; Swords, Bludgeons and Polearms carry `damageBonus` 0 (one Sect sword has its own +1), so the correction is not doubled.

## Tests

`node --test`: **277 pass / 9 fail** - no new failures. Two new tests in `tests/rules21.test.mjs`.

## Assumptions and gaps recorded

- A garment's single Mod works on each Part it covers.
- A Mod on a piece that covers no Part adds no Soak.
- Breakaway has no effect (text cut off in the book).
- The on-Soak effects are card text; nothing is applied to the attacker.
- The damage card line is not covered by a unit test.

## Not verified here (pending at the table)

Nothing in this version has been run inside Foundry. To check:

- The Armor Mod select appears on armor and clothing item sheets and saves; existing pieces load with no Mod.
- A Part's Soak on the actor sheet rises by 1 with a Reinforced piece equipped.
- Applying damage that is partly soaked on a Mourning Lacquer Part shows the extra line on the damage card.
- Weapon damage on cards and the sheet shows the new figures (Sword, Bludgeon, Polearm, Empty Hand).
