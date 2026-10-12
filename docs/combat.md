# Weapon attacks (0.1.16)

Rules authority: 2.0.3, PDF pp.66–73. Weapon upgrade and property bonuses continue to use pp.100–103.

Equipped weapon rows expose Attack. The weapon type defaults to Melee; existing records retain all data and gain that default. Users must classify existing ranged weapons. Melee uses VIO; Ranged uses GRC; a recognized Affinity overrides this. The pool includes the Cultivation, weapon base bonus, upgrade tier, properties, Health penalty, Active Effect check/attack bonuses, selected situational modifiers, and Other adjustments. Nonpositive pools keep the lower of two dice; Precise rerolls remain supported.

## Calculated situations

| Situation | Modifier / behavior | Page |
| --- | --- | --- |
| Flanking | +1 per adjacent ally entered | 73 |
| Cleave | -1 per target when targeting multiple entities; area patterns exempt | 73 |
| Cover / Concealed | -2 each | 73 |
| Called shot | -1 targeted, -3 smaller than a hand, -6 eye or smaller | 73 |
| Surprise | +3 | 73 |
| High ground | +1 when selected for at least 1 m above target | 73 |
| Ultragravity | -2 ATK; MOV adjustment remains manual | 70 |
| Sabotaged | -2 ATK when selected; disarming remains manual | 66 |
| Dual Attack | -3 to each separately rolled weapon; user keeps better result | 73 |
| Ranged distance | -2 beyond listed range or within 1 m, when enabled | 73 |
| Elevation | Required reach is max(horizontal distance, absolute elevation difference) | 71 |

Distance is optional and entered in metres; the system does not infer token geometry, walls, line of sight, adjacency, target count, or elevation. One shared distance/modifier set applies to the attack; mixed target situations require table adjudication. Melee reach accepts positive whole metres and includes properties such as Reach and Great. An entered out-of-reach melee attack is rejected. Page 73 says ranged distance *might* impose -2, so the default-enabled penalty can be waived. Additional range extensions remain editable weapon values.

A single roll reports 4–5 ordinary Strikes and 6 Critical Strikes. It is not a Demand success/failure. Resolve each target's Defense separately: ordinary Defenses cannot cancel Critical Strikes (p.66). Potential Wounds are shown before cancellation and are not applied to any target. Weapon properties, including Ferocious, remain pre-Defense estimates.

Tracked ammo costs one per target (p.66). Canceling spends nothing; failed attacks restore reserved ammo. Dual attacks require separate weapon rolls and spend each weapon's ammo separately; the system does not select the better roll automatically. Better result comparison is not fully specified for mixes of Critical and ordinary Strikes, so it stays with the table.

## Manual scope

Defense rolls/cancellation; Clashes matching individual die faces; Feint opposed VIO/GRC versus SAV and its -2 next DEF; Full Defense +2 next DEF; Shrine bonuses; escapes, interruptions and action budgets; descriptive effects after two Wounds; Armor and Health damage application; zones, forced movement/collisions; death/Mortal Injury and Rebirth (pp.66–73). Existing Active Effects can track persistent or temporary bonuses, but their duration and consumption are not automated by these attack options.

Validated with automated rule tests and the installed Foundry 14.364 dice engine using UI/chat stand-ins. This does not claim live UI verification on the user's 14.367 server.

## Defense, Magick and Samadhi (0.1.19)

Defense: p.66 VIO deflect / GRC or SAV avoid, plus p.103 weapon Affinities. Pool = selected Cultivation + wound penalty + checkBonus + defenseBonus + wielded Shield bonuses + active Samadhi + manual adjustments + selected Full Defense (+2) / Feint (-2), p.73. Shield grants +1 per wielded Shield weapon; repeated tags on the same weapon count once. Cancellation and weapon-specific Unblockable/Undodgeable eligibility remain table-resolved because Defense is not linked to an incoming attack. Full Defense/Feint checkboxes apply to this roll only and default off each time. No weapon attack bonus, upgrade ATK, or Precise attack rerolls enter Defense.

Samadhi: pp.2, 51. At least three retained sixes trigger entry on system checks, attacks, casting checks, or Defense. Re-entry while active neither refreshes duration nor refunds Ardor. Only burnt Ardor is reduced, never installed. The triggering roll does not receive the new +3; subsequent rolls do. Combat duration expires when the round advances beyond the next round or that combat ends. Outside combat, expiry uses Foundry world time, not six real-world seconds. The sheet offers End Samadhi. Other entry triggers (injury, daily DIA) are not automated in this pass. Simultaneous entries serialize within the client; multiple clients operating the same actor simultaneously are not a distributed lock.

Magick: the user's explicit always-free-hand requirement overrides the Focus mudra exception on p.101. Both ordinary occupied hands and Great/Colossal/Doublehand occupancy block Cast. Costs and individual spell effects are not inferred from rich text. Casting offers the Cultivation specified by the Magick, defaulting to SPI. Cast checks only; automatic resource spending and no-roll Magick resolution remain manual.

Additional tag support: p.101 Shield +1 DEF per wielded weapon, Ritual +1 for a selected ritual/prayer check; p.100 Disarming +2 on a selected disarm check. Ritual/Disarming use one applicable wielded weapon bonus, not duplicate copies. These task choices remain player-selected. Existing Artifact, Colossal, Great, Reach, Precise, Visceral, damage conversions and pre-Defense wound estimates remain. Electric, Frost, Blaze, Toxic and Lacerating require confirmed hit/wound and target resolution before automatic condition application is safe; they still provide reminders.

## Linked Defense (0.1.21)

New attack messages store retained dice and a snapshot of resolved weapon properties, so later weapon edits do not alter the original attack. Defense lists the most recent 30 attacks whose content the user can see; hidden/blind roll contents are excluded. Earlier-version messages do not carry this data and cannot be selected. One attack can be resolved separately for multiple defenders. Defense selects deflect/avoid and enforces both legal Cultivations (or wielded Affinity) and incoming Unblockable/Undodgeable restrictions.

Perfect Defenses cancel Critical/Perfect Strikes first, with surplus cancelling ordinary Strikes. Ordinary Defenses never cancel sixes. When choosing between ordinary dice, cancel the higher-damage die first; this deterministic defender-favorable choice matters for Colossal 5s and is not explicitly ordered by p.66. Remaining dice determine Wounds, including Ferocious/Holy and Colossal bonuses. Armor bypass and Crushing determine Armor/Health loss against the defender's current Armor. A final single point of Armor absorbs one Crushing Wound while being depleted. Damage is calculated only, with attack reference and result stored on the Defense message. Users apply confirmed damage manually; re-rolling a Defense never duplicates automatic damage. Target conditions and contradictory damage conversions still require table adjudication.

## Health selection and planned UI work

As requested, each Sutra button now selects its labeled level rather than marking wounds through it. Six starting selections correspond to 6,5,4,3,2,1 Health plus KO at zero. This corrects the third Hale's misleading -1 result without changing saved Health or the rules thresholds. Selected states use the requested colors. A broader UI pass is planned soon; no overall sheet redesign is included here.
