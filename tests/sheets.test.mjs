import test from "node:test";
import assert from "node:assert/strict";

// Exercise our sheet boundary, without claiming to simulate a live Foundry UI.
class BaseSheet {
  get title() { return "Wanderer: Test"; }
  _processFormData(event, form, formData) { return structuredClone(formData.object); }
  _onChangeForm() { this.submittedValues = Object.fromEntries([...this.inputs].map(([k,v]) => [k,v.value])); }
}
globalThis.foundry = {
  applications: { api: { HandlebarsApplicationMixin: Base => Base }, sheets: { ActorSheetV2: BaseSheet, ItemSheetV2: BaseSheet } },
  utils: { mergeObject: (a,b) => ({ ...a, ...b }) }
};
const { SwordsActorSheet, SwordsItemSheet } = await import("../scripts/sheets.mjs");
test('Add New creates a blank embedded item of the chosen type and opens its editor',async()=>{
 const sheet=new SwordsActorSheet(),calls=[];
 globalThis.CONFIG={Item:{dataModels:{trait:class{toObject(){return {description:'',level:1};}}}}};
 globalThis.game={i18n:{localize:()=> 'Trait'}};
 globalThis.ui={notifications:{warn:message=>calls.push(message)}};
 sheet.isEditable=true;sheet.submit=async()=>calls.push('submit');
 sheet.document={type:'wanderer',createEmbeddedDocuments:async(type,items)=>{
  calls.push({type,items});return [{sheet:{render:async options=>calls.push(options)}}];
 }};
 await SwordsActorSheet.addNew.call(sheet,null,{dataset:{itemType:'trait'}});
 assert.deepEqual(calls,['submit',{type:'Item',items:[{name:'New Trait',type:'trait',img:'systems/10kswordsfoundry/assets/icons/trait.svg',system:{description:'',level:1}}]},{force:true}]);
 assert.equal(sheet._creatingItem,false);
 sheet.isEditable=false;await SwordsActorSheet.addNew.call(sheet,null,{dataset:{itemType:'trait'}});
 assert.equal(calls.length,3);
});
test('Add New keeps the sheet usable after failed creation',async()=>{
 const sheet=new SwordsActorSheet(),messages=[];
 globalThis.CONFIG={Item:{dataModels:{trait:class{toObject(){return {};}}}}};
 globalThis.game={i18n:{localize:()=> 'Trait'}};
 globalThis.ui={notifications:{warn:message=>messages.push(message)}};
 sheet.isEditable=true;sheet.submit=async()=>{};
 sheet.document={type:'wanderer',createEmbeddedDocuments:async()=>{throw new Error('Save failed');}};
 await SwordsActorSheet.addNew.call(sheet,null,{dataset:{itemType:'trait'}});
 assert.deepEqual(messages,['Save failed']);assert.equal(sheet._creatingItem,false);
});
test("window title contains only the Actor title", () => {
  assert.equal(new SwordsActorSheet().title, "Wanderer: Test");
});
function fixture() {
  const sheet = new SwordsActorSheet();
  const source = { health:{value:6,max:6}, armor:{value:2,max:2}, ardor:{max:4,burnt:1,installed:1} };
  sheet.document = {system:{...source,toObject:()=>structuredClone(source)}};
  sheet.isEditable = true;
  sheet.inputs = new Map(Object.entries(source).flatMap(([key,values]) => Object.entries(values).map(([field,value]) => [`system.${key}.${field}`,{value:String(value)}])));
  sheet.form = {elements:{namedItem:name=>sheet.inputs.get(name)}};
  return sheet;
}
test("sheet resets over-max Health before Foundry's change handler reads it", () => {
  const sheet=fixture();
  sheet.inputs.get("system.health.value").value="99";
  sheet._onChangeForm({}, {target:{name:"system.health.value"}});
  assert.equal(sheet.submittedValues["system.health.value"],"6");
  assert.equal(sheet.inputs.get("system.health.value").max,"6");
});
test("sheet resets over-budget Ardor before auto-submission", () => {
  const sheet=fixture();
  sheet.inputs.get("system.ardor.burnt").value="99";
  sheet._onChangeForm({}, {target:{name:"system.ardor.burnt"}});
  assert.equal(sheet.submittedValues["system.ardor.burnt"],"3");
  assert.equal(sheet.submittedValues["system.ardor.installed"],"1");
  assert.equal(sheet.inputs.get("system.ardor.installed").max,"1");
});
test("submission normalization protects a direct submit that bypassed input events", () => {
  const sheet=fixture();
  const system=sheet.document.system.toObject();
  system.health.value=99; system.ardor.installed=99;
  const data=sheet._processFormData(null,null,{object:{system}});
  assert.equal(data.system.health.value,6);
  assert.deepEqual(data.system.ardor,{max:4,burnt:1,installed:3});
});

test("weapon previews read current form values without waiting for blur or a document render", () => {
  const sheet=new SwordsItemSheet();
  sheet.document={type:"weapon",toObject:()=>({system:{range:1,bonus:0,upgrade:"base",damageType:"cut",properties:{},mods:[]}})};
  const inputs={"system.range":{value:"20"},"system.bonus":{value:"3"},"system.upgrade":{value:"refined"},"system.damageType":{value:"impact"},"system.properties.reach":{checked:true}};
  const nodes=Object.fromEntries(["profile","attack","upgrade"].map(key=>[key,{textContent:""}]));
  sheet.form={elements:{namedItem:key=>inputs[key]}};
  sheet.element={querySelector:selector=>nodes[selector.match(/"(.*?)"/)[1]]};
  sheet._refreshWeaponPreview();
  assert.equal(nodes.profile.textContent,"Range 21 m; 1 hand(s); 1 action(s); impact.");
  assert.equal(nodes.attack.textContent,"Total attack bonus: +4 · DR: 8");
});
test("owned weapon form submission awaits save and refreshes calculated details", async () => {
  const sheet=new SwordsItemSheet(), calls=[];
  sheet.document={type:"weapon"};
  sheet._saveWeapon=async data=>{calls.push(data);return {id:"weapon"};};
  sheet.render=async options=>calls.push(options);
  const result=await sheet._processSubmitData(null,null,{system:{bonus:3,range:20}});
  assert.equal(result.updated.id,"weapon");
  assert.deepEqual(calls,[{system:{bonus:3,range:20}},{force:true}]);
});

test('bonus Health can be selected and submitted without baking its maximum into base stats',async()=>{
 const sheet=fixture(),source=sheet.document.system.toObject();
 sheet.document.toObject=()=>({system:structuredClone(source)});
 sheet.document.system.health={value:6,max:8};
 sheet.inputs.get('system.health.value').value='8';sheet._syncResourceInputs();
 assert.equal(sheet.inputs.get('system.health.value').value,'8');assert.equal(sheet.inputs.get('system.health.max').value,'6');
 const data=sheet._processFormData(null,null,{object:{system:{...source,health:{value:8,max:6}}}});
 assert.equal(data.system.health.value,8);assert.equal(data.system.health.max,6);
 let saved;sheet.submit=async()=>{};sheet.document.update=async value=>{saved=value;};
 await SwordsActorSheet.setHealth.call(sheet,null,{dataset:{healthValue:'8'}});
 assert.deepEqual(saved,{'system.health.value':8});
});
