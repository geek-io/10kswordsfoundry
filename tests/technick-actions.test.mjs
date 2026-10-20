import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import {specialAttackProfile,eligibleWeapon} from '../scripts/special-abilities.mjs';
import {technickActionPatch} from '../scripts/technick-repair.mjs';
import {resolveDefense} from '../scripts/resolution.mjs';
import {inflictedConditions} from '../scripts/mod-conditions.mjs';
import {useAbility} from '../scripts/abilities.mjs';
const catalog=JSON.parse(await readFile(new URL('../data/sect-technicks.json',import.meta.url),'utf8'));
const stock=name=>structuredClone(catalog.items.find(i=>i.name===name));
const action=name=>stock(name).system.specialAttacks[0];
const sword=()=>({id:'sword',name:'Great Sword',type:'weapon',system:{equipped:true,gearSlot:'both',weaponType:'melee',bonus:1,upgrade:'refined',range:1,damageType:'cut',properties:{great:true},ammo:{type:'Test ammo',quantity:2}}});

test('Six Demon Cutting Sword combines weapon bonuses, Crushing, Blaze and extra 5+ wounds',()=>{
 const a=action('Six Demon Cutting Sword'),weapon=sword();
 assert.deepEqual([a.apCost,a.burnArdor,a.bonus],[2,1,2]);
 const {profile,bonus,attackPool}=specialAttackProfile(a,weapon);
 assert.equal(bonus,2);assert.equal(attackPool,'vio');assert.equal(profile.armorPerWound,2);
 const resolved=resolveDefense({results:[4,5,6],profile},[],4);
 assert.deepEqual(resolved,{strikes:3,wounds:6,armorLoss:4,healthLoss:4});
 assert.deepEqual(inflictedConditions({profile},resolved),['blaze']);
 weapon.system.properties={};assert.throws(()=>specialAttackProfile(a,weapon),/Great or Colossal/);
 weapon.system.properties={colossal:true};assert.equal(specialAttackProfile(a,weapon).profile.fivePlusExtra,2);
});

test('Critical-only attacks resist ordinary Defenses and preserve special weapon constraints',()=>{
 const {profile}=specialAttackProfile(action('Spiteful Disembowelment Of Seraphim'),sword());
 assert.equal(profile.uninterruptible,true);assert.equal(profile.damage,'ruination');
 assert.equal(resolveDefense({profile,results:[4,5,6]},[4,5],100).strikes,3);
 assert.equal(resolveDefense({profile,results:[4,5,6]},[6,6],100).strikes,1);
 assert.equal(eligibleWeapon({...sword(),name:'Dagger'},'sword'),false);
 assert.equal(eligibleWeapon({...sword(),name:'Dagger'},'blade'),true);
});

test('catalog actions exclude passives and preserve rites, variable costs and source references',()=>{
 assert.equal(catalog.items.filter(i=>i.system.specialAttacks?.length).length,64);
 assert.equal(catalog.items.reduce((n,i)=>n+i.system.specialAttacks.length,0),69);
 assert.equal(stock("Asuri's Wrath").system.specialAttacks.length,0);
 assert.equal(action('Kurukulla Blood Drinking').variableBurn,true);
 assert.equal(stock('Transmutation').system.specialAttacks[1].burnArdor,3);
 for(const item of catalog.items)for(const a of item.system.specialAttacks){
  assert.ok(a.description.includes('2.0.3'));
  assert.ok(['attack','check','automatic'].includes(a.mode));
  if(a.installArdor)assert.equal(a.activation,true,item.name);
 }
});

test('stock-copy repair fills empty lists without replacing custom actions or customized costs',()=>{
 const item=stock('Chthonian Seraph Body');item.system.specialAttacks=[];item.system.installArdor=0;
 const patch=technickActionPatch(item,catalog);
 assert.equal(patch['system.installArdor'],1);assert.equal(patch['system.specialAttacks'].length,2);
 item.system.apCost=3;assert.ok(!Object.hasOwn(technickActionPatch(item,catalog),'system.installArdor'));
 item.system.specialAttacks=[{name:'Custom'}];assert.equal(technickActionPatch(item,catalog),null);
 item.system.specialAttacks=[];item.system.source='Homebrew';assert.equal(technickActionPatch(item,catalog),null);
});

function fixture(name){
 const item=stock(name);item.id=item._id;
 const weapon=sword(),items=[item,weapon],messages=[],warnings=[],formulas=[];
 let answer={attackPool:'vio',defensePool:'grc',adjustment:0,demand:2,shape:'none',size:0,weaponId:'sword'};
 let fail=false;
 const actor={uuid:'Actor.hero',isOwner:true,system:{actions:3,health:{value:6,max:6},cultivations:{vio:3,grc:4,spi:3},ardor:{max:8,burnt:0,installed:0},sidhi:2},items:{contents:items,get:id=>items.find(i=>i.id===id)},toObject(){return {system:structuredClone(this.system),items:items.map(i=>({_id:i.id,type:i.type,system:structuredClone(i.system)}))};},async update(p){
  for(const [key,value] of Object.entries(p)){
   if(key==='items'){for(const saved of value)items.find(i=>i.id===saved._id).system=structuredClone(saved.system);continue;}
   const parts=key.split('.');let node=this;for(const k of parts.slice(0,-1))node=node[k];node[parts.at(-1)]=value;
  }return actor;
 }};
 weapon.update=async p=>{weapon.system.ammo.quantity=p['system.ammo.quantity'];return weapon;};
 globalThis.game={time:{worldTime:0},settings:{get:()=>false}};
 globalThis.ui={notifications:{warn:m=>warnings.push(m),info:()=>{}}};
 globalThis.foundry={utils:{cleanHTML:s=>s},applications:{api:{DialogV2:{prompt:async()=>answer}}},documents:{ChatMessage:{getSpeaker:()=>({}),create:async m=>{if(fail)throw Error('Chat failed');messages.push(m);return m;}}},dice:{Roll:class{
  constructor(formula){formulas.push(formula);}async evaluate(){this.dice=[{results:[4,5,6].map(result=>({result}))}];return this;}
  async toMessage(m){if(fail)throw Error('Chat failed');messages.push(m);return m;}
 }}};
 return {actor,item,weapon,messages,warnings,formulas,answer:v=>answer=v,fail:v=>fail=v,use:async index=>useAbility.call({document:actor,submit:async()=>{}},null,{dataset:{itemId:item.id,specialIndex:String(index??0)}})};
}
test('weapon-based Technick spends AP/Burn/ammo once, refunds failed chat, and cancellation spends nothing',async()=>{
 const f=fixture('Six Demon Cutting Sword');await f.use();
 assert.deepEqual(f.warnings,[]);assert.equal(f.formulas[0],'7d6cs>=4');
 assert.deepEqual([f.actor.system.actions,f.actor.system.ardor.burnt,f.weapon.system.ammo.quantity],[1,1,1]);
 assert.equal(f.messages[0].flags['10kswordsfoundry'].attack.profile.fivePlusExtra,1);
 f.actor.system.actions=3;f.fail(true);await f.use();
 assert.deepEqual([f.actor.system.actions,f.actor.system.ardor.burnt,f.weapon.system.ammo.quantity],[3,1,1]);
 assert.equal(f.messages.length,1);assert.match(f.warnings.at(-1),/Chat failed/);
 f.fail(false);f.answer(null);await f.use();assert.equal(f.weapon.system.ammo.quantity,1);
});
test('activation reserves parent Ardor and release attack refunds it without paying twice',async()=>{
 const f=fixture('Glinting Light Sword Draw');await f.use(0);
 assert.deepEqual(f.warnings,[]);
 assert.deepEqual([f.actor.system.actions,f.actor.system.ardor.installed,f.item.system.paidArdor],[2,3,3]);
 await f.use(1);
 assert.deepEqual(f.warnings,[]);
 assert.deepEqual([f.actor.system.actions,f.actor.system.ardor.installed,f.item.system.paidArdor],[2,0,0]);
 assert.equal(f.weapon.system.ammo.quantity,1);
});
