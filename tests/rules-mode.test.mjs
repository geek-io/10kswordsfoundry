import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

// 2.1 mode keeps the 2.0.3 material out of sight. Static checks plus a minimal Foundry stand-in; not a live Foundry test.
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("system.json"));
let mode = "2.1";
const packs = manifest.packs.map(pack => ({collection: `10kswordsfoundry.${pack.name}`, documentName: pack.type, visible: true, metadata: {label: pack.label, packageName: "10kswordsfoundry"},
  getIndex: async () => [{_id: "x", name: `${pack.name} item`, type: "gear", system: {}}]}));
globalThis.game = {settings: {get: () => mode}, items: {contents: []}, packs, user: {}};

const {isLegacyPack20, keepsRules20, pinExistingWorld20, registerRulesSetting} = await import("../scripts/rules-version.mjs");
const {libraryEntries, clearLibraryCache} = await import("../scripts/library-service.mjs");
const {CORES} = await import("../scripts/rules21.mjs");

test("the eight 2.0.3 compendia are recognised by their label, and only those", () => {
  const legacy = packs.filter(isLegacyPack20).map(pack => pack.collection.split(".")[1]).toSorted();
  assert.deepEqual(legacy, ["grimoire-traits", "jobs", "non-sect-items", "sect-equipment", "sect-licenses", "sect-magicks", "sect-technicks", "worldbeing-traits"]);
  assert.equal(packs.length - legacy.length, 13, "the twelve 2.1 item compendia and the Bestiary stay");
  assert.equal(isLegacyPack20({metadata: {label: "My Homebrew · Rules 2.0.3", packageName: "world"}}), false, "a world's own pack is never hidden");
  assert.equal(isLegacyPack20(null), false);
});

test("the Compendium Browser leaves the 2.0.3 catalogs out under 2.1 and lists them under 2.0.3", async () => {
  mode = "2.1"; clearLibraryCache();
  const under21 = (await libraryEntries()).rows.map(row => row.source);
  assert.equal(under21.length, 12); assert.ok(!under21.some(label => /2\.0\.3/.test(label)));
  mode = "2.0"; clearLibraryCache();
  assert.equal((await libraryEntries()).rows.length, 20);
});

test("the 2.1 sheet shows the 2.1 rulebook's own picture on each Core (pp.28-29), in the printed colour", () => {
  assert.match(read("scripts/sheet21.mjs"), /icon: `systems\/10kswordsfoundry\/assets\/cores21\/\$\{key\}\.png`/);
  // The first palette entries of each PNG are not reliable to parse here; the files are checked for presence and distinctness.
  const sums = Object.keys(CORES).map(key => createHash("md5").update(readFileSync(new URL(`../assets/cores21/${key}.png`, import.meta.url))).digest("hex"));
  assert.equal(new Set(sums).size, 6, "six different pictures, one per Core key");
  assert.deepEqual(Object.keys(CORES), ["phy", "mot", "mnd", "wit", "voc", "spi"]);
  assert.match(read("templates/actor-21.hbs"), /class="r21-roll r21-core-symbol" data-action="check21" data-core="\{\{key\}\}"[^>]*><img src="\{\{icon\}\}" alt="\{\{label\}\} symbol">/);
});

test("2.0.3-only parts of the sheets are tagged and hidden only in 2.1 mode", () => {
  const item = read("templates/item.hbs"), actor = read("templates/actor-21.hbs"), css = read("styles/rules21.css");
  assert.match(item, /<section class="sheet-body\{\{#if rules21\}\} rules21-mode\{\{\/if\}\}">/);
  for (const legend of ["Upgrade", "Affinity \\(optional\\)", "Attack profile", "Optional enhancement", "Special Abilities"]) assert.match(item, new RegExp(`<fieldset data-rules20[^>]*><legend>${legend}</legend>`));
  assert.match(item, /<section data-rules20><h2>Mods<\/h2>/);
  for (const name of ["system.slots", "system.armor", "system.attackPool", "system.defensePool", "system.consumable.apCost"]) assert.match(item, new RegExp(`<label data-rules20>[^<]*<(?:input|select)[^>]*name="${name.replaceAll(".", "\\.")}"`));
  for (const kept of ["Rules 2\\.1 · Weapon", "Ammo", "Gear Slot", "Ability costs", "Area Template", "Equipping"]) assert.match(item, new RegExp(`<fieldset(?! data-rules20)[^>]*><legend>${kept}</legend>`), `${kept} stays`);
  assert.match(css, /\.swords \.sheet-body\.rules21-mode \[data-rules20\]\{display:none !important;\}/);
  assert.doesNotMatch(actor, /2\.0\.3 Job|2\.0\.3 sheet|2\.0\.3 catalog/);
  assert.match(actor, /\{\{#if licenses\}\}<section data-panel="combat"><h2>Licenses<\/h2>/, "the Licenses list shows only when the character still carries 2.0.3 License items");
  assert.match(read("scripts/sidebar-tools.mjs"), /isLegacyPack20\(pack\)/);
});

test("new worlds start on Rules 2.1; a world already running 2.0.3 by default is kept on it", async () => {
  const saved = globalThis.game;
  let registered, written = null;
  const world = (stored, actors, extra = {}) => { written = null; globalThis.game = {user: {id: "gm", isGM: true}, users: {activeGM: {id: "gm"}}, actors: {size: actors}, items: {size: 0},
    settings: {register: (system, key, data) => { registered = data; }, set: async (system, key, value) => { written = value; }, storage: new Map([["world", {getSetting: () => stored}]])}, ...extra}; };
  try {
    world(undefined, 0); registerRulesSetting();
    assert.equal(registered.default, "2.1"); assert.deepEqual(Object.keys(registered.choices), ["2.1", "2.0"]);
    globalThis.ui = {notifications: {info: () => {}}};
    assert.equal(await pinExistingWorld20(), false, "a new, empty world takes the 2.1 default"); assert.equal(written, null);
    world(undefined, 3); assert.equal(await pinExistingWorld20(), true); assert.equal(written, "2.0", "characters and no stored choice: it was a 2.0.3 world");
    world({key: "10kswordsfoundry.rulesVersion", value: "2.1"}, 3); assert.equal(await pinExistingWorld20(), false, "a stored choice is never touched"); assert.equal(written, null);
    world(undefined, 3, {user: {id: "p1", isGM: false}}); assert.equal(await pinExistingWorld20(), false, "only the active GM writes");
    assert.deepEqual([keepsRules20(false, 1), keepsRules20(true, 1), keepsRules20(false, 0)], [true, false, false]);
  } finally { globalThis.game = saved; delete globalThis.ui; }
});
