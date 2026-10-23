function addTool(html,id,label,callback) {
 const root=html?.querySelector?html:html?.[0];if(!root||root.querySelector(`[data-swords-tool="${id}"]`)) return;
 const button=document.createElement('button');button.type='button';button.dataset.swordsTool=id;button.textContent=label;button.style.margin='6px 0';
 button.addEventListener('click',()=>Promise.resolve(callback()).catch(error=>ui.notifications.error(error.message)));
 const header=root.querySelector('.directory-header,.header-actions,header');
 if(header) header.append(button);else root.prepend(button);
}
export function registerSidebarTools() {
 const importer=(app,html)=>{
  if(game.user.isGM||game.user.can('ITEM_CREATE')||game.user.can('ACTOR_CREATE'))addTool(html,'importer','Importer',async()=>{const {openItemCreator}=await import('./item-creator.mjs?v=0.1.51');return openItemCreator(game.user.isGM||game.user.can('ITEM_CREATE')?'single':'world');});
 };
 Hooks.on('renderItemDirectory',importer);
 Hooks.on('renderActorDirectory',importer);
 Hooks.on('renderCompendiumDirectory',(app,html)=>{importer(app,html);addTool(html,'browser','Compendium Browser',async()=>{const {openLibrary}=await import('./browser.mjs?v=0.1.51');return openLibrary();});});
}
