"""Apply sourced, individually switchable numeric Trait effects to the catalog."""
import json,hashlib
from pathlib import Path
# Each entry is (trigger label, [(Actor field, numeric expression)]).
L='@system.level'
def stat(key,value=L):return ('system.cultivations.'+key,value)
def check(value=L):return ('system.checkBonus',value)
M={
'11':[('Intimidate, seduce, or rally',[stat('wrd')])],
'12':[('After five minutes debating or persuading with logic',[stat('dia')])],
'13':[('Defending against Magick-based attacks',[('system.defenseBonus',L)])],
'14':[('Grapple, hold, disarm, or overpower',[stat('vio')])],
'15':[('Beast Shrine active: pay 1 Health; ten minutes; once per Rest',[stat('vio'),stat('dia','-1 * '+L)])],
'16':[('Writing, reciting, or improvising poetry',[check()])],
'21':[('Sense danger or hostile intent',[stat('sav')]),('Intimidate through credible threat',[stat('vio')])],
'22':[('Brew, distill, identify spirits/elixirs OR next check after own brew (no stacking)',[check()])],
'23':[('Dancing-related checks',[check()])],
'24':[('Maximum Health',[('system.health.max',L)])],
'25':[('Express truthfully',[stat('wrd'),stat('spi')]),('Perform for an audience of at least five',[check()])],
'26':[('Find shelter, food, or information in urban environments',[stat('sav')])],
'31':[('Endure exhaustion or stay awake',[check()]),('After eighteen hours awake',[stat('dia','-1 * '+L)])],
'33':[('Chosen craft',[check()])],
'34':[('Lead, rally, or inspire others (self)',[check()])],
'35':[('Next SAV check after reading emotions',[stat('sav','-1 * '+L)])],
'36':[('Perform, persuade, or move an audience through singing',[check()])],
'41':[('Research, decode, or identify occult phenomena',[check()])],
'42':[('Find vice, illicit goods, or secret dens',[check()]),('Resist temptation',[stat('spi','-1 * '+L)])],
'43':[('Pacify, de-escalate, or persuade toward peace; unavailable after initiating violence',[check()])],
'45':[('Detect immediate danger or react before another acts',[stat('sav')])],
'46':[('Repair, modify, inspect, or sabotage technology',[check()])],
'51':[('Destruction, upending, or burning down a system',[stat('vio'),stat('dia')]),('Perceive consequences beyond immediate destruction',[stat('sav','-1 * '+L)])],
'52':[('Act for nation or against outsiders',[stat('vio')]),('Connect across difference',[stat('spi','-1 * '+L)])],
'53':[('Interact with spirits, local deity, or dead',[stat('spi')]),('Ritual with proper offerings (additional)',[stat('spi','1')])],
'54':[('Leap, vault, climb, or maneuver',[stat('grc')]),('Movement-based performance (additional)',[check('1')])],
'56':[('Deal and speak with ghosts or spirits',[check()])],
'61':[('Analyze social structures',[stat('dia')]),('Resist coercion or despair',[stat('spi')]),('Carouse or chill with others',[check('-1 * '+L)])],
'62':[('Fluid movement',[stat('grc')])],
'63':[('Empathize, comfort, or persuade through compassion',[check()])],
'64':[('Connect intimately',[stat('spi')])],
'65':[('In service of chosen Truth',[check()]),('Exhaustion after daily reroll: one hour',[check('-1 * '+L)])],
'66':[('Appearance to persuade, charm, or influence',[check()])]
}
def apply():
 p=Path('data/grimoire-traits.json');catalog=json.loads(p.read_text(encoding='utf-8'))
 for item in catalog['items']:
  code=item['system']['source'].split('Trait ')[-1]
  item['system']['active']=code=='24'
  item['effects']=[]
  for n,(label,changes) in enumerate(M.get(code,[])):
   item['effects'].append({'_id':hashlib.sha256(f'trait-effect-{code}-{n}'.encode()).hexdigest()[:16],'name':label,'img':item['img'],'transfer':True,'disabled':n>0,'description':f'<p>{item["system"]["source"]}. Enable only while this condition applies. Disable after a one-use benefit or when its duration ends.</p>','system':{'changes':[{'key':key,'type':'add','value':value,'phase':'initial','priority':20} for key,value in changes]}})
 p.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(f'Configured {sum(len(i["effects"]) for i in catalog["items"])} effects across {len(M)} Traits.')
if __name__=='__main__':apply()
