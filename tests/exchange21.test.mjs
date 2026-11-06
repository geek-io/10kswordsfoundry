import test from "node:test";
import assert from "node:assert/strict";

// 2.1 KILL THE BUDDHA exchange: Speed Tiers, Counters, fusion and Sidhi upgrades (pure state), plus card rendering.
globalThis.game = {settings: {get: () => "2.1"}};
const {newExchange21, addParticipant21, declare21, counter21, fuse21, sidhi21, advance21, landing21, applyOperation21} = await import("../scripts/exchange-state21.mjs");
const {rollFromMessage21, exchangeHTML21} = await import("../scripts/exchange21.mjs");

const asrajela = {key: "A", name: "Asrajela", quick: 1, solid: 1, perfect: 1, whiff: 2, damage: 2, weapon: "Feathersword"};
const yeyra = {key: "Y", name: "Yeyra", quick: 2, solid: 1, perfect: 0, whiff: 1, damage: 2, weapon: "Knife"};
const start = () => addParticipant21(addParticipant21(newExchange21(), asrajela), yeyra);

test("Openings act only in their own Speed Tier, and unused ones are lost when the tier passes", () => {
  let state = start();
  assert.throws(() => declare21(state, "A", "solid", {text: "Strike arm"}), /act in the Solid tier/);
  state = declare21(state, "Y", "quick", {text: "Slash torso", target: "A"});
  assert.equal(state.participants[1].open.quick, 1);
  state = advance21(state);
  assert.equal(state.tier, "solid");
  assert.equal(state.participants[1].open.quick, 0);
  assert.match(state.log.join(" "), /Yeyra lets 1 unused Opening/);
  state = advance21(advance21(state));
  assert.equal(state.tier, "done");
  assert.throws(() => advance21(state), /resolved/);
});

test("Counters need an equal or higher Opening and only reach the current tier", () => {
  let state = declare21(start(), "Y", "quick", {text: "Slash torso", target: "A"});
  state = counter21(state, "A", "quick", 1, {text: "Bat it aside"});
  assert.equal(state.declarations[0].countered, true);
  assert.equal(state.declarations[1].kind, "counter");
  assert.throws(() => counter21(state, "A", "solid", 1), /already been Countered/);
  assert.equal(landing21(state).length, 0);
  let solid = advance21(declare21(start(), "Y", "quick", {text: "Feint"}));
  solid = declare21(solid, "Y", "solid", {text: "Stab arm", target: "A"});
  assert.throws(() => counter21(solid, "Y", "solid", 2), /own maneuver/);
  assert.throws(() => counter21(solid, "A", "quick", 2), /Solid Opening or better/);
  assert.throws(() => counter21(solid, "A", "solid", 1), /current Strike Rank/);
});

test("Greater and Overwhelming Counters grant immediate bonus Openings, which can themselves be Countered", () => {
  let state = declare21(start(), "Y", "quick", {text: "Slash", target: "A"});
  state = counter21(state, "A", "solid", 1, {text: "Parry"});
  assert.equal(state.declarations[1].kind, "greater");
  assert.deepEqual(state.participants[0].bonus, {quick: 1, solid: 0});
  state = declare21(state, "A", "quick", {text: "Elbow torso", target: "Y", bonus: true});
  assert.equal(state.declarations[2].bonus, true);
  state = counter21(state, "Y", "quick", 3, {text: "Bat away the elbow"});
  assert.equal(state.declarations[2].countered, true);

  let over = declare21(start(), "Y", "quick", {text: "Grab clothing"});
  over = counter21(over, "A", "perfect", 1);
  assert.equal(over.declarations[1].kind, "overwhelming");
  assert.deepEqual(over.participants[0].bonus, {quick: 0, solid: 1});
  assert.equal(over.participants[0].open.perfect, 0);
  over = advance21(over);
  assert.deepEqual(over.participants[0].bonus, {quick: 0, solid: 0});
});

test("Fusion makes the next rank, at most one extra Perfect; Sidhi raises one Opening", () => {
  let state = start();
  assert.throws(() => fuse21(state, "A", "quick"), /two Quick/);
  state = fuse21(state, "Y", "quick");
  assert.deepEqual([state.participants[1].open.quick, state.participants[1].open.solid], [0, 2]);
  state = fuse21(state, "Y", "solid");
  assert.equal(state.participants[1].open.perfect, 1);
  const twice = addParticipant21(newExchange21(), {key: "Z", name: "Z", solid: 4});
  assert.throws(() => fuse21(fuse21(twice, "Z", "solid"), "Z", "solid"), /Only one extra Perfect/);
  state = sidhi21(state, "A", "whiff");
  assert.deepEqual([state.participants[0].open.whiff, state.participants[0].open.quick, state.participants[0].sidhiBurnt], [1, 2, 1]);
  const late = advance21(start());
  assert.throws(() => sidhi21(late, "A", "whiff"), /could no longer act/);
});

test("Joining late forfeits Openings of passed tiers; operations dispatch by name", () => {
  const state = applyOperation21(advance21(addParticipant21(newExchange21(), asrajela)), {type: "add", args: [yeyra]});
  assert.deepEqual(state.participants[1].open, {quick: 0, solid: 1, perfect: 0, whiff: 1});
  assert.match(state.log.at(-1), /losing 2 Quick/);
  assert.throws(() => applyOperation21(state, {type: "add", args: [yeyra]}), /already in/);
  assert.throws(() => applyOperation21(state, {type: "nope"}), /Unknown/);
});

test("A KILL THE BUDDHA card becomes a participant and the exchange renders its actions", () => {
  const message = {id: "m1", speaker: {alias: "Asrajela"}, getFlag: () => ({quick: 1, solid: 2, perfect: 0, whiff: 1, damage: 3, weapon: "Saber", attacker: "Actor.a", attackerToken: "Scene.s.Token.t", crushing: true})};
  const roll = rollFromMessage21(message);
  assert.deepEqual([roll.key, roll.name, roll.damage, roll.crushing], ["Actor.a", "Asrajela", 3, true]);
  assert.throws(() => rollFromMessage21({getFlag: () => undefined}), /not a KILL THE BUDDHA/);
  let state = declare21(start(), "Y", "quick", {text: "Slash <torso>", target: "A"});
  const html = exchangeHTML21(state);
  assert.match(html, /class="r21-tier current">Quick/);
  assert.match(html, /data-x21="counter" data-decl="1"/);
  assert.match(html, /data-x21="damage" data-decl="1"/);
  assert.match(html, /Slash &lt;torso&gt;/);
  assert.match(html, /Next: Solid tier \(GM\)/);
  state = advance21(advance21(advance21(state)));
  assert.doesNotMatch(exchangeHTML21(state), /data-x21="declare"/);
});
