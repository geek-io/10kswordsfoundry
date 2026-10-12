import test from 'node:test';
import assert from 'node:assert/strict';
import {injuryChanges} from '../scripts/conditions.mjs';
import {enterSamadhi} from '../scripts/roll-support.mjs';
import {armorTrack} from '../scripts/health.mjs';
import {boundedResources} from '../scripts/resources.mjs';
import {applyAbilityEffect} from '../scripts/ability-effects.mjs';
test('Worldbeings enter Samadhi on Bloodied once per rest, and active Samadhi is not refreshed',()=>{
 globalThis.game={time:{worldTime:10},combat:null};
 const source={health:{value:4,max:6},ardor:{max:4,burnt:2,installed:1},samadhi:{active:false},bloodiedSamadhiUsed:false};const next={...source,health:{value:3,max:6}};
 const actor={type:'npc',system:source};assert.equal(injuryChanges(actor,source,next).samadhi.active,true);assert.equal(injuryChanges(actor,source,next).ardor.burnt,1);
 assert.deepEqual(injuryChanges(actor,{...source,bloodiedSamadhiUsed:true},next),{});
 actor.system={...source,samadhi:{active:true,until:16}};const patch=injuryChanges(actor,source,next);assert.equal(patch.samadhi,undefined);assert.equal(patch.ardor,undefined);assert.equal(patch.bloodiedSamadhiUsed,true);
});
test('Worldbeing 666 activates Samadhi once and recovers only one burnt Ardor',async()=>{
 globalThis.game={time:{worldTime:10},combat:null};
 const actor={type:'npc',system:{ardor:{burnt:2},samadhi:{active:false}},toObject(){return {system:structuredClone(this.system)};},async update(p){this.system.samadhi=p['system.samadhi'];this.system.ardor.burnt=p['system.ardor.burnt'];return this;}};
 assert.match(await enterSamadhi(actor,3),/Entered Samadhi/);assert.equal(await enterSamadhi(actor,3),'');assert.equal(actor.system.ardor.burnt,1);
});
test('Armor track bounds selection and sheet submission preserves effect-added capacity',()=>{
 assert.deepEqual(armorTrack({max:3,value:2}).boxes.map(b=>b.filled),[true,true,false]);assert.equal(armorTrack({max:3,value:10}).value,3);assert.equal(armorTrack().boxes.length,0);
 const data={health:{max:6,value:6},armor:{max:2,value:4},ardor:{max:2,burnt:0,installed:0}};
 assert.deepEqual(boundedResources(data,'',6,4).armor,{max:2,value:4});
});
test('Passive modifiers apply once per source, update instead of stacking, remove and enforce ownership',async()=>{
 const actor={uuid:'Actor.enemy',isOwner:true,effects:{contents:[]},async createEmbeddedDocuments(type,rows){for(const row of rows){const effect={...row,id:'effect',getFlag:()=>row.flags['10kswordsfoundry'].abilitySource,async update(data){Object.assign(this,data);}};this.effects.contents.push(effect);}},async deleteEmbeddedDocuments(){this.effects.contents=[];}};
 const data={source:'Actor.caster:coat:0',name:'Killing Intent',key:'system.attackBonus',value:-3};
 await applyAbilityEffect(data,[actor,actor]);assert.equal(actor.effects.contents.length,1);assert.equal(actor.effects.contents[0].system.changes[0].value,-3);
 await applyAbilityEffect(data,[actor]);assert.equal(actor.effects.contents.length,1);
 await applyAbilityEffect(data,[actor],true);assert.equal(actor.effects.contents.length,0);
 actor.isOwner=false;await assert.rejects(applyAbilityEffect(data,[actor]),/GM/);
});
test('Automatic weapon ability uses zero AP, installs Ardor and posts its effect without rolling',async()=>{
 const {useAbility}=await import('../scripts/abilities.mjs');let messages=[],warnings=[];
 const ability={name:'Killing Intent',mode:'automatic',hostile:false,apCost:0,burnArdor:0,installArdor:1,description:'Affects eligible enemies within 3m; check attack targets.',effectKey:'system.attackBonus',effectValue:-3};
 const item={id:'weapon',name:'Crucible Focus',type:'weapon',system:{equipped:true,specialAttacks:[ability]}};
 const actor={uuid:'Actor.user',isOwner:true,system:{actions:0,health:{value:6,max:6},ardor:{max:2,burnt:0,installed:0},conditions:{hesitant:true}},items:{get:()=>item},toObject(){return {system:structuredClone(this.system)};},async update(p){for(const [key,value] of Object.entries(p)){const parts=key.split('.');let node=this;for(const part of parts.slice(0,-1))node=node[part];node[parts.at(-1)]=value;}return this;}};
 globalThis.foundry={utils:{cleanHTML:v=>v},applications:{api:{DialogV2:{prompt:async()=>({check:true,attack:true,hostile:true,attackPool:'vio',defensePool:'grc',adjustment:0,demand:2,shape:'none',size:0})}}},dice:{Roll:class{constructor(){throw Error('Must not roll an automatic ability');}}},documents:{ChatMessage:{getSpeaker:()=>({}),create:async data=>messages.push(data)}}};globalThis.ui={notifications:{warn:m=>warnings.push(m)}};
 await useAbility.call({document:actor,submit:async()=>{}},null,{dataset:{itemId:'weapon',specialIndex:'0'}});
 assert.deepEqual(warnings,[]);assert.equal(actor.system.actions,0);assert.equal(actor.system.ardor.installed,1);assert.equal(messages.length,1);assert.match(messages[0].content,/eligible enemies/);assert.equal(messages[0].flags['10kswordsfoundry'].abilityEffect.value,-3);
});
