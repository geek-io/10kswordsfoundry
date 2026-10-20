import {occupiedSlots} from "./slots.mjs?v=0.1.45";
import {modifierKeys} from "./modifiers.mjs?v=0.1.45";
export const sixesHTML = count => `<strong class="swords-sixes">Sixes: ${count}</strong>`;
export function requireFreeHand(actor) {
  const occupied=new Set(actor.items.contents.flatMap(occupiedSlots));
  if(occupied.has("left") && occupied.has("right")) throw new Error("You need at least one free hand to cast Magick. Unequip an item first.");
}
export function wieldedWeapons(actor) {
  return (actor.items?.contents??[]).filter(item=>item.type==="weapon" && occupiedSlots(item).some(slot=>["left","right"].includes(slot)));
}
export function tagBonus(actor,tag) {
  const weapons=wieldedWeapons(actor).filter(item=>modifierKeys(item.system).has(tag));
  return tag==="shield" ? weapons.length : weapons.length ? (tag==="disarming"?2:1) : 0;
}
export function inSamadhi(actor) {
  const s=actor.system.samadhi;
  if(!s?.active) return false;
  if(s.combatId) return game.combat?.id===s.combatId && (game.combat.round??0)<=s.round+1;
  return (game.time?.worldTime??0)<s.until;
}
const pending=new WeakMap();
export async function enterSamadhi(actor,sixes) {
  if(sixes<3) return "";
  const task=(pending.get(actor)??Promise.resolve()).catch(()=>{}).then(async()=>{
    if(inSamadhi(actor)) return "";
    const source=actor.toObject().system;
    const burnt=source.ardor.burnt;
    const combat=game.combat?.started ? game.combat : null;
    const updated=await actor.update({"system.samadhi":{active:true,combatId:combat?.id??"",round:combat?.round??0,until:(game.time?.worldTime??0)+6},"system.ardor.burnt":Math.max(0,burnt-1)});
    if(!updated) throw new Error("Samadhi could not be saved.");
    return `<p><strong>Entered Samadhi!</strong> +3 to subsequent checks until the end of the next round, or six seconds of world time.${burnt>0?' Recovered 1 burnt Ardor.':''}</p>`;
  });
  pending.set(actor,task);
  try{return await task;}finally{if(pending.get(actor)===task) pending.delete(actor);}
}
