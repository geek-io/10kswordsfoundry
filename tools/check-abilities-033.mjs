import './check-foundry-resources.mjs';
import assert from 'node:assert/strict';
const {SwordsActorSheet}=await import('../scripts/sheets.mjs');
for(const type of ['wanderer','npc']){
 const removed=[];
 const sheet={isEditable:true,submit:async()=>{},document:{type,items:{get:id=>id==='trait'?{id,type:'trait'}:null},deleteEmbeddedDocuments:async(type,ids)=>removed.push(...ids)}};
 const menu=SwordsActorSheet.prototype._itemContextOptions.call(sheet)[0];
 assert.equal(menu.label,'Remove');assert.ok(menu.visible({dataset:{itemId:'trait'}}));
 await menu.onClick({}, {dataset:{itemId:'trait'}});assert.deepEqual(removed,['trait']);
 sheet.isEditable=false;assert.equal(menu.visible({dataset:{itemId:'trait'}}),false);
}
for(const type of ['technique','magick']){
 const Model=CONFIG.Item.dataModels[type];
 const model=new Model({paidArdor:2,equipped:true,apCost:2,burnArdor:1,installArdor:2},{strict:true});
 assert.equal(model.toObject().paidArdor,2);
}
let saved;
const source={system:{actions:0,health:{max:6,value:4},ardor:{max:4,burnt:1,installed:2}},items:[{type:'technique',system:{paidArdor:2,equipped:true}},{type:'weapon',system:{equipped:true}}]};
foundry.applications.api.DialogV2={confirm:async()=>true};globalThis.ui={notifications:{info:()=>{}}};
await SwordsActorSheet.rest.call({isEditable:true,submit:async()=>{},document:{system:source.system,toObject:()=>structuredClone(source),update:async data=>{saved=data;return true;}}});
assert.equal(saved.items[0].system.paidArdor,0);assert.equal(saved.items[0].system.equipped,false);assert.equal(saved.items[1].system.equipped,true);assert.equal(saved.system.ardor.installed,0);
console.log('0.1.33: native menu callbacks on both Actor types, real ability reservation fields, and Full Rest release passed (document transport simulated).');

