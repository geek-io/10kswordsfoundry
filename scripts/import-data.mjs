import {titleCase,paragraphText} from "./import-format.mjs?v=0.1.40";
import {splitBookText} from './import-boundaries.mjs?v=0.1.40';
import {bookEntries} from "./book-text.mjs?v=0.1.40";
import {LICENSE_CHOICES} from './licenses.mjs?v=0.1.40';
import {MODIFIER_CHOICES} from './modifiers.mjs?v=0.1.40';
export const IMPORT_TYPES={weapon:'Weapon',fashion:'Fashion',gear:'Gear',accessory:'Accessory',ammunition:'Ammo',job:'Job',license:'License',technique:'Technick',magick:'Magick',trait:'Trait',weaponMod:'Weapon Mod',gambit:'World Being Gambit',salvage:'Salvage'};
const aliases={'world being gambit':'gambit',gambits:'gambit',salvages:'salvage',armor:'fashion',armour:'fashion',technick:'technique',technicks:'technique',techniques:'technique',magicks:'magick',jobs:'job',licenses:'license',weapons:'weapon',ammo:'ammunition','weapon mod':'weaponMod',weaponmod:'weaponMod'};
export function importType(value){const key=String(value??'').trim();return Object.hasOwn(IMPORT_TYPES,key)?key:Object.hasOwn(aliases,key.toLowerCase())?aliases[key.toLowerCase()]:key.toLowerCase();}
function put(target,path,value){const parts=path.split('.');if(parts.some(p=>['__proto__','constructor','prototype'].includes(p))) throw new Error('Unsafe field name.');let node=target;for(const part of parts.slice(0,-1))node=node[part]??={};node[parts.at(-1)]=value;}
function scalar(value){if(value==='true')return true;if(value==='false')return false;if(/^-?\d+(\.\d+)?$/.test(value))return Number(value);if(/^[\[{]/.test(value))return JSON.parse(value);return value;}
export function readCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw new Error('CSV has an unclosed quoted field.');row.push(cell);if(row.some(Boolean))rows.push(row);
 const headers=rows.shift()?.map(h=>h.trim());if(!headers?.includes('name'))throw new Error('CSV needs a name column.');
 return rows.map((cells,index)=>{if(cells.length!==headers.length)throw new Error(`CSV row ${index+2} has the wrong number of columns.`);const item={};headers.forEach((key,i)=>{if(cells[i]!=='')put(item,key,scalar(cells[i]));});return item;});
}
export function textItems(text,chosenType){
 const blocks=splitBookText(text,chosenType);
 if(blocks.length>1)return blocks.flatMap(block=>textItems(block,chosenType));
 if(blocks.length===1)text=blocks[0];
 if(chosenType==='trait'&&/^\s*(?:[3-9]|1[0-8])\s*[—–-]/.test(text))text=text.replace(/^(\s*(?:[3-9]|1[0-8])\s*[—–-]\s*[^.\n]+)\.\s*/, '$1\n');
 if(chosenType==='trait')text=text.replace(/^\s*(?:[1-6]\s*[1-6]\s+|(?:[3-9]|1[0-8])\s*[—–-]\s*)(?=[A-Z])/,'').replace(/\n\s*TRAITS\s*$/,'');
 const book=bookEntries(text,chosenType);if(book)return book;
 return text.split(/\n\s*---+\s*\n/).filter(s=>s.trim()).map(block=>{
  const lines=block.trim().split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const typed=lines.find(l=>/^type\s*:/i.test(l));const heading=lines[0]?.match(/^(.+?)\s+(Weapon Mod|Technick|Magick|Fashion|Gear|License|Trait|Job|Weapon)$/i);
  const type=importType(typed?typed.split(':').slice(1).join(':'):heading?.[2]??chosenType);
  const named=lines.find(l=>/^name\s*:/i.test(l));
  const name=named?named.replace(/^name\s*:\s*/i,''):heading?.[1]??lines.find(l=>!/^type\s*:/i.test(l));
  const item={name,type,system:{description:block.trim()}},warnings=['Original text retained in Description. Review every inferred value before importing.'];
  const labels={'ap cost':'apCost','install ardor':'installArdor','burn ardor':'burnArdor',mantra:'mantra',mudra:'mudra','attack pool':'attackPool','defense pool':'defensePool',rank:'rank',rarity:'rarity',range:'range','attack bonus':'bonus',atk:'bonus','armor':'armor','ardor':'ardor','carry slots':'slots',quantity:'quantity','mag cost':'magCost','meridian cost':'meridianCost',affinity:'affinity',source:'source','damage type':'damageType','weapon type':'weaponType',category:'category','ammo type':'ammoType',upgrade:'upgrade'};
  for(const line of lines){const match=line.match(/^([^:]+):\s*(.*)$/);if(!match)continue;const label=match[1].toLowerCase();if(labels[label]) item.system[labels[label]]=scalar(match[2]);}
  if(item.system.rank)item.system.rank=String(item.system.rank).toLowerCase();
  if(item.system.rarity)item.system.rarity=String(item.system.rarity).toLowerCase();
  if(type==='job'||type==='license') {
   const stats={};for(const key of ['vio','dia','grc','sav','wrd','spi',...(type==='license'?['sidhi']:[])]){const match=block.match(new RegExp(`\\b${key}\\s*[:=]?\\s*(\\d+)`,'i'));if(match)stats[key]=Number(match[1]);}
   item.system[type==='job'?'cultivations':'prerequisites']=stats;
   if(type==='job'){if(/job of the mind/i.test(block))item.system.category='mind';else if(/job of the body/i.test(block))item.system.category='body';if(Object.keys(stats).length<6)warnings.push('Some Job Cultivations were not found; supply all six ratings.');}
   else {const sect=lines.find(l=>/^sect\s*:/i.test(l))?.replace(/^sect\s*:\s*/i,'');const match=Object.entries(LICENSE_CHOICES).find(([key,label])=>key.toLowerCase()===sect?.toLowerCase()||label.toLowerCase()===sect?.toLowerCase());if(match)item.system.sect=match[0];else if(sect)item.system.sect=sect;else warnings.push('Supply a Sect before importing this License.');}
  }
  if(type==='weapon') {item.system.properties={};const tags=lines.find(l=>/^(properties|modifiers)\s*:/i.test(l));if(tags)for(const key of Object.keys(MODIFIER_CHOICES))if(new RegExp(`\\b${key}\\b`,'i').test(tags))item.system.properties[key]=true;}
  return {item,warnings};
 });
}
export function parseImport(text,format,type){
 if(!text.trim())throw new Error('Paste content or choose a file first.');if(text.length>2000000)throw new Error('Please import at most 2 MB at a time.');
 let records;
 if(format==='text') records=textItems(text,type);
 else {let data=format==='csv'?readCSV(text):JSON.parse(text);if(!Array.isArray(data))data=data.items??[data];records=data.map(item=>({item,warnings:[]}));}
 if(!records.length||records.length>200)throw new Error('Import between 1 and 200 items at a time.');
 return records.map(({item,warnings},index)=>{
  item=structuredClone(item);item.type=importType(item.type||type);
  if(!Object.hasOwn(IMPORT_TYPES,item.type))throw new Error(`Item ${index+1}: choose a supported type.`);
  if(typeof item.name!=='string'||!item.name.trim())throw new Error(`Item ${index+1}: name is required.`);
  if(item.system && (Array.isArray(item.system)||typeof item.system!=='object'))throw new Error(`Item ${index+1}: system must be an object.`);
  return {item:{name:titleCase(item.name),type:item.type,...(typeof item.img==='string'?{img:item.img}:{}),system:{...item.system,...(item.system?.description?{description:paragraphText(item.system.description)}:{})}},warnings};
 });
}
