import test from "node:test";
import assert from "node:assert/strict";

// 0.2.29: Firefight in the Strikes engine (2.1 pp.119-124), against a minimal Foundry stand-in; not a live Foundry test.
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
const field = name => name in formValues ? {value: String(formValues[name]), checked: formValues[name] === true} : undefined;
const form = () => ({elements: new Proxy({}, {get: (_, name) => name === "namedItem" ? key => field(key) : field(name)})});
globalThis.foundry = {
  dice: {Roll: FakeRoll},
  applications: {api: {DialogV2: {prompt: async ({ok}) => ok.callback(null, {form: form()}), confirm: async () => true}}},
  documents: {ChatMessage: {getSpeaker: () => ({alias: "Test"}), create: async data => { messages.push(data); return data; }}}
};
globalThis.game = {settings: {get: (scope, key) => key === "ktbEngine21" ? "strikes" : "public"}};
globalThis.ui = {notifications: {warn: () => {}, info: () => {}}};

const {derive21} = await import("../scripts/rules21.mjs");
const {killTheBuddha, resolveDefenseStrikes21} = await import("../scripts/roll21.mjs");

function makeActor(items = [], extra = {}) {
  const source = {cores: {phy: 3, mot: 2, mnd: 1, wit: 2, voc: 1, spi: 2}, skills: {beastShrine: 2, handEye: 2, stillness: 1, adamance: 1},
    esoteric: [], parts: Object.fromEntries(["rleg", "lleg", "rarm", "larm", "torso", "head"].map(key => [key, {damage: 0, hpBonus: 0, soakBase: 0, soakLost: 0}])),
    conditions21: {}, assets: [], morale: {value: 3}, casting: {itemId: "", charges: 0}, ardor: {max: 2, burnt: 0, installed: 0}, scorch: 0, sidhi: 0,
    checkBonus: 0, attackBonus: 0, xp: 0, ...extra};
  const actor = {type: "character", name: "Test", isOwner: true, updates: [],
    items: {contents: items, get: id => items.find(item => item.id === id)},
    toObject: () => ({system: structuredClone(source)}),
    async update(changes) { this.updates.push(changes); for (const [key, value] of Object.entries(changes)) { const path = key.replace(/^system\./, "").split("."); let node = source; while (path.length > 1) node = node[path.shift()]; node[path[0]] = value; } this.refresh(); return true; },
    refresh() { this.system = {...structuredClone(source), get availableArdor() { return source.ardor.max - source.ardor.burnt - source.ardor.installed; }}; this.system.r21 = derive21(this.system, items); }};
  actor.refresh();
  return actor;
}

const SYSTEM = "10kswordsfoundry";
const pistol = () => ({id: "g1", type: "weapon", name: "Pistol", system: {equipped: true, gearSlot: "right", ammo: {type: "", quantity: 0}, r21: {profile: "handgun", damage: 2, rate: 3, mods: {}}}});
const base = {weaponId: "g1", core: "mot", skill: "handEye", adjustment: 0, distance: "", mode: "shoot", shots: 1, demand: 1, ammoId: "", cover: "", aim: 0, height: 0, unstable: 0, part: ""};
const flag = message => message.flags[SYSTEM].ktbStrikes;

test("Aim adds dice up to Motorics; being above the target adds 1; Full Cover stops the attack", async () => {
  messages.length = 0;
  const actor = makeActor([pistol()]);
  formValues = {...base, aim: 5, height: 1};
  await killTheBuddha(actor);
  const card = messages.at(-1);
  assert.match(card.flavor, /Aim \(2 Ticks\): \+2/); // Motorics 2 caps the 5 Ticks entered
  assert.match(card.flavor, /Above the target: \+1/);
  assert.match(card.flavor, /Pool 7:/); // MOT 2 + Hand-Eye 2 + 2 + 1
  assert.equal(flag(card).ranged, true);
  formValues = {...base, cover: "full"};
  await assert.rejects(() => killTheBuddha(actor), /Full Cover/);
});

test("A shot beyond range goes wide on 1-4 and lands no Strikes", async () => {
  messages.length = 0;
  const actor = makeActor([pistol()]);
  formValues = {...base, distance: "45"};
  queue.push([6, 6, 5, 4], [3]);
  await killTheBuddha(actor);
  assert.match(messages.at(-1).flavor, /Out of range.*d6 = 3.*goes wide/s);
  assert.equal(flag(messages.at(-1)).strikes, 0);
  queue.push([6, 6, 5, 4], [5]);
  await killTheBuddha(actor);
  assert.match(messages.at(-1).flavor, /still on target/);
  assert.equal(flag(messages.at(-1)).strikes, 4);
  formValues = {...base, distance: "30"};
  queue.push([6, 6, 5, 4]);
  await killTheBuddha(actor);
  assert.doesNotMatch(messages.at(-1).flavor, /Out of range/);
});

test("Cover is rolled once for a non-AUTO ranged hit when the defender resolves; melee ignores it", async () => {
  messages.length = 0;
  const actor = makeActor([pistol()]), defender = makeActor([]);
  formValues = {...base, cover: "heavy"};
  queue.push([6, 6, 5, 4]);
  await killTheBuddha(actor);
  const data = flag(messages.at(-1));
  assert.equal(data.cover, "heavy");
  queue.push([1, 1, 1, 1], [4]); // the Dodge fails; cover d6 = 4 hits Heavy Cover
  await resolveDefenseStrikes21(data, "dodge", defender, null);
  assert.match(messages.at(-1).flavor, /Heavy Cover<\/strong> \(4-in-6.*hits the cover.*3 Body Parts cannot be hit/s);
  queue.push([1, 1, 1, 1], [5]);
  await resolveDefenseStrikes21(data, "dodge", defender, null);
  assert.match(messages.at(-1).flavor, /gets through/);
  queue.push([1, 1, 1, 1]);
  await resolveDefenseStrikes21({...data, ranged: false}, "dodge", defender, null);
  assert.doesNotMatch(messages.at(-1).flavor, /Heavy Cover/);
});

test("An Ambushed target, or one attacked while Casting Magick, rolls a halved pool", async () => {
  messages.length = 0;
  const actor = makeActor([pistol()]), defender = makeActor([]);
  formValues = {...base, ambush: true};
  queue.push([6, 6, 5, 4]);
  await killTheBuddha(actor);
  const data = flag(messages.at(-1));
  assert.equal(data.ambush, true);
  await resolveDefenseStrikes21(data, "block", defender, null); // Empty Hand Block: PHYS 3 + Beast Shrine 2 = 5 -> 2
  assert.match(messages.at(-1).flavor, /halved to 2<\/strong> \(Ambushed\)/);
  const caster = makeActor([], {casting: {itemId: "m1", charges: 2}});
  await resolveDefenseStrikes21({...data, ambush: false}, "block", caster, null);
  assert.match(messages.at(-1).flavor, /halved to 2<\/strong> \(attacked while Casting Magick\)/);
  await resolveDefenseStrikes21({...data, ambush: false}, "block", defender, null);
  assert.doesNotMatch(messages.at(-1).flavor, /halved/);
});

test("A lone target behind a Shield starts with Light Cover selected; UNBLOCKABLE refuses a Block", async () => {
  messages.length = 0;
  const shield = {id: "s1", type: "weapon", name: "Riot Shield", system: {equipped: true, gearSlot: "left", r21: {profile: "shield", mods: {}}}};
  const actor = makeActor([pistol()]), defender = makeActor([shield]);
  let content = "";
  const prompt = foundry.applications.api.DialogV2.prompt;
  foundry.applications.api.DialogV2.prompt = async options => { content = options.content; return prompt(options); };
  formValues = {...base, cover: "light"};
  queue.push([6, 6, 5, 4]);
  await killTheBuddha(actor, {targets: [{actor: defender, name: "Guard", document: {uuid: "Token.g"}}], source: null});
  foundry.applications.api.DialogV2.prompt = prompt;
  assert.match(content, /<option value="light" selected>/);
  await assert.rejects(() => resolveDefenseStrikes21({...flag(messages.at(-1)), unblockable: true}, "block", defender, null), /UNBLOCKABLE/);
});
