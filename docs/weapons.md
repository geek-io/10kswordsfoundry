# Weapons

**0.1.14 update:** see [QA update](qa-update.md) for selectable Ammo stacks, automated modifiers, and Affinity. The older inline-ammo workflow remains supported.

Create Weapon Mod items using just Name and Description. Open a Weapon and drag a mod into a Mods slot. Hover or keyboard-focus the name for a description box. Drop another mod into the same slot to replace it, or use Remove. These are saved copies: edits to the sidebar template do not change installed mods. Known modifiers use a rule selector or a matching standard name; their mechanical behavior is described in the QA update. Custom descriptions remain notes.

## Cost

The Cost section records the weapon's Magnetite (Mag) price as a nonnegative whole number, defaulting to 0. It persists on the item and its owned copies. Purchases and character currency remain manual.

## Ammo

Enter an optional Ammo type and quantity on a Weapon. A blank type disables tracking, even if a quantity is present. When Attack is checked and that equipped weapon is selected, one round is spent before the roll, on a hit or miss. At zero the attack is blocked with: **Out of ammo, please reload or use another weapon**. Ordinary checks, Unarmed, cancelled dialogs, and invalid inputs spend nothing. Reload by editing quantity; no reserve inventory is deducted. Each attack spends one from the weapon item, independent of its inventory quantity. Ammo carry costs are not automated.

Ammo changes and equipment actions share a local Actor queue, preventing rapid local clicks from spending the same last round twice. A failed roll attempts to restore its reserved ammo. Simultaneous edits from separate connected clients are not a server-wide transaction; coordinate control of a character when spending its last round.

## Upgrades

| Path | Added attack dice | Total DR | Total mod slots |
| --- | --- | --- | --- |
| Unupgraded | 0 | 4 | 1 |
| Refined Form (+1) | 1 | 8 | 2 |
| Divine Form (+2) | 2 | 12 | 3 |
| Immortal Form (+3) | 3 | 16 | 4 |

The selected tier is added to the editable Base attack bonus. Tiers do not stack; Divine adds 2, not 1+2. The weapon displays its effective attack bonus and DR, with a description of the required blacksmith stage, Siderite, and Magnetite. Purchasing, blacksmith work, currency, and crafting rolls remain manual. DR is calculated on the weapon, not applied to character Armor or used to automate damage. Existing weapons default to Unupgraded, no mods, blank ammo type, and blank Affinity. If an old Base attack bonus already includes an upgrade, remove that portion before choosing the corresponding tier.

## Affinity

The optional text field suggests Brute, Nimble, Noetic, Keen, Lyric, and Occult but accepts custom text. Nonblank Affinity reserves one mod slot. Remove mods from slots that would be locked before setting an Affinity or lowering an upgrade; the sheet rejects the change rather than deleting mods. Affinity now chooses the corresponding attack Cultivation automatically (VIO/GRC/DIA/SAV/WRD/SPI respectively). Defense checks remain manual.

## Rules sources

Authority: the user's **10,000 SWORDS AGAINST HEAVEN 2.0.3 (1).pdf**. Page 100 defines ATK as dice added to the Attack Pool. Page 101 requires spending ammo before applicable weapon attacks. Page 102 gives base 4 DR and upgrade bonuses: Refined +1 ATK/+4 DR, Divine +2/+8, Immortal +3/+12. These are interpreted as tier bonuses over the base, not cumulative purchases. Page 103 sets upgraded mod limits at 2/3/4 and states Affinity occupies a mod slot. The base limit of one slot follows the user's request to unlock an additional slot per upgrade. Named weapon examples can have inherent properties beyond crafted mod limits; those can be recorded in the weapon description.

Local tests cover tier calculations, slot/affinity limits, mod drops/removal, snapshot independence, escaped tooltip text, last-round use, failed-roll refunds, and Foundry model/dice integration. Remote Foundry 14.367 interaction verification is pending.
