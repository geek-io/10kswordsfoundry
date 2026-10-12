import test from 'node:test';
import assert from 'node:assert/strict';
class CoreEffect {get isSuppressed(){return this.expired??false;}}
class CoreActor {prepareDerivedData(){}}
globalThis.foundry={documents:{ActiveEffect:CoreEffect,Actor:CoreActor}};
const {SwordsActor,SwordsActiveEffect}=await import('../scripts/documents.mjs');
test('transferred effects honor disabled equipment and core expiry suppression',()=>{
  const effect=new SwordsActiveEffect();effect.transfer=true;effect.parent={documentName:'Item',type:'fashion',system:{equipped:false}};
  assert.equal(effect.isSuppressed,true);
  effect.parent.system.equipped=true;assert.equal(effect.isSuppressed,false);
  effect.expired=true;assert.equal(effect.isSuppressed,true);
  effect.expired=false;effect.transfer=false;effect.parent.system.equipped=false;assert.equal(effect.isSuppressed,false);
});
test('equipped Great/Colossal movement penalties are derived without changing item source',()=>{
  const actor=new SwordsActor();actor.system={movement:6,health:{value:6,max:6}};
  actor.items={contents:[{type:'weapon',system:{equipped:true,properties:{colossal:true}}},{type:'weapon',system:{equipped:false,properties:{great:true}}}]};
  actor.prepareDerivedData();assert.equal(actor.system.movement,4);
});

test('removing bonus maximum clamps prepared Health without writing the saved base maximum',()=>{
 const actor=new SwordsActor();actor.system={movement:6,health:{value:8,max:6}};actor.items={contents:[]};
 actor.prepareDerivedData();assert.equal(actor.system.health.value,6);assert.equal(actor.system.health.max,6);
});
