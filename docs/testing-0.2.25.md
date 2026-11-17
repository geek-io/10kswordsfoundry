# 0.2.25 testing and validation

Scope: **combat overhaul, patch 4 of 6 — Flurry.** Pressing the advantage after a KILL THE BUDDHA in the Strikes engine. Additive: the Openings/exchange engine and 2.0.3 are untouched. Flurry only appears on Strikes-engine resolution cards. No catalog or pack change.

## What changed, and how it was checked

### Pure helpers
`scripts/rules21.mjs`: `ticksSpeed21(wit)` = max(2, 10 − Wits) — the Ticks Speed, kept separate from the existing 2.0.x movement `speed` helper (which is Physique + Wits + … and is not the Ticks Speed). `flurryReadyDelay21(speed, flurries)` = speed + 2 × flurries — the number of Ticks after the acting Tick that the next READY lands.

### The Flurry button
`scripts/roll21.mjs`: `killTheBuddha` now takes a `flurry` count. On the Strikes card it shows "Flurry N of MOT" when flurrying, and stores `flurry`, the attacker's `attackerSpeed` (`ticksSpeed21`), `attackerMot`, and `weaponId` in the `ktbStrikes` flag. `resolveDefenseStrikes21` now always writes the `ktbStrikes` flag (so Defended cards carry the Flurry button too, not just damaging ones), displays the READY cost (`flurryReadyDelay21`), and renders a **Flurry — KILL THE BUDDHA again** button while `flurry < attackerMot`.

`scripts/chat21.mjs`: `runChatAction21` handles the `flurry` action before the target lookup, because Flurry acts as the *attacker*, not the card's defender. It resolves the attacker from the stored token/uuid, checks the attacker's ownership (GM or owner), and re-invokes `killTheBuddha` against the same defender with the same weapon and `flurry + 1`.

### Tests
`tests/rules21.test.mjs`: `ticksSpeed21` (10 − Wits, floored at 2, negatives treated as 0) and `flurryReadyDelay21` (Speed + 2 × flurries, including the manuscript's Speed 6 / 3 flurries → 12 example, and clamping). The chat flow itself (press → re-roll → resolve → press again) is table-validated, not unit-tested, consistent with the rest of the Strikes engine.

`node --test`: **263 pass / 9 fail** — no new failures (the 9 are the same pre-existing ones). `node --check` passes on `rules21.mjs`, `roll21.mjs`, `chat21.mjs` and `entry-0.2.25.mjs`.

## Not verified here (pending at the table)
- A Strikes resolution shows the Flurry button (both on a Defended card and a damaging one); clicking it re-rolls KILL THE BUDDHA against the same defender with the weapon pre-selected and the count incremented.
- The button disappears once `flurry` reaches Motorics, and the READY delay shown matches Speed + 2 × flurries.
- Only the attacker's owner or a GM can Flurry.

## Dependency on patch 5
The absolute next-READY Tick needs the Ticks tracker (patch 5). Until then, the card states the *delay* (Speed + 2 × flurries Ticks after the acting Tick) rather than the absolute Tick number.

## Still to come (combat overhaul patches 5–6)
5. Ticks initiative (replaces the Rounds/Cuts tracker; wires the Flurry READY cost to the live Tick).
6. Firefight / ranged / Fulmination / Aim / positioning rules.
