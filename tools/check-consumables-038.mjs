import './check-foundry-resources.mjs';
import assert from 'node:assert/strict';
const {SwordsGearData}=await import('../scripts/data-models.mjs');
const model=new SwordsGearData({consumable:{enabled:true,burntArdor:1,apCost:1}},{strict:true});
assert.equal(model.toObject().consumable.burntArdor,1);assert.equal(model.toObject().consumable.health,0);
assert.equal(CONFIG.Item.dataModels.gear,SwordsGearData);
console.log('Real Gear model retains configured recovery fields and defaults.');
