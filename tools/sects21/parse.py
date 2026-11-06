import re, json
from xml.etree import ElementTree as ET
import sys, subprocess
# Usage: python parse.py <2.1 sect spoilers (playtest sects, 64 pages).pdf>  (needs poppler's pdftotext)
PDF=sys.argv[1]; SRC='bbox.html'
subprocess.run(['pdftotext','-bbox-layout',PDF,SRC],check=True)
s=open(SRC).read(); s=re.sub(r'<!DOCTYPE[^>]*>','',s).replace('xmlns="http://www.w3.org/1999/xhtml"','')
root=ET.fromstring(s)
SECTS=[(1,'Asuri'),(5,'Aswang'),(9,'Dracontine'),(13,'Eskatonian'),(17,'Fangshi'),(21,'Houyi'),(25,'Imma'),(29,'Jyotisha'),(33,'Katalonan'),(37,'Mendicant'),(41,'Nezha'),(45,'Sword Dialectician'),(49,'Techgnostic'),(53,'Ultramystic'),(57,'Wukong'),(61,'Zhongkui')]
INTRO={1,5,9,13,17,21,25,29,33,37,41,45,49,53,57,61}
def sect_of(p): return [n for s0,n in SECTS if s0<=p][-1]
TYPE=re.compile(r'^(TECHNICK|Technick|GEAR|Gear|MAGICK|Magick)$')
lines=[]; bid=0; bookpage={}
for pi,page in enumerate(root.iter('page'),1):
    W=float(page.get('width')); blocks=[]
    for b in page.iter('block'):
        x=float(b.get('xMin'));y=float(b.get('yMin'));x2=float(b.get('xMax'))
        ls=[' '.join(w.text or '' for w in l.iter('word')) for l in b.iter('line')]
        blocks.append((0 if (x+x2)/2<W/2 else 1,y,ls))
    blocks.sort(key=lambda t:(t[0],t[1]))
    for col,y,ls in blocks:
        bid+=1
        txt=' '.join(ls)
        if re.fullmatch(r'\d{3}( \d{3})?',txt.strip()): bookpage.setdefault(pi,int(txt.split()[0])); continue
        for i,l in enumerate(ls): lines.append(dict(p=pi,b=bid,i=i,t=l.strip()))
# fill book pages
for pi in range(1,65):
    if pi not in bookpage:
        prev=[bookpage[q] for q in bookpage if q<pi]; bookpage[pi]=(max(prev)+1) if prev else 128
isupper=lambda t: bool(re.search(r'[A-Z]',t)) and t==t.upper() and not re.search(r'[a-z]',t)
starts=[]
for k,L in enumerate(lines):
    if TYPE.match(L['t']):
        # title: preceding lines in same block, else previous block (if short uppercase)
        j=k-1; title=[]
        if j>=0 and lines[j]['b']==L['b']:
            while j>=0 and lines[j]['b']==L['b'] and isupper(lines[j]['t']): title.insert(0,lines[j]['t']); j-=1
        else:
            b=lines[j]['b']
            while j>=0 and lines[j]['b']==b: title.insert(0,lines[j]['t']); j-=1
        starts.append((j+1,k,' '.join(title)))
entries=[]
for n,(ts,k,title) in enumerate(starts):
    end=starts[n+1][0] if n+1<len(starts) else len(lines)
    body=[L for L in lines[k+1:end] if L['p'] not in INTRO]
    # stop body at sect change
    p0=lines[k]['p']; body=[L for L in body if sect_of(L['p'])==sect_of(p0)]
    entries.append(dict(title=title,type=lines[k]['t'].lower().replace('technick','technick'),pdfpage=p0,page=bookpage[p0],sect=sect_of(p0),lines=[L['t'] for L in body]))
json.dump(entries,open('raw.json','w'),indent=1,ensure_ascii=False)
if False:
  for e in entries:
    t=' / '.join(e['lines']); lic=re.search(r'licen[sc]e\s*(?:/\s*)?([A-Z][A-Z \-\']+?)\s*(✦+)',t,re.I); nd=re.search(r'needs\s*(?:/\s*)?([^/]*)',t,re.I)
    print(f"{e['page']} {e['sect'][:6]:6} {e['type'][:4]:4} {e['title'][:34]:34} | {lic.group(1)+' '+str(len(lic.group(2))) if lic else '??LIC'} | {nd.group(1).strip()[:30] if nd else '-'} | {len(e['lines'])}")
print(len(entries),'entries')
