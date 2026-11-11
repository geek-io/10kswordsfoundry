# Parse the Sect chapter of the 2.1 player-facing book (187 PDF pages of two-page spreads, 2026-11-11) into raw entries.
# Usage: python parse.py <10,000 SWORDS AGAINST HEAVEN 2.1 player-facing.pdf> [first=102] [last=133]  -> raw.json (needs poppler's pdftotext)
# Then: python build.py  -> parsed.json;  python gen.py <out dir>/  -> sects-21.json, sect-gear-21.json
import sys,re,json
import os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from cols import extract
PDF=sys.argv[1]; FIRST=int(sys.argv[2]) if len(sys.argv)>2 else 102; LAST=int(sys.argv[3]) if len(sys.argv)>3 else 133
SECTS=[(102,'Asuri'),(104,'Aswang'),(106,'Dracontine'),(108,'Eskatonian'),(110,'Fangshi'),(112,'Houyi'),(114,'Imma'),(116,'Jyotisha'),(118,'Katalonan'),(120,'Mendicant'),(122,'Nezha'),(124,'Sword Dialectician'),(126,'Techgnostic'),(128,'Ultramystic'),(130,'Wukong'),(132,'Zhongkui')]
def sect_of(p): return [n for s0,n in SECTS if s0<=p][-1]
TYPE=re.compile(r'^(technick|magick|gear)$',re.I)
CAPS=re.compile(r"^[A-Z0-9][A-Z0-9 '’,\-:.!&/]{2,}$")
LIC=re.compile(r'^(//\s*)?licen[sc]e_?\b',re.I)
pages=extract(PDF,FIRST,LAST,10)
entries=[]
for p in range(FIRST,LAST+1):
    for ci,(sx,rows) in enumerate(pages[p]):
        # book page: left half or right half of the spread
        book=None
        rows=[r for r in rows if not re.fullmatch(r'\d{3}( ¦ \d{3})?',r.strip())]
        i=0;cur=None
        def is_title(k):
            parts=[x.strip() for x in rows[k].split('¦')]
            head=parts[0]
            m=re.match(r"^([A-Z0-9][A-Z0-9 '’,\-:.!&/]{2,}?) (TECHNICK|Technick|MAGICK|Magick|GEAR|Gear)$",head)
            if m and len(parts)==1: parts=[m.group(1),m.group(2)]; head=m.group(1)
            if not CAPS.match(head) or LIC.match(head) or head.lower().startswith('needs'): return None
            if head.endswith('.') and not head.endswith('SOMERSAUL.T'): return None
            if re.match(r'^(MANTRA|MUDRA|CHECK|CHARGE TIME|EFFECT|CAST)\b',head): return None
            typ=None
            if len(parts)>1 and TYPE.match(parts[-1]): typ=parts[-1].lower()
            # title may wrap onto a second caps row
            j=k+1; title=head
            if typ is None and j<len(rows):
                nxt=[x.strip() for x in rows[j].split('¦')]
                if TYPE.match(nxt[0]): typ=nxt[0].lower(); j+=1
                elif CAPS.match(nxt[0]) and not LIC.match(nxt[0]) and len(nxt)>1 and TYPE.match(nxt[-1]): title+=' '+nxt[0]; typ=nxt[-1].lower(); j+=1
                elif CAPS.match(nxt[0]) and j+1<len(rows) and TYPE.match(rows[j+1].strip()): title+=' '+nxt[0]; typ=rows[j+1].strip().lower(); j+=2
            if typ is None and cur is not None and not any(LIC.match(l.strip()) for l in cur['lines']): return None
            if typ is None:
                # accept an untyped caps title only if a license row follows before the next typed title
                for q in range(k+1,min(k+16,len(rows))):
                    if LIC.match(rows[q].strip()): typ='technick?'; break
                    if CAPS.match(rows[q].split('¦')[0].strip()) and q>k+1: break
                if typ is None: return None
            return title,typ,j
        while i<len(rows):
            t=is_title(i)
            if t:
                cur=dict(sect=sect_of(p),page=p,col=ci,x=sx,title=t[0],type=t[1],lines=[]); entries.append(cur); i=t[2]; continue
            if cur is not None: cur['lines'].append(rows[i])
            i+=1
json.dump(entries,open('raw.json','w'),indent=1,ensure_ascii=False)
print(len(entries))
import collections
print(collections.Counter(e['sect'] for e in entries))
