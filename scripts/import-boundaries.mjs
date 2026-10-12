// Conservative boundaries: labeled records, explicit separators, market headers,
// and the rulebook's uppercase ability titles. Ordinary prose is never a boundary.
export function splitBookText(text,chosenType='gear'){
 const lines=text.replaceAll('\r','').split('\n'),starts=new Set([0]);
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();
  if(/^---+$/.test(line)){lines[i]='';starts.add(i+1);continue;}
  if(/^name\s*:/i.test(line)||/^(?:[1-6]\s+)?[◼■▪]+\s*(?:[A-Z][A-Z -]*?\s+)?(?:COMMON|UNCOMMON|ENHANCED|RARE|DELUXE|PRESTIGE)\b/i.test(line)){starts.add(i);continue;}
  const title=line.replace(/\s*(?:Technick|Magick|Fashion|Gear|License|Trait|Job|Weapon)\s*$/i,'').trim();
  if(title!==line && title && !title.includes(':') && title===title.toUpperCase() && /[A-Z]/.test(title)){
   let start=i;
   // Multi-line titles end in the type label; take adjacent uppercase title lines.
   while(start>0){const prior=lines[start-1].trim();if(!prior||prior!==prior.toUpperCase()||/[.:✹✦❂◼■▪\[\]]/.test(prior)||/^(?:LICENSE|PREREQUISITES|SIDHI|\d+)\b/.test(prior))break;start--;}
   starts.add(start);
  }
 }
 if(chosenType==='trait'){
  const numbered=[];
  for(let i=0;i<lines.length;i++)if(/^(?:[1-6]\s*[1-6]\s+|(?:[3-9]|1[0-8])\s*[—–-]\s*)[A-Z][^\n]+/.test(lines[i].trim()))numbered.push(i);
  if(numbered.length){starts.clear();for(const i of numbered)starts.add(i);}
 }
 const offsets=[...starts].filter(i=>i<lines.length).sort((a,b)=>a-b);
 return offsets.map((start,i)=>lines.slice(start,offsets[i+1]??lines.length).join('\n').trim()).filter(block=>block&&!/^(?:\s*\d+\s*)+$/.test(block));
}
