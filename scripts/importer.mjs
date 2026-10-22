import {defaultItemIcon} from './item-icons.mjs?v=0.1.47';
import {titleCase,paragraphText} from "./import-format.mjs?v=0.1.47";
import {itemFolders,checkedFolder} from "./import-folders.mjs?v=0.1.47";
import {IMPORT_TYPES,parseImport} from './import-data.mjs?v=0.1.47';
import {escapeHTML} from './resolution.mjs?v=0.1.47';
import {editorValue} from './rich-text.mjs?v=0.1.47';
import {validateWeapon} from './weapons.mjs?v=0.1.47';
import {clearLibraryCache} from './library-service.mjs?v=0.1.47';
export function validateImport(items) {
 return items.map((item,index)=>{
  try {
   if(item.type==='license'&&!item.system.sect)throw new Error('Sect/rank is required for a License.');
   if(item.type==='job'&&['vio','dia','grc','sav','wrd','spi'].some(key=>item.system.cultivations?.[key]===undefined))throw new Error('All six Job Cultivations are required.');
   const Model=CONFIG.Item.dataModels[item.type];if(!Model)throw new Error('Unsupported item type.');
   const raw=structuredClone(item.system);
   if(["technique","magick"].includes(item.type)){delete raw.gearSlot;delete raw.rarity;}
   if(item.type!=="license")delete raw.meridianCost;else delete raw.rarity;
   if(["job","trait"].includes(item.type))for(const field of ["rarity","slots","quantity","bonus"])delete raw[field];
   const unknown=Object.keys(raw).filter(key=>!Object.hasOwn(Model.schema.fields,key));if(unknown.length)throw new Error(`Unknown fields: ${unknown.join(', ')}.`);
   if(raw.description)raw.description=foundry.utils.cleanHTML(editorValue(paragraphText(raw.description)));
   const system=new Model(raw,{strict:true}).toObject();
   if(Object.hasOwn(system,'equipped'))system.equipped=false;
   if(Object.hasOwn(system,'paidCarry'))system.paidCarry=0;
   if(Object.hasOwn(system,'paidMeridians'))system.paidMeridians=0;
   if(Object.hasOwn(system,'paidArdor'))system.paidArdor=0;
   if(item.type==='weapon'){system.ammoId='';validateWeapon(system);}
   return {...item,img:defaultItemIcon(item.type,item.img),name:titleCase(item.name),system};
  }catch(error){throw new Error(`Item ${index+1} (${item.name}): ${error.message}`);}
 });
}
export async function openImporter(defaultFolder="") {
 const {openItemCreator}=await import('./item-creator.mjs?v=0.1.47');
 return openItemCreator('mass',defaultFolder);
}
