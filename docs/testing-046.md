# 0.1.46 testing

- All 165 automated regression tests passed. Package checks passed for manifest references, JSON, version consistency, and JavaScript syntax.

- PDF layouts reviewed for Jobs, Sect equipment, and World Being Traits. Catalog extractor asserts the complete 3d6 table and 34 Sect equipment cards.
- Regression coverage checks folder references, stable unique IDs, all 12 Jobs, independent loadouts, paired weapons, starting ammunition, Tonggong range/attack totals, conditional effect defaults, and Wretched choice validation.
- All 65 new catalog items and 35 nested Job grants round-trip without losing structured fields through installed Foundry v14 models.
- Every newly imported numeric Active Effect was applied using the installed Foundry field/expression engine and checked against its expected change.
- Interactive Foundry verification remains: open all three compendiums, drop a Job onto a Wanderer, replace it while retaining manual items, equip imported Fashion, and toggle World Being conditional effects. Narrative/manual limitations are documented in expansion-catalogs.md.
