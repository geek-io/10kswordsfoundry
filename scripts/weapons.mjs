// Rules 2.0.3 pp.100-103. Base mod slot follows the user's requested progression.
export const UPGRADES = {
  base: {label:"Unupgraded", attack:0, dr:4, slots:1, description:"Base weapon: 4 DR. One mod slot."},
  refined: {label:"Refined Form (+1)", attack:1, dr:8, slots:2, description:"Adds 1 attack die and 4 DR (8 total). Requires a Stage 1+ blacksmith, 5 Siderite Shards, and 250 Mag. Two mod slots."},
  divine: {label:"Divine Form (+2)", attack:2, dr:12, slots:3, description:"Adds 2 attack dice and 8 DR (12 total). Requires a Stage 3+ blacksmith, 3 Siderite Fragments, and 1,500 Mag. Three mod slots."},
  immortal: {label:"Immortal Form (+3)", attack:3, dr:16, slots:4, description:"Adds 3 attack dice and 12 DR (16 total). Requires a Stage 5+ blacksmith, 1 Siderite Core, and 5,000 Mag. Four mod slots."}
};
export const UPGRADE_CHOICES = Object.fromEntries(Object.entries(UPGRADES).map(([key,value])=>[key,value.label]));
export const OUT_OF_AMMO = "Out of ammo, please reload or use another weapon";
export function weaponDetails(system) {
  const upgrade = UPGRADES[system.upgrade ?? "base"];
  if (!upgrade) throw new Error("Choose a valid weapon upgrade.");
  return {...upgrade, attack:Number(system.bonus ?? 0)+upgrade.attack+modifierProfile(system).attack,
    modCapacity:upgrade.slots-(system.affinity?.trim() ? 1 : 0)};
}
export function validateWeapon(system) {
  if (system.weaponType === "melee" && (!Number.isSafeInteger(system.range) || system.range < 1)) throw new Error("Melee reach must be at least 1 m, in whole metres.");
  const keys=modifierKeys(system);
  if(keys.has('great')&&keys.has('colossal')) throw new Error("A weapon cannot be both Great and Colossal.");
  const capacity = weaponDetails(system).modCapacity;
  const mods = system.mods ?? [];
  if (mods.length > capacity || mods.some(mod=>!Number.isInteger(mod.slot) || mod.slot<0 || mod.slot>=capacity)
    || new Set(mods.map(mod=>mod.slot)).size !== mods.length) {
    throw new Error("Remove mods from the extra slots before changing this upgrade or Affinity.");
  }
}
export function installMod(system, mod, slot) {
  if (mod.type !== "weaponMod") throw new Error("Drop a Weapon Mod into this slot.");
  const rule=(mod.system.rule||mod.name||'').trim().toLowerCase();
  if(['artifact','unblockable','undodgeable'].includes(rule)) throw new Error("This property cannot be crafted as a Mod. Set it under Inherent modifiers on the weapon.");
  const mods = (system.mods ?? []).filter(entry=>entry.slot !== slot);
  mods.push({slot,name:mod.name,description:mod.system.description ?? "",rule:mod.system.rule??''});
  validateWeapon({...system,mods});
  return mods;
}
export function ammoAfterUse(system) {
  if (!system.ammo?.type?.trim()) return null;
  if (!Number.isSafeInteger(system.ammo.quantity) || system.ammo.quantity <= 0) throw new Error(OUT_OF_AMMO);
  return system.ammo.quantity-1;
}
import { modifierProfile, modifierKeys } from "./modifiers.mjs?v=0.1.51";
