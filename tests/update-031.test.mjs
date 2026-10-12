import test from 'node:test';
import assert from 'node:assert/strict';
import {parseImport} from '../scripts/import-data.mjs';
import {parseWorldBeings} from '../scripts/worldbeing-import.mjs';
import {filterLibrary,searchableItem} from '../scripts/library-service.mjs';
import {grantSnapshot,grantedItems} from '../scripts/job-grants.mjs';
import {equipmentEffectSuppressed} from '../scripts/effects.mjs';
test('numbered Traits split independently and discard introductory page text',()=>{
 const records=parseImport('114\nChoose your Traits.\n1 1 Animal Magnetism\nAdd one die.\n1 2 Dialectician\nReason with them.\nTRAITS','text','trait');
 assert.deepEqual(records.map(r=>r.item.name),['Animal Magnetism','Dialectician']);
 assert.ok(!records[0].item.system.description.includes('Reason with them'));
 assert.equal(parseImport('213\n3 — Dragon Eye. The WB has 4 Actions.\n4 — Rage. Adds strength.','text','trait')[0].item.name,'Dragon Eye');
});
const block=`BEAST\nA creature.\nHEAL TH [-0] [-0] [-0] [-1] [-1] [-3] [KO]\nSIDHI 0 ARDOR 3 MOV 8 ARMOR 2\nVIO✦✦✦DIA✦ GRC✦✦SA V✦✦WRD✦SPI✦\n[TRAIT] Claws (+1 attack), Rage\n[MICROCOSMIC ORBIT] Red Gun Focus, Unknown Spell`;
test('World Being parser resolves names by allowed types and preserves missing descriptions',()=>{
 const world=[{_id:'w',name:'Red Gun Focus',type:'weapon',system:{description:'Wrong type'}},{_id:'t',name:'Red Gun Focus',type:'technique',system:{description:'Correct type',equipped:true},effects:[{_id:'effect',name:'Focus'}]}];
 const [record]=parseWorldBeings(block,world),actor=record.actor;
 assert.equal(actor.system.cultivations.vio,3);assert.equal(actor.system.health.max,6);assert.equal(actor.system.movement,8);
 assert.equal(actor.items[0].system.description,'<p>(+1 attack)</p>');assert.equal(actor.items[1].system.description,'');
 assert.equal(actor.items[2].type,'technique');assert.equal(actor.items[2].system.description,'Correct type');assert.equal(actor.items[2]._id,undefined);assert.equal(actor.items[2].effects[0]._id,undefined);
 assert.equal(actor.items[2].system.equipped,false);assert.equal(actor.items[0].system.active,false);assert.equal(world[1].system.equipped,true);
 assert.ok(record.warnings.some(w=>w.includes('Unknown Spell')));
});
test('World Being parser handles multiple blocks, inline Magicks, malformed Orbit brackets and ambiguity',()=>{
 const text=block+'\nGOBLIN\nHEALTH 6\nSIDHI 0 ARDOR 4 MOV 6\nVIO 2 DIA 1 GRC 3 SAV 4 WRD 2 SPI 1\n[MICROCOSMIC ORBIT — GOBLIN MAGICKS]\nJAUNT [✹][✦] Teleport 10m.\nBEFRAZZLE [✹][✦] SAV vs SPI Magick Attack in 10m.';
 const records=parseWorldBeings(text);assert.equal(records.length,2);assert.equal(records[1].actor.items.length,2);assert.equal(records[1].actor.items[1].system.attackPool,'sav');assert.equal(records[1].actor.items[0].system.burnArdor,1);
 const [r]=parseWorldBeings(block.replace('[MICROCOSMIC ORBIT] Red Gun Focus, Unknown Spell','[MICROCOSMIC ORBIT—[MOCK HEAVEN], [GREA T SAGE CLUB]'));
 assert.deepEqual(r.actor.items.slice(2).map(i=>i.name),['Mock Heaven','Great Sage Club']);
 const [ambiguous]=parseWorldBeings(block,[1,2].map(n=>({name:'Rage',type:'trait',system:{description:String(n)}})));
 assert.equal(ambiguous.actor.items[1].system.description,'1');assert.ok(ambiguous.warnings.some(w=>w.includes('multiple matches')));
});
test('metadata filters search tags, Sect, exact Sidhi and descriptions',()=>{
 const rows=[{name:'Flame',...searchableItem({system:{tags:'fire, area',sect:'Asuri',sidhi:2,description:'<p>Burning wave</p>'}})},{name:'Stone',...searchableItem({system:{sect:'Dracotine',sidhi:3}})}];
 assert.equal(filterLibrary(rows,{query:'tag:fire sect:asuri siddhi:2'})[0].name,'Flame');assert.equal(filterLibrary(rows,{query:'sidhi:1'}).length,0);assert.equal(filterLibrary(rows,{query:'burning'}).length,1);
});
test('Job grants preserve snapshots, refuse nested Jobs/Gambits on Wanderers, and do not duplicate',()=>{
 let id=0;globalThis.foundry={utils:{randomID:()=>`id${++id}`}};
 const source={name:'Sword',type:'weapon',system:{equipped:true,paidCarry:1,ammoId:'old'},effects:[{_id:'old-effect',name:'Bonus'}]};
 const snapshot=grantSnapshot({documentName:'Item',type:'weapon',uuid:'Item.sword',toObject:()=>structuredClone(source)});
 const result=grantedItems([snapshot],'wanderer',[]);assert.equal(result[0].system.equipped,false);assert.equal(result[0].system.ammoId,'');assert.equal(result[0].effects[0]._id,undefined);assert.equal(source.system.equipped,true);
 assert.equal(grantedItems([snapshot],'wanderer',result).length,0);
 assert.throws(()=>grantedItems([{...snapshot,type:'gambit'}],'wanderer',[]),/World Beings/);
 assert.throws(()=>grantSnapshot({documentName:'Item',type:'job'}),/Jobs/);
});
test('Trait activation suppresses configured effects without suppressing legacy active Traits',()=>{
 assert.equal(equipmentEffectSuppressed({type:'trait',system:{active:false}}),true);
 assert.equal(equipmentEffectSuppressed({type:'trait',system:{active:true}}),false);
 assert.equal(equipmentEffectSuppressed({type:'trait',system:{}}),false);
});
