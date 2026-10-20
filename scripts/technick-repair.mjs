// Add stock action definitions only to identifiable, otherwise empty copies.
export function technickActionPatch(item,catalog){
 if(item.type!=='technique'||item.system.specialAttacks?.length)return null;
 const stock=catalog.items.find(i=>i.name===item.name&&i.system.source===item.system.source);
 if(!stock?.system.specialAttacks?.length)return null;
 const patch={'system.specialAttacks':structuredClone(stock.system.specialAttacks),'flags.10kswordsfoundry.sectCatalog.specialAbilitiesVersion':43};
 const old=stock.flags['10kswordsfoundry'].sectCatalog.previousActivationCosts;
 if(!(item.system.paidArdor>0)&&old&&Object.keys(old).every(k=>(item.system[k]??0)===old[k])){
  for(const key of Object.keys(old))patch[`system.${key}`]=stock.system[key];
 }
 return patch;
}
export async function repairTechnickActions(){
 if(!game.user.isGM||game.users.activeGM?.id!==game.user.id||game.settings.get('10kswordsfoundry','technickActionsVersion')>=43)return;
 const response=await fetch('systems/10kswordsfoundry/data/sect-technicks.json');
 if(!response.ok)throw Error('Could not load Technick Special Abilities.');
 const catalog=await response.json(),items=[...game.items.contents],actors=[...game.actors.contents];
 for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
 for(const actor of actors)items.push(...actor.items.contents);
 const seen=new Set();let count=0,failed=false;
 for(const item of items){
  if(seen.has(item.uuid))continue;seen.add(item.uuid);
  const patch=technickActionPatch(item,catalog);if(!patch)continue;
  try{if(!await item.update(patch))throw Error('Item update was not saved.');count++;}
  catch(error){failed=true;ui.notifications.error(`${item.name}: ${error.message}`);}
 }
 if(!failed)await game.settings.set('10kswordsfoundry','technickActionsVersion',43);
 if(count)ui.notifications.info(`Added Special Abilities to ${count} imported Technicks. Custom ability lists were preserved.`);
}
