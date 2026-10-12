// Optional integration check using an installed, licensed Foundry distribution.
// No Foundry source is copied into this project. Run with Node 24.13+.
import { registerHooks, createRequire } from "node:module";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { checkFormula, summarizeCheck } from "../scripts/rules.mjs";

if (!process.argv[2]) throw new Error("Usage: node tools/check-foundry-dice.mjs <Foundry resources/app directory>");
const root = resolve(process.argv[2]);
const url = path => pathToFileURL(join(root, path)).href;
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith("@common/")) return next(url(`common/${specifier.slice(8)}`), context);
  return next(specifier, context);
} });
await import(url("common/primitives/_module.mjs"));
globalThis.foundry = { utils: await import(url("common/utils/_module.mjs")), dice: {} };
globalThis.CONFIG = { debug: {}, Dice: { terms: {}, fulfillment: { defaultMethod: "digital", methods: {} } } };
globalThis.game = { settings: { get: (scope, key) => key === "messageMode" ? "public" : {} }, user: { hasPermission: () => false } };
globalThis._loc = key => key;
const { default: Roll } = await import(url("client/dice/roll.mjs"));
const terms = await import(url("client/dice/terms/_module.mjs"));
const { default: RollParser } = await import(url("client/dice/parser.mjs"));
const require = createRequire(url("package.json"));
foundry.dice = { Roll, terms, RollGrammar: require("peggy").generate(await readFile(join(root, "client/dice/grammar.pegjs"), "utf8")) };
Object.assign(CONFIG.Dice, { parser: RollParser, rolls: [Roll], terms: { d: terms.Die }, termTypes: terms });
let queue = [];
CONFIG.Dice.fulfillment.methods.digital = { handler: () => {
  assert.ok(queue.length, "No unexpected extra dice");
  return queue.shift();
} };
for (const pool of [0, -1, -8]) {
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    queue = [a, b];
    const roll = await new Roll(checkFormula(pool)).evaluate({ allowInteractive: false });
    const kept = roll.dice.flatMap(d => d.results.filter(r => r.active !== false && !r.discarded).map(r => r.result));
    assert.equal(queue.length, 0);
    assert.equal(roll.dice[0].results.length, 2);
    assert.deepEqual(kept, [Math.min(a, b)]);
    const summary = summarizeCheck(kept, 1);
    assert.equal(roll.total,summary.strikes);
    assert.equal(summary.strikes, a >= 4 && b >= 4 ? 1 : 0);
    assert.equal(summary.sixes, a === 6 && b === 6 ? 1 : 0);
  }
}
queue = [1, 4, 5, 6];
const positive = await new Roll(checkFormula(4)).evaluate({ allowInteractive: false });
assert.deepEqual(summarizeCheck(positive.dice[0].results.map(r => r.result), 3), {strikes:3,sixes:1,success:true});
assert.equal(positive.total,3);
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
console.log(`Foundry ${pkg.release.generation}.${pkg.release.build}: 108 nonpositive-pool cases and a positive-pool case passed using its actual Roll engine.`);

// Test the system's actual Check action; only UI and chat transport are stand-ins.
let dialogResult, message;
const cautions = [];
globalThis.ui = { notifications: { warn: message => cautions.push(message) } };
class Sheet {}
foundry.applications = {
  api: { HandlebarsApplicationMixin: Base => Base, DialogV2: { prompt: async () => dialogResult } },
  sheets: { ActorSheetV2: Sheet, ItemSheetV2: Sheet },
  dice: { RollResolver: class { async awaitFulfillment() {} async addTerm() {} close() {} } }
};
foundry.documents = { ChatMessage: { getSpeaker: () => ({actor:"test"}) } };
const { SwordsActorSheet } = await import("../scripts/sheets.mjs");
const originalToMessage = Roll.prototype.toMessage;
const originalRollCheck=SwordsActorSheet.rollCheck;
SwordsActorSheet.rollCheck=async function(...args) {
  this.document.toObject??=()=>({system:{actions:3}});
  this.document.update??=async()=>this.document;
  return originalRollCheck.apply(this,args);
};
Roll.prototype.toMessage = async function(data, options) { message = { data, options, roll: this }; };
try {
  for (const adjustment of [-1, -2, -9]) {
    message = undefined; queue = [6, 4]; dialogResult = { adjustment, demand: 1 };
    await SwordsActorSheet.rollCheck.call({document:{isOwner:true,system:{cultivations:{vio:1}}},submit:async()=>{}}, null, {dataset:{cultivation:"vio"}});
    assert.equal(queue.length,0);
    assert.equal(message.roll.formula,"2d6kl1cs>=4");
    assert.match(message.data.flavor,/1 Strikes/);
    assert.match(message.data.flavor,/Sixes: 0/);
    assert.match(message.data.flavor,/Fallback: roll 2d6/);
    assert.equal(message.options.messageMode,"public");
  }
  for (const attack of [false,true]) {
    message = undefined; queue = attack ? [4,5,6] : [4];
    dialogResult = {adjustment:0,demand:1,attack,weaponId:"sword"};
    await SwordsActorSheet.rollCheck.call({document:{isOwner:true,system:{cultivations:{vio:1}},items:{get:()=>({id:"sword",type:"weapon",system:{equipped:true,bonus:2}}),contents:[{id:"sword",type:"weapon",system:{equipped:true,bonus:2}}]}},submit:async()=>{}},null,{dataset:{cultivation:"vio",...(attack?{weaponId:"sword"}:{})}});
    assert.equal(message.roll.formula,attack ? "3d6cs>=4" : "1d6cs>=4");
    assert.equal(queue.length,0);
    if (attack) assert.match(message.data.flavor,/Weapon bonus: 2/);
  }
  const armed = {id:"gun",type:"weapon",system:{equipped:true,bonus:2,upgrade:"refined",ammo:{type:"Bullet",quantity:1}}};
  armed.update = async data => { armed.system.ammo.quantity=data["system.ammo.quantity"]; return armed; };
  const armedSheet={document:{isOwner:true,system:{cultivations:{vio:1}},items:{get:()=>armed,contents:[armed]}},submit:async()=>{}};
  queue=[4,4,4,4]; message=undefined; dialogResult={adjustment:0,demand:1,attack:true,weaponId:"gun"};
  await SwordsActorSheet.rollCheck.call(armedSheet,null,{dataset:{cultivation:"vio",weaponId:"gun"}});
  assert.equal(message.roll.formula,"4d6cs>=4"); assert.equal(armed.system.ammo.quantity,0);
  message=undefined;
  await SwordsActorSheet.rollCheck.call(armedSheet,null,{dataset:{cultivation:"vio",weaponId:"gun"}});
  assert.equal(message,undefined);
  assert.equal(cautions.pop(),"Out of ammo, please reload or use another weapon");
  const precise={id:'precise',type:'weapon',system:{equipped:true,bonus:1,properties:{precise:true,ferocious:true},affinity:'Nimble'}};
  const preciseSheet={document:{isOwner:true,system:{cultivations:{vio:6,grc:1}},items:{get:()=>precise,contents:[precise]}},submit:async()=>{}};
  queue=[1,4,6];dialogResult={adjustment:0,demand:1,attack:true,weaponId:'precise'};
  await SwordsActorSheet.rollCheck.call(preciseSheet,null,{dataset:{cultivation:'vio',weaponId:'precise'}});
  assert.equal(message.roll.formula,'2d6r1cs>=4'); assert.equal(queue.length,0);
  assert.match(message.data.flavor,/Grace \(Grc\)/);
  assert.match(message.data.flavor,/3 potential CUT Wounds/);
  for (const [value, formula, count] of [[6,"4d6cs>=4",4],[3,"3d6cs>=4",3],[2,"3d6cs>=4",3],[1,"1d6cs>=4",1]]) {
    queue=Array(count).fill(4); message=undefined; dialogResult={adjustment:0,demand:1};
    await SwordsActorSheet.rollCheck.call({document:{isOwner:true,system:{health:{max:6,value},cultivations:{vio:4}}},submit:async()=>{}},null,{dataset:{cultivation:"vio"}});
    assert.equal(message.roll.formula,formula); assert.equal(queue.length,0);
    if(value===1) assert.match(message.data.flavor,/Critical: -3 dice/);
  }
  message=undefined;
  await SwordsActorSheet.rollCheck.call({document:{isOwner:true,system:{health:{max:6,value:0},cultivations:{vio:4}}},submit:async()=>{}},null,{dataset:{cultivation:"vio"}});
  assert.equal(message,undefined);
  assert.equal(cautions.pop(),"You are Knocked Out and cannot make a check.");
  const bow={id:"bow",name:"Bow",type:"weapon",system:{weaponType:"ranged",range:20,equipped:true,gearSlot:"left",bonus:1,ammo:{type:"Arrow",quantity:4}}};
  bow.update=async data=>{bow.system.ammo.quantity=data["system.ammo.quantity"];return bow;};
  const bowSheet={document:{isOwner:true,system:{health:{max:6,value:6},cultivations:{vio:8,grc:4}},items:{contents:[bow],get:()=>bow}},submit:async()=>{}};
  queue=[4,6,5,2,3,4]; message=undefined;
  dialogResult={adjustment:0,targets:2,allies:1,surprise:true,cover:true,highGround:true,distance:12,called:0};
  await SwordsActorSheet.attack.call(bowSheet,null,{dataset:{itemId:"bow"}});
  assert.equal(message.roll.formula,"6d6cs>=4"); assert.equal(queue.length,0);
  assert.equal(bow.system.ammo.quantity,2);
  assert.match(message.data.flavor,/Grace \(Grc\) Attack: 4 total Strikes \(3 ordinary; 1 Perfect Strikes\)/);
  assert.match(message.data.flavor,/Cleave: -2/);
  assert.doesNotMatch(message.data.flavor,/Demand|Success|Failure/);
  bow.system.weaponType="melee";bow.system.range=1;
  message=undefined;dialogResult={adjustment:0,targets:1,distance:2};
  await SwordsActorSheet.attack.call(bowSheet,null,{dataset:{itemId:"bow"}});
  assert.equal(message,undefined);assert.equal(bow.system.ammo.quantity,2);
  assert.match(cautions.pop(),/outside.*melee reach/);
  const shield={type:"weapon",system:{equipped:true,gearSlot:"right",properties:{shield:true}}};
  const defender={document:{isOwner:true,system:{health:{max:6,value:3},cultivations:{vio:4},checkBonus:1,defenseBonus:2},items:{contents:[shield]}},submit:async()=>{}};
  queue=[6,6,4,5,2,1,3];message=undefined;dialogResult={key:"vio",adjustment:0,full:true,feinted:true};
  await SwordsActorSheet.defense.call(defender);
  assert.equal(message.roll.formula,"7d6cs>=4");assert.equal(queue.length,0);
  assert.match(message.data.flavor,/2 ordinary.*2 Perfect/);
  assert.match(message.data.flavor,/<strong class="swords-sixes">2 Perfect \(6\)<\/strong>/);
  game.messages={contents:[{id:"attack-reference",visible:true,isContentVisible:true,speaker:{alias:"Bandit"},getFlag:()=>({name:"Sword",results:[4,5,6],profile:{keys:[],damage:"cut",armorPerWound:1,criticalExtra:1}})}]};
  defender.document.system.armor={value:1};
  queue=[6,4,1,2,3,2,1];dialogResult={attackId:"attack-reference",method:"deflect",key:"vio",adjustment:0,full:true,feinted:true};
  await SwordsActorSheet.defense.call(defender);
  assert.match(message.data.flavor,/Armor loss<\/dt><dd>1<\/dd><dt>Health loss<\/dt><dd><strong>0/);
  assert.equal(message.data.flags["10kswordsfoundry"].defense.attackId,"attack-reference");
  await mkdir('tmp/ui',{recursive:true});await writeFile('tmp/ui/defense-flavor.html',message.data.flavor);
  game.messages={contents:[{id:'magick-reference',visible:true,isContentVisible:true,speaker:{alias:'Caster'},getFlag:()=>({name:'Soul Flame',defensePool:'spi',results:[4,6],profile:{keys:[],damage:'burn',ignoresArmor:true,armorPerWound:1}})}]};
  defender.document.system.cultivations.spi=2;
  queue=[4,1,2,3];dialogResult={attackId:'magick-reference',method:'deflect',key:'vio',adjustment:0};
  await SwordsActorSheet.defense.call(defender);
  assert.equal(message.roll.formula,'4d6cs>=4');assert.equal(queue.length,0);assert.match(message.data.flavor,/Spirit/);assert.match(message.data.flavor,/Health loss<\/dt><dd><strong>1/);
  game.messages=undefined;
  const {interruptAttack}=await import('../scripts/interrupt.mjs');
  const counter={id:'counter',name:'Counter sword',type:'weapon',system:{equipped:true,gearSlot:'right',bonus:1,weaponType:'melee'}};
  const interruptActor={name:'Defender',isOwner:true,system:{health:{value:6,max:6},armor:{value:0},cultivations:{vio:3},actions:3},items:{contents:[counter],get:()=>counter},toObject(){return {system:structuredClone(this.system)};},async update(data){this.system.actions=data['system.actions'];return this;}};
  const interruptSheet={isEditable:true,document:interruptActor,submit:async()=>{}};
  game.messages={contents:[{id:'incoming',visible:true,isContentVisible:true,speaker:{alias:'Enemy'},getFlag:()=>({name:'Incoming blade',results:[4,6,6],profile:{keys:[],damage:'cut',armorPerWound:1,criticalExtra:1}})}]};
  queue=[4,5,6,1];dialogResult={attack:'incoming',mode:'clash',weapon:'counter',key:'vio',adjustment:0,disarm:false};
  await interruptAttack.call(interruptSheet);
  assert.equal(interruptActor.system.actions,2);assert.equal(queue.length,0);assert.match(message.data.flavor,/1 incoming Strikes remain/);assert.match(message.data.flavor,/Health loss: 2/);
  dialogResult=null;await interruptAttack.call(interruptSheet);assert.equal(interruptActor.system.actions,2);
  game.messages=undefined;
  message = undefined; dialogResult = null;
  await SwordsActorSheet.rollCheck.call({document:{isOwner:true,system:{cultivations:{vio:1}}},submit:async()=>{}}, null, {dataset:{cultivation:"vio"}});
  assert.equal(message,undefined);
} finally { Roll.prototype.toMessage = originalToMessage; }
assert.equal(cautions.length, 3);
console.log("Actual sheet Check action passed for adjusted pools 0, -1, and -8, dialog cancellation, Sutra penalties, and KO blocking (UI/chat transport stubbed).");
