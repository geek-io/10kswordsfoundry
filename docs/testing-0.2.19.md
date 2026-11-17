# 0.2.19 testing and validation

Scope: the **Swords → Rounds** terminology rename in the 2.1 combat module, and the ingestion of the **On Movement / Lightness Technique / Projects** rules from the player-facing book (p.24). Code and docs only — no catalog or pack changes. 2.0.3 untouched.

## Swords → Rounds

The player-facing book renames the structured scene (a temporal anchor divided into Cuts) from a **Sword** to a **Round**. The sub-unit is still a **Cut** (one engine round = one Cut), and **Cut-In** is unchanged.

Renamed in `scripts/swords21.mjs` (file name retained to avoid an esmodule rename across the deploy; the concept is now "Round"):
- Exports/functions: `normalizeSword21 → normalizeRound21`, `swordState21 → roundState21` (its `(sword, round)` params are now `(round, cut)`), `registerSwords21 → registerRounds21`; the combat classes are `RoundsCombat` / `RoundsCombatant`; `setSword → setRound`, `swordPanel → roundPanel`.
- Combat flag: `sword21 → round21`. **A scene set in a combat before 0.2.19 must be re-set once** (the old flag is not migrated).
- Player-facing text: panel label "Round:", "Set Round" / "Change Round", chat "The Round ends", speaker alias "Round". Cut labels and "Cut-In now (2.1)" are unchanged.
- CSS: `.r21-sword* → .r21-round*` in `styles/rules21.css` (the `.r21-cut*` classes are unchanged); `scripts/system.mjs` imports and calls `registerRounds21`.

Left unchanged (not the scene concept): the game title "10,000 Swords Against Heaven", the **Sword Dialectician** Sect / Sword Dialectics Cultivation / Dialectical Swordmoth / Sword Runner Trousers, the **sword** weapon profile (SWORD/SABER…), and the Core flavor text in `cultivations.mjs` ("the swordsman", "the Sword of the Word").

## Movement / Lightness / Projects (p.24)

Documented in `docs/rules-basis-2.1.md` as rules references (no runtime change):
- **On Movement** — within a Round, move up to Basic Move (Physique + Motorics) per second; time-taking actions require standing still, and moving away cancels the maneuver.
- **Lightness Technique** — install ❂ to enter Lightness (wall-running, treading on falling leaves/swinging weapons, redirects, vault/slide, falling damage reduced by [SIDHI]); burn the ❂ to tech out of knockback/knockdown/juggle (halve knockback and/or stand to neutral). Candidate for a future 2.1 condition.
- **Projects (Extended Checks)** — Demand per Check, Duration per Check (minutes to years), Goal in Successful Checks (excess Strikes add as Successes; ≈8–10 / 11–15 / 16+). Not for long-term persuasion (that is CHANGE GOD'S MIND). Candidate for a future extended-check tracker.

## Tests

`node --test`: **253 pass / 9 fail**. The rename introduced **no new failures** — `tests/swords21.test.mjs` passes against the renamed `normalizeRound21` / `roundState21` exports, and the remaining 9 are the same pre-existing failures carried since the 0.2.15 book regeneration and the 0.2.17 combat change (Suppression Fire, the pp.64–69 item catalogs, the Asset list migration, the Cores/Cultivations map and the apply-damage card — none touch the Round/Cut module). `node --check` passes on `swords21.mjs` and `system.mjs`.

## Not verified here

In-Foundry check that the Combat-tracker panel shows "Round", the "Set Round" dialog and the Cut chat announcements read correctly, and that a fresh combat sets the `round21` flag. Pending at the table.
