import test from "node:test";
import assert from "node:assert/strict";
import { CULTIVATIONS } from "../scripts/rules.mjs";
import { SECTS, LICENSE_CHOICES, LICENSE_DENIED, qualifiesForLicense } from "../scripts/licenses.mjs";

test("all 15 sects offer three ranks and Cultivations use the requested order", () => {
  assert.equal(Object.keys(SECTS).length,15);
  assert.equal(Object.keys(LICENSE_CHOICES).length,45);
  for (const key of Object.keys(SECTS)) for (const rank of ["novice","expert","master"])
    assert.ok(LICENSE_CHOICES[`${key}.${rank}`]);
  assert.deepEqual(Object.keys(CULTIVATIONS),["vio","dia","grc","sav","wrd","spi"]);
});
test("every prerequisite is required, including exact thresholds and Sidhi", () => {
  const prerequisites={vio:3,dia:2,grc:4,sav:1,wrd:2,spi:3,sidhi:2};
  const actor={cultivations:{...prerequisites},sidhi:2};
  assert.equal(qualifiesForLicense(actor,{prerequisites}),true);
  for (const key of Object.keys(CULTIVATIONS)) {
    const below=structuredClone(actor); below.cultivations[key]--;
    assert.equal(qualifiesForLicense(below,{prerequisites}),false,key);
  }
  assert.equal(qualifiesForLicense({...actor,sidhi:1},{prerequisites}),false);
  assert.equal(qualifiesForLicense({},{}),true);
});

class BaseSheet { async _prepareContext() { return {editable:true}; } }
let warnings=[], created=[];
globalThis.ui={notifications:{warn:message=>warnings.push(message),error:message=>{throw new Error(message);}}};
globalThis.game={user:{isGM:false}};
globalThis.foundry={applications:{ux:{TextEditor:{implementation:{enrichHTML:async value=>value}}},api:{HandlebarsApplicationMixin:Base=>Base},sheets:{ActorSheetV2:BaseSheet,ItemSheetV2:BaseSheet}},utils:{mergeObject:(a,b)=>({...a,...b}),cleanHTML:value=>value,deepClone:structuredClone,randomID:()=>"copy",getDocumentClass:()=>({create:async(data,options)=>{created.push({data,options});return data;}})}};
const {SwordsActorSheet}=await import("../scripts/sheets.mjs");
function fixture(vio=2) {
  warnings=[]; created=[];
  const sheet=new SwordsActorSheet();
  sheet.isEditable=true; sheet.submit=async()=>{};
  sheet.document={isOwner:true,uuid:"Actor.test",system:{carry:8,meridians:3,cultivations:{vio},sidhi:0,ardor:{max:2,burnt:0,installed:0}}};
  let items=[];
  sheet.document.toObject=()=>({system:structuredClone(sheet.document.system),items:structuredClone(items)});
  sheet.document.items={get:id=>items.find(i=>i._id===id)};
  sheet.document.update=async data=>{items=data.items;sheet.document.system=data.system;created.push({data:items[0]});return sheet.document;};
  const data={_id:"source",type:"license",name:"Test",system:{sect:"asuri.novice",prerequisites:{vio:3}}};
  return {sheet,item:{id:"source",...data,toObject:()=>structuredClone(data)}};
}
test("unqualified drops are blocked with a simple warning; qualified copies equip",async()=>{
  const {sheet,item}=fixture();
  assert.equal(await sheet._onDropItem({},item),null);
  assert.deepEqual(warnings,[LICENSE_DENIED]); assert.equal(created.length,0);
  sheet.document.system.cultivations.vio=3;
  await sheet._onDropItem({},item);
  assert.equal(created.length,1); assert.equal(created[0].data.system.equipped,true);
  assert.equal(created[0].data._id,"copy"); assert.equal(item.system.equipped,undefined);
});
test("Job drop area rejects a License",async()=>{
  const {sheet,item}=fixture(4);
  await sheet._onDropItem({target:{closest:()=>true}},item);
  assert.equal(created.length,0); assert.deepEqual(warnings,["Drop a Job item here."]);
});
test("Fashion copies start unequipped even when dragged from an equipped source",async()=>{
  const {sheet}=fixture();
  let state={system:{carry:8,meridians:2},items:[]};
  sheet.document.isOwner=true; sheet.document.toObject=()=>structuredClone(state);
  sheet.document.items={get:id=>state.items.find(item=>item._id===id)};
  sheet.document.update=async data=>{state=data;created.push({data:data.items[0]});return sheet.document;};
  const data={_id:"fashion",type:"fashion",system:{armor:2,ardor:1,equipped:true}};
  await sheet._onDropItem({}, {...data,toObject:()=>structuredClone(data)});
  assert.equal(created.length,1);
  assert.equal(created[0].data.system.equipped,false);
  assert.equal(data.system.equipped,true);
});
test("equip rechecks requirements and unequip remains possible after stats fall",async()=>{
  const {sheet,item}=fixture(); let updates=[];
  sheet.document.toObject=()=>({system:structuredClone(sheet.document.system),items:[item.toObject()]});
  sheet.document.update=async data=>{updates.push(data);return sheet.document;};
  sheet.document.items={get:()=>item};
  await SwordsActorSheet.toggleLicense.call(sheet,{}, {dataset:{itemId:"source"}});
  assert.equal(updates.length,0); assert.deepEqual(warnings,[LICENSE_DENIED]);
  item.system.equipped=true;
  item.toObject=()=>({_id:"source",type:"license",system:structuredClone(item.system)});
  await SwordsActorSheet.toggleLicense.call(sheet,{}, {dataset:{itemId:"source"}});
  assert.equal(updates.length,1); assert.equal(updates[0].items[0].system.equipped,false);
});
test("Jobs and Licenses are separated from Gear and unmet licenses are inactive",async()=>{
  const {sheet,item}=fixture(); item.system.equipped=true;
  const job={type:"job",name:"Job"},gear={type:"gear",name:"Gear"};
  const contents=[job,item,gear];
  sheet.document.items={contents,find:callback=>contents.find(callback)};
  const context=await sheet._prepareContext({});
  assert.equal(context.items.length,1); assert.equal(context.items[0].name,gear.name); assert.equal(context.items[0].equippable,true); assert.equal(context.jobItem,job);
  assert.equal(context.licenses[0].qualified,false); assert.equal(context.licenses[0].active,false);
});
