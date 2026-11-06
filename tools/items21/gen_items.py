"""Build the 2.1 item catalogs (data/*-21.json) from the Red Kalpa Manuscript: the 53-page edition, pp.31-35 (Panoply, armor and
accessories), and the 150-page edition, pp.121-123 (the Heed Us one-shot) and p.8 (Discovery); Fangshi pills and elixirs from the
2.1 playtest Sects (2026-11-06), pp.147-149.
Usage: python gen_items.py <repo data dir>. Text below is transcribed from the manuscript; nothing is invented."""
import json, hashlib, html, sys
OUT = sys.argv[1] if len(sys.argv) > 1 else ''
PARTS = ['rleg', 'lleg', 'rarm', 'larm', 'torso', 'head']
WMODS = ['auto', 'crushing', 'great', 'colossal', 'doublehand', 'focus', 'blaze', 'artifact', 'smashing']
GRIP = {'dagger': 'hilt', 'saber': 'hilt', 'sword': 'hilt', 'whip': 'hilt', 'cleaver': 'haft', 'bludgeon': 'haft', 'polearm': 'haft', 'launcher': 'haft', 'bow': 'riser', 'crossbow': 'stock', 'handgun': 'stock', 'longgun': 'stock'}
RANGE = {'dagger': 1, 'saber': 1, 'sword': 1, 'whip': 3, 'bludgeon': 1, 'cleaver': 1, 'polearm': 3, 'launcher': 20, 'bow': 250, 'crossbow': 125, 'handgun': 30, 'longgun': 400}
AMMO_FAMILY = {'launcher': 'launcher', 'bow': 'bow', 'crossbow': 'crossbow', 'handgun': 'gun', 'longgun': 'gun'}
POOL = {'dagger': 'Physique + Beast Shrine', 'saber': 'Physique + Beast Shrine', 'sword': 'Physique or Motorics + Beast Shrine', 'bludgeon': 'Physique + Beast Shrine',
        'cleaver': 'Physique + Beast Shrine', 'polearm': 'Physique + Beast Shrine', 'whip': 'Motorics + Thews and Sinews', 'launcher': 'Motorics + Hand/Eye Coordination',
        'bow': 'Motorics + Hand/Eye Coordination', 'crossbow': 'Motorics + Hand/Eye Coordination', 'handgun': 'Motorics + Hand/Eye Coordination', 'longgun': 'Motorics + Hand/Eye Coordination'}
PROFILE_TEXT = {
 'dagger': 'As a Critical Opening they can Stab any part, ignoring Soak, dealing damage.',
 'saber': 'Chop: a Critical Opening can be used to chop through a Limb, dealing +1 Damage.',
 'sword': 'Swords are some of the most common weapons in the Trichiliocosm.',
 'bludgeon': "Strike: A Critical Strike can be used to hammer into armor: if the Part targeted has Soak, reduce the target's Soak by 2 instead of just 1.",
 'cleaver': 'Versatile: Cleavers are often also used for chopping wood. Using a Cleaver for a Primeval Mind Check adds +1.',
 'polearm': 'Innately have farther effective range.',
 'whip': 'Innately have farther effective range but more difficult to wield.',
 'launcher': 'Anything used to throw items, such as slingshots, slings, slingstaffs, and so on.',
 'bow': 'Requires Body 2. Either longbows or short bows or self bows used to launch arrows at distant targets. Requires Arrows as ammunition.',
 'crossbow': 'Largely replaced by Guns in modern Hingsajagra, crossbow has its place as a means of unloading bolts filled with payloads as well as packing power silently. A favored weapon of assassins and hitmen. Requires Bolts as ammunition.',
 'handgun': 'The most common weapon in modern Hingsajagra. Pistols, dragoons, and revolvers all fall in this category. Needs short bullets as ammo. Revolvers count by the bullet, while modern handguns work with 12 round magazines.',
 'longgun': 'The most dangerous weapon in modern Hingsajagra and perhaps the most common among militaries, paramilitaries, and mercenary outfits. Needs appropriate long gun bullets to shoot, and often uses magazines. Reloading replaces magazines.'}
uid = lambda *p: hashlib.sha1('|'.join(p).encode()).hexdigest()[:16]
esc = lambda t: html.escape(t, quote=False)
src = lambda page: f'Rules 2.1 (Red Kalpa Manuscript), p.{page}'
icon = lambda kind: f'systems/10kswordsfoundry/assets/icons/{kind}.svg'

def para(*parts):
    return ''.join(f'<p>{p}</p>' for p in parts if p)

def effect(item, label, changes, page, note=''):
    return {'_id': uid('effect21', item, label), 'name': label, 'img': icon('fashion'), 'transfer': True, 'disabled': False,
            'description': f'<p>{src(page)}. Applies while equipped.{" " + esc(note) if note else ""}</p>',
            'system': {'changes': [{'key': k, 'type': 'add', 'value': str(v), 'phase': 'initial', 'priority': 20} for k, v in changes]}}

def weapon(name, page, profile, text, weight=0.0, material='', mods=(), set_mods=(), rate=1, capacity=0, grip=None, note='', tags=()):
    stat = f"{GRIP_LABEL(grip or GRIP[profile])} · {profile.title()} · {POOL[profile]} · {RANGE[profile]} m{' · ' + material if material else ''}" + (f" · {weight} kg" if weight else '')
    desc = para(esc(text), f'<strong>{esc(stat)}</strong>', f'<strong>Profile:</strong> {esc(PROFILE_TEXT[profile])}',
                (f'<strong>Mods:</strong> {esc(" ✦ ".join(mods))}' if mods else ''), (f'<strong>Rate</strong> {rate} · <strong>Capacity</strong> {capacity or "—"}' if profile in AMMO_FAMILY else ''),
                'At base, all weapons deal 2 Damage (p.33).', (f'<em>Catalog note: {esc(note)}</em>' if note else ''))
    return {'name': name, 'type': 'weapon', 'img': icon('weapon'), 'effects': [], 'system': {
        'description': desc, 'source': src(page), 'rarity': 'common', 'quantity': 1, 'slots': 1, 'magCost': 0, 'equipped': False, 'gearSlot': 'carry',
        'weaponType': 'ranged' if profile in AMMO_FAMILY else 'melee', 'range': RANGE[profile], 'damageType': 'impact' if profile == 'bludgeon' else 'cut',
        'ammoFamily': AMMO_FAMILY.get(profile, 'none'), 'tags': ', '.join(['2.1', 'Weapon', profile.title(), *mods, *tags]),
        'r21': {'profile': profile, 'grip': grip or GRIP[profile], 'damage': 2, 'range': 0, 'rate': rate, 'capacity': capacity, 'ferocious': 0, 'shield': 0,
                'mods': {k: k in set_mods for k in WMODS}, 'weight': weight}}}
GRIP_LABEL = lambda g: {'hilt': 'Hilt', 'haft': 'Haft', 'riser': 'Riser', 'stock': 'Stock'}[g]

def armor(name, page, text, rules, coverage, weight=0.0, morale=0, kind='fashion', effects=(), note='', tags=()):
    cov = ', '.join(f"{ {'rleg':'Right Leg','lleg':'Left Leg','rarm':'Right Arm','larm':'Left Arm','torso':'Torso','head':'Head'}[p]} {v}" for p, v in coverage.items())
    desc = para(esc(text), f'<strong>{esc(rules)}</strong>', (f'<strong>Soak:</strong> {esc(cov)}' if cov else ''), (f'{weight} kg' if weight else 'Weight not printed.'),
                (f'<em>Catalog note: {esc(note)}</em>' if note else ''))
    sys = {'description': desc, 'source': src(page), 'rarity': 'common', 'quantity': 1, 'slots': 1, 'magCost': 0, 'equipped': False,
           'gearSlot': 'fashion' if kind == 'fashion' else 'carry', 'tags': ', '.join(['2.1', 'Armor' if kind == 'fashion' else kind.title(), *tags]),
           'r21': {'coverage': {p: coverage.get(p, 0) for p in PARTS}, 'morale': morale, 'weight': weight}}
    if kind == 'fashion': sys.update({'armor': 0, 'ardor': 0})
    return {'name': name, 'type': kind, 'img': icon(kind), 'system': sys, 'effects': [effect(name, *e) for e in effects]}

def consumable(name, page, text, rules, weight=0.0, health=0, ardor=0, morale=0, note='', tags=()):
    return {'name': name, 'type': 'gear', 'img': icon('gear'), 'effects': [], 'system': {
        'description': para(esc(text), f'<strong>{esc(rules)}</strong>', (f'{weight} kg' if weight else ''), (f'<em>Catalog note: {esc(note)}</em>' if note else '')),
        'source': src(page) if isinstance(page, int) else page, 'rarity': 'common', 'quantity': 1, 'slots': 1, 'magCost': 0, 'equipped': False, 'gearSlot': 'carry',
        'tags': ', '.join(['2.1', 'Consumable', *tags]), 'consumable': {'enabled': True, 'apCost': 0, 'health': health, 'burntArdor': ardor, 'morale': morale, 'allHealth': False, 'allBurntArdor': False},
        'r21': {'coverage': {p: 0 for p in PARTS}, 'morale': 0, 'weight': weight}}}

def ammo(name, page, ammo_type, quantity, text, note=''):
    return {'name': name, 'type': 'ammunition', 'img': icon('ammunition'), 'effects': [], 'system': {
        'description': para(esc(text), (f'<em>Catalog note: {esc(note)}</em>' if note else '')), 'source': src(page), 'rarity': 'common', 'quantity': quantity, 'slots': 1,
        'magCost': 0, 'equipped': False, 'gearSlot': 'carry', 'ammoType': ammo_type, 'tags': '2.1, Ammunition', 'r21': {'coverage': {p: 0 for p in PARTS}, 'morale': 0, 'weight': 0}}}

ONE_SHOT = 'Heed Us, O Mighty Fury (one-shot)'
PACKS = {
 'weapons-21': {'Panoply': [
   weapon('HaeCo Black Iron Saber', 33, 'saber', 'Weapon built from mass produced black iron or carbon steel. Made from MORTAR Divine Blueprints. Sharp and robust, perfect for mass production and outfitting armies and paramilitaries.', 1.5, 'Black Iron', note='Printed grip is Handle; recorded as a Hilt.'),
   weapon('TDF Feathersword', 33, 'sword', 'Weapon mass produced by Thousand Dragons Forge, made from ancient Revolutionist blueprints, ran through a Divine Loom to fabricate it with feathersteel. Extremely light and flexible, able to be used for biting striking attacks and sudden cutting angles.', 0.5, 'Feathersteel', note='Printed grip is Handle; recorded as a Hilt.'),
   weapon('VATAC Collapsing Lance', 33, 'polearm', 'The premiere infantry weapon line of Vajra Tactical. Made for striking from afar and for carrying into any theater through its collapsing capabilities.', 3, 'Black Jade Fiber'),
   weapon('MORTAR AT-CR Cudgel', 33, 'bludgeon', "MORTAR's highest and most premium weapon line is their AT-CR line, which stands for \"Anti-Terrorism Counter Revolution.\" It is made to break the wills of revolutionaries and to counter the strength of Cultivators. The Cudgel is the most common and cheapest weapon: the majority of bodyguards wield cudgels.", 2, 'Petrojade', mods=['CONCEALABLE', 'SMASHING'], set_mods=['smashing'],
          note='CONCEALABLE is not defined in the manuscript; it is kept as a tag.'),
   weapon('TD-7 Ruyi', 33, 'longgun', "MORTAR's common mass manufactured rifle line, found across the Trichiliocosm indiscriminately.", 4, 'Gunmetal', mods=['AUTO'], set_mods=['auto'], rate=30, capacity=30),
   weapon('MORTAR Parabellum 9mm', 33, 'handgun', "MORTAR's common mass manufactured pistol line, found across the Trichiliocosm indiscriminately.", 1, 'Gunmetal', rate=10, capacity=15,
          note='Capacity 15 is printed here; the Handgun profile says modern handguns use 12-round magazines.')],
  'Weapon Profiles': [weapon(f'{p.title()} (profile)', 65, p, f'A generic {p.title()} built from the 2.1 profile. Rename it and add Material and Mods (pp.64–66).', tags=['Template']) for p in RANGE],
  ONE_SHOT: [
   weapon('Rusting Machete', 122, 'saber', 'Carried by HaeCo hirelings.', note='Printed rider: "on wound, 1-in-6 chance of inflicting Flesh Wound than Dire Wound." The profile is not printed; recorded as a Saber.'),
   weapon('Adamant Longjian', 122, 'sword', 'Carried by HaeCo Sword Cultivators.'),
   weapon('M8 Rifle', 122, 'longgun', 'Carried by HaeCo Gun Cultivators: "40 shots per magazine, Burst 4".', mods=['AUTO'], set_mods=['auto'], rate=4, capacity=40, note='Burst 4 is recorded as Rate 4 with AUTO.'),
   weapon('Cosmosian Greatstaff', 122, 'bludgeon', 'Carried in both hands by the Astrologian: "+2 dice to all Cast Magick Checks."', mods=['DOUBLEHAND'], set_mods=['doublehand'], note='Profile not printed; recorded as a two-handed Bludgeon. Add its +2 casting dice in the Cast dialog.')],
  'Shields': [armor('Anti-Bullet Adamant Tower Shield', 122, 'Carried in the left hand by HaeCo Sword Cultivators.', 'Acts as FULL COVER against ranged attacks.', {}, kind='gear',
                    note='Held in a hand (set the Gear Slot to Left Hand when equipping). Full Cover makes a full-on ranged attack impossible without weakening the cover first (p.33).')]},
 'armor-21': {
  'Head': [armor('YEI Three Head Crown', 33, 'Yellow Earth Industrial creates helmets for use to strengthen the mind but also to supply clearsight to their workers. Mercs have found that these Crown-model helmets helped them shoot better as well.',
                 '2 Soak. +2 Morale. Ignore Light Cover with ranged weapon KILL THE BUDDHA.', {'head': 2}, 1, morale=2),
   armor('VATAC Adamant Ballistic Helm "Kongo"', 34, 'Distributed through VAJRA TACTICAL in Hingsajagra, the MORTAR standard issue Adamant Ballistic Breastplate has become the iconic military gear across the Trichiliocosm, particularly with heavy infantry, special operations, riot-control, and counter-revolution units. The newest and most widespread version of the MORTAR standard issue—the KONGO model—is known for its fearsome Wisdom King aesthetic, blending the "dharma protector" into the brutalist blackrock, ceramic, and heavensilk material.', '5 Helmet Soak. -2 WIT.', {'head': 5}, 5,
         effects=[('Kongo Helm: -2 Wits', [('system.cores.wit', -2)], 34)]),
   armor('Puterijasa Adept Cowl', 34, 'A large cowl that creates, with the Robes, the iconic look of an Adept, the harnesser and sorcerer of the intramaterial sciences.', '+1 MND, +1 HRT.', {},
         effects=[('Adept Cowl: +1 Mind and Heart', [('system.cores.mnd', 1), ('system.cores.spi', 1)], 34)])],
  'Torso': [
   armor('Heavenly Silk Vest', 34, 'The most common form of armor in the modern Mahakalpa. A vest made of interwoven heavenly silk vest that has stopping power even against bullets and is largely light enough to be able to not weight down the wearer. Many different companies sell their own versions.', 'TORSO 2; R ARM 2; L ARM 2', {'torso': 2, 'rarm': 2, 'larm': 2}, 2),
   armor('VATAC Adamant Ballistic Breastplate "Kongo"', 68, 'Distributed through VAJRA TACTICAL in Hingsajagra, the MORTAR standard issue Adamant Ballistic Breastplate has become the iconic military gear across the Trichiliocosm, particularly with heavy infantry, special operations, riot-control, and counter-revolution units. The newest and most widespread version of the MORTAR standard issue—the KONGO model—is known for its fearsome Wisdom King aesthetic, blending the "dharma protector" into the brutalist blackrock, ceramic, and heavensilk material.',
         '5 Torso Soak. -2 MOT.', {'torso': 5}, 10, effects=[('Kongo: -2 Motorics', [('system.cores.mot', -2)], 34)]),
   armor("Official's Coat", 34, 'A coat and blazer common to diplomats of all kinds. Many companies make their own version, many of them include subtle marketing techniques.', 'TORSO 1 Soak; LIMBS 1 Soak; +1 SPIT IN THE FACE OF GOD',
         {'torso': 1, 'rarm': 1, 'larm': 1, 'rleg': 1, 'lleg': 1}, effects=[("Official's Coat: +1 Spit In The Face Of God", [('system.skills.spitInTheFace', 1)], 34)]),
   armor('Puterijasa Adept Robes', 34, "Raiments that strengthen and multiply the strength of an Adept's Magick casting ability, intramaterially resonant threads woven into sutras lining their robes.", '+1 to all Casting checks.', {},
         note='Add the +1 in the Cast dialog; Magick bonus dice are set per Magick.')],
  'Arms': [
   armor('YEI Heavy Duty Gloves', 34, 'Forearm covering heavy duty aramid gloves with steel meshes and impact padding.', 'ARMS: 1 Soak', {'rarm': 1, 'larm': 1}, 1),
   armor('SSA Red Eye Ring', 34, 'A ring with a tiny life-giving ruby. The Cultivation Womb reacts favorably with a rubyʼs interiority. A little help can go a long way.', 'The Arm this is on has +2 HP.', {},
         effects=[('Red Eye Ring: Right Arm +2 HP', [('system.parts.rarm.hpBonus', 2)], 34, 'Change the key to system.parts.larm.hpBonus if worn on the left hand.')], note='Set to the right arm by default.'),
   armor('VATAC Adamant Divine Gauntlets "Kongo"', 34, 'Distributed through VAJRA TACTICAL in Hingsajagra, the MORTAR standard issue Adamant Ballistic Breastplate has become the iconic military gear across the Trichiliocosm, particularly with heavy infantry, special operations, riot-control, and counter-revolution units. The newest and most widespread version of the MORTAR standard issue—the KONGO model—is known for its fearsome Wisdom King aesthetic, blending the "dharma protector" into the brutalist blackrock, ceramic, and heavensilk material.', '5 A Soak. -2 MOT.', {'rarm': 5, 'larm': 5}, 10,
         effects=[('Kongo Gauntlets: -2 Motorics', [('system.cores.mot', -2)], 34)], note='Printed "5 A Soak"; recorded as 5 Soak on each arm.')],
  'Legs': [
   armor('Silkspeaker Legs', 34, 'Trousers worthy of a diplomatic representative of interstar unions.', 'R LEG 1; L LEG 1; +1 SPIT IN THE FACE OF GOD', {'rleg': 1, 'lleg': 1}, 1,
         effects=[('Silkspeaker Legs: +1 Spit In The Face Of God', [('system.skills.spitInTheFace', 1)], 34)]),
   armor('YEI Worker Bottoms', 34, 'Heavy duty working pants and boots for wading through dangerous Sidhi fallout.', '3 Soak for both Legs.', {'rleg': 3, 'lleg': 3}, 2),
   armor('VATAC Adamant Ballistic Greaves "Kongo"', 34, 'Distributed through VAJRA TACTICAL in Hingsajagra, the MORTAR standard issue Adamant Ballistic line has become the iconic military gear across the Trichiliocosm, particularly with heavy infantry, special operations, riot-control, and counter-revolution units. The newest and most widespread version of the MORTAR standard issue—the KONGO model—is known for its fearsome Wisdom King aesthetic, blending the "dharma protector" into the brutalist blackrock, ceramic, and heavensilk material.',
         '5 Legs soak; -1m/s movement.', {'rleg': 5, 'lleg': 5}, 5, effects=[('Kongo Greaves: -1 m/s movement', [('system.moveBonus', -1)], 35)])],
  ONE_SHOT: [
   armor('Baopu Adamant Full Body Suit', 122, 'Worn by HaeCo Sword and Gun Cultivators.', 'ALL PARTS 3 FLESH SOAK 2 DIRE SOAK', {p: 3 for p in PARTS}, note='Flesh/Dire Soak is not defined by the 2.1 damage rules; recorded as 3 Soak per Part.'),
   armor('TD-E21 Battlemage Raiments', 122, 'Worn by the Astrologian.', 'TORSO, HEAD, LIMBS: 1 FLESH SOAK 1 DIRE SOAK. While worn, can Counter when Casting Magick in Kill The Buddha. +2 Morale.', {p: 1 for p in PARTS}, morale=2,
         note='Flesh/Dire Soak is recorded as 1 Soak per Part.')]},
 'consumables-21': {
  'Elixirs': [consumable('ELIXIR Healing Pill', 31, 'Thaumaturgicals. Difficult to come by. Hoarded by Cultivators, who face violence on a daily basis. Extremely rare and with a supply controlled by professional Fangshi.', 'Consume to immediately heal 1 Damage.', 0.25, health=1)],
  'Fangshi Concoctions': [
   consumable('Healing Pill', 'Rules 2.1 (2.1 playtest Sects), p.147', 'Refined by a Fangshi with PILL REFINEMENT (Internal Elixir ✦; Project: Demand 2, Duration 1 day, Goal 8, Limit 4, in an alchemy laboratory or refinery).', 'When ingested, heal 2 Health from a damaged Part.', 0.01, health=2, tags=['Fangshi', 'Deluxe']),
   consumable('Antidote Pill', 'Rules 2.1 (2.1 playtest Sects), p.147', 'Refined by a Fangshi with PILL REFINEMENT (Internal Elixir ✦).', "When ingested, immediately removes an ongoing poison from one's system.", 0.01, note='Removing the poison is resolved by the table.', tags=['Fangshi', 'Deluxe']),
   consumable('Fulfilness Pill', 'Rules 2.1 (2.1 playtest Sects), p.147', 'Refined by a Fangshi with PILL REFINEMENT (Internal Elixir ✦).', 'When ingested, immediately removes the need for food for [INTERNAL ELIXIR] days.', 0.01, tags=['Fangshi', 'Deluxe']),
   consumable('Fireball Pill', 'Rules 2.1 (2.1 playtest Sects), p.147', 'Refined by a Fangshi with PILL REFINEMENT (Internal Elixir ✦).', 'Can be set on fire. It turns into a floating fireball that orbits the user for up to [INTERNAL ELIXIR] minutes.', 0.01, note='Printed as a second FULFILNESS PILL; named here by its effect. PILL BULLET can throw pills like a LAUNCHER.', tags=['Fangshi', 'Deluxe']),
   consumable('Chakra Elixir', 'Rules 2.1 (2.1 playtest Sects), p.148', 'Crafted by a Fangshi with ELIXIR CRAFTING (Internal Elixir ✦✦✦; Project: Demand 3, Duration 3 hours, Goal 12, Limit 6, at least 1,000mag and spirit herbs).', 'Ingesting this immediately restores 2 burnt Flame.', 0.5, ardor=2, tags=['Fangshi', 'Prestige']),
   consumable('Disguise Elixir', 'Rules 2.1 (2.1 playtest Sects), p.148', 'Crafted by a Fangshi with ELIXIR CRAFTING (Internal Elixir ✦✦✦).', "Ingesting this immediately changes one part about the ingester's face or voice. Someone who knows her before or is exceptionally observant can still see through it.", 0.5, tags=['Fangshi', 'Prestige']),
   consumable('Thunderbolt Elixir', 'Rules 2.1 (2.1 playtest Sects), p.148', 'Crafted by a Fangshi with ELIXIR CRAFTING (Internal Elixir ✦✦✦).', 'Ingesting this grants the user +1 WIT and +1 MOT for 24 hours. This effect does not stack. The ingester then suffers 3 piercing damage to the torso.', 0.5, note='The Core bonus and the damage are applied by the table.', tags=['Fangshi', 'Prestige']),
   consumable('Inferno Elixir', 'Rules 2.1 (2.1 playtest Sects), p.148', 'Crafted by a Fangshi with ELIXIR CRAFTING (Internal Elixir ✦✦✦).', 'After ingesting, for 3 hours, the drinker becomes immune to fire and can control and produce flame from her hands. This allows her to set people aflame as well as deal 2 piercing damage if she attacks with these flames that can be fired up to 10m from her.', 0.5, tags=['Fangshi', 'Prestige']),
   consumable('Five Dragons Pill', 'Rules 2.1 (2.1 playtest Sects), p.149', 'Crafted by a Fangshi with FIVE DRAGONS PILL (Internal Elixir ✦✦✦✦✦; Project: Demand 5, Duration 5 hours, Goal 12, Limit 6; needs a Dragon Tooth, Dragon Eye and Dragon Tongue and 10,000mag).', "The ingester takes 3 piercing damage to her Head. Then she can manipulate, control, and shape earth, fire, lightning or water within 20m that she can see. This cannot be larger than a waterfall nor a large 5 meter wide and 20 meter tall pillar. If used to attack, it deals [crafter's INTERNAL ELIXIR] piercing damage along with any other additional environmental effect.", 0.5, tags=['Fangshi', 'Prestige'])]},
 'accessories-21': {'Accessories': [armor('Clean Black Necktie', 35, 'A surprisingly spotless and clean necktie. Perhaps to remind you of who you are.', "REMINDS YOU YOU'RE A DETECTIVE. +2 MORALE.", {}, morale=2, kind='accessory'),
   armor('Puterijasa Featherstep Clogs', 35, 'A pair of clogs with intramaterial featherstepping Sidhi.', 'The wearer can jump up to double their movement speed and does not suffer fall damage. Also as long as she has 20kg or less in her carrying capacity, she is considered as being half her weight so she can walk upon treacherous or fragile surfaces.', {}, kind='accessory')]},
 'ammunition-21': {'Ammunition': [
   ammo('Quiver of Arrows', 8, 'arrow', 15, 'Bows require Arrows as ammunition (p.65). Discovery grants 2 quivers worth of 15 arrows (p.8).'),
   ammo('Quiver of Bolts', 8, 'bolt', 15, 'Crossbows require Bolts as ammunition (p.65). Discovery grants 2 quivers worth of 15 bolts (p.8).'),
   ammo('Handgun Magazine (Short Bullets)', 65, 'bullet', 12, 'Handguns need short bullets. Modern handguns work with 12 round magazines; revolvers count by the bullet.', note='MORTAR Parabellum 9mm prints 15 rounds; adjust the quantity for that pistol.'),
   ammo('Longgun Magazine (Long Gun Bullets)', 68, 'bullet', 30, 'Longguns need appropriate long gun bullets and often use magazines. Reloading replaces magazines. The TD-7 Ruyi holds 30 rounds.', note='The 2.0 ammo families group handgun and longgun bullets together as Gun.')]}}
LABELS = {'weapons-21': '2.1 Weapons', 'armor-21': '2.1 Armor', 'consumables-21': '2.1 Consumables', 'accessories-21': '2.1 Accessories', 'ammunition-21': '2.1 Ammunition'}
if __name__ == '__main__':
    for pack, groups in PACKS.items():
        folders, items = [], []
        for fi, (label, entries) in enumerate(groups.items()):
            f = {'_id': uid('folder', pack, label), 'name': label, 'folder': None, 'type': 'Item', 'sorting': 'a', 'sort': fi * 100000, 'color': None}
            folders.append(f)
            for e in entries:
                items.append({'_id': uid(pack, e['name']), **e, 'folder': f['_id'], 'flags': {'10kswordsfoundry': {'rules21': {'pack': pack}}}})
        assert len({i['_id'] for i in items}) == len(items)
        json.dump({'folders': folders, 'items': items}, open(f'{OUT}{pack}.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        print(pack, len(items), 'items in', len(folders), 'folders')
