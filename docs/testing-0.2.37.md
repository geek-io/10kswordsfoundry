# 0.2.37 testing and validation

Scope: seven notes from the first table test of **Cultivator Discovery**, and the automatic encumbrance Check penalty on the 2.1 sheet (p.182). 2.0.3 untouched. No compendium changed.

## Tests

`node --test`: **306 pass / 0 fail** (303 before; 3 new, 3 extended, in `tests/discovery21.test.mjs`).

- Rolls: the nine rolls of a full run each post one roll message with its formula, total and label; no Discovery card is created by rolling.
- Core and Cultivation lists: a blank Proletarian is offered ✦✦✦, ✦✦, ✦; after both ✦✦✦ are placed the other Cores are offered ✦✦ and ✦ only; a Core keeps its own value in its list; with every Star placed an empty Cultivation is offered nothing.
- Carry: 14 kg of 20 kg is fine; 28 kg is tier 2 with the p.182 text; 42 kg is tier 3; over Carry is a Supply note and never an issue. In the tool, the add that crosses the limit warns once and is still added; a further add in the same tier does not warn again; the next tier does.
- Market: filtering by Head lists only the helm; armor rows carry "Head 2" and "Right Arm 1, Left Arm 1, Torso 1".
- `stateModifiers`: encumbrance 2 gives "Over Carry Limit" -2; with the Encumbered condition ticked only its -4 applies; no encumbrance, no modifier.
- Descriptions reach the window for chosen Assets, the Asset preview, Culture, Alignment, Licenses and market items.
- Creation: weights are re-read from the compendia with prices; two magazines bought become two Items of 32.

## Other checks

- `node --check` on every script.
- The template was parsed and all nine steps rendered with the stand-in renderer (now also handling unescaped `{{{ }}}` blocks) and the Assets and Supply steps were looked at as screenshots.

## Assumptions recorded

- All rolls in the window post to chat, not only Class; the reason given for Class applies to each.
- Roll messages are public; the saved Discovery card is still whispered.
- "Identity" in the note on the Identity tab was read as Alignment.
- The armor-by-Part search was put in the Supply step's market (the note said Assets).
- Tooltips use Foundry's `data-tooltip-html`. If they do not appear, the same text is one click away on the entry.

## Not verified here (pending at the table)

Nothing in 0.2.37 has been run inside Foundry. To check:

- Roll 3d6 posts a dice roll to chat each time.
- Core and Cultivation dropdowns shrink as Stars are placed and grow back when one is cleared.
- Asset, Culture and Alignment text shows and scrolls inside its box.
- Hovering a License or a market item shows the description tooltip, readable and not cut off.
- "Covers Head" and the other Part filters list the right armor.
- Adding gear past the Carry Limit shows the warning, and the created character's sheet shows the lower Movement, higher Recovery and the "Over Carry Limit" line in a Check.
