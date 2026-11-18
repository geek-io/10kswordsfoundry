"""Build the 2.1 item catalogs (data/*-21.json) from the 2.1 rulebook (303 pp, 2026-11-16; PDF page = book page):
Items in the Market (pp.186-191), Gear Weapons (pp.192-195), the Weapon List (pp.196-201), Armor (pp.202-206) and Accessories (p.207).
Usage: python gen_rulebook.py <book.pdf> <repo data dir>/    (needs poppler's pdftotext and pdftohtml)
Pages 196-197 (Empty Hands, Daggers, Sabers, Swords) are images with no text layer: their cards are typed in below from the page images.
The market pages (186-191) lay their cards out in numbered columns; rarity, weight and price were read from the page images.
Carried over from the catalogs already in the data dir: the Heed Us one-shot gear, the tower shield and the Fangshi concoctions.
gen_book.py is the generator for the earlier player-facing book and is kept for reference only."""
import json, hashlib, html, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cards import cards
PDF, OUT = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else '')
PARTS = ['rleg', 'lleg', 'rarm', 'larm', 'torso', 'head']
LABEL = {'rleg': 'Right Leg', 'lleg': 'Left Leg', 'rarm': 'Right Arm', 'larm': 'Left Arm', 'torso': 'Torso', 'head': 'Head'}
# The weapon mod switches of the data model, read from WEAPON_MODS_21 so every weapon carries the full current set.
# FEROCIOUS n and REACH n set numbers; the Affinities (p.195) set r21.affinity; the Grade word in the category sets r21.grade. SHIELD stays a tag.
_rules = open(os.path.join(HERE, '..', '..', 'scripts', 'rules21.mjs'), encoding='utf-8').read().replace('\r\n', '\n')
_block = _rules[_rules.index('export const WEAPON_MODS_21'):]; _block = _block[:_block.index('\n});')]
WMODS = re.findall(r'^\s{2}([a-zA-Z]+):', _block, re.M)
assert {'auto', 'toxic', 'cover', 'wall', 'unblockable'} <= set(WMODS), WMODS
GRIP = {'empty': '', 'shield': '', 'dagger': 'hilt', 'saber': 'hilt', 'sword': 'hilt', 'whip': 'hilt', 'cleaver': 'haft', 'bludgeon': 'haft', 'polearm': 'haft', 'launcher': 'haft',
        'bow': 'riser', 'crossbow': 'stock', 'handgun': 'stock', 'longgun': 'stock'}
RANGE = {'empty': 1, 'shield': 1, 'dagger': 1, 'saber': 1, 'sword': 1, 'whip': 3, 'bludgeon': 1, 'cleaver': 1, 'polearm': 3, 'launcher': 20, 'bow': 250, 'crossbow': 125, 'handgun': 30, 'longgun': 400}
AFFINITIES = ['mighty', 'razor', 'esoteric', 'arcane', 'lyrical', 'psionic']
GRADES = ['immortal', 'divine', 'refined']
AMMO_FAMILY = {'launcher': 'launcher', 'bow': 'bow', 'crossbow': 'crossbow', 'handgun': 'gun', 'longgun': 'gun'}
# Book pp.192-193: [Weapon Check; damage; note with the SPD modifier].
PROFILE = {
 'empty': ('Physique + Beast Shrine', 'Physique crush damage', 'Empty Hand is the unarmed option. It is a fatal weapon in its own right, especially in the hands of Cultivators.'),
 'dagger': ('Motorics + Beast Shrine', 'Motorics cut/pierce damage', '+0 SPD.'),
 'saber': ('Physique + Beast Shrine', 'Physique + 1 cut damage', '+2 SPD. +1 damage against Limbs.'),
 'sword': ('Physique or Motorics + Beast Shrine', 'Physique or Motorics + 1 cut/pierce damage', '+1 SPD.'),
 'bludgeon': ('Physique + Beast Shrine', 'Physique + 1 crush damage', '+2 SPD. Has innate [CRUSHING].'),
 'cleaver': ('Physique + Beast Shrine', 'Physique + 2 cut damage', '+2 SPD. x2 damage when chopping wood.'),
 'polearm': ('Physique + Beast Shrine', 'Physique + 1 cut/pierce damage', '+2 SPD.'),
 'whip': ('Motorics + Thews and Sinews', 'Physique cut/crush damage', '+2 SPD.'),
 'shield': ('Physique + Beast Shrine', 'Physique crush damage', '+0 SPD. Innate [COVER].'),
 'launcher': ('Motorics + Hand/Eye Coordination', 'Motorics damage', '+1 SPD. Anything used to throw items, such as slingshots, slings, slingstaffs, and so on. Ammo determines damage type.'),
 'bow': ('Motorics + Hand/Eye Coordination', 'Motorics + 1 damage', '+2 SPD. Needs PHYS 2+ to attack with. Always DOUBLEHANDED. Requires Arrows as ammunition. Ammo determines damage type.'),
 'crossbow': ('Motorics + Hand/Eye Coordination', 'Motorics + 1 damage', '+2 SPD. Requires Bolts as ammunition. Ammo determines damage type.'),
 'handgun': ('Motorics + Hand/Eye Coordination', 'Motorics + 1 damage', '+1 SPD. Needs short bullets as ammo. Revolvers count by the bullet, while modern handguns work with 12 round magazines. Ammo determines damage type.'),
 'longgun': ('Motorics + Hand/Eye Coordination', 'Motorics + 2 damage', '+2 SPD. Always DOUBLEHANDED. Needs appropriate long gun bullets to shoot, and often uses magazines. Reloading replaces magazines. Ammo determines damage type.')}
uid = lambda *p: hashlib.sha1('|'.join(p).encode()).hexdigest()[:16]
esc = lambda t: html.escape(t, quote=False)
src = lambda page: f'Rules 2.1 (2.1 rulebook), p.{page}'
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
for p in (198, 199, 200, 201, 203, 204, 205, 206, 207):
    for c in cards(PDF, p): CARDS.setdefault(re.sub(r'[^A-Z0-9]', '', c['name'].upper()), c)
def card(printed):
    key = re.sub(r'[^A-Z0-9]', '', printed.upper())
    hit = [c for k, c in CARDS.items() if k.startswith(key)]
    assert hit, printed
    return hit[0]
clean = lambda t: re.sub(r'(\w)- (?=[A-Z][a-z])', r'\1-', re.sub(r'\s+', ' ', re.sub(r'^[✦ ]+', '', t or ''))).strip()

def effect(item, label, changes, page, note=''):
    return {'_id': uid('effect21', item, label), 'name': label, 'img': icon('fashion'), 'transfer': True, 'disabled': False,
            'description': f'<p>{src(page)}. Applies while equipped.{" " + esc(note) if note else ""}</p>',
            'system': {'changes': [{'key': k, 'type': 'add', 'value': str(v), 'phase': 'initial', 'priority': 20} for k, v in changes]}}

# ---------- weapons ----------
def weapon(name, profile, rarity, category, weight, price, page, mods=(), rules='', flavor='', bonus=0, rng=0, capacity=0, ferocious=0, shield=0, set_mods=None, note='', printed=None, rate=1, tags=(), id_name=None):
    if printed:
        c = card(printed); rules = rules or clean(c['rules']); flavor = flavor or clean(c['flavor'])
    pool, dmg, ptext = PROFILE[profile]
    setm = set(set_mods if set_mods is not None else [m.lower() for m in mods if m.lower() in WMODS])
    for m in mods:
        if m.startswith('FEROCIOUS') and not ferocious: ferocious = int(m.split()[1]) if len(m.split()) > 1 else 1
    if 'AUTO' in mods: rate = 3
    affinity = next((m.lower() for m in mods if m.lower() in AFFINITIES), '')
    grade = next((x for x in GRADES if x in category.lower()), '')
    reach_x = next((int(m.split()[1]) for m in mods if m.startswith('REACH ') and m.split()[1].isdigit()), 0)
    reach = (rng or RANGE[profile]) + reach_x
    stat = ' · '.join(x for x in [GRIP[profile].title(), 'Empty Hand' if profile == 'empty' else profile.title(), pool, f'{reach} m', dmg + (f' +{bonus}' if bonus else '')] if x)
    desc = para(esc(flavor), f'<strong>{esc(rarity.title())} {esc(category)} · {weight:g} kg · {money(price)}</strong>', f'<strong>{esc(stat)}</strong>',
                (f'<strong>Mods:</strong> {esc(" ✦ ".join(mods))}' if mods else ''), (f'<strong>Capacity</strong> {capacity} rounds' if capacity else ''), esc(rules),
                (f'<strong>Profile:</strong> {esc(ptext)}' if ptext else ''), (f'<em>Catalog note: {esc(note)}</em>' if note else ''))
    return {'name': name, 'type': 'weapon', 'img': icon('weapon'), 'effects': [], **({'id_name': id_name} if id_name else {}), 'system': {
        'description': desc, 'source': src(page), 'rarity': rarity, 'quantity': 1, 'slots': 1, 'magCost': price, 'equipped': False, 'gearSlot': 'carry',
        'weaponType': 'ranged' if profile in AMMO_FAMILY else 'melee', 'range': reach, 'damageType': 'impact' if profile in ('bludgeon', 'empty', 'shield') else 'cut',
        'ammoFamily': AMMO_FAMILY.get(profile, 'none'), 'tags': ', '.join(['2.1', 'Weapon', 'Empty Hand' if profile == 'empty' else profile.title(), *mods, *tags]),
        'r21': {'profile': profile, 'grip': GRIP[profile], 'damage': 2, 'damageBonus': bonus, 'range': rng, 'rate': rate, 'capacity': capacity, 'ferocious': ferocious, 'shield': shield,
                'reach': reach_x, 'affinity': affinity, 'grade': grade, 'morph': '',
                'mods': {k: k in setm for k in WMODS}, 'weight': weight}}}

TEMPLATE_NOTE = 'A blank weapon of this Profile to rename and customize.'
def template(profile):
    w = weapon(f'{profile.title()} (profile)', profile, 'common', f'Base {profile.title()}', 0, 0, 192 if profile in ('dagger', 'saber', 'sword', 'bludgeon', 'cleaver', 'polearm', 'whip', 'shield') else 193, flavor=TEMPLATE_NOTE)
    return w

WEAPONS = {
 'Empty Hands': [
  weapon('AWW Longclaws', 'empty', 'common', 'Base Empty Hand', 1, 50, 196, ['RAZOR', 'WORN'],
         flavor='Three serrated blades that can be worn and used for striking. A favorite of Exdead Assassins.', note='RAZOR (p.195): choose MOT in the KILL THE BUDDHA dialog to roll and deal damage with it.'),
  weapon('ELIXIR Occult Wraps', 'empty', 'enhanced', 'Base Empty Hand', 1, 150, 196, ['WORN'], id_name='Inter-Elix Occult Prayer Wraps',
         rules='PSIOBLITZ [❂] Attacks with the wraps extend to 3m and can use HRT.',
         flavor='BLACK SORCERY wraps with talisman gauzes and steel BLACK SORCERY beads for striking and dealing damage. The ability to pray while striking is integral to cultivators of the Luminous Mind and Divine Communion.'),
  weapon('MA Stardust Wrap', 'empty', 'deluxe', 'Refined Empty Hand', 0.5, 3999, 196, ['PSIONIC'],
         rules='Attacks deal blast damage. STARFIRE PULSE [✹] Shoot a blast of starfire from your hands to deal damage, equal to [HRT] blast damage.',
         flavor='Should you encounter God on your travels, then you should know that God will be subject to photonic ablation.', note='PSIONIC (p.195): choose HRT in the KILL THE BUDDHA dialog to roll and deal damage with it.')],
 'Daggers': [
  weapon('TMNI Gunong', 'dagger', 'common', 'Base Dagger', 1, 10, 196, flavor='Utility knife and thrusting weapon. Single-edged. Proficient for close-ranged fighting.'),
  weapon('TMNI Venom Balaraw', 'dagger', 'uncommon', 'Base Dagger', 1, 20, 196, ['TOXIC'],
         rules='The weapon is sheathed in a Naga Neurotoxin and outfitted with a hilt that re-sheathes the dagger with the same venom.',
         flavor='A push dagger. For quick stabbing. Often dipped in toxins and so on.'),
  weapon('Ritual Keris', 'dagger', 'deluxe', 'Divine Dagger', 2, 10000, 196, ['RITUAL', 'FOCUS'],
         rules='Can wield HRT + SUSURRATION to attack with this. SOUL HERALD [✹✹] Summon ancestral souls to caster\'s side. They can materialize and fight to the best of their ability. The ancestral soul has the same Cultivations as the caster but only have a shared Part HP of 3.',
         flavor='All kerises are dipped in venoms and blessed. The resonant consciousnesses of kerises make them particularly susceptible to Spirit-Generation. Souls live within ancient old kerises. The strongest ones are the ones not made by factories.')],
 'Sabers': [
  weapon('Sundang', 'saber', 'common', 'Base Saber', 1, 5, 197, flavor="The everyman's tool. For chopping, cutting, clearing weeds, opening coconuts, jamming machines, and so on. Also good for killing people."),
  weapon('HaeCo Black Iron Saber', 'saber', 'common', 'Base Saber', 1.5, 5, 197,
         flavor='Weapon built from mass produced black iron or carbon steel. Made from MORTAR Divine Blueprints. Sharp and robust, perfect for mass production and outfitting armies and paramilitaries.'),
  weapon('MA Reaping Teppōkatana', 'saber', 'enhanced', 'Base Saber', 3, 330, 197, ['RAZOR', 'FEROCIOUS 2', 'VISCERAL'],
         rules='REV-BLAST CHAMBER [✹] Fire off a chamber that launches the blade forward, making it UNBLOCKABLE.',
         flavor='A gun curved sword from the prestigious REAPING HILDEMEJ line of weaponry from Masando Atelier. Famously fashioned after the weapon of Murasamo Makai of the Makai Clan, who wielded six gunblades on both hands.',
         note='Price printed as 330MAG. RAZOR (p.195): choose MOT in the KILL THE BUDDHA dialog to roll and deal damage with it.'),
  weapon('TMNI Buddhocommunist Ginunting', 'saber', 'prestige', 'Immortal Saber', 1, 1000000, 197, ['BLAZE'], id_name='UM Buddhocommunist Ginunting',
         rules='SWORD ORBIT [❂] Let go of the saber and let it orbit the Cultivator. While orbiting, +1 to all ATK and DEF.',
         flavor='The Buddhocommunists are a strand of Masangwanist-Wairinists who fight for the Liberation of all Sentient Beings across the entire Cosmos. Much of them have been expelled from Hingsajagra, but they have left a few of their iconic ginunting—with blades made of captured supernovae—to inspire the Masangwanists to aspire for the Heavens.')],
 'Swords': [
  weapon('Kalis', 'sword', 'common', 'Base Sword', 1, 5, 197,
         flavor='Once a spiritual symbol, it has turned into a factory reproduced weapon and the most common Sword in the Islands. Serpentine blade variants are rarer and more expensive than the straight variants.'),
  weapon('TDF Feathersword', 'sword', 'common', 'Base Sword', 0.25, 5, 197,
         flavor='Weapon mass produced by Thousand Dragons Forge, made from ancient Revolutionist blueprints, ran through a Gossammer Loom to fabricate it with feathersteel. Extremely light and flexible, able to be used for biting striking attacks and sudden cutting angles.'),
  weapon("TTC People's Kiem 592", 'sword', 'enhanced', 'Base Sword', 1, 330, 197, ['FEROCIOUS'], rules='Battle Meditation [✹] Use this to BLOCK.',
         flavor="The People's Kiem '592 is so named due to its availability, ease of production, and factory make. Any person in the Oxomese Republic walks around with one, alongside an umbrella."),
  weapon('HDF Cutting Logic Jian', 'sword', 'enhanced', 'Base Sword', 1, 3000, 197, ['ESOTERIC'], rules='Before dealing damage, may teleport 1m. May also KILL THE BUDDHA with MND.',
         note='ESOTERIC (p.195): choose MND in the KILL THE BUDDHA dialog to roll and deal damage with it.',
         flavor='A jian—double-edged shennin sword—with a thaumaturgical system that senses a thrust with violent-intent, and displaces them, refracting in and out of reality. The HDF harnesses esoteric thaumaturgies to match the savagery of the bourgeoisie.')],
 'Bludgeons': [
  weapon('Rattan Stick', 'bludgeon', 'common', 'Base Bludgeon', 0.25, 2, 198, printed='RATTAN STICK'),
  weapon('HaeCo Riot Shield', 'bludgeon', 'uncommon', 'Base Bludgeon', 1, 150, 198, ['SHIELD', 'FEROCIOUS'], printed='HAECO RIOT SHIELD', shield=1,
         note='Printed with a SHIELD mod, which the mod list (p.194) does not define. The earlier book\'s reading is kept: blocking with the shield only reduces its Durability by 1 (3 from a SMASHING item).'),
  weapon('MORTAR AT-CR Cudgel', 'bludgeon', 'uncommon', 'Base Bludgeon', 2, 500, 198, ['CONCEALABLE', 'SMASHING', 'CRUSHING'], printed='MORTAR AT-CR CUDGEL', rules=' '),
  weapon('HDF Goremaul', 'bludgeon', 'rare', 'Base Bludgeon', 8, 150000, 198, ['COLOSSAL', 'FEROCIOUS', 'CRUSHING'], printed='HDF GOREMAUL')],
 'Cleavers': [
  weapon('Hatchet', 'cleaver', 'common', 'Base Cleaver', 0.5, 10, 198, printed='HATCHET'),
  weapon('HDF Kai Shan Fu', 'cleaver', 'uncommon', 'Base Cleaver', 2, 500, 198, ['GREAT', 'FEROCIOUS'], printed='HDF KAI SHAN FU'),
  weapon('Ka Parashurma', 'cleaver', 'rare', 'Base Cleaver', 5, 100000, 198, ['CRUSHING'], printed='KA PARASHURMA',
         rules='UNIVERSAL SLAUGHTER [✹✹✹] Upon dealing damage, activate this to apply the damage all chosen entities and the environment up to 10m from the target.',
         note='Printed as a Base Bludgeon in the Cleavers list; recorded as a Cleaver.')],
 'Polearms': [
  weapon('Lance', 'polearm', 'common', 'Base Polearm', 1, 5, 199, printed='LANCE', rules=' '),
  weapon('VATAC Collapsing Lance', 'polearm', 'common', 'Base Polearm', 1, 90, 199, ['CONCEALABLE'], printed='VATAC COLLAPSING LANCE', rules=' '),
  weapon('HaeCo Folding Spear', 'polearm', 'enhanced', 'Base Polearm', 1, 1000, 199, ['CONCEALABLE', 'VISCERAL'], printed='HAECO FOLDING SPEAR', rules=' ', note=''),
  weapon('AWW Sky Feather Naginata', 'polearm', 'rare', 'Base Polearm', 2.5, 170990, 199, ['PRECISE'], printed='AWW SKY FEATHER NAGINATA')],
 'Whips': [
  weapon('Meteor Hammer', 'whip', 'common', 'Base Whip', 0.5, 50, 199, printed='METEOR HAMMER'),
  weapon('TMNI Stingray Tail', 'whip', 'uncommon', 'Base Whip', 1, 200, 199, ['FEROCIOUS', 'HOLY'], printed='TMNI STINGRAY TAIL', rules=' ', id_name='UM Stingray Tail'),
  weapon('AWW Jadesteel Sleeves', 'whip', 'rare', 'Base Polearm', 2.5, 400999, 199, ['WORN', 'CRUSHING'], printed='AWW JADESTEEL SLEEVES',
         note='Printed as a Base Polearm in the Whips list; recorded as a Whip (3 m).')],
 'Bows': [
  weapon('Wooden Longbow', 'bow', 'common', 'Base Bow', 1, 2, 200, flavor='Classic longbow made of wood.'),
  weapon('AWW Compound Yumi', 'bow', 'uncommon', 'Base Bow', 2, 200, 200, ['PRECISE'], rng=300,
         rules='2m long compound bow. Does not need PHYS 2 to wield. +50m range.', flavor='Yumi are used for Kyudo, but AWW created compound complex yumi for long range sniping.'),
  weapon('TMNI Sikarom', 'bow', 'rare', 'Base Bow', 2, 100000, 200, ['COLOSSAL', 'FEROCIOUS', 'PRECISE'], printed='TMNI SIKAROM',
         note='Printed as a Base Bludgeon in the Bow list; recorded as a Bow.')],
 'Crossbows': [
  weapon('TTC Hunting Crossbow', 'crossbow', 'common', 'Base Crossbow', 1, 100, 200, flavor='Useful carbon crossbow. Sturdy but simple.'),
  weapon('HDF Miniature Arblast', 'crossbow', 'uncommon', 'Base Crossbow', 3, 300, 200, ['FEROCIOUS'],
         rules="Targets that are within 3m cannot BLOCK this weapon's attacks. Automatically reloads after firing.",
         flavor='Huge arbalests with self-reloading mechanisms instead of needing a cranequein. Common among Shennin and Selorongian private armies, due to the quieter nature of the Arblast compared to a Gun.',
         note='Printed as a Base Cleaver in the Crossbow list; recorded as a Crossbow.'),
  weapon('EXK Vampire Hunter', 'crossbow', 'rare', 'Base Crossbow', 5, 696969, 200, ['COLOSSAL', 'PSIONIC'], printed='EXK VAMPIRE HUNTER',
         rules='PURIFICATORY MANTRAS [❂] Attacks gain HOLY and cannot be BLOCKED.', note='Printed as a Base Bludgeon in the Crossbow list; recorded as a Crossbow. PSIONIC (p.195): choose HRT in the KILL THE BUDDHA dialog to roll and deal damage with it.')],
 'Launchers': [
  weapon('Sling', 'launcher', 'common', 'Base Launcher', 0.5, 10, 201, flavor='A common, almost childish launching implement.'),
  weapon('TMNI Blowgun', 'launcher', 'uncommon', 'Base Launcher', 0.5, 200, 201, printed='TMNI BLOWGUN', bonus=1, id_name='UM Blowgun', note='The +1 damage with Darts is recorded as a damage bonus.'),
  weapon('HDF Heavenly Slingstaff', 'launcher', 'prestige', 'Divine Launcher', 1, 11999, 201, ['FEROCIOUS'], printed='HDF HEAVENLY SLINGSTAFF', rng=50)],
 'Handguns & Longguns': [
  weapon('MORTAR Parabellum 9mm', 'handgun', 'uncommon', 'Base Handgun', 0.5, 800, 201, printed='MORTAR PARABELLUM 9MM', rules=' ', capacity=12),
  weapon('HaeCo Dragonhead .380 LCP', 'handgun', 'uncommon', 'Base Handgun', 0.5, 800, 201, printed='HAECO DRAGONHEAD', rules=' ', capacity=18),
  weapon('AWW Magicite Onslaught Rifle', 'longgun', 'enhanced', 'Base Longgun', 1, 1200, 201, ['FEROCIOUS', 'HOLY', 'AUTO'], printed='AWW MAGICITE ONSLAUGHT RIFLE', capacity=36,
         rules='MAGICITE ROUNDS: Has 36 magicite bullets that are always loaded and can be fired as normal ammo if jammed or out of ammo.'),
  weapon('MORTAR TD-7 Ruyi', 'longgun', 'uncommon', 'Base Longgun', 4, 1000, 201, ['AUTO'], printed='MORTAR TD-7 RUYI', rules=' ', capacity=32),
  weapon('HDF Dragon Fire Cannon', 'longgun', 'deluxe', 'Divine Longgun', 7, 5000000, 201, ['COLOSSAL'], printed='HDF DRAGON FIRE CANNON')],
 'Weapon Profiles': [template(p) for p in ['dagger', 'saber', 'sword', 'whip', 'bludgeon', 'cleaver', 'polearm', 'shield', 'launcher', 'bow', 'crossbow', 'handgun', 'longgun']],
}

# ---------- armor ----------
def armor(name, printed, rarity, category, weight, price, page, parts, soak, effects=(), morale=0, kind='fashion', note='', rules=None, flavor=None, ardor=0, id_name=None):
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
    return {'name': name, 'type': kind, 'img': icon(kind), 'system': sys_, 'effects': [effect(name, *e) for e in effects], **({'id_name': id_name} if id_name else {})}
ARM_NOTE = 'Each Arm piece covers a single arm; the Soak is recorded on the right arm. Change the Soak fields on the item for a left-arm piece.'
BOTH_LEGS = ['rleg', 'lleg']
ARMOR = {
 'Head': [
  armor('YEI Three Head Crown', 'YEI THREE HEAD CROWN', 'uncommon', 'Head Piece', 1, 100, 203, [], 0, morale=1, note='No Soak (printed "—"). Ignoring Light Cover with ranged attacks is applied in the roll dialog.'),
  armor('Puterijasa Adept Cowl', 'PUTERIJASA ADEPT COWL', 'rare', 'Head Piece', 1, 160000, 203, [], 0, note='No Soak (printed "—"). Add the +1 in the Cast dialog.'),
  armor('Working Class Headwrap', 'WORKING CLASS HEADWRAP', 'common', 'Head Piece', 0.3, 30, 203, [], 0, note='No Soak (printed "—").',
        effects=[('Working Class Headwrap: +1 Manual Labor', [('system.skills.manualLabor', 1)], 203)]),
  armor('VATAC Adamant Helm "Kongo"', 'VATAC ADAMANT HELM', 'uncommon', 'Head Piece', 6, 900, 203, ['head'], 2, effects=[('Kongo Helm: +2 Speed', [('system.speedBonus', 2)], 203)],
        note='"+2 SPEED" is applied as printed to the Speed modifier.'),
  armor('AWW "Genji" Visor', 'AWW “GENJI” VISOR', 'rare', 'Head Piece', 0.5, 300000, 203, ['head'], 1, effects=[('Genji Visor: +2 Speed', [('system.speedBonus', 2)], 203)],
        note='"+2 Speed" is applied as printed to the Speed modifier.'),
  armor('HDF "Mingwang" Mask', 'HDF “MINGWANG” MASK', 'rare', 'Head Piece', 7, 500000, 203, ['head'], 3)],
 'Torso': [
  armor('Heavenly Silk Vest', 'HEAVENLY SILK VEST', 'uncommon', 'Torso Piece', 2, 399, 204, ['torso'], 1),
  armor("Official's Coat", "OFFICIAL'S COAT", 'uncommon', 'Torso Piece', 2, 299, 204, ['torso'], 1,
        note="The rules box repeats the coat's description; no effect is printed.",
        flavor='A coat and blazer common to diplomats of all kinds. Many companies make their own version, many of them include subtle marketing techniques.', rules=''),
  armor("Hunter's Garb", "HUNTER'S GARB", 'common', 'Torso Piece', 1.5, 45, 204, ['torso'], 1, effects=[("Hunter's Garb: +1 Primeval Mind", [('system.skills.primevalMind', 1)], 204)]),
  armor('VATAC Adamant Ballistic Breastplate "Kongo"', 'VATAC ADAMANT BALLISTIC BREASTPLATE', 'rare', 'Torso Piece', 10, 240000, 204, ['torso'], 2, effects=[('Kongo Breastplate: -1 Basic Move', [('system.moveBonus', -1)], 204)]),
  armor('AWW "Genji" Raiments', 'AWW “GENJI” RAIMENTS', 'rare', 'Torso Piece', 1.5, 300000, 204, ['torso'], 2),
  armor('HDF "Mingwang" Cuirass', 'HDF “MINGWANG” CUIRASS', 'rare', 'Torso Piece', 13, 899999, 204, ['torso'], 3,
        effects=[('Mingwang Cuirass: +1 Adamance, -1 Bleeding Heart', [('system.skills.adamance', 1), ('system.skills.bleedingHeart', -1)], 204)])],
 'Arms': [
  armor('YEI Heavy Duty Gloves', 'YEI HEAVY DUTY GLOVES', 'common', 'Arm Piece', 1.5, 45, 205, ['rarm'], 1, note=ARM_NOTE),
  armor('Blademaster Wraps', 'BLADEMASTER WRAPS', 'uncommon', 'Arm Piece', 1.5, 820, 205, [], 0, note='No Soak (printed "—").'),
  armor('Exdead Bone Gauntlet', 'EXDEAD BONE GAUNTLET', 'rare', 'Arm Piece', 1, 110000, 205, ['rarm'], 1, note=ARM_NOTE),
  armor('VATAC Adamant Divine Gauntlets "Kongo"', 'VATAC ADAMANT DIVINE GAUNTLETS', 'rare', 'Arm Piece', 10, 360000, 205, ['rarm'], 2, note=ARM_NOTE + ' The +1 Empty Hand damage and CRUSHING are applied at the table.',
        effects=[('Kongo Gauntlets: -1 Manual Labor, -1 Bleeding Heart', [('system.skills.manualLabor', -1), ('system.skills.bleedingHeart', -1)], 205)]),
  armor('AWW "Genji" Sleeves', 'AWW “GENJI” SLEEVES', 'rare', 'Arm Piece', 0.5, 400000, 205, ['rarm'], 2, note=ARM_NOTE),
  armor('HDF "Mingwang" Vambraces', 'HDF “MINGWANG” VAMBRACES', 'rare', 'Arm Piece', 8, 899999, 205, ['rarm'], 3, note=ARM_NOTE)],
 'Legs': [
  armor('YEI Worker Bottoms', 'YEI WORKER BOTTOMS', 'common', 'Leg Piece', 1.5, 50, 206, BOTH_LEGS, 1),
  armor('Silkspeaker Legs', 'SILKSPEAKER LEGS', 'uncommon', 'Leg Piece', 2, 220, 206, BOTH_LEGS, 1, effects=[('Silkspeaker Legs: +1 Spit In The Face Of God', [('system.skills.spitInTheFace', 1)], 206)]),
  armor('Rogue Wraps', 'ROGUE WRAPS', 'uncommon', 'Leg Piece', 1, 340, 206, BOTH_LEGS, 1, effects=[('Rogue Wraps: +1 Basic Move', [('system.moveBonus', 1)], 206)]),
  armor('VATAC Adamant Ballistic Greaves "Kongo"', 'VATAC ADAMANT BALLISTIC GREAVES', 'rare', 'Leg Piece', 5, 240000, 206, BOTH_LEGS, 2),
  armor('AWW "Genji" Legs', 'AWW “GENJI” LEGS', 'rare', 'Leg Piece', 1.5, 500000, 206, BOTH_LEGS, 1),
  armor('HDF "Mingwang" Legs', 'HDF “MINGWANG” LEGS', 'rare', 'Leg Piece', 10, 699999, 206, BOTH_LEGS, 3,
        effects=[('Mingwang Legs: -2 Basic Move', [('system.moveBonus', -2)], 206)])],
}

# ---------- accessories, consumables and market goods ----------
def goods(name, kind, rarity, category, weight, price, page, rules, flavor, d6=None, note='', consumable=None, morale=0, effects=(), price_text=None, tag=None, id_name=None):
    desc = para(esc(flavor), f'<strong>{esc(rarity.title())} {esc(category)} · {weight:g} kg · {esc(price_text or money(price))}</strong>' + (f' · d6: {d6}' if d6 else ''),
                f'<strong>{esc(rules)}</strong>', (f'<em>Catalog note: {esc(note)}</em>' if note else ''))
    sys_ = {'description': desc, 'source': src(page), 'rarity': rarity, 'quantity': 1, 'slots': 1, 'magCost': price, 'equipped': False, 'gearSlot': 'carry',
            'tags': ', '.join(['2.1', tag or category.title()]), 'r21': {'coverage': {p: 0 for p in PARTS}, 'morale': morale, 'weight': weight}}
    if kind == 'gear':
        c = dict(enabled=False, apCost=0, health=0, burntArdor=0, morale=0, allHealth=False, allBurntArdor=False); c.update(consumable or {})
        if consumable: c['enabled'] = True
        sys_['consumable'] = c
    return {'name': name, 'type': kind, 'img': icon('gear' if kind in ('gear', 'salvage') else kind), 'system': sys_, 'effects': [effect(name, *e) for e in effects], **({'id_name': id_name} if id_name else {})}
ACCESSORIES = {'Accessories': [
  goods('SSA Red Eye Ring', 'accessory', 'common', 'Accessory', 0.5, 100, 187, 'Wearing Arm: +1 HP.', grab(187, 'A ring with a tiny life-giving ruby', 'long way.'), d6=1,
        effects=[('SSA Red Eye Ring: +1 HP (right arm)', [('system.parts.rarm.hpBonus', 1)], 187, 'Edit the effect key to system.parts.larm.hpBonus for the left arm.')]),
  goods('AWW Thaumaturgical Choker', 'accessory', 'uncommon', 'Accessory', 0.25, 800, 187, 'While worn: +1 max Flame.', grab(187, 'A choker made of practical esoteric', 'regulating talismans.'), d6=2,
        note='Raise Maximum Flame by 1 on the sheet while it is worn.'),
  goods('Exdead Soul Integrity Earring', 'accessory', 'enhanced', 'Accessory', 0.1, 1000, 187, 'While worn, the Stillness Stone reacts: +1 max Morale.', '"ABANDON ALL HESITATION. THE ONLY BEAST HERE IS YOU."', d6=3, morale=1),
  goods('Demon God Black Sorcery Beads', 'accessory', 'rare', 'Accessory', 0.3, 200000, 187, 'While worn: +1 to Empty Hand damage.', grab(187, 'Mala with the heart bead', 'also Violence?'), d6=4, id_name='Demon God Prayer Beads',
        note='Add the +1 as a damage bonus when rolling Empty Hand damage.'),
  goods('Devrendra Data Veil', 'accessory', 'deluxe', 'Accessory', 0.25, 2000000, 187, 'Obfuscates the face with a veil, shimmering it with a digital cover. Hides identity.',
        grab(187, 'DEVRENDRA Thaumaturgicals have found', 'Information Talismans.'), d6=5),
  goods('SSA Angel Arm Prosthetic', 'accessory', 'prestige', 'Accessory', 3, 4000000, 187, 'Replaces one Arm and can work as a WROUGHT ARM. +1 to KILL THE BUDDHA Checks with a weapon held in that Hand.',
        grab(187, 'There are 108,000,000 Angels', '108 KALPAS AGO.'), d6=6),
  armor('Clean Necktie', 'CLEAN NECKTIE', 'common', 'Accessory', 0.05, 2, 207, [], 0, morale=1, kind='accessory', id_name='Clean Black Necktie'),
  armor('Puterijasa Featherstep Clogs', 'PUTERIJASA FEATHERSTEP CLOGS', 'uncommon', 'Accessory', 1, 400, 207, [], 0, kind='accessory'),
  armor('VATAC Adamant Ballistic Boots "Kongo"', 'VATAC ADAMANT BALLISTIC BOOTS', 'rare', 'Accessory', 3, 100000, 207, [], 0, kind='accessory'),
  armor('AWW "Genji" Boots', 'AWW “GENJI” BOOTS', 'rare', 'Accessory', 1, 156000, 207, [], 0, kind='accessory', effects=[('Genji Boots: +1 Basic Move', [('system.moveBonus', 1)], 207)]),
  armor('Exdead Mind-Silk Boots', 'EXDEAD MIND-SILK BOOTS', 'rare', 'Accessory', 1, 300000, 207, [], 0, kind='accessory'),
  armor('HDF "Mingwang" Sabatons', 'HDF “MINGWANG” SABATONS', 'rare', 'Accessory', 8, 400000, 207, [], 0, kind='accessory')]}
CONSUMABLES = {'Consumables': [
  goods('ELIXIR Potion', 'gear', 'common', 'Consumable', 0.25, 50, 186, 'Heal 1 HP from a random Part.', grab(186, 'Thaumaturgicals. Difficult to come by.', 'professional Fangshi.'), d6=1, consumable=dict(health=1),
        note='Use asks which Part to heal; roll the Part at random.', id_name='ELIXIR Healing Pill'),
  goods('Gussio Thunderbolt Latte', 'gear', 'common', 'Consumable', 0.3, 10, 186, 'For 1 hour: +1 MOT; immune to Sleep and Stun. Suffer 1 true damage to a random Part.',
        grab(186, 'A super strong latte', 'ensuring wakefulness.'), d6=2),
  goods('ELIXIR Magnesium Pill', 'gear', 'uncommon', 'Consumable', 0.25, 500, 186, 'Heal 1 Morale.', grab(186, 'People drink this when they feel', 'Self-control. Morale.'), d6=3, consumable=dict(morale=1)),
  goods('ELIXIR Chakra Pill', 'gear', 'enhanced', 'Consumable', 0.25, 1000, 186, 'Recover 1 burnt Flame.', grab(186, 'The recipe for this Chakra Pill', 'was burnt down.'), d6=4, consumable=dict(burntArdor=1)),
  goods('ELIXIR Asura Stim', 'gear', 'deluxe', 'Consumable', 0.25, 1000000, 186, 'Suffer 3 true Damage to a random Part. +1 to to all outgoing Damage for 30 minutes.',
        grab(186, 'Drinking this sends one into a violent frenzy.', 'warobsessed freaks.').replace('warobsessed', 'war-obsessed'), d6=5, id_name='Inter-Elix Asura Stim'),
  goods('ELIXIR Soma', 'gear', 'prestige', 'Consumable', 0.5, 3000000, 186, 'Restore all HP to every Part and recover all burnt Flame.', grab(186, 'Soma is the food of the gods', 'the Orbital Heaven.'), d6=6,
        consumable=dict(allHealth=True, allBurntArdor=True), id_name='Inter-Elix Soma')]}
GOODS = {
 'Salvage': [
  goods('Junk Scrap', 'salvage', 'common', 'Salvage', 1, 1, 188, 'Metal scraps that can be used as material for crafting or repairs.', grab(188, 'In Post-Calamity, the refuse', 'the cosmos.'), d6=1),
  goods('Processor Grid-Shards', 'salvage', 'common', 'Salvage', 0.25, 50, 188, 'Broken Information Talisman matrices. Cannot function as a processor; can be recycled as repair materials.', grab(188, 'Processors are new thaumaturgicals', 'they can get.'), d6=2),
  goods('Wairini Locket', 'salvage', 'common', 'Salvage', 0.1, 1, 188, grab(188, 'A soundstone with a recording', 'revolutionary ideals.'), grab(188, 'Dattreya Wairini was one of the final', 'to fight in the final battle!”'), d6=3, id_name='Wairin Locket'),
  goods('Communist Sutra', 'salvage', 'common', 'Salvage', 0.2, 1, 188, grab(188, 'Read at the day’s beginning:', 'with Communism or not.'), grab(188, 'The abridged version of the Communist Sutra', 'Yenjanese Cathedrals.'), d6=4),
  goods('Tsushing Pressplay Player', 'salvage', 'uncommon', 'Salvage', 0.5, 300, 188, grab(188, 'A soundstone with reader talismans', 'Includes a headset.'), grab(188, 'Tsushing was a rice cooker company', 'relaying communist studies.'), d6=5),
  goods('Info Talisman Ribbon: Lover Rockers', 'salvage', 'common', 'Salvage', 0.1, 50, 188, grab(188, 'Contains all 21 songs', 'Requires a cassette player.'), grab(188, 'Too Drunk To Ride, an avant-garde', 'a board game company.'), d6=6,
        id_name='Cassette Tape: Lover Rockers')],
 'Tools': [
  goods('Bintang Handheld Lotus Light', 'gear', 'common', 'Tool', 0.5, 20, 189, grab(189, 'Tap and speak a mantra:', 'Recharge through chanting.'), grab(189, 'Handheld flashlights made in the mold', 'recharged through chanting.'), d6=1),
  goods('KC Devil Battery', 'gear', 'common', 'Tool', 0.3, 10, 189, grab(189, '3-pack. Stores Devil Fuel', '11600s onward.'), grab(189, 'Kedrat Company is a guild', 'their business and life.'), d6=2, id_name='AWW Devil Battery'),
  goods('Bintang Lighter', 'gear', 'common', 'Tool', 0.1, 20, 189, grab(189, '40 uses. Flick open', 'Strikes a Fire Stone.'), grab(189, 'Common now, especially with the rise of smokes.', 'care about the difference.'), d6=3),
  goods('HaeCo Handheld Radio', 'gear', 'uncommon', 'Tool', 0.6, 120, 189, grab(189, 'Communicate with radios tuned', 'Devil Batteries.'), grab(189, 'Handheld radios used as communication', 'subsumed into HaeCo.'), d6=4),
  goods('HaeCo Magnetic Compass', 'gear', 'common', 'Tool', 0.1, 40, 189, 'A magnetic pocket compass. Points to true north: Thule.', grab(189, 'A pocket compass magnetically attuned', 'Industrialism."'), d6=5),
  goods('HaeCo Fine Focus Binoculars', 'gear', 'uncommon', 'Tool', 1, 300, 189, grab(189, 'See up to 400m.', 'Adjustable focus.'), grab(189, 'Commercial high-focus binoculars', 'and so on.'), d6=6)],
 'Esotery': [
  goods('Ylourgne Makeup Set', 'gear', 'uncommon', 'Esotery', 0.5, 200, 190, grab(190, 'Thaumaturgically enhanced makeup.', "it's taken off."), grab(190, 'Ylourgne is a popular East Kamguk', 'from Dangnu Island.'), d6=1),
  goods('Devildrug', 'gear', 'uncommon', 'Esotery', 0.5, 900, 190, grab(190, 'While a Cultivator has time', 'into 10 Bullets.'), grab(190, 'Devildrug is made up of six parts', 'firearms were made.'), d6=2),
  goods('Protection Amulet', 'gear', 'rare', 'Esotery', 0.15, 100000, 190, grab(190, 'When the wearer would suffer damage,', 'soaking up to 5 damage.').replace('1in-6', '1-in-6'), grab(190, 'Otherwise known as an', 'on them or two.'), d6=3),
  goods("Devaraja's Dying Gasp", 'gear', 'rare', 'Esotery', 0.3, 400000, 190, grab(190, 'A vial with the dying breath', 'for an hour.').replace('GodKing', 'God-King'), grab(190, 'Awan Rakan was the last', 'of his Power.'), d6=4),
  goods('Heart Container', 'gear', 'deluxe', 'Esotery', 0.25, 7777777, 190, 'Consume this with a Meal to gain +1 Max HP to a random part.', grab(190, 'Sometime in the 7000s,', 'Impossible to commercialize.'), d6=5,
        price_text='7,777,777 ♄ and impossibly rare', note='Add the +1 to the HP bonus of the rolled Part on the sheet.'),
  goods('Soul Container', 'gear', 'prestige', 'Esotery', 3, 7777777, 190, 'Consume this with a Meal to gain +1 Max Morale.', grab(190, 'Jarityassera had a wife,', 'Impossible to commercialize.'), d6=6,
        price_text='7,777,777 ♄ and impossibly rare', note='Add the +1 to the Morale bonus on the sheet.')],
 'Talismans': [
  goods('Second Dimension Vivification', 'gear', 'rare', 'Talisman', 0.15, 100000, 191, grab(191, 'Nearby 2D objects', 'can move through them.'), grab(191, 'Used often by animators', 'The Contradiction intensifies.'), d6=1),
  goods('Enter the Intrajala', 'gear', 'rare', 'Talisman', 0.15, 100000, 191, grab(191, 'Project your Consciousness', 'akashic nexus-space.'), grab(191, 'The Intrajala is essentially', 'Akasha Workings.'), d6=2),
  goods("Thief's Last Door", 'gear', 'rare', 'Talisman', 0.15, 100000, 191, grab(191, 'Fold the paper three times', 'the Intercessor decides what happens.'), grab(191, 'A master burglar used this', 'all the same.'), d6=3),
  goods('Mosesian Spring', 'gear', 'deluxe', 'Talisman', 0.15, 1000000, 191, grab(191, 'Summons potable water', 'from thin air.'), grab(191, 'An incredibly useful talisman', 'can make them now.'), d6=4),
  goods('Rend', 'gear', 'deluxe', 'Talisman', 0.15, 1999000, 191, 'Point at a target within sight. Immediately deal [MND] damage to them.', grab(191, 'A common Talisman during the Esoteric Era,', 'know of its existence.'), d6=5),
  goods('Sky Dance', 'gear', 'prestige', 'Talisman', 0.15, 1000000, 191, grab(191, 'Gain the ability to fly', 'pressure and so on.'), grab(191, 'This Talisman was created by the Mystic', 'someone like him.').replace('illtemper', 'ill-temper'), d6=6,
        note='Printed as a "Prestige Esotery" in the Talismans list. These talismans require destruction to activate (p.191).')]}

def ammo_item(name, page, ammo_type, quantity, text, rarity='common', price=0, weight=0, note=''):
    return {'name': name, 'type': 'ammunition', 'img': icon('ammunition'), 'effects': [], 'system': {
        'description': para(esc(text), (f'<em>Catalog note: {esc(note)}</em>' if note else '')), 'source': src(page), 'rarity': rarity, 'quantity': quantity, 'slots': 1,
        'magCost': price, 'equipped': False, 'gearSlot': 'carry', 'ammoType': ammo_type, 'tags': '2.1, Ammunition', 'r21': {'coverage': {p: 0 for p in PARTS}, 'morale': 0, 'weight': weight}}}
# Book p.193. The ammo type is the closest type the system knows (scripts/ammunition.mjs); a stack's weight is counted once, so bundles carry their total weight.
AMMO = [
 ammo_item('Quiver of Arrows', 193, 'arrow', 15, '15 Arrows. ARROW — 0.2 kg; 2 ♄ each; works on Bows; pierce damage.', price=30, weight=3, note='Weight and price are for the full quiver of 15.'),
 ammo_item('Quiver of Bolts', 193, 'bolt', 15, '15 Bolts. BOLT — 0.2 kg; 2 ♄ each; works on Crossbows; pierce damage.', price=30, weight=3, note='Weight and price are for the full quiver of 15.'),
 ammo_item('Handgun Magazine (Short Bullets)', 193, 'bullet', 12, '12 Pistol Bullets. PISTOL BULLET — 0.1 kg; 1 ♄ each; works on Handguns; pierce damage. Modern handguns work with 12 round magazines; revolvers count by the bullet.',
           price=12, weight=1.2, note='Weight and price are for a full magazine of 12. The HaeCo Dragonhead holds 18.'),
 ammo_item('Longgun Magazine (Long Gun Bullets)', 193, 'bullet', 32, '32 Rifle Bullets. RIFLE BULLET — 0.2 kg; 2 ♄ each; works on Longguns; pierce damage. Reloading replaces magazines.',
           price=64, weight=6.4, note='Weight and price are for a full magazine of 32 (MORTAR TD-7 Ruyi). The system groups handgun and longgun bullets together as Gun.'),
 ammo_item('Fireshot', 193, 'fireshot', 1, 'FIRESHOT — 0.2 kg; 100 ♄; works on Handguns and Longguns; sets on fire; blast damage.', 'uncommon', 100, 0.2),
 ammo_item('Freezeshot', 193, 'bullet', 1, 'FREEZESHOT — 0.2 kg; 200 ♄; works on Handguns and Longguns; chills upon hit, halving BASIC MOVE for 1 minute; blast damage.', 'uncommon', 200, 0.2,
           note='Recorded with the Bullet type; the chill and blast damage are applied at the table.'),
 ammo_item('Blunt Bolt', 193, 'bolt', 1, 'BLUNT BOLT — 0.2 kg; 30 ♄; works on Crossbows; crush damage.', price=30, weight=0.2, note='Recorded with the Bolt type; apply crush damage at the table.'),
 ammo_item('Impact Arrow', 193, 'bluntArrow', 1, 'IMPACT ARROW — 0.2 kg; 10 ♄; works on Bows; inflicts KNOCKBACK 10M; crush damage.', price=10, weight=0.2),
 ammo_item('Slingshot', 193, 'bluntDart', 1, 'SLINGSHOT — 0.2 kg; 1 ♄; works on Launchers; crush damage.', price=1, weight=0.2, note='Recorded with the launcher crush type (Blunt Dart).'),
 ammo_item('Dart', 193, 'dart', 1, 'DART — 0.1 kg; 1 ♄; works on Launchers; can be outfitted with Poisons or other ailment toxins; pierce damage.', price=1, weight=0.1),
 ammo_item('HDF Dragon Fire Meteor', 201, 'bullet', 1, 'Deluxe Divine Longgun ammunition · 1 kg · 1,000,000 ♄. DEALS BLAST DAMAGE ✦ BLAZE ✦ KNOCKBACK 10M ✦ EXPLODES IN A 1M RADIUS FULMINATION UPON IMPACT, DEALING DAMAGE TO EVERYTHING IN RADIUS.',
           'deluxe', 1000000, 1, 'The only ammunition the HDF Dragon Fire Cannon fires.')]

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
            it = {k: v for k, v in it.items() if k not in ('_id', 'folder', 'flags')}
            mods = it.get('system', {}).get('r21', {}).get('mods')
            if it['type'] == 'weapon' and mods is not None: it['system']['r21']['mods'] = {k: bool(mods.get(k)) for k in WMODS}  # carried weapons get the full switch set
            out.setdefault(fname, []).append(it)
    return out
PACKS = {
 'weapons-21': {**WEAPONS, **previous('weapons-21', ['Heed Us, O Mighty Fury (one-shot)', 'Shields'])},
 'armor-21': {**ARMOR, **previous('armor-21', ['Heed Us, O Mighty Fury (one-shot)'])},
 'consumables-21': {**CONSUMABLES, **previous('consumables-21', ['Fangshi Concoctions'])},
 'accessories-21': ACCESSORIES,
 'ammunition-21': {'Ammunition': AMMO},
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
                e = dict(e); key = e.pop('id_name', e['name'])  # id_name: the earlier catalog name, so a renamed item keeps its compendium id
                items.append({'_id': uid(pack, key), **e, 'folder': f['_id'], 'sort': n * 1000, 'flags': {'10kswordsfoundry': {'rules21': {'pack': pack}}}})
        assert len({i['_id'] for i in items}) == len(items), pack
        json.dump({'folders': folders, 'items': items}, open(f'{OUT}{pack}.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        print(pack, len(items), 'items in', len(folders), 'folders')
