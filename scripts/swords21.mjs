// Rules 2.1 structured scenes: a SWORD of Cuts tied to a temporal anchor (pp.6–7), and Speed order (p.10).
// Foundry's Combat tracker carries the scene: each Round is one Cut; initiative is Speed, lowest declares first.
import {usesRules21} from "./rules-version.mjs?v=0.2.14";
import {escapeHTML} from "./resolution.mjs?v=0.2.14";

const SYSTEM = "10kswordsfoundry";
const int = value => Math.trunc(Number(value) || 0);
const numeric = value => typeof value === "number" && Number.isFinite(value);

/** p.6: a Sword usually has 4 Cuts (6 or 8 for longer anchors); each Cut is a span of time such as 3 seconds. */
export function normalizeSword21(data = {}) {
  const cuts = Math.max(1, Math.min(24, int(data.cuts) || 4));
  return {anchor: String(data.anchor ?? "").trim(), cuts, cutLength: String(data.cutLength ?? "").trim() || "3 seconds"};
}

/** Where the scene stands: Cut marks from the flat start to the sharp tip, and whether the Sword has ended. */
export function swordState21(sword, round) {
  if (!sword) return null;
  const {anchor, cuts, cutLength} = normalizeSword21(sword);
  const current = Math.max(0, int(round));
  return {anchor, cuts, cutLength, current, remaining: Math.max(0, cuts - current), ended: current > cuts, atTip: current === cuts,
    marks: Array.from({length: cuts}, (_, index) => ({index: index + 1, state: index + 1 < current ? "done" : index + 1 === current ? "current" : "upcoming", tip: index + 1 === cuts}))};
}

/** p.10: lowest Speed declares and acts first, going up. Combatants without a Speed go last; ties keep a stable order. */
export function speedOrder21(a, b) {
  const ia = numeric(a.initiative) ? a.initiative : Infinity;
  const ib = numeric(b.initiative) ? b.initiative : Infinity;
  if (ia !== ib) return ia === Infinity ? 1 : ib === Infinity ? -1 : ia - ib;
  return String(a.name ?? "").localeCompare(String(b.name ?? "")) || (a.id > b.id ? 1 : a.id < b.id ? -1 : 0);
}

/**
 * Alpha p.4 (p.10 earlier): Cutting-In. A higher-Speed combatant may give up its place and insert itself into a lower Speed's place.
 * Returns the initiative that sorts it directly before the current combatant.
 */
export function interjectInitiative21(turns, turnIndex, combatantId, speed) {
  const current = turns[turnIndex], position = turns.findIndex(entry => entry.id === combatantId);
  if (!current) throw new Error("Start the Sword first.");
  if (position < 0) throw new Error("That combatant is not in this scene.");
  if (position === turnIndex) throw new Error("It is already this combatant's turn.");
  if (position < turnIndex) throw new Error("This combatant has already acted in this Cut.");
  if (!(int(speed) > int(current.initiative))) throw new Error(`Only someone with a higher Speed than ${current.name ?? "the current actor"} (${int(current.initiative)}) can Cut-In.`);
  const previous = turns[turnIndex - 1];
  const low = previous && numeric(previous.initiative) ? previous.initiative : current.initiative - 1;
  return (low + current.initiative) / 2;
}

/** Combat document for 2.1 worlds: Speed order. Under 2.0.3 it behaves exactly like the base class. */
export function combatClass21(Base) {
  return class SwordsCombat extends Base {
    _sortCombatants(a, b) { return usesRules21() ? speedOrder21(a, b) : super._sortCombatants(a, b); }
  };
}

/** Combatant document for 2.1 worlds: initiative is the actor's Speed, with no roll. */
export function combatantClass21(Base) {
  return class SwordsCombatant extends Base {
    _getInitiativeFormula() {
      if (!usesRules21()) return super._getInitiativeFormula();
      return String(Math.max(0, int(this.actor?.system?.r21?.speed)));
    }
  };
}

const speedOf = combatant => Math.max(0, int(combatant.actor?.system?.r21?.speed));

/** GM: resets every combatant to its Speed at the start of each Cut and announces the Cut or the end of the Sword. */
async function onCut(combat, changes) {
  if (!usesRules21() || !game.user.isActiveGM || !("round" in changes) || !(combat.round > 0)) return;
  const updates = combat.combatants.contents.filter(entry => entry.actor).map(entry => ({_id: entry.id, initiative: speedOf(entry)}))
    .filter(update => combat.combatants.get(update._id).initiative !== update.initiative);
  if (updates.length) await combat.updateEmbeddedDocuments("Combatant", updates, {turnEvents: false});
  const state = swordState21(combat.getFlag(SYSTEM, "sword21"), combat.round);
  if (!state) return;
  const anchor = state.anchor ? escapeHTML(state.anchor) : "the temporal anchor";
  const content = state.ended
    ? `<section class="r21-chat"><h3>The Sword ends</h3><p>The tip is reached: ${anchor} comes to pass. The Intercessor decides whether a new Sword, with a new temporal anchor, is needed (p.7).</p></section>`
    : `<section class="r21-chat"><h3>Cut ${state.current} of ${state.cuts}${state.atTip ? " · the tip" : ""}</h3><p>${state.cutLength} pass. ${anchor} moves forward. Lowest Speed declares first; anyone faster may Cut-In (Alpha p.4).</p></section>`;
  await foundry.documents.ChatMessage.create({content, speaker: {alias: "Sword"}});
}

async function setSword(combat) {
  const sword = normalizeSword21(combat.getFlag(SYSTEM, "sword21") ?? {});
  const input = await foundry.applications.api.DialogV2.prompt({window: {title: "Set the Sword"},
    content: `<label>Temporal anchor<input name="anchor" value="${escapeHTML(sword.anchor)}" placeholder="The skyship crashes into the spire"></label>
      <label>Cuts<input name="cuts" type="number" min="1" max="24" step="1" value="${sword.cuts}"></label>
      <label>Each Cut lasts<input name="cutLength" value="${escapeHTML(sword.cutLength)}" placeholder="3 seconds"></label>
      <p class="hint">Usually 4 Cuts; 6 or 8 for longer anchors. Violence: 3, 6 or 12 seconds; debates: 1 to 5 minutes (p.6).</p>`,
    ok: {label: "Set Sword", callback: (event, button) => ({anchor: button.form.elements.anchor.value, cuts: Number(button.form.elements.cuts.value), cutLength: button.form.elements.cutLength.value})},
    rejectClose: false});
  if (!input) return null;
  return combat.setFlag(SYSTEM, "sword21", normalizeSword21(input));
}

async function interject(combat, combatant) {
  const initiative = interjectInitiative21(combat.turns, combat.turn, combatant.id, speedOf(combatant));
  await combatant.update({initiative});
  return foundry.documents.ChatMessage.create({speaker: {alias: combatant.name}, content: `<section class="r21-chat"><p><strong>${escapeHTML(combatant.name)}</strong> (Speed ${speedOf(combatant)}) gives up their place and Cuts-In now (Alpha p.4).</p></section>`});
}

function swordPanel(combat) {
  const state = swordState21(combat?.getFlag(SYSTEM, "sword21"), combat?.round ?? 0);
  const panel = document.createElement("section");
  panel.className = "r21-sword";
  if (!state) panel.innerHTML = `<p><strong>No Sword set.</strong> Each Round is a Cut; lowest Speed declares first.</p>`;
  else panel.innerHTML = `<p class="r21-sword-anchor"><strong>Sword:</strong> ${escapeHTML(state.anchor || "unnamed anchor")}</p>
    <div class="r21-sword-cuts" aria-label="Cut ${state.current} of ${state.cuts}">${state.marks.map(mark => `<span class="r21-cut ${mark.state}${mark.tip ? " tip" : ""}" title="Cut ${mark.index}${mark.tip ? " (tip)" : ""}">${mark.index}</span>`).join("")}</div>
    <p class="r21-sword-status">${state.ended ? "The Sword has ended." : state.current ? `Cut ${state.current} of ${state.cuts} · ${escapeHTML(state.cutLength)} each` : `${state.cuts} Cuts of ${escapeHTML(state.cutLength)} · begin the encounter to make the first Cut`}</p>`;
  if (game.user.isGM && combat) {
    const button = document.createElement("button");
    button.type = "button"; button.textContent = state ? "Change Sword" : "Set Sword";
    button.addEventListener("click", () => setSword(combat).catch(error => ui.notifications.warn(error.message)));
    panel.append(button);
  }
  return panel;
}

export function registerSwords21() {
  CONFIG.Combat.documentClass = combatClass21(CONFIG.Combat.documentClass);
  CONFIG.Combatant.documentClass = combatantClass21(CONFIG.Combatant.documentClass);
  Hooks.on("updateCombat", (combat, changes) => { onCut(combat, changes).catch(error => console.error(error)); });
  Hooks.on("renderCombatTracker", (app, html) => {
    if (!usesRules21()) return;
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (!root) return;
    root.querySelector(".r21-sword")?.remove();
    const list = root.querySelector(".combat-tracker, ol.directory-list, .combatants");
    const panel = swordPanel(app.viewed ?? game.combat);
    if (list) list.before(panel); else root.prepend(panel);
  });
  Hooks.on("getCombatantContextOptions", (app, options) => {
    const combatantFor = li => (app.viewed ?? game.combat)?.combatants.get(li.dataset.combatantId);
    options.push({label: "Cut-In now (2.1)", icon: "fa-solid fa-bolt",
      visible: li => {
        const combat = app.viewed ?? game.combat, combatant = combatantFor(li);
        return usesRules21() && !!combat?.started && !!combatant?.isOwner && combat.turns.indexOf(combatant) > combat.turn;
      },
      onClick: (event, li) => {
        const combat = app.viewed ?? game.combat, combatant = combatantFor(li);
        if (combat && combatant) interject(combat, combatant).catch(error => ui.notifications.warn(error.message));
      }});
  });
}
