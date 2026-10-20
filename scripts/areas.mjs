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
  return {sceneId:scene.id,targetIds:targets,shapes:region.toObject().shapes};
 }finally{if(!wasMinimized)await sheet.maximize?.();}
}
