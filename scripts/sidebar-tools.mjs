function addTool(html,id,label,callback) {
 const root=html?.querySelector?html:html?.[0];if(!root||root.querySelector(`[data-swords-tool="${id}"]`)) return;
 const button=document.createElement('button');button.type='button';button.dataset.swordsTool=id;button.textContent=label;button.style.margin='6px 0';
 button.addEventListener('click',()=>Promise.resolve(callback()).catch(error=>ui.notifications.error(error.message)));
 const header=root.querySelector('.directory-header,.header-actions,header');
 if(header) header.append(button);else root.prepend(button);
}
import {usesRules21,isLegacyPack20} from './rules-version.mjs?v=0.2.50';
export function registerSidebarTools() {
 const importer=(app,html)=>{
  if(game.user.isGM||game.user.can('ITEM_CREATE')||game.user.can('ACTOR_CREATE'))addTool(html,'importer','Importer',async()=>{const {openItemCreator}=await import('./item-creator.mjs?v=0.2.50');return openItemCreator(game.user.isGM||game.user.can('ITEM_CREATE')?'single':'world');});
 };
 Hooks.on('renderItemDirectory',importer);
 Hooks.on('renderActorDirectory',importer);
 // Rules 2.1 only: Cultivator Discovery (2.1 rulebook p.42). Any player may start one; nothing is created until a GM does it.
 Hooks.on('renderActorDirectory',(app,html)=>{if(usesRules21())addTool(html,'discovery21','Cultivator Discovery',async()=>{const {openDiscovery21}=await import('./discovery21.mjs?v=0.2.50');return openDiscovery21();});});
 // Rules 2.1: the 2.0.3 compendia are hidden from the list. Nothing is deleted; switching back to 2.0.3 shows them again.
 Hooks.on('renderCompendiumDirectory',(app,html)=>{const root=html?.querySelector?html:html?.[0];if(!root)return;const hide=usesRules21();for(const pack of game.packs??[]){if(!isLegacyPack20(pack))continue;for(const entry of root.querySelectorAll(`[data-pack="${pack.collection}"],[data-entry-id="${pack.collection}"]`))entry.style.display=hide?'none':'';}});
 Hooks.on('renderCompendiumDirectory',(app,html)=>{importer(app,html);addTool(html,'browser','Compendium Browser',async()=>{const {openLibrary}=await import('./browser.mjs?v=0.2.50');return openLibrary();});});
}
