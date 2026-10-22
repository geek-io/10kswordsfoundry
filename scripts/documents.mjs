import {conditionStats,injuryChanges} from "./conditions.mjs?v=0.1.47";
import { equipmentEffectSuppressed } from "./effects.mjs?v=0.1.47";
import { modifierProfile } from "./modifiers.mjs?v=0.1.47";
import {resolveEffectValue} from './effect-values.mjs?v=0.1.47';
export class SwordsActiveEffect extends foundry.documents.ActiveEffect {
  static applyChange(target,change,options={}){
    try{return super.applyChange(target,{...change,value:resolveEffectValue(change.value,change.effect,target)},options);}
    catch(error){console.warn(`10,000 Swords: effect '${change.effect?.name??change.key}' could not apply: ${error.message}`);return {};}
  }
  get isSuppressed() {
    return super.isSuppressed || (this.transfer && this.parent?.documentName === "Item" && equipmentEffectSuppressed(this.parent));
  }
}
export class SwordsActor extends foundry.documents.Actor {
  async _preCreate(data,options,user){
    if(this.type!=='npc'&&(data.items??[]).some(item=>item.type==='gambit')){ui.notifications.warn('Gambits can only be added to World Beings.');return false;}
    return super._preCreate(data,options,user);
  }
  async _preUpdate(changes, options, user) {
    if(await super._preUpdate(changes,options,user)===false) return false;
    const expanded=foundry.utils.expandObject(changes);
    if((expanded.type??this.type)!=='npc'&&(expanded.items??this.toObject().items??[]).some(item=>item.type==='gambit')){ui.notifications.warn('Gambits can only be added to World Beings.');return false;}
    const source=this.toObject().system;
    const next=foundry.utils.mergeObject(source,expanded.system??{},{inplace:false});
    // Health can exceed the saved base maximum while an Active Effect is active.
    // Enforce the effective ceiling here, after source model validation.
    for(const resource of ['health','armor']) {
      const maximum=Math.max(0,next[resource].max+this.system[resource].max-source[resource].max);
      const value=Math.max(0,Math.min(maximum,next[resource].value));
      if(value!==next[resource].value) {
        next[resource].value=value;expanded.system??={};expanded.system[resource]??={};expanded.system[resource].value=value;
        for(const key of Object.keys(changes))delete changes[key];Object.assign(changes,expanded);
      }
    }
    const patch=injuryChanges(this,source,next);
    if(patch.samadhi?.active) options.swordsBloodiedSamadhi=true;
    if(Object.keys(patch).length) {
      expanded.system=foundry.utils.mergeObject(expanded.system??{},patch);
      for(const key of Object.keys(changes)) delete changes[key];
      Object.assign(changes,expanded);
    }
  }
  _onUpdate(changes, options, userId) {
    super._onUpdate(changes,options,userId);
    if(options.swordsBloodiedSamadhi && userId===game.user.id) ui.notifications.info(`${this.name} entered Samadhi from becoming Bloodied. +3 to checks; recovered 1 burnt Ardor if available.`);
  }
  prepareDerivedData() {
    super.prepareDerivedData();
    if(this.system.armor)this.system.armor.value=Math.min(this.system.armor.value,this.system.armor.max);
    this.system.health.value=Math.min(this.system.health.value,this.system.health.max);
    const penalty=this.items.contents.filter(item=>item.type==='weapon'&&item.system.equipped)
      .reduce((sum,item)=>sum+modifierProfile(item.system).movement,0);
    this.system.movement=Math.max(0,this.system.movement+penalty);
    Object.assign(this.system,conditionStats(this.system));
  }
}
