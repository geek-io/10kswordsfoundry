import test from "node:test";
import assert from "node:assert/strict";
import { setWandererTokenDefault, preserveAndLinkWanderer } from "../scripts/token-linking.mjs";

test("new Wanderers link by default; NPCs and explicit choices are preserved", () => {
  const updates = [];
  const actor = {type:"wanderer",updateSource:data=>updates.push(data)};
  setWandererTokenDefault(actor, {type:"wanderer"});
  assert.deepEqual(updates, [{"prototypeToken.actorLink":true}]);
  setWandererTokenDefault({...actor,type:"npc"}, {});
  setWandererTokenDefault(actor, {prototypeToken:{actorLink:false}});
  assert.equal(updates.length,1);
});
const source = () => ({ _id:"old", name:"John", type:"wanderer", system:{health:{value:3,max:6}}, items:[{_id:"sword",name:"Sword"}], effects:[], prototypeToken:{actorLink:false}, ownership:{player:3},folder:null });
function fixture() {
  const calls=[];
  const original={...source(),system:{health:{value:6,max:6}},items:[{_id:"removed"}]};
  const actor={id:"old",toObject:()=>structuredClone(original),update:async(data,options)=>{calls.push(["actor",data,options]);return actor;}};
  const token={id:"token",actorLink:false,baseActor:actor,actor:{type:"wanderer",toObject:source},toObject:()=>({actorId:"old",actorLink:false}),
    parent:{getFlag:()=>null,setFlag:async(scope,key,data)=>calls.push(["backup",data])},update:async data=>calls.push(["token",data])};
  return {actor,token,calls};
}
test("sync preserves the original Actor ID and saves backup before replacing data",async()=>{
  const {token,actor,calls}=fixture();
  assert.equal(await preserveAndLinkWanderer(token),actor);
  assert.deepEqual(calls.map(c=>c[0]),["backup","actor","token"]);
  assert.equal(calls[0][1].actor.system.health.value,6);
  assert.equal(calls[1][1]._id,"old");
  assert.equal(calls[1][1].name,"John");
  assert.deepEqual(calls[1][1].items,[{_id:"sword",name:"Sword"}]);
  assert.equal(calls[1][1].system.health.value,3);
  assert.equal(calls[1][1].prototypeToken.actorLink,true);
  assert.deepEqual(calls[1][2],{diff:false,recursive:false});
  assert.deepEqual(calls[2][1],{actorLink:true});
});
test("backup failure stops all document changes",async()=>{
  const {token,calls}=fixture();token.parent.setFlag=async()=>{throw new Error("backup failed");};
  await assert.rejects(preserveAndLinkWanderer(token),/backup failed/);assert.equal(calls.length,0);
});
test("cancelled sidebar update leaves token unlinked",async()=>{
  const {token,actor,calls}=fixture();actor.update=async()=>undefined;
  await assert.rejects(preserveAndLinkWanderer(token),/cancelled/);assert.equal(calls.length,1);
});
test("link failure reports partial completion and retains backup",async()=>{
  const {token,calls}=fixture();token.update=async()=>{throw new Error("offline");};
  await assert.rejects(preserveAndLinkWanderer(token),/sidebar Wanderer was updated, but linking failed/);
  assert.deepEqual(calls.map(c=>c[0]),["backup","actor"]);
});
test("already linked tokens and NPCs are rejected",async()=>{
  for(const token of [{actorLink:true,actor:{type:"wanderer"}},{actorLink:false,actor:{type:"npc"}}]) await assert.rejects(preserveAndLinkWanderer(token),/unlinked Wanderer/);
});
