// Uses the installed Foundry v14 fields, without starting or modifying a world.
import './check-foundry-resources.mjs';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {SwordsLicenseData,SwordsTechniqueData,SwordsMagickData}=await import('../scripts/data-models.mjs');
const models={license:SwordsLicenseData,technique:SwordsTechniqueData,magick:SwordsMagickData};
let count=0;
for(const pack of ['sect-licenses','sect-technicks','sect-magicks']){
 const catalog=JSON.parse(await readFile(`data/${pack}.json`,'utf8'));
 for(const item of catalog.items){
  const model=new models[item.type](item.system,{strict:true});
  const stored=model.toObject();
  for(const key of ['sect','rank','apCost','burnArdor','installArdor','mantra','mudra','mudraHands','bonus','attackPool','defensePool']){
   if(Object.hasOwn(item.system,key))assert.equal(stored[key],item.system[key],`${item.name}: ${key}`);
  }
  for(const [key,value] of Object.entries(item.system.prerequisites??{}))assert.equal(stored.prerequisites[key],value,`${item.name}: ${key}`);
  for(const [index,ability] of (item.system.specialAttacks??[]).entries())for(const [key,value] of Object.entries(ability))assert.deepEqual(stored.specialAttacks[index][key],value,`${item.name}: ability ${index} ${key}`);
  count++;
 }
}
assert.equal(count,282);
console.log(`All ${count} Sect items validate and retain their structured fields in Foundry v14 models.`);
