# 2.1 item compendiums

Source: the Red Kalpa Manuscript, 53-page edition (0.2.12 onward): "Fetishism of Commodities" (pp.31–35) and ASSETS (pp.45–49); the 150-page edition: the one-shot "Heed Us, O Mighty Fury" (p.122) and Discovery (p.8); and the Fangshi pills and elixirs from the 2.1 playtest Sects (pp.147–149, 0.2.13). The 2.1 Alpha (0.2.13) prints the Panoply and Assets unchanged; the Asset sources now cite the Alpha (pp.44–48). These packs are for the opt-in 2.1 ruleset; the 2.0.3 compendiums are unchanged. Sect gear and Barang are in **2.1 Sect Gear** and **2.1 Barang** ([sect catalog](sect-catalog-2.1.md)).

| Compendium | Folders | Items |
| --- | --- | --- |
| **2.1 Weapons** (`weapons-21`) | Panoply · Weapon Profiles · Heed Us one-shot · Shields | 6 listed weapons, 12 profile templates, 4 one-shot weapons, 1 tower shield |
| **2.1 Armor** (`armor-21`) | Head · Torso · Arms · Legs · Heed Us one-shot | 15 pieces |
| **2.1 Consumables** (`consumables-21`) | Elixirs · Fangshi Concoctions | ELIXIR Healing Pill; Healing, Antidote, Fulfilness, Fireball and Five Dragons Pills; Chakra, Disguise, Thunderbolt and Inferno Elixirs |
| **2.1 Accessories** (`accessories-21`) | Accessories | Clean Black Necktie, Puterijasa Featherstep Clogs |
| **2.1 Ammunition** (`ammunition-21`) | Ammunition | Arrows (15), Bolts (15), Handgun magazine (12), Longgun magazine (30) |
| **2.1 Assets** (`assets-21`) | [1] … [6] by the first d36 die | All 35 d36 Assets as Asset items, at their lowest Stars |

## Re-imported in 0.2.33 from the 2.1 rulebook (303 pp)

Source: `10,000 SWORDS AGAINST HEAVEN 2.1 -compressed.pdf` (303 pages, PDF page = book page): Items in the Market pp.186–191, Gear Weapons pp.192–195, Weapon List pp.196–201, Armor pp.202–206, Accessories p.207. Generator: `python tools/items21/gen_rulebook.py <book.pdf> data/`. Everything below this section describes earlier imports.

| Compendium | Items now |
| --- | --- |
| **2.1 Weapons** | 43 listed weapons (pp.196–201), 13 profile templates (12 Profiles + Shield), 4 one-shot weapons |
| **2.1 Armor** | 24 pieces (6 each for Head, Torso, Arms, Legs) and 2 one-shot suits |
| **2.1 Accessories** | 6 market accessories (p.187) and 6 worn accessories (p.207) |
| **2.1 Consumables** | 6 market consumables (p.186) and 9 Fangshi concoctions (carried over) |
| **2.1 Ammunition** | 4 bundles, 6 special ammunition types (p.193), HDF Dragon Fire Meteor (p.201) |
| **2.1 Market Goods** | 6 each of Salvage, Tools, Esotery, Talismans (pp.188–191) |

**2.1 Assets (0.2.34):** re-imported from pp.211–218 with `python tools/assets21/gen_rulebook.py <book.pdf> data/`. The same 36 Assets and ids; ten texts changed (Debt, Capital, Wrought Limb, Loom Access, Patron, Anvil Head, Python Grip, Beastly Claws, Hummingbird Pulse, Armory). Hummingbird Pulse is ✦✦✦ only.

Readings recorded rather than invented:

1. **Pages 196–197** (Empty Hands, Daggers, Sabers, Swords) have no text layer. Their twelve cards were typed in from the page images.
2. **Soak** is one per printed shield glyph; "—" is none. Arm pieces cover one arm and are recorded on the right arm.
3. **Mods without a switch** stay as tags and are applied at the table: the Affinities RAZOR, ESOTERIC, PSIONIC (p.195: use another Core for the Check and damage), VISCERAL (+1 damage against Parts without Soak), REACH, and SHIELD on the HaeCo Riot Shield (not in the p.194 list; the earlier reading is kept).
4. **Categories printed against their list** are recorded by the list they are in: Ka Parashurma (Cleaver), AWW Jadesteel Sleeves (Whip), TMNI Sikarom (Bow), HDF Miniature Arblast and EXK Vampire Hunter (Crossbow).
5. **"-2 SPEED" (Kongo Helm) and "+2 Speed" (Genji Visor)** are applied as printed to the Speed modifier. Whether a plus is faster or slower is still an open question.
6. **Ammunition types** use the closest type the system has: Freezeshot is a Bullet, Blunt Bolt a Bolt, Slingshot the launcher crush type. Their extra effects are in the description. Bundles (15 arrows, 15 bolts, 12 pistol bullets, 32 rifle bullets) carry the weight and price of the full count.
7. **MA Reaping Teppōkatana** prints its price as "330MAG".
8. **Official's Coat** prints its description twice and no effect.
9. **Sky Dance** is printed as a "Prestige Esotery" in the Talismans list. Mosesian Spring is d6 4 and Rend d6 5.
10. **Carried over unchanged:** the Heed Us one-shot gear and tower shield (Red Kalpa Manuscript p.122) and the Fangshi concoctions (playtest Sects pp.147–149). The new book prints the concoctions inside the Fangshi Technicks (pp.244–247); they have not been re-read.

## What is configured

- **Weapons:** 2.1 Grip, Profile, Material, weight, Rate, Capacity and mods; base damage 2 (ARTIFACT adds +1). Ranged weapons have an ammo family, so pick an ammo stack on the weapon before KILLING THE BUDDHA. The **Weapon Profiles** folder has one blank weapon per profile (Dagger … Longgun) to rename and customize.
- **Armor:** per-Part Soak, Morale and weight. Several pieces can be worn together under 2.1; the single 2.0.3 Fashion slot still applies under 2.0.3. Printed stat changes are Active Effects: Kongo Helm (−2 Wits), Kongo Breastplate and Gauntlets (−2 Motorics each), Kongo Greaves (−1 m/s), Puterijasa Adept Cowl (+1 Mind, +1 Heart), Official's Coat and Silkspeaker Legs (+1 Spit In The Face Of God), SSA Red Eye Ring (+2 HP to the right arm).
- **Consumables:** the 2.1 sheet's **Use** button asks which Part to heal, recovers burnt Flame and Morale, and spends one item.
- **Carry:** item weights add up automatically on the 2.1 sheet; the "Other carried" field is for anything else.
- **Assets:** each item stores its Asset key, Stars and a Detail field (creditor, limb, organization…), with the full printed text. Raise Stars from the sheet for 4 × the new Star in XP.

## Decisions and ambiguities

1. Panoply grips are printed as "Handle"; recorded as Hilt (the 2.1 Grip for Sabers and Swords).
2. The MORTAR Parabellum 9mm holds 15 rounds, while the Handgun profile says modern handguns use 12-round magazines. Both numbers are kept.
3. The 53-page edition gives the YEI Three Head Crown 2 Soak (the 150-page edition printed none), the TD-7 Ruyi Rate 30 (was 4) and the Parabellum Rate 10 (was 2), and the Kongo Breastplate −2 Motorics (was −1 Motorics and Wits). The catalog follows the 53-page edition.
4. YEI Heavy Duty Gloves print "ARMS: 1 Soak"; recorded as 1 Soak on each arm. The Kongo Gauntlets print "5 A Soak"; recorded as 5 Soak on each arm.
5. SSA Red Eye Ring adds +2 HP to the right arm by default; edit its effect key for the left arm.
6. One-shot armor prints Flesh and Dire Soak separately (e.g. "3 Flesh Soak 2 Dire Soak"); 2.1 damage has no wound types, so the Flesh value is used as Soak.
7. Rusting Machete and Cosmosian Greatstaff have no printed profile; recorded as Saber and two-handed Bludgeon. The M8's "Burst 4" is recorded as Rate 4 with AUTO.
8. Handgun and longgun bullets share the 2.0.3 "Gun" ammo family.
9. Prices are not printed in 2.1; Mag cost is 0 as a placeholder.
10. Puterijasa Adept Robes give "+1 to all Casting checks"; add it in the Cast dialog. CONCEALABLE (AT-CR Cudgel) is not defined in the manuscript and is kept as a tag. Puterijasa items print no weight.
11. Assets: [5][5] is absent from the d36 table. Three printed typos are corrected in the text ("YFast-twitch", "angs, a spur", "Intre-Int"), and "Spirit + Stillness"/"Voice-based" read "Heart + Stillness"/"Face-based" after the test-run renames.
12. Fangshi pills and elixirs (0.2.13): the Use button heals (Healing Pill, 2) or restores burnt Flame (Chakra Elixir, 2; it no longer restores Morale). The other effects (antidote, disguise, +1 WIT/MOT with 3 piercing damage, fire control, Five Dragons) are applied by the table. The fourth Pill Refinement result is printed as a second "Fulfilness Pill"; it is named Fireball Pill by its effect. Pills weigh 0.01 kg, elixirs 0.5 kg.

## Rebuilding

`python tools/items21/gen_items.py data/` writes the five item catalogs and `python tools/assets21/gen.py "<2.1 ALPHA.pdf>" data/` writes the Asset and Barang catalogs; then run `node tools/build-packs.mjs` to compile every pack.
