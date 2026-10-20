import {RARITIES} from "./rarity.mjs?v=0.1.45";
import {CONDITIONS} from "./conditions.mjs?v=0.1.45";
import { MODIFIER_CHOICES } from "./modifiers.mjs?v=0.1.45";
import { AMMO_CHOICES, AMMO_FAMILIES } from "./ammunition.mjs?v=0.1.45";
import { LICENSE_CHOICES, RANKS, licenseIdentity } from "./licenses.mjs?v=0.1.45";
const { NumberField, StringField, SchemaField, BooleanField, ArrayField, ObjectField, HTMLField } = foundry.data.fields;
const integer = (initial = 0, extra = {}) => new NumberField({ required: true, nullable: false, integer: true, min: 0, initial, ...extra });
const text = () => new StringField({ required: true, nullable: false, initial: "" });
const html = () => new HTMLField({required:true,nullable:false,initial:""});
const resource = (initial) => new SchemaField({ value: integer(initial), max: integer(initial) });

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
      job: text(), culture: text(), truth: text(), alignment: text(), notes: html()
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
    return {...super.defineSchema(), magCost:integer(), gearSlot:new StringField({required:true,nullable:false,initial:"carry",choices:["carry","left","right","both","fashion"]}), paidMeridians:integer(), paidCarry:integer(), equipped:new BooleanField({initial:false})};
  }
}

export class SwordsGearData extends SwordsEquipmentData {
  static defineSchema(){return {...super.defineSchema(),consumable:new SchemaField({enabled:new BooleanField({initial:false}),apCost:integer(1),health:integer(),burntArdor:integer(),allHealth:new BooleanField({initial:false}),allBurntArdor:new BooleanField({initial:false})})};}
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
      mods:new ArrayField(new SchemaField({slot:integer(),name:text(),description:html(),rule:text()}),{initial:[]})
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
import { UPGRADE_CHOICES, weaponDetails } from "./weapons.mjs?v=0.1.45";

export class SwordsAmmoData extends SwordsEquipmentData {
  static defineSchema() {return {...super.defineSchema(),ammoType:new StringField({required:true,nullable:false,initial:"bullet",choices:Object.keys(AMMO_CHOICES)})};}
}

const cultivationChoices={vio:'Violence (VIO)',dia:'Dialectics (DIA)',grc:'Grace (GRC)',sav:'Savvy (SAV)',wrd:'Word (WRD)',spi:'Spirit (SPI)'};
export class SwordsTechniqueData extends SwordsEquipmentData {
 static defineSchema(){const {gearSlot,rarity,...base}=super.defineSchema();return {...base,...areaFields(),paidArdor:integer(),sect:text(),rank:new StringField({initial:'',blank:true,choices:['','novice','expert','master']}),sidhi:integer(0,{max:6}),specialAttacks:specialAttacks(),apCost:integer(1),installArdor:integer(),burnArdor:integer()};}
}
export class SwordsMagickData extends SwordsTechniqueData {
 static defineSchema(){return {...super.defineSchema(),enhancement:new SchemaField({description:text(),apCost:integer(),burnArdor:integer(),installArdor:integer(),bonus:integer(0,{min:undefined}),areaBonus:integer(),extraWounds:integer()}),damageType:new StringField({initial:'burn',required:true,nullable:false,choices:['cut','impact','burn','trauma','ruination']}),mantra:text(),mudra:text(),attackPool:new StringField({initial:'spi',required:true,nullable:false,choices:cultivationChoices}),defensePool:new StringField({initial:'grc',required:true,nullable:false,choices:cultivationChoices}),areaShape:new StringField({initial:'none',choices:{none:'Single target',circle:'Burst / circle',cone:'Cone',ray:'Line'}}),areaSize:integer(),mudraHands:integer(1,{min:1,max:2})};}
}

export class SwordsTraitData extends SwordsItemData {
 static defineSchema(){const {rarity,slots,quantity,bonus,...base}=super.defineSchema();return {...base,active:new BooleanField({initial:true}),level:integer(1)};}
}

export class SwordsGambitData extends foundry.abstract.TypeDataModel {static defineSchema(){return {description:html(),source:text(),tags:text(),apCost:integer(1)};}}
