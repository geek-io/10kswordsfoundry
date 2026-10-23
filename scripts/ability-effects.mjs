import {queueEquipment} from './equipment.mjs?v=0.1.51';
import {escapeHTML} from './resolution.mjs?v=0.1.51';
const KEYS=new Set(['system.attackBonus','system.defenseBonus','system.checkBonus','system.movement']);
export function abilityEffectData(actor,item,index,ability,name){return {source:`${actor.uuid}:${item.id}:${index}`,name,key:ability.effectKey,value:ability.effectValue??0};}
export function effectControls(ability){
 if(!KEYS.has(ability.effectKey)||!ability.effectValue)return '';
 return `<p>Target modifier: ${escapeHTML(ability.effectKey.replace('system.',''))} ${ability.effectValue>0?'+':''}${ability.effectValue}. Select eligible targets and apply after checking range and exceptions. Requires ownership or a GM.</p><button type="button" data-ability-effect="apply">Apply to selected targets</button><button type="button" data-ability-effect="remove">Remove from selected targets</button>`;
}
export async function applyAbilityEffect(data,actors,remove=false){
 if(!KEYS.has(data.key)||!Number.isSafeInteger(data.value))throw Error('Invalid ability modifier.');
 const targets=[...new Map(actors.filter(Boolean).map(a=>[a.uuid,a])).values()];
 if(!targets.length)throw Error('Select the affected tokens as targets first.');
 if(targets.some(a=>!a.isOwner))throw Error('A GM or the target owner must apply this modifier.');
 for(const actor of targets)await queueEquipment(actor,async()=>{
  const existing=actor.effects.contents.filter(e=>e.getFlag('10kswordsfoundry','abilitySource')===data.source);
  if(remove){if(existing.length)await actor.deleteEmbeddedDocuments('ActiveEffect',existing.map(e=>e.id));return;}
  const effect={name:data.name,disabled:false,transfer:false,system:{changes:[{key:data.key,type:'add',value:data.value}]},flags:{'10kswordsfoundry':{abilitySource:data.source}}};
  if(existing.length)await existing[0].update(effect);else await actor.createEmbeddedDocuments('ActiveEffect',[effect]);
 });
}
export function registerAbilityEffects(){
 Hooks.on('renderChatMessageHTML',(message,html)=>{
  const data=message.getFlag('10kswordsfoundry','abilityEffect');if(!data||!message.isContentVisible)return;
  for(const button of html.querySelectorAll('[data-ability-effect]'))button.addEventListener('click',async()=>{
   button.disabled=true;
   try{await applyAbilityEffect(data,[...game.user.targets].map(t=>t.actor),button.dataset.abilityEffect==='remove');ui.notifications.info('Special Ability modifiers updated.');}
   catch(error){ui.notifications.warn(error.message);}finally{button.disabled=false;}
  });
 });
}
