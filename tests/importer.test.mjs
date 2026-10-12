import test from 'node:test';
import assert from 'node:assert/strict';
import {parseImport,readCSV,IMPORT_TYPES} from '../scripts/import-data.mjs';
import {convertLegacyArmor} from '../scripts/legacy-items.mjs';
import {clashDice} from '../scripts/resolution.mjs';
test('CSV supports quoted commas, multiline descriptions, nested numeric fields and boolean properties',()=>{
 const data=parseImport('name,type,system.range,system.properties.reach,system.description\n"Iron, Blade",weapon,2,true,"First line\nSecond line"','csv')[0].item;
 assert.equal(data.name,'Iron, Blade');assert.equal(data.system.range,2);assert.equal(data.system.properties.reach,true);assert.equal(data.system.description,'First line Second line');
 assert.throws(()=>readCSV('name,type\na'),/columns/);
 assert.throws(()=>readCSV('name,__proto__.bad\na,true'),/Unsafe/);
});
test('all supported types parse, aliases normalize and malicious metadata is excluded',()=>{
 for(const type of Object.keys(IMPORT_TYPES))assert.equal(parseImport(JSON.stringify({name:'Test',type,system:{},ownership:{default:3},flags:{evil:true}}),'json')[0].item.type,type);
 assert.equal(parseImport('{"name":"Coat","type":"Armor"}','json')[0].item.type,'fashion');
 assert.equal(parseImport('{"name":"X","type":"Technick","ownership":{"default":3}}','json')[0].item.ownership,undefined);
 assert.throws(()=>parseImport('{"name":"X","type":"unknown"}','json'),/supported/);
});
test('rulebook text extracts Job ratings and retains full original content with review warnings',()=>{
 const text='Name: Scholar\nType: Job\nJob of the Mind\nVIO 1 DIA 3 GRC 2 SAV 2 WRD 2 SPI 2';
 const parsed=parseImport(text,'text','job')[0];
 assert.equal(parsed.item.system.category,'mind');assert.equal(parsed.item.system.cultivations.dia,3);assert.equal(parsed.item.system.description,text.replaceAll("\n"," "));assert.ok(parsed.warnings.length);
 assert.equal(parseImport('Name: A\n---\nName: B','text','magick').length,2);
});
test('legacy Armor becomes Fashion with a recovery copy and no invented bonuses',()=>{
 const original={_id:'kept',type:'armor',system:{bonus:3,equipped:true,description:'Coat'}};
 const data=convertLegacyArmor(structuredClone(original));assert.equal(data.type,'fashion');assert.equal(data._id,'kept');assert.equal(data.system.armor,0);assert.equal(data.flags['10kswordsfoundry'].legacyArmor.system.bonus,3);
 assert.deepEqual(convertLegacyArmor(data),data);
});
test('Clash cancels matching faces one-for-one, not unmatched Critical Strikes',()=>{
 assert.deepEqual(clashDice([4,4,5,6],[4,5,5,1]),{incoming:[4,6],interrupt:[5,1]});
 assert.deepEqual(clashDice([6,6],[6]),{incoming:[6],interrupt:[]});
});
