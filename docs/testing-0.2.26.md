# 0.2.26 testing and validation

Scope: **2.1 rulebook corrections, combat part 1.** The full 2.1 book (303 pp, Nov 16 2026) supersedes the earlier Google Docs; this patch corrects the rules that were already live. 2.0.3 untouched. No catalog or pack change.

## What changed, and how it was checked

- **Two-way KILL THE BUDDHA** (`resolveDefenseStrikes21`): margin = attacker Strikes - defender Strikes. Positive: the attacker wins as before. Negative: the Defender wins and deals their own weapon's damage to the attacker. Zero: a Tie, no damage. The Apply-damage button always targets the loser.
- **Block = Weapon Check**: the defender's first equipped melee weapon (else any equipped weapon, else Empty Hand) through `weaponProfile21`, including its GREAT/COLOSSAL/ARTIFACT dice. UNBLOCKABLE / ALMIGHTY attacks refuse Block.
- **Flurry goes to the Winner** (the Attacker on a Tie). The flag carries the Winner as the one who re-rolls; a winning Defender starts at 0 of their own Motorics.
- **Non-AUTO ranged**: the card states the one-effect rule (extra Strikes become damage).
- **Strikes is the default** `ktbEngine21`. Worlds that explicitly chose Openings keep it.
- **Speed** `ticksSpeed21(wit, mnd, modifier)` = max(1, 7 - max(Wits, Mind) + modifier). **Morale** maximum +1. **Stun** 6 seconds.

## Tests

`node --test`: **263 pass / 9 fail** - no new failures. `ticksSpeed21` cases rewritten for the new formula (Mind counts when higher, modifier added, floor 1); Morale expectations raised by 1 in `rules21.test.mjs` and `items21-catalog.test.mjs`. `node --check` passes on every script.

## Assumptions recorded

- Speed has no printed minimum; floored at 1.
- A Defender who wins by Dodging still deals damage with their readied weapon ("whoever wins ... even if the Defender wins").
- The SPD value of GREAT / COLOSSAL is referenced by Technicks but not printed in the mod list; not applied yet.

## Not verified here (pending at the table)

- Block rolls the right weapon pool; a winning Defender's damage applies to the attacker; the Flurry button belongs to the Winner and only their owner or a GM can press it.
- Existing worlds now open on the Strikes engine unless they had chosen Openings.
- Morale maximums rise by 1 on every 2.1 actor.

## Still to come

Weapon SPD modifiers and the Shield / COVER / WALL data, armor mods, the Ticks tracker (d6 + Speed, Recovery, Flash, Hold, Anticipate, Step = Basic Move / 2), Aim (max Motorics) and cover, and the Sect re-import from the book.
