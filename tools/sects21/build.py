# Turn raw.json (parse.py) into parsed.json: abilities (Technicks, Magicks) and gear entries.
import json, re, hashlib, html
raw = json.load(open('raw.json'))
SECT_CULT = {'Asuri':'Demon Body','Aswang':'Devil Beast','Dracontine':'Sky Dragon','Eskatonian':'Black Sorcery','Fangshi':'Internal Elixir',
 'Houyi':'Solar Bow','Imma':'White Sorcery','Jyotisha':'Astral','Katalonan':'Divine Communion','Mendicant':'Vajra Fist','Nezha':'Red Gun','Sword Dialectician':'Sword Dialectics',
 'Techgnostic':'Techgnosis','Ultramystic':'Immortal Science','Wukong':'Sage Body','Zhongkui':'Spirit Binding','Bidadari':'Sound Law','Sapphire Star':'Dual','Luciferian':'Consummate Lie','Metomian':'Black Mace'}
CORE = {'PHYSIQUE':'phy','MOTORICS':'mot','MIND':'mnd','WITS':'wit','VOICE':'voc','SPIRIT':'spi','FACE':'voc','HEART':'spi',
        'PHY':'phy','PHYS':'phy','MOT':'mot','MND':'mnd','WIT':'wit','FAC':'voc','HRT':'spi','VOC':'voc','SPI':'spi'}
def uid(*parts): return hashlib.sha1('|'.join(parts).encode()).hexdigest()[:16]
def join(lines):
    out = ''
    for l in lines:
        l = l.strip()
        if not l: continue
        if out.endswith('-') and not out.endswith(' -') and re.match(r'[a-z]', l): out = out[:-1] + l
        elif out.endswith('/'): out += ' ' + l
        else: out = (out + ' ' + l) if out else l
    return re.sub(r'\s+', ' ', out).strip()
def title_case(t):
    small = {'of','the','and','with','to','in','at','a'}
    words = t.lower().split()
    words = ['-'.join(p[:1].upper() + p[1:] for p in w.split('-')) if '-' in w else w for w in words]
    return ' '.join(w if (i and w in small) else (w[0].upper()+w[1:] if w[0].isalpha() else w[:2].upper()+w[2:] if len(w)>1 and not w[1].isalpha() else w) for i,w in enumerate(words)).replace("'S","'s")
# Printed title problems: decorative lines above a title, letter-spaced titles, a title wrapped under its type label.
TITLE_FIX = {'C RIMSON PETAL CONFLAGRATION':'CRIMSON PETAL CONFLAGRATION','SAMADHI F IRE':'SAMADHI FIRE','GOLDEN CLOUD SOMERSAUL.T':'GOLDEN CLOUD SOMERSAULT','DEVI L BEAST BODY':'DEVIL BEAST BODY',
 'BLESSED BE THE ANNIHILATION TRANSCENDENCE IN THE SLAUGHTE PANTA RHEI':'PANTA RHEI','GOD IS IN THE CONTEMPLATION BUDDHA LAUGHS AT GOD':'BUDDHA LAUGHS AT GOD',
 'HELL RIPPED THROUGH WITH EXIT':'HELL RIPPED THROUGH WITH EXIT WOUNDS'}
DROP = {('Aswang','DEATH'),('Dracontine','PUNCTURE THE')}
LIC = re.compile(r'^(//\s*)?licen[sc]e_?\b\s*', re.I)
NEEDS = re.compile(r'^(//\s*)?needs_?\b\s*', re.I)
COST = re.compile(r'[✹❂—]')
JUNK = re.compile(r'^(THE THRONE OF GOD IS EMPTY|\d{3}( ¦ \d{3})?)$')
def parse(e):
    title = TITLE_FIX.get(e['title'], e['title'])
    lines = [l.replace(' ¦ ', ' ').strip() for l in e['lines'] if not JUNK.match(l.strip())]
    if e['title'] == 'HELL RIPPED THROUGH WITH EXIT' and lines and lines[0] == 'WOUNDS': lines = lines[1:]
    li = next((i for i, l in enumerate(lines) if LIC.match(l)), None)
    if li is None: return None
    flavor = lines[:li]
    lic_txt = LIC.sub('', lines[li]).strip(); rest = lines[li + 1:]
    needs = None
    m = re.search(r'\bneeds_?\s+(.*)$', lic_txt, re.I)      # "license X ✦✦ needs ❂" on one row
    if m: needs = m.group(1).strip(); lic_txt = lic_txt[:m.start()].strip()
    mm = re.match(r"(.+?)\s*(✦+)(?:\s+✦+)?\s*$", lic_txt)
    cult, stars = (title_case(mm.group(1)), len(mm.group(2))) if mm else (title_case(lic_txt), 0)
    if needs is None:
        # "needs" sits beside one or two value rows: [value,] needs value
        for k in range(min(3, len(rest))):
            if NEEDS.match(rest[k]):
                val = NEEDS.sub('', rest[k]).strip()
                pre = rest[:k]
                if pre and all(COST.search(p) or ';' in p or p.isupper() for p in pre): val = ' '.join(pre + [val]).strip(); rest = rest[k + 1:]
                elif not pre: rest = rest[k + 1:]
                else: continue
                needs = val; break
    return dict(title=title, cult=cult, stars=stars, needs=(needs or '').strip(), flavor=join(flavor), body=rest)
def magick_fields(effect):
    f = {}
    STOP = r'(?:\||MANTRA|MUDRA|CAST|CHECK|CHARGE|POTENCY|EFFECT|COST)'
    m = re.search(r'MANTRA:?\s*(.+?)\s*' + STOP, effect, re.I); f['mantra'] = m.group(1).strip() if m else ''
    m = re.search(r'MUDRA:?\s*(.+?)\s*' + STOP, effect, re.I); f['mudra'] = m.group(1).strip() if m else ''
    m = re.search(r'CHECK:?\s*([A-Z]+)\s*\+\s*([A-Za-z \-]+?)\s*(?:\||CAST|CHARGE|POTENCY|EFFECT|COST)', effect)
    f['core'] = CORE.get(m.group(1).upper(), 'spi') if m else 'spi'; f['skill'] = title_case(m.group(2)) if m else ''
    m = re.search(r'(?:CHARGE TIME|POTENCY):?\s*(?:RITUAL\s*\([^)]*\)\s*)?(\d+)', effect, re.I); f['potency'] = int(m.group(1)) if m else 1
    r = re.search(r'RITUAL:?\s*\(?([^)|]+?)\)', effect, re.I) or re.search(r'\(Ritual:?\s*([^)]+)\)', effect, re.I)
    c = re.search(r'CAST(?:ING)? TIME:?\s*(\d+\s*(?:seconds?|minutes?|hours?|days?))', effect, re.I)
    f['castTime'] = (f"Ritual: {r.group(1).strip()} per Check" if r else c.group(1) if c and not re.match(r'6 seconds', c.group(1)) else '')
    return f
# Entries whose printed layout needs a hand (checked against the page images).
OVERRIDE = {
 'DEVIL BEAST BODY': dict(needs='❂...'),
 'BODY CAULDRON': dict(needs='—'),
 'COVENANT': dict(needs='—', prefix='Requires Bleeding Heart ✦.'),
 'SAMADHI FIRE': dict(needs='❂', fix=[('their t r weapon i p l with e Samadhi Fire: it gains headed the BLAZE god Mod', 'their weapon with Samadhi Fire: it gains the BLAZE Mod')]),
 "ON EARTH WE'RE BRIEFLY GORGEOUS": dict(type='magick'),
 'SUN SHOOTING STYLE': dict(needs='✹✹✹✹✹✹; bow, crossbow, launcher, longgun', strip='launcher,longgun '),
 'ING KUNG DHARANI': dict(cut_at=' 1 KG PRESTIGE FASHION', tail_to='WHITE ROBES'),          # the White Robes statblock follows in the same column
 'LANCE OF REVOLUTIONARY WILL': dict(gear=True),                       # printed under a Technick heading, but it is a weapon
 'GRAV': dict(type='magick'),                                          # printed as a Technick, but it has a mantra, mudra and Charge Time
}
# 2.1 book (303 pp): a wrapped "needs" row continues on the next line(s).
NEEDS_JOIN = {'THROATWORK': 1, 'ASWANG FANG': 1, 'FLICKERING SHADE TECHNIQUE': 1, 'DEMON CLAW': 1, 'STEEL SONG MEDITATION': 1, 'CELESTIAL ROAD METER': 1,
 'BATTLE BEAT RESONANCE': 1, 'MOUNTAIN BREAKING THUNDER': 1, 'AKASHA PALIMPSEST': 2}
NEEDS_FIX = {'THREEFOLD HELL LOTUS SUPERPOSITION SLASH': '✹... ; SWORDS or SABERS'}
DROP |= {('Techgnostic', 'THE INTRAJALA IS THE INTENET OF THINGS. SUFFUSED WITH SIDHI, GRAND MACHINE')}
abilities, gears, problems, tails = [], [], [], {}
for e in raw:
    if (e['sect'], e['title']) in DROP: continue
    p = parse(e)
    book = e['page']
    if p is None: problems.append((e['page'], e['title'], 'no license')); continue
    rec = dict(sect=e['sect'], page=book, title=p['title'], license=p['cult'], stars=p['stars'], needs=p['needs'], flavor=p['flavor'])
    if e['type'] == 'gear': gears.append(dict(rec, lines=p['body'])); continue
    nj = NEEDS_JOIN.get(p['title'], 0)
    if nj: rec['needs'] = (rec['needs'] + ' ' + ' '.join(p['body'][:nj])).strip(); p['body'] = p['body'][nj:]
    rec['needs'] = NEEDS_FIX.get(p['title'], rec['needs'])
    effect = join(p['body'])
    effect = re.sub(r'(\s+\d{3})+\s*$', '', effect)
    typ = 'magick' if e['type'] == 'magick' else 'technique'
    ov = OVERRIDE.get(p['title'], {})
    if ov.get('gear'): gears.append(dict(rec, lines=p['body'])); continue
    if 'needs' in ov: rec['needs'] = ov['needs']
    if ov.get('cut_from') and ov['cut_from'] in effect: effect = effect[effect.index(ov['cut_from']):]
    if ov.get('cut_at') and ov['cut_at'] in effect:
        effect, tail = effect.split(ov['cut_at'], 1); effect = effect.strip()
        if ov.get('tail_to'): tails[ov['tail_to']] = ov['cut_at'].strip() + ' ' + tail
    if ov.get('strip'): effect = effect.replace(ov['strip'], '', 1).strip()
    for a_, b_ in ov.get('fix', []):
        assert a_ in effect, a_
        effect = effect.replace(a_, b_)
    if ov.get('prefix'): effect = ov['prefix'] + ' ' + effect
    if ov.get('type'): typ = ov['type']
    effect = effect.replace('ESKATON SORCERY', 'BLACK SORCERY')  # Scour still prints the old Cultivation name
    effect = effect.replace('installed their Ardor in them', 'installed their Flame in them')  # Metomian Puppetry Array still prints the old word
    if p['cult'] != SECT_CULT[e['sect']]: problems.append((book, p['title'], 'license ' + p['cult']))
    if not p['stars']: problems.append((book, p['title'], 'no stars'))
    abilities.append(dict(rec, type=typ, effect=effect))
for g in gears:
    if g['title'] in tails: g['lines'] = g['lines'] + [tails[g['title']]]
json.dump(dict(abilities=abilities, gears=gears), open('parsed.json', 'w'), indent=1, ensure_ascii=False)
if __name__ == '__main__':
    print(len(abilities), 'abilities', len(gears), 'gear entries'); print('PROBLEMS', problems)
    for a in abilities:
        mf = magick_fields(a['effect']) if a['type'] == 'magick' else None
        print(f"{a['page']} {a['sect'][:5]:5}|{a['title'][:34]:34}|{a['type'][:4]}|{a['stars']}|{a['needs'][:44]:44}|{(str(mf['potency'])+' '+mf['core']+'+'+mf['skill']+' '+mf['castTime']) if mf else ''}|{a['effect'][:50]}")
