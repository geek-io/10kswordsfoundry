const acronyms=new Set(['AWW','HDF','SSA','UM','TTC','EXK','HW','TMNI','VIO','DIA','GRC','SAV','WRD','SPI','AP','MAG','II','III','IV','VI']);
export function titleCase(name){return String(name).trim().replace(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu,word=>acronyms.has(word.toUpperCase())?word.toUpperCase():word[0].toUpperCase()+word.slice(1).toLowerCase());}
export function paragraphText(value=''){
 const text=String(value).trim();
 if(/<\/?[a-z][\s\S]*>/i.test(text))return text.replace(/<br\s*\/?>(?:\s*)/gi,' ').replace(/\s*\n\s*/g,' ');
 return text.replace(/(\p{L})-\s*\n(?=\p{Ll})/gu,'$1').split(/\n\s*\n/).map(p=>p.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n\n');
}
