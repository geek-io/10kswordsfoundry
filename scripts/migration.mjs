import { reconcileCosts } from "./equipment.mjs?v=0.1.40";
import { assignSlot } from "./slots.mjs?v=0.1.40";
export function migrateInventory(source) {
  if((source.flags?.['10kswordsfoundry']?.inventoryVersion??0)>=28) return false;
  const oldItems=structuredClone(source.items);
  const backup={system:structuredClone(source.system),items:oldItems};
  // Preserve all equipment and choices. Conflicts are reported, not silently removed.
  const assigned=[];
  for(const item of source.items) {
    if(item.type==='weapon'&&item.system.equipped) {
      try {assignSlot(item,assigned,item._id);} catch {item.system.gearSlot='carry';}
    }
    assigned.push(item);
  }
  reconcileCosts(source,oldItems,{allowOverage:true});
  source.flags??={}; source.flags['10kswordsfoundry']??={};
  source.flags['10kswordsfoundry'].inventoryBackupV28=backup;
  source.flags['10kswordsfoundry'].inventoryVersion=28;
  return true;
}
export async function migrateWorldInventory() {
  if(!game.user.isGM || game.users.activeGM?.id!==game.user.id) return;
  const actors=[...game.actors.contents];
  for(const scene of game.scenes) for(const token of scene.tokens) if(!token.actorLink&&token.actor) actors.push(token.actor);
  let count=0;
  for(const actor of actors) {
    try {
      const source=actor.toObject();
      if(migrateInventory(source)) {
        if(!await actor.update(source,{diff:false,recursive:false})) throw new Error("Inventory update was cancelled");
        count++;
      }
    } catch(error) { ui.notifications.error(`Equipment update for ${actor.name}: ${error.message}`); }
  }
  if(count) ui.notifications.info(`Updated License Meridian costs and Carry for ${count} character(s). Review any Meridian or Carry overage.`);
}
