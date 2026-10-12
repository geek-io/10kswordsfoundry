import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const h=createRequire('C:/Program Files/Foundry Virtual Tabletop/resources/app/package.json')('handlebars');
h.registerHelper('selectOptions',()=> '');h.registerHelper('checked',value=>value?'checked':'');
const {chromium}=createRequire('C:/Users/drago/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json')('playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage();
 await page.setContent(h.compile(await readFile('templates/actor.hbs','utf8'))({editable:true,actor:{},system:{},inventoryGroups:[{type:'gear',label:'Gear',items:[{id:'pill',name:'Chakra Pill',system:{quantity:1},canConsume:true}]}]}));
 assert.equal(await page.locator('[data-action=useConsumable][data-item-id=pill]').count(),1);
 await page.setContent(h.compile(await readFile('templates/item.hbs','utf8'))({editable:true,isGear:true,isConsumableGear:true,item:{name:'Chakra Pill'},system:{consumable:{enabled:true,apCost:1,burntArdor:1,health:0}}}));
 assert.equal(await page.locator('[name="system.consumable.enabled"]').isChecked(),true);assert.equal(await page.locator('[name="system.consumable.burntArdor"]').inputValue(),'1');
 console.log('Headless Edge: Gear recovery fields and owned-item Use button render.');
}finally{await browser.close();}
