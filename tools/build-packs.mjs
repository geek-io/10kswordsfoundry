import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire('C:/Program Files/Foundry Virtual Tabletop/resources/app/package.json');
const {ClassicLevel}=require('classic-level');
for(const pack of ['non-sect-items','grimoire-traits','sect-licenses','sect-technicks','sect-magicks']) {
const source=JSON.parse(await readFile(`data/${pack}.json`,'utf8'));
await mkdir('packs',{recursive:true});
const database=new ClassicLevel(resolve(`packs/${pack}`),{keyEncoding:'utf8',valueEncoding:'json'});
await database.open();await database.clear();
const effects=database.sublevel('items.effects',{valueEncoding:'json'});
const items=database.sublevel('items',{valueEncoding:'json'}),folders=database.sublevel('folders',{valueEncoding:'json'});
for(const folder of source.folders)await folders.put(folder._id,folder);
for(const item of source.items){
for(const effect of item.effects??[])await effects.put(`${item._id}.${effect._id}`,effect);
await items.put(item._id,{...item,effects:(item.effects??[]).map(effect=>effect._id),ownership:{default:0},_stats:{coreVersion:'14.364',systemId:'10kswordsfoundry',systemVersion:JSON.parse(await readFile('system.json','utf8')).version,createdTime:0,modifiedTime:0,lastModifiedBy:null}});
}
assert.equal((await items.keys().all()).length,source.items.length);
assert.equal((await folders.keys().all()).length,source.folders.length);
for(const item of source.items){assert.match(item._id,/^[a-z0-9]{16}$/);assert.ok(source.folders.some(f=>f._id===item.folder));assert.ok(item.name&&item.system.source&&item.system.description);}
for(const item of source.items){
 const stored=await items.get(item._id);
 assert.deepEqual(stored.effects,(item.effects??[]).map(effect=>effect._id));
 assert.deepEqual(await effects.getMany(stored.effects.map(id=>`${item._id}.${id}`)),item.effects??[]);
}
assert.equal((await effects.keys().all()).length,source.items.reduce((n,item)=>n+(item.effects?.length??0),0));
await database.close();console.log(`Built and read back ${source.items.length} items in ${source.folders.length} compendium folders.`);

}

// Fail the build if Foundry cannot reconstruct the embedded records.
await import("./check-pack-effects.mjs");
