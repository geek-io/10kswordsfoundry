import { EQUIPMENT_TYPES } from "./equipment.mjs?v=0.1.51";
export function equipmentEffectSuppressed(item) {
  if(item.type==='trait')return item.system.active===false;
  return EQUIPMENT_TYPES.includes(item.type) && !item.system.equipped;
}
export async function createEffect() {
  if(!this.isEditable) return;
  const [effect]=await this.document.createEmbeddedDocuments("ActiveEffect",[{name:"New Effect",transfer:this.document.documentName==='Item',system:{changes:[]}}]);
  if(effect) await configureEffect(effect);
}
export function ownedEffect(document,target) {
  const {effectId,effectItemId}=target.dataset;
  if(effectItemId){
    const effect=document.items?.get(effectItemId)?.effects.get(effectId);
    return effect?.transfer?effect:null;
  }
  return document.effects.get(effectId);
}
export async function editEffect(event,target) { const effect=ownedEffect(this.document,target); if(effect) await configureEffect(effect); }
export async function toggleEffect(event,target) {
  if(!this.isEditable) return;
  const effect=ownedEffect(this.document,target);
  if(effect) await effect.update({disabled:!effect.disabled});
}
export async function removeEffect(event,target) {
  if(!this.isEditable) return;
  await ownedEffect(this.document,target)?.delete();
}
export function effectRows(document) {
  const row=(effect,item=null)=>({id:effect.id,itemId:item?.id??'',name:effect.name,
    source:item?item.name:document.documentName==='Actor'?'Character':'This item',
    disabled:effect.disabled,suppressed:effect.isSuppressed,
    status:effect.disabled?'Disabled':effect.isSuppressed?'Suppressed':effect.active===false?'Inactive':'Active',
    changes:(effect.system?.changes??[]).map(change=>`${EFFECT_VARIABLES[change.key]??change.key} · ${change.type} · ${change.value}`).join('; ')});
  const rows=(document.effects?.contents??[]).map(effect=>row(effect));
  if(document.documentName==='Actor')for(const item of document.items?.contents??[]){
    for(const effect of item.effects?.contents??[])if(effect.transfer)rows.push(row(effect,item));
  }
  return rows;
}

export const EFFECT_VARIABLES={
 "system.magickAreaBonus":"Magick area size bonus (m)",
 "system.cultivations.vio":"Violence (VIO)","system.cultivations.dia":"Dialectics (DIA)","system.cultivations.grc":"Grace (GRC)","system.cultivations.sav":"Savvy (SAV)","system.cultivations.wrd":"Word (WRD)","system.cultivations.spi":"Spirit (SPI)",
 "system.health.max":"Maximum Health","system.armor.max":"Maximum Armor","system.ardor.max":"Maximum Ardor","system.movement":"Movement","system.checkBonus":"All checks bonus","system.attackBonus":"Attack bonus","system.defenseBonus":"Defense bonus","system.meridians":"Open Meridians","system.carry":"Carry capacity","system.sidhi":"Sidhi Stage"
};
export async function configureEffect(effect) { return effect.sheet.render({force:true}); }
// Enhance the native editor instead of introducing another configuration window.
export function effectVariableOptions(current='') {
 return {'':'Choose a variable',...EFFECT_VARIABLES,...(current&&!EFFECT_VARIABLES[current]?{[current]:current}:{})};
}
export function registerEffectDropdowns() {
 Hooks.on('renderActiveEffectConfig',(app,html)=>{
  const root=html?.querySelectorAll?html:html?.[0];if(!root)return;
  for(const input of root.querySelectorAll('input[name^="system.changes."][name$=".key"]')) {
   const select=document.createElement('select');select.name=input.name;select.disabled=input.disabled;
   select.className=input.className;select.id=input.id;select.setAttribute('aria-label','Effect variable');
   for(const [value,label] of Object.entries(effectVariableOptions(input.value)))select.add(new Option(label,value,false,value===input.value));
   input.replaceWith(select);
  }
  if(!root.querySelector('.swords-effect-value-help')){
   const hint=document.createElement('p');hint.className='swords-effect-value-help';hint.textContent='Values can use System.Level (or @system.level) from this effect’s Item. Example: Word → Add → System.Level. Use @actor.system.movement for the character’s base Movement. Arithmetic such as 2 * System.Level is supported.';
   const field=root.querySelector('[name^="system.changes."][name$=".value"]');field?.closest('fieldset,section,.tab')?.append(hint);
  }
 });
}
