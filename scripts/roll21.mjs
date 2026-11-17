// Rules 2.1 roll workflows: Core + Cultivation Checks, KILL THE BUDDHA, Magick Charges, Stun and Incapacitation.
import {CORES, CULTIVATIONS_21, PARTS, PART_KEYS, ATTACHMENT_STRENGTHS, checkFormula21, openings, fusionOptions, staticOpenings,
  rangePenalty, firingMode, weaponProfile21, stateModifiers, addCharges, assetStars, incapacitationDemand, partFromD6,
  applyPartDamage, partState, targetReach, openingRank, sectCultivationNames21, withoutPenalties, entersFlow, canSuppress, spendFlame21,
  DAMAGE_TYPES_21, DAMAGE_TYPE_KEYS, damageOptions21, ARMOR_MODS_21, MANEUVERS_21, MANEUVER_KEYS, maneuverOutcome21, ticksSpeed21, flurryReadyDelay21,
  COVER_21, coverHits21, aimBonus21, outOfRange21, goesWide21, halvedPool21, visceralBonus21, strikeOptions21, strikePlan21} from "./rules21.mjs?v=0.2.40";
import {confirmScorch21, deviationCheck21} from "./scorch21.mjs?v=0.2.40";
import {escapeHTML} from "./resolution.mjs?v=0.2.40";
import {occupiedSlots} from "./slots.mjs?v=0.2.40";
import {useWeapon} from "./equipment.mjs?v=0.2.40";
import {actingToken, collectTargets} from "./targeting21.mjs?v=0.2.40";
import {ammoSummary21} from "./ammunition.mjs?v=0.2.40";
import {abilityArea, placeAbilityArea} from "./areas.mjs?v=0.2.40";

const SYSTEM = "10kswordsfoundry";
/** Which KILL THE BUDDHA engine the world uses: "openings" (default, the Quick/Solid/Perfect exchange) or "strikes" (the 2.1 Block/Dodge rewrite). */
const ktbEngine21 = () => { try { return globalThis.game?.settings?.get(SYSTEM, "ktbEngine21") ?? "openings"; } catch { return "openings"; } };
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
  return stateModifiers(actor.system, {core, disabledTorso: !!actor.system.r21?.parts?.torso?.disabled, encumbrance: actor.system.r21?.movement?.encumbrance});
}

async function evaluate(pool) {
  if (pool > 1000) throw new Error("Please use a pool of 1,000 dice or fewer.");
  const formula = checkFormula21(pool);
  const roll = await new foundry.dice.Roll(formula).evaluate();
  return {roll, formula, results: activeResults(roll)};
}

const diceHTML = results => `<div class="r21-dice">${results.toSorted((a, b) => b - a).map(value => `<span class="r21-die r21-die-${value === 6 ? "solid" : value >= 4 ? "quick" : "whiff"}">${value}</span>`).join("")}</div>`;
/** KILL THE BUDDHA dice coloured by Opening rank: 1–3 Whiff, 4–5 Quick, 6 Solid (Perfects come only from fusing two Solids). */
const openingDiceHTML = results => `<div class="r21-dice">${results.toSorted((a, b) => b - a).map(value => `<span class="r21-die r21-die-${openingRank(value)}" title="${openingRank(value)[0].toUpperCase()}${openingRank(value).slice(1)}">${value}</span>`).join("")}</div>`;
/** Target rows with chat actions; buttons are wired by chat21.mjs. */
export function targetsHTML(targets, {respond = true, spend = false} = {}) {
  if (!targets?.length) return "";
  return `<div class="r21-targets"><h4>Targets</h4><ul>${targets.map((target, index) => `<li><span class="r21-target-name">${escapeHTML(target.name)}${target.label ? ` · ${escapeHTML(target.label)}` : ""}${target.warning ? ` <strong class="r21-warning">${escapeHTML(target.warning)}</strong>` : ""}</span><span class="r21-target-actions">${respond ? `<button type="button" data-r21-action="respond" data-target="${index}">Respond: KILL THE BUDDHA</button>` : ""}${spend ? `<button type="button" data-r21-action="spend" data-target="${index}">Spend Strikes</button>` : ""}<button type="button" data-r21-action="damage" data-target="${index}">Apply damage</button></span></li>`).join("")}</ul><p class="hint">A GM or the target's owner uses these buttons.</p></div>`;
}
const partsHTML = parts => parts.length ? `<ul class="r21-mods">${parts.map(part => `<li>${escapeHTML(part.label)}: ${signed(part.value)}</li>`).join("")}</ul>` : "";

/** Defender rows for the Strikes engine: each defender Blocks or Dodges. Wired by chat21.mjs. */
function strikesTargetsHTML(targets) {
  if (!targets?.length) return `<p class="hint">Target tokens (T) first so the defender can Block or Dodge from this card.</p>`;
  return `<div class="r21-targets"><h4>Defenders</h4><ul>${targets.map((target, index) => `<li><span class="r21-target-name">${escapeHTML(target.name)}${target.label ? ` · ${escapeHTML(target.label)}` : ""}${target.warning ? ` <strong class="r21-warning">${escapeHTML(target.warning)}</strong>` : ""}</span><span class="r21-target-actions"><button type="button" data-r21-action="block" data-target="${index}">Block (your Weapon Check)</button><button type="button" data-r21-action="dodge" data-target="${index}">Dodge (Motorics + Thews And Sinews)</button></span></li>`).join("")}</ul><p class="hint">A GM or the defender's owner rolls the defense.</p></div>`;
}

/** Strikes engine: a defender Blocks (Physique + Beast Shrine) or Dodges (Motorics + Thews And Sinews). Their Strikes
 *  cancel the attacker's; any leftover land and are posted with an Apply-damage button on the defender. */
export async function resolveDefenseStrikes21(data, kind, defender, defenderToken) {
  blockedByState(defender);
  const system = defender.system;
  const block = kind === "block";
  if (block && data.unblockable) throw new Error("This attack is UNBLOCKABLE: Dodge instead.");
  // 2.1 book p.117: Block is the defender's own WEAPON CHECK; Dodge is Motorics + Thews And Sinews.
  const held = (defender.items?.contents ?? []).filter(item => item.type === "weapon" && item.system.equipped);
  const defWeapon = held.find(item => !weaponProfile21(item.system).ranged) ?? held[0] ?? null;
  const defProfile = weaponProfile21(defWeapon?.system ?? null, {cores: system.cores});
  const core = block ? defProfile.core : "mot", skill = block ? defProfile.skill : "thewsSinews";
  const label = block ? `Block · ${defWeapon?.name ?? "Empty Hand"}` : "Dodge";
  const rating = skillRating(system, skill), state = stateFor(defender, core);
  const weaponBonus = block ? int(defProfile.bonus) : 0;
  const pool = int(system.cores?.[core]) + rating.value + weaponBonus + state.total + int(system.checkBonus) + int(system.defenseBonus);
  // The target of an Ambush (p.124) and anyone attacked while Casting Magick (p.119) rolls a halved pool, rounded down.
  const casting = int(system.casting?.charges) > 0, halved = !!data.ambush || casting;
  const rolled = halved ? halvedPool21(pool) : pool;
  const {roll, formula, results} = await evaluate(rolled);
  const defStrikes = results.filter(value => value >= 4).length, attackerStrikes = Math.max(0, int(data.strikes));
  // Whoever wins the Conflict Check deals weapon damage, even the Defender; a Tie deals none.
  const margin = attackerStrikes - defStrikes, net = Math.abs(margin), defenderWins = margin < 0;
  const defenderTarget = {name: defender.name, tokenUuid: defenderToken?.document?.uuid ?? defenderToken?.uuid ?? "", actorUuid: defender.uuid ?? ""};
  const attackerTarget = {name: data.attackerName || "the attacker", tokenUuid: data.attackerToken ?? "", actorUuid: data.attacker ?? ""};
  const loser = defenderWins ? attackerTarget : defenderTarget;
  const damage = defenderWins ? defProfile.damage : int(data.damage), damageText = defenderWins ? defProfile.damageText : data.damageText;
  const single = defenderWins ? (defProfile.ranged && !defProfile.auto) : !!data.singleEffect;
  const buys = [net >= 1 ? "HIT — a Random or Controlled Part, or Knockback 2 m (1)" : "", net >= 2 ? "BODY HIT — the Torso (2)" : "", net >= 3 ? "CALLED HIT — a Limb (3)" : "", net >= 4 ? "HEAD HIT — the Head (4)" : ""].filter(Boolean).join(" · ");
  const verdict = margin === 0
    ? `<p class="r21-result"><strong>Tie.</strong> ${defStrikes} Strike${defStrikes === 1 ? "" : "s"} cancel all ${attackerStrikes} — no damage. The attacker may Flurry.</p>`
    : `<p class="r21-result ${defenderWins ? "success" : "failure"}"><strong>${escapeHTML(defenderWins ? defender.name : attackerTarget.name)} wins by ${net} Strike${net === 1 ? "" : "s"}</strong> — attacker ${attackerStrikes} vs ${escapeHTML(label)} ${defStrikes}.${defenderWins ? " The Defender deals the damage." : ""}</p>
       <p>Spend them: ${buys}. <strong>${damage} damage</strong> (${escapeHTML(damageText)}) per damaging Strike; choose the type when you apply it.${single ? ` Ranged without AUTO: buy one effect only — the other ${Math.max(0, net - 1)} Strike${net - 1 === 1 ? "" : "s"} add that much damage.` : ""}</p>`;
  // Cover (p.122): each instance of ranged damage has a 2-in-6 (Light) or 4-in-6 (Heavy) chance of hitting the cover instead.
  let coverHTML = "";
  if (!defenderWins && net > 0 && data.ranged && COVER_21[data.cover]) {
    const spec = COVER_21[data.cover], count = single ? 1 : net;
    const faces = activeResults(await new foundry.dice.Roll(`${count}d6`).evaluate()), hits = coverHits21(faces, data.cover);
    coverHTML = `<p><strong>${spec.label}</strong> (${spec.chance}-in-6 per instance of ranged damage): ${faces.map((value, index) => `<span class="r21-die r21-die-${hits[index] ? "whiff" : "quick"}">${value}</span> ${hits[index] ? "hits the cover" : "gets through"}`).join(" · ")}.${count > 1 ? " Use them in order, one per instance of damage bought." : ""} ${spec.parts} Body Part${spec.parts === 1 ? "" : "s"} cannot be hit, following the fiction.</p>`;
  }
  // FLURRY (p.117): the Winner — or the Attacker on a Tie — may KILL THE BUDDHA again next Tick, up to MOT times;
  // each continuation adds 2 to the RECOVERY afterwards. A winning Defender starts their own count.
  const speed = defenderWins ? (int(system.r21?.ticks?.recovery) || ticksSpeed21(system.cores?.wit, system.cores?.mnd, defProfile.spd)) : Math.max(0, int(data.attackerSpeed));
  const mot = defenderWins ? Math.max(0, int(system.cores?.mot)) : Math.max(0, int(data.attackerMot));
  const flurry = defenderWins ? 0 : Math.max(0, int(data.flurry));
  const canFlurry = flurry < mot;
  const readyDelay = flurryReadyDelay21(speed, flurry);
  const presser = defenderWins ? defender.name : attackerTarget.name;
  const flurryHTML = `<p class="hint">Flurry (${escapeHTML(presser)}): pressed ${flurry} of ${mot} (MOT). Stop now and the next READY lands <strong>${readyDelay}</strong> Tick${readyDelay === 1 ? "" : "s"} after the Tick acted on (Recovery ${speed} + 2 × ${flurry}).${canFlurry ? "" : " No Flurry left."}</p>${canFlurry ? `<p><button type="button" data-r21-action="flurry" data-target="0">Flurry — ${escapeHTML(presser)} KILLS THE BUDDHA again</button></p>` : ""}`;
  const html = `<h3>${escapeHTML(label)} · ${escapeHTML(defender.name)}</h3>
    <p>Pool ${pool}: ${CORES[core].abbr} ${int(system.cores?.[core])} + ${escapeHTML(rating.label)} ${rating.value}${weaponBonus ? ` ${signed(weaponBonus)} weapon` : ""}${halved ? ` — <strong>halved to ${rolled}</strong> (${data.ambush ? "Ambushed" : "attacked while Casting Magick"})` : ""}. ${formula}</p>${diceHTML(results)}${verdict}${coverHTML}${margin === 0 ? "" : targetsHTML([loser], {respond: false, spend: true})}${flurryHTML}`;
  const winner = defenderWins
    ? {attacker: defender.uuid ?? "", attackerToken: defenderTarget.tokenUuid, attackerName: defender.name, defenderToken: data.attackerToken ?? "", weaponId: defWeapon?.id ?? "",
       weapon: defWeapon?.name ?? "Empty Hand", crushing: defProfile.crushing, piercing: defProfile.piercing, visceral: defProfile.visceral, part: "", randomParts: [], randomKeys: []}
    : {attacker: data.attacker, attackerToken: data.attackerToken, attackerName: data.attackerName ?? "", defenderToken: defenderTarget.tokenUuid, weaponId: data.weaponId ?? "",
       weapon: data.weapon, crushing: data.crushing, piercing: data.piercing, visceral: !!data.visceral, part: data.part, randomParts: data.randomParts, randomKeys: data.randomKeys};
  const flags = {[SYSTEM]: {ktbStrikes: {strikes: net, damage, damageText, single, targets: [loser], ...winner, flurry, attackerSpeed: speed, attackerMot: mot}}};
  return post(defender, roll, html, flags);
}

/** Target rows for a Find-an-Opening maneuver: each target Resists with the maneuver's opposed pool. */
function maneuverTargetsHTML(targets, resistLabel) {
  if (!targets?.length) return `<p class="hint">Target tokens (T) first so the target can Resist from this card.</p>`;
  return `<div class="r21-targets"><h4>Targets</h4><ul>${targets.map((target, index) => `<li><span class="r21-target-name">${escapeHTML(target.name)}${target.label ? ` · ${escapeHTML(target.label)}` : ""}</span><span class="r21-target-actions"><button type="button" data-r21-action="resist" data-target="${index}">Resist (${escapeHTML(resistLabel)})</button></span></li>`).join("")}</ul><p class="hint">A GM or the target's owner Resists.</p></div>`;
}

const maneuverResistLabel = spec => `${CORES[spec.defCore].abbr} + ${escapeHTML(CULTIVATIONS_21[spec.defSkill]?.label ?? spec.defSkill)}`;

/** KTB 2.1 "Finding an Opening": the 7 example maneuvers. A contested Check; the target Resists from the card. */
export async function findOpening21(actor, {maneuver: chosenManeuver = "", weaponId = "", targets: chosenTargets, source: chosenSource} = {}) {
  blockedByState(actor);
  const system = actor.system;
  const weapons = (actor.items?.contents ?? []).filter(item => item.type === "weapon" && item.system.equipped);
  const source = chosenSource ?? actingToken(actor);
  const aimed = collectTargets(actor, {source, tokens: chosenTargets});
  const aimedHTML = aimed.length ? `<p class="hint">Targets: ${aimed.map(t => escapeHTML(t.name)).join(", ")}.</p>` : `<p class="hint">No targets. Target tokens (T) first so they can Resist from the chat card.</p>`;
  const maneuverOptions = MANEUVER_KEYS.map(key => `<option value="${key}" ${key === chosenManeuver ? "selected" : ""}>${escapeHTML(MANEUVERS_21[key].label)}</option>`).join("");
  const weaponOptions = `<option value="">Empty Hand</option>${weapons.map(w => `<option value="${w.id}" ${w.id === weaponId ? "selected" : ""}>${escapeHTML(w.name)}</option>`).join("")}`;
  const input = await DialogV2().prompt({
    classes: ["swords-attack-dialog"], window: {title: "Find an Opening"},
    content: `<label>Maneuver<select name="maneuver">${maneuverOptions}</select></label>
      <label>Weapon (Onslaught / Volley)<select name="weaponId">${weaponOptions}</select></label>
      <label>Bonus / penalty dice<input name="adjustment" type="number" step="1" value="0"></label>
      <label>Volley: extra Ammo dice ([AUTO], 0–3)<input name="autoAmmo" type="number" min="0" max="3" step="1" value="0"></label>
      ${aimedHTML}<p class="hint">A contested Check — the target Resists from the chat card. Onslaught and Volley roll the WEAPON pool; the others use the maneuver's listed Core + Cultivation.</p>`,
    ok: {label: "Roll", callback: (event, button) => {
      const f = button.form.elements;
      return {maneuver: f.maneuver.value, weaponId: f.weaponId.value, adjustment: Number(f.adjustment.value), autoAmmo: Number(f.autoAmmo.value)};
    }}, rejectClose: false
  });
  if (!input) return null;
  const spec = MANEUVERS_21[input.maneuver];
  if (!spec) throw new Error("Choose a maneuver.");
  if (!Number.isSafeInteger(input.adjustment)) throw new Error("Adjustments must be whole numbers.");

  let atkCore, atkSkill, atkLabel, weapon = null, ammoShots = 0;
  const mods = [];
  if (spec.weapon) {
    weapon = input.weaponId ? actor.items.get(input.weaponId) : null;
    if (input.weaponId && (weapon?.type !== "weapon" || !weapon.system.equipped)) throw new Error("Equip this weapon before the maneuver.");
    const profile = weaponProfile21(weapon?.system ?? null, {cores: system.cores});
    if (spec.range === "melee" && profile.ranged) throw new Error(`${spec.label} is a melee maneuver; ${profile.label} is a ranged weapon.`);
    if (spec.range === "ranged" && !profile.ranged) throw new Error(`${spec.label} is a ranged maneuver; equip a ranged weapon.`);
    atkCore = profile.core; atkSkill = profile.skill; atkLabel = `${escapeHTML(weapon?.name ?? "Empty Hand")} · ${profile.label}`;
    if (profile.bonus) mods.push({label: "Weapon modifiers", value: profile.bonus});
    if (spec.auto) { const n = Math.max(0, Math.min(3, int(input.autoAmmo))); if (n) mods.push({label: `[AUTO] extra Ammo (${n})`, value: n}); ammoShots = n; }
  } else {
    atkCore = spec.atkCore; atkSkill = spec.atkSkill;
    atkLabel = spec.emptyHand ? "Empty Hand" : `${CORES[atkCore].abbr} + ${escapeHTML(CULTIVATIONS_21[atkSkill]?.label ?? atkSkill)}`;
  }
  const state = stateFor(actor, atkCore);
  if (input.adjustment) mods.push({label: "Adjustment", value: input.adjustment});
  if (state.ignorePenalties) mods.splice(0, mods.length, ...withoutPenalties(mods, true));
  const rating = skillRating(system, atkSkill), coreValue = int(system.cores?.[atkCore]);
  const pool = coreValue + rating.value + mods.reduce((sum, mod) => sum + mod.value, 0) + state.total + int(system.checkBonus) + int(system.attackBonus);

  const perform = async () => {
    const {roll, formula, results} = await evaluate(pool);
    const strikes = results.filter(value => value >= 4).length;
    const targets = aimed.map(target => ({name: target.name, tokenUuid: target.tokenUuid, actorUuid: target.actorUuid, label: target.label}));
    const html = `<h3>Find an Opening · ${escapeHTML(spec.label)}</h3>
      <p class="r21-result"><strong>${strikes} Strike${strikes === 1 ? "" : "s"}</strong> · ${atkLabel}.</p>
      ${diceHTML(results)}
      <p>Pool ${pool}: ${CORES[atkCore].abbr} ${coreValue} + ${escapeHTML(rating.label)} ${rating.value}. ${formula}</p>${partsHTML([...mods.filter(mod => mod.value), ...state.parts])}
      <p class="hint">${escapeHTML(spec.text)}</p>
      ${spec.needsControl ? `<p class="hint">Requires a Part already Controlled (seize one with Control first).</p>` : ""}
      ${maneuverTargetsHTML(targets, maneuverResistLabel(spec))}`;
    return post(actor, roll, html, {[SYSTEM]: {ktbManeuver21: {maneuver: input.maneuver, strikes, targets,
      attacker: actor.uuid ?? "", attackerToken: source?.document?.uuid ?? "", physique: int(system.cores?.phy)}}});
  };
  if (weapon && spec.weapon && spec.ammo) return useWeapon(actor, weapon.id, () => perform(), "", Math.max(1, int(spec.ammo) + ammoShots));
  return perform();
}

/** The target Resists a Find-an-Opening maneuver: roll the opposed pool, resolve, and apply conditions. */
export async function resolveManeuver21(data, defender, defenderToken) {
  blockedByState(defender);
  const spec = MANEUVERS_21[data.maneuver];
  if (!spec) throw new Error("Unknown maneuver.");
  const system = defender.system;
  const rating = skillRating(system, spec.defSkill), state = stateFor(defender, spec.defCore);
  const pool = int(system.cores?.[spec.defCore]) + rating.value + state.total + int(system.checkBonus) + int(system.defenseBonus);
  const {roll, formula, results} = await evaluate(pool);
  const defStrikes = results.filter(value => value >= 4).length, atkStrikes = Math.max(0, int(data.strikes));
  const outcome = maneuverOutcome21(data.maneuver, atkStrikes, defStrikes, {physique: int(data.physique)});
  const landed = outcome.applyToDefender === "control" || outcome.margin > 0;
  let note = "";
  if (spec.needsControl && !system.conditions21?.control) note += `<p class="hint">${escapeHTML(defender.name)} has no Controlled Part — this maneuver needs one first.</p>`;
  if (outcome.applyToDefender && defender.isOwner) {
    try { await defender.update({[`system.conditions21.${outcome.applyToDefender}`]: true}); }
    catch (error) { note += `<p class="hint">Could not set the condition automatically: ${escapeHTML(error.message)}</p>`; }
  }
  const resultClass = outcome.margin > 0 ? "failure" : outcome.margin < 0 ? "success" : "";
  const html = `<h3>Resist · ${escapeHTML(spec.label)} · ${escapeHTML(defender.name)}</h3>
    <p>Pool ${pool}: ${CORES[spec.defCore].abbr} ${int(system.cores?.[spec.defCore])} + ${escapeHTML(rating.label)} ${rating.value}. ${formula}</p>${diceHTML(results)}
    <p class="r21-result ${resultClass}"><strong>${atkStrikes} attacker vs ${defStrikes} defender</strong> — ${escapeHTML(outcome.summary)}</p>${note}`;
  return post(defender, roll, html, {});
}

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

/** Dice So Nice: animate a roll that is shown through custom HTML rather than its own chat card (bonus dice: Ferocious, Precise).
 *  A no-op when Dice So Nice is not installed. Guarded so it never blocks the roll. */
async function animate3d(roll) {
  try { await globalThis.game?.dice3d?.showForRoll?.(roll, globalThis.game?.user, true); } catch { /* DSN optional */ }
}

async function ferociousDice(sixes, limit) {
  const extra = [];
  let pending = sixes;
  while (pending > 0 && extra.length < limit) {
    const count = Math.min(pending, limit - extra.length);
    const roll = await new foundry.dice.Roll(`${count}d6`).evaluate();
    await animate3d(roll);
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
export async function killTheBuddha(actor, {weaponId = "", targets: chosenTargets, source: chosenSource, flurry = 0} = {}) {
  blockedByState(actor);
  const system = actor.system;
  if (system.conditions21?.juggled) throw new Error("Juggled: you have no Openings in this KILL THE BUDDHA (p.35).");
  const weapons = (actor.items?.contents ?? []).filter(item => item.type === "weapon" && item.system.equipped);
  const chosen = weapons.find(weapon => weapon.id === weaponId) ?? null;
  const preview = weaponProfile21(chosen?.system ?? null, {cores: system.cores});
  const ammo = (actor.items?.contents ?? []).filter(item => item.type === "ammunition").map(item => `<option value="${item.id}">${escapeHTML(item.name)} (${item.system.quantity})</option>`).join("");
  const source = chosenSource ?? actingToken(actor);
  const aimed = collectTargets(actor, {source, tokens: chosenTargets});
  const measured = aimed.find(target => target.distance !== null)?.distance;
  const aimedHTML = aimed.length ? `<p class="hint">Targets: ${aimed.map(target => `${escapeHTML(target.name)}${target.distance !== null ? ` (${target.distance} m)` : ""}`).join(", ")}${source ? "" : " · select your own token to measure distance"}.</p>` : `<p class="hint">No targets. Target tokens (T) first to measure distance and apply damage from the chat card.</p>`;
  const select = (name, options, chosenValue = null) => `<select name="${name}">${options.map(([value, label]) => `<option value="${value}" ${chosenValue !== null && value === chosenValue ? "selected" : ""}>${label}</option>`).join("")}</select>`;
  // Strikes engine: the 2.1 book's Firefight (Aim, cover per damage instance, out of range goes wide) replaces the dice penalties.
  const strikesEngine = ktbEngine21() === "strikes", motorics = Math.max(0, int(system.cores?.mot));
  const targetTokens = (chosenTargets ?? [...(globalThis.game?.user?.targets ?? [])]).filter(token => token?.actor && token !== source);
  // A lone target behind a Shield, COVER or WALL weapon starts with that cover selected.
  const carried = targetTokens.length === 1 ? (targetTokens[0].actor.items?.contents ?? []).filter(item => item.type === "weapon" && item.system.equipped).map(item => weaponProfile21(item.system).cover) : [];
  const defaultCover = carried.includes("heavy") ? "heavy" : carried.includes("light") ? "light" : "";
  const input = await DialogV2().prompt({
    classes: ["swords-attack-dialog"], position: {width: 620, height: 700}, window: {title: "KILL THE BUDDHA", resizable: true},
    content: `<fieldset class="attack-group"><legend>Weapon &amp; pool</legend><div class="attack-fields">
      <label>Weapon<select name="weaponId"><option value="">Empty Hand (PHYS damage)</option>${weapons.map(weapon => {
        const wp = weaponProfile21(weapon.system); const wa = wp.ranged ? ammoSummary21(actor, weapon) : null;
        return `<option value="${weapon.id}" ${weapon.id === chosen?.id ? "selected" : ""}>${escapeHTML(weapon.name)} · ${wp.label}${wa ? ` · ⦾ ${wa.count} ${escapeHTML(wa.label)}` : ""}</option>`;
      }).join("")}</select></label>
      <label>Core<select name="core">${coreOptions(preview.core)}</select></label>
      <label>Cultivation<select name="skill">${skillOptions(system, preview.skill)}</select></label>
      <label>Bonus / penalty dice<input name="adjustment" type="number" step="1" value="0"></label></div>
      ${aimedHTML}<p class="hint">Physique + Beast Shrine to strike or parry; Motorics + Beast Shrine to move or dodge; Motorics + Hand-Eye Coordination to shoot (p.22).</p></fieldset>
      <fieldset class="attack-group"><legend>${strikesEngine ? "Ranged (Firefight, 2.1 p.119)" : "Ranged (Firefight, p.29)"}</legend><div class="attack-fields">
      <label>Distance (m)<input name="distance" type="number" min="0" step="any" value="${measured ?? ""}"></label>
      <label>Firing mode${select("mode", [["shoot", "Shoot"], ["burst", "Burst (+Rate dice)"], ["full", "Full Auto (+Rate×3 dice)"], ["suppress", "Suppression Fire (Rate 15+, Alpha p.10)"]])}</label>
      <label>Shots (Shoot, up to Rate)<input name="shots" type="number" min="1" step="1" value="1"></label>
      <label>Shoot Demand (+1 damage when exceeded)<input name="demand" type="number" min="1" step="1" value="1"></label>
      <label>Ammo<select name="ammoId"><option value="">Use weapon selection</option>${ammo}</select></label>
      ${strikesEngine ? `<label>Ticks spent Aiming (+1 die each, max MOT ${motorics}; no moving)<input name="aim" type="number" min="0" max="${motorics}" step="1" value="0"></label>
      <label>Target's cover (ranged only)${select("cover", [["", "None"], ["light", "Light — 2-in-6 per damage instance hits cover"], ["heavy", "Heavy — 4-in-6 per damage instance hits cover"], ["full", "Full — no attack until it is removed"]], defaultCover)}</label>`
        : `<label>Cover (ranged only)${select("cover", [["0", "None"], ["-2", "Light cover (-2)"], ["-4", "Heavy cover (-4)"]])}</label>`}</div>
      ${strikesEngine ? `<p class="hint">Beyond the weapon's range a shot has a 4-in-6 chance of going wide. Reloading takes an Action, or is free outside a KILL THE BUDDHA.</p>` : ""}</fieldset>
      <fieldset class="attack-group"><legend>Situation (pp.13, 33–35)</legend><div class="attack-fields">
      <label>Height${strikesEngine ? select("height", [["0", "Level, or below the target"], ["1", "At least 1 m above the target (+1)"]]) : select("height", [["0", "Level"], ["-1", "Steps / gentle slope (-1)"], ["-2", "Spiral steps / steep slope (-2)"], ["-3", "Unclimbable / ladder (-3)"]])}</label>
      <label>Unstable terrain${select("unstable", [["0", "Stable"], ["-1", "Unstable (-1)"], ["-2", "Very unstable (-2)"], ["-3", "Treacherous (-3)"]])}</label></div>
      <div class="attack-options">
      <label class="attack-option"><input type="checkbox" name="impaired"> Impaired senses (-2)</label>
      <label class="attack-option"><input type="checkbox" name="lowLight"> Low light (-2 to anything that needs sight)</label>
      <label class="attack-option"><input type="checkbox" name="mud"> Knee-deep water or mud (-2)</label>
      <label class="attack-option"><input type="checkbox" name="juggledTarget"> Target is Juggled (+2)</label>
      <label class="attack-option"><input type="checkbox" name="ambush"> ${strikesEngine ? "Ambush: the target's pool is halved (2.1 p.124)" : "Ambush: Strikes damage one Part (p.36)"}</label>
      ${actor.type === "npc" ? '<label class="attack-option"><input type="checkbox" name="static"> Gambits: predetermined Openings, Quick → Quick → Solid → Perfect per die (p.17)</label>' : ""}
      </div><label>Ambush / called Part${select("part", [["", "—"], ...PART_KEYS.map(key => [key, PARTS[key].label])])}</label></fieldset>`,
    ok: {label: "KILL THE BUDDHA", callback: (event, button) => {
      const f = button.form.elements, num = name => Number(f.namedItem(name)?.value ?? 0), on = name => f.namedItem(name)?.checked ?? false;
      return {weaponId: f.weaponId.value, core: f.core.value, skill: f.skill.value, adjustment: num("adjustment"), distance: f.distance.value, mode: f.mode.value,
        shots: num("shots"), demand: num("demand"), ammoId: f.ammoId.value, cover: strikesEngine ? f.cover.value : num("cover"), aim: num("aim"), height: num("height"), unstable: num("unstable"),
        impaired: on("impaired"), lowLight: on("lowLight"), mud: on("mud"), juggledTarget: on("juggledTarget"), ambush: on("ambush"), static: on("static"), part: f.part.value};
    }}, rejectClose: false
  });
  if (!input) return null;
  if (!CORES[input.core] || !Number.isSafeInteger(input.adjustment)) throw new Error("Choose a Core and whole-number adjustments.");
  const weapon = input.weaponId ? actor.items.get(input.weaponId) : null;
  if (input.weaponId && (weapon?.type !== "weapon" || !weapon.system.equipped)) throw new Error("Equip this weapon before attacking.");
  const profile = weaponProfile21(weapon?.system ?? null, {cores: system.cores, core: input.core});
  if (input.mode === "suppress" && profile.ranged) return suppressionFire(actor, weapon, profile, input);
  const mods = [];
  if (profile.bonus) mods.push({label: "Weapon modifiers (GREAT/COLOSSAL/ARTIFACT)", value: profile.bonus});
  let fire = {dice: 0, shots: 1, random: false, label: "Melee"};
  if (profile.ranged) {
    fire = firingMode(input.mode, {rate: profile.rate, auto: profile.auto, distance: input.distance});
    if (input.mode === "shoot") {
      if (!Number.isSafeInteger(input.shots) || input.shots < 1 || input.shots > profile.rate) throw new Error(`Shots must be between 1 and the weapon's Rate (${profile.rate}).`);
      fire.shots = input.shots * (profile.auto ? 3 : 1); // book p.171: every Shoot with an AUTO weapon uses 3 bullets
    }
    if (fire.dice) mods.push({label: fire.label, value: fire.dice});
    if (strikesEngine) {
      if (input.cover === "full") throw new Error("Full Cover: a full-on attack is impossible until the cover is weakened or removed (2.1 p.122).");
      if (!Number.isSafeInteger(input.aim) || input.aim < 0) throw new Error("Ticks spent Aiming must be a whole number, 0 or more.");
      const aim = aimBonus21(input.aim, motorics);
      if (aim) mods.push({label: `Aim (${aim} Tick${aim === 1 ? "" : "s"})`, value: aim});
    } else {
      const range = rangePenalty(input.distance === "" ? NaN : input.distance, profile.range);
      if (range.value) mods.push({label: `Range ${range.label}`, value: range.value});
      if (input.cover) mods.push({label: "Cover", value: input.cover});
    }
  }
  for (const [key, label, value] of [["impaired", "Impaired senses", -2], ["lowLight", "Low light", -2], ["mud", "Water or mud", -2], ["juggledTarget", "Target Juggled", 2]]) if (input[key]) mods.push({label, value});
  if (input.height) mods.push({label: input.height > 0 ? "Above the target" : "Height", value: input.height});
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
      if (profile.precise) { // book p.171: PRECISE rerolls 1s, once
        const ones = results.filter(value => value === 1).length;
        if (ones) {
          const reroll = await new foundry.dice.Roll(`${ones}d6`).evaluate();
          await animate3d(reroll);
          const again = activeResults(reroll);
          results = [...results.filter(value => value !== 1), ...again]; mods.push({label: `PRECISE rerolled ${ones} die${ones === 1 ? "" : "s"} (${again.join(", ")})`, value: 0});
        }
      }
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
    if (ktbEngine21() === "strikes") {
      // 2.1 Strikes engine: the defender Blocks or Dodges; their Strikes cancel the attacker's, leftovers buy damage.
      let landed = counts.strikes, firefightHTML = "";
      if (profile.ranged && outOfRange21(input.distance, profile.range)) {
        const face = int(activeResults(await new foundry.dice.Roll("1d6").evaluate())[0]), wide = goesWide21(face);
        if (wide) landed = 0;
        firefightHTML += `<p class="r21-result ${wide ? "failure" : "success"}"><strong>Out of range</strong> (${escapeHTML(String(input.distance))} m; range ${profile.range} m): d6 = ${face} — ${wide ? "the shot goes wide. No Strikes land" : "still on target"} (4-in-6 to go wide).</p>`;
      }
      const cover = profile.ranged && COVER_21[input.cover] ? input.cover : "";
      if (cover) firefightHTML += `<p class="hint">${COVER_21[cover].label}: ${escapeHTML(COVER_21[cover].text)} Rolled when the defender resolves.</p>`;
      if (input.ambush) firefightHTML += `<p class="hint">Ambush: the target's KILL THE BUDDHA pool is halved, rounded down.</p>`;
      const sHtml = `<h3>KILL THE BUDDHA — Strikes · ${escapeHTML(weapon?.name ?? "Empty Hand")}${int(flurry) > 0 ? ` · Flurry ${int(flurry)}` : ""}</h3>
      <p class="r21-result"><strong>${landed} Strike${landed === 1 ? "" : "s"}</strong> to cancel and spend.${int(flurry) > 0 ? ` <span class="hint">Anticipated Action — flurry ${int(flurry)} of ${Math.max(0, int(system.cores?.mot))}.</span>` : ""}</p>
      ${input.static ? "" : openingDiceHTML(results)}${firefightHTML}
      <p>Pool ${pool}: ${CORES[input.core].abbr} ${coreValue} + ${escapeHTML(rating.label)} ${rating.value}. ${input.static ? "" : formula}</p>${partsHTML([...mods.filter(mod => mod.value || mod.label.startsWith("FEROCIOUS") || mod.label.startsWith("PRECISE")), ...state.parts])}
      <p><strong>${profile.label}</strong>: ${damage} damage (${profile.damageText}) per damaging Strike${profile.piercing ? " · PIERCING, ignores Soak" : ""}${profile.ranged ? ` · Range ${profile.range} m · Rate ${profile.rate} · ${fire.label}, ${fire.shots} shot(s)` : ` · Reach ${profile.range} m`}.</p>
      ${profile.notes.map(note => `<p class="hint">${escapeHTML(note)}</p>`).join("")}
      <details open><summary>Resolving Strikes</summary><p>Each Defender Strike cancels one attacker Strike. Leftover Strikes buy: <strong>1</strong> = a Random or Controlled Part, or Knockback 2 m · <strong>2</strong> = the Torso · <strong>3</strong> = a Limb · <strong>4</strong> = the Head. You may spend per Strike (2 Strikes = the Torso once, or a Random Part twice). Choose the damage type when you apply damage.</p></details>
      ${random.length ? `<p><strong>Random hit locations</strong>: ${random.map(escapeHTML).join(", ")}.</p>` : ""}${strikesTargetsHTML(targets)}`;
      return post(actor, roll, sHtml, {[SYSTEM]: {ktbStrikes: {strikes: landed, ranged: !!profile.ranged, cover, ambush: !!input.ambush, damage, damageText: profile.damageText, weapon: weapon?.name ?? "Empty Hand",
        crushing: profile.crushing, piercing: profile.piercing, visceral: profile.visceral, part: input.part, randomParts: random, randomKeys, targets,
        attacker: actor.uuid ?? "", attackerToken: source?.document?.uuid ?? "", attackerName: actor.name ?? "", flurry: int(flurry), weaponId: input.weaponId ?? "",
        attackerSpeed: int(system.r21?.ticks?.recovery) || ticksSpeed21(system.cores?.wit, system.cores?.mnd, profile.spd), attackerMot: Math.max(0, int(system.cores?.mot)),
        singleEffect: !!profile.ranged && !profile.auto, unblockable: !!profile.unblockable}}});
    }
    const html = `<h3>KILL THE BUDDHA · ${escapeHTML(weapon?.name ?? "Empty Hand")}</h3>
      <div class="r21-openings"><span class="r21-open quick">${counts.quick} Quick</span><span class="r21-open solid">${counts.solid} Solid</span><span class="r21-open perfect">${counts.perfect} Perfect</span><span class="r21-open whiff">${counts.whiff} Whiff</span></div>
      ${input.static ? `<p>Gambit Openings: one per die of pool ${pool}, in the sequence Quick → Quick → Solid → Perfect.</p>` : openingDiceHTML(results)}
      <p>Pool ${pool}: ${CORES[input.core].abbr} ${coreValue} + ${escapeHTML(rating.label)} ${rating.value}. ${input.static ? "" : formula}</p>${partsHTML([...mods.filter(mod => mod.value || mod.label.startsWith("FEROCIOUS") || mod.label.startsWith("PRECISE")), ...state.parts])}
      <p><strong>${profile.label}</strong>: ${damage} damage (${profile.damageText}) per damaging Opening${profile.piercing ? " · PIERCING, ignores Soak" : ""}${profile.ranged ? ` · Range ${profile.range} m · Rate ${profile.rate} · ${fire.label}, ${fire.shots} shot(s)` : ` · Reach ${profile.range} m`}.</p>
      ${profile.notes.map(note => `<p class="hint">${escapeHTML(note)}</p>`).join("")}
      ${input.ambush ? `<p><strong>Ambush:</strong> each Strike deals ${damage} damage to ${escapeHTML(PARTS[input.part]?.label ?? "the Part named before the Ambush")} immediately.</p>` : ""}
      ${random.length ? `<p><strong>Random hit locations</strong> (every Strike must deal damage, no aiming): ${random.map(escapeHTML).join(", ")}.</p>` : ""}
      <details><summary>Resolving Openings</summary><ul>
      <li>Each die is an Opening: 1–3 Whiff, 4–5 Quick, 6 Solid. No die rolls a Perfect — Perfects come only from fusing two Solids. Quick Openings resolve first, then Solid, then Perfect (p.10).</li>
      <li>Counter with an Opening of equal or greater rank; Solid vs Quick or Perfect vs Solid is a Greater Counter (+Quick); Perfect vs Quick is an Overwhelming Counter (+Solid) (pp.26–27).</li>
      <li>Fuse two equal Openings into the next rank: up to ${fusion.quickToSolid} Quick→Solid, ${fusion.solidToPerfect} Solid→Perfect (p.25). Cultivators may burn 1 Sidhi to upgrade an Opening or turn a Whiff into a Quick (p.26).</li>
      </ul></details>${targetsHTML(targets)}`;
    const message = await post(actor, roll, html, {[SYSTEM]: {ktb: {...counts, weapon: weapon?.name ?? "Empty Hand", damage, pool, randomParts: random, randomKeys,
      targets, attackerToken: source?.document?.uuid ?? "", attacker: actor.uuid ?? "", crushing: profile.crushing, piercing: profile.piercing, visceral: profile.visceral, part: input.part}}});
    return message;
  };
  const shots = profile.ranged ? fire.shots ?? 1 : 0;
  if (weapon && profile.ranged) return useWeapon(actor, weapon.id, () => perform(), input.ammoId ?? "", Math.max(1, shots));
  return perform();
}

/** Alpha p.10: Suppression Fire. No Openings are rolled; everyone in the marked 3 m wide area tests their nerve. */
async function suppressionFire(actor, weapon, profile, input) {
  if (!canSuppress(profile)) throw new Error(`Suppression Fire needs a ranged weapon with the AUTO mod (${weapon?.name ?? "this weapon"} does not have it).`);
  const targets = collectTargets(actor);
  const perform = async () => foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}),
    content: `<section class="r21-chat"><h3>Suppression Fire · ${escapeHTML(weapon.name)}</h3>
      <p>Marks a 3 m wide area, up to the weapon's range (${profile.range} m). ${profile.rate} rounds spent.</p>
      <ul class="r21-mods"><li>Everyone inside makes a <strong>Heart + Stillness Check vs Demand 3</strong>.</li>
      <li>Failure: duck into cover or run out of the area and become <strong>Suppressed</strong> (no other action for 3 seconds or until the Cut ends).</li>
      <li>Success: may run out of the area with Movement left this Cut; otherwise take ${profile.damage} weapon damage to four random Parts.</li><li>Afterwards the suppressor must reload (book p.93).</li></ul>
      ${targetsHTML(targets, {respond: false})}</section>`,
    flags: {[SYSTEM]: {suppression21: {weapon: weapon.name, damage: profile.damage, targets}}}});
  return useWeapon(actor, weapon.id, () => perform(), input.ammoId ?? "", Math.max(1, profile.rate));
}

/** 2.1 book p.121: any damage to the Head forces a Stun Check (Heart + Stillness). Anvil Head adds dice. */
export async function stunCheck(actor) {
  const system = actor.system, assets = system.r21?.assets ?? system.assets;
  const input = await DialogV2().prompt({window: {title: "Stun Check"}, content: `<p>Heart + Stillness${assetStars(assets, "anvilHead") ? ` + Anvil Head ${assetStars(assets, "anvilHead")}` : ""}. The book gives no Demand (p.121); the Intercessor sets it.</p><label>Demand<input name="demand" type="number" min="1" step="1" value="1"></label>`,
    ok: {label: "Roll", callback: (event, button) => Number(button.form.elements.demand.value)}, rejectClose: false});
  if (!input) return null;
  if (!Number.isSafeInteger(input) || input < 1) throw new Error("Demand must be a positive whole number.");
  const pool = int(system.cores?.spi) + int(system.skills?.stillness) + assetStars(assets, "anvilHead") + stateFor(actor, "spi").total;
  const {roll, results} = await evaluate(pool);
  const strikes = results.filter(value => value >= 4).length, success = strikes >= input;
  if (!success) await actor.update({"system.conditions21.stunned": true});
  return post(actor, roll, `<h3>Stun Check</h3><p class="r21-result ${success ? "success" : "failure"}"><strong>${strikes} Strikes</strong> vs Demand ${input} — ${success ? "keeps their head" : "Stunned: cannot do anything for 6 seconds"}</p>${diceHTML(results)}`);
}

/** p.14: spend 1 Morale; Heart + Adamance vs 2 + Disabled Parts to keep fighting. */
export async function incapacitationCheck(actor) {
  const system = actor.system, source = actor.toObject().system;
  if (int(source.morale?.value) < 1) throw new Error("No Morale remains to spend on an Incapacitation Check.");
  const disabled = disabledParts(actor), demand = incapacitationDemand(disabled.length);
  const ok = await DialogV2().confirm({window: {title: "Morale Check · keep fighting?"}, content: `<p>Spend 1 Morale to roll Heart + Adamance against Demand ${demand} (2 + ${disabled.length} Disabled Parts)?</p><p class="hint">Made when a Part is Disabled and the fight goes on (p.120), and at this table after losing Head HP.</p>`, rejectClose: false});
  if (!ok) return null;
  await actor.update({"system.morale.value": int(source.morale.value) - 1});
  const pool = int(system.cores?.spi) + int(system.skills?.adamance) + stateFor(actor, "spi").total;
  const {roll, results} = await evaluate(pool);
  const strikes = results.filter(value => value >= 4).length, success = strikes >= demand;
  return post(actor, roll, `<h3>Morale Check · Incapacitation</h3><p class="r21-result ${success ? "success" : "failure"}"><strong>${strikes} Strikes</strong> vs Demand ${demand} — ${success ? "keeps fighting" : "succumbs to pain"}</p>${diceHTML(results)}<p>Spent 1 Morale. A Cultivator who spends Morale this way may enter Samadhi for 3 seconds (Alpha p.53).</p>`);
}

/** p.31 hit location table. */
export async function randomPart(actor) {
  const roll = await new foundry.dice.Roll("1d6").evaluate();
  const key = partFromD6(activeResults(roll)[0]);
  return post(actor, roll, `<h3>Hit location</h3><p><strong>${PARTS[key].label}</strong> (d6 = ${PARTS[key].d6})</p>`);
}

/** pp.31–34, 38, 66: damage removes Soak first, then HP; reports Disabled/Cleaved consequences. */
export async function damagePart(actor, partKey, {part: defaultPart = "", amount = 2, crushing = false, ignoreSoak = false, visceral = false, hint = ""} = {}) {
  const parts = actor.system.r21?.parts ?? {};
  const selected = PARTS[partKey] ? partKey : defaultPart;
  const input = await DialogV2().prompt({window: {title: `Apply damage · ${actor.name ?? "Target"}`},
    content: `${hint ? `<p class="hint">${escapeHTML(hint)}</p>` : ""}<label>Part<select name="part">${PART_KEYS.map(key => `<option value="${key}" ${key === selected ? "selected" : ""}>${PARTS[key].label} (HP ${parts[key]?.hp ?? "?"}, Soak ${parts[key]?.soak ?? 0})</option>`).join("")}</select></label>
      <label>Damage<input name="amount" type="number" min="1" step="1" value="${Math.max(1, int(amount) || 2)}"></label>
      <label>Damage type (2.1)<select name="dtype"><option value="">— (use the boxes below)</option>${DAMAGE_TYPE_KEYS.map(key => `<option value="${key}">${DAMAGE_TYPES_21[key].label} — ${escapeHTML(DAMAGE_TYPES_21[key].text)}</option>`).join("")}</select></label>
      <label><input type="checkbox" name="crushing" ${crushing ? "checked" : ""}> CRUSHING / Bludgeon Perfect: 2 Soak per damage</label>
      <label><input type="checkbox" name="ignoreSoak" ${ignoreSoak ? "checked" : ""}> Ignores Soak (e.g. Dagger Perfect Opening)</label>
      <label><input type="checkbox" name="visceral" ${visceral ? "checked" : ""}> VISCERAL: +1 damage if the Part has no Soak (2.1 p.194)</label>`,
    ok: {label: "Apply", callback: (event, button) => ({part: button.form.elements.part.value, amount: Number(button.form.elements.amount.value), dtype: button.form.elements.dtype?.value ?? "", crushing: button.form.elements.crushing.checked, ignoreSoak: button.form.elements.ignoreSoak.checked, visceral: button.form.elements.visceral?.checked ?? false})},
    rejectClose: false});
  if (!input) return null;
  if (!PARTS[input.part] || !Number.isSafeInteger(input.amount) || input.amount < 1) throw new Error("Choose a Part and a positive whole amount of damage.");
  const applied = await applyDamage21(actor, input.part, input.amount, input);
  return postDamage(actor, input.part, applied.result, applied.typeLabel, applied.visceral ? "VISCERAL: +1 damage, the Part had no Soak." : "");
}

/** Applies damage to one Part without asking: Soak first, then HP, with the chosen 2.1 damage type. Returns what happened. */
export async function applyDamage21(actor, part, amount, {dtype = "", crushing = false, ignoreSoak = false, visceral = false} = {}) {
  const derived = actor.system.r21?.parts?.[part], source = actor.toObject().system.parts[part];
  if (!derived || !source) throw new Error("That Part is not on this character.");
  // A chosen 2.1 damage type overrides the crushing/ignore-Soak boxes; otherwise keep the old behaviour.
  const type = DAMAGE_TYPES_21[dtype] ? damageOptions21(dtype) : null;
  const dealt = Math.max(1, int(amount)) + visceralBonus21(visceral, derived.soak);
  const result = applyPartDamage({max: derived.max, damage: source.damage, soak: derived.soak}, dealt, type ?? {crushing, ignoreSoak});
  const changes = {[`system.parts.${part}.damage`]: result.after.damage,
    [`system.parts.${part}.soakLost`]: int(source.soakLost) + result.soakLoss + (type ? int(type.reduceSoak) : 0)};
  if (type?.bleeds && result.hpLoss > 0) changes["system.conditions21.bleeding"] = true;
  await actor.update(changes);
  return {result, dealt, typeLabel: type ? DAMAGE_TYPES_21[dtype].label : "", visceral: dealt > Math.max(1, int(amount))};
}

/** Buttons for the two Checks that follow lost Head HP; chat21.mjs wires them through the message's headHit21 flag. */
export const headChecksHTML21 = () => `<p class="r21-head-checks"><button type="button" data-r21-check="stun">Stun Check</button><button type="button" data-r21-check="morale">Morale Check (1 Morale)</button></p><p class="hint">A GM or the character's owner rolls these.</p>`;

/**
 * Spend the Strikes won in a KILL THE BUDDHA (2.1 book p.117). The Winner picks effects up to the Strikes won; each
 * damaging effect deals the weapon's damage to the loser, random Parts are rolled, and one card reports the lot.
 */
export async function spendStrikes21(loser, data) {
  const strikes = Math.max(0, int(data.strikes)), damage = Math.max(1, int(data.damage) || 1), single = !!data.single;
  if (strikes < 1) throw new Error("No Strikes were won on this card.");
  const options = strikeOptions21(strikes), slots = single ? 1 : Math.min(strikes, 8), parts = loser.system.r21?.parts ?? {};
  const optionHTML = first => `${first ? "" : `<option value="">— nothing more</option>`}${options.map(option => `<option value="${option.value}" data-cost="${option.cost}">${escapeHTML(option.label)}</option>`).join("")}`;
  const input = await DialogV2().prompt({window: {title: `Spend Strikes · ${data.attackerName || "Winner"} → ${loser.name ?? "Target"}`},
    content: `<p><strong>${strikes} Strike${strikes === 1 ? "" : "s"}</strong> to spend; each damaging effect deals <strong>${damage}</strong> (${escapeHTML(data.damageText ?? "weapon damage")}).</p>
      <p class="hint">HIT 1 · KNOCKBACK 1 · BODY HIT 2 · CALLED HIT 3 · HEAD HIT 4 (p.117).${single ? " Ranged without AUTO: one effect only; every Strike left over is +1 damage." : " Buy as many as the Strikes allow."} If the card rolled Cover, leave out the instances that hit the cover.</p>
      ${Array.from({length: slots}, (_, index) => `<label>Effect ${slots > 1 ? index + 1 : ""}<select name="pick${index}" data-strike-pick>${optionHTML(index === 0)}</select></label>`).join("")}
      <p data-strikes-left class="hint"></p>
      <label>Damage type<select name="dtype"><option value="">— as the weapon (boxes below)</option>${DAMAGE_TYPE_KEYS.map(key => `<option value="${key}">${DAMAGE_TYPES_21[key].label} — ${escapeHTML(DAMAGE_TYPES_21[key].text)}</option>`).join("")}</select></label>
      <label><input type="checkbox" name="crushing" ${data.crushing ? "checked" : ""}> CRUSHING: 2 Soak per damage</label>
      <label><input type="checkbox" name="ignoreSoak" ${data.piercing ? "checked" : ""}> Ignores Soak</label>
      <label><input type="checkbox" name="visceral" ${data.visceral ? "checked" : ""}> VISCERAL: +1 damage if the Part has no Soak</label>
      <p class="hint">${PART_KEYS.map(key => `${PARTS[key].label}: HP ${parts[key]?.hp ?? "?"}, Soak ${parts[key]?.soak ?? 0}`).join(" · ")}</p>`,
    render: (event, shown) => {
      try {
        const root = shown?.element ?? shown, left = root?.querySelector?.("[data-strikes-left]"), picks = [...(root?.querySelectorAll?.("[data-strike-pick]") ?? [])];
        if (!left) return;
        const update = () => { const spent = picks.reduce((sum, pick) => sum + int(pick.selectedOptions?.[0]?.dataset?.cost), 0); left.textContent = spent > strikes ? `${spent} of ${strikes} Strikes: ${spent - strikes} too many.` : `${spent} of ${strikes} Strikes spent${single && spent ? `; +${strikes - spent} damage` : `; ${strikes - spent} left`}.`; };
        for (const pick of picks) pick.addEventListener("change", update);
        update();
      } catch { /* the counter is a convenience; the choice is checked again on Apply */ }
    },
    ok: {label: "Apply", callback: (event, button) => { const fields = button.form.elements; return {picks: Array.from({length: slots}, (_, index) => fields[`pick${index}`]?.value ?? ""), dtype: fields.dtype?.value ?? "", crushing: !!fields.crushing?.checked, ignoreSoak: !!fields.ignoreSoak?.checked, visceral: !!fields.visceral?.checked}; }},
    rejectClose: false});
  if (!input) return null;
  const plan = strikePlan21(strikes, input.picks, {single});
  if (!plan.ok) throw new Error(plan.error);
  const lines = [];
  let headHit = false;
  for (const effect of plan.effects) {
    const title = effect.label.split(" — ")[0];
    if (!effect.part) { lines.push(`<li><strong>${escapeHTML(title)}</strong>: knocked back 2 m.</li>`); continue; }
    let part = effect.part, rolled = "";
    if (part === "random") {
      const d6 = activeResults(await new foundry.dice.Roll("1d6").evaluate())[0];
      part = partFromD6(d6); rolled = ` (d6 = ${d6})`;
    }
    const applied = await applyDamage21(loser, part, damage + plan.extraDamage, input);
    const result = applied.result, notes = damageConsequences(part, result);
    if (applied.visceral) notes.unshift("VISCERAL: +1 damage, the Part had no Soak.");
    if (result.absorbed > 0) for (const key of loser.system.r21?.parts?.[part]?.armorMods ?? []) if (ARMOR_MODS_21[key]?.onSoak) notes.push(`${ARMOR_MODS_21[key].label}: the armor's Soak reduced this damage — ${ARMOR_MODS_21[key].onSoak}.`);
    if (part === "head" && result.hpLoss > 0) headHit = true;
    lines.push(`<li><strong>${escapeHTML(title)} → ${PARTS[part].label}</strong>${rolled}${applied.typeLabel ? ` · ${escapeHTML(applied.typeLabel)}` : ""}: ${applied.dealt} damage${plan.extraDamage ? ` (${damage} + ${plan.extraDamage} from Strikes left over)` : ""}. Soaked ${result.absorbed} (Soak −${result.soakLoss}) · HP −${result.hpLoss} → ${result.after.hp} / ${result.after.max} · <strong>${result.after.status}</strong>${notes.map(note => `<br><span class="hint">${escapeHTML(note)}</span>`).join("")}</li>`);
  }
  const content = `<section class="r21-chat"><h3>Strikes spent · ${escapeHTML(data.attackerName || "Winner")} → ${escapeHTML(loser.name ?? "Target")}</h3>
    <p>${plan.spent} of ${strikes} Strike${strikes === 1 ? "" : "s"} spent${plan.left > 0 ? ` — <strong>${plan.left} left unspent</strong>` : ""}${data.weapon ? ` with ${escapeHTML(data.weapon)}` : ""}.</p><ul class="r21-mods">${lines.join("")}</ul>${headHit ? headChecksHTML21() : ""}</section>`;
  return foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor: loser}), content, flags: headHit ? {[SYSTEM]: {headHit21: {actor: loser.uuid ?? ""}}} : {}});
}

export function damageConsequences(part, result) {
  const notes = [];
  if (part === "head" && result.hpLoss > 0) notes.push("Head damage: make a Stun Check (Heart + Stillness, p.121) and a Morale Check.");
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

async function postDamage(actor, part, result, damageType = "", extraNote = "") {
  const notes = damageConsequences(part, result), headHit = part === "head" && result.hpLoss > 0;
  if (extraNote) notes.unshift(extraNote);
  // Armor Mods that answer when the piece's Soak reduces damage (2.1 p.202).
  if (result.absorbed > 0) for (const key of actor.system.r21?.parts?.[part]?.armorMods ?? []) if (ARMOR_MODS_21[key]?.onSoak) notes.push(`${ARMOR_MODS_21[key].label}: the armor's Soak reduced this damage — ${ARMOR_MODS_21[key].onSoak}.`);
  const content = `<section class="r21-chat"><h3>${escapeHTML(actor.name)} · ${PARTS[part].label}${damageType ? ` · ${escapeHTML(damageType)}` : ""}</h3><p>Soaked ${result.absorbed} (Soak −${result.soakLoss}) · HP −${result.hpLoss} → ${result.after.hp} / ${result.after.max} · <strong>${result.after.status}</strong></p>${notes.map(note => `<p>${escapeHTML(note)}</p>`).join("")}${headHit ? headChecksHTML21() : ""}</section>`;
  return foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), content, flags: headHit ? {[SYSTEM]: {headHit21: {actor: actor.uuid ?? ""}}} : {}});
}

export {ATTACHMENT_STRENGTHS, partState};
// Shared with other 2.1 roll workflows (social influence).
export {evaluate as evaluate21, diceHTML as diceHTML21, partsHTML as partsHTML21, post as post21, stateFor as stateFor21, blockedByState as blockedByState21};
