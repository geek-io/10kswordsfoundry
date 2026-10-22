import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {grantedItems} from '../scripts/job-grants.mjs';
import {validateJobChoices} from '../scripts/jobs.mjs';
import {modifierProfile} from '../scripts/modifiers.mjs';
const load=async name=>JSON.parse(await readFile(`data/${name}.json`,'utf8'));
const [traits,equipment,jobs]=await Promise.all(['worldbeing-traits','sect-equipment','jobs'].map(load));
test('complete World Being table and Sect equipment retain rules, folder hierarchy and supported item types',()=>{
 assert.equal(traits.items.length,16);assert.equal(equipment.items.length,37);
 const numbers=traits.items.map(i=>Number(i.system.tags.match(/3d6 (\d+)/)[1]));assert.deepEqual(numbers,Array.from({length:16},(_,i)=>i+3));
 for(const pack of [traits,equipment,jobs]){
  assert.equal(new Set(pack.items.map(i=>i._id)).size,pack.items.length);
  for(const i of pack.items){assert.ok(pack.folders.some(f=>f._id===i.folder));assert.match(i.system.source,/Rules 2.0.3, p\.\d+/);assert.ok(i.system.description.length>50);}
  for(const f of pack.folders)if(f.folder)assert.ok(pack.folders.some(p=>p._id===f.folder));
 }
 assert.equal(equipment.items.filter(i=>i.type==='fashion').length,15);
 assert.equal(equipment.items.find(i=>i.name==='Zhongkui Five Thunder Japamala').system.slots,3);
 assert.match(equipment.items.find(i=>i.name==='Spectral Seal Talisman').system.description,/cannot move/);
 const tonggong=equipment.items.filter(i=>i.name.startsWith('Houyi Tonggong'));
 assert.equal(tonggong.length,4);
 assert.deepEqual(tonggong.map(i=>modifierProfile(i.system).range),[40,20,12,50]);
 for(const i of tonggong){assert.equal(i.system.bonus+modifierProfile(i.system).attack,4);assert.equal(i.system.ammoFamily,'none');}
});
test('unconditional numeric traits are active and situational bonuses are disabled',()=>{
 const deity=traits.items.find(i=>i.name==='Deity');assert.equal(deity.effects[0].system.changes.length,7);
 assert.equal(deity.effects[0].system.changes.find(c=>c.key==='system.health.max').value,'5');
 assert.equal(traits.items.find(i=>i.name==='Murderer').effects[0].disabled,true);
 const demon=traits.items.find(i=>i.name==='Demon');assert.equal(demon.effects[0].disabled,false);assert.equal(demon.effects[1].disabled,true);
 assert.equal(equipment.items.find(i=>i.name==='Hermetic Robes').effects[0].system.changes[0].key,'system.magickAreaBonus');
});
test('Jobs grant independent snapshots including paired weapons and ammo; Wretched requires choices',()=>{
 assert.equal(jobs.items.length,12);assert.equal(jobs.items.filter(i=>i.system.category==='body').length,6);
 const assassin=jobs.items.find(i=>i.name==='Assassin'),hunter=jobs.items.find(i=>i.name==='Hunter');
 let n=0;globalThis.foundry={utils:{randomID:()=>String(++n)}};
 const grants=grantedItems(assassin.system.grants,'wanderer',[],assassin._id);
 assert.equal(grants.filter(i=>i.type==='weapon').length,2);
 assert.equal(new Set(grants.map(i=>i._id)).size,grants.length);
 grants[0].system.bonus=999;assert.notEqual(assassin.system.grants[0].system.bonus,999);
 assert.equal(hunter.system.grants.find(i=>i.type==='weapon').system.ammo.quantity,12);
 assert.equal(jobs.items.find(i=>i.name==='Cryptomancer').system.grants.find(i=>i.type==='weapon').system.ammo.quantity,10);
 const wretched=structuredClone(jobs.items.find(i=>i.name==='Wretched'));
 assert.throws(()=>validateJobChoices(wretched),/Customize Wretched/);
 wretched.system.cultivations={vio:4,dia:3,grc:2,sav:2,wrd:1,spi:1};wretched.system.grants=structuredClone(hunter.system.grants);
 assert.doesNotThrow(()=>validateJobChoices(wretched));
});
