# 0.2.34 testing and validation

Scope: **2.1 Assets re-imported from the 303-page 2.1 rulebook** (plan step 11): `data/assets-21.json` and its pack, the `ASSETS_21` table, and Hummingbird Pulse on the Ticks tracker. 2.0.3 untouched.

## How the import was checked

- The block reader found all 36 Assets on pp.211-218 with code, name, Star range and text; the generator stops unless the 36 codes match the system's keys.
- Every regenerated Asset was word-diffed against the previous catalog: 26 identical, 10 changed. Each change was read against the page text.
- Star ranges were compared with `ASSETS_21`: one difference, Hummingbird Pulse (now ✦✦✦ only), confirmed from the block positions on p.216.

## Tests

`node --test`: **285 pass / 3 fail**. The two Asset tests that had been failing since the earlier book now pass. New assertions: `readyDice21`, the `2d6kl1` first-READY formula for Hummingbird Pulse, Speed without Hummingbird Pulse, the 36-Asset catalog with pages 211-218 and four changed texts. Remaining failures are older ones (Suppression Fire, six Cores, Apply damage prefill).

## Assumptions and gaps recorded

- Hummingbird Pulse "take the better result" is read as the lower d6.
- A character who already holds Hummingbird Pulse at ✦ or ✦✦ keeps those Stars; the roll-twice applies at any Star.
- Python Grip's "ignore the SPD penalties from GREAT or COLOSSAL weapons" is text: the book still prints no SPD value for those mods.
- Beastly Claws' cut damage and ✦✦✦ +1 damage are applied at the table.

## Not verified here (pending at the table)

- Rolling first READY for a character with Hummingbird Pulse and seeing two dice with the lower kept.
- The rebuilt 2.1 Assets compendium opening in Foundry and importing over existing entries.
