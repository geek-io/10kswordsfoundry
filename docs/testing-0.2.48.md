# 0.2.48 testing and validation

Scope: seven table notes on Cultivator Discovery (2.1). 2.0.3 is untouched.

## Changes checked

- Step 1's agreement box is framed and light; Foundry's checkbox colour variable is set lighter inside the Discovery window only.
- Cultivations: name, Class Stars and XP Stars in three columns.
- Market: "(profile)" weapon templates are skipped; a weapon-type list filters by the weapon's Profile, listing only types the market has.
- Sect Gear from `sect-gear-21` appears as Licenses of its Sect (Kind: Gear) at its printed "License:" rating; gear inside a same-name Technick comes with the Technick.
- Another Sect for XP: Cultivation from nothing at 3 × each new rating, every License 10 XP, shared Meridians; its Barang exported carried.
- Roll all (spend XP) / Roll all (spend no XP); a roll on every step from Class to Sidhi, with a spend-XP roll on Cores, Cultivations and Sect.

## Book readings

- p.236 allows a second Barang without losing earlier Abilities and prints no price; p.100 prices are used (see `rules-basis-2.1.md`, "Added in 0.2.48").

## Tests

`node --test`: **336 pass / 0 fail**. New in `tests/discovery21.test.mjs`:
- Sect Gear Licenses: Sect from the Barang's Cultivation, ✦ count from the License line, the Technick's own gear not listed twice and exported with it; "(profile)" items hidden; the weapon-type filter.
- Another Sect: costs (✦✦ = 9 XP, its License 10 XP), the free Licenses staying with the first Sect, two Esoteric Cultivations on the actor, the second Barang carried, the issue without starting XP, removing it, and making it the Sutra 7 Sect.
- Rolls: which steps roll and which spend XP; a Cores roll spends only on Cores; a plain roll clears the step's XP Stars; Roll all (spend XP) leaves no issues on the rolled steps and spends most of 300 XP; Roll all (spend no XP) spends nothing.

The template was compiled and rendered with the server's Handlebars for each step (see below).

## Not verified here (pending in Foundry)

- The checkbox colour, the three-column layout and the Sect blocks in the live window.
- A created character with two Sects: both Esoteric Cultivations, the carried Barang and the gear Items on the sheet.
