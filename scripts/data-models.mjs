import {RARITIES} from "./rarity.mjs?v=0.2.14";
import {CONDITIONS} from "./conditions.mjs?v=0.2.14";
import { MODIFIER_CHOICES } from "./modifiers.mjs?v=0.2.14";
import { AMMO_CHOICES, AMMO_FAMILIES } from "./ammunition.mjs?v=0.2.14";
import { LICENSE_CHOICES, RANKS, licenseIdentity } from "./licenses.mjs?v=0.2.14";
import { CORE_KEYS, CULTIVATION_KEYS_21, PART_KEYS, CONDITIONS_21, ASSETS_21, PROFILES, GRIPS, WEAPON_MODS_21, SIDHI_REALMS } from "./rules21.mjs?v=0.2.14";
const { NumberField, StringField, SchemaField, BooleanField, ArrayField, ObjectField, HTMLField } = foundry.data.fields;
const integer = (initial = 0, extra = {}) => new NumberField({ required: true, nullable: false, integer: true, min: 0, initial, ...extra });
const text = () => new StringField({ required: true, nullable: false, initial: "" });
const html = () => new HTMLField({required:true,nullable:false,initial:""});
const resource = (initial) => new SchemaField({ value: integer(initial), max: integer(initial) });
// Rules 2.1 fields. Additive only: the 2.0.3 rules never read them.
const kilograms = () => new NumberField({required:true,nullable:false,min:0,initial:0});
const signedInt = (initial=0) => integer(initial,{min:undefined});
const actor21Fields = () => ({
  cores:new SchemaField(Object.fromEntries(CORE_KEYS.map(key=>[key,integer(1)]))),
  skills:new SchemaField(Object.fromEntries(CULTIVATION_KEYS_21.map(key=>[key,integer(0)]))),
  esoteric:new ArrayField(new SchemaField({name:text(),value:integer(0),core:new StringField({required:true,nullable:false,initial:"spi",choices:CORE_KEYS})}),{initial:[]}),
  parts:new SchemaField(Object.fromEntries(PART_KEYS.map(key=>[key,new SchemaField({damage:integer(0),hpBonus:signedInt(),soakBase:integer(0),soakLost:integer(0)})]))),
  morale:new SchemaField({value:integer(1)}), moraleBonus:signedInt(), speedBonus:signedInt(), moveBonus:signedInt(), fatigue:integer(0), scorch:integer(0),
  carriedKg:kilograms(), savings:integer(0),
  conditions21:new SchemaField(Object.fromEntries(Object.keys(CONDITIONS_21).map(key=>[key,new BooleanField({initial:false})]))),
  attachments:new ArrayField(new SchemaField({text:text(),strength:integer(1,{min:1,max:3})}),{initial:[]}),
  assets:new ArrayField(new SchemaField({key:new StringField({required:true,nullable:false,initial:"custom",choices:Object.keys(ASSETS_21)}),name:text(),stars:integer(1,{max:5}),notes:text()}),{initial:[]}),
  casting:new SchemaField({itemId:text(),charges:integer(0)}),
  sidhiRealm:new StringField({required:true,nullable:false,initial:"desire",choices:Object.keys(SIDHI_REALMS)}),
  disposition21:new StringField({required:true,nullable:false,initial:"neutral",choices:["violent","hostile","neutral","friendly","enthusiastic"]})
});
const armor21Fields = () => new SchemaField({coverage:new SchemaField(Object.fromEntries(PART_KEYS.map(key=>[key,integer(0)]))),morale:signedInt(),weight:kilograms()});
const weapon21Fields = () => new SchemaField({profile:new StringField({required:true,nullable:false,initial:"",blank:true,choices:["",...Object.keys(PROFILES)]}),grip:new StringField({required:true,nullable:false,initial:"",blank:true,choices:["",...Object.keys(GRIPS)]}),damage:integer(2),range:integer(0),rate:integer(1),capacity:integer(0),ferocious:integer(0),shield:integer(0),mods:new SchemaField(Object.fromEntries(Object.keys(WEAPON_MODS_21).map(key=>[key,new BooleanField({initial:false})]))),weight:kilograms()});
const magick21Fields = () => new SchemaField({potency:integer(1),castTime:text(),core:new StringField({required:true,nullable:false,initial:"spi",choices:CORE_KEYS}),skill:text(),bonus:signedInt()});

const areaFields=()=>({areaShape:new StringField({initial:"none",choices:["none","circle","cone","ray"]}),areaSize:integer(),areaRange:integer()});
const specialAttacks=()=>new ArrayField(new SchemaField({...areaFields(),name:new StringField({initial:'Special Ability',required:true,nullable:false,blank:false}),description:html(),activation:new BooleanField({initial:false}),variableBurn:new BooleanField({initial:false}),releaseInstallation:new BooleanField({initial:false}),addSidhi:new BooleanField({initial:false}),convertStrikes:new BooleanField({initial:false}),weaponRequirement:new StringField({initial:'',blank:true,choices:['','any','heavy','ranged','blade','sword','gun','gunPolearm']}),inheritWeaponDamage:new BooleanField({initial:false}),modifiers:text(),range:integer(),fivePlusExtra:integer(),criticalExtra:integer(),allCritical:new BooleanField({initial:false}),uninterruptible:new BooleanField({initial:false}),mode:new StringField({initial:'attack',choices:['attack','check','automatic']}),hostile:new BooleanField({initial:true}),effectKey:new StringField({initial:'',blank:true,choices:['','system.attackBonus','system.defenseBonus','system.checkBonus','system.movement']}),effectValue:integer(0,{min:undefined}),apCost:integer(1),burnArdor:integer(),installArdor:integer(),bonus:integer(0,{min:undefined}),attackPool:new StringField({initial:'vio',choices:['vio','dia','grc','sav','wrd','spi']}),defensePool:new StringField({initial:'grc',choices:['vio','dia','grc','sav','wrd','spi']}),damageType:new StringField({initial:'impact',choices:['cut','impact','burn','trauma','ruination']})}),{initial:[]});

export class SwordsActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      cultivations: new SchemaField(Object.fromEntries(["vio", "dia", "grc", "sav", "wrd", "spi"].map(key => [key, integer(1)]))),
      jobBase: new SchemaField(Object.fromEntries(["vio", "dia", "grc", "sav", "wrd", "spi"].map(key => [key, integer(1)]))),
      jobAdjustments: new SchemaField(Object.fromEntries(["vio", "dia", "grc", "sav", "wrd", "spi"].map(key => [key, integer(0, { min: undefined })]))),
      samadhi:new SchemaField({active:new BooleanField({initial:false}),combatId:text(),round:integer(),until:new NumberField({initial:0,required:true,nullable:false})}),
      conditions:new SchemaField(Object.fromEntries(Object.keys(CONDITIONS).map(key=>[key,new BooleanField({initial:false})]))),
      actions:integer(3,{max:3}), bloodiedSamadhiUsed:new BooleanField({initial:false}),magickAreaBonus:integer(0,{min:undefined}),
      health: resource(6), armor: resource(0),
      ardor: new SchemaField({ max: integer(2), burnt: integer(), installed: integer() }),
      sidhi: integer(0, { max: 6 }), meridians: integer(2), movement: integer(6), carry: integer(8),
      xp: integer(), foundation: integer(), mag: integer(),
      carryOverage:integer(), meridianOverage:integer(), checkBonus:integer(0,{min:undefined}), attackBonus:integer(0,{min:undefined}), defenseBonus:integer(0,{min:undefined}),
      job: text(), culture: text(), truth: text(), alignment: text(), notes: html(),
      ...actor21Fields()
    };
  }
  // Health is bounded by SwordsActor against its effect-adjusted maximum, not the saved base.
  static validateJoint(data) {
    if (data.ardor.burnt + data.ardor.installed > data.ardor.max) {
      throw new Error("Burnt plus installed Ardor cannot exceed maximum Ardor.");
    }
  }
  get availableArdor() { return this.ardor.max - this.ardor.burnt - this.ardor.installed; }
}

export class SwordsItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return { rarity: new StringField({required:true,nullable:false,initial:"common",choices:RARITIES}), description: html(), source: text(), quantity: integer(1), slots: integer(1), bonus: integer(), tags: text() };
  }
}

export class SwordsJobData extends SwordsItemData {
  static defineSchema() {
    const {rarity,bonus,quantity,slots,...base}=super.defineSchema();
    return {
      ...base,
      grants:new ArrayField(new ObjectField({required:true,nullable:false}),{initial:()=>[]}),
      category: new StringField({ required: true, nullable: false, choices: ["body", "mind"], initial: "body" }),
      cultivations: new SchemaField(Object.fromEntries(["vio", "dia", "grc", "sav", "wrd", "spi"].map(key => [key, integer(1)])))
    };
  }
}

export class SwordsEquipmentData extends SwordsItemData {
  static defineSchema() {
    return {...super.defineSchema(), magCost:integer(), gearSlot:new StringField({required:true,nullable:false,initial:"carry",choices:["carry","left","right","both","fashion"]}), paidMeridians:integer(), paidCarry:integer(), equipped:new BooleanField({initial:false}), r21:armor21Fields()};
  }
}

export class SwordsGearData extends SwordsEquipmentData {
  static defineSchema(){return {...super.defineSchema(),consumable:new SchemaField({enabled:new BooleanField({initial:false}),apCost:integer(1),health:integer(),burntArdor:integer(),allHealth:new BooleanField({initial:false}),allBurntArdor:new BooleanField({initial:false}),morale:integer()})};}
}

export class SwordsFashionData extends SwordsEquipmentData {
  static defineSchema() {
    return {...super.defineSchema(), specialAttacks:specialAttacks(), magCost:integer(), armor:integer(), ardor:integer(), equipped:new BooleanField({initial:false})};
  }
}

export class SwordsWeaponData extends SwordsEquipmentData {
  get dr() { return weaponDetails(this).dr; }
  get attackBonus() { return weaponDetails(this).attack; }
  static defineSchema() {
    return {...super.defineSchema(),
      specialAttacks:specialAttacks(),
      upgrade:new StringField({required:true,nullable:false,choices:Object.keys(UPGRADE_CHOICES),initial:"base"}),
      weaponType:new StringField({required:true,nullable:false,initial:"melee",choices:["melee","ranged"]}),
      ammoId:text(), ammoFamily:new StringField({required:true,nullable:false,initial:"none",choices:Object.keys(AMMO_FAMILIES)}),
      damageType:new StringField({required:true,nullable:false,initial:"cut",choices:["cut","impact","burn","trauma","ruination"]}), range:integer(1),
      properties:new SchemaField(Object.fromEntries(Object.keys(MODIFIER_CHOICES).map(key=>[key,new BooleanField({initial:false})]))),
      magCost:integer(), affinity:text(), ammo:new SchemaField({type:text(),quantity:integer()}),
      mods:new ArrayField(new SchemaField({slot:integer(),name:text(),description:html(),rule:text()}),{initial:[]}),
      r21:weapon21Fields()
    };
  }
}

export class SwordsWeaponModData extends foundry.abstract.TypeDataModel {
  static defineSchema() { return {rarity:new StringField({required:true,nullable:false,initial:"common",choices:RARITIES}),description:html(),rule:new StringField({required:true,nullable:false,initial:"",blank:true,choices:["",...Object.keys(MODIFIER_CHOICES)]})}; }
}

export class SwordsLicenseData extends SwordsItemData {
  static migrateData(source) { if(source.sect)Object.assign(source,licenseIdentity(source));return super.migrateData(source); }
  static defineSchema() {
    const {rarity,...base}=super.defineSchema();
    return {
      ...base,meridianCost:integer(1),paidMeridians:integer(),paidCarry:integer(),
      slots: integer(0),
      sect: new StringField({required:true,nullable:false,initial:"Asuri"}),
      rank:new StringField({required:true,nullable:false,choices:RANKS,initial:"novice"}),
      prerequisites: new SchemaField(Object.fromEntries(["vio", "dia", "grc", "sav", "wrd", "spi", "sidhi"].map(key => [key, integer()]))),
      equipped: new BooleanField({ initial: false })
    };
  }
}
import { UPGRADE_CHOICES, weaponDetails } from "./weapons.mjs?v=0.2.14";

export class SwordsAmmoData extends SwordsEquipmentData {
  static defineSchema() {return {...super.defineSchema(),ammoType:new StringField({required:true,nullable:false,initial:"bullet",choices:Object.keys(AMMO_CHOICES)})};}
}

const cultivationChoices={vio:'Violence (VIO)',dia:'Dialectics (DIA)',grc:'Grace (GRC)',sav:'Savvy (SAV)',wrd:'Word (WRD)',spi:'Spirit (SPI)'};
export class SwordsTechniqueData extends SwordsEquipmentData {
 static defineSchema(){const {gearSlot,rarity,r21,...base}=super.defineSchema();return {...base,...areaFields(),paidArdor:integer(),sect:text(),rank:new StringField({initial:'',blank:true,choices:['','novice','expert','master']}),sidhi:integer(0,{max:6}),specialAttacks:specialAttacks(),apCost:integer(1),installArdor:integer(),burnArdor:integer()};}
}
export class SwordsMagickData extends SwordsTechniqueData {
 static defineSchema(){return {...super.defineSchema(),enhancement:new SchemaField({description:text(),apCost:integer(),burnArdor:integer(),installArdor:integer(),bonus:integer(0,{min:undefined}),areaBonus:integer(),extraWounds:integer()}),damageType:new StringField({initial:'burn',required:true,nullable:false,choices:['cut','impact','burn','trauma','ruination']}),mantra:text(),mudra:text(),attackPool:new StringField({initial:'spi',required:true,nullable:false,choices:cultivationChoices}),defensePool:new StringField({initial:'grc',required:true,nullable:false,choices:cultivationChoices}),areaShape:new StringField({initial:'none',choices:{none:'Single target',circle:'Burst / circle',cone:'Cone',ray:'Line'}}),areaSize:integer(),mudraHands:integer(1,{min:1,max:2}),r21:magick21Fields()};}
}

export class SwordsTraitData extends SwordsItemData {
 static defineSchema(){const {rarity,slots,quantity,bonus,...base}=super.defineSchema();return {...base,active:new BooleanField({initial:true}),level:integer(1)};}
}

export class SwordsGambitData extends foundry.abstract.TypeDataModel {static defineSchema(){return {description:html(),source:text(),tags:text(),apCost:integer(1)};}}

// Rules 2.1 item types (2026-11 test run): Assets (RK pp.45–49) and Barang (RK pp.51–52, Sect spoilers).
export class SwordsAssetData extends foundry.abstract.TypeDataModel {
 static defineSchema(){return {description:html(),source:text(),tags:text(),key:new StringField({required:true,nullable:false,initial:"custom",choices:Object.keys(ASSETS_21)}),stars:integer(1,{max:5}),detail:text()};}
}
export class SwordsBarangData extends foundry.abstract.TypeDataModel {
 static defineSchema(){return {description:html(),source:text(),tags:text(),sect:text(),cultivation:text(),weapons:text(),ingested:new BooleanField({initial:false})};}
}
