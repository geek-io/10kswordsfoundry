"""Rebuild Sect catalogs from the user's Rules 2.0.3 PDF (PyMuPDF required).

Use the book's title fonts to delimit cards, not blank lines or page tiers.
Printed ranks are authoritative even when a card appears on another rank's page.
"""
from pathlib import Path
import argparse, collections, hashlib, html, json, re
import pymupdf

parser = argparse.ArgumentParser()
parser.add_argument('--pdf', default='C:/Users/drago/Downloads/10,000 SWORDS AGAINST HEAVEN 2.0.3 (1).pdf')
args = parser.parse_args()
pdf = pymupdf.open(args.pdf)
sects = ['Asuri', 'Aswang', 'Eschatonian', 'Fangshi', 'Houyi', 'Immanent', 'Jyotisha', 'Katalonan', 'Mendicant', 'Nezha', 'Sword Dialectician', 'Techgnostic', 'Ultramystic', 'Wukong', 'Zhongkui']
records = []
for index, sect in enumerate(sects):
    for page in range(127 + index*4, 130 + index*4):
        chunks, current, previous_header = [], [], False
        for block in pdf[page-1].get_text('dict')['blocks']:
            for line in block.get('lines', []):
                spans = line['spans']
                text = ''.join(s['text'] for s in spans).strip()
                if not text or all('Bantayog' in s['font'] and s['size'] > 12 for s in spans):
                    continue
                title = ''.join(s['text'] for s in spans if 'Maragsa' in s['font']).strip()
                header = bool(title)
                if header and not previous_header and current:
                    chunks.append(current)
                    current = []
                current.append({'text': text, 'title': title, 'fonts': [s['font'] for s in spans]})
                previous_header = header
        if current:
            chunks.append(current)
        for chunk in chunks:
            text = '\n'.join(line['text'] for line in chunk)
            matches = list(re.finditer(r'LICENSE\s+(NOVICE|EXPERT|MASTER)', text))
            if not matches:
                continue
            assert len(matches) == 1, (page, text)
            title = ' '.join(line['title'] for line in chunk if line['title'] and len(line['title']) > 1)
            kind = re.search(r'\b(Technick|Magick|GEAR)\b', text, re.I)
            assert kind, (page, title)
            records.append({'page': page, 'sect': sect, 'title': title, 'kind': kind[1].lower(), 'rank': matches[0][1].lower(), 'lines': chunk})
assert len(records) == 156, len(records)
Path('tmp').mkdir(exist_ok=True)
Path('tmp/sect-records.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')

def ident(value):
    return hashlib.sha256(value.encode()).hexdigest()[:16]

def paragraph(lines):
    # Keep printed hyphens; remove only layout whitespace.
    return re.sub(r'\s+', ' ', re.sub(r'-\s*\n\s*', '-', '\n'.join(lines))).strip()

def p(text):
    return '<p>' + html.escape(text, quote=False) + '</p>'

packs = {name: {'folders': [], 'items': []} for name in ['sect-licenses', 'sect-technicks', 'sect-magicks']}
audit = []
seen = collections.Counter()
for record in records:
    page, sect, rank, kind = (record[k] for k in ['page', 'sect', 'rank', 'kind'])
    name = record['title'].title().replace('ʼS', 'ʼs').replace('’S', '’s').replace("'S", "'s")
    lines = [line['text'] for line in record['lines']]
    license_index = next(i for i, line in enumerate(lines) if re.search(r'\bLICENSE\b', line))
    prereq_index = next(i for i in range(license_index, len(lines)) if 'PREREQUISITES' in lines[i])
    requirement_lines = [lines[prereq_index].split('PREREQUISITES', 1)[1].strip()]
    end = prereq_index + 1
    while end < len(lines):
        line = lines[end]
        if re.match(r'^(?:MANTRA|ANTRA|MUDRA)\b', line, re.I) or not re.fullmatch(r'[A-Z0-9\s,.:;’ʼ\-–&/()]+', line):
            break
        requirement_lines.append(line)
        end += 1
    requirements = paragraph(requirement_lines)
    prerequisites = {key.lower(): int(value) for key, value in re.findall(r'\b(VIO|DIA|GRC|SAV|WRD|SPI|SIDHI)\s+(\d+)', requirements)}
    body_lines = lines[end:]
    # A square starts the separate physical Gear stat block, not license text.
    if '◼' in body_lines:
        body_lines = body_lines[:body_lines.index('◼')]
    # Initial card flavor text precedes its license table.
    flavor = [line['text'] for line in record['lines'][:license_index] if not line['title'] and not re.fullmatch(r'Technick|Magick|Gear', line['text'], re.I)]
    notes = []
    if page == 176 and name == 'Lance Of Revolutionary Will':
        notes.append('Printed as a Technick, although its text grants a Gear license; retained as printed pending clarification.')
    if page == 185 and name == 'Demon Subjugating Sword' and any('FIVE THUNDER JAPAMALA' in line for line in body_lines):
        name = 'Five Thunder Japamala'
        notes.append('The printed heading repeats Demon Subjugating Sword; this license is named for the Five Thunder Japamala explicitly granted in its text (p.185).')
    key = f'{sect}/{name}'
    seen[key] += 1
    assert seen[key] == 1, key
    license_id = ident('sect-license/' + key)
    ability_pack = {'technick': 'sect-technicks', 'magick': 'sect-magicks'}.get(kind)
    ability_id = ident('sect-ability/' + key) if ability_pack else None
    license_uuid = f'Compendium.10kswordsfoundry.sect-licenses.Item.{license_id}'
    ability_uuid = f'Compendium.10kswordsfoundry.{ability_pack}.Item.{ability_id}' if ability_id else None
    body = paragraph(body_lines)
    description = ''.join(p(value) for value in [paragraph(flavor), body] if value)
    prerequisites_html = p('Prerequisites: ' + requirements)
    metadata = {'sourcePage': page, 'rank': rank, 'licenseUuid': license_uuid, 'abilityUuid': ability_uuid, 'printedType': kind, 'prerequisiteText': requirements}
    source = f'Rules 2.0.3, p.{page}'
    def add(pack, item):
        root_id, folder_id = ident(pack + '/' + sect), ident(pack + '/' + sect + '/' + rank)
        for folder in [dict(_id=root_id, name=sect, folder=None), dict(_id=folder_id, name=rank.title(), folder=root_id)]:
            if not any(f['_id'] == folder['_id'] for f in packs[pack]['folders']):
                packs[pack]['folders'].append({**folder, 'type': 'Item', 'sorting': 'm' if folder['folder'] is None else 'a', 'sort': ['novice','expert','master'].index(rank)*100000 if folder['folder'] else 0, 'color': None})
        item.update(folder=folder_id, effects=[], flags={'10kswordsfoundry': {'sectCatalog': metadata}})
        packs[pack]['items'].append(item)
    add('sect-licenses', {'_id': license_id, 'name': name, 'type': 'license', 'img': 'systems/10kswordsfoundry/assets/icons/license.svg', 'system': {'description': prerequisites_html + description + (p(f'Granted ability: @UUID[{ability_uuid}]{{{name}}}') if ability_uuid else ''), 'source': source, 'tags': f'{sect}, {rank.title()}, {kind.title()}, License', 'sect': sect, 'rank': rank, 'prerequisites': prerequisites, 'meridianCost': 0 if kind == 'gear' else 1}})
    if ability_pack:
        # Explicit opening cost blocks are the activation costs. Later costs describe
        # optional/conditional actions, so never silently sum all glyphs in a card.
        spell_fields = {}
        activation_lines = list(body_lines)
        while activation_lines:
            field_match = re.match(r'^(M?ANTRA|MUDRA)\s*:?\s*(.*)', activation_lines[0], re.I)
            if not field_match:
                break
            field = 'mudra' if field_match[1].upper() == 'MUDRA' else 'mantra'
            value = field_match[2]
            activation_lines.pop(0)
            while re.search(r'(?:→|->)\s*$', value) and activation_lines:
                value += ' ' + activation_lines.pop(0)
            spell_fields[field] = value.strip()
        cost_body = paragraph(activation_lines)
        cost_match = re.match(r'^((?:\[[^\]]+\]\s*)+)', cost_body)
        costs = cost_match[1] if cost_match else ''
        variable = bool(re.search(r'\.\.\.|…', costs))
        if variable:
            notes.append('Variable Ardor cost: choose and spend the amount described in the ability; the fixed cost field is zero.')
        system = {'description': prerequisites_html + description + p(f'License: @UUID[{license_uuid}]{{{name}}}'), 'source': source, 'tags': f'{sect}, {rank.title()}, {kind.title()}', 'sect': sect, 'rank': rank, 'sidhi': prerequisites.get('sidhi', 0), 'apCost': costs.count('✦'), 'burnArdor': 0 if variable else costs.count('✹'), 'installArdor': 0 if variable else costs.count('❂'), 'equipped': False}
        if not costs and any(symbol in body for symbol in '✹❂✦'):
            notes.append('Conditional or prose costs remain in the description; check the trigger and spend resources as described.')
        if kind == 'magick':
            system.update(spell_fields)
            two_handed = r'\b(Crane|Ego-Cutting|Heat|Intent|Lotus|Man|Noose|Earth|Heaven|Shield|Stillness|Violence|Wave|Wheel)\b'
            system['mudraHands'] = 2 if re.search(two_handed, system.get('mudra', ''), re.I) else 1
            # Only populate explicit opposed cultivation rolls, leaving other
            # unusual attack mechanics in the complete description.
            opposed = re.search(r'\b(VIO|DIA|GRC|SAV|WRD|SPI)(?:\s*\+\s*\d+)?\s+(?:vs\.?|versus)\s+(VIO|DIA|GRC|SAV|WRD|SPI)\b', body, re.I)
            if opposed:
                system.update(attackPool=opposed[1].lower(), defensePool=opposed[2].lower())
                bonus = re.search(r'\+\s*(\d+)', opposed[0]) or re.search(r'\+(\d+)\s*ATK\b', body)
                if bonus:
                    system['bonus'] = int(bonus[1])
            damage = re.search(r'\b(CUTS?|IMPACTS?|BURNS|TRAUMA(?:TIZES)?|RUINATIONS?)\b', cost_body)
            if damage:
                system['damageType'] = next(t for t in ['cut','impact','burn','trauma','ruination'] if damage[1].lower().startswith(t))
            area = re.search(r'\b(\d+)m (burst|blast cone)\b', cost_body, re.I)
            if area:
                system.update(areaShape='cone' if area[2].lower() == 'blast cone' else 'circle', areaSize=int(area[1]))
        add(ability_pack, {'_id': ability_id, 'name': name, 'type': 'technique' if kind == 'technick' else 'magick', 'img': f'systems/10kswordsfoundry/assets/icons/{"technique" if kind == "technick" else "magick"}.svg', 'system': system})
    if notes:
        metadata['notes'] = notes
        for pack in packs.values():
            for item in pack['items'][-1:]:
                if item['flags']['10kswordsfoundry']['sectCatalog'] is metadata:
                    item['system']['description'] += '<h3>Import Notes</h3>' + ''.join(p(note) for note in notes)
    audit.append({'name': name, 'sect': sect, 'page': page, 'rank': rank, 'kind': kind, 'prerequisites': requirements, 'notes': notes})

for name, catalog in packs.items():
    Path(f'data/{name}.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(f'{name}: {len(catalog["items"])} items, {len(catalog["folders"])} folders')
Path('tmp/sect-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

# Reapply reviewed action mappings after regenerating source descriptions.
import runpy
runpy.run_path(str(Path(__file__).with_name("technick-abilities.py")),run_name="__main__")
