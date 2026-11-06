# Builds the 2.1 Asset and Barang catalogs (data/assets-21.json, data/barang-21.json).
# Usage: python tools/assets21/gen.py "<10,000 SWORDS AGAINST HEAVEN 2.1 ALPHA.pdf>" data/   (needs poppler's pdftotext)
# Assets come from the 2.1 Alpha's ASSETS chapter (pp.44-48 of the 56-page Alpha).
# Barang come from the Sect introductions in the 2.1 playtest Sects (64 pages, 2026-11-06); they are hand-entered below.
import hashlib, html, json, re, subprocess, sys

PDF, OUT = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else '')
uid = lambda *parts: hashlib.sha1('|'.join(parts).encode()).hexdigest()[:16]
esc = lambda t: html.escape(t, quote=False)
ICON = 'systems/10kswordsfoundry/assets/icons/{}.svg'

# d36 code -> data key used by the system (scripts/rules21.mjs ASSETS_21).
KEYS = {'11': 'debt', '12': 'capital', '13': 'jadeComplexion', '14': 'wroughtLimb', '15': 'standing', '16': 'reputation',
        '21': 'loomAccess', '22': 'mountainFrame', '23': 'ghostEar', '24': 'patron', '25': 'intraIntBond', '26': 'hollowConscience',
        '31': 'sheerStoneHeart', '32': 'longCon', '33': 'rawNerve', '34': 'narcissus', '35': 'wallflower', '36': 'karmicAgent',
        '41': 'anvilHead', '42': 'springTendonLegs', '43': 'pythonGrip', '44': 'beastlyClaws', '45': 'venomGlands', '46': 'hummingbirdPulse',
        '51': 'thirdEyeOpen', '52': 'spineTerminalPort', '53': 'tacticianSoul', '54': 'compartmentalMind', '56': 'adamantWill',
        '61': 'archivalMemory', '62': 'sleeplessSoul', '63': 'gutterTongue', '64': 'armory', '65': 'cargoLineSlot', '66': 'reincarnationInsurance'}
AUTOMATIC = {'mountainFrame', 'anvilHead', 'springTendonLegs', 'hummingbirdPulse', 'sleeplessSoul'}
# Printed typos corrected in the catalog text (noted in docs/item-catalog-2.1.md).
FIXES = [('YFast-twitch', 'Fast-twitch'), ('\nangs, a spur', '\nFangs, a spur'), ('Intre-Int', 'Intra-Int'),
         # 2026-11 test run: Voice is now Face and Spirit is now Heart.
         ('Spirit + Stillness', 'Heart + Stillness'), ('Spirit +\nStillness', 'Heart +\nStillness'), ('Voice-based', 'Face-based')]

pages = {}
for page in range(44, 49):
    text = subprocess.run(['pdftotext', '-raw', '-f', str(page), '-l', str(page), PDF, '-'], check=True, capture_output=True, text=True).stdout
    lines = text.split('\n')
    if lines and lines[0].strip() == str(page): lines = lines[1:]
    pages[page] = '\n'.join(lines)
lines = []
for page, text in pages.items():
    for line in text.split('\n'):
        lines.append((page, line))
full = '\n'.join(line for _, line in lines)
for a, b in FIXES: full = full.replace(a, b)
full = re.sub(r'Spirit(\s+)\+(\s+)Stillness', r'Heart\1+\2Stillness', full)
lines = [(lines[i][0], line) for i, line in enumerate(full.split('\n'))]

head = re.compile(r'^\[(\d)\]\s*\[(\d)\]\s*(.+?)\s*$')
starts = [i for i, (_, line) in enumerate(lines) if head.match(line)]
assert len(starts) == 35, len(starts)

def paragraphs(body):
    # Lines starting with Stars are list entries. A following line continues the entry until one ends a sentence.
    out, text, bullets = [], [], []
    def flush_text():
        if text: out.append('<p>' + esc(' '.join(text)) + '</p>'); text.clear()
    def flush_bullets():
        if bullets: out.append('<ul>' + ''.join(f'<li>{esc(b)}</li>' for b in bullets) + '</ul>'); bullets.clear()
    for line in (l.strip() for l in body):
        if not line: continue
        if line.startswith('✦') and not (text and not re.search(r'[.!?:]$', text[-1])):
            flush_text(); bullets.append(line)
        elif bullets and not re.search(r'[.!?:)]$', bullets[-1]):
            bullets[-1] += ' ' + line
        else:
            flush_bullets(); text.append(line)
    flush_text(); flush_bullets()
    return re.sub(r'(\w)- (\w)', r'\1-\2', ''.join(out))

folders, items = [], []
ROW_NAMES = {'1': 'Means & Standing', '2': 'Backing & Frame', '3': 'Temperament', '4': 'Body', '5': 'Mind & Ports', '6': 'Memory & Means'}
for row in '123456':
    folders.append({'_id': uid('folder', 'assets21', row), 'name': f'[{row}] {ROW_NAMES[row]}', 'folder': None, 'type': 'Item', 'sorting': 'm', 'sort': int(row) * 100000, 'color': None})
for n, start in enumerate(starts):
    end = starts[n + 1] if n + 1 < len(starts) else len(lines)
    page, title = lines[start][0], head.match(lines[start][1])
    code = title.group(1) + title.group(2)
    rest = title.group(3)
    body = [line for _, line in lines[start + 1:end]]
    # The Star range can wrap onto the next line ("✦ -" / "✦✦✦✦✦").
    while body and re.match(r'^[✦\s\-–]+$', body[0]): rest += ' ' + body.pop(0).strip()
    name = re.sub(r'\s*✦.*$', '', rest).strip()
    stars = re.findall(r'✦+', rest)
    low, high = (len(stars[0]), len(stars[-1])) if stars else (1, 3)
    if code == '54': low, high = 1, 3       # printed "✦-✦✦✦" on the next line
    if code == '66': low, high = 2, 5       # printed "✦✦-✦✦✦✦✦" on the next line
    key = KEYS[code]
    note = '<p><em>Applied automatically on the 2.1 sheet.</em></p>' if key in AUTOMATIC else ''
    desc = f'<p><strong>[{code[0]}][{code[1]}] {esc(name)}</strong> · {"✦" * low}{("–" + "✦" * high) if high > low else ""}</p>' + paragraphs(body) + note
    items.append({'_id': uid('asset21', code), 'name': name, 'type': 'asset', 'img': ICON.format('asset'), 'folder': uid('folder', 'assets21', code[0]),
        'sort': int(code[1]) * 1000, 'effects': [],
        'system': {'description': desc, 'source': f'Rules 2.1 (2.1 Alpha), p.{page}', 'tags': f'2.1, Asset, [{code[0]}][{code[1]}]', 'key': key, 'stars': low, 'detail': ''},
        'flags': {'10kswordsfoundry': {'asset21': {'code': code, 'minStars': low, 'maxStars': high, 'sourcePage': page}}}})
json.dump({'folders': folders, 'items': items}, open(OUT + 'assets-21.json', 'w'), indent=1, ensure_ascii=False)

# ---------- Barang (2.1 playtest Sects, Sect introductions; book page = PDF page + 129) ----------
BARANG = [
 ('Asuri', 130, 'Six-Armed Asura Spider', 'Demon Body', '',
  'The demonic SIX-ARMED ASURA SPIDER burrows and establishes a burning brimstone heartweb into a Cultivator.',
  'The Asuri cultivate the DEMON BODY: the offensive, wrath-focused sister of the calmer, defensive SAGE BODY. It includes technicks that take advantage of a body tuned to commit as much violence as possible.'),
 ('Aswang', 134, "Devil's Centipede", 'Devil Beast', 'Dagger, Empty Hand, Sword',
  "The Devil's Centipede is one of the most well known of Barang, but paradoxically, the rarest to actually see in real life.",
  'DEVIL BEAST is a martial art with some magick aspects that manipulate shadows, emphasize stealth, buffet footsteps, and allow for apportation through shadows. It can be used when engaging in violence with a Dagger, Empty Hand, or Sword.'),
 ('Dracontine', 138, 'Sky Dancing Wyrm', 'Sky Dragon', 'Daggers, Polearms',
  'The Dracontines are issued the Barang SKY DANCING WYRM, which grants the Sidhic License to practice Dragon Dances Across Heavens Technicks and Gear.',
  'SKY DRAGON can be used when engaging in violence with Daggers and Polearms to deliver rushing and jagged piercing blows, mimicking the flight of the Dragons.'),
 ('Eskatonian', 142, 'Eskaton Satanworm', 'Black Sorcery', 'Casting Black Sorcery Magicks',
  "The ESKATON SATANWORM is a writhing black caterpillar-like worm that burrows deep into one's heart and sets one on the path of destruction.",
  'BLACK SORCERY is focused on bringing about the end through dynamism and its negation.'),
 ('Fangshi', 146, 'Spring and Autumn Cicada', 'Internal Elixir', 'Pills, elixirs, medicine and outer alchemy',
  'The SPRING AND AUTUMN CICADA represents the longlasting nature of the Fangshi and the goal of Immortality.',
  'INTERNAL ELIXIR is the perfection of both Inner and Outer Alchemies. It can be used for Checks concerning pills and pill-making, elixirs, concoction making, medicine, and outer alchemy.'),
 ('Houyi', 150, 'Three-Toed Crow Monarch', 'Solar Bow', 'Bows, Crossbows, Launchers, Longguns, Handguns',
  'The Three-Toed Crow Monarch is a butterfly that looks like a crow or a raven. It bestows the ancient Licenses for wielding and expressing the Killing Wind.',
  'SOLAR BOW: masters of killing from afar and making sure they are never found. This Cultivation can be used when committing violence with bows, crossbows, launchers, longguns, and handguns.'),
 ('Imma', 154, 'White Butterfly', 'White Sorcery', 'Healing Magick',
  'The WHITE BUTTERFLY has wings constantly in every state of flapping, and an aperture that delivers sublative acid that lets it burrow through a body to activate one\'s Cultivation Womb.',
  'Immanents cultivate WHITE SORCERY: healing through the target\'s innate healing capacity mixed with the philosophy of Sublation. Healing is not restoration, but rather, the movement toward the next state.'),
 ('Jyotisha', 158, 'Golden Starfly', 'Astral', 'Astral Magick',
  'The GOLDEN STARFLY is a beautiful fly made of starlight, with a firefly-like light that emits starfire.',
  'Jyotisha perform ASTRAL Cultivation: the absorption of Sidhi from the stars and its alchemization into intramaterial effects, to manipulate fate, destiny, timespace, and gravity.'),
 ('Katalonan', 162, 'Revenant Soulworm', 'Divine Communion', 'Interacting with the Numina',
  'As the REVENANT SOULWORM burrows into a nascent Katalonan it turns the Cultivator into a chrysalis for a better world.',
  'DIVINE COMMUNION is the Cultivation used when interacting with the Numina directly, through speech or ritual.'),
 ('Mendicant', 166, 'Monk Bee', 'Vajra Fist', 'Empty Hand',
  'Our barang is the Monk Bee. Swallow it. It converts all sin into holiness. The more sinful you are, the holier you are.',
  'VAJRA FIST is the most effective fist art, and thus the most common in the Trichiliocosm.'),
 ('Nezha', 170, 'Red God Drake', 'Red Gun', 'Guns',
  'The RED GOD DRAKE is a scaly serpent-like Barang that burrows in and turns into a magatama-like heart, emitting heat.',
  'RED GUN is the art of wielding the gun in explosive ways, in ways a gun is not meant to be used: meant to supercharge normal gunner units in the battlefield.'),
 ('Sword Dialectician', 174, 'Dialectical Swordmoth', 'Sword Dialectics', 'Swords, Sabers',
  'The Dialectical Swordmoth is a moth with bladed wings that cut through the esophagus. It opens the Mind to the traumatizing understanding of real immanent contradiction.',
  'SWORD DIALECTICS: the deepest truths of Sword Dialectics are opaque to those that cannot have their heads torn asunder by the truth of Dialectics and the immanent movement of all things through contradiction and struggle.'),
 ('Techgnostic', 178, 'Digiworm', 'Techgnosis', 'Performing Techgnostic Magick',
  'The DIGIWORM is a reticulated worm that whizzes and whirrs as it traipses the world.',
  'TECHGNOSIS is the Magick of Information and Data: digital sorcery. It is used when performing TECHGNOSTIC MAGICK.'),
 ('Ultramystic', 182, 'God Obliterating Devil Ant', 'Immortal Science', 'The patient Struggle of Revolution',
  'Our Barang is the GOD OBLITERATING DEVIL ANT, which we have stolen from Heaven. Let it burrow into your skin. Let it lead you to the creation of a new universe.',
  'IMMORTAL SCIENCE: the revolutionary scientific communism that destroys bourgeois science and false consciousness.'),
 ('Wukong', 186, 'Immortal Gold Cicada', 'Sage Body', '',
  'The IMMORTAL GOLD CICADA grants the ambitious hubris and Buddha-potential of its namesake.',
  'SAGE BODY cultivates the body to strengthen it completely and wakes the nascent Sidhi within the body without the need for just Sidhi Absorption.'),
 ('Zhongkui', 190, 'Soul Weaving Worm', 'Spirit Binding', 'Exorcism and binding INTRA-INTs',
  'The SOUL WEAVING WORM travels across the spine to weave a demon king shrine to subjugate demons.',
  'SPIRIT BINDING is the art of exorcism: calling, subjugating, binding, and driving out INTRA-INT entities.'),
]
bfolders = [{'_id': uid('folder', 'barang21', 'all'), 'name': 'Sect Barang', 'folder': None, 'type': 'Item', 'sorting': 'a', 'sort': 0, 'color': None}]
bitems = []
for n, (sect, page, name, cult, weapons, barang, cultivation) in enumerate(BARANG):
    desc = (f'<p><em>{esc(barang)}</em></p><p><strong>Sect:</strong> {esc(sect)} · <strong>Esoteric Cultivation:</strong> {esc(cult)}</p><p>{esc(cultivation)}</p>'
            '<p>Ingesting a Barang awakens the first stage of Sidhi Cultivation and lets the Cultivator learn the Sect\'s Esoteric Techniques. '
            'At Wanderer Discovery, ingest one Sect\'s Barang, gain its Cultivation at ✦✦ and learn 2 Licenses you qualify for. '
            'Ejecting a Barang keeps every Magick and Technick already Cultivated. A new Sect License needs the appropriate Barang to be ingested (2.1 Alpha pp.5, 50–51).</p>')
    bitems.append({'_id': uid('barang21', sect), 'name': name, 'type': 'barang', 'img': ICON.format('barang'), 'folder': bfolders[0]['_id'], 'sort': n * 1000, 'effects': [],
        'system': {'description': desc, 'source': f'Rules 2.1 (2.1 playtest Sects), p.{page}', 'tags': f'2.1, Barang, {sect}', 'sect': sect, 'cultivation': cult, 'weapons': weapons, 'ingested': False},
        'flags': {'10kswordsfoundry': {'barang21': {'sect': sect, 'sourcePage': page}}}})
json.dump({'folders': bfolders, 'items': bitems}, open(OUT + 'barang-21.json', 'w'), indent=1, ensure_ascii=False)
print(len(items), 'Assets in', len(folders), 'folders;', len(bitems), 'Barang')
