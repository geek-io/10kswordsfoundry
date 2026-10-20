# Sect catalog — Rules 2.0.3

System 0.1.41 adds three Item compendiums: **Sect Licenses**, **Sect Technicks**, and **Sect Magicks**. Open the Compendium tab, then a pack, then its Sect folder and Rank folder. Rank folders appear only where that pack has entries. Rank is also searchable in the Compendium Browser (`sect:asuri rank:expert`).

Every Technick and Magick has one matching License with reciprocal clickable links in their descriptions. License requirements include numeric Cultivations and Sidhi, plus the full printed prerequisite text. The packs include the 30 additional Gear licenses; they do not create the physical Sect Gear. Gear licenses cost zero Meridians because Gear is not internalized (p.124). Ability licenses cost one Meridian.

| Sect | Licenses | Technicks | Magicks | PDF pages |
| --- | ---: | ---: | ---: | --- |
| Asuri | 10 | 8 | 0 | 127–129 |
| Aswang | 10 | 7 | 1 | 131–133 |
| Eschatonian | 11 | 0 | 9 | 135–137 |
| Fangshi | 13 | 11 | 0 | 139–141 |
| Houyi | 11 | 9 | 0 | 143–145 |
| Immanent | 11 | 0 | 8 | 147–149 |
| Jyotisha | 9 | 0 | 8 | 151–153 |
| Katalonan | 11 | 0 | 9 | 155–157 |
| Mendicant | 10 | 9 | 0 | 159–161 |
| Nezha | 10 | 7 | 0 | 163–165 |
| Sword Dialectician | 11 | 8 | 1 | 167–169 |
| Techgnostic | 10 | 0 | 7 | 171–173 |
| Ultramystic | 10 | 10 | 0 | 175–177 |
| Wukong | 8 | 4 | 3 | 179–181 |
| Zhongkui | 11 | 1 | 6 | 183–185 |
| **Total** | **156** | **74** | **52** | **127–185** |

## Structured fields and manual mechanics

- Fixed opening AP, Burn Ardor, and Install Ardor costs are populated. Passive entries without an activation cost use zero. Later conditional costs are not added to the initial cost.
- Magicks retain printed Mantra and Mudra text; chains with a two-handed Mudra require two free hands (p.125). No Mantra or Mudra is invented where the entry does not print one.
- Explicit opposed pools, attack bonuses, damage types, and simple burst/cone sizes are populated where unambiguous. Other modes, optional pools, special ranges, and situational damage changes remain in the description and can be adjusted in the ability prompt.
- This is a content import, not automation of every Sect mechanic. Passive stat changes, triggered benefits, transformations, summons, healing, and conditional effects remain descriptive. No speculative Active Effects have been added.
- Numeric License prerequisites use the existing qualification checks. Named-license and license-count requirements must be checked manually; the system currently does not enforce them.
- Variable Ardor costs and the Jyotisha d6 alternative Magicks must be resolved and paid manually according to the description. Their fixed fields are zero to avoid charging one branch or adding both branches together. Import Notes identify these entries.
- Dragging a License does not automatically grant its linked ability. Drag the desired Technick or Magick separately.

## Printed ambiguities retained

- Printed rank takes precedence over page position: Palm of Anicca (p.160), Ballistic Meditation (p.164), Stealing Heaven Fire (p.168), Gift of Knowledge and Virtual Demon Projection (p.172) are Novice. Hell Ripped Through with Exit Wounds (p.164) is Master. Adamantite Body (p.173) is Expert.
- Page 185 repeats the heading **Demon Subjugating Sword** on the card granting **Five Thunder Japamala**. The second License is named **Five Thunder Japamala**, with an explanation in the item description.
- **Lance of Revolutionary Will** (p.176) is labeled Technick but grants a Gear license in its text. It remains a Technick with its matching License and an explanatory note.
- Printed named prerequisites such as **BIND** (p.184), **DIALECTICAL CITAPATI** (p.169), and **RIGHT HAND MAN** (p.177) are preserved rather than silently rewritten to likely matching ability titles.
- **ANTRA** on p.184 is treated as the Mantra field label; the incantations are preserved.
- This PDF contains no license blocks for Dracotine, Leonine, or Mammon. Those homebrew Sect names remain possible through the free-text Sect field, but no rules entries have been invented for them.

## Source maintenance

`tools/extract-sects.py` rebuilds the three catalogs in `data/` directly from the user-supplied PDF using PyMuPDF. It uses the book's heading fonts to distinguish cards, preserves wrapped prerequisite values, and assigns deterministic IDs. Use `--pdf` to supply a different local path to the same rules edition. `node tools/build-packs.mjs` writes the Foundry LevelDB packs, including the existing embedded-effect records.

## Special Abilities update

Version 0.1.43 configures 69 actions on 64 Technicks, superseding the original descriptive-only handling for those actions. See [Technick action notes](technick-actions.md) for configured mechanics and remaining manual steps.
