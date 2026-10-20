import {parseWorldBeings} from './worldbeing-import.mjs?v=0.1.45';
// Index first; only fetch full compendium documents actually used by this preview.
export async function previewWorldBeings(texts){
 const candidates=[],failures=[];
 for(const item of game.items?.contents??[]){
  if(!game.user.isGM&&!item.testUserPermission(game.user,'OBSERVER'))continue;
  candidates.push({...item.toObject(),_importUuid:item.uuid,importPriority:0,importSource:'World items'});
 }
 const packs=Array.from(game.packs??[]).filter(p=>p.documentName==='Item'&&p.visible).sort((a,b)=>a.collection.localeCompare(b.collection));
 for(const pack of packs){try{
  const index=await pack.getIndex({fields:['type']});
  for(const item of index)candidates.push({name:item.name,type:item.type==='armor'?'fashion':item.type,system:{},_importUuid:`Compendium.${pack.collection}.Item.${item._id}`,importPriority:1,importSource:pack.metadata.label});
 }catch{failures.push(`Could not read ${pack.metadata.label}; its items were not searched.`);}}
 const first=texts.flatMap(text=>parseWorldBeings(text,candidates));
 const used=new Set(first.flatMap(r=>r.actor.items.map(i=>i._importUuid)).filter(Boolean));
 const ready=[];
 for(const candidate of candidates){
  if(!used.has(candidate._importUuid))continue;
  if(candidate.importPriority===0){ready.push(candidate);continue;}
  try{const doc=await foundry.utils.fromUuid(candidate._importUuid);if(!doc)throw new Error('Missing document');ready.push({...doc.toObject(),_importUuid:candidate._importUuid,importPriority:1,importSource:candidate.importSource});}
  catch{failures.push(`Could not load ${candidate.name} from ${candidate.importSource}; review its placeholder.`);}
 }
 const records=texts.flatMap(text=>parseWorldBeings(text,ready));
 for(const record of records){record.warnings.unshift(...failures);for(const item of record.actor.items){delete item._importUuid;delete item.importPriority;delete item.importSource;}}
 return records;
}
