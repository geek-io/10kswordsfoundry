# License items

Create an Item of type **License**. Name the individual license, choose its Sect and rank, enter its six Cultivation prerequisites (VIO, DIA, GRC, SAV, WRD, SPI), and add Notes. Sidhi Stage is available for higher-rank requirements. A zero prerequisite means no minimum for that stat. Requirements are entered per license: licenses within one sect/rank can require different ratings.

Drop the License onto a character sheet to equip it. All numeric prerequisites must be met, including equality at the threshold. Otherwise, the drop is rejected with **You do not meet the qualifications of this license**. Licenses have their own section with Open and Equip/Unequip buttons, separate from Gear & Abilities. Sidebar items remain independent templates.

If ratings later fall below prerequisites, the owned License becomes dimmed with **Requirements not met**. Its equip selection is retained, but it is not shown as equipped while unqualified; restoring the ratings restores that status. Unequipping remains possible. Editing an owned License to requirements the actor cannot meet clears its equip selection and shows the warning.

This first pass checks numeric eligibility and tracks equip selection. It does not spend XP or Meridians, automate internalization, grant techniques or gear, or check prerequisite techniques/license counts; record those in Notes and resolve manually. There is no prefilled compendium of individual licenses. Existing generic License items default to Asuri - Novice with zero requirements and unequipped; review and configure them.

## Rules sources

Authority: `10,000 SWORDS AGAINST HEAVEN 2.0.3 (1).pdf`. PDF pp.123-124 describe Licenses, prerequisites, and internalization. The dropdown follows the sect license pages, each with Novice, Expert, and Master varieties:

| Sect | First license page |
| --- | --- |
| Asuri | 127 |
| Aswang | 131 |
| Eschatonian | 135 |
| Fangshi | 139 |
| Houyi | 143 |
| Immanent | 147 |
| Jyotisha | 151 |
| Katalonan | 155 |
| Mendicant | 159 |
| Nezha | 163 |
| Sword Dialectician | 167 |
| Techgnostic | 171 |
| Ultramystic | 175 |
| Wukong | 179 |
| Zhongkui | 183 |

For example, p.127 has different Cultivation prerequisites for Devil Crucible and Six Demon Cutting Sword, both Novice Asuri. Sidhi prerequisites appear on p.128. These are not inferred from the dropdown. XP costs differ between p.46 (8/10/12) and p.124 (8/12/16); no XP cost is automated pending clarification.
