# Read the ASSETS chapter of the 2.1 player-facing book (PDF pages 95-99, book pp.188-197) as text blocks,
# and group them into Assets: d36 code, name, Star range and paragraphs. Needs poppler's pdftotext.
import subprocess, re, html
STAR = re.compile(r'^(✦+)\s*[-–]\s*(✦+)$|^(✦+)$')
def page_blocks(pdf, page):
    x = subprocess.run(['pdftotext', '-bbox-layout', '-f', str(page), '-l', str(page), pdf, '-'], capture_output=True, text=True, check=True).stdout
    out = []
    for m in re.finditer(r'<block xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</block>', x, re.S):
        lines = [' '.join(html.unescape(w) for w in re.findall(r'<word[^>]*>(.*?)</word>', l)) for l in re.findall(r'<line[^>]*>(.*?)</line>', m.group(5), re.S)]
        out.append({'x': float(m.group(1)), 'y': float(m.group(2)), 'x2': float(m.group(3)), 'y2': float(m.group(4)), 'lines': lines})
    return out
def assets(pdf, pages=range(95, 100), columns=(33, 219, 453, 638)):
    found, order = {}, []
    last = None
    for page in pages:
        blocks = page_blocks(pdf, page)
        col = lambda b: max(i for i, c in enumerate(columns) if b['x'] >= c - 25) if b['x'] >= columns[0] - 25 else 0
        for c in range(len(columns)):
            items = sorted([b for b in blocks if col(b) == c and b['y'] < 560], key=lambda b: (b['y'], b['x']))
            # split blocks that glue a Star range and a name together
            flat = []
            for b in items:
                for i, line in enumerate(b['lines']):
                    flat.append({'x': b['x'], 'y': b['y'] + i * (b['y2'] - b['y']) / max(1, len(b['lines'])), 'text': line.strip(), 'block': id(b), 'first': i == 0})
            codes = [f for f in flat if re.fullmatch(r'[1-6] ?[1-6]', f['text'])]
            heads = []
            for code in codes:
                near = [f for f in flat if abs(f['y'] - code['y']) < 40 and f is not code]
                name = [f for f in near if re.fullmatch(r"[A-Z][A-Z \-'’]{2,}", f['text'])]
                star = [f for f in near if STAR.match(f['text'].replace(' ', '').replace('-', '-')) or STAR.match(f['text'])]
                assert name, (page, code['text'])
                nm = min(name, key=lambda f: abs(f['y'] - code['y']))
                st = min(star, key=lambda f: abs(f['y'] - code['y'])) if star else None
                top = min(f['y'] for f in [code, nm] + ([st] if st else []))
                heads.append({'code': code['text'].replace(' ', ''), 'name': nm['text'], 'stars': st['text'] if st else '', 'top': top, 'skip': {id(code), id(nm), id(st)}, 'page': page})
            heads.sort(key=lambda h: h['top'])
            skip = set().union(*[h['skip'] for h in heads]) if heads else set()
            for b in items:
                lines = b['lines']
                fl = [f for f in flat if f['block'] == id(b)]
                keep = [f['text'] for f in fl if id(f) not in skip]
                if not keep: continue
                owner = None
                for h in heads:
                    if b['y'] >= h['top'] - 2: owner = h
                key = owner['code'] if owner else last
                if key is None: continue
                if owner and key not in found:
                    found[key] = {'code': key, 'name': owner['name'], 'stars': owner['stars'], 'page': owner['page'], 'book': 2 * owner['page'] - 2 + (1 if c >= 2 else 0), 'blocks': []}; order.append(key)
                found[key]['blocks'].append(keep)
            for h in heads:
                if h['code'] not in found:
                    found[h['code']] = {'code': h['code'], 'name': h['name'], 'stars': h['stars'], 'page': h['page'], 'book': 2 * h['page'] - 2 + (1 if c >= 2 else 0), 'blocks': []}; order.append(h['code'])
            if heads: last = heads[-1]['code']
    return [found[k] for k in order]
if __name__ == '__main__':
    import sys
    for a in assets(sys.argv[1]):
        print(a['code'], a['name'], '|', a['stars'], '| p.', a['book'], '| blocks', len(a['blocks']), '|', (a['blocks'][0][0] if a['blocks'] else '')[:50], '…', (a['blocks'][-1][-1] if a['blocks'] else '')[-40:])
