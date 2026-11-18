# 0.2.42 testing and validation

Scope: 2.1 maximum Flame changed from 2 + Sidhi Stage to 3 + Sidhi Stage (2.1 rulebook p.90). 2.0.3 is untouched. No compendium changed.

## Tests

`node --test`: **326 pass / 0 fail** (no new tests; two updated).

- `flameMaximum21` gives 3, 6, 9 at Sidhi 0, 3, 6; `derive21` reports 6 Flame and 5 Meridians at Sidhi 3.
- The manual 2.1 World Being form with Flame left at 0 gives 3 + Sidhi.

## Other checks

- `node --check` on every script.
- Every place that worked out the 2.1 Flame maximum now calls `flameMaximum21` (sheet hint, set-maximum button, Cultivator Discovery export, World Being import and manual form).

## Decisions recorded

- Stored Flame maxima on existing actors are not migrated. The maximum is one stored number shared with the 2.0.3 sheet, and some characters have it raised by hand or by gear. The sheet shows the difference and its button applies the new figure.
- Open Meridians stay at 2 + Sidhi Stage; only Flame was asked for.

## Not verified here (pending in Foundry)

Nothing in 0.2.42 has been run inside Foundry. To check:

- An existing 2.1 character at Sidhi 0 with 2 Flame shows the hint for 3 and the button raises it.
- A new Cultivator Discovery export starts with 3 Flame.
