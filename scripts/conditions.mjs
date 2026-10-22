// Rules 2.0.3 p.78. Conditions are removed through their fictional remedy.
export const CONDITIONS={blaze:"1 Burn at round end, ignoring Armor. Extinguish the fire to remove.",lacerating:"Bleeding: subsequent attacks with uncancelled Strikes deal +1 Wound per attack.",toxic:"Quick Poison: every 10 minutes, roll SPI against Demand 3 or suffer 2 Burn. Treat the poison to remove.",confusion:"Cannot speak or understand speech.",daze:"-1 to all checks.",encumbered:"MOV 1; halve Cultivations (round down); cannot take Actions.",hesitant:"Cannot perform hostile Actions.",hobbled:"MOV -2; GRC -2.",knockdown:"MOV 1; cannot attack; only stand, crawl or flail.",stun:"Lose 1 Action when applied; cannot Interrupt.",stagger:"-2 Defense."};
export function conditionStats(system) {
 const c=system.conditions??{},cultivations={...system.cultivations};
 if(c.encumbered) for(const key of Object.keys(cultivations)) cultivations[key]=Math.floor(cultivations[key]/2);
 if(c.hobbled) cultivations.grc=Math.max(0,(cultivations.grc??0)-2);
 return {cultivations,movement:c.encumbered||c.knockdown?1:Math.max(0,system.movement-(c.hobbled?2:0)),checkBonus:(system.checkBonus??0)-(c.daze?1:0),defenseBonus:(system.defenseBonus??0)-(c.stagger?2:0)};
}
export function assertAction(actor,{attack=false,cast=false,hostile=false,interrupt=false}={}) {
 const c=actor.system.conditions??{};
 if(c.encumbered) throw new Error("Encumbered: you cannot perform Actions.");
 if(c.stun&&interrupt) throw new Error("Stun: you cannot Interrupt.");
 if(c.knockdown&&(attack||cast)) throw new Error("Knockdown: you can only stand, crawl or flail.");
 if(c.hesitant&&(attack||hostile)) throw new Error("Hesitant: you cannot perform hostile Actions.");
 if(c.confusion&&cast) throw new Error("Confusion: you cannot speak the Magick's mantra.");
}
export function restChanges(source) {
 return {health:{...source.health,value:Math.min(source.health.max,source.health.value+1)},ardor:{...source.ardor,burnt:0,installed:0},bloodiedSamadhiUsed:false,samadhi:{...source.samadhi,active:false},actions:3};
}
// Called only at a real document update, including token Health edits.
export function injuryChanges(actor,source,next) {
 const patch={};
 if(!source.conditions?.stun && next.conditions?.stun) patch.actions=Math.max(0,(next.actions??3)-1);
 if(!["wanderer","npc"].includes(actor.type) || source.bloodiedSamadhiUsed || source.health.value<=3 || next.health.value>3 || next.health.value<=0 || next.health.value>=source.health.value) return patch;
 patch.bloodiedSamadhiUsed=true;
 if(!inSamadhi(actor)) {
  const combat=game.combat?.started?game.combat:null;
  patch.samadhi={active:true,combatId:combat?.id??"",round:combat?.round??0,until:(game.time?.worldTime??0)+6};
  patch.ardor={...next.ardor,burnt:Math.max(0,next.ardor.burnt-1)};
 }
 return patch;
}
import {inSamadhi} from "./roll-support.mjs?v=0.1.47";
