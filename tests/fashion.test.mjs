import test from "node:test";
import assert from "node:assert/strict";
import {fashionResources, changeFashion} from "../scripts/fashion.mjs";
const resources=()=>({armor:{max:4,value:2},ardor:{max:5,burnt:1,installed:2}});
const outfit={armor:2,ardor:3,equipped:true};
test("equipping Fashion increases both capacities and available resources",()=>{
  assert.deepEqual(fashionResources(resources(),null,outfit),{armor:{max:6,value:4},ardor:{max:8,burnt:1,installed:2}});
});
test("zero bonuses and unchanged equipped items do not refill resources",()=>{
  assert.deepEqual(fashionResources(resources(),null,{armor:0,ardor:0,equipped:true}),resources());
  assert.deepEqual(fashionResources(resources(),outfit,outfit),resources());
});
test("editing an equipped Fashion applies only the difference",()=>{
  const current=fashionResources(resources(),null,outfit);
  const result=fashionResources(current,outfit,{...outfit,armor:3,ardor:4});
  assert.deepEqual(result,{armor:{max:7,value:5},ardor:{max:9,burnt:1,installed:2}});
});
test("unequip reverses bonuses and floors depleted Armor at zero",()=>{
  const current=fashionResources(resources(),null,outfit);
  assert.deepEqual(fashionResources(current,outfit,null),resources());
  current.armor.value=1;
  assert.equal(fashionResources(current,outfit,null).armor.value,0);
});
test("removing committed Ardor capacity is blocked; invalid bonuses are rejected",()=>{
  assert.throws(()=>fashionResources(resources(),outfit,null),/Free up enough Ardor/);
  for(const armor of [-1,0.5,NaN]) assert.throws(()=>fashionResources(resources(),null,{...outfit,armor}),/whole numbers/);
});
function merge(a,b) {
  const out=structuredClone(a);
  for(const [key,value] of Object.entries(b)) out[key]=value && typeof value==='object' && !Array.isArray(value) ? merge(out[key]??{},value) : value;
  return out;
}
globalThis.foundry={utils:{mergeObject:merge}};
function fixture() {
  let state={name:'Test',system:{...resources(),mag:20},items:[{_id:'fashion',type:'fashion',name:'Robe',system:{...outfit,equipped:false}},{_id:'gear',type:'gear'}],effects:[]};
  let writes=0;
  const actor={isOwner:true,toObject:()=>structuredClone(state),items:{get:id=>state.items.find(i=>i._id===id)},update:async(data,options)=>{assert.deepEqual(options,{diff:false,recursive:false}); state=data; writes++; return actor;}};
  return {actor,get state(){return state;},get writes(){return writes;}};
}
test("equip, edit, and removal atomically save resources and preserve unrelated data",async()=>{
  const f=fixture();
  await changeFashion(f.actor,'fashion',{}, {toggle:true});
  assert.equal(f.state.system.armor.max,6); assert.equal(f.state.items[0].system.equipped,true);
  await changeFashion(f.actor,'fashion',{system:{armor:4}});
  assert.equal(f.state.system.armor.max,8);
  await changeFashion(f.actor,'fashion',{}, {remove:true});
  assert.equal(f.state.system.armor.max,4); assert.equal(f.state.system.ardor.max,5);
  assert.equal(f.state.system.mag,20); assert.deepEqual(f.state.items,[{_id:'gear',type:'gear'}]);
  assert.equal(f.writes,3);
});
test("rapid toggles serialize without stacking and rejected changes write nothing",async()=>{
  const f=fixture();
  await Promise.all([changeFashion(f.actor,'fashion',{}, {toggle:true}),changeFashion(f.actor,'fashion',{}, {toggle:true})]);
  assert.equal(f.state.system.armor.max,4);
  f.actor.isOwner=false;
  await assert.rejects(changeFashion(f.actor,'fashion',{}, {toggle:true}),/cannot change/);
  assert.equal(f.writes,2);
});
