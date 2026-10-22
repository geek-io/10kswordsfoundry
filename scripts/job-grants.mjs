import {IMPORT_TYPES} from './import-data.mjs?v=0.1.47';
export function grantSnapshot(document){
 if(document.documentName!=='Item'||document.type==='job'||!IMPORT_TYPES[document.type])throw new Error('Drop an Item or Trait here. Jobs cannot grant other Jobs.');
 const data=document.toObject();
 return {id:foundry.utils.randomID(),sourceUuid:document.uuid,name:data.name,type:data.type,img:data.img,system:structuredClone(data.system),effects:structuredClone(data.effects??[])};
}
export function grantedItems(grants,actorType,existing,origin=''){
 const already=new Set(existing.filter(item=>!origin||item.flags?.['10kswordsfoundry']?.jobGrantOrigin===origin).map(item=>item.flags?.['10kswordsfoundry']?.jobGrantId).filter(Boolean));
 return grants.flatMap(grant=>{
  if(!grant.id||!IMPORT_TYPES[grant.type]||grant.type==='job'||!grant.name)throw new Error('Invalid Job grant. Remove and re-add the item.');
  if(grant.type==='gambit'&&actorType!=='npc')throw new Error('This Job grants a Gambit, which can only be added to World Beings.');
  if(already.has(grant.id))return [];already.add(grant.id);
  const system=structuredClone(grant.system??{});
  if('equipped' in system)system.equipped=false;
  if('paidCarry' in system)system.paidCarry=0;if('paidMeridians' in system)system.paidMeridians=0;
  if('paidArdor' in system)system.paidArdor=0;
  if('ammoId' in system)system.ammoId='';
  return [{_id:foundry.utils.randomID(),name:grant.name,type:grant.type,img:grant.img,system,effects:structuredClone(grant.effects??[]).map(effect=>{delete effect._id;return effect;}),flags:{'10kswordsfoundry':{jobGrantId:grant.id,jobGrantOrigin:origin}}}];
 });
}
