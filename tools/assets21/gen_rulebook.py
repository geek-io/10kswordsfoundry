# Builds data/assets-21.json from the ASSETS chapter of the 2.1 rulebook (303 pp, 2026-11-16; book pp.211-218, PDF page = book page).
# Usage: python tools/assets21/gen_rulebook.py "<2.1 rulebook.pdf>" data/ [--table]   (needs poppler's pdftotext)
# --table prints the ASSETS_21 rows for scripts/rules21.mjs. Barang are built by tools/sects21 from the Sect chapter.
# gen_book.py is the generator for the earlier player-facing book and is kept for reference only.
import hashlib, html, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from blocks import assets
PDF, OUT = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else '')
uid = lambda *parts: hashlib.sha1('|'.join(parts).encode()).hexdigest()[:16]
esc = lambda t: html.escape(t, quote=False)
ICON = 'systems/10kswordsfoundry/assets/icons/{}.svg'
SRC = 'Rules 2.1 (2.1 rulebook), p.{}'
# d36 code -> data key used by the system (scripts/rules21.mjs ASSETS_21).
KEYS = {'11': 'debt', '12': 'capital', '13': 'jadeComplexion', '14': 'wroughtLimb', '15': 'standing', '16': 'reputation',
        '21': 'loomAccess', '22': 'mountainFrame', '23': 'ghostEar', '24': 'patron', '25': 'intraIntBond', '26': 'hollowConscience',
        '31': 'sheerStoneHeart', '32': 'intriguist', '33': 'rawNerve', '34': 'narcissus', '35': 'wallflower', '36': 'ironHand',
        '41': 'anvilHead', '42': 'springTendonLegs', '43': 'pythonGrip', '44': 'beastlyClaws', '45': 'venomGlands', '46': 'hummingbirdPulse',
        '51': 'thirdEyeOpen', '52': 'spineTerminalPort', '53': 'tacticianSoul', '54': 'shadowPersonality', '55': 'adamantWill', '56': 'archivalMemory',
        '61': 'sleeplessSoul', '62': 'gutterTongue', '63': 'armory', '64': 'cargoLineSlot', '65': 'kin', '66': 'reincarnationInsurance'}
AUTOMATIC = {'mountainFrame', 'anvilHead', 'springTendonLegs', 'hummingbirdPulse', 'sleeplessSoul'}
# Printed typos and older Core names corrected in the catalog text (noted in docs/item-catalog-2.1.md).
FIXES = [('Intre-Int', 'Intra-Int'), ('Spirit + Stillness', 'Heart + Stillness'), ('Voice-based', 'Face-based')]
SMALL = {'And', 'Of', 'The', 'For', 'In'}
def title(name):
    words = [w.capitalize() if '-' not in w else '-'.join(p.capitalize() for p in w.split('-')) for w in name.split()]
    return ' '.join(w if i == 0 or w not in SMALL else w.lower() for i, w in enumerate(words))
def paragraphs(blocks):
    out = []
    for lines in blocks:
        text, bullets = [], []
        def flush_text():
            if text: out.append('<p>' + esc(' '.join(text)) + '</p>'); text.clear()
        def flush_bullets():
            if bullets: out.append('<ul>' + ''.join(f'<li>{esc(b)}</li>' for b in bullets) + '</ul>'); bullets.clear()
        for line in (l.strip() for l in lines):
            if not line: continue
            if line.startswith('✦') and not (text and not re.search(r'[.!?:]$', text[-1])): flush_text(); bullets.append(line)
            elif bullets and not re.search(r'[.!?:)]$', bullets[-1]): bullets[-1] += ' ' + line
            else: flush_bullets(); text.append(line)
        flush_text(); flush_bullets()
    s = re.sub(r'(\w)- (\w)', r'\1-\2', ''.join(out))
    for a, b in FIXES: s = s.replace(a, b)
    return s
found = assets(PDF, pages=range(211, 219), columns=(33, 219), ymax=566, book=lambda page, column: page)
assert [a['code'] for a in found] == sorted(KEYS), [a['code'] for a in found]
ROW_NAMES = {'1': 'Means & Standing', '2': 'Backing & Frame', '3': 'Temperament', '4': 'Body', '5': 'Mind & Ports', '6': 'Means & Kin'}
folders = [{'_id': uid('folder', 'assets21', row), 'name': f'[{row}] {ROW_NAMES[row]}', 'folder': None, 'type': 'Item', 'sorting': 'm', 'sort': int(row) * 100000, 'color': None} for row in '123456']
items, table = [], {}
for a in found:
    code, key, name = a['code'], KEYS[a['code']], title(a['name'])
    stars = re.findall(r'✦+', a['stars']); low, high = len(stars[0]), len(stars[-1])
    blocks = [b for b in a['blocks'] if re.search(r'[a-z]{3}', ' '.join(b))]      # all-capital blocks on p.196-197 are display art
    if code == '66' and len(blocks) > 1 and blocks[1][0].startswith('t and use'): blocks = [blocks[0][:-1] + [blocks[0][-1] + blocks[1][0]] + blocks[1][1:]] + blocks[2:]
    note = '<p><em>Applied automatically on the Ticks tracker: your first READY die is rolled twice and the lower kept.</em></p>' if key == 'hummingbirdPulse' else '<p><em>Applied automatically on the 2.1 sheet.</em></p>' if key in AUTOMATIC else ''
    desc = f'<p><strong>[{code[0]}][{code[1]}] {esc(name)}</strong> · {"✦" * low}{("–" + "✦" * high) if high > low else ""}</p>' + paragraphs(blocks) + note
    items.append({'_id': uid('asset21', key), 'name': name, 'type': 'asset', 'img': ICON.format('asset'), 'folder': uid('folder', 'assets21', code[0]),
        'sort': int(code[1]) * 1000, 'effects': [],
        'system': {'description': desc, 'source': SRC.format(a['book']), 'tags': f'2.1, Asset, [{code[0]}][{code[1]}]', 'key': key, 'stars': low, 'detail': ''},
        'flags': {'10kswordsfoundry': {'asset21': {'code': code, 'minStars': low, 'maxStars': high, 'sourcePage': a['book']}}}})
    table[key] = {'code': code, 'label': name, 'min': low, 'max': high, 'page': a['book']}
json.dump({'folders': folders, 'items': items}, open(OUT + 'assets-21.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(len(items), 'Assets')
if '--table' in sys.argv:
    for key, row in table.items(): print(f"  {key}: {{code: \"{row['code']}\", label: \"{row['label']}\", min: {row['min']}, max: {row['max']}, page: {row['page']}}},")
