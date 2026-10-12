import test from 'node:test';
import assert from 'node:assert/strict';
import {effectRows,editEffect,toggleEffect,removeEffect,ownedEffect} from '../scripts/effects.mjs';
function fixture(){
 const make=(name,props={})=>({id:'same',name,disabled:false,isSuppressed:false,active:true,transfer:true,system:{changes:[{key:'system.cultivations.wrd',type:'add',value:'@system.level'}]},sheet:{render(){this.opened=true;}},async update(data){Object.assign(this,data);},async delete(){this.deleted=true;},...props});
 const direct=make('Direct'),one=make('One',{isSuppressed:true}),two=make('Two',{disabled:true}),local=make('Local',{transfer:false,id:'local'});
 const collection=contents=>({contents,get:id=>contents.find(e=>e.id===id)});
 const actor={documentName:'Actor',effects:collection([direct]),items:collection([{id:'one',name:'First Trait',effects:collection([one,local])},{id:'two',name:'Second Trait',effects:collection([two])}])};
 return {actor,direct,one,two,local};
}
test('character panel lists direct and transferred effects with source, status, and actual changes',()=>{
 const {actor}=fixture();const rows=effectRows(actor);
 assert.deepEqual(rows.map(r=>[r.source,r.status,r.itemId]),[['Character','Active',''],['First Trait','Suppressed','one'],['Second Trait','Disabled','two']]);
 assert.match(rows[1].changes,/Word.*add.*@system.level/);
 assert.equal(effectRows({documentName:'Item',effects:actor.items.get('one').effects}).length,2);
});
test('controls address owned item effects despite duplicate IDs and never fall back to actor effects',async()=>{
 const {actor,direct,one,two}=fixture();const sheet={document:actor,isEditable:true};const target={dataset:{effectId:'same',effectItemId:'one'}};
 await editEffect.call(sheet,null,target);assert.equal(one.sheet.opened,true);assert.equal(direct.sheet.opened,undefined);
 await toggleEffect.call(sheet,null,target);assert.equal(one.disabled,true);assert.equal(direct.disabled,false);
 await removeEffect.call(sheet,null,target);assert.equal(one.deleted,true);assert.equal(two.deleted,undefined);
 assert.equal(ownedEffect(actor,{dataset:{effectId:'same',effectItemId:'missing'}}),null);
 assert.equal(ownedEffect(actor,{dataset:{effectId:'local',effectItemId:'one'}}),null);
 sheet.isEditable=false;await toggleEffect.call(sheet,null,{dataset:{effectId:'same'}});await removeEffect.call(sheet,null,{dataset:{effectId:'same'}});assert.equal(direct.disabled,false);assert.equal(direct.deleted,undefined);
});
