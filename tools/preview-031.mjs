import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {CULTIVATION_DETAILS} from '../scripts/cultivations.mjs';
const h=createRequire('C:/Program Files/Foundry Virtual Tabletop/resources/app/package.json')('handlebars');
h.registerHelper('selectOptions',(choices,options)=>new h.SafeString(Object.entries(choices??{}).map(([v,l])=>`<option value="${h.escapeExpression(v)}" ${v===options.hash.selected?'selected':''}>${h.escapeExpression(l)}</option>`).join('')));
h.registerHelper('checked',v=>v?'checked':'');
const {chromium}=createRequire('C:/Users/drago/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json')('playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:850,height:880}});
const base=pathToFileURL(process.cwd()+'/').href;
const core='file:///C:/Program%20Files/Foundry%20Virtual%20Tabletop/resources/app/public/css/foundry2.css';
async function show(name,template,context,classes){
 const content=h.compile(await readFile(template,'utf8'))(context).replaceAll('systems/10kswordsfoundry/','');
 const html=`<!doctype html><html><head><base href="${base}"><link rel="stylesheet" href="${core}"><link rel="stylesheet" href="styles/system.css"><link rel="stylesheet" href="styles/polish.css"><style>body{background:#080a0e;padding:20px}.application{position:relative!important;width:780px;height:800px}.window-content{flex:1;min-height:0}</style></head><body class="theme-dark"><form class="application swords ${classes}"><header class="window-header">10,000 Swords · 0.1.31</header><div class="window-content">${content}</div></form></body></html>`;
 await writeFile(`tmp/ui/${name}.html`,html);await page.goto(pathToFileURL(`${process.cwd()}/tmp/ui/${name}.html`).href);await page.evaluate(()=>document.fonts.ready);
}
const creator=JSON.parse(await readFile('tmp/ui/creator-context.json','utf8'));
for(const tab of ['single','mass','world']){
 await show(`031-${tab}`,'templates/item-creator.hbs',{...creator,isSingle:tab==='single',isWorld:tab==='world',importState:{format:'text',type:'trait',content:'1 1 Animal Magnetism\nDescription here.\n1 2 Dialectician\nDescription here.',names:['Animal Magnetism','Dialectician'],review:'[\n  {"name":"Animal Magnetism","type":"trait","system":{}}\n]',status:'2 entries detected. Review before importing.'}},'swords-item-creator');
 assert.equal(await page.locator('[data-action=importTab]').count(),3);
 const footer=await page.locator('.creator-footer').boundingBox();assert.ok(footer.y+footer.height<860,`${tab} footer remains visible`);
 assert.equal(await page.locator('.creator-scroll').evaluate(el=>getComputedStyle(el).overflowY),'auto');
 await page.screenshot({path:`tmp/ui/031-${tab}.png`});
}
await show('031-cultivations','templates/actor.hbs',{editable:true,actor:{name:'Sable',img:'file:///C:/Program%20Files/Foundry%20Virtual%20Tabletop/resources/app/public/icons/svg/mystery-man.svg'},system:{movement:6},cultivations:Object.entries(CULTIVATION_DETAILS).map(([key,data])=>({key,name:data.name,label:`${data.name} (${key.toUpperCase()})`,icon:`assets/cultivations/${key}.png`,tooltip:data.text,value:3})),inventoryGroups:[{type:'weapon',label:'Weapons',items:[{id:'w',name:'Iron Thorn',system:{quantity:1},equippable:true}]}]},'actor-sheet');
await page.addScriptTag({content:(await readFile('scripts/sheet-navigation.mjs','utf8')).replaceAll('export ','')});
await page.evaluate(()=>activatePanel({element:document.querySelector('form'),document:{documentName:'Actor'}},'overview'));
assert.equal(await page.locator('.cultivation-symbol img').count(),6);assert.equal(await page.locator('.cultivation-symbol img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)),true);
await page.screenshot({path:'tmp/ui/031-cultivations.png'});
await page.evaluate(()=>activatePanel({element:document.querySelector('form'),document:{documentName:'Actor'}},'inventory'));
assert.equal(await page.locator('[data-item-type=weapon][data-action=addNew]').isVisible(),true);
await page.screenshot({path:'tmp/ui/031-inventory.png'});
for(const [type,context] of [['job',{isJob:true,jobGrantGroups:Object.entries({weapon:'Weapons',gear:'Gear',fashion:'Fashion',trait:'Traits',other:'Other starting items'}).map(([type,label])=>({type,label,items:type==='weapon'?[{id:'g',name:'Starting Sword',type:'weapon',tooltip:'A sword.'}]:[]}))}],['gambit',{isGambit:true}]]){
 await show(`031-${type}`,'templates/item.hbs',{editable:true,item:{name:type},system:{},...context},'item-sheet');
 if(type==='job')assert.equal(await page.locator('[data-job-grants]').count(),5);
 else{assert.equal(await page.locator('[name="system.apCost"]').count(),1);assert.equal(await page.locator('[name="system.quantity"]').count(),0);}
 await page.screenshot({path:`tmp/ui/031-${type}.png`});
}
await browser.close();console.log('0.1.31 headless layouts: all importer tabs scroll with visible footer, six Cultivation images load, inventory Add New and Job/Gambit editors render.');
