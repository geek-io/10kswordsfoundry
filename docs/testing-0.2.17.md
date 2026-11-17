# 0.2.17 testing and validation

Scope: 2.1 combat-engine change — KILL THE BUDDHA Maneuver/Opening ranks lowered one tier. Code-only; no catalog or pack changes. 2.0.3 untouched.

## The change

`openingRank(value)` in `scripts/rules21.mjs`:

| die | before (0.2.16) | after (0.2.17) |
|-----|-----------------|----------------|
| 1   | Whiff | Whiff |
| 2–3 | Quick | **Whiff** |
| 4–5 | Solid | **Quick** |
| 6   | Perfect | **Solid** |
| Perfect | rolled on a 6 | **only by fusing two Solids** |

Deliberately unchanged (per the user): the Gambit sequence (`staticOpenings` = Quick→Quick→Solid→Perfect), fusion ratios and the one-extra-Perfect cap (`fusionOptions`), Sidhi upgrades, and Strikes (dice of 4+ — still the hit count for Shoot Demand and random hit locations; now the Quick and Solid Openings).

Also updated to match: the `diceHTML` colorizer and the "Resolving Openings" help text in `scripts/roll21.mjs`, the mapping notes in `docs/rules-basis-2.1.md`, and the two tests below.

## Tests

`node --test`: **249 pass / 13 fail**. The change introduced **no new failures** — the 13 are the same pre-existing failures carried since the 0.2.15 book regeneration (stale catalog counts/sources and two evolved-behavior fixtures; see testing-0.2.16.md).

Updated to the new mapping and passing:
- `tests/rules21.test.mjs` — `openings([6,6,5,5,2])` → `{whiff:1, quick:2, solid:2, perfect:0, strikes:4, total:4}`; `openings([5,4,3,2,1])` → `{whiff:3, quick:2, solid:0, perfect:0, strikes:2, total:2}`; `openingRank` over 1–6 → `[whiff, whiff, whiff, quick, quick, solid]`.
- `tests/roll21.test.mjs` — KILL THE BUDDHA on dice 6,6,5,4,2 now reports quick 2, solid 2, perfect 0, whiff 1 (Empty Hand damage 1, unchanged — damage keys off Strikes, not rank).

Verified no other site still encodes the old mapping: searched for `=== 6 ? "perfect"`, `>= 4 ? "solid"`, `>= 2 ? "quick"` across `scripts/`. The only rank-producing points are `openingRank` and the `diceHTML` colorizer, both changed; `openingDiceHTML` derives from `openingRank`.

## Not verified here

In-Foundry check that a live KILL THE BUDDHA roll shows the new ranks/colours and that fusion still produces Perfects. Pending at the table.
