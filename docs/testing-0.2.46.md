# 0.2.46 testing and validation

Scope: the 2.1 Sect Gear catalog gains two weapons. No rules change; 2.0.3 is untouched.

## Audit of the final 2.1 rulebook against the compendiums

- **Sect abilities (pp.238–317).** Every Technick, Magick and Gear title bar was found by its font and matched to a catalog entry: 177 Technick, 66 Magick and 39 Gear bars. All abilities are in `2.1 Sects`. Two labels differ from the catalog and were left as they are: "On Earth We're Briefly Gorgeous" (printed as a Technick, written as a Magick with Mantra, Mudra and Charge Time) and "Lance of Revolutionary Will" (a License entry; its weapon is in 2.1 Sect Gear).
- **Metomian.** The book prints 12 Technicks (Black Mace ✦ ×4, ✦✦ ×3, ✦✦✦ ×5) and 2 Gear entries; the compendium has all of them. The server's installed pack was read directly and also holds all 12.
- **Item cards on Sect pages.** 49 cards; all were already items except the two inside the Chakra Rod and Adamantine Noose Technicks (p.288).
- **Market and armor pages (pp.200–221).** 105 priced cards plus the 14 weapons on the image-only pages 210–211 match the weapons, armor, consumables, accessories, ammunition and goods catalogs.

## Tests

`node --test`: **330 pass / 0 fail**. `tests/sects21-catalog.test.mjs` now expects 46 Sect Gear items and checks both new weapons (profile, grip, mods, weight, REACH 4 giving a 7 m Whip, Metomian / Weapons folder).

## Not verified here (pending in Foundry)

- Both weapons appear under 2.1 Sect Gear › Metomian › Weapons and can be equipped and rolled.
