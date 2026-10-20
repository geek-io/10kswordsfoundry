# Area targeting

Magicks, Technicks, and Special Abilities offer an Area section when used. Explicit item settings supply the defaults; otherwise the prompt recognizes explicit dimensions in the description. Existing imported Scathe copies use a 1 m burst with a 6 m placement range.

Choose the shape, radius/length, and placement range, then confirm the ability prompt. The sheet minimizes while Foundry's native Region preview follows the cursor. Left-click confirms, the mouse wheel rotates blasts and lines, and right-click or Escape cancels. Cancellation spends no AP, Ardor, or weapon ammunition. The sheet then reopens.

Confirmation replaces the current user's targets with visible actor tokens whose centres fall inside the area on the viewed scene level, including allies and the caster if inside. Hidden or unseen tokens are not revealed to players. The preview disappears after confirmation; the attack's chat flags retain its geometry and target IDs. Each target still resolves its own linked Defense. This does not automatically apply damage or conditions.

The selector is a temporary preview, so it does not require permission to create persistent Regions or leave unused templates behind. It uses Foundry 14's documented [Region placement API](https://foundryvtt.com/api/classes/foundry.canvas.layers.RegionLayer.html#placeregion) and TokenLayer targeting.

## Rules and boundaries

Equipped Hermetic Robes (p.135) add 1 m to Magick area pattern sizes through a transferable Active Effect. Scathe therefore has a 2 m radius, with its 6 m casting range unchanged. The casting prompt displays the active bonus and applies it after the entered base size and any enhancement. Single-target Magicks, Technicks, and weapon attacks do not receive this bonus. Verify or disable it in the robes' Effects tab; the variable dropdown calls it **Magick area size bonus (m)**. Existing recognized Fashion copies receive the effect on GM world load; existing changes to that variable, including disabled effects, are preserved.

- Rules 2.0.3 p.76: Burst X is a radius of X metres. Blast X is a triangular cone X metres long and X metres wide at its end, starting within 1 m of the caster. Line X is X metres long and normally 1 m wide.
- Scathe, p.135: 1 m burst within 6 m. Its placement is limited to 6 m from the caster token's centre.
- Ten Thousand Screaming Razors, p.133: 7 m blast cone; the casting prompt supplies a 1 m origin range.
- One scene distance unit is treated as one metre. Configure the scene's grid distance accordingly.
- Inclusion uses token centres on the current level and the horizontal footprint. Walls, cover, vertical volumes, and partial token overlap are not resolved by the selector; the book does not specify a token-overlap convention. Resolve those cases with the GM.
- For abilities with random or conditional branches, choose the correct shape/size in the prompt, or choose Single target for a branch without an area. Description recognition supplies a default, not a branch decision.
- For self-centred areas, position the preview on the caster. Range 0 in the use prompt means unrestricted placement.
