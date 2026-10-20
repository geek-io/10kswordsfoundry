export const isAbility=item=>['technique','magick'].includes(item?.type);
export const isInternalized=item=>isAbility(item)&&!!item.system.equipped&&(item.system.paidArdor??0)>0;
export function abilityView(item){return {id:item.id,name:item.name,system:item.system,configuredActions:(item.flags?.['10kswordsfoundry']?.sectCatalog?.specialAbilitiesVersion??0)>=43,internalized:isInternalized(item),actionLabel:(item.system.installArdor??0)>0?'Internalize':'Activate'};}
export function installationChanges(actorSource,itemId,amount){
 const items=structuredClone(actorSource.items);
 const item=items.find(i=>i._id===itemId);
 if(!item||!isAbility(item))throw new Error('This ability is no longer on the character.');
 item.system.paidArdor=amount;item.system.equipped=amount>0;
 return items;
}
export function refundInstallation(system,item){
 if(!isAbility(item))return;
 const amount=item.system.paidArdor??0;
 if(amount>0)system.ardor.installed=Math.max(0,system.ardor.installed-amount);
}
