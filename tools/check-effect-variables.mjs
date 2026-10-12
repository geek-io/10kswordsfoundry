// Extend the real-model harness with Foundry's actual expression engine.
import './check-foundry-resources.mjs';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]),url=p=>pathToFileURL(join(root,p)).href;
const {default:Roll}=await import(url('client/dice/roll.mjs'));
const terms=await import(url('client/dice/terms/_module.mjs'));
const {default:RollParser}=await import(url('client/dice/parser.mjs'));
const require=createRequire(url('package.json'));
foundry.dice={Roll,terms,RollGrammar:require('peggy').generate(await readFile(join(root,'client/dice/grammar.pegjs'),'utf8'))};
CONFIG.Dice={parser:RollParser,rolls:[Roll],terms:{d:terms.Die},termTypes:terms,fulfillment:{defaultMethod:'digital',methods:{}}};CONFIG.debug??={};
const source=(await readFile(join(root,'client/documents/active-effect.mjs'),'utf8')).replaceAll('\r\n','\n');
const start=source.indexOf('  static applyChangeField(');
const FieldEffect=vm.runInThisContext(`(class {${source.slice(start,source.indexOf('\n  /* -------------------------------------------- */',start))}})`);
const {SwordsActorData,SwordsTraitData,SwordsJobData}=await import('../scripts/data-models.mjs');
const {SwordsActiveEffect}=await import('../scripts/documents.mjs');
// Core application is field-based; document persistence stays simulated.
Object.getPrototypeOf(SwordsActiveEffect).applyChange=(target,change,options)=>FieldEffect.applyChangeField(target,change,{...options,field:target.system.getFieldForProperty(change.key.slice(7))});
const trait={documentName:'Item',system:new SwordsTraitData({level:1})};
const effect={name:'Animal Magnetism',parent:trait};
for(const level of [1,3])for(const expression of ['System.Level','@system.level','@item.system.level']){
 trait.system=new SwordsTraitData({level});const actor={system:new SwordsActorData({cultivations:{wrd:2}})};
 SwordsActiveEffect.applyChange(actor,{key:'system.cultivations.wrd',type:'add',value:expression,effect});
 assert.equal(actor.system.cultivations.wrd,2+level);assert.equal(actor.system.toObject().cultivations.wrd,2);
 const roll=new Roll(`${actor.system.cultivations.wrd}d6cs>=4`);assert.equal(roll.dice[0].number,2+level);
}
const actor={system:new SwordsActorData({movement:6})};
SwordsActiveEffect.applyChange(actor,{key:'system.movement',type:'add',value:'2 * System.Level + @actor.system.sidhi',effect});assert.equal(actor.system.movement,12);
const first=new SwordsJobData(),second=new SwordsJobData();first.grants.push({id:'only-first'});assert.equal(second.grants.length,0);
const catalog=JSON.parse(await readFile('data/grimoire-traits.json','utf8'));
for(const item of catalog.items){const model=new SwordsTraitData(item.system,{strict:true});assert.equal(model.level,1);}
console.log('Real Foundry field and Roll engines: System.Level adds 1/3 dice at Trait Level 1/3, arithmetic works, source stats stay unchanged, Job defaults are independent, and all 36 Traits validate.');
