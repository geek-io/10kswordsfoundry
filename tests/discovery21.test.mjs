import test from "node:test";
import assert from "node:assert/strict";

// Exercises Cultivator Discovery (2.1 rulebook p.42) against a minimal Foundry stand-in; not a live Foundry test.
const SYSTEM = "10kswordsfoundry";
const messages = new Map(), actors = [], notices = [], rollMessages = [];
let messageCount = 0, nextRolls = [], dialogAnswer = {owner: "player1"}, lastDialog = null, currentUser = null;
const users = [{id: "gm1", name: "GM", isGM: true}, {id: "player1", name: "Ana", isGM: false}, {id: "player2", name: "Ben", isGM: false}];
const setProperty = (object, path, value) => { const keys = path.split("."); let target = object; for (const key of keys.slice(0, -1)) target = target[key] ??= {}; target[keys.at(-1)] = value; };
const entry = (pack, id, name, type, system = {}, flags = {}) => ({_id: id, uuid: `Compendium.${SYSTEM}.${pack}.Item.${id}`, name, type, system, flags: {[SYSTEM]: flags}});
const packs = {
  "options-21": [entry("options-21", "c1", "Proletariat", "job", {}, {class21: {roll: "9-12"}}), entry("options-21", "c2", "Lumpenproletariat", "job", {}, {class21: {roll: "3-6"}}),
    entry("options-21", "k1", "Ragaan", "trait", {description: "<p>The river peoples of northern Jeng.</p>"}, {option21: {kind: "culture", codes: ["11"]}}), entry("options-21", "a1", "Communism", "trait", {description: "<p>Workers of all Spheres.</p>"}, {option21: {kind: "alignment", roll: "11-12"}}),
    entry("options-21", "a2", "Centrism", "trait", {}, {option21: {kind: "alignment", roll: "7"}})],
  "assets-21": [entry("assets-21", "as1", "Kin", "asset", {key: "kin", stars: 1, detail: "", description: "<p>You have people.</p>"}), entry("assets-21", "as2", "Debt", "asset", {key: "debt", stars: 1, detail: ""})],
  "barang-21": [entry("barang-21", "b1", "Six-Armed Asura Spider", "barang", {sect: "Asuri", cultivation: "Demon Body", ingested: false})],
  "sects-21": [entry("sects-21", "l1", "Exude Killing Intent", "technique", {sect: "Asuri", description: "<p>Draw the ire of all within the aura.</p>"}, {sect21: {cultivation: "Demon Body", stars: 1}}),
    entry("sects-21", "l2", "Devil Tiger Cut", "technique", {sect: "Asuri"}, {sect21: {cultivation: "Demon Body", stars: 2}}),
    entry("sects-21", "l3", "Asura Wrath", "magick", {sect: "Asuri"}, {sect21: {cultivation: "Demon Body", stars: 4}}),
    entry("sects-21", "l4", "Sky Step", "technique", {sect: "Dracontine"}, {sect21: {cultivation: "Sky Dragon", stars: 1}})],
  "weapons-21": [entry("weapons-21", "w1", "Gunong", "weapon", {magCost: 10, rarity: "common", quantity: 1, description: "<p>Utility knife.</p>", r21: {weight: 1}})],
  "armor-21": [entry("armor-21", "h1", "Adamant Helm", "fashion", {magCost: 900, rarity: "uncommon", quantity: 1, r21: {weight: 6, coverage: {head: 2}}}),
    entry("armor-21", "v1", "Silk Vest", "fashion", {magCost: 50, rarity: "common", quantity: 1, r21: {weight: 14, coverage: {torso: 1, rarm: 1, larm: 1}}})],
  "ammunition-21": [entry("ammunition-21", "m1", "Longgun Magazine", "ammunition", {magCost: 64, rarity: "common", quantity: 32, r21: {weight: 6.4}})],
  "goods-21": [entry("goods-21", "g1", "Communist Sutra", "salvage", {magCost: 1, rarity: "common", quantity: 1}), entry("goods-21", "g2", "Skyship", "gear", {magCost: 900000, rarity: "prestige", quantity: 1})]
};
const byUuid = new Map(Object.values(packs).flat().map(row => [row.uuid, row]));
class FakeMessage {
  constructor(data) { Object.assign(this, structuredClone(data)); this.id = `msg${++messageCount}`; this.author = {id: currentUser.id}; messages.set(this.id, this); }
  get isAuthor() { return this.author.id === currentUser.id; }
  async update(change) { for (const [key, value] of Object.entries(change)) setProperty(this, key, structuredClone(value)); return this; }
}
class FakeActor {
  constructor(data) { Object.assign(this, structuredClone(data)); this.id = `actor${actors.length + 1}`; this.uuid = `Actor.${this.id}`; this.items = {contents: []}; this.sheet = {render: () => { this.opened = true; }}; actors.push(this); }
  static async create(data) { return new FakeActor(data); }
  async createEmbeddedDocuments(type, rows) { this.items.contents.push(...structuredClone(rows)); return rows; }
  async update(change) { for (const [key, value] of Object.entries(change)) setProperty(this, key, value); return this; }
}
class FakeApp { constructor(options = {}) { this.options = options; this.rendered = false; } async render() { this.rendered = true; return this; } async close() { this.rendered = false; this.closed = true; return this; } async _onRender() {} }
globalThis.foundry = {
  applications: {api: {ApplicationV2: FakeApp, HandlebarsApplicationMixin: Base => Base,
    DialogV2: {prompt: async options => { lastDialog = options; return dialogAnswer ? options.ok.callback(null, {form: {elements: {owner: {value: dialogAnswer.owner}}}}) : null; }, confirm: async () => true}}},
  dice: {Roll: class { constructor(formula) { this.formula = formula; } async evaluate() { const count = Number(this.formula.split("d")[0]); const results = Array.from({length: count}, () => ({result: nextRolls.shift() ?? 1})); this.total = results.reduce((sum, row) => sum + row.result, 0); this.dice = [{results}]; return this; } async toMessage(data) { rollMessages.push({formula: this.formula, total: this.total, flavor: data.flavor}); } }},
  utils: {randomID: () => "rand", setProperty, deepClone: value => structuredClone(value), fromUuid: async uuid => byUuid.get(uuid) ?? actors.find(actor => actor.uuid === uuid) ?? null},
  documents: {ChatMessage: {create: async data => new FakeMessage(data)}}
};
const as = id => { currentUser = users.find(user => user.id === id); globalThis.game.user = currentUser; };
globalThis.game = {
  user: null, users: Object.assign([...users], {get: id => users.find(user => user.id === id)}), messages,
  packs: {get: id => { const name = id.split(".")[1]; return packs[name] ? {metadata: {label: name}, getIndex: async () => packs[name]} : undefined; }},
  items: {fromCompendium: doc => structuredClone({name: doc.name, type: doc.type, system: doc.system, flags: doc.flags, _id: doc._id})},
  settings: {get: () => "2.1"}, i18n: {localize: key => key}
};
globalThis.ui = {notifications: {info: text => notices.push(["info", text]), warn: text => notices.push(["warn", text]), error: text => notices.push(["error", text])}};
globalThis.CONST = {DOCUMENT_OWNERSHIP_LEVELS: {OWNER: 3}};
globalThis.getDocumentClass = () => FakeActor;
const hooks = {};
globalThis.Hooks = {on: (name, fn) => { (hooks[name] ??= []).push(fn); }};

const rules = await import("../scripts/discovery-rules21.mjs");
const tool = await import("../scripts/discovery21.mjs");
tool.registerDiscovery21();
const {CLASSES_21, discoveryCheck21, emptyDraft21, normalizeDraft21} = rules;
const uuid = (pack, id) => `Compendium.${SYSTEM}.${pack}.Item.${id}`;

/** A Proletarian who has performed all eight Sutras. */
function finished() {
  return {...emptyDraft21(), name: "Songket", classKey: "proletariat", subtype: "Mining", cores: {phy: 3, mot: 3, mnd: 2, wit: 2, voc: 1, spi: 1},
    skills: {adamance: 2, beastShrine: 2, manualLabor: 2, thewsSinews: 2, stillness: 2, organizing: 1, pulitika: 1, dialectics: 1, espionage: 1, susurration: 1},
    assets: [{key: "kin", stars: 2, detail: "The Datu family"}], maccaD6: 4, supply: [{uuid: uuid("weapons-21", "w1"), name: "Gunong", price: 10, qty: 1, free: false, note: ""}, {uuid: uuid("ammunition-21", "m1"), name: "Longgun Magazine", price: 64, qty: 1, free: false, note: ""}],
    culture: "Ragaan", alignment: "Communism", attachments: [{text: "I repay those who sheltered me.", strength: 1}, {text: "Workers should rule.", strength: 2}, {text: "I love my coworkers.", strength: 3}],
    sect: "Asuri", cultivation: "Demon Body", barang: "Six-Armed Asura Spider", licenses: [{uuid: uuid("sects-21", "l1"), name: "Exude Killing Intent", stars: 1, cultivation: "Demon Body", sect: "Asuri"}, {uuid: uuid("sects-21", "l2"), name: "Devil Tiger Cut", stars: 2, cultivation: "Demon Body", sect: "Asuri"}],
    sectStory: "Recruited from the mine.", sidhiColor: "Bruise violet", ajna: "A cracked half halo."};
}

test("Classes follow the 2.1 rulebook (pp.44-48)", () => {
  const row = key => { const info = CLASSES_21[key]; return [info.roll, info.cores, info.cultivations, info.assets, info.maccaPerD6]; };
  assert.deepEqual(row("lumpenproletariat"), [[3, 6], [2, 2, 2, 2, 1, 1], {2: 3, 1: 3}, 1, 1]);
  assert.deepEqual(row("semiproletariat"), [[7, 8], [3, 2, 2, 2, 1, 1], {2: 4, 1: 4}, 2, 100]);
  assert.deepEqual(row("proletariat"), [[9, 12], [3, 3, 2, 2, 1, 1], {2: 5, 1: 5}, 2, 20]);
  assert.deepEqual(row("petitBourgeoisie"), [[13, 13], [3, 3, 3, 2, 1, 1], {2: 5, 1: 5}, 3, 160]);
  assert.deepEqual(row("sphericalBourgeoisie"), [[14, 14], [3, 3, 3, 2, 2, 1], {3: 1, 2: 5, 1: 5}, 4, 200]);
  assert.deepEqual(row("compradorBourgeois"), [[15, 15], [3, 3, 3, 2, 2, 2], {3: 2, 2: 5, 1: 5}, 4, 300]);
  assert.deepEqual(row("bureaucratCapitalists"), [[16, 16], [3, 3, 3, 2, 2, 2], {3: 2, 2: 5, 1: 5}, 4, 500]);
  assert.deepEqual(row("landlord"), [[17, 17], [3, 3, 3, 3, 2, 2], {3: 3, 2: 5, 1: 5}, 5, 800]);
  assert.deepEqual(row("heavenlyBourgeoisie"), [[18, 18], [4, 3, 3, 3, 2, 2], {3: 5, 2: 5, 1: 5}, 6, 1000]);
  assert.equal(CLASSES_21.lumpenproletariat.supply, "One item, randomly rolled");
  assert.equal(emptyDraft21().classKey, "proletariat", "You are Proletariat unless you choose or roll otherwise (p.42)");
});

test("3d6 lands on exactly one Class, and the d6 sub-tables cover 1-6", () => {
  for (let total = 3; total <= 18; total++) assert.ok(rules.classFromRoll21(total), `no Class at ${total}`);
  assert.equal(rules.classFromRoll21(6), "lumpenproletariat"); assert.equal(rules.classFromRoll21(7), "semiproletariat");
  assert.equal(rules.classFromRoll21(12), "proletariat"); assert.equal(rules.classFromRoll21(13), "petitBourgeoisie"); assert.equal(rules.classFromRoll21(18), "heavenlyBourgeoisie");
  assert.equal(rules.classFromRoll21(2), null);
  for (const key of ["lumpenproletariat", "proletariat", "sphericalBourgeoisie"]) for (let d6 = 1; d6 <= 6; d6++) assert.ok(rules.subtypeFromRoll21(key, d6));
  assert.equal(rules.subtypeFromRoll21("lumpenproletariat", 5), "Underworld"); assert.equal(rules.subtypeFromRoll21("proletariat", 6), "Sect");
  assert.equal(rules.subtypeFromRoll21("sphericalBourgeoisie", 4), "Sub-Spherical or National Bourgeoisie"); assert.equal(rules.subtypeFromRoll21("landlord", 3), "");
  assert.equal(rules.startingMacca21("petitBourgeoisie", 3), 480); assert.equal(rules.startingMacca21("proletariat", 0), 0);
});

test("the Name table is 11 rows by 10 columns, read row then column (p.62)", () => {
  assert.equal(rules.NAME_SYLLABLES_21.length, 11);
  for (const row of rules.NAME_SYLLABLES_21) assert.equal(row.length, 10);
  assert.equal(rules.nameSyllable21(2, 2), "SA"); assert.equal(rules.nameSyllable21(2, 3), "TA"); assert.equal(rules.nameSyllable21(2, 4), "KA");
  assert.equal(rules.nameSyllable21(2, 9), "SONG"); assert.equal(rules.nameSyllable21(2, 7), "KET");
  assert.equal(rules.nameSyllable21(12, 11), "YONG"); assert.equal(rules.nameSyllable21(12, 12), "YONG"); assert.equal(rules.nameSyllable21(9, 3), "INTA");
  assert.equal(rules.nameSyllable21(1, 5), ""); assert.equal(rules.nameFromSyllables21(["SONG", "KET"]), "Songket");
});

test("a blank draft lists what every Sutra still needs", () => {
  const check = discoveryCheck21(emptyDraft21());
  assert.equal(check.complete, false);
  assert.match(check.issues.class.join(" "), /sector/);
  assert.match(check.issues.cores.join(" "), /✦✦✦ × 2, ✦✦ × 2, ✦ × 2/);
  assert.deepEqual(check.issues.cultivations, ["✦✦: 0 of 5 Cultivations chosen.", "✦: 0 of 5 Cultivations chosen."]);
  assert.deepEqual(check.issues.assets, []); assert.match(check.notes.assets.join(" "), /2 Asset Stars left unspent/);
  assert.match(check.issues.supply.join(" "), /20 × d6/);
  assert.equal(check.issues.identity.length, 7);
  assert.equal(check.issues.sect.length, 2); assert.equal(check.issues.sidhi.length, 2);
});

test("a finished Proletarian passes every Sutra", () => {
  const check = discoveryCheck21(finished());
  assert.deepEqual(Object.values(check.issues).flat(), []);
  assert.equal(check.complete, true);
});

test("each Sutra's rule is enforced", () => {
  const broken = change => { const draft = finished(); change(draft); return discoveryCheck21(draft).issues; };
  assert.match(broken(d => { d.cores.phy = 4; }).cores.join(" "), /does not give: ✦✦✦✦ × 1/);
  assert.match(broken(d => { d.cores.spi = 0; }).cores.join(" "), /Still to assign: ✦ × 1/);
  assert.match(broken(d => { d.skills.chronicle = 2; }).cultivations.join(" "), /✦✦: 6 of 5/);
  assert.match(broken(d => { d.skills.chronicle = 3; }).cultivations.join(" "), /gives no Cultivations at ✦✦✦/);
  assert.match(broken(d => { d.assets.push({key: "debt", stars: 1, detail: ""}); }).assets.join(" "), /3 Asset Stars bought; Proletariat starts with 2/);
  assert.match(broken(d => { d.assets = [{key: "hummingbirdPulse", stars: 2, detail: ""}]; }).assets.join(" "), /Hummingbird Pulse takes ✦✦✦/);
  assert.match(broken(d => { d.assets = [{key: "longCon", stars: 1, detail: ""}]; }).assets.join(" "), /not one of the 36 starting Assets/);
  assert.match(broken(d => { d.maccaD6 = 1; d.supply[1].qty = 1; }).supply.join(" "), /Supply costs 74 Macca; starting Macca is 20/);
  assert.deepEqual(broken(d => { d.maccaD6 = 1; d.supply[1].free = true; }).supply, [], "a line marked free costs nothing");
  assert.match(broken(d => { d.attachments[2].strength = 2; }).identity.join(" "), /should be Heart/);
  assert.match(broken(d => { d.attachments[0].text = "  "; }).identity.join(" "), /at least 3 Attachments \(2 written\).*should be Held/);
  assert.match(broken(d => { d.licenses.pop(); }).sect.join(" "), /Choose 2 Licenses \(1 chosen\)/);
  assert.match(broken(d => { d.licenses[1].stars = 3; }).sect.join(" "), /needs Demon Body ✦✦✦; you start at ✦✦/);
  assert.match(broken(d => { d.licenses[1].sect = "Dracontine"; }).sect.join(" "), /not a Asuri License/);
  assert.equal(broken(d => { d.sidhiColor = ""; d.ajna = ""; }).sidhi.length, 2);
  assert.match(discoveryCheck21({...finished(), classKey: "heavenlyBourgeoisie", subtype: ""}).issues.cores.join(" "), /Still to assign/);
});

test("a finished draft becomes Actor data: Stars, the Sect Cultivation at ✦✦, Attachments and the Macca left", () => {
  const system = rules.actorSystem21(finished());
  assert.deepEqual(system.cores, {phy: 3, mot: 3, mnd: 2, wit: 2, voc: 1, spi: 1});
  assert.equal(system.skills.adamance, 2); assert.equal(system.skills.pulitika, 1); assert.equal(system.skills.chronicle, 0);
  assert.equal(Object.keys(system.skills).length, 30);
  assert.deepEqual(system.esoteric, [{name: "Demon Body", value: 2, core: "spi"}]);
  assert.deepEqual(system.attachments.map(row => row.strength), [1, 2, 3]);
  assert.equal(system.mag, 80 - 74); assert.equal(system.sidhi, 0); assert.equal(system.culture, "Ragaan"); assert.equal(system.alignment, "Communism");
  assert.match(system.notes, /Proletariat — Mining/); assert.match(system.notes, /A cracked half halo\./); assert.match(system.notes, /20 × d6 \(4\) = 80/);
});

test("stored drafts are normalised and the card escapes what players type", () => {
  const draft = normalizeDraft21({name: "<b>X</b>", classKey: "nope", cores: {phy: 99}, skills: {adamance: 2, bogus: 3, chronicle: 0}, supply: [{name: "no uuid"}], attachments: [{text: "a", strength: 9}], log: "x"});
  assert.equal(draft.classKey, "proletariat"); assert.equal(draft.cores.phy, 5); assert.deepEqual(draft.skills, {adamance: 2}); assert.deepEqual(draft.supply, []);
  assert.equal(draft.attachments[0].strength, 3); assert.deepEqual(draft.log, []);
  const card = rules.discoveryCard21(draft, {ownerName: "Ana", gmNote: "<script>"});
  assert.match(card, /&lt;b&gt;X&lt;\/b&gt;/); assert.doesNotMatch(card, /<script>/); assert.match(card, /data-status="draft"/); assert.match(card, /still to do: Class, Cores/);
  assert.match(rules.discoveryCard21(finished(), {}), /data-status="ready"/);
  const created = rules.discoveryCard21(finished(), {status: "created", actorName: "Songket"});
  assert.match(created, /data-discovery21="sheet"/); assert.match(created, /is in the Actors tab/);
  assert.equal(rules.canOpenDiscovery21({id: "p2", isGM: false}, "p1", "p1"), false); assert.equal(rules.canOpenDiscovery21({id: "p1", isGM: false}, "p1", "x"), true);
  assert.equal(rules.canOpenDiscovery21({id: "g", isGM: true}, "p1", "p1"), true);
});

test("nothing is written until Save; Save whispers one card and saving again updates it", async () => {
  as("player1"); messages.clear();
  const app = new tool.Discovery21();
  await app._prepareContext();
  app.draft = finished(); app.touch();
  assert.equal(messages.size, 0, "working on a draft creates nothing");
  await tool.Discovery21.save.call(app);
  assert.equal(messages.size, 1);
  const message = [...messages.values()][0], flags = message.flags[SYSTEM].discovery21;
  assert.deepEqual(message.whisper.toSorted(), ["gm1", "player1"]);
  assert.equal(flags.ownerId, "player1"); assert.equal(flags.status, "ready"); assert.equal(JSON.parse(flags.draftJSON).name, "Songket");
  assert.equal(app.dirty, false);
  app.draft.skills = {adamance: 2}; app.draft.name = "Tatdin";
  await tool.Discovery21.save.call(app);
  assert.equal(messages.size, 1, "the same card is updated");
  const again = JSON.parse(message.flags[SYSTEM].discovery21.draftJSON);
  assert.deepEqual(again.skills, {adamance: 2}, "removed Cultivations do not linger on the card"); assert.equal(message.flags[SYSTEM].discovery21.status, "draft");
  assert.match(message.content, /Tatdin/);
});

test("the saved card opens for its player and for a GM, not for another player", async () => {
  as("player1"); messages.clear(); notices.length = 0;
  const app = new tool.Discovery21(); await app._prepareContext(); app.draft = finished();
  await tool.Discovery21.save.call(app);
  const message = [...messages.values()][0];
  as("player2");
  await tool.openDiscovery21({message});
  assert.match(notices.at(-1)[1], /Only the player who saved this Discovery, or a GM/);
  const html = buttons => ({querySelectorAll: () => buttons});
  const removed = []; hooks.renderChatMessageHTML[0](message, html([{remove: () => removed.push(1), addEventListener: () => assert.fail("no handler for another player")}]));
  assert.equal(removed.length, 1);
  as("gm1");
  const opened = await tool.openDiscovery21({message});
  assert.equal(opened.draft.name, "Songket"); assert.equal(opened.ownerId, "player1"); assert.equal(opened.messageId, message.id);
});

test("rolls happen inside the tool and are logged for the GM", async () => {
  as("player1");
  const app = new tool.Discovery21(); await app._prepareContext();
  nextRolls = [1, 2, 3]; await tool.Discovery21.rollClass.call(app);
  assert.equal(app.draft.classKey, "lumpenproletariat");
  nextRolls = [6]; await tool.Discovery21.rollSubtype.call(app); assert.equal(app.draft.subtype, "Declassed");
  nextRolls = [5]; await tool.Discovery21.rollMacca.call(app); assert.equal(app.draft.maccaD6, 5);
  nextRolls = [1, 1, 4, 5]; await tool.Discovery21.rollSyllable.call(app); assert.equal(app.draft.name, "Song");
  nextRolls = [1, 1]; await tool.Discovery21.rollCulture.call(app); assert.equal(app.draft.culture, "Ragaan");
  nextRolls = [6, 5]; await tool.Discovery21.rollAlignment.call(app); assert.equal(app.draft.alignment, "Communism");
  nextRolls = [6, 5]; await tool.Discovery21.rollAsset.call(app); assert.deepEqual(app.draft.assets, [{key: "kin", stars: 1, detail: ""}]);
  nextRolls = [1]; await tool.Discovery21.randomSupply.call(app);
  assert.equal(app.draft.supply.length, 1); assert.equal(app.draft.supply[0].free, true);
  assert.equal(app.draft.log.length, 8); assert.match(app.draft.log[0], /Class 3d6 \(1, 2, 3\) = 6: Lumpenproletariat/);
  app.setField("sect", "Asuri");
  assert.equal(app.draft.cultivation, "Demon Body"); assert.equal(app.draft.barang, "Six-Armed Asura Spider");
  for (const id of ["l3", "l4", "l1", "l2", "l1"]) tool.Discovery21.toggleLicense.call(app, null, {dataset: {uuid: uuid("sects-21", id)}});
  assert.deepEqual(app.draft.licenses.map(row => row.name), ["Devil Tiger Cut"], "✦✦✦✦ and other Sects' Licenses are refused; a second click removes");
  app.setField("classKey", "landlord"); assert.equal(app.draft.subtype, "");
  assert.equal(messages.size, 1, "rolling saves no Discovery card");
  assert.equal(rollMessages.length, 9, "every roll is posted to chat: Class, sub-table, Macca, two for the syllable, Culture, Alignment, Asset, random Supply");
  assert.deepEqual([rollMessages[0].formula, rollMessages[0].total], ["3d6", 6]); assert.match(rollMessages[0].flavor, /Cultivator Discovery<\/strong> · Class \(3d6\)/);
});

test("Core and Cultivation lists offer only what is left", () => {
  const draft = emptyDraft21();
  assert.deepEqual(rules.coreChoices21(draft, "phy"), [3, 2, 1]);
  draft.cores.phy = 3; draft.cores.mot = 3;
  assert.deepEqual(rules.coreChoices21(draft, "mnd"), [2, 1], "both ✦✦✦ are used");
  assert.deepEqual(rules.coreChoices21(draft, "phy"), [3, 2, 1], "a Core keeps its own value in its list");
  Object.assign(draft.cores, {mnd: 2, wit: 2, voc: 1, spi: 1});
  assert.deepEqual(rules.coreChoices21(draft, "spi"), [1]);
  assert.deepEqual(rules.cultivationChoices21(draft, "adamance"), [1, 2]);
  for (const key of ["adamance", "beastShrine", "manualLabor", "thewsSinews", "stillness"]) draft.skills[key] = 2;
  assert.deepEqual(rules.cultivationChoices21(draft, "chronicle"), [1], "all five ✦✦ are placed");
  assert.deepEqual(rules.cultivationChoices21(draft, "adamance"), [1, 2]);
  for (const key of ["organizing", "pulitika", "dialectics", "espionage", "susurration"]) draft.skills[key] = 1;
  assert.deepEqual(rules.cultivationChoices21(draft, "chronicle"), []); assert.deepEqual(rules.cultivationChoices21(draft, "pulitika"), [1]);
});

test("Supply over the Carry Limit warns, is allowed, and carries the p.182 penalties", async () => {
  const draft = finished();
  draft.cores.phy = 1; draft.cores.voc = 3;
  draft.supply = [{uuid: uuid("armor-21", "v1"), name: "Silk Vest", price: 50, kg: 14, qty: 1, free: false, note: ""}];
  assert.deepEqual([rules.carryCheck21(draft).limit, rules.carryCheck21(draft).kg, rules.carryCheck21(draft).tier], [20, 14, 0]);
  draft.supply[0].qty = 2;
  const carry = rules.carryCheck21(draft);
  assert.deepEqual([carry.kg, carry.tier, carry.over], [28, 2, true]); assert.match(carry.text, /-2 to all Checks, -2 m\/s Movement, \+2 Speed/);
  draft.supply[0].qty = 3; assert.equal(rules.carryCheck21(draft).tier, 3);
  assert.match(discoveryCheck21(draft).notes.supply.join(" "), /Carry Limit of 20 kg/); assert.doesNotMatch(discoveryCheck21(draft).issues.supply.join(" "), /Carry/, "over Carry never blocks");
  as("player1"); notices.length = 0;
  const app = new tool.Discovery21(); await app._prepareContext();
  app.draft.cores.phy = 1;
  const add = id => tool.Discovery21.addSupply.call(app, null, {dataset: {uuid: uuid("armor-21", id)}});
  await add("v1"); assert.equal(notices.length, 0, "14 kg of 20 kg");
  await add("v1"); assert.equal(notices.length, 1); assert.match(notices[0][1], /^Over Carry\. Carrying 28 kg against a Carry Limit of 20 kg/); assert.equal(app.draft.supply[0].qty, 2, "it is still added");
  await add("h1"); assert.equal(notices.length, 1, "34 kg is the same tier: no second warning");
  await add("v1"); assert.equal(notices.length, 2, "48 kg is the next tier");
  app.step = "supply"; app.shop.part = "head";
  const context = await app._prepareContext();
  assert.deepEqual(context.shop.rows.map(row => row.name), ["Adamant Helm"], "the market filters armor by the Part it covers");
  assert.equal(context.shop.rows[0].covers, "Head 2"); assert.equal(context.carry.over, true); assert.equal(context.supplyRows[0].covers, "Right Arm 1, Left Arm 1, Torso 1");
  const {stateModifiers} = await import("../scripts/rules21.mjs");
  assert.deepEqual(stateModifiers({}, {encumbrance: 2}).parts, [{label: "Over Carry Limit", value: -2}]);
  assert.deepEqual(stateModifiers({conditions21: {encumbered: true}}, {encumbrance: 2}).parts, [{label: "Encumbered", value: -4}], "the hand-set condition is not added on top");
  assert.equal(stateModifiers({}, {}).total, 0);
});

test("descriptions come with the options: Assets, Culture, Alignment, Licenses and market items", async () => {
  as("player1");
  const app = new tool.Discovery21(); await app._prepareContext();
  app.draft = finished(); app.step = "assets"; app.assetPick = "kin";
  let context = await app._prepareContext();
  assert.equal(context.assetRows[0].description, "<p>You have people.</p>"); assert.equal(context.assetPreview.description, "<p>You have people.</p>");
  app.step = "identity"; context = await app._prepareContext();
  assert.equal(context.cultureText, "<p>The river peoples of northern Jeng.</p>"); assert.equal(context.alignmentText, "<p>Workers of all Spheres.</p>");
  app.step = "sect"; context = await app._prepareContext();
  assert.equal(context.licenseRows[0].description, "<p>Draw the ire of all within the aura.</p>");
  app.step = "supply"; context = await app._prepareContext();
  assert.equal(context.shop.rows.find(row => row.name === "Gunong").description, "<p>Utility knife.</p>");
});

test("Roll everything fills every Sutra but the Attachments, and says so in one chat message", async () => {
  as("player1"); messages.clear(); rollMessages.length = 0; notices.length = 0;
  for (const seed of [0.07, 0.31, 0.5, 0.83, 0.999]) {
    const app = new tool.Discovery21(); await app._prepareContext();
    let n = 0; app.random = () => { n += 1; return (seed + n * 0.6180339887) % 1; };
    app.draft.attachments = [{text: "I repay those who sheltered me.", strength: 1}, {text: "Workers should rule.", strength: 2}, {text: "I love my coworkers.", strength: 3}];
    app.draft.sectStory = "kept";
    nextRolls = Array.from({length: 200}, (_, index) => 1 + Math.floor(((seed * 7 + index * 0.37) % 1) * 6));
    const before = messages.size;
    await tool.Discovery21.rollEverything.call(app);
    const check = discoveryCheck21(app.draft), draft = app.draft, info = CLASSES_21[draft.classKey];
    assert.deepEqual(check.issues.cores, []); assert.deepEqual(check.issues.cultivations, []); assert.deepEqual(check.issues.assets, []); assert.deepEqual(check.issues.supply, []);
    assert.deepEqual(check.issues.class, []); assert.deepEqual(check.issues.identity, []); assert.deepEqual(check.issues.sidhi, []);
    assert.equal(draft.sect, "Asuri"); assert.deepEqual(draft.licenses.map(row => row.name).toSorted(), ["Devil Tiger Cut", "Exude Killing Intent"]);
    assert.ok(rules.assetBudget21(draft).left >= 0); assert.ok(rules.supplyBudget21(draft).left >= 0);
    assert.equal(draft.supply.some(row => row.free), !!info.supply, "only a Class with a Supply line gets the free item");
    assert.equal(draft.attachments.length, 3); assert.equal(draft.sectStory, "kept");
    assert.equal(messages.size, before + 1, "one chat message"); assert.equal(rollMessages.length, 0);
    const posted = [...messages.values()].at(-1);
    assert.match(posted.content, /Pure chaos/); assert.match(posted.content, new RegExp(`Class 3d6 .*: ${info.label}`)); assert.equal(posted.flags, undefined, "it is not a Discovery card");
    assert.equal(app.step, "review"); assert.equal(app.dirty, true);
  }
  assert.deepEqual(rules.randomCores21("heavenlyBourgeoisie", () => 0.42) && Object.values(rules.randomCores21("heavenlyBourgeoisie", () => 0.42)).toSorted(), [2, 2, 3, 3, 3, 4]);
  const skills = rules.randomCultivations21("landlord", () => 0.42);
  assert.deepEqual([3, 2, 1].map(rating => Object.values(skills).filter(value => value === rating).length), [3, 5, 5]);
  assert.deepEqual(rules.shuffle21([1, 2, 3, 4], () => 0.999).toSorted(), [1, 2, 3, 4]);
});

test("prices and Licenses are re-read from the compendia before a character is created", async () => {
  const catalog = await tool.discoveryCatalog21(), draft = finished();
  draft.supply[0].price = 1; draft.licenses[1] = {uuid: uuid("sects-21", "l3"), name: "Asura Wrath", stars: 1, cultivation: "Demon Body", sect: "Asuri"};
  draft.supply.push({uuid: "Compendium.gone.Item.x", name: "Ghost Blade", price: 0, qty: 1});
  const result = await tool.verifyDraft21(draft, catalog);
  assert.equal(result.draft.supply[0].price, 10); assert.equal(result.draft.supply[0].kg, 1, "weights are re-read too"); assert.equal(result.draft.licenses[1].stars, 4);
  assert.equal(result.changed.length, 2); assert.deepEqual(result.missing, ["Ghost Blade"]);
  assert.match(discoveryCheck21(result.draft).issues.sect.join(" "), /Asura Wrath needs Demon Body ✦✦✦✦/);
});

test("a GM creates the character: Items, ownership, Macca left, and the card is marked created", async () => {
  as("player1"); messages.clear(); actors.length = 0;
  const mine = new tool.Discovery21(); await mine._prepareContext(); mine.draft = finished(); mine.draft.supply[1].qty = 2; mine.draft.supply[1].free = true;
  await tool.Discovery21.save.call(mine);
  const message = [...messages.values()][0];
  await tool.Discovery21.createActor.call(mine);
  assert.equal(actors.length, 0, "a player cannot create the character");
  as("gm1"); dialogAnswer = {owner: "player1"};
  const review = await tool.openDiscovery21({message}); await review._prepareContext();
  review.gmNote = "Welcome to the Sect.";
  await tool.Discovery21.createActor.call(review);
  assert.match(lastDialog.content, /All eight Sutras are performed/);
  assert.equal(actors.length, 1);
  const actor = actors[0], names = actor.items.contents.map(item => item.name);
  assert.equal(actor.name, "Songket"); assert.equal(actor.type, "wanderer"); assert.deepEqual(actor.ownership, {default: 0, player1: 3});
  assert.deepEqual(names, ["Six-Armed Asura Spider", "Proletariat", "Ragaan", "Communism", "Kin", "Exude Killing Intent", "Devil Tiger Cut", "Gunong", "Longgun Magazine", "Longgun Magazine"], "two magazines stay two Items of 32");
  const item = name => actor.items.contents.find(entry => entry.name === name);
  assert.equal(item("Six-Armed Asura Spider").system.ingested, true); assert.equal(item("Kin").system.stars, 2); assert.equal(item("Kin").system.detail, "The Datu family");
  assert.equal(item("Proletariat").flags[SYSTEM].class21.subtype, "Mining"); assert.equal(item("Longgun Magazine").system.quantity, 32);
  assert.equal(actor.system.mag, 70); assert.equal(actor.system.esoteric[0].value, 2); assert.ok(actor.system.morale.value >= 1);
  const flags = message.flags[SYSTEM].discovery21;
  assert.equal(flags.status, "created"); assert.equal(flags.actorUuid, actor.uuid); assert.equal(flags.gmNote, "Welcome to the Sect.");
  assert.match(message.content, /data-status="created"/); assert.equal(messages.size, 1); assert.equal(actor.opened, true);
  const after = await tool.openDiscovery21({message});
  assert.equal(after.locked, true);
  await tool.Discovery21.save.call(after); await tool.Discovery21.createActor.call(after);
  assert.equal(actors.length, 1, "a created Discovery cannot be saved over or created twice");
});

test("an unfinished Discovery can only be created as the GM's call, with the gaps listed", async () => {
  as("gm1"); messages.clear(); actors.length = 0;
  const app = new tool.Discovery21(); await app._prepareContext(); app.draft = {...finished(), ajna: ""};
  dialogAnswer = null;
  await tool.Discovery21.createActor.call(app);
  assert.match(lastDialog.content, /Not complete yet/); assert.match(lastDialog.content, /Imagine her Ajna/); assert.equal(lastDialog.ok.label, "Create anyway");
  assert.equal(actors.length, 0); assert.equal(messages.size, 0, "declining creates nothing");
});
