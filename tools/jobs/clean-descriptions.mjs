// Keep only the tagline in Job descriptions (Cultivations and the loadout live on the Details tab)
// and give Job-granted items their own loadout note instead of the whole Job block.
// Usage: node tools/jobs/clean-descriptions.mjs   (rewrites data/jobs.json in place)
import {readFile,writeFile} from 'node:fs/promises';
import {jobDescription,grantDescription,isRawJobText} from '../../scripts/job-text.mjs';
const path='data/jobs.json';
const data=JSON.parse(await readFile(path,'utf8'));
let jobs=0,grants=0;
for(const job of data.items){
 const raw=job.system.description;
 if(isRawJobText(raw)){job.system.description=jobDescription(job.name,raw);jobs++;}
 for(const grant of job.system.grants??[]){
  if(isRawJobText(grant.system?.description)){grant.system.description=grantDescription(job.name,raw,grant.name);grants++;}
 }
}
await writeFile(path,JSON.stringify(data,null,2).replace(/\n/g,'\r\n')+'\r\n');
console.log(`Cleaned ${jobs} Job descriptions and ${grants} granted item descriptions.`);
