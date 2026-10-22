import {qualifiesForLicense,LICENSE_DENIED} from "./licenses.mjs?v=0.1.47";
import { itemCosts, assignSlot } from "./slots.mjs?v=0.1.47";
import { selectedAmmo } from "./ammunition.mjs?v=0.1.47";
import { fashionResources } from "./fashion.mjs?v=0.1.47";
import {isAbility,isInternalized,refundInstallation} from './ability-state.mjs?v=0.1.47';

export const EQUIPMENT_TYPES = ["salvage", "license", "fashion", "gear", "technique", "magick", "weapon", "accessory", "ammunition", "armor"];
const whole = value => {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("Equipment costs must be nonnegative whole numbers.");
  return value;
};

export function equipmentResources(system, previous, next) {
  const {meridians,carry}=itemCosts(next);
  // Persist amounts actually deducted. Older equipped Fashion has paid neither cost.
  const availableMeridians = system.meridians + (previous?.system.paidMeridians ?? 0) - meridians;
  const availableCarry = (system.carry - (system.carryOverage??0)) + (previous?.system.paidCarry ?? 0) - carry;
  if (availableMeridians < 0) throw new Error("You do not have enough Open Meridians to equip this item.");
  if (availableCarry < 0) throw new Error("You do not have enough Carry capacity to equip this weapon.");
  const resources = {meridians:availableMeridians, carry:availableCarry};
  if (previous?.type === "fashion" || next?.type === "fashion") {
    Object.assign(resources, fashionResources(system, previous?.system, next?.system));
  }
  return {resources, paidMeridians:meridians, paidCarry:carry};
}

const pending = new WeakMap();
export function queueEquipment(actor, operation) {
  const prior = pending.get(actor) ?? Promise.resolve();
  const task = prior.catch(()=>{}).then(operation);
  pending.set(actor,task);
  return task.finally(()=>{if(pending.get(actor)===task) pending.delete(actor);});
}
export function changeEquipment(actor, itemId, changes = {}, {remove=false, toggle=false} = {}) {
  return queueEquipment(actor, async()=>{
    if (!actor.isOwner) throw new Error("You cannot change this character's equipment.");
    const source = actor.toObject();
    const index = source.items.findIndex(item=>item._id === itemId && EQUIPMENT_TYPES.includes(item.type));
    if (index < 0) throw new Error("This equipment is no longer on the character.");
    const previous = source.items[index];
    const next = foundry.utils.mergeObject(previous, changes, {inplace:false});
    if (next.type === "weapon" && !remove) validateWeapon(next.system);
    if(toggle&&isAbility(previous)){
      if(!isInternalized(previous))throw new Error('Use Internalize or Activate on the sheet to spend this ability’s costs.');
      refundInstallation(source.system,previous);next.system.equipped=false;next.system.paidArdor=0;
    }else if (toggle) next.system.equipped = !previous.system.equipped;
    if(!remove&&next.type==="license"&&next.system.equipped&&!qualifiesForLicense(actor.system,next.system))throw new Error(LICENSE_DENIED);
    if (!remove) assignSlot(next,source.items,itemId);
    const oldItems=structuredClone(source.items);
    if(previous.type==='fashion') Object.assign(source.system,fashionResources(source.system,previous.system,remove?null:next.system));
    if (remove) {refundInstallation(source.system,previous);source.items.splice(index,1);}
    else source.items[index] = next;
    reconcileCosts(source,oldItems);
    const updated = await actor.update(source,{diff:false,recursive:false});
    if (!updated) throw new Error("The equipment change was not saved.");
    return actor.items.get(itemId);
  });
}

export function attackBonus(items, attack, weaponId) {
  if (!attack || !weaponId) return 0;
  const weapon = items.find(item=>item.id === weaponId && item.type === "weapon" && item.system.equipped);
  if (!weapon) throw new Error("Choose an equipped weapon, or select Unarmed.");
  return weaponDetails(weapon.system).attack;
}

// Keep ammo reservation and the roll in the same queue as equip/edit operations.
export function useWeapon(actor, weaponId, action, ammoId="", amount=1) {
  return queueEquipment(actor, async()=>{
    if (!actor.isOwner) throw new Error("You cannot use this character's weapon.");
    const weapon = actor.items.get(weaponId);
    if (weapon?.type !== "weapon" || !weapon.system.equipped) throw new Error("Choose an equipped weapon, or select Unarmed.");
    if(['carry','fashion'].includes(weapon.system.gearSlot)) throw new Error("Assign this weapon to a free hand before attacking.");
    if(!Number.isSafeInteger(amount)||amount<1) throw new Error("Ammo spent must be a positive whole number.");
    const stack=selectedAmmo(actor,weapon,ammoId);
    const ammoItem=stack?.item??weapon;
    const original=stack?ammoItem.system.quantity:weapon.system.ammo?.quantity;
    const tracked=!!stack || !!weapon.system.ammo?.type?.trim();
    if(tracked && (!Number.isSafeInteger(original)||original<amount)) throw new Error("Out of ammo, please reload or use another weapon");
    const remaining=tracked?original-amount:null;
    const save=quantity=>stack ? saveAmmoQuantity(actor,ammoItem.id,quantity) : weapon.update({"system.ammo.quantity":quantity});
    if (remaining !== null) {
      const saved = await save(remaining);
      if (!saved) throw new Error("Ammo could not be saved. Please try again.");
    }
    try { return await action(weapon,stack); }
    catch (error) {
      if (remaining !== null) {
        try {
          if (!await save(original)) throw new Error("Ammo refund failed");
        } catch { throw new Error("The roll failed and ammo could not be restored. Please check the weapon's ammo quantity."); }
      }
      throw error;
    }
  });
}
import { weaponDetails, validateWeapon, ammoAfterUse } from "./weapons.mjs?v=0.1.47";

export function reconcileCosts(source,oldItems,{allowOverage=false}={}) {
  const beforeCarry=source.system.carry-(source.system.carryOverage??0);
  let carry=beforeCarry+oldItems.reduce((sum,item)=>sum+(item.system.paidCarry??0),0);
  const beforeMeridians=source.system.meridians-(source.system.meridianOverage??0);
  let meridians=beforeMeridians+oldItems.reduce((sum,item)=>sum+(item.system.paidMeridians??0),0);
  const ammoTypes=new Set();
  for(const item of source.items) {
    const cost=itemCosts(item);
    if(item.type==='ammunition'&&cost.carry) {
      const key=item.system.ammoType==='custom'?`custom:${item.name}`:item.system.ammoType;
      if(ammoTypes.has(key)) cost.carry=0;
      ammoTypes.add(key);
    }
    if(EQUIPMENT_TYPES.includes(item.type)) Object.assign(item.system,{paidCarry:cost.carry,paidMeridians:cost.meridians});
    carry-=cost.carry; meridians-=cost.meridians;
  }
  if(meridians<0&&meridians<beforeMeridians&&!allowOverage) throw new Error("You do not have enough Open Meridians to internalize this item.");
  if(carry<0 && carry<beforeCarry && !allowOverage) throw new Error("You do not have enough Carry capacity for this item.");
  Object.assign(source.system,{carry:Math.max(0,carry),carryOverage:Math.max(0,-carry),meridians:Math.max(0,meridians),meridianOverage:Math.max(0,-meridians)});
}
export function addEquipment(actor,data,{allowOverage=false,equipLicense=true}={}) {
  return queueEquipment(actor,async()=>{
    if(!actor.isOwner) throw new Error("You cannot change this character's equipment.");
    const source=actor.toObject(), oldItems=structuredClone(source.items);
    const item=foundry.utils.deepClone(data); item._id=foundry.utils.randomID();
      item.system.equipped=item.type==="license"&&equipLicense;
    if(item.system.equipped&&!qualifiesForLicense(actor.system,item.system))throw new Error(LICENSE_DENIED);
      item.system.paidCarry=0; item.system.paidMeridians=0;
      if(isAbility(item))item.system.paidArdor=0;
      delete item.folder; source.items.push(item); reconcileCosts(source,oldItems,{allowOverage});
    if(!await actor.update(source,{diff:false,recursive:false})) throw new Error("The item could not be saved.");
    return actor.items.get(item._id);
  });
}
async function saveAmmoQuantity(actor,id,quantity) {
  const source=actor.toObject(),oldItems=structuredClone(source.items);
  const ammo=source.items.find(item=>item._id===id&&item.type==='ammunition');
  if(!ammo) throw new Error("The selected ammo stack is no longer available.");
  ammo.system.quantity=quantity; reconcileCosts(source,oldItems);
  return actor.update(source,{diff:false,recursive:false});
}
