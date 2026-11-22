import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PROFILES, GRIPS, WEAPON_MODS_21, PART_KEYS, CORE_KEYS, ASSETS_21, weaponProfile21, morphOptions21} from "../scripts/rules21.mjs";

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
      // Both catalogs come from the 303-page 2.1 rulebook (sects-21 in 0.2.31, Sect Gear in 0.2.32).
      assert.match(item.system.source, /^Rules 2\.1 \(2\.1 rulebook\), p\.\d{3}$/);
      const page = Number(item.system.source.slice(-3));
      assert.ok(page >= 224 && page <= 303, item.name);
      assert.ok(item.system.description.length > 40, item.name);
      assert.ok(item.flags["10kswordsfoundry"].sect21.cultivation, item.name);
    }
  });
}

test("2.1 Sects (2.1 rulebook pp.224-303): 242 Technicks and Magicks across 20 Sects, costs from NEEDS", () => {
  const {folders, items} = load("sects-21");
  assert.equal(items.length, 242);
  assert.deepEqual(folders.filter(folder => !folder.folder).map(folder => folder.name), ["Asuri", "Aswang", "Dracontine", "Eskatonian", "Fangshi", "Houyi", "Imma", "Jyotisha", "Katalonan", "Mendicant", "Nezha", "Sword Dialectician", "Techgnostic", "Ultramystic", "Wukong", "Zhongkui", "Bidadari", "Sapphire Star"].concat(["Luciferian", "Metomian"]));
  assert.equal(items.filter(item => item.type === "magick").length, 67);
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
  assert.ok(!byName["Adamantite Body"] && !byName["Lightness Technique"], "no longer printed in the 2.1 rulebook");
  assert.deepEqual(byName["Akasha Palimpsest"].system.r21, {potency: 12, castTime: "", core: "mnd", skill: "Techgnosis", bonus: 0});
  assert.equal(byName["Akasha Palimpsest"].flags["10kswordsfoundry"].sect21.weaponRequirement, "a functioning Terminal or COMP within reach", "a wrapped NEEDS row");
  assert.deepEqual([byName["Empu Sword Possibility"].system.burnArdor, byName["Phantom Arrow Multiplication"].system.burnArdor, byName["Butterfly Eyes Discipline"].system.installArdor, byName["Twin Lotus Technique"].system.installArdor], [2, 1, 1, 1], "alternative costs charge the cheapest option");
  assert.deepEqual([byName["Six Demon Cutting Sword"].system.burnArdor, byName["Six Demon Cutting Sword"].flags["10kswordsfoundry"].sect21.weaponRequirement], [1, "melee weapon"]);
  assert.match(byName["Six Demon Cutting Sword"].system.description, /ignore the SPD Modifier of GREAT or COLOSSAL weapons/);
  assert.equal(byName["On Earth We're Briefly Gorgeous"].type, "magick");
  assert.equal(byName["On Earth We're Briefly Gorgeous"].system.r21.skill, "Dual Cultivation");
  assert.equal(items.filter(item => item.system.sect === "Luciferian").length, 14);
  assert.equal(items.filter(item => item.system.sect === "Metomian").length, 12);
  assert.equal(byName["Samadhi Fire"].system.installArdor, 1);
  assert.doesNotMatch(byName["Samadhi Fire"].system.description, /t r weapon/, "decorative page text removed");
  assert.deepEqual(byName["Partition"].system.r21, {potency: 2, castTime: "", core: "spi", skill: "Spirit Binding", bonus: 0}, "Partition: Charge 2, no cast-time printed in the player-facing book");
  assert.equal(byName["Copper Head Iron Limbs"].system.r21.core, "phy", "PHYS + SAGE BODY");
  assert.equal(byName["Golden Bell Shield"].system.r21.core, "spi", "HEART + DIVINE COMMUNION");
  for (const item of items) assert.doesNotMatch(item.system.description, /\bArdor\b/, item.name);
  assert.deepEqual(byName["Calamity"].system.r21, {potency: 12, castTime: "", core: "mnd", skill: "Black Sorcery", bonus: 0});
  assert.equal(byName["Scour"].system.r21.skill, "Black Sorcery", "Scour still prints the old name");
  assert.equal(byName["Calamity"].system.burnArdor, 6);
  for (const item of items.filter(item => item.type === "magick")) assert.ok(CORE_KEYS.includes(item.system.r21.core), item.name);
  for (const item of items) assert.ok(item.flags["10kswordsfoundry"].sect21.stars >= 1 && item.flags["10kswordsfoundry"].sect21.stars <= 5, item.name);
});

test("2.1 Sect Gear: profiles, grips, mods and Soak use the 2.1 data model", () => {
  const {items} = load("sect-gear-21");
  assert.equal(items.length, 46, "44 Gear entries + the 2 Metomian weapons summoned by Technicks (0.2.46)");
  for (const item of items.filter(item => item.type === "weapon")) {
    assert.ok(PROFILES[item.system.r21.profile], item.name);
    assert.ok(GRIPS[item.system.r21.grip], item.name);
    assert.deepEqual(Object.keys(item.system.r21.mods), Object.keys(WEAPON_MODS_21), item.name);
    assert.equal(item.system.r21.mods.artifact, false, `${item.name}: ARTIFACT is no longer printed`);
  }
  for (const item of items.filter(item => item.type !== "weapon")) assert.deepEqual(Object.keys(item.system.r21.coverage).sort(), [...PART_KEYS].sort());
  const byName = Object.fromEntries(items.map(item => [item.name, item]));
  // Soak is printed as shield glyphs: one glyph = 1 Soak on each covered Part.
  assert.equal(byName["Golden Chainmail Shirt"].system.r21.coverage.torso, 0, "[SAGE BODY], set by hand");
  assert.deepEqual(Object.values(byName["Ultramystic Revolt Suit"].system.r21.coverage), [1, 1, 1, 1, 1, 1]);
  assert.equal(byName["Ultramystic Revolt Suit"].system.r21.morale, 2);
  assert.equal(byName["Nezha Huojianqiang"].system.r21.rate, 15);
  assert.equal(byName["Nezha Huojianqiang"].system.r21.mods.auto, false);
  assert.ok(!byName["Sword Runner Trousers"] && !byName["Sword Runner Jacket"], "not printed in the 2.1 rulebook");
  assert.equal(byName["Nezha San Tou Liu Bi"].system.r21.coverage.lleg, 1);
  assert.equal(byName["Zhongkui Dharma Robe"].system.r21.coverage.torso, 1);
  assert.equal(byName["Immanent White Robes"].system.r21.coverage.larm, 1);
  assert.deepEqual([byName["Interlocking Dragonsteel Helm"].system.r21.coverage.head, byName["Phoenix Feather Cap"].system.r21.coverage.head], [2, 2]);
  assert.deepEqual([byName["Katalonan Shrine Raiments"].system.ardor, byName["Katalonan Shrine Raiments"].system.r21.morale], [2, 2]);
  assert.deepEqual([byName["Asuri Kalikhadga"].system.r21.ferocious, byName["Houyi Tonggong"].system.r21.ferocious, byName["Atardar's Fang"].system.r21.ferocious], [3, 2, 2]);
  assert.deepEqual([byName["Personal Vajra"].system.r21.reach, byName["Personal Vajra"].system.r21.range, byName["Personal Vajra"].system.r21.mods.almighty, byName["Personal Vajra"].system.r21.mods.focus], [3, 0, true, true]);
  // 0.2.46: the Chakra Rod and Adamantine Noose Technicks print their weapons' cards (final book p.288).
  const rod = byName["Metomian Chakra Rod"].system, noose = byName["Metomian Adamantine Noose"].system;
  assert.deepEqual([rod.r21.profile, rod.r21.grip, rod.r21.mods.focus, rod.r21.weight], ["bludgeon", "haft", true, 1]);
  assert.deepEqual([noose.r21.profile, noose.r21.grip, noose.r21.reach, noose.r21.weight], ["whip", "hilt", 4, 0.5]);
  assert.equal(weaponProfile21(noose).range, 7, "REACH 4: Whip 3 m + 4 m");
  assert.equal(byName["Metomian Chakra Rod"].folder, byName["Personal Vajra"].folder, "Metomian / Weapons");
  // 0.2.35: Affinities, Material Grades, MORPH and VISCERAL are data, not tags (2.1 pp.194-195).
  assert.equal(weaponProfile21(byName["Personal Vajra"].system).range, 4, "REACH 3: Bludgeon 1 m + 3 m");
  assert.deepEqual([byName["Benzaiten's Drum"].system.r21.affinity, byName["Asuri Kalikhadga"].system.r21.grade, byName["Atardar's Fang"].system.r21.mods.visceral], ["lyrical", "refined", true]);
  assert.deepEqual(morphOptions21(byName["Nezha Huojianqiang"].system.r21), ["polearm"]);
  assert.deepEqual(morphOptions21(byName["Houyi Tonggong"].system.r21), ["crossbow", "launcher", "handgun", "longgun"]);
  assert.equal(byName["Benzaiten's Drum"].system.r21.range, 12);
  assert.equal(byName["Adamantite Shell"].type, "accessory");
  assert.equal(byName["Techgnostic COMP"]._id, "57c66fab9557a47c", "renamed, id kept");
  assert.equal(byName["Zhongkui Demon Subjugating Sword"].system.r21.profile, "sword");
  assert.equal(byName["Nezha Huojianqiang"].system.weaponType, "ranged");
  assert.deepEqual(byName["Cloud Walking Boots"].effects[0].system.changes[0], {key: "system.moveBonus", type: "add", value: "3", phase: "initial", priority: 20});
});

test("2.1 Assets (2.1 rulebook pp.211-218): the 36 d36 Assets as Asset items with their Star ranges", () => {
  const {folders, items} = load("assets-21");
  assert.equal(items.length, 36);
  assert.equal(folders.length, 6);
  const keys = Object.entries(ASSETS_21).filter(([, asset]) => asset.code);
  assert.deepEqual(items.map(item => item.system.key).sort(), keys.map(([key]) => key).sort());
  for (const item of items) {
    const info = ASSETS_21[item.system.key], flag = item.flags["10kswordsfoundry"].asset21;
    assert.equal(item.type, "asset");
    assert.equal(flag.code, info.code, item.name);
    assert.deepEqual([flag.minStars, flag.maxStars], [info.min, info.max], item.name);
    assert.equal(item.system.stars, info.min, item.name);
    assert.match(item.system.source, /^Rules 2\.1 \(2\.1 rulebook\), p\.21[1-8]$/);
    assert.equal(Number(item.system.source.slice(-3)), info.page, item.name);
    assert.ok(folders.some(folder => folder._id === item.folder));
  }
  const text = name => items.find(item => item.name === name).system.description;
  assert.deepEqual([ASSETS_21.hummingbirdPulse.min, ASSETS_21.hummingbirdPulse.max], [3, 3]);
  assert.match(text("Hummingbird Pulse"), /twice and take the better result/);
  assert.match(text("Python Grip"), /Control and Throw Checks/);
  assert.match(text("Beastly Claws"), /deals cut damage/);
  assert.match(text("Capital"), /\[STARS x 2000\]/);
});

test("2.1 Barang: one per Sect with its Esoteric Cultivation", () => {
  const {folders, items} = load("barang-21");
  const preview = new Set(load("sects-21").items.filter(item => item.flags["10kswordsfoundry"].sect21.preview).map(item => item.folder));
  const sects = load("sects-21").folders.filter(folder => !folder.folder && !preview.has(folder._id)).map(folder => folder.name);
  assert.deepEqual(items.map(item => item.system.sect), sects);
  for (const item of items) {
    assert.equal(item.type, "barang");
    assert.equal(item.system.ingested, false);
    assert.ok(item.system.cultivation, item.name);
    assert.ok(folders.some(folder => folder._id === item.folder));
  }
  const cultivations = Object.fromEntries(items.map(item => [item.system.sect, item.system.cultivation]));
  for (const item of load("sects-21").items.filter(item => !item.flags["10kswordsfoundry"].sect21.preview)) assert.equal(item.flags["10kswordsfoundry"].sect21.cultivation, cultivations[item.system.sect], item.name);
});
