import test from "node:test";
import assert from "node:assert/strict";
import {requireFreeHand,inSamadhi,enterSamadhi,tagBonus} from "../scripts/roll-support.mjs";
const item=(slot,properties={})=>({type:"weapon",system:{equipped:true,gearSlot:slot,properties}});
test("Magick requires a free hand even with Focus, Great or Colossal",()=>{
 assert.doesNotThrow(()=>requireFreeHand({items:{contents:[item("right")]}}));
 for(const items of [[item("right"),item("left")],[item("both",{focus:true})],[item("right",{great:true})],[item("right",{colossal:true})]]) assert.throws(()=>requireFreeHand({items:{contents:items}}),/free hand/);
});
test("task tags require wielding; Shield applies per weapon",()=>{
 const actor={items:{contents:[item("right",{shield:true,ritual:true,disarming:true}),item("left",{shield:true})]}};
 assert.equal(tagBonus(actor,"shield"),2);assert.equal(tagBonus(actor,"ritual"),1);assert.equal(tagBonus(actor,"disarming"),2);
 actor.items.contents=[item("carry",{shield:true})];assert.equal(tagBonus(actor,"shield"),0);
});
test("Samadhi enters once, refunds burnt Ardor once, expires and permits reentry",async()=>{
 globalThis.game={time:{worldTime:10},combat:null};
 const actor={system:{ardor:{burnt:2,installed:1},samadhi:{active:false}},toObject(){return structuredClone({system:this.system});},async update(data){this.system.samadhi=data["system.samadhi"];this.system.ardor.burnt=data["system.ardor.burnt"];return this;}};
 assert.equal(await enterSamadhi(actor,2),"");
 const results=await Promise.all([enterSamadhi(actor,3),enterSamadhi(actor,4)]);
 assert.equal(results.filter(Boolean).length,1);assert.equal(actor.system.ardor.burnt,1);assert.equal(actor.system.ardor.installed,1);
 assert.equal(inSamadhi(actor),true);game.time.worldTime=16;assert.equal(inSamadhi(actor),false);
 game.combat={id:"combat",started:true,round:4};await enterSamadhi(actor,3);
 assert.equal(actor.system.ardor.burnt,0);game.combat.round=5;assert.equal(inSamadhi(actor),true);game.combat.round=6;assert.equal(inSamadhi(actor),false);
 await enterSamadhi(actor,3);assert.equal(actor.system.ardor.burnt,0);
});
