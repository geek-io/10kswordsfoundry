# 0.2.27 testing and validation

Scope: **2.1 rulebook corrections - Speed, Recovery and movement** (plan step 6). 2.0.3 untouched. No catalog or pack change.

## What changed, and how it was checked

- **Weapon SPD**: each profile carries the book's SPD modifier; `weaponProfile21` returns it. Tested for all twelve profiles and Empty Hand (0).
- **Recovery**: `ticks21` = Speed (7 - higher of Wits / Mind) + the heaviest SPD among equipped weapons + encumbrance, floored at 1. Tested (Wits 1, Mind 3, SPD 2, encumbrance 2 gives Speed 4, Recovery 8).
- **Movement**: Basic Move = Motorics; Dash = Motorics + Physique; Step = half Basic Move, rounded down. Tested against the book's example (Physique 3, Motorics 2: Basic Move 2, Dash 5, Step 1), disabled legs, knockdown and Spring-Tendon Legs.
- **Encumbrance**: `encumbrance21` - at the limit 0; over it up to x2 tier 2; up to x3 tier 3. Tested at 40, 41, 80 and 81 kg against a 40 kg limit. It replaces the earlier -1 m/s per 10 kg.
- **Sheet**: the overview shows Ticks Speed / Recovery and Basic Move / Dash / Step. The Flurry card reads the actor's Recovery.

## Tests

`node --test`: **264 pass / 9 fail** - no new failures. Movement expectations rewritten for the new formula; one new test for SPD, encumbrance and Recovery.

## Assumptions and gaps recorded

- Step rounds down (the book example supports it; "Basic Move / 2" is otherwise unqualified).
- Encumbrance tiers read as: over the limit up to x2 = 2, up to x3 = 3, and so on.
- The encumbrance Check penalty is shown as a warning, not applied to rolls.
- Gear Speed bonuses (for example a visor's "+2 Speed") and the SPD of GREAT / COLOSSAL are not applied; the book prints no SPD value for those mods.
- The old Sword-order Speed is still shown for the Rounds tracker, which the Ticks tracker will replace.

## Not verified here (pending at the table)

- The overview shows the new figures and they change when weapons are equipped or weight is added.
- The Flurry card's delay uses Recovery.
