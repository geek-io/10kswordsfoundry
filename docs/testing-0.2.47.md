# 0.2.47 testing and validation

Scope: Cultivator Discovery gains a Starting Sidhi step and XP spending. 2.0.3 is untouched.

## Rules used

- Foundation per Stage: 50 / 150 / 300 / 500 / 750 / 1050 (pp.101, 108). Spent XP becomes Foundation (p.100).
- Sidhi Progression costs (p.100): Core Star 5 × new rating, Cultivation Star 3 × new rating (to 5), Asset 4 × new rating, Sect License 10 XP.
- On ascension: +1 open Meridian, +1 max Flame (p.101). Meridians start at 2, so 2 + Sidhi; max Flame 3 + Sidhi (p.90).

## Readings

- A custom XP amount starts at the highest Stage it reaches; nothing else is held back.
- The Tribulation and the ♄ burnt to ascend are treated as done for a character who starts higher (a note says so).
- Asset Stars from the Class go to the Assets in list order; the rest are bought with XP. A whole new Asset bought with XP costs 4 × its rating; raising one past the Class Stars costs 4 × each new rating.
- Each License needs an open Meridian, so a Sidhi 0 start keeps the two Sutra Licenses only.
- Core Stars bought at Discovery stop at five, like Cultivations.

## Tests

`node --test`: **333 pass / 0 fail**. New in `tests/discovery21.test.mjs`:
- Stage thresholds; custom XP landing on a Stage (75 → Sidhi 1, 150 → 2, 1050 → 6); the note for XP between Stages.
- XP costs for Cores, Cultivations, the Sect Cultivation, Assets and a third License (75 XP: 55 spent, 20 left); overspending is an issue; the Meridian limit; the actor gets Sidhi, Flame, raised ratings, XP left and Foundation.
- The window opens on Starting Sidhi; switching to custom XP keeps the Stage's XP; raising the Sect Cultivation offers higher Licenses, marked 10 XP.
- The agreement box is required.

## Not verified here (pending in Foundry)

- The new step and the XP lists on the Cores, Cultivations, Assets and Sect steps, in the live window.
- Creating a Sidhi 1+ character: Part HP, Flame and Meridians on the sheet.
