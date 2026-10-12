import test from "node:test";
import assert from "node:assert/strict";
import {equipmentResources, changeEquipment, attackBonus} from "../scripts/equipment.mjs";
const resources=()=>({meridians:3,carry:8,armor:{max:2,value:1},ardor:{max:4,burnt:1,installed:1}});
const item=(type,system={})=>({_id:'item',id:'item',type,system:{equipped:true,meridianCost:1,slots:2,quantity:2,...system}});
test("Only Licenses spend Meridians",()=>{
  for(const type of ['license']) {
    const result=equipmentResources(resources(),null,item(type));
    assert.equal(result.resources.meridians,2,type);
    assert.equal(result.resources.carry,8,type);
    assert.equal(result.paidMeridians,1,type);
  }
});
test("stowed weapons spend quantity times slots without spending Meridians",()=>{
  const result=equipmentResources(resources(),null,item('weapon'));
  assert.equal(result.resources.carry,4); assert.equal(result.resources.meridians,3);
  assert.equal(result.paidCarry,4);
});
test("edits charge only the difference and removal refunds recorded amounts",()=>{
  const previous=item('weapon',{paidCarry:4});
  const system={...resources(),carry:4};
  assert.equal(equipmentResources(system,previous,item('weapon',{slots:3})).resources.carry,2);
  assert.equal(equipmentResources(system,previous,null).resources.carry,8);
  assert.equal(equipmentResources(system,previous,previous).resources.carry,4);
});
test("insufficient capacity rejects equip; zero costs are allowed",()=>{
  assert.throws(()=>equipmentResources({...resources(),meridians:0},null,item('license')),/Open Meridians/);
  assert.throws(()=>equipmentResources({...resources(),carry:3},null,item('weapon')),/Carry capacity/);
  assert.equal(equipmentResources(resources(),null,item('gear',{meridianCost:0})).resources.meridians,3);
});
test("legacy equipped Fashion does not refund a Meridian it never spent",()=>{
  const previous=item('fashion',{armor:2,ardor:0});
  const result=equipmentResources(resources(),previous,null);
  assert.equal(result.resources.meridians,3);
  assert.equal(result.resources.armor.max,0);
});
test("attack uses just the selected equipped weapon, never a normal check",()=>{
  const weapons=[item('weapon',{bonus:2}),{...item('weapon',{bonus:5}),id:'other'}];
  assert.equal(attackBonus(weapons,true,'item'),2);
  assert.equal(attackBonus(weapons,false,'item'),0);
  assert.equal(attackBonus(weapons,true,''),0);
  weapons[0].system.equipped=false;
  assert.throws(()=>attackBonus(weapons,true,'item'),/equipped weapon/);
});
function merge(a,b) {
  const out=structuredClone(a);
  for(const [key,value] of Object.entries(b)) out[key]=value && typeof value==='object' && !Array.isArray(value) ? merge(out[key]??{},value) : value;
  return out;
}
globalThis.foundry={utils:{mergeObject:merge}};
function fixture(type='weapon') {
  let state={system:resources(),items:[item(type,{equipped:false})],effects:[]},writes=0;
  const actor={get system(){return state.system;},isOwner:true,toObject:()=>structuredClone(state),items:{get:id=>state.items.find(i=>i._id===id)},update:async data=>{state=data;writes++;return actor;}};
  return {actor,get state(){return state;},get writes(){return writes;}};
}
test("queued toggles, equipped edits, and removal persist exact resource accounting",async()=>{
  const f=fixture();
  await Promise.all([changeEquipment(f.actor,'item',{}, {toggle:true}),changeEquipment(f.actor,'item',{}, {toggle:true})]);
  assert.equal(f.state.system.carry,4);
  await changeEquipment(f.actor,'item',{}, {toggle:true});
  assert.equal(f.state.system.carry,6);
  await changeEquipment(f.actor,'item',{system:{quantity:3}});
  assert.equal(f.state.system.carry,4);
  assert.equal(f.state.items[0].system.paidCarry,4);
  await changeEquipment(f.actor,'item',{}, {remove:true});
  assert.equal(f.state.system.carry,8); assert.equal(f.state.items.length,0);
});
test("failed equip/edit leaves item and actor untouched",async()=>{
  const f=fixture('license');
  await assert.rejects(changeEquipment(f.actor,'item',{system:{equipped:true,meridianCost:4}}),/Open Meridians/);
  assert.equal(f.writes,0); assert.equal(f.state.items[0].system.equipped,false);
  f.actor.isOwner=false;
  await assert.rejects(changeEquipment(f.actor,'item',{}, {toggle:true}),/cannot change/);
  assert.equal(f.writes,0);
});
