# Job items

The character sheet has a dedicated **Job** drop area with an Edit button for the applied item. It is not a text field. Jobs are excluded from Gear & Abilities. All Cultivation fields now follow VIO, DIA, GRC, SAV, WRD, SPI.

Create a **Job** in the Items sidebar. Choose **Job of the Body** or **Job of the Mind**, then enter Violence (Vio), Grace (Grc), Dialectics (Dia), Savvy (Sav), Word (Wrd), and Spirit (Spi). Drop it onto a character sheet to apply it. The actor keeps one owned Job; replacing it swaps the previous Job’s granted items for the new loadout while preserving manually added items and accounting for resource changes. The sidebar Job remains an independent template.

Job data is user-entered. No creation wizard or automatic selection of starting choices is generated. Use the Starting Items & Traits drop zone to specify the loadout. Rules source for Jobs: the supplied 2.0.3 PDF, pp.40-43. Preservation of manual adjustments on replacement is the user's requested software behavior.

The applied Job values are tracked separately from manual changes. Example: a Job sets Vio to 2, then the player changes it to 3. Replacing it with a Job whose Vio is 4 yields 5 (4 plus the manual +1). Manual reductions also persist, with displayed ratings floored at zero. Repeated drops do not stack bonuses. Changes to the owned Job's stats also recalculate the character. Editing the sidebar template does not change existing owned copies.

On the **first Job drop**, differences from the original default Cultivation rating of 1 are treated as manual adjustments. Older characters have no history separating manually entered Job ratings from other edits; review those characters before applying their first Job. The old free-text Job field alone cannot establish a stat baseline. Deleting an owned Job does not retroactively remove applied values; the last baseline is retained for future replacement.

Stored totals and tracking fields persist with the Actor and therefore work with linked Wanderers and independent token Actors. Existing sync copies preserve these fields. Local tests cover replacement, repetition, signed adjustments, zero floors, permissions, and preservation of other data. Live Foundry drop/edit verification remains pending.

## Starting Items & Traits (0.1.31)

Drop Item or Trait documents into the Job editor's Starting Items & Traits area. The Job stores snapshots of their data and configured effects. When applied to a character, each grant is scoped to its Job and copied once; repeating the same Job does not duplicate its grants. New physical items start unequipped. Carry overage is recorded so the loadout can be reviewed.

Editing an owned Job’s grant list removes grants no longer present and adds new ones. Replacing the Job removes the prior Job’s grants, but preserves manually added items. Editing a world template does not retroactively update owned copies. Jobs cannot grant other Jobs. A Job containing a Gambit cannot be applied to a Wanderer. Source documents remain unchanged, and later source edits do not update existing snapshots.

Separate Weapons, Gear, Fashion, and Traits drop areas belong to the current Job only. See [0.1.32](release-0.1.32.md) for replacement behavior.
