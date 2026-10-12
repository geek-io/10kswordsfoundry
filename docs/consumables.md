# Consumable recovery

Rules 2.0.3: p.94 provides the four recovery items; p.64 lists chugging a potion/drink or taking drugs as an Action; p.67 explains Health healing.

Edit a Gear item and enable Consumable recovery. Choose Health and burnt Ardor amounts, or full recovery, plus the AP cost. These fields are also available in the universal item creator and structured imports. On a character, open Inventory → Gear and press Use. Confirming consumes one quantity and applies actual saved resource changes; a persistent Active Effect is not used for one-time recovery.

The four catalog entries are Chakra Pill (1 burnt Ardor), Magnesium Pill (2), Healing Vial (1 Health), and Soma (all Health and burnt Ardor). Installations, Samadhi/rest flags, Armor, and conditions are unchanged. Existing copies need their recovery fields configured or a fresh compendium import.

The action checks quantity and AP again when saving, serializes against other equipment uses, and caps healing at the effect-adjusted maximum. No benefit means no item/AP spent. AP is charged only when the actor is in combat and the current combat has started. Last-item consumption releases tracked Carry; a zero-quantity item remains for editing/replenishment. Chat failure reports that the already-saved use succeeded rather than repeating recovery.

This pass supports self-use of recovery Gear only. Feeding another actor, timed buffs/debuffs, damage, immunities, and other consumable prose are not automated. No cost, currency purchase, or Full Rest is inferred from drinking an item.
