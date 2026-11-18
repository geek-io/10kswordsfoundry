import {parseImport} from './import-data.mjs?v=0.2.45';
import {validateImport} from './importer.mjs?v=0.2.45';
import {checkedFolder} from './import-folders.mjs?v=0.2.45';
import {parseWorldBeings} from './worldbeing-import.mjs?v=0.2.45';
import {previewWorldBeings} from './worldbeing-sources.mjs?v=0.2.45';
import {clearLibraryCache} from './library-service.mjs?v=0.2.45';
import {reconcileCosts} from './equipment.mjs?v=0.2.45';
import {usesRules21} from './rules-version.mjs?v=0.2.45';
export function rememberImport(app){
 const fields=app.element?.elements;if(!fields)return;
 const state=app.importDrafts[app.tab]??={format:'text',type:usesRules21()?'technique':'trait',content:'',review:'',notes:[],names:[],versions:'all'};
 for(const key of ['format','type','content','review','versions'])if(fields.namedItem(`import.${key}`))state[key]=fields.namedItem(`import.${key}`).value;
}
export async function changeImportTab(event,target){
 if(this.busy)return;this.rememberDraft();this.tab=target.dataset.tab;await this.render({force:true});
}
export async function previewImport(){
 if(this.busy)return;rememberImport(this);const state=this.importDrafts[this.tab];this.busy=true;
 try{
  const files=Array.from(this.element.querySelector('[name="import.files"]')?.files??[]);
  if(files.reduce((n,f)=>n+f.size,0)+state.content.length>2000000)throw new Error('Import at most 2 MB per batch.');
  const texts=[state.content,...await Promise.all(files.map(f=>f.text()))].filter(t=>t.trim());
  if(!texts.length)throw new Error('Paste content or choose files first.');
  const rules21=usesRules21();
  const records=this.tab==='world'?await previewWorldBeings(texts,{rules21,versions:state.versions??'all'}):texts.flatMap(text=>parseImport(text,state.format,state.type,{rules21}));
  if(records.length>(this.tab==='world'?50:200))throw new Error('Too many entries in one batch.');
  state.review=JSON.stringify(records.map(r=>r.item??r.actor),null,2);state.names=records.map(r=>(r.item??r.actor).name);state.notes=records.flatMap(r=>r.warnings.map(w=>`${(r.item??r.actor).name}: ${w}`));
  state.status=`${records.length} entries detected. Review their names and values before importing.`;
 }catch(error){state.status=error.message;state.review='';state.names=[];ui.notifications.error(error.message);}
 finally{this.busy=false;await this.render({force:true});}
}
export async function commitImport(){
 if(this.busy)return;rememberImport(this);const state=this.importDrafts[this.tab];this.busy=true;
 try{
  const world=this.tab==='world',kind=world?'Actor':'Item',rules21=usesRules21();
  if(!game.user.isGM&&!game.user.can(`${kind.toUpperCase()}_CREATE`))throw new Error(`You do not have permission to create ${kind}s.`);
  let data=JSON.parse(state.review);if(!Array.isArray(data)||!data.length||data.length>(world?50:200))throw new Error('Preview a valid batch first.');
  if(world){data=data.map(actor=>{
   if(actor.type!=='npc'||!actor.name?.trim())throw new Error('World Being imports require a name and npc type.');
   const system=new CONFIG.Actor.dataModels.npc(actor.system,{strict:true}).toObject();
   system.notes=foundry.utils.cleanHTML(system.notes);
   const items=validateImport(actor.items??[],{rules21}).map((item,index)=>({...item,effects:(actor.items[index].effects??[]).map(effect=>{const copy=structuredClone(effect);delete copy._id;return copy;})}));
   // Rules 2.1 stat blocks ready their weapons: the printed Soak and HP live on the Parts, so nothing is counted twice.
   if(rules21)items.forEach((item,index)=>{if(item.type==='weapon'&&actor.items[index].system?.equipped===true)item.system.equipped=true;});
   const source={name:actor.name,type:'npc',system,items};if(!rules21)reconcileCosts(source,[],{allowOverage:true});return source;
  });}else data=validateImport(parseImport(state.review,'json',state.type,{rules21}).map(record=>record.item),{rules21}).map(item=>({...item,folder:checkedFolder(this.folder)}));
  const created=await foundry.utils.getDocumentClass(kind).createDocuments(data);
  for(const document of created){const index=data.findIndex(row=>row.name===document.name&&row.type===document.type);if(index>=0)data.splice(index,1);}
  state.review=data.length?JSON.stringify(data,null,2):'';state.names=data.map(d=>d.name);state.status=`Created ${created.length} ${world?'World Beings':'items'}.${data.length?' Remaining entries are still in the preview.':' Ready for the next batch.'}`;
  clearLibraryCache();ui.notifications.info(state.status);
 }catch(error){state.status=error.message;ui.notifications.error(error.message);}
 finally{this.busy=false;await this.render({force:true});}
}
