import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PROFILES, GRIPS, WEAPON_MODS_21, PART_KEYS, CORE_KEYS, ASSETS_21} from "../scripts/rules21.mjs";

const load = name => JSON.parse(readFileSync(`data/${name}.json`, "utf8"));
const manifest = JSON.parse(readFileSync("system.json", "utf8"));

test("2.1 sect compendiums are registered with their labels", () => {
  const packs = Object.fromEntries(manifest.packs.map(pack => [pack.name, pack.label]));
  assert.equal(packs["sects-21"], "2.1 Sects");
  assert.equal(packs["sect-gear-21"], "2.1 Sect Gear");
  for (const name of Object.keys(packs).filter(name => !name.endsWith("-21"))) assert.doesNotMatch(packs[name], /^2\.1/, "2.0.3 packs stay unchanged");
});

for (const name of ["sects-21", "sect-gear-21"]) {
  test(`${name}: unique ids, valid folders, sources and descriptions`, () => {
    const {folders, items} = load(name);
    const ids = new Set([...folders, ...items].map(doc => doc._id));
    assert.equal(ids.size, folders.length + items.length);
    for (const doc of [...folders, ...items]) assert.match(doc._id, /^[a-z0-9]{16}$/);
    for (const item of items) {
      assert.ok(folders.some(folder => folder._id === item.folder), item.name);
      assert.match(item.system.source, /^Rules 2\.1 \(2\.1 playtest Sects\), p\.\d{3}$/);
      assert.ok(item.system.description.length > 40, item.name);
      assert.ok(item.flags["10kswordsfoundry"].sect21.cultivation, item.name);
    }
  });
}

test("2.1 Sects (playtest Sects, 2026-11-06): 211 Technicks and Magicks across 16 Sects, costs from NEEDS", () => {
  const {folders, items} = load("sects-21");
  assert.equal(items.length, 211);
  assert.deepEqual(folders.filter(folder => !folder.folder).map(folder => folder.name), ["Asuri", "Aswang", "Dracontine", "Eskatonian", "Fangshi", "Houyi", "Imma", "Jyotisha", "Katalonan", "Mendicant", "Nezha", "Sword Dialectician", "Techgnostic", "Ultramystic", "Wukong", "Zhongkui"]);
  assert.equal(items.filter(item => item.type === "magick").length, 68);
  const byName = Object.fromEntries(items.map(item => [item.name, item]));
  assert.deepEqual([byName["Dread Devil Cutter"].system.burnArdor, byName["Dread Devil Cutter"].system.installArdor], [2, 0]);
  assert.deepEqual([byName["High Wind"].system.burnArdor, byName["High Wind"].system.installArdor], [1, 0], "the second spoilers drop the ❂");
  assert.deepEqual([byName["Hell Ripped Through with Exit Wounds"].system.burnArdor, byName["Hell Ripped Through with Exit Wounds"].system.installArdor], [2, 1]);
  assert.equal(byName["Vajra Guard"].flags["10kswordsfoundry"].sect21.stars, 2, "transcribed from the p.167 page image");
  assert.equal(byName["Dog Laughs at God"].flags["10kswordsfoundry"].sect21.cultivation, "Vajra Fist", "renamed from Fist Laughs at Fist");
  assert.deepEqual([byName["Mountain of Corpses, Seas of Blood"].system.burnArdor, byName["Mountain of Corpses, Seas of Blood"].flags["10kswordsfoundry"].sect21.stars], [6, 5], "split out of the Spiteful Disembowelment column");
  assert.ok(byName["Between Raindrops Meditation"] && byName["Seven-Star Track"]?.type === "magick");
  assert.ok(!byName["Ghost Hand Talisman"], "a talisman, filed under Sect Gear");
  assert.match(byName["Man of Steel Meditation"].system.description, /\[FACE x 5\]/);
  assert.deepEqual(byName["Adamantite Body"].system.r21, {potency: 16, castTime: "12 hours", core: "mnd", skill: "Techgnosis", bonus: 0});
  assert.deepEqual(byName["Partition"].system.r21, {potency: 3, castTime: "1 second", core: "spi", skill: "Spirit Binding", bonus: 0}, "HRT and 1s abbreviations");
  assert.equal(byName["Copper Head Iron Limbs"].system.r21.core, "phy", "PHYS + SAGE BODY");
  assert.equal(byName["Golden Bell Shield"].system.r21.core, "spi", "HEART + DIVINE COMMUNION");
  for (const item of items) assert.doesNotMatch(item.system.description, /\bArdor\b/, item.name);
  assert.deepEqual(byName["Calamity"].system.r21, {potency: 12, castTime: "6 seconds", core: "mnd", skill: "Black Sorcery", bonus: 0});
  assert.equal(byName["Scour"].system.r21.skill, "Black Sorcery", "Scour still prints the old name");
  assert.equal(byName["Calamity"].system.burnArdor, 6);
  for (const item of items.filter(item => item.type === "magick")) assert.ok(CORE_KEYS.includes(item.system.r21.core), item.name);
  for (const item of items) assert.ok(item.flags["10kswordsfoundry"].sect21.stars >= 1 && item.flags["10kswordsfoundry"].sect21.stars <= 5, item.name);
});

test("2.1 Sect Gear: profiles, grips, mods and Soak use the 2.1 data model", () => {
  const {items} = load("sect-gear-21");
  assert.equal(items.length, 41);
  for (const item of items.filter(item => item.type === "weapon")) {
    assert.ok(PROFILES[item.system.r21.profile], item.name);
    assert.ok(GRIPS[item.system.r21.grip], item.name);
    assert.deepEqual(Object.keys(item.system.r21.mods).sort(), Object.keys(WEAPON_MODS_21).sort());
  }
  for (const item of items.filter(item => item.type !== "weapon")) assert.deepEqual(Object.keys(item.system.r21.coverage).sort(), [...PART_KEYS].sort());
  const byName = Object.fromEntries(items.map(item => [item.name, item]));
  assert.equal(byName["Golden Chainmail Shirt"].system.r21.coverage.torso, 8);
  assert.deepEqual(Object.values(byName["Ultramystic Revolt Suit"].system.r21.coverage), [3, 3, 3, 3, 3, 3]);
  assert.equal(byName["Nezha Huojianqiang"].system.r21.rate, 15);
  assert.equal(byName["Nezha Huojianqiang"].system.r21.mods.auto, false);
  assert.deepEqual([byName["Sword Runner Trousers"].system.r21.coverage.rleg, byName["Nezha San Tou Liu Bi"].system.r21.coverage.lleg], [3, 2]);
  assert.equal(byName["Zhongkui Dharma Robe"].system.r21.coverage.torso, 4);
  assert.equal(byName["Immanent White Robes"].system.r21.coverage.larm, 3);
  assert.equal(byName["Zhongkui Demon Subjugating Sword"].system.r21.profile, "sword");
  assert.equal(byName["Nezha Huojianqiang"].system.weaponType, "ranged");
  assert.deepEqual(byName["Cloud Walking Boots"].effects[0].system.changes[0], {key: "system.moveBonus", type: "add", value: "3", phase: "initial", priority: 20});
});

test("2.1 Assets: the 35 d36 Assets as Asset items with their Star ranges", () => {
  const {folders, items} = load("assets-21");
  assert.equal(items.length, 35);
  assert.equal(folders.length, 6);
  const keys = Object.entries(ASSETS_21).filter(([, asset]) => asset.code);
  assert.deepEqual(items.map(item => item.system.key).sort(), keys.map(([key]) => key).sort());
  for (const item of items) {
    const info = ASSETS_21[item.system.key], flag = item.flags["10kswordsfoundry"].asset21;
    assert.equal(item.type, "asset");
    assert.equal(flag.code, info.code, item.name);
    assert.deepEqual([flag.minStars, flag.maxStars], [info.min, info.max], item.name);
    assert.equal(item.system.stars, info.min, item.name);
    assert.match(item.system.source, /^Rules 2\.1 \(2\.1 Alpha\), p\.4[4-8]$/);
    assert.ok(folders.some(folder => folder._id === item.folder));
  }
});

test("2.1 Barang: one per Sect with its Esoteric Cultivation", () => {
  const {folders, items} = load("barang-21");
  const sects = load("sects-21").folders.filter(folder => !folder.folder).map(folder => folder.name);
  assert.deepEqual(items.map(item => item.system.sect), sects);
  for (const item of items) {
    assert.equal(item.type, "barang");
    assert.equal(item.system.ingested, false);
    assert.ok(item.system.cultivation, item.name);
    assert.ok(folders.some(folder => folder._id === item.folder));
  }
  const cultivations = Object.fromEntries(items.map(item => [item.system.sect, item.system.cultivation]));
  for (const item of load("sects-21").items) assert.equal(item.flags["10kswordsfoundry"].sect21.cultivation, cultivations[item.system.sect], item.name);
});
