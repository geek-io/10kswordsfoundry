# 0.2.33 testing and validation

Scope: **2.1 item catalogs re-imported from the 303-page 2.1 rulebook** (plan step 10, part 3): `data/weapons-21.json`, `armor-21.json`, `consumables-21.json`, `accessories-21.json`, `ammunition-21.json`, `goods-21.json` and their compiled packs. No script behaviour changed. 2.0.3 untouched.

## How the import was checked

- Weapon List pp.198-201, Armor pp.203-206 and Accessories p.207 were read with the card reader (`tools/items21/cards.py`), which keeps each card's header, mods, rules, flavor and Soak glyph count together. Every card was listed and compared with the previous catalog entry.
- Pages 196-197 are images. They were rendered and read; the twelve cards were typed into the generator.
- The market pages (186-191) lay cards out in numbered columns the card reader cannot follow. Rarity, weight, price and d6 number of all 36 items were read from rendered page images; rules and flavor text come from the text layer, located by start and end phrases (the generator stops if a phrase is not found).
- Armor Soak from the card reader was checked against rendered pages 203 and 205, and against the glyph counts in the text layer of pp.203-206.
- Generated catalogs were listed item by item and compared with the previous ones: all 151 previous ids kept, 12 renamed items keep their id, 1 new weapon (Shield profile), ammunition 5 to 11.

## Tests

`node --test`: **283 pass / 5 fail**. Four catalog tests that had been failing since the earlier book (item list, weapon data, armor Soak, consumables) were rewritten for the 2.1 rulebook and now pass; one new test covers ammunition. The five remaining failures are the same older ones (Suppression Fire, older Asset rows, six Cores, 35 Assets, Apply damage prefill).

## Assumptions and gaps recorded

- Listed in `docs/item-catalog-2.1.md` under "Re-imported in 0.2.33".
- Affinities, VISCERAL, REACH, MORPH and ELECTRIC are not rules in the system yet; items show them as text.
- Item abilities are text on the item. Only Soak, Morale, weight, Basic Move, Speed modifier and Cultivation bonuses are applied.

## Not verified here (pending at the table)

- The rebuilt compendiums opening in Foundry and importing over existing entries.
- Equipping re-imported armor and seeing the new Soak; using an ELIXIR Potion from the sheet.
