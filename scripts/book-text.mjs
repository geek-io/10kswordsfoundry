import {MODIFIER_CHOICES,AFFINITIES} from './modifiers.mjs?v=0.1.47';
export const PATTERNS={
 'empty hand':{bonus:1,damageType:'impact',range:1},dagger:{bonus:2,damageType:'cut',range:1},sword:{bonus:2,damageType:'cut',range:1},saber:{bonus:3,damageType:'cut',range:1},bludgeon:{bonus:2,damageType:'impact',range:1},cleaver:{bonus:2,damageType:'cut',range:1},polearm:{bonus:2,damageType:'cut',range:2},whip:{bonus:2,damageType:'impact',range:2},bow:{bonus:2,damageType:'cut',range:20},crossbow:{bonus:3,damageType:'cut',range:10},launcher:{bonus:2,damageType:'cut',range:6},gun:{bonus:3,damageType:'impact',range:25}};
const tidy=s=>s.replace(/\u00ad/g,'').replace(/\r/g,'').replace(/A WW/g,'AWW').replace(/OCCUL T/g,'OCCULT').replace(/HOL Y/g,'HOLY').replace(/L YRIC/g,'LYRIC');
const header=/^(?:[1-6]\s+)?([◼■▪]+)\s*(?:[A-Z][A-Z -]*?\s+)?(COMMON|UNCOMMON|ENHANCED|RARE|DELUXE|PRESTIGE)\s+(.+)$/gim;
export function bookEntries(text,chosenType='gear') {
 const cleaned=tidy(text),headers=[...cleaned.matchAll(header)];
 if(!headers.length){
  const lines=cleaned.trim().split('\n').map(s=>s.trim()).filter(Boolean);
  const ability=lines.findIndex(line=>!line.includes(':')&&/(?:Magick|Technick)$/i.test(line));
  if(ability<0)return null;
  const type=/Magick$/i.test(lines[ability])?'magick':'technique';
  const name=lines.slice(0,ability+1).filter(l=>!/^\d+$/.test(l)).join(' ').replace(/\s*(Magick|Technick)$/i,'').trim();
  const system={description:text.trim()};
  const costs=cleaned.match(/(?:\[[✦✹❂. …]+\]\s*)+/)?.[0];
  if(costs){system.apCost=(costs.match(/✦/g)||[]).length;system.burnArdor=(costs.match(/✹/g)||[]).length;system.installArdor=(costs.match(/❂/g)||[]).length;}
  if(type==='magick') {
   for(const key of ['mantra','mudra']){const m=cleaned.match(new RegExp('^'+key+'s?\\s*:?\\s+(.+)$','im'));if(m)system[key]=m[1];}
   const pools=cleaned.match(/\b(VIO|DIA|GRC|SAV|WRD|SPI)\s+(?:vs\.?|against)\s+(VIO|DIA|GRC|SAV|WRD|SPI)\b/i);
   if(pools){system.attackPool=pools[1].toLowerCase();system.defensePool=pools[2].toLowerCase();}
   const optional=cleaned.match(/(?:can|may) burn[^.]+\./i);
   if(optional)system.enhancement={description:optional[0],burnArdor:(optional[0].match(/✹/g)||[]).length||Number(optional[0].match(/burn\s+(\d+)\s+Ardor/i)?.[1]??0),bonus:Number(optional[0].match(/\+(\d+)\s+(?:ATK|attack dice)/i)?.[1]??0)};
  }
  return [{item:{name,type,system},warnings:['Complete ability text preserved. Review costs, pool choices and conditional enhancements; variable costs and bespoke effects require manual configuration.']}];
 }
 return headers.map((match,index)=>{
  const metadata=match[3].trim(),block=cleaned.slice(match.index+match[0].length,headers[index+1]?.index??cleaned.length).split(/,?CONSUMECONS[A-Z]*/)[0].trim();
  const lines=block.split('\n').map(s=>s.trim()).filter(Boolean),name=lines.shift()??'';
  const pattern=Object.keys(PATTERNS).find(key=>new RegExp('\\b'+key+'\\b','i').test(metadata));
  const type=pattern?'weapon':/fashion|headgear/i.test(metadata)?'fashion':/accessory/i.test(metadata)?'accessory':/ammo/i.test(metadata)?'ammunition':'gear';
  const system={rarity:match[2].toLowerCase(),slots:match[1].length,description:lines.join('\n')};
  const warnings=['Original text preserved. Review inferred fields before import. Conditional effects remain in Description.'];
  const price=(metadata+'\n'+block).match(/(?<![\d,])([\d,]+)\s*MAG\b/i);
  if(price&&/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(price[1]))system.magCost=Number(price[1].replaceAll(',',''));else warnings.push('Price absent or ambiguous; default cost is not a claim that the item is free.');
  if(type==='fashion'){for(const key of ['armor','ardor']){const m=block.match(new RegExp(key+'\\s*\\+?(\\d+)','i'));if(m)system[key]=Number(m[1]);}}
  if(type==='weapon'){
   Object.assign(system,PATTERNS[pattern],{weaponType:['bow','crossbow','launcher','gun'].includes(pattern)?'ranged':'melee',upgrade:(metadata.match(/BASE|REFINED|DIVINE|IMMORTAL/i)?.[0]??'base').toLowerCase(),properties:{}});
   const tags=lines.filter(line=>line===line.toUpperCase()&&/[A-Z]/.test(line)&&!line.includes('[')).slice(0,2).join(' ');
   for(const key of Object.keys(MODIFIER_CHOICES))if(new RegExp('\\b'+key+'\\b','i').test(tags))system.properties[key]=true;
   if(pattern==='bludgeon')system.properties.crushing=true;if(pattern==='cleaver')system.properties.ferocious=true;if(pattern==='dagger')system.properties.concealable=true;
   for(const key of Object.keys(AFFINITIES))if(new RegExp('\\b'+key+'\\b','i').test(tags))system.affinity=key[0].toUpperCase()+key.slice(1);
   if(system.weaponType==='ranged')system.ammoFamily=pattern;
   const range=block.match(/(?:range (?:up )?to|effective range (?:up )?to)\s*(\d+)m/i);if(range)system.range=Number(range[1]);
  }
  return {item:{name,type,system},warnings};
 });
}
