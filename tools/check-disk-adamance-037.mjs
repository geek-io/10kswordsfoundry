import './check-effect-pipeline-035.mjs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const {SwordsActor}=await import('../scripts/documents.mjs');
const {SwordsActorData,SwordsTraitData}=await import('../scripts/data-models.mjs');
const require=createRequire('C:/Program Files/Foundry Virtual Tabletop/resources/app/package.json');
const {ClassicLevel}=require('classic-level');
const db=new ClassicLevel(resolve('packs/grimoire-traits'),{keyEncoding:'utf8',valueEncoding:'json'});await db.open();
try{
 const records=await db.sublevel('items',{valueEncoding:'json'}).values().all();
 const item=records.find(i=>i.name==='Adamance');assert.equal(item.effects.length,1);assert.equal(typeof item.effects[0],'string');
 const stored=await db.sublevel('items.effects',{valueEncoding:'json'}).get(`${item._id}.${item.effects[0]}`);
 for(const type of ['wanderer','npc'])for(const level of [1,3]){
  const effect={...stored,active:!stored.disabled&&item.system.active,statuses:[],parent:{documentName:'Item',system:new SwordsTraitData({...item.system,level})}};
  const actor={type,system:new SwordsActorData(),overrides:{},tokenActiveEffectChanges:{},statuses:new Set(),_completedActiveEffectPhases:new Set(),allApplicableEffects:function*(){yield effect;},getRollData(){return this.system.toObject();}};
  SwordsActor.prototype.applyActiveEffects.call(actor,'initial');assert.equal(actor.system.health.max,6+level);assert.equal(actor.system.toObject().health.max,6);
 }
 console.log('Disk-backed Adamance: actual embedded change raises maximum Health to 7/9 at Levels 1/3 for both Actor types through core preparation.');
}finally{await db.close();}
