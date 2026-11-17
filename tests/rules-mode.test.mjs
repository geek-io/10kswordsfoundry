import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

// 2.1 mode keeps the 2.0.3 material out of sight. Static checks plus a minimal Foundry stand-in; not a live Foundry test.
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("system.json"));
let mode = "2.1";
const packs = manifest.packs.map(pack => ({collection: `10kswordsfoundry.${pack.name}`, documentName: "Item", visible: true, metadata: {label: pack.label, packageName: "10kswordsfoundry"},
  getIndex: async () => [{_id: "x", name: `${pack.name} item`, type: "gear", system: {}}]}));
globalThis.game = {settings: {get: () => mode}, items: {contents: []}, packs, user: {}};

const {isLegacyPack20} = await import("../scripts/rules-version.mjs");
const {libraryEntries, clearLibraryCache} = await import("../scripts/library-service.mjs");
const {CORES} = await import("../scripts/rules21.mjs");

test("the eight 2.0.3 compendia are recognised by their label, and only those", () => {
  const legacy = packs.filter(isLegacyPack20).map(pack => pack.collection.split(".")[1]).toSorted();
  assert.deepEqual(legacy, ["grimoire-traits", "jobs", "non-sect-items", "sect-equipment", "sect-licenses", "sect-magicks", "sect-technicks", "worldbeing-traits"]);
  assert.equal(packs.length - legacy.length, 12, "the twelve 2.1 compendia stay");
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

test("the 2.1 sheet shows a picture on each Core, taken from the matching 2.0.3 Cultivation", () => {
  assert.deepEqual(Object.values(CORES).map(core => core.from).toSorted(), ["dia", "grc", "sav", "spi", "vio", "wrd"]);
  assert.match(read("scripts/sheet21.mjs"), /icon: `systems\/10kswordsfoundry\/assets\/cultivations\/\$\{core\.from\}\.png`/);
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
