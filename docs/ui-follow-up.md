# UI and workflow follow-up — 0.1.23

## Header controls and sidebar

The broad custom button font was overriding Font Awesome on Foundry's icon buttons. The font selector now excludes icon/header-control buttons and has low specificity so existing state colors continue to win. Preview checks confirm native Font Awesome and selected Hale green.

Compendium Browser moved to the Compendium sidebar. It remains the same permission-aware index/search service, not a new content pack. Import Items appears in Compendium and Items sidebars for users allowed to create Items. The requested Gitingest URL was inaccessible to the web reader; the original linked browser source reviewed in docs/ui-archive.md remains the architectural reference.

Combat contains Health, conditions/actions, readied combat items and Defense. Inventory retains ownership/equipment editing. Overview contains general Cultivation checks and Rest. No global Foundry sidebar theme is imposed.

## Legacy Armor compatibility

Armor is excluded from item creation and normalized to Fashion on load and import. The old schema identifier remains declared solely so existing stored documents can still be loaded safely. A custom Item migration preserves the original system data under flags.10kswordsfoundry.legacyArmor, retains document IDs/effects/ownership, and converts type to Fashion. On the next active-GM ready pass, world and owned/token items are persisted. Compendium entries convert when loaded; locked compendiums are not rewritten.

The old generic Bonus field had no defined Armor mechanic, so it is preserved but not guessed into a Fashion bonus. Armor/Ardor bonuses default to zero unless explicitly present. Existing equipped slot conflicts need review; items are not silently discarded or unequipped. Original data is retained in the recovery flag.

## Interrupt resolution

Sources: rules 2.0.3 pp.25, 64–66, 100–101. Select a visible recorded attack and choose Clash or Sabotage. Roll first, resolve the interruption before applying the original attack's damage.

Clash uses an equipped weapon, its default Cultivation/Affinity, attack/upgrade bonuses, Precise, injury, check/attack effects, Samadhi and an optional adjustment. Matching die faces cancel one-for-one (including non-striking faces); remaining 4–6 results inflict potential Wounds without Defense. The report calculates incoming Armor/Health loss for the interrupting actor and outgoing pre-Armor Wounds. It costs the weapon's Actions, including two for Colossal, and spends tracked ammo. Stun blocks Interrupts; attack/hostility conditions apply. Canceling spends nothing.

Sabotage is an appropriate Cultivation check (player selected), compared against the incoming recorded attack's total successes. Success reports -2 ATK for a revised attack or table-adjudicated disarm; ties call for an opposed reroll. It does not pretend -2 dice means removing two already-rolled Strikes. Disarming can add the wielded tag bonus; Worn blocks a disarm attempt. This establishes a usable default opposed roll while allowing the Intercessor to adjudicate another opposing Cultivation when the fiction warrants it.

Results are stored as linked Interrupt chat flags and reported only. They do not automatically rewrite the original message or apply damage to another user's actor. Do not apply both the original and interrupted result against the same defender. Multiple-target interruption, two-level interrupt ordering and revised sabotage rerolls still need table coordination. Resolve situational Clash bonuses through Other adjustments; target-dependent weapon effects still require adjudication.

## Validation

Unit tests cover import parsing/aliases, CSV quoting, Job extraction, recovery conversion and face-by-face Clash cancellation. Importer records validate against the real installed Foundry 14.364 models. A real-dice integration case tests Clash output, action spending and cancellation with UI/document transport stand-ins. Isolated UI previews verify font preservation and colors. Live 14.367 confirmation remains necessary for sidebar hook rendering, legacy world conversion, actual import creation, and linked Interrupt play.
