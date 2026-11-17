# 2.1 Sect compendiums

Source (0.2.13 onward): user-supplied `10ksah_2_1_playtest_sects.pdf`, the 2.1 playtest Sects (64 PDF pages; book pages 130–193; PDF page + 129 = book page), received 2026-11-06. SHA-256: `0729ED50BEA0181D17BCCD1BEF5B2F4CBA0F5B4A95C811753029D43937DC5FD0`. In 0.2.12 the packs came from the second Sect spoilers (`red_kalpa_sect_spoilers_2.pdf`, 52 pages); until 0.2.11 from the first (44 pages). These packs are for the opt-in 2.1 ruleset. The 2.0.3 Sect Licenses, Sect Technicks, Sect Magicks and Sect Fashion & Gear compendiums are unchanged.

| Compendium | Contents | Folders |
| --- | --- | --- |
| **2.1 Sects** (`sects-21`) | 149 Technicks and 66 Magicks from 18 Sects | Sect → Sect Cultivation ✦ … ✦✦✦✦✦ |
| **2.1 Sect Gear** (`sect-gear-21`) | 16 weapons, 20 armor/Fashion pieces, 8 accessories and talismans | Sect → Weapons / Armor & Fashion / Accessories |
| **2.1 Barang** (`barang-21`) | One Barang per Sect (18) | Sect Barang |

Sects, their Sect Cultivations and Barang: Asuri (Demon Body; Six-Armed Asura Spider), Aswang (Devil Beast; Devil's Centipede), Dracontine (Sky Dragon; Sky Dancing Wyrm), Eskatonian (Black Sorcery; Eskaton Satanworm), Fangshi (Internal Elixir; Spring and Autumn Cicada), Houyi (Solar Bow; Three-Toed Crow Monarch), **Imma** (White Sorcery; White Butterfly), **Jyotisha** (Astral; Golden Starfly), Katalonan (Divine Communion; Revenant Soulworm), Mendicant (Vajra Fist; Monk Bee), Nezha (Red Gun; Red God Drake), Sword Dialectician (Sword Dialectics; Dialectical Swordmoth), Techgnostic (Techgnosis; Digiworm), Ultramystic (Immortal Science; God Obliterating Devil Ant), Wukong (Sage Body; Immortal Gold Cicada), Zhongkui (Spirit Binding; Soul Weaving Worm), **Bidadari** (Sound Law; Golden Dawn Cricket), **Sapphire Star** (Dual Cultivation; Sapphire Silkworm).

## Sect Gear re-imported in 0.2.32 from the 2.1 rulebook (303 pp)

Source: the same 303-page book, Sect chapter pp.224–303. The 41 parsed gear entries become **44 items** (Interlocking Dragonsteel is four pieces; the Dharma Robe statblock is printed inside the Five Thunder Japamala entry). Generator: `tools/sects21/gen_gear.py <out>/ scripts/rules21.mjs`, table `tools/sects21/gear21.py`.

What changed against the earlier book:

- **Soak** is printed as shield glyphs. Recorded as one Soak per glyph on each Part the piece covers. "—" is no Soak (Hermetic Robes, Star-Stitched Robes, Shrine Raiments, Apsara's Flowing Hagoromo).
- **ARTIFACT** is not printed on any Sect weapon. **FEROCIOUS** carries a number (Kalikhadga 3; Mahadirga Knife, Areindama, Tonggong, Atardar's Fang 2).
- **Removed:** Sword Runner Jacket, Sword Runner Trousers. **New:** Personal Vajra, Adamantite Shell (Metomian, p.275).
- **Renamed:** Techgnostic COMP (666 PTM) → Techgnostic COMP (id kept).

Readings recorded rather than invented:

1. **White Robes** and **Revolt Suit** print one glyph and no Parts. They keep the Parts the earlier book named (Torso + arms; every Part).
2. **Arm Piece / Legs / Leg Piece** with two glyphs (Dragonsteel Gauntlet and Greaves, Cloud Walking Boots) are 2 Soak on each limb.
3. **Golden Chainmail Shirt** prints Torso Soak as [SAGE BODY]. The catalog leaves it at 0 with a note to set it by hand.
4. **Adamantite Shell** prints "500 KG PRESTIGE BLUDGEON" with no weapon statblock; it is an automaton. Listed as an accessory with weight 0.
5. **Plenipotentiary's Sapphire Vestments** print "ZHONGKUI PRESTIGE" in the statblock; treated as a misprint.
6. **MORPH**, **VISCERAL**, **LYRICAL** and un-numbered **REACH** are not defined in the rules and stay as tags. REACH 3 (Personal Vajra) and the Drum's 12 m set the item's Range.
7. **Hermetic Robes** and **Vipassanadhanu Garb** print no weight (0 kg).
8. **Kalikhadga** keeps its earlier handling of GREAT (+1 damage, two hands, no -1).

## Re-imported in 0.2.31 from the 2.1 rulebook (303 pp)

Source: user-supplied `10,000 SWORDS AGAINST HEAVEN 2.1 -compressed.pdf` (303 single pages, received 2026-11-16), Sects on book pp.224–303 (PDF page = book page). **2.1 Sects** now holds 175 Technicks and 67 Magicks from 20 Sects; **2.1 Barang** holds 20. Sect Gear is still the earlier import.

- **Sects and start pages:** Asuri 224, Aswang 228, Bidadari 232, Dracontine 236, Eskatonian 240, Fangshi 244, Houyi 248, Imma 252, Jyotisha 256, Katalonan 260, Luciferian 264, Mendicant 268, Metomian 272, Nezha 276, Sapphire Star 280, Sword Dialectician 284, Techgnostic 288, Ultramystic 292, Wukong 296, Zhongkui 300.
- **New Sects:** Luciferian (Consummate Lie; Liar's Devil Cricket; 13 Technicks and the Magick House Rule Mudra) and Metomian (Black Mace, used with Bludgeons and Whips; Black Orb Beetle; 12 Technicks). Chakra Rod and Adamantine Noose print a weapon inside the Technick; it stays in the description.
- **New entries:** Shell Shedding Technique, Slow the Heavenly Wheel, Emptiness Sealing Acupoint Strike, Empu Sword Possibility, Akasha Palimpsest.
- **Removed (not printed):** Lightness Technique, Hold the Heavenly Wheel, Emptiness Sealing Palm, Adamantite Body.
- **Costs and requirements changed (26):** Asuri's Wrath ✹; Aswang Fang, Demon Claw, Flickering Shade Technique and Throatwork now also allow EMPTY HAND; Battle Beat Resonance ❂❂ and Celestial Road Meter ❂ (an instrument in one hand or her voice; Steel Song Meditation no longer required); Steel Song Meditation needs an instrument or voice; Devil Beast Body ❂...; Dialectical Citipati ✹✹✹; Divine Sword Proletariat ✹; Flux no longer needs Blare; Grasping Lion Maw ✹...; Ing Kung Dharani adds a Sidhi Stage from the caster; Live Hand Method ❂❂❂; Mountain Breaking Thunder; Pluck of Many ❂❂❂❂; Principle of Slashing ❂❂; Samadhi Fire ❂; Self-Furnace —; Self-Sacrificing Sage ❂; Six Demon Cutting Sword ✹ with a melee weapon; Solace ❂❂; Spiteful Disembowelment of Seraphim ✹✹✹✹ with no maneuver; Stealing Heaven Fire ✹✹; Threefold Hell Lotus Superposition Slash ✹....
- **Stars changed:** Celestial Heaven Shooter ✦✦, Hell Ripped Through with Exit Wounds ✦✦✦✦, Pluck of Many ✦✦✦✦✦.
- **Magicks:** the book no longer prints a separate cast time on most Magicks, so those fields are empty; Charge Times changed on Shock 12, Scathe 10, Carve 3, Self Altar: Claw 4, Stop the Heavenly Wheel 20, Throne 12 (Ritual: 1 minute), Ing Kung Dharani 33 (Ritual: 8 hours).
- **Transcription decisions:** wrapped NEEDS rows are joined (nine entries); a decorative page text running through Samadhi Fire is removed; Metomian Puppetry Array's "Ardor" is written as Flame; Scour's "ESKATON SORCERY" as Black Sorcery; the Techgnostic intro is not an entry; On Earth We're Briefly Gorgeous is printed as a Technick but has a Mantra, Mudra and Charge Time, so it is a Magick (as before); Twin Lotus Technique installs one Flame of the caster's (the target installs their own).
- **Alternative costs** ("✹ or ✹✹", "✹✹/✹✹✹/✹✹✹✹", "❂/❂❂/❂❂❂") store the cheapest option: Phantom Arrow Multiplication 1, Empu Sword Possibility 2, Butterfly Eyes Discipline 1.

## New in 0.2.18: Bidadari and Sapphire Star (player-facing book, `New_Sects.pdf`)

Two Sects from the 2.1 player-facing book join the compendiums. Their build intermediates are not in the repo, so they are injected into the committed catalogs by `tools/sects21/newsects.py` (idempotent) rather than `gen.py`.

- **Bidadari** (Sound Law; book pp.230–233). Bard-diplomats who cultivate the Sound Law, wiring the Microcosmic Orbit to the "celestial chorus." 12 Technicks: Orchestral Revival Technique, Sound Bubble Echo Technique, Steel Song Meditation (grants KILL THE BUDDHA Maneuvers off FAC + Sound Law), Celestial Road Meter, Battle Beat Resonance, Singing Soul Method, High Melody, Let Sorrow Name the Moons, Miraculous Song of the Multitude, High Pacification, Akashic Resonant Note, and the ✦✦✦✦✦ capstone Mountain Breaking Thunder. Gear: **Apsara's Flowing Hagoromo** (arm-ribbon Fashion, no printed Soak) and **Benzaiten's Drum** (a Godskin Bludgeon on a Haft; ARTIFACT, THUNDERING, PIERCING, LYRICAL; 12 m sonic range in its ability text). Barang: **Golden Dawn Cricket**.
- **Sapphire Star** (Dual Cultivation; book pp.270–273). The Heavenly Ascendance Bureau's mediator-spies; replaces the flavor-only 0.2.16 preview. 12 Technicks (Silkworm Burrows the Heart, Unraveling Silks Method, Twin Lotus Technique, Two Hands One Seal, Silk Moth Flutters Her Wings, Phoenix First Impression, Self-Tying Knot, Almony Across the Heavens, Nightingale's Sorrowful Eyes, Twin Headed Butterfly Technique, Butterfly Eyes Discipline, Two Cinnabar Fields Union) and 2 Magicks (**Sapphire Silk Lattice**, Charge 8; **On Earth We're Briefly Gorgeous**, Charge 18 — printed under a Technick heading but a Magick by its Mantra/Mudra/Check). Gear: **Plenipotentiary's Sapphire Vestments** (Torso/Arms armor). Barang: **Sapphire Silkworm**. The second listed road, Sorcerous Diplomacy, is named on the intro but prints no abilities yet.

## What changed in the playtest Sects

- **New Sects:** Imma (healing White Sorcery: 10 Magicks, a Technick, the Celestine Needles, Rod of Bekanze and White Robes), Jyotisha (Astral: 14 Magicks, 2 Technicks, the Star-Stitched Robes) and Zhongkui (Spirit Binding exorcists: 6 Magicks, a Technick, four talismans, the Demon Subjugating Sword, Dharma Robe and Five Thunder Japamala).
- **Every Sect Cultivation was renamed** (for example Devil Tiger Blade → Demon Body, Great Sage Style → Sage Body). The 2.1 sheet still accepts the old names; see [rules-basis-2.1.md](rules-basis-2.1.md).
- **New entries in existing Sects:** Demon Diamond Head, Boiling Blood, Mountain of Corpses, Seas of Blood (Asuri); Monstrous Shine Body, Devil Beast Body (Aswang); Blare, Flux (Eskatonian); Pill Refinement, Pill Bullet, Elixir Crafting, Samadhi True Fire, Five Dragons Pill (Fangshi); Great Sage Temper, Protect the Monk, Vajra Monkey Body (Wukong). Between Raindrops Meditation (Houyi) is now its own entry.
- **Renamed:** Fist Laughs at Fist → Dog Laughs at God, Shamanheart Influence → Soul Heart Influence, Red Gun Focus → Red Ajna, Protect the Holy Pilgrim Monk → Protect the Monk.
- **No longer printed (removed):** Devil Crucible, Hatred Condensation Seal (Asuri); Flesh Shape (Aswang); Refine Healing Pill, Circulation, Sidhi Bullet, Chakra Elixir, Elemental Dragon Style (Fangshi); Great Sage Club (Wukong).
- **Cost and text changes,** for example Six Demon Cutting Sword (now ❂: imbues the weapon, +1), Spiteful Disembowelment of Seraphim (no weapon requirement), Heart Immortal Palm (needs an Empty Hand), Threefold Hell Lotus Superposition Slash (✹✹✹), What Must Be Done (now a normal Immortal Science ✦✦✦✦✦ License, ❂❂❂❂❂), Exude Killing Intent, Hundun Meditation, Mahadirga Knife (+1 against damaged Parts).
- **Gear changes:** Hermetic Robes (Magicks cost one less Flame), Huojianqiang (Rate 15, Red Gun Mode, no AUTO), San Tou Liu Bi (2 Soak on torso, arms and legs), Sword Runner Trousers (3 Soak per leg), Revolt Suit (3 Soak on every Part, Morale + Mind), Golden Chainmail Shirt (no Morale bonus), Fenghuolun (2 kg).
- Book pages moved again (Asuri now starts on p.130).

## What is configured

- Every entry keeps its flavor text, LICENSE (Sect Cultivation and Stars), NEEDS and full effect text, with the source page.
- Technick and Magick costs come from NEEDS: each ✹ is burnt Flame, each ❂ is installed Flame (stored in the `burnArdor`/`installArdor` fields shared with 2.0.3). A weapon requirement after the semicolon is kept in tags and flags. AP cost is 0, because 2.1 has no Action Points.
- Magicks carry their Mantra, Mudra and the 2.1 casting fields: Potency, Cast Time, Core and Cultivation from CHECK (HEART/HRT → Heart, FACE → Face, PHYS → Physique; "3s" → 3 seconds), so **Cast** on the 2.1 sheet works directly.
- Weapons carry Grip, Profile, weight, Rate and the 2.1 modifiers the rules define (AUTO, CRUSHING, GREAT, COLOSSAL, DOUBLEHAND, FOCUS, BLAZE, ARTIFACT, SMASHING, FEROCIOUS). Armor carries per-Part Soak, Morale and weight; Shrine Raiments and the Phoenix Feather Cap add Flame when equipped; Liver-Eater's Raiment (+2) and Cloud Walking Boots (+3) add movement through Active Effects.
- Item flags (`flags.10kswordsfoundry.sect21`) record the source page, Sect Cultivation, Stars, NEEDS and printed weapon mods. Barang flags (`barang21`) record the Sect and page.

Effects such as Openings granted, Counters, Knockback, auras, summons and conditional dice stay in the description for the table to resolve.

## Decisions and ambiguities

1. **Unknown weapon mods.** PIERCING, KEEN, VISCERAL, HOLY, REACH, NOETIC, LACERATING, CONCEALABLE, RITUAL, TRANSFORM and MORPH are printed on Sect weapons but not defined in the rules. They are kept in the description, tags and flags, not automated.
2. **Kalikhadga.** It is GREAT but "suffers no penalties to Attack Checks from being a [GREAT] weapon". It is recorded as two-handed with base damage 3 instead of setting GREAT, which would apply -1.
3. **Mahadirga Knife.** The printed grip HANDLE is not a 2.1 Grip; recorded as Hilt (Dagger profile).
4. **Interlocking Dragonsteel Gauntlet.** Printed as "ARMS 4 SOAK"; recorded on the right arm, as before.
5. **Soak printed oddly.** Sword Runner Trousers print "legs_ torso ⛨⛨⛨; arms ⛨⛨⛨" (recorded as 3 Soak per leg). Cloud Walking Boots print eight Soak pips for LEGS (recorded as 4 per leg, as before). The Revolt Suit prints "morale_ +[DIALECTICS]"; DIALECTICS is now MIND, so add your Mind to the Morale bonus by hand. Begging Garb and Liver-Eater's Raiment print no Soak.
6. **Trismegistus** is printed as a "Dracontine Prestige Bludgeon" under the Eskatonian Sect; it is filed under Eskatonian.
7. **Lance of Revolutionary Will** is printed under a Technick heading but is a weapon License; it is in 2.1 Sect Gear. **Ghost Hand Talisman** is printed under a Magick heading but is a talisman License; it is in 2.1 Sect Gear. **Seven-Star Track** is printed under a Gear heading but is a Magick (mantra, mudra, cast); it is in 2.1 Sects.
8. **Peachwood Blade** prints the statblock of a Peachwood Talisman; filed as the talisman. Talismans come in threes per License where printed.
9. **Self-Furnace, Mahakali, Ing Kung Dharani, Celestial Stem, Compiler Sutra, Digital Ghost Dialectic, Monster-Shifting and Devil Beast Body** are printed as Magicks without Potency or Cast Time (Compiler Sutra prints Potency 5); missing values default to Potency 1.
10. **Scour** still prints "MIND + ESKATON SORCERY"; recorded as Black Sorcery. **Porcelain** still prints "Ardor"; the catalog says Flame.
11. Several entries still use Minor/Major/Critical Opening names and Flesh/Dire/Mortal Wounds; text is preserved as printed.
12. **Book p.167 (Mendicant).** Its columns interleave in the PDF text. Dragon Swims The Seas, Scissors of God, Vajra Strike, Vajra Guard and Dog Laughs At God were transcribed from the page image.
13. **Headings inside another entry.** Mountain of Corpses, Seas of Blood; Between Raindrops Meditation; and Hell Ripped Through with Exit Wounds sit in the same text block as the entry before them and are split out. The White Robes and Dharma Robe statblocks are printed in the next column (under Ing Kung Dharani and the Five Thunder Japamala).
14. **Prerequisites printed as NEEDS.** Covenant (BLEEDING HEART ✦) prints a prerequisite in NEEDS; it is moved into the effect text and the Flame cost is recorded as none. Scorn Gun Technique's "target within 3m" is moved the same way. Phantom Arrow Multiplication's "✹ or ✹✹" is recorded as ✹ with an optional extra.
15. **Tonggong.** Its innate +2 damage is recorded as base damage 4; MORPH (switch profile) is done by changing the Profile on the item. Its ×400 range and Uncounterable damage are left to the table.
16. **Man of Steel Meditation** prints [VOICE x 5]; the catalog uses [FACE x 5]. Both names evaluate.
17. **The Alpha's Cultivation list (p.56)** names three Sect Cultivations differently (Asuri "Devil Body", Aswang "Shadow Beast", Mendicant "Empty Mind"). The catalog uses the names the Licenses print.
18. **Fangshi crafted items.** The pills and elixirs that Pill Refinement, Elixir Crafting and Five Dragons Pill make are in **2.1 Consumables**; the fourth Pill Refinement result is printed as a second "Fulfilness Pill" and is named Fireball Pill there.
19. **Sapphire Star cultivation (0.2.18).** Every ability is licensed `DUAL`; recorded under **Dual Cultivation**. The Sect's second road, Sorcerous Diplomacy, is named on the intro spread but prints no abilities, so it is not added.
20. **On Earth We're Briefly Gorgeous (0.2.18)** prints under a Technick heading but carries a Mantra, Mudra, Check and Charge Time; filed as a Magick (like GRAV).
21. **Plenipotentiary's Sapphire Vestments (0.2.18)** is printed under a `ZHONGKUI PRESTIGE` statblock tag — a book layout error; it is a Sapphire Star / Dual item (License DUAL ✦✦✦✦✦) and filed under Sapphire Star. Its Soak is a shield icon on Torso and both Arms with no number; recorded as 1 Soak each — confirm at the table.
22. **New weapon mods (0.2.18).** THUNDERING and WORN are now in the 2.1 model and are set where printed (the Benzaiten Drum sets ARTIFACT, THUNDERING, PIERCING); LYRICAL stays description-only. Every 2.1 weapon was normalised to the current 21-key `WEAPON_MODS_21` set.

## Rebuilding

The extraction scripts are in `tools/sects21/` (needs poppler's `pdftotext`):

```
cd tools/sects21
python parse.py "<path to 10ksah_2_1_playtest_sects.pdf>"
python build.py
python gen.py ../../data/
cd ../..
python tools/assets21/gen.py "<path to 10,000 SWORDS AGAINST HEAVEN 2.1 ALPHA.pdf>" data/
python tools/items21/gen_items.py data/
node tools/build-packs.mjs
```

`gear.py` holds the hand-checked weapon and armor statblocks; `tools/assets21/gen.py` builds the Asset catalog from the Alpha and holds the Barang entries.

The two player-facing-book Sects added in 0.2.18 (Bidadari, Sapphire Star) are not in the `raw.json`/`parsed.json` pipeline. They live in `tools/sects21/newsects.py`, which injects them into the committed `sects-21`, `sect-gear-21` and `barang-21` catalogs (idempotent — it also strips the old Sapphire Star preview and normalises every weapon to the current 21-key `WEAPON_MODS_21`). Run it after `gen.py`:

```
python tools/sects21/newsects.py
```
