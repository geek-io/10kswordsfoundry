"""Build data/options-21.json: the Cultivator Discovery options of the 2.1 player-facing book (187 PDF pages of spreads, 2026-11-11).
Classes (book pp.46-51), Alignments (pp.52-65), Perversions (pp.70-71), Cultures (pp.312-331) and Truths (pp.332-345).
Usage: python tools/options21/gen.py "<book.pdf>" data/    (needs poppler's pdftotext)
Classes and the Fascism Alignment (an image-only spread) are entered by hand from the pages; the rest is read from the PDF text."""
import hashlib, html, json, re, subprocess, sys
PDF, OUT = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else '')
uid = lambda *p: hashlib.sha1('|'.join(p).encode()).hexdigest()[:16]
esc = lambda t: html.escape(t, quote=False)
icon = lambda kind: f'systems/10kswordsfoundry/assets/icons/{kind}.svg'
src = lambda page: f'Rules 2.1 (2.1 player-facing book), p.{page}'
STAR = '✦'
def text(page, raw=False):
    t = subprocess.run(['pdftotext', *(['-raw'] if raw else []), '-f', str(page), '-l', str(page), PDF, '-'], capture_output=True, text=True, check=True).stdout
    return t.replace('ʼ', "'").replace('ˮ', '"')
def paras(lines):
    """Join wrapped lines into paragraphs: a short line that ends a sentence closes the paragraph."""
    lines = [l.strip() for l in lines if l.strip()]
    if not lines: return []
    width = sorted(len(l) for l in lines)[int(len(lines) * 0.8)]
    out, cur = [], ''
    for l in lines:
        if cur.endswith('-') and re.match(r'[a-z]', l) and not cur.endswith(' -'): cur = cur[:-1] + l
        else: cur = (cur + ' ' + l).strip()
        if re.search(r'[.!?…:]["”]?$', l) and len(l) < width - 8: out.append(cur); cur = ''
    if cur: out.append(cur)
    return out
_fixed = {}
def ordered(page):
    """Raw-order text (reliable reading order) with the spaces of bold runs restored from the layout text."""
    if page in _fixed: return _fixed[page]
    raw, lay = text(page, raw=True), text(page)
    words = set(lay.split()); idx = []; ns = []
    for i, ch in enumerate(lay):
        if not ch.isspace(): ns.append(ch); idx.append(i)
    ns = ''.join(ns)
    def fix(tok):
        if len(tok) < 9 or tok in words: return tok
        k = ns.find(tok)
        if k < 0: return tok
        return re.sub(r'\s+', ' ', lay[idx[k]:idx[k + len(tok) - 1] + 1])
    _fixed[page] = '\n'.join(' '.join(fix(t) for t in line.split(' ')) for line in raw.split('\n'))
    return _fixed[page]
p_html = lambda ps: ''.join(f'<p>{esc(p)}</p>' for p in ps)

def trait(name, kind, desc, page, tags, flags, sort):
    return {'name': name, 'type': 'trait', 'img': icon('trait'), 'effects': [], 'sort': sort,
            'system': {'description': desc, 'source': src(page), 'tags': ', '.join(['2.1', *tags]), 'level': 1, 'active': False},
            'flags': {'10kswordsfoundry': {'option21': {'kind': kind, **flags}}}}

# ---------- Classes (book pp.46-51; PDF pp.24-26) ----------
def stars(n): return STAR * n
CLASSES = [
 ('Lumpenproletariat', '3-6', 46, [2, 2, 2, 2, 1, 1], {2: 3, 1: 3}, 1, 'One item, randomly rolled', 1,
  'Oh, wretched of the scum of the earth! Declassed as you are, you hold no organization, but plenty of potential revolution. You can never see the means of production. You are the one the economy needs but will never employ. Unreliable to the Revolution. Capable of desperate revolt but also of cynical reaction.',
  ('Roll a d6 to find out what type you are:', [
   '1-3: You are Reserve Army. The unemployed, the underemployed, the ones between shifts. The vagrants and the nomads and the addicts. The dregs of society. Useful to preserving the order.',
   "4-5: You are Underworld. Smugglers, thieves, unlicensed assayers, the black market's labor force.",
   '6: You are Declassed. The fallen bourgeois — the heir who lost the capital, the officer who lost the pension, the sect master who lost the sect. The most dangerous type, because it remembers what it was.'])),
 ('Semiproletariat', '7-8', 47, [3, 2, 2, 2, 1, 1], {2: 4, 1: 4}, 2, 'Two items or one item + one weapon', 100,
  'A half-breed—only partially dependent on wages, and partially dependent on their own land or machinery or another seasonal/part time employment. Half your soul in the mines, half in the land. Half a wage, half a harvest. Half a machine, half a canvas. Half a master, half a slave. Reliable allies for revolution, but easily purchasable as well.', None),
 ('Proletariat', '9-12', 47, [3, 3, 2, 2, 1, 1], {2: 5, 1: 5}, 2, 'Two gear + one item', 20,
  'Arise, ye prisoners of starvation! Arise, ye wretched of the earth! Justice thunders condemnation! You are 100% dependent on your wages for the most elementary of human needs. Not even able to afford shelter, housing, and medicine. But organized within the workplace, or with coworkers. The nucleus of the world—every magicite shard comes from your backbreaking work.',
  ('Roll a d6 to find out your sector:', [
   '1: Mining. Shortest lives. Bound together.', '2: Agrarian. Farmers, harvesters, slaves.',
   '3: Industry. Refiners, carpenters, foremen, construction, devil engine workers, weavers, assembly line slaves.',
   '4: Service. Clerks, tellers, customer service, masseuses, waiters, and so on.', '5: Transport. The skyship crew, the caravan hand.',
   "6: Sect. Sidhi workers, working for Sect's Gossamer Looms and computers."])),
 ('Petit Bourgeoisie', '13', 48, [3, 3, 3, 2, 1, 1], {2: 5, 1: 5}, 3, 'Two gear + one item', 150,
  "The small business owner, the scourge of the proletariat! Your class interest is in getting richer, and those damned communists are so fucking annoying about it. Shouldn't everyone get rich? For the Revolution? Don't get it twisted: you're always just one day away from proletarianization.", None),
 ('Spherical Bourgeoisie', '14', 49, [3, 3, 3, 2, 2, 1], {3: 1, 2: 5, 1: 5}, 4, 'Two gear + two items', 200,
  "The nation as it stands has gone through an evolution in the Trichiliocosm. Most nations encompass the majority of entities within a Sphere. Some Hells (such as Hingsajagra), still have divided national bourgeoisie, fighting for national development. Something they will never get, of course, as long as they are under imperialism. You are a dangerous ally: you will march with the workers to strike at Heaven's heart, but it is in your class interest to either work with Heaven or sit upon its thrones.",
  ('Roll d6 to see where you struggle:', [
   '1-4: You are Sub-Spherical Bourgeoisie or National Bourgeoisie. You want national progress for your own wishes.',
   '5-6: You are World Bourgeoisie. You are owners of businesses and means of production that want to accelerate and/or progress the Spherical industries of your particular sphere (in this case, of Hingsajagra).'])),
 ('Comprador Bourgeois', '15', 48, [3, 3, 3, 2, 2, 2], {3: 2, 2: 5, 1: 5}, 4, 'Two gear + two items', 300,
  "The administer for the Imperial Core—that is to say, for the Heavens. You deliver labor, quell unrest, sign treaties, lobby for policies that strengthen imperialism, and take cuts from what they give you. It's not corruption, it's just the way things work around here. But when the Hells boil over, you are the first to be pulled. Those in the Heavens will toss you overboard first.", None),
 ('Bureaucrat Capitalists', '16', 48, [3, 3, 3, 2, 2, 2], {3: 2, 2: 5, 1: 5}, 4, 'One weapon + two armor pieces + two items', 500,
  'You clever devil you: a child of nepotism and political dynasty, rife in the Hells. Your Capital is the State, whether that be a government in a sphere or the World Government of a particular Sphere.', None),
 ('Landlord', '17', 50, [3, 3, 3, 3, 2, 2], {3: 3, 2: 5, 1: 5}, 5, 'Two weapons + two armor pieces + three items', 800,
  'The land-owning class. Extract profit through rent. You are the heirs of ancient feudalist styles of rule: kings and emperors. Warlords and Sect Masters who rule over those that live within them, extracting rent from them.', None),
 ('Heavenly Bourgeoisie', '18', 50, [4, 3, 3, 3, 2, 2], {3: 5, 2: 5, 1: 5}, 6, 'Two weapons + two armor pieces + three items', 1000,
  'You own the shrines, the temples, the starships, the star-devouring arrays, the banks, the ♄-shrines, the means of production. You cannot be reformed—your Class must be abolished. And you know it.', None),
]
WORD = {1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five'}
def klass(n, row):
    name, roll, page, cores, cults, assets, gear, mag, flavor, sub = row
    cult_text = ', '.join(f'{stars(s)} to {WORD[c]} Cultivation{"s" if c > 1 else ""}' for s, c in cults.items())
    desc = (f'<p><strong>Class · roll 3d6: {roll}</strong></p><p>{esc(flavor)}</p>'
            f'<ul><li><strong>Cores:</strong> {", ".join(stars(c) for c in cores)}</li><li><strong>Cultivations:</strong> {cult_text}</li>'
            f'<li><strong>Assets:</strong> start with {stars(assets)} to buy</li><li><strong>Gear:</strong> {esc(gear)}</li><li><strong>Starting ♄:</strong> {mag:,} × d6 mag</li></ul>')
    if sub: desc += f'<p>{esc(sub[0])}</p><ul>' + ''.join(f'<li>{STAR} {esc(s)}</li>' for s in sub[1]) + '</ul>'
    desc += ('<p><em>Class is your relation to the means of production — what you own, what you sell, and what owns you. It is not Alignment, and it is not a cage (book p.46). '
             'Drop the Class on a 2.1 character to record it; assign the Stars, Assets, gear and starting ♄ by hand.</em></p>')
    return {'name': name, 'type': 'job', 'img': icon('job'), 'effects': [], 'sort': n * 1000,
            'system': {'description': desc, 'source': src(page), 'category': 'body', 'cultivations': {k: 1 for k in ('vio', 'dia', 'grc', 'sav', 'wrd', 'spi')}, 'grants': [], 'tags': '2.1, Class'},
            'flags': {'10kswordsfoundry': {'class21': {'roll': roll, 'cores': cores, 'cultivations': {str(k): v for k, v in cults.items()}, 'assets': assets, 'gear': gear, 'magPerD6': mag}}}}

# ---------- Alignments (book pp.52-65; PDF pp.27-33) ----------
ALIGN_NAMES = {'2': 'Fascism', '3': 'Absolutism', '4': 'Accelerationism', '5': 'Liberalism', '6': 'Libertarianism', '7': 'Centrism', '8': 'Social Democracy',
               '9': 'Democratic Socialism', '10': 'Romantic Socialism', '11-12': 'Communism'}
FASCISM = ['Reactionary Right. The Alignment of the Mighty, of One People in One Government under One Leader. The Fascists of the Trichiliocosm are scattered, nothing but obsession with aesthetics and posturing, but they do have a wish, and it is the destruction of all neoliberal separation, of "diversity" and the enshrinement of Cultivator Supremacy. Or was it Ivorian Supremacy? Or was it the reinstatement of the Cosmic Empire?',
 'All of this to justify the worst of societal ills: the belief in a mythic identity, the following of the people bundled into sticks under a Great Man, the violent destruction of those that would dissent, the glorification of military might and a cult of violence.',
 'The ultimate Counterrevolution: the concentration of private property and corporate power subordinated into the goals of the nation. The ultimate destruction from the top to bottom, headed by an aristocratic or bourgeois leader who does not fight for the people but for the Race! For the Bloodline! For the Purity! For the Country! The Leader is always right! For the God, for the Fatherland, Family! Reach Heaven Through Violence!',
 'Fascist Sub-Alignments are...',
 '✦ Chariotism — The Masses moving as one, like a bundle of sticks, to protect and preserve the sanctity and sacrality of the Merkabahn Faith.',
 '✦ Gaeanism — The soil of our Sphere is the soil of our Mothers. The land is pure—it is us sentient beings that are the virus!',
 '✦ Corporatism — May our hallowed nation be one body, with our guilds as the organ, and our Head as the hallowed Supreme Leader who will show us the way.',
 'As a Fascist You Should...',
 '✦ Subordinate the self to the body. The nation, or the bloodline, or the sect, or God comes first. Your individuality is nothing but a hindrance to Heaven.',
 "✦ Blame A Group. Any group will work. It's always their fault the world has gone to shit!",
 "✦ Make Everything Divine. Put forth oath, uniform, parade, anthem, song, and heroes first and foremost. Ritualize them, turn them into new gods. The teeming masses don't give a damn about the Truth!",
 '✦ Obey The Leader For The Promised Land! The ancient empires brought us Sidhi, right? It brought us power. The only way we will return to the ancient empires is through the movement as a body, as bundle of sticks. Subordinate yourself to the Great Will!']
def align_html(ps):
    out, bullets = [], []
    def flush():
        if bullets: out.append('<ul>' + ''.join(f'<li>{esc(b)}</li>' for b in bullets) + '</ul>'); bullets.clear()
    for p in ps:
        if p.startswith(STAR): bullets.append(p)
        elif re.search(r'(Sub-Alignments are|You Should)\s*(\.\.\.|…)$', p): flush(); out.append(f'<p><strong>{esc(p)}</strong></p>')
        else: flush(); out.append(f'<p>{esc(p)}</p>')
    flush(); return ''.join(out)
def alignments():
    lines = []
    for page in range(28, 34):
        for l in ordered(page).split('\n'):
            l = l.strip()
            if not l or re.fullmatch(r'[\d ]{2,7}', l): continue
            lines.append((page, l))
    heads = [(i, m.group(1)) for i, (_, l) in enumerate(lines) for m in [re.match(r'^\[(\d+(?:-\d+)?)\]\s*[A-Z ]+$', l)] if m]
    assert [h[1] for h in heads] == ['3', '4', '5', '6', '7', '8', '9', '10', '11-12'], heads
    found = {'2': (27, FASCISM)}
    for n, (i, roll) in enumerate(heads):
        end = heads[n + 1][0] if n + 1 < len(heads) else len(lines)
        body = [l for _, l in lines[i + 1:end]]
        if roll == '11-12': body = body[:next((k + 1 for k, l in enumerate(body) if l.endswith('the collective.')), len(body))]
        if roll == '10': body = body[:next((k + 2 for k, l in enumerate(body) if l.endswith('Create a world better than this')), len(body))]   # the Names table follows
        # paragraphs, with each Star bullet kept as its own paragraph
        ps, cur = [], []
        def close():
            if cur: ps.extend(paras(cur)); cur.clear()
        for l in body:
            if l.startswith(STAR) or re.search(r'(Sub-Alignments are|You Should)\s*(\.\.\.|…)$', l): close(); ps.append(l)
            elif ps and ps[-1].startswith(STAR) and not cur and not re.search(r'[.!?…]["”]?$', ps[-1]): ps[-1] = (ps[-1][:-1] if ps[-1].endswith('-') and l[:1].islower() else ps[-1] + ' ') + l
            elif ps and ps[-1].startswith(STAR) and not cur and len(l) < 60 and re.search(r'[a-z,]$', ps[-1][-1:] or ''): ps[-1] += ' ' + l
            else: cur.append(l)
        close()
        found[roll] = (lines[i][0], ps)
    out = []
    for n, (roll, name) in enumerate(ALIGN_NAMES.items()):
        page, ps = found[roll]
        book = 53 if roll == '2' else 2 * page - 2
        desc = f'<p><strong>Alignment · roll 2d6: {roll}</strong></p>' + align_html(ps)
        out.append(trait(name, 'alignment', desc, book, ['Alignment'], {'roll': roll}, n * 1000))
    return out

# ---------- d66 lists read in raw order: Cultures and Truths ----------
def d66_entries(pages, headings):
    """headings: list of (printed heading with spaces removed, display name, [codes]). Returns (name, codes, paragraphs, book page)."""
    key = {h[0]: h for h in headings}
    cur, out = None, []
    for page in pages:
        for l in ordered(page).split('\n'):
            s = l.strip(); squashed = re.sub(r'[^A-Z]', '', s)
            if not s or re.fullmatch(r'[\d ]+', s): continue
            if s.isupper() and squashed in key and (cur is None or squashed != cur['key']):
                cur = {'key': squashed, 'name': key[squashed][1], 'codes': key[squashed][2], 'lines': [], 'page': page}; out.append(cur); continue
            if cur is not None: cur['lines'].append(s)
    assert [e['key'] for e in out] == [h[0] for h in headings], ([e['key'] for e in out], [h[0] for h in headings])
    return out
CODES = [f'{a}{b}' for a in range(1, 7) for b in range(1, 7)]
CULTURES = ['Ragaan', 'Shennin', 'Razrunan', 'Wotanese', 'Munese', 'Kezzanese', 'Wayinese', 'Sampakanese', 'Ratenese', 'Amatsunese', 'Chugoinese', 'Bidaran',
            'Kemrese', 'Selorongian', 'Nunukian', 'Sorehnese', 'Premese', 'Sukunese', 'Meonese', 'Vatuanese', 'Changuo', 'Sengvatese', 'Nakarajan', 'Kemayil',
            'Zenaran', 'Namlang', 'Thulian', 'Naomian', 'Vanavarian', 'Sobanese', 'Isanese', 'Oxomese', 'Krasnan', 'Kamguk', 'Dakdu', 'Hokou']
TRUTHS = [('THEMATERIAL', 'The Material', ['11', '12', '13']), ('THEIDEAL', 'The Ideal', ['14', '15', '16']), ('EOLOMISM', 'Eolomism', ['21']),
          ('YENJANISM', 'Yenjanism', ['22', '23', '24']), ('IMPERIALYENJANISM', 'Imperial Yenjanism', ['25']), ('DISSENTERISM', 'Dissenterism', ['26']),
          ('FOLKYENJANISM', 'Folk Yenjanism', ['31']), ('HAVOCLOGIC', 'Havoc Logic', ['32']), ('BLACKNECTAR', 'Black Nectar', ['33']), ('MACHINEGODCODE', 'Machine God Code', ['34']),
          ('WILLOFHEAVEN', 'Will of Heaven', ['35']), ('SOLARISM', 'Solarism', ['36']), ('LUNARISM', 'Lunarism', ['41']), ('ENLIGHTENMENTLOGIC', 'Enlightenment Logic', ['42', '43', '44']),
          ('INFINITECODE', 'Infinite Code', ['45', '46', '51']), ('UNCONQUERABLEMAIDEN', 'Unconquerable Maiden', ['52']), ('JINDO', 'Jindo', ['53']), ('YAJISM', 'Yajism', ['54']),
          ('RATIONALISM', 'Rationalism', ['55']), ('DEMONISM', 'Demonism', ['56']), ('ULTRAMATERIALISM', 'Ultramaterialism', ['61']),
          ('ZANYATISMORGLEAMINGBLACKLAW', 'Zanyatism or Gleaming Black Law', ['62']), ('DAWNISM', 'Dawnism', ['63']), ('DUSKISM', 'Duskism', ['64']), ('RUTRAISM', 'Rutraism', ['65', '66'])]
def code_label(codes): return f'[{codes[0][0]}][{codes[0][1]}]' + (f'–[{codes[-1][0]}][{codes[-1][1]}]' if len(codes) > 1 else '')
def d66_items(kind, label, pages, headings, tail=None):
    out = []
    for n, e in enumerate(d66_entries(pages, headings)):
        lines = e['lines']
        if tail and n == len(headings) - 1: lines = tail(lines)
        book = 2 * e['page'] - 2
        desc = f'<p><strong>{label} · d66 {code_label(e["codes"])}</strong></p>' + p_html(paras(lines))
        out.append(trait(e['name'], kind, desc, book, [label, 'd66 ' + '/'.join(e['codes'])], {'codes': e['codes']}, n * 1000))
    return out

# ---------- Perversions (book pp.70-71; PDF p.36) ----------
def perversions():
    t = re.sub(r'\s+', ' ', text(36, raw=True))
    t = t[t.index('1.1 While you talk'):t.index('REFINERIES')]
    # Codes sit in their own column, so a long entry can be printed before or around its code; fix the three that are.
    t = t.replace("Your eyes' sclera turn black and your irises white. 4.1 Stigmata", "Your eyes' sclera turn black and your irises white. 4.1 Stigmata")
    parts = re.split(r'(?<![\d.])([1-6]\.[1-6])(?![\d.])', t)
    entries = {}
    pre = parts[0].strip()
    for code, body in zip(parts[1::2], parts[2::2]): entries[code] = body.strip().replace('plastic- and-mantra', 'plastic-and-mantra')
    order = [f'{a}.{b}' for a in range(1, 7) for b in range(1, 7)]
    # Entries whose text was emitted before their code: move the dangling tail of the previous entry forward.
    for i, code in enumerate(order):
        if code in entries and not entries[code] and i > 0:
            prev = entries[order[i - 1]]; cut = max(prev.rfind('. ', 0, len(prev) - 2), 0)
            entries[code] = prev[cut + 2:] if cut else prev; entries[order[i - 1]] = prev[:cut + 1] if cut else ''
    assert set(entries) == set(order), sorted(set(order) - set(entries))
    return entries

# ---------- Names (book p.63) ----------
def names():
    cols = ['2–3', '4', '5', '6', '7', '8', '9', '10', '11–12']
    rows = [
        ('2',  ['SA TA', 'KA', 'TAT', 'DIN', 'KET', 'JO', 'SONG', 'TRANG', 'ĲA']),
        ('3',  ['ANG RA', 'JU', 'DEN', 'TAN', 'KAG', 'JYA', 'ME', 'TUNG', 'SUN']),
        ('4',  ['MA GAN', 'HA', 'WI', 'SANG', 'A', 'DA', 'YU', 'NA', 'XUN']),
        ('5',  ['HOM LING', 'SU', 'YA', 'DJO', 'LI', 'JONG', 'AD', 'LAM', 'RAM']),
        ('6',  ['KI MOENG', 'ZAN', 'SAT', 'MI', 'UI', 'ZON', 'KEH', 'TJIA', 'YO']),
        ('7',  ['JA FENG', 'RENG', 'TONG', 'RI', 'XE', 'RO', 'REO', 'NE', 'CHO']),
        ('8',  ['O E', 'KANG', 'HAN', 'WANG', 'UA', 'KI', 'KUN', 'LUN', 'YONG']),
        ('9',  ['KASHINTA', 'DA', 'INDA', 'JAM', 'KU', 'JOH', 'TAR', 'DE', 'SERI']),
        ('10', ['RIN GEOH', 'HYAN', 'PRA', 'RAI', 'YOE', 'ZOE', 'KOH', 'WU', 'BU']),
        ('11', ['SUNG RIM', 'LIM', 'TAM', 'KIEN', 'DIA', 'WA', 'KON', 'LOONG', 'TEO']),
        ('12', ['SHOK CHIM', 'GOT', 'THA', 'YUN', 'TAL', 'RA', 'XOE', 'YE', 'YONG']),
    ]
    head = '<tr><th>2d6&nbsp;↓ / 2d6&nbsp;→</th>' + ''.join(f'<th>{esc(c)}</th>' for c in cols) + '</tr>'
    body = ''.join('<tr><th>' + r + '</th>' + ''.join(f'<td>{esc(v)}</td>' for v in vals) + '</tr>' for r, vals in rows)
    desc = ('<p><strong>Names · roll 2d6 twice (row, then column)</strong></p>'
            '<p>The shortest poem. Make one up. Or roll. Or choose. These are syllables. Put together one or two or '
            'three or four. Roll 2d6 twice, as many times as you want. Modify any syllable: add a consonant before or '
            'after, or change a vowel.</p>'
            f'<table>{head}{body}</table>')
    return [trait('Names', 'names', desc, 63, ['Names'], {'table': '2d6×2'}, 0)]

if __name__ == '__main__':
    groups = {}
    groups['Classes (3d6)'] = [klass(n, row) for n, row in enumerate(CLASSES)]
    groups['Alignments (2d6)'] = alignments()
    groups['Cultures (d66)'] = d66_items('culture', 'Culture', range(158, 167), [(n.upper(), n, [CODES[i]]) for i, n in enumerate(CULTURES)])
    def truth_tail(lines):
        return lines
    groups['Truths (d66)'] = d66_items('truth', 'Truth', range(167, 174), TRUTHS, truth_tail)
    pv = perversions()
    groups['Perversions (d66)'] = [trait(f'Perversion {c}', 'perversion', f'<p><strong>Perversion · d66 [{c[0]}][{c[2]}]</strong></p><p>{esc(body)}</p><p><em>Roll a d66 when you rise in Sidhi Stage, or choose (book p.70).</em></p>',
                                         70 if c < '3.5' else 71, ['Perversion', 'd66 ' + c.replace('.', '')], {'codes': [c.replace('.', '')]}, n * 1000) for n, (c, body) in enumerate(sorted(pv.items()))]
    groups['Names (2d6)'] = names()
    folders, items = [], []
    for fi, (label, entries) in enumerate(groups.items()):
        f = {'_id': uid('folder', 'options-21', label), 'name': label, 'folder': None, 'type': 'Item', 'sorting': 'm', 'sort': fi * 100000, 'color': None}
        folders.append(f)
        for e in entries: items.append({'_id': uid('options-21', label, e['name']), **e, 'folder': f['_id']})
        print(label, len(entries))
    assert len({i['_id'] for i in items}) == len(items)
    json.dump({'folders': folders, 'items': items}, open(f'{OUT}options-21.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
