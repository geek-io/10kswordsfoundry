// Rules 2.1 chat card actions: a targeted defender responds with KILL THE BUDDHA, or damage is applied to a target's Part.
import {killTheBuddha, damagePart, resolveDefenseStrikes21, resolveManeuver21, spendStrikes21, stunCheck, incapacitationCheck} from "./roll21.mjs?v=0.2.45";
import {PARTS} from "./rules21.mjs?v=0.2.45";
import {joinExchangeFor21} from "./exchange21.mjs?v=0.2.45";
import {noteFlurry21} from "./swords21.mjs?v=0.2.45";

const SYSTEM = "10kswordsfoundry";
const resolveUuid = uuid => uuid ? globalThis.fromUuid?.(uuid) ?? null : null;

/** Chat flag data for a 2.1 card that lists targets: a KILL THE BUDDHA, an unleashed Magick or an activated Technick. */
export function chatTargets21(message) {
  const ktb = message.getFlag?.(SYSTEM, "ktb");
  if (ktb?.targets?.length) return {kind: "ktb", data: ktb};
  const strikes = message.getFlag?.(SYSTEM, "ktbStrikes");
  if (strikes?.targets?.length) return {kind: "ktbStrikes", data: strikes};
  const maneuver = message.getFlag?.(SYSTEM, "ktbManeuver21");
  if (maneuver?.targets?.length) return {kind: "ktbManeuver", data: maneuver};
  const cast = message.getFlag?.(SYSTEM, "cast21");
  if (cast?.targets?.length) return {kind: "cast", data: cast};
  const technick = message.getFlag?.(SYSTEM, "technick21");
  if (technick?.targets?.length) return {kind: "technick", data: technick};
  return null;
}

/** Defaults for the damage dialog: the called/Ambush Part, else the first random hit location. */
export function damageDefaults21(data) {
  const part = PARTS[data.part] ? data.part : (data.randomKeys ?? []).find(key => PARTS[key]) ?? "";
  const amount = Number.isSafeInteger(data.damage) && data.damage > 0 ? data.damage : 2;
  return {part, amount, crushing: !!data.crushing, ignoreSoak: !!data.piercing, visceral: !!data.visceral, hint: data.randomParts?.length ? `Random hit locations: ${data.randomParts.join(", ")}.` : ""};
}

async function targetActor(target, resolve) {
  const token = await resolve(target.tokenUuid);
  const actor = token?.actor ?? await resolve(target.actorUuid);
  if (!actor) throw new Error(`${target.name} is no longer available.`);
  return {token, actor};
}

/** Runs a chat card action for one listed target. Only a GM or the target's owner may act for it. */
export async function runChatAction21(data, action, index, {resolve = resolveUuid, isGM = !!globalThis.game?.user?.isGM} = {}) {
  if (action === "flurry") {
    // Flurry is the attacker pressing the advantage, so it acts as the attacker, not the card's target (the defender).
    const attackerToken = await resolve(data.attackerToken);
    const attacker = attackerToken?.actor ?? await resolve(data.attacker);
    if (!attacker) throw new Error("The attacker is no longer available.");
    if (!attacker.isOwner && !isGM) throw new Error("A GM or the attacker's owner must Flurry.");
    const defenderToken = await resolve(data.defenderToken);
    const opponent = defenderToken?.object ?? null;
    // In a structured scene the Ticks tracker counts the Flurry: no Recovery, they act again next Tick (2.1 p.117).
    await noteFlurry21(attacker);
    return killTheBuddha(attacker, {weaponId: data.weaponId ?? "", targets: opponent ? [opponent] : [],
      source: attackerToken?.object ?? undefined, flurry: Math.max(0, Number(data.flurry) || 0) + 1});
  }
  const target = data.targets?.[index];
  if (!target) throw new Error("That target is not on this card.");
  const {token, actor} = await targetActor(target, resolve);
  if (!actor.isOwner && !isGM) throw new Error(`A GM or the owner of ${target.name} must do this.`);
  if (action === "damage") return damagePart(actor, "", damageDefaults21(data));
  if (action === "spend") return spendStrikes21(actor, data);
  if (action === "block" || action === "dodge") return resolveDefenseStrikes21(data, action, actor, token);
  if (action === "resist") return resolveManeuver21(data, actor, token);
  if (action === "respond") {
    const attacker = await resolve(data.attackerToken);
    const opponent = attacker?.object ?? null;
    return killTheBuddha(actor, {targets: opponent ? [opponent] : [], source: token?.object ?? undefined});
  }
  throw new Error("Unknown chat action.");
}

/** The Stun Check and Morale Check buttons on a card that reported lost Head HP. Only a GM or the character's owner may roll. */
export async function runHeadCheck21(flag, kind, {resolve = resolveUuid, isGM = !!globalThis.game?.user?.isGM} = {}) {
  const actor = await resolve(flag?.actor);
  if (!actor) throw new Error("That character is no longer available.");
  if (!actor.isOwner && !isGM) throw new Error(`A GM or the owner of ${actor.name} must roll this.`);
  if (kind === "stun") return stunCheck(actor);
  if (kind === "morale") return incapacitationCheck(actor);
  throw new Error("Unknown Check.");
}

export function registerChat21() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const head = message.getFlag?.(SYSTEM, "headHit21");
    if (head) for (const button of html.querySelectorAll("[data-r21-check]")) button.addEventListener("click", async event => {
      event.preventDefault();
      button.disabled = true;
      try { await runHeadCheck21(head, button.dataset.r21Check); }
      catch (error) { ui.notifications.warn(error.message); }
      finally { button.disabled = false; }
    });
    const found = chatTargets21(message);
    if (!found || !message.isContentVisible) return;
    for (const button of html.querySelectorAll("[data-r21-action]")) button.addEventListener("click", async event => {
      event.preventDefault();
      button.disabled = true;
      try {
        const result = await runChatAction21(found.data, button.dataset.r21Action, Number(button.dataset.target));
        // A defender's reply joins the open KILL THE BUDDHA exchange started from this card (p.22).
        if (button.dataset.r21Action === "respond") await joinExchangeFor21(message.id, result);
      }
      catch (error) { ui.notifications.warn(error.message); }
      finally { button.disabled = false; }
    });
  });
}
