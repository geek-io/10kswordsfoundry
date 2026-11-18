#!/usr/bin/env python3
"""Brings the 2.1 catalogs up to the 357-page "2.1 NO LORE" rulebook (2026-11-17).

Pages 1-303 of that edition differ from the 303-page book on thirteen pages; the catalog-facing ones are applied here.
Run from the repository root: python3 tools/book357/patch_no_lore.py   (idempotent)."""
import json, sys

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
    if new in text: return False
    assert text.count(old) == 1, (entry["name"], old, text.count(old))
    entry["system"][field] = text.replace(old, new)
    return True

changed = []
def note(flag, what):
    if flag: changed.append(what)

# p.194: UNDODGEABLE is a new Mod. Every weapon's Mods map carries it, after UNBLOCKABLE.
for name in ("weapons-21", "sect-gear-21"):
    data, nl = load(name)
    count = 0
    for entry in data["items"]:
        mods = entry["system"].get("r21", {}).get("mods")
        if isinstance(mods, dict) and "unblockable" in mods and "undodgeable" not in mods:
            entry["system"]["r21"]["mods"] = {k2: v2 for k, v in mods.items() for k2, v2 in ([(k, v), ("undodgeable", False)] if k == "unblockable" else [(k, v)])}
            count += 1
    if name == "sect-gear-21":
        # p.286: Atardar's Fang no longer has LACERATING.
        fang = item(data, "Atardar's Fang")
        if fang["system"]["r21"]["mods"].get("lacerating"):
            fang["system"]["r21"]["mods"]["lacerating"] = False; changed.append("Atardar's Fang: LACERATING removed (p.286)")
        swap(fang, "VISCERAL ✦ LACERATING ✦ FEROCIOUS 2", "VISCERAL ✦ FEROCIOUS 2")
        swap(fang, "VISCERAL, LACERATING, FEROCIOUS 2", "VISCERAL, FEROCIOUS 2", "tags")
        # p.242: Hermetic Robes, Violent Sorcery.
        note(swap(item(data, "Hermetic Robes"), "BASIC MOVE while Casting. ", "BASIC MOVE while Casting. She can also Step now while Casting. "), "Hermetic Robes: can Step while Casting (p.242)")
    note(count, f"{name}: UNDODGEABLE added to {count} weapons")
    save(name, data, nl)

# p.203 Kongo Helm: +2 SPEED (was -2). p.205 Blademaster Wraps: +1d to BLOCK (was LACERATING).
data, nl = load("armor-21")
helm = item(data, 'VATAC Adamant Helm "Kongo"')
if swap(helm, "<p>-2 SPEED</p>", "<p>+2 SPEED</p>"):
    swap(helm, '"-2 SPEED" is applied', '"+2 SPEED" is applied')
    for effect in helm["effects"]:
        effect["name"] = effect["name"].replace("-2 Speed", "+2 Speed")
        for change in effect["system"]["changes"]:
            if change["key"] == "system.speedBonus": change["value"] = "2"
    changed.append("Kongo Helm: +2 Speed (p.203)")
note(swap(item(data, "Blademaster Wraps"), "gain LACERATING.", "gain +1d to BLOCK."), "Blademaster Wraps: +1d to BLOCK (p.205)")
save("armor-21", data, nl)

# Sect text.
data, nl = load("sects-21")
note(swap(item(data, "Black Red Demon Thews"), "installs RED BLACK DEMON THEWS", "installs BLACK RED DEMON THEWS"), "Black Red Demon Thews: name in its own text (p.225)")
note(swap(item(data, "Demon Diamond Head"), "against the target's head.</p>", "against the target's head. She cannot be Stunned from Head damage anymore.</p>"), "Demon Diamond Head: cannot be Stunned from Head damage (p.225)")
note(swap(item(data, "Flickering Shade Technique"), "The Cultivator activate this when she Steps", "The Cultivator may activate this when she Steps"), "Flickering Shade Technique: wording (p.229)")
note(swap(item(data, "Vajra Guard"), "even if it is BLOCK.", "even if it is unblockable."), "Vajra Guard: Blocks even the unblockable (p.270)")
note(swap(item(data, "Red Ajna"), "The bullest fired", "The bullets fired"), "Red Ajna: typo (p.277)")
save("sects-21", data, nl)

print("\n".join(changed) if changed else "Nothing to change.")
