#!/usr/bin/env python3
"""Adds the two Metomian weapons printed inside Technicks (final 2.1 rulebook p.288) to the 2.1 Sect Gear catalog.

The Chakra Rod and Adamantine Noose Technicks each summon a weapon and print its stat card, but the cards sit inside
the Technick text, so the Sect Gear generator (which reads Gear entries) never picked them up.
Run from the repository root: python3 tools/book423/add_metomian_weapons.py   (idempotent)."""
import copy, hashlib, json

PATH = "data/sect-gear-21.json"
raw = open(PATH, encoding="utf-8").read()
data = json.loads(raw)
assert json.dumps(data, ensure_ascii=False, indent=1) + ("\n" if raw.endswith("\n") else "") == raw, "unexpected JSON layout"
uid = lambda *parts: hashlib.sha1("|".join(parts).encode()).hexdigest()[:16]

vajra = next(i for i in data["items"] if i["name"] == "Personal Vajra")
MODS = list(vajra["system"]["r21"]["mods"])

def weapon(name, technick, flavor, card, rules, weight, grip, profile, rng, reach, mods, printed, damage_type, sort, note):
    item = copy.deepcopy(vajra)
    item["_id"] = uid("sect-gear-21", "Metomian", name)
    item["name"] = name
    item["sort"] = sort
    s = item["system"]
    s["description"] = (f"<p><em>{flavor}</em></p>"
                        f"<p><strong>License:</strong> Black Mace ✦✦✦ — granted by the {technick} Technick (✦✦✦, needs ❂), which summons it.</p>"
                        f"<p><strong>{card} · {weight:g} kg · Price N/A · {grip.title()} / {profile.title()} · Metomian Sidhi</strong></p>"
                        f"<p><strong>Mods:</strong> {' ✦ '.join(printed)}</p><p>{rules}</p><p><em>Catalog note: {note}</em></p>")
    s["source"] = "Rules 2.1 (2.1 rulebook), p.274"
    s["tags"] = ", ".join(["Metomian", "Black Mace", "Prestige", "Weapon"] + printed)
    s["range"] = rng + reach
    s["damageType"] = damage_type
    r = s["r21"]
    r.update(profile=profile, grip=grip, reach=reach, weight=weight)
    r["mods"] = {k: k in mods for k in MODS}
    item["flags"] = {"10kswordsfoundry": {"sect21": {"sourcePage": 274, "cultivation": "Black Mace", "license": "Black Mace ✦✦✦", "printedMods": printed}}}
    return item

new = [
    weapon("Metomian Chakra Rod", "Chakra Rod",
           "A pure black rod of bound Sidhi that eats all ambient light, summoned from the Cultivator's chest by a long cipher of mantra code.",
           "Prestige Bludgeon",
           "Can be thrown up to 30m; it flies in a straight line, ignoring gravity and wind, and can impale even without a point. "
           "Upon dealing unsoaked damage, the wielder can drain 1 Flame from the target. After draining 3 Flame this way, the rod explodes: "
           "10 blast damage to all within 5m.",
           1, "haft", "bludgeon", 1, 0, {"focus"}, ["FOCUS"], "impact", 1000,
           "The 30m throw and the Flame drain are played from the card text."),
    weapon("Metomian Adamantine Noose", "Adamantine Noose",
           "The Vajra Noose Metom carried to tame demons and malevolent spirits, summoned from the Cultivator's chest by a long cipher of mantra code.",
           "Prestige Whip",
           "+2 to all attempts to Control, bind or restrain with this. It can wrap around someone and hold them in place as a Control. "
           "A Controlled entity can be moved forcibly in any direction at 10m/s, which ends the Control.",
           0.5, "hilt", "whip", 3, 4, set(), ["REACH 4"], "cut", 2000,
           "The card is printed as \"Prestige Bludgeon\" and titled \"Metomian Chakra Rod\"; its grip, profile and the Technick show it is the Noose, a whip. "
           "The printed grip HANDLE is recorded as Hilt, the system's grip for whips. The +2 to Control is played from the card text."),
]

changed = 0
folder = vajra["folder"]
for item in new:
    item["folder"] = folder
    old = next((i for i in data["items"] if i["_id"] == item["_id"]), None)
    if old == item: continue
    if old: data["items"][data["items"].index(old)] = item
    else: data["items"].append(item)
    changed += 1
open(PATH, "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False, indent=1) + ("\n" if raw.endswith("\n") else ""))
print(f"{changed} item(s) added or updated; {len(data['items'])} items in {PATH}")
