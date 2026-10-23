export function manualItemSource(item){
 const source=structuredClone(item);
 for(const key of ['_id','id','folder','ownership','sort','_stats'])delete source[key];
 for(const effect of source.effects??[]){delete effect._id;delete effect.origin;}
 if(source.system){for(const key of ['equipped','active'])if(key in source.system)source.system[key]=false;for(const key of ['paidCarry','paidMeridians','paidArdor'])if(key in source.system)source.system[key]=0;}
 return source;
}
export async function browseManualItems(){const {openLibrary}=await import('./browser.mjs?v=0.1.51');openLibrary();}
export async function dropManualItem(event){
 event.preventDefault();if(this.busy)return;rememberManual(this);this.busy=true;
 try{
  const data=JSON.parse(event.dataTransfer.getData('text/plain'));if(data.type!=='Item'||!data.uuid)throw Error('Drag an Item from the compendium browser or Items directory.');
  const item=await foundry.utils.fromUuid(data.uuid);
  if(!item||item.documentName!=='Item'||!item.testUserPermission(game.user,'OBSERVER'))throw Error('This item is not available.');
  this.manualItems??=[];this.manualItems.push(manualItemSource(item.toObject()));await this.render({force:true});
 }catch(error){ui.notifications.warn(error.message);}finally{this.busy=false;}
}
export async function removeManualItem(event,target){if(this.busy)return;rememberManual(this);this.manualItems.splice(Number(target.dataset.index),1);await this.render({force:true});}
export const MANUAL_STATS=[
 ['health','Health',6,1],['armor','Armor',0,0],['ardor','Ardor',4,0],
 ['movement','Movement (m)',6,0],['sidhi','Siddhi',0,0,6],['mag','Magnetite (Mag)',0,0],
 ['vio','Violence (VIO)',1,0],['dia','Dialectics (DIA)',1,0],['grc','Grace (GRC)',1,0],
 ['sav','Savvy (SAV)',1,0],['wrd','Word (WRD)',1,0],['spi','Spirit (SPI)',1,0]
];
export function manualWorldBeing(draft){
 const name=String(draft.name??'').trim();if(!name)throw Error('Give your World Being a name.');
 const values={};
 for(const [key,label,initial,min,max] of MANUAL_STATS){
  const raw=draft[key]??initial,value=Number(raw);
  if(raw===''||!Number.isInteger(value)||value<min||(max!==undefined&&value>max))throw Error(`${label} must be a whole number from ${min}${max===undefined?' or greater':` to ${max}`}.`);
  values[key]=value;
 }
 const {health,armor,ardor,movement,sidhi,mag,...cultivations}=values;
 return {name,type:'npc',system:{health:{max:health,value:health},armor:{max:armor,value:armor},ardor:{max:ardor,burnt:0,installed:0},movement,sidhi,mag,cultivations}};
}
export function rememberManual(app){
 if(!app.element?.querySelectorAll)return;
 for(const field of app.element.querySelectorAll('[name^="manual."]'))app.manualDraft[field.name.slice(7)]=field.value;
}
export async function createManualWorldBeing(){
 if(this.busy)return;
 if(!game.user.isGM&&!game.user.can('ACTOR_CREATE'))return ui.notifications.warn('You do not have permission to create Actors.');
 rememberManual(this);this.busy=true;
 try{
  const source=manualWorldBeing(this.manualDraft);
  source.system=new CONFIG.Actor.dataModels.npc(source.system,{strict:true}).toObject();
  source.items=(this.manualItems??[]).map(manualItemSource);
  const folder=this.manualDraft.folder;
  if(folder){if(game.folders.get(folder)?.type!=='Actor')throw Error('Choose an available Actor folder.');source.folder=folder;}
  const [actor]=await foundry.utils.getDocumentClass('Actor').createDocuments([source]);
  if(!actor)throw Error('The World Being was not created. Your entries have been kept.');
  this.manualStatus=`Created ${actor.name}. Ready for another World Being.`;
  this.manualDraft={folder:folder??''};this.manualItems=[];await this.render({force:true});
  actor.sheet.render({force:true});ui.notifications.info(this.manualStatus);
 }catch(error){ui.notifications.error(error.message);}
 finally{this.busy=false;}
}
