// p.66: only Perfect Defenses cancel Critical Strikes.
export function resolveDefense(attack,defenseResults,armor=0,conditions={}) {
 const profile=attack.profile;
 const cost=die=>1+(profile.extraWounds??0)+(die===6?(profile.criticalExtra??0):0)+(die>=5?(profile.fivePlusExtra??0):0);
 let perfect=defenseResults.filter(n=>n===6).length;
 let normal=defenseResults.filter(n=>n===4||n===5).length;
 const critical=attack.results.filter(n=>n===6);
 const cancelledCritical=Math.min(perfect,critical.length);perfect-=cancelledCritical;
 const ordinary=attack.results.filter(n=>n===4||n===5).sort((a,b)=>cost(b)-cost(a));
 const survivors=[...critical.slice(cancelledCritical),...ordinary.slice(normal+perfect)];
 const wounds=survivors.reduce((sum,die)=>sum+cost(die),0)+(survivors.length&&conditions.lacerating?1:0);
 const armorCost=profile.armorPerWound??1;
 const absorbed=profile.ignoresArmor?0:Math.min(wounds,Math.ceil(Math.max(0,armor)/armorCost));
 return {strikes:survivors.length,wounds,armorLoss:profile.ignoresArmor?0:Math.min(armor,wounds*armorCost),healthLoss:wounds-absorbed};
}
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function recentAttacks() {
 return (game.messages?.contents??[]).filter(message=>message.visible && message.isContentVisible && message.getFlag("10kswordsfoundry","attack")).slice(-30).reverse();
}

export function clashDice(incoming,interrupt) {
 const left=[...incoming],right=[...interrupt];
 for(let i=left.length-1;i>=0;i--) {const match=right.indexOf(left[i]);if(match>=0){left.splice(i,1);right.splice(match,1);}}
 return {incoming:left,interrupt:right};
}
