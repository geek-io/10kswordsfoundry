import {isRawJobText,jobDescription,grantDescription} from './job-text.mjs?v=0.2.14';
const SYSTEM='10kswordsfoundry',VERSION=1;
// Job descriptions copied from the book block repeated the Cultivations and loadout already shown on the
// Details tab, and every granted item carried the whole Job text. Tidy existing world and character copies once.
function jobPatch(job){
 const raw=job.system.description;
 const patch={};
 if(isRawJobText(raw))patch['system.description']=jobDescription(job.name,raw,{withLoadout:!(job.system.grants??[]).length});
 const grants=(job.system.grants??[]);
 if(grants.some(grant=>isRawJobText(grant.system?.description))){
  patch['system.grants']=grants.map(grant=>isRawJobText(grant.system?.description)
   ?{...grant,system:{...grant.system,description:grantDescription(job.name,isRawJobText(raw)?raw:grant.system.description,grant.name)}}:grant);
 }
 return Object.keys(patch).length?{_id:job.id,...patch}:null;
}
export function actorJobPatches(actor){
 const jobs=actor.items.filter(item=>item.type==='job');
 const updates=jobs.map(jobPatch).filter(Boolean);
 for(const item of actor.items){
  if(item.type==='job'||!isRawJobText(item.system?.description))continue;
  const grantId=item.flags?.[SYSTEM]?.jobGrantId;
  const job=jobs.find(j=>(j.system.grants??[]).some(g=>g.id===grantId))??jobs.find(j=>isRawJobText(j.system.description))??jobs[0];
  if(!job)continue;
  const source=isRawJobText(job.system.description)?job.system.description:item.system.description;
  updates.push({_id:item.id,'system.description':grantDescription(job.name,source,item.name)});
 }
 return updates;
}
export async function repairJobText(){
 if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
 if((game.settings.get(SYSTEM,'jobTextVersion')??0)>=VERSION)return;
 let count=0;
 const worldJobs=game.items.filter(item=>item.type==='job').map(jobPatch).filter(Boolean);
 if(worldJobs.length){await foundry.documents.Item.updateDocuments(worldJobs);count+=worldJobs.length;}
 for(const actor of game.actors){
  const updates=actorJobPatches(actor);
  if(updates.length){await actor.updateEmbeddedDocuments('Item',updates);count+=updates.length;}
 }
 await game.settings.set(SYSTEM,'jobTextVersion',VERSION);
 if(count)ui.notifications.info(`Tidied ${count} Job and starting-item description(s): Cultivations and the loadout now stay on the Job's Details tab.`);
}
