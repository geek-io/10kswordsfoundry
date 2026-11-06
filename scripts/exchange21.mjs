// Rules 2.1 KILL THE BUDDHA exchange card: everyone's Openings in one chat card, resolved tier by tier (pp.23–28).
// The active GM writes the card; players' actions reach the GM through the system socket.
import {newExchange21, applyOperation21, landing21, RANK, RANK_LABEL, TIERS} from "./exchange-state21.mjs?v=0.2.14";
import {damagePart} from "./roll21.mjs?v=0.2.14";
import {escapeHTML} from "./resolution.mjs?v=0.2.14";

const SYSTEM = "10kswordsfoundry";
const SOCKET = `system.${SYSTEM}`;
const FLAG = "exchange21";

/** A participant built from a KILL THE BUDDHA chat card. */
export function rollFromMessage21(message) {
  const ktb = message?.getFlag?.(SYSTEM, "ktb") ?? message?.flags?.[SYSTEM]?.ktb;
  if (!ktb) throw new Error("That is not a KILL THE BUDDHA roll.");
  return {key: ktb.attacker || message.id, name: message.speaker?.alias || message.alias || "Combatant", actorUuid: ktb.attacker ?? "", tokenUuid: ktb.attackerToken ?? "",
    quick: ktb.quick, solid: ktb.solid, perfect: ktb.perfect, whiff: ktb.whiff, damage: ktb.damage, weapon: ktb.weapon ?? "", crushing: !!ktb.crushing};
}

const button = (action, label, data = {}) => `<button type="button" data-x21="${action}" ${Object.entries(data).map(([key, value]) => `data-${key}="${escapeHTML(String(value))}"`).join(" ")}>${label}</button>`;

/** Chat card HTML for an exchange state. */
export function exchangeHTML21(state) {
  const name = key => escapeHTML(state.participants.find(entry => entry.key === key)?.name ?? "?");
  const done = state.tier === "done";
  const tiers = TIERS.map(tier => `<span class="r21-tier ${tier === state.tier ? "current" : RANK[tier] < (RANK[state.tier] ?? 4) ? "past" : ""}">${RANK_LABEL[tier]}</span>`).join("<span>▸</span>");
  const rows = state.participants.map(entry => `<tr><td><strong>${escapeHTML(entry.name)}</strong><small>${escapeHTML(entry.weapon || "")}${entry.weapon ? " · " : ""}${entry.damage} dmg</small></td>
    <td>${entry.open.quick}</td><td>${entry.open.solid}</td><td>${entry.open.perfect}</td><td>${entry.open.whiff}</td>
    <td>${entry.bonus.quick || entry.bonus.solid ? `<strong>${entry.bonus.quick ? `+${entry.bonus.quick} Q` : ""} ${entry.bonus.solid ? `+${entry.bonus.solid} S` : ""}</strong>` : ""}</td>
    <td class="r21-x-actions">${done ? "" : `${button("declare", "Act", {key: entry.key})}${button("fuse", "Fuse", {key: entry.key})}${button("sidhi", "Sidhi", {key: entry.key})}`}</td></tr>`).join("");
  const maneuvers = state.declarations.map(entry => {
    const status = entry.kind === "maneuver" ? (entry.countered ? `<em>Countered</em>` : entry.bonus ? "<em>from a Counter</em>" : "")
      : `<em>${entry.kind === "greater" ? "Greater Counter" : entry.kind === "overwhelming" ? "Overwhelming Counter" : "Counter"}</em>`;
    const counterable = !done && entry.kind === "maneuver" && !entry.countered && (entry.bonus || entry.tier === state.tier);
    const lands = entry.kind === "maneuver" && !entry.countered && entry.target;
    return `<li class="${entry.countered ? "countered" : ""}"><span>${name(entry.by)} · ${RANK_LABEL[entry.rank]}${entry.kind === "maneuver" ? "" : " Counter"}: ${escapeHTML(entry.text || (entry.kind === "maneuver" ? "maneuver" : "negates the maneuver"))}${entry.target ? ` → ${name(entry.target)}` : ""} ${status}</span>
      <span class="r21-x-actions">${counterable ? button("counter", "Counter", {decl: entry.id}) : ""}${lands ? button("damage", "Apply damage", {decl: entry.id}) : ""}</span></li>`;
  }).join("");
  return `<section class="r21-chat r21-exchange"><h3>KILL THE BUDDHA · exchange</h3>
    <div class="r21-tiers">${tiers}</div>
    <table class="r21-x-table"><thead><tr><th>Combatant</th><th>Q</th><th>S</th><th>P</th><th>W</th><th>Bonus</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    ${maneuvers ? `<ol class="r21-x-maneuvers">${maneuvers}</ol>` : `<p class="hint">No maneuvers yet. ${done ? "" : `${RANK_LABEL[state.tier]} Openings act now; anyone may Counter with an equal or higher Opening.`}</p>`}
    ${done ? "<p><strong>Resolved.</strong></p>" : `<p class="r21-x-gm">${button("advance", state.tier === "perfect" ? "End KILL THE BUDDHA (GM)" : `Next: ${RANK_LABEL[TIERS[TIERS.indexOf(state.tier) + 1]]} tier (GM)`)}</p>`}
    <details><summary>Log</summary><ol>${state.log.map(line => `<li>${escapeHTML(line)}</li>`).join("")}</ol></details></section>`;
}

const stateOf = message => message?.getFlag?.(SYSTEM, FLAG);
const openExchanges = () => (game.messages?.contents ?? []).filter(message => stateOf(message) && stateOf(message).state.tier !== "done");

/** Starts an exchange from a KILL THE BUDDHA card. Any user may create it; the GM keeps it up to date. */
export async function startExchange21(sourceMessage) {
  const state = applyOperation21(newExchange21(), {type: "add", args: [rollFromMessage21(sourceMessage)]});
  return foundry.documents.ChatMessage.create({content: exchangeHTML21(state), speaker: {alias: "KILL THE BUDDHA"},
    flags: {[SYSTEM]: {[FLAG]: {state, sources: [sourceMessage.id]}}}});
}

function canAct(user, participant) {
  if (user?.isGM) return true;
  if (!participant?.actorUuid) return false;
  const actor = globalThis.fromUuidSync?.(participant.actorUuid);
  return !!actor?.testUserPermission?.(user, "OWNER");
}

/** GM side: validates and applies one operation, then rewrites the card. */
export async function applyExchangeOp21(message, op, user) {
  const flag = stateOf(message);
  if (!flag) throw new Error("That exchange no longer exists.");
  let operation = op;
  if (op.type === "add") {
    const source = game.messages.get(op.messageId);
    if (!source) throw new Error("That KILL THE BUDDHA roll is gone.");
    if (!user.isGM && source.author?.id !== user.id && !canAct(user, {actorUuid: source.getFlag(SYSTEM, "ktb")?.attacker})) throw new Error("Only the roller or a GM can add this roll.");
    operation = {type: "add", args: [rollFromMessage21(source)]};
  } else if (op.type === "advance") {
    if (!user.isGM) throw new Error("Only the GM moves to the next tier.");
  } else {
    const participant = flag.state.participants.find(entry => entry.key === op.args?.[0]);
    if (!canAct(user, participant)) throw new Error("Only that combatant's owner or a GM can act for them.");
  }
  const state = applyOperation21(flag.state, operation);
  const sources = op.type === "add" ? [...new Set([...(flag.sources ?? []), op.messageId])] : flag.sources ?? [];
  return message.update({content: exchangeHTML21(state), [`flags.${SYSTEM}.${FLAG}`]: {state, sources}});
}

/** Client side: applies directly as GM, otherwise asks the active GM over the socket. */
export async function requestExchangeOp21(message, op) {
  if (game.user.isGM) return applyExchangeOp21(message, op, game.user);
  if (!game.users.activeGM) throw new Error("A GM must be connected to update the KILL THE BUDDHA exchange.");
  game.socket.emit(SOCKET, {action: "exchange21", messageId: message.id, op, userId: game.user.id});
}

/** Adds a freshly rolled defence to the open exchange that contains the attacker's card. */
export async function joinExchangeFor21(sourceMessageId, rolled) {
  if (!rolled?.id || !rolled.getFlag?.(SYSTEM, "ktb")) return null;
  const exchange = openExchanges().reverse().find(message => stateOf(message).sources?.includes(sourceMessageId));
  if (!exchange) return null;
  return requestExchangeOp21(exchange, {type: "add", messageId: rolled.id});
}

async function prompt(title, content, read) {
  return foundry.applications.api.DialogV2.prompt({window: {title}, content, ok: {label: title, callback: (event, buttonEl) => read(buttonEl.form.elements)}, rejectClose: false});
}
const options = entries => entries.map(([value, label]) => `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`).join("");

async function onAction(message, action, data) {
  const {state} = stateOf(message);
  const me = key => state.participants.find(entry => entry.key === key);
  if (action === "advance") {
    if (!game.user.isGM) throw new Error("Only the GM moves to the next tier.");
    return requestExchangeOp21(message, {type: "advance", args: []});
  }
  if (action === "declare") {
    const actor = me(data.key), ranks = [];
    if (actor.open[state.tier]) ranks.push([`${state.tier}|0`, `${RANK_LABEL[state.tier]} (${actor.open[state.tier]} left)`]);
    for (const rank of ["quick", "solid"]) if (actor.bonus[rank]) ranks.push([`${rank}|1`, `${RANK_LABEL[rank]} from a Counter (acts now)`]);
    if (!ranks.length) throw new Error(`${actor.name} has no Opening that can act in the ${RANK_LABEL[state.tier]} tier.`);
    const targets = [["", "— no target —"], ...state.participants.filter(entry => entry.key !== actor.key).map(entry => [entry.key, entry.name])];
    const input = await prompt(`${actor.name}: act`, `<label>Opening<select name="rank">${options(ranks)}</select></label>
      <label>Maneuver<input name="text" placeholder="Strike the Torso, shove 1 m, disarm…"></label><label>Target<select name="target">${options(targets)}</select></label>
      <p class="hint">Quick: Torso strikes, step 1 m, shove, grab. Solid: Limb or Torso strikes, Control a Limb, disarm, knockback 2 m. Perfect: any Part incl. Head, headshot after aiming, throws (pp.24–25).</p>`,
      f => ({rank: f.rank.value, text: f.text.value, target: f.target.value}));
    if (!input) return null;
    const [rank, bonus] = input.rank.split("|");
    return requestExchangeOp21(message, {type: "declare", args: [actor.key, rank, {text: input.text, target: input.target, bonus: bonus === "1"}]});
  }
  if (action === "counter") {
    const target = state.declarations.find(entry => entry.id === Number(data.decl));
    const mine = state.participants.filter(entry => entry.key !== target.by && (game.user.isGM || canAct(game.user, entry)));
    const choices = mine.flatMap(entry => ["quick", "solid", "perfect"].filter(rank => RANK[rank] >= RANK[target.rank] && (entry.open[rank] || entry.bonus[rank]))
      .map(rank => [`${entry.key}|${rank}`, `${entry.name}: ${RANK_LABEL[rank]}${rank === "perfect" && target.rank === "quick" ? " (Overwhelming)" : RANK[rank] - RANK[target.rank] === 1 ? " (Greater)" : ""}`]));
    if (!choices.length) throw new Error(`Countering a ${RANK_LABEL[target.rank]} Opening needs a ${RANK_LABEL[target.rank]} Opening or better.`);
    const input = await prompt("Counter", `<label>Counter with<select name="who">${options(choices)}</select></label><label>How (it must follow the fiction)<input name="text" placeholder="Parry with the blade…"></label>
      <p class="hint">A fired bullet usually cannot be Countered without cover or luck (p.26).</p>`, f => ({who: f.who.value, text: f.text.value}));
    if (!input) return null;
    const [key, rank] = input.who.split("|");
    return requestExchangeOp21(message, {type: "counter", args: [key, rank, target.id, {text: input.text}]});
  }
  if (action === "fuse" || action === "sidhi") {
    const actor = me(data.key);
    const ranks = action === "fuse" ? [["quick", "Two Quick → Solid"], ["solid", "Two Solid → Perfect"]] : [["whiff", "Whiff → Quick"], ["quick", "Quick → Solid"], ["solid", "Solid → Perfect"]];
    const input = await prompt(action === "fuse" ? `${actor.name}: fuse` : `${actor.name}: burn 1 Sidhi`, `<label>Opening<select name="rank">${options(ranks)}</select></label>${action === "sidhi" ? "<p class=\"hint\">Cultivators only. Deduct the Sidhi yourself (p.26).</p>" : ""}`, f => f.rank.value);
    if (!input) return null;
    return requestExchangeOp21(message, {type: action, args: [actor.key, input]});
  }
  if (action === "damage") {
    const entry = state.declarations.find(item => item.id === Number(data.decl));
    const attacker = me(entry.by), target = me(entry.target);
    const actor = target?.tokenUuid ? (await fromUuid(target.tokenUuid))?.actor : null;
    const victim = actor ?? (target?.actorUuid ? await fromUuid(target.actorUuid) : null);
    if (!victim) throw new Error(`${target?.name ?? "The target"} is no longer available.`);
    if (!victim.isOwner && !game.user.isGM) throw new Error(`A GM or the owner of ${target.name} must apply this damage.`);
    const torso = entry.rank === "quick" ? "torso" : "";
    return damagePart(victim, "", {part: torso, amount: attacker.damage, crushing: attacker.crushing,
      hint: `${attacker.name}'s ${RANK_LABEL[entry.rank]} maneuver: ${entry.text || "strike"}. Quick strikes hit the Torso; Solid a Limb or Torso; Perfect any Part (pp.24–25).`});
  }
  return null;
}

export function registerExchange21() {
  game.socket?.on(SOCKET, async data => {
    if (data?.action === "exchange21-error" && data.userId === game.user.id) return ui.notifications.warn(data.message);
    if (data?.action !== "exchange21" || !game.user.isActiveGM) return;
    try { await applyExchangeOp21(game.messages.get(data.messageId), data.op, game.users.get(data.userId)); }
    catch (error) { game.socket.emit(SOCKET, {action: "exchange21-error", userId: data.userId, message: error.message}); }
  });
  Hooks.on("renderChatMessageHTML", (message, html) => {
    if (!message.isContentVisible) return;
    if (stateOf(message)) {
      for (const el of html.querySelectorAll("[data-x21]")) el.addEventListener("click", async event => {
        event.preventDefault(); el.disabled = true;
        try { await onAction(message, el.dataset.x21, el.dataset); }
        catch (error) { ui.notifications.warn(error.message); }
        finally { el.disabled = false; }
      });
      return;
    }
    if (!message.getFlag(SYSTEM, "ktb")) return;
    const bar = document.createElement("div");
    bar.className = "r21-x-start";
    bar.innerHTML = `${button("start", "Start KILL THE BUDDHA exchange")}${openExchanges().length ? button("join", "Join open exchange") : ""}`;
    (html.querySelector(".r21-chat") ?? html).append(bar);
    bar.querySelector("[data-x21=start]")?.addEventListener("click", () => startExchange21(message).catch(error => ui.notifications.warn(error.message)));
    bar.querySelector("[data-x21=join]")?.addEventListener("click", () => {
      const latest = openExchanges().at(-1);
      if (latest) requestExchangeOp21(latest, {type: "add", messageId: message.id}).catch(error => ui.notifications.warn(error.message));
    });
  });
}
