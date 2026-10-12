import './check-effect-variables.mjs';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const {SwordsActor,SwordsActiveEffect}=await import('../scripts/documents.mjs');
const {SwordsActorData,SwordsTraitData}=await import('../scripts/data-models.mjs');
const source=(await readFile(join(process.argv[2],'client/documents/actor.mjs'),'utf8')).replaceAll('\r\n','\n');
const start=source.indexOf('  applyActiveEffects(phase) {');
const method=source.slice(start,source.indexOf('\n  /* -------------------------------------------- */',start));
const core=Object.getPrototypeOf(SwordsActiveEffect);
// Deliberately use the core class, as Foundry Actor does, not SwordsActiveEffect.
const ActiveEffect={CHANGE_PHASES:{initial:{},final:{}},_shimChanges:()=>{},applyChange:core.applyChange};
foundry.documents.ActiveEffect.implementation=SwordsActiveEffect;
SwordsActiveEffect.CHANGE_PHASES={initial:{},final:{}};SwordsActiveEffect._shimChanges=()=>{};
const Pipeline=vm.runInThisContext(`(class {${method}})`);
Object.getPrototypeOf(SwordsActor.prototype).applyActiveEffects=Pipeline.prototype.applyActiveEffects;
for(const level of [1,3]){
 const changes=[{key:'system.cultivations.wrd',type:'add',value:'@system.level',phase:'initial',priority:20}];
 const effect={name:'Animal Magnetism',active:true,statuses:[],parent:{documentName:'Item',system:new SwordsTraitData({level})},system:{changes}};
 const actor={system:new SwordsActorData({cultivations:{wrd:2}}),overrides:{},tokenActiveEffectChanges:{},statuses:new Set(),_completedActiveEffectPhases:new Set(),allApplicableEffects:function*(){yield effect;},getRollData(){return this.system.toObject();}};
 SwordsActor.prototype.applyActiveEffects.call(actor,'initial');
 assert.equal(actor.system.cultivations.wrd,2+level);assert.equal(effect.system.changes,changes);assert.equal(changes[0].value,'@system.level');assert.equal(actor.system.toObject().cultivations.wrd,2);
 actor.system=new SwordsActorData({cultivations:{wrd:2}});actor._completedActiveEffectPhases.clear();effect.active=false;
 SwordsActor.prototype.applyActiveEffects.call(actor,'initial');assert.equal(actor.system.cultivations.wrd,2);
}
console.log('Real core Actor effect pipeline: transferred Level expressions apply at Levels 1/3; inactive effects stop; source stats and expressions remain unchanged.');
