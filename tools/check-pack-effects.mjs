import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const app='C:/Program Files/Foundry Virtual Tabletop/resources/app';
const require=createRequire(join(app,'package.json'));
const {ClassicLevel}=require('classic-level');
// Exercise the installed server's actual embedded collection reader against disk,
// not just a JSON readback of the item record.
const code=await readFile(join(app,'dist/database/fields-extensions.mjs'),'utf8');
const begin=code.indexOf('fields.EmbeddedCollectionField.prototype.expandEmbedded=')+'fields.EmbeddedCollectionField.prototype.expandEmbedded='.length;
const end=code.indexOf(',fields.EmbeddedCollectionField.prototype._dbWrite',begin);
const warnings=[];
const expand=vm.runInNewContext(`(${code.slice(begin,end)})`,{global:{logger:{warn:m=>warnings.push(m)}},LevelDatabase:{formatKey:(...parts)=>parts.join('.')}});
const packRoot=process.argv[2]??'packs';
let count=0;
for(const name of ['non-sect-items','grimoire-traits','sect-licenses','sect-technicks','sect-magicks']){
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
assert.ok(count>=44);
console.log(`Foundry server embedded reader loaded ${count} complete effects from ${packRoot}, including Adamance's actual change record.`);

