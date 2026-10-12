# Item and World Being importers

Open **Importer** from the Items, Actors, or Compendium directory. Both use one persistent window with three tabs: Item Importer, Mass Importer, and World Beings. Select the World Beings tab for Actor imports. You need the corresponding Item/Actor creation permission.

## Single items and a manual batch

Choose a destination Item folder and type, enter details, then Create item. The window stays open and keeps the selected type/folder ready. Switching item types preserves unfinished drafts. Edit last created opens artwork, effects, weapon mods, or Job grants in the full editor.

Add to batch queues the current item. Switch types to build a mixed queue, then Import queued items. Folders are displayed by hierarchy, alphabetized within each parent. Successful entries leave the queue; remaining entries stay available.

Supported types: Weapon, Fashion, Gear, Accessory, Ammo, Job, License, Technick, Magick, Trait, Weapon Mod, World Being Gambit, and Salvage. Sect accepts homebrew text; License rank is Novice, Expert, or Master. Jobs require all six Cultivations.

## Mass Importer

1. Choose destination folder, JSON/CSV/Rulebook text, and a default item type.
2. Paste content and/or choose files. Limit: 200 items / 2 MB per batch.
3. Press Preview entries. Check the detected count and names before importing; nothing is created yet.
4. Review the notes and editable JSON, then Import preview. The window remains open after success or failure. Successful entries leave the preview; failed entries remain available to correct. Importing a fresh preview again creates fresh copies; there is no automatic existing-name skip.

### Multiple Traits from the book

Select Rulebook text and Trait. Include each complete numbered heading, such as `1 1 Animal Magnetism` or `2 4 Adamance`. Whole pages with those headings split automatically. Numbered World Being Traits such as `3 — Dragon Eye.` also split.

For unnumbered or unusually copied text, start every entry with `Name:` or put a line containing `---` between entries:

```text
Name: Example Trait One
First description, with wrapped lines allowed.
---
Name: Example Trait Two
Second description.
```

If preview shows one item when you expected several, add separators and preview again. Names use Title Case, while descriptions join layout line breaks into paragraphs. Original rules prose remains available for review; arbitrary narrative effects are not turned into executable mechanics.

### Structured files

JSON accepts an array, one item, or an object containing an `items` array:

```json
[
  {"name":"Example Bow","type":"weapon","system":{"weaponType":"ranged","range":20,"bonus":1,"affinity":"Nimble","description":"Example text."}},
  {"name":"Example License","type":"license","system":{"sect":"Homebrew Sect","rank":"novice","prerequisites":{"vio":2}}}
]
```

CSV supports nested field paths and a quoted system JSON column:

```csv
name,type,system.magCost,system.description
Example Gear,gear,20,"Example description."
```

Item schema fields are validated. IDs, ownership, and arbitrary top-level metadata are not imported through the mass item path. Configure effects in the item editor. Special Abilities retain the `system.specialAttacks` data key for compatibility.

## World Beings

Paste complete blocks using the core-book format on pp.216–217: uppercase name, HEALTH line, SIDHI/ARDOR/MOV, six Cultivations, and bracketed sections such as `[R HAND]`, `[FASHION]`, `[TRAIT]`, `[ITEMS]`, `[LICENSES]`, and `[MICROCOSMIC ORBIT]`. Numeric and star Cultivation ratings work. Multiple complete blocks are supported, up to 50 per batch. Text files may also be uploaded.

Preview lists each Actor and its embedded items. Matching uses world Items first, then visible Item compendiums, by normalized name and compatible type. Full matched documents are copied. Preview notes identify the source; duplicates resolve deterministically with world Items preferred. Microcosmic Orbit matches only Technicks/Magicks. Missing names create embedded placeholders; inline details fill Description, and name-only entries have blank descriptions. Inline Magicks can extract explicitly printed AP/Ardor symbols and attacking/defending pools. Review all inferred values before importing.

Actors are created in the Actors root. Full source text is retained in Notes. Printed Health, Armor, and Ardor totals are preserved; equipment and Trait effects start inactive to avoid automatically adding bonuses already included in the block. Review and equip/activate them as appropriate. Carry costs are calculated, including recorded overage. Existing world items are copied, never modified.
