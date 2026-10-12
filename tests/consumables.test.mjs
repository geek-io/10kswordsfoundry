import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveryUse,useConsumable} from '../scripts/consumables.mjs';
function source(){return {system:{health:{value:5,max:6},ardor:{max:5,burnt:2,installed:2},actions:3,carry:7,meridians:2},items:[{_id:'pill',type:'gear',name:'Chakra Pill',system:{quantity:1,slots:1,paidCarry:1,paidMeridians:0,equipped:false,consumable:{enabled:true,burntArdor:1,health:0,apCost:1}}}]};}
test('recovery persists burnt Ardor, consumes one, refunds Carry and preserves installed Ardor',()=>{
 const s=source(),result=recoveryUse(s,'pill',{inCombat:true});assert.equal(result.next.system.ardor.burnt,1);assert.equal(result.next.system.ardor.installed,2);assert.equal(result.next.items[0].system.quantity,0);assert.equal(result.next.system.actions,2);assert.equal(result.next.system.carry,8);assert.equal(s.system.ardor.burnt,2);
});
test('recovery bounds, full recovery, effective Health maximum, and zero-benefit protection',()=>{
 const s=source();s.items[0].system.consumable={enabled:true,allHealth:true,allBurntArdor:true,apCost:1};
 const result=recoveryUse(s,'pill',{maximumHealth:8});assert.equal(result.next.system.health.value,8);assert.equal(result.next.system.ardor.burnt,0);assert.equal(result.next.system.actions,3);
 s.system.health.value=8;s.system.ardor.burnt=0;assert.throws(()=>recoveryUse(s,'pill',{maximumHealth:8}),/nothing/);
 s.system.ardor.burnt=1;s.items[0].system.quantity=0;assert.throws(()=>recoveryUse(s,'pill'),/none/);
 s.items[0].system.quantity=1;s.system.actions=0;assert.throws(()=>recoveryUse(s,'pill',{inCombat:true}),/AP/);
});
test('cancel spends nothing and concurrent confirmed uses cannot consume the last item twice',async()=>{
 let state=source(),answer=false,saves=0,messages=0,warnings=[];
 const actor={isOwner:true,inCombat:true,get system(){return state.system;},toObject:()=>structuredClone(state),items:{get:()=>({...state.items[0],id:'pill'})},async update(next){state=next;saves++;return this;}};
 globalThis.game={combat:{started:true}};globalThis.ui={notifications:{warn:m=>warnings.push(m)}};
 globalThis.foundry={applications:{api:{DialogV2:{confirm:async()=>answer}}},documents:{ChatMessage:{getSpeaker:()=>({}),create:async()=>messages++}}};
 const sheet={isEditable:true,document:actor,submit:async()=>{}},target={dataset:{itemId:'pill'}};
 await useConsumable.call(sheet,null,target);assert.equal(saves,0);
 answer=true;await Promise.all([useConsumable.call(sheet,null,target),useConsumable.call(sheet,null,target)]);
 assert.equal(saves,1);assert.equal(messages,1);assert.equal(state.system.ardor.burnt,1);assert.match(warnings.at(-1),/none/);
});
