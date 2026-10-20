import test from 'node:test';
import assert from 'node:assert/strict';
import {hermeticAreaEffect,magickAreaSize,prepareFashionEffects,ensureFashionEffects} from '../scripts/fashion-effects.mjs';
import {equipmentEffectSuppressed} from '../scripts/effects.mjs';
import {abilityArea} from '../scripts/areas.mjs';
test('Hermetic Robes receive a visible transferable effect, preserving existing or disabled changes',async()=>{
 for(const name of ['Hermetic Robes','Eschatonian Hermetic Robes','Eschitonian Hermetics Robes']){
  const item={name,type:'fashion',effects:[]},effect=hermeticAreaEffect(item);
  assert.equal(effect.transfer,true);assert.equal(effect.system.changes[0].key,'system.magickAreaBonus');
  let saved;item.toObject=()=>({effects:[{name:'Custom effect'}]});item.updateSource=v=>saved=v;
  prepareFashionEffects(item);assert.equal(saved.effects.length,2);assert.equal(saved.effects[0].name,'Custom effect');
  item.effects={contents:[{...effect,disabled:true}]};assert.equal(hermeticAreaEffect(item),null);
  item.createEmbeddedDocuments=()=>assert.fail('Must not duplicate existing effects');await ensureFashionEffects(item);
 }
 assert.equal(hermeticAreaEffect({type:'license',name:'Hermetic Robes'}),null);
 assert.equal(hermeticAreaEffect({type:'fashion',name:'Other Robes'}),null);
});
test('equipped robes enlarge Magick patterns only; Scathe casting range remains 6m',()=>{
 const robes={type:'fashion',system:{equipped:false}};
 assert.equal(equipmentEffectSuppressed(robes),true);robes.system.equipped=true;assert.equal(equipmentEffectSuppressed(robes),false);
 const scathe=abilityArea({description:'Summon a 1m burst within 6m.'});
 assert.equal(magickAreaSize('magick',scathe.shape,scathe.size,{magickAreaBonus:1}),2);
 assert.equal(scathe.range,6);
 assert.equal(magickAreaSize('magick','none',0,{magickAreaBonus:1}),0);
 assert.equal(magickAreaSize('technique','cone',7,{magickAreaBonus:1}),7);
 assert.equal(magickAreaSize('weapon','ray',10,{magickAreaBonus:1}),10);
 assert.equal(magickAreaSize('magick','circle',1,{magickAreaBonus:0}),1);
 assert.equal(magickAreaSize('magick','circle',3,{magickAreaBonus:1}),4);
});
