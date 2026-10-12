import {effectControls,abilityEffectData} from './ability-effects.mjs?v=0.1.40';
import {isInternalized,installationChanges} from './ability-state.mjs?v=0.1.40';
import {CULTIVATIONS,checkFormula,summarizeCheck} from './rules.mjs?v=0.1.40';
import {assertAction} from './conditions.mjs?v=0.1.40';
import {requireFreeHand,inSamadhi,enterSamadhi,sixesHTML} from './roll-support.mjs?v=0.1.40';
import {occupiedSlots} from './slots.mjs?v=0.1.40';
import {queueEquipment} from './equipment.mjs?v=0.1.40';
import {healthSutra} from './health.mjs?v=0.1.40';
import {escapeHTML as esc} from './resolution.mjs?v=0.1.40';
export const AREA_SHAPES={none:'Single target',circle:'Burst / circle',cone:'Cone',ray:'Line'};
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
 const mode=s.mode??'attack';
 const abilityName=special?`${item.name}: ${s.name}`:item.name;
 try {
  if(special&&item.type!=='technique'&&!item.system.equipped)throw new Error('Equip this item before using its Special Abilities.');
  if(special&&item.type==='technique'&&(item.system.installArdor??0)>0&&!isInternalized(item))throw new Error('Internalize this Technick before using its Special Abilities.');
  if(!special&&isInternalized(item))throw new Error('This ability is already internalized. Release it before internalizing it again.');
  const actionLabel=special?(magick?'Cast':'Use'):(s.installArdor??0)>0?'Internalize':'Activate';
  const actionControls=special?`<p>Mode: ${esc(mode)} · ${s.hostile===false?'Non-hostile':'Hostile'}</p>`:`<label><input type="checkbox" name="check" ${magick||(special&&mode==='check')?'checked':''}> Roll a check (uncheck for automatic abilities)</label><label><input type="checkbox" name="attack" ${magick||(special&&mode==='attack')?'checked':''}> Attack (resolve against a linked Defense)</label><label><input type="checkbox" name="hostile" ${!special||s.hostile!==false?'checked':''}> Hostile action</label>`;
  const input=await foundry.applications.api.DialogV2.prompt({classes:['swords-attack-dialog'],position:{width:600,height:680},window:{title:`${abilityName}: ${actionLabel}`,resizable:true},content:`<p>Cost: ${s.apCost??1} ✦ · Burn ${s.burnArdor??0} ✹ · Install ${s.installArdor??0} ❂</p>${magick?`<p>Mantra: ${esc(s.mantra||'—')}<br>Mudra: ${esc(s.mudra||'—')}</p>`:''}${actionControls}<fieldset ${special&&mode==='automatic'?'hidden':''}><legend>Pools</legend><label>Attacking / check pool${select('attackPool',CULTIVATIONS,s.attackPool??'spi')}</label><label>Defending pool${select('defensePool',CULTIVATIONS,s.defensePool??'grc')}</label><label>Miscellaneous bonus / penalty<input name="adjustment" type="number" step="1" value="0"></label><label>Demand (non-attack checks)<input name="demand" type="number" min="1" step="1" value="2"></label></fieldset>${magick?`<fieldset><legend>Area</legend><label>Shape${select('shape',AREA_SHAPES,s.areaShape??'none')}</label><label>Size (m)<input name="size" type="number" min="0" value="${s.areaSize??0}"></label><p>Area is recorded with the attack. Each affected target rolls its own linked Defense; select targets on the map manually.</p></fieldset>`:''}`,ok:{label:actionLabel,callback:(e,b)=>{const f=b.form.elements;return {check:f.check?.checked??false,attack:f.attack?.checked??false,hostile:f.hostile?.checked??false,attackPool:f.attackPool.value,defensePool:f.defensePool.value,adjustment:Number(f.adjustment.value),demand:Number(f.demand.value),shape:f.shape?.value??'none',size:Number(f.size?.value??0)};}},rejectClose:false});
  if(!input)return;
  if(special){input.attack=mode==='attack';input.check=mode==='check';input.hostile=s.hostile!==false;}
  const enhancement=magick&&s.enhancement?.description?.trim()?await foundry.applications.api.DialogV2.confirm({window:{title:`Enhance ${item.name}?`},content:`<p>${esc(s.enhancement.description)}</p><p>Additional costs: ${s.enhancement.apCost??0} ✦; burn ${s.enhancement.burnArdor??0} ✹; install ${s.enhancement.installArdor??0} ❂. Bonus: ${s.enhancement.bonus??0}; extra Wounds per uncancelled Strike: ${s.enhancement.extraWounds??0}.</p>`,yes:{label:'Yes, enhance'},no:{label:'No, use normally'},rejectClose:false}):false;
  if(enhancement)input.size+=s.enhancement.areaBonus??0;
  await queueEquipment(actor,async()=>{
   const current=actor.items.get(item.id);if(!current)throw new Error('This ability is no longer on the character.');
   if(special&&current.type!=='technique'&&!current.system.equipped)throw new Error('This item is no longer equipped.');
   if(special&&current.type==='technique'&&(current.system.installArdor??0)>0&&!isInternalized(current))throw new Error('This Technick is no longer internalized.');
   if(!special&&isInternalized(current))throw new Error('This ability is already internalized.');
   assertAction(actor,{cast:magick,attack:input.attack,hostile:input.hostile||input.attack});
   if(magick){requireFreeHand(actor);if(current.system.mudraHands===2&&actor.items.contents.some(i=>occupiedSlots(i).some(slot=>['left','right'].includes(slot))))throw new Error('This Mudra requires both hands free.');}
   const sutra=healthSutra(actor.system.health);if(sutra.knockedOut)throw new Error('You are Knocked Out.');
   if(!Object.hasOwn(CULTIVATIONS,input.attackPool)||!Object.hasOwn(CULTIVATIONS,input.defensePool)||!Number.isSafeInteger(input.adjustment)||!Number.isSafeInteger(input.demand)||input.demand<1||!Object.hasOwn(AREA_SHAPES,input.shape)||!Number.isFinite(input.size)||input.size<0)throw new Error('Choose valid pools and whole-number adjustments.');
   const source=actor.toObject().system;
   const currentSystem=selectSystem(current);if(!currentSystem)throw new Error('This special ability no longer exists.');
   const useSystem=enhancedAbility(currentSystem,enhancement);
   const specialNote=special&&currentSystem.description?`<div>${foundry.utils.cleanHTML(currentSystem.description)}</div>`:'';
   const enhancementNote=enhancement?`<p>Enhanced: ${esc(current.system.enhancement.description)}</p>`:'';
   const costs=abilityCosts(source,useSystem);
   // Save AP, Ardor, and this ability's reservation in the same Actor update.
   let restore={'system.actions':source.actions,'system.ardor.burnt':source.ardor.burnt,'system.ardor.installed':source.ardor.installed};
   if(!special){const original=actor.toObject();costs.items=installationChanges(original,current.id,useSystem.installArdor??0);restore.items=original.items;}
   if(!input.attack&&!input.check){
    if(!await actor.update(costs))throw new Error('Ability costs could not be saved.');
    try{await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:`<p>${esc(abilityName)} used. Spent ${useSystem.apCost??1} ✦; burnt ${useSystem.burnArdor??0} ✹; installed ${useSystem.installArdor??0} ❂.</p>${enhancementNote}${specialNote}${effectControls(useSystem)}`,flags:special?{'10kswordsfoundry':{abilityEffect:abilityEffectData(actor,item,specialIndex,useSystem,abilityName)}}:{}});}
    catch(error){if(!await actor.update(restore))throw new Error('Chat failed and ability costs could not be restored. Check AP and Ardor.');throw error;}
    return;
   }
   const pool=actor.system.cultivations[input.attackPool]+sutra.penalty+(actor.system.checkBonus??0)+(input.attack?(actor.system.attackBonus??0):0)+(useSystem.bonus??0)+input.adjustment+(inSamadhi(actor)?3:0);
   if(pool>1000)throw new Error('Please use at most 1,000 dice.');
   const roll=await new foundry.dice.Roll(checkFormula(pool)).evaluate();
   const results=roll.dice.flatMap(d=>d.results.filter(r=>r.active!==false&&!r.discarded).map(r=>r.result));
   const summary=summarizeCheck(results,input.attack?1:input.demand);
   const damage=currentSystem.damageType??'impact';
   const profile={damage,ignoresArmor:['burn','trauma','ruination'].includes(damage),armorPerWound:1,extraWounds:enhancement?(current.system.enhancement.extraWounds??0):0,criticalExtra:0,fivePlusExtra:0,keys:[]};
   if(!await actor.update(costs))throw new Error('Ability costs could not be saved.');
   try {
    await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flags:{'10kswordsfoundry':{...(input.attack?{attack:{name:abilityName,actorUuid:actor.uuid,results,profile,defensePool:input.defensePool,area:{shape:input.shape,size:input.size}}}:{}),...(special?{abilityEffect:abilityEffectData(actor,item,specialIndex,useSystem,abilityName)}:{})}},flavor:`${esc(abilityName)} · ${CULTIVATIONS[input.attackPool]}: ${summary.strikes} Strikes. ${sixesHTML(summary.sixes)}. Pool: ${pool}.<p>${input.attack?`Attack vs ${CULTIVATIONS[input.defensePool]}; ${damage} damage. Resolve using linked Defense.`:`Demand ${input.demand}: ${summary.success?'Success':'Failure'}.`}</p><p>${AREA_SHAPES[input.shape]}${input.shape==='none'?'':` · ${input.size} m`}. Spent ${useSystem.apCost??1} ✦; burnt ${useSystem.burnArdor??0} ✹; installed ${useSystem.installArdor??0} ❂.</p>${enhancementNote}${specialNote}${effectControls(useSystem)}`},{messageMode:game.settings.get('core','messageMode')});
   }catch(error){if(!await actor.update(restore))throw new Error('Chat failed and ability costs could not be restored. Check AP and Ardor.');throw error;}
   try{const notice=await enterSamadhi(actor,summary.sixes);if(notice)ui.notifications.info(`${actor.name} entered Samadhi.`);}catch(error){ui.notifications.warn(error.message);}
  });
 }catch(error){ui.notifications.warn(error.message);}
}
