# 0.2.50 testing and validation

Scope: default ruleset and the 2.1 Core pictures. The 2.0.3 sheet, data and pictures are untouched.

## Changes checked

- The six Core pictures were extracted from the final 2.1 rulebook, pp.28–29, and compared by eye with the rendered pages: Physique red (beast), Motorics peach (peacock), Mind purple (brain), Wits orange (hearts and figure), Face green, Heart pink (lotus). The dominant colour of each saved file was also checked by script.
- `rulesVersion` registers with default `2.1`.

## Tests

`node --test`: **337 pass / 0 fail**. `tests/rules-mode.test.mjs`: the sheet reads `assets/cores21/<key>.png` and the six files differ; the setting's default and choices; an empty world takes 2.1; a world with Actors and no stored choice is set to 2.0.3 by the active GM only; a stored choice is never changed.

## Not verified here (pending in Foundry)

- The pictures on a live 2.1 sheet.
- The first load of an existing 2.0.3 world that never stored a rules version (the pin and its notice), and a brand-new world starting on 2.1.
