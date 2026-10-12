import {repairTraitEffects} from './trait-effect-repair.mjs?v=0.1.40';
import {registerStrikeColors} from './strike-colors.mjs?v=0.1.40';
import {registerAbilityEffects} from './ability-effects.mjs?v=0.1.40';
import {registerModConditions} from './mod-conditions.mjs?v=0.1.40';
import {setItemIcon,migrateItemIcons} from './item-icons.mjs?v=0.1.40';
import {registerEffectDropdowns} from "./effects.mjs?v=0.1.40";
import {persistLegacyArmor} from "./legacy-items.mjs?v=0.1.40";
import {registerSidebarTools} from "./sidebar-tools.mjs?v=0.1.40";
import {SwordsItem} from "./item-document.mjs?v=0.1.40";
import { SwordsActor, SwordsActiveEffect } from "./documents.mjs?v=0.1.40";
import { migrateWorldInventory } from "./migration.mjs?v=0.1.40";
import { SwordsActorData, SwordsItemData, SwordsJobData, SwordsLicenseData, SwordsFashionData, SwordsGearData, SwordsEquipmentData, SwordsWeaponData, SwordsWeaponModData, SwordsAmmoData, SwordsTechniqueData, SwordsMagickData, SwordsTraitData, SwordsGambitData } from "./data-models.mjs?v=0.1.40";
import { SwordsActorSheet, SwordsItemSheet } from "./sheets.mjs?v=0.1.40";
import { setWandererTokenDefault } from "./token-linking.mjs?v=0.1.40";

Hooks.on("preCreateItem",setItemIcon);
Hooks.on("preCreateActor", setWandererTokenDefault);

Hooks.once("ready",async()=>{await persistLegacyArmor();await migrateWorldInventory();await migrateItemIcons();try{await repairTraitEffects();}catch(error){ui.notifications.error(error.message);}});

Hooks.once("init", () => {
  game.settings.register("10kswordsfoundry","traitEffectRepairVersion",{scope:"world",config:false,type:Number,default:0});
  CONFIG.Item.documentClass=SwordsItem;
  registerSidebarTools();
  registerStrikeColors();
  registerModConditions();
  registerAbilityEffects();
  registerEffectDropdowns();
  CONFIG.Actor.documentClass = SwordsActor;
  CONFIG.ActiveEffect.documentClass = SwordsActiveEffect;
  for (const type of ["wanderer", "npc"]) CONFIG.Actor.dataModels[type] = SwordsActorData;
  for (const type of ["gear", "weapon", "armor", "trait", "license", "technique"]) CONFIG.Item.dataModels[type] = SwordsItemData;
  for (const type of ["weapon", "gear", "armor", "technique", "magick"]) CONFIG.Item.dataModels[type] = SwordsEquipmentData;
  CONFIG.Item.dataModels.gear=SwordsGearData;
  CONFIG.Item.dataModels.accessory = SwordsEquipmentData;
  CONFIG.Item.dataModels.ammunition = SwordsAmmoData;
  CONFIG.Item.dataModels.technique=SwordsTechniqueData;
  CONFIG.Item.dataModels.magick=SwordsMagickData;
  CONFIG.Item.dataModels.gambit=SwordsGambitData;
  CONFIG.Item.dataModels.salvage=SwordsEquipmentData;
  CONFIG.Item.dataModels.trait=SwordsTraitData;
  CONFIG.Item.dataModels.weapon = SwordsWeaponData;
  CONFIG.Item.dataModels.weaponMod = SwordsWeaponModData;
  CONFIG.Item.dataModels.fashion = SwordsFashionData;
  CONFIG.Item.dataModels.job = SwordsJobData;
  CONFIG.Item.dataModels.license = SwordsLicenseData;
  const sheets = foundry.applications.apps.DocumentSheetConfig;
  sheets.registerSheet(foundry.documents.Actor, "10kswordsfoundry", SwordsActorSheet, { makeDefault: true, types: ["wanderer", "npc"], label: "10,000 Swords" });
  sheets.registerSheet(foundry.documents.Item, "10kswordsfoundry", SwordsItemSheet, { makeDefault: true, types: ["gear", "weapon", "armor", "trait", "license", "technique", "job", "fashion", "magick", "weaponMod", "accessory", "ammunition", "gambit", "salvage"], label: "10,000 Swords" });
});

Hooks.once("ready",()=>{game.system.api={...game.system.api,openCompendium:async()=>{const {openLibrary}=await import("./browser.mjs?v=0.1.40");return openLibrary();}};});
