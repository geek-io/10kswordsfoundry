# 0.2.24 testing and validation

Scope: **combat overhaul, patch 3 of 6 — Finding an Opening.** The seven example maneuvers, each a contested Check. Additive: nothing in the KILL THE BUDDHA core or the Openings/exchange engine changes. Available on every 2.1 actor sheet, independent of the `ktbEngine21` setting. 2.0.3 untouched. No catalog or pack change.

## What changed, and how it was checked

### The maneuvers (data + pure resolution)
`scripts/rules21.mjs`: `MANEUVERS_21` holds the seven maneuvers (Onslaught, Volley, Analyze, Feint, Control, Throw, Disarm) with their opposed pools and rules text, plus `MANEUVER_KEYS`. `maneuverOutcome21(key, atkStrikes, defStrikes, {physique})` is pure: it computes the margin (leftover Strikes), whether the initiator won, which condition to apply to the target, the Control Part tier (a Limb; win by 2 the Torso; by 3 the Head), and the Throw distance (Physique + leftover Strikes).

Pools follow the manuscript: Onslaught = WEAPON vs Wits + Beast Shrine; Volley = ranged WEAPON vs Wits + Thews And Sinews; Analyze = Mind + Concrete Analysis vs Face + Beast Shrine; Feint = Wits + Beast Shrine (mirror); Control = Empty Hand vs Motorics + Beast Shrine; Throw / Disarm = Empty Hand vs Physique + Thews And Sinews.

### The flow (attacker roll, target Resist)
`scripts/roll21.mjs`: `findOpening21` opens a dialog (maneuver + weapon for Onslaught/Volley + adjustment + [AUTO] Ammo dice), rolls the initiator's pool — the WEAPON pool for Onslaught/Volley (Volley spends Ammo through `useWeapon`), else the maneuver's Core + Cultivation — and posts a card flagged `ktbManeuver21` with a Resist button per target. `resolveManeuver21` rolls the target's opposed pool, calls `maneuverOutcome21`, auto-applies Off-Balanced / Control to the target where it holds, and states the rest.

`scripts/chat21.mjs`: `chatTargets21` recognises `ktbManeuver21`; `runChatAction21` routes the `resist` action. `scripts/sheet21.mjs` + `templates/actor-21.hbs`: a **Find an Opening** button (beside KILL THE BUDDHA) and its `opening21` action.

### Tests
`tests/rules21.test.mjs`: the seven keys and their opposed pools (every `defCore` in CORES, every `defSkill` in CULTIVATIONS_21; weapon maneuvers carry no fixed `atkCore`; Analyze = Mind + Concrete Analysis; Control defends with Motorics; Throw defends with Thews And Sinews). `maneuverOutcome21`: Onslaught off-balances the loser either way (defender on a win, attacker on a loss, neither on a tie); Volley off-balances the target on a win only; Control's Part tier by margin (1→Limb, 2→Torso, 3→Head) and sets Control; Throw distance = Physique + leftover Strikes.

`node --test`: **261 pass / 9 fail** — no new failures (the 9 are the same pre-existing ones). `node --check` passes on `rules21.mjs`, `roll21.mjs`, `chat21.mjs`, `sheet21.mjs` and `entry-0.2.24.mjs`.

## Assumptions recorded
- **Empty Hand Check** (Control / Throw / Disarm initiator) is read as **Physique + Beast Shrine** — the Empty Hand weapon profile. The manuscript writes "EMPTY HAND CHECK" without naming a Core or Cultivation.
- **Ties** (equal Strikes) give the initiator no effect, except Onslaught, which is symmetric and off-balances no one on a tie.
- **Basic Move** (Volley's "half Basic Move") and the **+2 next KILL THE BUDDHA** (Analyze / Feint) are stated on the card, not tracked mechanically.

## Not verified here (pending at the table)
- Each maneuver posts its card with a Resist button; the target's Resist rolls the right opposed pool and the summary reads correctly.
- Off-Balanced and Control land on the right actor; Control names the Part tier matching the margin.
- Volley spends the right number of Ammo (1, plus [AUTO] dice).

## Still to come (combat overhaul patches 4–6)
4. Flurry.
5. Ticks initiative (replaces the Rounds/Cuts tracker).
6. Firefight / ranged / Fulmination / Aim / positioning rules.
