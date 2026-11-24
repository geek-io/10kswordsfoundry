# Rules basis — 2.1 (2.1 Alpha; earlier the Red Kalpa Manuscript)

From 0.2.50 the 2.1 ruleset is the **default for new worlds**. The GM chooses the ruleset in **Game Settings → Configure Settings → System → Rules version**. **2.0.3** stays selectable and unchanged; see [rules-basis.md](rules-basis.md). A world that already had Actors or Items and no stored choice is kept on 2.0.3 (it was running the old default).

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
| Body Parts | 31–32 | Six Parts, 7 + Physique + Sidhi Stage HP each (2.1 playtest 2026-11-15; was 3 HP) (+ HP bonus, Mountain Frame, Anvil Head); Disabled at 0, Cleaved at negative maximum; clickable damage and cleave tracks; d6 hit location |
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
| Rounds (was Swords) | 6–7 | Combat tracker panel: temporal anchor, number of Cuts (default 4), Cut length; chat at each Cut and when the tip is passed. The structured scene was called a **Sword** until 0.2.19; it is now a **Round** (see below) |
| Cuts | 6–7, 10 | One engine round = one Cut; one Maneuver per entity per Cut is left to the table |
| Speed order | 10 | Initiative = Speed with no roll; ascending order (lowest declares first); reset to Speed each Cut |
| Interjecting | 10 | "Cut-In now (2.1)" moves a higher-Speed combatant who has not acted yet to directly before the current actor |

Decisions: ties in Speed are not addressed by the manuscript; they sort by name. A Round is attached to a Combat encounter, so chases and debates also run through the Combat tracker. Interjecting needs a Speed strictly higher than the current actor's.

## Added in 0.2.39 (Spending Strikes, p.117; Head damage, p.121)

- **Spending Strikes (p.117).** HIT [1] a Random or Controlled Part, or KNOCKBACK 2 m; BODY HIT [2] the Torso; CALLED HIT [3] a Limb; HEAD HIT [4] the Head. Effects can be bought repeatedly up to the Strikes won. Ranged weapons without AUTO buy one effect and add +1 damage per Strike left over (the book's Bow example). The assistant lets Strikes go unspent and says how many.
- **KNOCKBACK** is treated as its own 1-Strike effect with no damage ("Damage a Random/Controlled Part or KNOCKBACK 2m").
- **A Controlled Part** is chosen by hand; the assistant does not check that the Part is Controlled.
- **Cover** is still rolled on the result card; the player leaves out the instances that hit cover.
- **Head damage (p.121)** forces a Stun Check, Heart + Stillness. The book prints no Demand, so the dialog still asks for one.
- **Morale Check after Head damage.** The 2.1 rulebook does not print this. The earlier manuscript (p.14) said the 1-Morale Heart + Adamance Check "will also be triggered if a person loses any number of Head HP", and the table asked for it, so the button is offered. It is the same Check as Incapacitation (p.120).

## Added in 0.2.38 (Cultivator Discovery — Roll everything)

- The book's dice are used wherever it prints a table (Class 3d6 and sub-table, Macca d6, Name 2d6 twice per syllable, Culture d66, Alignment 2d6, Assets d66). Everything else (Core and Cultivation placement, Sect, Licenses, Supply) is an even random draw; the book gives no table for those.
- Assets: d66 is re-rolled when the Asset is already taken or its minimum Stars exceed what is left; Stars bought are random within the Asset's range and the budget.
- Supply: up to eight random purchases with a price, each within the Macca left. Over Carry is allowed.
- Ajna forms are the ones the book names (pp.42, 90). The Sidhi colours are plain colour words and are not from the book.
- Attachments are not generated; the book asks for them to be written.

## Changed in 0.2.37 (Cultivator Discovery table notes; encumbrance, p.182)

- **Encumbrance Check penalty is automatic.** p.182: over the Carry Limit up to ×2 is -2 to Checks and Movement and +2 Speed, up to ×3 is -3, and so on. Movement and Speed were already derived from carried weight; `stateModifiers` now also takes the Check dice off. The hand-set Encumbered condition (-4, older rule) replaces it when ticked, so the two never stack.
- **Carry in the creation tool** uses the Physique assigned in Sutra 2 (10 kg if none yet) and counts every Supply line, free or bought. Going over is a warning and a Review note, never a block.
- **Weights:** ammunition weighs per magazine or quiver, other items per piece, as the sheet counts them. A created character gets one Item per magazine bought.
- **Rolls in the tool** are posted to chat as ordinary public rolls. The saved Discovery card stays whispered.

## Added in 0.2.36 (2.1 rulebook — Cultivator Discovery, pp.42–48, 62, 166)

The eight Sutras of p.42 as a creation tool (`scripts/discovery-rules21.mjs`, `scripts/discovery21.mjs`).

| Sutra | Rule as implemented | Page |
|---|---|---|
| 1 Class | Proletariat by default; choose, or roll 3d6: 3–6 Lumpenproletariat, 7–8 Semiproletariat, 9–12 Proletariat, 13 Petit Bourgeoisie, 14 Spherical Bourgeoisie, 15 Comprador Bourgeois, 16 Bureaucrat Capitalists, 17 Landlord, 18 Heavenly Bourgeoisie. Lumpenproletariat, Proletariat and Spherical Bourgeoisie also roll a d6 sub-table. | 42, 44–48 |
| 2 Cores | The Class prints six Star values; each goes on one Core. | 44–48 |
| 3 Cultivations | The Class prints how many of the 30 basic Cultivations sit at ✦✦✦, ✦✦ and ✦. Each Cultivation takes one rating. | 44–48 |
| 4 Assets | The Class prints Stars to buy. An Asset costs its Stars and must be within its printed Star range; only the 36 starting Assets are offered. | 44–48, 211–218 |
| 5 Supply | Starting Macca = Class multiplier × d6; Gear and Items are bought at catalog prices. Lumpenproletariat also gets one random item. | 42, 44–48 |
| 6 Identity | Name (syllable table, 2d6 twice), Culture (d66 or made up), Alignment (2d6), at least three Attachments with at least one Held, one Firm and one Heart. | 42, 62, 166 |
| 7 Sect | One Sect; its Barang is ingested; its Cultivation starts at ✦✦; two Licenses whose requirement is that Cultivation at ✦✦ or less. | 42 |
| 8 Sidhi | Sidhi color and Ajna are written down; Sidhi 0, Desire Realm. | 42, 86, 90 |

Decisions and ambiguities:

- **Random Supply item (p.44).** The book names no table for "One item, randomly rolled". The tool draws one entry from the Common items of the six 2.1 market catalogs and marks it free. The GM can replace it.
- **Unspent Asset Stars** are allowed and listed as a note ("Start with ✦✦ to buy").
- **The same Asset twice** is listed as a note, not refused; only Capital says it can be held several times (p.211).
- **Debt and Patron (p.42, "Need gear?").** The tool does not grant the lent item or the "I owe [Creditor]" Attachment by itself. The player adds them (a Supply line can be marked free) and the Review step reminds the GM.
- **"Licenses that you're qualified for"** is read as: the License's Sect Cultivation requirement is ✦✦ or lower. Weapon requirements are not checked at creation.
- **Supply stock.** The shop offers the general 2.1 catalogs (pp.186–207). Sect Gear is not offered.
- **Cultures and Alignments** come from the 2.1 Cultivator Discovery compendium, which was read from the earlier player-facing book. Alignment names and 2d6 numbers match the rulebook (pp.51–60). 35 of the 36 Culture names appear in the rulebook's Culture pages (pp.65–82); "Vatuanese" does not and its d66 codes were not re-checked. A made-up Culture can be typed in.
- **Morale** is set to its maximum on creation. **Flame** is left to the sheet.
- **Who creates the Actor.** Only a GM. The player who saved the Discovery becomes the owner unless the GM picks someone else.
- **Privacy.** The chat card is whispered to the GMs and the player, since Attachments are hidden information (p.166).

## Changed in 0.2.35 (2.1 rulebook — weapon Affinities, Grades and mods, pp.194–195)

| Rule | Book | Implementation |
| --- | --- | --- |
| Affinities | p.195: MIGHTY / RAZOR / ESOTERIC / ARCANE / LYRICAL / PSIONIC "can use [Core] as a Core and deal [Core] damage" | `r21.affinity`. When the KILL THE BUDDHA is rolled with that Core, damage is that Core + the Profile's bonus; any other Core leaves the weapon as printed. The book says a Refined or higher weapon can have its Affinity modified, but prints Affinities on Base weapons too; the system does not check the Grade. |
| Material Grades | p.195: Refined +1 Mod, x1.5 DR; Divine +2 Mods, x2 DR, +1 base DMG; Immortal +3 Mods, +2 base DMG | `r21.grade`. Base damage is applied; Mod slots and Durability are a note on the roll. |
| REACH X | p.194: +X m to the weapon's profile | `r21.reach`, added to the Profile's range or to a range override. |
| VISCERAL | p.194: +1 damage against Parts without Soak | Mod `visceral`; the attack card carries it and the Apply damage dialog adds 1 when the Part's current Soak is 0. |
| MORPH X | p.194: as an Action, morph to or back from X Profile | `r21.morph` lists every Profile; the Morph button switches Profile, Grip, ranged/melee and ammo family. Spending the Action on the Ticks tracker is left to the player. |
| ELECTRIC | p.194: 1-in-6 chance of Stunning on contact | The existing `shock` mod, relabelled. Still a reminder, not rolled. |
| AUTO | p.194: 3 Bullets per Action, +1 to VOLLEY | Unchanged: 3 bullets per Shoot. VOLLEY is not defined elsewhere in the rules and is not applied. |

## Changed in 0.2.34 (2.1 rulebook — Assets, pp.211–218)

| Rule | Book | Implementation |
| --- | --- | --- |
| Asset list | pp.211–218: 36 d36 Assets, codes 11–66 | `ASSETS_21` pages moved to the rulebook; the catalog text is regenerated from these pages |
| Hummingbird Pulse | p.216: ✦✦✦ only. "Roll the d6 at the start of a Structured Situation twice and take the better result." | `readyDice21`: the first-READY formula is `2d6kl1 + Speed + Tick`. "Better" is read as lower, because a lower READY acts sooner. It no longer adds to Speed. The meal and Stillness penalties are text. |
| Mountain Frame, Anvil Head, Spring-Tendon Legs, Sleepless Soul | pp.213, 215, 217: unchanged numbers | Still applied automatically (HP, Stun pool, Basic Move, Fatigue) |
| Python Grip, Beastly Claws, Wrought Limb, Debt, Capital, Patron, Armory | pp.211–217: new text | Catalog text only; applied at the table |

## Changed in 0.2.30 (2.1 rulebook — Armor Mods, profile damage)

| Rule | Book | Implementation |
| --- | --- | --- |
| Armor Mods | p.202: one fitted Mod per Armor Piece; Left and Right fit separately; a garment covering several Parts fits one; intact Mods work even at Soak 0; clothing can be fitted | `r21.mod` on the piece. The Mod works on every Part the piece covers (coverage above 0). |
| +1 Soak Mods | Reinforced, Mourning Lacquer, Retributive Script, Magnetic | +1 to the derived Soak of each covered Part. Reinforced's doubled Durability is not tracked. |
| On-Soak effects | Mourning Lacquer: attacker cannot Step next Tick; Retributive Script: 1 true damage back; Magnetic: a magnetic weapon is Controlled by the armor | Named on the damage card when the Part's Soak absorbed damage. Not applied automatically. |
| Arm / Torso / Leg Mods | Sheathe, Retributive Script | Ignored on the Head. |
| Featherweight | This Part's weight is halved | The piece's weight is halved in the carried total. |
| Breakaway | "When this Part is" — the sentence is cut off in the book | Selectable, no effect. |
| Profile damage | p.192: Sword PHYS/MOT + 1, Bludgeon PHYS + 1, Polearm PHYS + 1; p.192: Empty Hand deals PHYS crush | Profiles corrected; Empty Hand = Physique. Without the wielder's Cores the old flat figures (1 / 2) are still shown. |
| Gear Speed | p.203: Genji Visor "+2 Speed", Kongo Helm "-2 SPEED" | Already carried as `system.speedBonus` effects in the armor catalog; since 0.2.28 they add to Recovery as written (+ is slower). |

Ambiguity: a Mod on clothing that covers no Part gives no Soak here, since there is no Part to add it to.

## Changed in 0.2.29 (2.1 rulebook — Firefight, Strikes engine)

| Rule | Book | Implementation |
| --- | --- | --- |
| Aim | p.119: do not fire on the current Tick; +1 die per Tick after, max MOT; cannot move while aiming | Dialog field "Ticks spent Aiming", capped at Motorics. The Ticks are entered by hand; the tracker does not count them. |
| Out of range | p.119: 4-in-6 chance of going wide | d6 on the attack card; on 1-4 no Strikes land. No range-band dice under the Strikes engine. |
| Cover | p.122: Light 2-in-6 per instance of ranged damage, 1 Part cannot be hit; Heavy 4-in-6, 3 Parts; Full makes an attack impossible; melee ignores cover | Chosen in the dialog; rolled on the defender's card: one die for a non-AUTO weapon (one instance), one per leftover Strike for AUTO. Which Parts are covered is left to the fiction. |
| Height | p.122: +1 against someone at least 1 m below | Dialog option. The book places it under hand-to-hand; offered for any KILL THE BUDDHA. |
| Ambush | p.124: the target's pool is halved, rounded down | Attack dialog checkbox; applied when the defender Blocks or Dodges. |
| Casting under attack | p.119: the caster's KILL THE BUDDHA Check is halved | A defender holding Magick Charges rolls a halved pool (rounded down, as for Ambush; one halving even if both apply). |
| Shield | p.192: PHYS + Beast Shrine, 1 m, PHYS crush, SPD +0, innate COVER | `shield` profile. No Grip is printed for it. |
| COVER / WALL / UNBLOCKABLE | p.194 | Weapon mods; COVER / WALL on a lone target's equipped weapon preselect the cover in the attacker's dialog. |
| Reloading and capacity | p.119: reloading takes an Action, or is free outside a KILL THE BUDDHA | Dialog hint only; ammunition handling unchanged. |

Not yet applied (found while reading p.192): the printed profile damage is Sword PHYS/MOT + 1, Bludgeon PHYS + 1, Polearm PHYS + 1 and Empty Hand PHYS crush; the system still uses + 0 and a flat 1. Held for the catalog pass, where stored weapon bonuses are checked at the same time.

## Changed in 0.2.28 (2.1 rulebook — Ticks tracker)

The Round / Cut / Speed-order / Cut-In rows further down describe the earlier manuscript and are superseded under 2.1 by this section.

| Rule | Book | Implementation |
| --- | --- | --- |
| Ticks | p.22: every situation begins at Tick 0; a Tick is 1 second; Step, then READY entities Act, then Held Acts | One engine round = one Tick. Combatant initiative = next READY Tick, ascending. The turn arrows advance a Tick. |
| First READY | p.22: d6 + Speed | Initiative formula `1d6 + Speed`; someone joining mid-scene counts from the live Tick (assumption). |
| Recovery | p.22: after an Act add Speed + Speed Modifiers to the current Tick | **Act** button: READY = Tick + `r21.ticks.recovery`. `system.speedBonus` is a Speed modifier inside Recovery. |
| Simultaneous Acts | p.22 | Same-Tick combatants are listed together; the Tick message tells the table to settle opposed Acts by fiction or Conflict Check. Not automated. |
| Dash | p.22: always +1 Recovery | **Dash** button. |
| Hold / Anticipate | p.22: act later, before your next READY; READY figured as normal | Marks the combatant, sets READY as for an Act; **Release** resolves it; it lapses when the holder is READY again. |
| Flash | p.22: in Recovery, burn 2 Flame to Act now; then add Recovery "to that Tick instead, moving their real ACT further back" | **Flash**: burns 2 Flame (Scorch rules apply); READY = Flash Tick + Recovery, never earlier than the READY already held. |
| Flurry | p.117: KILL THE BUDDHA next Tick, no Recovery, up to MOT; afterwards +2 Recovery per continuation; begun before your READY it adds to that READY | The card's Flurry button sets READY to the next Tick and counts; **End Flurry** sets READY = start Tick (or the prior READY) + Recovery + 2 × Flurries. Book example (Speed 4, 3 Flurries, Tick 6 → 16) is a unit test. |
| Gambits | p.129: WBs have plotted READY Ticks, no Recovery, cannot Flurry | GM context option stores the list; Act moves to the next listed Tick; Flurry is refused. When the list runs out Recovery is used (assumption). |
| Stunned | p.124: a Stunned READY is delayed until the Stun ends | Not automated; the GM edits the READY. |

Decisions and ambiguities: (1) the Flash sentence can also be read as "add Recovery to the READY you already had"; the implementation takes the later of the two so Flash never brings a READY forward. (2) A flurrier who already pressed Act on the same Tick is not treated as "before her READY". (3) Step, Aim and positions stay with the table.

## Changed in 0.2.27 (2.1 rulebook — Speed, Recovery, movement)

| Rule | Book | Implementation |
| --- | --- | --- |
| Weapon SPD | p.192: Dagger +0, Saber +2, Sword +1, Bludgeon +2, Cleaver +2, Polearm +2, Whip +2, Launcher +1, Bow +2, Crossbow +2, Handgun +1, Longgun +2; two weapons use the heavier | `spd` on the profiles; `derive21` takes the highest among equipped weapons. |
| Recovery | p.22: Speed + Speed Modifiers, added to the current Tick | `ticks21`: Speed + weapon SPD + encumbrance, floor 1. |
| Movement | p.132: Basic Move = Motorics m/s, Dash = Motorics + Physique, Step = Basic Move / 2 | `movement`: Step rounds down (the book's Motorics 2 example gives 1 m). |
| Encumbrance | p.182: up to ×2 the Carry Limit = −2 Checks and Movement, +2 Speed; ×3 = −3 / +3 | `encumbrance21`. The Check penalty is a sheet warning only. |

## Changed in 0.2.26 (2.1 rulebook, Nov 16 2026 — combat corrections)

The full 2.1 book is now the authority for 2.1 combat; where it differs from the earlier Google Docs, the book wins.

| Rule | Book | Implementation |
| --- | --- | --- |
| KILL THE BUDDHA check | p.117: WEAPON vs Block (Weapon Check) or Dodge (Motorics + Thews And Sinews) | Block rolls the defender's equipped melee weapon profile, or Empty Hand. |
| Who deals damage | p.117: whoever wins the Conflict Check, even the Defender | Two-way margin; the loser gets the Apply-damage button. A Tie deals none. |
| Hits | p.117: Hit 1, Body Hit 2, Called Hit 3, Head Hit 4; non-AUTO ranged buys one effect, excess Strikes add damage | Shown on the resolution card. |
| Flurry | p.117: the Winner, or the Attacker on a Tie; up to Motorics; +2 Recovery per continuation | Button offered to the Winner; a winning Defender starts their own count. |
| Speed | p.22: 7 − higher of Wits / Mind, plus Speed Modifiers | `ticksSpeed21`. Floor of 1 is an assumption (no minimum printed). Weapon SPD modifiers come with the weapon data patch. |
| Morale | p.164: maximum = 1 + Heart + Stillness | `moraleMaximum`. |
| Stun | p.121: stunned for 6 seconds | Condition and Stun Check text. |

## Added in 0.2.25 (combat overhaul patch 4: Flurry)

FLURRY (KTB 2.1): after a resolved KILL THE BUDDHA in the Strikes engine, the attacker may press the advantage — immediately KILL THE BUDDHA again as an Anticipated Action, up to **Motorics** times. Each Strikes resolution (Block / Dodge) shows a **Flurry** button and the running count.

- The Flurry re-rolls the attacker's KILL THE BUDDHA against the same defender, with the weapon pre-selected, carrying `flurry + 1`.
- After stopping, the next READY lands **Speed + 2 × flurries** Ticks after the Tick the attacker acted on. **Speed = 10 − Wits (minimum 2)** — `ticksSpeed21` in `rules21.mjs`; the delay is `flurryReadyDelay21`. The acting Tick comes from the Ticks tracker (patch 5), so for now the card states the delay, not the absolute Tick.
- Flurry is specific to the Strikes engine; the Openings engine is unchanged.

## Added in 0.2.24 (combat overhaul patch 3: Finding an Opening)

The seven example maneuvers (KTB 2.1, "Finding an Opening"), each a contested Check. `MANEUVERS_21` in `rules21.mjs`; initiated from the **Find an Opening** sheet button; the target Resists from the chat card.

| Maneuver | Initiator | Target Resists | Effect on a win |
| --- | --- | --- | --- |
| Onslaught (melee) | WEAPON | Wits + Beast Shrine | Force the loser up to 2 m; the loser is Off-Balanced (symmetric — whoever loses the contest). |
| Volley (ranged, spend Ammo) | WEAPON + [AUTO] Ammo dice | Wits + Thews And Sinews | Target moves up to half Basic Move, or is Off-Balanced (winner's choice). |
| Analyze | Mind + Concrete Analysis | Face + Beast Shrine | +2 on the analyzer's next KILL THE BUDDHA vs the target. |
| Feint (melee) | Wits + Beast Shrine | Wits + Beast Shrine | +2 on the feinter's next KILL THE BUDDHA vs the target. |
| Control (melee) | Empty Hand | Motorics + Beast Shrine | Control a Limb; win by 2 the Torso, by 3 the Head. The Part cannot move. |
| Throw (melee, after Control) | Empty Hand | Physique + Thews And Sinews | Throw up to [Physique + leftover Strikes] m; upward 3 m+ Juggled, downward Knockdown. |
| Disarm (melee, after Control) | Empty Hand | Physique + Thews And Sinews | Wrench the weapon away (drop it or toss it 3 m). |

Resolution auto-applies Off-Balanced and Control (with the Part tier by margin); the +2-next-KTB, Throw distance/direction, movement, and Disarm are stated on the card for the table. **Empty Hand Check** is read as Physique + Beast Shrine (the Empty Hand profile; the manuscript names no Core/Cultivation for it — recorded as an assumption).

## Added in 0.2.23 (combat overhaul patch 2: the new KILL THE BUDDHA)

The 2.1 KILL THE BUDDHA core, selectable with the world setting **KILL THE BUDDHA engine (2.1)** (`ktbEngine21`; Openings = the existing exchange, default; Strikes = the rewrite). Strikes engine:

| Area | Implementation |
| --- | --- |
| Attack | WEAPON check; the attacker's Strikes (dice >= 4) are posted with Block/Dodge buttons for each targeted defender. Weapon mods, Ferocious, Precise, damage, range and firing modes all still apply. |
| Defense | Block = Physique + Beast Shrine; Dodge = Motorics + Thews And Sinews. The defender's Strikes cancel the attacker's one-for-one. |
| Landing Strikes | Leftover Strikes buy: 1 = a Random or Controlled Part, or Knockback 2 m; 2 = the Torso; 3 = a Limb; 4 = the Head. Damage may be bought per Strike. Each damaging Strike deals the weapon's damage; the damage type is chosen when applying (patch 1). |
| Defended | If the defender's Strikes cancel all of the attacker's, no damage is dealt and the attacker may Flurry (Flurry itself is patch 4). |

## Added in 0.2.22 (combat overhaul patch 1: foundations)

From the 2.1 KILL THE BUDDHA / Ticks docs (2026-11-15). Foundations only; the new KTB engine and Ticks initiative come in later patches.

| Area | Implementation |
| --- | --- |
| Damage types | Five types chosen by weapon at the point of damage: **Cut** (Bleeding on the Part), **Crush** (-1 Part Soak after), **Pierce** (ignore up to 2 Soak), **Blast** (ignore all Soak, -1 Soak after), **True** (ignore all Soak). `DAMAGE_TYPES_21` + the Apply-damage dropdown. |
| Off-Balanced | -2 on the next Check in a KILL THE BUDDHA, until the next turn ends. From Onslaught / Volley / Feint. New condition. |
| Control | A named Part is grappled or pinned and cannot be moved; breaking free costs an Action or the Fiction. New condition (per-Part detail noted by the GM for now). |
| Bleeding | A Bleeding Part loses [10 - Physique] HP after a minute and gives -1 to physical Checks; does not stack on one Part, but each Bleeding Part adds its -1. |
| Incapacitation | Most beings stop fighting once any Part is Disabled; spend 1 Morale for a Heart + Adamance Check vs Demand 2 + Disabled Parts. (Already implemented.) |
| Healing | Heals 1 per X days, X = current damage to the Part; doubled without proper rest and two meals a day. Disabled recovers only when fully healed; Cleaved needs thaumaturgy. (Already implemented, `healingDays`.) |

## Added in 0.2.19 (player-facing book p.24)

**Terminology: Swords → Rounds.** The player-facing book renames the structured scene (a temporal anchor divided into Cuts) from a **Sword** to a **Round**. All player-facing text, the Combat-tracker panel, the chat announcements and the combat-flag concept now say "Round"; the sub-unit is still a **Cut** (one engine round = one Cut), and "Cut-In" is unchanged. The combat flag key moved `sword21` → `round21`, so a scene set in an existing combat before 0.2.19 must be re-set once.

| Area | Page | Implementation |
| --- | --- | --- |
| On Movement | 24 | Within a Round, an entity may move up to its Basic Move (Physique + Motorics) per second. An action that takes time (repairing a railing, planting a trap) requires standing still; moving away cancels that maneuver. Recorded as a rules note; the sheet already shows Basic Move |
| Lightness Technique | 24 | While moving, a Cultivator may install ❂ to enter **Lightness**: run on vertical and diagonal surfaces, tread on falling leaves or swinging weapons, redirect movement by touching a surface, vault or slide past people and objects, and reduce falling damage by [SIDHI]. When knocked back, knocked down or juggled, she may immediately burn the ❂ to tech it — halving the knockback and/or standing back up to neutral. Recorded as a rules note (not yet a runtime condition) |
| Projects (Extended Checks) | 24 | Long actions that take much longer than a single Check — research, crafting a magochemical pill, art, organization, factional influence. Define **Demand** (per Check), **Duration** (time per Check; minutes to years, the Check made at the end of each), and **Goal** (Successful Checks needed; excess Strikes add as extra Successes). Goals ≈ 8–10 difficult, 11–15 long opuses, 16+ gigantic. Not for long-term persuasion — that is CHANGE GOD'S MIND. Recorded as a rules note (no runtime tracker yet) |

Decisions: Movement, Lightness and Projects are documented from p.24 as rules references; none changes runtime behaviour yet. Lightness is a candidate for a future 2.1 condition and Projects for an extended-check tracker; both are left to the table for now.

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
| Openings | test run; 10–11 | 1–3 Whiff, 4–5 Quick, 6 Solid. No die yields a Perfect; Perfects come only from fusing two Solids. Strikes (Shoot Demand, random hit locations) stay 4+ (2026-11-14 engine change) |
| Part HP | 14 | 7 + Physique + Sidhi Stage (2.1 playtest 2026-11-15; was 3 + Physique) (effective, with Active Effects), plus HP bonus, Mountain Frame and Anvil Head |
| Assets | 45–49 | New `asset` Item type (Asset key, Stars, detail); 2.1 Assets compendium with all 35 d36 Assets; +Star for 4 × new Star XP (p.3); older Asset-list rows migrate to items once (active GM, on load) |
| Barang | 2, 51–52; Sect spoilers | New `barang` Item type (Sect, Esoteric Cultivation, weapons, ingested); 2.1 Barang compendium; Ingest (one at a time; optional ✦✦ Cultivation per Wanderer Discovery) and Eject (keeps what was Cultivated) |
| Flame | rulebook p.90 | 3 + Sidhi Stage shown (2 + Sidhi until 0.2.42), with a button to set the maximum; burnt Flame returns 1 per week |
| Meridians | 52 | 2 + Sidhi Stage open Meridians; the sheet warns when Magicks + Technicks exceed them. The Sidhi Realm limit (8/16/32) is still shown |
| ARTIFACT | 32 | +1 damage as well as +2 dice and double Durability |
| Gambits | 17 | Predetermined Openings for World Beings: one per die, Quick → Quick → Solid → Perfect repeating |
| Panoply | 31–35 | TD-7 Ruyi Rate 30, Parabellum Rate 10, Kongo Breastplate −2 MOT, YEI Crown 2 Soak, Official's Coat on all limbs; new Cudgel, Kongo Helm and Gauntlets, YEI Worker Bottoms, Puterijasa Cowl, Robes and Featherstep Clogs |
| Sects | Sect spoilers, second edition | 13 Sects (Houyi and Techgnostic added), 171 Technicks and Magicks, 30 Sect Gear items; see [sect-catalog-2.1.md](sect-catalog-2.1.md) |

Decisions:

- The 2026-11-14 engine change lowered every rank one step: 1–3 Whiff, 4–5 Quick, 6 Solid, and no die rolls a Perfect — Perfects come only from fusing two Solids. (Earlier rulebook text printed 4 = Quick, 5 = Solid, 6 = Perfect, and the first test run used 1 Whiff, 2–3 Quick, 4–5 Solid, 6 Perfect; both are superseded.) Strike-based rules (Shoot Demand +1 damage, one random hit location per Strike in Burst/Full Auto) keep counting dice of 4+, which are now the Quick and Solid Openings. Fusion ratios, the one-extra-Perfect cap, Sidhi upgrades, and the Gambit sequence (Quick → Quick → Solid → Perfect) are unchanged.
- The manuscript still prints VOICE/WORD and SPIRIT in the Cores list (p.1) and several examples; the test run's names are used. The Sect spoilers already print FACE and HEART.
- Flame maximum is not changed automatically, because the stored maximum is shared with the 2.0.3 sheet (Ardor). The 2.1 sheet shows 3 + Sidhi Stage and a button to apply it.
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

## Added in 0.2.41 (importer for Rules 2.1 — 357-page "2.1 NO LORE" rulebook)

Source pages are PDF page numbers of the 357-page edition.

- **Sect entries (pp.225–303).** Title + `Technick` / `Magick` / `Gear` / `license`, flavor, `LICENSE <Esoteric Cultivation> ✦…`, `NEEDS <✹ / ❂>[; requirement]`, rules. ✹ counts as Flame burnt, ❂ as Flame installed. The Sect is taken from the Esoteric Cultivation (twenty Sects). Magicks: `MANTRA`, `MUDRA`, `CHECK: <Core> + <Cultivation>`, `CHARGE TIME: N` (stored as the Magick's charges needed, as the 2.1 Sects catalog does), `EFFECT`.
- **Item cards (pp.186–207, and inside Sect Gear).** `[d6] <weight> KG [Sect] <RARITY> [BASE|REFINED|DIVINE|IMMORTAL] <KIND> [price♄ | N/A]`, name, optional Mods line, text; armor prints `soak_ ⛨…` (one Soak per glyph on each Part covered); Sect weapons print `grip_`, `profile_`, `material_`, `mods_`.
- **Assets (pp.211–218).** d66 code, Star range, name, text. Matched by name to the 36 keys in `ASSETS_21`; anything else is a custom Asset.
- **Bestiary (pp.331–356).** The format on p.331: `NAME ✦ genus`, `SIDHI X` (X/Y/Z = one entry per Sidhi version), Move · Dash · Step, Speed · Flame · Morale, Parts HP, then ARMOR, WEAPONS, CORES, CULTIVATIONS, LICENSES, ASSETS, TRAITS, DROPS.
- The printed derived values agree with the system's arithmetic where checked on pp.332–338: Part HP = 7 + PHYS + Sidhi, Speed = 7 − higher of WIT / MND, Morale = 1 + HRT + Stillness, Move = MOT, Dash = MOT + PHYS.

Decisions and ambiguities (0.2.41):

- **Flame.** Bestiary entries print Flame 3 / 6 / 8 at Sidhi 0 / 3 / 5, which is 3 + Sidhi. The rulebook says the same on p.90: "A Cultivator has [3 + Sidhi Level] max Flames." The sheet used 2 + Sidhi, from the older manuscript, until 0.2.42; it now uses 3 + Sidhi (user decision, 2026-11-17). Existing characters keep their stored maximum until the sheet's button is pressed.
- **Sidhi gates on armor.** `[1]` and `[3/5]` after an armor name are read as: the numbers are Sidhi values when any of them matches a printed version, otherwise 1-based version numbers. So on a 0/3/5 block `[1]` is the first version only and `[3/5]` the Sidhi 3 and 5 versions.
- **License gates.** `[0+]`, `[3+]` on a License are read as "this version has it at Sidhi N or more". `[SIDHI 3+]` on a weapon likewise.
- **Printed weapon pools** often differ from Core + Cultivation. The sheet rolls Core + Cultivation; the printed pool is written on the weapon and the reader is told. Damage is matched through the weapon's Extra damage when the printed figure is higher than the Profile's.
- **Natural weapons** (bite, claw, breath) use the Empty Hand Profile with a range override. A damage figure given as Morale or "noetic" sets NOETIC.
- **Non-humanoid Parts.** The sheet has six fixed Parts. Printed Parts are placed by name (head, torso, legs, forelegs / wings / arms), then into free slots; a seventh Part (a tail on a 2d6 table) is reported and left to the Intercessor. The printed table is kept in the notes.
- **Armor on World Beings** adds its Soak to the Parts and is carried unequipped, so Soak is not counted twice. DR (Durability) is kept as text.
- **Arm pieces** cover one Arm (p.205); the importer puts the Soak on the right arm and says so. **Leg pieces** are read as both legs, as the 2.1 Armor catalog does.
- **Card kind against section heading.** Some cards print the wrong kind (a bow as "BASE BLUDGEON", p.200). The card line is kept and a note is raised when the nearest heading disagrees; the heading is not trusted on two-column pages.
- **"Politics"** (pp.334, 338, 342) and "Blacks Sorcery" (p.355) are not Cultivations the system lists; they come in as Esoteric Cultivations with a note.
- **Not read:** the ammunition list on p.193 (inline bullets, not cards), Fangshi concoctions inside Technick text, and Assets whose code and Star range are split across columns in the PDF text.

## Changed in 0.2.50 (default ruleset; Core pictures)

- **Core pictures (final book pp.28–29).** Physique red, Motorics peach, Mind purple, Wits orange, Face green, Heart pink, in `assets/cores21/` under the Core keys. The PDF stores p.29's three images in the order Heart, Wits, Face; they were matched by printed colour. Until 0.2.49 the 2.1 sheet reused the 2.0.3 Cultivation pictures through `CORES[key].from`, which is still used for mapping 2.0.3 prerequisites but no longer for art.

## Changed in 0.2.49 (Cultivator Discovery market)

- **Market stock.** The creation tool offers only catalog entries whose source is the 2.1 rulebook, and shows each one's page in the final 423-page book (the catalogs still store the 357-page numbering: +2 for pp.3–36, +14 from p.37). Left out: the Red Kalpa Manuscript one-shot gear (five weapons, two armor pieces) and the nine Fangshi pills and elixirs from the playtest Sects, which the final book prints only inside Fangshi Technicks. This replaces the 0.2.36 note "the shop offers the general 2.1 catalogs (pp.186–207)".
- **Ammunition (p.207)** prints single rounds (Pistol Bullet 1♄, Rifle Bullet 2♄, Arrow 2♄, Bolt 2♄ and six special rounds). The catalog sells the four common ones as a quiver of 15, a handgun magazine of 12 ("modern handguns work with 12 round magazines", p.207) and a longgun magazine of 32, priced at the printed price per round.

## Added in 0.2.48 (Cultivator Discovery: another Sect, Sect Gear Licenses)

- **Another Sect for XP (user request).** p.236: "should a Cultivator ingest a different Barang, they can cultivate that Barang and gain new Abilities without losing the ones they've already Cultivated." No XP price is printed for doing so. The tool charges only what p.100 prints: the new Sect's Cultivation bought from nothing at 3 × each new rating (✦ 3, ✦✦ 9, ✦✦✦ 18 XP), and 10 XP per License; the two free Sutra 7 Licenses come from the first Sect only. Licenses of every Sect share the open Meridians (2 + Sidhi). Up to two extra Sects. The sheet keeps one Barang ingested at a time, so the extra Barang is created carried, not ingested.
- **Sect Gear as Licenses.** Sect Gear cards print "License: [Cultivation] ✦…" and are learned like a Technick: listed in the Sect step at that rating, counted as a License (free pick, 10 XP, Meridian). The Sect is the one whose Barang carries that Cultivation. Gear printed inside a Technick with the same name (Metomian Chakra Rod, Adamantine Noose, p.288) is not listed on its own; it is added with that Technick.
- **Random XP spending** (Roll … (spend XP)) buys only Core Stars on rated Cores, Cultivation Stars, Sect Cultivation Stars and Licenses the character qualifies for. It never buys Assets (a new Asset "must make sense in the fiction", p.100) or extra Sects.

## Added in 0.2.45 (Bestiary compendium)

The 71 World Beings of the final book's Bestiary (pp.346–373) are compiled into the Actor compendium "2.1 World Beings · Bestiary" by the same reader the in-app importer uses, so every decision listed under 0.2.41 and 0.2.44 for stat blocks applies. A name printed twice (Dagger Goblin, Saber Goblin on pp.362–363 and again in short form on p.372) keeps the page in the later name.

## Added in 0.2.44 (357-page edition against the final 423-page book)

The final 2.1 rulebook (423 pages) renumbers everything: final page = earlier page + 14 from p.37 of the earlier books on, and + 2 for pages 3–36. Final pp.37–50 and 374–423 are lore; pp.6–8 are a table of contents and a foreword. Page numbers below are the final book's. Citations elsewhere in this document and in item `source` fields still use the earlier numbering.

| Final page | Change | Applied |
| --- | --- | --- |
| 25, 141 | Worked examples: first READY = d6 + Speed; an Anticipate ends when its owner is READY again | already the system's rule |
| 34 | Cultivation descriptions put in alphabetical order | none needed |
| 59 | Semiproletariat Starting Macca 40 × d6 ♄ (was 100) | `CLASSES_21` |
| 132 | Bleeding loses [10 − PHYS] HP, minimum 1; −1 to physical Checks | condition text; modifier now −1 (was −2) |
| 137, 149 | Knocked Down and Drunk: "−2 to Checks" | condition text |
| 153 | Aflame: 1 blast to a random Part every Tick, −1 to all Checks; Inferno 2 blast per second | Burning condition renamed Aflame, −1 (was the Alpha's −2) |
| 172 | A typo fixed: FAC + SUSURRATION vs HRT | not automated |
| 201–205 | Accessory, Salvage, Tool and Talisman prices and two rarities | accessories-21, goods-21 |
| 206 | Hafts also take SHIELD profiles | `PROFILES.shield.grip` |
| 212–215 | Weapon prices, two rarities, four kind labels corrected | weapons-21, ammunition-21 |
| 241–317 | Sect pages: Core names shortened (MND, HRT, PHYS, MOT, WIT), "Invincible Sword", small wording | sect-gear-21 for two items; sects-21 text left as is |
| 332–333 | Esoteric Anomaly d66 table now has its text | not in the system |
| 345 | Bestiary template lists ARMORS, TRAITS, DROPS | already read by the importer |
| 372–373 | Four Goblins in a short stat-block form | importer reads the short form |

**Ambiguities recorded.** The short stat blocks print "Block Nd Dodge Nd" and "CASTING Nd" pools that do not follow from Cores + Cultivations; they are kept in the notes, not applied. Their Speed is printed higher than 7 − the higher of MND / WIT gives; the sheet keeps its own figure and the importer warns. Bleeding "each Bleeding Part adds its −1" cannot be counted: Bleeding is one switch on the sheet, so it is −1 once.

## Added in 0.2.43 (303-page book against the 357-page edition)

The 357-page "2.1 NO LORE" rulebook keeps the page numbers of the 303-page book for pages 1–303 and adds pages 304–357 (Intercessor chapter and World Beings). The text of pages 1–303 was compared page by page; pages with little or no text layer (including the image-only weapon pages 196–197 and the market pages 186–191) were compared as rendered pages. Thirteen pages differ:

| Page | Change | Applied |
| --- | --- | --- |
| 41 | Speed reads 7 − higher of MND / WIT | already the system's rule |
| 121 | Stun Check is Demand 3; stunned for 6 ticks | Stun Check default Demand 3 |
| 192 | Empty Hand "has no innate damage type, just pure striking" | profile note |
| 194 | GREAT: x2 KG, +1 damage, +2 Speed modifier. COLOSSAL: x4 KG, +2 damage, 2 m Knockback on damage, +3 Speed modifier. New Mod UNDODGEABLE | `weaponProfile21`, `WEAPON_MODS_21` |
| 202 | Repair Check: each Strike (1 hour per Check) restores 2 DR or 1 crushed Soak | not automated |
| 203 | Kongo Helm +2 SPEED (was −2) | armor-21 |
| 205 | Blademaster Wraps: +1d to BLOCK (was LACERATING) | armor-21 (text) |
| 225 | Black Red Demon Thews names itself correctly; Demon Diamond Head "cannot be Stunned from Head damage anymore" | sects-21 (text) |
| 229 | Flickering Shade Technique "may activate" | sects-21 |
| 242 | Hermetic Robes, Violent Sorcery: "She can also Step now while Casting" | sect-gear-21 |
| 270 | Vajra Guard: Blocks "even if it is unblockable" | sects-21 |
| 277 | Red Ajna typo | sects-21 |
| 286 | Atardar's Fang: LACERATING removed | sect-gear-21 |

Readings: the "-1 to all violence Checks" on GREAT and COLOSSAL is no longer printed, so it was removed. "x2 KG" / "x4 KG" are taken as already included in the printed card weights. GREAT still grants FEROCIOUS 1 as before (not printed; kept from the earlier build). "+2 SPEED" on the Kongo Helm and "+2 Speed modifier" on GREAT settle the earlier question: a plus is slower. LACERATING is no longer printed anywhere in the book; the Mod stays available on item sheets.

Pages 304–357: Intercessor principles and consequences, play styles, design notes, location tables (Inhabitants d66, Material 2d6, Reward) and the World Beings chapter with the Bestiary. None of it adds Cultivator rules or market items. The location tables are not in the system.


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
