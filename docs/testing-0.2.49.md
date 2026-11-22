# 0.2.49 testing and validation

Scope: two table notes on Cultivator Discovery (2.1) after 0.2.48. 2.0.3 is untouched.

## Changes checked

- Checkboxes in the Discovery window: fixed to Foundry's checkbox size (`--checkbox-size`), not stretched by the form's flex rules, with a light outline. The framed panel around the step 1 agreement is removed.
- Market: only entries whose `system.source` names the 2.1 rulebook; each shows its final-book page. Supply rows for items not offered show "not in the 2.1 rulebook; left out on creation".

## Book check

Every market entry citing the 2.1 rulebook was looked up by name in the final book's text. All were found except the image-only pages (final pp.210–211, Empty Hands, Daggers, Sabers, Swords, read from the rendered pages in 0.2.33) and the four bundled ammunition entries, whose rounds and prices are printed on p.207.

## Tests

`node --test`: **336 pass / 0 fail**. `tests/discovery21.test.mjs` now gives the fixture market items a `source`, checks that a Red Kalpa item is not offered, that the page is the final book's (p.198 → p.212), `bookPage21` for both page ranges and for other sources, and the new "left out" wording when re-reading a saved draft.

## Not verified here (pending in Foundry)

- The checkbox size and outline in the live window (Foundry's own checkbox styles cannot be reproduced outside the app).
