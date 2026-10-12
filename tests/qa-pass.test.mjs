import test from 'node:test';
import assert from 'node:assert/strict';
import {itemCosts,assignSlot,occupiedSlots} from '../scripts/slots.mjs';
import {migrateInventory} from '../scripts/migration.mjs';
import {reconcileCosts,useWeapon,changeEquipment} from '../scripts/equipment.mjs';
import {modifierProfile} from '../scripts/modifiers.mjs';
import {validateWeapon,installMod} from '../scripts/weapons.mjs';
import {editorValue} from '../scripts/rich-text.mjs';
import {equipmentEffectSuppressed} from '../scripts/effects.mjs';
const base=()=>({carry:8,meridians:2,armor:{max:2,value:2},ardor:{max:4,burnt:0,installed:0}});
const item=(type,system={},id=type)=>({_id:id,id,name:id,type,system:{quantity:1,slots:1,equipped:false,...system}});
test('Fashion uses its own slot; accessories always remain in Carry',()=>{
  assert.deepEqual(itemCosts(item('fashion',{equipped:true})),{meridians:0,carry:0});
  for(const equipped of [false,true]) assert.deepEqual(itemCosts(item('accessory',{equipped,quantity:2})),{meridians:0,carry:2});
  assert.deepEqual(occupiedSlots(item('fashion',{equipped:true})),['fashion']);
});
test('hand slots enforce two hands and Fashion exclusivity without replacing other items',()=>{
  const right=item('weapon',{equipped:true,gearSlot:'right'},'one');
  const left=item('weapon',{equipped:true},'two');assignSlot(left,[right],'two');assert.equal(left.system.gearSlot,'left');
  const great=item('weapon',{equipped:true,properties:{great:true}},'great');
  assert.throws(()=>assignSlot(great,[right],'great'),/occupied/);
  assert.throws(()=>assignSlot(item('fashion',{equipped:true},'new'),[item('fashion',{equipped:true})],'new'),/occupied/);
  assert.equal(itemCosts(item('weapon',{quantity:3,equipped:true,gearSlot:'right'})).carry,2);
});
test('inventory migration refunds obsolete Meridian charges once and preserves Fashion armor',()=>{
  const source={system:base(),items:[item('fashion',{equipped:true,paidMeridians:1,armor:2}),item('gear',{equipped:true,paidMeridians:1})]};
  assert.equal(migrateInventory(source),true);assert.equal(source.system.meridians,4);
  assert.equal(source.system.carry,7);assert.equal(source.system.armor.max,2);
  const after=structuredClone(source);assert.equal(migrateInventory(source),false);assert.deepEqual(source,after);
});
test('migration preserves Carry overage and removing items clears it without losing capacity',()=>{
  const source={system:{...base(),carry:0},items:[item('accessory')]};
  migrateInventory(source);assert.equal(source.system.carryOverage,1);
  const old=structuredClone(source.items);source.items=[];reconcileCosts(source,old);
  assert.equal(source.system.carryOverage,0);assert.equal(source.system.carry,0);
});
test('ammo uses one Carry slot per nonempty type across stacks',()=>{
  const source={system:base(),items:[item('ammunition',{ammoType:'bullet',quantity:10},'a'),item('ammunition',{ammoType:'bullet',quantity:5},'b'),item('ammunition',{ammoType:'fireshot',quantity:4},'c')]};
  reconcileCosts(source,[]);assert.equal(source.system.carry,6);
  const old=structuredClone(source.items);source.items[0].system.quantity=0;reconcileCosts(source,old);
  assert.equal(source.system.carry,6);assert.equal(source.items[1].system.paidCarry,1);
});
test('modifiers combine once, enforce incompatibilities, and calculate conditional damage',()=>{
  const system={properties:{great:true,artifact:true,precise:true,visceral:true,holy:true},mods:[{name:'ARTIFACT'}]};
  const profile=modifierProfile(system,{unarmored:true,holyTarget:true});
  assert.equal(profile.attack,3);assert.equal(profile.hands,2);assert.equal(profile.movement,-1);assert.equal(profile.range,2);
  assert.equal(profile.damage,'ruination');assert.equal(profile.criticalExtra,2);assert.equal(profile.precise,true);
  assert.equal(profile.ignoresArmor,true);
  assert.throws(()=>validateWeapon({properties:{great:true,colossal:true}}),/both Great and Colossal/);
  assert.throws(()=>installMod({},item('weaponMod',{rule:'artifact'}),0),/cannot be crafted/);
  assert.equal(modifierProfile({properties:{crushing:true}},{ammo:{damage:'burn'}}).armorPerWound,2);
});
test('plain notes become rich text without interpreting comparison symbols',()=>{
  assert.equal(editorValue('A < B\nC & D'),'<p>A &lt; B<br>C &amp; D</p>');
  assert.equal(editorValue('<p><strong>Bold</strong></p>'),'<p><strong>Bold</strong></p>');
});
test('equipment effects follow equipped state; traits remain transferable',()=>{
  assert.equal(equipmentEffectSuppressed(item('accessory')),true);
  assert.equal(equipmentEffectSuppressed(item('accessory',{equipped:true})),false);
  assert.equal(equipmentEffectSuppressed(item('trait')),false);
});
function merge(a,b){const out=structuredClone(a);for(const [key,value] of Object.entries(b)) out[key]=value&&typeof value==='object'&&!Array.isArray(value)?merge(out[key]??{},value):value;return out;}
globalThis.foundry={utils:{mergeObject:merge}};
function inventoryActor() {
  let source={system:base(),items:[item('weapon',{equipped:true,gearSlot:'right',ammoFamily:'gun',ammoId:'bullet',mods:[]},'gun'),item('ammunition',{ammoType:'bullet',quantity:1},'bullet'),item('ammunition',{ammoType:'fireshot',quantity:2},'fire')]};
  reconcileCosts(source,[]);
  const actor={isOwner:true,toObject:()=>structuredClone(source),items:{get:id=>source.items.find(item=>item.id===id)},update:async data=>{source=data;return actor;}};
  return {actor,get source(){return source;}};
}
test('weapon switches ammo stacks, spends only selected stack and releases last-type Carry',async()=>{
  const f=inventoryActor();let profile;
  await useWeapon(f.actor,'gun',async(weapon,ammo)=>{profile=modifierProfile(weapon.system,{ammo});},'fire');
  assert.equal(f.source.items[1].system.quantity,1);assert.equal(f.source.items[2].system.quantity,1);assert.ok(profile.keys.includes('blaze'));
  await useWeapon(f.actor,'gun',async()=>{});
  assert.equal(f.source.items[1].system.quantity,0);assert.equal(f.source.system.carry,7);
  await assert.rejects(useWeapon(f.actor,'gun',async()=>{}),/Out of ammo/);
});
test('failed ammo-stack roll restores quantity and its Carry charge',async()=>{
  const f=inventoryActor();
  await assert.rejects(useWeapon(f.actor,'gun',async()=>{throw new Error('roll failure');}),/roll failure/);
  assert.equal(f.source.items[1].system.quantity,1);assert.equal(f.source.system.carry,6);
});
test('accessory equip and unequip do not refund Carry, removal does',async()=>{
  let source={system:base(),items:[item('accessory')]};reconcileCosts(source,[]);
  const actor={isOwner:true,toObject:()=>structuredClone(source),items:{get:id=>source.items.find(item=>item._id===id)},update:async data=>{source=data;return actor;}};
  await changeEquipment(actor,'accessory',{}, {toggle:true});assert.equal(source.system.carry,7);
  await changeEquipment(actor,'accessory',{}, {toggle:true});assert.equal(source.system.carry,7);
  await changeEquipment(actor,'accessory',{}, {remove:true});assert.equal(source.system.carry,8);
});
