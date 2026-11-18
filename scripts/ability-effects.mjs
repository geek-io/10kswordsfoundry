import {queueEquipment} from './equipment.mjs?v=0.2.42';
import {escapeHTML} from './resolution.mjs?v=0.2.42';
import {CORES} from './rules21.mjs?v=0.2.42';
const effectKeyLabel=key=>{const core=CORES[String(key).replace('system.cores.','')];return core?core.label:String(key).replace('system.','');};
// Temporary target modifiers a Technick / special ability may apply. 2.1: the six Cores (temp Core increases from Technicks, 2026-11-15) alongside the 2.0.3 bonuses.
const KEYS=new Set(['system.attackBonus','system.defenseBonus','system.checkBonus','system.movement','system.cores.phy','system.cores.mot','system.cores.mnd','system.cores.wit','system.cores.voc','system.cores.spi']);
export function abilityEffectData(actor,item,index,ability,name){return {source:`${actor.uuid}:${item.id}:${index}`,name,key:ability.effectKey,value:ability.effectValue??0};}
export function effectControls(ability){
 if(!KEYS.has(ability.effectKey)||!ability.effectValue)return '';
 return `<p>Target modifier: ${escapeHTML(effectKeyLabel(ability.effectKey))} ${ability.effectValue>0?'+':''}${ability.effectValue}. Select eligible targets and apply after checking range and exceptions. Requires ownership or a GM.</p><button type="button" data-ability-effect="apply">Apply to selected targets</button><button type="button" data-ability-effect="remove">Remove from selected targets</button>`;
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
