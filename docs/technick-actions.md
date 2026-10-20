# Technick Special Abilities — 0.1.43

The Sect Technick catalog now contains 69 Special Abilities across 64 of its 74 items. The ten passive-only or modifier-only entries do not receive a misleading free attack button. Source pages remain on each item and action. Definitions are maintained in `tools/technick-abilities.py` and reapplied by `tools/extract-sects.py`.

Open an item’s **Special Abilities** tab to inspect its configuration. On a character, use **Combat → Special Abilities**. Stock configured Technicks no longer show a second generic Activate button that could charge the costs again. Their Release control remains available when Ardor is installed.

## Attacks

Weapon-based actions prompt for a qualifying wielded weapon and inherit its Cultivation, upgrade bonus, modifiers, and selected ammunition. The Special Ability pays its own AP and Ardor costs, rather than adding the weapon’s ordinary AP cost again. One shot is spent for one configured attack; area selection and multi-weapon sequences remain manual.

- **Six Demon Cutting Sword**, p.127: Great/Colossal requirement; 2 AP, 1 Burn; +2 dice; Crushing and Blaze; an extra Wound for each surviving 5 or 6. These stack with applicable weapon properties. The additional Wound is CUT: if the base weapon has another damage type, resolve the mixed damage manually rather than treating every Wound as the base type.
- **Spiteful Disembowelment of Seraphim**, p.129: +4 dice, Ruination, Crushing, all Strikes Critical, and Uninterruptible. Linked Defense only cancels these Strikes with Perfect Defenses, and the Interrupt dialog rejects this attack.
- **Death Maiden’s Atomic Blade**, p.133: a Dagger/Sword/Saber is required. Rolled 4+ results become 6s for resolution; the chat note explains that the original dice display is unchanged.
- **Sidhi Bullet**, p.140, and **Heart Immortal Palm**, p.141: configured SPI attacks with +2 dice, Burn damage, and their printed costs. Holy’s conditional target-specific benefits remain manual.
- **Sword of Logic**, p.175: DIA vs SPI, +2 dice, Trauma, 10m, with the ordinary 1 AP Attack cost (p.64). Its permission to defend with DIA remains manual.
- **Glinting Light Sword Draw**, p.168: an activation reserves 3 Ardor; its separate Surprise Attack releases the reservation and adds the +3 Surprise bonus (p.73).

The editor exposes weapon requirements, inherited damage, modifier names, range, bonus Wounds, Critical conversion, and Uninterruptible settings. For renamed weapons whose category is not otherwise encoded, put Sword, Saber, Dagger, Gun, or Polearm in the weapon’s name or Tags as appropriate. Gun/Crossbow ammunition-family settings are also recognized.

## Activations and remaining manual resolution

Fixed costs are charged by the named action. Installation activations reserve Ardor on the parent Technick, so Release can refund it. Chthonian Seraph Body, Single Point Meditation, Aswang Fang, Negation Cut, and Mock Heaven include their printed prose installation costs. Transmutation has separate actions for material transmutation and Chakra Elixir creation. Variable-cost abilities prompt for Burn Ardor; their recovery or subsequent bonuses remain manual.

Triggers and eligibility described in the action still need to be checked: entering Samadhi, wounding a target, available materials, line of sight, ranges, target size/Sidhi, and similar conditions are not all enforced. A parent item tracks one active installation; use separate item copies and manage separate targets manually when tracking multiple concurrent marks, clones, or Fangs.

Multi-attack actions such as Gun Devil Witch Dance, Abolish the Present State of Things, Panta Rhei, and Threefold Hell Lotus provide a cost-paying activation with instructions. Resolve their individual attacks/possibilities manually, avoiding duplicate AP or Ardor charges and discarding unused results. This update does not automate those sequences, movement, summons, healing, transformations, timed effects, or all conditional bonuses.

Scythe of Words uses a Check rather than a damaging Attack, with a separate zero-cost maintenance check. Compare the opposed totals manually; its stopping effect does not deal damage.

## Recorded ambiguities

- **Nothingness Avatar**, p.161, prints a Burn cost but describes installed Ardor. The action retains the printed 4 Burn / 1 AP and warns the user to resolve the contradiction with the GM. No installation or Samadhi duration is invented.
- **Ten Thousand Screaming Razors**, p.133, does not print an attacking Cultivation. GRC is an editable suggested pool, explicitly identified as such in the action notes.
- **Body Cauldron**, p.140, uses the ordinary Empty Hand Attack cost (1 AP, p.64) with its +3m range. Apply other Empty Hand bonuses manually.
- **Elemental Dragon Style**, p.141, offers SPI or WRD plus Sidhi. The repeatable action defaults to SPI, automatically adds Sidhi, and allows changing the pool in its prompt. Set its damage type to the manifested element in the editor; the book does not specify one universal damage type.

## Existing imports

The active GM runs a one-time repair on world items, character-owned items, and unlinked token actor items. Only matching stock names and source references with empty action lists are filled. Custom action lists, renamed/homebrew copies, and changed activation costs are not overwritten. No actor AP, Health, or current Ardor is spent by the repair. Fresh compendium imports already include the actions.
