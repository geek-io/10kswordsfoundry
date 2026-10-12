import test from 'node:test';
import assert from 'node:assert/strict';
import {parseImport} from '../scripts/import-data.mjs';
import {inflictedConditions,tickBlaze} from '../scripts/mod-conditions.mjs';
import {resolveDefense} from '../scripts/resolution.mjs';
import {defaultItemIcon,ITEM_ICONS} from '../scripts/item-icons.mjs';
import {readFileSync} from 'node:fs';
test('multiple book abilities split at wrapped titles without separators or standalone page records',()=>{
 const rows=parseImport('128\n128\nFIRST PATH TECHNICK\nFirst effect.\nLICENSE EXPERT ASURI\nPREREQUISITES VIO 3\n[✹][✦] Strike.\nSECOND LONG\nPATHTechnick\n[✦✦] Second effect.\nTHIRD SPELL Magick\nMantra: Fire\n[✹✹][✦] SPI vs GRC','text','technique');
 assert.deepEqual(rows.map(r=>r.item.name),['First Path','Second Long Path','Third Spell']);
 assert.equal(rows[0].item.system.burnArdor,1);assert.equal(rows[1].item.system.apCost,2);assert.equal(rows[2].item.type,'magick');assert.ok(!rows[0].item.system.description.includes('SECOND'));
});
test('repeated Name records and mixed book market types preserve independent bodies',()=>{
 assert.equal(parseImport('Name: One\nType: Gear\nDescription: First\nName: Two\nType: Fashion\nArmor: 2','text','gear').length,2);
 const rows=parseImport('◼ ASURI PRESTIGE FASHION N/A\nDEVIL COAT\nARMOR +3 ARDOR +1\nProtective clothing.\nEMBER WAVE Magick\n[✦] Burn.\n◼ COMMON GEAR 10MAG\nTOOLS\nUseful tools.','text','gear');
 assert.deepEqual(rows.map(r=>r.item.type),['fashion','magick','gear']);assert.equal(rows[0].item.system.armor,3);assert.equal(rows[2].item.system.magCost,10);
});
test('item types have unique bundled SVG defaults while custom artwork is preserved',()=>{
 assert.equal(new Set(Object.values(ITEM_ICONS)).size,13);
 for(const [type,path] of Object.entries(ITEM_ICONS)){assert.equal(defaultItemIcon(type,'icons/svg/item-bag.svg'),path);assert.match(readFileSync(path.replace('systems/10kswordsfoundry/',''),'utf8'),/<svg/);}
 assert.equal(defaultItemIcon('weapon','custom/weapon.webp'),'custom/weapon.webp');
});
test('Lacerating adds one Wound per successful subsequent attack, not per die or fully defended attack',()=>{
 const attack={results:[4,5,6],profile:{keys:[],damage:'cut'}};
 assert.equal(resolveDefense(attack,[],0,{lacerating:true}).wounds,4);
 assert.equal(resolveDefense(attack,[6,6,6],0,{lacerating:true}).wounds,0);
});
test('mod condition suggestions require a surviving strike and include electric/frost effects',()=>{
 const attack={profile:{keys:['blaze','lacerating','toxic','electric','frost']}};
 assert.deepEqual(inflictedConditions(attack,{strikes:0,wounds:0}),[]);
 assert.deepEqual(inflictedConditions(attack,{strikes:1,wounds:1}),['blaze','toxic','stun','hobbled','lacerating']);
});
test('Blaze ignores Armor and applies once per forward combat round even if hooks repeat or rewind',async()=>{
 const actor={isOwner:true,system:{conditions:{blaze:true},health:{value:6},armor:{value:4}},last:'',getFlag(){return this.last;},async update(p){this.system.health.value=p['system.health.value'];this.last=p['flags.10kswordsfoundry.blazeRound'];return this;}};
 globalThis.foundry={documents:{ChatMessage:{getSpeaker:()=>({}),create:async()=>{}}}};
 await Promise.all([tickBlaze(actor,'fight:2'),tickBlaze(actor,'fight:2')]);assert.equal(actor.system.health.value,5);assert.equal(actor.system.armor.value,4);
 await tickBlaze(actor,'fight:1');assert.equal(actor.system.health.value,5);
 await tickBlaze(actor,'fight:3');assert.equal(actor.system.health.value,4);
});
test('Fashion and Technick special attacks spend their own costs and preserve resources on cancellation',async()=>{
 let answer=null,messages=[],warnings=[];
 const attack={name:'Ash Spear',apCost:2,burnArdor:1,installArdor:1,bonus:2,attackPool:'vio',defensePool:'grc',damageType:'burn'};
 const item={id:'fashion',name:'Ember Coat',type:'fashion',system:{equipped:true,specialAttacks:[attack]}};
 const actor={isOwner:true,uuid:'Actor.test',system:{actions:3,health:{value:6,max:6},ardor:{max:4,burnt:0,installed:0},cultivations:{vio:3}},items:{get:()=>item,contents:[item]},toObject(){return {system:structuredClone(this.system)};},async update(data){for(const [key,value] of Object.entries(data)){const parts=key.split('.');let node=this;for(const part of parts.slice(0,-1))node=node[part];node[parts.at(-1)]=value;}return this;}};
 class Roll{constructor(formula){assert.equal(formula,'6d6cs>=4');}async evaluate(){this.dice=[{results:[4,5,6,1,2,3].map(result=>({result}))}];return this;}async toMessage(data){messages.push(data);}}
 globalThis.foundry={applications:{api:{DialogV2:{prompt:async()=>answer}}},dice:{Roll},documents:{ChatMessage:{getSpeaker:()=>({})}}};globalThis.game={settings:{get:()=> 'public'},time:{worldTime:0}};globalThis.ui={notifications:{warn:m=>warnings.push(m),info:()=>{}}};
 const {useAbility}=await import('../scripts/abilities.mjs');const sheet={document:actor,submit:async()=>{}};
 await useAbility.call(sheet,null,{dataset:{itemId:'fashion',specialIndex:'0'}});assert.equal(actor.system.actions,3);
 answer={check:true,attack:true,hostile:true,attackPool:'vio',defensePool:'grc',adjustment:1,demand:1,shape:'none',size:0};
 for(const type of ['fashion','technique']){
  item.type=type;actor.system.actions=3;actor.system.ardor={max:4,burnt:0,installed:0};
  await useAbility.call(sheet,null,{dataset:{itemId:'fashion',specialIndex:'0'}});
  assert.equal(actor.system.actions,1);assert.equal(actor.system.ardor.burnt,1);assert.equal(actor.system.ardor.installed,1);assert.equal(messages.at(-1).flags['10kswordsfoundry'].attack.name,'Ember Coat: Ash Spear');
 }
 item.type='fashion';item.system.equipped=false;await useAbility.call(sheet,null,{dataset:{itemId:'fashion',specialIndex:'0'}});assert.equal(messages.length,2);assert.match(warnings.at(-1),/Equip/);
});
test('Toxic resistance uses SPI Demand 3 and failed checks inflict Burn without consuming Armor',async()=>{
 const {resolveOngoing}=await import('../scripts/mod-conditions.mjs');let results=[4,5,2],messages=[];
 const actor={isOwner:true,system:{conditions:{toxic:true},cultivations:{spi:3},health:{value:6,max:6},armor:{value:3}},async update(data){this.system.health.value=data['system.health.value'];return this;}};
 globalThis.foundry={dice:{Roll:class{async evaluate(){this.dice=[{results:results.map(result=>({result}))}];return this;}async toMessage(data){messages.push(data);}}},documents:{ChatMessage:{getSpeaker:()=>({})}}};
 globalThis.ui={notifications:{warn:message=>{throw Error(message);}}};globalThis.game={time:{worldTime:0}};
 const sheet={document:actor,submit:async()=>{}};
 await resolveOngoing.call(sheet,null,{dataset:{condition:'toxic'}});assert.equal(actor.system.health.value,4);assert.equal(actor.system.armor.value,3);assert.match(messages[0].flavor,/Failed/);
 results=[4,5,6];await resolveOngoing.call(sheet,null,{dataset:{condition:'toxic'}});assert.equal(actor.system.health.value,4);assert.equal(actor.system.conditions.toxic,true);assert.match(messages[1].flavor,/Resisted/);
});
