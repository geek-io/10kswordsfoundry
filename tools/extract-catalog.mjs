import {defaultItemIcon} from '../scripts/item-icons.mjs';
import {titleCase,paragraphText} from "../scripts/import-format.mjs";
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {AMMO} from '../scripts/ammunition.mjs';
import {bookEntries,PATTERNS} from '../scripts/book-text.mjs';
const pages=JSON.parse(await readFile('tmp/catalog-pages.json','utf8'));
const id=name=>createHash('sha256').update(name).digest('hex').slice(0,16);
const groups={94:'Consumables',95:'Accessories',96:'Salvage',97:'Tools',98:'Esotery',99:'Talismans',104:'Weapons',105:'Weapons',106:'Weapons',107:'Weapons',108:'Weapons',109:'Weapons',110:'Fashion',111:'Fashion'};
const corrections={'GUSSIO THUNDERBOL T LA TTE':'GUSSIO THUNDERBOLT LATTE','AWW THAUMA TURGICAL CHOKER':'AWW THAUMATURGICAL CHOKER','DEMON GOD PRA YER BEADS':'DEMON GOD PRAYER BEADS','W AIRINI LOCKET':'WAIRINI LOCKET','CASSETTE T APE: LOVER ROCKERS':'CASSETTE TAPE: LOVER ROCKERS','TSUSHING PRESSPLA Y PLA YER':'TSUSHING PRESSPLAY PLAYER','BINT ANG HANDHELD LOTUS LIGHT':'BINTANG HANDHELD LOTUS LIGHT','BINT ANG LIGHTER':'BINTANG LIGHTER','AWW DEVIL BA TTER Y':'AWW DEVIL BATTERY','HAECO MAGNETIC COMP ASS':'HAECO MAGNETIC COMPASS','DEV ARAJA ’S DYING GASP':'DEVARAJA’S DYING GASP','HEAR T CONT AINER':'HEART CONTAINER','SOUL CONT AINER':'SOUL CONTAINER','SECOND DIMENSION VIVIFICA TION':'SECOND DIMENSION VIVIFICATION'};
Object.assign(corrections,{'AWW LONGCLA WS':'AWW LONGCLAWS','INTER-ELIX OCCULT PRA YER WRAPS':'INTER-ELIX OCCULT PRAYER WRAPS','MA ST ARDUST WRAP':'MA STARDUST WRAP','TMNI VENOM BALARA W':'TMNI VENOM BALARAW','MA REAPING TEPPŌKA T ANA':'MA REAPING TEPPŌKATANA','RA TT AN STICK':'RATTAN STICK','HA TCHET':'HATCHET','KA P ARASHURMA':'KA PARASHURMA','UM STINGRA Y T AIL':'UM STINGRAY TAIL','AWW SKY FEA THER NAGINA T A':'AWW SKY FEATHER NAGINATA','EXK V AMPIRE HUNTER':'EXK VAMPIRE HUNTER','HDF MINIA TURE ARBLAST':'HDF MINIATURE ARBLAST','HDF HEA VENL Y SLINGST AFF':'HDF HEAVENLY SLINGSTAFF','SA V ANT ROBES':'SAVANT ROBES','HDF “MINGW ANG” SUIT':'HDF “MINGWANG” SUIT','HW SIL VER TONGUE DIPLOMACY A TTIRE':'HW SILVER TONGUE DIPLOMACY ATTIRE','AWW “GENJI” HEA VENSILK RAIMENTS':'AWW “GENJI” HEAVENSILK RAIMENTS'});
const items=[];
for(const {page,text} of pages){if(!groups[page])continue;
 const cleaned=text.replace(/(CONSUME[A-Z]*)(?=◼)/g,'$1\n').replace(/^6 DELUXE HEADGEAR/m,'◼ DELUXE FASHION');
 const records=bookEntries(cleaned);
 if(!records)throw Error(`No entries on ${page}`);
 for(const {item,warnings} of records){
  item.name=corrections[item.name]??item.name;
  item._id=id(`p${page}:${item.name}`);item.folder=id(item.type==='ammunition'?'Ammunition':groups[page]);item.img='icons/svg/item-bag.svg';item.effects=[];
  item.system.source=`10,000 Swords Against Heaven 2.0.3, PDF p.${page}`;
  item.flags={'10kswordsfoundry':{sourcePage:page,reviewNotes:warnings.slice(1)}};
  if(item.name.includes('MINGW')){item.system.slots=0;item.flags['10kswordsfoundry'].reviewNotes.push('Printed header says “6 DELUXE HEADGEAR” without Carry squares. Fashion classification follows its section and Armor/Ardor stats; Carry remains unconfirmed.');}
  if(item.type==='weapon'&&item.name.includes('SIKAROM')){Object.assign(item.system,PATTERNS.bow,{weaponType:'ranged',ammoFamily:'bow'});delete item.system.properties.crushing;item.flags['10kswordsfoundry'].reviewNotes.push('Header says Bludgeon; description and Bow section identify a longbow. Uses Bow pattern.');}
  if(item.name==='UM STINGRAY TAIL')item.system.damageType='cut';
  // Header text and full prose remain available; no inferred conditional automation.
  item.system.description=item.system.description.replace(/\n(?:PAGE \d+|WEAPON LIST|Are you what you wear\?).*$/s,'');
  if(item.type==='ammunition')item.system.ammoType='custom';
  if(item.flags['10kswordsfoundry'].reviewNotes.length)item.system.description+='\n\nImport review: '+item.flags['10kswordsfoundry'].reviewNotes.join(' ');
  items.push(item);
 }
}
const add=(name,type,folder,page,system)=>items.push({_id:id('reference:'+name),name,type,folder:id(folder),img:'icons/svg/item-bag.svg',effects:[],system:{...system,source:`10,000 Swords Against Heaven 2.0.3, PDF p.${page}`},flags:{'10kswordsfoundry':{sourcePage:page}}});
const patternNotes={'empty hand':'+1 to disarm, trips, or knockback.',dagger:'Concealable; Piercing on surprise attacks; may use GRC for ATK.',sword:'+1 die when defending with this weapon.',saber:'No extra pattern property.',bludgeon:'Inherent Crushing.',cleaver:'Inherent Ferocious.',polearm:'2 m reach.',whip:'2 m reach.',bow:'Requires VIO 1+.',crossbow:'Reload after firing.',launcher:'Versatile.',gun:'Reload after firing.'};
for(const [pattern,stats] of Object.entries(PATTERNS))add(pattern.replace(/\b\w/g,c=>c.toUpperCase())+' (Pattern)','weapon','Weapons',100,{...stats,weaponType:['bow','crossbow','launcher','gun'].includes(pattern)?'ranged':'melee',ammoFamily:['bow','crossbow','launcher','gun'].includes(pattern)?pattern:'none',properties:pattern==='bludgeon'?{crushing:true}:pattern==='cleaver'?{ferocious:true}:pattern==='dagger'?{concealable:true}:{},description:patternNotes[pattern]+' Base pattern; situational rules remain manual. Price and rarity are not specified in the pattern table.'});
// Keep legacy reference IDs stable while presenting generic Weapons.
for(const item of items)if(item.type==='weapon'&&item.name.endsWith(' (Pattern)'))item.name=item.name.slice(0,-10);
for(const [key,ammo] of Object.entries(AMMO).filter(([key])=>key!=='custom'))add(ammo.label,'ammunition','Ammunition',101,{ammoType:key,quantity:1,magCost:{bullet:5,fireshot:10,glaveshot:200,roundshot:150}[key]??0,description:`${ammo.label}. For ${ammo.family} weapons. ${ammo.damage?'Damage: '+ammo.damage+'. ':''}${ammo.modifier?'Property: '+ammo.modifier+'. ':''}${ammo.note??''} Each ammo type occupies one Carry slot, stacking.${['bullet','fireshot','glaveshot','roundshot'].includes(key)?'':' Price is not specified in the source.'}`});
for(const [name,cost,form] of [['Siderite Shard',50,'Refined'],['Siderite Fragments',500,'Divine'],['Siderite Core',5000,'Immortal']])add(name,'gear','Crafting',102,{magCost:cost,slots:0,description:`Weapon reinforcement material for ${form} Form. Exchange value ${cost} Mag. Carry cost and rarity are unspecified; review with the Intercessor.`});
const folders=[...new Set([...Object.values(groups),'Ammunition','Crafting'])].sort().map(name=>({_id:id(name),name,type:'Item',folder:null,sorting:'a',color:null}));
for(const item of items){item.img=defaultItemIcon(item.type,item.img);item.name=titleCase(item.name);item.system.description=paragraphText(item.system.description);}
await mkdir('data',{recursive:true});await writeFile('data/non-sect-items.json',JSON.stringify({folders,items},null,2));
console.log(items.length+' records');for(const item of items)console.log(item.flags['10kswordsfoundry'].sourcePage,item.name,item.type,item.system.magCost??'?');
