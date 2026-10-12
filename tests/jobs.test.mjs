import test from "node:test";
import assert from "node:assert/strict";
import { jobCultivations, applyJobToActor } from "../scripts/jobs.mjs";
const stats = n => Object.fromEntries(["vio","grc","dia","sav","wrd","spi"].map(k => [k,n]));
test("first Job replaces default ratings", () => {
  assert.deepEqual(jobCultivations(stats(1), undefined, undefined, stats(3)).cultivations, stats(3));
});
test("replacement preserves manual additions and reductions", () => {
  const current={...stats(2),vio:3,grc:1};
  const result=jobCultivations(current,stats(2),stats(0),stats(4));
  assert.equal(result.cultivations.vio,5);
  assert.equal(result.cultivations.grc,3);
  assert.equal(result.cultivations.spi,4);
});
test("repeated application does not stack Job values or manual additions", () => {
  const first=jobCultivations(stats(3),stats(2),stats(0),stats(4));
  const second=jobCultivations(first.cultivations,stats(4),first.adjustments,stats(4));
  assert.deepEqual(second,first);
});
test("zero floor does not erase negative manual adjustments", () => {
  const first=jobCultivations(stats(0),stats(3),stats(0),stats(1));
  assert.deepEqual(first.cultivations,stats(0));
  const second=jobCultivations(first.cultivations,stats(1),first.adjustments,stats(5));
  assert.deepEqual(second.cultivations,stats(2));
});
test("first Job retains edits relative to the original default of one", () => {
  assert.deepEqual(jobCultivations(stats(3),undefined,undefined,stats(4)).cultivations,stats(6));
});
test("invalid Job ratings are rejected", () => {
  for(const n of [-1,1.5,NaN]) assert.throws(()=>jobCultivations(stats(1),undefined,undefined,stats(n)));
});
globalThis.foundry={utils:{deepClone:structuredClone,randomID:()=>"new-job"}};
test("one Actor update replaces its Job and preserves other items and fields",async()=>{
  let state={name:"Wanderer",system:{cultivations:stats(3),jobBase:stats(2),jobAdjustments:stats(0),mag:99},items:[{_id:"job",type:"job"},{_id:"weapon",type:"weapon"}],effects:[{_id:"effect"}]};
  const calls=[];
  const actor={isOwner:true,toObject:()=>structuredClone(state),items:{get:id=>state.items.find(i=>i._id===id)},update:async(data,options)=>{calls.push(options);state=data;return actor;}};
  const job={name:"Scholar",type:"job",system:{category:"mind",cultivations:stats(4)}};
  await applyJobToActor(actor,job);
  assert.deepEqual(state.system.cultivations,stats(5));
  assert.equal(state.system.mag,99);
  assert.equal(state.items.length,2);
  assert.equal(state.items[1]._id,"job");
  assert.deepEqual(calls,[{diff:false,recursive:false}]);
  assert.equal(job._id,undefined);
  await applyJobToActor(actor,job);
  assert.deepEqual(state.system.cultivations,stats(5));
});
test("permission denial never writes an Actor",async()=>{
  await assert.rejects(applyJobToActor({isOwner:false},{type:"job"}),/cannot change/);
});
test('Job grants populate once, track Carry, preserve existing items, and retain manual stats',async()=>{
 let n=0;foundry.utils.randomID=()=>`new${++n}`;
 let state={system:{cultivations:stats(2),jobBase:stats(1),jobAdjustments:stats(0),carry:8,meridians:2},items:[{_id:'manual',type:'trait',system:{level:1}}]};
 const actor={type:'wanderer',isOwner:true,toObject:()=>structuredClone(state),items:{get:id=>state.items.find(i=>i._id===id)},update:async data=>{state=data;return actor;}};
 const job={name:'Scholar',type:'job',system:{cultivations:stats(3),grants:[{id:'g',name:'Starting Gear',type:'gear',system:{slots:2,quantity:1,equipped:true},effects:[]}]}};
 await applyJobToActor(actor,job);assert.equal(state.items.length,3);assert.equal(state.system.carry,6);assert.equal(state.system.cultivations.vio,4);assert.equal(state.items.at(-1).system.equipped,false);
 await applyJobToActor(actor,job);assert.equal(state.items.length,3);assert.equal(state.system.carry,6);assert.equal(state.items[0]._id,'manual');
});
