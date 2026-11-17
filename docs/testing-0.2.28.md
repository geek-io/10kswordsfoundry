# 0.2.28 testing and validation

Scope: **2.1 Ticks tracker** (plan step 7), replacing the Round / Cut tracker in 2.1 worlds. 2.0.3 untouched. No catalog or pack change.

## What changed, and how it was checked

- **First READY**: `firstReady21` = live Tick + d6 + Speed. Tested (d6 1 + Speed 3 = 4; joining at Tick 5).
- **Order**: `readyOrder21` sorts the earliest READY first, ties by name, unrolled last. Tested.
- **Act / Dash**: `actReady21`. Tested against the book's chase example (Kurasak: Tick 3, Recovery 3, Dash -> Tick 7; Raura: Tick 6, Recovery 5 -> Tick 11).
- **Gambits**: `parseGambit21`, `nextGambitReady21`. Tested with the book's Dagger Goblin list, and the fallback to Recovery when the list runs out.
- **Flash**: `flashReady21`. Tested: READY 6, Flash on Tick 5, Recovery 4 -> 9; a far READY stays; refused when already READY or unrolled.
- **Flurry**: `flurryStep21`, `flurryEndReady21`. Tested against the book (Speed 4, 3 Flurries, Tick 6 -> READY 16), the Motorics limit, a Flurry begun before the flurrier's READY, and one begun after pressing Act the same Tick.
- **Tick state**: `tickState21` (READY, Recovery, holding, unrolled, next READY). Tested.
- **Combat classes**: READY order, `1d6 + Speed (+ Tick)` formula and whole-Tick turn arrows under 2.1; the base behaviour under 2.0.3. Tested with stand-in classes.
- **Recovery modifier**: `ticks21` adds `system.speedBonus`. Tested.

## Tests

`node --test`: **269 pass / 9 fail** - no new failures. `tests/swords21.test.mjs` rewritten for Ticks (9 tests replacing 4).

## Assumptions and gaps recorded

- Flash: next READY = Flash Tick + Recovery, never earlier than the READY already held (the sentence is ambiguous).
- A combatant added mid-scene rolls first READY from the live Tick.
- A Gambit list that runs out falls back to Recovery.
- Not automated: Stun delaying a READY, Step movement, Aim, simultaneous-Act resolution, and marking an Act when a KILL THE BUDDHA is rolled (press Act, or Flurry).
- The old combat flag `round21` on existing encounters is ignored, not removed.

## Not verified here (pending at the table)

Nothing in this version has been run inside Foundry. To check:

- Rolling initiative gives d6 + Speed; the tracker lists the earliest READY first; the turn and round arrows both advance one Tick.
- The Ticks panel renders in the v14 Combat tracker and its buttons work for the GM and for a player who owns a combatant (players need permission to update their own combatant).
- Skip to Tick N jumps the round and posts the Tick message.
- Flash burns 2 Flame, and offers Scorch when Flame is short.
- Flurry on a KILL THE BUDDHA card updates the tracker; End Flurry sets the READY.
- Gambit READY Ticks context option appears for the GM.
- A 2.0.3 world's combat tracker is unchanged.
