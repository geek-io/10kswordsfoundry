import {magickAreaSize} from './fashion-effects.mjs?v=0.1.47';
import {abilityArea,placeAbilityArea,AREA_SHAPES} from './areas.mjs?v=0.1.47';
export {AREA_SHAPES} from './areas.mjs?v=0.1.47';
import {eligibleWeapon,specialAttackProfile,WEAPON_REQUIREMENTS} from './special-abilities.mjs?v=0.1.47';
import {useWeapon} from './equipment.mjs?v=0.1.47';
import {animationContext,playItemAnimation} from './animations.mjs?v=0.1.47';
import {effectControls,abilityEffectData} from './ability-effects.mjs?v=0.1.47';
import {isInternalized,installationChanges} from './ability-state.mjs?v=0.1.47';
import {CULTIVATIONS,checkFormula,summarizeCheck} from './rules.mjs?v=0.1.47';
import {assertAction} from './conditions.mjs?v=0.1.47';
import {requireFreeHand,inSamadhi,enterSamadhi,sixesHTML} from './roll-support.mjs?v=0.1.47';
import {occupiedSlots} from './slots.mjs?v=0.1.47';
import {queueEquipment} from './equipment.mjs?v=0.1.47';
import {healthSutra} from './health.mjs?v=0.1.47';
import {escapeHTML as esc} from './resolution.mjs?v=0.1.47';

const select=(name,choices,value)=>`<select name="${name}">${Object.entries(choices).map(([key,label])=>`<option value="${esc(key)}" ${key===value?'selected':''}>${esc(label)}</option>`).join('')}</select>`;
export function abilityCosts(source,item) {
 const ap=item.apCost??1,burn=item.burnArdor??0,install=item.installArdor??0;
 if([ap,burn,install].some(n=>!Number.isSafeInteger(n)||n<0))throw new Error('AP and Ardor costs must be nonnegative whole numbers.');
 if(source.actions<ap)throw new Error(`You need ${ap} AP (✦) to use this ability.`);
 if(source.ardor.max-source.ardor.burnt-source.ardor.installed<burn+install)throw new Error('You do not have enough available Ardor.');
 return {'system.actions':source.actions-ap,'system.ardor.burnt':source.ardor.burnt+burn,'system.ardor.installed':source.ardor.installed+install};
}
export function enhancedAbility(system,enabled){
 if(!enabled)return system;
 const e=system.enhancement??{};
 return {...system,apCost:(system.apCost??1)+(e.apCost??0),burnArdor:(system.burnArdor??0)+(e.burnArdor??0),installArdor:(system.installArdor??0)+(e.installArdor??0),bonus:(system.bonus??0)+(e.bonus??0)};
}
export function resourceSymbols(system){return {
 ardorSymbols:Array.from({length:Math.max(0,system.ardor.max)},(_,i)=>({symbol:i<system.ardor.installed?'❂':'✹',state:i<system.ardor.installed?'installed':i<system.ardor.installed+system.ardor.burnt?'burnt':'open',label:i<system.ardor.installed?'Installed Ardor':i<system.ardor.installed+system.ardor.burnt?'Burnt Ardor':'Available Ardor'})),
 apSymbols:Array.from({length:3},(_,i)=>({available:i<system.actions}))};}
export async function useAbility(event,target) {
 const actor=this.document;if(!actor.isOwner)return;await this.submit();
 const item=actor.items.get(target.dataset.itemId);if(!item)return;
 const specialIndex=target.dataset.specialIndex===undefined?null:Number(target.dataset.specialIndex);
 const special=specialIndex!==null;
 if(special?!['fashion','technique','weapon'].includes(item.type):!['magick','technique'].includes(item.type))return;
 const selectSystem=current=>special?current.system.specialAttacks?.[specialIndex]:current.system;
 const magick=item.type==='magick',s=selectSystem(item);if(!s)return;
 const mode=s.mode??'attack',area=abilityArea(s);
 const abilityName=special?`${item.name}: ${s.name}`:item.name;
 try {
  if(special&&item.type!=='technique'&&!item.system.equipped)throw new Error('Equip this item before using its Special Abilities.');
  if(special&&!s.activation&&item.type==='technique'&&(item.system.installArdor??0)>0&&!isInternalized(item))throw new Error('Internalize this Technick before using its Special Abilities.');
  if((!special||s.activation)&&isInternalized(item))throw new Error('This ability is already internalized. Release it before internalizing it again.');
  const actionLabel=special?(magick?'Cast':'Use'):(s.installArdor??0)>0?'Internalize':'Activate';
  const actionControls=special?`<p>Mode: ${esc(mode)} · ${s.hostile===false?'Non-hostile':'Hostile'}</p>`:`<label><input type="checkbox" name="check" ${magick||(special&&mode==='check')?'checked':''}> Roll a check (uncheck for automatic abilities)</label><label><input type="checkbox" name="attack" ${magick||(special&&mode==='attack')?'checked':''}> Attack (resolve against a linked Defense)</label><label><input type="checkbox" name="hostile" ${!special||s.hostile!==false?'checked':''}> Hostile action</label>`;
  const weaponChoices=Object.fromEntries((actor.items.contents??[]).filter(i=>eligibleWeapon(i,s.weaponRequirement)).map(i=>[i.id,i.name]));
  if(s.weaponRequirement&&!Object.keys(weaponChoices).length)throw Error(`This ability requires a wielded weapon: ${WEAPON_REQUIREMENTS[s.weaponRequirement]}.`);
  const weaponControl=s.weaponRequirement?`<label>Weapon${select('weaponId',weaponChoices,Object.keys(weaponChoices)[0])}</label><p>Weapon Cultivation, bonuses, modifiers, and selected ammunition apply. Uses one shot; resolve area targets from the same attack.</p>`:'';
  const input=await foundry.applications.api.DialogV2.prompt({classes:['swords-attack-dialog'],position:{width:600,height:680},window:{title:`${abilityName}: ${actionLabel}`,resizable:true},content:`${s.variableBurn?'<label>Ardor to burn<input name="variableBurn" type="number" min="1" step="1" value="1"></label>':''}${weaponControl}${special?s.description??'':''}<p>Cost: ${s.apCost??1} ✦ · Burn ${s.burnArdor??0} ✹ · Install ${s.installArdor??0} ❂</p>${magick?`<p>Mantra: ${esc(s.mantra||'—')}<br>Mudra: ${esc(s.mudra||'—')}</p>`:''}${actionControls}<fieldset ${special&&mode==='automatic'?'hidden':''}><legend>Pools</legend><label>Attacking / check pool${select('attackPool',CULTIVATIONS,s.attackPool??'spi')}</label><label>Defending pool${select('defensePool',CULTIVATIONS,s.defensePool??'grc')}</label><label>Miscellaneous bonus / penalty<input name="adjustment" type="number" step="1" value="0"></label><label>Demand (non-attack checks)<input name="demand" type="number" min="1" step="1" value="2"></label></fieldset>${`<fieldset><legend>Area</legend>${magick&&(actor.system.magickAreaBonus??0)!==0?`<p>Active Effects: ${actor.system.magickAreaBonus>0?'+':''}${actor.system.magickAreaBonus} m to area size, applied automatically after this prompt.</p>`:''}<label>Shape${select('shape',AREA_SHAPES,area.shape)}</label><label>Size (m)<input name="size" type="number" min="0" value="${area.size}"></label><label>Placement range (m; 0 = unrestricted)<input name="areaRange" type="number" min="0" value="${area.range}"></label><p>Size is burst radius or blast/line length. Place the area on the canvas to select all visible characters inside, including allies. Each target rolls its own linked Defense. For branching abilities, choose the area for the branch being used.</p></fieldset>`}`,ok:{label:actionLabel,callback:(e,b)=>{const f=b.form.elements;return {variableBurn:Number(f.variableBurn?.value??0),weaponId:f.weaponId?.value??'',check:f.check?.checked??false,attack:f.attack?.checked??false,hostile:f.hostile?.checked??false,attackPool:f.attackPool.value,defensePool:f.defensePool.value,adjustment:Number(f.adjustment.value),demand:Number(f.demand.value),shape:f.shape?.value??'none',size:Number(f.size?.value??0),range:Number(f.areaRange?.value??0)};}},rejectClose:false});
  if(!input)return;
  if(special){input.attack=mode==='attack';input.check=mode==='check';input.hostile=s.hostile!==false;}
  const enhancement=magick&&s.enhancement?.description?.trim()?await foundry.applications.api.DialogV2.confirm({window:{title:`Enhance ${item.name}?`},content:`<p>${esc(s.enhancement.description)}</p><p>Additional costs: ${s.enhancement.apCost??0} ✦; burn ${s.enhancement.burnArdor??0} ✹; install ${s.enhancement.installArdor??0} ❂. Bonus: ${s.enhancement.bonus??0}; extra Wounds per uncancelled Strike: ${s.enhancement.extraWounds??0}.</p>`,yes:{label:'Yes, enhance'},no:{label:'No, use normally'},rejectClose:false}):false;
  if(enhancement)input.size+=s.enhancement.areaBonus??0;
  input.size=magickAreaSize(item.type,input.shape,input.size,actor.system);
  assertAction(actor,{cast:magick,attack:input.attack,hostile:input.hostile||input.attack});
  if(magick)requireFreeHand(actor);
  const previewCosts={...enhancedAbility(s,enhancement)};
  if(s.variableBurn)previewCosts.burnArdor=input.variableBurn;
  abilityCosts(actor.toObject().system,previewCosts);
  if(!Number.isFinite(input.range??0)||(input.range??0)<0)throw Error('Choose a nonnegative placement range.');
  const placedArea=await placeAbilityArea({sheet:this,actor,name:abilityName,shape:input.shape,size:input.size,range:input.range??0});
  if(placedArea===null)return;
  const animation=animationContext(actor);
  const perform=async(weapon=null,ammo=null)=>{
   const current=actor.items.get(item.id);if(!current)throw new Error('This ability is no longer on the character.');
   if(special&&current.type!=='technique'&&!current.system.equipped)throw new Error('This item is no longer equipped.');
   if(special&&!s.activation&&current.type==='technique'&&(current.system.installArdor??0)>0&&!isInternalized(current))throw new Error('This Technick is no longer internalized.');
   if((!special||s.activation)&&isInternalized(current))throw new Error('This ability is already internalized.');
   assertAction(actor,{cast:magick,attack:input.attack,hostile:input.hostile||input.attack});
   if(magick){requireFreeHand(actor);if(current.system.mudraHands===2&&actor.items.contents.some(i=>occupiedSlots(i).some(slot=>['left','right'].includes(slot))))throw new Error('This Mudra requires both hands free.');}
   const sutra=healthSutra(actor.system.health);if(sutra.knockedOut)throw new Error('You are Knocked Out.');
   if(!Object.hasOwn(CULTIVATIONS,input.attackPool)||!Object.hasOwn(CULTIVATIONS,input.defensePool)||!Number.isSafeInteger(input.adjustment)||!Number.isSafeInteger(input.demand)||input.demand<1||!Object.hasOwn(AREA_SHAPES,input.shape)||!Number.isFinite(input.size)||input.size<0)throw new Error('Choose valid pools and whole-number adjustments.');
   const source=actor.toObject().system;
   const currentSystem=selectSystem(current);if(!currentSystem)throw new Error('This special ability no longer exists.');
   const useSystem={...enhancedAbility(currentSystem,enhancement)};
   if(useSystem.variableBurn){if(!Number.isSafeInteger(input.variableBurn)||input.variableBurn<1)throw Error('Choose at least 1 whole Ardor to burn.');useSystem.burnArdor=input.variableBurn;}
   if(useSystem.addSidhi)useSystem.bonus=(useSystem.bonus??0)+(actor.system.sidhi??0);
   const attackData=special&&input.attack?specialAttackProfile(useSystem,weapon,ammo):null;
   if(weapon)input.attackPool=attackData.attackPool;
   const specialNote=special&&currentSystem.description?`<div>${foundry.utils.cleanHTML(currentSystem.description)}</div>`:'';
   const enhancementNote=enhancement?`<p>Enhanced: ${esc(current.system.enhancement.description)}</p>`:'';
   const costs=abilityCosts(source,useSystem);
   // Save AP, Ardor, and this ability's reservation in the same Actor update.
   let restore={'system.actions':source.actions,'system.ardor.burnt':source.ardor.burnt,'system.ardor.installed':source.ardor.installed};
   if(!special||s.activation){const original=actor.toObject();costs.items=installationChanges(original,current.id,(useSystem.installArdor??0)+(special&&!s.activation?(current.system.paidArdor??0):0));restore.items=original.items;}
   if(useSystem.releaseInstallation){
    const paid=current.system.paidArdor??0;if(paid<=0)throw Error('Internalize this Technick before releasing its ability.');
    costs['system.ardor.installed']=Math.max(0,source.ardor.installed-paid);
    costs.items=installationChanges(actor.toObject(),current.id,0);restore.items=actor.toObject().items;
   }
   if(!input.attack&&!input.check){
    if(!await actor.update(costs))throw new Error('Ability costs could not be saved.');
    let animationMessage;
    try{animationMessage=await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:`<p>${esc(abilityName)} used. Spent ${useSystem.apCost??1} ✦; burnt ${useSystem.burnArdor??0} ✹; installed ${useSystem.installArdor??0} ❂.</p>${enhancementNote}${specialNote}${effectControls(useSystem)}`,flags:{'10kswordsfoundry':{animationHandled:true,...(special?{abilityEffect:abilityEffectData(actor,item,specialIndex,useSystem,abilityName)}:{})}}});}
    catch(error){if(!await actor.update(restore))throw new Error('Chat failed and ability costs could not be restored. Check AP and Ardor.');throw error;}
    void playItemAnimation(animation,current,animationMessage);
    return;
   }
   const pool=actor.system.cultivations[input.attackPool]+sutra.penalty+(actor.system.checkBonus??0)+(input.attack?(actor.system.attackBonus??0):0)+(useSystem.bonus??0)+(attackData?.bonus??0)+input.adjustment+(inSamadhi(actor)?3:0);
   if(pool>1000)throw new Error('Please use at most 1,000 dice.');
   const roll=await new foundry.dice.Roll(attackData?.profile.precise?(pool<=0?'2d6r1kl1cs>=4':`${pool}d6r1cs>=4`):checkFormula(pool)).evaluate();
   const results=roll.dice.flatMap(d=>d.results.filter(r=>r.active!==false&&!r.discarded).map(r=>useSystem.convertStrikes&&r.result>=4?6:r.result));
   const summary=summarizeCheck(results,input.attack?1:input.demand);
   const damage=attackData?.profile.damage??currentSystem.damageType??'impact';
   const profile={damage,ignoresArmor:['burn','trauma','ruination'].includes(damage),armorPerWound:1,extraWounds:enhancement?(current.system.enhancement.extraWounds??0):0,criticalExtra:0,fivePlusExtra:0,keys:[],...(attackData?.profile??{})};
   if(!await actor.update(costs))throw new Error('Ability costs could not be saved.');
   let animationMessage;
   try {
    animationMessage=await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flags:{'10kswordsfoundry':{animationHandled:true,...(input.attack?{attack:{name:abilityName,actorUuid:actor.uuid,results,profile,defensePool:input.defensePool,area:{shape:input.shape,size:input.size,...placedArea}}}:{}),...(special?{abilityEffect:abilityEffectData(actor,item,specialIndex,useSystem,abilityName)}:{})}},flavor:`${esc(abilityName)} · ${CULTIVATIONS[input.attackPool]}: ${summary.strikes} Strikes. ${sixesHTML(summary.sixes)}. Pool: ${pool}.<p>${input.attack?`Attack vs ${CULTIVATIONS[input.defensePool]}; ${damage} damage. Resolve using linked Defense.`:`Demand ${input.demand}: ${summary.success?'Success':'Failure'}.`}</p><p>${AREA_SHAPES[input.shape]}${input.shape==='none'?'':` · ${input.size} m`}. Spent ${useSystem.apCost??1} ✦; burnt ${useSystem.burnArdor??0} ✹; installed ${useSystem.installArdor??0} ❂.</p>${useSystem.convertStrikes?'<p>For resolution, all dice showing 4+ become 6s. The dice display shows the original roll.</p>':profile.allCritical?'<p>All Strikes count as Critical Strikes for Defense.</p>':''}${enhancementNote}${specialNote}${effectControls(useSystem)}`},{messageMode:game.settings.get('core','messageMode')});
   }catch(error){if(!await actor.update(restore))throw new Error('Chat failed and ability costs could not be restored. Check AP and Ardor.');throw error;}
   void playItemAnimation(animation,current,animationMessage);
   try{const notice=await enterSamadhi(actor,summary.sixes);if(notice)ui.notifications.info(`${actor.name} entered Samadhi.`);}catch(error){ui.notifications.warn(error.message);}
  };
  if(s.weaponRequirement)await useWeapon(actor,input.weaponId,perform);
  else await queueEquipment(actor,()=>perform());
 }catch(error){ui.notifications.warn(error.message);}
}
