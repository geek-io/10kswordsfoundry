# 0.2.38 testing and validation

Scope: the **Roll everything** button in Cultivator Discovery. 2.0.3 untouched. No compendium changed.

## Tests

`node --test`: **307 pass / 0 fail** (306 before; 1 new in `tests/discovery21.test.mjs`).

- Five runs with different random sources and dice: after each, Class, Cores, Cultivations, Assets, Supply, Identity and Sidhi have no open issues; Asset Stars and Macca are never overspent; the Sect is set with two qualifying Licenses; only a Class with a printed Supply line gets the free item; the Attachments and Sect story typed beforehand are kept; exactly one chat message is posted and it is not a Discovery card; the window lands on Review with unsaved changes.
- `randomCores21` deals exactly the Class's six values; `randomCultivations21` deals exactly the Class's counts per rating; `shuffle21` keeps every element.

## Other checks

- `node --check` on every script; the template still parses and renders in the stand-in renderer.

## Assumptions recorded

See "Added in 0.2.38" in `docs/rules-basis-2.1.md`. The run posts one summary message rather than one roll message per die.

## Not verified here (pending at the table)

Nothing in 0.2.38 has been run inside Foundry. To check: the button asks first, fills every step, posts the summary to chat, and the result can be saved and created like any other Discovery.
