import test from "node:test";
import assert from "node:assert/strict";

// Exercises 2.1 Asset and Barang items against a minimal Foundry stand-in; not a live Foundry test.
const messages = [];
let formValues = {};
const field = name => name in formValues ? {value: String(formValues[name]), checked: formValues[name] === true} : null;
const form = () => ({elements: {namedItem: field}});
globalThis.foundry = {
  applications: {api: {DialogV2: {prompt: async options => options.ok.callback(null, {form: form()}), confirm: async () => true}}},
  documents: {ChatMessage: {getSpeaker: () => ({alias: "Test"}), create: async data => { messages.push(data); return data; }}}
};
globalThis.ui = {notifications: {info: () => {}, warn: () => {}}};

const {assetItemData, assetRows21, barangRows21, raiseAsset21, ingestBarang21, ejectBarang21} = await import("../scripts/assets21.mjs");

function makeActor(items, {xp = 20, esoteric = []} = {}) {
  const source = {xp, esoteric, assets: []};
  return {name: "Test", items: {contents: items, get: id => items.find(item => item.id === id)},
    toObject: () => ({system: structuredClone(source)}),
    async update(changes) { for (const [key, value] of Object.entries(changes)) source[key.replace(/^system\./, "")] = value; return true; },
    async updateEmbeddedDocuments(type, updates) {
      for (const update of updates) { const item = items.find(entry => entry.id === update._id); for (const [key, value] of Object.entries(update)) if (key !== "_id") item.system[key.replace(/^system\./, "")] = value; }
      return updates;
    },
    get source() { return source; }};
}

test("rows of the older Asset list become Asset item data", () => {
  const data = assetItemData({key: "debt", name: "Caishen & Co.", stars: 3, notes: "Two payments missed"});
  assert.deepEqual([data.name, data.type, data.system.key, data.system.stars, data.system.detail], ["Debt", "asset", "debt", 3, "Caishen & Co."]);
  assert.match(data.system.description, /Two payments missed/);
  assert.match(data.system.source, /p\.44$/);
  assert.equal(assetItemData({key: "custom", name: "Old Family Name", stars: 1}).name, "Old Family Name");
});

test("Asset rows show the Star range and the XP for the next Star; raising spends 4 × the new Star", async () => {
  const frame = {id: "a1", type: "asset", name: "Mountain Frame", sort: 0, system: {key: "mountainFrame", stars: 1, detail: ""}};
  const port = {id: "a2", type: "asset", name: "Spine Terminal Port", sort: 1, system: {key: "spineTerminalPort", stars: 2, detail: ""}};
  const actor = makeActor([frame, port]);
  const rows = assetRows21(actor);
  assert.deepEqual(rows.map(row => [row.name, row.range, row.canRaise, row.cost]), [["Mountain Frame", "✦–✦✦✦", true, 8], ["Spine Terminal Port", "✦✦", false, null]]);
  await raiseAsset21(actor, frame);
  assert.deepEqual([frame.system.stars, actor.source.xp], [2, 12]);
  await assert.rejects(() => raiseAsset21(actor, port), /cannot go above 2 Stars/);
  await assert.rejects(() => raiseAsset21(makeActor([frame], {xp: 3}), frame), /costs 12 XP/);
});

test("ingesting a Barang ejects the previous one and can grant its Cultivation at ✦✦", async () => {
  const wyrm = {id: "b1", type: "barang", name: "Sky Dancing Wyrm", sort: 0, system: {sect: "Dracontine", cultivation: "Heaven Raving Dragon", weapons: "Daggers, Polearms", ingested: true}};
  const spider = {id: "b2", type: "barang", name: "Six-Armed Asura Spider", sort: 1, system: {sect: "Asuri", cultivation: "Devil Tiger Blade", weapons: "Swords", ingested: false}};
  const actor = makeActor([wyrm, spider], {esoteric: [{name: "Heaven Raving Dragon", value: 3, core: "phy"}]});
  formValues = {grant: true};
  await ingestBarang21(actor, spider);
  assert.deepEqual([wyrm.system.ingested, spider.system.ingested], [false, true]);
  assert.deepEqual(actor.source.esoteric.map(entry => [entry.name, entry.value]), [["Heaven Raving Dragon", 3], ["Devil Tiger Blade", 2]]);
  assert.deepEqual(barangRows21(actor).map(row => row.ingested), [false, true]);
  await ejectBarang21(actor, spider);
  assert.equal(spider.system.ingested, false);
  assert.equal(actor.source.esoteric.length, 2, "ejecting keeps what was Cultivated");
  await assert.rejects(() => ejectBarang21(actor, spider), /not ingested/);
});
