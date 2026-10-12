# QA update: 0.1.14

## Rules correction and migration

Page 39 defines Right Hand, Left Hand, and Fashion as the three Gear Slots. Accessories always occupy Carry. Page 124 says Gear is not internalized: Meridians are for Magick and Technicks. This supersedes the equipment costs introduced in 0.1.10. The implementation treats a readied item as occupying its Gear Slot, with spare copies staying in Carry. See [Equipment](equipment.md) for migration and recovery details.

## Rich text and Active Effects

Actor Notes and Item Descriptions/Abilities now use Foundry's ProseMirror editor, including formatting and document links. Short identifiers, names, and numeric inputs remain ordinary fields. Plain notes are preserved when editing; HTML fields are registered for server sanitization, and displayed HTML is cleaned before enrichment.

Both sheets have Active Effects controls: Add Effect, Open, Enable/Disable, and Remove. Configure changes using the standard Foundry v14 effect sheet and its `system.changes` model. Typical numeric keys include `system.cultivations.vio`, `system.movement`, `system.checkBonus`, or `system.attackBonus`. `checkBonus` affects all checks; `attackBonus` affects attacks. Add/Multiply/Override and duration controls are Foundry's own behavior. Effects on equipped Fashion, weapons, accessories, and internalized techniques transfer while the item is equipped; disabled/expired effects remain inactive. Trait effects can transfer without an equip requirement.

Editable character fields show saved base ratings. Effective changed ratings are summarized separately, and checks use prepared ratings. Saving another sheet field must not bake a temporary bonus into the base rating. Equipment capacity bookkeeping uses saved base capacities; effects on resource maxima or capacities do not automatically replenish resources or adjust carried-item ledgers. Resource recovery and injury bookkeeping under such temporary effects remain manual. Configure permanent capacities directly on the character.

## Ammo stacks

Create an **Ammo** item, choose a type, and set quantity. Drop it onto the Actor. Set the weapon's ammo family and default stack; the Check dialog also lets you select a different stack for that attack. Gun/Bow/Crossbow/Launcher compatibility is checked. Custom ammo is unrestricted. One ammo type uses one Carry slot, stacking across matching items (p.101). Spending the last of a type releases that slot. Replenishing the stack charges it again.

The default expenditure is one round per attack. The dialog's Ammo spent field can account for multiple targets (p.66). Blank/default selection uses the weapon's saved stack. Older inline ammo remains usable until replaced by a stack; clearing or selecting a stack does not migrate or duplicate its rounds. Dropping a weapon onto a different Actor clears its stack reference. A depleted or missing stack blocks the roll. Local queued actions prevent rapid double-use of the last round; failed rolls attempt to restore ammo. Simultaneous writes from separate clients are not a server-wide transaction.

## Weapon modifiers

Weapon Mod items have a Modifier rule selector; an exact standard mod name also works for older items. Custom names/descriptions have no automatic effect. Inherent modifiers are selected on the Weapon itself and do not consume crafted mod slots. Artifact, Unblockable, and Undodgeable cannot be crafted through the mod-drop workflow (p.103); use inherent properties for weapons that already have them.

Automated calculations cover Artifact/Colossal/Visceral attack dice, Precise rerolls, Great/Colossal/Doublehand hand requirements, Great/Colossal movement, range changes, damage type, Armor bypass, Crushing's Armor rate, and Ferocious/Colossal/conditional Holy potential Wounds. Great includes Ferocious and Doublehand; duplicated properties do not stack. Holy and Ferocious critical bonuses are separate benefits. Affinity selects VIO/GRC/DIA/SAV/WRD/SPI for attacks according to p.103. The dialog asks for an unarmored target (Visceral) or an appropriate Spirit/Demon target (Holy); neither is inferred from an Actor name.

Attack chat reports **potential Wounds before Defense**, not damage already dealt. Actual Defense cancellation, condition application, poison/fire timing, action spending, disarm checks, and movement on the canvas remain manual. The card includes reminders for every recognized modifier and special ammo. Damage conversions that disagree are shown together for table adjudication instead of silently choosing a precedence.

Precise uses one reroll of each original 1, before keep-lowest on nonpositive pools. The brief rule on p.101 does not specify recursive rerolls; this choice is recorded rather than claiming recursive behavior is mandated. Inherent versus crafted properties are separate so named weapon examples can retain inherent properties beyond crafted-slot limits.

## Verification

Local unit tests and installed Foundry 14.364 model/dice checks exercise capacity/refund changes, migration idempotence, recovery data, slot conflicts, accessory persistence, shared ammo stacks, ammo refunds, modifier math, real Precise dice, Affinity, and temporary Active Effect field application. Templates compile with Foundry's Handlebars. These are not live-world tests on the user's remote 14.367 instance.

QA should verify: one Fashion/two hands; no Fashion/Gear Meridian cost; equipped Accessories still occupying Carry; one-time migration/refunds; rich-text save/reload and observer behavior; a +1 VIO Actor effect and equipped-item effect; disabling/expiring effects; two ammo types, depleted stacks, and reload; Precise/Great/Colossal/Crushing/Piercing/Holy interactions; and both linked and unlinked token Actors.
