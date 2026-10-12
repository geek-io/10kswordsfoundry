import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {abilityView} from '../scripts/ability-state.mjs';
const h=createRequire('C:/Program Files/Foundry Virtual Tabletop/resources/app/package.json')('handlebars');
h.registerHelper('selectOptions',()=> '');h.registerHelper('checked',()=> '');
const {chromium}=createRequire('C:/Users/drago/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json')('playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage();
 const items=[{id:'install',name:'Installed Art',type:'technique',system:{apCost:2,burnArdor:1,installArdor:2}},{id:'burn',name:'Burn Art',type:'magick',system:{apCost:1,burnArdor:2,installArdor:0}},{id:'release',name:'Reserved Art',type:'technique',system:{apCost:2,burnArdor:1,installArdor:2,equipped:true,paidArdor:2}}].map(abilityView);
 await page.setContent(h.compile(await readFile('templates/actor.hbs','utf8'))({editable:true,actor:{},system:{},abilityGroups:[{label:'Technicks',items}],combatItems:items.map(item=>({...item,isAbility:true}))}));
 for(const [id,label]of [['install','Internalize'],['burn','Activate'],['release','Release']]){
  const rows=page.locator(`li[data-item-id="${id}"]`);assert.equal(await rows.count(),2);
  assert.equal(await rows.getByRole('button',{name:label,exact:true}).count(),2);
  for(const text of await rows.locator('.ability-costs').allTextContents())assert.match(text,/AP \d+ ✦ · Burn \d+ ✹ · Install \d+ ❂/);
 }
 console.log('Headless Edge: Inventory and Combat each show correct Internalize/Activate/Release controls and all three cost labels.');
}finally{await browser.close();}
