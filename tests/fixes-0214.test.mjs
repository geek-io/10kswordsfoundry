import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {jobParts,jobDescription,grantDescription,isRawJobText} from "../scripts/job-text.mjs";
import {actorJobPatches} from "../scripts/job-repair.mjs";
import {saveChanges} from "../scripts/save-changes.mjs";
import {parseImport} from "../scripts/import-data.mjs";
import {registerArrowMovement} from "../scripts/arrow-move.mjs";

const BOOK='<p>Cryptomancer Become digital devils. VIO✦DIA✦✦✦GRC✦✦SAV✦✦✦✦WRD✦SPI✦✦ [R HAND] HaeCo Pistol (Keen Gun, 10 Bullets) [FASHION] Occultist Vesture (+1 Ardor. Can burn or install Health in place of Ardor. +1 SPI.) [TRAIT] Chills (When hidden threat lurks within [Level x 10]m, you feel it.)</p>';

test("book Job text splits into tagline, Cultivations and loadout", () => {
  const parts=jobParts("Cryptomancer",BOOK);
  assert.equal(parts.tagline,"Become digital devils.");
  assert.deepEqual(parts.cultivations,{vio:1,dia:3,grc:2,sav:4,wrd:1,spi:2});
  assert.deepEqual(parts.loadout.map(e=>[e.type,e.gearSlot,e.name]),[["weapon","right","HaeCo Pistol"],["fashion","fashion","Occultist Vesture"],["trait",undefined,"Chills"]]);
  assert.match(parts.loadout[2].note,/\[Level x 10\]m/);
  assert.equal(jobDescription("Cryptomancer",BOOK),"<p>Become digital devils.</p>");
  assert.match(jobDescription("Cryptomancer",BOOK,{withLoadout:true}),/Right Hand: HaeCo Pistol \(Keen Gun, 10 Bullets\)/);
  assert.equal(grantDescription("Cryptomancer",BOOK,"HaeCo Pistol"),"<p>Keen Gun, 10 Bullets.</p>");
  assert.equal(jobDescription("Scholar","<p>Educate and be educated.</p>"),"<p>Educate and be educated.</p>");
  assert.equal(isRawJobText("<p>Gain +1 to VIO Checks.</p>"),false);
});

test("Jobs compendium keeps only taglines; Cultivations and grants are unchanged", () => {
  const jobs=JSON.parse(readFileSync("data/jobs.json","utf8")).items;
  for(const job of jobs){
    assert.equal(isRawJobText(job.system.description),false,job.name);
    for(const grant of job.system.grants) assert.equal(isRawJobText(grant.system.description),false,`${job.name}: ${grant.name}`);
  }
  const crypto=jobs.find(j=>j.name==="Cryptomancer");
  assert.equal(crypto.system.description,"<p>Become digital devils.</p>");
  assert.deepEqual(crypto.system.cultivations,{vio:1,dia:3,grc:2,sav:4,wrd:1,spi:2});
  assert.equal(crypto.system.grants.length,3);
});

test("existing character Jobs and their granted items are tidied once", () => {
  const job={id:"job",type:"job",name:"Cryptomancer",system:{description:BOOK,grants:[{id:"g1",name:"HaeCo Pistol",type:"weapon",system:{description:BOOK}}]}};
  const pistol={id:"pistol",type:"weapon",name:"HaeCo Pistol",system:{description:BOOK},flags:{"10kswordsfoundry":{jobGrantId:"g1"}}};
  const kept={id:"kept",type:"trait",name:"Chills",system:{description:"<p>Cold rushes down your spine.</p>"},flags:{}};
  const updates=actorJobPatches({items:[job,pistol,kept]});
  assert.equal(updates.length,2);
  assert.equal(updates[0]["system.description"],"<p>Become digital devils.</p>");
  assert.equal(updates[0]["system.grants"][0].system.description,"<p>Keen Gun, 10 Bullets.</p>");
  assert.deepEqual(updates[1],{_id:"pistol","system.description":"<p>Keen Gun, 10 Bullets.</p>"});
  // A Job without granted items keeps its loadout as a list rather than losing it.
  const bare=actorJobPatches({items:[{...job,system:{description:BOOK,grants:[]}}]});
  assert.match(bare[0]["system.description"],/Starting loadout/);
});

test("book-format Job import fills Cultivations and keeps a tidy Description; labelled text is unchanged", () => {
  const [record]=parseImport("CRYPTOMANCER\nBecome digital devils.\nVIO✦DIA✦✦✦GRC✦✦SAV✦✦✦✦WRD✦SPI✦✦\n[R HAND] HaeCo Pistol (Keen Gun, 10 Bullets)\n[TRAIT] Chills (Feel it.)","text","job");
  assert.deepEqual(record.item.system.cultivations,{vio:1,dia:3,grc:2,sav:4,wrd:1,spi:2});
  assert.match(record.item.system.description,/^<p>Become digital devils\.<\/p><p><strong>Starting loadout/);
  assert.doesNotMatch(record.item.system.description,/VIO/);
});

test("a 0 AP, 0 Flame ability saves even though nothing changes", async () => {
  globalThis.foundry={utils:{deepClone:x=>structuredClone(x),isEmpty:o=>!Object.keys(o??{}).length}};
  let updates=0;
  const unchanged={updateSource:()=>({}),update:async()=>{updates++;return undefined;}};
  assert.equal(await saveChanges(unchanged,{"system.actions":0}),true);
  assert.equal(updates,0);
  const cancelled={updateSource:()=>({system:{actions:1}}),update:async()=>undefined};
  assert.equal(await saveChanges(cancelled,{"system.actions":1}),false);
  const saved={updateSource:()=>({system:{actions:1}}),update:async()=>({})};
  assert.equal(await saveChanges(saved,{"system.actions":1}),true);
  const abilities=readFileSync("scripts/abilities.mjs","utf8");
  assert.equal((abilities.match(/saveChanges\(actor,costs\)/g)||[]).length,2);
});

test("arrow keys move selected tokens and otherwise fall through to panning", async () => {
  const registered={};let moved=null;
  globalThis.CONST={KEYBINDING_PRECEDENCE:{PRIORITY:0},GRID_TYPES:{SQUARE:1},GRID_DIAGONALS:{ILLEGAL:4}};
  globalThis.game={keybindings:{register:(ns,name,config)=>{registered[`${ns}.${name}`]=config;}}};
  globalThis.ui={notifications:{warn(){}}};
  registerArrowMovement();
  assert.deepEqual(Object.keys(registered).sort(),["10kswordsfoundry.arrowMoveDown","10kswordsfoundry.arrowMoveLeft","10kswordsfoundry.arrowMoveRight","10kswordsfoundry.arrowMoveUp"]);
  assert.deepEqual(registered["10kswordsfoundry.arrowMoveRight"].editable,[{key:"ArrowRight"}]);
  globalThis.canvas={ready:true,grid:{type:1,diagonals:0},activeLayer:{options:{keyboardMovableObjects:true},controlled:[],moveMany:async args=>{moved=args;return [];}}};
  assert.equal(registered["10kswordsfoundry.arrowMoveRight"].onDown({isShift:false}),false); // nothing selected: pan
  canvas.activeLayer.controlled=[{}];
  assert.equal(registered["10kswordsfoundry.arrowMoveRight"].onDown({isShift:false}),true);
  await new Promise(resolve=>setTimeout(resolve,80));
  assert.deepEqual(moved,{dx:1,dy:0,rotate:false});
  registered["10kswordsfoundry.arrowMoveRight"].onUp({});
  // A key released before the delayed move still moves the token (busy frames can delay the timer).
  moved=null;
  registered["10kswordsfoundry.arrowMoveDown"].onDown({isShift:false});
  registered["10kswordsfoundry.arrowMoveDown"].onUp({});
  await new Promise(resolve=>setTimeout(resolve,160));
  assert.deepEqual(moved,{dx:0,dy:1,rotate:false});
});
