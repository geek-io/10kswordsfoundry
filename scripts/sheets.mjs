import {WEAPON_REQUIREMENTS} from './special-abilities.mjs?v=0.1.51';
import {animationContext,playItemAnimation} from './animations.mjs?v=0.1.51';
import {useConsumable} from './consumables.mjs?v=0.1.51';
import {CULTIVATION_DETAILS} from './cultivations.mjs?v=0.1.51';
import {grantSnapshot} from './job-grants.mjs?v=0.1.51';
import {defaultItemIcon} from './item-icons.mjs?v=0.1.51';
import {abilityView,isAbility,isInternalized} from './ability-state.mjs?v=0.1.51';
import {armorTrack} from './health.mjs?v=0.1.51';
import {inflictedConditions,resolveOngoing} from './mod-conditions.mjs?v=0.1.51';
import {useAbility,resourceSymbols,AREA_SHAPES} from "./abilities.mjs?v=0.1.51";
import {RANKS,licenseIdentity,licenseLabel} from "./licenses.mjs?v=0.1.51";
import {RARITIES} from "./rarity.mjs?v=0.1.51";
import {interruptAttack} from "./interrupt.mjs?v=0.1.51";
import {activatePanel,sheetPanel,openCompendium} from "./sheet-navigation.mjs?v=0.1.51";
import {resolveDefense,recentAttacks,escapeHTML} from "./resolution.mjs?v=0.1.51";
import {CONDITIONS,assertAction,restChanges} from "./conditions.mjs?v=0.1.51";
import { sixesHTML, requireFreeHand, wieldedWeapons, tagBonus, inSamadhi, enterSamadhi } from "./roll-support.mjs?v=0.1.51";
import { attackCultivation, combatModifiers } from "./combat.mjs?v=0.1.51";
import { healthSutra } from "./health.mjs?v=0.1.51";
import { createEffect, editEffect, toggleEffect, removeEffect, effectRows } from "./effects.mjs?v=0.1.51";
import { editorValue, enriched } from "./rich-text.mjs?v=0.1.51";
import { slotSummary } from "./slots.mjs?v=0.1.51";
import { AMMO_CHOICES, AMMO_FAMILIES } from "./ammunition.mjs?v=0.1.51";
import { MODIFIER_CHOICES, modifierProfile, AFFINITIES } from "./modifiers.mjs?v=0.1.51";
import { UPGRADE_CHOICES, weaponDetails, validateWeapon, installMod } from "./weapons.mjs?v=0.1.51";
import { LICENSE_CHOICES, LICENSE_DENIED, qualifiesForLicense } from "./licenses.mjs?v=0.1.51";
import { applyJobToActor } from "./jobs.mjs?v=0.1.51";
import { CULTIVATIONS, checkFormula, summarizeCheck } from "./rules.mjs?v=0.1.51";

import { boundedResources, resourceLimits } from "./resources.mjs?v=0.1.51";

import { preserveAndLinkWanderer } from "./token-linking.mjs?v=0.1.51";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export const SHEET_CODE_VERSION = "0.1.43";

export class SwordsActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {

    classes: ["swords", "actor-sheet"], position: { width: 740, height: 800 },

    form: { submitOnChange: true, closeOnSubmit: false },

    actions: {useConsumable,toggleTraitEffect:SwordsActorSheet.toggleTraitEffect,toggleTrait:SwordsActorSheet.toggleTrait,addNew:SwordsActorSheet.addNew,autoSort:SwordsActorSheet.autoSort,resolveOngoing,interrupt:interruptAttack,sheetPanel,openCompendium, rest:SwordsActorSheet.rest, spendAction:SwordsActorSheet.spendAction, refreshActions:SwordsActorSheet.refreshActions, defense:SwordsActorSheet.defense, cast:useAbility,useAbility, endSamadhi:SwordsActorSheet.endSamadhi, attack: SwordsActorSheet.attack, setHealth: SwordsActorSheet.setHealth,setArmor:SwordsActorSheet.setArmor, check: SwordsActorSheet.rollCheck, editItem: SwordsActorSheet.editItem, linkWanderer: SwordsActorSheet.linkWanderer, choosePortrait: SwordsActorSheet.choosePortrait, toggleLicense: SwordsActorSheet.toggleLicense, toggleEquipment: SwordsActorSheet.toggleEquipment, removeEquipment: SwordsActorSheet.removeEquipment, createEffect, editEffect, toggleEffect, removeEffect }
  };

  static PARTS = { main: { template: "systems/10kswordsfoundry/templates/actor.hbs" } };

  async _onDropItem(event, item) {
    if (!this.isEditable) return null;
    if (event.target?.closest?.('[data-drop-zone="job"]') && item.type !== "job") {
      ui.notifications.warn("Drop a Job item here.");
      return null;
    }
    if(item.type==='gambit'&&this.document.type!=='npc'){ui.notifications.warn('Gambits can only be added to World Beings.');return null;}
    if (item.parent?.uuid === this.document.uuid) return super._onDropItem(event, item);
    if (!["job", "license", ...EQUIPMENT_TYPES].includes(item.type)) return super._onDropItem(event, item);
    await this.submit();
    try {
      if (item.type === "job") return await applyJobToActor(this.document, item.toObject(),{origin:item.parent?.documentName==='Actor'?item.flags?.['10kswordsfoundry']?.jobOrigin??item.uuid:item.uuid});
      if (item.type === "license" && !qualifiesForLicense(this.document.system, item.system)) {
        ui.notifications.warn(LICENSE_DENIED);
        return null;
      }
      const data = item.inCompendium ? game.items.fromCompendium(item, {clearFolder:true}) : item.toObject();
      delete data._id;
      delete data.folder;
      data.system.equipped = item.type === "license";
      if (EQUIPMENT_TYPES.includes(item.type)) { data.system.paidMeridians = 0; data.system.paidCarry = 0; }
      if(item.type==='weapon') data.system.ammoId='';
      if (EQUIPMENT_TYPES.includes(item.type)) return addEquipment(this.document,data);
      return await foundry.utils.getDocumentClass("Item").create(data, {parent:this.document});
    } catch (error) { ui.notifications.error(error.message); return null; }
  }

  async _prepareContext(options) {

    const sorted=this.document.items.contents.toSorted((a,b)=>(a.sort??0)-(b.sort??0));
    const context = await super._prepareContext(options);
    const source=this.document.toObject?.().system ?? this.document.system;
    const effective=[];
    for(const [key,label] of Object.entries(CULTIVATIONS)) if(source.cultivations[key]!==this.document.system.cultivations[key]) effective.push(`${label}: ${this.document.system.cultivations[key]}`);
    for(const resource of ['health','armor','ardor']) for(const key of Object.keys(source[resource]??{})) if(source[resource][key]!==this.document.system[resource][key]) effective.push(`${resource} ${key}: ${this.document.system[resource][key]}`);
    for(const key of ['movement','checkBonus','attackBonus','defenseBonus']) if(source[key]!==this.document.system[key]) effective.push(`${key}: ${this.document.system[key]}`);

    return Object.assign(context, {

      armorTrack:armorTrack(this.document.system.armor),
      specialAttackRows:sorted.filter(i=>i.type==='technique'||['fashion','weapon'].includes(i.type)&&i.system.equipped).flatMap(i=>(i.system.specialAttacks??[]).map((a,index)=>({...a,itemId:i.id,itemName:i.name,index,actionLabel:a.mode==='automatic'?'Activate':a.mode==='check'?'Check':'Attack'})).filter(a=>i.type!=='technique'||(a.activation?!isInternalized(i):!(i.system.installArdor>0)||isInternalized(i)))),
      conditionRows:Object.entries(CONDITIONS).map(([key,description])=>({key,label:key[0].toUpperCase()+key.slice(1),description,active:!!source.conditions?.[key]})),
      ...resourceSymbols(this.document.system), actor: this.document,isWorldBeing:this.document.type==='npc',effectiveMovement:this.document.system.movement, samadhiActive:inSamadhi(this.document), system: source, sutra:healthSutra(this.document.system.health), effectiveSummary:effective.join("; "),
      notesEditor:foundry.utils.cleanHTML(editorValue(source.notes)), notesHTML:await enriched(source.notes,this.document), effects:effectRows(this.document), gearSlots:slotSummary(sorted), codeVersion: SHEET_CODE_VERSION,
      unassignedWeapons:sorted.filter(item=>item.type==='weapon'&&item.system.equipped&&item.system.gearSlot==='carry').map(item=>item.name).join(', '),

      canLinkWanderer: game.user.isGM && this.document.type === "wanderer" && this.document.isToken && !this.document.token?.actorLink,

      cultivations: Object.entries(CULTIVATIONS).map(([key, label]) => ({ key, label,name:CULTIVATION_DETAILS[key].name,icon:`systems/10kswordsfoundry/assets/cultivations/${key}.png`,tooltip:editorValue(CULTIVATION_DETAILS[key].text), value: source.cultivations[key] })),

      combatItems:sorted.filter(item=>isAbility(item)||item.type==='weapon'&&item.system.equipped).map(item=>({...abilityView(item),isAbility:isAbility(item),canAttack:item.type==='weapon'})),
      traitItems:sorted.filter(i=>i.type==='trait').toSorted((a,b)=>a.sort-b.sort).map(i=>({id:i.id,name:i.name,system:i.system,traitEnabled:i.system.active&&(!(i.effects?.contents??[]).length||(i.effects?.contents??[]).some(e=>!e.disabled)),effects:effectRows(i)})),gambitItems:sorted.filter(i=>i.type==='gambit').toSorted((a,b)=>a.sort-b.sort),salvageItems:sorted.filter(i=>i.type==='salvage').toSorted((a,b)=>a.sort-b.sort),
      abilityGroups:['technique','magick'].map(type=>({type,label:type==='magick'?'Magicks':'Technicks',items:sorted.filter(item=>item.type===type).map(abilityView)})),
      jobItem: this.document.items.find(item => item.type === "job"),
      inventoryGroups:[...Object.entries({weapon:"Weapons",gear:"Gear",accessory:"Accessories",ammunition:"Ammo",weaponMod:"Weapon Mods"})].map(([type,label])=>({type,label,items:sorted.filter(item=>item.type===type).map(item=>({id:item.id,name:item.name,system:item.system,canConsume:item.type==='gear'&&item.system?.consumable?.enabled,equippable:EQUIPMENT_TYPES.includes(item.type)}))})),
      items: sorted.filter(item => !["job", "license", "fashion", "magick", "technique", "trait", "gambit", "salvage"].includes(item.type)).toSorted((a, b) => a.sort - b.sort).map(item => ({id:item.id, name:item.name, system:item.system, isTrait:item.type==='trait', canCast:item.type === "magick" && item.system.equipped, canAttack:item.type === "weapon" && item.system.equipped, canConsume:item.type==='gear'&&item.system?.consumable?.enabled,equippable:EQUIPMENT_TYPES.includes(item.type)})),
      fashions: sorted.filter(item => item.type === "fashion").toSorted((a,b) => a.sort-b.sort),
      licenses: sorted.filter(item => item.type === "license").toSorted((a,b) => a.sort-b.sort).map(item => {
        const qualified = qualifiesForLicense(this.document.system, item.system);
        return {id:item.id, name:item.name, system:item.system, sect:licenseLabel(item.system), qualified,
          equipped: !!item.system.equipped, active: qualified && item.system.equipped,
          status: !qualified ? "Requirements not met" : item.system.equipped ? "Equipped" : "Unequipped"};
      }),

      availableArdor: this.document.system.availableArdor,

      ardorBurntLimit: source.ardor.max - source.ardor.installed,

      ardorInstalledLimit: source.ardor.max - source.ardor.burnt,

      ardorMinimumMax: source.ardor.burnt + source.ardor.installed

    });

  }

  async _onFirstRender(context,options){
    await super._onFirstRender(context,options);
    this._createContextMenu(this._itemContextOptions,'li[data-item-id], .job-entry[data-item-id]',{fixed:true,hookName:'getSwordsItemContextOptions'});
  }

  _itemContextOptions(){return [{label:'Remove',icon:'fa-solid fa-trash',visible:target=>this.isEditable&&!!this.document.items.get(target.dataset.itemId),onClick:(event,target)=>SwordsActorSheet.removeEquipment.call(this,event,target)}];}

  async _onRender(context, options) {

    await super._onRender(context, options);
    activatePanel(this,this._swordsPanel??"overview");

    this._resourceInputController?.abort();

    this._resourceInputController = new AbortController();

    for(const row of this.element.querySelectorAll('[data-item-id]')){
      const item=this.document.items.get(row.dataset.itemId);if(!item)continue;
      if(row.matches('li,.job-entry')){row.draggable=this.isEditable;row.classList.add('draggable');row.dataset.tooltip=await enriched(item.system.description??'',item);row.dataset.tooltipClass='swords-item-tooltip';}
    }
    this._dragDrop?.bind(this.element);
    this._syncResourceInputs();

    this.element.addEventListener("input", event => {

      if (Object.hasOwn(resourceLimits(this.document.system), event.target?.name)) {

        this._syncResourceInputs(event.target?.name);

      }

    }, { signal: this._resourceInputController.signal });

  }

  _syncResourceInputs(changed = "") {

    if (!this.isEditable || !this.form) return;

    const system = {};

    for (const key of ["health", "armor", "ardor"]) {

      system[key] = { ...(this.document.toObject?.().system ?? this.document.system)[key] };

      for (const field of Object.keys(system[key])) {

        const input = this.form.elements.namedItem(`system.${key}.${field}`);

        if (input && input.value !== "") system[key][field] = Number(input.value);

      }

    }

    const healthMaximum = Math.max(0,system.health.max + this.document.system.health.max - (this.document.toObject?.().system ?? this.document.system).health.max);
    const bounded = boundedResources(system, changed, healthMaximum);

    for (const [name, limits] of Object.entries(resourceLimits({...bounded,health:{...bounded.health,max:healthMaximum}}))) {

      const input = this.form.elements.namedItem(name);

      if (!input) continue;

      const [, key, field] = name.split(".");

      input.min = String(limits.min);

      if (limits.max !== undefined) input.max = String(limits.max);

      // Let users clear a field while typing; normalize it on change/submit.

      if (input.value !== "") input.value = String(bounded[key][field]);

    }

  }

  _onChangeForm(formConfig, event) {

    this._syncResourceInputs(event.target?.name);

    return super._onChangeForm(formConfig, event);

  }

  _processFormData(event, form, formData) {

    const data = super._processFormData(event, form, formData);

    const system = foundry.utils.mergeObject(this.document.system.toObject(), data.system ?? {}, { inplace: false });

    const base = this.document.toObject?.().system ?? this.document.system;
    const healthMaximum = Math.max(0,system.health.max + this.document.system.health.max - base.health.max);
    data.system = { ...data.system, ...boundedResources(system, event?.target?.name, healthMaximum, Math.max(0,system.armor.max+this.document.system.armor.max-base.armor.max)) };

    return data;

  }

  static async toggleTraitEffect(event,target){
    if(!this.isEditable)return;
    await this.submit();
    const item=this.document.items.get(target.dataset.itemId);
    if(item?.type!=="trait")return;
    const effect=item.effects.get(target.dataset.effectId);
    if(effect){
      const enable=effect.disabled;
      await effect.update({disabled:!enable});
      if(enable&&!item.system.active)await item.update({'system.active':true});
    }
  }

  static async toggleTrait(event,target){
    if(!this.isEditable)return;await this.submit();const item=this.document.items.get(target.dataset.itemId);
    if(item?.type==='trait'){
      const effects=item.effects?.contents??[];
      const enabled=!effects.length||effects.some(effect=>!effect.disabled);
      const activate=!item.system.active||!enabled;
      if(activate&&effects.length&&!enabled)await effects[0].update({disabled:false});
      await item.update({'system.active':activate});
    }
  }
  static async autoSort(event,target){
    if(!this.isEditable)return;await this.submit();
    const items=this.document.items.contents.filter(i=>!target.dataset.itemType||i.type===target.dataset.itemType).toSorted((a,b)=>a.name.localeCompare(b.name));
    await this.document.updateEmbeddedDocuments('Item',items.map((item,index)=>({_id:item.id,sort:(index+1)*100000})));
  }
  static async addNew(event,target){
    if(!this.isEditable||this._creatingItem)return;
    const type=target.dataset.itemType;
    if(!CONFIG.Item.dataModels[type]||type==='gambit'&&this.document.type!=='npc')return;
    this._creatingItem=true;
    try{
      await this.submit();
      const data={name:`New ${game.i18n.localize(`TYPES.Item.${type}`)}`,type,img:defaultItemIcon(type),system:new CONFIG.Item.dataModels[type]().toObject()};
      const item=EQUIPMENT_TYPES.includes(type)
        ?await addEquipment(this.document,data,{allowOverage:true,equipLicense:false})
        :(await this.document.createEmbeddedDocuments('Item',[data]))[0];
      if(!item)throw new Error('The item could not be created. Please try again.');
      await item.sheet.render({force:true});
    }catch(error){ui.notifications.warn(error.message);}
    finally{this._creatingItem=false;}
  }

  static async setArmor(event,target) {
    if(!this.isEditable)return;await this.submit();
    const value=Number(target.dataset.armorValue),max=this.document.system.armor.max;
    if(!Number.isSafeInteger(value)||value<0||value>max)return;
    await this.document.update({'system.armor.value':value});
  }

  static async setHealth(event, target) {
    if (!this.isEditable) return;
    await this.submit();
    const max = this.document.system.health.max;
    const value = Number(target.dataset.healthValue);
    if (!Number.isSafeInteger(value) || value < 0 || value > max) return;
    await this.document.update({"system.health.value":value});
  }

  static async toggleLicense(event, target) {
    if (!this.isEditable) return;
    await this.submit();
    const item = this.document.items.get(target.dataset.itemId);
    if (item?.type !== "license") return;
    if (!item.system.equipped && !qualifiesForLicense(this.document.system, item.system)) {
      ui.notifications.warn(LICENSE_DENIED);
      return;
    }
    try{await changeEquipment(this.document,item.id,{}, {toggle:true});}catch(error){ui.notifications.warn(error.message);}
  }

  static async toggleEquipment(event, target) {
    if (!this.isEditable) return;
    await this.submit();
    try { await changeEquipment(this.document, target.dataset.itemId, {}, {toggle:true}); }
    catch (error) { ui.notifications.warn(error.message); }
  }

  static async removeEquipment(event, target) {
    if (!this.isEditable) return;
    await this.submit();
    try { const item=this.document.items.get(target.dataset.itemId);if(item&&!EQUIPMENT_TYPES.includes(item.type))await this.document.deleteEmbeddedDocuments('Item',[item.id]);else await changeEquipment(this.document, target.dataset.itemId, {}, {remove:true}); }
    catch (error) { ui.notifications.warn(error.message); }
  }

  static editItem(event, target) {
    this.document.items.get(target.dataset.itemId)?.sheet.render({ force: true });
  }
  static async choosePortrait() {
    if (!this.isEditable) return;
    const picker = new foundry.applications.apps.FilePicker.implementation({
      type: "image", current: this.document.img,
      callback: path => this.document.update({ img: path })
    });
    await picker.browse();
  }
  static async linkWanderer() {

    if (!game.user.isGM || this._linkingWanderer) return;

    const token = this.document.token;

    if (!token || token.actorLink || this.document.type !== "wanderer") return;

    this._linkingWanderer = true;

    try {

      const confirmed = await foundry.applications.api.DialogV2.confirm({

        window: { title: "Sync with sidebar" },

        content: "<p>Use this map Wanderer’s current data to update its existing sidebar entry and link them? This includes items and effects. Future changes will stay in sync.</p><p>The sidebar’s older data will be replaced. A recovery snapshot will be saved on the Scene. Other unlinked tokens will not be linked.</p>"

      });

      if (!confirmed) return;

      await this.submit();

      const actor = await preserveAndLinkWanderer(token);

      await this.close();

      actor.sheet.render({ force: true });

      ui.notifications.info("Wanderer synced with its sidebar entry.");

    } catch (error) {

      ui.notifications.error(error.message);

    } finally { this._linkingWanderer = false; }

  }

  static async rest() {
    if(!this.isEditable || this._resting) return;
    this._resting=true;
    try {
      const yes=await foundry.applications.api.DialogV2.confirm({window:{title:"Full Rest"},content:"<p>Would you like to perform a Full Rest?</p><p>One day and two meals: heal 1 Health, clear all burnt and installed Ardor, and reset your once-per-rest Bloodied Samadhi trigger. Conditions remain until cured.</p>",yes:{label:"Yes"},no:{label:"No"},rejectClose:false});
      if(!yes) return;
      await this.submit();
      await queueEquipment(this.document,async()=>{
      const rest=restChanges(this.document.toObject().system);
      rest.health.value=Math.min(this.document.system.health.max,this.document.system.health.value+1);
        const items=this.document.toObject().items.map(item=>isAbility(item)?{...item,system:{...item.system,paidArdor:0,equipped:false}}:item);
        if(!await this.document.update({system:rest,items}))throw new Error("Full Rest could not be saved.");
      });
      ui.notifications.info("Full Rest completed.");
    } finally {this._resting=false;}
  }
  static async refreshActions() {
    if(this.isEditable) await this.document.update({"system.actions":3});
  }
  static async spendAction(event,target) {
    if(!this.isEditable || this._spendingAction) return;
    this._spendingAction=true;
    try {
      await this.submit();
      assertAction(this.document,{interrupt:target.dataset.interrupt==="true"});
      const remaining=this.document.toObject().system.actions;
      if(remaining<1) throw new Error("You have no Actions remaining.");
      await this.document.update({"system.actions":remaining-1});
    } catch(error){ui.notifications.warn(error.message);} finally {this._spendingAction=false;}
  }

  static async endSamadhi() {
    if(this.isEditable) await this.document.update({"system.samadhi.active":false});
  }

  static async cast(event,target) { return useAbility.call(this,event,target); }

  static async defense() {
    if(!this.document.isOwner) return;
    await this.submit();
    const actor=this.document;
    if(healthSutra(actor.system.health).knockedOut) return ui.notifications.warn("You are Knocked Out and cannot defend.");
    const attacks=recentAttacks();
    const attackChoices=attacks.map(message=>`<option value="${message.id}">${escapeHTML(message.speaker?.alias??'Attacker')}: ${escapeHTML(message.getFlag("10kswordsfoundry","attack").name)} (${message.id.slice(-4)})</option>`).join('');
    const options={...CULTIVATIONS,vio:"Deflect (VIO)",grc:"Avoid (GRC)",sav:"Avoid (SAV)"};
    for(const weapon of wieldedWeapons(actor)) {
      const affinity=AFFINITIES[weapon.system.affinity?.trim().toLowerCase()];
      if(affinity) options[affinity]=`${CULTIVATIONS[affinity]} — weapon Affinity`;
    }
    const input=await foundry.applications.api.DialogV2.prompt({window:{title:"Defense"},content:`<label>Attack to defend against<select name="attackId"><option value="">Unlinked Defense</option>${attackChoices}</select></label><label>Method<select name="method"><option value="deflect">Deflect</option><option value="avoid">Avoid</option></select></label><label>Defense Cultivation<select name="cultivation">${Object.entries(options).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label><label>Miscellaneous bonus / penalty (Fashion, Traits, etc.)<input name="adjustment" type="number" step="1" value="0"></label><label><input type="checkbox" name="full"> Full Defense (+2)</label><label><input type="checkbox" name="feinted"> Feinted (-2)</label><p>Linked Magicks automatically use their recorded defending pool. Apply Full Defense and Feint only to the next eligible Defense. Unblockable attacks cannot be deflected; Undodgeable attacks cannot be avoided.</p>`,ok:{label:"Defend",callback:(event,button)=>({attackId:button.form.elements.attackId.value,method:button.form.elements.method.value,key:button.form.elements.cultivation.value,adjustment:Number(button.form.elements.adjustment.value),full:button.form.elements.full.checked,feinted:button.form.elements.feinted.checked})},rejectClose:false});
    if(!input) return;
    try {
      if(!Object.hasOwn(options,input.key)||!Number.isSafeInteger(input.adjustment)) throw new Error("Choose a Defense Cultivation and whole-number adjustments.");
      const linked=input.attackId ? attacks.find(message=>message.id===input.attackId) : null;
      if(input.attackId && (!linked || !linked.visible || !linked.isContentVisible)) throw new Error("That attack is no longer available.");
      const attack=linked?.getFlag("10kswordsfoundry","attack");
      if(attack?.profile.keys?.includes(input.method==='avoid'?'undodgeable':'unblockable')) throw new Error(`This attack cannot be ${input.method==='avoid'?'avoided':'deflected'}.`);
      const affinityKeys=wieldedWeapons(actor).map(w=>AFFINITIES[w.system.affinity?.trim().toLowerCase()]);
      if(attack?.defensePool)input.key=attack.defensePool;
      if(!attack?.defensePool && input.method && !(input.method==='deflect'?['vio']:['grc','sav']).includes(input.key) && !affinityKeys.includes(input.key)) throw new Error("Choose a Cultivation appropriate to this Defense method, or a wielded weapon Affinity.");
      const injury=healthSutra(actor.system.health);
      if(injury.knockedOut) throw new Error("You are Knocked Out and cannot defend.");
      const shield=attack?.defensePool?0:tagBonus(actor,"shield");
      const pool=actor.system.cultivations[input.key]+injury.penalty+(actor.system.checkBonus??0)+(actor.system.defenseBonus??0)+shield+(inSamadhi(actor)?3:0)+input.adjustment+(input.full?2:0)-(input.feinted?2:0);
      if(pool>1000) throw new Error("Please use a pool of 1,000 dice or fewer.");
      const roll=await new foundry.dice.Roll(checkFormula(pool)).evaluate();
      const results=roll.dice.flatMap(d=>d.results.filter(r=>r.active!==false&&!r.discarded).map(r=>r.result));
      const summary=summarizeCheck(results,1);
      let samadhi='';
      try {samadhi=await enterSamadhi(actor,summary.sixes);}catch(error){ui.notifications.warn(error.message);}
      const resolved=attack ? resolveDefense(attack,results,actor.system.armor?.value??0,actor.system.conditions) : null;
      const conditions=inflictedConditions(attack,resolved);
      const resolution=resolved ? `<fieldset><legend>Against ${escapeHTML(attack.name)}</legend><dl><dt>Uncancelled Strikes</dt><dd>${resolved.strikes}</dd><dt>${escapeHTML(attack.profile.damage)} Wounds</dt><dd>${resolved.wounds}</dd><dt>Armor loss</dt><dd>${resolved.armorLoss}</dd><dt>Health loss</dt><dd><strong>${resolved.healthLoss}</strong></dd></dl>${actor.system.conditions?.lacerating?'<p>Lacerating: +1 Wound if any Strikes get through.</p>':''}<p>Damage calculated only. Apply Armor and Health losses after confirming the result.</p>${conditions.length?`<p>Mod conditions: ${conditions.map(escapeHTML).join(', ')}</p><button type="button" data-apply-mod-conditions>Apply mod conditions</button>`:''}</fieldset>` : '<p>Unlinked Defense — no damage calculation.</p>';
      await roll.toMessage({flags:linked?{"10kswordsfoundry":{defense:{attackId:linked.id,actorUuid:actor.uuid,...resolved,conditions}}}:{},speaker:foundry.documents.ChatMessage.getSpeaker({actor}),flavor:`<section class="swords-defense"><h3>Defense · ${CULTIVATIONS[input.key]}</h3><div class="defense-totals"><strong>${summary.strikes} total Defenses</strong><span>${summary.strikes-summary.sixes} ordinary (4–5)</span><strong class="swords-sixes">${summary.sixes} Perfect (6)</strong></div><p>Pool ${pool} · Shield +${shield} · Miscellaneous ${input.adjustment>=0?'+':''}${input.adjustment}</p>${resolution}<details><summary>How cancellation works</summary><p>Each Defense cancels one ordinary Strike. Only Perfect Defenses cancel Critical Strikes; unused Perfect Defenses cancel ordinary Strikes.</p></details>${samadhi}</section>`},{messageMode:game.settings.get("core","messageMode")});
    } catch(error) {ui.notifications.warn(error.message);}
  }

  static async attack(event, target) {
    const weapon=this.document.items.get(target.dataset.itemId);
    if(weapon?.type !== "weapon" || !weapon.system.equipped) return ui.notifications.warn("Equip this weapon before attacking.");
    try {assertAction(this.document,{attack:true});} catch(error){return ui.notifications.warn(error.message);}
    return SwordsActorSheet.rollCheck.call(this,event,{dataset:{cultivation:attackCultivation(weapon.system),weaponId:weapon.id}});
  }

  static async rollCheck(event, target) {

    if (!this.document.isOwner) return;

    const key = target.dataset.cultivation;

    if (!Object.hasOwn(CULTIVATIONS, key)) return;

    await this.submit();

    if (healthSutra(this.document.system.health).knockedOut) return ui.notifications.warn("You are Knocked Out and cannot make a check.");
    const selectedWeapon = target.dataset.weaponId ? this.document.items.get(target.dataset.weaponId) : null;
    const isAttack = !!selectedWeapon;
    const casting=target.dataset.magickId ? this.document.items.get(target.dataset.magickId) : null;
    const escape = value => String(value).replace(/[&<>"']/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);
    const ammoOptions=(this.document.items?.contents??[]).filter(item=>item.type==='ammunition').map(item=>`<option value="${escape(item.id)}">${escape(item.name)} (${item.system.quantity})</option>`).join("");
    const checkbox=(name,label,checked=false)=>`<label class="attack-option"><input type="checkbox" name="${name}" ${checked?'checked':''}> ${label}</label>`;
    const adjustments='<label>Miscellaneous bonus / penalty (Fashion, Traits, etc.)<input name="adjustment" type="number" value="0" step="1" required></label>';
    const attackFields=isAttack ? `<p class="attack-summary"><strong>${escape(selectedWeapon.name)}</strong><br>${CULTIVATIONS[attackCultivation(selectedWeapon.system)]} · Range ${modifierProfile(selectedWeapon.system).range} m<br><small>Weapon bonuses and injury penalties are included automatically.</small></p>
      <fieldset class="attack-group"><legend>Bonuses &amp; penalties</legend>${adjustments}<p class="attack-hint">Add bonuses from Fashion, Traits, and other circumstances here. Bonuses already supplied by Active Effects are included automatically.</p></fieldset>
      <fieldset class="attack-group"><legend>Targeting</legend><div class="attack-fields">
        <label>Number of targets<input name="targets" type="number" min="1" step="1" value="1"></label>
        <label>Called shot<select name="called"><option value="0">None</option><option value="-1">Targeted (-1)</option><option value="-3">Smaller than a hand (-3)</option><option value="-6">Eye or smaller (-6)</option></select></label>
      </div><div class="attack-options">${checkbox('area','Area pattern — no Cleave penalty')}${checkbox('cover','Behind cover (-2)')}${checkbox('concealed','Concealed (-2)')}</div></fieldset>
      <fieldset class="attack-group"><legend>Position &amp; range</legend><div class="attack-fields">
        <label>Distance (m, optional)<input name="distance" type="number" min="0" step="any"></label>
        <label>Elevation difference (m)<input name="height" type="number" step="any" value="0"></label>
        <label>Adjacent allies (+1 each)<input name="allies" type="number" min="0" step="1" value="0"></label>
      </div><div class="attack-options">${checkbox('highGround','At least 1 m above target (+1)')}${checkbox('ultragravity','In Ultragravity (-2)')}${selectedWeapon.system.weaponType==='ranged'?checkbox('rangePenalty','Beyond range or within 1 m (-2)',true):''}</div></fieldset>
      <fieldset class="attack-group"><legend>Attack tactics</legend><div class="attack-options">
        ${checkbox('surprise','Surprise attack (+3)')}${checkbox('sabotaged','Attack sabotaged (-2)')}${checkbox('dual','Dual attack (-3)')}
      </div><p class="attack-hint">For Dual Attack, roll each weapon and keep the better result.</p></fieldset>
      <fieldset class="attack-group"><legend>Weapon effects &amp; adjustments</legend><div class="attack-fields">
        <label>Ammo<select name="ammoId"><option value="">Use weapon selection</option>${ammoOptions}</select></label>
      </div><div class="attack-options">${checkbox('unarmored','No Armor — Visceral')}${checkbox('holyTarget','Spirit, Demon, or similar — Holy')}</div></fieldset>
      <p class="attack-hint">Roll once against each target’s Defense. Spend one tracked ammo per target.</p>` : '';
    const input = await foundry.applications.api.DialogV2.prompt({
      ...(isAttack ? {classes:["swords-attack-dialog"],position:{width:640,height:680},window:{resizable:true}} : {}),
      window: { resizable:isAttack, title: isAttack ? `${selectedWeapon.name}: Attack` : casting ? `${casting.name}: Cast` : `${CULTIVATIONS[key]} Check` },
      content: isAttack ? attackFields : (casting ? `<label><input name="hostile" type="checkbox" checked> Hostile Magick</label><label>Magick Cultivation<select name="castCultivation">${Object.entries(CULTIVATIONS).map(([k,label])=>`<option value="${k}" ${k==='spi'?'selected':''}>${label}</option>`).join('')}</select></label>` : '') + adjustments + '<label><input name="ritual" type="checkbox"> Ritual / prayer (weapon tag bonus)</label><label><input name="disarm" type="checkbox"> Disarm attempt (weapon tag bonus)</label><label>Demand<input name="demand" type="number" value="2" min="1" step="1" required></label>',
      ok: {label:"Roll", callback:(event,button)=>{
        const fields=button.form.elements;
        const value=name=>fields.namedItem(name)?.value;
        const checked=name=>fields.namedItem(name)?.checked??false;
        return {hostile:checked('hostile'),castCultivation:value('castCultivation'),ritual:checked('ritual'),disarm:checked('disarm'),adjustment:Number(value('adjustment')),demand:isAttack?1:Number(value('demand')),
          targets:Number(value('targets')??1),allies:Number(value('allies')??0),distance:value('distance'),height:value('height'),called:Number(value('called')??0),
          ...Object.fromEntries(['dual','area','cover','concealed','surprise','highGround','ultragravity','sabotaged','rangePenalty','unarmored','holyTarget'].map(name=>[name,checked(name)])),ammoId:value('ammoId')??''};
      }}, rejectClose:false
    });

    if (!input) return;
    input.attack=isAttack;
    input.weaponId=selectedWeapon?.id ?? "";
    input.demand=isAttack?1:input.demand;
    input.ammoSpent=input.targets??1;

    if (!Number.isSafeInteger(input.adjustment) || !Number.isSafeInteger(input.demand) || input.demand < 1) {

      return ui.notifications.warn("Adjustments must be an integer and Demand must be a positive integer.");

    }

    const performRoll = async (weapon=null,ammo=null) => {
    if(weapon) assertAction(this.document,{attack:true});
    if(target.dataset.magickId) {
      const magick=this.document.items.get(target.dataset.magickId);
      if(magick?.type!=="magick" || !magick.system.equipped) throw new Error("Equip this Magick before casting.");
      assertAction(this.document,{cast:true});
      assertAction(this.document,{cast:true,hostile:input.hostile});
      requireFreeHand(this.document);
    }
    const profile=weapon ? modifierProfile(weapon.system,{unarmored:input.unarmored,holyTarget:input.holyTarget,ammo}) : null;
    const rollKey=input.attack&&weapon ? attackCultivation(weapon.system) : casting ? (input.castCultivation??"spi") : key;
    if(!Object.hasOwn(CULTIVATIONS,rollKey)) throw new Error("Choose a valid Cultivation.");
    const combat=weapon ? combatModifiers(weapon.system,input) : {bonus:0,parts:[]};
    let weaponBonus;
    try { weaponBonus = attackBonus(this.document.items?.contents ?? [], input.attack, input.weaponId); }
    catch (error) { throw error; }
    const conditional=profile ? profile.attack-modifierProfile(weapon.system).attack : 0;
    weaponBonus+=conditional;
    const actionCost=weapon ? profile.actions : target.dataset.magickId ? 1 : 0;
    if(actionCost && (this.document.system.actions??3)<actionCost) throw new Error(`You need ${actionCost} Action(s) for this action.`);
    const sutra = healthSutra(this.document.system.health);
    if (sutra.knockedOut) throw new Error("You are Knocked Out and cannot make a check.");
    const situationalTags=(input.ritual?tagBonus(this.document,"ritual"):0)+(input.disarm?tagBonus(this.document,"disarming"):0);
    const pool = (inSamadhi(this.document)?3:0) + situationalTags + combat.bonus + sutra.penalty + this.document.system.cultivations[rollKey] + input.adjustment + weaponBonus + (this.document.system.checkBonus??0) + (input.attack?(this.document.system.attackBonus??0):0);

    if (input.adjustment < 0) {

      ui.notifications.warn(pool <= 0

        ? "Your adjustment brings the pool to zero or below. Rolling two dice and keeping the lower one."

        : "Negative adjustment applied. Your roll will continue with fewer dice.");

    }

    // UI safety limit, not a game rule. Prevent accidental extremely large rolls.

    if (pool > 1000) throw new Error("Please use a pool of 1,000 dice or fewer.");

    let formula=checkFormula(pool);
    if(profile?.precise) formula=pool<=0?'2d6r1kl1cs>=4':`${pool}d6r1cs>=4`;
    const roll = await new foundry.dice.Roll(formula).evaluate();

    const results = roll.dice.flatMap(die => die.results.filter(r => r.active !== false && !r.discarded).map(r => r.result));

    const result = summarizeCheck(results, input.demand);

    let modifierText=combat.parts.length ? `<p>${combat.parts.map(part=>`${part.label}: ${part.value>0?'+':''}${part.value}`).join('; ')}.</p>` : '';
    if(input.dual) modifierText+='<p>Dual attack: roll the other weapon with Dual attack selected, then keep the better result. Do not combine the two results.</p>';
    if(profile) {
      const potential=result.strikes+results.filter(value=>value===6).length*profile.criticalExtra+results.filter(value=>value>=5).length*profile.fivePlusExtra;
      modifierText+=`<p>Before Defense: ${potential} potential ${profile.damage.toUpperCase()} Wounds. ${profile.ignoresArmor?'Ignores Armor.':`Armor loss: ${profile.armorPerWound} per Wound.`} Range: ${profile.range} m. Actions: ${profile.actions}.</p>`;
      modifierText+=profile.reminders.map(text=>`<p>${escape(text)}</p>`).join('');
      if(ammo) modifierText+=`<p>Ammo: ${escape(ammo.item.name)}. ${escape(ammo.note??'')}</p>`;
    }
    let samadhiNotice='';
    try {samadhiNotice=await enterSamadhi(this.document,result.sixes);}catch(error){ui.notifications.warn(error.message);}
    modifierText+=`<p>${sixesHTML(result.sixes)}${situationalTags?`; weapon task bonus: +${situationalTags}`:''}</p>${samadhiNotice}`;
    if(target.dataset.magickId) modifierText+=`<p>${escape(casting.name)}: casting check. Resolve its listed costs and effects separately.</p>`;
    const animation=animationContext(this.document);
    const animationMessage=await roll.toMessage({

      flags:weapon?{"10kswordsfoundry":{animationHandled:true,attack:{name:weapon.name,results,profile,actorUuid:this.document.uuid}}}:{},
      speaker: foundry.documents.ChatMessage.getSpeaker({ actor: this.document }),

      flavor: `${input.attack ? `${escape(weapon.name)} — ${CULTIVATIONS[rollKey]} Attack: ${result.strikes} total Strikes (${result.strikes-result.sixes} ordinary; ${result.sixes} Perfect Strikes). Weapon bonus: ${weaponBonus}. Miscellaneous: ${input.adjustment>=0?'+':''}${input.adjustment}. Roll once; resolve Defense separately for ${combat.targets} target(s).` : `${CULTIVATIONS[rollKey]}: ${result.strikes} Strikes / Demand ${input.demand} - ${result.success ? "Success" : "Failure"}. Sixes: ${result.sixes}.`} Adjusted pool: ${pool}.${sutra.penalty ? ` ${sutra.status}: ${sutra.penalty} dice.` : ""} ${pool <= 0 ? `Fallback: roll 2d6 and keep the lower die (${formula}). Only the kept die counts.` : `Roll: ${formula}.`}${modifierText}`

    }, { messageMode: game.settings.get("core", "messageMode") });
    if(weapon)void playItemAnimation(animation,weapon,animationMessage);
    if(actionCost) {
      try {await this.document.update({"system.actions":Math.max(0,(this.document.toObject().system.actions??3)-actionCost)});}
      catch(error) {ui.notifications.warn("Roll completed, but Actions could not be saved. Adjust Actions manually.");}
    }
    };
    try {
      if (input.attack && input.weaponId) await useWeapon(this.document, input.weaponId, performRoll,input.ammoId??"",input.ammoSpent??1);
      else await performRoll();
    } catch (error) { ui.notifications.warn(error.message); }

  }

}

export class SwordsItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  static DEFAULT_OPTIONS = {

    classes: ["swords", "item-sheet"], position: { width: 540, height: 680 },
    actions: {removeGrant:SwordsItemSheet.removeGrant,addSpecialAttack:SwordsItemSheet.addSpecialAttack,removeSpecialAttack:SwordsItemSheet.removeSpecialAttack,sheetPanel,openCompendium,removeMod:SwordsItemSheet.removeMod,createEffect,editEffect,toggleEffect,removeEffect},

    form: { submitOnChange: true, closeOnSubmit: false }

  };

  static PARTS = { main: { template: "systems/10kswordsfoundry/templates/item.hbs" } };

  async _onRender(context, options) {
    await super._onRender(context, options);
    activatePanel(this,this._swordsPanel??"overview");
    this._previewController?.abort();
    this._previewController = new AbortController();
    this.element.addEventListener("input", () => this._refreshWeaponPreview(), {signal:this._previewController.signal});
    this.element.addEventListener("change", () => this._refreshWeaponPreview(), {signal:this._previewController.signal});
  }

  _refreshWeaponPreview() {
    if (this.document.type !== "weapon" || !this.form) return;
    const source = this.document.toObject().system;
    const system = {...source, properties:{...source.properties}};
    for (const key of ["range", "bonus", "damageType", "upgrade", "affinity"]) {
      const input = this.form.elements.namedItem(`system.${key}`);
      if (input && input.value !== "") system[key] = ["range","bonus"].includes(key) ? Number(input.value) : input.value;
    }
    for (const key of Object.keys(MODIFIER_CHOICES)) {
      const input = this.form.elements.namedItem(`system.properties.${key}`);
      if (input) system.properties[key] = input.checked;
    }
    const profile = modifierProfile(system), details = weaponDetails(system);
    const set = (key, text) => { const node=this.element.querySelector(`[data-preview="${key}"]`); if(node) node.textContent=text; };
    set("profile", `Range ${profile.range} m; ${profile.hands} hand(s); ${profile.actions} action(s); ${profile.damage}.`);
    set("attack", `Total attack bonus: +${details.attack} · DR: ${details.dr}`);
    set("upgrade", details.description);
  }

  async _onDropDocument(event, document) {
    if(this.document.type==='job'){
      if(!this.isEditable||!event.target.closest?.('[data-job-grants]'))return null;
      const zone=event.target.closest('[data-job-grants]');if(zone.dataset.grantType&&document.type!==zone.dataset.grantType){ui.notifications.warn('Drop the matching item type in this slot.');return null;}
      try{await this.submit();const grant=grantSnapshot(document);await this._saveJobGrants([...(this.document.system.grants??[]),grant]);return document;}catch(error){ui.notifications.warn(error.message);return null;}
    }
    if (this.document.type !== "weapon") return super._onDropDocument(event, document);
    if (!this.isEditable) return null;
    const slot = event.target.closest?.("[data-mod-slot]");
    if (!slot) return null;
    await this.submit();
    try {
      const mods = installMod(this.document.system, document, Number(slot.dataset.modSlot));
      await this._saveWeapon({system:{mods}});
      return document;
    } catch (error) { ui.notifications.warn(error.message); return null; }
  }

  async _saveWeapon(changes) {
    if (!this.isEditable) return;
    const next = foundry.utils.mergeObject(this.document.toObject(), changes, {inplace:false});
    validateWeapon(next.system);
    if (this.document.parent?.documentName === "Actor") return changeEquipment(this.document.parent, this.document.id, changes);
    return this.document.update(changes);
  }

  static async removeMod(event, target) {
    if (!this.isEditable) return;
    await this.submit();
    const slot = Number(target.dataset.modSlot);
    try { await this._saveWeapon({system:{mods:this.document.system.mods.filter(mod=>mod.slot !== slot)}}); }
    catch (error) { ui.notifications.warn(error.message); }
  }

  async _saveJobGrants(grants){
    const data=this.document.toObject();data.system.grants=structuredClone(grants);
    if(this.document.parent?.documentName==='Actor')return applyJobToActor(this.document.parent,data);
    return this.document.update({'system.grants':data.system.grants});
  }

  static async removeGrant(event,target){
    if(!this.isEditable)return;await this.submit();
    try{await this._saveJobGrants(this.document.system.grants.filter(grant=>grant.id!==target.dataset.grantId));}catch(error){ui.notifications.warn(error.message);}
  }

  _processFormData(event,form,formData) {
    const data=super._processFormData(event,form,formData);
    if(data.system?.specialAttacks&&!Array.isArray(data.system.specialAttacks))data.system.specialAttacks=Object.keys(data.system.specialAttacks).sort((a,b)=>Number(a)-Number(b)).map(key=>data.system.specialAttacks[key]);
    return data;
  }

  static async addSpecialAttack() {
    if(!this.isEditable||!['fashion','technique','weapon'].includes(this.document.type))return;
    await this.submit();
    await this.document.update({'system.specialAttacks':[...this.document.system.specialAttacks,{name:'Special Ability',mode:'attack',hostile:true,effectKey:'',effectValue:0,apCost:1,burnArdor:0,installArdor:0,bonus:0,attackPool:'vio',defensePool:'grc',damageType:'impact',description:''}]});
  }
  static async removeSpecialAttack(event,target) {
    if(!this.isEditable)return;await this.submit();
    await this.document.update({'system.specialAttacks':this.document.system.specialAttacks.filter((_,i)=>i!==Number(target.dataset.index))});
  }

  async _processSubmitData(event, form, submitData, options = {}) {
    if (this.document.type === "weapon") {
      try { const updated=await this._saveWeapon(submitData); await this.render({force:true}); return {updated}; }
      catch (error) { ui.notifications.warn(error.message); this.render({force:true}); return {updated:false}; }
    }
    if (EQUIPMENT_TYPES.includes(this.document.type) && this.document.parent?.documentName === "Actor") {
      try { return {updated: await changeEquipment(this.document.parent, this.document.id, submitData)}; }
      catch (error) { ui.notifications.warn(error.message); this.render({force:true}); return {updated:false}; }
    }
    if (this.document.type !== "job" || this.document.parent?.documentName !== "Actor") {
      return super._processSubmitData(event, form, submitData, options);
    }
    const data = foundry.utils.mergeObject(this.document.toObject(), submitData, {inplace: false});
    return {updated: await applyJobToActor(this.document.parent, data)};
  }

  async _prepareContext(options) {

    const system = this.document.toObject?.().system ?? this.document.system;
    return Object.assign(await super._prepareContext(options), {
      abilityModes:{attack:'Attack',check:'Check',automatic:'Automatic (no roll)'},targetEffectChoices:{'':'None','system.attackBonus':'Attack dice','system.defenseBonus':'Defense dice','system.checkBonus':'All check dice','system.movement':'Movement'},
      weaponRequirements:WEAPON_REQUIREMENTS,hasSpecialAttacks:['fashion','technique','weapon'].includes(this.document.type),specialAttacks:this.document.system.specialAttacks??[],damageChoices:{cut:'Cut',impact:'Impact',burn:'Burn',trauma:'Trauma',ruination:'Ruination'},
      item: this.document, system:this.document.type==='license'?{...system,...licenseIdentity(system)}:system, rankChoices:RANKS,areaChoices:AREA_SHAPES, poolChoices:CULTIVATIONS, isConsumableGear:this.document.type==='gear',isGear:['gear','salvage'].includes(this.document.type),isGambit:this.document.type==='gambit',isTrait:this.document.type==='trait',showRarity:!['trait','job','technique','magick','license','gambit'].includes(this.document.type),isAbility:['magick','technique'].includes(this.document.type),isMagick:this.document.type==='magick', rarityChoices:RARITIES,
      descriptionEditor:foundry.utils.cleanHTML(editorValue(system.description)), descriptionHTML:await enriched(system.description,this.document), effects:effectRows(this.document),
      gearSlotChoices:this.document.type==='weapon'?{carry:'Auto hand',right:'Right Hand',left:'Left Hand',both:'Both Hands'}:{carry:'Carry',right:'Right Hand',left:'Left Hand',both:'Both Hands',fashion:'Fashion'},
      showGearSlot:['weapon','gear','armor'].includes(this.document.type),
      isAmmo:this.document.type==='ammunition',ammoChoices:AMMO_CHOICES,ammoFamilies:AMMO_FAMILIES,
      ammoSources:Object.fromEntries([['','Legacy ammo / no stack'],...(this.document.parent?.items?.contents??[]).filter(item=>item.type==='ammunition').map(item=>[item.id,`${item.name} (${item.system.quantity})`])]),
      weaponTypeChoices:{melee:"Melee (VIO)",ranged:"Ranged (GRC)"},
      damageChoices:{cut:"Cut",impact:"Impact",burn:"Burn",trauma:"Trauma",ruination:"Ruination"},
      modifierChoices:{'':'Custom / match name',...MODIFIER_CHOICES},
      inherentModifiers:Object.entries(MODIFIER_CHOICES).map(([key,label])=>({key,label,checked:system.properties?.[key]??false})),
      profile:this.document.type==='weapon'?modifierProfile(system):null, isJob: this.document.type === "job", isLicense: this.document.type === "license",
      licenseChoices: LICENSE_CHOICES,
      isFashion: this.document.type === "fashion",
      isWeapon: this.document.type === "weapon",
      isWeaponMod: this.document.type === "weaponMod",
      affinityChoices:Object.fromEntries([["","None"], ...Object.keys(AFFINITIES).map(key=>[key[0].toUpperCase()+key.slice(1),key[0].toUpperCase()+key.slice(1)]), ...(system.affinity ? [[system.affinity,system.affinity]] : [])]),
      upgradeChoices:UPGRADE_CHOICES,
      weaponDetails:this.document.type === "weapon" ? weaponDetails(system) : null,
      modSlots:this.document.type === "weapon" ? await Promise.all(Array.from({length:weaponDetails(system).modCapacity},async(_,slot)=>{
        const mod=system.mods.find(mod=>mod.slot===slot);
        return {slot,number:slot+1,mod:mod?{...mod,html:await enriched(mod.description,this.document)}:null};
      })) : [],
      usesMeridians:this.document.type==="license",
      prerequisites: Object.entries(CULTIVATIONS).map(([key,label]) => ({key,label,value:system.prerequisites?.[key] ?? 0})),
      jobGrantGroups:await Promise.all(Object.entries({weapon:'Weapons',gear:'Gear',fashion:'Fashion',trait:'Traits',other:'Other starting items'}).map(async([type,label])=>({type:type==='other'?'':type,label,items:await Promise.all((system.grants??[]).filter(g=>type==='other'?!['weapon','gear','fashion','trait'].includes(g.type):g.type===type).map(async grant=>({...grant,tooltip:await enriched(grant.system?.description??'',this.document)})))}))),
      jobGrants:await Promise.all((system.grants??[]).map(async grant=>({...grant,tooltip:await enriched(grant.system?.description??'',this.document)}))),
      jobCategories: {body: "Job of the Body", mind: "Job of the Mind"},
      cultivations: Object.entries(CULTIVATIONS).map(([key, label]) => ({key, label, value: system.cultivations?.[key]}))
    });

  }

}

import { queueEquipment, changeEquipment, EQUIPMENT_TYPES, attackBonus, useWeapon, addEquipment } from "./equipment.mjs?v=0.1.51";

