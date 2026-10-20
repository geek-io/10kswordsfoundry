// Optional AA integration: https://github.com/theripper93/autoanimations/blob/main/src/system-support/external.js
const SYSTEM='10kswordsfoundry';
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
