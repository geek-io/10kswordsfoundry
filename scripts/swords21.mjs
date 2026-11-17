// Rules 2.1 structured scenes: TICKS (2.1 book pp.22-23). This replaces the earlier Round/Cut tracker.
// (File name swords21.mjs retained to avoid an esmodule rename across the deploy; the concept is "Ticks".)
// Foundry's Combat tracker carries the scene: one engine round is one Tick (1 second); a combatant's initiative is the
// Tick on which it is next READY, lowest first. Under 2.0.3 every class and hook here leaves the engine untouched.
import {usesRules21} from "./rules-version.mjs?v=0.2.40";
import {escapeHTML} from "./resolution.mjs?v=0.2.40";
import {spendFlame21, flurryReadyDelay21, ticksSpeed21, readyDice21} from "./rules21.mjs?v=0.2.40";
import {confirmScorch21, deviationCheck21} from "./scorch21.mjs?v=0.2.40";

const SYSTEM = "10kswordsfoundry";
const int = value => Math.trunc(Number(value) || 0);
const numeric = value => typeof value === "number" && Number.isFinite(value);
export const FLASH_COST_21 = 2;

/** p.22: entering a Structured Situation, roll a d6 and add Speed: that Tick is your first READY. Joining late counts from the live Tick. */
export function firstReady21(d6, speed, tick = 0) { return Math.max(0, int(tick)) + Math.max(1, Math.min(6, int(d6) || 1)) + Math.max(0, int(speed)); }

/** Earliest READY first. Combatants without a READY go last; ties (simultaneous Acts) keep a stable order. */
export function readyOrder21(a, b) {
  const ia = numeric(a.initiative) ? a.initiative : Infinity;
  const ib = numeric(b.initiative) ? b.initiative : Infinity;
  if (ia !== ib) return ia === Infinity ? 1 : ib === Infinity ? -1 : ia - ib;
  return String(a.name ?? "").localeCompare(String(b.name ?? "")) || (a.id > b.id ? 1 : a.id < b.id ? -1 : 0);
}

/** p.129 Gambits: a WB's predetermined READY Ticks, e.g. "6... 15... 24". Returns sorted unique positive Ticks. */
export function parseGambit21(text) {
  const ticks = (Array.isArray(text) ? text : String(text ?? "").split(/[^0-9]+/)).map(int).filter(value => value > 0);
  return [...new Set(ticks)].sort((a, b) => a - b);
}
/** The next plotted READY after this Tick, or null when the list has run out. */
export function nextGambitReady21(list, tick) { return parseGambit21(list).find(value => value > int(tick)) ?? null; }

/** p.22: after an Act, next READY = this Tick + RECOVERY (Speed + Speed Modifiers); a Dash adds +1. Gambit lists replace Recovery (p.129). */
export function actReady21({tick, recovery, dash = false, gambit = null} = {}) {
  const now = Math.max(0, int(tick));
  if (gambit?.length) {
    const next = nextGambitReady21(gambit, now);
    if (next !== null) return next + (dash ? 1 : 0);
  }
  return now + Math.max(1, int(recovery)) + (dash ? 1 : 0);
}

/**
 * p.22 FLASH: during Recovery, burn 2 Flame to Act now, then add RECOVERY "to that Tick instead, moving their real ACT further back".
 * Read as: next READY = the Flash Tick + RECOVERY, never earlier than the READY they already had (recorded ambiguity).
 */
export function flashReady21({tick, ready, recovery} = {}) {
  const now = Math.max(0, int(tick));
  if (!numeric(ready)) throw new Error("Roll this combatant's first READY before they Flash.");
  if (!(ready > now)) throw new Error("Flash is for Recovery: this combatant is READY now and can simply Act.");
  return Math.max(ready, now + Math.max(1, int(recovery)));
}

/** p.117 FLURRY: the Winner may KILL THE BUDDHA on the next Tick as their Action, with no Recovery, up to MOT times. */
export function flurryStep21(state = {}, {tick, ready, motorics, acted = null} = {}) {
  const now = Math.max(0, int(tick)), count = Math.max(0, int(state.count)) + 1;
  if (int(motorics) > 0 && count > int(motorics)) throw new Error(`A Flurry can only continue up to Motorics (${int(motorics)}) times; it refreshes on the next READY.`);
  // The Tick the Flurry started on, and whether it started before the flurrier's own READY (a winning Defender).
  const from = state.count ? int(state.from) : now;
  // Having already taken this Tick's Act (and its Recovery) is not "before their READY": the Flurry counts from this Tick.
  const early = state.count ? !!state.early : numeric(ready) && ready > now && int(acted) !== now;
  const base = state.count ? int(state.base) : (early ? ready : now);
  return {count, from, early, base, ready: now + 1};
}
/** p.117 Flurrious Recovery: +2 per continuation. Speed 4, 3 Flurries, Tick 6 -> READY 16. Started before their READY, it adds to that READY. */
export function flurryEndReady21(state = {}, {tick, recovery} = {}) {
  const base = state.count ? int(state.base) : Math.max(0, int(tick));
  return Math.max(Math.max(0, int(tick)) + 1, base + flurryReadyDelay21(Math.max(1, int(recovery)), state.count));
}

/** Who stands where on this Tick: READY now (or overdue), in Recovery, holding or anticipating, mid-Flurry, and the next READY Tick. */
export function tickState21(combatants = [], tick = 0) {
  const now = Math.max(0, int(tick));
  const entries = [...combatants].sort(readyOrder21);
  const ready = [], recovering = [], waiting = [], unrolled = [];
  for (const entry of entries) {
    if (!numeric(entry.initiative)) unrolled.push(entry);
    else if (entry.initiative <= now) ready.push(entry);
    else recovering.push(entry);
    if (entry.held) waiting.push(entry);
  }
  return {tick: now, ready, recovering, waiting, unrolled, nextReady: recovering.length ? recovering[0].initiative : null};
}

/** Combat document for 2.1 worlds: READY order, and the turn arrows move a whole Tick. Under 2.0.3 it behaves exactly like the base class. */
export function combatClass21(Base) {
  return class TicksCombat extends Base {
    _sortCombatants(a, b) { return usesRules21() ? readyOrder21(a, b) : super._sortCombatants(a, b); }
    async nextTurn() { return usesRules21() ? this.nextRound() : super.nextTurn(); }
    async previousTurn() { return usesRules21() ? this.previousRound() : super.previousTurn(); }
  };
}

const recoveryOf = combatant => {
  const system = combatant.actor?.system;
  return Math.max(1, int(system?.r21?.ticks?.recovery) || ticksSpeed21(system?.cores?.wit, system?.cores?.mnd));
};
const speedOf = combatant => {
  const system = combatant.actor?.system;
  return Math.max(1, int(system?.r21?.ticks?.speed) || ticksSpeed21(system?.cores?.wit, system?.cores?.mnd));
};

/** Combatant document for 2.1 worlds: first READY = live Tick + d6 + Speed. Hummingbird Pulse rolls the d6 twice and keeps the lower (p.216). */
export function combatantClass21(Base) {
  return class TicksCombatant extends Base {
    _getInitiativeFormula() {
      if (!usesRules21()) return super._getInitiativeFormula();
      return `${readyDice21(this.actor?.system?.r21?.assets)} + ${speedOf(this) + Math.max(0, int(this.combat?.round ?? this.parent?.round))}`;
    }
  };
}

const flags = combatant => combatant.getFlag?.(SYSTEM, "ticks21") ?? {};
const tickOf = combat => Math.max(0, int(combat?.round));
const view = combatant => ({id: combatant.id, name: combatant.name, initiative: combatant.initiative, held: flags(combatant).held ?? null, flurry: flags(combatant).flurry ?? null});
const say = (combatant, text) => foundry.documents.ChatMessage.create({speaker: {alias: combatant.name}, content: `<section class="r21-chat"><p>${text}</p></section>`});
const combatantOf = actor => {
  const combat = globalThis.game?.combat;
  if (!usesRules21() || !combat?.started || !actor) return null;
  return combat.combatants.find(entry => entry.actor === actor || (!!actor.uuid && entry.actor?.uuid === actor.uuid)) ?? null;
};
function need(combat, combatant) {
  if (!combat?.started) throw new Error("Begin the encounter first: Tick 0 ticks up to Tick 1.");
  if (!combatant?.isOwner) throw new Error("A GM or this combatant's owner must do this.");
  return tickOf(combat);
}
const patch = (combatant, initiative, changes) => combatant.update({initiative, [`flags.${SYSTEM}.ticks21`]: {...flags(combatant), ...changes}});

/** Act (optionally a Dash, Hold or Anticipate): sets the next READY and announces it. */
export async function act21(combat, combatant, {dash = false, hold = "", trigger = ""} = {}) {
  const tick = need(combat, combatant), state = flags(combatant);
  if (numeric(combatant.initiative) && combatant.initiative > tick) throw new Error(`${combatant.name} is in Recovery until Tick ${combatant.initiative}. Flash (2 Flame) to Act now.`);
  if (state.flurry?.count) throw new Error(`${combatant.name} is mid-Flurry: continue from the KILL THE BUDDHA card or end the Flurry.`);
  const recovery = recoveryOf(combatant), ready = actReady21({tick, recovery, dash, gambit: state.gambit});
  const held = hold ? {kind: hold, trigger: String(trigger ?? "").trim(), since: tick} : null;
  await patch(combatant, ready, {held, flurry: null, acted: tick});
  const what = hold === "anticipate" ? `Anticipates${held.trigger ? `: “${escapeHTML(held.trigger)}”` : ""}. It goes off immediately before that Action, as long as that is before Tick ${ready}`
    : hold === "hold" ? `Holds their Act: they may act at any point in a later Tick before Tick ${ready}`
    : dash ? "Acts and Dashes (+1 Recovery)" : "Acts";
  return say(combatant, `<strong>Tick ${tick}: ${escapeHTML(combatant.name)}</strong> ${what}. ${state.gambit?.length ? "Gambit" : `Recovery ${recovery + (dash ? 1 : 0)}`} → next READY <strong>Tick ${ready}</strong> (2.1 p.22).`);
}

/** Resolve a Held or Anticipated Act: the READY already figured stays as it is. */
export async function release21(combat, combatant) {
  const tick = need(combat, combatant), held = flags(combatant).held;
  if (!held) throw new Error(`${combatant.name} is not holding an Act.`);
  await patch(combatant, combatant.initiative, {held: null});
  return say(combatant, `<strong>Tick ${tick}: ${escapeHTML(combatant.name)}</strong> ${held.kind === "anticipate" ? `acts on what they Anticipated${held.trigger ? ` (“${escapeHTML(held.trigger)}”)` : ""}, immediately before it` : "resolves their Held Act"}. Next READY stays Tick ${combatant.initiative} (2.1 p.22).`);
}

/** FLASH: burn 2 Flame during Recovery to Act now. */
export async function flash21(combat, combatant) {
  const tick = need(combat, combatant), actor = combatant.actor;
  if (!actor) throw new Error("This combatant has no actor to burn Flame.");
  const recovery = recoveryOf(combatant), ready = flashReady21({tick, ready: combatant.initiative, recovery});
  if (FLASH_COST_21 > int(actor.system.availableArdor) && !await confirmScorch21(actor, {burn: FLASH_COST_21, name: "Flash"})) return null;
  const source = actor.toObject().system, spent = spendFlame21(source.ardor, source.scorch, {burn: FLASH_COST_21});
  await actor.update({"system.ardor.burnt": spent.burnt, "system.ardor.installed": spent.installed, "system.scorch": spent.scorch});
  await patch(combatant, ready, {});
  const message = await say(combatant, `<strong>Tick ${tick}: ${escapeHTML(combatant.name)} FLASHES</strong>, burning ${FLASH_COST_21} Flame to Act now, even before someone's KILL THE BUDDHA. Resolve their Act first. READY was Tick ${combatant.initiative}; Recovery ${recovery} from this Tick → next READY <strong>Tick ${ready}</strong> (2.1 p.22).`);
  if (spent.added) await deviationCheck21(actor, spent.scorch);
  return message;
}

/** Called when a Flurry button is pressed on a KILL THE BUDDHA card: the flurrier acts again next Tick with no Recovery. */
export async function noteFlurry21(actor) {
  const combatant = combatantOf(actor), combat = globalThis.game?.combat;
  if (!combatant) return null;
  const state = flags(combatant);
  if (state.gambit?.length) throw new Error(`${combatant.name} runs on a Gambit and cannot Flurry (2.1 p.129).`);
  const tick = tickOf(combat), next = flurryStep21(state.flurry ?? {}, {tick, ready: combatant.initiative, motorics: actor.system?.cores?.mot, acted: state.acted});
  const {ready, ...flurry} = next;
  await patch(combatant, ready, {flurry, held: null});
  return say(combatant, `<strong>Tick ${tick}: ${escapeHTML(combatant.name)}</strong> presses the advantage: Flurry ${flurry.count}. No Recovery; they KILL THE BUDDHA on <strong>Tick ${ready}</strong> (2.1 p.117).`);
}

/** The Flurry ends: Recovery + 2 per continuation. */
export async function endFlurry21(combat, combatant) {
  const tick = need(combat, combatant), state = flags(combatant).flurry;
  if (!state?.count) throw new Error(`${combatant.name} is not in a Flurry.`);
  const recovery = recoveryOf(combatant), ready = flurryEndReady21(state, {tick, recovery});
  await patch(combatant, ready, {flurry: null});
  return say(combatant, `<strong>${escapeHTML(combatant.name)}</strong> ends a Flurry of ${state.count}: Recovery ${recovery} + ${2 * state.count}${state.early ? `, added to the READY they already had (Tick ${state.base})` : ` from Tick ${state.base}`} → next READY <strong>Tick ${ready}</strong> (2.1 p.117).`);
}

async function setGambit(combatant) {
  const current = (flags(combatant).gambit ?? []).join(", ");
  const text = await foundry.applications.api.DialogV2.prompt({window: {title: `${combatant.name}: Gambit READY Ticks`},
    content: `<label>READY Ticks<input name="ticks" value="${escapeHTML(current)}" placeholder="6, 15, 24, 33, 40, 49"></label>
      <p class="hint">A WB on a Gambit has its READY Ticks plotted out, rolls no Recovery and cannot Flurry (2.1 p.129). Leave empty to use Speed and Recovery again.</p>`,
    ok: {label: "Set Gambit", callback: (event, button) => button.form.elements.ticks.value}, rejectClose: false});
  if (text === null || text === undefined) return null;
  const gambit = parseGambit21(text), tick = tickOf(combatant.combat ?? combatant.parent);
  const next = gambit.length ? nextGambitReady21(gambit, Math.max(0, tick - 1)) : null;
  return patch(combatant, next ?? combatant.initiative, {gambit, flurry: null});
}

async function askTrigger(combatant) {
  return foundry.applications.api.DialogV2.prompt({window: {title: `${combatant.name}: Anticipate`},
    content: `<label>What are you anticipating?<input name="trigger" placeholder="I will shoot when the Divine Beast attacks"></label>
      <p class="hint">Your Act goes off immediately before that Action, as long as it is before your next READY (2.1 p.22).</p>`,
    ok: {label: "Anticipate", callback: (event, button) => button.form.elements.trigger.value}, rejectClose: false});
}

/** GM: announces a Tick on which someone is READY, and lets unused Held Acts lapse once their holder is READY again. */
async function onTick(combat, changes) {
  if (!usesRules21() || !game.user.isActiveGM || !("round" in changes) || !(combat.round > 0)) return;
  const tick = tickOf(combat);
  const lapsed = combat.combatants.contents.filter(entry => flags(entry).held && numeric(entry.initiative) && entry.initiative <= tick);
  for (const entry of lapsed) await entry.update({[`flags.${SYSTEM}.ticks21`]: {...flags(entry), held: null}});
  const state = tickState21(combat.combatants.contents.map(view), tick);
  if (!state.ready.length && !lapsed.length) return;
  const names = list => list.map(entry => escapeHTML(entry.name)).join(", ");
  const waiting = state.waiting.filter(entry => !lapsed.some(gone => gone.id === entry.id));
  const content = `<section class="r21-chat"><h3>Tick ${tick}</h3><p>Everyone who can may Step. ${state.ready.length ? `<strong>READY:</strong> ${names(state.ready)}${state.ready.length > 1 ? " — they Act simultaneously; settle opposed Acts by the fiction or a Conflict Check" : ""}.` : ""}
    ${waiting.length ? ` Held or Anticipated Acts: ${names(waiting)}.` : ""}${lapsed.length ? ` Unused Held Acts lapse: ${names(lapsed)}.` : ""}</p></section>`;
  await foundry.documents.ChatMessage.create({content, speaker: {alias: "Ticks"}});
}

const run = promise => promise.catch(error => ui.notifications.warn(error.message));
function button(label, title, handler) {
  const element = document.createElement("button");
  element.type = "button"; element.textContent = label; element.title = title;
  element.addEventListener("click", event => { event.preventDefault(); run(Promise.resolve().then(handler)); });
  return element;
}

function ticksPanel(combat) {
  const panel = document.createElement("section");
  panel.className = "r21-round r21-ticks";
  if (!combat) { panel.innerHTML = `<p><strong>Ticks.</strong> Create an encounter to structure the violence.</p>`; return panel; }
  const tick = tickOf(combat), state = tickState21(combat.combatants.contents.map(view), tick);
  const names = list => list.map(entry => escapeHTML(entry.name)).join(", ");
  panel.innerHTML = !combat.started
    ? `<p><strong>Tick 0.</strong> Roll each first READY (d6 + Speed), then begin the encounter to tick up to Tick 1.</p>`
    : `<p><strong>Tick ${tick}</strong> · 1 second · everyone may Step</p>
       <p>${state.ready.length ? `<strong>READY:</strong> ${names(state.ready)}` : "Nobody is READY."}${state.nextReady !== null ? ` · next READY Tick ${state.nextReady}` : ""}${state.unrolled.length ? ` · no READY yet: ${names(state.unrolled)}` : ""}</p>`;
  if (!combat.started) return panel;
  if (game.user.isGM) {
    const row = document.createElement("div"); row.className = "r21-tick-row";
    row.append(button("Next Tick", "Advance one second", () => combat.nextRound()));
    if (state.nextReady !== null && state.nextReady > tick + 1) row.append(button(`Skip to Tick ${state.nextReady}`, "Jump to the next Tick on which someone is READY (everyone Steps each Tick in between)", () => combat.update({round: state.nextReady, turn: 0})));
    panel.append(row);
  }
  for (const combatant of [...combat.combatants.contents].sort(readyOrder21)) {
    if (!combatant.isOwner || !numeric(combatant.initiative)) continue;
    const info = flags(combatant), row = document.createElement("div");
    row.className = "r21-tick-row";
    const label = document.createElement("span");
    label.textContent = `${combatant.name}${info.held ? info.held.kind === "anticipate" ? " (anticipating)" : " (holding)" : ""}${info.flurry?.count ? ` (Flurry ${info.flurry.count})` : ""}`;
    row.append(label);
    if (info.flurry?.count) row.append(button("End Flurry", "The Flurry ends: Recovery + 2 per continuation", () => endFlurry21(combat, combatant)));
    else if (combatant.initiative <= tick) row.append(
      button("Act", "Act, then Recovery until your next READY", () => act21(combat, combatant)),
      button("Dash", "Act with a Dash: +1 Recovery", () => act21(combat, combatant, {dash: true})),
      button("Hold", "Hold your Act for a later Tick before your next READY", () => act21(combat, combatant, {hold: "hold"})),
      button("Anticipate", "Declare what you anticipate; your Act goes off immediately before it", async () => {
        const trigger = await askTrigger(combatant);
        if (trigger !== null && trigger !== undefined) await act21(combat, combatant, {hold: "anticipate", trigger});
      }));
    else {
      if (info.held) row.append(button("Release", "Resolve the Held or Anticipated Act now", () => release21(combat, combatant)));
      row.append(button(`Flash ✹${FLASH_COST_21}`, "During Recovery, burn 2 Flame to Act now", () => flash21(combat, combatant)));
    }
    panel.append(row);
  }
  return panel;
}

export function registerTicks21() {
  CONFIG.Combat.documentClass = combatClass21(CONFIG.Combat.documentClass);
  CONFIG.Combatant.documentClass = combatantClass21(CONFIG.Combatant.documentClass);
  Hooks.on("updateCombat", (combat, changes) => { onTick(combat, changes).catch(error => console.error(error)); });
  Hooks.on("renderCombatTracker", (app, html) => {
    if (!usesRules21()) return;
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (!root) return;
    root.querySelector(".r21-round")?.remove();
    const list = root.querySelector(".combat-tracker, ol.directory-list, .combatants");
    const panel = ticksPanel(app.viewed ?? game.combat);
    if (list) list.before(panel); else root.prepend(panel);
  });
  // Combatant flag changes (Hold, Flurry, Gambit) do not always redraw the tracker on their own.
  Hooks.on("updateCombatant", (combatant, changes) => { if (usesRules21() && changes.flags?.[SYSTEM]) ui.combat?.render(); });
  Hooks.on("getCombatantContextOptions", (app, options) => {
    const combatantFor = li => (app.viewed ?? game.combat)?.combatants.get(li.dataset.combatantId);
    options.push({label: "Gambit READY Ticks (2.1)", icon: "fa-solid fa-list-ol",
      visible: li => usesRules21() && !!game.user.isGM && !!combatantFor(li),
      onClick: (event, li) => { const combatant = combatantFor(li); if (combatant) run(setGambit(combatant)); }});
  });
}
