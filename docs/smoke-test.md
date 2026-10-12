# Foundry v14 smoke test

Status: partial pass, reported by the user on 2026-09-19. Environment: remote Ubuntu server, Foundry VTT 14.367. Initial checks used system 0.1.0; Health/Ardor bounds and correct dice behavior are now confirmed on 0.1.2. These results are user-observed, not agent-executed runtime tests.

Setup compatibility fix: the manifest now includes `verified: "14.367"` for the user's remote server. Foundry v14's creation selector excludes Unknown availability (a missing verified field). The subsequent successful in-world checks confirm that the previous setup blocker is resolved.

## Confirmed by the user

- Created a Wanderer.
- Created an NPC.
- Created an Item (subtype unspecified).
- Equipped the Item to the Wanderer, as reported by the user. This confirms the item workflow used; it does not validate automatic equipment effects, which are not implemented.
- Rolled Violence with accurate Strikes versus Demand, Sixes, and pool size.
- Installed successfully using the README.
- Confirmed persistence after reloading.
- Cancelled a check dialog without a chat message.
- Dragged a sidebar Item onto the Wanderer and opened/edited the owned copy. Changes persisted on the Actor's copy without changing the sidebar original.
- Placed tokens; Health matched the sheet. Editing Health through either the sheet or token persisted.
- Basic checks did not alter resources, as observed by the user.
- On 0.1.2, current Health and Ardor allocations cannot be raised above their maximums. The reported limit problems are resolved.
- On 0.1.2, dice roll correctly. The supplied screenshot shows adjusted pool 0 using `2d6kl1`, with a retained result of 1 and zero Strikes/Sixes.

The user explicitly deferred making the roll wording more natural. Keep current wording until that later pass is requested.

## Reported issues and 0.1.1 changes

- Over-maximum Health could be entered before validation raised an error. Added live input limits and pre-validation normalization for Health and Armor.
- Overcommitted Ardor raised a joint-validation error on a synthetic token Actor. Added live budget limits and pre-validation normalization; the changed allocation is bounded without changing the other allocation. Lowering maximum Ardor stops at the committed/burnt total.
- User reported zero/negative pools as rolling zero. The existing formula builder already returned `2d6kl1`; no empty roll was reproduced locally. Chat now distinguishes the adjusted pool from the two-die fallback, and the sheet explains using negative Adjustments rather than negative ratings. Correct dice behavior was subsequently confirmed on 0.1.2; the original cause was not established.
- Local tests: 12 resource, sheet-boundary, and rules tests passed. Real Foundry 14.364 dice engine passed all 36 face pairs for each of pools 0, -1, -8, plus a positive-pool case. Actual sheet action passed nonpositive pools and cancellation with UI/chat transport stand-ins. This is not a live 14.367 browser test.

## Update history

The user still observed over-limit Health/Ardor validation errors after updating and restarting. The supplied dice screenshot confirms `2d6kl1` is being rolled successfully. Its chat text says `Pool: 0`, matching the original code rather than 0.1.1's `Adjusted pool` text. This suggests stale or incompletely deployed scripts, but the timing of that chat message is not established, so it is not conclusive.

0.1.2 adds a new entry URL, versioned imports throughout the module graph, and an executing-code version in the sheet window title. No new resource rule is introduced. Local tests additionally exercise all four resource overflow submissions through actual Foundry 14.364 preparation methods and model validation; they pass without exceptions. The user subsequently confirmed Health/Ardor limits and correct dice behavior on the remote 14.367 server.

## Remaining checks

0.1.4 follow-up: user reported that the map Wanderer held newer data than the sidebar Actor. Added linked defaults for new Wanderers and a GM recovery action that preserves the map copy as a new linked sidebar Actor, retaining the old entry. Verify two-way updates using the new entry and confirm NPC copies remain independent. See `token-linking.md`. No remote migration has been performed by the agent.

Other Cultivations, all Item subtypes, roll privacy, observer permissions, Armor bounds, and maximum-reduction edge cases remain unconfirmed. The latest confirmation did not separately enumerate directory versus token Actors or every negative-pool value. Actor creation, persistence, owned Item edits, cancellation, token Health, unchanged resources, Health/Ardor limits, and basic fallback behavior are already confirmed and need not be re-reported. The full checklist below remains a reference, not a request to repeat completed checks.

1. Install per README; confirm Setup recognizes the system and a test world starts without console errors.
2. Create each Actor and Item type. Edit, close, reopen, and verify persistence.
3. Verify default resources. Try remaining values above maximum, negative values, lowering maximums, and overcommitting Ardor. Sheet inputs must stay in bounds without validation exceptions.
4. Roll positive, zero, and negative pools. The nonpositive fallback must retain exactly one die. Verify 4+ Strikes and Demand comparison.
5. Cancel a dialog; no chat message should appear. Test public, GM, blind GM, and self roll modes with separate player/GM accounts.
6. Drag a sidebar Item onto an Actor; reopen the owned item from inventory and verify changes persist.
7. Verify observers cannot edit or roll, and owners can.
8. Place a token and check its Health bar against current/max values.
9. Confirm basic checks do not automatically alter resources. Resolve console errors and visual defects before marking v14 verified.

## 0.1.5 pending verification

Supersedes the duplicate recovery introduced in 0.1.4: sync the current token into its existing base Actor, preserving the Actor ID, and then link. A Scene flag stores the pre-change Actor/token snapshots. Test item removals as well as additions and two-way Health changes. Sheet version/instruction text is removed. Negative roll adjustments must show a non-blocking caution and still produce chat. Creation/conflict automation remains planned for the next passes.

## 0.1.7 pending verification

Create Body and Mind Jobs with different ratings. Drop a Job onto a default character; verify all six ratings match. Add a manual +1 to Vio, replace the Job, and verify new base +1. Repeat the drop, edit the owned Job, and reload: totals must not stack and adjustments must persist. Verify unrelated items/resources remain unchanged and sidebar Job templates stay independent. Test both linked and unlinked Actors. Magnetite (Mag) is the currency label. The creation wizard is cancelled; conflict work remains planned.

## 0.1.8 pending verification

Verify the Job drop area has no text input, accepts Job replacements, rejects other item types, and shows the owned Job separately from Gear & Abilities. Confirm Cultivations read VIO, DIA, GRC, SAV, WRD, SPI in row order.

Create a License with a sect/rank, Notes, Vio 3, and Sidhi 2. Drop it onto a character below either threshold: expect the simple qualifications warning and no new owned License. Set both to the exact thresholds and drop again: expect an equipped License in its own section. Unequip/re-equip and reload to check persistence. Lower a required rating: expect a dimmed entry with Requirements not met. An unqualified equip attempt must warn; restoring the rating permits equipping. Raising requirements on an owned equipped License beyond the actor's stats must unequip it. Verify the sidebar template is unchanged and observers cannot equip. Check these paths on linked and unlinked token Actors too.


## 0.1.9 pending verification

Create Fashion: verify Armor/Ardor defaults are 0 and Abilities notes persist. Enter Armor 2 and Ardor 1, drop onto a character, and equip. Both maximum/remaining Armor must rise by 2; maximum/available Ardor by 1. Burnt/installed Ardor must stay unchanged. Edit the owned bonuses and verify only the difference applies. Unequip and Remove must reverse bonuses; a depleted Armor value must never fall below zero. Attempt removal while Ardor is committed above the resulting capacity: expect a friendly warning with no item/resource change. Free the Ardor and retry. Reload, try multiple Fashion items, and verify both linked and unlinked Actors, observer permissions, and independent sidebar templates.


## 0.1.10 pending verification

For each of Fashion, Technick, Gear, and Magick: set Meridian cost 1, equip, and verify Open Meridians decreases by 1; unequip restores 1. Try zero cost, insufficient capacity, edits while equipped, Remove, reload, and two fast clicks. A failed Fashion Ardor removal must refund no Meridians. For previously equipped Fashion, verify unequipping creates no false refund, then re-equip to pay the new cost.

Create a Weapon with quantity 2, carry slots 2, and attack bonus 3. Equip: Carry remaining falls by 4 and Open Meridians stays unchanged. Edit quantity to 3: Carry falls by another 2. Unequip restores 6. Test rejection when capacity is insufficient and refund on Remove. With the weapon equipped, check Attack and select it: dice pool includes +3. Uncheck Attack: no weapon bonus. Equip a second weapon and verify only the selected bonus applies. Choose Unarmed for +0. Verify item names with punctuation render correctly, and changing/removing a weapon while the dialog is open cannot apply stale bonuses. Test both linked and unlinked Actors and observer permissions.


## 0.1.12 pending verification

Create a Weapon Mod and verify only Name/Description fields appear. Drop it into each available weapon slot, hover and keyboard-focus its name, replace it, and remove it. Test sidebar and actor-owned weapons, observer permissions, and persistence. Upgrade through all tiers: total attack bonus must add 0/1/2/3, DR must show 4/8/12/16, and slots must be 1/2/3/4. A downgrade or Affinity must not silently remove an occupied slot. Verify all six Affinity suggestions and custom text.

On an equipped weapon, enter Ammo type and quantity 1. Make an Attack with that weapon: exactly one round is consumed. A second attack must produce the exact out-of-ammo message and no chat roll. Refill quantity, cancel a dialog, and make an ordinary check: no ammo spent. Clear type: unlimited attacks. Verify upgraded attack pools and that unrelated weapons, mods, capacity, and sidebar copies remain unchanged. Repeat with a linked actor and an unlinked token actor. Reload to verify persistence.


## 0.1.14 pending verification

The older equipment-cost expectations above are superseded. Run the QA checklist in [QA update](qa-update.md), including migration, recovery snapshots, Carry overages, rich text, temporary effects, per-item suppression, multiple ammo stacks, modifiers, observer permissions, linked Actors, and unlinked token Actors.
