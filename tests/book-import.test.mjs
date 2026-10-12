import test from 'node:test';
import assert from 'node:assert/strict';
import {parseImport} from '../scripts/import-data.mjs';
import {itemFolders} from '../scripts/import-folders.mjs';
import {enhancedAbility} from '../scripts/abilities.mjs';
import {resolveDefense} from '../scripts/resolution.mjs';
test('folders remain under parents and sort alphabetically among siblings',()=>{
 const rows=[{id:'z',name:'Zeta'},{id:'a',name:'Alpha'},{id:'childZ',name:'Zulu',folder:'a'},{id:'childA',name:'Aardvark',folder:{id:'a'}},{id:'deep',name:'Child',folder:'childZ'}].map(f=>({...f,type:'Item'}));
 globalThis.game={folders:{contents:rows}};
 assert.deepEqual(Object.keys(itemFolders()),['','a','childA','childZ','deep','z']);assert.equal(itemFolders().deep,'— — Child');
});
test('whole book item blocks infer fields without truncating Consume text',()=>{
 const records=parseImport('1 ◼ DELUXE ACCESSORY\nHEART CONTAINER\nConsume this with a Meal to gain +1 Max Health.\n100 MAG\n\n◼◼ ENHANCED FASHION 1000MAG\nARMOR COAT\nARMOR +3 ARDOR +2\nProtective coat.','text','gear');
 assert.equal(records.length,2);assert.equal(records[0].item.system.magCost,100);assert.match(records[0].item.system.description,/Consume/);assert.equal(records[1].item.type,'fashion');assert.equal(records[1].item.system.slots,2);assert.equal(records[1].item.system.armor,3);assert.equal(records[1].item.system.ardor,2);
});
test('book Magick extracts costs, pools and an optional enhancement for review',()=>{
 const [record]=parseImport('FIRE SPEAR Magick\nMantra: Flare\nMudra: Dragon\n[✹✹][✦] SPI vs GRC\nYou may burn ✹ to gain +2 ATK.','text','magick');
 assert.equal(record.item.name,'Fire Spear');assert.equal(record.item.system.apCost,1);assert.equal(record.item.system.burnArdor,2);assert.equal(record.item.system.defensePool,'grc');assert.equal(record.item.system.enhancement.burnArdor,1);assert.equal(record.item.system.enhancement.bonus,2);
});
test('enhancement is opt-in, combines costs once, and only damages uncancelled strikes',()=>{
 const base={apCost:1,burnArdor:1,bonus:2,enhancement:{apCost:1,burnArdor:2,bonus:3}};
 assert.equal(enhancedAbility(base,false),base);assert.equal(enhancedAbility(base,true).apCost,2);assert.equal(enhancedAbility(base,true).burnArdor,3);assert.equal(enhancedAbility(base,true).bonus,5);assert.equal(base.bonus,2);
 const result=resolveDefense({results:[4,5,6],profile:{extraWounds:1,damage:'burn',ignoresArmor:true}},[4,6],0);assert.equal(result.wounds,2);
});
