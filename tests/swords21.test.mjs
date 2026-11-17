import test from "node:test";
import assert from "node:assert/strict";

// Pure 2.1 Ticks logic (2.1 book pp.22-23, 117, 129), plus the Combat class wrappers against stand-in base classes.
let rules = "2.1";
globalThis.game = {settings: {get: () => rules}};
const {firstReady21, readyOrder21, parseGambit21, nextGambitReady21, actReady21, flashReady21, flurryStep21, flurryEndReady21, tickState21,
  combatClass21, combatantClass21} = await import("../scripts/swords21.mjs");

test("First READY is d6 + Speed, counted from the live Tick for late arrivals", () => {
  assert.equal(firstReady21(1, 3), 4);
  assert.equal(firstReady21(6, 6), 12);
  assert.equal(firstReady21(2, 4, 5), 11);
});

test("Earliest READY sorts first; ties stay stable; combatants without a READY go last", () => {
  const order = [{id: "k", name: "Kurasak", initiative: 3}, {id: "r", name: "Raura", initiative: 6}, {id: "x", name: "Unrolled", initiative: null},
    {id: "s", name: "Stone Lion", initiative: 6}, {id: "y", name: "Yuyan", initiative: 5}].sort(readyOrder21).map(entry => entry.name);
  assert.deepEqual(order, ["Kurasak", "Yuyan", "Raura", "Stone Lion", "Unrolled"]);
});

test("After an Act the next READY is Tick + Recovery; a Dash adds 1 (book example: Kurasak, Raura)", () => {
  assert.equal(actReady21({tick: 3, recovery: 3, dash: true}), 7);
  assert.equal(actReady21({tick: 6, recovery: 5}), 11);
  assert.equal(actReady21({tick: 6, recovery: 0}), 7, "a READY always advances");
});

test("Gambits plot READY Ticks instead of Recovery", () => {
  assert.deepEqual(parseGambit21("[6... 15... 24... 33... 40... 49...]"), [6, 15, 24, 33, 40, 49]);
  assert.deepEqual(parseGambit21("15, 6, 6, x"), [6, 15]);
  assert.equal(nextGambitReady21([6, 15, 24], 6), 15);
  assert.equal(nextGambitReady21([6, 15, 24], 24), null);
  assert.equal(actReady21({tick: 6, recovery: 4, gambit: [6, 15, 24]}), 15);
  assert.equal(actReady21({tick: 24, recovery: 4, gambit: [6, 15, 24]}), 28, "falls back to Recovery once the list runs out");
});

test("Flash acts now during Recovery and never brings the next READY forward", () => {
  assert.equal(flashReady21({tick: 5, ready: 6, recovery: 4}), 9);
  assert.equal(flashReady21({tick: 5, ready: 12, recovery: 4}), 12);
  assert.throws(() => flashReady21({tick: 6, ready: 6, recovery: 4}), /READY now/);
  assert.throws(() => flashReady21({tick: 6, ready: null, recovery: 4}), /first READY/);
});

test("Flurry: no Recovery while it lasts, then Recovery + 2 per continuation (book: Speed 4, 3 Flurries, Tick 6 -> 16)", () => {
  let state = flurryStep21({}, {tick: 6, ready: 6, motorics: 3});
  assert.deepEqual(state, {count: 1, from: 6, early: false, base: 6, ready: 7});
  state = flurryStep21(state, {tick: 7, ready: 7, motorics: 3});
  state = flurryStep21(state, {tick: 8, ready: 8, motorics: 3});
  assert.equal(state.count, 3);
  assert.equal(state.ready, 9);
  assert.equal(flurryEndReady21(state, {tick: 9, recovery: 4}), 16);
  assert.throws(() => flurryStep21(state, {tick: 9, ready: 9, motorics: 3}), /up to Motorics/);
});

test("A Flurry started before the flurrier's READY adds to that READY; an Act already taken this Tick does not count as early", () => {
  const early = flurryStep21({}, {tick: 6, ready: 10, motorics: 4});
  assert.deepEqual(early, {count: 1, from: 6, early: true, base: 10, ready: 7});
  assert.equal(flurryEndReady21(early, {tick: 7, recovery: 4}), 16);
  const acted = flurryStep21({}, {tick: 6, ready: 10, motorics: 4, acted: 6});
  assert.equal(acted.early, false);
  assert.equal(flurryEndReady21(acted, {tick: 7, recovery: 4}), 12);
});

test("Tick state lists who is READY, in Recovery, holding, and the next READY Tick", () => {
  const state = tickState21([{id: "k", name: "Kurasak", initiative: 7}, {id: "r", name: "Raura", initiative: 6}, {id: "s", name: "Stone Lion", initiative: 6},
    {id: "y", name: "Yuyan", initiative: 10, held: {kind: "anticipate"}}, {id: "x", name: "Unrolled", initiative: null}], 6);
  assert.deepEqual(state.ready.map(entry => entry.id), ["r", "s"]);
  assert.deepEqual(state.recovering.map(entry => entry.id), ["k", "y"]);
  assert.deepEqual(state.waiting.map(entry => entry.id), ["y"]);
  assert.deepEqual(state.unrolled.map(entry => entry.id), ["x"]);
  assert.equal(state.nextReady, 7);
  assert.equal(tickState21([], 3).nextReady, null);
});

test("Combat classes use Ticks only under 2.1 and leave 2.0.3 untouched", async () => {
  const calls = [];
  class BaseCombat {
    _sortCombatants(a, b) { return b.initiative - a.initiative; }
    async nextTurn() { calls.push("turn"); } async nextRound() { calls.push("round"); }
    async previousTurn() { calls.push("prevTurn"); } async previousRound() { calls.push("prevRound"); }
  }
  class BaseCombatant { _getInitiativeFormula() { return "1d20"; } }
  const Combat = combatClass21(BaseCombat), Combatant = combatantClass21(BaseCombatant);
  const combat = new Combat();
  const early = {id: "a", initiative: 3}, late = {id: "b", initiative: 9};
  const combatant = Object.assign(new Combatant(), {actor: {system: {r21: {ticks: {speed: 4, recovery: 6}}}}, combat: {round: 0}});
  rules = "2.1";
  assert.ok(combat._sortCombatants(early, late) < 0);
  assert.equal(combatant._getInitiativeFormula(), "1d6 + 4");
  combatant.combat = {round: 5};
  assert.equal(combatant._getInitiativeFormula(), "1d6 + 9");
  combatant.actor.system.r21.assets = [{key: "hummingbirdPulse", stars: 3}];
  assert.equal(combatant._getInitiativeFormula(), "2d6kl1 + 9", "Hummingbird Pulse: roll twice, keep the better (p.216)");
  combatant.actor.system.r21.assets = [];
  await combat.nextTurn(); await combat.previousTurn();
  rules = "2.0";
  assert.ok(combat._sortCombatants(early, late) > 0);
  assert.equal(combatant._getInitiativeFormula(), "1d20");
  await combat.nextTurn(); await combat.previousTurn();
  assert.deepEqual(calls, ["round", "prevRound", "turn", "prevTurn"]);
  rules = "2.1";
});
