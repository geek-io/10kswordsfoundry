// Restore only identified stock Grimoire copies whose embedded effects were lost.
export function missingTraitEffects(item,catalog){
 if(item.type!=='trait'||(item.effects?.contents??[]).length)return [];
 const source=catalog.items.find(entry=>entry.name===item.name&&entry.system.source===item.system.source);
 return structuredClone(source?.effects??[]);
}
export async function repairTraitEffects(){
 if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
 if(game.settings.get('10kswordsfoundry','traitEffectRepairVersion')>=37)return;
 const response=await fetch('systems/10kswordsfoundry/data/grimoire-traits.json');
 if(!response.ok)throw new Error('Grimoire Trait repair data could not be loaded.');
 const catalog=await response.json();
 const items=[...game.items.contents];
 const actors=[...game.actors.contents];
 for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
 for(const actor of actors)items.push(...actor.items.contents);
 const seen=new Set();let count=0,failed=false;
 for(const item of items){
  if(seen.has(item.uuid))continue;seen.add(item.uuid);
  const effects=missingTraitEffects(item,catalog);if(!effects.length)continue;
  try{
   const created=await item.createEmbeddedDocuments('ActiveEffect',effects);
   if(created.length!==effects.length)throw new Error('Not all effects were restored.');
   count++;
  }catch(error){failed=true;ui.notifications.error(`Trait effects for ${item.name}: ${error.message}`);}
 }
 if(!failed)await game.settings.set('10kswordsfoundry','traitEffectRepairVersion',37);
 if(count)ui.notifications.info(`Restored missing Active Effects on ${count} Grimoire Trait copies. Existing effects were preserved.`);
}
