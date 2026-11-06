import test from "node:test";
import assert from "node:assert/strict";

// Exercises 2.1 targeting and chat damage application against a minimal Foundry stand-in; not a live Foundry test.
const queue = [];
const messages = [];
const prompts = [];
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
  applications: {api: {DialogV2: {prompt: async options => { prompts.push(options); return options.ok.callback(null, {form: form()}); }, confirm: async () => true}}},
  documents: {ChatMessage: {getSpeaker: () => ({alias: "Test"}), create: async data => { messages.push(data); return data; }}}
};
globalThis.game = {settings: {get: () => "public"}, user: {targets: new Set(), isGM: false}};
globalThis.ui = {notifications: {warn: () => {}, info: () => {}}};

const {derive21, targetReach, weaponProfile21} = await import("../scripts/rules21.mjs");
const {actingToken, measureTokens, collectTargets} = await import("../scripts/targeting21.mjs");
const {killTheBuddha, castMagick21: castMagick} = await import("../scripts/roll21.mjs");
const {chatTargets21, damageDefaults21, runChatAction21} = await import("../scripts/chat21.mjs");

function makeActor(name, items = []) {
  const source = {cores: {phy: 3, mot: 2, mnd: 1, wit: 2, voc: 1, spi: 2}, skills: {beastShrine: 2, handEye: 2}, esoteric: [],
    parts: Object.fromEntries(["rleg", "lleg", "rarm", "larm", "torso", "head"].map(key => [key, {damage: 0, hpBonus: 0, soakBase: 0, soakLost: 0}])),
    conditions21: {}, assets: [], morale: {value: 3}, casting: {itemId: "", charges: 0}, ardor: {max: 2, burnt: 0, installed: 0}, checkBonus: 0, attackBonus: 0};
  const actor = {type: "wanderer", name, uuid: `Actor.${name}`, isOwner: true,
    items: {contents: items, get: id => items.find(item => item.id === id)},
    toObject: () => ({system: structuredClone(source)}),
    async update(changes) { for (const [key, value] of Object.entries(changes)) { const path = key.replace(/^system\./, "").split("."); let node = source; while (path.length > 1) node = node[path.shift()]; node[path[0]] = value; } this.refresh(); return true; },
    refresh() { this.system = structuredClone(source); this.system.r21 = derive21(this.system, items); }};
  actor.refresh();
  return actor;
}
const makeToken = (actor, x, y, extra = {}) => ({actor, name: actor.name, center: {x, y}, document: {uuid: `Scene.s.Token.${actor.name}`, name: actor.name}, ...extra});

test("targetReach applies Firefight bands to ranged weapons and Reach to melee", () => {
  const sword = weaponProfile21({r21: {profile: "sword"}});
  assert.equal(targetReach(sword, 1).warning, "");
  assert.match(targetReach(sword, 3).warning, /beyond Reach/);
  const pistol = weaponProfile21({weaponType: "ranged", r21: {profile: "handgun"}});
  const far = targetReach(pistol, 45);
  assert.equal(far.penalty, -2 - (45 > pistol.range ? 4 : 0));
  assert.equal(targetReach(pistol, null).distance, null);
});

test("measureTokens prefers the grid path and falls back to straight-line distance", () => {
  const a = {center: {x: 0, y: 0}}, b = {center: {x: 300, y: 400}};
  assert.equal(measureTokens(a, b, {grid: {measurePath: () => ({distance: 7.04})}}), 7);
  assert.equal(measureTokens(a, b, {dimensions: {distancePixels: 100}}), 5);
  assert.equal(measureTokens(a, {}, {dimensions: {distancePixels: 100}}), null);
});

test("collectTargets skips the acting token and tokens without actors", () => {
  const me = makeActor("Me"), foe = makeActor("Foe");
  const mine = makeToken(me, 0, 0, {controlled: true}), theirs = makeToken(foe, 0, 200);
  assert.equal(actingToken(me, [mine, theirs]), mine);
  globalThis.canvas = {dimensions: {distancePixels: 100}};
  const targets = collectTargets(me, {source: mine, tokens: [mine, theirs, {actor: null}]});
  assert.deepEqual(targets, [{tokenUuid: "Scene.s.Token.Foe", actorUuid: "Actor.Foe", name: "Foe", distance: 2}]);
  delete globalThis.canvas;
});

test("KILL THE BUDDHA measures targets, warns beyond Reach and lists chat actions", async () => {
  messages.length = 0; prompts.length = 0; queue.push([6, 5, 4, 1, 1]);
  globalThis.canvas = {dimensions: {distancePixels: 100}};
  const me = makeActor("Me"), foe = makeActor("Foe");
  const mine = makeToken(me, 0, 0), theirs = makeToken(foe, 0, 300);
  formValues = {weaponId: "", core: "phy", skill: "beastShrine", adjustment: 0, distance: "3", mode: "shoot", shots: 1, demand: 1, ammoId: "", cover: 0, height: 0, unstable: 0, part: ""};
  await killTheBuddha(me, {source: mine, targets: [theirs]});
  delete globalThis.canvas;
  assert.match(prompts[0].content, /name="distance"[^>]*value="3"/);
  const ktb = messages[0].flags["10kswordsfoundry"].ktb;
  assert.equal(ktb.targets[0].name, "Foe");
  assert.match(ktb.targets[0].warning, /beyond Reach/);
  assert.equal(ktb.attackerToken, "Scene.s.Token.Me");
  assert.match(messages[0].flavor, /data-r21-action="respond" data-target="0"/);
  assert.match(messages[0].flavor, /data-r21-action="damage" data-target="0"/);
  assert.equal(chatTargets21({getFlag: (scope, key) => key === "ktb" ? ktb : undefined}).kind, "ktb");
});

test("Apply damage from the card prefills the weapon damage and called Part", async () => {
  messages.length = 0; prompts.length = 0;
  const foe = makeActor("Foe");
  const data = {damage: 3, part: "rarm", crushing: false, targets: [{tokenUuid: "t", actorUuid: "a", name: "Foe"}]};
  assert.deepEqual(damageDefaults21({damage: 0, randomKeys: ["torso"], randomParts: ["Torso"]}), {part: "torso", amount: 2, crushing: false, hint: "Random hit locations: Torso."});
  formValues = {part: "rarm", amount: 3, crushing: false, ignoreSoak: false};
  await runChatAction21(data, "damage", 0, {resolve: async uuid => uuid === "t" ? {actor: foe} : null});
  assert.match(prompts[0].content, /value="rarm" selected/);
  assert.match(prompts[0].content, /name="amount"[^>]*value="3"/);
  assert.equal(foe.toObject().system.parts.rarm.damage, 3);
  foe.isOwner = false;
  await assert.rejects(() => runChatAction21(data, "damage", 0, {resolve: async () => ({actor: foe}), isGM: false}), /GM or the owner/);
  await runChatAction21(data, "damage", 0, {resolve: async () => ({actor: foe}), isGM: true});
});

test("Respond rolls the defender's KILL THE BUDDHA aimed back at the attacker", async () => {
  messages.length = 0; prompts.length = 0;
  globalThis.canvas = {dimensions: {distancePixels: 100}};
  const me = makeActor("Me"), foe = makeActor("Foe");
  const mine = makeToken(me, 0, 0), theirs = makeToken(foe, 0, 100);
  formValues = {weaponId: "", core: "phy", skill: "beastShrine", adjustment: 0, distance: "", mode: "shoot", shots: 1, demand: 1, ammoId: "", cover: 0, height: 0, unstable: 0, part: ""};
  const data = {attackerToken: "attacker", targets: [{tokenUuid: "defender", actorUuid: "", name: "Foe"}]};
  await runChatAction21(data, "respond", 0, {resolve: async uuid => uuid === "attacker" ? {object: mine} : {actor: foe, object: theirs}});
  delete globalThis.canvas;
  const ktb = messages[0].flags["10kswordsfoundry"].ktb;
  assert.equal(ktb.targets[0].name, "Me");
  assert.equal(ktb.targets[0].distance, 1);
  await assert.rejects(() => runChatAction21(data, "damage", 5), /not on this card/);
});

test("An unleashed area Magick tries to place its area, then lists targets for damage", async () => {
  messages.length = 0; queue.push([6, 6, 5]);
  const warnings = [];
  globalThis.ui = {notifications: {warn: message => warnings.push(message), info: () => {}}};
  const foe = makeActor("Foe");
  const magick = {id: "m1", type: "magick", name: "Scathe", system: {burnArdor: 0, areaShape: "circle", areaSize: 3, description: "", r21: {potency: 2, core: "spi", skill: ""}}};
  const caster = makeActor("Caster", [magick]);
  caster.system.availableArdor = 2;
  game.user.targets = new Set([makeToken(foe, 0, 0)]);
  formValues = {core: "spi", skill: "", adjustment: 1};
  await castMagick(caster, magick);
  game.user.targets = new Set();
  assert.match(warnings[0], /Open a scene/);
  const cast = messages[0].flags["10kswordsfoundry"].cast21;
  assert.equal(cast.unleashed, true);
  assert.equal(cast.targets[0].name, "Foe");
  assert.doesNotMatch(messages[0].flavor, /data-r21-action="respond"/);
  assert.match(messages[0].flavor, /data-r21-action="damage"/);
});
