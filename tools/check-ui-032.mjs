import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=createRequire('C:/Users/drago/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json')('playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:850,height:880}});
await page.goto(pathToFileURL(`${process.cwd()}/tmp/ui/031-cultivations.html`).href);
await page.addScriptTag({content:(await readFile('scripts/sheet-navigation.mjs','utf8')).replaceAll('export ','')});
const traits=page.locator('section').filter({has:page.locator('h2', {hasText:/^Traits$/})}).last();
await page.evaluate(()=>activatePanel({element:document.querySelector('form'),document:{documentName:'Actor'}},'identity'));
assert.equal(await traits.isVisible(),true);
await page.evaluate(()=>activatePanel({element:document.querySelector('form'),document:{documentName:'Actor'}},'combat'));
assert.equal(await traits.isVisible(),false);
await page.addScriptTag({content:(await readFile('scripts/sidebar-tools.mjs','utf8')).replaceAll('export ','')});
const result=await page.evaluate(()=>{
 const hooks={};window.game={user:{isGM:true}};window.Hooks={on:(name,handler)=>hooks[name]=handler};registerSidebarTools();
 return ['renderItemDirectory','renderActorDirectory','renderCompendiumDirectory'].map(name=>{
  const root=document.createElement('section');root.innerHTML='<header class="directory-header"></header>';
  hooks[name]({},root);hooks[name]({},root);return [...root.querySelectorAll('[data-swords-tool]')].map(b=>b.textContent);
 });
});
assert.deepEqual(result,[['Importer'],['Importer'],['Importer','Compendium Browser']]);
await browser.close();console.log('Headless UI: Traits visible only in Identity; exactly one Importer button in all three directories even on repeated render hooks.');
