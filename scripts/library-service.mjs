export function searchableItem(item){const s=item.system??{};return {tags:s.tags??'',sect:s.sect??'',sidhi:s.sidhi??s.prerequisites?.sidhi??'',rank:s.rank??'',rarity:s.rarity??'',description:String(s.description??'').replace(/<[^>]*>/g,' ')};}
const cache=new Map();
export function clearLibraryCache(){cache.clear();}
export async function libraryEntries() {
 const rows=(game.items?.contents??[]).filter(item=>item.testUserPermission(game.user,"OBSERVER")).map(item=>({...searchableItem(item),uuid:item.uuid,name:item.name,type:item.type,img:item.img||"icons/svg/item-bag.svg",source:"World items",sourceId:"world"}));
 const failures=[];
 for(const pack of game.packs) {
  if(pack.documentName!=="Item"||!pack.visible) continue;
  try {
   let index=cache.get(pack.collection);
   if(!index) {index=await pack.getIndex({fields:["type","system.tags","system.sect","system.sidhi","system.prerequisites.sidhi","system.rank","system.rarity","system.description"]});cache.set(pack.collection,index);}
   for(const entry of index) rows.push({...searchableItem(entry),uuid:`Compendium.${pack.collection}.Item.${entry._id}`,name:entry.name,type:entry.type==='armor'?'fashion':entry.type,img:entry.img||"icons/svg/item-bag.svg",source:pack.metadata.label,sourceId:pack.collection});
  } catch {failures.push(pack.metadata.label);}
 }
 return {rows:rows.sort((a,b)=>a.name.localeCompare(b.name)),failures};
}
export function filterLibrary(rows,{query="",type="",source=""}={}) {
 const terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return rows.filter(row=>(!type||row.type===type)&&(!source||row.sourceId===source)&&terms.every(term=>(()=>{const match=term.match(/^(tag|tags|sect|sidhi|siddhi|rank|rarity):(.+)$/);if(match){const key={tag:'tags',siddhi:'sidhi'}[match[1]]??match[1];return key==='sidhi'?String(row[key])===match[2]:String(row[key]??'').toLocaleLowerCase().includes(match[2]);}return `${row.name} ${row.source} ${row.type} ${row.tags??''} ${row.sect??''} ${row.sidhi??''} ${row.rank??''} ${row.rarity??''} ${row.description??''}`.toLocaleLowerCase().includes(term);})()));
}
