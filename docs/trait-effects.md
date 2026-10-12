# Grimoire Trait effects

Authority: Rules 2.0.3, pp.114–120. Every catalog item retains its source page and complete rule text. Numeric effects use the owning Trait’s Level.

Open Identity, expand a Trait’s Situational effects, and enable the applicable bonus or penalty. Conditional Traits start inactive with their primary effect ready. Activate enables the primary effect if all effects are disabled. Enabling an individual effect also activates its parent Trait. Other situational bonuses and penalties remain off until selected. Adamance starts enabled and adds one maximum Health/Hale level per Trait Level. No extra current Health is granted.

Independent triggers have independent switches. Beast Shrine groups its VIO bonus and DIA penalty because both apply during the same state. Brewmaster uses one bonus for either qualifying activity or the next check after drinking, preventing those alternatives from stacking. Fist-Sized Muscle has separate truthful-expression and audience benefits; the book does not explicitly settle whether both stack on an overlapping check, so the table decides which switches to enable.

## Manual secondary mechanics

These switches change numeric check pools or maximum Health only. The player/GM still handles:

- Beast Grip: one-handed use of two-handed/Colossal weapons; configure weapon hands manually.
- Beast Shrine: pay 1 Health, enforce once-per-Rest use and ten-minute duration.
- Brewmaster and Moonchild: disable the next-check benefit/penalty after that check.
- Music Made Visible: enter Samadhi after the qualifying dance.
- Eminence: grant allies their next relevant check bonus manually; the self effect does not target allies.
- Wanton: heal 1 Health when indulging in vice.
- Silken Mien: disallow its benefit after initiating violence until reputation is restored.
- Primafascist: lose Level Health on waking.
- Clean Meridian Channels: once-per-day Burn reduction, minimum 1.
- Thundercloud Zeal: once-per-day reroll and one-hour exhaustion duration.
- Oracle Soul: trance, weekly limit, and Level words of prophecy.
- Chills: Level × 10 m detection and the question to the World.
- Tenth Sense: add Level to Disposition rolls; there is no automated Disposition roller yet.

Other narrative permissions, ranges, timing and descriptive consequences remain as printed. Ascetic’s Meditation adds Level to Defense only while its Magick-defense switch is enabled. Third Eye uses a situational check bonus; the book does not name a Cultivation for dealing/speaking with spirits.

Compendium updates do not overwrite existing owned/world Traits. Import fresh copies to obtain these definitions; review saved Level/customizations before replacing old copies.

## Embedded-effect packaging repair (0.1.37)

Earlier packs incorrectly stored inline effect objects where the Foundry database requires embedded record IDs and separate records. The corrected packs contain native Item-owned Active Effects, following [Foundry’s Active Effects guide](https://foundryvtt.com/article/active-effects/).

A one-time active-GM repair adds effects only to Traits with an exact stock name and rules-source match and no existing effects. Your manually authored effects are not replaced. Levels, descriptions, and activation choices are preserved. Unrecognized/homebrew copies require manual review or a fresh compendium import. The repair does not edit user compendium packs.
