import test from 'node:test';
import assert from 'node:assert/strict';
import {pdfPages,pdfText} from '../scripts/pdf-reader.mjs';
import {manualItemSource,dropManualItem,createManualWorldBeing} from '../scripts/worldbeing-manual.mjs';
test('PDF ranges are bounded, sorted and deduplicated',()=>{
 assert.deepEqual(pdfPages('5, 2-4, 3',10),[2,3,4,5]);assert.deepEqual(pdfPages('',2),[1,2]);
 for(const [range,total] of [['',21],['0',10],['3-1',10],['11',10],['one',10],['1-21',30]])assert.throws(()=>pdfPages(range,total));
});
test('PDF text preserves stat-block line breaks',()=>{
 assert.equal(pdfText([{str:'RED SWORD',transform:[1,0,0,1,0,30]},{str:'HEALTH 6',transform:[1,0,0,1,0,20],hasEOL:true},{str:'VIO 3',transform:[1,0,0,1,0,10]}]),'RED SWORD\nHEALTH 6\nVIO 3');
});
test('manual loadout copies retain effects but reset document IDs and active costs',()=>{
 const input={_id:'old',folder:'packfolder',name:'Trait',system:{active:true,paidArdor:2},effects:[{_id:'effect',origin:'Item.old',changes:[{key:'system.health.max',value:'1'}]}]};
 const copy=manualItemSource(input);assert.equal(copy._id,undefined);assert.equal(copy.effects[0]._id,undefined);assert.equal(copy.effects[0].changes.length,1);assert.equal(copy.system.active,false);assert.equal(copy.system.paidArdor,0);assert.equal(input.system.active,true);
});
test('compendium browser drops are embedded during manual actor creation',async()=>{
 const app={manualDraft:{name:'Hunter'},manualItems:[],element:{querySelectorAll:()=>[]},render:async()=>{}};
 const item={documentName:'Item',testUserPermission:()=>true,toObject:()=>({_id:'compendium-id',name:'Bow',type:'weapon',system:{equipped:true},effects:[]})};let created;
 globalThis.game={user:{isGM:true},folders:{get:()=>null}};
 globalThis.ui={notifications:{warn:message=>{throw Error(message);},error:message=>{throw Error(message);},info:()=>{}}};
 globalThis.CONFIG={Actor:{dataModels:{npc:class{constructor(data){this.data=data;}toObject(){return this.data;}}}}};
 globalThis.foundry={utils:{fromUuid:async()=>item,getDocumentClass:()=>({createDocuments:async data=>{created=data[0];return [{name:'Hunter',sheet:{render:()=>{}}}];}})}};
 await dropManualItem.call(app,{preventDefault:()=>{},dataTransfer:{getData:()=>JSON.stringify({type:'Item',uuid:'Compendium.example.bows.Item.id'})}});
 assert.equal(app.manualItems.length,1);await createManualWorldBeing.call(app);assert.equal(created.items[0].name,'Bow');assert.equal(created.items[0].system.equipped,false);assert.equal(app.manualItems.length,0);
});
