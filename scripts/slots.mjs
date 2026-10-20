import { modifierProfile } from "./modifiers.mjs?v=0.1.45";
const PHYSICAL=['weapon','fashion','gear','accessory','ammunition','armor','salvage'];
export function occupiedSlots(item) {
  if (!item?.system?.equipped || ["magick","technique","license"].includes(item.type)) return [];
  if (item.type==='fashion') return ['fashion'];
  if (item.type==='accessory'||item.type==='ammunition') return [];
  let slot=item.system.gearSlot??'carry';
  if(item.type==='weapon' && slot!=='carry' && modifierProfile(item.system).hands===2) slot='both';
  return slot==='both'?['left','right']:['left','right','fashion'].includes(slot)?[slot]:[];
}
export function assignSlot(next,items,id) {
  if(!next.system.equipped) return;
  if(next.type==='weapon' && next.system.gearSlot==='fashion') throw new Error('Weapons must use a hand slot.');
  if(next.type==='weapon' && modifierProfile(next.system).hands===2) next.system.gearSlot='both';
  if(next.type==='weapon' && ['carry',undefined].includes(next.system.gearSlot)) {
    const occupied=new Set(items.filter(item=>item._id!==id).flatMap(occupiedSlots));
    next.system.gearSlot=modifierProfile(next.system).hands===2?'both':!occupied.has('right')?'right':'left';
  }
  const wanted=occupiedSlots(next);
  const conflicts=items.filter(item=>item._id!==id && occupiedSlots(item).some(slot=>wanted.includes(slot)));
  if(conflicts.length) throw new Error(`Unequip ${conflicts.map(item=>item.name??'the other item').join(', ')} first; that Gear Slot is occupied.`);
}
export function itemCosts(item) {
  if(!item) return {meridians:0,carry:0};
  const {type,system:s}=item;
  const meridians=type==='license'&&s.equipped ? s.meridianCost??1 : 0;
  let carry=0;
  if(PHYSICAL.includes(type)) {
    const carried=Math.max(0,(s.quantity??1)-(occupiedSlots(item).length?1:0));
    carry=type==='ammunition' ? (s.quantity>0?1:0) : (s.slots??1)*carried;
  }
  if(!Number.isSafeInteger(meridians)||meridians<0||!Number.isSafeInteger(carry)||carry<0) throw new Error('Equipment costs must be nonnegative whole numbers.');
  return {meridians,carry};
}
export function slotSummary(items) {
  return ['right','left','fashion'].map(slot=>({slot,label:{right:'Right Hand',left:'Left Hand',fashion:'Fashion'}[slot],names:items.filter(item=>occupiedSlots(item).includes(slot)).map(item=>item.name).join(', ')||'Empty'}));
}
