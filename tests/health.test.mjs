import test from "node:test";
import assert from "node:assert/strict";
import {healthSutra} from "../scripts/health.mjs";
test("six Health levels reach Bloody at three, Critical at one, and KO at zero", () => {
  const expected=[["Knocked Out",0],["Critical",-3],["Bloody",-1],["Bloody",-1],["Hale",0],["Hale",0],["Hale",0]];
  for(let value=0;value<=6;value++) {
    const sutra=healthSutra({max:6,value});
    assert.deepEqual([sutra.status,sutra.penalty],expected[value]);
    assert.equal(sutra.boxes.filter(box=>box.wounded).length,6-value);
    assert.equal(sutra.knockedOut,value===0);
  }
});
test("extra Health adds Hale boxes without adding Bloody or Critical levels", () => {
  const sutra=healthSutra({max:8,value:8});
  assert.deepEqual(sutra.boxes.map(box=>box.label),["Hale","Hale","Hale","Hale","Hale","Bloody","Bloody","Critical"]);
  assert.equal(healthSutra({max:8,value:4}).penalty,0);
  assert.equal(healthSutra({max:8,value:3}).penalty,-1);
});
test("clicking selects the displayed level; third Hale stays at zero penalty", () => {
  const wounded=healthSutra({max:6,value:healthSutra({max:6,value:6}).boxes[3].value});
  assert.equal(wounded.value,3);
  assert.deepEqual(wounded.boxes.map(box=>box.wounded),[true,true,true,false,false,false]);
  const healed=healthSutra({max:6,value:wounded.boxes[2].value});
  assert.equal(healed.value,4);
  assert.equal(healed.penalty,0);
  assert.equal(healed.boxes[2].selected,true);
  assert.equal(healed.boxes[2].tone,"hale");
  assert.equal(healthSutra({max:0,value:0}).boxes.length,0);
});
