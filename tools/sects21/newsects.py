#!/usr/bin/env python3
# Injects the two New_Sects.pdf Sects (Bidadari / Sound Law; Sapphire Star / Dual
# Cultivation) into the committed 2.1 catalogs. Idempotent: it strips any prior
# copy of these two Sects AND the old Sapphire Star preview before re-adding, so it
# can be re-run safely. Mirrors tools/sects21/gen.py's item schema and uid() scheme.
# The sect build intermediates (raw.json/parsed.json) are not in the repo, so these
# two Sects live here rather than in gen.py's main-book pipeline.
# Source: New_Sects.pdf (2.1 player-facing book): Bidadari pp.230-233; Sapphire Star pp.270-273.
import json, hashlib, html, os, sys

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
DATA = os.path.join(ROOT, 'data')
uid = lambda *p: hashlib.sha1('|'.join(p).encode()).hexdigest()[:16]
esc = lambda t: html.escape(t, quote=False)
def stars(n): return '✦' * n
SRC = '2.1 player-facing book'
# Full 2.1 weapon-mod key set (scripts/rules21.mjs WEAPON_MODS_21). gen.py predates the
# worn/almighty/thundering/toxic additions; this injector carries the current set and
# normalises every weapon to it (below), so all weapons match the live data model.
WMODS = ['auto','crushing','great','colossal','doublehand','focus','blaze','artifact','smashing','piercing','lacerating','precise','shock','worn','concealable','holy','noetic','ritual','almighty','thundering','toxic']
PART_KEYS = ['rleg','lleg','rarm','larm','torso','head']
LABEL = {'rleg':'Right Leg','lleg':'Left Leg','rarm':'Right Arm','larm':'Left Arm','torso':'Torso','head':'Head'}
PROFILE_RANGE = {'dagger':1,'saber':1,'sword':1,'whip':3,'bludgeon':1,'cleaver':1,'polearm':3,'launcher':20,'bow':250,'crossbow':125,'handgun':30,'longgun':400}

# Sect -> esoteric cultivation (skill/road name). Mirrors build.py SECT_CULT.
NEW_CULT = {'Bidadari': 'Sound Law', 'Sapphire Star': 'Dual Cultivation'}
# License keyword as printed in the book (shown on each ability's "License" line).
LICENSE_WORD = {'Bidadari': 'Sound Law', 'Sapphire Star': 'Dual'}

def folder(name, parent, sort, pack='sects21'):
    return {'_id': uid('folder', pack, name, parent or ''), 'name': name, 'folder': parent, 'type': 'Item', 'sorting': 'm', 'sort': sort, 'color': None}

# ---- ability records: (title, stars, needs, page, flavor, effect, kind, magick) ----
# kind: 'technique' or 'magick'. magick: None, or dict(mantra, mudra, core, skill, potency, castTime)
def A(title, st, needs, page, flavor, effect, kind='technique', magick=None):
    return dict(title=title, stars=st, needs=needs, page=page, flavor=flavor, effect=effect, kind=kind, magick=magick)

BIDADARI = [
 A('Orchestral Revival Technique', 1, '❂', 231,
   'What the dead have sung they will sing again. In the Kingdom of Heaven they will remember my name. It is yet part of the training of Bidadari to memorize long concert pieces to be able to reproduce them with their own flourishes. Something soundstone recordings could never recreate.',
   'While installed, perfectly preserve the words, music, and visible movements of one performance that the Cultivator personally witnesses, up to 1 hour long. She can also use this to preserve her own performance. After an hour or until the Cultivator chooses, she must uninstall. Doing so banks it in her Music Bank, which can store up to [SOUND LAW] performances. Replace one when the limit is exceeded. When reproducing a preserved performance, the cultivator may manifest its original voices and instrumental sounds through her own voice. This reproduces what she heard, including errors and lies. It grants no understanding of unknown languages and carries no recorded supernatural effects.'),
 A('Sound Bubble Echo Technique', 2, '❂', 231,
   "Condense the Sidhic frequency of a sound into an echo, formed into a bubble. A favorite of some Sphere Aristocrats, when they wish to transfer the sound of their pet bidadari's performance across their 8 roofed pagodas.",
   'Perform a song up to 3 minutes long and then install the Flame: the last 3 minutes are immediately recorded into a floating sound bubble, 1m tall and 1m wide. It floats at a rate of 5m/s. By uninstalling or when it suffers damage, the bubble pops and it plays the entire recording. Should the Cultivator wish, she can intensify the echoing bubble pop by burning the Flame when it would be uninstalled to immediately deal 1 damage to all Parts and KNOCKBACK up to [FAC]m.'),
 A('Steel Song Meditation', 1, '❂', 231,
   'All Bidadari must learn how to wield their voice to speak the immortal language of the universe—tremendous, autophagous violence.',
   'While installed, the Cultivator may use FAC + SOUND LAW for all KILL THE BUDDHA attempts. As she does, she performs throughout the KILL THE BUDDHA. She gains the following Maneuvers: ✦ Beat ◆: [FAC] damage to random Part within 10m. ✦ Flutter ◆: Upon sound waves, float [SOUND LAW] meters in any direction. ✦ Resonate ★: [FAC-1] damage to all hostiles in a 2m radius of you.'),
 A('Celestial Road Meter', 3, '✹; STEEL SONG MEDITATION; an instrument in one hand', 231,
   'The Bidadari must make sure that her song is not a song of the self but the song of the people.',
   "While she's in a KILL THE BUDDHA while using STEEL SONG MEDITATION, she can burn the Flame to generate a ◆ to perform the following: ✦ Marching Beat ◆ Up to [FAC] allies within 10m may move up to [FAC] meters for free. ✦ Hastening Song ◆ Up to [FAC] allies within 10m gain +[SOUND LAW] Speed for 6 seconds."),
 A('Battle Beat Resonance', 3, '✹; STEEL SONG MEDITATION; an instrument in one hand', 231,
   "The Bidadari must then guide their allies to a victory they never thought they'd be able to attain.",
   "While she's in a KILL THE BUDDHA while using STEEL SONG MEDITATION, she can burn the Flame to generate a ★ to perform the following: ✦ War Drum ★: Grant all allies within a [FAC] meter radius an immediate ◆ that they must use immediately. ✦ Sonorous Reckoning ★: Grant one ally within [FAC] meters a single ⬢. Sonorous Reckoning can only be used once per KILL THE BUDDHA."),
 A('Singing Soul Method', 2, '✹', 232,
   'The teardrop known as the music note is known to be a potent way to stir conviction.',
   "When the Cultivator CHANGES GOD MIND through music or instrument, she can activate this to make the Check with [FAC + SOUND LAW]. She can also use this when attempting to apply Social Defense. If this is in an attempt to Inflame, the check gains +1."),
 A('High Melody', 2, '✹', 232,
   "It is the song that replenishes the mental integrity of all lifeforms, whether they be sapient or not. Perhaps the most popular of the bidadari's technicks, a Shennin capitalist was said to have been so addicted to the tune that he captured as many bidadari to keep it playing in a secret chasm behind his fifth mansion.",
   'Perform for up to 5 minutes, and then all within 30m that can hear and understand heal 1 Morale. If they have an Attachment to music, they heal 2 Morale.'),
 A('Let Sorrow Name the Moons', 3, '✹✹', 232,
   'Let the pale blue light be loss. Let the crimson moon be memory. What is holier than thee, o mighty stars? O, what if not mine own heart, keening thunderclap, listening o\'er the dawn for a love unbidden, unbowed, and unreceived? A love lost exceedeth the sacredness of a love found.',
   "The Cultivator immediately instills an emotion of painful loss and sorrow to all equal or lower Sidhi entities of the Cultivator's choice within 10m of her. The emotion is Firm and lasts for [SOUND LAW] days. This emotion affects their ability to commit violence, inflicting -1 to all their KILL THE BUDDHA Checks."),
 A('Miraculous Song of the Multitude', 3, '✹✹', 232,
   '"The mob is no beast to be cowed, but a truth of ten thousand private souls, dreaming of a better life." — Apsaran Bidadari Verdigris Sun Xu Daqi, who led the local Risakans of the Charnel Isles to reject the settler colony of Ressen–Nalenji upon their island.',
   "The Cultivator performs at least 3 minutes before a Mob and makes one Inflame against it, rolling FAC + SOUND LAW as the CHANGE GOD'S MIND Check. The Mob Size penalty is reduced by 2. On a success, the emotion evolves into a refrain: for an hour afterwards, it spreads without a new check to anyone who joins the Mob, up to one size larger than the Mob originally addressed. Each listener still decides how the emotion manifests."),
 A('High Pacification', 3, '✹✹✹', 232,
   'A bidadari is often needed to pacify fears and hatreds. Some leathered aristocrats preferred to employ bidadari much like how one would employ opium.',
   "The Cultivator unleashes a lilting, withering tune. All those that hear it within 10m must make a Demand [SOUND LAW] HRT + STILLNESS Check to stay awake. On a success, they instead feel off-balanced for the whole turn. On a failure, they fall asleep until they're awoken—every 3 seconds that pass, they have a [PHYS]-in-6 chance of waking up."),
 A('Akashic Resonant Note', 3, '✹✹', 232,
   'In the old Sphere-courts, a song is a message, a cry out against heaven. The INTRAJALA becomes an avenue for communication.',
   "The Cultivator performs a single song into the INTRAJALA and uploads it to any INTRAJALA hosting site. She binds a CHANGE GOD'S MIND attempt to it like a WRITTEN SOCIAL ENGINEERING attempt, with +2 dice and without needing to specify a target. Those that attempt to defend against it may use CYBERNETIC HARUSPEX instead of just STILLNESS to resist. The broadcast is logged by DEVRENDRA, and the Intercessor may treat it as a trace to the origin Terminal. The singer may not know she is being traced."),
 A('Mountain Breaking Thunder', 5, '✹✹✹; voice or instrument; ●', 233,
   'Despite not being combatants, Bidadari have cultivated many technicks that allow them to crush their enemies and to strengthen themselves. Ever since the first Bidadari, Apsara Witraghni, was slain by a traveling death-monk, they have more and more oriented their technicks to a dual-effect philosophy.',
   'The Cultivator unleashes an ultimate shockwave of sonic sidhi, washing across a 10m radius from her. All those she scorns are damaged equal to [FAC + 2] piercing damage. All those she treasures are healed 3 HP to all Parts and 3 Morale. Those that hold a positive Firm Attachment to her also heal 1 burnt Flame. All those that can hear the sound made are immediately inflamed with a Held Emotion of her choice.'),
]

SAPPHIRE = [
 A('Silkworm Burrows the Heart', 1, '✹', 271,
   "Turns the Cultivator's voice into an exceedingly magnetic force. The Sapphire Star teaches that the ultimate violence is the violence that ends itself. And to do that is to focus on the social relations.",
   "When the Cultivator uses her voice and appeal to emotion to convince or strengthen an Attachment in someone, she may activate this to also implant an emotion of calm, peace, or trust (choose 1) toward her and immediately use it as leverage for the CHANGE GOD'S MIND attempt."),
 A('Unraveling Silks Method', 1, '❂', 271,
   'The Silkworm saith thus: "No soul is sundered from its fellow, distance is nothing but a promise of reconciliation. Read the seams between."',
   'While installed, the Cultivator sees sapphire soul threads joining every entity within sight: she knows a single Attachment one has to another. This just shows whether the Attachment exists, not its strength nor its context. Gleaning Attachments by using this grants +2d to the Check. Any entity with at least ✦✦✦ SUSURRATION can sense the gaze.'),
 A('Twin Lotus Technique', 1, "❂ + target's ❂", 271,
   "The Cultivator pours her Dual Sidhi into another and they strengthen each other. The Sapphire Star's signature technique, to support another is to support the world. The founder of the Sapphire Star cultivated this Technick out of regret for not saving his lovely paramour.",
   "The Cultivator chooses one other person within 30m. As long as they're within 30m of each other and their Flames' are installed, they strengthen one another: they can use each other's Cores or Cultivation for Checks and weapon damage. This cannot be used to Dual Cultivate with more than one other person. At any point, the Cultivator and the target may, in tandem, burn the installed Flame to teleport next to each other (they choose which to teleport to) or to swap their places immediately."),
 A('Two Hands One Seal', 2, '✹', 271,
   'A technick to pool together the fulminating charges of two sorcerers. Condensed from a long line of union ritual. As with any Dual technick, it often leads to either fire or fallout for either of the practitioners.',
   'When the cultivator performs a Magick, she may burn this to perform half the Mudras and have another person that she can hold hands with to perform the other half. Both perform the casting check (even if they do not have the Cultivation) and all Charges generated by both casters are pooled together toward the casting of the chosen Magick.'),
 A('Silk Moth Flutters Her Wings', 1, '❂', 271,
   'Allows the Cultivator to focus her mind and exude a presence of bladed emotion. Should violence be inevitable, even the diplomat must know how to wield her words like fanged razors.',
   "While installed, the Cultivator gains +1 to all attemptes to pacify violence. If she succeds in doing so, she implants an emotion of calm and forces the listeners to lower their weapons. While installed, she may use her presence to KILL THE BUDDHA: she may check FAC + DUAL. She cannot deal damage: instead she can PLEAD: Lower the target's Morale by her FAC."),
 A('Phoenix First Impression', 2, '❂', 271,
   "Sapphire Star holds thusly that the first impression will last longer than an entity's actual memory of you. The Cultivator pulls on a thread that has not been made yet. Sapphire Stars love teaching this first—and often, most stop at this as well. A shame.",
   "When the Cultivator speaks with an entity that holds no Attachment toward her, she may activate this immediately. For 30 minutes, the target gains a faint, memoryless sense that he's known her all his life. Additionally, that person's starting Disposition cannot be lower than Neutral toward the cultivator. When the Cultivator takes an act of violence, theft, or deceit against him however, the Flame is burned and the target gains a Negative Held Attachment toward her."),
 A('Self-Tying Knot', 2, '✹', 272,
   'Summons a blue star thread to bind around a word. Sapphire Stars have long needed to reckon with deception and its existence. To burrowed in obfusciation realm of words is to walk around with a noose around one\'s neck. The vaunted Sapphire Star Juxian wielded this to great degree: when the King of Unsanji, a hyperfeudal Sphere in the Outer Sectors found out about this, they created a miniature God Gate to separate her head from the rest of her corpus.',
   'After someone speaks, burn the Flame. A Sapphire Knot pulls out a particular word from that person\'s throat, as demanded by the Cultivator. After a moment, the Sapphire Knot binds around it: if it constricts the word, then that word has a deception. If it loosens, the word is sincere. This tests sincerity, not objective truth.'),
 A('Almony Across the Heavens', 2, '❂', 272,
   'Sidhi extrudes from the cultivator, binding around those that can see or hear her, and makes her be understood. What is a diplomat that cannot connect? The purpose of thy power is to bind with a knot of camaraderie and rancor.',
   "While installed, anyone who sees the cultivator's deliberate gestures or hears her voice understands the meaning that she meant to communicate, and she can likewise understand statements deliberately addressed to her. Her CHANGE GOD'S MIND gains +1d. This removes the +3 dice Social Defense for gestural social engineering as well. This does not work for writing and it cannot compel attention supernaturally."),
 A("Nightingale's Sorrowful Eyes", 3, '✹', 272,
   'The fluctuating Sidhi becomes a point of deduction. The afeared technick of the silkmoths of Sapphire Star, for to know a single secret is to know every secret.',
   'Strengthen a GLEAN attempt: activate this to immediately learn an Attachment that the target is actively attempting to hide, and then gain +1 dice to the Check. This cannot be used if the target is not actively hiding an Attachment.'),
 A('Sapphire Silk Lattice', 3, '❂❂', 272,
   "A magick that burgeons from the cultivator's heart, creating a lattice of peace and neutrality. Used often for parleys, ancient armies made sure they had a Sapphire Star for parleying in the battlefield. Nowadays, corporations and Sects have them for ensuring no brawl breaks out amidst neutral grounds.",
   'A 10m radius of sapphire lattice forms around the caster for as long as the Flame is installed. Before an entity of equal or lower Sidhi inside it may commit violence, it must pass HRT + STILLNESS vs Demand [DUAL CULTIVATION]. On a failure it cannot commit that violence and any more violence this Turn and loses 1 Morale. It can choose to lose 2 Morale to attack anyway. If the Cultivator harms anyone inside, or is Disabled, the lattice dissolves.',
   'magick', dict(mantra='LU KA SHIN SU', mudra='Lotus → Stillness → Wisdom', core='voc', skill='Dual Cultivation', potency=8, castTime='')),
 A('Twin Headed Butterfly Technique', 4, '❂❂❂', 272,
   'Among the Sapphire it is doctrine that: "a power kept by one hand is a power half used." More powerful Sapphire Stars are careful to use this technick—it has led to many instances of betrayal and broken hearts.',
   'Touch skin to skin with someone and install the Flame. The Cultivator can "lend" one of her Licenses with them to use. This cannot be as Gear License. The one using it must install ❂ to keep it as well. If either Cultivator uninstalls the Flame, they lose the License. Lending a License renders the Dual Cultivator unable to use that License, and she cannot have another Cultivator with this technick to "lend" it back to her.'),
 A('Butterfly Eyes Discipline', 4, '❂/❂❂/❂❂❂', 272,
   'The Silkworm teaches that for a diplomat to be true she must first learn to lie to herself.',
   "For every Installed Flame, the Cultivator may craft a fake Held/Firm/Heart Attachment. It can be read like a real Attachment but any attempts to CHANGE GOD'S MIND with it confers no advantage nor leverage."),
 A('Two Cinnabar Fields Union', 4, '❂❂❂', 273,
   'The Silkworm saith thus: this rite is neither a shameful act nor a sacred one. It is a labor of labor all the same, as simple and as true as a human\'s ability to grasp, grasp, grasp…',
   "DEMAND 2 | DURATION 1 hour | GOAL 3 | LIMIT 3 | CHECK: HRT + DUAL CULTIVATION. Partners are assistants and add their Strikes. Requires the free and willing consent of every participant. Up to [DUAL CULTIVATION] partners may join, as long as they have a positive attachment to the cultivator. The rite may be a union of bodies, or an hour of shared breath between those who love one another. The Sect teaches that the former is only the oldest method. Success: Each participant recovers 2 burnt Flame and Morale and each learns the other's most defining Heart Attachment. Neither may conceal it, which has ended more than one seduction in the spy's disfavor. Failure: The threads tangle, and each loses 1 Morale. A participant benefits from the ritual only once per week. (Sex is a Content Warning of this game. Fade to black, or cross it out.)"),
 A("On Earth We're Briefly Gorgeous", 5, '✹✹✹', 273,
   'The Silkworm saith thus: "To be known is to be bruised, like fruit. To be understood is the same thing as being ruined. To say I love you is to say you love me. There is no such thing as loneliness: even time alone time spent with the world."',
   "Upon casting, for an hour, the Cultivator knows the full context of all Held and Firm Attachments and current Disposition from someone she's known for at least three days. If the caster is in Samadhi or enters Samadhi during the hour, she gleans all that person's Heart Attachments as well. Entities two higher Sidhi Stages cannot be read. Those of equal or one Stage higher may attempt to resist with an opposed HRT + STILLNESS vs the caster's FAC + DUAL CULTIVATION.",
   'magick', dict(mantra='A SAN KA NA SIN TA', mudra='Heaven → Noose → Wisdom → Stillness → Lotus', core='voc', skill='Dual Cultivation', potency=18, castTime='')),
]

def build_sect(sect, abilities, si):
    cult = NEW_CULT[sect]; lic_word = LICENSE_WORD[sect]
    top = folder(sect, None, si * 100000); folders = [top]
    used = sorted({a['stars'] for a in abilities}); sub = {}
    for n in used:
        f = folder(f"{cult} {stars(n)}", top['_id'], n * 100000); folders.append(f); sub[n] = f['_id']
    items = []
    for order, a in enumerate(abilities):
        needs = a['needs']; burn, inst = needs.count('✹'), needs.count('❂')
        weapon = needs.split(';', 1)[1].strip() if ';' in needs else ''
        lic = f"{lic_word} {stars(a['stars'])}".strip()
        desc = (f"<p><em>{esc(a['flavor'])}</em></p>" if a['flavor'] else '') + f"<p><strong>License:</strong> {esc(lic)}</p>" + \
               f"<p><strong>Needs:</strong> {esc(needs or '—')}</p><p>{esc(a['effect'])}</p>"
        sys = {'description': desc, 'source': f"Rules 2.1 ({SRC}), p.{a['page']}",
               'tags': ', '.join(x for x in [sect, cult, stars(a['stars']), 'Magick' if a['kind'] == 'magick' else 'Technick', weapon] if x),
               'sect': sect, 'rank': '', 'sidhi': 0, 'apCost': 0, 'burnArdor': burn, 'installArdor': inst, 'equipped': False}
        if a['kind'] == 'magick':
            m = a['magick']
            sys.update({'mantra': m['mantra'], 'mudra': m['mudra'], 'mudraHands': 1, 'attackPool': 'spi', 'defensePool': 'grc',
                        'r21': {'potency': m['potency'], 'castTime': m['castTime'], 'core': m['core'], 'skill': m['skill'], 'bonus': 0}})
        items.append({'_id': uid('sect21', sect, a['title']), 'name': a['title'], 'type': a['kind'],
            'img': f"systems/10kswordsfoundry/assets/icons/{'magick' if a['kind'] == 'magick' else 'technique'}.svg",
            'system': sys, 'folder': sub[a['stars']], 'sort': order * 1000, 'effects': [],
            'flags': {'10kswordsfoundry': {'sect21': {'sourcePage': a['page'], 'cultivation': cult, 'stars': a['stars'], 'needs': needs, 'weaponRequirement': weapon, 'license': lic_word}}}})
    return folders, items

# ---- Sect Gear ----
def gear_folders(sect, kinds, si):
    top = folder(sect, None, si * 100000, 'gear21'); out = [top]; ids = {}
    for k, label in [('weapon', 'Weapons'), ('fashion', 'Armor & Fashion'), ('accessory', 'Accessories')]:
        if k in kinds:
            f = folder(label, top['_id'], len(ids) * 100000, 'gear21'); out.append(f); ids[k] = f['_id']
    return out, ids

def weapon_item(sect, cult, name, stars_n, lic_word, weight, profile, grip, material, mods, set_mods, flavor, lic_text, body, folder_id, sort, page):
    lic = f"{lic_word} {stars(stars_n)}"
    stat = f"{sect} Prestige {profile.title()} · {weight} kg · Price N/A · {grip.title()} / {profile.title()} · {material}"
    mods_str = ' ✦ '.join(mods)
    desc = (f"<p><em>{esc(flavor)}</em></p>") + f"<p><strong>License:</strong> {esc(lic)} — {esc(lic_text)}</p><p><strong>{esc(stat)}</strong></p>" + \
           (f"<p><strong>Mods:</strong> {esc(mods_str)}</p>" if mods_str else '') + f"<p>{esc(body)}</p>"
    ranged = profile in ('launcher','bow','crossbow','handgun','longgun')
    base = {'description': desc, 'source': f"Rules 2.1 ({SRC}), p.{page}", 'rarity': 'prestige', 'quantity': 1, 'slots': 1, 'magCost': 0, 'equipped': False,
            'tags': ', '.join([sect, cult, 'Prestige', 'Weapon'] + mods),
            'gearSlot': 'carry', 'weaponType': 'ranged' if ranged else 'melee', 'range': PROFILE_RANGE[profile], 'damageType': 'impact' if profile == 'bludgeon' else 'cut',
            'r21': {'profile': profile, 'grip': grip, 'damage': 2, 'damageBonus': 0, 'range': 0, 'rate': 1, 'capacity': 0, 'ferocious': 0, 'shield': 0,
                    'mods': {k: k in set_mods for k in WMODS}, 'weight': weight}}
    return {'_id': uid('gear21', name), 'name': name, 'type': 'weapon', 'img': 'systems/10kswordsfoundry/assets/icons/weapon.svg', 'system': base,
            'folder': folder_id, 'sort': sort, 'effects': [],
            'flags': {'10kswordsfoundry': {'sect21': {'sourcePage': page, 'cultivation': cult, 'license': lic, 'printedMods': mods, 'sect': sect}}}}

def fashion_item(sect, cult, name, stars_n, lic_word, weight, category, coverage, flavor, lic_text, body, note, folder_id, sort, page):
    lic = f"{lic_word} {stars(stars_n)}"
    stat = f"{category} · {weight} kg · Price N/A"
    cov = ', '.join(f"{LABEL[p]} {coverage[p]}" for p in PART_KEYS if coverage.get(p))
    desc = (f"<p><em>{esc(flavor)}</em></p>") + f"<p><strong>License:</strong> {esc(lic)} — {esc(lic_text)}</p><p><strong>{esc(stat)}</strong></p>" + \
           (f"<p><strong>Soak:</strong> {esc(cov)}</p>" if cov else '') + f"<p>{esc(body)}</p>" + (f"<p><em>Catalog note: {esc(note)}</em></p>" if note else '')
    base = {'description': desc, 'source': f"Rules 2.1 ({SRC}), p.{page}", 'rarity': 'prestige', 'quantity': 1, 'slots': 1, 'magCost': 0, 'equipped': False,
            'tags': ', '.join([sect, cult, 'Prestige', 'Fashion']),
            'gearSlot': 'fashion', 'r21': {'coverage': {p: coverage.get(p, 0) for p in PART_KEYS}, 'morale': 0, 'weight': weight}, 'armor': 0, 'ardor': 0}
    return {'_id': uid('gear21', name), 'name': name, 'type': 'fashion', 'img': 'systems/10kswordsfoundry/assets/icons/fashion.svg', 'system': base,
            'folder': folder_id, 'sort': sort, 'effects': [],
            'flags': {'10kswordsfoundry': {'sect21': {'sourcePage': page, 'cultivation': cult, 'license': lic, 'printedMods': [], 'sect': sect}}}}

# ---- barang ----
def barang_item(sect, name, cult, weapons, flavor, cultivation_text, page, sort, folder_id):
    desc = (f'<p><em>{esc(flavor)}</em></p><p><strong>Sect:</strong> {esc(sect)} · <strong>Esoteric Cultivation:</strong> {esc(cult)}</p><p>{esc(cultivation_text)}</p>'
            '<p>Ingesting a Barang awakens the first stage of Sidhi Cultivation and lets the Cultivator learn the Sect\'s Esoteric Techniques. '
            'At Wanderer Discovery, ingest one Sect\'s Barang, gain its Cultivation at ✦✦ and learn 2 Licenses you qualify for. '
            'Ejecting a Barang keeps every Magick and Technick already Cultivated. A new Sect License needs the appropriate Barang to be ingested (2.1 Alpha pp.5, 50–51).</p>')
    return {'_id': uid('barang21', sect), 'name': name, 'type': 'barang', 'img': 'systems/10kswordsfoundry/assets/icons/barang.svg', 'folder': folder_id, 'sort': sort, 'effects': [],
            'system': {'description': desc, 'source': f'Rules 2.1 ({SRC}), p.{page}', 'tags': f'2.1, Barang, {sect}', 'sect': sect, 'cultivation': cult, 'weapons': weapons, 'ingested': False},
            'flags': {'10kswordsfoundry': {'barang21': {'sect': sect, 'sourcePage': page}}}}

def load(name): return json.load(open(os.path.join(DATA, f'{name}.json')))
def save(name, obj): json.dump(obj, open(os.path.join(DATA, f'{name}.json'), 'w'), indent=1, ensure_ascii=False)

NEW_SECTS = set(NEW_CULT)

def strip_prior(cat, sect_field='sect', is_sects=False):
    """Remove any prior New-sects content and the old Sapphire Star preview so re-runs are clean."""
    def keep_item(it):
        s21 = it.get('flags', {}).get('10kswordsfoundry', {}).get('sect21', {})
        if s21.get('preview'): return False
        sct = it.get('system', {}).get('sect') or s21.get('sect')
        return sct not in NEW_SECTS
    cat['items'] = [i for i in cat['items'] if keep_item(i)]
    # folders: drop top-level folders named for the new sects (and their descendants), plus the preview folder
    drop_ids = {f['_id'] for f in cat['folders'] if (not f['folder']) and f['name'] in NEW_SECTS}
    changed = True
    while changed:
        changed = False
        for f in cat['folders']:
            if f['folder'] in drop_ids and f['_id'] not in drop_ids:
                drop_ids.add(f['_id']); changed = True
    cat['folders'] = [f for f in cat['folders'] if f['_id'] not in drop_ids]

def main():
    sects = load('sects-21'); gear = load('sect-gear-21'); barang = load('barang-21')
    strip_prior(sects); strip_prior(gear)
    barang['items'] = [b for b in barang['items'] if b['system']['sect'] not in NEW_SECTS]

    # Sects: append Bidadari (si=16) and Sapphire Star (si=17)
    for si, (sect, ab) in enumerate([('Bidadari', BIDADARI), ('Sapphire Star', SAPPHIRE)], start=16):
        fo, it = build_sect(sect, ab, si); sects['folders'] += fo; sects['items'] += it

    # Bidadari gear: Apsara's Flowing Hagoromo (fashion), Benzaiten's Drum (weapon)
    bf, bk = gear_folders('Bidadari', {'weapon', 'fashion'}, 16); gear['folders'] += bf
    gear['items'].append(fashion_item('Bidadari', 'Sound Law', "Apsara's Flowing Hagoromo", 4, 'Sound Law', 1.5,
        'Bidadari Prestige Fashion', {},
        'Fighting ribbons wielded by apsara, celestial cultivators that sing and dance across rivers and lakes. Apsara was in truth the previous epithet for the Sect, until the Bidadari Merodee seized the Sect Master title and named it after her title, right before the Sect was ultimately liquidated by CAISHEN & CO and was turned into a way to create Martial Art–Singer Pop Idols.',
        "Gain the License to ask for and wield the APSARA'S FLOWING HAGOROMO Arm piece.",
        "Jade Meditation: While worn, may install ❂ to make the wearer impossible to ignore up to 30m of her. Those that try to ignore her must win an opposed HRT + STILLNESS vs the wearer's FAC + SOUND LAW. Iron Silk Sleeves: The sleeves can extend and can be used like [WORN][REACH][LYRICAL] Whips and have a DR of 20. They can be stiffened to be used like shields or as ways to push one's self up higher. They are also prehensile enough to be used like Empty Hand, allowing for precise control and grappling and binding.",
        'An arm piece worn as Fashion; the printed statblock lists no Soak value.', bk['fashion'], 0, 233))
    gear['items'].append(weapon_item('Bidadari', 'Sound Law', "Benzaiten's Drum", 5, 'Sound Law', 1.5, 'bludgeon', 'haft', 'Godskin',
        ['ARTIFACT', 'THUNDERING', 'PIERCING', 'LYRICAL'], ['artifact', 'thundering', 'piercing'],
        'Named after a god of music, love, and water. Sometimes known too as Saraswati\'s Drum. For all intents and purposes a tambourine. It is the iconic weapon of the Bidadari. Though its most common form is a drum, Bidadari Master Relka Rensangan officially mandated on 11647r that the Benzaiten Drum must be woven into any shape chosen by the licensee.',
        'Gain the License to ask for and wield the BENZAITEN DRUM weapon.',
        "Fanged Resonance: Benzaiten's Drum has a range of 12m. It attacks by sending sonic waves in the direction of the target. All damage dealt by Benzaiten's Drum also deals KNOCKBACKS the target and all within 1m by 1m back. Crescendo: During a KILL THE BUDDHA, as long as the wielder performed at least one ★, they can burn ✹✹ to immediately gain a ●. Impassioned Encore: At the end of a KILL THE BUDDHA with this weapon, the Cultivator may burn 1 ✹ to immediately do the following: for every 2 Maneuvers spent during that KILL THE BUDDHA, the Cultivator is impassioned and gains +1d on her or any of her allies' next KILL THE BUDDHA.",
        bk['weapon'], 0, 233))

    # Sapphire Star gear: Plenipotentiary's Sapphire Vestments (fashion/armor)
    sf, sk = gear_folders('Sapphire Star', {'fashion'}, 17); gear['folders'] += sf
    gear['items'].append(fashion_item('Sapphire Star', 'Dual Cultivation', "Plenipotentiary's Sapphire Vestments", 5, 'Dual', 2,
        'Sapphire Star Prestige Torso/Arms', {'torso': 1, 'rarm': 1, 'larm': 1},
        'Iridescent neotraditional clothings that emit a low haze or mist of calming Sidhi. Invisible but to the keenest of Sidhic senses, it shapes the longing and yearning of those around it.',
        "Gain access to wield the Armor PLENIPOTENTIARY'S SAPPHIRE VESTMENTS.",
        "Diplomatic Immunity: The first time someone commits violence to the wearer and they don't know the wearer, they must succeed on a Demand [DUAL CULTIVATION] HRT + STILLNESS Check. If they fail, they lose that action as anomalous intramaterial mist infilitrates and flash-edits their emotional state. Celestial Courtesan Perfume: Install ❂ to release a subtle perfume within 3m. Gain +1 die to CHANGE GOD'S MIND to Inflame attraction, longing, or affectionate warmth in someone who can smell it. The target retains the normal choice of how the emotion manifests. The perfume supplies no Attachment leverage, changes no Disposition automatically, and provides no bonus against someone unable to smell it. The Shennin Prince Xinzhi outlawed its use within the empire after falling in love with an alchemist-courtesan that loved to use it. That ban has since been revoked, allowing the Sapphire Stars to flourish across the heavens. The emotional haze the armor emits is special and only works once on any sentient being due to the emotional haze leaving behind its own antibodies within that entity's unconscious.",
        'Printed under a ZHONGKUI statblock tag — a book layout error; this is a Sapphire Star / Dual Cultivation item. Printed Soak is shown as a shield icon on Torso and both Arms (no number); read here as 1 Soak each — confirm at the table.',
        sk['fashion'], 0, 273))

    # Barang (2), appended to the existing Sect Barang folder
    bfolder = barang['folders'][0]['_id']; base_sort = (len(barang['items'])) * 1000
    barang['items'].append(barang_item('Bidadari', 'Golden Dawn Cricket', 'Sound Law', 'Instruments, singing, performance',
        "Their Barang is the Golden Dawn Cricket, a beautiful singing cricket that's always humming some kind of tune. When ingested, it twists the spiritual tendons like the string-wires of a piano.",
        'SOUND LAW is an esoteric Sidhi road that lets the Bidadari wire their Microcosmic Orbit to the invisible strands of the celestial chorus. It can be used for any instrument, singing, or performance based Check.',
        230, base_sort, bfolder))
    barang['items'].append(barang_item('Sapphire Star', 'Sapphire Silkworm', 'Dual Cultivation', 'Social Checks, Gleaning, Change God\'s Mind',
        'Their Barang is the Sapphire Silkworm, a walking silkworm that bundles together sapphire threads that interpenetrate all entities, the network of Sidhic connections.',
        "DUAL CULTIVATION can be used whenever the Sapphire Star would attempt any Social Check, including GLEANING and CHANGE GOD'S MIND. The Heavenly Ascendance Bureau licenses its envoys as mediators across the Trichiliocosm.",
        270, base_sort + 1000, bfolder))

    # Normalise every weapon's mods to the current 21-key model (gen.py predates
    # worn/almighty/thundering/toxic). Preserve set booleans; fill missing keys from printedMods.
    for it in gear['items']:
        if it['type'] == 'weapon':
            cur = it['system']['r21']['mods']; printed = it['flags']['10kswordsfoundry']['sect21'].get('printedMods', [])
            it['system']['r21']['mods'] = {k: cur.get(k, k.upper() in printed) for k in WMODS}

    save('sects-21', sects); save('sect-gear-21', gear); save('barang-21', barang)
    nmag = sum(1 for i in sects['items'] if i['type'] == 'magick')
    print(f"sects-21: {len(sects['items'])} items ({nmag} magicks), {len(sects['folders'])} folders")
    print(f"sect-gear-21: {len(gear['items'])} items, {len(gear['folders'])} folders")
    print(f"barang-21: {len(barang['items'])} items")
    # integrity
    for cat in (sects, gear):
        ids = [d['_id'] for d in cat['folders'] + cat['items']]
        assert len(ids) == len(set(ids)), 'duplicate id'
        for it in cat['items']:
            assert any(f['_id'] == it['folder'] for f in cat['folders']), f"orphan {it['name']}"
    print('integrity OK')

if __name__ == '__main__':
    main()
