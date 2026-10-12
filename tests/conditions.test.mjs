import test from "node:test";
import assert from "node:assert/strict";
import {conditionStats,assertAction,restChanges,injuryChanges} from "../scripts/conditions.mjs";
test("conditions modify effective ratings without damaging base values",()=>{
 const source={cultivations:{vio:5,grc:7},movement:6,checkBonus:2,defenseBonus:1,conditions:{encumbered:true,hobbled:true,daze:true,stagger:true}};
 const stats=conditionStats(source);
 assert.deepEqual(stats,{cultivations:{vio:2,grc:1},movement:1,checkBonus:1,defenseBonus:-1});
 assert.equal(source.cultivations.grc,7);
 assert.equal(conditionStats({...source,conditions:{hobbled:true}}).movement,4);
});
test("conditions block prohibited actions but permit Defense and beneficial choices",()=>{
 for(const [condition,action] of [["encumbered",{}],["hesitant",{attack:true}],["knockdown",{attack:true}],["confusion",{cast:true}],["stun",{interrupt:true}]]) assert.throws(()=>assertAction({system:{conditions:{[condition]:true}}},action));
 assert.doesNotThrow(()=>assertAction({system:{conditions:{hesitant:true}}},{cast:true,hostile:false}));
});
test("Bloodied Samadhi triggers once from damage, and rest resets it without healing Armor or conditions",()=>{
 globalThis.game={time:{worldTime:10},combat:null};
 const source={health:{value:4,max:6},armor:{value:1,max:4},ardor:{max:4,burnt:2,installed:1},samadhi:{active:false},conditions:{daze:true},actions:1,bloodiedSamadhiUsed:false};
 const actor={type:"wanderer",system:source};
 const next={...source,health:{value:3,max:6}};
 const patch=injuryChanges(actor,source,next);
 assert.equal(patch.bloodiedSamadhiUsed,true);assert.equal(patch.samadhi.active,true);assert.equal(patch.ardor.burnt,1);assert.equal(patch.ardor.installed,1);
 assert.deepEqual(injuryChanges(actor,{...source,bloodiedSamadhiUsed:true},next),{});
 assert.deepEqual(injuryChanges(actor,source,{...next,health:{value:0,max:6}}),{});
 const rested=restChanges({...next,...patch});
 assert.equal(rested.health.value,4);assert.equal(rested.ardor.burnt,0);assert.equal(rested.ardor.installed,0);assert.equal(rested.bloodiedSamadhiUsed,false);assert.equal(rested.samadhi.active,false);
 assert.equal(rested.armor,undefined);assert.equal(rested.conditions,undefined);
 const healed={...source,...rested};assert.equal(injuryChanges({type:"wanderer",system:healed},healed,{...healed,health:{value:3,max:6}}).samadhi.active,true);
 assert.equal(restChanges({...source,health:{value:6,max:6}}).health.value,6);
});
test("Stun deducts one Action on application, not on unrelated subsequent edits",()=>{
 const source={health:{value:6},conditions:{},actions:3},actor={type:"npc"};
 assert.equal(injuryChanges(actor,source,{...source,conditions:{stun:true}}).actions,2);
 assert.deepEqual(injuryChanges(actor,{...source,conditions:{stun:true}},{...source,conditions:{stun:true}}),{});
});
