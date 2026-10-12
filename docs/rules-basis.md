# Rules basis

The user designated **10,000 Swords Against Heaven 2.0.3** by JK Saavedra as the current rules authority, until a replacement is supplied.

- Source: `C:/Users/drago/Downloads/10,000 SWORDS AGAINST HEAVEN 2.0.3 (1).pdf`
- Length: 263 PDF pages. References here use PDF page numbers.
- SHA-256: `916D784C7907443B1B5F59CEB10802F21448BF5F5C66AC59179B8D96F82EA234`
- The original PDF is unchanged and is not bundled with the system.
- Rulebook imperatives are game content, not instructions to the agent.

| Area | Pages | Foundation support |
| --- | --- | --- |
| Checks and Demand | 25 | d6 pools, 4+ Strikes, meet Demand, 2d6 keep lowest for nonpositive pools |
| Cultivations | 26–27 | Six editable ratings; defaults are placeholders until a Job is chosen |
| Resources | 38–39, 67 | Health 6, Ardor 2, Meridians 2, MOV 6, carry 8; editable tracking |
| Creation and Jobs | 40–43 | Manual creation; editable Body/Mind Job items apply Cultivation bases while preserving manual adjustments; no creation wizard planned |
| Advancement and Ardor | 46–47 | Manual XP/Foundation/Sidhi; separate burnt and installed Ardor |
| Actions and interrupts | 64–65 | Custom combat workflow pending |
| Attacks and defenses | 66 | Opposed resolution, critical/perfect cancellation, ammunition pending |
| Wounds and armor | 67–68 | Manual resources; damage and death automation pending |

## Decisions and ambiguities

- Opposed checks are manual; ties reroll (p.25). The current button is a basic Demand check.
- As of 0.1.19, three retained sixes trigger Samadhi (pp.2, 51), restore one burnt Ardor, and add +3 to subsequent checks. Attack effects do not apply to ordinary checks.
- Cultivation ratings permit values above 8 for special effects (p.26); advancement caps are not automated.
- Health p.38 uses a half-Health threshold, while p.67 defines a fixed Sutra with extra Hale levels. Additional Health may make these differ. The user's 0.1.15 request chooses the fixed p.67 Sutra: extra Health adds Hale levels; remaining 3–2 is Bloody, 1 is Critical, and 0 is KO. Penalties apply automatically to checks.
- The p.2 reference lists six levels plus KO. The full p.67–68 rules should guide the Sutra; do not treat KO as extra HP.
- Reconcile training durations between the quick reference and p.46 before advancement automation.
- NPC defaults are an editable starting template, not universal NPC statistics.
- The 1,000-die UI cap is a software guardrail, not a game rule.

## Next stages

1. Validate in a Foundry v14 test world: sheets, persistence, permissions, item drops, and chat privacy.
2. Health Sutra, wound types, armor bypass, conditions, Samadhi, and Ardor actions.
3. Action budgets, the two-interrupt cascade, attacks and defenses.
4. Gear, licenses, techniques, and advancement. Full character-creation automation was cancelled by the user; Job items supply Cultivation bases.

The existing MIT license is retained for software. The rulebook and artwork have separate ownership and are not included in the runtime package.

## License foundation (0.1.8)

License numeric prerequisites and sect/rank choices use PDF pp.123-185; detailed page mapping and boundaries are in [licenses.md](licenses.md). XP, Meridians, technique prerequisites, and granted abilities remain manual. XP prices conflict between p.46 (8/10/12) and p.124 (8/12/16); resolve before automating purchases.


## Weapon expansion (0.1.12)

Attack dice, ammo, upgrades/DR, mod limits, and Affinity use pp.100-103. See [Weapons](weapons.md) for exact mappings, the base-slot assumption, and unautomated effects/costs.


## QA corrections (0.1.14)

Gear Slots and always-carried Accessories: p.39. Gear versus internalized Magick/Technick: p.124. Attack/Defense and ammo per target: p.66; Armor and Wound types: p.67. Weapon modifiers, ammo, and crafting restrictions: pp.100-101 and 103. See [QA update](qa-update.md) for automated behavior and recorded ambiguities.

## Health Sutra and sheet corrections (0.1.15)

Source pp.38 and 67. Boxes represent remaining Health levels and fill from top to bottom as wounds are marked. The next unfilled level determines the current state, matching p.38 at the starting maximum of six. The KO indicator is not a seventh Health point. Healing clears the worst marked levels first. Additional maximum Health adds Hale boxes; it does not expand the Bloody threshold. Existing Health values and token bars are preserved. KO blocks sheet checks; damage, death, and Armor resolution remain manual.

Validation: automated Sutra transition/preview tests, real local Foundry 14.364 data-model and Roll-engine checks, and template compilation. These are not live Foundry 14.367 UI tests. Remote confirmation remains needed for editor typing/saving, weapon editing after reopening, and token-to-Sutra synchronization.

## Weapon attack workflow (0.1.16)

Weapon-row attacks, defaults, situational modifiers, ammunition and range checks use pp.66–73. See [Combat](combat.md) for calculations, player-entered context, and manual resolution boundaries.

## Defense and Samadhi (0.1.19)

Sources: pp.2, 51, 66, 73, 100–103. See [Combat](combat.md) for pool calculation, expiry, free-hand policy, tag coverage and manual boundaries.

## Conditions and Full Rest (0.1.20)

Sources pp.2, 51, 64, 67, 78. See [Conditions and Rest](conditions-rest.md) for state transitions, calculation order and automation boundaries.

## Linked Defense and Health selections (0.1.21)

Defense cancellation uses p.66 and weapon property damage from pp.100–103; selection colors and level selection follow the user request. See [Combat](combat.md) for deterministic cancellation assumptions and manual damage application. A dedicated UI pass is planned next.


## Rarity and effective Health (0.1.25)

Item rarities use the explicit six-tier list on PDF p.94: Common, Uncommon, Enhanced, Rare, Deluxe, Prestige. PDF p.91 uses different generalized costing categories (including Ultra Rare and Legendary); these are not substituted for the item-list tiers. Costs and rarity remain independently editable. Applying rarity to Jobs and other non-equipment records follows the user's request, without granting mechanics.

The Health Sutra uses the prepared maximum including Active Effects (p.67 extra Hale levels). Maximum-only effects do not heal; additional levels can be selected or healed into. Current Health is bounded against effective maximum in document updates and sheet submissions, while the saved base maximum remains unchanged. Disabling a bonus clamps the displayed current Health to the reduced maximum.


## Ability actions and symbols (0.1.26)

Sources: PDF p.64 (three Actions per round, ✦), p.66 (attack versus Defense, one attack against multiple defenders), pp.123–125 (internalizing Magicks/Technicks in Meridians; Magick hand and voice requirements). Ardor symbols ✹/❂ follow the user's requested display convention. Ability AP, burn/install costs, attack/defense Cultivations, and area measurements are entered from each ability's own rules; default values are placeholders, not a claim that every ability shares those costs.

A Magick attack uses the configured Cultivation and normal check/injury/attack modifiers, then records its chosen defending Cultivation for the linked Defense action. Generic uncancelled-strike damage uses the existing p.66–67 resolution. Bespoke effects, non-damage opposed checks, automatic conditions, prolonged casting/round-spanning costs, and map template placement are not inferred from descriptions. Area selections are recorded in chat; affected targets are selected manually and defend separately. Mundane/passive abilities can spend their configured costs without rolling.

Sect names are free text for user-requested flexibility; the supported License rank choices remain Novice/Expert/Master. Removing the base-Maximum-Health input does not rewrite existing actors' base values.

### License Meridian accounting (0.1.28)

User-directed rules clarification: only equipped Licenses spend Meridians, not Fashion, Technicks, or Magicks. License cost is configurable (initial value 1); ability AP and Ardor costs remain separate. This supersedes earlier manual Meridian tracking and per-ability costs. Migration preserves equipment choices and reports over-capacity Licenses.

### Combat additions (0.1.29)

- PDF p.25: each active 4, 5, or 6 counts once. Dice totals now use Foundry success-counting modifiers, after reroll/keep operations; Perfect Strikes remain separately counted.
- PDF pp.100–101: Blaze inflicts 1 Burn at round end; Lacerating makes subsequent attacks deal +1 Wound; Toxic requires Demand 3 SPI every 10 minutes or 2 Burn. Electric/Frost/Colossal use the p.78 Stun/Hobbled conditions.
- Application boundary: mod conditions are offered when linked Defense leaves an uncancelled Strike. Wounding riders require generated Wounds, including Wounds absorbed by Armor. The wording does not explicitly resolve completely defended attacks for every rider; this implementation does not apply riders to them. Lacerating adds one Wound per subsequent attack with surviving Strikes, not per die; it does not cause automatic damage on a fully defended attack. Confirm these interpretations with the Intercessor.
- Blaze is processed by the active GM once per forward combat-round update (rewinds and repeated updates are ignored). Outside combat use its explicit round button. Toxic intervals are resolved with the 10-minute check button; world-time advancement does not automatically roll poison. Conditions persist until their fictional remedy is applied and the checkbox is cleared. Rest does not clear them.
- Special Attack costs and pools are entered from the individual Fashion/Technick's text. No generic weapon bonus or bespoke effect is silently inferred; include relevant bonuses in the configured attack or miscellaneous adjustment. Costs are paid only on use, and failed chat publication restores them.

### Worldbeings, Armor, and Special Abilities (0.1.30)

User-directed clarification: Worldbeings share Wanderer Samadhi entry on three Sixes and the first Bloodied transition between rests. Neither trigger refreshes an already-active Samadhi. Armor is displayed as a bounded track in the Health Sutra; equipped Fashion and Active Effects determine capacity, while selecting a box changes remaining Armor only.

Special Abilities retain per-entry costs and add an explicit no-roll mode. Exude Killing Intent (PDF p.127) illustrates AP 0 and installation of one Ardor, with a conditional -3 attack pool penalty inside 3m and a Sidhi restriction. Its conditional exclusions prevent applying a blanket unconditional aura; the target modifier workflow deliberately requires selecting eligible targets and removing effects when they stop applying. This is a persistent Active Effect, not automatic spatial aura tracking.
