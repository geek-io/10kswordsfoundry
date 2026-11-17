# Column-aware text extraction: python3 cols.py PDF first last outdir [minfreq] [prefix]
# Lines are grouped into the page's main text columns (left edges shared by at least `minfreq` lines),
# read top to bottom; pieces on the same row are joined with " ¦ ".
import sys,subprocess,re,html,collections
def extract(PDF,first,last,minfreq=4):
    x=subprocess.run(['pdftotext','-bbox-layout','-f',str(first),'-l',str(last),PDF,'-'],capture_output=True,text=True,check=True).stdout
    out={}
    for n,pg in enumerate(re.split(r'<page ',x)[1:],first):
        lines=[]
        for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>',pg,re.S):
            words=re.findall(r'<word[^>]*>(.*?)</word>',m.group(5),re.S)
            lines.append([float(m.group(1)),float(m.group(2)),float(m.group(3)),html.unescape(' '.join(words)),float(m.group(4))])
        freq=collections.Counter(round(l[0]) for l in lines)
        starts=[]
        for xv,c in sorted(freq.items()):
            near=sum(freq.get(xv+d,0) for d in (-2,-1,0,1,2))
            if near>=minfreq and (not starts or xv-starts[-1]>60): starts.append(xv)
        if not starts: starts=[0]
        def col(l):
            c=0
            for i,s in enumerate(starts):
                if l[0]+4>=s: c=i
            return c
        cols=collections.defaultdict(list)
        for l in lines: cols[col(l)].append(l)
        res=[]
        for c in sorted(cols):
            ls=sorted(cols[c],key=lambda l:(l[1],l[0]))
            rows=[]
            for l in ls:
                if rows and abs(l[1]-rows[-1][0])<3.0: rows[-1][1].append(l)
                else: rows.append([l[1],[l]])
            res.append((starts[c],[' ¦ '.join(p[3] for p in sorted(r[1],key=lambda l:l[0])) for r in rows]))
        out[n]=res
    return out
if __name__=='__main__':
    PDF,first,last,outd=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
    minfreq=int(sys.argv[5]) if len(sys.argv)>5 else 4
    prefix=sys.argv[6] if len(sys.argv)>6 else 'c'
    for n,res in extract(PDF,first,last,minfreq).items():
        with open(f'{outd}/{prefix}{n:03d}.txt','w') as f:
            for i,(sx,rows) in enumerate(res):
                f.write(f'\n##### COLUMN {i} (x={sx})\n'+'\n'.join(rows)+'\n')
