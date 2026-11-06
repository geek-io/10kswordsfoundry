// Rules 2.1 CHANGE GOD'S MIND workflow (pp.39–52): the initiator rolls, the target's owner (or the GM) defends,
// and a convinced target may spend Morale on Persistence.
import {PURPOSES21, APPROACHES21, DISPOSITIONS21, MOB_SIZES21, STRENGTH_LABEL, influenceModifiers21, socialDefense21, attachmentRoles21,
  influenceSucceeds21, mobDefense21, writtenDemand21, persistence21, dispositionFromRoll21} from "./social-rules21.mjs?v=0.2.14";
import {CORES, CULTIVATIONS_21} from "./rules21.mjs?v=0.2.14";
import {evaluate21, diceHTML21, partsHTML21, post21, stateFor21, blockedByState21, skillRating} from "./roll21.mjs?v=0.2.14";
import {collectTargets} from "./targeting21.mjs?v=0.2.14";
import {escapeHTML} from "./resolution.mjs?v=0.2.14";

const SYSTEM = "10kswordsfoundry";
const int = value => Math.trunc(Number(value) || 0);
const DialogV2 = () => foundry.applications.api.DialogV2;
const options = (entries, selected) => entries.map(([value, label]) => `<option value="${escapeHTML(String(value))}" ${String(value) === String(selected) ? "selected" : ""}>${escapeHTML(label)}</option>`).join("");
const strengthOptions = selected => options(Object.entries(STRENGTH_LABEL), selected);

async function actorFrom(uuid, tokenUuid) {
  const token = tokenUuid ? await globalThis.fromUuid?.(tokenUuid) : null;
  return token?.actor ?? (uuid ? await globalThis.fromUuid?.(uuid) : null);
}

/** p.42: CHANGE GOD'S MIND — Face (or Physique to threaten) + the approach's Cultivation, against Heart + Stillness. */
export async function changeGodsMind21(actor) {
  blockedByState21(actor);
  const [target] = collectTargets(actor);
  const targetActor = target ? await actorFrom(target.actorUuid, target.tokenUuid) : null;
  const disposition = targetActor?.system?.disposition21 ?? "neutral";
  const input = await DialogV2().prompt({classes: ["swords-attack-dialog"], window: {title: "Change God's Mind", resizable: true},
    content: `<p>${target ? `Target: <strong>${escapeHTML(target.name)}</strong>` : "No target selected: target a token (T) so its owner or the GM can defend, or run the defense by hand."}</p>
      <label>What do you want?<input name="topic" placeholder="Board the starship with me"></label>
      <label>Asking for<select name="purpose">${options(Object.entries(PURPOSES21).map(([key, entry]) => [key, entry.label]), "favor")}</select></label>
      <label>Approach<select name="approach">${options(Object.entries(APPROACHES21).map(([key, entry]) => [key, `${entry.label} (${CORES[entry.core].abbr} + ${CULTIVATIONS_21[entry.skill].label})`]), "charisma")}</select></label>
      <label>Attachment you leverage (as far as you know it)<select name="leverage">${strengthOptions(0)}</select></label>
      <label>Their Disposition toward you<select name="disposition">${options(Object.entries(DISPOSITIONS21).map(([key, entry]) => [key, `${entry.label} (${entry.modifier >= 0 ? "+" : ""}${entry.modifier})`]), disposition)}</select></label>
      <label>Mob size (−X dice)<select name="mob">${options(Object.entries(MOB_SIZES21), 0)}</select></label>
      <label>Emotion to inflame (Inflame only)<input name="emotion" placeholder="Rage at their bourgeois boss"></label>
      <div class="attack-options"><label class="attack-option"><input type="checkbox" name="materialShift"> Their material conditions just shifted (+4, p.49)</label>
      <label class="attack-option"><input type="checkbox" name="shaky"> The leveraged Attachment is shaky (+3, p.51)</label></div>
      <label>Bonus / penalty dice<input name="adjustment" type="number" step="1" value="0"></label>
      <p class="hint">Favor needs a Held Attachment to leverage, Risk a Firm one, Ruin a Heart one; without one the Check takes −3 (p.42). Ties go to the defender (p.43).</p>`,
    ok: {label: "Change God's Mind", callback: (event, button) => {
      const f = button.form.elements;
      return {topic: f.topic.value, purpose: f.purpose.value, approach: f.approach.value, leverage: Number(f.leverage.value), disposition: f.disposition.value, mob: Number(f.mob.value),
        emotion: f.emotion.value, materialShift: f.materialShift.checked, shaky: f.shaky.checked, adjustment: Number(f.adjustment.value)};
    }}, rejectClose: false});
  if (!input) return null;
  const purpose = PURPOSES21[input.purpose], approach = APPROACHES21[input.approach];
  if (!purpose || !approach || !Number.isSafeInteger(input.adjustment)) throw new Error("Choose what you ask for, an approach and a whole-number adjustment.");
  const mods = influenceModifiers21(input);
  const state = stateFor21(actor, approach.core), rating = skillRating(actor.system, approach.skill), coreValue = int(actor.system.cores?.[approach.core]);
  const pool = coreValue + rating.value + mods.total + state.total + int(actor.system.checkBonus);
  const {roll, formula, results} = await evaluate21(pool);
  const strikes = results.filter(value => value >= 4).length;
  const data = {initiator: actor.uuid ?? "", initiatorName: actor.name, strikes, pool, purpose: input.purpose, approach: input.approach, leverage: input.leverage, mob: input.mob,
    topic: input.topic.trim(), emotion: input.emotion.trim(), gestural: !!approach.gestural, threat: !!approach.threat, written: !!approach.written,
    targetName: target?.name ?? "", targetActor: target?.actorUuid ?? "", targetToken: target?.tokenUuid ?? ""};
  const notes = [purpose.note, approach.threat ? "Win or lose, a threat implants a negative Held Attachment toward you, strengthens one, or weakens a positive one; the target chooses (p.47)." : "",
    purpose.project ? `Social Project: one opposed Check every ${purpose.project.days} days, ${purpose.project.checks} Checks in all; the influencer needs more total Strikes by the end (p.44).` : ""].filter(Boolean);
  const html = `<h3>Change God's Mind${data.targetName ? ` · ${escapeHTML(data.targetName)}` : ""}</h3>
    <p><strong>${escapeHTML(purpose.label)}</strong>${data.topic ? `: “${escapeHTML(data.topic)}”` : ""}${input.purpose === "inflame" && data.emotion ? ` — ${escapeHTML(data.emotion)}` : ""}</p>
    <p class="r21-result"><strong>${strikes} Strikes</strong> · ${escapeHTML(approach.label)}</p>${diceHTML21(results)}
    <p>Pool ${pool}: ${CORES[approach.core].abbr} ${coreValue} + ${escapeHTML(rating.label)} ${rating.value}. ${formula}</p>${partsHTML21([...mods.parts, ...state.parts])}
    ${notes.map(note => `<p class="hint">${escapeHTML(note)}</p>`).join("")}
    ${data.written ? `<p><strong>Written:</strong> readers roll Heart + Stillness against Demand ${writtenDemand21(strikes)} (or ${writtenDemand21(strikes, false)} if no Attachment of theirs is invoked); on a failure they are convinced but may use Persistence (p.49).</p>`
      : `<p class="r21-target-actions"><button type="button" data-cgm21="defend">Defend (target's owner or GM)</button></p>`}`;
  return post21(actor, roll, html, {[SYSTEM]: {cgm21: data}});
}

/** p.48: the target defends with Heart + Stillness and Social Defense from its own Attachments. */
export async function defend21(message) {
  const data = message.getFlag(SYSTEM, "cgm21");
  if (!data) throw new Error("That is not a Change God's Mind card.");
  let defender = await actorFrom(data.targetActor, data.targetToken);
  if (!defender) defender = globalThis.canvas?.tokens?.controlled?.[0]?.actor ?? null;
  if (!defender) throw new Error("Select the defending token, or target one before Changing God's Mind.");
  if (!defender.isOwner && !game.user.isGM) throw new Error(`Only ${defender.name}'s owner or a GM can defend.`);
  if (game.messages.contents.some(entry => entry.getFlag(SYSTEM, "cgm21result")?.source === message.id)) throw new Error("This influence has already been defended.");
  const attachments = defender.toObject().system.attachments ?? [];
  const rows = attachments.map((entry, index) => `<label>${escapeHTML(entry.text || "(blank)")} · ${STRENGTH_LABEL[int(entry.strength)] ?? "Held"}<select name="role${index}">${options([["", "Not relevant"], ["oppose", "Opposes this"], ["align", "Aligns with this"]], "")}</select></label>`).join("");
  const input = await DialogV2().prompt({classes: ["swords-attack-dialog"], window: {title: `${defender.name}: Social Defense`, resizable: true},
    content: `<p>${escapeHTML(data.initiatorName)} wants: <strong>${escapeHTML(PURPOSES21[data.purpose]?.label ?? "")}</strong>${data.topic ? ` — “${escapeHTML(data.topic)}”` : ""}.</p>
      ${rows ? `<fieldset><legend>Your Attachments</legend>${rows}</fieldset>` : "<p class=\"hint\">No Attachments on this sheet; add opposing or aligned strengths below.</p>"}
      <label>Other opposing Attachment<select name="opposeExtra">${strengthOptions(0)}</select></label>
      <label>Other aligned Attachment<select name="alignExtra">${strengthOptions(0)}</select></label>
      ${int(data.mob) > 0 ? `<label class="attack-option"><input type="checkbox" name="mobStatic" checked> Mob: use half the pool as static Strikes (p.48)</label>` : ""}
      <label>Bonus / penalty dice<input name="adjustment" type="number" step="1" value="0"></label>
      <p class="hint">Only the strongest relevant Attachment counts: +2/+4/+6 if it opposes, −1/−2/−3 if it aligns; equal opposing and aligned ones cancel (p.48).</p>`,
    ok: {label: "Defend", callback: (event, button) => {
      const f = button.form.elements, roles = {};
      attachments.forEach((_, index) => { roles[index] = f.namedItem(`role${index}`)?.value ?? ""; });
      return {roles, opposeExtra: Number(f.opposeExtra.value), alignExtra: Number(f.alignExtra.value), mobStatic: f.namedItem("mobStatic")?.checked ?? false, adjustment: Number(f.adjustment.value)};
    }}, rejectClose: false});
  if (!input) return null;
  const roles = attachmentRoles21(attachments, input.roles);
  const defense = socialDefense21(Math.max(roles.opposing, input.opposeExtra), Math.max(roles.aligned, input.alignExtra));
  const parts = [];
  if (defense.label !== "No relevant Attachment") parts.push({label: defense.label, value: defense.value});
  if (data.gestural) parts.push({label: "Gestures only", value: 3});
  if (int(input.adjustment)) parts.push({label: "Adjustment", value: int(input.adjustment)});
  const state = stateFor21(defender, "spi");
  const pool = int(defender.system.cores?.spi) + skillRating(defender.system, "stillness").value + parts.reduce((sum, part) => sum + part.value, 0) + state.total;
  let roll, results = [], strikes;
  if (input.mobStatic) { roll = await new foundry.dice.Roll("0").evaluate(); strikes = mobDefense21(pool); }
  else { ({roll, results} = await evaluate21(pool)); strikes = results.filter(value => value >= 4).length; }
  const success = influenceSucceeds21(data.strikes, strikes);
  const purpose = PURPOSES21[data.purpose] ?? PURPOSES21.favor;
  const html = `<h3>Social Defense · ${escapeHTML(defender.name)}</h3>
    <p class="r21-result ${success ? "failure" : "success"}"><strong>${strikes} Strikes</strong> vs ${data.strikes} — ${success ? "convinced" : "not convinced"}</p>
    ${input.mobStatic ? `<p>Mob: static ${strikes} Strikes from half of pool ${pool}.</p>` : diceHTML21(results)}
    <p>Pool ${pool}: SPI + Stillness.</p>${partsHTML21([...parts, ...state.parts])}
    ${success ? `<p>${escapeHTML(defender.name)} ${purpose.kind === "act" ? "is persuaded to act" : purpose.kind === "feeling" ? "feels it" : "has the Attachment changed"}, unless they use Persistence: ${purpose.morale} Morale${purpose.kind === "act" ? " and a different Attachment at least as strong as the one leveraged" : ""} (pp.48–49).</p>
      <p class="r21-target-actions"><button type="button" data-cgm21="persist">Persistence (spend ${purpose.morale} Morale)</button></p>`
      : `<p>No other attempt on this topic for 5 days or the convincing period, unless a stronger Attachment can be leveraged (p.43).</p>`}`;
  return post21(defender, roll, html,
    {[SYSTEM]: {cgm21result: {source: message.id, success, purpose: data.purpose, leverage: data.leverage, defender: defender.uuid ?? "", defenderName: defender.name, strikes}}});
}

/** pp.48–49: spend Morale to reject the influence. */
export async function persist21(message) {
  const data = message.getFlag(SYSTEM, "cgm21result");
  if (!data?.success) throw new Error("There is nothing to resist.");
  if (data.persisted) throw new Error("Persistence has already been used here.");
  const defender = await globalThis.fromUuid?.(data.defender);
  if (!defender) throw new Error(`${data.defenderName} is no longer available.`);
  if (!defender.isOwner && !game.user.isGM) throw new Error(`Only ${data.defenderName}'s owner or a GM can use Persistence.`);
  const purpose = PURPOSES21[data.purpose] ?? PURPOSES21.favor;
  const morale = int(defender.toObject().system.morale?.value);
  let invoked = 0;
  if (purpose.kind === "act") {
    const attachments = (defender.toObject().system.attachments ?? []).map((entry, index) => [index, `${entry.text || "(blank)"} · ${STRENGTH_LABEL[int(entry.strength)] ?? "Held"}`]);
    const choice = await DialogV2().prompt({window: {title: "Persistence"},
      content: `<p>Invoke an Attachment you have not used in this exchange, at least ${STRENGTH_LABEL[Math.max(1, int(data.leverage))]}.</p><label>Attachment<select name="pick">${options([["", "—"], ...attachments])}</select></label><label>…or its strength<select name="strength">${strengthOptions(0)}</select></label>`,
      ok: {label: "Persist", callback: (event, button) => ({pick: button.form.elements.pick.value, strength: Number(button.form.elements.strength.value)})}, rejectClose: false});
    if (!choice) return null;
    const picked = choice.pick === "" ? 0 : int(defender.toObject().system.attachments?.[Number(choice.pick)]?.strength);
    invoked = Math.max(picked, int(choice.strength));
  }
  const check = persistence21({purpose: data.purpose, leverage: data.leverage, morale, invoked});
  if (!check.allowed) throw new Error(check.reason);
  await defender.update({"system.morale.value": morale - check.cost});
  if (message.isOwner) await message.setFlag(SYSTEM, "cgm21result", {...data, persisted: true});
  return foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor: defender}),
    content: `<section class="r21-chat"><p><strong>${escapeHTML(defender.name)}</strong> rejects the influence through Persistence, spending ${check.cost} Morale (${morale - check.cost} left).${morale - check.cost <= 0 ? " <strong>Shattered.</strong>" : ""}</p></section>`});
}

/** p.46: roll a stranger's starting Disposition on 2d6. */
export async function rollDisposition21(actor) {
  const roll = await new foundry.dice.Roll("2d6").evaluate();
  const key = dispositionFromRoll21(roll.total);
  await actor.update({"system.disposition21": key});
  return post21(actor, roll, `<h3>Disposition · ${escapeHTML(actor.name)}</h3><p><strong>${roll.total}</strong>: ${DISPOSITIONS21[key].label} (${DISPOSITIONS21[key].modifier >= 0 ? "+" : ""}${DISPOSITIONS21[key].modifier} to persuade)</p>`);
}

export function registerSocial21() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    if (!message.isContentVisible) return;
    const handlers = {defend: () => defend21(message), persist: () => persist21(message)};
    for (const button of html.querySelectorAll("[data-cgm21]")) button.addEventListener("click", async event => {
      event.preventDefault(); button.disabled = true;
      try { await handlers[button.dataset.cgm21]?.(); }
      catch (error) { ui.notifications.warn(error.message); }
      finally { button.disabled = false; }
    });
  });
}
