// Rules 2.1 roll workflows: Core + Cultivation Checks, KILL THE BUDDHA, Magick Charges, Stun and Incapacitation.
import {CORES, CULTIVATIONS_21, PARTS, PART_KEYS, ATTACHMENT_STRENGTHS, checkFormula21, openings, fusionOptions, staticOpenings,
  rangePenalty, firingMode, weaponProfile21, stateModifiers, addCharges, assetStars, incapacitationDemand, partFromD6,
  applyPartDamage, partState, targetReach, openingRank, sectCultivationNames21, withoutPenalties, entersFlow, canSuppress, spendFlame21} from "./rules21.mjs?v=0.2.14";
import {confirmScorch21, deviationCheck21} from "./scorch21.mjs?v=0.2.14";
import {escapeHTML} from "./resolution.mjs?v=0.2.14";
import {occupiedSlots} from "./slots.mjs?v=0.2.14";
import {useWeapon} from "./equipment.mjs?v=0.2.14";
import {actingToken, collectTargets} from "./targeting21.mjs?v=0.2.14";
import {abilityArea, placeAbilityArea} from "./areas.mjs?v=0.2.14";

const SYSTEM = "10kswordsfoundry";
const DialogV2 = () => foundry.applications.api.DialogV2;
const int = value => Math.trunc(Number(value) || 0);
const signed = value => `${value >= 0 ? "+" : ""}${value}`;

export const activeResults = roll => roll.dice.flatMap(die => die.results.filter(r => r.active !== false && !r.discarded).map(r => r.result));

/** Skill value by key: a basic Cultivation key, or `eso:<index>` for an Esoteric Cultivation. */
export function skillRating(system, skill) {
  const rating = baseSkillRating(system, skill);
  // p.18: during Sidhi Deviation every Cultivation falls to 1.
  return system.conditions21?.deviation && rating.value > 1 ? {label: `${rating.label} (Sidhi Deviation)`, value: 1} : rating;
}

function baseSkillRating(system, skill) {
  if (!skill) return {label: "No Cultivation", value: 0};
  if (skill.startsWith("eso:")) {
    const entry = system.esoteric?.[int(skill.slice(4))];
    return entry ? {label: entry.name || "Esoteric Cultivation", value: int(entry.value)} : {label: "Unknown", value: 0};
  }
  return CULTIVATIONS_21[skill] ? {label: CULTIVATIONS_21[skill].label, value: int(system.skills?.[skill])} : {label: "Unknown", value: 0};
}

/** Finds a skill selector by key or (for Magick data) by a written Cultivation name. */
export function resolveSkill(system, written) {
  const text = String(written ?? "").trim();
  if (!text) return "";
  if (CULTIVATIONS_21[text] || text.startsWith("eso:")) return text;
  const norm = value => value.toLowerCase().replace(/[^a-z]/g, "");
  const basic = Object.entries(CULTIVATIONS_21).find(([, value]) => norm(value.label) === norm(text));
  if (basic) return basic[0];
  const names = new Set(sectCultivationNames21(text).map(norm));
  const index = (system.esoteric ?? []).findIndex(entry => names.has(norm(entry.name ?? "")));
  return index >= 0 ? `eso:${index}` : "";
}

const coreOptions = selected => Object.entries(CORES).map(([key, core]) => `<option value="${key}" ${key === selected ? "selected" : ""}>${core.label} (${core.abbr})</option>`).join("");
function skillOptions(system, selected) {
  const basic = Object.entries(CULTIVATIONS_21).map(([key, value]) => `<option value="${key}" ${key === selected ? "selected" : ""}>${value.label} (${int(system.skills?.[key])})</option>`).join("");
  const eso = (system.esoteric ?? []).map((entry, index) => `<option value="eso:${index}" ${`eso:${index}` === selected ? "selected" : ""}>${escapeHTML(entry.name || "Esoteric")} (${int(entry.value)})</option>`).join("");
  return `<option value="" ${selected ? "" : "selected"}>— Core only —</option><optgroup label="Cultivations">${basic}</optgroup>${eso ? `<optgroup label="Esoteric Cultivations">${eso}</optgroup>` : ""}`;
}

export function disabledParts(actor) {
  const derived = actor.system.r21?.parts ?? {};
  return PART_KEYS.filter(key => derived[key]?.disabled);
}

function blockedByState(actor) {
  if (actor.system.conditions21?.stunned) throw new Error("Stunned: you cannot do anything until your head clears.");
}

function stateFor(actor, core) {
  return stateModifiers(actor.system, {core, disabledTorso: !!actor.system.r21?.parts?.torso?.disabled});
}

async function evaluate(pool) {
  if (pool > 1000) throw new Error("Please use a pool of 1,000 dice or fewer.");
  const formula = checkFormula21(pool);
  const roll = await new foundry.dice.Roll(formula).evaluate();
  return {roll, formula, results: activeResults(roll)};
}

const diceHTML = results => `<div class="r21-dice">${results.toSorted((a, b) => b - a).map(value => `<span class="r21-die r21-die-${value === 6 ? "perfect" : value === 5 ? "solid" : value === 4 ? "quick" : "whiff"}">${value}</span>`).join("")}</div>`;
/** KILL THE BUDDHA dice coloured by Opening rank: 1 Whiff, 2–3 Quick, 4–5 Solid, 6 Perfect. */
const openingDiceHTML = results => `<div class="r21-dice">${results.toSorted((a, b) => b - a).map(value => `<span class="r21-die r21-die-${openingRank(value)}" title="${openingRank(value)[0].toUpperCase()}${openingRank(value).slice(1)}">${value}</span>`).join("")}</div>`;
/** Target rows with chat actions; buttons are wired by chat21.mjs. */
export function targetsHTML(targets, {respond = true} = {}) {
  if (!targets?.length) return "";
  return `<div class="r21-targets"><h4>Targets</h4><ul>${targets.map((target, index) => `<li><span class="r21-target-name">${escapeHTML(target.name)}${target.label ? ` · ${escapeHTML(target.label)}` : ""}${target.warning ? ` <strong class="r21-warning">${escapeHTML(target.warning)}</strong>` : ""}</span><span class="r21-target-actions">${respond ? `<button type="button" data-r21-action="respond" data-target="${index}">Respond: KILL THE BUDDHA</button>` : ""}<button type="button" data-r21-action="damage" data-target="${index}">Apply damage</button></span></li>`).join("")}</ul><p class="hint">A GM or the target's owner uses these buttons.</p></div>`;
}
const partsHTML = parts => parts.length ? `<ul class="r21-mods">${parts.map(part => `<li>${escapeHTML(part.label)}: ${signed(part.value)}</li>`).join("")}</ul>` : "";

async function post(actor, roll, html, flags = {}) {
  return roll.toMessage({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), flavor: `<section class="r21-chat">${html}</section>`, flags},
    {messageMode: game.settings.get("core", "messageMode")});
}

/** p.5: Core + Cultivation against Demand. */
export async function rollCheck21(actor, {core = "phy", skill = ""} = {}) {
  blockedByState(actor);
  const system = actor.system;
  const input = await DialogV2().prompt({
    window: {title: "Check · Core + Cultivation"},
    content: `<label>Core<select name="core">${coreOptions(core)}</select></label>
      <label>Cultivation<select name="skill">${skillOptions(system, skill)}</select></label>
      <label>Demand<input name="demand" type="number" min="1" step="1" value="2"></label>
      <label>Bonus / penalty dice<input name="adjustment" type="number" step="1" value="0"></label>
      <label><input type="checkbox" name="fact"> Applying an established Fact (+4, p.61)</label>
      <p class="hint">Demand 1 is routine; 6+ is nigh impossible (p.5).</p>`,
    ok: {label: "Roll", callback: (event, button) => {
      const f = button.form.elements;
      return {core: f.core.value, skill: f.skill.value, demand: Number(f.demand.value), adjustment: Number(f.adjustment.value), fact: f.fact.checked};
    }}, rejectClose: false
  });
  if (!input) return null;
  if (!CORES[input.core] || !Number.isSafeInteger(input.demand) || input.demand < 1 || !Number.isSafeInteger(input.adjustment)) throw new Error("Choose a Core, a positive Demand and whole-number adjustments.");
  const rating = skillRating(system, input.skill), state = stateFor(actor, input.core);
  const coreValue = int(system.cores?.[input.core]);
  const adjustment = state.ignorePenalties ? Math.max(0, input.adjustment) : input.adjustment;
  const pool = coreValue + rating.value + state.total + adjustment + (input.fact ? 4 : 0) + int(system.checkBonus);
  const {roll, formula, results} = await evaluate(pool);
  const strikes = results.filter(value => value >= 4).length, success = strikes >= input.demand;
  const extra = Math.max(0, strikes - input.demand);
  const flow = entersFlow(strikes, input.demand) && !system.conditions21?.samadhi;
  if (flow && actor.isOwner) await actor.update({"system.conditions21.samadhi": true});
  const html = `<h3>${CORES[input.core].label} + ${escapeHTML(rating.label)}</h3>
    <p class="r21-result ${success ? "success" : "failure"}"><strong>${strikes} Strikes</strong> vs Demand ${input.demand} — ${success ? "Success" : "Failure"}${success && extra ? ` (${extra} excess)` : ""}</p>
    ${diceHTML(results)}
    <p>Pool ${pool}: ${CORES[input.core].abbr} ${coreValue} + ${escapeHTML(rating.label)} ${rating.value}${input.fact ? " + Fact 4" : ""}${adjustment ? ` ${signed(adjustment)} adjustment` : ""}${adjustment !== input.adjustment ? " (penalty ignored in Samadhi)" : ""}. ${pool <= 0 ? `Fallback: ${formula}, only the kept die counts.` : formula}</p>${partsHTML(state.parts)}
    ${flow ? `<p class="r21-result success"><strong>Flow:</strong> Strikes reached the Demand + 3. ${escapeHTML(actor.name ?? "The Wanderer")} enters Samadhi for 3 seconds (+2 to all Checks, penalties ignored). Clear Samadhi under Conditions when it ends (Alpha p.53).</p>` : ""}`;
  return post(actor, roll, html, {[SYSTEM]: {check21: {core: input.core, skill: input.skill, strikes, demand: input.demand, success, flow}}});
}

function freeHandsForMagick(actor) {
  const held = (actor.items?.contents ?? []).filter(item => occupiedSlots(item).some(slot => ["left", "right"].includes(slot)));
  const occupied = new Set(held.flatMap(occupiedSlots));
  const free = ["left", "right"].filter(slot => !occupied.has(slot)).length;
  const focus = held.some(item => item.type === "weapon" && (item.system.r21?.mods?.focus || item.system.properties?.focus));
  if (free >= 2 || (free === 1 && focus)) return;
  throw new Error("Casting needs two free hands, or one free hand and a FOCUS (p.98).");
}

/** pp.98–99: roll the Magick's Casting Check; each Strike is a Charge until Potency is reached. */
export async function castMagick21(actor, magick, {sheet = null} = {}) {
  if (magick?.type !== "magick") throw new Error("Choose a Magick.");
  blockedByState(actor);
  if (actor.system.conditions21?.deviation) throw new Error("Sidhi Deviation: learned Magicks cannot be cast (p.18).");
  freeHandsForMagick(actor);
  const system = actor.system, r21 = magick.system.r21 ?? {};
  const burn = int(magick.system.burnArdor), potency = Math.max(1, int(r21.potency) || 1);
  if (burn > system.availableArdor && !await confirmScorch21(actor, {burn, name: magick.name})) return null;
  const sameMagick = system.casting?.itemId === magick.id;
  const held = sameMagick ? int(system.casting?.charges) : 0;
  const defaultSkill = resolveSkill(system, r21.skill);
  const input = await DialogV2().prompt({
    window: {title: `${magick.name}: Cast`},
    content: `<p>Potency <strong>${potency}</strong> · Charges held <strong>${held}</strong>${!sameMagick && int(system.casting?.charges) ? " · switching Magick abandons the other Magick's Charges" : ""}${r21.castTime ? ` · Cast Time ${escapeHTML(r21.castTime)}` : ""} · Burn ${burn} Flame when unleashed.</p>
      <label>Core<select name="core">${coreOptions(CORES[r21.core] ? r21.core : "spi")}</select></label>
      <label>Cultivation<select name="skill">${skillOptions(system, defaultSkill)}</select></label>
      <label>Bonus / penalty dice (gear, Magicks)<input name="adjustment" type="number" step="1" value="${int(r21.bonus)}"></label>
      <label><input type="checkbox" name="moving"> Moving while Casting (-2, Alpha p.4)</label>
      <p class="hint">Requires Knowledge and License, mudras (hands), mantra (voice) and time. Being forced into KILL THE BUDDHA or stopping to act loses Charges (pp.98–99).</p>`,
    ok: {label: "Cast", callback: (event, button) => ({core: button.form.elements.core.value, skill: button.form.elements.skill.value, adjustment: Number(button.form.elements.adjustment.value), moving: !!button.form.elements.moving?.checked})},
    rejectClose: false
  });
  if (!input) return null;
  if (!CORES[input.core] || !Number.isSafeInteger(input.adjustment)) throw new Error("Choose a Core and a whole-number adjustment.");
  const rating = skillRating(system, input.skill), state = stateFor(actor, input.core);
  const situational = withoutPenalties([{label: "Adjustment", value: input.adjustment}, ...(input.moving ? [{label: "Moving while Casting", value: -2}] : [])], state.ignorePenalties);
  const pool = int(system.cores?.[input.core]) + rating.value + situational.reduce((sum, mod) => sum + mod.value, 0) + state.total + int(system.checkBonus);
  const {roll, formula, results} = await evaluate(pool);
  const strikes = results.filter(value => value >= 4).length;
  const outcome = addCharges(held, strikes, potency);
  const source = actor.toObject().system;
  const update = {"system.casting": {itemId: outcome.unleashed ? "" : magick.id, charges: outcome.charges}};
  let spent = null;
  if (outcome.unleashed && burn) {
    spent = spendFlame21(source.ardor, source.scorch, {burn});
    Object.assign(update, {"system.ardor.burnt": spent.burnt, "system.scorch": spent.scorch});
  }
  if (!await actor.update(update)) throw new Error("Casting progress could not be saved.");
  let targets = [];
  if (outcome.unleashed) {
    const area = abilityArea(magick.system);
    if (area.shape !== "none" && area.size > 0) {
      try { await placeAbilityArea({sheet: sheet ?? {}, actor, name: magick.name, shape: area.shape, size: area.size, range: area.range}); }
      catch (error) { globalThis.ui?.notifications?.warn(error.message); }
    }
    targets = collectTargets(actor);
  }
  const html = `<h3>${escapeHTML(magick.name)} · Casting</h3>
    <p class="r21-result ${outcome.unleashed ? "success" : ""}"><strong>${strikes} Charges</strong> gathered · ${outcome.total} / ${potency} ${outcome.unleashed ? "— <strong>Unleashed!</strong>" : "— keep casting or abandon"}</p>
    ${diceHTML(results)}
    <p>Pool ${pool}: ${CORES[input.core].abbr} + ${escapeHTML(rating.label)}${situational.map(mod => mod.value ? ` ${signed(mod.value)} ${escapeHTML(mod.label.toLowerCase())}` : "").join("")}. ${formula}${outcome.unleashed && burn ? ` Burnt ${burn} Flame${spent?.added ? ` (${spent.added} into Scorch)` : ""}.` : ""}</p>${partsHTML(state.parts)}${targetsHTML(targets, {respond: false})}`;
  const message = await post(actor, roll, html, {[SYSTEM]: {cast21: {itemId: magick.id, strikes, total: outcome.total, potency, unleashed: outcome.unleashed, targets}}});
  if (spent?.added) await deviationCheck21(actor, spent.scorch);
  return message;
}

async function ferociousDice(sixes, limit) {
  const extra = [];
  let pending = sixes;
  while (pending > 0 && extra.length < limit) {
    const count = Math.min(pending, limit - extra.length);
    const roll = await new foundry.dice.Roll(`${count}d6`).evaluate();
    const values = activeResults(roll);
    extra.push(...values);
    pending = values.filter(value => value === 6).length;
  }
  return extra;
}

async function randomParts(count) {
  if (count < 1) return [];
  const roll = await new foundry.dice.Roll(`${count}d6`).evaluate();
  return activeResults(roll).map(value => partFromD6(value)).filter(Boolean);
}

/** pp.22–38: KILL THE BUDDHA — the attack check, rolled by every participant. */
export async function killTheBuddha(actor, {weaponId = "", targets: chosenTargets, source: chosenSource} = {}) {
  blockedByState(actor);
  const system = actor.system;
  if (system.conditions21?.juggled) throw new Error("Juggled: you have no Openings in this KILL THE BUDDHA (p.35).");
  const weapons = (actor.items?.contents ?? []).filter(item => item.type === "weapon" && item.system.equipped);
  const chosen = weapons.find(weapon => weapon.id === weaponId) ?? null;
  const preview = weaponProfile21(chosen?.system ?? null);
  const ammo = (actor.items?.contents ?? []).filter(item => item.type === "ammunition").map(item => `<option value="${item.id}">${escapeHTML(item.name)} (${item.system.quantity})</option>`).join("");
  const source = chosenSource ?? actingToken(actor);
  const aimed = collectTargets(actor, {source, tokens: chosenTargets});
  const measured = aimed.find(target => target.distance !== null)?.distance;
  const aimedHTML = aimed.length ? `<p class="hint">Targets: ${aimed.map(target => `${escapeHTML(target.name)}${target.distance !== null ? ` (${target.distance} m)` : ""}`).join(", ")}${source ? "" : " · select your own token to measure distance"}.</p>` : `<p class="hint">No targets. Target tokens (T) first to measure distance and apply damage from the chat card.</p>`;
  const select = (name, options) => `<select name="${name}">${options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select>`;
  const input = await DialogV2().prompt({
    classes: ["swords-attack-dialog"], position: {width: 620, height: 700}, window: {title: "KILL THE BUDDHA", resizable: true},
    content: `<fieldset class="attack-group"><legend>Weapon &amp; pool</legend><div class="attack-fields">
      <label>Weapon<select name="weaponId"><option value="">Empty Hand (1 damage)</option>${weapons.map(weapon => `<option value="${weapon.id}" ${weapon.id === chosen?.id ? "selected" : ""}>${escapeHTML(weapon.name)} · ${weaponProfile21(weapon.system).label}</option>`).join("")}</select></label>
      <label>Core<select name="core">${coreOptions(preview.core)}</select></label>
      <label>Cultivation<select name="skill">${skillOptions(system, preview.skill)}</select></label>
      <label>Bonus / penalty dice<input name="adjustment" type="number" step="1" value="0"></label></div>
      ${aimedHTML}<p class="hint">Physique + Beast Shrine to strike or parry; Motorics + Beast Shrine to move or dodge; Motorics + Hand-Eye Coordination to shoot (p.22).</p></fieldset>
      <fieldset class="attack-group"><legend>Ranged (Firefight, p.29)</legend><div class="attack-fields">
      <label>Distance (m)<input name="distance" type="number" min="0" step="any" value="${measured ?? ""}"></label>
      <label>Firing mode${select("mode", [["shoot", "Shoot"], ["burst", "Burst (+Rate dice)"], ["full", "Full Auto (+Rate×3 dice)"], ["suppress", "Suppression Fire (Rate 15+, Alpha p.10)"]])}</label>
      <label>Shots (Shoot, up to Rate)<input name="shots" type="number" min="1" step="1" value="1"></label>
      <label>Shoot Demand (+1 damage when exceeded)<input name="demand" type="number" min="1" step="1" value="1"></label>
      <label>Ammo<select name="ammoId"><option value="">Use weapon selection</option>${ammo}</select></label>
      <label>Cover (ranged only)${select("cover", [["0", "None"], ["-2", "Light cover (-2)"], ["-4", "Heavy cover (-4)"]])}</label></div></fieldset>
      <fieldset class="attack-group"><legend>Situation (pp.13, 33–35)</legend><div class="attack-fields">
      <label>Height${select("height", [["0", "Level"], ["-1", "Steps / gentle slope (-1)"], ["-2", "Spiral steps / steep slope (-2)"], ["-3", "Unclimbable / ladder (-3)"]])}</label>
      <label>Unstable terrain${select("unstable", [["0", "Stable"], ["-1", "Unstable (-1)"], ["-2", "Very unstable (-2)"], ["-3", "Treacherous (-3)"]])}</label></div>
      <div class="attack-options">
      <label class="attack-option"><input type="checkbox" name="impaired"> Impaired senses (-2)</label>
      <label class="attack-option"><input type="checkbox" name="lowLight"> Low light (-2 to anything that needs sight)</label>
      <label class="attack-option"><input type="checkbox" name="mud"> Knee-deep water or mud (-2)</label>
      <label class="attack-option"><input type="checkbox" name="juggledTarget"> Target is Juggled (+2)</label>
      <label class="attack-option"><input type="checkbox" name="ambush"> Ambush: Strikes damage one Part (p.36)</label>
      ${actor.type === "npc" ? '<label class="attack-option"><input type="checkbox" name="static"> Gambits: predetermined Openings, Quick → Quick → Solid → Perfect per die (p.17)</label>' : ""}
      </div><label>Ambush / called Part${select("part", [["", "—"], ...PART_KEYS.map(key => [key, PARTS[key].label])])}</label></fieldset>`,
    ok: {label: "KILL THE BUDDHA", callback: (event, button) => {
      const f = button.form.elements, num = name => Number(f.namedItem(name)?.value ?? 0), on = name => f.namedItem(name)?.checked ?? false;
      return {weaponId: f.weaponId.value, core: f.core.value, skill: f.skill.value, adjustment: num("adjustment"), distance: f.distance.value, mode: f.mode.value,
        shots: num("shots"), demand: num("demand"), ammoId: f.ammoId.value, cover: num("cover"), height: num("height"), unstable: num("unstable"),
        impaired: on("impaired"), lowLight: on("lowLight"), mud: on("mud"), juggledTarget: on("juggledTarget"), ambush: on("ambush"), static: on("static"), part: f.part.value};
    }}, rejectClose: false
  });
  if (!input) return null;
  if (!CORES[input.core] || !Number.isSafeInteger(input.adjustment)) throw new Error("Choose a Core and whole-number adjustments.");
  const weapon = input.weaponId ? actor.items.get(input.weaponId) : null;
  if (input.weaponId && (weapon?.type !== "weapon" || !weapon.system.equipped)) throw new Error("Equip this weapon before attacking.");
  const profile = weaponProfile21(weapon?.system ?? null);
  if (input.mode === "suppress" && profile.ranged) return suppressionFire(actor, weapon, profile, input);
  const mods = [];
  if (profile.bonus) mods.push({label: "Weapon modifiers (GREAT/COLOSSAL/ARTIFACT)", value: profile.bonus});
  let fire = {dice: 0, shots: 1, random: false, label: "Melee"};
  if (profile.ranged) {
    fire = firingMode(input.mode, {rate: profile.rate, auto: profile.auto, distance: input.distance});
    if (input.mode === "shoot") {
      if (!Number.isSafeInteger(input.shots) || input.shots < 1 || input.shots > profile.rate) throw new Error(`Shots must be between 1 and the weapon's Rate (${profile.rate}).`);
      fire.shots = input.shots;
    }
    if (fire.dice) mods.push({label: fire.label, value: fire.dice});
    const range = rangePenalty(input.distance === "" ? NaN : input.distance, profile.range);
    if (range.value) mods.push({label: `Range ${range.label}`, value: range.value});
    if (input.cover) mods.push({label: "Cover", value: input.cover});
  }
  for (const [key, label, value] of [["impaired", "Impaired senses", -2], ["lowLight", "Low light", -2], ["mud", "Water or mud", -2], ["juggledTarget", "Target Juggled", 2]]) if (input[key]) mods.push({label, value});
  if (input.height) mods.push({label: "Height", value: input.height});
  if (input.unstable) mods.push({label: "Unstable terrain", value: input.unstable});
  if (input.adjustment) mods.push({label: "Adjustment", value: input.adjustment});
  const state = stateFor(actor, input.core);
  if (state.ignorePenalties) mods.splice(0, mods.length, ...withoutPenalties(mods, true));
  const rating = skillRating(system, input.skill), coreValue = int(system.cores?.[input.core]);
  const pool = coreValue + rating.value + mods.reduce((sum, mod) => sum + mod.value, 0) + state.total + int(system.checkBonus) + int(system.attackBonus);

  const perform = async () => {
    let roll, formula, results, counts;
    if (input.static) {
      roll = await new foundry.dice.Roll("0").evaluate();
      results = []; formula = "static"; counts = staticOpenings(pool);
    } else {
      ({roll, formula, results} = await evaluate(pool));
      if (profile.ferocious) {
        const extra = await ferociousDice(results.filter(value => value === 6).length, profile.ferocious);
        if (extra.length) { results = [...results, ...extra]; mods.push({label: `FEROCIOUS extra dice (${extra.join(", ")})`, value: 0}); }
      }
      counts = openings(results);
    }
    const fusion = fusionOptions(counts);
    const damage = profile.damage + (profile.ranged && input.mode === "shoot" && counts.strikes > Math.max(1, input.demand) ? 1 : 0);
    const randomKeys = fire.random ? await randomParts(counts.strikes) : [];
    const random = randomKeys.map(key => PARTS[key].label);
    const targets = aimed.map(target => {
      const distance = target.distance ?? (aimed.length === 1 && input.distance !== "" ? Number(input.distance) : null);
      const reach = targetReach(profile, distance);
      return {...target, distance: reach.distance, label: reach.label, warning: reach.warning};
    });
    const html = `<h3>KILL THE BUDDHA · ${escapeHTML(weapon?.name ?? "Empty Hand")}</h3>
      <div class="r21-openings"><span class="r21-open quick">${counts.quick} Quick</span><span class="r21-open solid">${counts.solid} Solid</span><span class="r21-open perfect">${counts.perfect} Perfect</span><span class="r21-open whiff">${counts.whiff} Whiff</span></div>
      ${input.static ? `<p>Gambit Openings: one per die of pool ${pool}, in the sequence Quick → Quick → Solid → Perfect.</p>` : openingDiceHTML(results)}
      <p>Pool ${pool}: ${CORES[input.core].abbr} ${coreValue} + ${escapeHTML(rating.label)} ${rating.value}. ${input.static ? "" : formula}</p>${partsHTML([...mods.filter(mod => mod.value || mod.label.startsWith("FEROCIOUS")), ...state.parts])}
      <p><strong>${profile.label}</strong>: ${damage} damage per damaging Opening${profile.ranged ? ` · Range ${profile.range} m · Rate ${profile.rate} · ${fire.label}, ${fire.shots} shot(s)` : ` · Reach ${profile.range} m`}.</p>
      ${profile.notes.map(note => `<p class="hint">${escapeHTML(note)}</p>`).join("")}
      ${input.ambush ? `<p><strong>Ambush:</strong> each Strike deals ${damage} damage to ${escapeHTML(PARTS[input.part]?.label ?? "the Part named before the Ambush")} immediately.</p>` : ""}
      ${random.length ? `<p><strong>Random hit locations</strong> (every Strike must deal damage, no aiming): ${random.map(escapeHTML).join(", ")}.</p>` : ""}
      <details><summary>Resolving Openings</summary><ul>
      <li>Each die is an Opening: 1 Whiff, 2–3 Quick, 4–5 Solid, 6 Perfect. Quick Openings resolve first, then Solid, then Perfect (p.10).</li>
      <li>Counter with an Opening of equal or greater rank; Solid vs Quick or Perfect vs Solid is a Greater Counter (+Quick); Perfect vs Quick is an Overwhelming Counter (+Solid) (pp.26–27).</li>
      <li>Fuse two equal Openings into the next rank: up to ${fusion.quickToSolid} Quick→Solid, ${fusion.solidToPerfect} Solid→Perfect (p.25). Cultivators may burn 1 Sidhi to upgrade an Opening or turn a Whiff into a Quick (p.26).</li>
      </ul></details>${targetsHTML(targets)}`;
    const message = await post(actor, roll, html, {[SYSTEM]: {ktb: {...counts, weapon: weapon?.name ?? "Empty Hand", damage, pool, randomParts: random, randomKeys,
      targets, attackerToken: source?.document?.uuid ?? "", attacker: actor.uuid ?? "", crushing: profile.crushing, part: input.part}}});
    return message;
  };
  const shots = profile.ranged ? fire.shots ?? 1 : 0;
  if (weapon && profile.ranged) return useWeapon(actor, weapon.id, () => perform(), input.ammoId ?? "", Math.max(1, shots));
  return perform();
}

/** Alpha p.10: Suppression Fire. No Openings are rolled; everyone in the marked 3 m wide area tests their nerve. */
async function suppressionFire(actor, weapon, profile, input) {
  if (!canSuppress(profile)) throw new Error(`Suppression Fire needs a ranged weapon with a Rate of 15 or higher (${weapon?.name ?? "this weapon"} has Rate ${profile.rate}).`);
  const targets = collectTargets(actor);
  const perform = async () => foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}),
    content: `<section class="r21-chat"><h3>Suppression Fire · ${escapeHTML(weapon.name)}</h3>
      <p>Marks a 3 m wide area, up to the weapon's range (${profile.range} m). ${profile.rate} rounds spent.</p>
      <ul class="r21-mods"><li>Everyone inside makes a <strong>Heart + Stillness Check vs Demand 3</strong>.</li>
      <li>Failure: duck into cover or run out of the area and become <strong>Suppressed</strong> (no other action for 3 seconds or until the Cut ends).</li>
      <li>Success: may run out of the area with Movement left this Cut; otherwise take ${profile.damage} weapon damage to four random Parts.</li></ul>
      ${targetsHTML(targets, {respond: false})}</section>`,
    flags: {[SYSTEM]: {suppression21: {weapon: weapon.name, damage: profile.damage, targets}}}});
  return useWeapon(actor, weapon.id, () => perform(), input.ammoId ?? "", Math.max(1, profile.rate));
}

/** p.14: Head damage forces a Stun Check (Heart + Stillness). Anvil Head adds dice (p.48). */
export async function stunCheck(actor) {
  const system = actor.system, assets = system.r21?.assets ?? system.assets;
  const input = await DialogV2().prompt({window: {title: "Stun Check"}, content: `<p>Heart + Stillness${assetStars(assets, "anvilHead") ? ` + Anvil Head ${assetStars(assets, "anvilHead")}` : ""}. The manuscript gives no Demand; the Intercessor sets it.</p><label>Demand<input name="demand" type="number" min="1" step="1" value="1"></label>`,
    ok: {label: "Roll", callback: (event, button) => Number(button.form.elements.demand.value)}, rejectClose: false});
  if (!input) return null;
  if (!Number.isSafeInteger(input) || input < 1) throw new Error("Demand must be a positive whole number.");
  const pool = int(system.cores?.spi) + int(system.skills?.stillness) + assetStars(assets, "anvilHead") + stateFor(actor, "spi").total;
  const {roll, results} = await evaluate(pool);
  const strikes = results.filter(value => value >= 4).length, success = strikes >= input;
  if (!success) await actor.update({"system.conditions21.stunned": true});
  return post(actor, roll, `<h3>Stun Check</h3><p class="r21-result ${success ? "success" : "failure"}"><strong>${strikes} Strikes</strong> vs Demand ${input} — ${success ? "keeps their head" : "Stunned: cannot do anything for 3 seconds"}</p>${diceHTML(results)}`);
}

/** p.14: spend 1 Morale; Heart + Adamance vs 2 + Disabled Parts to keep fighting. */
export async function incapacitationCheck(actor) {
  const system = actor.system, source = actor.toObject().system;
  if (int(source.morale?.value) < 1) throw new Error("No Morale remains to spend on an Incapacitation Check.");
  const disabled = disabledParts(actor), demand = incapacitationDemand(disabled.length);
  const ok = await DialogV2().confirm({window: {title: "Keep fighting?"}, content: `<p>Spend 1 Morale to roll Heart + Adamance against Demand ${demand} (2 + ${disabled.length} Disabled Parts)?</p>`, rejectClose: false});
  if (!ok) return null;
  await actor.update({"system.morale.value": int(source.morale.value) - 1});
  const pool = int(system.cores?.spi) + int(system.skills?.adamance) + stateFor(actor, "spi").total;
  const {roll, results} = await evaluate(pool);
  const strikes = results.filter(value => value >= 4).length, success = strikes >= demand;
  return post(actor, roll, `<h3>Incapacitation Check</h3><p class="r21-result ${success ? "success" : "failure"}"><strong>${strikes} Strikes</strong> vs Demand ${demand} — ${success ? "keeps fighting" : "succumbs to pain"}</p>${diceHTML(results)}<p>Spent 1 Morale. A Cultivator who spends Morale this way may enter Samadhi for 3 seconds (Alpha p.53).</p>`);
}

/** p.31 hit location table. */
export async function randomPart(actor) {
  const roll = await new foundry.dice.Roll("1d6").evaluate();
  const key = partFromD6(activeResults(roll)[0]);
  return post(actor, roll, `<h3>Hit location</h3><p><strong>${PARTS[key].label}</strong> (d6 = ${PARTS[key].d6})</p>`);
}

/** pp.31–34, 38, 66: damage removes Soak first, then HP; reports Disabled/Cleaved consequences. */
export async function damagePart(actor, partKey, {part: defaultPart = "", amount = 2, crushing = false, ignoreSoak = false, hint = ""} = {}) {
  const parts = actor.system.r21?.parts ?? {};
  const selected = PARTS[partKey] ? partKey : defaultPart;
  const input = await DialogV2().prompt({window: {title: `Apply damage · ${actor.name ?? "Target"}`},
    content: `${hint ? `<p class="hint">${escapeHTML(hint)}</p>` : ""}<label>Part<select name="part">${PART_KEYS.map(key => `<option value="${key}" ${key === selected ? "selected" : ""}>${PARTS[key].label} (HP ${parts[key]?.hp ?? "?"}, Soak ${parts[key]?.soak ?? 0})</option>`).join("")}</select></label>
      <label>Damage<input name="amount" type="number" min="1" step="1" value="${Math.max(1, int(amount) || 2)}"></label>
      <label><input type="checkbox" name="crushing" ${crushing ? "checked" : ""}> CRUSHING / Bludgeon Perfect: 2 Soak per damage</label>
      <label><input type="checkbox" name="ignoreSoak" ${ignoreSoak ? "checked" : ""}> Ignores Soak (e.g. Dagger Perfect Opening)</label>`,
    ok: {label: "Apply", callback: (event, button) => ({part: button.form.elements.part.value, amount: Number(button.form.elements.amount.value), crushing: button.form.elements.crushing.checked, ignoreSoak: button.form.elements.ignoreSoak.checked})},
    rejectClose: false});
  if (!input) return null;
  if (!PARTS[input.part] || !Number.isSafeInteger(input.amount) || input.amount < 1) throw new Error("Choose a Part and a positive whole amount of damage.");
  const derived = parts[input.part], source = actor.toObject().system.parts[input.part];
  const result = applyPartDamage({max: derived.max, damage: source.damage, soak: derived.soak}, input.amount, input);
  await actor.update({[`system.parts.${input.part}.damage`]: result.after.damage, [`system.parts.${input.part}.soakLost`]: int(source.soakLost) + result.soakLoss});
  return postDamage(actor, input.part, result);
}

export function damageConsequences(part, result) {
  const notes = [];
  if (part === "head" && result.hpLoss > 0) notes.push("Head damage: make a Stun Check (Heart + Stillness) and a Morale Check (p.14).");
  if (result.newlyDisabled) {
    notes.push("A Part is Disabled: most beings stop fighting; spend 1 Morale for an Incapacitation Check to continue (p.31).");
    if (part === "torso") notes.push("Torso Disabled: winded, -4 to all Checks.");
    if (part === "head") notes.push("Head Disabled: death.");
    if (part === "rarm" || part === "larm") notes.push("Arm Disabled: drop the weapon in that hand.");
    if (part === "rleg" || part === "lleg") notes.push("Leg Disabled: Movement halved; both legs Disabled means crawling.");
  }
  if (result.newlyCleaved) notes.push(part === "torso" || part === "head" ? "Cleaved: death." : "Cleaved off: staunch the blood flow (Mind + Succor and Triage) or bleed to death in an hour; reattaching needs thaumaturgical healing or a wrought limb (p.32; Alpha pp.10, 17).");
  return notes;
}

async function postDamage(actor, part, result) {
  const notes = damageConsequences(part, result);
  const content = `<section class="r21-chat"><h3>${escapeHTML(actor.name)} · ${PARTS[part].label}</h3><p>Soaked ${result.absorbed} (Soak −${result.soakLoss}) · HP −${result.hpLoss} → ${result.after.hp} / ${result.after.max} · <strong>${result.after.status}</strong></p>${notes.map(note => `<p>${escapeHTML(note)}</p>`).join("")}</section>`;
  return foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), content});
}

export {ATTACHMENT_STRENGTHS, partState};
// Shared with other 2.1 roll workflows (social influence).
export {evaluate as evaluate21, diceHTML as diceHTML21, partsHTML as partsHTML21, post as post21, stateFor as stateFor21, blockedByState as blockedByState21};
