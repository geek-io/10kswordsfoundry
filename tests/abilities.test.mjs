import test from 'node:test';
import assert from 'node:assert/strict';
import {abilityCosts,resourceSymbols,useAbility} from '../scripts/abilities.mjs';
import {occupiedSlots} from '../scripts/slots.mjs';
import {itemFolders,checkedFolder} from '../scripts/import-folders.mjs';
test('AP and Ardor costs are bounded; symbols distinguish installed, burnt and open',()=>{
 const source={actions:3,ardor:{max:4,burnt:1,installed:0}};
 assert.deepEqual(abilityCosts(source,{apCost:2,installArdor:1,burnArdor:1}),{'system.actions':1,'system.ardor.burnt':2,'system.ardor.installed':1});
 assert.throws(()=>abilityCosts(source,{apCost:4}),/AP/);
 assert.throws(()=>abilityCosts(source,{installArdor:4}),/Ardor/);
 const symbols=resourceSymbols({actions:1,ardor:{max:4,burnt:1,installed:2}});
 assert.deepEqual(symbols.ardorSymbols.map(s=>[s.symbol,s.state]),[['❂','installed'],['❂','installed'],['✹','burnt'],['✹','open']]);
 assert.equal(symbols.apSymbols.filter(s=>s.available).length,1);
});
test('internalized abilities never occupy physical slots, including legacy slot data',()=>{
 for(const type of ['magick','technique'])assert.deepEqual(occupiedSlots({type,system:{equipped:true,gearSlot:'both'}}),[]);
});
test('folder selector includes Item folders and rejects removed or other document folders',()=>{
 const rows=[{id:'items',type:'Item',name:'Armory'},{id:'actors',type:'Actor',name:'Actors'}];
 globalThis.game={folders:{contents:rows,get:id=>rows.find(f=>f.id===id)}};
 assert.deepEqual(itemFolders(),{'':'Items root',items:'Armory'});assert.equal(checkedFolder('items'),'items');assert.equal(checkedFolder(''),null);
 assert.throws(()=>checkedFolder('actors'));assert.throws(()=>checkedFolder('gone'));
});
test('ability cancellation spends nothing; attack records pools; failed chat restores costs',async()=>{
 let answer=null,fail=false,messages=[],warnings=[],animations=[];
 const item={id:'spell',name:'Flame',type:'magick',system:{equipped:true,apCost:2,installArdor:1,damageType:'burn',attackPool:'spi',defensePool:'dia'}};
 const actor={isOwner:true,name:'Caster',uuid:'Actor.caster',system:{actions:3,health:{value:6,max:6},ardor:{max:4,burnt:0,installed:0},cultivations:{spi:3}},items:{contents:[item],get:()=>item},toObject(){return {system:structuredClone(this.system),items:[{_id:item.id,type:item.type,system:structuredClone(item.system)}]};},async update(changes){for(const [path,value] of Object.entries(changes)){if(path==='items'){item.system=structuredClone(value[0].system);continue;}let node=this;const parts=path.split('.');for(const key of parts.slice(0,-1))node=node[key];node[parts.at(-1)]=value;}return this;}};
 globalThis.game={time:{worldTime:0},settings:{get:()=> 'publicroll'},modules:new Map([['autoanimations',{active:true}]]),user:{targets:new Set()}};
 const token={actor,id:'caster',center:{x:0,y:0},document:{hidden:false,elevation:0}};globalThis.canvas={ready:true,scene:{id:'scene'},dimensions:{distancePixels:100},tokens:{placeables:[token],setTargets:()=>{}},regions:{placeRegion:async(data)=>({testPoint:()=>true,toObject:()=>data})}};

 globalThis.AutomatedAnimations={playAnimation:async(...args)=>animations.push(args)};
 globalThis.ui={notifications:{warn:m=>warnings.push(m),info:()=>{}}};
 class Roll{async evaluate(){this.dice=[{results:[{result:4},{result:6},{result:2}]}];return this;}async toMessage(message){if(fail)throw Error('Chat failed');messages.push(message);return message;}}
 globalThis.foundry={applications:{api:{DialogV2:{prompt:async()=>answer}}},dice:{Roll},documents:{ChatMessage:{getSpeaker:()=>({alias:'Caster'})}}};
 const sheet={document:actor,submit:async()=>{}};
 await useAbility.call(sheet,null,{dataset:{itemId:'spell'}});assert.equal(actor.system.actions,3);assert.equal(messages.length,0);assert.equal(animations.length,0);
 answer={attack:true,check:true,hostile:true,attackPool:'spi',defensePool:'dia',adjustment:0,demand:2,shape:'cone',size:6};
 await useAbility.call(sheet,null,{dataset:{itemId:'spell'}});
 assert.equal(actor.system.actions,1);assert.equal(actor.system.ardor.installed,1);assert.equal(animations.length,1);assert.equal(animations[0][1],item);
 assert.equal(messages[0].flags['10kswordsfoundry'].attack.defensePool,'dia');assert.equal(messages[0].flags['10kswordsfoundry'].attack.area.shape,'cone');
 await useAbility.call(sheet,null,{dataset:{itemId:'spell'}});assert.equal(messages.length,1);assert.match(warnings.at(-1),/already/i);
 actor.system.actions=3;actor.system.ardor.installed=0;item.system.paidArdor=0;item.system.equipped=false;fail=true;
 await useAbility.call(sheet,null,{dataset:{itemId:'spell'}});assert.equal(actor.system.actions,3);assert.equal(actor.system.ardor.installed,0);assert.match(warnings.at(-1),/Chat failed/);assert.equal(animations.length,1);
 fail=false;item.system.enhancement={description:'Burn brighter',burnArdor:1,bonus:2,areaBonus:2,extraWounds:1};
 foundry.applications.api.DialogV2.confirm=async()=>false;
 await useAbility.call(sheet,null,{dataset:{itemId:'spell'}});assert.equal(actor.system.ardor.burnt,0);assert.equal(messages.at(-1).flags['10kswordsfoundry'].attack.profile.extraWounds,0);
 actor.system.actions=3;actor.system.ardor.installed=0;item.system.paidArdor=0;item.system.equipped=false;
 foundry.applications.api.DialogV2.confirm=async()=>true;
 await useAbility.call(sheet,null,{dataset:{itemId:'spell'}});assert.equal(actor.system.ardor.burnt,1);assert.equal(messages.at(-1).flags['10kswordsfoundry'].attack.profile.extraWounds,1);assert.equal(messages.at(-1).flags['10kswordsfoundry'].attack.area.size,8);assert.match(messages.at(-1).flavor,/Enhanced: Burn brighter/);
});
