import test from "node:test";
import assert from "node:assert/strict";
import {weaponDetails,installMod,validateWeapon,ammoAfterUse,OUT_OF_AMMO} from "../scripts/weapons.mjs";
import {useWeapon,attackBonus} from "../scripts/equipment.mjs";
test("upgrades add attack dice and DR without cumulatively stacking tiers",()=>{
  for(const [upgrade,attack,dr,slots] of [['base',0,4,1],['refined',1,8,2],['divine',2,12,3],['immortal',3,16,4]]) {
    const details=weaponDetails({upgrade,bonus:2});
    assert.equal(details.attack,2+attack); assert.equal(details.dr,dr); assert.equal(details.modCapacity,slots);
    assert.equal(attackBonus([{id:'w',type:'weapon',system:{upgrade,bonus:2,equipped:true}}],true,'w'),2+attack);
  }
});
test("mods are snapshots, replace a chosen slot, and enforce upgrade/affinity capacity",()=>{
  const mod={type:'weaponMod',name:'Precise',system:{description:'Reroll 1s'}};
  let system={upgrade:'refined',mods:installMod({upgrade:'refined'},mod,1)};
  mod.system.description='Changed';
  assert.equal(system.mods[0].description,'Reroll 1s');
  assert.throws(()=>validateWeapon({...system,upgrade:'base'}),/Remove mods/);
  assert.throws(()=>validateWeapon({...system,affinity:'Nimble'}),/Remove mods/);
  system.mods=installMod(system,mod,1);
  assert.equal(system.mods.length,1);
  assert.equal(system.mods[0].description,'Changed');
  assert.throws(()=>installMod(system,{type:'gear'},0),/Weapon Mod/);
  assert.throws(()=>installMod(system,mod,2),/Remove mods/);
  assert.equal(weaponDetails({upgrade:'refined',affinity:'Nimble'}).modCapacity,1);
});
test("ammo type enables tracking, zero blocks, blank type is unlimited",()=>{
  assert.equal(ammoAfterUse({ammo:{type:' ',quantity:0}}),null);
  assert.equal(ammoAfterUse({ammo:{type:'Bullet',quantity:1}}),0);
  assert.throws(()=>ammoAfterUse({ammo:{type:'Bullet',quantity:0}}),{message:OUT_OF_AMMO});
});
function fixture(quantity=1) {
  const weapon={id:'w',type:'weapon',system:{equipped:true,ammo:{type:'Bullet',quantity}},update:async changes=>{weapon.system.ammo.quantity=changes['system.ammo.quantity'];return weapon;}};
  return {weapon,actor:{isOwner:true,items:{get:()=>weapon}}};
}
test("last round permits exactly one queued attack, then blocks with exact error",async()=>{
  const {actor,weapon}=fixture(); let rolls=0;
  const results=await Promise.allSettled([useWeapon(actor,'w',async()=>{rolls++;}),useWeapon(actor,'w',async()=>{rolls++;})]);
  assert.equal(rolls,1); assert.equal(weapon.system.ammo.quantity,0);
  assert.equal(results[1].reason.message,OUT_OF_AMMO);
});
test("failed rolls restore ammo and unequipped weapons never spend ammo",async()=>{
  const {actor,weapon}=fixture(2);
  await assert.rejects(useWeapon(actor,'w',async()=>{throw new Error('Roll failed');}),/Roll failed/);
  assert.equal(weapon.system.ammo.quantity,2);
  weapon.system.equipped=false;
  await assert.rejects(useWeapon(actor,'w',async()=>{}),/equipped weapon/);
  assert.equal(weapon.system.ammo.quantity,2);
});
test("failed ammo persistence prevents rolling",async()=>{
  const {actor,weapon}=fixture(); let rolled=false;
  weapon.update=async()=>false;
  await assert.rejects(useWeapon(actor,'w',async()=>{rolled=true;}),/Ammo could not be saved/);
  assert.equal(rolled,false);
});

class BaseSheet {}
function merge(a,b) {
  const result=structuredClone(a);
  for (const [key,value] of Object.entries(b)) result[key]=value && typeof value==='object' && !Array.isArray(value) ? merge(result[key]??{},value) : value;
  return result;
}
globalThis.foundry={applications:{api:{HandlebarsApplicationMixin:Base=>Base},sheets:{ActorSheetV2:BaseSheet,ItemSheetV2:BaseSheet}},utils:{mergeObject:merge}};
globalThis.ui={notifications:{warn:()=>{}}};
const {SwordsItemSheet}=await import('../scripts/sheets.mjs');
test("weapon sheet drop saves a mod and its Remove action clears the slot",async()=>{
  let source={type:'weapon',system:{upgrade:'refined',mods:[]}};
  const sheet=new SwordsItemSheet(); sheet.isEditable=true; sheet.submit=async()=>{};
  sheet.document={type:'weapon',get system(){return source.system;},toObject:()=>structuredClone(source),update:async data=>{source=merge(source,data);return sheet.document;}};
  const event={target:{closest:()=>({dataset:{modSlot:'1'}})}};
  await sheet._onDropDocument(event,{type:'weaponMod',name:'Precise',system:{description:'Reroll 1s'}});
  assert.equal(source.system.mods[0].name,'Precise'); assert.equal(source.system.mods[0].slot,1);
  await assert.rejects(sheet._saveWeapon({system:{upgrade:'base'}}),/Remove mods/);
  assert.equal(source.system.upgrade,'refined');
  await SwordsItemSheet.removeMod.call(sheet,{}, {dataset:{modSlot:'1'}});
  assert.deepEqual(source.system.mods,[]);
  sheet.isEditable=false;
  await sheet._onDropDocument(event,{type:'weaponMod',name:'Other',system:{}});
  assert.deepEqual(source.system.mods,[]);
});
