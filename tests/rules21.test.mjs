import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CORES, CORE_FROM_20, CULTIVATIONS_21, ASSETS_21, PARTS, partFromD6, partMaximum, partState, applyPartDamage, healingDays,
  speed, readyDice21, moraleMaximum, carryLimit, movement, stateModifiers, checkFormula21, openings, fusionOptions, staticOpenings, rangePenalty,
  firingMode, weaponProfile21, advancementCost, incapacitationDemand, addCharges, qualifiesForLicense21, derive21, openingRank, flameMaximum21, meridians21,
  namedRating21, bracketValues21, allAssets21, DAMAGE_TYPES_21, DAMAGE_TYPE_KEYS, damageOptions21,
  MANEUVERS_21, MANEUVER_KEYS, maneuverOutcome21, ticksSpeed21, flurryReadyDelay21, encumbrance21, ticks21, weaponProfile21 as profileForSpd} from "../scripts/rules21.mjs";
import {rulesVersion, usesRules21} from "../scripts/rules-version.mjs";
import {normalizeLists21} from "../scripts/sheet21.mjs";

const actor = (extra = {}) => ({cores: {phy: 3, mot: 2, mnd: 1, wit: 3, voc: 1, spi: 2}, skills: {peripheralOracle: 1, stillness: 2, thewsSinews: 2},
  parts: {}, assets: [], conditions21: {}, morale: {value: 4}, ...extra});

test("six Cores replace the 2.0 Cultivations one-to-one; thirty basic Cultivations (pp.5, 77)", () => {
  assert.deepEqual(Object.keys(CORES), ["phy", "mot", "mnd", "wit", "voc", "spi"]);
  assert.deepEqual(CORE_FROM_20, {vio: "phy", grc: "mot", dia: "mnd", sav: "wit", wrd: "voc", spi: "spi"});
  assert.equal(Object.keys(CULTIVATIONS_21).length, 30);
  assert.equal(Object.values(ASSETS_21).filter(asset => asset.code).length, 36, "the 2.1 rulebook prints all 36 d36 Assets, 11-66 (pp.211-218)");
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

test("Openings (2026-11-14 engine change): 1–3 Whiff, 4–5 Quick, 6 Solid, no die Perfect; Strikes stay 4+", () => {
  assert.deepEqual(openings([6, 6, 5, 5, 2]), {whiff: 1, quick: 2, solid: 2, perfect: 0, strikes: 4, total: 4});
  assert.deepEqual(openings([5, 4, 3, 2, 1]), {whiff: 3, quick: 2, solid: 0, perfect: 0, strikes: 2, total: 2});
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(openingRank), ["whiff", "whiff", "whiff", "quick", "quick", "solid"]);
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
  assert.equal(derived.parts.torso.max, 7 + 3 + 1);
  assert.equal(derived.speed, 9, "Hummingbird Pulse no longer adds to Speed (2.1 rulebook p.216)");
});

test("check formula keeps the nonpositive fallback", () => {
  assert.equal(checkFormula21(5), "5d6cs>=4");
  assert.equal(checkFormula21(0), "2d6kl1cs>=4");
  assert.throws(() => checkFormula21(1.5));
});

test("Speed, Morale, Carry and Basic Move (pp.10, 39, 63; Alpha p.14)", () => {
  const system = actor();
  assert.equal(speed(system), 3 + 3 + 1 + 2);
  assert.equal(speed({...system, assets: [{key: "hummingbirdPulse", stars: 3}]}), 9, "Hummingbird Pulse no longer adds to Speed (p.216)");
  assert.deepEqual([readyDice21([{key: "hummingbirdPulse", stars: 3}]), readyDice21([{key: "mountainFrame", stars: 2}]), readyDice21()], ["2d6kl1", "1d6", "1d6"]);
  assert.equal(moraleMaximum(system), 5);
  assert.equal(moraleMaximum(system, 2), 7);
  assert.equal(carryLimit(system), 40);
  assert.deepEqual(movement(system), {basic: 2, dash: 5, step: 1, swim: 1, perCut: 6, cutSeconds: 3, notes: [], overloadKg: 0, encumbrance: 0}, "book p.132: Physique 3, Motorics 2 = Basic Move 2, Dash 5, Step 1");
  assert.equal(movement(system, {cutSeconds: 6}).perCut, 12);
  assert.deepEqual(movement(system, {disabledLegs: 1}).basic, 1);
  assert.equal(movement(system, {disabledLegs: 2}).basic, 0);
  assert.equal(movement(system, {disabledLegs: 2}).dash, 0);
  assert.equal(movement(system, {carriedKg: 61}).basic, 1, "over the 40 kg limit up to x2: -2, floored at 1");
  assert.equal(movement(system, {carriedKg: 61}).encumbrance, 2);
  assert.equal(movement({...system, conditions21: {knockdown: true}}).basic, 2);
  assert.equal(movement({...system, assets: [{key: "springTendonLegs", stars: 3}]}).basic, 5);
});

test("Damage types 2.1 (Cut/Crush/Pierce/Blast/True) and partial Soak-ignore", () => {
  assert.deepEqual(DAMAGE_TYPE_KEYS, ["cut", "crush", "pierce", "blast", "true"]);
  assert.deepEqual(damageOptions21("cut"), {ignoreSoak: false, ignoreSoakUpTo: 0, reduceSoak: 0, bleeds: true});
  assert.deepEqual(damageOptions21("crush"), {ignoreSoak: false, ignoreSoakUpTo: 0, reduceSoak: 1, bleeds: false});
  assert.deepEqual(damageOptions21("pierce"), {ignoreSoak: false, ignoreSoakUpTo: 2, reduceSoak: 0, bleeds: false});
  assert.deepEqual(damageOptions21("blast"), {ignoreSoak: true, ignoreSoakUpTo: 0, reduceSoak: 1, bleeds: false});
  assert.deepEqual(damageOptions21("true"), {ignoreSoak: true, ignoreSoakUpTo: 0, reduceSoak: 0, bleeds: false});
  assert.deepEqual(damageOptions21("nonsense"), {ignoreSoak: false, ignoreSoakUpTo: 0, reduceSoak: 0, bleeds: false});
  // Part max 10, Soak 4. PIERCE ignores up to 2 Soak: 2 Soak left absorbs 2, so 6 damage lands 4.
  const pierce = applyPartDamage({max: 10, damage: 0, soak: 4}, 6, damageOptions21("pierce"));
  assert.deepEqual([pierce.absorbed, pierce.hpLoss], [2, 4]);
  // Plain damage: all 4 Soak absorbs 4, so 6 lands 2.
  const plain = applyPartDamage({max: 10, damage: 0, soak: 4}, 6);
  assert.deepEqual([plain.absorbed, plain.hpLoss], [4, 2]);
  // TRUE ignores all Soak: 6 lands 6.
  const trueHit = applyPartDamage({max: 10, damage: 0, soak: 4}, 6, damageOptions21("true"));
  assert.deepEqual([trueHit.absorbed, trueHit.hpLoss], [0, 6]);
});

test("Parts: 7 + Physique + Sidhi Stage HP (2.1 playtest 2026-11-15), Disabled at 0, Cleaved at -half maximum (Alpha p.11); Assets add HP (pp.46, 48)", () => {
  assert.deepEqual(Object.values(PARTS).map(part => part.d6), [1, 2, 3, 4, 5, 6]);
  assert.equal(partFromD6(6), "head");
  assert.equal(partMaximum("torso"), 7);
  assert.equal(partMaximum("torso", {physique: 3}), 10);
  assert.equal(partMaximum("torso", {physique: 3, sidhi: 2}), 12, "7 + Physique 3 + Sidhi Stage 2");
  assert.equal(partMaximum("head", {physique: 2, sidhi: 1, assets: [{key: "anvilHead", stars: 2}]}), 11, "7 + 2 + 1 + Anvil Head 2★");
  const frame = n => [{key: "mountainFrame", stars: n}];
  assert.deepEqual(["torso", "rarm", "head"].map(key => partMaximum(key, {assets: frame(1)})), [8, 7, 7]);
  assert.deepEqual(["torso", "rarm", "head"].map(key => partMaximum(key, {assets: frame(2)})), [8, 8, 7]);
  assert.deepEqual(["torso", "rarm", "head"].map(key => partMaximum(key, {assets: frame(3)})), [8, 8, 8]);
  assert.equal(partMaximum("head", {assets: [{key: "anvilHead", stars: 3}]}), 9);
  assert.equal(partMaximum("rarm", {bonus: 2}), 9, "SSA Red Eye Ring");
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
  assert.equal(great.ferocious, 1, "GREAT grants FEROCIOUS 1 (modifiers.mjs)");
  assert.equal(weaponProfile21({r21: {profile: "sword", damage: 2, ferocious: 3}}).ferocious, 3, "a direct FEROCIOUS rating is kept");
  assert.equal(weaponProfile21({r21: {profile: "sword", damage: 2, ferocious: 3, mods: {great: true}}}).ferocious, 3, "GREAT does not lower a higher direct rating");
  assert.equal(weaponProfile21({r21: {profile: "sword", damage: 2}}).ferocious, 0, "no FEROCIOUS without a rating or GREAT");
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
  assert.equal(derived.parts.torso.hp, 9, "7 + Physique 3 + Sidhi 0 HP, 1 damage");
  assert.equal(derived.moraleMax, 7);
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

test("the 7 Find-an-Opening maneuvers have valid opposed pools", () => {
  assert.deepEqual(MANEUVER_KEYS, ["onslaught", "volley", "analyze", "feint", "control", "throw", "disarm"]);
  for (const key of MANEUVER_KEYS) {
    const m = MANEUVERS_21[key];
    assert.ok(CORES[m.defCore], `${key} defCore`);
    assert.ok(CULTIVATIONS_21[m.defSkill], `${key} defSkill`);
    if (m.weapon) assert.ok(!m.atkCore, `${key} weapon maneuver has no fixed atkCore`);
    else { assert.ok(CORES[m.atkCore], `${key} atkCore`); assert.ok(CULTIVATIONS_21[m.atkSkill], `${key} atkSkill`); }
  }
  // Specific pools from the manuscript
  assert.equal(MANEUVERS_21.analyze.atkCore, "mnd");
  assert.equal(MANEUVERS_21.analyze.atkSkill, "concreteAnalysis");
  assert.equal(MANEUVERS_21.control.defCore, "mot");
  assert.equal(MANEUVERS_21.throw.defSkill, "thewsSinews");
});

test("maneuverOutcome21 resolves each maneuver's effect", () => {
  // Onslaught is symmetric: the loser is Off-Balanced either way.
  assert.equal(maneuverOutcome21("onslaught", 4, 2).applyToDefender, "offBalanced");
  assert.equal(maneuverOutcome21("onslaught", 4, 2).loserOffBalanced, "defender");
  assert.equal(maneuverOutcome21("onslaught", 1, 3).loserOffBalanced, "attacker");
  assert.equal(maneuverOutcome21("onslaught", 2, 2).loserOffBalanced, null);
  // Volley off-balances the target on a win.
  assert.equal(maneuverOutcome21("volley", 3, 1).applyToDefender, "offBalanced");
  assert.equal(maneuverOutcome21("volley", 1, 3).applyToDefender, null);
  // Analyze / Feint grant no condition, only the noted +2.
  assert.equal(maneuverOutcome21("analyze", 3, 1).win, true);
  assert.equal(maneuverOutcome21("feint", 1, 3).win, false);
  // Control tier by margin.
  assert.equal(maneuverOutcome21("control", 2, 1).controlTier, "a Limb");
  assert.equal(maneuverOutcome21("control", 3, 1).controlTier, "the Torso");
  assert.equal(maneuverOutcome21("control", 4, 1).controlTier, "the Head");
  assert.equal(maneuverOutcome21("control", 3, 1).applyToDefender, "control");
  assert.equal(maneuverOutcome21("control", 1, 3).applyToDefender, null);
  // Throw distance = Physique + leftover Strikes.
  assert.equal(maneuverOutcome21("throw", 5, 2, {physique: 3}).throwDistance, 6);
  assert.equal(maneuverOutcome21("throw", 2, 3, {physique: 3}).throwDistance, null);
});

test("ticksSpeed21 is 7 - the higher of Wits / Mind, plus modifiers, floored at 1", () => {
  assert.equal(ticksSpeed21(0, 0), 7);
  assert.equal(ticksSpeed21(3, 1), 4);
  assert.equal(ticksSpeed21(1, 4), 3);   // Mind counts when higher
  assert.equal(ticksSpeed21(2, 2, 2), 7); // weapon SPD modifier
  assert.equal(ticksSpeed21(9, 0), 1);   // floor
  assert.equal(ticksSpeed21(-5, -5), 7); // negatives treated as 0
});

test("flurryReadyDelay21 is Speed + 2 x flurries", () => {
  assert.equal(flurryReadyDelay21(6, 0), 6);   // no flurry = normal Speed
  assert.equal(flurryReadyDelay21(6, 3), 12);  // manuscript example: Tick 5 + 12 = 17
  assert.equal(flurryReadyDelay21(2, 2), 6);
  assert.equal(flurryReadyDelay21(6, -1), 6);  // clamps
});

test("weapon SPD, encumbrance and Recovery follow the 2.1 book", () => {
  const spd = type => profileForSpd({r21: {profile: type, mods: {}}}).spd;
  assert.deepEqual(["dagger", "saber", "sword", "bludgeon", "cleaver", "polearm", "whip", "launcher", "bow", "crossbow", "handgun", "longgun"].map(spd), [0, 2, 1, 2, 2, 2, 2, 1, 2, 2, 1, 2]);
  assert.equal(profileForSpd(null).spd, 0);
  assert.equal(encumbrance21(40, 40), 0);
  assert.equal(encumbrance21(41, 40), 2);
  assert.equal(encumbrance21(80, 40), 2);
  assert.equal(encumbrance21(81, 40), 3);
  assert.deepEqual(ticks21({cores: {wit: 1, mnd: 3}}, {weaponSpd: 2, encumbrance: 2}), {speed: 4, weaponSpd: 2, encumbrance: 2, modifier: 0, recovery: 8});
  assert.deepEqual(ticks21({cores: {wit: 3, mnd: 0}, speedBonus: -1}, {weaponSpd: 2}), {speed: 4, weaponSpd: 2, encumbrance: 0, modifier: -1, recovery: 5});
  assert.equal(ticks21({cores: {wit: 3, mnd: 0}}).recovery, 4);
});

test("Firefight (2.1 pp.119, 122): Aim, cover, out of range, halved pools, Shield and the COVER / WALL / UNBLOCKABLE mods", async () => {
  const {COVER_21, coverHits21, aimBonus21, outOfRange21, goesWide21, halvedPool21, weaponProfile21: wp, WEAPON_MODS_21} = await import("../scripts/rules21.mjs");
  assert.equal(aimBonus21(2, 4), 2); // book: start Tick 6, fire Tick 9 with +2
  assert.equal(aimBonus21(9, 3), 3, "capped at Motorics");
  assert.equal(aimBonus21(-1, 3), 0);
  assert.deepEqual(coverHits21([1, 2, 3, 4, 5, 6], "light"), [true, true, false, false, false, false]);
  assert.deepEqual(coverHits21([1, 2, 3, 4, 5, 6], "heavy"), [true, true, true, true, false, false]);
  assert.deepEqual(coverHits21([1, 6], ""), [false, false]);
  assert.deepEqual([COVER_21.light.parts, COVER_21.heavy.parts], [1, 3]);
  assert.equal(outOfRange21(31, 30), true);
  assert.equal(outOfRange21(30, 30), false);
  assert.equal(outOfRange21("", 30), false, "no distance entered");
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(goesWide21), [true, true, true, true, false, false]);
  assert.equal(halvedPool21(7), 3);
  assert.equal(halvedPool21(-2), 0);
  const shield = wp({r21: {profile: "shield"}}, {cores: {phy: 3}});
  assert.deepEqual([shield.spd, shield.cover, shield.damage, shield.range, shield.ranged], [0, "light", 3, 1, false]);
  assert.equal(wp({r21: {profile: "sword", mods: {cover: true}}}).cover, "light");
  assert.equal(wp({r21: {profile: "shield", mods: {wall: true}}}).cover, "heavy");
  assert.equal(wp({r21: {profile: "sword"}}).cover, "");
  assert.equal(wp({r21: {profile: "sword", mods: {unblockable: true}}}).unblockable, true);
  assert.equal(wp({r21: {profile: "sword", mods: {almighty: true}}}).unblockable, true);
  assert.equal(wp({r21: {profile: "sword"}}).unblockable, false);
  for (const key of ["cover", "wall", "unblockable"]) assert.ok(WEAPON_MODS_21[key]);
});

test("2.1 p.192 profile damage: Sword, Bludgeon and Polearm are Core + 1; Empty Hand deals PHYS", async () => {
  const {weaponProfile21: wp} = await import("../scripts/rules21.mjs");
  const cores = {phy: 3, mot: 2};
  const dmg = (profile, core) => wp(profile ? {r21: {profile}} : null, {cores, core}).damage;
  assert.deepEqual([dmg("dagger"), dmg("saber"), dmg("sword", "phy"), dmg("sword", "mot"), dmg("bludgeon"), dmg("cleaver"), dmg("polearm"), dmg("whip"), dmg("shield")], [2, 4, 4, 3, 4, 5, 4, 3, 3]);
  assert.deepEqual([dmg("launcher"), dmg("bow"), dmg("crossbow"), dmg("handgun"), dmg("longgun")], [2, 3, 3, 3, 4]);
  assert.equal(dmg(null), 3, "Empty Hand = PHYS");
  assert.equal(wp(null, {cores}).damageText, "PHYS");
  assert.equal(wp({r21: {profile: "sword"}}, {cores, core: "phy"}).damageText, "PHYS/MOT + 1");
  assert.equal(wp(null).damage, 1, "without Cores the old flat figure is shown");
});

test("2.1 p.202 Armor Mods: +1 Soak on covered Parts, Arm/Torso/Leg Mods never on the Head, Featherweight halves weight", async () => {
  const {ARMOR_MODS_21, ARMOR_MOD_KEYS, armorModOn21, derive21: derive, itemWeight: weigh} = await import("../scripts/rules21.mjs");
  assert.deepEqual(ARMOR_MOD_KEYS, ["breakaway", "sheathe", "reinforced", "silent", "mourningLacquer", "retributiveScript", "magnetic", "featherweight"]);
  assert.deepEqual(ARMOR_MOD_KEYS.filter(key => ARMOR_MODS_21[key].soak), ["reinforced", "mourningLacquer", "retributiveScript", "magnetic"]);
  const piece = (coverage, mod, extra = {}) => ({type: "fashion", system: {equipped: true, quantity: 1, r21: {coverage: {rleg: 0, lleg: 0, rarm: 0, larm: 0, torso: 0, head: 0, ...coverage}, mod, weight: 4, ...extra}}});
  const system = {cores: {phy: 2}, parts: {}, morale: {value: 1}};
  const vest = piece({torso: 3}, "mourningLacquer"), suit = piece({torso: 2, head: 2, larm: 2}, "retributiveScript"), cap = piece({head: 1}, "featherweight");
  const derived = derive(system, [vest, suit, cap]);
  assert.equal(derived.parts.torso.soakMax, 3 + 1 + 2 + 1);
  assert.deepEqual(derived.parts.torso.armorMods, ["mourningLacquer", "retributiveScript"]);
  assert.equal(derived.parts.larm.soakMax, 3, "the one Mod of a garment works on each Part it covers");
  assert.equal(derived.parts.head.soakMax, 2 + 1, "Retributive Script does not fit the Head");
  assert.deepEqual(derived.parts.head.armorMods, ["featherweight"]);
  assert.equal(derived.parts.rleg.soakMax, 0);
  assert.equal(armorModOn21(piece({torso: 0}, "reinforced"), "torso"), null, "only Parts the piece covers");
  assert.equal(derive(system, [{...vest, system: {...vest.system, equipped: false}}]).parts.torso.soakMax, 0);
  assert.equal(weigh([vest, cap]), 4 + 2);
});

test("Technick costs printed as a range or as alternatives are variable; MELEE WEAPON and LAUNCHER requirements are understood", async () => {
  const {technickInfo21: info, weaponRequirement21: need} = await import("../scripts/rules21.mjs");
  const item = needs => ({system: {burnArdor: 1}, flags: {"10kswordsfoundry": {sect21: {cultivation: "Vajra Fist", stars: 1, needs}}}});
  assert.deepEqual(["✹ [X], Empty Hand", "✹..., Empty Hand", "❂...", "✹ or ✹✹", "✹✹/✹✹✹/✹✹✹✹ ; SWORDS or SABERS", "✹✹; SWORDS or SABERS", "✹ + ❂❂"].map(text => info(item(text)).variable), [true, true, true, true, true, false, false]);
  const sword = {r21: {profile: "sword"}}, pistol = {r21: {profile: "handgun"}}, sling = {r21: {profile: "launcher"}};
  assert.equal(need("melee weapon", [sword]).met, true);
  assert.equal(need("melee weapon", [pistol]).met, false);
  assert.equal(need("bow, crossbow, launcher, longgun", [sling]).met, true);
  assert.equal(need("a functioning Terminal or COMP within reach", []).unknown, true, "left to the table");
});

test("2.1 pp.194-195: Affinities, Material Grades, REACH, VISCERAL and MORPH", async () => {
  const {weaponProfile21: wp, AFFINITIES_21, GRADES_21, visceralBonus21, morphOptions21, WEAPON_MODS_21} = await import("../scripts/rules21.mjs");
  const cores = {phy: 2, mot: 4, mnd: 5, wit: 1, voc: 3, spi: 6};
  const weapon = r21 => ({weaponType: "melee", r21: {profile: "saber", mods: {}, ...r21}});
  // Affinity: rolled with its Core, the weapon deals that Core's damage plus the Profile's bonus; otherwise the Profile's own Core.
  assert.deepEqual(Object.fromEntries(Object.entries(AFFINITIES_21).map(([key, a]) => [key, a.core])), {mighty: "phy", razor: "mot", esoteric: "mnd", arcane: "wit", lyrical: "voc", psionic: "spi"});
  assert.deepEqual([wp(weapon({}), {cores, core: "mot"}).damage, wp(weapon({}), {cores, core: "phy"}).damage], [3, 3], "a Saber deals PHYS + 1 whatever is rolled");
  const razor = wp(weapon({affinity: "razor"}), {cores, core: "mot"});
  assert.deepEqual([razor.damage, razor.damageText, razor.affinityCore], [5, "MOT + 1", "mot"]);
  assert.deepEqual([wp(weapon({affinity: "razor"}), {cores, core: "phy"}).damage, wp(weapon({affinity: "razor"}), {cores, core: "phy"}).damageText], [3, "PHYS + 1"]);
  assert.equal(wp(weapon({affinity: "psionic"}), {cores, core: "spi"}).damage, 7);
  assert.equal(wp(weapon({profile: "sword", affinity: "esoteric"}), {cores, core: "mnd"}).damage, 6, "Sword MND + 1");
  assert.equal(wp(weapon({profile: "sword", affinity: "esoteric"}), {cores, core: "mot"}).damage, 5, "a Sword still follows PHYS or MOT");
  assert.ok(razor.notes.some(note => note.startsWith("RAZOR:")));
  // Material Grade: Divine +1 and Immortal +2 base damage; Refined adds none.
  assert.deepEqual(["", "refined", "divine", "immortal"].map(grade => wp(weapon({grade}), {cores}).damage), [3, 3, 4, 5]);
  assert.deepEqual(Object.keys(GRADES_21), ["refined", "divine", "immortal"]);
  assert.equal(wp(weapon({grade: "divine", damageBonus: 1, mods: {great: true}}), {cores}).damage, 6);
  // REACH X adds to the Profile's range, or to a range override.
  assert.deepEqual([wp(weapon({reach: 3})).range, wp(weapon({profile: "polearm", reach: 2})).range, wp(weapon({range: 12, reach: 1})).range, wp(weapon({})).range], [4, 5, 13, 1]);
  // VISCERAL: +1 damage only when the Part has no Soak left.
  assert.ok("visceral" in WEAPON_MODS_21 && WEAPON_MODS_21.shock.startsWith("ELECTRIC"));
  assert.equal(wp(weapon({mods: {visceral: true}})).visceral, true);
  assert.deepEqual([visceralBonus21(true, 0), visceralBonus21(true, 2), visceralBonus21(false, 0), visceralBonus21(true, -1)], [1, 0, 0, 1]);
  // MORPH: every listed Profile except the current one; unknown words are ignored.
  assert.deepEqual(morphOptions21({profile: "longgun", morph: "longgun, polearm"}), ["polearm"]);
  assert.deepEqual(morphOptions21({profile: "polearm", morph: "longgun, polearm"}), ["longgun"]);
  assert.deepEqual(morphOptions21({profile: "bow", morph: "BOW/CROSSBOW/LAUNCHER/HANDGUN/LONGGUN"}), ["crossbow", "launcher", "handgun", "longgun"]);
  assert.deepEqual([morphOptions21({profile: "sword", morph: "banana, empty"}), morphOptions21({profile: "sword"})], [[], []]);
  assert.deepEqual(wp(weapon({profile: "longgun", morph: "longgun, polearm"})).morph, ["polearm"]);
  const {morphChanges21} = await import("../scripts/sheet21.mjs");
  assert.deepEqual(morphChanges21("polearm"), {"system.r21.profile": "polearm", "system.r21.grip": "haft", "system.weaponType": "melee", "system.ammoFamily": "none"});
  assert.deepEqual(morphChanges21("longgun"), {"system.r21.profile": "longgun", "system.r21.grip": "stock", "system.weaponType": "ranged", "system.ammoFamily": "gun"});
  assert.throws(() => morphChanges21("empty"));
});
