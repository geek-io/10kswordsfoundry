# 0.2.36 testing and validation

Scope: **Cultivator Discovery**, the in-app 2.1 character creation tool (2.1 rulebook pp.42-48, 62, 166), and the nine Class entries of `options-21` brought in line with the rulebook. 2.0.3 untouched.

## Tests

`node --test`: **303 pass / 0 fail** (289 before; 14 new in `tests/discovery21.test.mjs`).

Rules (pure, `discovery-rules21.mjs`):

- Every Class against the printed values on pp.44-48: 3d6 range, Core Stars, Cultivation counts, Asset Stars, Macca multiplier; Proletariat is the default.
- 3d6 totals 3-18 each land on one Class; the three d6 sub-tables cover 1-6.
- The Name table: 11 rows by 10 columns, spot-checked cells, 11 and 12 sharing the last column.
- A blank draft lists what each Sutra needs; a finished Proletarian passes all eight.
- One broken rule at a time: a Core value the Class does not give, an unassigned Core, too many Cultivations at a rating, a rating the Class does not have, too many Asset Stars, an Asset outside its Star range, an Asset that is not one of the 36, Supply over budget, a free line costing nothing, a missing Heart Attachment, a blank Attachment, one License too few, a License above ✦✦, a License of another Sect, missing Sidhi color and Ajna.
- The Actor data a draft becomes: Cores, all 30 Cultivations, the Sect Cultivation at ✦✦, Attachments, Macca left, Sidhi 0, notes.
- Stored drafts are normalised; the chat card escapes player text; who may open a card.

Tool (`discovery21.mjs`, against a minimal Foundry stand-in, not a live Foundry):

- Working on a draft creates no document. Save creates one card whispered to the GM and the player; saving again updates that card, and Cultivations removed from the draft do not linger on it.
- The card opens for its player and for a GM; another player is refused and the button is removed for them.
- Each roll button (Class, sub-table, Macca, Name, Culture, Alignment, Asset, random Supply) sets the draft and is logged; none posts to chat. Choosing a Sect sets its Cultivation and Barang; Licenses above ✦✦ or from another Sect are refused.
- Before creation, prices and License Stars are re-read from the compendia and corrected; entries no longer in a compendium are reported.
- A player cannot create the character. A GM can: the Actor has the right owner, Items in order (Barang ingested, Class with its sub-type, Culture, Alignment, Asset with Stars and detail, Licenses, Supply with ammunition counts), Macca left, and the card is marked created with the Actor's id. A created Discovery cannot be saved over or created twice.
- An unfinished Discovery lists its gaps in the GM's dialog; declining creates nothing.

## Other checks

- `node --check` on every script.
- The window template was parsed and rendered for all nine steps with a small stand-in for Handlebars (it supports only `if`, `unless`, `each`, `else` and plain values, which is all the template uses), using the real context from the tool, and each step was looked at as a screenshot with the system's style sheets. One layout fault was found and fixed (dropdowns stretching in rows). This is not Foundry's own renderer or window chrome.
- `tools/options21/patch_rulebook_classes.py` changed only the nine Class entries; the other 108 entries of `options-21` are identical to 0.2.35, and all ids are unchanged.

## Assumptions and gaps recorded

See "Added in 0.2.36" in `docs/rules-basis-2.1.md`. In short: the random Lumpenproletariat item is drawn from Common market entries; Debt and Patron gear is added by hand as a free Supply line; "qualified for" means the License needs the Sect Cultivation at ✦✦ or less; Sect Gear is not sold in the Supply step; one Culture name ("Vatuanese") was not found in the rulebook's Culture pages.

Known limits:

- If the GM and the player have the same Discovery open, the last Save wins.
- A player whose Discovery was started by the GM cannot update the GM's card; their Save makes a new card.
- Dice rolled in the window do not show in chat or with Dice So Nice.
- The Licenses are added to the character but not slotted into Meridians.

## Not verified here (pending at the table)

Nothing in 0.2.36 has been run inside Foundry. To check:

- The **Cultivator Discovery** button appears in the Actors tab in a 2.1 world, for a player and for the GM, and not in a 2.0.3 world.
- The window opens, the nine steps switch, and typing in a text field does not lose focus.
- The Supply shop lists the six catalogs with prices; search and the catalog filter work.
- Save to chat posts a whispered card; Open Discovery works for the saving player and the GM.
- Create character makes a Wanderer the chosen player owns, with the Items listed above, and the 2.1 sheet shows them correctly.
- Closing with unsaved changes asks first.
