"""Bring the nine Class entries of data/options-21.json in line with the 2.1 rulebook (pp.44-48).
The rulebook prints a Supply line only for the Lumpenproletariat, and 160 x d6 starting Macca for the Petit Bourgeoisie.
Ids, names and the descriptive text are kept. Usage: python tools/options21/patch_rulebook_classes.py data/options-21.json"""
import json, re, sys
PATH = sys.argv[1]
# name: (rulebook page, starting Macca per d6, Supply line)
BOOK = {'Lumpenproletariat': (44, 1, 'One item, randomly rolled'), 'Semiproletariat': (45, 100, ''), 'Proletariat': (45, 20, ''), 'Petit Bourgeoisie': (46, 160, ''),
        'Spherical Bourgeoisie': (46, 200, ''), 'Comprador Bourgeois': (47, 300, ''), 'Bureaucrat Capitalists': (47, 500, ''), 'Landlord': (48, 800, ''), 'Heavenly Bourgeoisie': (48, 1000, '')}
RAW = open(PATH, encoding='utf-8', newline='').read()
TAIL = '\n' if RAW.endswith('\n') else ''
data = json.loads(RAW)
done = 0
for item in data['items']:
    flags = item.get('flags', {}).get('10kswordsfoundry', {}).get('class21')
    if not flags: continue
    page, mag, supply = BOOK[item['name']]
    flags['gear'], flags['magPerD6'] = supply, mag
    d = item['system']['description']
    d, n1 = re.subn(r'<li><strong>Gear:</strong>.*?</li>', f'<li><strong>Supply:</strong> {supply}</li>' if supply else '', d)
    d, n2 = re.subn(r'<li><strong>Starting ♄:</strong>.*?</li>', f'<li><strong>Starting ♄:</strong> {mag:,} × d6 mag</li>', d)
    d, n3 = re.subn(r'<p><em>Class is your relation.*?</em></p>', '<p><em>Class is your relation to the means of production — what you own, what you sell, and what owns you. It is not Alignment, and it is not a cage (2.1 rulebook p.44). '
                    'Perform the Sutras with Cultivator Discovery in the Actors tab, or drop the Class on a 2.1 character to record it and assign the Stars, Assets, Supply and starting ♄ by hand.</em></p>', d)
    assert (n1, n2, n3) in ((1, 1, 1), (0, 1, 1)), (item['name'], n1, n2, n3)
    item['system']['description'] = d
    item['system']['source'] = f'Rules 2.1 (2.1 rulebook), p.{page}'
    done += 1
assert done == 9, done
open(PATH, 'w', encoding='utf-8', newline='').write(json.dumps(data, ensure_ascii=False, indent=1) + TAIL)
print('patched', done, 'classes')
