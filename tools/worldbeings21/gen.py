"""Build data/worldbeings-21.json: the 2.1 World Being material of the player-facing book (187 PDF pages of spreads, 2026-11-11).
World Being Traits (3d6, book pp.295-296), Gambits (2d6, p.297), Templates (pp.298-299), and the Intercessor discovery tables
Inhabitants (d66, p.285) and Material (2d6, p.289). All content is transcribed from the book; nothing is invented.
Usage: python tools/worldbeings21/gen.py data/     (no PDF needed; the text is hand-entered below)"""
import hashlib, html, json, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else ''
uid = lambda *p: hashlib.sha1('|'.join(p).encode()).hexdigest()[:16]
esc = lambda t: html.escape(t, quote=False)
icon = lambda kind: f'systems/10kswordsfoundry/assets/icons/{kind}.svg'
src = lambda page: f'Rules 2.1 (2.1 player-facing book), p.{page}'

def folder(name, sort):
    return {'_id': uid('folder', 'worldbeings-21', name), 'name': name, 'folder': None, 'type': 'Item', 'sorting': 'm', 'sort': sort, 'color': None}

def item(name, desc, page, tags, kind, meta, fid, sort):
    return {'_id': uid('wb21', kind, name), 'name': name, 'type': 'trait', 'img': icon('trait'), 'effects': [], 'sort': sort,
            'system': {'description': desc, 'source': src(page), 'tags': ', '.join(['2.1', 'World Being', *tags]), 'level': 1, 'active': False},
            'folder': fid, 'flags': {'10kswordsfoundry': {'wb21': {'kind': kind, **meta}}}}

# ---------- World Being Traits (3d6; book pp.295-296) ----------
TRAITS = [
 (3,  'Dragon Eye', 'The WB has 4 Actions instead of 3. And their first Action becomes uninterruptible.'),
 (4,  'Deity', 'A deity of the Orbital Heaven Colonies from a tribe of humans that arrived before the humans we know. Lives off of bureaucracy and machinery that orders and terraforms Hingsajagra. Worship grants them Sidhi. Tend to be taller, immaculately beautiful. They have +5 Hale levels and have +2 to all Cultivations.'),
 (5,  'Chthonian', 'A deity of the Earthly Cities from a tribe of humans that arrived before the humans we know. Lives off of subordination to the Astrals, after the Heaven-Earth War established the ruling and ruled class. Imagine folk horror gods. They have +3 Hale levels and have +1 to all Cultivations.'),
 (6,  'Ghost', 'An informational echo given flesh by Esoteric Fluctuation. Is endlessly hungry and lost. A spirit. Can dissipate and take on a Subtle Body. Always has a craving that tethers their information to the present world.'),
 (7,  'Murderer', '+1 on all attacks against Bloody targets.'),
 (8,  'Rhetorician', '+2 to all straight argumentation.'),
 (9,  'Clever', '+1 to all attempts to gain advantage over someone through wit.'),
 (10, 'Hunter', '+1 ATK if the target is alone and has no adjacent allies.'),
 (11, 'Salt of the Earth', '+2 to all Checks to maintain integrity.'),
 (12, 'Mystical', '+1 max Flame.'),
 (13, 'Exdead', 'Corpses made to move again, animated by another force, an Antinomial phenomenon, or by leftover body information. +1 Damage from Holy weapons. Gain +1 max Health.'),
 (14, 'Demon', 'An Esoteric Fluctuation arising from an imbalance of forces, tainted or ruptured Sidhi flow, or through the intense passion of a cultivating sorceror. Immune to TRAUMA. +1 ATK. +1 ATK against Bloody targets.'),
 (15, 'Keen Mind', '+2 to all perception, sensation, and insight Checks.'),
 (16, 'Divine Fountain', 'In Violence, heal 1 after every Action taken. Declare a BANE for this Trait. When wounded by the Bane, lose the healing for a day.'),
 (17, 'Boss', 'This person holds a lot of power in a local place. He always comes around with at least 2 bodyguards.'),
 (18, 'Rage', 'Upon becoming Bloody, the World Being gains +1 Action per Round instead of 3 for the rest of the fight.'),
]

# ---------- Gambits (2d6; book p.297) ----------
GAMBITS = [
 (2,  'The World Being weeps a lost lover or lost ideal. This is a MIND vs RESOLVE attack against all hostiles in 20m. On-hit: inflict HESITANT.'),
 (3,  'The World Being is overcome with bloodlust. He beats on his heart and runs his full speed.'),
 (4,  'The World Being is afeared: she looks for the closest cover and hides behind it.'),
 (5,  'The World Being seizes someone. VIO Attack against a hostile in 1m. On-hit: target is Restrained as the World Being holds her down.'),
 (6,  'The World Being feints. Or if she has, she attempts a desperate attack.'),
 (7,  'The World Being retreats to her allies. Or if no allies, performs a desperate last resort attack.'),
 (8,  'The World Being attempts to parlay or negotiate with you.'),
 (9,  'The World Being asks for something. Something physical. Something they need, or are addicted to.'),
 (10, 'The World Being looks for a sign. Any sign. Or they start scrawling their own sign.'),
 (11, 'The World Being flees. There’s something she’s looking for.'),
 (12, 'The World Being starts spouting off batshit insane theory or ideas. Something is going on.'),
]

# ---------- Templates (book pp.298-299) ----------
# Each: name, blurb, list of (label, value) stat rows.
TEMPLATES = [
 ('Brigand / Bandit / Pirate', 'The kind of human that makes a living by wandering. Not too different from a Cultivator.',
  [('Health', '[-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '0'), ('Flame', '2'), ('MOV', '6'),
   ('Cores', 'VIO 4 · DIA 1 · GRC 3 · SAV 2 · WRD 2 · SPI 1'), ('R Hand', 'Rusty Saber (Saber)'), ('Fashion', 'Rogue Garb'),
   ('Trait', 'Hunter'), ('Items', '20 mag, 2 bullets, 10 arrows, 1 longbow (can swap to)')]),
 ('Soldier / Warden', 'A more trained protector than others. Often employed by corporations and other such guilds.',
  [('Health', '[-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '0'), ('Flame', '2'), ('MOV', '6'),
   ('Cores', 'VIO 4 · DIA 1 · GRC 3 · SAV 2 · WRD 1 · SPI 1'), ('R Hand', 'Foldable Sword (Sword)'), ('L Hand', 'LCP Pistol (Handgun)'),
   ('Fashion', 'Scrapper Guard'), ('Trait', 'Murderer, Hunter'), ('Items', '35 mag, comms piece to employer, family locket')]),
 ('Elite Guard', 'A private bodyguard for a VIP. Increasingly common as violence erupts across Hingsajagra and the Trichiliocosm.',
  [('Health', '[-0] [-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '1'), ('Flame', '3'), ('MOV', '6'),
   ('Cores', 'VIO 6 · DIA 1 · GRC 4 · SAV 3 · WRD 1 · SPI 1'), ('R Hand', 'Ravagemaul (Ferocious Bludgeon)'),
   ('L Hand', 'TMNI Longshield (Shield Bludgeon)'), ('Fashion', 'WUKONG Golden Chainmail Shirt'), ('Trait', 'Murderer, Hunter'),
   ('Items', '100 mag, PTM, Comms Piece, Keycard'), ('Microcosmic Orbit', '[Mock Heaven], [Great Sage Club]')]),
 ('Diplomat / Courtesan', 'A master of the science of words and beauty.',
  [('Health', '[-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '0'), ('Flame', '2'), ('MOV', '6'),
   ('Cores', 'VIO 1 · DIA 1 · GRC 4 · SAV 3 · WRD 4 · SPI 1'), ('R Hand', 'LCP Pistol (Gun)'),
   ('Fashion', 'HW Silver Tongue Diplomacy Suit'), ('Trait', 'Beautiful, Eminence'), ('Items', '100 mag, 20 bullet cartridge'),
   ('Microcosmic Orbit', 'Red Gun Focus, Devil Coin')]),
 ('Sorcerer / Battlemage', 'A master of the destructive arts.',
  [('Health', '[-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '0'), ('Flame', '2'), ('MOV', '6'),
   ('Cores', 'VIO 1 · DIA 5 · GRC 2 · SAV 2 · WRD 1 · SPI 4'), ('L+R Hand', 'N/A'), ('Fashion', 'Eschatonian Hermetic Robes'),
   ('Trait', 'Ascetic Meditation, Third Eye'), ('Items', '200 mag, Minor Cultivation Pill'), ('Microcosmic Orbit', 'Scathe, Scour')]),
 ('Alchemist / Doctor', 'A master of the sciences.',
  [('Health', '[-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '0'), ('Flame', '5'), ('MOV', '8'), ('Armor', '2'),
   ('Cores', 'VIO 1 · DIA 5 · GRC 2 · SAV 3 · WRD 1 · SPI 6'), ('R Hand', 'Jian (Sword)'), ('Fashion', 'AWW “GENJI” Heavensilk Raiments'),
   ('Trait', 'Clean Meridian Channels, Mystical'), ('Items', '100 mag, 20 bullet cartridge'),
   ('Microcosmic Orbit', 'Sidhi Bullet, Sidhi Barrier, Balm, Succor')]),
 ('Beast', 'Terrible and fearsome animals. Crocodiles, tigers, lions, bears, and so on.',
  [('Health', '[-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '0'), ('Health (total)', '6'), ('Flame', '2'), ('MOV', '6'),
   ('Cores', 'VIO ✦✦✦✦✦✦ · DIA ✦ · GRC ✦✦✦ · SAV ✦✦ · WRD ✦✦ · SPI ✦'), ('Trait', 'Claws (+1 Empty Hand ATK, CUTS), Rage')]),
 ('Goblin', 'Freaky malevolent spirits of all kinds. Pestilences, poltergeists, low demons, and so on.',
  [('Health', '[-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '0'), ('Flame', '3'), ('MOV', '6'),
   ('Cores', 'VIO ✦✦ · DIA ✦ · GRC ✦✦✦ · SAV ✦✦✦✦ · WRD ✦✦ · SPI ✦'), ('R+L Hand', 'Fey Fists (Keen Empty Hand, +2 ATK)'),
   ('Trait', 'Hunter, Murderer, Demon, Rage, Mystical'),
   ('Microcosmic Orbit — Goblin Magicks',
    'JAUNT [✹][✦] Teleport 10m. · BEFRAZZLE [✹][✦] SAV vs SPI Magick Attack in 10m. Inflicts TRAUMA and CONFUSION. · '
    'PORTAL [✹✹][✦] Rip open a space within 3m, create another rip within 20m of that rip. This is an open portal that up to 5 '
    'entities can move through, appearing on the other spatial rip. After the fifth entity, the portal closes.')]),
 ('Earthly Dragon or Devil', 'A powerful entity of almost myth. Those worshipped as physical gods. But often not as powerful. They have a modicum of Cultivation.',
  [('Health', '[-0] [-0] [-0] [-0] [-0] [-0] [-1] [-1] [-3] [KO]'), ('Sidhi', '3'), ('Flame', '6'), ('MOV', '6 (Flight)'),
   ('Cores', 'VIO ✦✦✦✦✦ · DIA ✦✦ · GRC ✦✦✦✦✦ · SAV ✦✦✦ · WRD ✦✦✦ · SPI ✦✦✦✦✦✦'),
   ('L+R Hand', 'Numen Claws (+3 ATK, Occult Empty Hand)'),
   ('Trait', 'Carapace (+3 innate Armor), Adamance, Mystical, Rage, Dragon Eye, Chthonian, Divine Fountain'),
   ('Licenses', 'Chthonian Seraph Body, Asuri’s Wrath, Scathe, Vajra Strike, Vajra Guard, Dread Devil Cutter'),
   ('Microcosmic Orbit', 'Chthonian Seraph Body, Asuri’s Wrath, Scathe, Vajra Strike')]),
]

# ---------- Inhabitants (d66; book p.285) ----------
INHABITANTS = [
 ('11', 'Adventuring Party', 'Cobbled together. People from the imperial countries—Ressen-Nalenji, Soreh, and Amatsu. Looking for their shot at fortune.'),
 ('12', 'Cultists', 'Those following a local god, deity, devil, machine mind, immortal, alien, or something stranger. Will give their life up for their local god. Will try to convert you into their Cult first. Surprisingly well-adjusted without the cowls.'),
 ('13', 'Angels', 'Entities bound to serve a god, a deity, or an immortal up in heaven. Forced to do their dirty work. Usually has a large hierarchy; the angels of each god or immortal are constructed differently.'),
 ('14', 'Elementals', 'Spirits that manifest through one of the many elements of the Trichiliocosm. Fire, water, earth, air, lightning, ice, quintessence, space, time, and mind.'),
 ('15', 'Demons', 'Malevolent spirits blessed with the ability to scour and possess, to physically maim and endanger. Often loves spreading torment and pain to others. Despite this, they do possess sentience and can reason; they are just predisposed to be seized by wrathful feelings.'),
 ('16', 'Gods', 'More powerful entities that can grant favors and power. Possessed with far greater physical prowess and natural Sidhi control.'),
 ('21', 'Divine Beasts', 'Animals that have lived for so long due to some twist of Sidhi or Esoteric Anomaly (usually 100 years) that they have begun to cultivate their own Cultivation Womb and have learned how to speak and talk. Greater Divine Beasts are common hunting targets for Cultivators for Divine Beast Cores, which are great items for Cultivation.'),
 ('22', 'Witches', 'The ability to wield the natural world into an instrument of will is the precursor to Cultivation. These witches are Cultivators of dangerous arts—specifically of the dark science, engaging in occult ritual and theory to change the world.'),
 ('23', 'Martial Artists', 'Not yet supernatural, these are just people that have an appreciation, love, or lifelong experience in practicing the sweet science of martial combat.'),
 ('24', 'Supernatural Martial Artists', 'Martial Artists with knowledge of Esoteric Technicks. Commonly knowing Technicks and Magicks that already exist within the Sects.'),
 ('25', 'Sorcerers', 'More powerful Magick Cultivators that practice deeper and more dangerous sorceries. Vast rituals that require large stores of Sidhi to perform and cast. Often heralded by various ritual instruments, chantries, and loci made to be used for ritual purposes.'),
 ('26', 'Alchemists', 'The practitioners of the natural sciences. Heralded by cauldrons and furnaces. Alchemists transmute the finer and subtler essences of nature.'),
 ('31', 'Chemists', "As opposed to the alchemists' more inframaterial practices, chemists deal strictly with the harder sciences and the physical sciences rather than the dark and akashic sciences. Of course, all physical sciences eventually lead into Sidhi, so even Chemists are particularly well-learned about the intricacies of the Esoteric."),
 ('32', 'Medical Professionals', 'Nurses, doctors, and other medics that help suture and heal.'),
 ('33', 'Devils', 'Sentient beings that live as superhuman antitribe against the Deities that mostly live in Orbital Heaven. They are similar in power to the Deities, just with less access to Cultivation due to their forced subterranean living.'),
 ('34', 'Fishfolk', "Fishmen and fishwomen. Said to have been some sort of experiment by some South Sea God. Many can live normal lives, but just as many are easily susceptible to the South Sea God's Call."),
 ('35', 'Beastfolk', 'Humanoid animals. Unlike Divine Beasts (who can look like Beastfolk), the majority of Beastfolk are ancient experiments by old Immortals. One of these Immortals is Mentra, the Mad Moon Mystic and the Immortal of Sorcery. As varied as they are unique.'),
 ('36', 'Spirits', 'Esoteric aggregations. This is the most catch-all term for them, meaning this entry can include gods, demons, angels, ghosts, and so on.'),
 ('41', 'Ghosts', 'Psychic echoes of the dead. Haunting the living and the places they used to go to. Predisposed to violence due to their confusion and their need to be heard.'),
 ('42', 'Wizards', 'It is rare to find a group of wizards. In truth, many wizards are just immortals in another name, or cultivators. Wizards in the northwest do tend to have a more Magick bent than in Shen or Selorong, but otherwise wizard is a moniker for accomplished magick cultivators.'),
 ('43', 'Goblins', 'Spirits of mischief and mayhem. Wield weapons and love fighting—death to them is fine as long as it’s from something “fun”.'),
 ('44', 'Fair Folk', 'Fairies, elves, sidhe, and other strange creatures of the night. Most common in the Northwest Utter Islands.'),
 ('45', 'Bidaree', 'Celestial avian spirit singers of the many heavens. Similar to angels, but are not beholden to a single god, immortal, or pantheon. They tend to the banquet halls of the heavens equally. Possessed of immense beauty.'),
 ('46', 'Yakka', 'Earth guardians that were once ogres with long tusks and bulging eyes; they have since become powerful protectors of the Great Law and the Enlightenment Code, dedicated to the Buddhas.'),
 ('51', 'Dakini', 'Skydancers who are often in voluptuous womanly form, they are manifestations of violent Enlightenment. Many of those with sufficient Wisdom can see their true nature—those that do not give in to lust.'),
 ('52', 'Monks', 'Ascetics who commit to a religious life. Most probably have some level of Cultivation. Most common in the mountains.'),
 ('53', 'Raxaxa', 'Malevolent giants that feast upon the bodies and blood of gods. They are insatiable human eaters, cannibals, and shapeshifters. Eolomists believe they are the bodies of humans possessed by demons.'),
 ('54', 'Asura', 'Wrathful god-fiends that ally with the Devils time and time again to strike down those in heaven. The gods want nothing but a chance at eternal life and immortality.'),
 ('55', 'Cultivators', 'Would-be Cultivators that also want a shot at transcension. They travel down a similar path and thus want similar things.'),
 ('56', 'Item Spirits', 'Spirits that arise from items that have existed for long times. Sometimes known as tsukumogami. These items develop consciousnesses and eventually the ability for locomotion through Will.'),
 ('61', 'Manikins', 'Robots or machines or even paper dolls that have been magicked to life. Do not have a Soul yet—moved to motion by some inextricable force of magick or esoterica.'),
 ('62', 'Yenjanists', 'Followers of Yenja. Committed to the tenets of Yenja, but might be a tad bit too zealous.'),
 ('63', 'Eolomists', 'Followers of Eolo. Committed to the tenets of Eolo, but might be a tad bit too zealous.'),
 ('64', 'Siddha', 'Those that have great magical accomplishment. A kind of Cultivator that follows the Infinite Code or the Revolutionary Law or the Enlightenment Logic.'),
 ('65', 'Immortals', 'Beings that have transcended into at least the Third Realm—the Formless Realm. They are so called Immortals because they will live for long periods of time, not because they are impervious to wound and damage. These Immortals possess great wells of power and technick and magick that they have cultivated over years. Perhaps even centuries. Many others call these wizards and mahasiddha.'),
 ('66', 'Dialectics', 'Roll twice and fuse the two together. Perhaps they live together in harmony or in a tense contradictory conflict.'),
]

# ---------- Material (2d6; book p.289) ----------
MATERIAL = [
 (2,  'Raw Resources or Services', 'Wood, stone, ore, iron. Or even a Place of Power, Hotsprings, Lifesprings (which, when rested in, grants +1 Health healed) and so on.'),
 (3,  'Food', 'Either natural or fabricated. From cup noodles to premium steak.'),
 (4,  'Medical Kits or Medicine', 'Can be used to quicken healing or heal +1 Level during a Rest.'),
 (5,  'Miscellany', "Cigarettes, washing boards, toys, electronic devices, earphones, and so on. Something you'd find in a convenience store."),
 (6,  'Repair Kits', 'Kits for repairing and maintaining weapons, items, and armor.'),
 (7,  'Ammo', 'Ammunition for weapons.'),
 (8,  'Cultivation Seed', 'A pill infused with Cultivation Sidhi. Grants 1 XP when consumed.'),
 (9,  'Magicite', 'Perhaps a vein of un-graded Magicite. Can be graded to ensure exchange value.'),
 (10, 'Manual', 'A manuscript or manual for learning how to perform a Magick or Technick.'),
 (11, 'Panoply', 'A weapon or armor.'),
 (12, 'Spiritual Treasures', 'Some sort of weapon, fashion, elixir, or pill.'),
]


def build():
    folders, items = [], []
    f_tr = folder('Traits (3d6)', 0); folders.append(f_tr)
    f_ga = folder('Gambits (2d6)', 100000); folders.append(f_ga)
    f_tp = folder('Templates', 200000); folders.append(f_tp)
    f_dt = folder('Discovery Tables', 300000); folders.append(f_dt)

    for i, (roll, name, text) in enumerate(TRAITS):
        desc = f'<p><strong>World Being Trait · roll 3d6: {roll}</strong></p><p>{esc(text)}</p>'
        items.append(item(name, desc, 295 if roll <= 16 else 296, ['Trait', f'3d6 {roll}'], 'trait', {'roll': roll}, f_tr['_id'], i * 1000))

    for i, (roll, text) in enumerate(GAMBITS):
        desc = f'<p><strong>Gambit · roll 2d6: {roll}</strong></p><p>{esc(text)}</p><p><em>An innate telegraph: a Cultivator with free Actions can respond to it. Most World Beings have d3 Gambits.</em></p>'
        items.append(item(f'Gambit {roll}', desc, 297, ['Gambit', f'2d6 {roll}'], 'gambit', {'roll': roll}, f_ga['_id'], i * 1000))

    for i, (name, blurb, rows) in enumerate(TEMPLATES):
        stat = ''.join(f'<li><strong>{esc(k)}:</strong> {esc(v)}</li>' for k, v in rows)
        desc = f'<p><em>{esc(blurb)}</em></p><ul>{stat}</ul><p><em>A Template — a common kind of entity, not a specific person or beast. Build the actual World Being from it with the World Being creation tool.</em></p>'
        items.append(item(name, desc, 298, ['Template'], 'template', {}, f_tp['_id'], i * 1000))

    inhab = ''.join(f'<tr><td>{c}</td><td><strong>{esc(n)}</strong>. {esc(t)}</td></tr>' for c, n, t in INHABITANTS)
    inhab_desc = ('<p><strong>Inhabitants · roll d66</strong></p><p>The kind of entities and people one can find in a particular locale.</p>'
                  f'<table><tr><th>d66</th><th>Inhabitants</th></tr>{inhab}</table>')
    items.append(item('Inhabitants (d66)', inhab_desc, 285, ['Discovery', 'd66'], 'table', {'table': 'd66'}, f_dt['_id'], 0))

    mat = ''.join(f'<tr><td>{r}</td><td><strong>{esc(n)}</strong>. {esc(t)}</td></tr>' for r, n, t in MATERIAL)
    mat_desc = ('<p><strong>Material · roll 2d6</strong></p><p>What materials or resources can be found in a particular place. '
                'You can roll this up to two, three, even four times to populate a place with multiple things.</p>'
                f'<table><tr><th>2d6</th><th>Material</th></tr>{mat}</table>')
    items.append(item('Material (2d6)', mat_desc, 289, ['Discovery', '2d6'], 'table', {'table': '2d6'}, f_dt['_id'], 100000))

    assert len({i['_id'] for i in items}) == len(items), 'duplicate id'
    json.dump({'folders': folders, 'items': items}, open(f'{OUT}worldbeings-21.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(f'worldbeings-21: {len(items)} items in {len(folders)} folders '
          f'({len(TRAITS)} traits, {len(GAMBITS)} gambits, {len(TEMPLATES)} templates, {len(INHABITANTS)} inhabitants, {len(MATERIAL)} material)')


if __name__ == '__main__':
    build()
