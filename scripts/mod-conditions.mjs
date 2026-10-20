import {queueEquipment} from './equipment.mjs?v=0.1.45';
import {checkFormula,summarizeCheck} from './rules.mjs?v=0.1.45';
import {healthSutra} from './health.mjs?v=0.1.45';
import {inSamadhi,enterSamadhi,sixesHTML} from './roll-support.mjs?v=0.1.45';
import {escapeHTML} from './resolution.mjs?v=0.1.45';
export function inflictedConditions(attack,resolved){
 if(!resolved||resolved.strikes<1)return [];
 const keys=new Set(attack.profile.keys??[]),out=[];
 if(keys.has('blaze'))out.push('blaze');
 if(keys.has('toxic'))out.push('toxic');
 if(keys.has('electric')||(keys.has('colossal')&&resolved.wounds>0))out.push('stun');
 if(keys.has('frost'))out.push('hobbled');
 if(keys.has('lacerating')&&resolved.wounds>0)out.push('lacerating');
 return out;
}
export async function tickBlaze(actor,roundKey=''){
 return queueEquipment(actor,async()=>{
  if(!actor.isOwner||!actor.system.conditions.blaze)return;
  const previous=actor.getFlag?.('10kswordsfoundry','blazeRound')??'';
  if(roundKey&&previous.split(':')[0]===roundKey.split(':')[0]&&Number(previous.split(':')[1])>=Number(roundKey.split(':')[1]))return;
  const patch={'system.health.value':Math.max(0,actor.system.health.value-1)};
  if(roundKey)patch['flags.10kswordsfoundry.blazeRound']=roundKey;
  if(!await actor.update(patch))throw new Error('Blaze damage could not be saved.');
  await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:'<p><strong>Blaze:</strong> 1 Burn; Armor is ignored.</p>'});
 });
}
export async function resolveOngoing(event,target){
 const actor=this.document;if(!actor.isOwner)return;await this.submit();
 try{
  if(target.dataset.condition==='blaze'){
   if(game.combat?.started)return ui.notifications.warn('Blaze is applied automatically when the combat round advances.');
   return await tickBlaze(actor);
  }
  await queueEquipment(actor,async()=>{
   if(!actor.system.conditions.toxic)return;
   const pool=actor.system.cultivations.spi+healthSutra(actor.system.health).penalty+(actor.system.checkBonus??0)+(inSamadhi(actor)?3:0);
   if(pool>1000)throw new Error('Please use at most 1,000 dice.');
   const roll=await new foundry.dice.Roll(checkFormula(pool)).evaluate();
   const summary=summarizeCheck(roll.dice.flatMap(d=>d.results.filter(r=>r.active!==false&&!r.discarded).map(r=>r.result)),3);
   await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:`<h3>Toxic — Quick Poison</h3><p>${summary.strikes} Strikes / Demand 3 · ${sixesHTML(summary.sixes)}</p><p>${summary.success?'Resisted this interval.':'Failed: suffer 2 Burn, ignoring Armor.'} Poison remains until treated.</p>`});
   if(!summary.success&&!await actor.update({'system.health.value':Math.max(0,actor.system.health.value-2)}))throw new Error('Poison damage could not be saved.');
   await enterSamadhi(actor,summary.sixes);
  });
 }catch(error){ui.notifications.warn(error.message);}
}
export function registerModConditions(){
 Hooks.on('updateCombat',async(combat,changes)=>{
  if(!game.user.isGM||game.users.activeGM?.id!==game.user.id||!combat.started||!Object.hasOwn(changes,'round')||combat.round<2)return;
  const actors=new Map(combat.combatants.contents.filter(c=>c.actor).map(c=>[c.actor.uuid,c.actor]));
  for(const actor of actors.values())try{await tickBlaze(actor,`${combat.id}:${combat.round}`);}catch(error){ui.notifications.error(error.message);}
 });
 Hooks.on('renderChatMessageHTML',(message,html)=>{
  const data=message.getFlag('10kswordsfoundry','defense');
  if(!data?.conditions?.length||!message.isContentVisible)return;
  const button=html.querySelector('[data-apply-mod-conditions]');if(!button)return;
  button.addEventListener('click',async()=>{
   button.disabled=true;
   try{
    const actor=await foundry.utils.fromUuid(data.actorUuid);
    if(!actor?.isOwner)throw new Error('You cannot change this defender.');
    await queueEquipment(actor,async()=>{
     const applied=actor.getFlag('10kswordsfoundry','conditionMessages')??[];if(applied.includes(message.id))return;
     const patch=Object.fromEntries(data.conditions.filter(k=>['blaze','toxic','lacerating','stun','hobbled'].includes(k)).map(k=>[`system.conditions.${k}`,true]));
     patch['flags.10kswordsfoundry.conditionMessages']=[...applied.slice(-99),message.id];
     if(!await actor.update(patch))throw new Error('Conditions could not be saved.');
    });button.textContent='Conditions applied';
   }catch(error){button.disabled=false;ui.notifications.warn(error.message);}
  });
 });
}
