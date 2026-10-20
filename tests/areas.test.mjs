import test from 'node:test';
import assert from 'node:assert/strict';
import {abilityArea,areaShape,areaTargets,placeAbilityArea} from '../scripts/areas.mjs';
test('book burst radius, triangular blast and 1m line geometry',()=>{
 assert.deepEqual(areaShape('circle',1,100),{type:'circle',x:0,y:0,radius:100});
 assert.deepEqual(areaShape('cone',7,100).points,[0,0,700,-350,700,350]);
 assert.deepEqual(areaShape('ray',3,50).points,[0,-25,150,-25,150,25,0,25]);
 assert.throws(()=>areaShape('circle',0,100));
 assert.throws(()=>areaShape('unknown',1,100));
});
test('existing descriptions supply Scathe, reversed burst wording and Technick cone defaults',()=>{
 assert.deepEqual(abilityArea({description:'<p>Summon a 1m burst thermonuclear explosion within 6m.</p>'}),{shape:'circle',size:1,range:6});
 assert.deepEqual(abilityArea({description:'Burst 2m within 12m.'}),{shape:'circle',size:2,range:12});
 assert.deepEqual(abilityArea({description:'a vicious 7m blast cone from her.'}),{shape:'cone',size:7,range:1});
 assert.deepEqual(abilityArea({description:'1m burst within 6m',areaShape:'ray',areaSize:4,areaRange:8}),{shape:'ray',size:4,range:8});
 assert.equal(abilityArea({description:'Strike with a sword.'}).shape,'none');
});
test('area selects allies and enemies but not unseen, actorless, other-level or outside tokens',()=>{
 globalThis.game={user:{isGM:false}};
 const token=(id,x,extra={})=>({id,actor:{},center:{x,y:0},document:{hidden:false,level:'floor',elevation:0},...extra});
 const tokens=[token('ally',0),token('enemy',1),token('outside',20),token('hidden',0,{isVisible:false}),token('prop',0,{actor:null}),token('upstairs',0,{document:{level:'upstairs'}})];
 assert.deepEqual(areaTargets({testPoint:p=>p.x<=1},tokens,'floor'),['ally','enemy']);
});
test('native placement cancels cleanly, limits range and restores sheet; confirmation replaces targets',async()=>{
 const actor={uuid:'Actor.a'},source={id:'a',actor,center:{x:0,y:0},document:{level:'floor',elevation:0}};
 let selected=['old'],min=0,max=0,cancel=true,captured;
 globalThis.game={user:{isGM:false,color:'#ff0000',updateTokenTargets:ids=>selected=ids}};
 globalThis.ui={notifications:{info(){},warn(){}}};
 globalThis.canvas={ready:true,scene:{id:'scene'},level:{id:'floor'},dimensions:{distancePixels:100},tokens:{placeables:[source],setTargets:ids=>selected=ids},regions:{async placeRegion(data,options){
  captured=data;assert.equal(options.create,false);
  assert.equal(options.preConfirm({shape:{type:'circle',x:601,y:0}}),false);
  assert.equal(options.preConfirm({shape:{type:'circle',x:600,y:0}}),true);
  return cancel?null:{testPoint:()=>true,toObject:()=>data};
 }}};
 const args={actor,sheet:{async minimize(){min++;},async maximize(){max++;}},name:'Scathe',shape:'circle',size:1,range:6};
 assert.equal(await placeAbilityArea(args),null);assert.deepEqual(selected,['old']);
 cancel=false;const area=await placeAbilityArea(args);
 assert.deepEqual(selected,['a']);assert.deepEqual(area.targetIds,['a']);assert.equal(captured.shapes[0].radius,100);
 assert.equal(min,2);assert.equal(max,2);
 canvas.regions.placeRegion=async()=>{throw Error('placement failed');};
 await assert.rejects(placeAbilityArea(args),/placement failed/);assert.equal(max,3);
});
