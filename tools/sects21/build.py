import json, re, hashlib, html
raw = json.load(open('raw.json'))
# Playtest Sects (2026-11-06): a few headings sit inside the previous entry's column block
# ("MOUNTAIN OF CORPSES, SEAS OF BLOOD TECHNICK"). Split them into their own entries.
def _split_embedded(entries):
    out = []
    for e in entries:
        cur = dict(e, lines=[]); out.append(cur)
        ls = e['lines']; i = 0
        while i < len(ls):
            m = re.match(r"^([A-Z][A-Z0-9' ,\-]{3,}?)\s+(TECHNICK|Technick|MAGICK|Magick)$", ls[i].strip())
            if m and cur['lines']:
                title = m.group(1).strip()
                if i + 1 < len(ls) and re.fullmatch(r"[A-Z][A-Z' \-]{2,}", ls[i + 1].strip()): title += ' ' + ls[i + 1].strip(); i += 1
                cur = dict(e, title=title, type=m.group(2).lower(), lines=[]); out.append(cur)
            else: cur['lines'].append(ls[i])
            i += 1
    return out
raw = _split_embedded(raw)
SECT_CULT = {'Asuri':'Demon Body','Aswang':'Devil Beast','Dracontine':'Sky Dragon','Eskatonian':'Black Sorcery','Fangshi':'Internal Elixir',
 'Houyi':'Solar Bow','Imma':'White Sorcery','Jyotisha':'Astral','Katalonan':'Divine Communion','Mendicant':'Vajra Fist','Nezha':'Red Gun','Sword Dialectician':'Sword Dialectics',
 'Techgnostic':'Techgnosis','Ultramystic':'Immortal Science','Wukong':'Sage Body','Zhongkui':'Spirit Binding'}
CORE = {'PHYSIQUE':'phy','MOTORICS':'mot','MIND':'mnd','WITS':'wit','VOICE':'voc','SPIRIT':'spi','FACE':'voc','HEART':'spi',
        'PHY':'phy','PHYS':'phy','MOT':'mot','MND':'mnd','WIT':'wit','FAC':'voc','HRT':'spi','VOC':'voc','SPI':'spi'}
STAR = '✦'
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
JUNK = re.compile(r'^(G|A|Y|L|N|167|LET ALL BE QUIET|THEREIS|EMPTINESS|NO KARMA,.*)$')
TITLE_FIX = {'C RIMSON PETAL CONFLAGRATION':'CRIMSON PETAL CONFLAGRATION','SAMADHI F IRE':'SAMADHI FIRE','GOLDEN CLOUD SOMERSAUL.T':'GOLDEN CLOUD SOMERSAULT','DEVI L BEAST BODY':'DEVIL BEAST BODY','':'VAJRA GUARD'}
OVERRIDE = {
 'CRIMSON PETAL CONFLAGRATION': dict(needs='✹; HANDGUN, LONGGUN, POLEARM', drop=['✹; HANDGUN, LONGGUN,','needs POLEARM']),
 'DEVIL FRAGMENTATION': dict(needs='✹; HANDGUN, LONGGUN, POLEARM', drop=['✹; HANDGUN, LONGGUN,','needs POLEARM']),
 'SCORN GUN TECHNIQUE': dict(needs='✹✹; HANDGUN', drop=['✹✹; HANDGUN; target','needs within 3m'], prefix='The target must be within 3m.'),
 'HELL RIPPED THROUGH WITH EXIT WOUNDS': dict(needs='✹✹ + ❂; HANDGUN, LONGGUN, POLEARM', drop=['✹✹+❂; HANDGUN, LONGGUN,','needs POLEARM']),
 'SUN SHOOTING STYLE': dict(needs='✹✹✹✹✹✹; bow, crossbow, launcher, longgun', drop=['launcher,longgun']),
 'HATRED CONDENSATION SEAL': dict(needs='—', prefix='Requires DEVIL CRUCIBLE.'),
 'COVENANT': dict(needs='—', prefix='Requires Bleeding Heart ✦.'),
 'BODY CAULDRON': dict(needs='—'),
 'PHANTOM ARROW MULTIPLICATION': dict(needs='✹ [X]', prefix='Needs ✹ or ✹✹.'),
 'GRASPING LION MAW': dict(effect='When you KILL THE BUDDHA, burn any number of Flame to immediately, 1-for-1… ✦ control limbs ✦ deal damage to already Controlled limbs. ✦ disarm any weapons in any controlled limbs.'),
 'VAJRA MONKEY BODY': dict(needs='❂❂❂; GREAT SAGE EQUAL TO HEAVEN', drop=['HEAVEN']),
 'MAN OF STEEL MEDITATION': dict(), 'RIGHT-HAND MAN ARCANA': dict(),
}
# Book p.167 (Mendicant; p.169 in the second spoilers) interleaves its columns; these entries were transcribed from the page image.
MANUAL = [
 dict(title='DRAGON SWIMS THE SEAS', stars=1, needs='✹', flavor='A fierce and sudden leg sweep. Always catches people off guard.',
      effect='Quick Opening: Knock the target down to the ground immediately. If used as a Solid Opening, immediately deals damage. +1 if Perfect.'),
 dict(title='SCISSORS OF GOD', stars=1, needs='✹', flavor='A beloved favorite of the grapplers in the style. Horrible to fight against.',
      effect="Solid Opening: The Cultivator leaps up to 3m and scissor her opponent's torso with her legs. Both fall and the Cultivator establishes Control of the target's Torso. The Cultivator lands prone but may stand up as part of the same Opening."),
 dict(title='VAJRA STRIKE', stars=1, needs='✹; EMPTY HAND', flavor="Created by ancient Vajra Boxer Rasun, he used this to slay the first cosmic dragon. A flaw in Rasun's early technique gave rise to this cornerstone. He found that if he released his Sidhi a fraction of a second after his fist connected, the lagging energy would ignite on the target's surface, creating a secondary, explosive impact.",
      effect='[✹] Upon dealing damage, use this Technick to (choose one): ✦ Deal the damage again. ✦ Set the target on fire. ✦ Inflict KNOCKBACK up to 10m. ✦ If the thing damaged is an object up to 100kg in weight, inflict KNOCKBACK up to 50m instead.'),
 dict(title='VAJRA GUARD', stars=2, needs='✹', flavor='Vajra Warrior Atu used this to deflect a nuclear spear. The boxer stills her breath and condenses a film of Iron Sidhi across their forearms and palms. She attunes her energy to the exact moment of an incoming blow.',
      effect='As long as the Cultivator has one Empty Hand, she can burn the Flame to wield her intramaterially empowered bare hands to defend: she can COUNTER any damage attempt against her, even if it is Uncounterable.'),
 dict(title='DOG LAUGHS AT GOD', stars=2, needs='✹', flavor='The Vajra Boxer can cancel her strikes impossibly.',
      effect='When the Cultivator is COUNTERED, she can activate DOG LAUGHS AT GOD to immediately move 4m to any other point within 1m of the target, regain the use of that Opening, and use it immediately against the Counterer to deal damage against their Torso or Limb. This is Uncounterable but can only be used to deal damage.'),
]
def parse_ability(e):
    title = TITLE_FIX.get(e['title'], e['title'])
    lines = [re.sub(r'^//\s*(license|needs)_\s*', r'\1 ', l.strip()) for l in e['lines'] if not JUNK.match(l.strip())]
    if e['title'] == '': lines = lines[1:]
    ov = OVERRIDE.get(title, {})
    for d in ov.get('drop', []):
        if d in lines: lines.remove(d)
    # locate license
    li = next((i for i,l in enumerate(lines) if re.match(r'(?i)licen[sc]e\b', l)), None)
    lic_c, stars, needs, flavor, eff = '', 0, '', [], []
    if li is not None:
        flavor = lines[:li]
        rest = lines[li:]
        m = re.match(r'(?i)licen[sc]e\s*(.*)', rest[0]); lic_txt = m.group(1).strip(); k = 1
        if not lic_txt: lic_txt = rest[1].strip(); k = 2
        if re.search(r'(?i)\bneeds\b', lic_txt):
            lic_txt, inline = re.split(r'(?i)\s*needs\s*', lic_txt, maxsplit=1); rest = rest[:k] + ['needs ' + inline] + rest[k:]
        mm = re.match(r"(.+?)\s*(✦+)\s*$", lic_txt)
        if mm: lic_c, stars = title_case(mm.group(1)), len(mm.group(2))
        else: lic_c = lic_txt
        rest = rest[k:]
        if rest and re.match(r'(?i)needs\b', rest[0]):
            n = re.sub(r'(?i)^needs\s*', '', rest[0]).strip(); k = 1
            if not n and len(rest) > 1: n = rest[1].strip(); k = 2
            needs = n; rest = rest[k:]
        eff = rest
    else:
        flavor, eff = [], lines
    if 'needs' in ov: needs = ov['needs']
    effect = ov.get('effect') or join(eff)
    if ov.get('prefix'): effect = ov['prefix'] + ' ' + effect
    return title, lic_c, stars, needs, join(flavor), effect
def magick_fields(effect):
    f = {}
    m = re.search(r'(?i)MANTRA:?\s*(.+?)\s*(?:\||MUDRA|CAST|CHECK)', effect); f['mantra'] = m.group(1).strip() if m else ''
    m = re.search(r'(?i)MUDRA:?\s*(.+?)\s*(?:\||CAST|CHECK|MANTRA)', effect); f['mudra'] = m.group(1).strip() if m else ''
    m = re.search(r'(?i)CHECK:?\s*([A-Z]+)\s*\+\s*([A-Za-z \-]+?)\s*(?:\||CAST|POTENCY|EFFECT)', effect)
    f['core'] = CORE.get(m.group(1).upper(), 'spi') if m else 'spi'; f['skill'] = title_case(m.group(2)) if m else ''
    m = re.search(r'(?i)CAST(?:ING)? TIME:?\s*([0-9]+)\s*(seconds?|secs?\.?|s\b|minutes?|mins?\.?|m\b|hours?|hrs?\.?|h\b)', effect)
    if m:
        unit = m.group(2).lower().rstrip('.'); n = int(m.group(1))
        unit = 'second' if unit.startswith('s') else 'minute' if unit.startswith('m') else 'hour'
        f['castTime'] = f"{n} {unit}{'s' if n != 1 else ''}"
    else: f['castTime'] = ''
    if f['skill'] in ('Eskaton Sorcery', 'Eskaton Magick'): f['skill'] = 'Black Sorcery'  # Scour still prints the old name
    m = re.search(r'(?i)POTENCY:?\s*(\d+)', effect); f['potency'] = int(m.group(1)) if m else 1
    return f
TRAIL = re.compile(r'\s*(SS IS FORM AND FORM IS EMPTI|CEASE THE CRAVING EMBRACE|ABOLISH THE FLAME BLESSED|THE THRONE OF GOD IS EMPTY|WHAT ARE WE BUT CONTEMPLATIVES|GGANGSUMIK).*$')
abilities, gears = [], []
for e in raw:
    if e['sect'] == 'Mendicant' and e['page'] == 167 and e['title'] not in ('IRON FIST CONDITIONING', 'GRASPING LION MAW'): continue
    if e['title'] == 'SEVEN-STAR TRACK': e = dict(e, type='magick')  # printed under a Gear heading, but it is a Magick (mantra, mudra, cast)
    if (e['type'] == 'gear' and e['title'] != 'SEVEN-STAR TRACK') or e['title'] in ('LANCE OF REVOLUTIONARY WILL', 'GHOST HAND TALISMAN'): gears.append(e); continue
    title, lic, stars, needs, flavor, effect = parse_ability(e)
    if title == 'RETURNING DRAGON SPEAR': effect = effect.split(' 1.5 KG')[0]
    effect = TRAIL.sub('', effect)
    if title == 'FULM': effect = re.sub(r'min\.$', 'min. 1.', effect)
    if title == 'SAMADHI FIRE':
        flavor = 'Samadhi fire is the accomplishment fire. That fire that arises from contemplation and meditation, and the true sight into reality.'
        needs = '✹; weapon that needs ammo'; effect = effect[effect.index('The Cultivator'):]
    effect = re.sub(r'(\s+\d{3})+\s*$', '', effect)
    if title == 'LIVE HAND METHOD': effect = effect.split(' 0.5 KG')[0]
    if title == 'ING KUNG DHARANI': effect = effect.split(' 1 KG N/A PRESTIGE FASHION')[0]
    effect = effect.replace('[VOICE x 5]', '[FACE x 5]')  # 2026-11 test run: Voice is now Face
    effect = re.sub(r'\bArdor\b', 'Flame', effect)  # 2026-11 test run: Ardor is now Flame (Porcelain still prints Ardor)
    if title.startswith('DIALECTIC INVESTIGATION'):
        title, quote = title.split(' "', 1); flavor = ('"' + quote + ' ' + flavor).strip()
    if title == 'SELF-SACRIFICING SAGE':
        effect, copper = effect.split(' COPPER HEAD IRON LIMBS magick ')
        cflavor, crest = copper.split(' license SAGE BODY ✦✦ needs ✹ + ❂❂ ')
        abilities.append(dict(title='COPPER HEAD IRON LIMBS', type='magick', sect=e['sect'], page=e['page'], license='Sage Body', stars=2, needs='✹ + ❂❂', flavor=cflavor, effect=crest))
    abilities.append(dict(title=title, type='magick' if e['type'] == 'magick' else 'technique', sect=e['sect'], page=e['page'], license=lic, stars=stars, needs=needs, flavor=flavor, effect=effect))
for m in MANUAL:
    abilities.append(dict(title=m['title'], type='technique', sect='Mendicant', page=167, license='Vajra Fist', stars=m['stars'], needs=m['needs'], flavor=m['flavor'], effect=m['effect']))
json.dump(dict(abilities=abilities, gears=gears), open('parsed.json', 'w'), indent=1, ensure_ascii=False)
if __name__ == '__main__':
  for a in abilities:
    print(f"## {a['page']} {a['sect']} | {a['title']} [{a['type']}] | {a['license']} {a['stars']} | needs: {a['needs']}\n{a['effect']}")
