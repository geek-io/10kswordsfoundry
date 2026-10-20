import {recentAttacks,escapeHTML,clashDice,resolveDefense} from './resolution.mjs?v=0.1.45';
import {assertAction} from './conditions.mjs?v=0.1.45';
import {wieldedWeapons,inSamadhi,enterSamadhi,sixesHTML,tagBonus} from './roll-support.mjs?v=0.1.45';
import {attackCultivation} from './combat.mjs?v=0.1.45';
import {modifierProfile} from './modifiers.mjs?v=0.1.45';
import {weaponDetails} from './weapons.mjs?v=0.1.45';
import {useWeapon} from './equipment.mjs?v=0.1.45';
import {healthSutra} from './health.mjs?v=0.1.45';
import {CULTIVATIONS,checkFormula,summarizeCheck} from './rules.mjs?v=0.1.45';
export async function interruptAttack() {
 if(!this.isEditable||this._interrupting) return;
 this._interrupting=true;
 try {
  await this.submit();const actor=this.document;
  assertAction(actor,{interrupt:true});
  if((actor.system.actions??3)<1) throw new Error('You have no Actions remaining.');
  const attacks=recentAttacks();if(!attacks.length) throw new Error('No visible attack is available. Roll the incoming attack first, then Interrupt it before applying damage.');
  const weapons=wieldedWeapons(actor);
  const input=await foundry.applications.api.DialogV2.prompt({classes:['swords-attack-dialog'],position:{width:560,height:620},window:{title:'Interrupt an attack'},content:`<label>Incoming attack<select name="attack">${attacks.map(m=>`<option value="${m.id}">${escapeHTML(m.speaker?.alias??'Attacker')}: ${escapeHTML(m.getFlag('10kswordsfoundry','attack').name)}</option>`).join('')}</select></label><label>Response<select name="mode"><option value="clash">Clash — matching dice cancel</option><option value="sabotage">Sabotage — opposed check to weaken the attack</option></select></label><label>Clash weapon<select name="weapon">${weapons.map(w=>`<option value="${w.id}">${escapeHTML(w.name)}</option>`).join('')}</select></label><label>Sabotage Cultivation<select name="cultivation">${Object.entries(CULTIVATIONS).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label><label><input type="checkbox" name="disarm"> Disarm attempt (uses Disarming bonus; Worn weapons cannot be disarmed)</label><label>Other adjustments<input name="adjustment" type="number" step="1" value="0"></label><p>Costs an Action (two for a Colossal Clash). Resolve interrupts before applying the original attack. Sabotage success calls for a revised attack at -2 ATK or a table-confirmed disarm; it does not remove two Strikes from an already rolled pool.</p>`,ok:{label:'Interrupt',callback:(e,b)=>({attack:b.form.elements.attack.value,mode:b.form.elements.mode.value,weapon:b.form.elements.weapon.value,key:b.form.elements.cultivation.value,adjustment:Number(b.form.elements.adjustment.value),disarm:b.form.elements.disarm.checked})},rejectClose:false});
  if(!input) return;
  const message=attacks.find(m=>m.id===input.attack);if(!message?.isContentVisible) throw new Error('That attack is no longer visible.');
  const incoming=message.getFlag('10kswordsfoundry','attack');
  if(incoming.profile?.uninterruptible)throw Error('This attack is Uninterruptible.');
  if(!Number.isSafeInteger(input.adjustment)||!Object.hasOwn(CULTIVATIONS,input.key)) throw new Error('Choose a Cultivation and whole-number adjustment.');
  if(input.disarm&&incoming.profile.keys?.includes('worn')) throw new Error('Worn: this weapon cannot be disarmed.');
  const perform=async(weapon=null,ammo=null)=>{
   assertAction(actor,{interrupt:true,attack:!!weapon,hostile:true});
   const injury=healthSutra(actor.system.health);if(injury.knockedOut) throw new Error('You are Knocked Out.');
   const profile=weapon?modifierProfile(weapon.system,{ammo}):null;
   const cost=profile?.actions??1;if((actor.system.actions??3)<cost) throw new Error(`You need ${cost} Actions.`);
   const key=weapon?attackCultivation(weapon.system):input.key;
   const bonus=weapon?weaponDetails(weapon.system).attack+(actor.system.attackBonus??0):input.disarm?tagBonus(actor,'disarming'):0;
   const pool=actor.system.cultivations[key]+(actor.system.checkBonus??0)+injury.penalty+(inSamadhi(actor)?3:0)+bonus+input.adjustment;
   if(pool>1000) throw new Error('Please use a pool of 1,000 dice or fewer.');
   const formula=profile?.precise?(pool<=0?'2d6r1kl1cs>=4':`${pool}d6r1cs>=4`):checkFormula(pool);
   const roll=await new foundry.dice.Roll(formula).evaluate();
   const dice=roll.dice.flatMap(d=>d.results.filter(r=>r.active!==false&&!r.discarded).map(r=>r.result));
   const summary=summarizeCheck(dice,1);let text,remaining;
   if(weapon) {
    remaining=clashDice(incoming.results,dice);
    const suffered=resolveDefense({...incoming,results:remaining.incoming},[],actor.system.armor?.value??0,actor.system.conditions);
    const dealt=resolveDefense({results:remaining.interrupt,profile},[],0);
    text=`Clash: ${remaining.incoming.filter(n=>n>=4).length} incoming Strikes remain. Incoming Armor loss: ${suffered.armorLoss}; Health loss: ${suffered.healthLoss}. Your counterattack: ${dealt.wounds} potential ${escapeHTML(profile.damage)} Wounds before the opponent's Armor. ${suffered.wounds===0?'The incoming attack is stopped against you.':''}`;
   } else {
    const opposing=incoming.results.filter(n=>n>=4).length;
    text=summary.strikes>opposing?'Sabotage succeeds: revise the incoming attack at -2 ATK, or resolve a confirmed disarm.':summary.strikes===opposing?'Tie: reroll the opposed check (p.25).':'Sabotage fails: the original attack continues.';
    text+=` Opposed totals: ${summary.strikes} vs ${opposing}.`;
   }
   let samadhi='';try{samadhi=await enterSamadhi(actor,summary.sixes);}catch(error){ui.notifications.warn(error.message);}
   await roll.toMessage({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flags:{'10kswordsfoundry':{interrupt:{attackId:message.id,mode:input.mode,remaining}}},flavor:`${escapeHTML(actor.name)} interrupts ${escapeHTML(incoming.name)}. ${summary.strikes} total Strikes. ${sixesHTML(summary.sixes)}. Pool: ${pool}.<p>${text}</p><p>Calculated only. Do not apply both this result and the original attack against this defender. Attack reference: ${message.id}.</p>${samadhi}`},{messageMode:game.settings.get('core','messageMode')});
   try{await actor.update({'system.actions':Math.max(0,(actor.toObject().system.actions??3)-cost)});}catch{ui.notifications.warn('Roll completed; adjust Actions manually.');}
  };
  if(input.mode==='clash') {if(!weapons.some(w=>w.id===input.weapon)) throw new Error('Equip a weapon to Clash.');await useWeapon(actor,input.weapon,perform);}
  else if(input.mode==='sabotage') await perform();
 }catch(error){ui.notifications.warn(error.message);}finally{this._interrupting=false;}
}
