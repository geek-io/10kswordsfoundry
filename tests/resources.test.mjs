import test from "node:test";
import assert from "node:assert/strict";
import { boundedResources, resourceLimits } from "../scripts/resources.mjs";
const base = () => ({ health: { value: 6, max: 6 }, armor: { value: 2, max: 2 }, ardor: { max: 4, burnt: 1, installed: 1 } });

test("remaining resources clamp to maximum and zero, without changing maximum", () => {
  const system = base();
  system.health.value = 99;
  system.armor.value = -3;
  const bounded = boundedResources(system, "system.health.value");
  assert.deepEqual(bounded.health, { value: 6, max: 6 });
  assert.deepEqual(bounded.armor, { value: 0, max: 2 });
  assert.equal(system.health.value, 99); // Does not mutate the Actor source.
});
test("lowering Health maximum also lowers remaining Health", () => {
  const system = base();
  system.health.max = 3;
  assert.deepEqual(boundedResources(system, "system.health.max").health, { max: 3, value: 3 });
});
test("Ardor allocations cannot exceed availability or change the other allocation", () => {
  for (const field of ["burnt", "installed"]) {
    const system = base();
    system.ardor[field] = 99;
    const result = boundedResources(system, `system.ardor.${field}`);
    assert.equal(result.ardor[field], 3);
    assert.equal(result.ardor[field === "burnt" ? "installed" : "burnt"], 1);
    assert.equal(result.ardor.max, 4);
  }
});
test("lowering maximum Ardor preserves spent and installed amounts", () => {
  const system = base();
  system.ardor.max = 0;
  assert.deepEqual(boundedResources(system, "system.ardor.max").ardor, { max: 2, burnt: 1, installed: 1 });
});
test("HTML limits reflect allocations and both resource maximums", () => {
  const limits = resourceLimits(base());
  assert.deepEqual(limits["system.health.value"], { min: 0, max: 6 });
  assert.deepEqual(limits["system.armor.value"], { min: 0, max: 2 });
  assert.deepEqual(limits["system.ardor.burnt"], { min: 0, max: 3 });
  assert.deepEqual(limits["system.ardor.installed"], { min: 0, max: 3 });
  assert.deepEqual(limits["system.ardor.max"], { min: 2 });
});
