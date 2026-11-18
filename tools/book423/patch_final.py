#!/usr/bin/env python3
"""Brings the 2.1 catalogs up to the final 423-page 2.1 rulebook (2026-11-18).

Against the 357-page edition the catalog-facing changes are prices, two rarities, four weapon kind labels and some wording.
Page numbers in `source` still follow the earlier printing (final page = earlier page + 14 from p.37 on).
Run from the repository root: python3 tools/book423/patch_final.py   (idempotent)."""
import json

def load(name):
    raw = open(f"data/{name}.json", encoding="utf-8").read()
    data = json.loads(raw)
    assert json.dumps(data, ensure_ascii=False, indent=1) + ("\n" if raw.endswith("\n") else "") == raw, f"{name}: unexpected JSON layout"
    return data, raw.endswith("\n")

def save(name, data, newline):
    open(f"data/{name}.json", "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False, indent=1) + ("\n" if newline else ""))

def item(data, name):
    found = [i for i in data["items"] if i["name"] == name]
    assert len(found) == 1, (name, len(found))
    return found[0]

def swap(entry, old, new, field="description"):
    text = entry["system"][field]
    if new in text and old not in text.replace(new, ""): return False
    assert text.count(old) == 1, (entry["name"], old, text.count(old))
    entry["system"][field] = text.replace(old, new)
    return True

changed = []
def price(entry, old, new):
    fmt = lambda n: f"{n:,} ♄"
    if entry["system"]["magCost"] == new: return
    assert entry["system"]["magCost"] == old, (entry["name"], entry["system"]["magCost"])
    swap(entry, fmt(old), fmt(new)); entry["system"]["magCost"] = new; changed.append(f"{entry['name']}: {old} -> {new} ♄")

def rarity(entry, old, new):
    if entry["system"]["rarity"] == new: return
    assert entry["system"]["rarity"] == old, (entry["name"], entry["system"]["rarity"])
    swap(entry, f"<strong>{old.title()} ", f"<strong>{new.title()} "); entry["system"]["rarity"] = new; changed.append(f"{entry['name']}: {old} -> {new}")

def text(entry, old, new, what):
    if swap(entry, old, new): changed.append(f"{entry['name']}: {what}")

# Accessories (final p.201).
data, nl = load("accessories-21")
price(item(data, "SSA Red Eye Ring"), 500, 100)
price(item(data, "Exdead Soul Integrity Earring"), 200, 1000)
save("accessories-21", data, nl)

# Salvage, Tools and Talismans (final pp.202-205).
data, nl = load("goods-21")
e = item(data, "Tsushing Pressplay Player"); rarity(e, "enhanced", "uncommon"); price(e, 100, 300)
rarity(item(data, "HaeCo Fine Focus Binoculars"), "enhanced", "uncommon")
price(item(data, "Rend"), 100000, 1999000)
price(item(data, "Mosesian Spring"), 100000, 1000000)
save("goods-21", data, nl)

# Weapons (final pp.212-215). The kind labels now match the lists the weapons are printed in.
data, nl = load("weapons-21")
e = item(data, "Ka Parashurma")
text(e, "Rare Base Bludgeon ·", "Rare Base Cleaver ·", "printed as a Base Cleaver")
text(e, "<p><em>Catalog note: Printed as a Base Bludgeon in the Cleavers list; recorded as a Cleaver.</em></p>", "", "label note dropped")
price(item(data, "VATAC Collapsing Lance"), 200, 90)
price(item(data, "HaeCo Folding Spear"), 330, 1000)
price(item(data, "AWW Sky Feather Naginata"), 1799, 170990)
price(item(data, "AWW Jadesteel Sleeves"), 4999, 400999)
e = item(data, "HDF Miniature Arblast")
text(e, "Uncommon Base Cleaver ·", "Uncommon Base Crossbow ·", "printed as a Base Crossbow")
text(e, "<p><em>Catalog note: Printed as a Base Cleaver in the Crossbow list; recorded as a Crossbow.</em></p>", "", "label note dropped")
e = item(data, "TMNI Sikarom")
text(e, "Rare Base Bludgeon ·", "Rare Base Bow ·", "printed as a Base Bow")
text(e, "<p><em>Catalog note: Printed as a Base Bludgeon in the Bow list; recorded as a Bow.</em></p>", "", "label note dropped")
price(e, 10000, 100000)
e = item(data, "EXK Vampire Hunter")
text(e, "Rare Base Bludgeon ·", "Rare Base Crossbow ·", "printed as a Base Crossbow")
text(e, "Catalog note: Printed as a Base Bludgeon in the Crossbow list; recorded as a Crossbow. PSIONIC", "Catalog note: PSIONIC", "label note dropped")
price(e, 6969, 696969)
price(item(data, "TMNI Blowgun"), 20, 200)
rarity(item(data, "MORTAR Parabellum 9mm"), "common", "uncommon")
rarity(item(data, "MORTAR TD-7 Ruyi"), "common", "uncommon")
price(item(data, "HDF Dragon Fire Cannon"), 10000, 5000000)
save("weapons-21", data, nl)

data, nl = load("ammunition-21")
price(item(data, "HDF Dragon Fire Meteor"), 1000, 1000000)
save("ammunition-21", data, nl)

# Sect gear wording (final pp.241, 244, 316).
data, nl = load("sect-gear-21")
text(item(data, "Asuri Kalikhadga"), "wield the the KALIKHADGA", "wield the KALIKHADGA", "wording")
text(item(data, "Five Thunder Talisman"),
     "The ancient and primeval Seven-Star Constellation is inhabited by INTRA-INTs who are commonly known as the Seven Demon Kings—powerful Cultivators who established a long tradition of demon slaying and exorcism.",
     "The Five Heavenly Thunders is the thunders wieldded by the heavens to cow and subjugate the demons that yet danced upon the mortal lands.", "new lore line")
save("sect-gear-21", data, nl)

print(f"{len(changed)} change(s)")
for line in changed: print(" ", line)
