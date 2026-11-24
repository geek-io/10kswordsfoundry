import {rating21} from './import21.mjs?v=0.2.50';
export function manualItemSource(item){
 const source=structuredClone(item);
 for(const key of ['_id','id','folder','ownership','sort','_stats'])delete source[key];
 for(const effect of source.effects??[]){delete effect._id;delete effect.origin;}
 if(source.system){for(const key of ['equipped','active'])if(key in source.system)source.system[key]=false;for(const key of ['paidCarry','paidMeridians','paidArdor'])if(key in source.system)source.system[key]=0;}
 return source;
}
export async function browseManualItems(){const {openLibrary}=await import('./browser.mjs?v=0.2.50');openLibrary();}
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
// Rules 2.1: Cores, printed Part HP and Soak, Flame and Morale; Cultivations are typed as "Beast Shrine 3, Red Gun 2".
export const MANUAL_STATS_21=[
 ['sidhi','Sidhi Stage',0,0,6],['flame','Flame (0 = 3 + Sidhi)',0,0],['partHp','HP per Part (0 = 7 + Physique + Sidhi)',0,0],
 ['soak','Soak on every Part',0,0],['morale','Morale (0 = 1 + Heart + Stillness)',0,0],['mag','Macca (♄)',0,0],
 ['phy','Physique (PHYS)',1,0],['mot','Motorics (MOT)',1,0],['mnd','Mind (MND)',1,0],
 ['wit','Wits (WIT)',1,0],['voc','Face (FAC)',1,0],['spi','Heart (HRT)',1,0]
];
export function manualCultivations21(text){
 const skills={},esoteric=[],unknown=[];
 for(const entry of String(text??'').split(/[,·;\n]/).map(s=>s.trim()).filter(Boolean)){
  const m=entry.match(/^(.+?)\s*[:=]?\s*(\d+|✦+)$/);if(!m)throw Error(`Write each Cultivation as a name and a rating, such as "Beast Shrine 3". Could not read "${entry}".`);
  const value=/^✦/.test(m[2])?m[2].length:Number(m[2]),known=rating21(m[1]);
  if(value>5)throw Error(`${m[1]}: Cultivations are rated 0 to 5.`);
  if(known?.kind==='skill')skills[known.key]=value;else if(known?.kind==='core')throw Error(`${m[1]} is a Core; enter it in the Cores boxes.`);
  else{esoteric.push({name:known?.name??m[1].trim(),value,core:'spi'});if(!known)unknown.push(m[1].trim());}
 }
 return {skills,esoteric,unknown};
}
export function manualWorldBeing21(draft){
 const name=String(draft.name??'').trim();if(!name)throw Error('Give your World Being a name.');
 const values={};
 for(const [key,label,initial,min,max] of MANUAL_STATS_21){
  const raw=draft[key]??initial,value=Number(raw);
  if(raw===''||!Number.isInteger(value)||value<min||(max!==undefined&&value>max))throw Error(`${label} must be a whole number from ${min}${max===undefined?' or greater':` to ${max}`}.`);
  values[key]=value;
 }
 const {sidhi,flame,partHp,soak,morale,mag,...cores}=values,{skills,esoteric,unknown}=manualCultivations21(draft.cultivations);
 const hpBonus=partHp?partHp-(7+cores.phy+sidhi):0,derivedMorale=1+cores.spi+(skills.stillness??0);
 const parts=Object.fromEntries(['rleg','lleg','rarm','larm','torso','head'].map(key=>[key,{damage:0,hpBonus,soakBase:soak,soakLost:0}]));
 return {name,type:'npc',unknown,system:{sidhi,mag,cores,skills,esoteric,parts,ardor:{max:flame||3+sidhi,burnt:0,installed:0},moraleBonus:morale?morale-derivedMorale:0,morale:{value:morale||derivedMorale}}};
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
  const source=this.rules21?manualWorldBeing21(this.manualDraft):manualWorldBeing(this.manualDraft);
  const unknown=source.unknown??[];delete source.unknown;
  source.system=new CONFIG.Actor.dataModels.npc(source.system,{strict:true}).toObject();
  source.items=(this.manualItems??[]).map(manualItemSource);
  const folder=this.manualDraft.folder;
  if(folder){if(game.folders.get(folder)?.type!=='Actor')throw Error('Choose an available Actor folder.');source.folder=folder;}
  const [actor]=await foundry.utils.getDocumentClass('Actor').createDocuments([source]);
  if(!actor)throw Error('The World Being was not created. Your entries have been kept.');
  this.manualStatus=`Created ${actor.name}. Ready for another World Being.${unknown.length?` Added as Esoteric Cultivations (not basic 2.1 Cultivations by name): ${unknown.join(', ')}.`:''}`;
  this.manualDraft={folder:folder??''};this.manualItems=[];await this.render({force:true});
  actor.sheet.render({force:true});ui.notifications.info(this.manualStatus);
 }catch(error){ui.notifications.error(error.message);}
 finally{this.busy=false;}
}
