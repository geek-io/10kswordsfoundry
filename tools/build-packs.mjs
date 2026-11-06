// Compile data/<pack>.json catalogs into Foundry LevelDB compendium packs.
// Usage: node tools/build-packs.mjs [pack-name ...]
//   FOUNDRY_APP  Foundry install that provides classic-level (default: Windows install path)
//   PACK_ROOT    output folder for the compiled packs (default: packs)
// With no pack names, every pack in system.json is rebuilt.
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const app=process.env.FOUNDRY_APP??'C:/Program Files/Foundry Virtual Tabletop/resources/app';
const packRoot=process.env.PACK_ROOT??'packs';
const require=createRequire(join(app,'package.json'));
const {ClassicLevel}=require('classic-level');
const manifest=JSON.parse(await readFile('system.json','utf8'));
const all=manifest.packs.map(pack=>pack.name);
const wanted=process.argv.slice(2);
for(const name of wanted) assert.ok(all.includes(name),`Unknown pack: ${name}`);
const names=wanted.length?wanted:all;
for(const pack of names) {
const source=JSON.parse(await readFile(`data/${pack}.json`,'utf8'));
await mkdir(packRoot,{recursive:true});
const database=new ClassicLevel(resolve(packRoot,pack),{keyEncoding:'utf8',valueEncoding:'json'});
await database.open();await database.clear();
const effects=database.sublevel('items.effects',{valueEncoding:'json'});
const items=database.sublevel('items',{valueEncoding:'json'}),folders=database.sublevel('folders',{valueEncoding:'json'});
for(const folder of source.folders)await folders.put(folder._id,folder);
for(const item of source.items){
for(const effect of item.effects??[])await effects.put(`${item._id}.${effect._id}`,effect);
await items.put(item._id,{...item,effects:(item.effects??[]).map(effect=>effect._id),ownership:{default:0},_stats:{coreVersion:'14.364',systemId:'10kswordsfoundry',systemVersion:manifest.version,createdTime:0,modifiedTime:0,lastModifiedBy:null}});
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
await database.close();console.log(`${pack}: built and read back ${source.items.length} items in ${source.folders.length} compendium folders.`);
}

// Fail the build if Foundry cannot reconstruct the embedded records.
process.env.PACK_ROOT=packRoot;process.env.PACK_NAMES=names.join(',');
await import("./check-pack-effects.mjs");
