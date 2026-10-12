# Equipment (0.1.14)

The three Gear Slots are **Right Hand, Left Hand, and Fashion** (rules p.39). Accessories occupy Carry, not a fourth Gear Slot. Only Magick and Technicks use Meridians (p.124); their editable Meridian cost defaults to 1. Fashion, weapons, Gear, Armor, Accessories, and Ammo never spend Meridians.

Drop an item onto the character to carry it. Equip a Weapon to assign a free hand, or choose its hand on the item sheet. Both-handed weapons occupy both hands. Fashion occupies the single Fashion slot. A conflicting equip is rejected without displacing other items. Other Gear/Armor can be assigned to Carry, a hand, both hands, or Fashion. Use Fashion items for automatic Armor/Ardor bonuses.

Readied gear uses its Gear Slot instead of Carry. Spare copies in a quantity stack still use Carry. Accessories always use quantity × Carry slots each, equipped or not. Stowed physical equipment does likewise. Ammo uses one Carry slot per nonempty ammo type across matching stacks. Custom ammo is grouped by item name. These costs are tracked when dropping, editing, equipping, unequipping, or removing through the sheets. Changes with insufficient space are rejected; migration can show existing Carry overage without discarding gear. Equip/Unequip controls also gate transferred Active Effects.

On the first GM login after updating, the system corrects world Actors and unlinked token Actors, refunds recorded obsolete Meridian charges, and recalculates Carry. A recovery copy is stored in the Actor flag `10kswordsfoundry.inventoryBackupV14`, and `inventoryVersion` prevents repeat refunds. Existing conflicting equipment is preserved for review rather than silently removed. When more weapons are equipped than hands permit, extra weapons remain unassigned; resolve them by unequipping or assigning a free hand. Older manual Carry/Meridian adjustments cannot be inferred; review characters whose capacities were manually reduced as well as automatically charged.

Fashion resource bonuses retain their previous behavior. Removing capacity below already burnt/installed Ardor is blocked before any partial item or capacity update. Generic Armor items retain their old data and can be assigned a Gear Slot, but they do not automatically gain Fashion bonus fields.

Use the sheet controls for bookkeeping; direct macro changes bypass this workflow. Sidebar templates and owned copies remain independent. Full conflict action budgets, opposed Defense resolution, and injury application are not automated by this update.
