import test from "node:test";
import assert from "node:assert/strict";

// Exercises 2.1 Technick activation against a minimal Foundry stand-in; not a live Foundry test.
const queue = [];
const messages = [];
const prompts = [];
class FakeRoll {
  constructor(formula) { this.formula = formula; }
  async evaluate() {
    const count = Number(/^(\d+)d6/.exec(this.formula)?.[1] ?? 0);
    const results = (queue.shift() ?? Array(count).fill(4)).map(result => ({result, active: true}));
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
  applications: {api: {DialogV2: {prompt: async options => { prompts.push(options); return options.ok.callback(null, {form: form()}); }, confirm: async () => true}}},
  documents: {ChatMessage: {getSpeaker: () => ({alias: "Test"}), create: async data => { messages.push(data); return data; }}}
};
globalThis.game = {settings: {get: () => "public"}, user: {targets: new Set(), isGM: false}};
globalThis.ui = {notifications: {warn: () => {}, info: () => {}}};

const {derive21, bracketValues21, weaponRequirement21, technickInfo21, licenseMet21, abilityLimit21} = await import("../scripts/rules21.mjs");
const {activateTechnick21, releaseTechnick21, technickRows21} = await import("../scripts/technick21.mjs");
const {rollCheck21} = await import("../scripts/roll21.mjs");
const {chatTargets21} = await import("../scripts/chat21.mjs");

const sect21 = (cultivation, stars, needs, weaponRequirement = "") => ({"10kswordsfoundry": {sect21: {cultivation, stars, needs, weaponRequirement}}});
const technick = (id, name, {burn = 0, install = 0, cultivation = "Devil Tiger Blade", stars = 1, needs = "✹", weapon = "", description = ""} = {}) =>
  ({id, type: "technique", name, flags: sect21(cultivation, stars, needs, weapon), system: {burnArdor: burn, installArdor: install, paidArdor: 0, equipped: false, description}});

function makeActor(items = [], {esoteric = [{name: "Devil Tiger Blade", value: 2, core: "spi"}], ardor = {max: 4, burnt: 0, installed: 0}} = {}) {
  const source = {cores: {phy: 2, mot: 2, mnd: 1, wit: 2, voc: 3, spi: 2}, skills: {beastShrine: 3}, esoteric,
    parts: Object.fromEntries(["rleg", "lleg", "rarm", "larm", "torso", "head"].map(key => [key, {damage: 0, hpBonus: 0, soakBase: 0, soakLost: 0}])),
    conditions21: {}, assets: [], morale: {value: 3}, casting: {itemId: "", charges: 0}, ardor, scorch: 0, checkBonus: 0, attackBonus: 0, sidhiRealm: "desire"};
  const actor = {type: "wanderer", name: "Test", uuid: "Actor.test", isOwner: true,
    items: {contents: items, get: id => items.find(item => item.id === id)},
    toObject: () => ({system: structuredClone(source), items: items.map(item => ({_id: item.id, type: item.type, system: structuredClone(item.system)}))}),
    async update(changes) {
      for (const [key, value] of Object.entries(changes)) {
        if (key === "items") { for (const entry of value) { const item = items.find(i => i.id === entry._id); if (item) item.system = entry.system; } continue; }
        const path = key.replace(/^system\./, "").split("."); let node = source; while (path.length > 1) node = node[path.shift()]; node[path[0]] = value;
      }
      this.refresh(); return true;
    },
    refresh() { this.system = {...structuredClone(source), get availableArdor() { return source.ardor.max - source.ardor.burnt - source.ardor.installed; }}; this.system.r21 = derive21(this.system, items); }};
  actor.refresh();
  return actor;
}
const noArea = {shape: "none", size: 0, range: 0, ktb: false};

test("Sect bracket formulas evaluate against Cores and Esoteric Cultivations", () => {
  const system = {cores: {voc: 3}, skills: {}, esoteric: [{name: "Great Sage Style", value: 2}]};
  assert.deepEqual(bracketValues21("Leap [10 x Great Sage Style] meters; allies within [VOICE x 5]m; [FANG]; [5 + Killing Intent]; [1 + 2 x GREAT SAGE STYLE]", system),
    [{expr: "10 x Great Sage Style", value: 20}, {expr: "VOICE x 5", value: 15}, {expr: "1 + 2 x GREAT SAGE STYLE", value: 5}]);
});

test("Weapon requirements match equipped weapon profiles, mods and a free hand", () => {
  const saber = {r21: {profile: "saber"}}, rifle = {weaponType: "ranged", r21: {profile: "longgun", mods: {auto: true}}};
  assert.equal(weaponRequirement21("SWORDS or SABERS", [saber]).met, true);
  assert.equal(weaponRequirement21("POLEARM OR DAGGER", [saber]).met, false);
  assert.equal(weaponRequirement21("EMPTY HAND", [], {freeHand: false}).met, false);
  assert.equal(weaponRequirement21("[AUTO] weapon", [rifle]).met, true);
  assert.equal(weaponRequirement21("weapon that needs ammo", [saber]).met, false);
  assert.equal(weaponRequirement21("", []).met, true);
});

test("Technick info reads catalog flags or the License line; Licenses compare Stars", () => {
  const flagged = technick("a", "Devil Crucible", {burn: 1, stars: 2});
  assert.deepEqual([technickInfo21(flagged).cultivation, technickInfo21(flagged).stars, technickInfo21(flagged).burn], ["Devil Tiger Blade", 2, 1]);
  const plain = {type: "technique", system: {installArdor: 1, description: "<p><strong>License:</strong> Fire Lancing ✦✦✦</p>"}};
  assert.deepEqual([technickInfo21(plain).cultivation, technickInfo21(plain).stars, technickInfo21(plain).install], ["Fire Lancing", 3, 1]);
  const system = {esoteric: [{name: "Fire Lancing", value: 2}]};
  assert.deepEqual(licenseMet21(system, technickInfo21(plain)), {met: false, rating: 2});
  assert.equal(abilityLimit21("form"), 16);
});

test("Activating a ✹ Technick burns Ardor and posts its formulas and effect", async () => {
  messages.length = 0;
  const item = technick("t1", "Black Red Demon Thews", {burn: 2, description: "<p>KNOCKBACK up to [2 + DEVIL TIGER BLADE] meters.</p>"});
  const actor = makeActor([item]);
  formValues = noArea;
  await activateTechnick21(actor, item);
  assert.equal(actor.toObject().system.ardor.burnt, 2);
  assert.match(messages[0].content, /Burnt 2 ✹/);
  assert.match(messages[0].content, /\[2 \+ DEVIL TIGER BLADE\] = <strong>4<\/strong>/);
  assert.equal(messages[0].flags["10kswordsfoundry"].technick21.burn, 2);
});

test("Installing a ❂ Technick reserves Ardor until Release", async () => {
  messages.length = 0;
  const item = technick("t2", "Exude Killing Intent", {install: 1, needs: "❂"});
  const actor = makeActor([item]);
  formValues = noArea;
  await activateTechnick21(actor, item);
  assert.equal(actor.toObject().system.ardor.installed, 1);
  assert.deepEqual([item.system.paidArdor, item.system.equipped], [1, true]);
  assert.equal(technickRows21(actor)[0].installed, true);
  await assert.rejects(() => activateTechnick21(actor, item), /already installed/);
  await releaseTechnick21(actor, item);
  assert.equal(actor.toObject().system.ardor.installed, 0);
  assert.deepEqual([item.system.paidArdor, item.system.equipped], [0, false]);
  await assert.rejects(() => releaseTechnick21(actor, item), /not installed/);
});

test("Licenses, weapons, Ardor and Sidhi Deviation block activation", async () => {
  formValues = noArea;
  const high = technick("t3", "Titanic Coil Hurl", {burn: 1, stars: 3});
  await assert.rejects(() => activateTechnick21(makeActor([high]), high), /License: Devil Tiger Blade ✦✦✦ needed/);
  const sword = technick("t4", "Swordform", {burn: 1, weapon: "SWORDS or SABERS"});
  const unarmed = makeActor([sword]);
  assert.match(technickRows21(unarmed)[0].problem, /Needs SWORDS or SABERS/);
  await assert.rejects(() => activateTechnick21(unarmed, sword), /SWORDS or SABERS/);
  const costly = technick("t5", "Big", {burn: 5});
  const actor = makeActor([costly]);
  await actor.update({"system.conditions21.deviation": true});
  await assert.rejects(() => activateTechnick21(actor, costly), /Sidhi Deviation/);
});

test("Alpha p.52 Scorch: spending past 0 Flame goes negative, then a Deviation Check; releasing clears Scorch first", async () => {
  formValues = noArea; messages.length = 0;
  const costly = technick("t7", "Big", {burn: 5});
  const actor = makeActor([costly], {ardor: {max: 4, burnt: 0, installed: 0}});
  queue.push([1, 1, 1, 1], [3]); // Deviation Check fails (pool PHY 2 + Adamance 0 + Sidhi 0 → 2 dice); d6 = 3
  await activateTechnick21(actor, costly);
  assert.deepEqual([actor.toObject().system.ardor.burnt, actor.toObject().system.scorch], [4, 1]);
  assert.match(messages.at(-2).content, /1 into Scorch/);
  assert.match(messages.at(-1).flavor, /Deviation \(d6 = 3\): Heart Demon/);
  assert.equal(actor.system.r21.scorch, 1);
  const inst = technick("t8", "Hold", {install: 1, needs: "❂"});
  const held = makeActor([inst], {ardor: {max: 1, burnt: 1, installed: 0}});
  queue.push([4, 4, 4, 4]);
  await activateTechnick21(held, inst);
  assert.deepEqual([held.toObject().system.ardor.installed, held.toObject().system.scorch], [0, 1]);
  await releaseTechnick21(held, inst);
  assert.deepEqual([held.toObject().system.ardor.installed, held.toObject().system.scorch], [0, 0]);
});

test("Sidhi Deviation drops Cultivations to 1 in Checks", async () => {
  messages.length = 0; queue.push([4, 4, 4]);
  const actor = makeActor();
  await actor.update({"system.conditions21.deviation": true});
  formValues = {core: "phy", skill: "beastShrine", demand: 1, adjustment: 0, fact: false};
  await rollCheck21(actor);
  assert.match(messages[0].flavor, /Pool 3: PHY 2 \+ Beast Shrine \(Sidhi Deviation\) 1/);
});

test("Technick cards with targets get Apply damage buttons", async () => {
  messages.length = 0;
  const item = technick("t6", "Ballistic Meditation", {burn: 1});
  const actor = makeActor([item]);
  const foe = makeActor();
  game.user.targets = new Set([{actor: foe, name: "Foe", center: {x: 0, y: 0}, document: {uuid: "Scene.s.Token.Foe"}}]);
  formValues = noArea;
  await activateTechnick21(actor, item);
  game.user.targets = new Set();
  const flag = messages[0].flags["10kswordsfoundry"].technick21;
  assert.equal(chatTargets21({getFlag: (scope, key) => key === "technick21" ? flag : undefined}).kind, "technick");
  assert.match(messages[0].content, /data-r21-action="damage" data-target="0"/);
  assert.doesNotMatch(messages[0].content, /data-r21-action="respond"/);
});
