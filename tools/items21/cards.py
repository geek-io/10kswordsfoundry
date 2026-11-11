# Read the item cards of the 2.1 player-facing book (market goods, weapon list, armor) with their fonts,
# so rules text (monospace) and flavor text (sans) can be told apart.
# Usage: python cards.py <pdf> <page> [<page> ...]  -> prints the cards as JSON (needs poppler's pdftohtml)
import sys, re, json, html, subprocess
RAR = r'(COMMON|UNCOMMON|ENHANCED|RARE|DELUXE|PRESTIGE)'
def cards(pdf, page):
    xml = subprocess.run(['pdftohtml', '-xml', '-i', '-f', str(page), '-l', str(page), '-stdout', pdf], capture_output=True, text=True).stdout
    fonts = {}
    for m in re.finditer(r'<fontspec id="(\d+)" size="(\d+)" family="([^"]+)"', xml):
        fam = m.group(3)
        kind = 'mono' if re.search('Mono|Consolas|Menlo', fam) else 'sans' if 'DMSans' in fam else 'serif' if 'Times' in fam else 'bant' if 'Bantayog' in fam else 'other'
        fonts[m.group(1)] = (kind, int(m.group(2)))
    texts = []
    for m in re.finditer(r'<text top="(-?\d+)" left="(-?\d+)" width="(-?\d+)" height="(\d+)" font="(\d+)">(.*?)</text>', xml, re.S):
        t = html.unescape(re.sub(r'<[^>]+>', '', m.group(6)))
        texts.append(dict(top=int(m.group(1)), left=int(m.group(2)), w=int(m.group(3)), kind=fonts[m.group(5)][0], size=fonts[m.group(5)][1], t=t))
    heads = [x for x in texts if re.match(RAR + r'\b', x['t'].strip()) and x['kind'] == 'mono' and x['size'] <= 11]
    out = []
    def card_left(h): return min(x['left'] for x in texts if abs(x['top'] - h['top']) <= 8 and h['left'] - 60 <= x['left'] <= h['left'])
    lefts = {id(h): card_left(h) for h in heads}
    starts = []
    for v in sorted(lefts.values()):
        if not starts or v - starts[-1] > 60: starts.append(v)
    for h in heads:
        left = lefts[id(h)]
        col = max(i for i, s0 in enumerate(starts) if left >= s0 - 5)
        right = starts[col + 1] - 6 if col + 1 < len(starts) else left + 320
        row = [x for x in texts if abs(x['top'] - h['top']) <= 8 and left - 2 <= x['left'] < right]
        below = [o for o in heads if o is not h and abs(lefts[id(o)] - left) < 40 and o['top'] > h['top']]
        bottom = min([o['top'] for o in below], default=10**6) - 8
        body = [x for x in texts if h['top'] + 8 < x['top'] < bottom and left - 6 <= x['left'] < right and x not in row]
        body.sort(key=lambda x: (round(x['top'] / 4), x['left']))
        rowt = ' '.join(x['t'].strip() for x in sorted(row, key=lambda x: x['left']))
        def lines(kind, big=True):
            ls, last = [], None
            for x in body:
                if x['kind'] != kind or (kind == 'mono' and x['size'] < 9): continue
                if last is not None and abs(x['top'] - last) <= 4: ls[-1] += x['t']
                else: ls.append(x['t'])
                last = x['top']
            return [re.sub(r'\s+', ' ', l).strip() for l in ls if l.strip()]
        def joined(ls):
            s = ''
            for l in ls:
                if s.endswith('-') and re.match(r'[a-z]', l) and not s.endswith(' -'): s = s[:-1] + l
                else: s = (s + ' ' + l) if s else l
            return s.strip()
        w = re.search(r'([\d.]+)\s*KG', rowt); p = re.search(r'([\d,]+)\s*(?:♄|MAG)?\s*$', rowt.replace('KG', ' ', 1) if False else rowt)
        cat = re.search(RAR + r'\s+(.+?)(?=\s+[\d,]+\s*(?:♄|MAG)?\s*$|$)', rowt)
        soak = [x['t'] for x in body if '⛨' in x['t'] or x['t'].strip() in ('—', '-')]
        out.append(dict(page=page, book=2 * page - 2 + (1 if left > 620 else 0), row=rowt, weight=float(w.group(1)) if w else None,
            rarity=cat.group(1).lower() if cat else '', category=cat.group(2).strip() if cat else '', price=p.group(1).replace(',', '') if p else '',
            name=joined(lines('serif')), mods=joined(lines('bant')), rules=joined(lines('mono')), flavor=joined(lines('sans')),
            soak=sum(t.count('⛨') for t in soak), left=left, top=h['top']))
    out.sort(key=lambda c: (c['left'] > 620, c['left'] // 150, c['top']))
    return out
if __name__ == '__main__':
    res = []
    for p in sys.argv[2:]: res += cards(sys.argv[1], int(p))
    json.dump(res, sys.stdout, indent=1, ensure_ascii=False)
