// Catalog mechanics: use the real Foundry field engine configured by this harness.
import './check-effect-variables.mjs';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {SwordsActorData,SwordsTraitData}=await import('../scripts/data-models.mjs');
const {SwordsActiveEffect}=await import('../scripts/documents.mjs');
const catalog=JSON.parse(await readFile('data/grimoire-traits.json','utf8'));
let changes=0;
for(const item of catalog.items)for(const effect of item.effects)for(const level of [1,3]){
 assert.equal(effect.transfer,true);assert.equal(effect.disabled,item.effects.indexOf(effect)>0);
 const parent={documentName:'Item',system:new SwordsTraitData({...item.system,level})};
 for(const change of effect.system.changes){
  const actor={system:new SwordsActorData({cultivations:{vio:10,dia:10,grc:10,sav:10,wrd:10,spi:10}})};
  const get=()=>change.key.split('.').reduce((v,k)=>v[k],actor);
  const before=get();const amount=change.value==='1'?1:change.value.startsWith('-')?-level:level;
  SwordsActiveEffect.applyChange(actor,{...change,effect:{...effect,parent}});
  assert.equal(get(),before+amount,`${item.name}: ${change.key} at Level ${level}`);changes++;
 }
}
assert.equal(catalog.items.filter(i=>i.effects.length).length,33);
console.log(`All ${changes} Trait effect applications passed at Levels 1 and 3.`);
