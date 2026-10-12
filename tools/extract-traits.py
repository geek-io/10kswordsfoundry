"""Extract the user-supplied Grimoire pp.114–120 into a reproducible Item catalog."""
from pathlib import Path
from pypdf import PdfReader
import re,json,hashlib,html
pdf=PdfReader('C:/Users/drago/Downloads/10,000 SWORDS AGAINST HEAVEN 2.0.3 (1).pdf')
folder=hashlib.sha256(b'grimoire-traits').hexdigest()[:16]
items=[]
for page in range(114,121):
    text=pdf.pages[page-1].extract_text().split('TRAITS ARE DYNAMIC')[0]
    matches=list(re.finditer(r'^([1-6])\s+([1-6])\s+([^\n]+)',text,re.M))
    for n,m in enumerate(matches):
        code=m[1]+m[2];name=m[3].strip();body=text[m.end():matches[n+1].start() if n+1<len(matches) else len(text)].strip()
        body=re.sub(r'\n?\s*TRAITS\s*$','',body).strip()
        if '(' in name:
            name,note=name.split('(',1)
            body='('+note+'\n'+body
        name=name.strip()
        # Preserve printed compound-word hyphens when joining PDF layout lines.
        body=re.sub(r'-\s*\n\s*','-',body)
        body=re.sub(r'\s+',' ',body).strip().replace('someone.You','someone. You')
        description='<p>'+html.escape(body,quote=False)+'</p>'
        effects=[];active=True
        if code in ['11','24']:
            key='system.cultivations.wrd' if code=='11' else 'system.health.max'
            effectName='Animal Magnetism — intimidate, seduce, or rally' if code=='11' else 'Adamance — Maximum Health'
            effects=[{'_id':hashlib.sha256(('trait-effect-'+code).encode()).hexdigest()[:16],'name':effectName,'img':'systems/10kswordsfoundry/assets/icons/trait.svg','transfer':True,'disabled':False,'system':{'changes':[{'key':key,'type':'add','value':'@system.level','phase':'initial','priority':20}]}}]
            active=code!='11'
        items.append({'_id':hashlib.sha256(('grimoire-trait-'+code).encode()).hexdigest()[:16],'name':name,'type':'trait','img':'systems/10kswordsfoundry/assets/icons/trait.svg','folder':folder,'system':{'description':description,'source':f'Rules 2.0.3, p.{page}; Trait {code}','tags':f'Grimoire, Trait, d66 {code}','level':1,'active':active},'effects':effects})
assert len(items)==36
assert [re.search(r'Trait (\d+)$',i['system']['source'])[1] for i in items]==[str(a)+str(b) for a in range(1,7) for b in range(1,7)]
assert all('TRAITS ARE DYNAMIC' not in i['system']['description'] for i in items)
catalog={'folders':[{'_id':folder,'name':'Traits','type':'Item','folder':None,'sorting':'a','color':None}],'items':items}
Path('data/grimoire-traits.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Extracted {len(items)} Traits from pp.114–120.')

# Reapply the maintained mechanic mappings after extracting prose.
import runpy
runpy.run_path(str(Path(__file__).with_name("trait-effects.py")),run_name="__main__")
