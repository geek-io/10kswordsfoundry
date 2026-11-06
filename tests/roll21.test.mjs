import test from "node:test";
import assert from "node:assert/strict";

// Exercises the 2.1 roll workflows against a minimal Foundry stand-in; not a live Foundry test.
const queue = [];
const messages = [];
class FakeRoll {
  constructor(formula) { this.formula = formula; }
  async evaluate() {
    const count = Number(/^(\d+)d6/.exec(this.formula)?.[1] ?? 0);
    const results = this.formula === "0" ? [] : (queue.shift() ?? Array(count).fill(4)).map(result => ({result, active: true}));
    this.dice = [{results}];
    return this;
  }
  async toMessage(data) { messages.push(data); return data; }
}
let formValues = {};
const form = () => ({elements: new Proxy({}, {get: (_, name) => name === "namedItem" ? key => field(key) : field(name)})});
const field = name => name in formValues ? {value: String(formValues[name]), checked: formValues[name] === true} : undefined;
globalThis.foundry = {
  dice: {Roll: FakeRoll},
  applications: {api: {DialogV2: {prompt: async ({ok}) => ok.callback(null, {form: form()}), confirm: async () => true}}},
  documents: {ChatMessage: {getSpeaker: () => ({alias: "Test"}), create: async data => { messages.push(data); return data; }}}
};
globalThis.game = {settings: {get: () => "public"}};
globalThis.ui = {notifications: {warn: () => {}, info: () => {}}};

const {derive21} = await import("../scripts/rules21.mjs");
const {rollCheck21, killTheBuddha, castMagick21, damagePart} = await import("../scripts/roll21.mjs");

function makeActor(items = []) {
  const source = {cores: {phy: 3, mot: 2, mnd: 1, wit: 2, voc: 1, spi: 2}, skills: {beastShrine: 2, handEye: 2, stillness: 1},
    esoteric: [{name: "Astromancy", value: 2, core: "spi"}], parts: Object.fromEntries(["rleg", "lleg", "rarm", "larm", "torso", "head"].map(key => [key, {damage: 0, hpBonus: 0, soakBase: 0, soakLost: 0}])),
    conditions21: {}, assets: [], morale: {value: 3}, casting: {itemId: "", charges: 0}, ardor: {max: 2, burnt: 0, installed: 0}, checkBonus: 0, attackBonus: 0, xp: 0};
  const actor = {type: "wanderer", name: "Test", isOwner: true, updates: [],
    items: {contents: items, get: id => items.find(item => item.id === id)},
    toObject: () => ({system: structuredClone(source)}),
    async update(changes) { this.updates.push(changes); for (const [key, value] of Object.entries(changes)) { const path = key.replace(/^system\./, "").split("."); let node = source; while (path.length > 1) node = node[path.shift()]; node[path[0]] = value; } this.refresh(); return true; },
    refresh() { this.system = {...structuredClone(source), get availableArdor() { return source.ardor.max - source.ardor.burnt - source.ardor.installed; }}; this.system.r21 = derive21(this.system, items); }};
  actor.refresh();
  return actor;
}

test("Core + Cultivation check counts Strikes against Demand", async () => {
  messages.length = 0; queue.push([6, 5, 1, 2, 4]);
  formValues = {core: "phy", skill: "beastShrine", demand: 2, adjustment: 0, fact: false};
  await rollCheck21(makeActor());
  assert.match(messages[0].flavor, /3 Strikes<\/strong> vs Demand 2 — Success/);
  assert.equal(messages[0].flags["10kswordsfoundry"].check21.success, true);
});

test("KILL THE BUDDHA reports Openings and Empty Hand damage", async () => {
  messages.length = 0; queue.push([6, 6, 5, 4, 2]);
  formValues = {weaponId: "", core: "phy", skill: "beastShrine", adjustment: 0, distance: "", mode: "shoot", shots: 1, demand: 1, ammoId: "", cover: 0, height: 0, unstable: 0, part: ""};
  await killTheBuddha(makeActor());
  const ktb = messages[0].flags["10kswordsfoundry"].ktb;
  assert.deepEqual([ktb.quick, ktb.solid, ktb.perfect, ktb.whiff, ktb.damage], [1, 2, 2, 0, 1], "6, 6, 5, 4, 2: 2–3 Quick, 4–5 Solid, 6 Perfect");
});

test("Full Auto adds Rate × 3 dice, rolls random Parts and requires AUTO", async () => {
  messages.length = 0;
  const rifle = {id: "w1", type: "weapon", name: "TD-7 Ruyi", system: {equipped: true, gearSlot: "both", ammo: {type: "", quantity: 0}, r21: {profile: "longgun", damage: 2, rate: 4, mods: {auto: true}}}};
  const actor = makeActor([rifle]);
  formValues = {weaponId: "w1", core: "mot", skill: "handEye", adjustment: 0, distance: 20, mode: "full", shots: 1, demand: 1, ammoId: "", cover: 0, height: 0, unstable: 0, part: ""};
  queue.push(Array(2 + 2 + 12 - 1).fill(4), [1, 6, 5]);
  await killTheBuddha(actor);
  assert.match(messages[0].flavor, /Full Auto \(\+12 dice\): \+12/);
  assert.match(messages[0].flavor, /Random hit locations/);
  rifle.system.r21.mods.auto = false;
  await assert.rejects(() => killTheBuddha(actor), /AUTO/);
});

test("Juggled and Stunned characters cannot KILL THE BUDDHA", async () => {
  const actor = makeActor();
  await actor.update({"system.conditions21.juggled": true});
  await assert.rejects(() => killTheBuddha(actor), /Juggled/);
  await actor.update({"system.conditions21.juggled": false, "system.conditions21.stunned": true});
  await assert.rejects(() => killTheBuddha(actor), /Stunned/);
});

test("Magick Charges accumulate, unleash at Potency and burn Ardor", async () => {
  messages.length = 0;
  const nail = {id: "m1", type: "magick", name: "Luminant Nail", system: {burnArdor: 1, r21: {potency: 3, core: "spi", skill: "Astromancy", bonus: 0}}};
  const actor = makeActor([nail]);
  formValues = {core: "spi", skill: "eso:0", adjustment: 0};
  queue.push([4, 5, 1, 2]);
  await castMagick21(actor, nail);
  assert.deepEqual(actor.toObject().system.casting, {itemId: "m1", charges: 2});
  queue.push([6, 1, 1, 1]);
  await castMagick21(actor, nail);
  assert.deepEqual(actor.toObject().system.casting, {itemId: "", charges: 0});
  assert.equal(actor.toObject().system.ardor.burnt, 1);
  assert.match(messages[1].flavor, /Unleashed/);
});

test("damage removes Soak before HP and reports a Disabled arm", async () => {
  messages.length = 0;
  const vest = {id: "f1", type: "fashion", name: "Vest", system: {equipped: true, r21: {coverage: {rarm: 2}, morale: 0}}};
  const actor = makeActor([vest]);
  formValues = {part: "rarm", amount: 8, crushing: false, ignoreSoak: false};
  await damagePart(actor, "rarm");
  const source = actor.toObject().system.parts.rarm;
  assert.deepEqual([source.damage, source.soakLost], [6, 2], "3 + Physique 3 HP");
  assert.match(messages[0].content, /Disabled/);
  assert.match(messages[0].content, /drop the weapon/);
});
