// Retain the legacy schema identifier for loading old worlds; do not expose it in creation.
export function convertLegacyArmor(data) {
 if(data.type!=="armor") return data;
 data.flags??={};data.flags['10kswordsfoundry']??={};
 data.flags['10kswordsfoundry'].legacyArmor??={system:structuredClone(data.system??{}),converted:true};
 data.type='fashion';data.system??={};
 // Legacy Armor never supplied a defined fashion bonus; preserve it as zero rather than guessing from Bonus.
 data.system.armor??=0;data.system.ardor??=0;
 return data;
}

export async function persistLegacyArmor() {
 if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
 const actors=[...game.actors.contents];
 for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
 const items=[...game.items.contents,...actors.flatMap(actor=>actor.items.contents)];
 let count=0;
 for(const item of items) {
  const backup=item.getFlag('10kswordsfoundry','legacyArmor');if(!backup||backup.persisted)continue;
  try {const data=item.toObject();data.flags['10kswordsfoundry'].legacyArmor.persisted=true;
   if(!await item.update(data,{diff:false,recursive:false}))throw new Error('Update was cancelled');count++;
  }catch(error){ui.notifications.error(`Fashion conversion for ${item.name}: ${error.message}`);}
 }
 if(count)ui.notifications.info(`Converted ${count} legacy Armor item(s) to Fashion. Review their Fashion bonuses and equipped slots.`);
}
