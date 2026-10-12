import test from "node:test";
import assert from "node:assert/strict";
import {libraryEntries,filterLibrary,clearLibraryCache} from "../scripts/library-service.mjs";
test("Archive indexes visible packs, caches loads, skips inaccessible data and isolates failures",async()=>{
 clearLibraryCache();let calls=0;
 globalThis.game={user:{},items:{contents:[{name:"World blade",uuid:"Item.world",type:"weapon",testUserPermission:()=>true},{name:"Secret",testUserPermission:()=>false}]},packs:[{collection:"test.items",documentName:"Item",visible:true,metadata:{label:"Equipment"},getIndex:async()=>{calls++;return [{_id:"blade",name:"Iron Blade",type:"weapon"}];}},{documentName:"Item",visible:false,getIndex:()=>{throw Error("hidden pack requested");}},{documentName:"Item",visible:true,metadata:{label:"Broken"},getIndex:async()=>{throw Error("offline");}}]};
 const first=await libraryEntries();assert.equal(first.rows.length,2);assert.deepEqual(first.failures,["Broken"]);
 await libraryEntries();assert.equal(calls,1);
 assert.equal(filterLibrary(first.rows,{query:"iron equipment",type:"weapon",source:"test.items"}).length,1);
 game.packs[0].visible=false;assert.equal((await libraryEntries()).rows.length,1);
 clearLibraryCache();
});
