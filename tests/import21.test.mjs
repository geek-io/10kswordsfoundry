import test from 'node:test';
import assert from 'node:assert/strict';
import {textItems21,splitText21,rating21,titleName21,SECT_OF_CULTIVATION_21} from '../scripts/import21.mjs';
import {parseImport,importTypes,IMPORT_TYPES} from '../scripts/import-data.mjs';
import {parseWorldBeings21,isWorldBeing21} from '../scripts/worldbeing-import21.mjs';
import {manualWorldBeing21,manualCultivations21} from '../scripts/worldbeing-manual.mjs';
import {pdfText,pdfGutter} from '../scripts/pdf-reader.mjs';

// Fixtures use the 2.1 rulebook's layouts with made-up entries; they are not rulebook text.
const SYSTEM='10kswordsfoundry';
const TECHNICK=`IRON KETTLE STANCE TECHNICK
A made-up flavor line that wraps
onto a second line.
LICENSE DEMON BODY ✦✦
NEEDS ✹; melee weapon
While installed, the test
passes. Deal [2 + DEMON BODY] damage.
PAPER LANTERN
BREATH Technick
LICENSE SKY DRAGON ✦
NEEDS ❂❂
A second entry.`;
const MAGICK=`ASH Magick
Flavor.
license BLACK SORCERY ✦✦✦
needs ✹✹
MANTRA: TEST VARAM | MUDRA: Earth
→ Spear
CHECK: MIND + BLACK SORCERY
CHARGE TIME: 7
EFFECT: Deal [BLACK SORCERY] blast
damage.`;
const CARDS=`CLEAVERS
2 KG UNCOMMON BASE CLEAVER 500♄
HDF TEST AXE
GREAT ✦ FEROCIOUS 2 ✦ RAZOR ✦ WOBBLY
TEST CUT [✹] A named ability.
Flavor text here.
1 0.5KG COMMON ACCESSORY
SSA TEST RING
Wearing Arm: +1 HP.
500 ♄
HEAD
6 KG RARE HEAD PIECE 1,500♄
TEST HELM “KONGO”
soak_ ⛨⛨
+1 Morale while worn.
1.5 KG COMMON ARM PIECE 45♄
TEST GLOVES
soak_ ⛨
Padded.
0.25KG COMMON CONSUMABLE 50♄
TEST PILL
Heal 2 HP from a random Part.`;
const GEAR=`TEST BLADE Gear
Flavor.
license DEVIL BEAST ✦✦✦
The Cultivator is now licensed to wield it.
1.5 KG ASWANG PRESTIGE REFINED DAGGER N/A
ASWANG TEST BLADE
grip_ HILT profile_ DAGGER
material_ BONESTEEL
mods_ FEROCIOUS 2 ✦ CONCEALABLE
Deals +1 to a damaged Part.`;

test('2.1 Sect Technicks: title, License, Needs, Sect and flags',()=>{
 const records=textItems21(TECHNICK,'gear');assert.equal(records.length,2);
 const [a,b]=records.map(r=>r.item);
 assert.equal(a.name,'Iron Kettle Stance');assert.equal(a.type,'technique');assert.equal(a.system.sect,'Asuri');assert.equal(a.system.burnArdor,1);assert.equal(a.system.installArdor,0);assert.equal(a.system.apCost,0);
 assert.deepEqual(a.flags[SYSTEM].sect21,{cultivation:'Demon Body',stars:2,needs:'✹; melee weapon',weaponRequirement:'melee weapon',license:'Demon Body'});
 assert.match(a.system.description,/<em>A made-up flavor line that wraps onto a second line\.<\/em>/);assert.match(a.system.description,/<strong>License:<\/strong> Demon Body ✦✦/);
 assert.equal(b.name,'Paper Lantern Breath');assert.equal(b.system.sect,'Dracontine');assert.equal(b.system.installArdor,2);assert.equal(b.flags[SYSTEM].sect21.stars,1);
});
test('2.1 Magicks read Mantra, Mudra, Check and Charge Time',()=>{
 const [{item,warnings}]=textItems21(MAGICK,'gear');
 assert.equal(item.type,'magick');assert.equal(item.name,'Ash');assert.equal(item.system.sect,'Eskatonian');assert.equal(item.system.burnArdor,2);
 assert.equal(item.system.mantra,'TEST VARAM');assert.equal(item.system.mudra,'Earth → Spear');
 assert.deepEqual(item.system.r21,{potency:7,castTime:'7',core:'mnd',skill:'Black Sorcery',bonus:0});assert.equal(warnings.length,0);
 assert.ok(textItems21('NOTHING Magick\nlicense ASTRAL ✦\nneeds ❂\nJust text.')[0].warnings.some(w=>/CHECK/.test(w)));
});
test('2.1 item cards: weapons, accessories, armor Soak and consumables',()=>{
 const records=textItems21(CARDS,'gear'),items=records.map(r=>r.item);
 assert.deepEqual(items.map(i=>[i.name,i.type]),[['HDF Test Axe','weapon'],['SSA Test Ring','accessory'],['Test Helm “Kongo”','fashion'],['Test Gloves','fashion'],['Test Pill','gear']]);
 const axe=items[0].system;assert.equal(axe.rarity,'uncommon');assert.equal(axe.magCost,500);assert.equal(axe.r21.profile,'cleaver');assert.equal(axe.r21.grip,'haft');assert.equal(axe.r21.weight,2);
 assert.equal(axe.r21.ferocious,2);assert.equal(axe.r21.affinity,'razor');assert.equal(axe.r21.mods.great,true);assert.equal(axe.weaponType,'melee');
 assert.ok(records[0].warnings.some(w=>/WOBBLY/.test(w)),'an unknown Mod is reported, not invented');
 assert.equal(items[1].system.magCost,500);assert.equal(items[1].system.r21.weight,0.5);assert.match(items[1].system.description,/d6: 1/);
 assert.deepEqual(items[2].system.r21.coverage,{rleg:0,lleg:0,rarm:0,larm:0,torso:0,head:2});assert.equal(items[2].system.r21.morale,1);assert.equal(items[2].system.magCost,1500);assert.equal(items[2].system.gearSlot,'fashion');
 assert.deepEqual(items[3].system.r21.coverage,{rleg:0,lleg:0,rarm:1,larm:0,torso:0,head:0});assert.ok(records[3].warnings.some(w=>/one Arm/.test(w)));
 assert.deepEqual(items[4].system.consumable,{enabled:true,apCost:0,health:2,burntArdor:0,morale:0,allHealth:false,allBurntArdor:false});
});
test('2.1 Sect Gear joins its License to the item card; a missing price is reported',()=>{
 const [{item,warnings}]=textItems21(GEAR,'gear');
 assert.equal(item.type,'weapon');assert.equal(item.name,'Aswang Test Blade');assert.equal(item.system.r21.profile,'dagger');assert.equal(item.system.r21.grade,'refined');assert.equal(item.system.r21.ferocious,2);assert.equal(item.system.r21.mods.concealable,true);
 assert.equal(item.system.magCost,0);assert.ok(warnings.some(w=>/No price/.test(w)));assert.equal(item.flags[SYSTEM].sect21.cultivation,'Devil Beast');assert.equal(item.flags[SYSTEM].sect21.stars,3);
 assert.match(item.system.description,/License:<\/strong> Devil Beast ✦✦✦ — The Cultivator is now licensed/);assert.match(item.system.description,/Material:<\/strong> Bonesteel/);
});
test('2.1 Assets and labelled records',()=>{
 const [asset,custom]=textItems21('1 5\n✦ - ✦✦✦✦✦\nSTANDING\nName the organization.\n✦✦ - ✦✦✦\n6 6\nTEST ASSET\nText.','asset');
 assert.equal(asset.item.type,'asset');assert.equal(asset.item.system.key,'standing');assert.equal(asset.item.system.stars,1);assert.deepEqual(asset.item.flags[SYSTEM].asset21,{code:'15',minStars:1,maxStars:5});
 assert.equal(custom.item.system.key,'custom');assert.equal(custom.item.system.stars,2);assert.ok(custom.warnings.length);
 const labelled=textItems21('Name: Test Saber\nType: Weapon\nProfile: Saber\nRarity: Rare\nWeight: 3 kg\nPrice: 330 ♄\nMods: VISCERAL\nA note.\n---\nName: Test Coat\nType: Armor\nCovers: Torso\nSoak: 2\nWeight: 2\n---\nName: Test Art\nType: Technick\nLicense: Red Gun ✦✦\nNeeds: ❂\nDoes a thing.','gear').map(r=>r.item);
 assert.equal(labelled[0].type,'weapon');assert.equal(labelled[0].system.r21.profile,'saber');assert.equal(labelled[0].system.rarity,'rare');assert.equal(labelled[0].system.magCost,330);assert.equal(labelled[0].system.r21.mods.visceral,true);
 assert.equal(labelled[1].type,'fashion');assert.equal(labelled[1].system.r21.coverage.torso,2);
 assert.equal(labelled[2].type,'technique');assert.equal(labelled[2].system.sect,'Nezha');assert.equal(labelled[2].system.installArdor,1);
});
test('2.1 text keeps page furniture out and names ratings in the book’s spelling',()=>{
 assert.equal(textItems21('SOME SECTION\n'+'Prose line.\n'.repeat(40)+TECHNICK,'gear').length,2);
 assert.equal(splitText21(CARDS).filter(b=>b.kind==='card').length,5);
 assert.deepEqual(rating21('HAND-EYE COORDINATION'),{kind:'skill',key:'handEye',label:'Hand-Eye Coordination'});assert.equal(rating21('HRT').key,'spi');assert.equal(rating21('FAC').key,'voc');
 assert.equal(rating21('Devil Tiger Blade').name,'Demon Body');assert.equal(rating21('POLITICS'),null);assert.equal(Object.keys(SECT_OF_CULTIVATION_21).length,20);
 assert.equal(titleName21('MORTAR AT-CR CUDGEL'),'MORTAR AT-CR Cudgel');assert.equal(titleName21('SPITEFUL DISEMBOWELMENT OF SERAPHIM'),'Spiteful Disembowelment of Seraphim');assert.equal(titleName21('SIX DEMON SWORD'),'Six Demon Sword');
});
test('parseImport: Rules 2.1 keeps names and the system’s own flags; 2.0.3 parsing is unchanged',()=>{
 const [rec]=parseImport(TECHNICK,'text','technique',{rules21:true});assert.equal(rec.item.flags[SYSTEM].sect21.stars,2);
 const json=JSON.stringify([{name:'HDF Test Axe',type:'weapon',system:{},flags:{evil:true,[SYSTEM]:{sect21:{stars:3,nested:{a:1}},other:{x:1}}},ownership:{default:3}}]);
 const again=parseImport(json,'json','weapon',{rules21:true})[0].item;assert.equal(again.name,'HDF Test Axe');assert.deepEqual(again.flags,{[SYSTEM]:{sect21:{stars:3}}});assert.equal(again.ownership,undefined);
 const legacy=parseImport(json,'json','weapon')[0].item;assert.equal(legacy.name,'HDF Test Axe');assert.equal(legacy.flags,undefined);
 assert.equal(parseImport('Name: Scholar\nType: Job\nJob of the Mind\nVIO 1 DIA 3 GRC 2 SAV 2 WRD 2 SPI 2','text','job')[0].item.type,'job');
 assert.ok(!('asset' in importTypes(false))&&'job' in importTypes(false));assert.ok('asset' in importTypes(true)&&'barang' in importTypes(true)&&!('job' in importTypes(true)));assert.ok('asset' in IMPORT_TYPES);
});

const WB=`RANDOM PAGE HEADING
TEST GUARD ✦ human SIDHI 0/3/5
A made-up lore line.
Move 3/4/5 · Dash 6/8/10 · Step 1/2/2
Speed 5/3/2 · Flame 3/6/8 · Morale 4/8/10
Parts HP 10/14/17
ARMORS
TEST BREASTPLATE [1] — TORSO Soak 2 · DR 18 · -1 Basic
Move
TEST HELM — HEAD Soak 2 · DR 11
TEST HARNESS [3/5] — TORSO/ARMS/LEGS Soak 2 · DR 18/11/11
WEAPONS
LONGGUN (5d/8d/10d) · 5/6/7 pierce · 400 m ·
DR 18 · 24 rifle rounds
BATON (5d/8d/10d) · 5 crush · 1 m
SHOUT (4d) · 2 Morale · 20 m
TEST KNIFE [SIDHI 3+] — 5 cut · 1 m
CORES
PHYS 3/4/5 · MOT 3/4/5 · WIT 2/2/3 · MND 2/4/5
· HRT 1/3/4 · FAC 1/3/4
CULTIVATIONS
RED GUN 2/4/5 · BEAST SHRINE 2/4/5 · HAND-EYE
COORDINATION 2/4/5 · STILLNESS 1/3/4 · POLITICS 1/2/3
LICENSES
RED AJNA ✦ [0+] · ❂ — Shoots without line of
sight.
TEST BURST ✦ [3+] · ✹✹ — A later License.
ASSETS
STANDING ✦✦ — The test standard.
TEST WASP ✦ mundane beast SIDHI 1
Lore.
Move 4 · Dash 6 · Step 2
Speed 4 · Flame 4 · Morale 4
Parts [d6] 1 WINGS 9 HP · 2 MANDIBLES 9 HP· 3
L LEG 9 HP· 4 R LEG 9 HP· 5 ABDOMEN 9 HP· 6 HEAD
11 HP
ARMOR
NATURAL HIDE — ALL Soak 3 · DR —
WEAPONS
STING (6d) · 4 pierce · 1 m
CORES
PHYS 2 · MOT 4 · WIT 3 · MND 1 · HRT 1 · FAC 1
CULTIVATIONS
BEAST SHRINE ✦✦✦ · STILLNESS ✦✦
TRAITS
TEST WINGS — Fly 8 basic move.
THE SWARM — Never alone.
DROPS
30♄ a wing`;
test('2.1 World Beings: one actor per printed Sidhi version, with the printed numbers',()=>{
 assert.ok(isWorldBeing21(WB));assert.ok(!isWorldBeing21('ASURI, THE RED SWORD\nHEALTH 6\n[TRAITS] Rage'));
 const records=parseWorldBeings21(WB);assert.deepEqual(records.map(r=>r.actor.name),['Test Guard (Sidhi 0)','Test Guard (Sidhi 3)','Test Guard (Sidhi 5)','Test Wasp']);
 const [low,mid,high,wasp]=records.map(r=>r.actor);
 assert.deepEqual(mid.system.cores,{phy:4,mot:4,mnd:4,wit:2,voc:3,spi:3});assert.equal(mid.system.sidhi,3);assert.deepEqual(mid.system.ardor,{max:6,burnt:0,installed:0});
 assert.equal(mid.system.skills.handEye,4);assert.equal(mid.system.skills.stillness,3);assert.deepEqual(mid.system.esoteric,[{name:'Red Gun',value:4,core:'spi'},{name:'Politics',value:2,core:'spi'}]);
 assert.ok(records[1].warnings.some(w=>/Politics: not a 2\.1 Cultivation/.test(w)));
 // Part HP 14 = 7 + PHYS 4 + Sidhi 3, so no bonus; Morale 8 against 1 + 3 + 3 = 7 is a +1 bonus.
 assert.ok(Object.values(mid.system.parts).every(p=>p.hpBonus===0));assert.equal(mid.system.moraleBonus,1);assert.equal(mid.system.morale.value,8);assert.equal(mid.system.moveBonus,0);
 // Armor gates: [1] is the first version only, [3/5] the Sidhi 3 and 5 versions.
 assert.deepEqual(Object.fromEntries(Object.entries(low.system.parts).map(([k,p])=>[k,p.soakBase])),{rleg:0,lleg:0,rarm:0,larm:0,torso:2,head:2});
 assert.deepEqual(Object.fromEntries(Object.entries(high.system.parts).map(([k,p])=>[k,p.soakBase])),{rleg:2,lleg:2,rarm:2,larm:2,torso:2,head:2});
 assert.deepEqual(low.items.filter(i=>i.type==='fashion').map(i=>i.name),['Test Breastplate','Test Helm']);assert.ok(low.items.filter(i=>i.type==='fashion').every(i=>i.system.equipped===false));
 const gun=mid.items.find(i=>i.name==='Longgun');assert.equal(gun.system.r21.profile,'longgun');assert.equal(gun.system.equipped,true);assert.deepEqual(gun.system.ammo,{type:'Rifle Rounds',quantity:24});assert.equal(gun.system.r21.damageBonus,0);assert.match(gun.system.description,/Printed pool 8d/);
 assert.equal(low.items.find(i=>i.name==='Baton').system.r21.damageBonus,1);assert.equal(low.items.find(i=>i.name==='Shout').system.r21.mods.noetic,true);
 assert.ok(!low.items.some(i=>i.name==='Test Knife'));assert.ok(mid.items.some(i=>i.name==='Test Knife'));
 assert.deepEqual(low.items.filter(i=>i.type==='technique').map(i=>i.name),['Red Ajna']);assert.deepEqual(high.items.filter(i=>i.type==='technique').map(i=>[i.name,i.system.burnArdor,i.system.installArdor]),[['Red Ajna',0,1],['Test Burst',2,0]]);
 const asset=low.items.find(i=>i.type==='asset');assert.equal(asset.system.key,'standing');assert.equal(asset.system.stars,2);
 // A beast with its own Parts is fitted onto the six the sheet has.
 assert.equal(wasp.system.parts.head.hpBonus,1);assert.equal(wasp.system.parts.torso.hpBonus,-1);assert.ok(Object.values(wasp.system.parts).every(p=>p.soakBase===3));
 assert.match(wasp.system.notes,/Printed Parts \[d6\]: 1 WINGS 9 HP/);assert.match(wasp.system.notes,/Drops:<\/strong> 30♄ a wing/);
 assert.deepEqual(wasp.items.filter(i=>i.type==='trait').map(i=>i.name),['Test Wings','The Swarm']);assert.equal(wasp.system.skills.beastShrine,3);
 assert.equal(parseWorldBeings21(WB,[],{versions:'2'}).length,2);assert.equal(parseWorldBeings21(WB,[],{versions:'2'})[0].actor.system.sidhi,3);
 assert.throws(()=>parseWorldBeings21('HEALTH 6\nVIO 3'),/No 2\.1 stat block/);
});
test('2.1 World Beings take matching Technicks and armor from the world or compendiums',()=>{
 const world=[{name:'Red Ajna',type:'technique',system:{description:'<p>Full rules.</p>',installArdor:1},flags:{[SYSTEM]:{sect21:{cultivation:'Red Gun',stars:1}}},_id:'abc',importSource:'2.1 Sects'}];
 const [record]=parseWorldBeings21(WB,world,{versions:'1'}),item=record.actor.items.find(i=>i.name==='Red Ajna');
 assert.match(item.system.description,/Full rules\./);assert.match(item.system.description,/Stat block \(❂\)/);assert.equal(item.flags[SYSTEM].sect21.cultivation,'Red Gun');assert.equal(item._id,undefined);
 assert.ok(record.warnings.some(w=>/Red Ajna: matched Red Ajna from 2\.1 Sects/.test(w)));
});
test('2.1 manual World Being and typed Cultivations',()=>{
 const a=manualWorldBeing21({name:' Test ',sidhi:'2',flame:'0',partHp:'12',soak:'1',morale:'0',mag:'50',phy:'3',mot:'2',mnd:'2',wit:'4',voc:'1',spi:'2',cultivations:'Beast Shrine 3, Stillness ✦✦ · Red Gun 4, Juggling 1'});
 assert.equal(a.name,'Test');assert.deepEqual(a.system.cores,{phy:3,mot:2,mnd:2,wit:4,voc:1,spi:2});assert.equal(a.system.parts.head.hpBonus,0);assert.equal(a.system.parts.torso.soakBase,1);assert.equal(a.system.ardor.max,5);
 assert.deepEqual(a.system.skills,{beastShrine:3,stillness:2});assert.deepEqual(a.system.esoteric.map(e=>e.name),['Red Gun','Juggling']);assert.deepEqual(a.unknown,['Juggling']);assert.equal(a.system.morale.value,5);assert.equal(a.system.moraleBonus,0);
 assert.throws(()=>manualCultivations21('Beast Shrine'),/name and a rating/);assert.throws(()=>manualCultivations21('PHYS 3'),/Core/);assert.throws(()=>manualWorldBeing21({name:'A',sidhi:'7'}));
});
test('PDF pages in two columns read left column first, and one-column pages are unchanged',()=>{
 const run=(str,x,y,width)=>({str,transform:[1,0,0,1,x,y],width,height:8});
 const items=[];
 for(let i=0;i<8;i++){items.push(run(`R${i}`,220,500-i*12,150));items.push(run(`L${i}`,20,500-i*12,150));}
 items.push(run('FULL WIDTH TITLE',20,560,380));
 assert.equal(pdfText(items,420),['FULL WIDTH TITLE',...Array.from({length:8},(_,i)=>`L${i}`),...Array.from({length:8},(_,i)=>`R${i}`)].join('\n'));
 assert.ok(Math.abs(pdfGutter(items.map(i=>({x:i.transform[4],w:i.width})),420)-195)<30);
 const single=Array.from({length:14},(_,i)=>run(`Line ${i}`,20,500-i*12,380));assert.equal(pdfText(single,420).split('\n').length,14);
 assert.equal(pdfText([{str:'RED SWORD',transform:[1,0,0,1,0,30]},{str:'HEALTH 6',transform:[1,0,0,1,0,20],hasEOL:true},{str:'VIO 3',transform:[1,0,0,1,0,10]}]),'RED SWORD\nHEALTH 6\nVIO 3');
});
test('World Being preview under Rules 2.1 uses the 2.1 reader and refuses a 2.0.3 block with a reason',async()=>{
 const {previewWorldBeings}=await import('../scripts/worldbeing-sources.mjs');
 const item={name:'Red Ajna',type:'technique',uuid:'Item.abc',toObject(){return {name:this.name,type:this.type,system:{description:'<p>World copy.</p>'}};},testUserPermission:()=>true};
 globalThis.game={user:{isGM:true},items:{contents:[item]},packs:[]};
 const records=await previewWorldBeings([WB],{rules21:true,versions:'1'});
 assert.equal(records.length,2);const ajna=records[0].actor.items.find(i=>i.name==='Red Ajna');assert.match(ajna.system.description,/World copy\./);assert.equal(ajna._importUuid,undefined);
 await assert.rejects(previewWorldBeings(['ASURI\nHEALTH 6\n[TRAITS] Rage'],{rules21:true}),/No Rules 2\.1 stat block/);
 const legacy=await previewWorldBeings(['ASURI\nHEALTH 6\n[TRAITS] Rage']);assert.equal(legacy[0].actor.system.health.max,6);
 delete globalThis.game;
});
