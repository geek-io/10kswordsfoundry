import {convertLegacyArmor} from './legacy-items.mjs?v=0.1.40';
export class SwordsItem extends foundry.documents.Item {
 async _preCreate(data,options,user){
  if(this.type==='gambit'&&this.parent?.documentName==='Actor'&&this.parent.type!=='npc'){ui.notifications.warn('Gambits can only be added to World Beings.');return false;}
  return super._preCreate(data,options,user);
 }
 static migrateData(data,options) {return super.migrateData(convertLegacyArmor(data),options);}
 static createDialog(data={},operation={},options={},renderOptions={}) {
  return super.createDialog(data,operation,{...options,types:(options.types??this.TYPES).filter(type=>type!=='armor')},renderOptions);
 }
}
