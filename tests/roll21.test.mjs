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
  assert.deepEqual([ktb.quick, ktb.solid, ktb.perfect, ktb.whiff, ktb.damage], [2, 2, 0, 1, 3], "6, 6, 5, 4, 2: 4–5 Quick, 6 Solid, 2 Whiff; Empty Hand deals PHYS (2.1 p.192)");
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
  formValues = {part: "rarm", amount: 12, crushing: false, ignoreSoak: false};
  await damagePart(actor, "rarm");
  const source = actor.toObject().system.parts.rarm;
  assert.deepEqual([source.damage, source.soakLost], [10, 2], "12 damage - 2 Soak = 10 to HP, Disabling the arm (max 7 + Physique 3)");
  assert.match(messages[0].content, /Disabled/);
  assert.match(messages[0].content, /drop the weapon/);
});

test("Strikes buy effects at the printed costs (2.1 p.117)", async () => {
  const {strikeOptions21, strikePlan21, STRIKE_BUYS_21} = await import("../scripts/rules21.mjs");
  assert.deepEqual(Object.values(STRIKE_BUYS_21).map(buy => buy.cost), [1, 1, 2, 3, 4]);
  assert.deepEqual(strikeOptions21(1).map(option => option.value), ["hit:random", "hit:rleg", "hit:lleg", "hit:rarm", "hit:larm", "hit:torso", "hit:head", "knockback"]);
  assert.ok(strikeOptions21(2).some(option => option.value === "body")); assert.ok(!strikeOptions21(2).some(option => option.buy === "called"));
  assert.deepEqual(strikeOptions21(3).filter(option => option.buy === "called").map(option => option.part), ["rleg", "lleg", "rarm", "larm"]);
  assert.ok(strikeOptions21(4).some(option => option.value === "head")); assert.deepEqual(strikeOptions21(0), []);
  const two = strikePlan21(2, ["hit:random", "hit:random"]);
  assert.deepEqual([two.ok, two.spent, two.left], [true, 2, 0], "2 Strikes: HIT and HIT again");
  assert.deepEqual([strikePlan21(4, ["body", "", "knockback"]).spent, strikePlan21(4, ["body", "", "knockback"]).left], [3, 1]);
  assert.match(strikePlan21(3, ["body", "body"]).error, /cost 4 Strikes; only 3/);
  assert.match(strikePlan21(2, ["head"]).error, /cannot buy/); assert.match(strikePlan21(2, ["", ""]).error, /at least one/);
  const bow = strikePlan21(3, ["hit:random"], {single: true});
  assert.deepEqual([bow.ok, bow.extraDamage, bow.left], [true, 2, 0], "a Bow with 3 Strikes: a random Part and +2 damage");
  assert.equal(strikePlan21(3, ["body"], {single: true}).extraDamage, 1); assert.equal(strikePlan21(3, ["knockback"], {single: true}).extraDamage, 0);
  assert.match(strikePlan21(3, ["hit:random", "hit:random"], {single: true}).error, /single effect/);
});

test("Spend Strikes applies each effect to the loser and reports them on one card", async () => {
  const {spendStrikes21} = await import("../scripts/roll21.mjs");
  const loser = makeActor(); loser.uuid = "Actor.loser";
  messages.length = 0; queue.push([4]);
  formValues = {pick0: "hit:random", pick1: "body", pick2: "", pick3: "", dtype: "", crushing: false, ignoreSoak: false, visceral: false};
  await spendStrikes21(loser, {strikes: 4, damage: 3, damageText: "PHYS", attackerName: "Winner", weapon: "Saber"});
  const parts = loser.toObject().system.parts;
  assert.deepEqual([parts.larm.damage, parts.torso.damage, parts.head.damage], [3, 3, 0], "d6 = 4 is the Left Arm; BODY HIT is the Torso");
  assert.equal(messages.length, 1);
  assert.match(messages[0].content, /Strikes spent · Winner → Test/); assert.match(messages[0].content, /3 of 4 Strikes spent — <strong>1 left unspent<\/strong> with Saber/);
  assert.match(messages[0].content, /HIT \[1\] → Left Arm<\/strong> \(d6 = 4\): 3 damage/); assert.match(messages[0].content, /BODY HIT \[2\] → Torso/);
  assert.doesNotMatch(messages[0].content, /data-r21-check/);
  formValues = {pick0: "hit:rleg", dtype: "", crushing: false, ignoreSoak: false, visceral: false};
  await spendStrikes21(loser, {strikes: 3, damage: 3, single: true, attackerName: "Archer"});
  assert.equal(loser.toObject().system.parts.rleg.damage, 5, "ranged without AUTO: one effect, +2 from the Strikes left over");
  assert.match(messages.at(-1).content, /5 damage \(3 \+ 2 from Strikes left over\)/);
  formValues = {pick0: "body", pick1: "body", pick2: "", dtype: "", crushing: false, ignoreSoak: false, visceral: false};
  await assert.rejects(() => spendStrikes21(loser, {strikes: 3, damage: 3}), /cost 4 Strikes; only 3/);
  await assert.rejects(() => spendStrikes21(loser, {strikes: 0, damage: 3}), /No Strikes/);
  assert.equal(loser.toObject().system.parts.torso.damage, 3, "a refused plan changes nothing");
});

test("lost Head HP offers Stun and Morale Check buttons, on the card and from the sheet", async () => {
  const {spendStrikes21, damagePart} = await import("../scripts/roll21.mjs");
  const {runHeadCheck21, runChatAction21} = await import("../scripts/chat21.mjs");
  const loser = makeActor(); loser.uuid = "Actor.loser";
  messages.length = 0;
  formValues = {pick0: "head", pick1: "", pick2: "", pick3: "", dtype: "", crushing: false, ignoreSoak: false, visceral: false};
  await runChatAction21({strikes: 4, damage: 3, targets: [{name: "Test", actorUuid: "Actor.loser"}]}, "spend", 0, {resolve: async uuid => uuid === "Actor.loser" ? loser : null, isGM: true});
  assert.equal(loser.toObject().system.parts.head.damage, 3);
  const flag = messages[0].flags["10kswordsfoundry"].headHit21;
  assert.deepEqual(flag, {actor: "Actor.loser"}); assert.match(messages[0].content, /data-r21-check="stun">Stun Check/); assert.match(messages[0].content, /data-r21-check="morale">Morale Check \(1 Morale\)/);
  formValues = {part: "head", amount: 1, dtype: "", crushing: false, ignoreSoak: false, visceral: false};
  await damagePart(loser, "head");
  assert.match(messages.at(-1).content, /data-r21-check="stun"/); assert.deepEqual(messages.at(-1).flags["10kswordsfoundry"].headHit21, {actor: "Actor.loser"});
  formValues = {part: "torso", amount: 1, dtype: "", crushing: false, ignoreSoak: false, visceral: false};
  await damagePart(loser, "torso");
  assert.doesNotMatch(messages.at(-1).content, /data-r21-check/); assert.deepEqual(messages.at(-1).flags, {});
  const resolve = async uuid => uuid === "Actor.loser" ? loser : null;
  formValues = {demand: 2}; queue.push([1, 2, 3]);
  await runHeadCheck21(flag, "stun", {resolve, isGM: false});
  assert.equal(loser.toObject().system.conditions21.stunned, true, "Heart 2 + Stillness 1 = 3 dice, no Strikes: Stunned");
  assert.match(messages.at(-1).flavor, /Stun Check/);
  queue.push([6, 6, 1, 1]);
  await runHeadCheck21(flag, "morale", {resolve, isGM: false});
  assert.equal(loser.toObject().system.morale.value, 2, "the Morale Check spends 1 Morale"); assert.match(messages.at(-1).flavor, /Morale Check · Incapacitation/);
  loser.isOwner = false;
  await assert.rejects(() => runHeadCheck21(flag, "stun", {resolve, isGM: false}), /A GM or the owner of Test/);
  await assert.rejects(() => runHeadCheck21({actor: "Actor.gone"}, "stun", {resolve, isGM: true}), /no longer available/);
  const {readFileSync} = await import("node:fs");
  const sheet = readFileSync(new URL("../templates/actor-21.hbs", import.meta.url), "utf8");
  assert.match(sheet, /data-action="stun21"[^>]*>Stun Check<\/button><button type="button" data-action="incap21"[^>]*>Morale Check \(1 Morale\)/);
  assert.doesNotMatch(sheet, /anyDisabled/, "the Morale Check button no longer waits for a Disabled Part");
  assert.doesNotMatch(sheet, /data-panel="inventory"/, "Inventory is folded into the Combat & Gear tab");
  assert.match(sheet, /data-panel="combat">Combat &amp; Gear<\/button>/); assert.match(sheet, /data-panel="combat"><h2>Gear Slots/);
});
