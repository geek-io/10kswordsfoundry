// Optional AA integration: https://github.com/theripper93/autoanimations/blob/main/src/system-support/external.js
import {usesRules21} from './rules-version.mjs?v=0.2.42';
const SYSTEM='10kswordsfoundry';

// Dice So Nice: 2.1 rolls are spoken by a character, so on other clients DSN can resolve the
// dice appearance from whoever drove the roll (often the GM) rather than the character's player.
// DSN reads the appearance from the User in its diceSoNiceRollStart context; we point that at the
// player assigned to the spoken character, so a character's dice follow that player everywhere.
// A /r command has no character speaker, so it is never touched. World setting; default on.
export function registerDiceSoNice21(){
 game.settings.register(SYSTEM,'forcePlayerDice21',{
  name:'Force player dice (2.1)',
  hint:'In a 2.1 world, a roll made from a character sheet uses the Dice So Nice appearance of the player assigned to that character — the same dice a /r command shows them — instead of whoever clicked. Turn off to let Dice So Nice choose on its own.',
  scope:'world',config:true,type:Boolean,default:true});
 Hooks.on('diceSoNiceRollStart',(messageId,context)=>{
  try{
   if(!messageId||!context||!usesRules21()||!game.settings.get(SYSTEM,'forcePlayerDice21'))return;
   const message=globalThis.game?.messages?.get(messageId);
   if(!message?.isRoll)return;
   const actorId=message.speaker?.actor;
   const actor=actorId?globalThis.game?.actors?.get(actorId):null;
   if(!actor)return; // no character speaker (e.g. a /r command): leave DSN alone
   const player=globalThis.game?.users?.find(u=>!u.isGM&&u.character?.id===actor.id);
   if(player)context.user=player; // force the character's own player's dice
  }catch(error){ /* dice appearance must never block the roll */ }
 });
}
export function registerAnimations(){
 game.settings.register(SYSTEM,'automatedAnimations',{name:'Automated Animations',hint:'Play configured item animations after successful public attacks and ability uses. Requires the Automated Animations module and animation assets.',scope:'world',config:true,type:Boolean,default:true});
 // AA also scans chat for item references. Our direct workflow owns these uses;
 // veto only that duplicate chat workflow, never AA effects or external macros.
 Hooks.on('AutomatedAnimations-WorkflowStart',data=>{
  if(data.workflow?.flags?.[SYSTEM]?.animationHandled)data.stopWorkflow=true;
 });
}

export function animationContext(actor){
 const scene=globalThis.canvas?.scene;
 if(!globalThis.canvas?.ready||!scene)return null;
 const placeables=canvas.tokens?.placeables??[];
 const matches=placeables.filter(t=>t.actor===actor||t.actor?.uuid===actor.uuid);
 const own=actor.token?.object;
 const controlled=matches.filter(t=>t.controlled);
 const token=own??(controlled.length===1?controlled[0]:matches.length===1?matches[0]:null);
 if(!token||!placeables.includes(token))return null;
 return {sceneId:scene.id,token,targets:[...(globalThis.game?.user?.targets??[])].filter(t=>placeables.includes(t))};
}

export async function playItemAnimation(context,item,message){
 try{
  if(!context||!item||!message||message.blind||message.whisper?.length||message.visible===false)return false;
  if(!globalThis.game?.modules?.get('autoanimations')?.active||game.settings.get(SYSTEM,'automatedAnimations')===false)return false;
  const api=globalThis.AutomatedAnimations;
  if(typeof api?.playAnimation!=='function'||!globalThis.canvas?.ready||canvas.scene?.id!==context.sceneId)return false;
  const tokens=canvas.tokens?.placeables??[];
  if(!tokens.includes(context.token))return false;
  // No hitTargets: this is the attack/cast, not the later opposed Defense result.
  await api.playAnimation(context.token,item,{targets:context.targets.filter(t=>tokens.includes(t)),playOnMiss:false});
  return true;
 }catch(error){
  // Animation failures must never roll back spent resources or invalidate a roll.
  console.warn('10,000 Swords | Automated Animations playback failed.',error);
  return false;
 }
}
