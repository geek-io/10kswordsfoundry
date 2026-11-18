# 0.2.45 testing and validation

Scope: the 2.1 Bestiary as an Actor compendium. No rules change; 2.0.3 is untouched.

## Build

- `node tools/worldbeings21/gen_bestiary.mjs <final 2.1 rulebook.pdf>` reads pp.346–373 with the system's column reader and 2.1 stat-block importer: 71 World Beings, 430 embedded items (126 weapons, 92 traits, 91 Technicks, 33 Magicks, 55 armor pieces, 33 Assets), 12 item effects; 157 items matched to the 2.1 catalogs.
- The pack is compiled on the server with its own Foundry install (`build-21.sh`), and every actor is read back through Foundry's embedded-collection reader, items and their effects included.

## Tests

`node --test`: **330 pass / 0 fail**. New `tests/bestiary21.test.mjs`: the pack is an Actor pack listed after 2.1 World Beings with one folder; 71 npc actors with unique ids, a page, Sidhi and Flame; only weapons start readied; the three Aristocrat versions and the four short Goblins are present; Fire-Lance Goblin's three Magicks are the catalog Magicks.

## Not verified here (pending in Foundry)

- The compendium opens with one Bestiary folder and its 71 entries.
- A World Being dragged onto a scene keeps its Part HP, Soak, Flame and readied weapons, and its catalog Technicks and Magicks activate.
- Under 2.0.3 the Bestiary still shows (it is not marked as a 2.0.3 pack); decide in testing whether it should be hidden there.
