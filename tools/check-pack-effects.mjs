import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const app=process.env.FOUNDRY_APP??'C:/Program Files/Foundry Virtual Tabletop/resources/app';
const require=createRequire(join(app,'package.json'));
const {ClassicLevel}=require('classic-level');
// Exercise the installed server's actual embedded collection reader against disk,
// not just a JSON readback of the item record.
const code=await readFile(join(app,'dist/database/fields-extensions.mjs'),'utf8');
const begin=code.indexOf('fields.EmbeddedCollectionField.prototype.expandEmbedded=')+'fields.EmbeddedCollectionField.prototype.expandEmbedded='.length;
const end=code.indexOf(',fields.EmbeddedCollectionField.prototype._dbWrite',begin);
const warnings=[];
const expand=vm.runInNewContext(`(${code.slice(begin,end)})`,{global:{logger:{warn:m=>warnings.push(m)}},LevelDatabase:{formatKey:(...parts)=>parts.join('.')}});
const packRoot=process.env.PACK_ROOT??process.argv[2]??'packs';
const only=(process.env.PACK_NAMES??'').split(',').filter(Boolean);
let count=0;
const manifestPacks=JSON.parse(await readFile('system.json','utf8')).packs;
// Actor packs: rebuild each actor through the server's own embedded-collection reader, two levels deep (Items, then their Effects).
const effectModel={documentName:'ActiveEffect',expandEmbedded:async record=>record};
const itemModel={documentName:'Item',expandEmbedded:async(record,{idPrefix,sublevelName,ldb})=>{record.effects=await expand.call({name:'effects',model:effectModel},record,`${idPrefix}.${record._id}`,sublevelName,ldb);return record;}};
for(const name of manifestPacks.filter(pack=>pack.type==='Actor').map(pack=>pack.name).filter(name=>!only.length||only.includes(name))){
 const source=JSON.parse(await readFile(`data/${name}.json`,'utf8'));
 const database=new ClassicLevel(resolve(packRoot,name),{keyEncoding:'utf8',valueEncoding:'json'});
 await database.open();
 try{
  const sublevels=Object.fromEntries(['actors.items','actors.items.effects','actors.effects'].map(n=>[n,database.sublevel(n,{valueEncoding:'json'})]));
  const actors=database.sublevel('actors',{valueEncoding:'json'});
  for(const actor of source.actors){
   const stored=await actors.get(actor._id);
   // The reader runs in its own realm; compare plain copies.
   const loaded=JSON.parse(JSON.stringify(await expand.call({name:'items',model:itemModel},stored,actor._id,'actors',{sublevels})));
   assert.deepEqual(loaded.map(item=>item._id),actor.items.map(item=>item._id),actor.name);
   for(const [i,item] of loaded.entries()){assert.deepEqual(item.effects,actor.items[i].effects??[],`${actor.name}: ${item.name}`);assert.deepEqual(item.system,actor.items[i].system,`${actor.name}: ${item.name}`);count+=item.effects.length;}
  }
 }finally{await database.close();}
}
for(const name of manifestPacks.filter(pack=>pack.type!=='Actor').map(pack=>pack.name).filter(name=>!only.length||only.includes(name))){
 const source=JSON.parse(await readFile(`data/${name}.json`,'utf8'));
 const database=new ClassicLevel(resolve(packRoot,name),{keyEncoding:'utf8',valueEncoding:'json'});
 await database.open();
 try{
  const items=database.sublevel('items',{valueEncoding:'json'}),effects=database.sublevel('items.effects',{valueEncoding:'json'});
  for(const item of source.items){
   const stored=await items.get(item._id);
   const loaded=await expand.call({name:'effects',model:{documentName:'ActiveEffect',expandEmbedded:async record=>record}},stored,item._id,'items',{sublevels:{'items.effects':effects}});
   assert.deepEqual(JSON.parse(JSON.stringify(loaded)),item.effects??[],item.name);
   count+=loaded.length;
  }
 }finally{await database.close();}
}
assert.equal(warnings.length,0,warnings.join('\n'));
if(!only.length||only.includes('grimoire-traits'))assert.ok(count>=44);
console.log(`Foundry server embedded reader loaded ${count} complete effects from ${packRoot}.`);

