import json, re, html, hashlib, sys
OUT = sys.argv[1] if len(sys.argv) > 1 else ''
from build import join, uid, title_case, SECT_CULT, magick_fields
from gear import GEAR
parsed = json.load(open('parsed.json')); raw = {e['title']: e for e in parsed['gears']}
SRC = '2.1 player-facing book'
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
        burn, inst = a['needs'].count('✹'), a['needs'].count('❂')
        weapon = a['needs'].split(';', 1)[1].strip() if ';' in a['needs'] else ''
        lic = f"{a['license']} {stars(a['stars'])}".strip()
        desc = (f"<p><em>{esc(a['flavor'])}</em></p>" if a['flavor'] else '') + f"<p><strong>License:</strong> {esc(lic)}</p>" + \
               f"<p><strong>Needs:</strong> {esc(a['needs'] or '—')}</p><p>{esc(a['effect'])}</p>"
        sys = {'description': desc, 'source': f"Rules 2.1 ({SRC}), p.{a['page']}", 'tags': ', '.join(x for x in [sect, SECT_CULT[sect], stars(a['stars']), 'Magick' if a['type']=='magick' else 'Technick', weapon] if x),
               'sect': sect, 'rank': '', 'sidhi': 0, 'apCost': 0, 'burnArdor': burn, 'installArdor': inst, 'equipped': False}
        if a['type'] == 'magick':
            m = magick_fields(a['effect'])
            sys.update({'mantra': m['mantra'], 'mudra': m['mudra'], 'mudraHands': 1, 'attackPool': 'spi', 'defensePool': 'grc',
                        'r21': {'potency': m['potency'], 'castTime': m['castTime'], 'core': m['core'], 'skill': m['skill'] or SECT_CULT[sect], 'bonus': 0}})
        items.append({'_id': uid('sect21', sect, a['title']), 'name': name, 'type': a['type'], 'img': f"systems/10kswordsfoundry/assets/icons/{'magick' if a['type']=='magick' else 'technique'}.svg",
            'system': sys, 'folder': sub[a['stars']], 'sort': order * 1000, 'effects': [],
            'flags': {'10kswordsfoundry': {'sect21': {'sourcePage': a['page'], 'cultivation': SECT_CULT[sect], 'stars': a['stars'], 'needs': a['needs'], 'weaponRequirement': weapon, 'license': a['license']}}}})
# ---------- Sapphire Star (preview; book p.266 / PDF p.134) — a teaser spread with no printed abilities yet ----------
# SUPERSEDED (0.2.18): New_Sects.pdf (pp.270-273) prints the full Sapphire Star, and adds the Bidadari Sect.
# Both are injected into the committed catalogs by tools/sects21/newsects.py, which also removes this preview.
ss = folder('Sapphire Star', None, len(sect_order) * 100000); folders.append(ss)
ss_desc = ('<p><em>Link the disparate hells to strike at the heavens.</em></p>'
           '<p><strong>Supreme Mediator and Council.</strong> A sect that trains the greatest and the best of the '
           'diplomats in the Trichiliocosm. They are not just the best at gaining knowledge from state enemies, but also '
           'at mending ties, facilitating oaths, binding promises, and catching others in the lie…</p>'
           '<p><strong>Cultivations:</strong> Dual Cultivation ✦ · Sorcerous Diplomacy ✦</p>'
           '<p><em>Preview only — the player-facing book introduces this Sect but does not yet print its Technicks, '
           'Magicks, License mechanics or Barang. Added so the roster is complete; it will be filled in when the book does.</em></p>')
items.append({'_id': uid('sect21', 'Sapphire Star', 'preview'), 'name': 'Sapphire Star (Preview)', 'type': 'trait',
    'img': 'systems/10kswordsfoundry/assets/icons/magick.svg',
    'system': {'description': ss_desc, 'source': f'Rules 2.1 ({SRC}), p.266',
               'tags': 'Sapphire Star, Dual Cultivation, Sorcerous Diplomacy, Preview, 2.1', 'level': 1, 'active': False},
    'folder': ss['_id'], 'sort': 0, 'effects': [],
    'flags': {'10kswordsfoundry': {'sect21': {'preview': True, 'cultivation': 'Dual Cultivation / Sorcerous Diplomacy', 'sourcePage': 266}}}})
json.dump({'folders': folders, 'items': items}, open(OUT + 'sects-21.json', 'w'), indent=1, ensure_ascii=False)
# ---------- 2.1 Sect Gear ----------
gfolders, gitems = [], []
for si, sect in enumerate(sect_order):
    mine = [g for g in GEAR if g['sect'] == sect]
    if not mine: continue
    top = folder(sect, None, si * 100000, 'gear21'); gfolders.append(top); kinds = {}
    for k, label in [('weapon','Weapons'),('fashion','Armor & Fashion'),('accessory','Accessories')]:
        if any(g['kind'] == k for g in mine):
            f = folder(label, top['_id'], len(kinds) * 100000, 'gear21'); gfolders.append(f); kinds[k] = f['_id']
    for order, g in enumerate(mine):
        entry = raw[g['entry']]; text = join(entry['lines'])
        lic_entry = raw[g.get('license_from', g['entry'])]; g['page'] = entry['page']
        lic = f"{lic_entry['license']} {stars(lic_entry['stars'])}"
        lt = join(lic_entry['lines'])
        m = re.search(r"\s+(?:\d+(?:\.\d+)?\s*KG|◼|HOUYI PRESTIGE)", lt)
        lic_text = (lt[:m.start()] if m else lt).strip()
        if g.get('license_text'): lic_text = g['license_text']
        flavor = lic_entry['flavor']
        if g.get('start') is None: body = g.get('text', '')
        else:
            start = text.index(g['start']); end = text.index(g['end'], start) if g.get('end') else len(text)
            body = g.get('text', '') + (' ' if g.get('text') else '') + text[start:end].strip()
        mods = ' ✦ '.join(g.get('mods', []))
        stat = f"{g['category']} · {g['weight']} kg · Price N/A" + (f" · {g['grip'].title()} / {g['profile'].title()} · {g['material']}" if g['kind']=='weapon' else '')
        LABEL = {'rleg':'Right Leg','lleg':'Left Leg','rarm':'Right Arm','larm':'Left Arm','torso':'Torso','head':'Head'}
        cov = ', '.join(f"{LABEL[p]} {v}" for p, v in g.get('coverage', {}).items())
        desc = (f"<p><em>{esc(flavor)}</em></p>" if flavor else '') + f"<p><strong>License:</strong> {esc(lic)} — {esc(lic_text)}</p><p><strong>{esc(stat)}</strong></p>" + \
               (f"<p><strong>Mods:</strong> {esc(mods)}</p>" if mods else '') + (f"<p><strong>Soak:</strong> {esc(cov)}</p>" if cov else '') + \
               f"<p>{esc(body)}</p>" + (f"<p><em>Catalog note: {esc(g['note'])}</em></p>" if g.get('note') else '')
        base = {'description': desc, 'source': f"Rules 2.1 ({SRC}), p.{g['page']}", 'rarity': 'prestige', 'quantity': 1, 'slots': 1, 'magCost': 0, 'equipped': False,
                'tags': ', '.join([sect, SECT_CULT[sect], 'Prestige', g['kind'].title()] + g.get('mods', []))}
        effects = []
        if g['kind'] == 'weapon':
            prof = g['profile']; ranged = prof in ('launcher','bow','crossbow','handgun','longgun')
            base.update({'gearSlot': 'carry', 'weaponType': 'ranged' if ranged else 'melee', 'range': PROFILE_RANGE[prof], 'damageType': 'impact' if prof == 'bludgeon' else 'cut',
                'r21': {'profile': prof, 'grip': g['grip'], 'damage': 2, 'damageBonus': g.get('bonus', 0), 'range': 0, 'rate': g.get('rate', 1), 'capacity': g.get('capacity', 0),
                        'ferocious': g.get('ferocious', 0), 'shield': 0, 'mods': {k: k in g.get('set_mods', []) or (k in NEWMODS and k.upper() in g.get('mods', [])) for k in WMODS}, 'weight': g['weight']}})
            typ, img = 'weapon', 'weapon'
        else:
            base.update({'gearSlot': 'fashion' if g['kind'] == 'fashion' else 'carry',
                'r21': {'coverage': {p: g.get('coverage', {}).get(p, 0) for p in PARTS}, 'morale': g.get('morale', 0), 'weight': g['weight']}})
            if g['kind'] == 'fashion': base.update({'armor': 0, 'ardor': g.get('ardor', 0)})
            typ = img = g['kind']
            if g.get('move'):
                effects.append({'_id': uid('effect', g['name']), 'name': f"{g['name']}: +{g['move']} m/s movement", 'img': f'systems/10kswordsfoundry/assets/icons/{img}.svg',
                    'transfer': True, 'disabled': False, 'description': f"<p>Rules 2.1 ({SRC}), p.{g['page']}. Applies while equipped.</p>",
                    'system': {'changes': [{'key': 'system.moveBonus', 'type': 'add', 'value': str(g['move']), 'phase': 'initial', 'priority': 20}]}})
        gitems.append({'_id': uid('gear21', g['name']), 'name': g['name'], 'type': typ, 'img': f'systems/10kswordsfoundry/assets/icons/{img}.svg', 'system': base,
            'folder': kinds[g['kind']], 'sort': order * 1000, 'effects': effects,
            'flags': {'10kswordsfoundry': {'sect21': {'sourcePage': g['page'], 'cultivation': SECT_CULT[sect], 'license': lic, 'printedMods': g.get('mods', [])}}}})
json.dump({'folders': gfolders, 'items': gitems}, open(OUT + 'sect-gear-21.json', 'w'), indent=1, ensure_ascii=False)
print(len(items), 'abilities in', len(folders), 'folders;', len(gitems), 'gear in', len(gfolders), 'folders')
assert len({i['_id'] for i in items + gitems}) == len(items + gitems)
assert len({f['_id'] for f in folders + gfolders}) == len(folders + gfolders)
