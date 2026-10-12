# Version 0.1.32

Install `dist/10kswordsfoundry-0.1.32.zip` by replacing the system folder as with prior releases, then restart Foundry and reload the client. Rules remain 2.0.3. No Git operations or remote deployment were performed.

## Effect values

On a Trait's Active Effect, choose the Word variable (`system.cultivations.wrd`), Add, and enter `System.Level` in Value. Enable transfer to the Actor and activate the Trait. A Level 1 Trait adds one die; Level 3 adds three. The original Word rating is not overwritten. `@system.level` and `@item.system.level` are equivalent. Explicit Actor references use `@actor.system.<field>` and read saved base values. Variables must be numeric; unsafe/missing paths are rejected with a console diagnostic. Foundry evaluates arithmetic after substitution.

The bundled Animal Magnetism effect is conditional: activate it only for the WRD checks described in its rules, then deactivate it. Adamance provides its maximum-Health bonus while active. These two effects are included as useful examples; the remaining Traits preserve the rules text without claiming to automate every condition, time limit, or narrative effect.

## Job replacement

Each Job stores independent item snapshots. Changing Jobs removes items tagged as grants from the prior Job, preserves manually added items, and adds the new loadout. Saved stat adjustments remain separate from Job ratings. Repeated application does not duplicate grants. Newly granted gear starts unequipped. Removing equipped Fashion may require freeing burnt/installed Ardor first; failed changes leave the Actor untouched. Editing an owned Job's grant list updates that character's grants; editing a world template does not alter other Jobs or existing copies.

## Compendium coverage

The new Grimoire Traits pack contains exactly the 36 d66 Traits, 11 through 66, on PDF pp.114–120. The introductory prose and Traits Are Dynamic guidelines are not incorrectly bundled into item descriptions. Page 118's Primafascist heading note remains in that Trait's Description. Source-page and d66 references are stored on every entry. No content from pp.121–122 is included in this requested range.

## QA on Foundry 14.367

1. Confirm one Importer button per Items/Actors/Compendiums directory; all three importer tabs still work.
2. Open Grimoire Traits and confirm 36 items. Preview a World Being with one Trait in the world and one only in a compendium. Preview notes should name the selected sources; the copied descriptions/effects should match. Repeat with duplicated world/pack names; world Items take precedence. Unmatched items still become explicit placeholders.
3. On a Trait, set the Word effect Value to System.Level. Change Level from 1 to 3 and roll Word. Confirm the pool increases by the current Level while source Word stays unchanged. Deactivate the Trait in Identity to remove the bonus.
4. Give two Jobs different loadouts and edit them side by side. Apply Job A, manually add a separate item, then apply Job B. A's grants should be replaced, the manual item should remain, and costs/bonuses should reconcile. Reapply B and confirm no duplicates.
5. Verify Traits appear in Identity and retain description tooltips, sorting, and activation controls.

Local verification includes 133 unit tests, installed Foundry 14.364 field/dice engines with simulated document transport, model checks for 36 Traits and independent Job arrays, headless templates, compendium read-back including effects, and ZIP validation. This is not a live remote-world test.
