import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {previewWorldBeings} from '../scripts/worldbeing-sources.mjs';
import {resolveEffectValue} from '../scripts/effect-values.mjs';
import {applyJobToActor} from '../scripts/jobs.mjs';
const stats=n=>Object.fromEntries(['vio','dia','grc','sav','wrd','spi'].map(k=>[k,n]));
test('World Being preview copies full world/compendium records, prefers world matches and resolves possessives',async()=>{
 const world={name:'Rage',type:'trait',system:{description:'world',level:2},effects:[]};
 const packed={name:'Ascetic’s Meditation',type:'trait',system:{description:'compendium',level:3},effects:[{name:'bonus',system:{changes:[]}}]};
 const loaded=[];globalThis.game={user:{isGM:true},items:{contents:[{uuid:'Item.world',toObject:()=>structuredClone(world)}]},packs:[{collection:'test.traits',documentName:'Item',visible:true,metadata:{label:'Traits'},getIndex:async()=>[{_id:'rage',name:'Rage',type:'trait'},{_id:'ascetic',name:packed.name,type:'trait'},{_id:'unrelated',name:'Other',type:'trait'}]}]};
 globalThis.foundry={utils:{fromUuid:async uuid=>{loaded.push(uuid);return {toObject:()=>structuredClone(packed)};}}};
 const [record]=await previewWorldBeings(['BEAST\nHEALTH 6\nVIO 3 DIA 1 GRC 2 SAV 2 WRD 1 SPI 1\n[TRAIT] Rage, Ascetic Meditation']);
 assert.deepEqual(loaded,['Compendium.test.traits.Item.ascetic']);assert.equal(record.actor.items[0].system.description,'world');assert.equal(record.actor.items[1].system.level,3);assert.equal(record.actor.items[1].effects.length,1);assert.ok(record.warnings.some(w=>w.includes('from Traits')));assert.equal(record.actor.items[0]._importUuid,undefined);
});
test('effect variables use the owning Item, allow Actor references, and reject nonnumeric or unsafe paths',()=>{
 const item={documentName:'Item',system:{level:1}},effect={parent:item},actor={system:{level:9,movement:6}};
 assert.equal(resolveEffectValue('System.Level',effect,actor),'(1)');assert.equal(resolveEffectValue('2 * @system.level + @actor.system.movement',effect,actor),'2 * (1) + (6)');
 item.system.level=3;assert.equal(resolveEffectValue('@item.system.Level',effect,actor),'(3)');assert.equal(resolveEffectValue(2,effect,actor),2);
 assert.throws(()=>resolveEffectValue('system.nope',effect,actor),/Unknown/);assert.throws(()=>resolveEffectValue('system.constructor',effect,actor),/Unknown/);
 item.system.level='bad';assert.throws(()=>resolveEffectValue('system.level',effect,actor),/numeric/);
});
test('replacing Jobs swaps only their own grants and reverses equipment resources',async()=>{
 let n=0;globalThis.foundry={utils:{randomID:()=>`id${++n}`,deepClone:structuredClone}};
 let state={system:{cultivations:stats(1),carry:8,meridians:2,armor:{value:0,max:0},ardor:{max:4,burnt:0,installed:0}},items:[{_id:'manual',type:'gear',name:'Manual',system:{quantity:1,slots:0}}]};
 const actor={type:'wanderer',isOwner:true,toObject:()=>structuredClone(state),items:{get:id=>state.items.find(i=>i._id===id)},update:async data=>{state=data;return actor;}};
 const job=(name,type,system)=>({name,type:'job',system:{cultivations:stats(2),grants:[{id:'same-grant-id',name:name+' gear',type,system,effects:[]}]}});
 await applyJobToActor(actor,job('A','fashion',{armor:2,ardor:1,quantity:1,slots:1,equipped:false}),{origin:'Item.A'});
 const fashion=state.items.find(i=>i.type==='fashion');fashion.system.equipped=true;fashion.system.paidCarry=0;state.system.carry=8;state.system.armor={value:2,max:2};state.system.ardor.max=5;
 await applyJobToActor(actor,job('B','gear',{quantity:1,slots:2,equipped:false}),{origin:'Item.B'});
 assert.equal(state.items.some(i=>i.type==='fashion'),false);assert.ok(state.items.some(i=>i._id==='manual'));assert.equal(state.system.carry,6);assert.equal(state.system.armor.max,0);assert.equal(state.system.ardor.max,4);
 await applyJobToActor(actor,state.items.find(i=>i.type==='job'));assert.equal(state.items.filter(i=>i.flags?.['10kswordsfoundry']?.jobGrantId).length,1);assert.equal(state.system.carry,6);
});
test('Grimoire catalog contains exactly 36 complete distinct Traits with source pages and Level effects',()=>{
 const {items}=JSON.parse(readFileSync('data/grimoire-traits.json','utf8'));assert.equal(items.length,36);assert.equal(new Set(items.map(i=>i.name)).size,36);
 for(const item of items){assert.equal(item.type,'trait');assert.match(item.system.source,/p\.1(?:1[4-9]|20);/);assert.ok(!item.system.description.includes('TRAITS ARE DYNAMIC'));assert.ok(!item.system.description.includes('\n'));}
 assert.equal(items.find(i=>i.name==='Primafascist').system.description.includes('Requires table consent'),true);
 assert.equal(items.find(i=>i.name==='Animal Magnetism').effects[0].system.changes[0].value,'@system.level');assert.equal(items.find(i=>i.name==='Adamance').effects[0].system.changes[0].key,'system.health.max');
});
