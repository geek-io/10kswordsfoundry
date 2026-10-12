import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {missingTraitEffects,repairTraitEffects} from '../scripts/trait-effect-repair.mjs';
const catalog=JSON.parse(readFileSync('data/grimoire-traits.json','utf8'));
const stock=catalog.items.find(i=>i.name==='Adamance');
function item(uuid,effects=[]){return {uuid,type:'trait',name:stock.name,system:{...stock.system,level:3},effects:{contents:effects},async createEmbeddedDocuments(type,rows){assert.equal(type,'ActiveEffect');this.effects.contents.push(...rows);return rows;}};}
test('repair requires exact stock name/source and never alters a manually authored effect',()=>{
 const empty=item('empty');assert.equal(missingTraitEffects(empty,catalog).length,1);
 const manual=item('manual',[{name:'My working effect'}]);assert.deepEqual(missingTraitEffects(manual,catalog),[]);
 empty.system.source='Homebrew';assert.deepEqual(missingTraitEffects(empty,catalog),[]);
});
test('one-time GM repair covers world, actor and unlinked token copies and preserves Level and existing effects',async()=>{
 const world=item('world'),owned=item('actor.item'),token=item('token.item'),manual=item('manual',[{name:'Working'}]);let version=0;
 globalThis.game={user:{id:'gm',isGM:true},users:{activeGM:{id:'gm'}},settings:{get:()=>version,set:async(a,b,v)=>version=v},items:{contents:[world,manual]},actors:{contents:[{items:{contents:[owned]}}]},scenes:[{tokens:[{actorLink:false,actor:{items:{contents:[token]}}}]}]};
 globalThis.fetch=async()=>({ok:true,json:async()=>catalog});globalThis.ui={notifications:{info:()=>{},error:m=>assert.fail(m)}};
 await repairTraitEffects();
 for(const i of [world,owned,token]){assert.equal(i.effects.contents.length,1);assert.equal(i.effects.contents[0].system.changes[0].key,'system.health.max');assert.equal(i.system.level,3);}
 assert.deepEqual(manual.effects.contents,[{name:'Working'}]);assert.equal(version,37);
 owned.effects.contents=[];await repairTraitEffects();assert.equal(owned.effects.contents.length,0,'does not recreate effects deliberately removed after migration');
});
