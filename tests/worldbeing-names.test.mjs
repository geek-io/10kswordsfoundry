import test from 'node:test';
import assert from 'node:assert/strict';
import {parseWorldBeings} from '../scripts/worldbeing-import.mjs';

test('World Being names preserve commas without splitting actors or item lists',()=>{
 const records=parseWorldBeings('ASURI, THE RED SWORD\nHEALTH 6\n[TRAITS] Rage, Dragon Eye\n\nHOUYI, HUNTER OF HEAVEN\nHEALTH 9\n[TRAITS] Mystical');
 assert.equal(records.length,2);
 assert.equal(records[0].actor.name,'Asuri, The Red Sword');
 assert.equal(records[1].actor.name,'Houyi, Hunter Of Heaven');
 assert.equal(records[0].actor.items.length,2);
 assert.equal(records[1].actor.system.health.max,9);
});

test('a missing second name cannot reuse the first World Being heading',()=>{
 assert.throws(()=>parseWorldBeings('ASURI, THE RED SWORD\nHEALTH 6\n\nHEALTH 9'),/name.*before HEALTH/);
});
