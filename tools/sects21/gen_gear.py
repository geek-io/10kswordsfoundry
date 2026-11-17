# Build data/sect-gear-21.json (Sect Gear of the 20 Sects) from the 2.1 rulebook (303 pp, 2026-11-16), book pp.224-303.
# Usage (in the folder holding parsed.json from build.py): python gen_gear.py <out dir>/ <path to scripts/rules21.mjs>
# Ids are sha1-derived from the folder / item names, so items that keep their name keep their compendium id.
import json, re, html, sys as _sys
OUT = _sys.argv[1] if len(_sys.argv) > 1 else ''
RULES = _sys.argv[2]
from build import join, uid, SECT_CULT
from gear21 import GEAR
parsed = json.load(open('parsed.json')); raw = {e['title']: e for e in parsed['gears']}
SRC = '2.1 rulebook'
CULT_NAME = {'Dual': 'Dual Cultivation'}
SECT_CULT = {s: CULT_NAME.get(c, c) for s, c in SECT_CULT.items()}
PARTS = ['rleg','lleg','rarm','larm','torso','head']
LABEL = {'rleg':'Right Leg','lleg':'Left Leg','rarm':'Right Arm','larm':'Left Arm','torso':'Torso','head':'Head'}
# The weapon mod keys of the data model, read from WEAPON_MODS_21 so the catalog always carries the full set.
src = open(RULES, encoding='utf-8').read().replace('\r\n', '\n')
block = src[src.index('export const WEAPON_MODS_21'):]; block = block[:block.index('\n});')]
WMODS = re.findall(r'^\s{2}([a-zA-Z]+):', block, re.M)
assert {'auto','great','cover','wall','unblockable','almighty'} <= set(WMODS), WMODS
ALIAS = {'doublehanded': 'doublehand'}
AFFINITIES = ['mighty', 'razor', 'esoteric', 'arcane', 'lyrical', 'psionic']   # p.195
GRADES = ['immortal', 'divine', 'refined']                                    # p.195
PROFILE_RANGE = {'dagger':1,'saber':1,'sword':1,'whip':3,'bludgeon':1,'cleaver':1,'polearm':3,'launcher':20,'bow':250,'crossbow':125,'handgun':30,'longgun':400}
esc = lambda t: html.escape(t, quote=False)
def folder(name, parent, sort, pack='gear21'):
    return {'_id': uid('folder', pack, name, parent or ''), 'name': name, 'folder': parent, 'type': 'Item', 'sorting': 'm', 'sort': sort, 'color': None}
def stars(n): return '✦' * n
gfolders, gitems, used = [], [], set()
for si, sect in enumerate(SECT_CULT):
    mine = [g for g in GEAR if g['sect'] == sect]
    if not mine: continue
    top = folder(sect, None, si * 100000); gfolders.append(top); kinds = {}
    for k, label in [('weapon','Weapons'),('fashion','Armor & Fashion'),('accessory','Accessories')]:
        if any(g['kind'] == k for g in mine):
            f = folder(label, top['_id'], len(kinds) * 100000); gfolders.append(f); kinds[k] = f['_id']
    for order, g in enumerate(mine):
        entry = raw[g['entry']]; text = join(entry['lines']); used.add(g['entry'])
        lic_entry = raw[g.get('license_from', g['entry'])]; used.add(lic_entry['title']); page = entry['page']
        lic = f"{lic_entry['license']} {stars(lic_entry['stars'])}"
        lt = join(lic_entry['lines'])
        m = re.search(r"\s+(?:\d+(?:\.\d+)?\s*KG|◼|HOUYI PRESTIGE)", lt)
        lic_text = g.get('license_text') or (lt[:m.start()] if m else lt).strip()
        flavor = lic_entry['flavor']
        start = text.index(g['start']); end = text.index(g['end'], start) if g.get('end') else len(text)
        body = text[start:end].strip()
        printed = g.get('mods', [])
        stat = f"{g['category']} · {g.get('weight_label', g['weight'])} kg · Price N/A" + (f" · {g['grip'].title()} / {g['profile'].title()} · {g['material']}" if g['kind'] == 'weapon' else '')
        cov = ', '.join(f"{LABEL[p]} {v}" for p, v in g.get('coverage', {}).items() if v)
        desc = (f"<p><em>{esc(flavor)}</em></p>" if flavor else '') + f"<p><strong>License:</strong> {esc(lic)} — {esc(lic_text)}</p><p><strong>{esc(stat)}</strong></p>" + \
               (f"<p><strong>Mods:</strong> {esc(' ✦ '.join(printed))}</p>" if printed else '') + (f"<p><strong>Soak:</strong> {esc(cov)}</p>" if cov else '') + \
               f"<p>{esc(body)}</p>" + (f"<p><em>Catalog note: {esc(g['note'])}</em></p>" if g.get('note') else '')
        base = {'description': desc, 'source': f"Rules 2.1 ({SRC}), p.{page}", 'rarity': 'prestige', 'quantity': 1, 'slots': 1, 'magCost': 0, 'equipped': False,
                'tags': ', '.join([sect, SECT_CULT[sect], 'Prestige', g['kind'].title()] + printed)}
        effects = []
        if g['kind'] == 'weapon':
            prof = g['profile']; ranged = prof in ('launcher','bow','crossbow','handgun','longgun')
            on = set(g.get('on', [])); ferocious = 0; reach = 0; override = g.get('range', 0); affinity = g.get('affinity', '')
            grade = next((x for x in GRADES if x in g['category'].lower()), '')
            for mod in printed:
                word = mod.split()[0].lower(); key = ALIAS.get(word, word); num = re.search(r'^\w+ (\d+)$', mod)
                if key == 'ferocious': ferocious = int(num.group(1)) if num else 1
                elif key == 'reach' and num: reach = int(num.group(1))   # p.194 REACH X: +X m to the profile
                elif key in AFFINITIES: affinity = key
                elif key in WMODS and key not in g.get('off', []): on.add(key)
            assert on <= set(WMODS), (g['name'], on)
            base.update({'gearSlot': 'carry', 'weaponType': 'ranged' if ranged else 'melee', 'range': (override or PROFILE_RANGE[prof]) + reach, 'damageType': 'impact' if prof == 'bludgeon' else 'cut',
                'r21': {'profile': prof, 'grip': g['grip'], 'damage': 2, 'damageBonus': g.get('bonus', 0), 'range': override, 'rate': g.get('rate', 1), 'capacity': g.get('capacity', 0),
                        'reach': reach, 'affinity': affinity, 'grade': grade, 'morph': g.get('morph', ''),
                        'ferocious': ferocious, 'shield': 0, 'mods': {k: k in on for k in WMODS}, 'weight': g['weight']}})
            typ, img = 'weapon', 'weapon'
        else:
            base.update({'gearSlot': 'fashion' if g['kind'] == 'fashion' else 'carry',
                'r21': {'coverage': {p: g.get('coverage', {}).get(p, 0) for p in PARTS}, 'morale': g.get('morale', 0), 'weight': g['weight']}})
            if g['kind'] == 'fashion': base.update({'armor': 0, 'ardor': g.get('ardor', 0)})
            typ = img = g['kind']
            if g.get('move'):
                effects.append({'_id': uid('effect', g['name']), 'name': f"{g['name']}: +{g['move']} m/s movement", 'img': f'systems/10kswordsfoundry/assets/icons/{img}.svg',
                    'transfer': True, 'disabled': False, 'description': f"<p>Rules 2.1 ({SRC}), p.{page}. Applies while equipped.</p>",
                    'system': {'changes': [{'key': 'system.moveBonus', 'type': 'add', 'value': str(g['move']), 'phase': 'initial', 'priority': 20}]}})
        gitems.append({'_id': uid('gear21', g.get('id_name', g['name'])), 'name': g['name'], 'type': typ, 'img': f'systems/10kswordsfoundry/assets/icons/{img}.svg', 'system': base,
            'folder': kinds[g['kind']], 'sort': order * 1000, 'effects': effects,
            'flags': {'10kswordsfoundry': {'sect21': {'sourcePage': page, 'cultivation': SECT_CULT[sect], 'license': lic, 'printedMods': printed}}}})
missing = sorted(set(raw) - used); assert not missing, missing
assert len({i['_id'] for i in gitems}) == len(gitems) and len({f['_id'] for f in gfolders}) == len(gfolders)
json.dump({'folders': gfolders, 'items': gitems}, open(OUT + 'sect-gear-21.json', 'w'), indent=1, ensure_ascii=False)
print(len(gitems), 'gear in', len(gfolders), 'folders')
