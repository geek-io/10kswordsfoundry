# 0.2.39 testing and validation

Scope: wider Cultivation boxes on the 2.1 sheet, the Spend Strikes assistant (p.117), Stun and Morale Check buttons after Head damage (p.121), and the merged Combat & Gear tab. 2.0.3 untouched. No compendium changed.

## Tests

`node --test`: **310 pass / 0 fail** (307 before; 3 new in `tests/roll21.test.mjs`).

- Strike costs and choices: what 0, 1, 2, 3 and 4 Strikes can buy; two HITs for 2 Strikes; unspent Strikes counted; overspending, an effect that costs too much and an empty choice are refused; the Bow example (3 Strikes, one effect, +2 damage); a second effect is refused for a ranged weapon without AUTO.
- Spend Strikes against a stand-in character: a random HIT (d6 = 4, Left Arm) and a BODY HIT each apply 3 damage and appear on one card with the Strikes left over; the single-effect case applies 3 + 2; a refused plan changes nothing.
- Head damage: a HEAD HIT bought from the card, and 1 damage applied to the Head from the sheet's dialog, each produce a card with the two buttons and the character's id; Torso damage does not. The Stun button rolls Heart + Stillness and sets Stunned on a failure; the Morale button spends 1 Morale and rolls; a player who does not own the character is refused.
- The sheet template shows Stun Check and Morale Check without waiting for a Disabled Part, has no Inventory panel left, and puts Gear Slots under Combat & Gear.

## Other checks

- `node --check` on every script.
- The Cultivation list was rendered at the sheet's width with the system's style sheets and looked at: every name, including "Spit In The Face Of God" and "Hand-Eye Coordination", sits on one line.

## Assumptions recorded

See "Added in 0.2.39" in `docs/rules-basis-2.1.md`. The Morale Check after Head damage comes from the earlier manuscript, not the 2.1 rulebook.

## Not verified here (pending at the table)

Nothing in 0.2.39 has been run inside Foundry. To check:

- Cultivation names on one line at the sheet's normal and narrowest widths; five Stars not covering a long name.
- Spend Strikes opens from a won exchange, the "Strikes spent" counter updates as effects are chosen, and Apply damages the right Parts.
- The Stun and Morale buttons on a Head-damage card work for the GM and for the owner.
- The Combat & Gear tab shows the combat sections followed by the gear, and a sheet that was last open on Inventory opens on Combat & Gear.
