import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import {filterLibrary,searchableItem} from '../scripts/library-service.mjs';
const counts={'sect-licenses':156,'sect-technicks':74,'sect-magicks':52};
const packs=Object.fromEntries(await Promise.all(Object.keys(counts).map(async name=>[name,JSON.parse(await readFile(new URL(`../data/${name}.json`,import.meta.url),'utf8'))])));
const all=Object.entries(packs).flatMap(([pack,catalog])=>catalog.items.map(item=>({...item,pack})));
const uuid=item=>`Compendium.10kswordsfoundry.${item.pack}.Item.${item._id}`;
const byUuid=new Map(all.map(item=>[uuid(item),item]));
const find=name=>all.find(item=>item.name===name&&item.type!=='license');

test('all printed Sect cards have stable IDs and valid Sect → Rank folders',()=>{
 for(const [pack,catalog] of Object.entries(packs)){
  assert.equal(catalog.items.length,counts[pack]);
  const folders=new Map(catalog.folders.map(f=>[f._id,f]));
  assert.equal(folders.size,catalog.folders.length);
  assert.equal(new Set(catalog.items.map(i=>i._id)).size,catalog.items.length);
  for(const item of catalog.items){
   assert.match(item._id,/^[a-f0-9]{16}$/);
   const rank=folders.get(item.folder),sect=folders.get(rank?.folder);
   assert.equal(rank.name.toLowerCase(),item.system.rank);
   assert.equal(sect.name,item.system.sect);
   assert.equal(sect.folder,null);
   assert.match(item.system.source,/Rules 2\.0\.3, p\.1[2-8]\d$/);
   assert.ok(item.system.description.includes('Prerequisites:'));
   assert.equal(item.effects.length,0);
  }
 }
 assert.equal(new Set(packs['sect-licenses'].items.map(i=>i.system.sect)).size,15);
});

test('each Technick and Magick has exactly one matching reciprocal License',()=>{
 const linked=new Set();
 for(const ability of all.filter(i=>i.type!=='license')){
  const metadata=ability.flags['10kswordsfoundry'].sectCatalog;
  const license=byUuid.get(metadata.licenseUuid);
  assert.equal(license.type,'license');assert.equal(license.name,ability.name);
  assert.equal(license.system.rank,ability.system.rank);
  assert.equal(license.system.sect,ability.system.sect);
  assert.equal(license.flags['10kswordsfoundry'].sectCatalog.abilityUuid,uuid(ability));
  assert.ok(ability.system.description.includes(`@UUID[${uuid(license)}]`));
  assert.ok(license.system.description.includes(`@UUID[${uuid(ability)}]`));
  assert.equal(license.system.meridianCost,1);
  assert.ok(!linked.has(license._id));linked.add(license._id);
 }
 assert.equal(linked.size,126);
 const gear=packs['sect-licenses'].items.filter(i=>!linked.has(i._id));
 assert.equal(gear.length,30);
 assert.ok(gear.every(i=>i.system.meridianCost===0));
});

test('wrapped prerequisites and printed rank exceptions survive extraction',()=>{
 const license=name=>packs['sect-licenses'].items.find(i=>i.name===name);
 assert.equal(license('Kalikhadga').system.prerequisites.sidhi,4);
 assert.equal(license('Awaken The Immanent Blade').system.prerequisites.sidhi,4);
 assert.equal(license('Adamantite Body').system.rank,'expert');
 assert.equal(license('Palm Of Anicca').system.rank,'novice');
 assert.match(license('Body Cauldron').system.description,/2 NOVICE FANGSHI LICENSE/);
 assert.match(license('Five Thunder Japamala').system.description,/printed heading repeats/);
});

test('explicit AP, Burn, Install and Magick fields are correctly populated',()=>{
 const six=find('Six Demon Cutting Sword').system;
 assert.deepEqual([six.apCost,six.burnArdor,six.installArdor],[2,1,0]);
 const scathe=find('Scathe').system;
 assert.deepEqual([scathe.apCost,scathe.burnArdor,scathe.bonus],[2,1,2]);
 assert.deepEqual([scathe.attackPool,scathe.defensePool,scathe.damageType],['dia','spi','burn']);
 assert.equal(scathe.mantra,'LAGYAB VARAM');assert.equal(scathe.mudraHands,2);
 const holy=find('Holy Exorcist Fire').system;
 assert.equal(holy.mantra,'NALA PURA');assert.equal(holy.apCost,1);assert.equal(holy.burnArdor,3);
 assert.equal(find('Spirit Seeking Thread').system.installArdor,1);
 assert.equal(find('Great Sage Equal To Heaven').system.mudra,'HEAVEN -> EARTH -> MAN -> THUNDERBOLT -> LOTUS -> THUNDERBOLT -> WISDOM');
 assert.equal(find('Archfiend And Manta').system.mudra,'Heaven → Wisdom');
 assert.equal(find('Asuri\'s Wrath').system.apCost,0);
 assert.equal(find('Kurukulla Blood Drinking').system.burnArdor,0);
 assert.match(find('Kurukulla Blood Drinking').system.description,/Variable Ardor cost/);
 assert.ok(!find('Bless').system.description.includes('PRESTIGE FASHION'));
});

test('new abilities are searchable by sect, rank, and Sidhi',()=>{
 const rows=all.map(i=>({...searchableItem(i),name:i.name,type:i.type,source:i.pack}));
 const result=filterLibrary(rows,{query:'sect:asuri rank:expert',type:'technique'});
 assert.equal(result.length,4);
 assert.equal(filterLibrary(rows,{query:'""',type:'nonexistent'}).length,0);
});
