// Exercise sheet submission against the installed Foundry model and validation code.
// Does not start Foundry or touch world data. Node 24.13+ is required.
import { registerHooks } from "node:module";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import assert from "node:assert/strict";

if (!process.argv[2]) throw new Error("Usage: node tools/check-foundry-resources.mjs <Foundry resources/app directory>");
const root = resolve(process.argv[2]);
const url = path => pathToFileURL(join(root, path)).href;
registerHooks({ resolve(specifier, context, next) {
  return next(specifier.startsWith("@common/") ? url(`common/${specifier.slice(8)}`) : specifier, context);
} });
await import(url("common/primitives/_module.mjs"));
globalThis.CONST = await import(url("common/constants.mjs"));
globalThis.game = { i18n: { localize: key => key, format: key => key } };
globalThis._loc = key => key;
globalThis.foundry = {
  utils: await import(url("common/utils/_module.mjs")),
  data: { fields: await import(url("common/data/fields.mjs")) },
  abstract: {
    DataModel: (await import(url("common/abstract/data.mjs"))).default,
    TypeDataModel: (await import(url("common/abstract/type-data.mjs"))).default
  }
};
// Use Foundry's actual synchronous preparation methods, without its browser-only rendering dependencies.
const source = (await readFile(join(root, "client/applications/api/document-sheet.mjs"), "utf8")).replaceAll("\r\n", "\n");
const methods = ["_prepareSubmitData", "_processFormData"].map(name => {
  const start = source.indexOf(`  ${name}(`);
  assert.ok(start >= 0);
  return source.slice(start, source.indexOf("\n  /* -------------------------------------------- */", start));
});
const BaseSheet = vm.runInThisContext(`(class { ${methods.join("\n")} })`);
foundry.applications = { api: { HandlebarsApplicationMixin: Base => Base }, sheets: { ActorSheetV2: BaseSheet, ItemSheetV2: BaseSheet } };
const { SwordsActorData, SwordsJobData, SwordsLicenseData, SwordsFashionData, SwordsEquipmentData, SwordsWeaponData, SwordsWeaponModData } = await import("../scripts/data-models.mjs");
// Actual Foundry effect field application: temporary values must not become saved base data.
const effectSource=(await readFile(join(root,"client/documents/active-effect.mjs"),"utf8")).replaceAll("\r\n","\n");
const fieldStart=effectSource.indexOf("  static applyChangeField(");
const fieldMethod=effectSource.slice(fieldStart,effectSource.indexOf("\n  /* -------------------------------------------- */",fieldStart));
const FieldEffect=vm.runInThisContext(`(class {${fieldMethod}})`);
const effectActor={system:new SwordsActorData({cultivations:{vio:2}})};
const field=effectActor.system.getFieldForProperty("cultivations.vio");
FieldEffect.applyChangeField(effectActor,{key:"system.cultivations.vio",type:"add",value:2},{field});
assert.equal(effectActor.system.cultivations.vio,4);
assert.equal(effectActor.system.toObject().cultivations.vio,2);
console.log("Foundry Active Effect field application changes prepared Cultivations without changing saved base ratings.");
const areaActor={system:new SwordsActorData({})};
FieldEffect.applyChangeField(areaActor,{key:'system.magickAreaBonus',type:'add',value:1},{field:areaActor.system.getFieldForProperty('magickAreaBonus')});
assert.equal(areaActor.system.magickAreaBonus,1);assert.equal(areaActor.system.toObject().magickAreaBonus,0);
console.log('Hermetic Robes area bonus applies through the real Foundry Active Effect field engine without persisting into the base actor.');
const weaponModel=new SwordsWeaponData({upgrade:"divine",ammo:{type:"Arrow",quantity:2},mods:[{slot:0,name:"Precise",description:"Reroll 1s"}]},{strict:true});
assert.equal(weaponModel.toObject().ammo.quantity,2);
assert.equal(weaponModel.dr,12);
assert.equal(weaponModel.attackBonus,2);
assert.equal(weaponModel.toObject().mods[0].name,"Precise");
assert.equal(new SwordsWeaponData({},{strict:true}).upgrade,"base");
assert.deepEqual(Object.keys(new SwordsWeaponModData({description:"Test"}).toObject()),["description","rarity","rule"]);
const equipment = new SwordsEquipmentData({paidCarry:4,bonus:2},{strict:true});
assert.equal(equipment.meridianCost,undefined);
assert.equal(equipment.toObject().paidCarry,4);
assert.equal(equipment.bonus,2);
const fashion = new SwordsFashionData({}, {strict:true});
assert.equal(fashion.armor,0);
assert.equal(fashion.ardor,0);
assert.equal(fashion.equipped,false);
const {fashionResources} = await import("../scripts/fashion.mjs");
const base = new SwordsActorData({armor:{value:1,max:2},ardor:{max:4,burnt:1,installed:1}});
const equipped = new SwordsActorData({...base.toObject(),...fashionResources(base.toObject(),null,{armor:3,ardor:2,equipped:true})},{strict:true});
assert.equal(equipped.armor.value,4);
assert.equal(equipped.armor.max,5);
assert.equal(equipped.availableArdor,4);
console.log("Fashion defaults and equipped resource totals passed Foundry's real data model.");
const { LICENSE_CHOICES, licenseIdentity } = await import("../scripts/licenses.mjs");
for (const sect of Object.keys(LICENSE_CHOICES)) {
  const license = new SwordsLicenseData({sect, prerequisites:{vio:3,sidhi:2},equipped:true},{strict:true});
  assert.equal(license.sect,licenseIdentity({sect}).sect);assert.equal(license.rank,sect.split(".")[1]);
  assert.equal(license.prerequisites.vio,3);
  assert.equal(license.prerequisites.sidhi,2);
  assert.equal(license.equipped,true);
}
for(const sect of ["Dracotine","Leonine","Mammon","Homebrew Moon Sect"])assert.equal(new SwordsLicenseData({sect,rank:"expert"},{strict:true}).sect,sect);
assert.equal(new SwordsLicenseData({prerequisites:{vio:-1}},{strict:true}).prerequisites.vio,0);
console.log("All 45 License choices and prerequisite validation passed Foundry's real data model.");
for (const category of ["body", "mind"]) {
  const job = new SwordsJobData({ category, cultivations: {vio:4} }, {strict:true});
  assert.equal(job.category,category);
  assert.equal(job.cultivations.vio,4);
}
const adjusted = new SwordsActorData({jobAdjustments:{vio:-2}}, {strict:true});
assert.equal(adjusted.toObject().jobAdjustments.vio,-2);
const { SwordsActorSheet } = await import("../scripts/sheets.mjs");
const model = new SwordsActorData({ health:{value:6,max:6}, armor:{value:2,max:2}, ardor:{max:4,burnt:1,installed:1} });
const sheet = new SwordsActorSheet();
let validated = 0;
sheet.document = { system: model, validate: ({changes}) => {
  new SwordsActorData(changes.system, { strict: true });
  validated++;
} };
for (const field of ["health.value", "armor.value", "ardor.burnt", "ardor.installed"]) {
  const data = model.toObject();
  foundry.utils.setProperty(data, field, 99);
  const submit = sheet._prepareSubmitData({target:{name:`system.${field}`}}, null, {object:{system:data}});
  assert.ok(submit.system.health.value <= submit.system.health.max);
  assert.ok(submit.system.armor.value <= submit.system.armor.max);
  assert.ok(submit.system.ardor.burnt + submit.system.ardor.installed <= submit.system.ardor.max);
}
assert.equal(validated,4);
assert.equal(model.health.value,6);
assert.equal(model.ardor.burnt,1);
console.log("All four over-limit sheet submissions passed Foundry's real preparation and model validation without mutating the original model (document transport stand-in; no live browser).");

const allModels=await import('../scripts/data-models.mjs');
globalThis.CONFIG??={};CONFIG.Item={dataModels:{weapon:allModels.SwordsWeaponData,fashion:allModels.SwordsFashionData,gear:allModels.SwordsGearData,accessory:allModels.SwordsEquipmentData,ammunition:allModels.SwordsAmmoData,job:allModels.SwordsJobData,license:allModels.SwordsLicenseData,technique:allModels.SwordsTechniqueData,magick:allModels.SwordsMagickData,trait:allModels.SwordsTraitData,weaponMod:allModels.SwordsWeaponModData,gambit:allModels.SwordsGambitData,salvage:allModels.SwordsEquipmentData}};
const {validateImport}=await import('../scripts/importer.mjs');
for(const [type,Model] of Object.entries(CONFIG.Item.dataModels)) {
 const item={name:`Test ${type}`,type,system:new Model().toObject()};
 const result=validateImport([item]);assert.equal(result.length,1);assert.equal(result[0].type,type);
}
assert.throws(()=>validateImport([{name:'Bad',type:'weapon',system:{range:-1}}]));
assert.throws(()=>validateImport([{name:'Missing ratings',type:'job',system:{}}]),/six/);
console.log('All importer types validated against real Foundry models; invalid weapon ranges and incomplete Jobs rejected.');

// Persistent creator uses real field metadata/models; document transport is isolated.
foundry.applications.api.ApplicationV2=class {};
const {SwordsItemCreator}=await import('../scripts/item-creator.mjs');
const creator=new SwordsItemCreator();
for(const type of Object.keys(CONFIG.Item.dataModels)) {
 creator.type=type;const context=await creator._prepareContext();
 assert.ok(context.fields||type==='weaponMod');
 assert.ok(!context.fields.includes('name="system.paidCarry"'));
 if(type==='job')assert.ok(context.fields.includes('system.cultivations.vio'));
 if(type==='license')assert.ok(context.fields.includes('Asuri'));
}
creator.type='weapon';
const {mkdir,writeFile}=await import('node:fs/promises');
await mkdir('tmp/ui',{recursive:true});
await writeFile('tmp/ui/creator-context.json',JSON.stringify(await creator._prepareContext()));
game.user={isGM:true};globalThis.ui={notifications:{info(){},warn(){},error(){}}};
const saved=[];let fail=false;
foundry.utils={...foundry.utils,getDocumentClass:()=>({createDocuments:async items=>{if(fail)throw Error('Transport failed');saved.push(...items);return items;}})};
creator.render=async()=>{creator.renders=(creator.renders??0)+1;};
const button={disabled:false},form={reportValidity:()=>true,querySelector:()=>button};
const makeData=name=>({object:{name,system:new CONFIG.Item.dataModels.weapon().toObject()}});
await SwordsItemCreator.createItem.call(creator,{},form,makeData('First weapon'));
await SwordsItemCreator.createItem.call(creator,{},form,makeData('Second weapon'));
assert.equal(saved.length,2);assert.equal(creator.count,2);assert.equal(creator.type,'weapon');assert.equal(creator.renders,2);
fail=true;await SwordsItemCreator.createItem.call(creator,{},form,makeData('Keep on failure'));
assert.equal(creator.count,2);assert.equal(creator.renders,2);assert.equal(button.disabled,false);assert.equal(form.inert,false);
assert.equal(SwordsItemCreator.DEFAULT_OPTIONS.form.closeOnSubmit,false);
console.log('Creator: all 13 field sets render; repeated creation stays open; failed saves do not reset the form.');

const {healthSutra}=await import('../scripts/health.mjs');
const healthActor={system:new SwordsActorData({health:{value:6,max:6}})};
FieldEffect.applyChangeField(healthActor,{key:'system.health.max',type:'add',value:2},{field:healthActor.system.getFieldForProperty('health.max')});
const sutra=healthSutra(healthActor.system.health);assert.equal(sutra.boxes.length,8);assert.equal(sutra.boxes.filter(b=>b.tone==='hale').length,5);
assert.equal(healthActor.system.toObject().health.max,6);
for(const [type,Model] of Object.entries(CONFIG.Item.dataModels)) {
 if(!['job','trait','technique','magick','license','gambit'].includes(type))for(const rarity of ['common','uncommon','enhanced','rare','deluxe','prestige'])assert.equal(new Model({rarity},{strict:true}).rarity,rarity);
 creator.type=type;const context=await creator._prepareContext();assert.equal(context.fields.includes('name="system.rarity"'),!['job','trait','technique','magick','license','gambit'].includes(type));
 if(type==='weapon'){assert.match(context.fields,/<select name="system.affinity">/);assert.match(context.fields,/>Nimble</);}
 if(type==='fashion'){assert.match(context.fields,/system.magCost/);assert.equal(new Model({magCost:150},{strict:true}).magCost,150);}
}
console.log('Real models: +2 Max Health adds two Hale levels; all item rarity choices, Fashion costs, and Affinity dropdown pass.');

foundry.documents={Actor:class {async _preUpdate(){}},ActiveEffect:class {}};
const {SwordsActor}=await import('../scripts/documents.mjs');
const boundedActor=new SwordsActor();boundedActor.type='npc';
const baseHealth=new SwordsActorData().toObject();boundedActor.toObject=()=>({system:structuredClone(baseHealth)});
boundedActor.system={...baseHealth,health:{value:6,max:8}};
let healthUpdate={'system.health.value':99};await boundedActor._preUpdate(healthUpdate,{},{});
assert.equal(foundry.utils.expandObject(healthUpdate).system.health.value,8);
healthUpdate={'system.health.value':8};await boundedActor._preUpdate(healthUpdate,{},{});
assert.equal(foundry.utils.expandObject(healthUpdate).system.health.value,8);
boundedActor.system.health.max=6;healthUpdate={'system.health.value':99};await boundedActor._preUpdate(healthUpdate,{},{});
assert.equal(foundry.utils.expandObject(healthUpdate).system.health.value,6);
console.log('Direct Actor/token update boundary clamps Health to effective maximum with and without a bonus.');

const magickModel=new allModels.SwordsMagickData({apCost:2,installArdor:1,burnArdor:1,mantra:'Burn',mudra:'Dragon',attackPool:'dia',defensePool:'spi',areaShape:'cone',areaSize:6},{strict:true});
assert.equal(magickModel.apCost,2);assert.equal(magickModel.mantra,'Burn');assert.equal(magickModel.defensePool,'spi');assert.ok(!Object.hasOwn(magickModel.toObject(),'gearSlot'));
for(const type of ['technique','magick']){creator.type=type;const context=await creator._prepareContext();assert.ok(!context.fields.includes('system.gearSlot'));assert.match(context.fields,/system.apCost/);}
creator.type='license';const licenseContext=await creator._prepareContext();assert.match(licenseContext.fields,/<input name="system.sect"/);assert.match(licenseContext.fields,/<select name="system.rank"/);
console.log('Homebrew sects, legacy License ranks, ability costs and slot-free Magick/Technick fields passed.');

fail=false;creator.element={inert:false};creator.folder='destination';
game.folders={contents:[{id:'destination',type:'Item',name:'New abilities'}],get:id=>id==='destination'?{id,type:'Item'}:null};
creator.batch=[{name:'Batch Magick',type:'magick',system:new allModels.SwordsMagickData().toObject()},{name:'Batch Technick',type:'technique',system:new allModels.SwordsTechniqueData().toObject()}];
const previousCount=creator.count;
await SwordsItemCreator.createBatch.call(creator);assert.equal(creator.batch.length,0);assert.equal(creator.count,previousCount+2);
assert.deepEqual(saved.slice(-2).map(item=>item.folder),['destination','destination']);assert.equal(creator.folder,'destination');
console.log('Mixed-type batch creates in the chosen folder and leaves the creator open.');

for(const type of ['job','trait']){const model=new CONFIG.Item.dataModels[type]().toObject();for(const key of ['rarity','quantity','slots','bonus'])assert.ok(!Object.hasOwn(model,key));}
assert.equal(new allModels.SwordsTraitData({level:15},{strict:true}).level,15);
// Catalog descriptions are plain text; browser HTML sanitation is outside this model-only harness.
foundry.utils.cleanHTML??=value=>value;
const catalog=JSON.parse(await readFile('data/non-sect-items.json','utf8'));
for(const item of catalog.items){const [result]=validateImport([item]);assert.equal(result.type,item.type);}
console.log(`All ${catalog.items.length} compendium entries validate against real Foundry models; Trait levels and removed fields verified.`);
for(const [type,Model] of Object.entries(CONFIG.Item.dataModels)){
 const data=new Model().toObject();
 assert.equal(Object.hasOwn(data,'meridianCost'),type==='license',`${type} Meridian field`);
}
assert.equal(new CONFIG.Item.dataModels.license().meridianCost,1);
assert.equal(new CONFIG.Item.dataModels.gear({magCost:150}).magCost,150);
assert.equal(Object.hasOwn(new CONFIG.Item.dataModels.license().toObject(),'rarity'),false);
console.log('Only Licenses expose Meridian cost; License rarity is absent and Gear Mag cost persists.');
for(const type of ['fashion','technique','weapon']){
 const model=new CONFIG.Item.dataModels[type]({specialAttacks:[{name:'Ash Spear',apCost:2,burnArdor:1,installArdor:1,bonus:3,attackPool:'spi',defensePool:'grc',damageType:'burn'}]},{strict:true});
 assert.equal(model.specialAttacks[0].apCost,2);assert.equal(model.specialAttacks[0].attackPool,'spi');
 assert.ok(new CONFIG.Item.dataModels[type]({specialAttacks:[{name:'Bad',apCost:-1}]},{strict:true}).specialAttacks.every(a=>a.apCost>=0));
}
console.log('Fashion and Technick special attacks persist costs and pools; real models keep costs nonnegative.');
const {SwordsItemSheet:SpecialItemSheet}=await import('../scripts/sheets.mjs');
for(const type of ['fashion','technique','weapon']){
 const sheet=new SpecialItemSheet();
 const form={object:{'system.specialAttacks.0.name':'Comet Strike','system.specialAttacks.0.apCost':2,'system.specialAttacks.0.burnArdor':1,'system.specialAttacks.0.installArdor':0,'system.specialAttacks.0.bonus':3,'system.specialAttacks.0.attackPool':'vio','system.specialAttacks.0.defensePool':'grc','system.specialAttacks.0.damageType':'impact','system.specialAttacks.0.description':'Test'}};
 const data=sheet._processFormData(null,null,form);
 assert.ok(Array.isArray(data.system.specialAttacks));
 const model=new CONFIG.Item.dataModels[type](data.system,{strict:true});assert.equal(model.specialAttacks[0].name,'Comet Strike');assert.equal(model.specialAttacks[0].bonus,3);
}
console.log('Actual Foundry form expansion preserves editable Special Attack arrays for Fashion and Technicks.');
const passiveActor={system:new SwordsActorData({attackBonus:0})};
FieldEffect.applyChangeField(passiveActor,{key:'system.attackBonus',type:'add',value:-3},{field:passiveActor.system.getFieldForProperty('attackBonus')});
assert.equal(passiveActor.system.attackBonus,-3);assert.equal(passiveActor.system.toObject().attackBonus,0);
const zeroAbility=new CONFIG.Item.dataModels.weapon({specialAttacks:[{name:'Killing Intent',mode:'automatic',hostile:false,apCost:0,installArdor:1,effectKey:'system.attackBonus',effectValue:-3}]},{strict:true});
assert.equal(zeroAbility.specialAttacks[0].mode,'automatic');assert.equal(zeroAbility.specialAttacks[0].apCost,0);assert.equal(zeroAbility.specialAttacks[0].effectValue,-3);
console.log('Automatic weapon abilities preserve zero AP and passive target modifiers apply through the real Active Effect engine.');
boundedActor.system.armor={...baseHealth.armor,max:2};
const armorUpdate={'system.armor.value':9};await boundedActor._preUpdate(armorUpdate,{},{});
assert.equal(foundry.utils.expandObject(armorUpdate).system.armor.value,2);
assert.equal(boundedActor.toObject().system.armor.max,0);
console.log('Armor update boundary uses effect-adjusted capacity without changing the saved base maximum.');

const {previewImport,commitImport}=await import('../scripts/import-workflow.mjs');
const importerFields=new Map();
const persistent={tab:'mass',folder:'',importDrafts:{mass:{format:'text',type:'trait',content:'1 1 Animal Magnetism\nDraw attention.\n1 2 Dialectician\nReason.',review:''}},element:{elements:{namedItem:name=>importerFields.get(name)},querySelector:()=>null},render:async()=>{}};
await previewImport.call(persistent);assert.equal(persistent.importDrafts.mass.names.length,2);
const originalReview=persistent.importDrafts.mass.review;
foundry.utils.getDocumentClass=()=>({createDocuments:async()=>{throw new Error('Transport failure');}});
await commitImport.call(persistent);assert.equal(persistent.importDrafts.mass.review,originalReview);assert.equal(persistent.busy,false);
foundry.utils.getDocumentClass=()=>({createDocuments:async data=>data.slice(0,1)});
await commitImport.call(persistent);assert.equal(JSON.parse(persistent.importDrafts.mass.review).length,1);
foundry.utils.getDocumentClass=()=>({createDocuments:async data=>data});
await commitImport.call(persistent);assert.equal(persistent.importDrafts.mass.review,'');assert.equal(persistent.tab,'mass');
persistent.importDrafts.mass.content='';await previewImport.call(persistent);assert.equal(persistent.tab,'mass');assert.equal(persistent.busy,false);
CONFIG.Actor={dataModels:{npc:SwordsActorData}};
const {parseWorldBeings}=await import('../scripts/worldbeing-import.mjs');
const parsedWorld=parseWorldBeings('BEAST\nHEALTH 6\nSIDHI 0 ARDOR 3 MOV 6\nVIO 3 DIA 1 GRC 2 SAV 2 WRD 1 SPI 1\n[TRAIT] Claws (+1 attack)\n[ITEMS] 1 sword')[0].actor;
persistent.tab='world';persistent.importDrafts.world={review:JSON.stringify([parsedWorld])};
let worldSaved;foundry.utils.getDocumentClass=()=>({createDocuments:async data=>{worldSaved=structuredClone(data);return [...data];}});
await commitImport.call(persistent);assert.equal(worldSaved[0].type,'npc');assert.equal(worldSaved[0].items.length,2);assert.equal(worldSaved[0].system.carry,7);assert.equal(persistent.importDrafts.world.review,'');
const grantModel=new SwordsJobData({grants:[{id:'grant1',name:'Rage',type:'trait',system:{level:2},effects:[]}]},{strict:true});assert.equal(grantModel.grants[0].system.level,2);
console.log('Persistent importer: failed saves retain preview, partial saves retain only remaining entries, success stays open, and World Being items validate with Carry accounting. Job grant snapshots survive real model serialization.');
