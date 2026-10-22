"""Build Jobs, World Being Traits, and Sect equipment from Rules 2.0.3.
Run from project root. Only reads the user-provided PDF; no Git/network actions.
"""
from pathlib import Path
import copy, hashlib, html, json, re
import pymupdf

pdf=pymupdf.open('C:/Users/drago/Downloads/10,000 SWORDS AGAINST HEAVEN 2.0.3 (1).pdf')
def ident(s): return hashlib.sha256(s.encode()).hexdigest()[:16]
def clean(s): return re.sub(r'\s+',' ',s).strip()
def para(s): return '<p>'+html.escape(clean(s))+'</p>'
def norm(s): return re.sub(r'[^a-z0-9]','',s.lower())
def title(s):
 s=re.sub(r"([’'])S\b",lambda m:m[1]+'s',clean(s).title())
 return s.replace('Um ','UM ').replace(' Ptm',' PTM')
def read(name): return json.loads(Path('data/'+name+'.json').read_text(encoding='utf8'))
def save(name,data):
 Path('data/'+name+'.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(name,len(data['items']),'items;',len(data['folders']),'folders')
def folder(pack,name,parent=None):
 key=ident(pack['name']+str(parent)+name)
 if not any(f['_id']==key for f in pack['folders']):pack['folders'].append(dict(_id=key,name=name,type='Item',folder=parent,sorting='a',color=None))
 return key
def item(pack,name,kind,page,group,description,**system):
 value=dict(_id=ident(pack['name']+name),name=name,type=kind,img=f'systems/10kswordsfoundry/assets/icons/{kind}.svg',folder=group,system=dict(description=description,source=f'Rules 2.0.3, p.{page}',**system),effects=[])
 pack['items'].append(value);return value
def effect(item,name,changes,disabled=False):
 item.setdefault('effects',[]).append(dict(_id=ident(item['_id']+name),name=name,img=item['img'],transfer=True,disabled=disabled,description=para(item['system']['source']+('. Enable only when the described condition applies.' if disabled else '.')),system=dict(changes=[dict(key=key,type='add',value=str(value),phase='initial',priority=20) for key,value in changes.items()])))
def pack(name):return dict(name=name,folders=[],items=[])

# World Being Traits: the complete 3d6 table, including narrative traits.
wb=pack('worldbeing-traits');root=folder(wb,'World Being Traits')
text=pdf[212].get_text()
entries=list(re.finditer(r'(?m)^(\d{1,2})\s*[—–-]\s*([^\n.]+)\.',text))
assert [int(m[1]) for m in entries]==list(range(3,19))
for index,m in enumerate(entries):
 body=clean(text[m.end():entries[index+1].start() if index+1<len(entries) else len(text)])
 row=item(wb,title(m[2]),'trait',213,root,para(body),tags=f'World Being, Trait, 3d6 {m[1]}',level=1,active=True)
 name=row['name'];changes={}
 if name in ['Deity','Chthonian']:
  changes={'system.health.max':5 if name=='Deity' else 3,**{'system.cultivations.'+k:2 if name=='Deity' else 1 for k in ['vio','dia','grc','sav','wrd','spi']}}
 if name=='Mystical':changes={'system.ardor.max':1}
 if name=='Exdead':changes={'system.health.max':1}
 if name=='Demon':changes={'system.attackBonus':1}
 if changes:effect(row,name,changes)
 conditions={'Murderer':('Against Bloody targets',{'system.attackBonus':1}),'Rhetorician':('Straight argumentation',{'system.checkBonus':2}),'Clever':('Gain advantage through wit',{'system.checkBonus':1}),'Hunter':('Target alone with no adjacent allies',{'system.attackBonus':1}),'Salt Of The Earth':('Maintain integrity',{'system.checkBonus':2}),'Keen Mind':('Perception, sensation and insight',{'system.checkBonus':2}),'Demon':('Against Bloody targets',{'system.attackBonus':1})}
 if name in conditions:effect(row,*conditions[name],disabled=True)
 row['system']['description']+=para('World Being Trait. Conditional effects are disabled until their condition applies. Action-count changes, immunities, triggered healing and narrative abilities remain manual.')
save(wb['name'],wb)

# Sect equipment cards start at PRESTIGE ribbons; the Spectral Seal title uniquely uses Maragsa.
sects=['Asuri','Aswang','Eschatonian','Fangshi','Houyi','Immanent','Jyotisha','Katalonan','Mendicant','Nezha','Sword Dialectician','Techgnostic','Ultramystic','Wukong','Zhongkui']
records=[]
for page in range(127,186):
 if (page-126)%4==0:continue
 current=None;pending_slots=1
 for block in pdf[page-1].get_text('dict')['blocks']:
  for line in block.get('lines',[]):
   spans=line['spans'];text=clean(''.join(s['text'] for s in spans));fonts=[s['font'] for s in spans]
   if not text or text==str(page):continue
   if re.fullmatch('[◼ ]+',text):pending_slots=text.count('◼');continue
   if 'PRESTIGE' in text and len(text)<90:
    if current:records.append(current)
    current=dict(page=page,slots=pending_slots,lines=[(text,fonts)]);pending_slots=1
   elif current and any('Maragsa' in f for f in fonts) and len(current['lines'])>2:
    records.append(current);current=None
   elif current:current['lines'].append((text,fonts))
 if current:records.append(current)
assert len(records)==34
equipment=pack('sect-equipment');base=read('non-sect-items');patterns={i['name'].lower():i for i in base['items'] if i['type']=='weapon' and i['name'].lower() in ['dagger','sword','bludgeon','polearm','bow','crossbow','launcher','gun','whip','saber']}
modifiers=set(re.findall(r'\b([a-z]+):"',Path('scripts/modifiers.mjs').read_text(encoding='utf8')))
for rec in records:
 page=rec['page'];lines=rec['lines'];sect=sects[(page-127)//4]
 pos=next(j for j,(t,f) in enumerate(lines) if t=='N/A')+1
 rawname=lines[pos][0];name=title(rawname);header=' '.join(t for t,f in lines[:pos]);bodylines=lines[pos+1:]
 kind='fashion' if 'FASHION' in header else 'accessory' if 'ACCESSORY' in header else 'gear' if 'ITEM' in header else 'weapon'
 pattern=next((k for k in patterns if k.upper() in header),'bludgeon')
 variants=['bow','crossbow','launcher','gun'] if name=='Houyi Tonggong' else [pattern]
 group=folder(equipment,{'fashion':'Fashion','accessory':'Accessories','gear':'Gear','weapon':'Weapons'}[kind],folder(equipment,sect))
 # Font changes separate rules from flavour; concatenate layout-wrapped lines within each paragraph.
 paragraphs=[];buf=[];last=None
 for text,fonts in bodylines:
  flavour=all('Inter' in f for f in fonts)
  if last is not None and flavour!=last and buf:paragraphs.append(para(' '.join(buf)));buf=[]
  buf.append(text);last=flavour
 if buf:paragraphs.append(para(' '.join(buf)))
 body=' '.join(t for t,f in bodylines)
 for variant in variants:
  rowname=name+(f' ({variant.title()})' if len(variants)>1 else '')
  system=dict(rarity='prestige',quantity=1,slots=rec['slots'],magCost=0,equipped=False,tags=f'{sect}, {kind.title()}, Prestige',gearSlot='fashion' if kind=='fashion' else 'carry')
  if kind=='fashion':
   stats=re.search(r'ARMOR\s*\+?(\d+)\s*ARDOR\s*\+?(\d+)',body);assert stats,rowname
   system.update(armor=int(stats[1]),ardor=int(stats[2]))
  if kind=='weapon':
   system.update(copy.deepcopy(patterns[variant]['system']));system.pop('description',None);system.pop('source',None)
   system.update(rarity='prestige',magCost=0,tags=f'{sect}, {variant.title()}, Prestige',equipped=False,quantity=1,slots=rec['slots'],upgrade='base',gearSlot='both' if variant in ['bow','crossbow'] else 'right')
   traits=[]
   for t,f in bodylines:
    if '✦' not in t and t not in ['CONCEALABLE','✦ CRUSHING']:break
    traits.append(t)
   words=re.findall(r'[A-Z]+',' '.join(traits));system['properties'].update({('doublehand' if w=='DOUBLEHANDED' else w.lower()):True for w in words if w.lower() in modifiers or w=='DOUBLEHANDED'})
   affinities=[w.lower() for w in words if w in ['BRUTE','NIMBLE','NOETIC','KEEN','LYRIC','OCCULT']]
   if affinities:system['affinity']=affinities[0].title()
   if name=='Houyi Tonggong':system.update(bonus=2,range=system['range']*2,damageType='burn',ammoFamily='none');system['properties']['unblockable']=True
   if name=='Nezha Huojianqiang':system.update(damageType='ruination',ammoFamily='none')
  description=''.join(paragraphs)+para('Price is N/A in the source; the numeric Mag cost is 0 as a placeholder, not a free purchase. Conditional, triggered and narrative rules remain in this description for manual resolution.')
  if len(variants)>1:description+=para('Choose one Tonggong weapon form when claimed. This is the '+variant+' form; printed +4 ATK includes the Artifact +2, and its range is twice the base weapon range.')
  row=item(equipment,rowname,kind,page,group,description,**system)
  if name=='Hermetic Robes':effect(row,'Avatar of Destruction — Magick area +1 m',{'system.magickAreaBonus':1})
  if name=='Liver-Eater’s Raiment':effect(row,'Shadowsilk — Movement +1',{'system.movement':1})
  if name=='Mendicant Begging Garb':effect(row,'Dog Laughs At God — Health +2',{'system.health.max':2})
  if name=='Phoenix Feather Cap':effect(row,'Phoenix Feather Cap — Ardor +2',{'system.ardor.max':2})
save(equipment['name'],equipment)

# Jobs: independent snapshots, with canonical weapon patterns and printed ammunition.
jobs=pack('jobs');traits=read('grimoire-traits')['items']
body=['Wretched','Laborer','Pugilist','Bodyguard','Hunter','Assassin'];mind=['Scholar','Cryptomancer','Occultist','Investigator','Mechanist','Diplomat']
loadouts={
 'Laborer':[('Workhammer','Bludgeon','right',[])],
 'Bodyguard':[('HaeCo Foldblade','Sword','right',['concealable']),('HaeCo Foldshield','Bludgeon','left',['concealable','shield'])],
 'Hunter':[('REVIKEYA Longbow k640','Bow','both',[])],
 'Assassin':[('EXDEAD Sutra-Knife','Dagger','right',['nimble']),('EXDEAD Sutra-Knife','Dagger','left',['nimble'])],
 'Scholar':[('Book','Bludgeon','right',[])],
 'Cryptomancer':[('HaeCo Pistol','Gun','right',['keen'])],
 'Occultist':[('PuJaEso Occult Keris','Dagger','right',['occult','ritual'])],
 'Investigator':[('TMNI Reaper','Saber','right',['ferocious'])],
 'Mechanist':[('Engineering Hammer','Bludgeon','right',['noetic'])],
 'Diplomat':[('IN-ELIX Silksteel Ribbons','Whip','right',['lyric','worn','concealable']),('IN-ELIX Silksteel Ribbons','Whip','left',['lyric','worn','concealable'])]}
for page,names,category in [(42,body,'body'),(43,mind,'mind')]:
 text=pdf[page-1].get_text();matches=[re.search(r'(?m)^'+name+r'\b',text) for name in names];assert all(matches)
 for index,(name,m) in enumerate(zip(names,matches)):
  raw=text[m.start():matches[index+1].start() if index+1<len(matches) else len(text)]
  raw=re.sub(r'(?m)^\d+\s*$','',raw).strip();description=para(raw)
  cultivations={k.lower():len(v) for k,v in re.findall(r'(VIO|DIA|GRC|SAV|WRD|SPI)(✦+)',raw)}
  if name=='Wretched':cultivations=dict.fromkeys(['vio','dia','grc','sav','wrd','spi'],1)
  assert len(cultivations)==6,(name,cultivations)
  row=item(jobs,name,'job',page,folder(jobs,category.title()),description,category=category,cultivations=cultivations,grants=[],tags=f'Job, {category.title()}')
  if name=='Wretched':
   row['flags']={'10kswordsfoundry':{'jobChoicesRequired':True}}
   row['system']['description']+=para('Before applying this Job: assign 4, 3, 2, 2, 1, 1 to the six Cultivations and add one chosen weapon, one Common/Uncommon Fashion and one Trait to its loadout. For a ranged weapon roll 6+d6 ammunition and set its ammo quantity. The six 1s are unassigned placeholders; this template cannot be applied until customized.')
   continue
  grants=[]
  for weapon_name,pattern,slot,properties in loadouts.get(name,[]):
   weapon=copy.deepcopy(patterns[pattern.lower()]);weapon['name']=weapon_name;weapon['system'].update(gearSlot=slot,equipped=False,quantity=1,slots=1,magCost=0,source=f'Rules 2.0.3, p.{page}; {name} Job',description=para(raw))
   for prop in properties:
    if prop in ['nimble','keen','noetic','lyric','occult']:weapon['system']['affinity']=prop.title()
    else:weapon['system'].setdefault('properties',{})[prop]=True
   if name in ['Hunter','Cryptomancer']:weapon['system'].update(ammoFamily='none',ammo=dict(type='Arrow' if name=='Hunter' else 'Bullet',quantity=12 if name=='Hunter' else 10))
   grants.append(weapon)
  fashion_name=clean(re.search(r'\[FASHION\]\s*([^\n(]+)',raw)[1])
  fashion=copy.deepcopy(next(i for i in base['items'] if i['type']=='fashion' and norm(i['name'])==norm(fashion_name)))
  fashion['system'].update(equipped=False,quantity=1,gearSlot='fashion')
  if fashion['name']=='Rogue Garb':effect(fashion,'Rogue Garb — Movement +1',{'system.movement':1})
  if fashion['name']=='Occultist Vesture':effect(fashion,'Occultist Vesture — Spirit +1',{'system.cultivations.spi':1})
  grants.append(fashion)
  trait_name=clean(re.search(r'(?:\[TRAIT\]|Trait:)\s*([^\n(]+)',raw)[1])
  trait=copy.deepcopy(next(i for i in traits if norm(i['name'])==norm(trait_name)));trait['system']['level']=1;grants.append(trait)
  for number,grant in enumerate(grants):row['system']['grants'].append(dict(id=ident(name+str(number)),name=grant['name'],type=grant['type'],img=grant['img'],system=grant['system'],effects=grant.get('effects',[])))
save(jobs['name'],jobs)
