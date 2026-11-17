# Build data/sects-21.json (Technicks and Magicks of all 20 Sects) from the 2.1 rulebook (303 pp, 2026-11-16), book pp.224-303.
# Usage: python parse.py <book.pdf> 224 303 -> raw.json; python build.py -> parsed.json; python gen_abilities.py <out dir>/ [existing sects-21.json]
# Sect Gear: gen_gear.py + gear21.py (0.2.32). gen.py / gear.py / newsects.py describe the earlier player-facing book and are kept for reference only.
import json, re, html, hashlib, sys
OUT = sys.argv[1] if len(sys.argv) > 1 else ''
from build import join, uid, title_case, SECT_CULT, magick_fields
parsed = json.load(open('parsed.json'))
SRC = '2.1 rulebook'
# The Cultivation's full name where the printed License word is shorter.
CULT_NAME = {'Dual': 'Dual Cultivation'}
SECT_CULT = {s: CULT_NAME.get(c, c) for s, c in SECT_CULT.items()}
PARTS = ['rleg','lleg','rarm','larm','torso','head']
WMODS = ['auto','crushing','great','colossal','doublehand','focus','blaze','artifact','smashing','piercing','lacerating','precise','holy','noetic','ritual','shock','concealable']
NEWMODS = {'piercing','lacerating','precise','holy','noetic','ritual','shock','concealable'}  # mods defined by the 2.1 book (p.171-172)
PROFILE_RANGE = {'dagger':1,'saber':1,'sword':1,'whip':3,'bludgeon':1,'cleaver':1,'polearm':3,'launcher':20,'bow':250,'crossbow':125,'handgun':30,'longgun':400}
esc = lambda t: html.escape(t, quote=False)
def folder(name, parent, sort, pack='sects21'):
    return {'_id': uid('folder', pack, name, parent or ''), 'name': name, 'folder': parent, 'type': 'Item', 'sorting': 'm', 'sort': sort, 'color': None}
def stars(n): return '✦' * n
# ---------- 2.1 Sects (Technicks and Magicks) ----------
sect_order = list(SECT_CULT)
folders, items = [], []
for si, sect in enumerate(sect_order):
    top = folder(sect, None, si * 100000); folders.append(top)
    used = sorted({a['stars'] for a in parsed['abilities'] if a['sect'] == sect})
    sub = {}
    for n in used:
        f = folder(f"{SECT_CULT[sect]} {stars(n)}", top['_id'], n * 100000); folders.append(f); sub[n] = f['_id']
    for order, a in enumerate(a for a in parsed['abilities'] if a['sect'] == sect):
        name = title_case(a['title']).replace("Asuri's", "Asuri's")
        # Alternatives ("✹ or ✹✹", "✹✹/✹✹✹/✹✹✹✹") charge the first, cheapest option; the sheet treats the cost as variable.
        cost = re.split(r'\s*/\s*|\s+or\s+', a['needs'].split(';', 1)[0])[0]
        cost = re.sub(r"\+\s*target's\s*[✹❂]+", '', cost)   # Twin Lotus: the target installs their own
        burn, inst = cost.count('✹'), cost.count('❂')
        weapon = a['needs'].split(';', 1)[1].strip() if ';' in a['needs'] else ''
        lic = f"{a['license']} {stars(a['stars'])}".strip()
        desc = (f"<p><em>{esc(a['flavor'])}</em></p>" if a['flavor'] else '') + f"<p><strong>License:</strong> {esc(lic)}</p>" + \
               f"<p><strong>Needs:</strong> {esc(a['needs'] or '—')}</p><p>{esc(a['effect'])}</p>"
        sys = {'description': desc, 'source': f"Rules 2.1 ({SRC}), p.{a['page']}", 'tags': ', '.join(x for x in [sect, SECT_CULT[sect], stars(a['stars']), 'Magick' if a['type']=='magick' else 'Technick', weapon] if x),
               'sect': sect, 'rank': '', 'sidhi': 0, 'apCost': 0, 'burnArdor': burn, 'installArdor': inst, 'equipped': False}
        if a['type'] == 'magick':
            m = magick_fields(a['effect'])
            sys.update({'mantra': m['mantra'], 'mudra': m['mudra'], 'mudraHands': 1, 'attackPool': 'spi', 'defensePool': 'grc',
                        'r21': {'potency': m['potency'], 'castTime': m['castTime'], 'core': m['core'], 'skill': CULT_NAME.get(m['skill'], m['skill']) or SECT_CULT[sect], 'bonus': 0}})
        items.append({'_id': uid('sect21', sect, a['title']), 'name': name, 'type': a['type'], 'img': f"systems/10kswordsfoundry/assets/icons/{'magick' if a['type']=='magick' else 'technique'}.svg",
            'system': sys, 'folder': sub[a['stars']], 'sort': order * 1000, 'effects': [],
            'flags': {'10kswordsfoundry': {'sect21': {'sourcePage': a['page'], 'cultivation': SECT_CULT[sect], 'stars': a['stars'], 'needs': a['needs'], 'weaponRequirement': weapon, 'license': a['license']}}}})
# Keep the ids of entries already in the catalog (same Sect and name), so the Bidadari and Sapphire Star items first imported
# from New_Sects.pdf — under a different id scheme — stay the same documents.
import os, sys as _sys
if len(_sys.argv) > 2 and os.path.exists(_sys.argv[2]):
    norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
    prior = {(i['system'].get('sect'), norm(i['name'])): i['_id'] for i in json.load(open(_sys.argv[2]))['items']}
    prior[('Sapphire Star', norm('Silkmoth Flutters Her Wings'))] = prior.get(('Sapphire Star', norm('Silk Moth Flutters Her Wings')), '')
    used = set()
    for item in items:
        old = prior.get((item['system']['sect'], norm(item['name'])))
        if old and old not in used: item['_id'] = old; used.add(old)
json.dump({'folders': folders, 'items': items}, open(OUT + 'sects-21.json', 'w'), indent=1, ensure_ascii=False)
