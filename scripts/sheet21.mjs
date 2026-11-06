// Rules 2.1 character sheet context and actions. Used only when the GM selects the 2.1 ruleset.
import {CORES, CULTIVATIONS_21, ASSETS_21, PARTS, PART_KEYS, CONDITIONS_21, ATTACHMENT_STRENGTHS, MAX_STARS,
  derive21, advancementCost, healingDays, weaponProfile21, qualifiesForLicense21, SIDHI_REALMS, abilityLimit21, recoverFlame21, cleaveDepth} from "./rules21.mjs?v=0.2.14";
import {rollCheck21, killTheBuddha, castMagick21, stunCheck, incapacitationCheck, randomPart, damagePart} from "./roll21.mjs?v=0.2.14";
import {escapeHTML} from "./resolution.mjs?v=0.2.14";
import {activateTechnick21, releaseTechnick21, technickRows21} from "./technick21.mjs?v=0.2.14";
import {changeGodsMind21, rollDisposition21} from "./social21.mjs?v=0.2.14";
import {DISPOSITIONS21} from "./social-rules21.mjs?v=0.2.14";
import {assetRows21, barangRows21, raiseAsset21, ingestBarang21, ejectBarang21} from "./assets21.mjs?v=0.2.14";

export const ACTOR_TEMPLATE_21 = "systems/10kswordsfoundry/templates/actor-21.hbs";
const int = value => Math.trunc(Number(value) || 0);
const LISTS = {attachments: {text: "", strength: 1}, assets: {key: "custom", name: "", stars: 1, notes: ""}, esoteric: {name: "", value: 1, core: "spi"}};

export function assetChoices() {
  return Object.fromEntries(Object.entries(ASSETS_21).map(([key, asset]) => [key, asset.code ? `[${asset.code[0]}][${asset.code[1]}] ${asset.label}` : asset.label]));
}

/** Builds the 2.1 sheet context on top of the shared (inventory, effects, notes) context. */
export function prepareActor21(document, context) {
  const system = document.system, source = document.toObject?.().system ?? system;
  const derived = system.r21 ?? derive21(system, document.items?.contents ?? []);
  const cost = (kind, value) => { try { return advancementCost(kind, value).xp; } catch { return null; } };
  const magicks = (document.items?.contents ?? []).filter(item => item.type === "magick").toSorted((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const casting = magicks.find(item => item.id === source.casting?.itemId);
  const abilityCount = (document.items?.contents ?? []).filter(item => ["technique", "magick"].includes(item.type)).length;
  const flameMax = derived.flameMax ?? 2 + int(source.sidhi), meridians = derived.meridians ?? 2 + int(source.sidhi);
  return {
    rules21: true,
    coreRows: Object.entries(CORES).map(([key, core]) => ({key, ...core, base: source.cores?.[key] ?? 1, value: system.cores?.[key] ?? 1,
      modified: (source.cores?.[key] ?? 1) !== (system.cores?.[key] ?? 1), cost: cost("core", source.cores?.[key] ?? 1)})),
    skillRows: Object.entries(CULTIVATIONS_21).map(([key, skill]) => {
      const base = source.skills?.[key] ?? 0;
      return {key, ...skill, coreAbbr: CORES[skill.core].abbr, base, value: system.skills?.[key] ?? 0, modified: base !== (system.skills?.[key] ?? 0),
        stars: "✦".repeat(Math.max(0, Math.min(MAX_STARS, base))), cost: cost("cultivation", base), maxed: base >= MAX_STARS};
    }),
    esotericRows: (source.esoteric ?? []).map((entry, index) => ({...entry, index, coreChoices: Object.fromEntries(Object.entries(CORES).map(([key, core]) => [key, core.label]))})),
    coreChoices: Object.fromEntries(Object.entries(CORES).map(([key, core]) => [key, core.label])),
    partRows: PART_KEYS.map(key => {
      const part = derived.parts[key], stored = source.parts?.[key] ?? {};
      const heal = healingDays(part.damage);
      return {key, ...part, hpBonus: stored.hpBonus ?? 0, soakBase: stored.soakBase ?? 0, soakLost: stored.soakLost ?? 0,
        boxes: Array.from({length: part.max + cleaveDepth(part.max)}, (_, index) => ({value: index + 1, taken: index < part.damage, cleave: index >= part.max})),
        healing: part.damage ? `next point heals in ${heal.next} day(s); ${heal.full} day(s) to full` : "", tone: part.cleaved ? "cleaved" : part.disabled ? "disabled" : part.damage ? "wounded" : "whole"};
    }),
    anyDisabled: derived.disabled.length > 0,
    morale: {value: source.morale?.value ?? 0, max: derived.moraleMax, shattered: derived.shattered,
      boxes: Array.from({length: Math.max(derived.moraleMax, source.morale?.value ?? 0)}, (_, index) => ({value: index + 1, filled: index < (source.morale?.value ?? 0)}))},
    speed: derived.speed, movement21: derived.movement, carryLimit: derived.carryLimit, itemKg: derived.itemKg, carriedTotal: derived.carriedKg,
    conditionRows21: Object.entries(CONDITIONS_21).map(([key, condition]) => ({key, ...condition, active: !!source.conditions21?.[key]})),
    attachmentRows: (source.attachments ?? []).map((entry, index) => ({...entry, index})),
    strengthChoices: ATTACHMENT_STRENGTHS,
    assetRows: (source.assets ?? []).map((entry, index) => ({...entry, index, info: ASSETS_21[entry.key] ?? ASSETS_21.custom})),
    assetChoices: assetChoices(),
    assetItems21: assetRows21(document),
    barangRows21: barangRows21(document),
    flame21: {max: flameMax, stored: int(source.ardor?.max), differs: int(source.ardor?.max) !== flameMax, scorch: int(source.scorch)},
    meridians21: {open: meridians, used: abilityCount, over: abilityCount > meridians},
    weaponRows21: (document.items?.contents ?? []).filter(item => item.type === "weapon" && item.system.equipped).map(item => {
      const profile = weaponProfile21(item.system);
      return {id: item.id, name: item.name, profile: profile.label, damage: profile.damage, range: profile.range, ranged: profile.ranged, rate: profile.rate};
    }),
    magickRows21: magicks.map(item => ({id: item.id, name: item.name, potency: Math.max(1, int(item.system.r21?.potency) || 1), burn: int(item.system.burnArdor),
      charges: item.id === source.casting?.itemId ? int(source.casting?.charges) : 0, castTime: item.system.r21?.castTime ?? ""})),
    castingName: casting?.name ?? "", castingCharges: int(source.casting?.charges),
    technickRows21: technickRows21(document),
    dispositionChoices21: Object.fromEntries(Object.entries(DISPOSITIONS21).map(([key, entry]) => [key, `${entry.label} (${entry.range}: ${entry.modifier >= 0 ? "+" : ""}${entry.modifier})`])),
    realmChoices21: Object.fromEntries(Object.entries(SIDHI_REALMS).map(([key, realm]) => [key, `${realm.label} (${realm.limit} Esoteric Techniques)`])),
    techniqueCount21: abilityCount,
    techniqueLimit21: abilityLimit21(source.sidhiRealm),
    techniqueOver21: abilityCount > abilityLimit21(source.sidhiRealm),
    licenses: (context.licenses ?? []).map(license => {
      const item = document.items.get(license.id), qualified = qualifiesForLicense21(system, item?.system);
      return {...license, qualified, active: qualified && license.equipped, status: !qualified ? "Core prerequisites not met" : license.equipped ? "Equipped" : "Unequipped"};
    })
  };
}

/** Converts indexed form objects back to arrays, keeping fields that are not rendered as inputs. */
export function normalizeLists21(dataSystem, current) {
  if (!dataSystem) return dataSystem;
  for (const key of Object.keys(LISTS)) {
    const value = dataSystem[key];
    if (!value || Array.isArray(value) || typeof value !== "object") continue;
    const existing = current?.[key] ?? [];
    dataSystem[key] = Object.keys(value).sort((a, b) => Number(a) - Number(b)).map(index => ({...LISTS[key], ...(existing[Number(index)] ?? {}), ...value[index]}));
  }
  return dataSystem;
}

/** p.64 and Sect pills: Health heals damage on one Part; burnt Flame and Morale recover; one item is consumed. */
export function consumableRecovery21(system, consumable, part) {
  const parts = system.parts ?? {}, heal = int(consumable?.health), changes = {};
  if (heal && part) changes[`system.parts.${part}.damage`] = Math.max(0, int(parts[part]?.damage) - heal);
  const ardor = int(consumable?.burntArdor); // burnt Flame; Scorch clears first (Alpha p.52)
  if (ardor) {
    const back = recoverFlame21(system.ardor ?? {}, system.scorch, {burnt: ardor});
    changes["system.ardor.burnt"] = back.burnt;
    if (int(system.scorch)) changes["system.scorch"] = back.scorch;
  }
  const morale = int(consumable?.morale);
  if (morale) changes["system.morale.value"] = int(system.morale?.value) + morale;
  return changes;
}

async function useConsumable21(actor, item) {
  const consumable = item?.system?.consumable;
  if (item?.type !== "gear" || !consumable?.enabled) throw new Error("This item is not a configured consumable.");
  if (int(item.system.quantity) < 1) throw new Error(`No ${item.name} remain.`);
  const source = actor.toObject().system;
  const wounded = PART_KEYS.filter(key => int(source.parts?.[key]?.damage) > 0).toSorted((a, b) => int(source.parts[b].damage) - int(source.parts[a].damage));
  let part = "";
  if (int(consumable.health)) {
    const input = await foundry.applications.api.DialogV2.prompt({window: {title: `Use ${item.name}`},
      content: `<label>Heal which Part?<select name="part">${PART_KEYS.map(key => `<option value="${key}" ${key === wounded[0] ? "selected" : ""}>${PARTS[key].label} (damage ${int(source.parts?.[key]?.damage)})</option>`).join("")}</select></label>`,
      ok: {label: "Use", callback: (event, button) => button.form.elements.part.value}, rejectClose: false});
    if (!input) return null;
    part = input;
  } else if (!await foundry.applications.api.DialogV2.confirm({window: {title: `Use ${item.name}`}, content: `<p>Use one ${escapeHTML(item.name)}?</p>`, rejectClose: false})) return null;
  const changes = consumableRecovery21(source, consumable, part);
  if (changes["system.morale.value"] !== undefined) changes["system.morale.value"] = Math.min(changes["system.morale.value"], Math.max(actor.system.r21?.moraleMax ?? 0, int(source.morale?.value)));
  await actor.update(changes);
  await actor.updateEmbeddedDocuments("Item", [{_id: item.id, "system.quantity": int(item.system.quantity) - 1}]);
  const healed = part ? ` Healed ${int(consumable.health)} on ${PARTS[part].label}.` : "";
  return foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), content: `<p><strong>${escapeHTML(item.name)}</strong> used.${healed}${int(consumable.burntArdor) ? ` Recovered ${int(consumable.burntArdor)} burnt Flame.` : ""}${int(consumable.morale) ? ` Recovered ${int(consumable.morale)} Morale.` : ""}</p>`});
}

const guard = async (sheet, task) => {
  if (!sheet.isEditable && !sheet.document?.isOwner) return null;
  try { await sheet.submit?.(); return await task(); }
  catch (error) { ui.notifications.warn(error.message); return null; }
};

export const ACTIONS_21 = {
  check21(event, target) { return guard(this, () => rollCheck21(this.document, {core: target.dataset.core ?? CULTIVATIONS_21[target.dataset.skill]?.core ?? "phy", skill: target.dataset.skill ?? ""})); },
  ktb21(event, target) { return guard(this, () => killTheBuddha(this.document, {weaponId: target.dataset.itemId ?? ""})); },
  cgm21() { return guard(this, () => changeGodsMind21(this.document)); },
  rollDisposition21() { return guard(this, () => rollDisposition21(this.document)); },
  activate21(event, target) { return guard(this, () => activateTechnick21(this.document, this.document.items.get(target.dataset.itemId), {sheet: this})); },
  release21(event, target) { return guard(this, () => releaseTechnick21(this.document, this.document.items.get(target.dataset.itemId))); },
  cast21(event, target) { return guard(this, () => castMagick21(this.document, this.document.items.get(target.dataset.itemId), {sheet: this})); },
  raiseAsset21(event, target) { return guard(this, () => raiseAsset21(this.document, this.document.items.get(target.dataset.itemId))); },
  ingestBarang21(event, target) { return guard(this, () => ingestBarang21(this.document, this.document.items.get(target.dataset.itemId))); },
  ejectBarang21(event, target) { return guard(this, () => ejectBarang21(this.document, this.document.items.get(target.dataset.itemId))); },
  setFlameMax21() {
    return guard(this, async () => {
      const source = this.document.toObject().system, max = 2 + int(source.sidhi);
      if (int(source.ardor?.burnt) + int(source.ardor?.installed) > max) throw new Error(`Burnt plus installed Flame (${int(source.ardor?.burnt) + int(source.ardor?.installed)}) is above ${max}. Recover or release Flame first.`);
      return this.document.update({"system.ardor.max": max});
    });
  },
  useConsumable21(event, target) { return guard(this, () => useConsumable21(this.document, this.document.items.get(target.dataset.itemId))); },
  abandonCast21() { return guard(this, () => this.document.update({"system.casting": {itemId: "", charges: 0}})); },
  damage21(event, target) { return guard(this, () => damagePart(this.document, target.dataset.part)); },
  stun21() { return guard(this, () => stunCheck(this.document)); },
  incap21() { return guard(this, () => incapacitationCheck(this.document)); },
  randomPart21() { return guard(this, () => randomPart(this.document)); },
  setPart21(event, target) {
    return guard(this, async () => {
      const key = target.dataset.part, value = int(target.dataset.value), part = this.document.system.r21?.parts?.[key];
      if (!PARTS[key] || !part) return null;
      const next = part.damage === value ? value - 1 : value;
      return this.document.update({[`system.parts.${key}.damage`]: Math.max(0, Math.min(part.max + cleaveDepth(part.max), next))});
    });
  },
  repairSoak21() {
    return guard(this, async () => {
      const ok = await foundry.applications.api.DialogV2.confirm({window: {title: "Repair armor"}, content: "<p>Restore all lost Soak? Repairing needs an expert with a relevant Cultivation at 2 Stars or more (p.67).</p>", rejectClose: false});
      if (ok) return this.document.update(Object.fromEntries(PART_KEYS.map(key => [`system.parts.${key}.soakLost`, 0])));
      return null;
    });
  },
  setMorale21(event, target) {
    return guard(this, () => {
      const value = int(target.dataset.value), current = int(this.document.toObject().system.morale?.value);
      return this.document.update({"system.morale.value": Math.max(0, current === value ? value - 1 : value)});
    });
  },
  addRow21(event, target) {
    return guard(this, () => {
      const list = target.dataset.list;
      if (!LISTS[list]) return null;
      return this.document.update({[`system.${list}`]: [...(this.document.toObject().system[list] ?? []), {...LISTS[list]}]});
    });
  },
  removeRow21(event, target) {
    return guard(this, () => {
      const list = target.dataset.list, index = int(target.dataset.index);
      if (!LISTS[list]) return null;
      return this.document.update({[`system.${list}`]: (this.document.toObject().system[list] ?? []).filter((_, i) => i !== index)});
    });
  },
  advance21(event, target) {
    return guard(this, async () => {
      const {kind, key} = target.dataset, source = this.document.toObject().system;
      const group = kind === "core" ? "cores" : "skills", table = kind === "core" ? CORES : CULTIVATIONS_21;
      if (!table[key]) return null;
      const {next, xp} = advancementCost(kind === "core" ? "core" : "cultivation", source[group][key]);
      if (source.xp < xp) throw new Error(`${table[key].label} ${next} costs ${xp} XP; you have ${source.xp}.`);
      const ok = await foundry.applications.api.DialogV2.confirm({window: {title: "Sidhi Progression"},
        content: `<p>Spend <strong>${xp} XP</strong> to raise ${escapeHTML(table[key].label)} to ${next}?</p><p class="hint">${kind === "core" ? "A new Core star costs 5 × the new rating." : "A new Cultivation star costs 3 × the new rating and must make sense in the fiction; otherwise it takes that many weeks of training."} (p.9)</p>`,
        rejectClose: false});
      if (!ok) return null;
      return this.document.update({[`system.${group}.${key}`]: next, "system.xp": source.xp - xp});
    });
  }
};
