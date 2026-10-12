import test from 'node:test';
import assert from 'node:assert/strict';
import {titleCase,paragraphText} from '../scripts/import-format.mjs';
import {migrateInventory} from '../scripts/migration.mjs';
import {reconcileCosts} from '../scripts/equipment.mjs';
import {itemCosts} from '../scripts/slots.mjs';
import {editorValue} from '../scripts/rich-text.mjs';
test('imports retain paragraphs, punctuation and abbreviations while removing soft wraps',()=>{
 assert.equal(titleCase("HDF DRAGON'S BLADE"),"HDF Dragon's Blade");
 assert.equal(editorValue(paragraphText('A wrapped\nline.\n\nAnother para-\ngraph.')),'<p>A wrapped line.</p><p>Another paragraph.</p>');
 assert.equal(paragraphText('<p>A<br>wrapped\nline.</p><p>Next.</p>'),'<p>A wrapped line.</p><p>Next.</p>');
});
test('only equipped Licenses spend Meridians, regardless of stale cost fields',()=>{
 for(const type of ['fashion','gear','technique','magick','weapon'])assert.equal(itemCosts({type,system:{equipped:true,meridianCost:3}}).meridians,0);
 assert.equal(itemCosts({type:'license',system:{equipped:true}}).meridians,1);
 assert.equal(itemCosts({type:'license',system:{equipped:false,meridianCost:3}}).meridians,0);
});
test('migration refunds legacy ability costs, charges Licenses once and preserves choices',()=>{
 const source={system:{meridians:0,carry:8},flags:{'10kswordsfoundry':{inventoryVersion:14}},items:[{type:'magick',system:{equipped:true,paidMeridians:2}},{type:'license',system:{equipped:true,meridianCost:1}}]};
 assert.equal(migrateInventory(source),true);assert.equal(source.system.meridians,1);assert.equal(source.items[0].system.paidMeridians,0);assert.equal(source.items[1].system.paidMeridians,1);
 assert.equal(migrateInventory(source),false);assert.equal(source.system.meridians,1);
});
test('existing over-capacity Licenses can be unequipped incrementally without inventing capacity',()=>{
 const source={system:{meridians:1,carry:8},items:Array.from({length:3},()=>({type:'license',system:{equipped:true,meridianCost:1}}))};
 migrateInventory(source);assert.equal(source.system.meridianOverage,2);assert.equal(source.system.meridians,0);
 for(let i=0;i<3;i++){const before=structuredClone(source.items);source.items[i].system.equipped=false;reconcileCosts(source,before);assert.equal(source.system.meridianOverage,Math.max(0,1-i));}
 assert.equal(source.system.meridians,1);
});
