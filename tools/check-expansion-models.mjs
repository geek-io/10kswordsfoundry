// Uses real installed Foundry v14 fields. No world is opened or changed.
import './check-effect-variables.mjs';
const {SwordsActorData}=await import('../scripts/data-models.mjs');
const {SwordsActiveEffect}=await import('../scripts/documents.mjs');
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
let items=0,grants=0;
for(const name of ['worldbeing-traits','sect-equipment','jobs']){
 const pack=JSON.parse(await readFile(`data/${name}.json`,'utf8'));
 for(const item of pack.items){
  const Model=CONFIG.Item.dataModels[item.type];assert.ok(Model,item.type);
  const model=new Model(item.system,{strict:true});const data=model.toObject();
  for(const [key,value] of Object.entries(item.system))assert.deepEqual(data[key],value,`${item.name}: ${key}`);
  for(const grant of data.grants??[]){
   const stored=new CONFIG.Item.dataModels[grant.type](grant.system,{strict:true}).toObject();
   for(const [key,value] of Object.entries(grant.system))assert.deepEqual(stored[key],value,`${item.name}/${grant.name}: ${key}`);
   grants++;
  }
  for(const effect of item.effects??[])for(const change of effect.system.changes){
   const actor={system:new SwordsActorData({})};
   const get=()=>change.key.split('.').reduce((v,k)=>v[k],actor),before=get();
   SwordsActiveEffect.applyChange(actor,{...change,effect:{...effect,parent:{documentName:'Item',system:model}}});
   assert.equal(get(),before+Number(change.value),`${item.name}: ${change.key} applies`);
  }
  items++;
 }
}
console.log(`${items} new catalog items and ${grants} Job grants retain all structured fields in Foundry v14 models.`);
