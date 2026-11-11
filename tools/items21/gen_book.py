"""Build the 2.1 item catalogs (data/*-21.json) from the 2.1 player-facing book (187 PDF pages of spreads, 2026-11-11):
Items in the Market (book pp.164-169), Gear Weapons and the Weapon List (pp.170-179), Armor and Accessories (pp.180-187).
Usage: python gen_book.py <book.pdf> <repo data dir>/    (needs poppler's pdftotext and pdftohtml)
Carried over from the earlier catalogs already in the data dir: the Heed Us one-shot gear, the tower shield, the Fangshi
concoctions and the basic ammunition. Card text is read from the PDF; the tables below hold what was checked against the page images."""
import json, hashlib, html, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cards import cards
PDF, OUT = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else '')
PARTS = ['rleg', 'lleg', 'rarm', 'larm', 'torso', 'head']
LABEL = {'rleg': 'Right Leg', 'lleg': 'Left Leg', 'rarm': 'Right Arm', 'larm': 'Left Arm', 'torso': 'Torso', 'head': 'Head'}
# Mods the book defines (p.171-172) and the sheet stores as switches. Undefined printed mods (NIMBLE, VISCERAL, OCCULT, PSIONIC, KEEN) stay as tags.
WMODS = ['auto', 'crushing', 'great', 'colossal', 'doublehand', 'focus', 'blaze', 'artifact', 'smashing',
         'piercing', 'lacerating', 'precise', 'shock', 'worn', 'concealable', 'holy', 'noetic', 'ritual', 'almighty', 'thundering', 'toxic']
GRIP = {'empty': '', 'dagger': 'hilt', 'saber': 'hilt', 'sword': 'hilt', 'whip': 'hilt', 'cleaver': 'haft', 'bludgeon': 'haft', 'polearm': 'haft', 'launcher': 'haft',
        'bow': 'riser', 'crossbow': 'stock', 'handgun': 'stock', 'longgun': 'stock'}
RANGE = {'empty': 1, 'dagger': 1, 'saber': 1, 'sword': 1, 'whip': 3, 'bludgeon': 1, 'cleaver': 1, 'polearm': 3, 'launcher': 20, 'bow': 250, 'crossbow': 125, 'handgun': 30, 'longgun': 400}
AMMO_FAMILY = {'launcher': 'launcher', 'bow': 'bow', 'crossbow': 'crossbow', 'handgun': 'gun', 'longgun': 'gun'}
# Book p.170-171: [pool; range; damage] and the profile's note.
PROFILE = {
 'empty': ('Physique + Beast Shrine', '1 damage', 'Empty Hand is the unarmed option. It deals 1 Damage, and an empty hand is generally needed to establish Control.'),
 'dagger': ('Motorics + Beast Shrine', 'Motorics damage', 'On a KILL, deal piercing damage to the Torso.'),
 'saber': ('Physique + Beast Shrine', 'Physique + 1 damage', '+1 damage against Limbs.'),
 'sword': ('Physique or Motorics + Beast Shrine', 'Physique or Motorics damage, whichever is used', 'Swords are some of the most common weapons in the Trichiliocosm.'),
 'bludgeon': ('Physique + Beast Shrine', 'Physique damage', 'Has innate [CRUSHING].'),
 'cleaver': ('Physique + Beast Shrine', 'Physique + 2 damage', '+1 damage when chopping wood.'),
 'polearm': ('Physique + Beast Shrine', 'Physique damage', ''),
 'whip': ('Motorics + Thews and Sinews', 'Physique damage', 'Innately have farther effective range but more difficult to wield.'),
 'launcher': ('Motorics + Hand/Eye Coordination', 'Motorics damage', 'Anything used to throw items, such as slingshots, slings, slingstaffs, and so on.'),
 'bow': ('Motorics + Hand/Eye Coordination', 'Motorics + 1 damage', 'Needs PHYS 2+. Either longbows or short bows or self bows used to launch arrows at distant targets. Requires Arrows as ammunition.'),
 'crossbow': ('Motorics + Hand/Eye Coordination', 'Motorics + 1 damage', 'Largely replaced by Guns in modern Hingsajagra, crossbow has its place as a means of unloading bolts filled with payloads as well as packing power silently. A favored weapon of assassins and hitmen. Requires Bolts as ammunition.'),
 'handgun': ('Motorics + Hand/Eye Coordination', 'Motorics + 1 damage', 'The most common weapon in modern Hingsajagra. Pistols, dragoons, and revolvers all fall in this category. Needs short bullets as ammo. Revolvers count by the bullet, while modern handguns work with 12 round magazines.'),
 'longgun': ('Motorics + Hand/Eye Coordination', 'Motorics + 2 damage', 'Always DOUBLEHANDED. Needs appropriate long gun bullets to shoot, and often uses magazines. Reloading replaces magazines.')}
uid = lambda *p: hashlib.sha1('|'.join(p).encode()).hexdigest()[:16]
esc = lambda t: html.escape(t, quote=False)
src = lambda page: f'Rules 2.1 (2.1 player-facing book), p.{page}'
icon = lambda kind: f'systems/10kswordsfoundry/assets/icons/{kind}.svg'
para = lambda *parts: ''.join(f'<p>{p}</p>' for p in parts if p)
money = lambda n: f'{n:,} ♄'

# ---------- page text ----------
_text = {}
def page_text(pdf_page):
    if pdf_page not in _text:
        t = subprocess.run(['pdftotext', '-f', str(pdf_page), '-l', str(pdf_page), PDF, '-'], capture_output=True, text=True, check=True).stdout
        t = re.sub(r'(\w)-\n(?=[a-z])', r'\1', t)
        _text[pdf_page] = re.sub(r'\s+', ' ', t).replace('ʼ', "'").replace('ˮ', '"')
    return _text[pdf_page]
NORM = str.maketrans({'’': "'", '‘': "'", 'ʼ': "'", '“': '"', '”': '"', 'ˮ': '"'})
MISSING = []
def grab(pdf_page, start, end):
    """Text from `start` through `end` on a page (both included)."""
    t = page_text(pdf_page).translate(NORM); s0, e0 = start.translate(NORM), end.translate(NORM)
    i = t.find(s0); j = t.find(e0, i if i >= 0 else 0)
    if i < 0 or j < 0:
        MISSING.append((pdf_page, start if i < 0 else '', end if j < 0 else '')); return start + ' … ' + end
    return t[i:j + len(e0)].strip()
CARDS = {}
for p in (89, 90, 91, 93, 94):
    for c in cards(PDF, p): CARDS.setdefault(re.sub(r'[^A-Z0-9]', '', c['name'].upper()), c)
def card(printed):
    key = re.sub(r'[^A-Z0-9]', '', printed.upper())
    hit = [c for k, c in CARDS.items() if k.startswith(key)]
    assert hit, printed
    return hit[0]
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'^[✦ ]+', '', t or '')).strip()

def effect(item, label, changes, page, note=''):
    return {'_id': uid('effect21', item, label), 'name': label, 'img': icon('fashion'), 'transfer': True, 'disabled': False,
            'description': f'<p>{src(page)}. Applies while equipped.{" " + esc(note) if note else ""}</p>',
            'system': {'changes': [{'key': k, 'type': 'add', 'value': str(v), 'phase': 'initial', 'priority': 20} for k, v in changes]}}

# ---------- weapons ----------
def weapon(name, profile, rarity, category, weight, price, page, mods=(), rules='', flavor='', bonus=0, rng=0, capacity=0, ferocious=0, shield=0, set_mods=None, note='', printed=None, rate=1, tags=()):
    if printed:
        c = card(printed); rules = rules or clean(c['rules']); flavor = flavor or clean(c['flavor'])
    pool, dmg, ptext = PROFILE[profile]
    setm = set(set_mods if set_mods is not None else [m.lower() for m in mods if m.lower() in WMODS])
    if any(m.startswith('FEROCIOUS') for m in mods) and not ferocious: ferocious = 1
    if 'AUTO' in mods: rate = 3
    reach = rng or RANGE[profile]
    stat = ' · '.join(x for x in [GRIP[profile].title(), 'Empty Hand' if profile == 'empty' else profile.title(), pool, f'{reach} m', dmg + (f' +{bonus}' if bonus else '')] if x)
    desc = para(esc(flavor), f'<strong>{esc(rarity.title())} {esc(category)} · {weight:g} kg · {money(price)}</strong>', f'<strong>{esc(stat)}</strong>',
                (f'<strong>Mods:</strong> {esc(" ✦ ".join(mods))}' if mods else ''), (f'<strong>Capacity</strong> {capacity} rounds' if capacity else ''), esc(rules),
                (f'<strong>Profile:</strong> {esc(ptext)}' if ptext else ''), (f'<em>Catalog note: {esc(note)}</em>' if note else ''))
    return {'name': name, 'type': 'weapon', 'img': icon('weapon'), 'effects': [], 'system': {
        'description': desc, 'source': src(page), 'rarity': rarity, 'quantity': 1, 'slots': 1, 'magCost': price, 'equipped': False, 'gearSlot': 'carry',
        'weaponType': 'ranged' if profile in AMMO_FAMILY else 'melee', 'range': reach, 'damageType': 'impact' if profile in ('bludgeon', 'empty') else 'cut',
        'ammoFamily': AMMO_FAMILY.get(profile, 'none'), 'tags': ', '.join(['2.1', 'Weapon', 'Empty Hand' if profile == 'empty' else profile.title(), *mods, *tags]),
        'r21': {'profile': profile, 'grip': GRIP[profile], 'damage': 2, 'damageBonus': bonus, 'range': rng, 'rate': rate, 'capacity': capacity, 'ferocious': ferocious, 'shield': shield,
                'mods': {k: k in setm for k in WMODS}, 'weight': weight}}}

TEMPLATE_NOTE = 'A blank weapon of this Profile to rename and customize.'
def template(profile):
    w = weapon(f'{profile.title()} (profile)', profile, 'common', f'Base {profile.title()}', 0, 0, 170 if profile in ('dagger', 'saber', 'sword', 'bludgeon', 'cleaver', 'polearm', 'whip') else 171, flavor=TEMPLATE_NOTE)
    return w

WEAPONS = {
 'Empty Hands': [
  weapon('AWW Longclaws', 'empty', 'common', 'Base Empty Hand', 1, 50, 174, ['NIMBLE', 'WORN', 'LACERATING'],
         flavor='Three serrated blades that can be worn and used for striking. A favorite of Exdead Assassins.', note='NIMBLE is not defined in the book; kept as a tag.'),
  weapon('Inter-Elix Occult Prayer Wraps', 'empty', 'enhanced', 'Base Empty Hand', 1, 150, 174, ['WORN'],
         rules='PSIOBLITZ [❂] Attacks with the wraps extend to 3m and can use HRT.',
         flavor='Prayer wraps with talisman gauzes and steel prayer beads for striking and dealing damage. The ability to pray while striking is integral to cultivators of the Luminous Mind and Divine Communion.'),
  weapon('MA Stardust Wrap', 'empty', 'deluxe', 'Refined Empty Hand', 0.5, 3999, 174, ['OCCULT', 'PIERCING'],
         rules='STARFIRE PULSE [✹] Shoot a blast of starfire from your hands to deal damage, equal to [HRT] piercing damage.',
         flavor='Should you encounter God on your travels, then you should know that God will be subject to photonic ablation.', note='OCCULT is not defined in the book; kept as a tag.')],
 'Daggers': [
  weapon('TMNI Gunong', 'dagger', 'common', 'Base Dagger', 1, 10, 174, flavor='Utility knife and thrusting weapon. Single-edged. Proficient for close-ranged fighting.'),
  weapon('TMNI Venom Balaraw', 'dagger', 'uncommon', 'Base Dagger', 1, 20, 174,
         rules='The weapon is sheathed in a Naga Neurotoxin and outfitted with a hilt that re-sheathes the dagger with the same venom.',
         flavor='A push dagger. For quick stabbing. Often dipped in toxins and so on.'),
  weapon('Ritual Keris', 'dagger', 'deluxe', 'Divine Dagger', 2, 10000, 174, ['PIERCING'],
         rules='Can wield HRT + SUSURRATION to attack with this. SOUL HERALD [✹✹] Summon ancestral souls to caster\'s side. They can materialize and fight to the best of their ability. The ancestral soul has the same Cultivations as the caster but only have a shared Part HP of 3.',
         flavor='All kerises are dipped in venoms and blessed. The resonant consciousnesses of kerises make them particularly susceptible to Spirit-Generation. Souls live within ancient old kerises. The strongest ones are the ones not made by factories.')],
 'Sabers': [
  weapon('Sundang', 'saber', 'common', 'Base Saber', 1, 5, 175, flavor="The everyman's tool. For chopping, cutting, clearing weeds, opening coconuts, jamming machines, and so on. Also good for killing people."),
  weapon('HaeCo Black Iron Saber', 'saber', 'common', 'Base Saber', 1.5, 5, 175,
         flavor='Weapon built from mass produced black iron or carbon steel. Made from MORTAR Divine Blueprints. Sharp and robust, perfect for mass production and outfitting armies and paramilitaries.'),
  weapon('MA Reaping Teppōkatana', 'saber', 'enhanced', 'Base Saber', 3, 330, 175, ['NIMBLE', 'FEROCIOUS', 'VISCERAL'],
         rules='REV-BLAST CHAMBER [✹] Fire off a chamber that launches the blade forward, making it UNBLOCKABLE.',
         flavor='A gun curved sword from the prestigious REAPING HILDEMEJ line of weaponry from Masando Atelier. Famously fashioned after the weapon of Murasamo Makai of the Makai Clan, who wielded six gunblades on both hands.',
         note='NIMBLE and VISCERAL are not defined in the book; kept as tags.'),
  weapon('UM Buddhocommunist Ginunting', 'saber', 'prestige', 'Immortal Saber', 1, 1000000, 175, ['ARTIFACT', 'BLAZE'],
         rules='SWORD ORBIT [❂] Let go of the saber and let it orbit the Cultivator. While orbiting, +1 to all ATK and DEF.',
         flavor='The Buddhocommunists are a strand of Masangwanist-Wairinists who fight for the Liberation of all Sentient Beings across the entire Cosmos. Much of them have been expelled from Hingsajagra, but they have left a few of their iconic ginunting—with blades made of captured supernovae—to inspire the Masangwanists to aspire for the Heavens.')],
 'Swords': [
  weapon('Kalis', 'sword', 'common', 'Base Sword', 1, 5, 175,
         flavor='Once a spiritual symbol, it has turned into a factory reproduced weapon and the most common Sword in the Islands. Serpentine blade variants are rarer and more expensive than the straight variants.'),
  weapon('TDF Feathersword', 'sword', 'common', 'Base Sword', 0.25, 5, 175,
         flavor='Weapon mass produced by Thousand Dragons Forge, made from ancient Revolutionist blueprints, ran through a Divine Loom to fabricate it with feathersteel. Extremely light and flexible, able to be used for biting striking attacks and sudden cutting angles.'),
  weapon("TTC People's Kiem 592", 'sword', 'enhanced', 'Base Sword', 1, 330, 175, ['FEROCIOUS'], rules='Battle Meditation [✹] Use this to BLOCK.',
         flavor="The People's Kiem '592 is so named due to its availability, ease of production, and factory make. Any person in the Oxomese Republic walks around with one, alongside an umbrella."),
  weapon('HDF Cutting Logic Jian', 'sword', 'enhanced', 'Base Sword', 1, 3000, 175, ['PIERCING'], rules='Before dealing damage, may teleport 1m. May also KILL THE BUDDHA with MND.',
         flavor='A jian—double-edged shennin sword—with a thaumaturgical system that senses a thrust with violent-intent, and displaces them, refracting in and out of reality. The HDF harnesses esoteric thaumaturgies to match the savagery of the bourgeoisie.')],
 'Bludgeons': [
  weapon('Rattan Stick', 'bludgeon', 'common', 'Base Bludgeon', 0.25, 2, 176, printed='RATTAN STICK'),
  weapon('HaeCo Riot Shield', 'bludgeon', 'uncommon', 'Base Bludgeon', 1, 150, 176, ['SHIELD', 'FEROCIOUS'], printed='HAECO RIOT SHIELD', shield=1,
         note='SHIELD: blocking with the shield only reduces its Durability by 1 (3 from a SMASHING item).'),
  weapon('MORTAR AT-CR Cudgel', 'bludgeon', 'uncommon', 'Base Bludgeon', 2, 500, 176, ['CONCEALABLE', 'SMASHING', 'CRUSHING'], printed='MORTAR AT-CR CUDGEL', rules=' '),
  weapon('HDF Goremaul', 'bludgeon', 'rare', 'Base Bludgeon', 8, 150000, 176, ['COLOSSAL', 'FEROCIOUS', 'CRUSHING'], printed='HDF GOREMAUL')],
 'Cleavers': [
  weapon('Hatchet', 'cleaver', 'common', 'Base Cleaver', 0.5, 10, 176, printed='HATCHET'),
  weapon('HDF Kai Shan Fu', 'cleaver', 'uncommon', 'Base Cleaver', 2, 500, 176, ['GREAT', 'FEROCIOUS'], printed='HDF KAI SHAN FU'),
  weapon('Ka Parashurma', 'cleaver', 'rare', 'Base Bludgeon', 5, 100000, 176, ['CRUSHING'], printed='KA PARASHURMA',
         rules='UNIVERSAL SLAUGHTER [✹✹✹] Upon dealing damage, activate this to apply the damage all chosen entities and the environment up to 10m from the target.',
         note='Printed as a Base Bludgeon in the Cleavers list; recorded as a Cleaver.')],
 'Polearms': [
  weapon('Lance', 'polearm', 'common', 'Base Polearm', 1, 5, 177, printed='LANCE', rules=' '),
  weapon('VATAC Collapsing Lance', 'polearm', 'common', 'Base Polearm', 1, 200, 177, ['CONCEALABLE'], printed='VATAC COLLAPSING LANCE', rules=' '),
  weapon('HaeCo Folding Spear', 'polearm', 'enhanced', 'Base Polearm', 1, 330, 177, ['CONCEALABLE', 'VISCERAL'], printed='HAECO FOLDING SPEAR', rules=' ', note='VISCERAL is not defined in the book; kept as a tag.'),
  weapon('AWW Sky Feather Naginata', 'polearm', 'rare', 'Base Polearm', 2.5, 1799, 177, ['PRECISE'], printed='AWW SKY FEATHER NAGINATA')],
 'Whips': [
  weapon('Meteor Hammer', 'whip', 'common', 'Base Whip', 0.5, 50, 177, printed='METEOR HAMMER'),
  weapon('UM Stingray Tail', 'whip', 'uncommon', 'Base Whip', 1, 200, 177, ['FEROCIOUS', 'HOLY'], printed='UM STINGRAY TAIL', rules=' '),
  weapon('AWW Jadesteel Sleeves', 'whip', 'rare', 'Base Polearm', 2.5, 4999, 177, ['WORN', 'CRUSHING'], printed='AWW JADESTEEL SLEEVES',
         note='Printed as a Base Polearm in the Whips list; recorded as a Whip (3 m).')],
 'Bows': [
  weapon('Wooden Longbow', 'bow', 'common', 'Base Bow', 1, 2, 178, flavor='Classic longbow made of wood.'),
  weapon('AWW Compound Yumi', 'bow', 'uncommon', 'Base Bow', 2, 200, 178, ['PRECISE'], rng=300,
         rules='2m long compound bow. Does not need PHYS 2 to wield. +50m range.', flavor='Yumi are used for Kyudo, but AWW created compound complex yumi for long range sniping.'),
  weapon('TMNI Sikarom', 'bow', 'rare', 'Base Bludgeon', 2, 10000, 178, ['COLOSSAL', 'FEROCIOUS', 'PRECISE'], printed='TMNI SIKAROM',
         note='Printed as a Base Bludgeon in the Bow list; recorded as a Bow.')],
 'Crossbows': [
  weapon('TTC Hunting Crossbow', 'crossbow', 'common', 'Base Crossbow', 1, 100, 178, flavor='Useful carbon crossbow. Sturdy but simple.'),
  weapon('HDF Miniature Arblast', 'crossbow', 'uncommon', 'Base Cleaver', 3, 300, 178, ['FEROCIOUS'],
         rules="Targets that are within 3m cannot BLOCK this weapon's attacks. Automatically reloads after firing.",
         flavor='Huge arbalests with self-reloading mechanisms instead of needing a cranequein. Common among Shennin and Selorongian private armies, due to the quieter nature of the Arblast compared to a Gun.',
         note='Printed as a Base Cleaver in the Crossbow list; recorded as a Crossbow.'),
  weapon('EXK Vampire Hunter', 'crossbow', 'rare', 'Base Bludgeon', 5, 6969, 178, ['COLOSSAL', 'PSIONIC'], printed='EXK VAMPIRE HUNTER',
         rules='PURIFICATORY MANTRAS [❂] Attacks gain HOLY and cannot be BLOCKED.', note='Printed as a Base Bludgeon in the Crossbow list; recorded as a Crossbow. PSIONIC is not defined in the book; kept as a tag.')],
 'Launchers': [
  weapon('Sling', 'launcher', 'common', 'Base Launcher', 0.5, 10, 179, flavor='A common, almost childish launching implement.'),
  weapon('UM Blowgun', 'launcher', 'uncommon', 'Base Launcher', 0.5, 20, 179, printed='UM BLOWGUN', bonus=1, note='The +1 damage with Darts is recorded as a damage bonus.'),
  weapon('HDF Heavenly Slingstaff', 'launcher', 'prestige', 'Divine Launcher', 1, 11999, 179, ['ARTIFACT', 'FEROCIOUS'], printed='HDF HEAVENLY SLINGSTAFF', rng=50)],
 'Handguns & Longguns': [
  weapon('MORTAR Parabellum 9mm', 'handgun', 'common', 'Base Handgun', 0.5, 800, 179, printed='MORTAR PARABELLUM 9MM', rules=' ', capacity=12),
  weapon('HaeCo Dragonhead .380 LCP', 'handgun', 'uncommon', 'Base Handgun', 0.5, 800, 179, printed='HAECO DRAGONHEAD', rules=' ', capacity=18),
  weapon('AWW Magicite Onslaught Rifle', 'longgun', 'enhanced', 'Base Longgun', 1, 1200, 179, ['FEROCIOUS', 'HOLY', 'AUTO'], printed='AWW MAGICITE ONSLAUGHT RIFLE', capacity=32,
         rules='MAGICITE ROUNDS: Has 36 magicite bullets that are always loaded and can be fired as normal ammo if jammed or out of ammo.'),
  weapon('MORTAR TD-7 Ruyi', 'longgun', 'common', 'Base Longgun', 4, 1000, 179, ['AUTO'], printed='MORTAR TD-7 RUYI', rules=' ', capacity=32),
  weapon('HDF Dragon Fire Cannon', 'longgun', 'deluxe', 'Divine Longgun', 7, 10000, 179, ['COLOSSAL', 'ARTIFACT'], printed='HDF DRAGON FIRE CANNON')],
 'Weapon Profiles': [template(p) for p in ['dagger', 'saber', 'sword', 'whip', 'bludgeon', 'cleaver', 'polearm', 'launcher', 'bow', 'crossbow', 'handgun', 'longgun']],
}

# ---------- armor ----------
def armor(name, printed, rarity, category, weight, price, page, parts, soak, effects=(), morale=0, kind='fashion', note='', rules=None, flavor=None, ardor=0):
    c = card(printed) if printed else None
    rules = clean(c['rules']) if rules is None else rules; flavor = clean(c['flavor']) if flavor is None else flavor
    coverage = {p: soak for p in parts}
    cov = ', '.join(f'{LABEL[p]} {v}' for p, v in coverage.items() if v)
    desc = para(esc(flavor), f'<strong>{esc(rarity.title())} {esc(category)} · {weight:g} kg · {money(price)}</strong>', (f'<strong>Soak:</strong> {esc(cov)}' if cov else ('<strong>Soak:</strong> —' if kind == 'fashion' else '')),
                esc(rules), (f'<em>Catalog note: {esc(note)}</em>' if note else ''))
    sys_ = {'description': desc, 'source': src(page), 'rarity': rarity, 'quantity': 1, 'slots': 1, 'magCost': price, 'equipped': False,
            'gearSlot': 'fashion' if kind == 'fashion' else 'carry', 'tags': ', '.join(['2.1', 'Armor' if kind == 'fashion' else 'Accessory', category]),
            'r21': {'coverage': {p: coverage.get(p, 0) for p in PARTS}, 'morale': morale, 'weight': weight}}
    if kind == 'fashion': sys_.update({'armor': 0, 'ardor': ardor})
    return {'name': name, 'type': kind, 'img': icon(kind), 'system': sys_, 'effects': [effect(name, *e) for e in effects]}
ARM_NOTE = 'Each Arm piece covers a single arm; the Soak is recorded on the right arm. Change the Soak fields on the item for a left-arm piece.'
BOTH_LEGS = ['rleg', 'lleg']
ARMOR = {
 'Head': [
  armor('YEI Three Head Crown', 'YEI THREE HEAD CROWN', 'uncommon', 'Head Piece', 1, 100, 181, ['head'], 2, morale=1),
  armor('Puterijasa Adept Cowl', 'PUTERIJASA ADEPT COWL', 'rare', 'Head Piece', 1, 1600, 181, [], 0, note='Add the +1 in the Cast dialog.'),
  armor('Working Class Headwrap', 'WORKING CLASS HEADWRAP', 'common', 'Head Piece', 0.3, 30, 181, ['head'], 1, effects=[('Working Class Headwrap: +1 Manual Labor', [('system.skills.manualLabor', 1)], 181)]),
  armor('VATAC Adamant Helm "Kongo"', 'VATAC ADAMANT HELM', 'uncommon', 'Head Piece', 6, 900, 181, ['head'], 6, effects=[('Kongo Helm: -2 Speed', [('system.speedBonus', -2)], 181)]),
  armor('AWW "Genji" Visor', 'AWW “GENJI” VISOR', 'rare', 'Head Piece', 0.5, 5000, 181, ['head'], 2, effects=[('Genji Visor: +2 Speed', [('system.speedBonus', 2)], 181)]),
  armor('HDF "Mingwang" Mask', 'HDF “MINGWANG” MASK', 'rare', 'Head Piece', 7, 30000, 181, ['head'], 6)],
 'Torso': [
  armor('Heavenly Silk Vest', 'HEAVENLY SILK VEST', 'uncommon', 'Torso Piece', 2, 340, 184, ['torso'], 2),
  armor("Official's Coat", "OFFICIAL'S COAT", 'uncommon', 'Torso Piece', 2, 220, 184, ['torso'], 1,
        note="The flavor box repeats the Heavenly Silk Vest's text; the coat's own description is printed in its rules box. The earlier +1 Spit In The Face Of God is no longer printed.",
        flavor='A coat and blazer common to diplomats of all kinds. Many companies make their own version, many of them include subtle marketing techniques.', rules=''),
  armor("Hunter's Garb", "HUNTER'S GARB", 'common', 'Torso Piece', 1.5, 90, 184, ['torso'], 1, effects=[("Hunter's Garb: +1 Primeval Mind", [('system.skills.primevalMind', 1)], 184)]),
  armor('VATAC Adamant Ballistic Breastplate "Kongo"', 'VATAC ADAMANT BALLISTIC BREASTPLATE', 'rare', 'Torso Piece', 10, 3400, 184, ['torso'], 5, effects=[('Kongo Breastplate: -1 Basic Move', [('system.moveBonus', -1)], 184)]),
  armor('AWW "Genji" Raiments', 'AWW “GENJI” RAIMENTS', 'rare', 'Torso Piece', 1.5, 6000, 184, ['torso'], 3),
  armor('HDF "Mingwang" Cuirass', 'HDF “MINGWANG” CUIRASS', 'rare', 'Torso Piece', 13, 40000, 184, ['torso'], 6, note='Printed as a "Rare Head Piece" in the Torso list.',
        effects=[('Mingwang Cuirass: +1 Adamance, -1 Bleeding Heart', [('system.skills.adamance', 1), ('system.skills.bleedingHeart', -1)], 184)])],
 'Arms': [
  armor('YEI Heavy Duty Gloves', 'YEI HEAVY DUTY GLOVES', 'common', 'Arm Piece', 1.5, 45, 185, ['rarm'], 1, note=ARM_NOTE),
  armor('Blademaster Wraps', 'BLADEMASTER WRAPS', 'uncommon', 'Arm Piece', 1.5, 820, 185, [], 0),
  armor('Exdead Bone Gauntlet', 'EXDEAD BONE GAUNTLET', 'rare', 'Arm Piece', 1, 3600, 185, ['rarm'], 1, note=ARM_NOTE),
  armor('VATAC Adamant Divine Gauntlets "Kongo"', 'VATAC ADAMANT DIVINE GAUNTLETS', 'rare', 'Arm Piece', 10, 3600, 185, ['rarm'], 5, note=ARM_NOTE + ' The +1 Empty Hand damage and CRUSHING are applied at the table.',
        effects=[('Kongo Gauntlets: -1 Manual Labor, -1 Bleeding Heart', [('system.skills.manualLabor', -1), ('system.skills.bleedingHeart', -1)], 185)]),
  armor('AWW "Genji" Sleeves', 'AWW “GENJI” SLEEVES', 'rare', 'Arm Piece', 0.5, 4000, 185, ['rarm'], 2, note=ARM_NOTE),
  armor('HDF "Mingwang" Vambraces', 'HDF “MINGWANG” VAMBRACES', 'rare', 'Arm Piece', 8, 25000, 185, ['rarm'], 6, note=ARM_NOTE)],
 'Legs': [
  armor('YEI Worker Bottoms', 'YEI WORKER BOTTOMS', 'common', 'Leg Piece', 1.5, 50, 186, BOTH_LEGS, 1),
  armor('Silkspeaker Legs', 'SILKSPEAKER LEGS', 'uncommon', 'Leg Piece', 2, 220, 186, BOTH_LEGS, 1, effects=[('Silkspeaker Legs: +1 Spit In The Face Of God', [('system.skills.spitInTheFace', 1)], 186)]),
  armor('Rogue Wraps', 'ROGUE WRAPS', 'uncommon', 'Leg Piece', 1, 340, 186, BOTH_LEGS, 1, effects=[('Rogue Wraps: +1 Basic Move', [('system.moveBonus', 1)], 186)]),
  armor('VATAC Adamant Ballistic Greaves "Kongo"', 'VATAC ADAMANT BALLISTIC GREAVES', 'rare', 'Leg Piece', 5, 2400, 186, BOTH_LEGS, 5),
  armor('AWW "Genji" Legs', 'AWW “GENJI” LEGS', 'rare', 'Leg Piece', 1.5, 5000, 186, BOTH_LEGS, 3, note='Printed as a "Rare Torso Piece" in the Legs list.'),
  armor('HDF "Mingwang" Legs', 'HDF “MINGWANG” LEGS', 'rare', 'Leg Piece', 10, 23000, 186, BOTH_LEGS, 6, note='Printed as a "Rare Head Piece" in the Legs list.',
        effects=[('Mingwang Legs: -2 Basic Move', [('system.moveBonus', -2)], 186)])],
}

# ---------- accessories, consumables and market goods ----------
def goods(name, kind, rarity, category, weight, price, page, rules, flavor, d6=None, note='', consumable=None, morale=0, effects=(), price_text=None, tag=None):
    desc = para(esc(flavor), f'<strong>{esc(rarity.title())} {esc(category)} · {weight:g} kg · {esc(price_text or money(price))}</strong>' + (f' · d6: {d6}' if d6 else ''),
                f'<strong>{esc(rules)}</strong>', (f'<em>Catalog note: {esc(note)}</em>' if note else ''))
    sys_ = {'description': desc, 'source': src(page), 'rarity': rarity, 'quantity': 1, 'slots': 1, 'magCost': price, 'equipped': False, 'gearSlot': 'carry',
            'tags': ', '.join(['2.1', tag or category.title()]), 'r21': {'coverage': {p: 0 for p in PARTS}, 'morale': morale, 'weight': weight}}
    if kind == 'gear':
        c = dict(enabled=False, apCost=0, health=0, burntArdor=0, morale=0, allHealth=False, allBurntArdor=False); c.update(consumable or {})
        if consumable: c['enabled'] = True
        sys_['consumable'] = c
    return {'name': name, 'type': kind, 'img': icon('gear' if kind in ('gear', 'salvage') else kind), 'system': sys_, 'effects': [effect(name, *e) for e in effects]}
P83, P84, P85 = 83, 84, 85
ACCESSORIES = {'Accessories': [
  goods('SSA Red Eye Ring', 'accessory', 'common', 'Accessory', 0.5, 500, 165, 'Wearing Arm: +1 HP.', grab(P83, 'A ring with a tiny life-giving ruby.', 'long way.'), d6=1,
        effects=[('SSA Red Eye Ring: +1 HP (right arm)', [('system.parts.rarm.hpBonus', 1)], 165, 'Edit the effect key to system.parts.larm.hpBonus for the left arm.')]),
  goods('AWW Thaumaturgical Choker', 'accessory', 'uncommon', 'Accessory', 0.25, 800, 165, '+1 max Flame.', grab(P83, 'A choker made of practical esoteric', 'Esoteric Science.'), d6=2,
        note='Raise Maximum Flame by 1 on the sheet while it is worn.'),
  goods('Exdead Soul Integrity Earring', 'accessory', 'enhanced', 'Accessory', 0.1, 200, 165, 'Gain +1 max Morale.', '"ABANDON ALL HESITATION. THE ONLY BEAST HERE IS YOU."', d6=3, morale=1),
  goods('Demon God Prayer Beads', 'accessory', 'rare', 'Accessory', 0.3, 200, 165, '+1 to Empty Hand damage.', grab(P83, 'Mala with the heart bead', 'also Violence?'), d6=4),
  goods('Devrendra Data Veil', 'accessory', 'deluxe', 'Accessory', 0.25, 2000, 165, 'Obfuscates the face with a veil, shimmering it with a digital cover. Hides identity.',
        grab(P83, 'DEVRENDRA Thaumaturgicals have found', 'wearing the data veil.'), d6=5),
  goods('SSA Angel Arm Prosthetic', 'accessory', 'prestige', 'Accessory', 3, 12000, 165, 'Replaces one Arm and can work as a WROUGHT ARM. +1 to KILL THE BUDDHA Checks with a weapon held in that Hand.',
        grab(P83, 'There are 108,000,000 Angels', '108 KALPAS AGO.'), d6=6),
  armor('Clean Black Necktie', 'YEI HEAVY DUTY GLOVES', 'common', 'Accessory', 0.05, 2, 187, [], 0, morale=1, kind='accessory', rules='+1 MORALE',
        flavor='A surprisingly spotless and clean necktie. Perhaps to remind you of who you are.', note='The card on p.187 is headed "YEI Heavy Duty Gloves"; its text is the necktie.'),
  armor('Puterijasa Featherstep Clogs', 'PUTERIJASA FEATHERSTEP CLOGS', 'uncommon', 'Accessory', 1, 400, 187, [], 0, kind='accessory'),
  armor('VATAC Adamant Ballistic Boots "Kongo"', 'VATAC ADAMANT BALLISTIC BOOTS', 'rare', 'Accessory', 3, 3000, 187, [], 0, kind='accessory'),
  armor('AWW "Genji" Boots', 'AWW “GENJI” BOOTS', 'rare', 'Accessory', 1, 5600, 187, [], 0, kind='accessory', effects=[('Genji Boots: +1 Basic Move', [('system.moveBonus', 1)], 187)]),
  armor('Exdead Mind-Silk Boots', 'EXDEAD MIND-SILK BOOTS', 'rare', 'Accessory', 1, 23000, 187, [], 0, kind='accessory'),
  armor('HDF "Mingwang" Sabatons', 'HDF “MINGWANG” SABATONS', 'rare', 'Accessory', 8, 23000, 187, [], 0, kind='accessory')]}
CONSUMABLES = {'Consumables': [
  goods('ELIXIR Healing Pill', 'gear', 'common', 'Consumable', 0.25, 50, 164, 'Heal 1 HP from a random Part.', grab(P83, 'Thaumaturgicals. Difficult to come by.', 'professional Fangshi.'), d6=1, consumable=dict(health=1),
        note='Use asks which Part to heal; roll the Part at random.'),
  goods('Gussio Thunderbolt Latte', 'gear', 'common', 'Consumable', 0.3, 10, 164, 'For 1 hour: +1 MOT; immune to Sleep and Stun. Suffer 1 Piercing Damage to a random Part.',
        grab(P83, 'A super strong latte', 'ensuring wakefulness.'), d6=2),
  goods('ELIXIR Magnesium Pill', 'gear', 'uncommon', 'Consumable', 0.25, 500, 164, 'Heal 1 Morale.', grab(P83, 'An up and coming product in ELIXIR.', 'Magick Cultivators.'), d6=3, consumable=dict(morale=1)),
  goods('ELIXIR Chakra Pill', 'gear', 'enhanced', 'Consumable', 0.25, 1000, 164, 'Recover 1 burnt Flame.', grab(P83, 'People drink this when they feel', 'was burnt down.'), d6=4, consumable=dict(burntArdor=1)),
  goods('Inter-Elix Asura Stim', 'gear', 'deluxe', 'Consumable', 0.25, 5000, 164, 'Suffer 3 Piercing Damage to a random Part. +2 to to all outgoing Damage for 30 minutes.',
        grab(P83, 'Drinking this sends one into a violent frenzy.', 'warobsessed freaks.').replace('warobsessed', 'war-obsessed'), d6=5),
  goods('Inter-Elix Soma', 'gear', 'prestige', 'Consumable', 0.5, 300000, 164, 'Restore all HP to every Part and recover all burnt Flame.', grab(P83, 'Soma is the food of the gods', 'the Orbital Heaven.'), d6=6,
        consumable=dict(allHealth=True, allBurntArdor=True))]}
GOODS = {
 'Salvage': [
  goods('Junk Scrap', 'salvage', 'common', 'Salvage', 1, 1, 166, 'Metal scraps that can be used as material for crafting or repairs.', grab(P84, 'In Post-Calamity, the refuse', 'the cosmos.'), d6=1),
  goods('Processor Grid-Shards', 'salvage', 'common', 'Salvage', 0.25, 50, 166, 'Broken grid fragments. Cannot function as a processor; can be recycled as repair materials.', grab(P84, 'Processors are new thaumaturgicals', 'they can get.'), d6=2),
  goods('Wairin Locket', 'salvage', 'uncommon', 'Salvage', 0.1, 1, 166, grab(P84, 'Press to play the last three sentences', 'revolutionary ideals.'), grab(P84, 'Dattreya Wairini was one of the final', 'to fight in the final battle!”'), d6=3),
  goods('Communist Sutra', 'salvage', 'enhanced', 'Salvage', 0.2, 1, 166, grab(P84, 'Read at the day’s beginning:', 'with Communism or not.'), grab(P84, 'The abridged version of the Communist Sutra', 'Yenjanese Cathedrals.'), d6=4),
  goods('Tsushing Pressplay Player', 'salvage', 'enhanced', 'Salvage', 0.5, 100, 166, 'Plays cassette tapes. Includes a headset.', grab(P84, 'Tsushing was a rice cooker company', 'relaying communist studies.'), d6=5),
  goods('Cassette Tape: Lover Rockers', 'salvage', 'enhanced', 'Salvage', 0.1, 50, 166, grab(P84, 'Contains all 21 songs', 'Requires a cassette player.'), grab(P84, 'Too Drunk To Ride, an avant-garde', 'a board game company.'), d6=6)],
 'Tools': [
  goods('Bintang Handheld Lotus Light', 'gear', 'common', 'Tool', 0.5, 20, 167, grab(P84, 'Tap and speak a mantra:', 'Recharge through chanting.'), grab(P84, 'Handheld flashlights made in the mold', 'recharged through chanting.'), d6=1),
  goods('AWW Devil Battery', 'gear', 'uncommon', 'Tool', 0.3, 10, 167, grab(P84, '3-pack. Stores Devil Fuel', '11600s onward.'), grab(P84, 'Kedrat Company is a guild', 'their business and life.'), d6=2),
  goods('Bintang Lighter', 'gear', 'common', 'Tool', 0.1, 20, 167, '40 uses. Flick open to start a small fire.', grab(P84, 'Common now, especially with the rise of smokes.', 'care about the difference.'), d6=3),
  goods('HaeCo Handheld Radio', 'gear', 'uncommon', 'Tool', 0.6, 35, 167, grab(P84, 'Communicate with radios tuned', 'Devil Batteries.'), grab(P84, 'Handheld radios used as communication', 'subsumed into HaeCo.'), d6=4),
  goods('HaeCo Magnetic Compass', 'gear', 'uncommon', 'Tool', 0.1, 40, 167, 'A magnetic pocket compass. Points to true north: Thule.', grab(P84, 'A pocket compass magnetically attuned', 'Industrialism."'), d6=5),
  goods('HaeCo Fine Focus Binoculars', 'gear', 'enhanced', 'Tool', 1, 300, 167, grab(P84, 'See up to 400m.', 'Adjustable focus.'), grab(P84, 'Commercial high-focus binoculars', 'and so on.'), d6=6)],
 'Esotery': [
  goods('Ylourgne Makeup Set', 'gear', 'enhanced', 'Esotery', 0.5, 200, 168, grab(P85, 'Thaumaturgically enhanced makeup.', "it's taken off."), grab(P85, 'Ylourgne is a popular East Kamguk', 'from Dangnu Island.'), d6=1),
  goods('Devildrug', 'gear', 'enhanced', 'Esotery', 0.5, 200, 168, grab(P85, 'While a Cultivator has time', 'into 10 Bullets.'), grab(P85, 'Devildrug is made up of six parts', 'firearms were made.'), d6=2),
  goods('Protection Amulet', 'gear', 'rare', 'Esotery', 0.15, 200, 168, grab(P85, 'When the wearer would suffer damage,', 'soaking up to 5 damage.').replace('1in-6', '1-in-6'), grab(P85, 'Otherwise known as an', 'on them or two.'), d6=3),
  goods("Devaraja's Dying Gasp", 'gear', 'rare', 'Esotery', 0.3, 400, 168, grab(P85, 'A vial with the dying breath', 'for an hour.').replace('GodKing', 'God-King'), grab(P85, 'Awan Rakan was the last', 'of his Power.'), d6=4),
  goods('Heart Container', 'gear', 'deluxe', 'Esotery', 0.25, 100, 168, 'Consume this with a Meal to gain +1 Max HP to a random part.', grab(P85, 'Sometime in the 7000s,', 'Impossible to commercialize.'), d6=5,
        price_text='100 ♄, but impossibly rare', note='Add the +1 to the HP bonus of the rolled Part on the sheet.'),
  goods('Soul Container', 'gear', 'prestige', 'Esotery', 3, 100, 168, 'Consume this with a Meal to gain +1 Max Morale.', grab(P85, 'Jarityassera had a wife,', 'Impossible to commercialize.'), d6=6,
        price_text='100 ♄, but impossibly rare', note='Add the +1 to the Morale bonus on the sheet.')],
 'Talismans': [
  goods('Second Dimension Vivification', 'gear', 'rare', 'Talisman', 0.15, 100, 169, grab(P85, 'Nearby 2D objects', 'can move through them.'), grab(P85, 'Used often by animators', 'The Contradiction intensifies.'), d6=1),
  goods('Enter the Intrajala', 'gear', 'rare', 'Talisman', 0.15, 200, 169, grab(P85, 'Project your Consciousness', 'akashic nexus-space.'), grab(P85, 'The Intrajala is essentially', 'Akasha Workings.'), d6=1,
        note='Both this card and Second Dimension Vivification are printed with the d6 face 1.'),
  goods("Thief's Last Door", 'gear', 'rare', 'Talisman', 0.15, 300, 169, grab(P85, 'Fold the paper three times', 'the Intercessor decides what happens.'), grab(P85, 'A master burglar used this', 'all the same.'), d6=3),
  goods('Rend', 'gear', 'deluxe', 'Talisman', 0.15, 600, 169, 'Point at a target within sight. Immediately deal [MND] damage to them.', grab(P85, 'A common Talisman during the Esoteric Era,', 'know of its existence.'), d6=4),
  goods('Mosesian Spring', 'gear', 'deluxe', 'Talisman', 0.15, 600, 169, grab(P85, 'Summons potable water', 'from thin air.'), grab(P85, 'An incredibly useful talisman', 'can make them now.'), d6=5),
  goods('Sky Dance', 'gear', 'prestige', 'Talisman', 0.15, 1000, 169, grab(P85, 'Gain the ability to fly', 'pressure and so on.'), grab(P85, 'This Talisman was created by the Mystic', 'someone like him.').replace('illtemper', 'ill-temper'), d6=6,
        price_text='1,000 ♄ and impossible to find', note='Printed as a "Prestige Esotery" in the Talismans list.')]}

def ammo_item(name, page, ammo_type, quantity, text, rarity='common', price=0, weight=0, note=''):
    return {'name': name, 'type': 'ammunition', 'img': icon('ammunition'), 'effects': [], 'system': {
        'description': para(esc(text), (f'<em>Catalog note: {esc(note)}</em>' if note else '')), 'source': src(page), 'rarity': rarity, 'quantity': quantity, 'slots': 1,
        'magCost': price, 'equipped': False, 'gearSlot': 'carry', 'ammoType': ammo_type, 'tags': '2.1, Ammunition', 'r21': {'coverage': {p: 0 for p in PARTS}, 'morale': 0, 'weight': weight}}}
NEW_AMMO = [ammo_item('HDF Dragon Fire Meteor', 179, 'bullet', 1, 'Deluxe Divine Longgun ammunition · 1 kg · 1,000 ♄. BLAZE ✦ CRUSHING ✦ PIERCING ✦ KNOCKBACK 10M ✦ EXPLODES IN A 1M RADIUS BLAST UPON IMPACT, DEALING DAMAGE TO EVERYTHING IN RADIUS.',
                      'deluxe', 1000, 1, 'The only ammunition the HDF Dragon Fire Cannon fires.')]

# ---------- write ----------
def previous(pack, folder_names):
    """Items carried over from the catalog already in the data dir, by folder name."""
    path = f'{OUT}{pack}.json'
    if not os.path.exists(path): return {}
    d = json.load(open(path, encoding='utf-8')); names = {f['_id']: f['name'] for f in d['folders']}
    out = {}
    for it in d['items']:
        fname = names[it['folder']]
        if fname in folder_names:
            it = {k: v for k, v in it.items() if k not in ('_id', 'folder', 'flags')}; out.setdefault(fname, []).append(it)
    return out
PACKS = {
 'weapons-21': {**WEAPONS, **previous('weapons-21', ['Heed Us, O Mighty Fury (one-shot)', 'Shields'])},
 'armor-21': {**ARMOR, **previous('armor-21', ['Heed Us, O Mighty Fury (one-shot)'])},
 'consumables-21': {**CONSUMABLES, **previous('consumables-21', ['Fangshi Concoctions'])},
 'accessories-21': ACCESSORIES,
 'ammunition-21': {'Ammunition': [it for it in previous('ammunition-21', ['Ammunition']).get('Ammunition', []) if it['name'] != 'HDF Dragon Fire Meteor'] + NEW_AMMO},
 'goods-21': GOODS,
}
if __name__ == '__main__':
    if MISSING: sys.exit('text not found: ' + repr(MISSING))
    for pack, groups in PACKS.items():
        folders, items = [], []
        for fi, (label, entries) in enumerate(groups.items()):
            f = {'_id': uid('folder', pack, label), 'name': label, 'folder': None, 'type': 'Item', 'sorting': 'm', 'sort': fi * 100000, 'color': None}
            folders.append(f)
            for n, e in enumerate(entries):
                items.append({'_id': uid(pack, e['name']), **e, 'folder': f['_id'], 'sort': n * 1000, 'flags': {'10kswordsfoundry': {'rules21': {'pack': pack}}}})
        assert len({i['_id'] for i in items}) == len(items), pack
        json.dump({'folders': folders, 'items': items}, open(f'{OUT}{pack}.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        print(pack, len(items), 'items in', len(folders), 'folders')
