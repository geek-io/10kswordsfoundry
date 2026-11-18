import {prepareFashionEffects,ensureFashionEffects,repairFashionEffects} from './fashion-effects.mjs?v=0.2.42';
import {repairTechnickActions} from './technick-repair.mjs?v=0.2.42';
import {registerAnimations, registerDiceSoNice21} from './animations.mjs?v=0.2.42';
import {repairTraitEffects} from './trait-effect-repair.mjs?v=0.2.42';
import {registerRulesSetting, usesRules21} from './rules-version.mjs?v=0.2.42';
import {registerStrikeColors} from './strike-colors.mjs?v=0.2.42';
import {registerAbilityEffects} from './ability-effects.mjs?v=0.2.42';
import {registerChat21} from './chat21.mjs?v=0.2.42';
import {registerTicks21} from './swords21.mjs?v=0.2.42';
import {registerExchange21} from './exchange21.mjs?v=0.2.42';
import {registerSocial21} from './social21.mjs?v=0.2.42';
import {registerAbilityAreas} from './areas.mjs?v=0.2.42';
import {migrateAssets21, licenseBarangWarning21} from './assets21.mjs?v=0.2.42';
import {registerModConditions} from './mod-conditions.mjs?v=0.2.42';
import {setItemIcon,migrateItemIcons} from './item-icons.mjs?v=0.2.42';
import {registerEffectDropdowns} from "./effects.mjs?v=0.2.42";
import {persistLegacyArmor} from "./legacy-items.mjs?v=0.2.42";
import {registerSidebarTools} from "./sidebar-tools.mjs?v=0.2.42";
import {registerDiscovery21, openDiscovery21} from "./discovery21.mjs?v=0.2.42";
import {SwordsItem} from "./item-document.mjs?v=0.2.42";
import { SwordsActor, SwordsActiveEffect } from "./documents.mjs?v=0.2.42";
import { migrateWorldInventory } from "./migration.mjs?v=0.2.42";
import { SwordsActorData, SwordsItemData, SwordsJobData, SwordsLicenseData, SwordsFashionData, SwordsGearData, SwordsEquipmentData, SwordsWeaponData, SwordsWeaponModData, SwordsAmmoData, SwordsTechniqueData, SwordsMagickData, SwordsTraitData, SwordsGambitData, SwordsAssetData, SwordsBarangData } from "./data-models.mjs?v=0.2.42";
import { SwordsActorSheet, SwordsItemSheet } from "./sheets.mjs?v=0.2.42";
import { setWandererTokenDefault } from "./token-linking.mjs?v=0.2.42";
import { repairJobText } from "./job-repair.mjs?v=0.2.42";
import { registerArrowMovement } from "./arrow-move.mjs?v=0.2.42";

Hooks.on("preCreateItem",setItemIcon);
Hooks.on("preCreateItem",prepareFashionEffects);
Hooks.on("updateItem",async(item,changes,options,userId)=>{
 if(userId===game.user.id&&item.isOwner&&('name' in changes||'type' in changes)){
  try{await ensureFashionEffects(item);}catch(error){ui.notifications.error(error.message);}
 }
});
Hooks.on("preCreateActor", setWandererTokenDefault);
Hooks.on("createItem",(item,options,userId)=>{if(userId!==game.user?.id||!usesRules21())return;const warning=licenseBarangWarning21(item.parent,item);if(warning)ui.notifications.warn(warning);});

Hooks.once("ready",async()=>{await persistLegacyArmor();await migrateWorldInventory();await migrateItemIcons();try{await repairTraitEffects();await repairTechnickActions();await repairFashionEffects();await migrateAssets21();await repairJobText();}catch(error){ui.notifications.error(error.message);}});

Hooks.once("init", () => {
  game.settings.register("10kswordsfoundry","traitEffectRepairVersion",{scope:"world",config:false,type:Number,default:0});
  game.settings.register("10kswordsfoundry","technickActionsVersion",{scope:"world",config:false,type:Number,default:0});
  game.settings.register("10kswordsfoundry","jobTextVersion",{scope:"world",config:false,type:Number,default:0});
  game.settings.register("10kswordsfoundry","ktbEngine21",{name:"KILL THE BUDDHA engine (2.1)",hint:"Strikes is the 2.1 rulebook exchange: WEAPON vs Block (Weapon Check) or Dodge, Strikes cancel, and whoever wins buys Hits (1=random/knockback, 2=torso, 3=limb, 4=head) and may Flurry. Openings keeps the older Quick/Solid/Perfect exchange.",scope:"world",config:true,type:String,choices:{openings:"Openings (Quick / Solid / Perfect)",strikes:"Strikes (Block / Dodge)"},default:"strikes"});
  registerArrowMovement();
  registerRulesSetting();
  CONFIG.Item.documentClass=SwordsItem;
  registerSidebarTools();
  registerDiscovery21();
  registerAnimations();
  registerDiceSoNice21();
  registerStrikeColors();
  registerModConditions();
  registerAbilityEffects();
  registerChat21();
  registerTicks21();
  registerExchange21();
  registerSocial21();
  registerAbilityAreas();
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
  CONFIG.Item.dataModels.asset = SwordsAssetData;
  CONFIG.Item.dataModels.barang = SwordsBarangData;
  const sheets = foundry.applications.apps.DocumentSheetConfig;
  sheets.registerSheet(foundry.documents.Actor, "10kswordsfoundry", SwordsActorSheet, { makeDefault: true, types: ["wanderer", "npc"], label: "10,000 Swords" });
  sheets.registerSheet(foundry.documents.Item, "10kswordsfoundry", SwordsItemSheet, { makeDefault: true, types: ["gear", "weapon", "armor", "trait", "license", "technique", "job", "fashion", "magick", "weaponMod", "accessory", "ammunition", "gambit", "salvage", "asset", "barang"], label: "10,000 Swords" });
});

Hooks.once("ready",()=>{game.system.api={...game.system.api,openDiscovery21,openCompendium:async()=>{const {openLibrary}=await import("./browser.mjs?v=0.2.42");return openLibrary();}};});
