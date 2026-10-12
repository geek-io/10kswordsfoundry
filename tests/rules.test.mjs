import test from "node:test";
import assert from "node:assert/strict";
import { checkFormula, summarizeCheck } from "../scripts/rules.mjs";
test("positive pools and nonpositive fallback (p.25)", () => {
  assert.equal(checkFormula(5), "5d6cs>=4");
  assert.equal(checkFormula(0), "2d6kl1cs>=4");
  assert.equal(checkFormula(-8), "2d6kl1cs>=4");
  assert.throws(() => checkFormula(1.5));
});
test("4–6 count as Strikes; meeting Demand succeeds", () => {
  assert.deepEqual(summarizeCheck([1,2,3,4,5,6],3), {strikes:3,sixes:1,success:true});
  assert.equal(summarizeCheck([4,5,6],4).success,false);
});
test("fallback has one retained die, never two Strikes", () => {
  for(let a=1;a<=6;a++) for(let b=1;b<=6;b++) {
    const r=summarizeCheck([Math.min(a,b)],2);
    assert.equal(r.success,false);
    assert.equal(r.strikes,a>=4 && b>=4 ? 1 : 0);
  }
});
test("malformed results and Demands are rejected", () => {
  for(const values of [[],[0],[7],[1.5]]) assert.throws(()=>summarizeCheck(values,2));
  for(const demand of [0,-1,1.5,NaN]) assert.throws(()=>summarizeCheck([6],demand));
});
