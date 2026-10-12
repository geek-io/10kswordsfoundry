import test from "node:test";
import assert from "node:assert/strict";
import {resolveDefense} from "../scripts/resolution.mjs";
const attack={results:[4,5,6,6],profile:{criticalExtra:1,fivePlusExtra:0,armorPerWound:1}};
test("ordinary defenses never cancel sixes, spare perfect defenses cancel ordinary strikes",()=>{
 assert.deepEqual(resolveDefense(attack,[4,5,4,5],0),{strikes:2,wounds:4,armorLoss:0,healthLoss:4});
 assert.deepEqual(resolveDefense(attack,[6,6,6,4],0),{strikes:0,wounds:0,armorLoss:0,healthLoss:0});
});
test("surviving critical bonuses, armor bypass and Crushing determine damage",()=>{
 assert.deepEqual(resolveDefense(attack,[6,4],2),{strikes:2,wounds:3,armorLoss:2,healthLoss:1});
 assert.equal(resolveDefense({...attack,profile:{...attack.profile,ignoresArmor:true}},[],10).healthLoss,6);
 assert.deepEqual(resolveDefense({results:[4,5],profile:{armorPerWound:2}},[],1),{strikes:2,wounds:2,armorLoss:1,healthLoss:1});
});
