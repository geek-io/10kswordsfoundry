export function itemFolders(){
 // displayed is transient sidebar state, not a destination eligibility check.
 const folders=(game.folders?.contents??[]).filter(f=>f.type==='Item'),ids=new Set(folders.map(f=>f.id));
 const parent=f=>typeof f.folder==='string'?f.folder:f.folder?.id;
 const result={'':'Items root'},seen=new Set();
 const walk=(id,depth)=>{for(const f of folders.filter(f=>(ids.has(parent(f))?parent(f):null)===id).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'})||a.id.localeCompare(b.id))){if(seen.has(f.id))continue;seen.add(f.id);result[f.id]=`${'— '.repeat(depth)}${f.name}`;walk(f.id,depth+1);}};
 walk(null,0);for(const f of folders.filter(f=>!seen.has(f.id)).sort((a,b)=>a.name.localeCompare(b.name)))result[f.id]=f.name;
 return result;
}
export function checkedFolder(id){if(!id)return null;const folder=game.folders?.get(id);if(!folder||folder.type!=='Item')throw new Error('Choose an available Item folder.');return id;}
