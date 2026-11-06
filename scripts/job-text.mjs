// Book-format Job text: "Name Tagline. VIO✦✦DIA✦… [R HAND] Item (note) [FASHION] Item (note) [TRAIT] Item (note)".
// The Job sheet shows Cultivations and the starting loadout on its Details tab, so the
// Description keeps only the tagline instead of repeating the whole stat block.
const CORES=['vio','dia','grc','sav','wrd','spi'];
const STAT=/\b(VIO|DIA|GRC|SAV|WRD|SPI)\s*(✦+|\d+)/gi;
const SLOT=/\[(R\s*\+\s*L\s*HAND|R\s*HAND|L\s*HAND|FASHION|TRAIT|ACCESSORY|GEAR)\]|\bTrait:/gi;
const escapeText=text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function plainText(html){
 return String(html??'').replace(/<\/p>\s*<p[^>]*>/gi,' ').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]*>/g,' ')
  .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'")
  .replace(/\s+/g,' ').trim();
}
/** True when the text still holds the book's Cultivation line (stars or numbers). */
export function isRawJobText(html){return /\bVIO\s*(?:✦+|\d+)\s*DIA\s*(?:✦+|\d+)/i.test(plainText(html));}
function slotType(label){
 const key=label.toUpperCase().replace(/\s+/g,' ');
 if(key.startsWith('R + L')||key.startsWith('R+L'))return {type:'weapon',gearSlot:'both'};
 if(key.startsWith('R'))return {type:'weapon',gearSlot:'right'};
 if(key.startsWith('L'))return {type:'weapon',gearSlot:'left'};
 if(key==='FASHION')return {type:'fashion',gearSlot:'fashion'};
 if(key.startsWith('TRAIT'))return {type:'trait'};
 if(key==='ACCESSORY')return {type:'accessory'};
 return {type:'gear'};
}
// Split "Name (note) more" or "Name [TAG] [TAG]" into name and note.
function splitEntry(text){
 text=text.trim().replace(/[.;,]\s*$/,'');
 let name=text,notes=[];
 const paren=text.indexOf('('),bracket=text.indexOf('[');
 const cut=[paren,bracket].filter(i=>i>0).sort((a,b)=>a-b)[0];
 if(cut!==undefined){
  name=text.slice(0,cut).trim();
  let rest=text.slice(cut);
  // Balanced parentheses and bracket tags.
  while(rest.length){
   if(rest[0]==='('){let depth=0,i=0;for(;i<rest.length;i++){if(rest[i]==='(')depth++;else if(rest[i]===')'&&--depth===0)break;}notes.push(rest.slice(1,i).trim());rest=rest.slice(i+1).trim();}
   else if(rest[0]==='['){const end=rest.indexOf(']');if(end<0)break;notes.push(rest.slice(1,end).trim());rest=rest.slice(end+1).trim();}
   else {notes.push(rest.trim());break;}
  }
 }
 const note=notes.filter(Boolean).map(n=>n.replace(/\[([A-Z][A-Z +-]*)\]/g,'$1').replace(/\s+/g,' ').trim()).map(n=>n===n.toUpperCase()?n.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()):n).join('. ').replace(/\s+/g,' ').trim();
 return {name:name.replace(/\s+/g,' '),note};
}
/** Parse a book-format Job into its tagline, Cultivations and starting loadout. */
export function jobParts(name,html){
 const text=plainText(html);
 const first=text.search(/\bVIO\s*(?:✦+|\d+)/i);
 if(first<0)return null;
 let tagline=text.slice(0,first).trim();
 if(name&&tagline.toLowerCase().startsWith(String(name).toLowerCase()))tagline=tagline.slice(String(name).length).trim();
 const cultivations={};
 for(const match of text.matchAll(STAT)){const key=match[1].toLowerCase();if(!(key in cultivations))cultivations[key]=/\d/.test(match[2])?Number(match[2]):match[2].length;}
 const statsEnd=[...text.matchAll(STAT)].pop();
 const tail=statsEnd?text.slice(statsEnd.index+statsEnd[0].length):'';
 const loadout=[];const marks=[...tail.matchAll(SLOT)];
 marks.forEach((mark,index)=>{
  const body=tail.slice(mark.index+mark[0].length,marks[index+1]?.index??tail.length);
  const label=mark[1]??'TRAIT';const entry=splitEntry(body);
  if(entry.name)loadout.push({...slotType(label),slot:label.toUpperCase().replace(/\s+/g,' '),...entry});
 });
 return {tagline,cultivations:CORES.every(key=>key in cultivations)?cultivations:null,loadout};
}
/** Description HTML for a Job: the tagline only, when the stored text is the raw book block. */
// With withLoadout, a Job that has no granted items keeps its starting loadout as a short list,
// so nothing is lost for Jobs whose items were never added to the Details tab.
export function jobDescription(name,html,{withLoadout=false}={}){
 if(!isRawJobText(html))return html;
 const parts=jobParts(name,html);
 if(!parts?.tagline)return html;
 const label=slot=>slot.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bR\b/,'Right').replace(/\bL\b/,'Left');
 const list=withLoadout&&parts.loadout.length
  ?`<p><strong>Starting loadout</strong></p><ul>${parts.loadout.map(e=>`<li>${escapeText(label(e.slot))}: ${escapeText(e.name)}${e.note?` (${escapeText(e.note)})`:''}</li>`).join('')}</ul>`:'';
 return `<p>${escapeText(parts.tagline)}</p>${list}`;
}
/** Description for an item granted by a Job whose description was copied from the whole Job block. */
export function grantDescription(jobName,jobHtml,itemName){
 const parts=jobParts(jobName,jobHtml);
 const entry=parts?.loadout.find(e=>e.name.toLowerCase()===String(itemName).toLowerCase())
  ??parts?.loadout.find(e=>e.name.toLowerCase().includes(String(itemName).toLowerCase())||String(itemName).toLowerCase().includes(e.name.toLowerCase()));
 const note=entry?.note?`${entry.note.replace(/\.$/,'')}.`:'';
 return `<p>${escapeText(note||`Starting item from the ${jobName} Job.`)}</p>`;
}
