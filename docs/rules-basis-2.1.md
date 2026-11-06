# Rules basis — 2.1 (2.1 Alpha; earlier the Red Kalpa Manuscript)

The 2.1 ruleset is **opt-in and in testing**. The GM chooses it in **Game Settings → Configure Settings → System → Rules version**. The default remains **2.0.3**, which is unchanged; see [rules-basis.md](rules-basis.md).

- Source (0.2.1–0.2.11): user-supplied `10000_SWORDS_AGAINST_HEAVEN_2.1_Manuscript.pdf` (title "RED KALPA MANUSCRIPT"), 150 PDF pages. SHA-256: `534B6B6FB6EE4946C6B371053B259CFB2D89BD55656B7586331FAF3EDF3BB1D8`.
- Source (0.2.12 onward): user-supplied `Red_Kalpa_Manuscript.pdf`, a 53-page edition with the same rules chapters in condensed form, plus the user's notes from a test run (2026-11-01). SHA-256: `43DE824466DC3C8F237B1B58AE46996C555F4CC25D22D73A5459DCB021E0A7B8`.
- Source (0.2.13 onward): user-supplied `10000_SWORDS_AGAINST_HEAVEN_2.1_ALPHA.pdf` ("2.1 ALPHA", 56 pages), received 2026-11-06. SHA-256: `FCCED22E5D5A1702B262400BB6B34BB1426ED8F00EC4CD6C4D9937713E7154E1`. Sect content comes from `10ksah_2_1_playtest_sects.pdf` (64 pages, same day); see [sect-catalog-2.1.md](sect-catalog-2.1.md).
- References in the 0.2.1–0.2.7 sections use the 150-page edition's PDF page numbers; "RK p." and the 0.2.12 section use the 53-page edition; "Alpha p." and the 0.2.13 section use the 2.1 Alpha.
- The PDF is not bundled with the system. Rulebook imperatives are game content, not instructions to the agent.
- The mechanics are in Part One, pp.4–101. Parts Two and Three (pp.104–150) are setting and theory fiction; the one-shot on pp.121–124 contains example stat blocks.

## How the switch works

- A world setting, `rulesVersion` (`"2.0"` or `"2.1"`), restricted to the GM. Changing it re-renders open Actor and Item sheets.
- 2.0.3 code paths, templates, and data are untouched. 2.1 uses its own sheet template (`templates/actor-21.hbs`), roll module (`scripts/roll21.mjs`), and rules module (`scripts/rules21.mjs`).
- 2.1 data is stored in additional fields beside the 2.0.3 data. Switching does not convert, overwrite, or delete either set, so a world can switch back.

## Implemented in 0.2.1

| Area | Pages | Implementation |
| --- | --- | --- |
| Cores | 5 | Physique, Motorics, Mind, Wits, Voice, Spirit, editable; Active Effect variables |
| Checks | 5–6 | Core + Cultivation vs Demand; nonpositive pools keep the 2d6-keep-lowest fallback; excess Strikes reported |
| Cultivations | 77–85 | All 30 basic Cultivations, 0–5 Stars; Esoteric (Job/Sect) Cultivations as a free list |
| Sidhi Progression | 9 | Advance buttons spend XP: Core 5 × new, Cultivation 3 × new (cap 5); Asset and License costs shown |
| Speed | 10, 94 | Physique + Wits + Peripheral Oracle + Stillness, + Hummingbird Pulse Stars and a bonus field |
| Movement | 12, 32, 35, 63, 93 | Walk 2, Run Motorics + 2, Sprint Motorics + 4, Swim Physique + Thews and Sinews; legs, Knockdown, overload, Spring-Tendon Legs |
| Carry | 63 | Carry Limit 10 kg + Physique × 10; carried kg entered manually |
| KILL THE BUDDHA | 22–30, 33–38 | Weapon/Empty Hand, Core and Cultivation defaults from the weapon profile; dice become Whiff/Quick/Solid/Perfect Openings; fusion and Sidhi-upgrade reminders; Firefight range bands, Burst/Full Auto with Rate, ammo; cover, height, terrain, senses, light, mud, Juggled target, Ambush; static Openings for simple World Beings |
| Body Parts | 31–32 | Six Parts, 3 HP each (+ HP bonus, Mountain Frame, Anvil Head); Disabled at 0, Cleaved at negative maximum; clickable damage and cleave tracks; d6 hit location |
| Soak and armor | 38, 66–69 | Per-Part Soak from equipped armor coverage plus a base; damage removes Soak first; Crushing/Bludgeon 2 Soak per point; ignore-Soak option; Repair resets lost Soak |
| Consequences | 31–35 | Chat reminders for Head damage (Stun and Morale), Disabled and Cleaved Parts; Stun Check; Incapacitation Check spending 1 Morale |
| Healing | 14, 31 | Shows days to the next healed point and to full, per Part |
| Morale | 39–40 | Maximum Spirit + Stillness + equipped gear + bonus; clickable track; Shattered at 0 |
| Attachments | 40–41 | Text with Held/Firm/Heart strength |
| Assets | 86–96 | d36 list with Stars and notes; Mountain Frame, Anvil Head, Spring-Tendon Legs, Hummingbird Pulse and Sleepless Soul are automatic |
| Conditions | 13–14, 34–35, 63 | Bleeding, Stunned, Knocked Down, Juggled, Encumbered, Drunk; Fatigue penalty field |
| Weapons | 64–68 | Grip, Profile (pool, range, notes), base damage 2 (Empty Hand 1), Rate, Capacity, FEROCIOUS X, SHIELD X, AUTO/CRUSHING/GREAT/COLOSSAL/DOUBLEHAND/FOCUS/BLAZE/ARTIFACT/SMASHING, weight |
| Magick | 98–99 | Potency, Cast Time, Core, Cultivation, bonus; each Strike adds a Charge; at Potency the Magick unleashes and burns its Ardor; switching Magick abandons Charges; hand/FOCUS requirement |
| Funds | 55–56 | Carried Mag plus Savings |

## Added in 0.2.3

| Area | Pages | Implementation |
| --- | --- | --- |
| Targeting | 22, 29–30, 64–67 | KILL THE BUDDHA lists targeted tokens and fills Distance from the acting token (grid measurement, centre to centre); per-target Reach and weapon-range warnings on the chat card |
| Responding | 22 | "Respond: KILL THE BUDDHA" on the attacker's card opens the defender's roll aimed back at the attacker |
| Applying damage | 31–38 | "Apply damage" opens the Part damage dialog for the target, prefilled with weapon damage, the called/Ambush Part or first random hit location, and CRUSHING; GM or target owner only |
| Magick areas | 98 | An unleashed Magick with an area places it on the scene and lists the tokens inside for damage |

Decisions: with several targets the single KILL THE BUDDHA roll uses the entered (first target's) distance for the range penalty; each target's own band is shown on the card. Distance is measured between token centres, so large tokens may read farther than edge-to-edge; the warnings never block the roll.

## Added in 0.2.4

| Area | Pages | Implementation |
| --- | --- | --- |
| Technick activation | Sect entries; 100–101 | Technicks list on the Combat tab; Activate burns ✹, Install reserves ❂ until Release; "✹ [X]" asks for extra Ardor |
| Technick Licenses | 100–101; Sect entries | The Technick's Esoteric Cultivation (by name) must be at least the printed Stars |
| Weapon requirements | Sect entries; 64–67 | SWORD/SABER/POLEARM/DAGGER/HANDGUN/LONGGUN profiles, EMPTY HAND (a free hand), GREAT/COLOSSAL, AUTO, ammunition (ranged) |
| Sect formulas | Sect entries | Bracketed formulas of Cores, Cultivations and Esoteric Cultivations ([3 x DEVIL TIGER BLADE]) are evaluated on the dialog and card |
| Sidhi Deviation | 18 | Condition: Cultivations count as 1 in Checks; Magicks and Technicks are blocked |
| Sidhi Realm | 100–101 | Desire 8, Form 16, Formless 32 Esoteric Techniques; the sheet counts Magicks and Technicks and warns when over |

Decisions: the manuscript has no Technick chapter, so activation follows the Sect entries' NEEDS (✹ burnt, ❂ installed) and LICENSE lines and the 2.0.3 install/release behavior. Unknown words in a weapon requirement are shown but not enforced. Formulas that name things the sheet does not track (Killing Intent, FANG) are left as printed. The Sidhi Realm is chosen by hand because the manuscript does not map Sidhi Stages to Realms. Technick effects (Openings, Knockback, auras) still resolve at the table.

## Added in 0.2.5

| Area | Pages | Implementation |
| --- | --- | --- |
| Swords | 6–7 | Combat tracker panel: temporal anchor, number of Cuts (default 4), Cut length; chat at each Cut and when the tip is passed |
| Cuts | 6–7, 10 | One Combat Round = one Cut; one Maneuver per entity per Cut is left to the table |
| Speed order | 10 | Initiative = Speed with no roll; ascending order (lowest declares first); reset to Speed each Cut |
| Interjecting | 10 | "Interject now (2.1)" moves a higher-Speed combatant who has not acted yet to directly before the current actor |

Decisions: ties in Speed are not addressed by the manuscript; they sort by name. A Sword is attached to a Combat encounter, so chases and debates also run through the Combat tracker. Interjecting needs a Speed strictly higher than the current actor's.

## Added in 0.2.6

| Area | Pages | Implementation |
| --- | --- | --- |
| KILL THE BUDDHA exchange | 22–27 | One chat card per exchange holding every participant's Openings; started or joined from KILL THE BUDDHA cards; Respond joins automatically |
| Speed Tiers | 23 | Quick → Solid → Perfect; Openings act only in their own tier; the GM advances; unused Openings and Counter bonuses lapse |
| Counters | 26–27 | Equal or higher rank; current tier only; Greater Counter grants a Quick Opening, Overwhelming a Minor/Solid one, acting at once and Counterable |
| Fusion and Sidhi | 25–26 | Two equal → next rank, one extra Perfect at most; Sidhi upgrade or Whiff → Quick (Sidhi not deducted) |
| Interruption | 27 | Joining mid-exchange forfeits Openings of passed tiers |
| Damage | 24–25, 31–38 | "Apply damage" on uncountered targeted maneuvers; Quick defaults to the Torso |

Decisions: maneuvers are free text, because Openings are allowances, not an action list (p.23); the table judges whether a Counter fits the fiction (bullets usually cannot be Countered, p.26). Overwhelming Counters grant a Solid Opening, which covers "a Minor or Solid Opening". Counter declarations themselves cannot be Countered; the Openings they grant can. Burning Sidhi is recorded on the card but not deducted (ambiguity 9).

## Added in 0.2.7

| Area | Pages | Implementation |
| --- | --- | --- |
| Change God's Mind | 42–43 | Voice (Physique for Threatening) + approach Cultivation vs Spirit + Stillness; ties to the defender; −3 without a strong enough leveraged Attachment (Favor Held, Risk Firm, Ruin Heart) |
| Attachment changes | 43–45 | Implant Held, destroy Held, Held↔Firm (a week), Firm↔Heart (a month); Social Project reminder |
| Inflame | 46 | Emotion recorded on the card; counts as Firm for Social Defense (reminder) |
| Disposition | 46–47 | Actor field with 2d6 roll; −6/−3/0/+2/+4 to persuade |
| Threatening | 47 | Physique + Beast Shrine; negative Held Attachment reminder |
| Mobs | 47–48 | −Size dice; optional static half-pool defense |
| Social Defense | 48 | Defender marks own Attachments as opposing/aligned; strongest counts; equal cancel |
| Persistence | 48–49 | Spend 1/2/3 Morale; refusing an action needs a different, equally strong Attachment |
| Material shift / shaky | 49, 51–52 | +4 / +3 options |
| Written and gestural | 49–50 | Written Strikes become a reading Demand (−2 without an invoked Attachment); gestures give +3 defense |

Decisions: the Persistence cost for changing an Attachment or a feeling is not stated; it uses the same scale by strength (Held-level 1, Firm-level 2, Heart-level 3; Inflame 2). Attachments are hidden information (p.41), so the initiator states the leveraged strength rather than reading the target's sheet. Social Projects (two or four weekly Checks) are not tracked across cards. Learning Attachments, Rhetoric premises and Deals use ordinary Checks and the same dialog.

## Added in 0.2.12

From the 2026-11-01 test run (user instructions) and the 53-page Red Kalpa Manuscript.

| Area | Pages (53-page edition) | Implementation |
| --- | --- | --- |
| Renames | test run | Voice → **Face** (FAC), Spirit → **Heart** (HRT), Ardor → **Flame** on the 2.1 sheet, dialogs, cards and 2.1 compendiums. Data keys (`voc`, `spi`, `ardor`) are unchanged so both rulesets share stored values; formulas accept the old names |
| Openings | test run; 10–11 | 1 Whiff, 2–3 Quick, 4–5 Solid, 6 Perfect. Strikes (Shoot Demand, random hit locations) stay 4+ |
| Part HP | 14 | 3 + Physique (effective, with Active Effects), plus HP bonus, Mountain Frame and Anvil Head |
| Assets | 45–49 | New `asset` Item type (Asset key, Stars, detail); 2.1 Assets compendium with all 35 d36 Assets; +Star for 4 × new Star XP (p.3); older Asset-list rows migrate to items once (active GM, on load) |
| Barang | 2, 51–52; Sect spoilers | New `barang` Item type (Sect, Esoteric Cultivation, weapons, ingested); 2.1 Barang compendium; Ingest (one at a time; optional ✦✦ Cultivation per Wanderer Discovery) and Eject (keeps what was Cultivated) |
| Flame | 52 | 2 + Sidhi Stage shown, with a button to set the maximum; burnt Flame returns 1 per week |
| Meridians | 52 | 2 + Sidhi Stage open Meridians; the sheet warns when Magicks + Technicks exceed them. The Sidhi Realm limit (8/16/32) is still shown |
| ARTIFACT | 32 | +1 damage as well as +2 dice and double Durability |
| Gambits | 17 | Predetermined Openings for World Beings: one per die, Quick → Quick → Solid → Perfect repeating |
| Panoply | 31–35 | TD-7 Ruyi Rate 30, Parabellum Rate 10, Kongo Breastplate −2 MOT, YEI Crown 2 Soak, Official's Coat on all limbs; new Cudgel, Kongo Helm and Gauntlets, YEI Worker Bottoms, Puterijasa Cowl, Robes and Featherstep Clogs |
| Sects | Sect spoilers, second edition | 13 Sects (Houyi and Techgnostic added), 171 Technicks and Magicks, 30 Sect Gear items; see [sect-catalog-2.1.md](sect-catalog-2.1.md) |

Decisions:

- The manuscript text still prints 4 = Quick, 5 = Solid, 6 = Perfect and calls 4+ a Strike. The test run's ranks are used for Openings. Strike-based rules (Shoot Demand +1 damage, one random hit location per Strike in Burst/Full Auto) keep counting dice of 4+, which are now the Solid and Perfect Openings.
- The manuscript still prints VOICE/WORD and SPIRIT in the Cores list (p.1) and several examples; the test run's names are used. The Sect spoilers already print FACE and HEART.
- Flame maximum is not changed automatically, because the stored maximum is shared with the 2.0.3 sheet (Ardor). The 2.1 sheet shows 2 + Sidhi Stage and a button to apply it.
- Meridians count every Magick and Technick on the sheet; the manuscript does not say whether unslotted techniques exist.
- Ingesting a Barang offers its Cultivation at ✦✦ only when the character does not have it yet (Discovery, p.2); later in play the table decides.
- Gambits (p.17): the printed 6-dice example (4 Quick, 1 Solid, 1 Perfect) matches the sequence; the 8- and 10-dice examples do not and are not followed.
- The Dracontine Barang is "Sky Dancing Wyrm" in the Sect spoilers and "Writhing Wyrm" in the manuscript (p.51); the catalog uses the Sect spoilers.
- Healing time: p.6 still says 3 damage takes 5 days and p.14 says 6 days; the rate (6 days) is kept (ambiguity 4).

## Added in 0.2.13

From the 2.1 Alpha and the 2.1 playtest Sects (2026-11-06). Rules the Alpha repeats unchanged from the Red Kalpa Manuscript (Cores, Checks, Openings, Speed, Gambits, Panoply, Assets, Flame, Meridians, Change God's Mind) keep their earlier implementation.

| Area | Alpha pages | Implementation |
| --- | --- | --- |
| Sect Cultivations | playtest Sects; p.56 | Every Sect Cultivation was renamed (Devil Tiger Blade → Demon Body, Liver Eating → Devil Beast, Heaven Raving Dragon → Sky Dragon, Eskaton Magick → Black Sorcery, Sun Piercing Killing Wind → Solar Bow, Dog Laughs At God → Vajra Fist, Fire Lancing → Red Gun, Techgnosticism → Techgnosis, The Immortal Science → Immortal Science, Great Sage Style → Sage Body). Licenses, formulas, Magick Cultivations and Barang ingestion accept the old names, so existing Esoteric Cultivations keep working |
| Basic Move | 4, 14 | Physique + Motorics m/s (replaces Walk/Run/Sprint); swimming and other 3D movement at half; the sheet shows the metres in a 3-second Cut. Movement bonus, Spring-Tendon Legs, overload, Disabled legs and Knockdown still apply |
| Moving while casting | 4 | Cast dialog option: -2 to the Casting pool |
| Cutting-In | 4, 6 | The Combat tracker's "Interject" is now "Cut-In" |
| Cleaved | 11 | A Part is Cleaved at the negative of half its maximum HP, rounded down (-2 for 5 HP); the damage track is shortened to match. Disabled Parts work again only once fully healed |
| Suppression Fire | 10 | KILL THE BUDDHA firing mode for ranged weapons of Rate 15+: no Openings rolled; the card lists the Heart + Stillness vs Demand 3 test, Suppressed on a failure, and weapon damage to four random Parts for those who stay |
| Conditions | 10, 16–17, 53 | New 2.1 conditions: Burning (-2 to all Checks; 2 damage to a random Part every 3 seconds, ignoring Soak), Suppressed, Samadhi. Juggled also blocks Countering |
| Scorch | 52 | Activating a Technick or unleashing a Magick past 0 Flame asks first, then puts the excess into Scorch (-1 to all Checks per point) and rolls the Deviation Check (Physique + Adamance + Sidhi Stage vs 3 + Scorch); a failure rolls the d6 Deviation table (Rupture, Scatter, Heart Demon, Shut Down, Overflame, Sublation). Recovering burnt Flame and releasing installed Flame clear Scorch first |
| Self-Flame | 51 | Technick cards name the manifestation for the Flame spent (silent, Asterism, aura, bonfire, Divine Mien) |
| Samadhi | 53 | Condition: +2 to all Checks and dice penalties ignored. A Check whose Strikes reach Demand + 3 (Flow) turns it on; the Incapacitation card reminds that spending Morale allows it |
| Sect Licenses and Barang | 5, 50–51 | Adding a Sect Technick or Magick to a character with no matching ingested Barang shows a warning (a new License needs the Barang ingested); nothing is blocked |
| Assets | 44–48 | Unchanged text; sources now cite the Alpha pages. XP: 4 × the new Asset rating |
| Fangshi pills and elixirs | playtest Sects pp.147–149 | 2.1 Consumables: Healing Pill (2 Health), Antidote, Fulfilness and Fireball Pills, Chakra Elixir (2 burnt Flame), Disguise, Thunderbolt and Inferno Elixirs, Five Dragons Pill. The older Refined Healing Pill is gone |

Decisions:

- **Movement.** p.4 says a being moves "up to their Speed in meters per second", but its example and p.14 give Basic Move = Physique + Motorics. Basic Move is used.
- **Cleave depth.** Half of a small maximum rounds down to 0 (1 HP); the sheet keeps at least -1 so Disabled and Cleaved stay distinct.
- **Suppression Fire ammunition.** The rules do not say how many rounds it spends; the sheet spends one Rate of ammunition, like a Burst.
- **Scorch bookkeeping.** Scorch is its own number beside the shared Flame totals (which the 2.0.3 sheet also reads). Sublation ("lose all Scorch, begin at 0 Flame") and the other Deviation results are applied by the table from the chat card.
- **Samadhi** stays on until the player clears it; the 3-second limit, Concentration (Mind + Stillness vs 7 while installing 1 + Sidhi Stage Flame) and healing 1 burnt Flame per 3 seconds are left to the table.
- **Cores.** The Alpha still prints WORD becomes VOICE and SPIRIT stays the same (p.3), while its own text and the playtest Sects use FACE and HEART. The test-run names (Face, Heart, Flame) stay. Porcelain still prints "Ardor"; the catalog says Flame.
- **Healing.** The Alpha drops the "5 days" example, so ambiguity 4 is settled: 1 point per X days, X = current damage.
- **Sect Cultivation names.** The Alpha's own list (p.56) differs from the playtest Sects for three Sects (Asuri "Devil Body", Aswang "Shadow Beast", Mendicant "Empty Mind"). The playtest Sects' names are used because their Licenses print them; "Devil Body" and "Shadow Beast" are accepted as aliases. "Empty Mind" is described as a separate Mind Cultivation and is not aliased.
- **Not automated:** INTRA-INTs (Spiritual Diagnosis, Prayer, Possession, Exorcism, Rituals such as Soul Surgery), Objects and vehicle Durability, the Magnetite economy and wages, Heart Demons, Treatment Demands. These use ordinary Checks and the existing dialogs.

## Decisions and ambiguities

Recorded for the Intercessor and the author; none of these were silently resolved without a note.

1. **Opening ranks (pp.22–23).** The bullet list says "A 5-6 generates a Solid Opening" and also "6 result generates a Perfect Opening". The worked example (p.36: "6, 6, 5, 5, 2. Two Perfect Openings and two Solid Openings") shows 4 = Quick, 5 = Solid, 6 = Perfect. Implemented that way until 0.2.11; superseded in 0.2.12 by the test run (1 Whiff, 2–3 Quick, 4–5 Solid, 6 Perfect).
2. **Opening names.** The manuscript also uses Minor/Major/Critical (pp.25–27, 33, 38, 65, 93). Treated as Quick/Solid/Perfect respectively.
3. **Wound types.** Some text still uses Flesh/Dire/Mortal Wounds (pp.13–16, 19, 88, 122–123), while damage rules use HP per Part (pp.31, 38). Damage is tracked as HP; wound-type text is left to the table.
4. **Healing time.** p.14 says fully healing 3 damage takes 5 days; p.31 says 6 days. The rate "1 per X days, X = current damage" gives 3 + 2 + 1 = 6. The sheet uses the rate. (Settled in the 2.1 Alpha, which drops the 5-day example.)
5. **Shoot Demand (p.29).** "+1 damage if there are more Strikes than the Demand" names no Demand for a KILL THE BUDDHA. The dialog asks for one (default 1).
6. **Burst and Full Auto ammunition (pp.29–30).** Implemented as Rate and Rate × 3 rounds spent. Shoot spends the chosen number of shots (up to Rate).
7. **Bleeding "physical related Checks" (p.34).** Applied to Checks using Physique or Motorics.
8. **Stun Check (p.32).** No Demand is given. The dialog asks the Intercessor (default 1). Anvil Head Stars are added.
9. **Burning Sidhi to upgrade Openings (p.26).** It is unclear whether this spends the Sidhi Stage or another pool; it is shown as a reminder only.
10. **License prerequisites.** The Sect License text on p.9 is cut off. Existing 2.0.3 prerequisites (VIO, GRC, …) are read against the matching Cores per p.5.
11. **Asset [5][5].** Missing from the d36 table (pp.94–95).
12. **Nonpositive pools.** 2.1 does not restate the 2.0.3 fallback; p.13 refers to making "a 0 Check". The 2d6-keep-lowest fallback is retained.
13. **Discovery (p.8).** "Cores all start at 1" alongside an assignment of 3, 3, 2, 2, 1, 1. New characters default every Core to 1; the player assigns the array.
14. **Generic bonuses.** The 2.0.3 "All checks bonus" and "Attack bonus" Active Effect variables still add to 2.1 rolls, so existing gear and effects keep working.
15. **Cover and melee (p.34).** Cover penalties are applied to ranged attacks only.

## Not yet implemented

- Control, Knockback/Knockdown/Juggling resolution and Blasts (pp.26–35) beyond reminders, maneuver text and condition toggles.
- Projects/Extended Checks (pp.7–8) including multi-week Social Projects, Investigation, Logic and Facts (pp.53–62) beyond the +4 Fact option, Geomancies (pp.54–55).
- Poisons, Ailments and Treatment (pp.15–19; Alpha pp.15–17). Burning is a condition from 0.2.13.
- INTRA-INTs, Prayer, Possession, Exorcism and Rituals (Alpha pp.53–56), Objects and vehicles (Alpha p.32), the Magnetite economy (Alpha pp.25–27).
- Countermagick (p.99). Barang ingestion is tracked from 0.2.12; licensing of individual Technicks still uses the Esoteric Cultivation's Stars.
- A compendium for Cultivations. Assets and Barang have compendiums from 0.2.12. 2.1 items are in the [2.1 item compendiums](item-catalog-2.1.md); 2.1 Sect abilities and gear are in [2.1 Sects and 2.1 Sect Gear](sect-catalog-2.1.md).
