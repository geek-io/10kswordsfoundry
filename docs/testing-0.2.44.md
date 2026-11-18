# 0.2.44 testing and validation

Scope: the final 423-page 2.1 rulebook against the 357-page edition; sheet header badges. 2.0.3 rules and data are untouched; the 2.0.3 sheet gains one header badge.

## How the books were compared

- Pages were paired by shared five-word runs (the final book shifts pages by 2, then 14).
- Paired pages were compared word by word, once ignoring bare numbers and once keeping them (prices, ratings).
- Every final page up to 373 was rendered and compared with its pair as an image. Pages that differ as images but not as text are art or layout only (139, 196, 100, 54).
- Item pages 198–221, Sect pages 224–329 and Bestiary pages 344–373 were also run through the system's own 2.1 importer from both PDFs, and the resulting items compared field by field.

## Tests

`node --test`: **327 pass / 0 fail**. `node tools/check-package.mjs` passes.

- New: a made-up short World Being block reads name, Sidhi, Cores, Cultivations (including a rating wrapped onto its own line), Flame, Morale, weapon profile and damage bonus, three Licenses with their costs, and a second block after a page number.
- Changed: Aflame is −1, Bleeding is −1 on physical Checks, Semiproletariat is 40 × d6.

## Other checks

- `tools/book423/patch_final.py` run twice: 28 changes the first time, none the second.
- The four Goblins on final pp.372–373 read from the PDF text; the 67 Bestiary entries on pp.346–370 read exactly as they did from the 357-page edition apart from three wording changes.

## Not verified here (pending in Foundry)

Nothing in 0.2.44 has been run inside Foundry. To check:

- The 2.1 sheet shows a green "Version 2.1" badge and the 2.0.3 sheet a blue "Version 2.0.3" badge, both readable on the sheet background.
- Importing final-book pages 372–373 with "two columns" on gives four Goblins.
- Aflame gives −1 on a Check; Bleeding gives −1 on a Physique or Motorics Check.
- Compendium prices match the list in the README after the packs are rebuilt.
