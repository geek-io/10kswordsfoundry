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

test("catalogs hold every item of the 2.1 rulebook (pp.186-207) and the one-shot, with sources and folders", () => {
  for (const name of Object.keys(packs)) {
    const {folders, items} = load(name);
    for (const item of items) {
      assert.match(item._id, /^[a-z0-9]{16}$/);
      assert.ok(folders.some(folder => folder._id === item.folder), item.name);
      assert.ok(item.system.source && item.system.description, item.name);
      // Everything but the carried-over one-shot gear and Fangshi concoctions cites the 303-page rulebook.
      if (!/Red Kalpa Manuscript|playtest Sects/.test(item.system.source)) {
        assert.match(item.system.source, /^Rules 2\.1 \(2\.1 rulebook\), p\.\d{3}$/, item.name);
        const page = Number(item.system.source.slice(-3));
        assert.ok(page >= 186 && page <= 207, item.name);
      }
    }
  }
  for (const name of ["HaeCo Black Iron Saber", "TDF Feathersword", "VATAC Collapsing Lance", "MORTAR TD-7 Ruyi", "MORTAR Parabellum 9mm", "YEI Three Head Crown", "Heavenly Silk Vest",
    'VATAC Adamant Ballistic Breastplate "Kongo"', "Official's Coat", "YEI Heavy Duty Gloves", "SSA Red Eye Ring", "Silkspeaker Legs", 'VATAC Adamant Ballistic Greaves "Kongo"',
    "Clean Necktie", "ELIXIR Potion", "TMNI Stingray Tail", "Demon God Black Sorcery Beads", "Fireshot", "Dart"]) assert.ok(byName[name], name);
  assert.equal(load("weapons-21").items.filter(item => item.name.endsWith("(profile)")).length, 13, "twelve Profiles and the Shield");
  assert.deepEqual(Object.keys(packs).map(name => load(name).items.length), [60, 26, 15, 12, 11]);
  assert.equal(load("goods-21").items.length, 24);
  // Renamed items keep their compendium id, so a re-import updates them in place.
  assert.deepEqual([byName["ELIXIR Potion"]._id, byName["Clean Necktie"]._id].map(id => id.length), [16, 16]);
  assert.equal(byName["TMNI Blowgun"]._id, "3a44628652d08081");
});

test("weapons use valid 2.1 profiles, grips, Rate and ammo families", () => {
  for (const item of all.filter(item => item.type === "weapon")) {
    assert.ok(PROFILES[item.system.r21.profile], item.name);
    assert.ok(GRIPS[item.system.r21.grip] || ["empty", "shield"].includes(item.system.r21.profile), item.name);
    assert.deepEqual(Object.keys(item.system.r21.mods), Object.keys(WEAPON_MODS_21), item.name);
    if (item.system.source.includes("2.1 rulebook")) assert.equal(item.system.r21.mods.artifact, false, `${item.name}: ARTIFACT is no longer printed`);
  }
  const ruyi = byName["MORTAR TD-7 Ruyi"].system;
  assert.deepEqual([ruyi.r21.rate, ruyi.r21.capacity, ruyi.r21.mods.auto, ruyi.ammoFamily], [3, 32, true, "gun"], "AUTO uses 3 bullets per Action (p.194); Capacity 32 (p.201)");
  assert.deepEqual([byName["MORTAR Parabellum 9mm"].system.r21.capacity, byName["AWW Magicite Onslaught Rifle"].system.r21.capacity, byName["MORTAR AT-CR Cudgel"].system.r21.mods.smashing], [12, 36, true]);
  assert.deepEqual([byName["MA Reaping Teppōkatana"].system.r21.ferocious, byName["TTC People's Kiem 592"].system.r21.ferocious], [2, 1]);
  assert.deepEqual([byName["TMNI Venom Balaraw"].system.r21.mods.toxic, byName["Ritual Keris"].system.r21.mods.ritual, byName["Ritual Keris"].system.r21.mods.focus], [true, true, true]);
  assert.equal(byName["Bow (profile)"].system.ammoFamily, "bow");
  assert.equal(byName["Shield (profile)"].system.r21.profile, "shield");
  // 0.2.35: Affinity, Material Grade and VISCERAL come from the printed card (2.1 pp.194-195).
  const r21 = name => byName[name].system.r21;
  assert.deepEqual([r21("AWW Longclaws").affinity, r21("HDF Cutting Logic Jian").affinity, r21("EXK Vampire Hunter").affinity, r21("Kalis").affinity], ["razor", "esoteric", "psionic", ""]);
  assert.deepEqual([r21("Ritual Keris").grade, r21("TMNI Buddhocommunist Ginunting").grade, r21("MA Stardust Wrap").grade, r21("Kalis").grade], ["divine", "immortal", "refined", ""]);
  assert.deepEqual([r21("MA Reaping Teppōkatana").mods.visceral, r21("HaeCo Folding Spear").mods.visceral, r21("Kalis").mods.visceral], [true, true, false]);
});

test("armor Soak, Morale and effects feed the 2.1 derived data", () => {
  const worn = ["Heavenly Silk Vest", 'VATAC Adamant Ballistic Greaves "Kongo"', "YEI Three Head Crown", "Clean Necktie"].map(name => ({...byName[name], system: {...byName[name].system, equipped: true}}));
  const derived = derive21({cores: {spi: 2, phy: 2}, skills: {stillness: 1}, parts: {}, assets: [], carriedKg: 0}, worn);
  // Soak is one per printed shield glyph (pp.203-206).
  assert.deepEqual([derived.parts.torso.soakMax, derived.parts.head.soakMax, derived.parts.rarm.soakMax, derived.parts.rleg.soakMax], [1, 0, 0, 2]);
  assert.equal(derived.moraleMax, 1 + 2 + 1 + 1 + 1, "1 + HRT + Stillness, +1 Crown, +1 Necktie");
  assert.equal(derived.itemKg, 8.05);
  for (const item of all.filter(item => item.type !== "weapon" && item.type !== "ammunition")) assert.deepEqual(Object.keys(item.system.r21.coverage).sort(), [...PART_KEYS].sort());
  const soak = (name, part) => byName[name].system.r21.coverage[part];
  assert.deepEqual([soak('VATAC Adamant Helm "Kongo"', "head"), soak('AWW "Genji" Visor', "head"), soak('HDF "Mingwang" Mask', "head"), soak("Working Class Headwrap", "head")], [2, 1, 3, 0]);
  assert.deepEqual([soak('HDF "Mingwang" Cuirass', "torso"), soak('AWW "Genji" Sleeves', "rarm"), soak('AWW "Genji" Sleeves', "larm"), soak("YEI Worker Bottoms", "lleg")], [3, 2, 0, 1]);
  assert.deepEqual(byName['VATAC Adamant Ballistic Breastplate "Kongo"'].effects[0].system.changes.map(change => [change.key, change.value]), [["system.moveBonus", "-1"]]);
  assert.deepEqual(byName['VATAC Adamant Helm "Kongo"'].effects[0].system.changes.map(change => [change.key, change.value]), [["system.speedBonus", "2"]]);
  assert.deepEqual([byName["Heavenly Silk Vest"].system.magCost, byName['HDF "Mingwang" Cuirass'].system.magCost, byName["SSA Angel Arm Prosthetic"].system.magCost], [399, 899999, 4000000]);
});

test("2.1 ammunition (p.193): bundles weigh and cost their full count, special ammo is sold singly", () => {
  const ammo = Object.fromEntries(load("ammunition-21").items.map(item => [item.name, item.system]));
  assert.deepEqual([ammo["Quiver of Arrows"].quantity, ammo["Quiver of Arrows"].r21.weight, ammo["Quiver of Arrows"].magCost], [15, 3, 30]);
  assert.deepEqual([ammo["Handgun Magazine (Short Bullets)"].quantity, ammo["Handgun Magazine (Short Bullets)"].r21.weight], [12, 1.2]);
  assert.deepEqual([ammo.Fireshot.ammoType, ammo.Fireshot.magCost, ammo["Impact Arrow"].ammoType, ammo.Dart.ammoType, ammo.Slingshot.ammoType], ["fireshot", 100, "bluntArrow", "dart", "bluntDart"]);
  for (const item of load("ammunition-21").items) assert.match(item.system.source, /p\.(193|201)$/, item.name);
});

test("item weights count quantity, except ammunition stacks", () => {
  assert.equal(itemWeight([{type: "gear", system: {quantity: 3, r21: {weight: 0.25}}}, {type: "ammunition", system: {quantity: 30, r21: {weight: 1}}}, {type: "license", system: {r21: {weight: 9}}}]), 1.75);
});

test("2.1 consumables heal a Part and burnt Flame; the Fangshi pills and elixirs are listed", () => {
  const potion = byName["ELIXIR Potion"].system.consumable, pill = byName["ELIXIR Chakra Pill"].system.consumable;
  assert.deepEqual(consumableRecovery21({parts: {torso: {damage: 2}}}, potion, "torso"), {"system.parts.torso.damage": 1});
  assert.deepEqual(consumableRecovery21({ardor: {burnt: 3}, morale: {value: 1}}, pill, ""), {"system.ardor.burnt": 2}, "Recover 1 burnt Flame (p.186)");
  assert.deepEqual([byName["ELIXIR Soma"].system.consumable.allHealth, byName["ELIXIR Soma"].system.consumable.allBurntArdor, byName["ELIXIR Soma"].system.magCost], [true, true, 3000000]);
  assert.deepEqual(load("consumables-21").items.map(item => item.name), ["ELIXIR Potion", "Gussio Thunderbolt Latte", "ELIXIR Magnesium Pill", "ELIXIR Chakra Pill", "ELIXIR Asura Stim", "ELIXIR Soma",
    "Healing Pill", "Antidote Pill", "Fulfilness Pill", "Fireball Pill", "Chakra Elixir", "Disguise Elixir", "Thunderbolt Elixir", "Inferno Elixir", "Five Dragons Pill"]);
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
