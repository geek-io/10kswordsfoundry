import {modifierProfile,modifierKeys,MODIFIERS} from './modifiers.mjs?v=0.1.47';
import {weaponDetails} from './weapons.mjs?v=0.1.47';
import {attackCultivation} from './combat.mjs?v=0.1.47';
export const WEAPON_REQUIREMENTS={'':'No weapon','any':'Any wielded weapon','heavy':'Great or Colossal','ranged':'Ranged weapon','blade':'Dagger, Sword or Saber','sword':'Sword or Saber','gun':'Gun','gunPolearm':'Gun, Crossbow or Polearm'};
export function eligibleWeapon(item,requirement){
 if(item?.type!=='weapon'||!item.system.equipped||['carry','fashion'].includes(item.system.gearSlot))return false;
 const keys=modifierKeys(item.system),family=item.system.ammoFamily;
 switch(requirement){
 case 'any':return true;
 case 'heavy':return keys.has('great')||keys.has('colossal');
 case 'ranged':return item.system.weaponType==='ranged';
 case 'sword':return /\b(sword|saber|sabre)\b/i.test(`${item.name} ${item.system.tags??''}`);
 case 'blade':return /\b(dagger|sword|saber|sabre)\b/i.test(`${item.name} ${item.system.tags??''}`);
 case 'gun':return family==='gun'||/\bgun\b/i.test(`${item.name} ${item.system.tags??''}`);
 case 'gunPolearm':return ['gun','crossbow'].includes(family)||/\b(gun|crossbow|polearm)\b/i.test(`${item.name} ${item.system.tags??''}`);
 default:return false;
 }
}
export function specialAttackProfile(ability,weapon=null,ammo=null){
 if(ability.weaponRequirement&&!eligibleWeapon(weapon,ability.weaponRequirement))throw Error(`Choose a wielded weapon: ${WEAPON_REQUIREMENTS[ability.weaponRequirement]}.`);
 const base=weapon?.system??{damageType:ability.damageType,range:ability.range||1};
 const properties={...base.properties};
 for(const key of (ability.modifiers??'').toLowerCase().split(/[\s,]+/).filter(Boolean)){
  if(!Object.hasOwn(MODIFIERS,key))throw Error(`Unknown Special Ability modifier: ${key}`);
  properties[key]=true;
 }
 const profile=modifierProfile({...base,properties},{ammo});
 const bonus=weapon?weaponDetails(base).attack+profile.attack-modifierProfile(base).attack:profile.attack;
 if(!weapon||!ability.inheritWeaponDamage){
  profile.damage=ability.damageType??'impact';
  profile.ignoresArmor=profile.keys.includes('piercing')||['burn','trauma','ruination'].includes(profile.damage);
 }
 if(ability.range>0)profile.range=ability.range;
 profile.fivePlusExtra+=(ability.fivePlusExtra??0);
 profile.criticalExtra+=(ability.criticalExtra??0);
 profile.allCritical=!!ability.allCritical;
 profile.uninterruptible=!!ability.uninterruptible;
 return {profile,bonus,attackPool:weapon?attackCultivation(base):ability.attackPool};
}
