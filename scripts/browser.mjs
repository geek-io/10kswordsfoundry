import {libraryEntries,filterLibrary,clearLibraryCache} from "./library-service.mjs?v=0.1.45";
export class SwordsBrowser extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
 static DEFAULT_OPTIONS={id:"swords-library",classes:["swords","swords-library"],window:{title:"Compendium Browser · 10,000 Swords",resizable:true},position:{width:800,height:700},actions:{inspect:SwordsBrowser.inspect,refresh:SwordsBrowser.refresh,more:SwordsBrowser.more}};
 static PARTS={main:{template:"systems/10kswordsfoundry/templates/browser.hbs"}};
 filters={query:"",type:"",source:""}; limit=60;
 async _prepareContext() {
  const {rows,failures}=await libraryEntries();this.rows=rows;
  const filtered=filterLibrary(rows,this.filters);
  const types=Object.fromEntries([...new Set(rows.map(row=>row.type))].filter(Boolean).sort().map(type=>[type,game.i18n.localize(`TYPES.Item.${type}`)]));
  return {filters:this.filters,rows:filtered.slice(0,this.limit).map(row=>({...row,typeLabel:types[row.type]??row.type})),types,sources:Object.fromEntries(rows.map(row=>[row.sourceId,row.source])),count:filtered.length,shown:Math.min(this.limit,filtered.length),more:filtered.length>this.limit,failures:failures.join(", ")};
 }
 async _onRender(context,options) {
  await super._onRender(context,options);
  this._listeners?.abort();this._listeners=new AbortController();const signal=this._listeners.signal;
  for(const input of this.element.querySelectorAll('[data-filter]')) input.addEventListener(input.tagName==='INPUT'?'input':'change',()=>{
   this._focusFilter=input.dataset.filter;this._cursor=input.selectionStart;
   this.filters[input.dataset.filter]=input.value;this.limit=60;
   clearTimeout(this._searchTimer);this._searchTimer=setTimeout(()=>this.render({force:true}),input.tagName==='INPUT'?200:0);
  },{signal});
  if(this._focusFilter) {const input=this.element.querySelector(`[data-filter="${this._focusFilter}"]`);input?.focus();if(input?.type==='search'&&this._cursor!==null) input.setSelectionRange(this._cursor,this._cursor);this._focusFilter=null;}
  this.element.addEventListener('dragstart' ,event=>{
   const row=event.target.closest('[data-uuid]');if(!row) return;
   const entry=this.rows.find(entry=>entry.uuid===row.dataset.uuid);if(entry) event.dataTransfer.setData('text/plain',JSON.stringify({type:'Item',uuid:entry.uuid}));
  },{signal});
 }
 async close(options){clearTimeout(this._searchTimer);this._listeners?.abort();return super.close(options);}
 static async inspect(event,target) {
  try {const doc=await foundry.utils.fromUuid(target.dataset.uuid);if(doc?.testUserPermission(game.user,"OBSERVER")) doc.sheet.render({force:true});else ui.notifications.warn("This item is no longer available.");}catch(error){ui.notifications.warn(error.message);}
 }
 static async refresh(){clearLibraryCache();this.limit=60;await this.render({force:true});}
 static async more(){this.limit+=60;await this.render({force:true});}
}
let browser;
export function openLibrary(){browser??=new SwordsBrowser();return browser.render({force:true});}
