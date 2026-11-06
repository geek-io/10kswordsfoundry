# Testing 0.2.13

Local checks on 2026-11-06, outside Foundry:

- `node --test tests/*.test.mjs`: 256 tests passed, including the new `tests/alpha21.test.mjs` (old Sect Cultivation names still license Technicks and fill formulas; Burning, Scorch and Samadhi modifiers; Flow at Demand + 3; Scorch spending, recovery and the Deviation table; Suppression Fire needing Rate 15; Moving while Casting; the Barang reminder; consumables clearing Scorch first), a Scorch case in `tests/technick21.test.mjs`, and updated rules21 (Basic Move, Cleaved at -half maximum), Sect, Sect Gear, Barang, Asset and consumable catalog tests.
- `node tools/check-package.mjs` passed (`?v=0.2.13`).
- The Sect pipeline reproduces the 0.2.12 catalogs exactly from the second spoilers before the changes, then builds 211 Technicks and Magicks and 41 gear items from the playtest Sects. The Mendicant p.167 entries, the White Robes and the San Tou Liu Bi, Sword Runner, Golden Chainmail, Cloud Walking Boots, Fenghuolun, Huojianqiang and Zhongkui statblocks were checked against the page images.
- The Asset catalog regenerated from the 2.1 Alpha matches the 0.2.12 text exactly (only the source pages changed).

Not yet verified in Foundry 14: the Scorch confirmation and Deviation card, the Samadhi and Burning conditions on the sheet, Suppression Fire spending ammunition, the Cut-In menu entry, the Basic Move line, the shorter Cleave track, the Barang reminder on drop, and the new compendium entries.
