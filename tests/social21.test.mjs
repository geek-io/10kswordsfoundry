import test from "node:test";
import assert from "node:assert/strict";

// 2.1 Change God's Mind against a minimal Foundry stand-in; not a live Foundry test.
const queue = [];
const messages = [];
class FakeRoll {
  constructor(formula) { this.formula = formula; }
  async evaluate() {
    const count = Number(/^(\d+)d6/.exec(this.formula)?.[1] ?? 0);
    const results = this.formula === "0" ? [] : (queue.shift() ?? Array(count).fill(4)).map(result => ({result, active: true}));
    this.dice = [{results}];
    this.total = results.reduce((sum, entry) => sum + entry.result, 0);
    return this;
  }
  async toMessage(data) { const message = {...data, id: `m${messages.length}`, getFlag: (scope, key) => data.flags?.[scope]?.[key], isOwner: true, async setFlag(scope, key, value) { data.flags[scope][key] = value; }}; messages.push(message); return message; }
}
let formValues = {};
const field = name => name in formValues ? {value: String(formValues[name]), checked: formValues[name] === true} : undefined;
const form = () => ({elements: new Proxy({}, {get: (_, name) => name === "namedItem" ? key => field(key) : field(name)})});
const actors = {};
globalThis.foundry = {
  dice: {Roll: FakeRoll},
  applications: {api: {DialogV2: {prompt: async ({ok}) => ok.callback(null, {form: form()}), confirm: async () => true}}},
  documents: {ChatMessage: {getSpeaker: () => ({alias: "Test"}), create: async data => { messages.push(data); return data; }}}
};
globalThis.game = {settings: {get: () => "public"}, user: {targets: new Set(), isGM: false}, messages: {contents: messages}};
globalThis.ui = {notifications: {warn: () => {}, info: () => {}}};
globalThis.fromUuid = async uuid => actors[uuid] ?? null;

const {derive21} = await import("../scripts/rules21.mjs");
const rules = await import("../scripts/social-rules21.mjs");
const {changeGodsMind21, defend21, persist21, rollDisposition21} = await import("../scripts/social21.mjs");

function makeActor(name, {cores = {}, skills = {}, attachments = [], morale = 3} = {}) {
  const source = {cores: {phy: 2, mot: 1, mnd: 1, wit: 1, voc: 3, spi: 2, ...cores}, skills, esoteric: [], attachments, morale: {value: morale},
    parts: Object.fromEntries(["rleg", "lleg", "rarm", "larm", "torso", "head"].map(key => [key, {damage: 0, hpBonus: 0, soakBase: 0, soakLost: 0}])),
    conditions21: {}, assets: [], checkBonus: 0, disposition21: "neutral"};
  const actor = {name, uuid: `Actor.${name}`, isOwner: true, items: {contents: []}, toObject: () => ({system: structuredClone(source)}),
    async update(changes) { for (const [key, value] of Object.entries(changes)) { const path = key.replace(/^system\./, "").split("."); let node = source; while (path.length > 1) node = node[path.shift()]; node[path[0]] = value; } this.refresh(); return true; },
    refresh() { this.system = structuredClone(source); this.system.r21 = derive21(this.system, []); }};
  actor.refresh();
  actors[actor.uuid] = actor;
  return actor;
}

test("Leverage, Disposition, mobs and material shifts adjust the initiator's dice", () => {
  assert.deepEqual(rules.influenceModifiers21({purpose: "risk", leverage: 1}).parts, [{label: "No Firm Attachment to leverage", value: -3}]);
  assert.equal(rules.influenceModifiers21({purpose: "risk", leverage: 2}).total, 0);
  assert.equal(rules.influenceModifiers21({purpose: "implant"}).total, 0);
  assert.equal(rules.influenceModifiers21({purpose: "favor", leverage: 1, disposition: "hostile", mob: 2, materialShift: true, shaky: true, adjustment: 1}).total, -3 - 2 + 4 + 3 + 1);
  assert.deepEqual([2, 3, 5, 8, 9, 11, 12].map(rules.dispositionFromRoll21), ["violent", "hostile", "hostile", "neutral", "friendly", "friendly", "enthusiastic"]);
});

test("Social Defense uses the strongest Attachment; equal opposing and aligned ones cancel", () => {
  assert.equal(rules.socialDefense21(3, 0).value, 6);
  assert.equal(rules.socialDefense21(1, 2).value, -2);
  assert.equal(rules.socialDefense21(2, 2).value, 0);
  const roles = rules.attachmentRoles21([{strength: 1}, {strength: 3}, {strength: 2}], {0: "oppose", 1: "", 2: "align"});
  assert.deepEqual(roles, {opposing: 1, aligned: 2});
  assert.equal(rules.influenceSucceeds21(3, 3), false);
  assert.equal(rules.mobDefense21(7), 3);
  assert.deepEqual([rules.writtenDemand21(4), rules.writtenDemand21(4, false), rules.writtenDemand21(1, false)], [4, 2, 1]);
});

test("Persistence costs 1/2/3 Morale and, against an action, a fresh Attachment as strong as the leverage", () => {
  assert.deepEqual(rules.persistence21({purpose: "risk", leverage: 2, morale: 3, invoked: 2}), {allowed: true, cost: 2, reason: ""});
  assert.match(rules.persistence21({purpose: "risk", leverage: 2, morale: 3, invoked: 1}).reason, /Firm strength or better/);
  assert.match(rules.persistence21({purpose: "ruin", leverage: 3, morale: 2, invoked: 3}).reason, /Needs 3 Morale/);
  assert.equal(rules.persistence21({purpose: "heldToFirm", morale: 2}).allowed, true);
});

test("Change God's Mind rolls Face + approach, the target defends, and Persistence spends Morale", async () => {
  messages.length = 0;
  const asrajela = makeActor("Asrajela", {skills: {cultOfPersonality: 2}});
  const yeyra = makeActor("Yeyra", {skills: {stillness: 1}, attachments: [{text: "This sword is my mother's heirloom", strength: 3}, {text: "Asrajela is my soulmate", strength: 3}, {text: "I keep my word", strength: 2}]});
  game.user.targets = new Set([{actor: yeyra, name: "Yeyra", document: {uuid: ""}}]);
  formValues = {topic: "Board the starship", purpose: "risk", approach: "charisma", leverage: 2, disposition: "friendly", mob: 0, emotion: "", materialShift: false, shaky: false, adjustment: 0};
  queue.push([6, 5, 4, 4, 2, 1, 1]);
  await changeGodsMind21(asrajela);
  game.user.targets = new Set();
  const card = messages[0];
  assert.match(card.flavor, /Pool 7: FAC 3 \+ Cult of Personality 2/);
  assert.equal(card.flags["10kswordsfoundry"].cgm21.strikes, 4);
  assert.match(card.flavor, /data-cgm21="defend"/);

  formValues = {role0: "oppose", role1: "align", role2: "", opposeExtra: 0, alignExtra: 0, adjustment: 0};
  queue.push([5, 1, 1]);
  await defend21(card);
  const result = messages[1];
  assert.match(result.flavor, /Opposing and aligned Heart Attachments cancel/);
  assert.equal(result.flags["10kswordsfoundry"].cgm21result.success, true);
  assert.match(result.flavor, /Persistence \(spend 2 Morale\)/);
  await assert.rejects(() => defend21(card), /already been defended/);

  formValues = {pick: "2", strength: 0};
  await persist21(result);
  assert.equal(yeyra.toObject().system.morale.value, 1);
  assert.match(messages[2].content, /spending 2 Morale \(1 left\)/);
  await assert.rejects(() => persist21(result), /already been used/);
});

test("Threats use Physique, written influence sets a Demand, and Disposition rolls 2d6", async () => {
  messages.length = 0;
  const bully = makeActor("Bully", {skills: {beastShrine: 2}});
  formValues = {topic: "", purpose: "favor", approach: "threaten", leverage: 1, disposition: "neutral", mob: 0, emotion: "", materialShift: false, shaky: false, adjustment: 0};
  await changeGodsMind21(bully);
  assert.match(messages[0].flavor, /PHY 2 \+ Beast Shrine 2/);
  assert.match(messages[0].flavor, /negative Held Attachment/);
  formValues = {...formValues, approach: "written"};
  queue.push([4, 4, 5]);
  await changeGodsMind21(bully);
  assert.match(messages[1].flavor, /Demand 3 \(or 1 if no Attachment/);
  queue.push([5, 5]);
  await rollDisposition21(bully);
  assert.equal(bully.toObject().system.disposition21, "friendly");
});
