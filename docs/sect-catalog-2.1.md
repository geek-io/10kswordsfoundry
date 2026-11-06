# 2.1 Sect compendiums

Source (0.2.13 onward): user-supplied `10ksah_2_1_playtest_sects.pdf`, the 2.1 playtest Sects (64 PDF pages; book pages 130–193; PDF page + 129 = book page), received 2026-11-06. SHA-256: `0729ED50BEA0181D17BCCD1BEF5B2F4CBA0F5B4A95C811753029D43937DC5FD0`. In 0.2.12 the packs came from the second Sect spoilers (`red_kalpa_sect_spoilers_2.pdf`, 52 pages); until 0.2.11 from the first (44 pages). These packs are for the opt-in 2.1 ruleset. The 2.0.3 Sect Licenses, Sect Technicks, Sect Magicks and Sect Fashion & Gear compendiums are unchanged.

| Compendium | Contents | Folders |
| --- | --- | --- |
| **2.1 Sects** (`sects-21`) | 143 Technicks and 68 Magicks from 16 Sects | Sect → Sect Cultivation ✦ … ✦✦✦✦✦ |
| **2.1 Sect Gear** (`sect-gear-21`) | 14 weapons, 20 armor/Fashion pieces, 7 accessories and talismans | Sect → Weapons / Armor & Fashion / Accessories |
| **2.1 Barang** (`barang-21`) | One Barang per Sect (16) | Sect Barang |

Sects, their Sect Cultivations and Barang: Asuri (Demon Body; Six-Armed Asura Spider), Aswang (Devil Beast; Devil's Centipede), Dracontine (Sky Dragon; Sky Dancing Wyrm), Eskatonian (Black Sorcery; Eskaton Satanworm), Fangshi (Internal Elixir; Spring and Autumn Cicada), Houyi (Solar Bow; Three-Toed Crow Monarch), **Imma** (White Sorcery; White Butterfly), **Jyotisha** (Astral; Golden Starfly), Katalonan (Divine Communion; Revenant Soulworm), Mendicant (Vajra Fist; Monk Bee), Nezha (Red Gun; Red God Drake), Sword Dialectician (Sword Dialectics; Dialectical Swordmoth), Techgnostic (Techgnosis; Digiworm), Ultramystic (Immortal Science; God Obliterating Devil Ant), Wukong (Sage Body; Immortal Gold Cicada), **Zhongkui** (Spirit Binding; Soul Weaving Worm).

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
