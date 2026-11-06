// Rules 2.1 Technick activation: License and weapon checks, burning (✹) or installing (❂) Flame, areas and targets.
// The 2.1 manuscript has no separate Technick chapter; costs and Licenses follow the Sect entries (NEEDS, LICENSE) and pp.100–101.
import {technickInfo21, licenseMet21, weaponRequirement21, bracketValues21, spendFlame21, recoverFlame21, selfFlame21} from "./rules21.mjs?v=0.2.14";
import {confirmScorch21, deviationCheck21} from "./scorch21.mjs?v=0.2.14";
import {escapeHTML} from "./resolution.mjs?v=0.2.14";
import {saveChanges} from "./save-changes.mjs?v=0.2.14";
import {occupiedSlots} from "./slots.mjs?v=0.2.14";
import {installationChanges} from "./ability-state.mjs?v=0.2.14";
import {abilityArea, placeAbilityArea, AREA_SHAPES} from "./areas.mjs?v=0.2.14";
import {collectTargets} from "./targeting21.mjs?v=0.2.14";
import {targetsHTML, killTheBuddha} from "./roll21.mjs?v=0.2.14";

const SYSTEM = "10kswordsfoundry";
const int = value => Math.trunc(Number(value) || 0);
const stars = count => "✦".repeat(Math.max(0, count));

function hasFreeHand(actor) {
  const occupied = new Set((actor.items?.contents ?? []).flatMap(item => occupiedSlots(item)));
  return !occupied.has("left") || !occupied.has("right");
}

/** Everything the sheet and the activation need to know about one Technick for this character. */
export function technickState21(actor, item) {
  const info = technickInfo21(item);
  const weapons = (actor.items?.contents ?? []).filter(entry => entry.type === "weapon" && entry.system.equipped).map(entry => entry.system);
  const license = licenseMet21(actor.system, info);
  const weapon = weaponRequirement21(info.weapon, weapons, {freeHand: hasFreeHand(actor)});
  const problems = [];
  if (actor.system.conditions21?.stunned) problems.push("Stunned: you cannot do anything until your head clears.");
  if (actor.system.conditions21?.deviation) problems.push("Sidhi Deviation: learned Technicks cannot be used (p.18).");
  if (!license.met) problems.push(`License: ${info.cultivation} ${stars(info.stars)} needed (you have ${license.rating ?? "none"}). Add it under Esoteric Cultivations.`);
  if (!weapon.met) problems.push(`Needs ${info.weapon}.`);
  return {info, license, weapon, problems};
}

/** Activates a Technick: burns its ✹ Flame and installs its ❂ Flame, then posts the effect with targets. */
export async function activateTechnick21(actor, item, {sheet = null} = {}) {
  if (item?.type !== "technique") throw new Error("Choose a Technick.");
  const state = technickState21(actor, item), {info} = state;
  if (state.problems.length) throw new Error(state.problems[0]);
  if (info.install && info.installed) throw new Error(`${item.name} is already installed. Release it before installing it again.`);
  const area = abilityArea(item.system);
  const values = bracketValues21(item.system.description, actor.system);
  const select = (name, choices, value) => `<select name="${name}">${Object.entries(choices).map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${escapeHTML(label)}</option>`).join("")}</select>`;
  const action = info.install ? "Install" : "Activate";
  const input = await foundry.applications.api.DialogV2.prompt({
    classes: ["swords-attack-dialog"], window: {title: `${item.name}: ${action}`, resizable: true},
    content: `<p>Needs: ${info.burn ? `burn ${info.burn} ✹` : ""}${info.burn && info.install ? " · " : ""}${info.install ? `install ${info.install} ❂` : ""}${!info.burn && !info.install ? "no Flame" : ""}${info.weapon ? ` · ${escapeHTML(info.weapon)}` : ""}${info.cultivation ? ` · License ${escapeHTML(info.cultivation)} ${stars(info.stars)}` : ""}. Available Flame: ${actor.system.availableArdor}.</p>
      ${values.length ? `<p>${values.map(entry => `[${escapeHTML(entry.expr)}] = <strong>${entry.value}</strong>`).join(" · ")}</p>` : ""}
      ${info.variable ? `<label>Extra Flame to burn [X]<input name="extra" type="number" min="0" step="1" value="0"></label>` : ""}
      <fieldset><legend>Area (optional)</legend><label>Shape${select("shape", AREA_SHAPES, area.shape)}</label><label>Size (m)<input name="size" type="number" min="0" step="any" value="${area.size}"></label><label>Placement range (m; 0 = unrestricted)<input name="range" type="number" min="0" step="any" value="${area.range}"></label><p class="hint">Place the area to target everyone inside, or target tokens (T) yourself before activating.</p></fieldset>
      <label class="attack-option"><input type="checkbox" name="ktb" ${info.weapon ? "checked" : ""}> Then roll KILL THE BUDDHA</label>`,
    ok: {label: action, callback: (event, button) => {
      const f = button.form.elements;
      return {extra: Number(f.namedItem?.("extra")?.value ?? f.extra?.value ?? 0), shape: f.shape.value, size: Number(f.size.value), range: Number(f.range.value), ktb: f.ktb.checked};
    }}, rejectClose: false
  });
  if (!input) return null;
  if (!Number.isSafeInteger(input.extra) || input.extra < 0) throw new Error("Extra Flame must be a whole number of 0 or more.");
  if (!Object.hasOwn(AREA_SHAPES, input.shape) || !Number.isFinite(input.size) || input.size < 0 || !Number.isFinite(input.range) || input.range < 0) throw new Error("Choose a valid area.");
  const burn = info.burn + input.extra, install = info.install;
  const source = actor.toObject().system;
  const available = int(source.ardor?.max) - int(source.ardor?.burnt) - int(source.ardor?.installed);
  // Alpha p.52: past 0 Flame the Cultivator goes into Scorch.
  if (burn + install > available && !await confirmScorch21(actor, {burn, install, name: item.name})) return null;

  if (input.shape !== "none" && input.size > 0) {
    const placed = await placeAbilityArea({sheet: sheet ?? {}, actor, name: item.name, shape: input.shape, size: input.size, range: input.range});
    if (placed === null) return null;
  }
  const spent = spendFlame21(source.ardor, source.scorch, {burn, install});
  const update = {"system.ardor.burnt": spent.burnt, "system.ardor.installed": spent.installed, "system.scorch": spent.scorch};
  if (install) update.items = installationChanges(actor.toObject(), item.id, install);
  if (!await saveChanges(actor, update)) throw new Error("Flame could not be saved.");

  const targets = collectTargets(actor);
  const description = globalThis.foundry?.utils?.cleanHTML ? foundry.utils.cleanHTML(item.system.description ?? "") : item.system.description ?? "";
  const content = `<section class="r21-chat"><h3>${escapeHTML(item.name)} · ${install ? "Installed" : "Activated"}</h3>
    <p>${burn ? `Burnt ${burn} ✹` : ""}${burn && install ? " · " : ""}${install ? `Installed ${install} ❂ (release it from the sheet to recover)` : ""}${!burn && !install ? "No Flame spent" : ""}${spent.added ? ` · ${spent.added} into Scorch` : ""}${input.shape !== "none" && input.size > 0 ? ` · ${escapeHTML(AREA_SHAPES[input.shape])} ${input.size} m` : ""}.</p>
    ${burn + install ? `<p class="hint">Self-Flame: ${escapeHTML(selfFlame21(burn + install))} (Alpha p.51)</p>` : ""}
    ${values.length ? `<p class="r21-values">${values.map(entry => `[${escapeHTML(entry.expr)}] = <strong>${entry.value}</strong>`).join(" · ")}</p>` : ""}
    <details><summary>Effect</summary>${description}</details>${targetsHTML(targets, {respond: false})}</section>`;
  const message = await foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), content,
    flags: {[SYSTEM]: {technick21: {itemId: item.id, burn, install, targets}}}});
  if (spent.added) await deviationCheck21(actor, spent.scorch);
  if (input.ktb) await killTheBuddha(actor);
  return message;
}

/** Releases an installed Technick and returns its ❂ Flame. */
export async function releaseTechnick21(actor, item) {
  if (item?.type !== "technique") throw new Error("Choose a Technick.");
  const paid = int(item.system.paidArdor);
  if (!item.system.equipped || paid <= 0) throw new Error(`${item.name} is not installed.`);
  const source = actor.toObject().system;
  const back = recoverFlame21(source.ardor, source.scorch, {installed: paid}); // Scorch clears first (Alpha p.52)
  if (!await actor.update({"system.ardor.installed": back.installed, "system.scorch": back.scorch, items: installationChanges(actor.toObject(), item.id, 0)})) throw new Error("Flame could not be saved.");
  return foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), content: `<section class="r21-chat"><p><strong>${escapeHTML(item.name)}</strong> released; ${paid} ❂ Flame returned.</p></section>`});
}

/** Sheet rows for the 2.1 Technick list. */
export function technickRows21(actor) {
  return (actor.items?.contents ?? []).filter(item => item.type === "technique").toSorted((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(item => {
    const {info, license, weapon, problems} = technickState21(actor, item);
    const needs = [info.burn ? "✹".repeat(info.burn) : "", info.install ? "❂".repeat(info.install) : ""].filter(Boolean).join(" ") || "—";
    return {id: item.id, name: item.name, needs, weapon: info.weapon, license: info.cultivation ? `${info.cultivation} ${stars(info.stars)}` : "",
      licenseMet: license.met, weaponMet: weapon.met, installed: info.installed, paid: info.paid, install: info.install > 0,
      ready: !problems.length, problem: problems[0] ?? "", action: info.install ? "Install" : "Activate"};
  });
}
