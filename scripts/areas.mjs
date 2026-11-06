// Rules 2.0.3 p.76: bursts use radius; blasts are triangular, as wide as long.
export const AREA_SHAPES={none:'Single target',circle:'Burst / circle',cone:'Blast / cone',ray:'Line'};
export function abilityArea(system){
 const text=(system.description??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 const match=text.match(/\b(\d+(?:\.\d+)?)\s*m\s+(burst|blast(?: cone)?|(?:long )?line)\b/i)
  ??text.match(/\b(burst|blast(?: cone)?|line)\s+(\d+(?:\.\d+)?)\s*m\b/i)?.map((v,i,a)=>i===1?a[2]:i===2?a[1]:v);
 const inferred=match?{shape:/burst/i.test(match[2])?'circle':/blast/i.test(match[2])?'cone':'ray',size:Number(match[1])}:{shape:'none',size:0};
 const explicit=system.areaShape&&system.areaShape!=='none';
 const range=text.match(/\bwithin\s+(\d+(?:\.\d+)?)\s*m\b/i)??text.match(/\b(\d+(?:\.\d+)?)\s*m\s+range\b/i);
 const shape=explicit?system.areaShape:inferred.shape;
 return {shape,size:explicit?system.areaSize:inferred.size,range:system.areaRange||Number(range?.[1]??(shape==='cone'?1:0))};
}
export function areaShape(shape,size,pixels){
 if(!Number.isFinite(size)||size<=0||!Number.isFinite(pixels)||pixels<=0)throw Error('Choose an area size greater than zero.');
 const length=size*pixels;
 if(shape==='circle')return {type:'circle',x:0,y:0,radius:length};
 if(shape==='cone')return {type:'polygon',points:[0,0,length,-length/2,length,length/2],origin:{x:0,y:0}};
 if(shape==='ray')return {type:'polygon',points:[0,-pixels/2,length,-pixels/2,length,pixels/2,0,pixels/2],origin:{x:0,y:0}};
 throw Error('Choose a supported area shape.');
}
export function areaTargets(region,tokens,level){
 // Token centres determine inclusion. Do not reveal unseen or hidden tokens to players.
 return tokens.filter(t=>t.actor&&t.isVisible!==false&&(!t.document.hidden||game.user.isGM)
  &&(!level||t.document.level===level)
  &&region.testPoint({...t.center,elevation:t.document.elevation??0})).map(t=>t.id);
}
export async function placeAbilityArea({sheet,actor,name,shape,size,range=0}){
 if(shape==='none')return undefined;
 if(!globalThis.canvas?.ready||!canvas.scene||!canvas.regions?.placeRegion)throw Error('Open a scene to place this ability’s area.');
 const scene=canvas.scene,level=canvas.level?.id;
 const matches=canvas.tokens.placeables.filter(t=>t.actor===actor||t.actor?.uuid===actor.uuid);
 const source=actor.token?.object??(matches.filter(t=>t.controlled).length===1?matches.find(t=>t.controlled):matches.length===1?matches[0]:null);
 if(range>0&&!source)throw Error('Select this character’s token before placing a ranged area.');
 const pixels=canvas.dimensions.distancePixels;
 const data={name,shapes:[areaShape(shape,size,pixels)],color:game.user.color,levels:level?[level]:[],displayMeasurements:true};
 const wasMinimized=sheet.minimized;
 try{
  if(!wasMinimized)await sheet.minimize?.();
  ui.notifications.info('Place the area: left-click to confirm, wheel to rotate, right-click or Escape to cancel.');
  // A transient native Region preview works without Region creation permission and leaves no stale template.
  const region=await canvas.regions.placeRegion(data,{create:false,allowRotation:shape!=='circle',preConfirm:({shape:placed})=>{
   if(range<=0)return true;
   const origin=placed.type==='circle'?placed:placed.origin;
   if(!origin||Math.hypot(origin.x-source.center.x,origin.y-source.center.y)>range*pixels+0.01){
    ui.notifications.warn(`Place the area within ${range} m of the caster.`);return false;
   }
   return true;
  }});
  if(!region)return null;
  if(canvas.scene!==scene)throw Error('The scene changed. Use the ability again.');
  const targets=areaTargets(region,canvas.tokens.placeables,level);
  canvas.tokens.setTargets(targets,{mode:'replace'});
  const shapes=region.toObject().shapes;
  // Keep the area on the scene so everyone can see what it covers (removed when the combat ends, or by deleting the Region).
  try{await persistAbilityArea({scene,name,shapes,levels:level?[level]:[],actor});}
  catch(error){ui.notifications.warn(`The area could not be kept on the scene: ${error.message}`);}
  return {sceneId:scene.id,targetIds:targets,shapes};
 }finally{if(!wasMinimized)await sheet.maximize?.();}
}

const SYSTEM='10kswordsfoundry',SOCKET=`system.${SYSTEM}`;
/** Region data for an ability area that stays visible to everyone. */
export function abilityAreaRegion({name,shapes,levels=[],color,userId,actorUuid='',combatId=null}){
 const V=globalThis.CONST?.REGION_VISIBILITY,O=globalThis.CONST?.DOCUMENT_OWNERSHIP_LEVELS;
 const ownership={default:O?.OBSERVER??2};if(userId)ownership[userId]=O?.OWNER??3;
 return {name:`${name} (area)`,color,shapes,levels,visibility:V?.ALWAYS??2,highlightMode:'coverage',displayMeasurements:true,hidden:false,locked:false,ownership,
  flags:{[SYSTEM]:{abilityArea:{actorUuid,combatId,userId:userId??null}}}};
}
/** Creates the persistent area Region directly, or through the active GM when this user cannot create Regions. */
export async function persistAbilityArea({scene,name,shapes,levels,actor}){
 if(!scene||!shapes?.length)return null;
 const combat=globalThis.game?.combats?.find?.(c=>c.started&&c.scene?.id===scene.id)??null;
 const data=abilityAreaRegion({name,shapes,levels,color:game.user.color?.css??game.user.color,userId:game.user.id,actorUuid:actor?.uuid??'',combatId:combat?.id??null});
 const RegionClass=globalThis.CONFIG?.Region?.documentClass;
 const allowed=game.user.isGM||(RegionClass?new RegionClass(data,{parent:scene}).canUserModify(game.user,'create'):false);
 if(allowed)return scene.createEmbeddedDocuments('Region',[data]);
 if(!game.users?.activeGM)throw Error('a GM must be connected to keep it on the scene');
 game.socket.emit(SOCKET,{action:'area-create',sceneId:scene.id,data,userId:game.user.id});
 return null;
}
export function registerAbilityAreas(){
 game.socket?.on(SOCKET,async message=>{
  if(message?.action!=='area-create'||!game.user.isActiveGM)return;
  const scene=game.scenes.get(message.sceneId);if(!scene)return;
  const data=foundry.utils.deepClone(message.data);
  if(!data?.flags?.[SYSTEM]?.abilityArea)return;
  data.behaviors=[];data.ownership={default:CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,[message.userId]:CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER};
  await scene.createEmbeddedDocuments('Region',[data]);
 });
 // When a combat ends, the active GM removes the areas placed during it.
 Hooks.on('deleteCombat',async combat=>{
  if(!game.user.isActiveGM||!combat.scene)return;
  const ids=combat.scene.regions.filter(r=>r.getFlag(SYSTEM,'abilityArea')?.combatId===combat.id).map(r=>r.id);
  if(ids.length)await combat.scene.deleteEmbeddedDocuments('Region',ids);
 });
}
