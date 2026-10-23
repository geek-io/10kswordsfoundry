import test from 'node:test';
import assert from 'node:assert/strict';
import {manualWorldBeing,rememberManual,createManualWorldBeing} from '../scripts/worldbeing-manual.mjs';
test('manual World Being preserves entered stats and starts with full resources',()=>{
 const a=manualWorldBeing({name:'  Ash, The Hunter ',health:'9',armor:'2',ardor:'5',movement:'8',sidhi:'3',mag:'100',vio:'4',dia:'2',grc:'3',sav:'1',wrd:'0',spi:'2'});
 assert.equal(a.type,'npc');assert.equal(a.name,'Ash, The Hunter');assert.deepEqual(a.system.health,{max:9,value:9});assert.deepEqual(a.system.ardor,{max:5,burnt:0,installed:0});assert.equal(a.system.cultivations.wrd,0);assert.equal(a.system.movement,8);
 for(const draft of [{name:''},{name:'A',health:'0'},{name:'A',sidhi:'7'},{name:'A',vio:'1.5'},{name:'A',armor:'-1'},{name:'A',ardor:''}])assert.throws(()=>manualWorldBeing(draft));
});
test('manual creation keeps failed drafts and resets only after successful creation',async()=>{
 let fail=true,created,opened=false;const app={manualDraft:{name:'Ash',health:'9'},element:{querySelectorAll:()=>[]},render:async()=>{}};
 globalThis.game={user:{isGM:true},folders:{get:()=>null}};globalThis.ui={notifications:{error:()=>{},info:()=>{}}};
 globalThis.CONFIG={Actor:{dataModels:{npc:class{constructor(s){this.s=s;}toObject(){return this.s;}}}}};
 globalThis.foundry={utils:{getDocumentClass:()=>({createDocuments:async data=>{if(fail)throw Error('Failed');created=data[0];return [{name:'Ash',sheet:{render:()=>{opened=true;}}}];}})}};
 await createManualWorldBeing.call(app);assert.equal(app.manualDraft.name,'Ash');assert.equal(app.busy,false);
 fail=false;await createManualWorldBeing.call(app);assert.equal(created.system.health.max,9);assert.equal(opened,true);assert.deepEqual(app.manualDraft,{folder:''});
 app.element.querySelectorAll=()=>[{name:'manual.vio',value:'5'}];rememberManual(app);assert.equal(app.manualDraft.vio,'5');
});
