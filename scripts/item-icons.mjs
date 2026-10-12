export const ITEM_ICONS=Object.fromEntries(['weapon','fashion','license','technique','magick','gear','accessory','ammunition','job','trait','weaponMod','gambit','salvage'].map(type=>[type,`systems/10kswordsfoundry/assets/icons/${type}.svg`]));
export function defaultItemIcon(type,img){return !img||['icons/svg/item-bag.svg','icons/svg/mystery-man.svg'].includes(img)?ITEM_ICONS[type]??img:img;}
export function setItemIcon(document,data){const img=defaultItemIcon(data.type??document.type,data.img);if(img&&img!==data.img)document.updateSource({img});}
export async function migrateItemIcons(){
 if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
 const actors=[...game.actors.contents];for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
 for(const item of [...game.items.contents,...actors.flatMap(a=>a.items.contents)]){const img=defaultItemIcon(item.type,item.img);if(img!==item.img)await item.update({img});}
}
