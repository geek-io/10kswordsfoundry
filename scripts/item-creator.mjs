import {readPdf,cancelPdf} from './pdf-reader.mjs?v=0.2.50';
import {rememberImport,changeImportTab,previewImport,commitImport} from './import-workflow.mjs?v=0.2.50';
import {MANUAL_STATS,MANUAL_STATS_21,rememberManual,createManualWorldBeing,browseManualItems,dropManualItem,removeManualItem} from './worldbeing-manual.mjs?v=0.2.50';
import {itemFolders,checkedFolder} from "./import-folders.mjs?v=0.2.50";
import {IMPORT_TYPES,importTypes} from './import-data.mjs?v=0.2.50';
import {usesRules21} from './rules-version.mjs?v=0.2.50';
import {CORES,PARTS,PROFILES,ASSETS_21,WEAPON_MODS_21} from './rules21.mjs?v=0.2.50';
import {validateImport,openImporter} from './importer.mjs?v=0.2.50';
import {escapeHTML} from './resolution.mjs?v=0.2.50';
import {LICENSE_CHOICES} from './licenses.mjs?v=0.2.50';
import {UPGRADE_CHOICES} from './weapons.mjs?v=0.2.50';
import {AMMO_CHOICES,AMMO_FAMILIES} from './ammunition.mjs?v=0.2.50';
import {MODIFIER_CHOICES,AFFINITIES} from './modifiers.mjs?v=0.2.50';
import {clearLibraryCache} from './library-service.mjs?v=0.2.50';

const hidden=new Set(['description','equipped','paidCarry','paidMeridians','paidArdor','ammoId','mods']);
const labels={burntArdor:'Recover burnt Ardor',allBurntArdor:'Recover all burnt Ardor',allHealth:'Heal all Health',health:'Health restored',bonus:'Base bonus',slots:'Carry cost',meridianCost:'Meridian cost',apCost:'AP cost (✦)',installArdor:'Install Ardor (❂)',burnArdor:'Burn Ardor (✹)',mudraHands:'Hands required',areaSize:'Area size (m)',magCost:'Magnetite (Mag) cost',gearSlot:'Equipment slot',category:'Body / Mind',sect:'Sect',range:'Base range (m)',properties:'Inherent modifiers',ammo:'Inline ammo',cultivations:'Cultivations',prerequisites:'Prerequisites',vio:'VIO',dia:'DIA',grc:'GRC',sav:'SAV',wrd:'WRD',spi:'SPI'};
const title=key=>labels[key]??key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase());
const choices={affinity:{"":"None",...Object.fromEntries(Object.keys(AFFINITIES).map(key=>[title(key),title(key)]))},upgrade:UPGRADE_CHOICES,ammoType:AMMO_CHOICES,ammoFamily:AMMO_FAMILIES,rule:{'':'None',...MODIFIER_CHOICES}};
// Rules 2.1: the form shows the fields 2.1 uses, under the book's names, and leaves the 2.0.3-only ones out.
const hidden21=new Set(['system.slots','system.bonus','system.apCost','system.armor','system.ardor','system.attackPool','system.defensePool','system.damageType','system.upgrade','system.affinity','system.properties','system.enhancement','system.meridianCost','system.rank','system.consumable.apCost','system.r21.damage']);
const labels21={'system.magCost':'Price (♄)','system.installArdor':'Install Flame (❂)','system.burnArdor':'Burn Flame (✹)','system.range':'Range (m)','system.ammo':'Loaded ammo','system.r21':'Rules 2.1','system.r21.profile':'Profile','system.r21.grip':'Grip','system.r21.damageBonus':'Extra damage','system.r21.range':'Range override (m; 0 = Profile range)','system.r21.rate':'Rate of fire','system.r21.capacity':'Magazine size','system.r21.ferocious':'FEROCIOUS rating','system.r21.shield':'SHIELD rating','system.r21.reach':'REACH (m)','system.r21.affinity':'Affinity','system.r21.grade':'Material Grade','system.r21.morph':'MORPH Profiles','system.r21.mods':'Mods','system.r21.weight':'Weight (kg)','system.r21.coverage':'Soak by Part','system.r21.morale':'Morale bonus','system.r21.mod':'Armor Mod','system.r21.potency':'Charges needed (Charge Time)','system.r21.castTime':'Charge Time note','system.r21.core':'Casting Core','system.r21.skill':'Casting Cultivation','system.r21.bonus':'Casting bonus dice','system.key':'Printed Asset','system.stars':'Stars','system.detail':'Detail','system.cultivation':'Sect Cultivation','system.weapons':'Sect weapons','system.ingested':'Ingested','system.consumable':'Consumable','system.consumable.burntArdor':'Recover burnt Flame','system.consumable.allBurntArdor':'Recover all burnt Flame','system.consumable.health':'HP healed','system.consumable.allHealth':'Heal every Part'};
const label21=name=>labels21[name]??(name.startsWith('system.r21.coverage.')?PARTS[name.split('.').at(-1)]?.label:name.startsWith('system.r21.mods.')?WEAPON_MODS_21[name.split('.').at(-1)]?.split(' — ')[0]:undefined);
const choices21={'system.r21.core':()=>Object.fromEntries(Object.entries(CORES).map(([key,core])=>[key,core.label])),'system.r21.profile':()=>({'':'—',...Object.fromEntries(Object.entries(PROFILES).map(([key,profile])=>[key,profile.label]))}),'system.key':()=>Object.fromEntries(Object.entries(ASSETS_21).map(([key,asset])=>[key,asset.label??title(key)]))};
function fieldsHTML(fields,values,prefix='system',type='',rules21=false) {
 const F=foundry.data.fields;
 return Object.entries(fields).filter(([key])=>(key==='description'&&prefix!=='system'||!hidden.has(key)||rules21&&`${prefix}.${key}`==='system.r21.mods')&&!(['technique','magick'].includes(type)&&['gearSlot','slots','quantity'].includes(key))&&!(rules21&&hidden21.has(`${prefix}.${key}`))).map(([key,field])=>{
  const name=`${prefix}.${key}`,value=values?.[key],label=escapeHTML((rules21?label21(name):undefined)??MODIFIER_CHOICES[key]??title(key));
  if(field instanceof F.SchemaField)return `<fieldset class="creator-wide"><legend>${label}</legend><div class="creator-grid">${fieldsHTML(field.fields,value,name,type,rules21)}</div></fieldset>`;
  if(field instanceof F.ArrayField)return '';
  let options=(rules21?choices21[name]:undefined)??(rules21&&name.startsWith('system.r21.')?undefined:choices[key])??field.choices;
  if(typeof options==='function')options=options();
  if(Array.isArray(options))options=Object.fromEntries(options.map(v=>[v,title(v)]));
  if(options)return `<label>${label}<select name="${name}">${Object.entries(options).map(([v,l])=>`<option value="${escapeHTML(v)}" ${v===value?'selected':''}>${escapeHTML(l)}</option>`).join('')}</select></label>`;
  if(field instanceof F.BooleanField)return `<label class="creator-check"><input type="checkbox" name="${name}" ${value?'checked':''}>${label}</label>`;
  if(field instanceof F.NumberField)return `<label>${label}<input type="number" name="${name}" value="${value}" step="${field.integer?1:'any'}" ${Number.isFinite(field.min)?`min="${field.min}"`:''} ${Number.isFinite(field.max)?`max="${field.max}"`:''}></label>`;
  return `<label>${label}<input name="${name}" value="${escapeHTML(value??'')}"></label>`;
 }).join('');
}
export class SwordsItemCreator extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
 static DEFAULT_OPTIONS={id:'swords-item-creator',tag:'form',classes:['swords','swords-item-creator'],window:{title:'Importer',resizable:true},position:{width:740,height:760},form:{handler:SwordsItemCreator.createItem,closeOnSubmit:false,submitOnChange:false},actions:{readPdf,cancelPdf,browseManualItems,removeManualItem,createManualWorldBeing,importTab:changeImportTab,previewImport,commitImport,queue:SwordsItemCreator.queueItem,createBatch:SwordsItemCreator.createBatch,removeQueued:SwordsItemCreator.removeQueued,bulk:SwordsItemCreator.bulk,editLast:SwordsItemCreator.editLast}};
 static PARTS={main:{template:'systems/10kswordsfoundry/templates/item-creator.hbs'}};
 tab='single';importDrafts={};folder='';batch=[];type='weapon';count=0;lastItem=null;busy=false;drafts={};manualDraft={};manualStatus='';manualItems=[];
 async _prepareContext(){
  const rules21=this.rules21=usesRules21(),types=importTypes(rules21);
  if(!Object.hasOwn(types,this.type))this.type='weapon';
  const Model=CONFIG.Item.dataModels[this.type],manualStats=rules21?MANUAL_STATS_21:MANUAL_STATS;
  const draft=this.drafts[this.type]??{name:'',system:new Model().toObject()};
  return {manualItems:this.manualItems.map((item,index)=>({index,name:item.name,type:item.type})),isManual:this.tab==='manual',manual:this.manualDraft,manualStatus:this.manualStatus,rules21,pdfColumns:this.pdfColumns??rules21,versionChoices:{all:'Every printed version',1:'First only (lowest Sidhi)',2:'Second only',3:'Third only'},manualStats:manualStats.map(([key,label,initial,min,max],index)=>({key,label,value:this.manualDraft[key]??initial,min,max,resource:index<6})),actorFolders:Object.fromEntries([['','Actors root'],...(game.folders?.contents??[]).filter(f=>f.type==='Actor').sort((a,b)=>a.name.localeCompare(b.name)).map(f=>[f.id,f.name])]),isSingle:this.tab==='single',isWorld:this.tab==='world',tab:this.tab,importState:this.importDrafts[this.tab]??{format:'text',type:rules21?'technique':'trait',versions:'all'},formats:{text:rules21?'Rulebook text (2.1)':'Rulebook text',json:'JSON',csv:'CSV'},folders:itemFolders(),folder:this.folder,batch:this.batch.map((item,index)=>({index,name:item.name,type:IMPORT_TYPES[item.type]})),types,type:this.type,name:draft.name,fields:fieldsHTML(Model.schema.fields,draft.system,'system',this.type,rules21),description:draft.system.description??'',count:this.count,lastName:this.lastItem?.name};
 }
 async _onRender(context,options){
  await super._onRender(context,options);
  const drop=this.element.querySelector('[data-manual-loadout]');drop?.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});drop?.addEventListener('drop',dropManualItem.bind(this));
  for(const button of this.element.querySelectorAll('[data-action="importTab"]')){const active=button.dataset.tab===this.tab;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}
  this.element.querySelector('[name="folder"]')?.addEventListener('change',event=>{this.folder=event.target.value;});
  this.element.querySelector('[name="itemType"]')?.addEventListener('change',async event=>{
   const data=foundry.utils.expandObject(new foundry.applications.ux.FormDataExtended(this.element).object);
   this.drafts[this.type]={name:data.name,system:data.system};this.type=event.target.value;
   await this.render({force:true});
  });
  this.element.querySelector('[name="name"]')?.focus();
 }
 static async createItem(event,form,formData){
  if(this.tab!=='single')return;
  if(this.busy)return;
  if(!game.user.isGM&&!game.user.can('ITEM_CREATE'))return ui.notifications.warn('You do not have permission to create Items.');
  if(!form.reportValidity())return;
  const data=foundry.utils.expandObject(formData.object),name=String(data.name??'').trim();
  if(!name)return ui.notifications.warn('Give your item a name.');
  this.busy=true;form.inert=true;const submit=form.querySelector('[type="submit"]');submit.disabled=true;
  try{
   const [item]=validateImport([{name,type:this.type,system:data.system}],{rules21:!!this.rules21});
   const [created]=await foundry.utils.getDocumentClass('Item').createDocuments([{...item,folder:checkedFolder(this.folder)}]);
   if(!created)throw new Error('The item was not created. Your entries have been kept.');
   this.lastItem=created;this.count++;delete this.drafts[this.type];clearLibraryCache();
   await this.render({force:true});ui.notifications.info(`Created ${created.name}. Ready for the next item.`);
  }catch(error){ui.notifications.error(error.message);}
  finally{this.busy=false;form.inert=false;submit.disabled=false;}
 }
 static async queueItem(){
  if(!this.element.reportValidity())return;
  try {if(this.batch.length>=200)throw new Error('Import at most 200 items per batch.');const data=foundry.utils.expandObject(new foundry.applications.ux.FormDataExtended(this.element).object);
   if(!data.name?.trim())throw new Error('Give your item a name.');
   this.batch.push(...validateImport([{name:data.name.trim(),type:this.type,system:data.system}],{rules21:!!this.rules21}));
   delete this.drafts[this.type];await this.render({force:true});
  }catch(error){ui.notifications.error(error.message);}
 }
 rememberDraft(){
  if(this.tab==='manual'){rememberManual(this);return;}
  if(this.tab!=='single'){rememberImport(this);return;}
  if(!this.element?.querySelector)return;
  const data=foundry.utils.expandObject(new foundry.applications.ux.FormDataExtended(this.element).object);
  this.drafts[this.type]={name:data.name??'',system:data.system};
 }
 static async removeQueued(event,target){this.rememberDraft();this.batch.splice(Number(target.dataset.index),1);await this.render({force:true});}
 static async createBatch(){
  if(this.busy||!this.batch.length)return;
  if(!game.user.isGM&&!game.user.can('ITEM_CREATE'))return;
  this.rememberDraft();this.busy=true;this.element.inert=true;
  try {const folder=checkedFolder(this.folder);const created=await foundry.utils.getDocumentClass('Item').createDocuments(validateImport(this.batch,{rules21:!!this.rules21}).map(item=>({...item,folder})));
   for(const item of created){const index=this.batch.findIndex(queued=>queued.name===item.name&&queued.type===item.type);if(index>=0)this.batch.splice(index,1);}
   this.count+=created.length;this.lastItem=created.at(-1)??this.lastItem;clearLibraryCache();await this.render({force:true});
   if(this.batch.length)ui.notifications.warn('Some items were not created and remain queued.');
  }catch(error){ui.notifications.error(error.message);}finally{this.busy=false;this.element.inert=false;}
 }
 static async bulk(){await openImporter(this.folder);}
 static async editLast(){this.lastItem?.sheet.render({force:true});}
}
let creator;
export function openItemCreator(tab='single',folder){
 if(!game.user.isGM&&!game.user.can(['world','manual'].includes(tab)?'ACTOR_CREATE':'ITEM_CREATE'))return ui.notifications.warn('You do not have permission to create these documents.');
 creator??=new SwordsItemCreator();if(creator.busy)return;creator.rememberDraft();creator.tab=tab;if(folder!==undefined)creator.folder=folder;return creator.render({force:true});
}
