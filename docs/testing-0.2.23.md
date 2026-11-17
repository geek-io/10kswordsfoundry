# 0.2.23 testing and validation

Scope: **combat overhaul, patch 2 of 6 — the new KILL THE BUDDHA core.** A second combat engine, selectable per world. Additive: the existing Openings/exchange engine is the default and is untouched; it runs exactly as before unless the new setting is switched. 2.0.3 untouched. No catalog or pack change.

## What changed, and how it was checked

### The engine setting
`scripts/system.mjs` init registers a world setting **KILL THE BUDDHA engine (2.1)** (`ktbEngine21`, choices `openings`/`strikes`, default **openings**). Everything below only runs when a world sets it to Strikes.

### The attack (Strikes)
`scripts/roll21.mjs`: a `ktbEngine21()` helper reads the setting (defaulting to `openings` and never throwing). In `killTheBuddha`'s `perform()`, when the setting is `strikes`, the same dialog/pool/Ferocious/Precise produce the attacker's **Strikes** (dice >= 4), and the card is posted with a `ktbStrikes` flag and `strikesTargetsHTML` — a **Block** and **Dodge** button per targeted defender — instead of the Openings card. The old Openings path is otherwise untouched (the branch only fires on `strikes`).

### The defense (Block / Dodge) and resolution
`scripts/roll21.mjs`: new export `resolveDefenseStrikes21(data, kind, defender, token)`. Block rolls **Physique + Beast Shrine**; Dodge rolls **Motorics + Thews And Sinews**. The defender's Strikes cancel the attacker's one-for-one (`net = max(0, attackerStrikes - defStrikes)`). The resolution card shows the buy guide — **1** a Random/Controlled Part or Knockback 2 m, **2** the Torso, **3** a Limb, **4** the Head — and, when Strikes remain, an **Apply-damage** button on the defender that reuses patch 1's `damagePart` dialog (so the damage type is chosen there).

### Chat wiring
`scripts/chat21.mjs`: `chatTargets21` recognises the `ktbStrikes` flag, and `runChatAction21` routes the `block`/`dodge` actions to `resolveDefenseStrikes21`. The `respond` path (old engine) and the `damage` path (patch 1) are unchanged.

## Tests

`node --test`: **259 pass / 9 fail** — no new failures (the 9 are the same pre-existing ones). The Strikes engine is a chat-card flow (roll a card, a defender clicks Block/Dodge, apply), not a pure function, so it is validated at the table rather than in unit tests, as the 0.2.21 DSN work was. `node --check` passes on `roll21.mjs`, `chat21.mjs`, `system.mjs` and `entry-0.2.23.mjs`.

## Not verified here (pending at the table)

- With `ktbEngine21` = Strikes: a KILL THE BUDDHA posts the Strikes card with Block/Dodge per target; a defender's Block/Dodge rolls the right pool and cancels Strikes; leftover Strikes show the buy guide and apply damage (with type) to the chosen Part.
- With `ktbEngine21` = Openings (default): combat is byte-for-byte the old behaviour.

## Still to come (combat overhaul patches 3–6)

3. The 7 "Find an Opening" maneuvers (Onslaught, Volley, Analyze, Feint, Control, Throw, Disarm).
4. Flurry.
5. Ticks initiative (replaces the Rounds/Cuts tracker).
6. Firefight / ranged / Fulmination / Aim / positioning rules.
