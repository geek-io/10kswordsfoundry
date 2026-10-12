import test from 'node:test';
import assert from 'node:assert/strict';
import {changeEquipment} from '../scripts/equipment.mjs';
import {abilityView} from '../scripts/ability-state.mjs';
import {useAbility} from '../scripts/abilities.mjs';
function fixture(type,install=1){
 let source={system:{actions:3,carry:8,meridians:3,health:{max:6,value:6},ardor:{max:6,burnt:0,installed:1},cultivations:{spi:3}},items:[{_id:'ability',id:'ability',name:'Ability',type,system:{equipped:false,apCost:2,burnArdor:1,installArdor:install,paidArdor:0}}]};
 const actor={isOwner:true,items:{get:()=>source.items[0],get contents(){return source.items;}},get system(){return source.system;},toObject:()=>structuredClone(source),async update(data){if(data.system)source=structuredClone(data);else for(const [key,value]of Object.entries(data)){if(key==='items')source.items=structuredClone(value);else {const parts=key.split('.');let node=source;for(const p of parts.slice(0,-1))node=node[p];node[parts.at(-1)]=value;}}return actor;}};
 return actor;
}
test('both ability types activate directly, pay AP/Burn, and release or remove only their installation',async()=>{
 globalThis.game={};let warnings=[],messages=0;
 globalThis.ui={notifications:{warn:m=>warnings.push(m)}};
 globalThis.foundry={utils:{mergeObject:(a,b)=>({...a,...b})},applications:{api:{DialogV2:{prompt:async()=>({attack:false,check:false,hostile:false,attackPool:'spi',defensePool:'grc',adjustment:0,demand:2,shape:'none',size:0})}}},documents:{ChatMessage:{getSpeaker:()=>({}),create:async()=>messages++}}};
 for(const type of ['technique','magick'])for(const install of [0,2]){
  const actor=fixture(type,install),sheet={document:actor,submit:async()=>{}};
  assert.equal(abilityView(actor.items.get()).actionLabel,install?'Internalize':'Activate');
  await useAbility.call(sheet,null,{dataset:{itemId:'ability'}});
  assert.deepEqual([actor.system.actions,actor.system.ardor.burnt,actor.system.ardor.installed],[1,1,1+install]);
  assert.equal(actor.items.get().system.paidArdor,install);
  if(install){
   await useAbility.call(sheet,null,{dataset:{itemId:'ability'}});assert.match(warnings.at(-1),/already/);
   await changeEquipment(actor,'ability',{},type==='magick'?{remove:true}:{toggle:true});
   assert.deepEqual([actor.system.actions,actor.system.ardor.burnt,actor.system.ardor.installed],[1,1,1]);
  }else{
   await useAbility.call(sheet,null,{dataset:{itemId:'ability'}});assert.match(warnings.at(-1),/AP/);
  }
 }
 assert.equal(messages,4);
});
