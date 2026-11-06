import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PROFILES, GRIPS, WEAPON_MODS_21, PART_KEYS, derive21, itemWeight} from "../scripts/rules21.mjs";
import {consumableRecovery21} from "../scripts/sheet21.mjs";

const packs = {"weapons-21": "2.1 Weapons", "armor-21": "2.1 Armor", "consumables-21": "2.1 Consumables", "accessories-21": "2.1 Accessories", "ammunition-21": "2.1 Ammunition"};
const load = name => JSON.parse(readFileSync(`data/${name}.json`, "utf8"));
const all = Object.keys(packs).flatMap(name => load(name).items);
const byName = Object.fromEntries(all.map(item => [item.name, item]));

test("every 2.1 item compendium is registered under its 2.1 label", () => {
  const manifest = JSON.parse(readFileSync("system.json", "utf8"));
  const labels = Object.fromEntries(manifest.packs.map(pack => [pack.name, pack.label]));
  for (const [name, label] of Object.entries(packs)) assert.equal(labels[name], label);
});

test("catalogs hold every item from pp.64–69 and the one-shot, with sources and folders", () => {
  for (const name of Object.keys(packs)) {
    const {folders, items} = load(name);
    for (const item of items) {
      assert.match(item._id, /^[a-z0-9]{16}$/);
      assert.ok(folders.some(folder => folder._id === item.folder), item.name);
      assert.ok(item.system.source && item.system.description, item.name);
    }
  }
  for (const name of ["HaeCo Black Iron Saber", "TDF Feathersword", "VATAC Collapsing Lance", "TD-7 Ruyi", "MORTAR Parabellum 9mm", "YEI Three Head Crown", "Heavenly Silk Vest",
    'VATAC Adamant Ballistic Breastplate "Kongo"', "Official's Coat", "YEI Heavy Duty Gloves", "SSA Red Eye Ring", "Silkspeaker Legs", 'VATAC Adamant Ballistic Greaves "Kongo"',
    "Clean Black Necktie", "ELIXIR Healing Pill"]) assert.ok(byName[name], name);
  assert.equal(load("weapons-21").items.filter(item => item.name.endsWith("(profile)")).length, 12);
});

test("weapons use valid 2.1 profiles, grips, Rate and ammo families", () => {
  for (const item of all.filter(item => item.type === "weapon")) {
    assert.ok(PROFILES[item.system.r21.profile] && GRIPS[item.system.r21.grip], item.name);
    assert.deepEqual(Object.keys(item.system.r21.mods).sort(), Object.keys(WEAPON_MODS_21).sort());
  }
  assert.deepEqual([byName["TD-7 Ruyi"].system.r21.rate, byName["TD-7 Ruyi"].system.r21.capacity, byName["TD-7 Ruyi"].system.r21.mods.auto, byName["TD-7 Ruyi"].system.ammoFamily], [30, 30, true, "gun"], "RATE 30 in the 53-page manuscript (p.33)");
  assert.deepEqual([byName["MORTAR Parabellum 9mm"].system.r21.rate, byName["MORTAR AT-CR Cudgel"].system.r21.mods.smashing], [10, true]);
  assert.equal(byName["Bow (profile)"].system.ammoFamily, "bow");
});

test("armor Soak, Morale and effects feed the 2.1 derived data", () => {
  const worn = ["Heavenly Silk Vest", 'VATAC Adamant Ballistic Greaves "Kongo"', "YEI Three Head Crown", "Clean Black Necktie"].map(name => ({...byName[name], system: {...byName[name].system, equipped: true}}));
  const derived = derive21({cores: {spi: 2, phy: 2}, skills: {stillness: 1}, parts: {}, assets: [], carriedKg: 0}, worn);
  assert.deepEqual([derived.parts.torso.soakMax, derived.parts.rarm.soakMax, derived.parts.rleg.soakMax], [2, 2, 5]);
  assert.equal(derived.moraleMax, 3 + 2 + 2);
  assert.equal(derived.itemKg, 2 + 5 + 1);
  for (const item of all.filter(item => item.type !== "weapon" && item.type !== "ammunition")) assert.deepEqual(Object.keys(item.system.r21.coverage).sort(), [...PART_KEYS].sort());
  assert.deepEqual(byName['VATAC Adamant Ballistic Breastplate "Kongo"'].effects[0].system.changes.map(change => [change.key, change.value]), [["system.cores.mot", "-2"]]);
  assert.deepEqual(byName['VATAC Adamant Ballistic Helm "Kongo"'].system.r21.coverage.head, 5);
  assert.deepEqual(byName["Puterijasa Adept Cowl"].effects[0].system.changes.map(change => [change.key, change.value]), [["system.cores.mnd", "1"], ["system.cores.spi", "1"]]);
  assert.deepEqual([byName["Official's Coat"].system.r21.coverage.rleg, byName["YEI Worker Bottoms"].system.r21.coverage.lleg], [1, 3]);
  assert.equal(byName['VATAC Adamant Ballistic Greaves "Kongo"'].effects[0].system.changes[0].key, "system.moveBonus");
});

test("item weights count quantity, except ammunition stacks", () => {
  assert.equal(itemWeight([{type: "gear", system: {quantity: 3, r21: {weight: 0.25}}}, {type: "ammunition", system: {quantity: 30, r21: {weight: 1}}}, {type: "license", system: {r21: {weight: 9}}}]), 1.75);
});

test("2.1 consumables heal a Part and burnt Flame; the playtest Sects' pills and elixirs are listed", () => {
  const pill = byName["ELIXIR Healing Pill"].system.consumable, elixir = byName["Chakra Elixir"].system.consumable;
  assert.deepEqual(consumableRecovery21({parts: {torso: {damage: 2}}}, pill, "torso"), {"system.parts.torso.damage": 1});
  assert.deepEqual(consumableRecovery21({ardor: {burnt: 3}, morale: {value: 1}}, elixir, ""), {"system.ardor.burnt": 1}, "the playtest Chakra Elixir restores 2 burnt Flame and no Morale");
  assert.equal(byName["Healing Pill"].system.consumable.health, 2);
  assert.deepEqual(load("consumables-21").items.map(item => item.name).slice(1), ["Healing Pill", "Antidote Pill", "Fulfilness Pill", "Fireball Pill", "Chakra Elixir", "Disguise Elixir", "Thunderbolt Elixir", "Inferno Elixir", "Five Dragons Pill"]);
});

test("2.1 lets several armor pieces be worn and two-handed mods take both hands; 2.0.3 keeps one Fashion slot", async () => {
  const {occupiedSlots} = await import("../scripts/slots.mjs");
  const vest = {type: "fashion", system: {equipped: true}};
  const lance = {type: "weapon", system: {equipped: true, gearSlot: "right", properties: {}, mods: [], r21: {mods: {doublehand: true}}}};
  assert.deepEqual(occupiedSlots(vest), ["fashion"]);
  assert.deepEqual(occupiedSlots(lance), ["right"]);
  globalThis.game = {settings: {get: () => "2.1"}};
  try {
    assert.deepEqual(occupiedSlots(vest), []);
    assert.deepEqual(occupiedSlots(lance), ["left", "right"]);
  } finally { delete globalThis.game; }
});
