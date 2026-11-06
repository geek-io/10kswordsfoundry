import test from "node:test";
import assert from "node:assert/strict";

// Pure 2.1 Sword/Cut and Speed-order logic, plus the Combat class wrappers against stand-in base classes.
let rules = "2.1";
globalThis.game = {settings: {get: () => rules}};
const {normalizeSword21, swordState21, speedOrder21, interjectInitiative21, combatClass21, combatantClass21} = await import("../scripts/swords21.mjs");

test("A Sword defaults to 4 Cuts of 3 seconds and tracks Cuts up to its tip", () => {
  assert.deepEqual(normalizeSword21({anchor: "  The skyship crashes  "}), {anchor: "The skyship crashes", cuts: 4, cutLength: "3 seconds"});
  const state = swordState21({anchor: "Ritual", cuts: 4}, 2);
  assert.deepEqual(state.marks.map(mark => mark.state), ["done", "current", "upcoming", "upcoming"]);
  assert.equal(state.marks[3].tip, true);
  assert.equal(state.remaining, 2);
  assert.equal(swordState21({cuts: 4}, 4).atTip, true);
  assert.equal(swordState21({cuts: 4}, 5).ended, true);
  assert.equal(swordState21(null, 1), null);
});

test("Lowest Speed declares first; combatants without Speed go last", () => {
  const order = [{id: "k", name: "Kurasak", initiative: 12}, {id: "r", name: "Raura", initiative: 6}, {id: "x", name: "Unrolled", initiative: null},
    {id: "s", name: "Stone Lion", initiative: 8}, {id: "y", name: "Yuyan", initiative: 11}].sort(speedOrder21).map(entry => entry.name);
  assert.deepEqual(order, ["Raura", "Stone Lion", "Yuyan", "Kurasak", "Unrolled"]);
});

test("A faster combatant interjects directly before the current actor", () => {
  const turns = [{id: "r", name: "Raura", initiative: 6}, {id: "s", name: "Stone Lion", initiative: 8}, {id: "y", name: "Yuyan", initiative: 11}, {id: "k", name: "Kurasak", initiative: 12}];
  const value = interjectInitiative21(turns, 1, "y", 11);
  assert.ok(value > 6 && value < 8);
  const resorted = turns.map(entry => entry.id === "y" ? {...entry, initiative: value} : entry).sort(speedOrder21).map(entry => entry.id);
  assert.deepEqual(resorted, ["r", "y", "s", "k"]);
  assert.equal(interjectInitiative21(turns, 0, "s", 8), 5.5);
  assert.throws(() => interjectInitiative21(turns, 2, "r", 6), /already acted/);
  assert.throws(() => interjectInitiative21(turns, 1, "s", 8), /already this combatant/);
  assert.throws(() => interjectInitiative21([{id: "a", initiative: 9}, {id: "b", name: "B", initiative: 9}], 0, "b", 9), /higher Speed/);
});

test("Combat classes use Speed only under 2.1 and leave 2.0.3 untouched", () => {
  class BaseCombat { _sortCombatants(a, b) { return b.initiative - a.initiative; } }
  class BaseCombatant { _getInitiativeFormula() { return "1d20"; } }
  const Combat = combatClass21(BaseCombat), Combatant = combatantClass21(BaseCombatant);
  const sort = new Combat()._sortCombatants;
  const slow = {id: "a", initiative: 3}, fast = {id: "b", initiative: 9};
  const combatant = Object.assign(new Combatant(), {actor: {system: {r21: {speed: 7}}}});
  rules = "2.1";
  assert.ok(sort(slow, fast) < 0);
  assert.equal(combatant._getInitiativeFormula(), "7");
  rules = "2.0";
  assert.ok(sort(slow, fast) > 0);
  assert.equal(combatant._getInitiativeFormula(), "1d20");
});
