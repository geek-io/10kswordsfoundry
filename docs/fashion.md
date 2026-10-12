# Fashion

As of 0.1.14, Fashion uses the single Fashion Gear Slot and does not spend Meridians. Stowed Fashion occupies Carry. The upgrade routine refunds recorded earlier Meridian charges; see [Equipment](equipment.md).

Create an Item with type **Fashion**. Enter **Armor increase** and **Ardor increase**, both nonnegative whole numbers defaulting to 0. Use **Abilities** for notes. Drop it onto a character, then click **Equip** in the Fashion section. Copies start unequipped, including copies dragged from another character.

Equipping adds the Armor bonus to both maximum and remaining Armor. The Ardor bonus increases maximum Ardor; because burnt and installed Ardor stay unchanged, available Ardor increases by the same amount. Editing equipped bonuses applies only the difference. Unequipped edits do not change resources. Multiple equipped Fashion items add their bonuses once each; quantity does not multiply them.

Unequip removes the bonuses, flooring remaining Armor at zero. Remove deletes the owned item and removes any applied bonuses in the same save. If removing or reducing an Ardor bonus would put maximum Ardor below burnt plus installed Ardor, the change is blocked with a message to free up Ardor first. The item and resources remain unchanged. Sidebar templates are independent of owned copies.

Use the sheet's Equip, Unequip, and Remove controls for these adjustments. Direct console/macro changes to embedded Fashion items bypass this sheet workflow. Abilities are notes, not automated effects. Existing Armor items retain their type and data; create a Fashion item to use the new bonuses.

This behavior follows the user's Fashion request rather than inferring outfit limits or costs from the rulebook. Local automated tests cover resource deltas, defaults, editing, removal, queued toggles, permission checks, and Foundry data-model validation. Remote Foundry 14.367 sheet testing is pending.
