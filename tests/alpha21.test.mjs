import test from "node:test";
import assert from "node:assert/strict";

// 0.2.13: rules from the 2.1 Alpha and the playtest Sects, against a minimal Foundry stand-in; not a live Foundry test.
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
globalThis.game = {settings: {get: () => "public"}};
globalThis.ui = {notifications: {warn: () => {}, info: () => {}}};

const {derive21, namedRating21, bracketValues21, licenseMet21, sectCultivationNames21, stateModifiers, withoutPenalties, entersFlow,
  canSuppress, weaponProfile21, spendFlame21, recoverFlame21, deviationDemand21, deviationPool21, DEVIATIONS_21, selfFlame21, CONDITIONS_21,
  SECT_CULTIVATIONS_21} = await import("../scripts/rules21.mjs");
const {rollCheck21, killTheBuddha, castMagick21} = await import("../scripts/roll21.mjs");
const {licenseBarangWarning21} = await import("../scripts/assets21.mjs");
const {consumableRecovery21} = await import("../scripts/sheet21.mjs");

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

test("playtest Sects renamed every Sect Cultivation; the older names still license Technicks and fill formulas", () => {
  assert.equal(Object.keys(SECT_CULTIVATIONS_21).length, 16);
  assert.deepEqual(sectCultivationNames21("devil tiger blade"), ["Demon Body", "Devil Tiger Blade", "Devil Body"]);
  const system = {cores: {}, skills: {}, esoteric: [{name: "Devil Tiger Blade", value: 3}, {name: "Great Sage Style", value: 2}]};
  assert.equal(namedRating21(system, "DEMON BODY"), 3);
  assert.equal(licenseMet21(system, {cultivation: "Demon Body", stars: 3}).met, true);
  assert.equal(licenseMet21(system, {cultivation: "Sage Body", stars: 3}).met, false);
  assert.deepEqual(bracketValues21("[3 x SAGE BODY]", system), [{expr: "3 x SAGE BODY", value: 6}]);
  assert.equal(namedRating21(system, "Spirit Binding"), null);
});

test("Alpha conditions: Burning, Scorch and Samadhi in Check modifiers; Flow at Demand + 3", () => {
  for (const key of ["burning", "suppressed", "samadhi"]) assert.ok(CONDITIONS_21[key], key);
  const base = {cores: {}, skills: {}, assets: [], fatigue: 1, scorch: 2, conditions21: {burning: true}};
  assert.deepEqual(stateModifiers(base).parts.map(part => [part.label, part.value]), [["Burning", -2], ["Fatigue", -1], ["Scorch", -2]]);
  const samadhi = stateModifiers({...base, conditions21: {burning: true, samadhi: true}});
  assert.deepEqual([samadhi.total, samadhi.ignorePenalties], [2, true]);
  assert.deepEqual(withoutPenalties([{value: -2}, {value: 3}], true), [{value: 3}]);
  assert.deepEqual([entersFlow(5, 2), entersFlow(4, 2)], [true, false]);
});

test("Alpha p.52 Scorch: free Flame first, the rest is Scorch; recovering clears Scorch first; Deviation table", () => {
  assert.deepEqual(spendFlame21({max: 3, burnt: 1, installed: 0}, 0, {burn: 1, install: 2}), {burnt: 2, installed: 1, scorch: 1, added: 1, available: 2});
  assert.deepEqual(spendFlame21({max: 3, burnt: 3, installed: 0}, 1, {burn: 2}), {burnt: 3, installed: 0, scorch: 3, added: 2, available: 0});
  assert.deepEqual(recoverFlame21({max: 3, burnt: 3, installed: 0}, 2, {burnt: 3}), {burnt: 2, installed: 0, scorch: 0});
  assert.deepEqual(recoverFlame21({max: 3, burnt: 1, installed: 2}, 1, {installed: 2}), {burnt: 1, installed: 1, scorch: 0});
  assert.equal(deviationDemand21(2), 5);
  assert.equal(deviationPool21({cores: {phy: 3}, skills: {adamance: 1}, sidhi: 2}), 6);
  assert.deepEqual(Object.values(DEVIATIONS_21).map(entry => entry.label), ["Rupture", "Scatter", "Heart Demon", "Shut Down", "Overflame", "Sublation"]);
  assert.deepEqual([1, 3, 5, 7, 8].map(selfFlame21).map(text => text.split(":")[0].split(" ")[0]), ["Silent", "Asterism", "An", "A", "Divine"]);
});

test("a Check that reaches Demand + 3 enters Samadhi (Flow); Samadhi ignores negative adjustments", async () => {
  messages.length = 0; queue.push([4, 4, 4, 4, 5, 6]);
  const actor = makeActor();
  formValues = {core: "phy", skill: "beastShrine", demand: 2, adjustment: 0, fact: false};
  await rollCheck21(actor);
  assert.equal(actor.toObject().system.conditions21.samadhi, true);
  assert.match(messages[0].flavor, /Flow:/);
  messages.length = 0;
  formValues = {core: "phy", skill: "beastShrine", demand: 1, adjustment: -3, fact: false};
  await rollCheck21(actor);
  assert.match(messages[0].flavor, /Pool 7: PHY 3 \+ Beast Shrine 2 \(penalty ignored in Samadhi\)/);
});

test("Suppression Fire needs Rate 15+, rolls no Openings and spends a Rate of ammunition", async () => {
  messages.length = 0;
  const gun = {id: "g1", type: "weapon", name: "Huojianqiang", system: {equipped: true, gearSlot: "both", ammo: {type: "", quantity: 0}, r21: {profile: "longgun", damage: 2, rate: 15, mods: {}}}};
  const pistol = {id: "g2", type: "weapon", name: "Pistol", system: {equipped: true, gearSlot: "right", ammo: {type: "", quantity: 0}, r21: {profile: "handgun", damage: 2, rate: 3, mods: {}}}};
  assert.equal(canSuppress(weaponProfile21(gun.system)), true);
  assert.equal(canSuppress(weaponProfile21(pistol.system)), false);
  const actor = makeActor([gun, pistol]);
  formValues = {weaponId: "g2", core: "mot", skill: "handEye", adjustment: 0, distance: "", mode: "suppress", shots: 1, demand: 1, ammoId: "", cover: 0, height: 0, unstable: 0, part: ""};
  await assert.rejects(() => killTheBuddha(actor), /Rate of 15 or higher/);
});

test("casting while moving costs 2 dice; unleashing past 0 Flame goes into Scorch with a Deviation Check", async () => {
  messages.length = 0;
  const magick = {id: "m1", type: "magick", name: "Bolide", system: {burnArdor: 3, r21: {potency: 1, core: "spi", skill: ""}}};
  const actor = makeActor([magick]);
  formValues = {core: "spi", skill: "", adjustment: 0, moving: true};
  queue.push([4, 1], [1, 1, 1, 1], [5]);
  await castMagick21(actor, magick);
  assert.match(messages[0].flavor, /-2 moving while casting/);
  assert.match(messages[0].flavor, /Burnt 3 Flame \(1 into Scorch\)/);
  assert.deepEqual([actor.toObject().system.ardor.burnt, actor.toObject().system.scorch], [2, 1]);
  assert.match(messages[1].flavor, /Deviation \(d6 = 5\): Overflame/);
});

test("Alpha p.5: a new Sect License needs the Sect's Barang ingested (warning only)", () => {
  const technick = {name: "Demon Diamond Head", type: "technique", system: {sect: "Asuri"}, flags: {"10kswordsfoundry": {sect21: {cultivation: "Demon Body"}}}};
  const spider = {type: "barang", system: {sect: "Asuri", cultivation: "Devil Tiger Blade", ingested: false}};
  const actor = {type: "character", items: {contents: [spider]}};
  assert.match(licenseBarangWarning21(actor, technick), /needs the Asuri's Barang ingested/);
  spider.system.ingested = true;
  assert.equal(licenseBarangWarning21(actor, technick), "");
  assert.equal(licenseBarangWarning21({type: "npc", items: {contents: []}}, technick), "");
  assert.equal(licenseBarangWarning21(actor, {type: "technique", name: "Homebrew", system: {}, flags: {}}), "");
});

test("consumables recover burnt Flame by clearing Scorch first", () => {
  assert.deepEqual(consumableRecovery21({ardor: {max: 2, burnt: 2, installed: 0}, scorch: 1, parts: {}}, {burntArdor: 2}), {"system.ardor.burnt": 1, "system.scorch": 0});
});
