import test from 'node:test';
import assert from 'node:assert/strict';
import {animationContext,playItemAnimation,registerAnimations} from '../scripts/animations.mjs';
function setup(){
 const actor={uuid:'Actor.one'},token={actor},target={actor:{uuid:'Actor.two'}},calls=[];
 globalThis.canvas={ready:true,scene:{id:'scene'},tokens:{placeables:[token,target]}};
 globalThis.game={user:{targets:new Set([target])},modules:new Map([['autoanimations',{active:true}]]),settings:{get:()=>true}};
 globalThis.AutomatedAnimations={playAnimation:async(...args)=>calls.push(args)};
 return {actor,token,target,calls};
}
test('AA receives the actual item, correct source, and snapshotted targets once',async()=>{
 const {actor,token,target,calls}=setup(),item={name:'Scathe',flags:{autoanimations:{custom:true}}};
 const context=animationContext(actor);game.user.targets.clear();
 assert.equal(await playItemAnimation(context,item,{whisper:[]}),true);
 assert.deepEqual(calls,[[token,item,{targets:[target],playOnMiss:false}]]);
 assert.ok(!('hitTargets' in calls[0][2]));
});
test('AA skips absent/disabled modules, private messages, missing API and changed scenes',async()=>{
 const {actor,calls}=setup(),context=animationContext(actor),item={name:'Sword'};
 for(const message of [null,{blind:true},{whisper:['gm']},{visible:false}])assert.equal(await playItemAnimation(context,item,message),false);
 game.modules.clear();assert.equal(await playItemAnimation(context,item,{}),false);
 game.modules.set('autoanimations',{active:true});game.settings.get=()=>false;assert.equal(await playItemAnimation(context,item,{}),false);
 game.settings.get=()=>true;const api=AutomatedAnimations;globalThis.AutomatedAnimations={};assert.equal(await playItemAnimation(context,item,{}),false);
 globalThis.AutomatedAnimations=api;canvas.scene.id='other';assert.equal(await playItemAnimation(context,item,{}),false);
 assert.equal(calls.length,0);
});
test('source selection handles synthetic actors and refuses ambiguous linked tokens',()=>{
 const {actor,token}=setup();canvas.tokens.placeables.push({actor});
 assert.equal(animationContext(actor),null);
 token.controlled=true;assert.equal(animationContext(actor).token,token);
 const synthetic={uuid:'Scene.scene.Token.unlinked.Actor.one'};
 const own={actor:synthetic};synthetic.token={object:own};canvas.tokens.placeables.push(own);
 assert.equal(animationContext(synthetic).token,own);
 canvas.ready=false;assert.equal(animationContext(actor),null);
});
test('playback errors are isolated and duplicate AA chat workflows are vetoed',async()=>{
 const {actor}=setup(),hooks={};let setting;
 game.settings.register=(...args)=>setting=args;
 globalThis.Hooks={on:(name,fn)=>hooks[name]=fn};registerAnimations();
 assert.equal(setting[2].default,true);
 const duplicate={workflow:{flags:{'10kswordsfoundry':{animationHandled:true}}}};
 hooks['AutomatedAnimations-WorkflowStart'](duplicate);assert.equal(duplicate.stopWorkflow,true);
 const direct={};hooks['AutomatedAnimations-WorkflowStart'](direct);assert.equal(direct.stopWorkflow,undefined);
 AutomatedAnimations.playAnimation=async()=>{throw Error('Animation failed');};
 const warn=console.warn;console.warn=()=>{};
 try{assert.equal(await playItemAnimation(animationContext(actor),{name:'Sword'},{}),false);}finally{console.warn=warn;}
});
