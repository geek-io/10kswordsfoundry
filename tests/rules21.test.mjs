import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CORES, CORE_FROM_20, CULTIVATIONS_21, ASSETS_21, PARTS, partFromD6, partMaximum, partState, applyPartDamage, healingDays,
  speed, moraleMaximum, carryLimit, movement, stateModifiers, checkFormula21, openings, fusionOptions, staticOpenings, rangePenalty,
  firingMode, weaponProfile21, advancementCost, incapacitationDemand, addCharges, qualifiesForLicense21, derive21, openingRank, flameMaximum21, meridians21,
  namedRating21, bracketValues21, allAssets21} from "../scripts/rules21.mjs";
import {rulesVersion, usesRules21} from "../scripts/rules-version.mjs";
import {normalizeLists21} from "../scripts/sheet21.mjs";

const actor = (extra = {}) => ({cores: {phy: 3, mot: 2, mnd: 1, wit: 3, voc: 1, spi: 2}, skills: {peripheralOracle: 1, stillness: 2, thewsSinews: 2},
  parts: {}, assets: [], conditions21: {}, morale: {value: 4}, ...extra});

test("six Cores replace the 2.0 Cultivations one-to-one; thirty basic Cultivations (pp.5, 77)", () => {
  assert.deepEqual(Object.keys(CORES), ["phy", "mot", "mnd", "wit", "voc", "spi"]);
  assert.deepEqual(CORE_FROM_20, {vio: "phy", grc: "mot", dia: "mnd", sav: "wit", wrd: "voc", spi: "spi"});
  assert.equal(Object.keys(CULTIVATIONS_21).length, 30);
  assert.equal(Object.values(ASSETS_21).filter(asset => asset.code).length, 35, "[5][5] is absent from the manuscript");
});

test("the 2.0.3 ruleset stays the default when no world setting exists", () => {
  assert.equal(rulesVersion(), "2.0");
  assert.equal(usesRules21(), false);
  globalThis.game = {settings: {get: () => "2.1"}};
  assert.equal(usesRules21(), true);
  globalThis.game = {settings: {get: () => { throw new Error("not registered"); }}};
  assert.equal(rulesVersion(), "2.0");
  delete globalThis.game;
});

test("Openings (2026-11 test run): 1 Whiff, 2–3 Quick, 4–5 Solid, 6 Perfect; Strikes stay 4+", () => {
  assert.deepEqual(openings([6, 6, 5, 5, 2]), {whiff: 0, quick: 1, solid: 2, perfect: 2, strikes: 4, total: 5});
  assert.deepEqual(openings([5, 4, 3, 2, 1]), {whiff: 1, quick: 2, solid: 2, perfect: 0, strikes: 2, total: 4});
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(openingRank), ["whiff", "quick", "quick", "solid", "solid", "perfect"]);
  assert.throws(() => openings([7]));
  assert.deepEqual(fusionOptions({quick: 5, solid: 4, perfect: 0}), {quickToSolid: 2, solidToPerfect: 1, perfect: 0});
});

test("Gambits: one Opening per die in the sequence Quick → Quick → Solid → Perfect (RK p.17)", () => {
  assert.deepEqual(staticOpenings(6), {whiff: 0, quick: 4, solid: 1, perfect: 1, strikes: 2, total: 6}, "the printed 6-dice example");
  assert.deepEqual(staticOpenings(10), {whiff: 0, quick: 6, solid: 2, perfect: 2, strikes: 4, total: 10});
  assert.equal(staticOpenings(0).total, 1);
});

test("Flame and Meridians are 2 + Sidhi Stage; Face and Heart rename Voice and Spirit (RK p.52; 2026-11 test run)", () => {
  assert.deepEqual([0, 3, 6].map(flameMaximum21), [2, 5, 8]);
  assert.deepEqual([0, 3, 6].map(meridians21), [2, 5, 8]);
  assert.deepEqual([CORES.voc.label, CORES.spi.label], ["Face", "Heart"]);
  const system = actor({esoteric: []});
  assert.deepEqual(["Face", "VOICE", "Heart", "spirit"].map(name => namedRating21(system, name)), [1, 1, 2, 2]);
  assert.deepEqual(bracketValues21("[FACE x 5]m and [VOICE x 5]m", system).map(entry => entry.value), [5, 5]);
  const derived = derive21({...system, sidhi: 3}, []);
  assert.deepEqual([derived.flameMax, derived.meridians], [5, 5]);
});

test("Asset items count like the older Asset list", () => {
  const items = [{type: "asset", name: "Mountain Frame", system: {key: "mountainFrame", stars: 1}}, {type: "asset", name: "Hummingbird Pulse", system: {key: "hummingbirdPulse", stars: 2}}];
  const assets = allAssets21(actor({assets: [{key: "anvilHead", stars: 2}]}), items);
  assert.deepEqual(assets.map(asset => [asset.key, asset.stars]), [["anvilHead", 2], ["mountainFrame", 1], ["hummingbirdPulse", 2]]);
  const derived = derive21(actor(), items);
  assert.equal(derived.parts.torso.max, 3 + 3 + 1);
  assert.equal(derived.speed, 9 + 2);
});

test("check formula keeps the nonpositive fallback", () => {
  assert.equal(checkFormula21(5), "5d6cs>=4");
  assert.equal(checkFormula21(0), "2d6kl1cs>=4");
  assert.throws(() => checkFormula21(1.5));
});

test("Speed, Morale, Carry and Basic Move (pp.10, 39, 63; Alpha p.14)", () => {
  const system = actor();
  assert.equal(speed(system), 3 + 3 + 1 + 2);
  assert.equal(speed({...system, assets: [{key: "hummingbirdPulse", stars: 2}]}), 11);
  assert.equal(moraleMaximum(system), 4);
  assert.equal(moraleMaximum(system, 2), 6);
  assert.equal(carryLimit(system), 40);
  assert.deepEqual(movement(system), {basic: 5, swim: 2, perCut: 15, cutSeconds: 3, notes: [], overloadKg: 0}, "Physique 3 + Motorics 2; 15 m in a 3-second Cut");
  assert.equal(movement(system, {cutSeconds: 6}).perCut, 30);
  assert.deepEqual(movement(system, {disabledLegs: 1}).basic, 2);
  assert.equal(movement(system, {disabledLegs: 2}).basic, 0);
  assert.equal(movement(system, {carriedKg: 61}).basic, 3, "21 kg over: -2 m/s");
  assert.equal(movement({...system, conditions21: {knockdown: true}}).basic, 2);
  assert.equal(movement({...system, assets: [{key: "springTendonLegs", stars: 3}]}).basic, 8);
});

test("Parts: 3 + Physique HP, Disabled at 0, Cleaved at -half maximum (Alpha p.11); Assets add HP (RK p.14, pp.46, 48)", () => {
  assert.deepEqual(Object.values(PARTS).map(part => part.d6), [1, 2, 3, 4, 5, 6]);
  assert.equal(partFromD6(6), "head");
  assert.equal(partMaximum("torso"), 3);
  assert.equal(partMaximum("torso", {physique: 3}), 6);
  assert.equal(partMaximum("head", {physique: 2, assets: [{key: "anvilHead", stars: 2}]}), 6);
  const frame = n => [{key: "mountainFrame", stars: n}];
  assert.deepEqual(["torso", "rarm", "head"].map(key => partMaximum(key, {assets: frame(1)})), [4, 3, 3]);
  assert.deepEqual(["torso", "rarm", "head"].map(key => partMaximum(key, {assets: frame(2)})), [4, 4, 3]);
  assert.deepEqual(["torso", "rarm", "head"].map(key => partMaximum(key, {assets: frame(3)})), [4, 4, 4]);
  assert.equal(partMaximum("head", {assets: [{key: "anvilHead", stars: 3}]}), 5);
  assert.equal(partMaximum("rarm", {bonus: 2}), 5, "SSA Red Eye Ring");
  assert.deepEqual([0, 2, 3, 4, 9].map(damage => partState(3, damage).status), ["Whole", "Wounded", "Disabled", "Cleaved", "Cleaved"]);
  assert.equal(partState(3, 9).damage, 4);
  assert.deepEqual([5, 6, 7].map(damage => partState(5, damage).status), ["Disabled", "Disabled", "Cleaved"], "-2 for 5 HP");
  assert.equal(partState(5, 7).cleaveAt, -2);
  assert.equal(partState(1, 2).status, "Cleaved", "never below -1, so Disabled and Cleaved stay apart");
});

test("damage removes Soak first; Crushing costs 2 Soak; ignoring Soak goes straight to HP (pp.38, 65–66)", () => {
  assert.deepEqual((({absorbed, soakLoss, hpLoss}) => ({absorbed, soakLoss, hpLoss}))(applyPartDamage({max: 3, damage: 0, soak: 2}, 3)), {absorbed: 2, soakLoss: 2, hpLoss: 1});
  assert.deepEqual((({absorbed, soakLoss, hpLoss}) => ({absorbed, soakLoss, hpLoss}))(applyPartDamage({max: 3, damage: 0, soak: 3}, 2, {crushing: true})), {absorbed: 1, soakLoss: 2, hpLoss: 1});
  const dagger = applyPartDamage({max: 3, damage: 1, soak: 5}, 2, {ignoreSoak: true});
  assert.equal(dagger.soakLoss, 0);
  assert.equal(dagger.newlyDisabled, true);
  assert.equal(applyPartDamage({max: 3, damage: 3, soak: 0}, 4).newlyCleaved, true);
});

test("healing takes X days per point, X = current damage; doubled without rest (pp.14, 31)", () => {
  assert.deepEqual(healingDays(3), {next: 3, full: 6});
  assert.deepEqual(healingDays(3, {sheltered: false}), {next: 6, full: 12});
  assert.deepEqual(healingDays(0), {next: 0, full: 0});
});

test("state modifiers: Torso Disabled, Encumbered, Knockdown, Drunk, Bleeding on physical Checks, Fatigue", () => {
  const system = actor({conditions21: {bleeding: true, encumbered: true}, fatigue: 2});
  assert.equal(stateModifiers(system, {core: "phy"}).total, -2 - 4 - 2);
  assert.equal(stateModifiers(system, {core: "mnd"}).total, -4 - 2);
  assert.equal(stateModifiers(actor(), {disabledTorso: true}).total, -4);
  assert.equal(stateModifiers(actor({fatigue: 2, assets: [{key: "sleeplessSoul", stars: 2}]})).total, 0);
});

test("Firefight range bands and firing modes (pp.29–30)", () => {
  assert.deepEqual([10, 20, 50, 100, 200, 300, 450, 520].map(distance => rangePenalty(distance).value), [0, -1, -2, -3, -4, -5, -6, -7]);
  assert.equal(rangePenalty(40, 30).value, -2 - 4);
  assert.equal(rangePenalty("").value, 0);
  assert.deepEqual(firingMode("burst", {rate: 4, auto: true, distance: 20}).dice, 4);
  assert.deepEqual(firingMode("full", {rate: 4, auto: true}).dice, 12);
  assert.throws(() => firingMode("burst", {rate: 4, auto: false}));
  assert.throws(() => firingMode("full", {rate: 4, auto: true, distance: 31}));
});

test("weapon profiles: pools, ranges, damage and GREAT/COLOSSAL/ARTIFACT (pp.38, 64–66)", () => {
  assert.deepEqual((({key, core, skill, damage}) => ({key, core, skill, damage}))(weaponProfile21(null)), {key: "empty", core: "phy", skill: "beastShrine", damage: 1});
  const rifle = weaponProfile21({r21: {profile: "longgun", damage: 2, rate: 4, mods: {auto: true}}});
  assert.deepEqual([rifle.core, rifle.skill, rifle.range, rifle.ranged, rifle.rate, rifle.auto], ["mot", "handEye", 400, true, 4, true]);
  const great = weaponProfile21({r21: {profile: "polearm", damage: 2, mods: {great: true, artifact: true}}});
  assert.deepEqual([great.range, great.damage, great.bonus], [3, 4, 1], "ARTIFACT also deals +1 damage (RK p.32)");
  assert.equal(weaponProfile21({r21: {profile: "", damage: 2}, weaponType: "ranged"}).key, "handgun");
  assert.equal(weaponProfile21({r21: {profile: "sword", damage: 2, mods: {colossal: true}}}).damage, 4);
});

test("Sidhi Progression costs (p.9)", () => {
  assert.deepEqual(advancementCost("core", 3), {next: 4, xp: 20});
  assert.deepEqual(advancementCost("cultivation", 1), {next: 2, xp: 6});
  assert.throws(() => advancementCost("cultivation", 5));
  assert.deepEqual(advancementCost("asset", 0), {next: 1, xp: 4});
  assert.equal(advancementCost("license").xp, 10);
  assert.equal(incapacitationDemand(2), 4);
});

test("Magick Charges accumulate until Potency, then reset (p.98)", () => {
  assert.deepEqual(addCharges(0, 2, 3), {charges: 2, unleashed: false, total: 2});
  assert.deepEqual(addCharges(2, 2, 3), {charges: 0, unleashed: true, total: 4});
});

test("License prerequisites map 2.0 keys onto Cores", () => {
  const license = {prerequisites: {vio: 3, grc: 0, dia: 0, sav: 0, wrd: 0, spi: 2, sidhi: 1}};
  assert.equal(qualifiesForLicense21({cores: {phy: 3, spi: 2}, sidhi: 1}, license), true);
  assert.equal(qualifiesForLicense21({cores: {phy: 2, spi: 2}, sidhi: 1}, license), false);
  assert.equal(qualifiesForLicense21({cores: {phy: 3, spi: 2}, sidhi: 0}, license), false);
});

test("derived data reads equipped armor coverage and Morale gear", () => {
  const items = [{type: "fashion", system: {equipped: true, r21: {coverage: {torso: 2, rarm: 2, larm: 2}, morale: 2}}},
    {type: "fashion", system: {equipped: false, r21: {coverage: {torso: 5}, morale: 0}}}];
  const derived = derive21(actor({parts: {torso: {damage: 1, soakBase: 1, soakLost: 1}}}), items);
  assert.equal(derived.parts.torso.soakMax, 3);
  assert.equal(derived.parts.torso.soak, 2);
  assert.equal(derived.parts.torso.hp, 5, "3 + Physique 3 HP, 1 damage");
  assert.equal(derived.moraleMax, 6);
  assert.equal(derived.speed, 9);
  assert.deepEqual(derived.disabled, []);
});

test("indexed form lists become arrays and keep unrendered fields", () => {
  const data = {attachments: {1: {text: "B"}, 0: {text: "A", strength: 3}}, cores: {phy: 2}};
  normalizeLists21(data, {attachments: [{text: "old", strength: 2}, {text: "old2", strength: 1}]});
  assert.deepEqual(data.attachments, [{text: "A", strength: 3}, {text: "B", strength: 1}]);
  assert.deepEqual(data.cores, {phy: 2});
});

test("the 2.0.3 sheet template is unchanged", () => {
  const strip = text => text.replace(/\r\n/g, "\n");
  assert.ok(!strip(readFileSync("templates/actor.hbs", "utf8")).includes("r21"));
  assert.ok(strip(readFileSync("templates/actor-21.hbs", "utf8")).includes('data-action="ktb21"'));
});
