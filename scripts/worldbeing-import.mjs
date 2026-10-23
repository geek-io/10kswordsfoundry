import {titleCase,paragraphText} from './import-format.mjs?v=0.1.51';
export const normalizeItemName=s=>String(s).normalize('NFKD').toLowerCase().replace(/[’'ʼ]s\b/g,'').replace(/[^a-z0-9]/g,'');
const normalize=normalizeItemName;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const clean=s=>s.replace(/\b(HEAL TH|SA V|F ASHION|A TK|PORT AL|PIRA TE|DIPLOMA T|COUR TESAN|BA TTLEMAGE|W ARDEN|EARTHL Y|ESCHA TONIAN|GREA T|WRA TH|SCA THE)\b/gi,m=>m.replaceAll(/\s/g,''))
 .replace(/\[MICROCOSMIC ORBIT\s*[—–-]\s*(?=\[)/gi,'[MICROCOSMIC ORBIT] ');
function list(text){return text.split(/,(?![^()]*\))/).map(s=>s.trim()).filter(Boolean);}
function embedded(data){const copy=structuredClone(data);for(const key of ['_id','id','folder','ownership','sort','flags','_stats'])delete copy[key];for(const effect of copy.effects??[])delete effect._id;return copy;}
export function parseWorldBeings(text,worldItems=[]){
 if(!text.trim())throw new Error('Paste a World Being stat block first.');
 if(text.length>2000000)throw new Error('Import at most 2 MB at a time.');
 const normalized=clean(text.replaceAll('\r',''));
 const lines=normalized.split('\n');const starts=[];
 let previousHealth=-1;
 for(let i=0;i<lines.length;i++)if(/^\s*HEALTH\b/i.test(lines[i])){
  let start=i-1;
  while(start>previousHealth&&!/^\s*(?:Name\s*:|[A-Z][A-Z ,/’'“”"()–—-]{2,}$)/.test(lines[start]))start--;
  if(start<=previousHealth)throw new Error('Put the World Being name on its own uppercase line before HEALTH.');
  starts.push(start);
  previousHealth=i;
 }
 if(!starts.length)throw new Error('No HEALTH stat line found. Include the name, HEALTH, stats, and item sections.');
 if(starts.length>50||new Set(starts).size!==starts.length)throw new Error('Separate each complete World Being block with its own uppercase name. Limit: 50.');
 return starts.map((start,index)=>{
  const block=lines.slice(start,starts[index+1]??lines.length).join('\n'),name=titleCase(lines[start].replace(/^\s*Name\s*:\s*/i,'').trim()),warnings=[];
  const system={notes:`<p>${escape(paragraphText(block)).replaceAll('\n\n','</p><p>')}</p>`,cultivations:{}};
  for(const key of ['vio','dia','grc','sav','wrd','spi']){const m=block.match(new RegExp(`\\b${key}\\s*[:=]?\\s*(\\d+|[✦★]+)`,'i'));if(m)system.cultivations[key]=/^\d/.test(m[1])?Number(m[1]):m[1].length;else warnings.push(`Missing ${key.toUpperCase()}; default rating will be used.`);}
  const healthLine=block.match(/HEALTH[^\n]*/i)?.[0]??'',boxes=healthLine.match(/\[\s*-?\d+\s*\]/g),health=boxes?.length??Number(healthLine.match(/HEALTH\s*[:=]?\s*(\d+)/i)?.[1]??6);
  system.health={max:health,value:health};
  for(const [label,key] of [['SIDHI','sidhi'],['MOV','movement'],['ARMOR','armor'],['ARDOR','ardor']]){const m=block.match(new RegExp(`\\b${label}\\s*[:=]?\\s*(\\d+)`,'i'));if(m)system[key]=key==='armor'?{max:Number(m[1]),value:Number(m[1])}:key==='ardor'?{max:Number(m[1]),burnt:0,installed:0}:Number(m[1]);}
  const sections=[...block.matchAll(/\[(R\s*HAND|L\s*HAND|L\s*\+\s*R\s*HAND|FASHION|TRAITS?|ITEMS|LICENSES?|GAMBITS?|MICROCOSMIC ORBIT)(?:\s*[—–-][^\]\n]*)?\]/gi)];
  const items=[];
  for(let j=0;j<sections.length;j++){
   const section=sections[j][1].toUpperCase().replaceAll(/\s/g,''),body=block.slice(sections[j].index+sections[j][0].length,sections[j+1]?.index??block.length).replace(/\n\s*\d+\s*$/,'').trim();
   const types=section.startsWith('MICRO')?['technique','magick']:section.includes('HAND')?['weapon']:section==='FASHION'?['fashion']:section.startsWith('TRAIT')?['trait']:section.startsWith('LICENSE')?['license']:section.startsWith('GAMBIT')?['gambit']:['gear','accessory','weapon','ammunition','salvage'];
   const inline=section.startsWith('MICRO')&&/\[[✹✦❂]+\]/u.test(body);
   const entries=inline?body.split(/\n(?=[A-Z][A-Z '\-]+\s*\[[✹✦❂])/u):list(body.replaceAll('\n',' '));
   for(let entry of entries){
    entry=entry.replace(/^\[|\]$/g,'').trim();if(!entry||/^N\/A$/i.test(entry))continue;
    const money=entry.match(/^(\d+)\s*mag\b/i);if(money){system.mag=(system.mag??0)+Number(money[1]);continue;}
    const quantity=Number(entry.match(/^(\d+)\s+/)?.[1]??1);entry=entry.replace(/^\d+\s+/,'');
    const detailAt=entry.search(/\(|\[[✹✦❂]/u),rawName=(detailAt<0?entry:entry.slice(0,detailAt)).trim().replace(/\s+/g,' '),detail=detailAt<0?'':entry.slice(detailAt);
    let matches=worldItems.filter(item=>types.includes(item.type)&&normalize(item.name)===normalize(rawName));
    const alias=detail.match(/^\(([^)]+)\)/)?.[1];
    if(!matches.length&&alias)matches=worldItems.filter(item=>types.includes(item.type)&&normalize(item.name)===normalize(alias));
    matches.sort((a,b)=>(a.importPriority??0)-(b.importPriority??0)||String(a._importUuid??a.uuid??a._id??'').localeCompare(String(b._importUuid??b.uuid??b._id??'')));
    let item;
    if(matches.length){item=embedded(typeof matches[0].toObject==='function'?matches[0].toObject():matches[0]);warnings.push(`${rawName}: matched ${matches[0].name} from ${matches[0].importSource??'World items'}${matches.length>1?' (preferred source chosen from multiple matches)':''}.`);}
    else{
     const type=inline?'magick':types[0];item={name:titleCase(rawName),type,system:{description:detail?`<p>${escape(detail)}</p>`:'',source:'World Being stat block'}};
     warnings.push(`${rawName}: ${matches.length?'multiple world matches;':'no matching world item;'} created a ${type} placeholder. Review its rules.`);
     if(type==='license')item.system.sect=rawName;
     if(inline){item.system.burnArdor=(detail.match(/✹/gu)??[]).length;item.system.apCost=(detail.match(/✦/gu)??[]).length;item.system.installArdor=(detail.match(/❂/gu)??[]).length;const pools=detail.match(/\b(VIO|DIA|GRC|SAV|WRD|SPI)\s+vs\.?\s+(VIO|DIA|GRC|SAV|WRD|SPI)/i);if(pools){item.system.attackPool=pools[1].toLowerCase();item.system.defensePool=pools[2].toLowerCase();}}
    }
    // Printed totals remain authoritative. Imported loadouts start inactive to avoid double bonuses.
    if(types.includes('weapon')||types.includes('gear')||['fashion','license','technique','magick'].includes(item.type)){item.system.equipped=false;item.system.paidCarry=0;item.system.paidMeridians=0;}
    if(item.type==='trait')item.system.active=false;
    if(['weapon','gear','accessory','ammunition','salvage'].includes(item.type))item.system.quantity=quantity;
    if(detail&&matches.length)item.system.description=`${item.system.description??''}<p>Stat-block note: ${escape(detail)}</p>`;
    items.push(item);
   }
  }
  warnings.push('Printed resources are preserved. Items and Trait effects start inactive; review and equip them to avoid counting printed bonuses twice. Unspecified item rules require review.');
  return {actor:{name,type:'npc',system,items},warnings};
 });
}
