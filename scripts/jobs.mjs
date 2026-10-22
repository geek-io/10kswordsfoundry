import { CULTIVATIONS } from "./rules.mjs?v=0.1.47";
import {grantedItems} from './job-grants.mjs?v=0.1.47';
import {reconcileCosts} from './equipment.mjs?v=0.1.47';
import {fashionResources} from './fashion.mjs?v=0.1.47';
import {refundInstallation} from './ability-state.mjs?v=0.1.47';

export function jobCultivations(current, previousBase, previousAdjustments, nextBase) {
  const cultivations = {}, adjustments = {};
  for (const key of Object.keys(CULTIVATIONS)) {
    const oldBase = previousBase?.[key] ?? 1;
    const oldAdjustment = previousAdjustments?.[key] ?? 0;
    const next = nextBase[key];
    if (!Number.isSafeInteger(next) || next < 0) throw new Error("Job Cultivations must be nonnegative whole numbers.");
    // Infer edits to the displayed total since the last Job application.
    // Retain negative adjustments even when a low Job base floors the total at zero.
    adjustments[key] = oldAdjustment + current[key] - Math.max(0, oldBase + oldAdjustment);
    cultivations[key] = Math.max(0, next + adjustments[key]);
  }
  return { cultivations, adjustments };
}

const pending = new WeakMap();
export function validateJobChoices(job){
 if(!job.flags?.['10kswordsfoundry']?.jobChoicesRequired)return;
 const ratings=Object.keys(CULTIVATIONS).map(k=>job.system.cultivations[k]).sort((a,b)=>a-b);
 const grants=job.system.grants??[];
 if(JSON.stringify(ratings)!=='[1,1,2,2,3,4]'||!grants.some(g=>g.type==='weapon')||!grants.some(g=>g.type==='trait')||!grants.some(g=>g.type==='fashion'&&['common','uncommon'].includes(g.system.rarity)))throw Error('Customize Wretched first: assign 4, 3, 2, 2, 1, 1 Cultivations and add your chosen weapon, Common/Uncommon Fashion, and Trait to its loadout. For a ranged weapon, roll and enter 6+d6 ammunition.');
}
export function applyJobToActor(actor, jobData, {origin}={}) {
  const prior = pending.get(actor) ?? Promise.resolve();
  const task = prior.catch(() => {}).then(async () => {
    if (!actor.isOwner) throw new Error("You cannot change this character's Job.");
    if (jobData.type !== "job") throw new Error("Expected a Job item.");
    validateJobChoices(jobData);
    const source = actor.toObject();
    const oldItems=structuredClone(source.items);
    const result = jobCultivations(source.system.cultivations, source.system.jobBase, source.system.jobAdjustments, jobData.system.cultivations);
    const existing = source.items.find(item => item.type === "job");
    const jobOrigin=origin??jobData.flags?.['10kswordsfoundry']?.jobOrigin??jobData._id??jobData.name;
    const nextIds=new Set((jobData.system.grants??[]).map(grant=>grant.id));
    const removed=source.items.filter(item=>{const f=item.flags?.['10kswordsfoundry'];return f?.jobGrantId&&(!nextIds.has(f.jobGrantId)||f.jobGrantOrigin!==jobOrigin);});
    for(const item of removed)refundInstallation(source.system,item);
    for(const item of removed)if(item.type==='fashion')Object.assign(source.system,fashionResources(source.system,item.system,null));
    source.items=source.items.filter(item=>!removed.includes(item));
    const job = foundry.utils.deepClone(jobData);
    job._id = existing?._id ?? foundry.utils.randomID();
    delete job.folder;
    job.flags??={};job.flags['10kswordsfoundry']={...job.flags['10kswordsfoundry'],jobOrigin};
    source.items = [...source.items.filter(item => item.type !== "job"), job];
    const grants=grantedItems(job.system.grants??[],actor.type,source.items,jobOrigin);
    source.items.push(...grants);
    if(grants.length||removed.length)reconcileCosts(source,oldItems,{allowOverage:true});
    Object.assign(source.system, {
      job: job.name,
      jobBase: { ...job.system.cultivations },
      jobAdjustments: result.adjustments,
      cultivations: result.cultivations
    });
    const updated = await actor.update(source, { diff: false, recursive: false });
    if (!updated) throw new Error("The Job change was not saved.");
    return actor.items.get(job._id);
  });
  pending.set(actor, task);
  return task.finally(() => { if (pending.get(actor) === task) pending.delete(actor); });
}
