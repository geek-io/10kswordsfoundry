import test from "node:test";
import assert from "node:assert/strict";
import {attackCultivation,combatModifiers} from "../scripts/combat.mjs";
test("melee uses VIO, ranged uses GRC, and Affinity overrides the default",()=>{
 assert.equal(attackCultivation({weaponType:"melee"}),"vio");
 assert.equal(attackCultivation({weaponType:"ranged"}),"grc");
 assert.equal(attackCultivation({weaponType:"ranged",affinity:"Noetic"}),"dia");
});
test("page 73 bonuses and penalties stack, cleave charges each target",()=>{
 const result=combatModifiers({weaponType:"melee",range:1},{allies:2,targets:3,cover:true,concealed:true,called:-3,surprise:true,highGround:true,ultragravity:true,sabotaged:true,dual:true});
 assert.equal(result.bonus,-11);
 assert.equal(combatModifiers({},{targets:3,area:true}).bonus,0);
 assert.equal(combatModifiers({},{targets:1}).bonus,0);
});
test("elevation uses the larger distance, melee reach blocks and ranged distance applies one penalty",()=>{
 assert.throws(()=>combatModifiers({range:1},{distance:1,height:2}),/melee reach/);
 assert.equal(combatModifiers({range:1,properties:{reach:true}},{distance:1,height:2}).distance,2);
 assert.equal(combatModifiers({weaponType:"ranged",range:20},{distance:12,height:21}).bonus,-2);
 assert.equal(combatModifiers({weaponType:"ranged",range:20},{distance:1}).bonus,-2);
 assert.equal(combatModifiers({weaponType:"ranged",range:20},{distance:30,rangePenalty:false}).bonus,0);
 assert.equal(combatModifiers({weaponType:"ranged",range:20},{distance:20}).bonus,0);
 assert.throws(()=>combatModifiers({},{targets:0}),/Targets/);
 assert.throws(()=>combatModifiers({},{distance:-1}),/distance/);
});
