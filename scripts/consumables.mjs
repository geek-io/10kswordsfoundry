import {queueEquipment,reconcileCosts} from './equipment.mjs?v=0.1.47';
import {assertAction} from './conditions.mjs?v=0.1.47';
import {escapeHTML} from './resolution.mjs?v=0.1.47';
export function recoveryUse(source,itemId,{maximumHealth,inCombat=false}={}){
 const next=structuredClone(source),item=next.items.find(i=>i._id===itemId);
 const c=item?.system.consumable;
 if(item?.type!=='gear'||!c?.enabled)throw new Error('This item has no recovery Use action configured.');
 if(!Number.isSafeInteger(item.system.quantity)||item.system.quantity<1)throw new Error('You have none of this item left.');
 for(const n of [c.health??0,c.burntArdor??0,c.apCost??1])if(!Number.isSafeInteger(n)||n<0)throw new Error('Recovery amounts and AP costs must be nonnegative whole numbers.');
 const ap=inCombat?(c.apCost??1):0;
 if(next.system.actions<ap)throw new Error(`You need ${ap} AP to use this item.`);
 const health=Math.max(0,Math.min(Math.max(0,(maximumHealth??next.system.health.max)-next.system.health.value),c.allHealth?Infinity:(c.health??0)));
 const ardor=Math.min(next.system.ardor.burnt,c.allBurntArdor?Infinity:(c.burntArdor??0));
 if(!health&&!ardor)throw new Error('There is nothing for this item to recover. No item or AP was spent.');
 next.system.health.value+=health;next.system.ardor.burnt-=ardor;next.system.actions-=ap;item.system.quantity--;
 reconcileCosts(next,source.items);
 return {next,health,ardor,ap};
}
export async function useConsumable(event,target){
 const actor=this.document;if(!this.isEditable||!actor.isOwner)return;
 await this.submit();const item=actor.items.get(target.dataset.itemId);if(!item)return;
 try{
 const yes=await foundry.applications.api.DialogV2.confirm({window:{title:`Use ${item.name}`},content:`<p>Use one ${escapeHTML(item.name)} to restore its configured Health and burnt Ardor? This consumes one item. In an active combat, it also spends the configured AP cost (${item.system.consumable?.apCost??1}).</p>`,yes:{label:'Use'},no:{label:'Cancel'},rejectClose:false});
 if(!yes)return;
 await queueEquipment(actor,async()=>{
  assertAction(actor);
  const {next,health,ardor,ap}=recoveryUse(actor.toObject(),item.id,{maximumHealth:actor.system.health.max,inCombat:!!actor.inCombat&&!!game.combat?.started});
  if(!await actor.update(next,{diff:false,recursive:false}))throw new Error('The item use could not be saved.');
  try{await foundry.documents.ChatMessage.create({speaker:foundry.documents.ChatMessage.getSpeaker({actor}),content:`<p><strong>${escapeHTML(item.name)}</strong>: recovered ${health} Health and ${ardor} burnt Ardor. Used 1 item${ap?` and ${ap} AP`:''}.</p>`});}
  catch{ui.notifications.warn('The item was used and recovery saved, but its chat message could not be posted.');}
 });
 }catch(error){ui.notifications.warn(error.message);}
}
