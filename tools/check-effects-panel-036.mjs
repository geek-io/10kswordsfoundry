import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const h=createRequire('C:/Program Files/Foundry Virtual Tabletop/resources/app/package.json')('handlebars');
h.registerHelper('selectOptions',()=> '');h.registerHelper('checked',()=> '');
const {chromium}=createRequire('C:/Users/drago/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json')('playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage();
 const html=h.compile(await readFile('templates/actor.hbs','utf8'))({editable:true,actor:{},system:{},effects:[{id:'same',itemId:'trait1',name:'Charisma',source:'Animal Magnetism',status:'Suppressed',suppressed:true,changes:'Word (WRD) · add · @system.level'},{id:'same',itemId:'',name:'Direct',source:'Character',status:'Active'}]});
 await page.setContent(html);
 assert.equal(await page.locator('[data-action=editEffect][data-effect-item-id=trait1]').count(),1);
 assert.equal(await page.locator('[data-action=toggleEffect][data-effect-item-id=trait1]').count(),1);
 assert.equal(await page.locator('[data-action=removeEffect][data-effect-item-id=trait1]').count(),1);
 assert.match(await page.locator('.effect-changes').innerText(),/Word.*@system.level/);
 assert.ok((await page.locator('.effect-source').allTextContents()).includes('Source: Animal Magnetism'));
 console.log('Headless Edge: effect source, suppression guidance, mechanics, and item-scoped controls render.');
}finally{await browser.close();}
