"""Reviewed Special Ability mappings for Rules 2.0.3 Sect Technicks.

Unrepresented consequences remain in each action's description, not invented effects.
Run after extract-sects.py; IDs and license links do not change.
"""
from pathlib import Path
import json, re

path=Path('data/sect-technicks.json')
catalog=json.loads(path.read_text(encoding='utf-8'))
# These grant passive benefits or modify another named action, rather than an
# independently payable action. Keep their rules text, not a misleading free roll.
passive={"Asuri's Wrath", 'Lilithian Flower Method', 'Iron Shirt Technique',
 'Everything Arrow Style', 'Vajra Guard', 'Anicca Meditation', 'Dragonsmoke Etchings',
 'Sundang Samayil', 'Lance Of Revolutionary Will', 'What Must Be Done'}
weapon_attacks={
 'Six Demon Cutting Sword':dict(weaponRequirement='heavy',bonus=2,modifiers='crushing, blaze',fivePlusExtra=1,damageType='cut',inheritWeaponDamage=True),
 'Hatred Condensation Seal':dict(weaponRequirement='any'),
 'Dread Devil Cutter':dict(weaponRequirement='any',modifiers='crushing',range=5),
 'Spiteful Disembowelment Of Seraphim':dict(weaponRequirement='any',bonus=4,modifiers='crushing',damageType='ruination',inheritWeaponDamage=False,allCritical=True,uninterruptible=True),
 "Death Maiden's Atomic Blade":dict(weaponRequirement='blade',convertStrikes=True),
 'Wuwei Bow':dict(weaponRequirement='ranged'),
 'Splitting Heaven Luminant':dict(weaponRequirement='ranged',modifiers='frost',range=20),
 'Sun Shooting Style':dict(weaponRequirement='ranged',range=100),
 'Devil Fragmentation':dict(weaponRequirement='gunPolearm',range=3),
 'Hell Ripped Through With Exit Wounds':dict(weaponRequirement='gunPolearm',modifiers='piercing, ferocious, precise',range=100,defensePool='sav'),
 'Rebuff The Jade Emperor':dict(weaponRequirement='any'),
}
standalone={
 'Ten Thousand Screaming Razors':dict(damageType='burn',modifiers='piercing',range=7,attackPool='grc'),
 'Sidhi Bullet':dict(attackPool='spi',bonus=2,damageType='burn',modifiers='holy',range=10),
 'Heart Immortal Palm':dict(attackPool='spi',bonus=2,damageType='burn',modifiers='holy',range=1),
 'Sword Of Logic':dict(attackPool='dia',defensePool='spi',bonus=2,damageType='trauma',range=10,apCost=1),
}
# Named rites / trigger actions with explicit prose costs absent from the opening block.
overrides={
 'Healing Pill':dict(name='Refine Healing Pill',burnArdor=1),
 'Single Point Meditation':dict(name='Enter Single Point Meditation',installArdor=1,activation=True),
 'Chthonian Seraph Body':dict(name='Enter Chthonian Seraph Body',installArdor=1,activation=True),
 'Aswang Fang':dict(name='Inflict Fang',installArdor=1,activation=True),
 'Negation Cut':dict(name='Leave Negation Cut',installArdor=1,activation=True),
 'Mock Heaven':dict(name='Inflict Aggravation',installArdor=1,activation=True),
 'Transmutation':dict(name='Transmute Material',burnArdor=1),
 'Kurukulla Blood Drinking':dict(variableBurn=True),
 'Supreme Wisdom Focus':dict(variableBurn=True),
 'Body Cauldron':dict(name='Empty Hand: Fire And Wind',mode='attack',apCost=1,attackPool='vio',damageType='burn',range=4),
 'Scythe Of Words':dict(mode='check',hostile=True,attackPool='dia',defensePool='spi'),
}
extra={
 'Transmutation':[dict(name='Refine Chakra Elixir',mode='automatic',burnArdor=3,description='<p>Rules 2.0.3 p.140. Spend three hours, appropriate equipment, at least 1,000 Mag, spirit herbs, and soul krait pearls. Create the elixir and deduct materials manually.</p>')],
 'Chthonian Seraph Body':[dict(name='Interrupt In Seraph Body',mode='automatic',burnArdor=1,description='<p>Rules 2.0.3 p.129. While in Chthonian Seraph Body, burn 1 Ardor to Interrupt without an Action. Resolve the Interrupt separately; do not also pay its normal AP cost.</p>')],
 'Glinting Light Sword Draw':[dict(name='Release: Surprise Attack',mode='attack',weaponRequirement='sword',inheritWeaponDamage=True,bonus=3,releaseInstallation=True,description='<p>Rules 2.0.3 p.168. Release the 3 installed Ardor and make an immediate Surprise Attack with a Sword or Saber (not a Dagger). Surprise contributes +3 dice (p.73).</p>')],
 'Elemental Dragon Style':[dict(name='Attack With The Elements',mode='attack',attackPool='spi',apCost=1,modifiers='crushing',addSidhi=True,range=20,description='<p>Rules 2.0.3 p.141. While installed, use SPI or WRD plus Sidhi. Choose the appropriate pool and damage type for the manifested element at the table. General Attack action: 1 AP (p.64). Size and line-of-sight restrictions apply.</p>')],
 'Scythe Of Words':[dict(name='Maintain Scythe Of Words',mode='check',attackPool='dia',defensePool='spi',description='<p>Rules 2.0.3 p.176. Every six seconds, repeat the opposed DIA vs SPI check. Compare Strikes manually; a loss frees the target. This check deals no Wounds.</p>')],
 'Stealing Heaven Fire':[dict(name='Rapid Movement Before Attack',mode='automatic',description='<p>Rules 2.0.3 p.168. Before attacking with a Sword or Saber, move up to 3m in a straight line, including vertically. Move the token manually; perform and pay for the attack separately.</p>')],
}
manual={
 'Six Demon Cutting Sword':'The extra Wound on each 5 or 6 is CUT. The selected weapon determines the base damage; resolve mixed damage types manually if it is not CUT.',
 'Gun Devil Witch Dance':'Pay the activation once, then resolve each Gun attack and ammunition separately. Do not charge normal attack AP again for the granted attacks.',
 'Abolish The Present State Of Things':'Pay once; resolve three separate weapon attacks, or four in Dialectical Citipati. Do not charge normal attack AP for the granted attacks.',
 'Threefold Hell Lotus Superposition Slash':'Pay this supplement once; roll the three possibilities (five for Dual Attack) and keep the chosen result. Do not apply damage from discarded possibilities or charge the supplement repeatedly.',
 'Panta Rhei':'Pay the supplement once on the triggering Empty Hand or Bludgeon attack; roll twice and keep the better result. Resolve the normal attack separately.',
 'Dragon Piercer':'This pays the supplement only. Resolve the next ranged attack and its AP/ammo separately, adding the listed benefits manually.',
 'Circulation':'This pays the supplement only. Add +2 in the miscellaneous adjustment of the triggering Attack or Defense; resolve that roll separately.',
 'Kurukulla Blood Drinking':'Choose Burn Ardor no higher than the Wounds just inflicted; restore that much Health manually. This is not a new attack.',
 'Supreme Wisdom Focus':'Choose how much Ardor to burn. Add twice that number to the next check and +1 Wound per Critical Strike manually.',
 'Nothingness Avatar':'Printed cost is 4 Burn, but the text refers to installed Ardor. Retains the printed Burn cost; resolve the contradiction with the GM before use. No installation or Samadhi duration is invented.',
 'Rebuff The Jade Emperor':'Move 3m and clear the specified conditions manually. If used as an Interrupt, apply Empowered, Crushing and Ferocious manually; these conditional benefits are not applied to an ordinary use.',
 'Sun Shooting Style':'If the target is in the sky, larger, or higher Sidhi, reroll non-Strikes manually. The normal branch does not assume that condition.',
 'Hell Ripped Through With Exit Wounds':'Each target defends with SAV and a -3 miscellaneous adjustment. Select affected targets manually.',
 'Ten Thousand Screaming Razors':'The entry does not print an attacking Cultivation. GRC is an editable suggested pool; confirm with the GM. Select targets in the 7m cone manually.',
 'Body Cauldron':'Uses a normal 1 AP Empty Hand attack (p.64), with +3m range. Add any Empty Hand-specific bonuses manually.',
 'Sword Of Logic':'Uses a normal 1 AP Attack (p.64). Its separate DIA Defense permission remains manual.',
}
defaults=dict(mode='automatic',hostile=False,apCost=0,burnArdor=0,installArdor=0,bonus=0,attackPool='vio',defensePool='grc',damageType='impact',description='')
count=0
for item in catalog['items']:
 name=item['name']; system=item['system']
 item['flags']['10kswordsfoundry']['sectCatalog'].setdefault('previousActivationCosts',{k:system.get(k,0) for k in ['apCost','burnArdor','installArdor']})
 if name in passive:
  system['specialAttacks']=[]
  continue
 # Preserve the complete source mechanics and their trigger in each action.
 description='<p>'+system['source']+'</p>'+system['description'].split('<h3>Import Notes</h3>')[0]
 if name in manual:description+='<p><strong>Use notes:</strong> '+manual[name]+'</p>'
 action={**defaults,'name':name,'description':description,**{k:system.get(k,0) for k in ['apCost','burnArdor','installArdor']}}
 action['activation']=action['installArdor']>0
 if name in weapon_attacks:action.update({'mode':'attack','hostile':True,'inheritWeaponDamage':True,**weapon_attacks[name]})
 if name in standalone:action.update(mode='attack',hostile=True,**standalone[name])
 action.update(overrides.get(name,{}))
 # Installation belongs to the parent item so its Release control can refund it.
 if action.get('activation'):
  system.update(apCost=action['apCost'],burnArdor=action['burnArdor'],installArdor=action['installArdor'])
 actions=[action]
 if name=='Stealing Heaven Fire':actions=[]
 for entry in extra.get(name,[]):actions.append({**defaults,**entry})
 system['specialAttacks']=actions
 system['description']=system['description'].replace('Conditional or prose costs remain in the description; check the trigger and spend resources as described.', 'Configured Special Abilities handle their listed activation costs. Check triggers and resolve the remaining effects as described.').replace('Variable Ardor cost: choose and spend the amount described in the ability; the fixed cost field is zero.', 'Variable Ardor cost: choose the amount in the Special Ability prompt. Apply the described recovery or subsequent bonus manually.')
 item['flags']['10kswordsfoundry']['sectCatalog']['specialAbilitiesVersion']=43
 count+=len(actions)
path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Configured {count} Special Abilities on {sum(bool(i["system"].get("specialAttacks")) for i in catalog["items"])} Technicks.')
