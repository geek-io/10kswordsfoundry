export function activatePanel(sheet,panel) {
 if(panel==='state')panel='combat';
 sheet._swordsPanel=panel;
 for(const button of sheet.element.querySelectorAll('[data-action="sheetPanel"]')) {const active=button.dataset.panel===panel;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));}
 const body=sheet.element.querySelector('.sheet-body');
 let current='overview';
 for(const child of body?.children??[]) {
  if(child.matches('header,nav')) continue;
  const heading=child.querySelector('legend,h2')?.textContent.trim();
  if(sheet.document.documentName==='Actor') {
   if(heading) current=['Traits','Job','Identity','Cultivation & Travel'].includes(heading)?'identity':['Gambits','Special Abilities','Conditions & Actions','Readied Combat Items','Health Sutra','Health, Armor & Ardor','AP & Ardor','Armor'].includes(heading)?'combat':['Weapons','Gear','Accessories','Ammo','Weapon Mods','Salvage','Gear Slots','Licenses','Fashion','Gear & Abilities','Magicks','Technicks'].includes(heading)?'inventory':heading==='Notes'?'notes':heading==='Active Effects'?'effects':'overview';
  } else {
   if(heading) current=['Special Abilities','Ammo','Upgrade','Affinity (optional)','Attack profile','Mods'].includes(heading)?'combat':heading==='Active Effects'?'effects':'overview';
   if(child.matches('label')||child.matches('prose-mirror,.rich-content')) current='notes';
  }
  child.hidden=current!==panel;
 }
}
export function sheetPanel(event,target){activatePanel(this,target.dataset.panel);}
export async function openCompendium(){const {openLibrary}=await import('./browser.mjs?v=0.1.45');return openLibrary();}
