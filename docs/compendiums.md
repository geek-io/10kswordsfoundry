# Non-sect compendiums

The system ships a LevelDB Item compendium named **Non-Sect Items · Rules 2.0.3**. Open it in Compendiums or the Compendium Browser and drag entries to the world or character. It contains 110 entries in 11 internal folders:

- Consumables, Accessories, Salvage, Tools, Esotery, Talismans: 36 market entries (pp.94–99).
- Weapons: 36 named weapons (pp.104–109).
- Fashion: 12 entries (pp.110–111).
- Ammunition: 10 standard ammo types (p.101) and Dragon Fire Meteor (p.109).
- Weapons also include the 12 generic weapons from p.100, with ordinary Weapon item types and names.
- Crafting: three Siderite materials (p.102).

Pages 92–93 contain brand descriptions, not separate item stat blocks. General modification/affinity rules on p.103 remain the existing weapon configuration workflow.

Descriptions preserve the supplied book text, including bespoke and conditional effects. Pattern ATK/range, weapon upgrades and inherent modifiers, Fashion Armor/Ardor, prices, rarity, and printed Carry squares populate existing fields. Conditional bonuses, triggered powers, consumption effects, immunities, charges, and bespoke ammunition effects are not newly automated by this content import. For example, the Red Eye Ring describes +1 Max Health but requires its effect to be configured before it grants that bonus.

## Review notes

- HDF Goremaul and TMNI Sikarom have no printed price. AWW Sky Feather Naginata prints `1,7899MAG`, whose intended value is unclear. Their default cost is not a declaration that they are free.
- TMNI Sikarom is printed as a Bludgeon but described as a longbow in the Bow section. It uses the Bow pattern, with a review note.
- TMNI Venom Balaraw retains its printed Cleaver pattern despite its dagger description.
- HDF Mingwang Suit has a die-six / HEADGEAR header instead of Carry squares. It is treated as Fashion based on its section and Armor/Ardor block, with Carry set to zero pending a ruling. This ambiguity was checked against the rendered page.
- Crafting materials have no stated Carry cost or rarity. Pattern prices and rarities are also unstated. Default fields are placeholders, with notes.
- Weapon pattern situational rules (e.g. Dagger surprise Piercing, Sword Defense) remain in descriptions unless already supported by the system's existing controls.
- Layout-driven text spacing in item names was cleaned up; page references and review notes preserve provenance. No book artwork is bundled.

The editable source is `data/non-sect-items.json`. `tools/build-packs.mjs` writes and reads back the pack using the installed Foundry-compatible LevelDB runtime. Stable identifiers make future content revisions predictable. The build and all source records pass local validation; opening and dragging from this pack on the remote Foundry 14.367 server remains a live QA step.

## Grimoire Traits (0.1.32)

The separate **Grimoire Traits · Rules 2.0.3** pack contains all 36 d66 Traits on pp.114–120, organized in a Traits folder. Descriptions preserve full flavor/rules prose in paragraph form; each records its page and d66 number. Level defaults to 1. Animal Magnetism includes an initially inactive, conditional Level-to-Word effect; Adamance includes an active Level-to-Maximum-Health effect. Remaining bespoke rules are recorded as text. Source catalog: `data/grimoire-traits.json`; extraction: `tools/extract-traits.py`.
