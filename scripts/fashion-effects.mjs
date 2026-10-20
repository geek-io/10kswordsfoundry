// Rules 2.0.3 p.135: Avatar of Destruction enlarges Magick patterns, not casting/weapon range.
export const MAGICK_AREA_KEY='system.magickAreaBonus';
export function hermeticAreaEffect(item){
 const name=(item.name??'').trim().replace(/\s+/g,' ');
 if(item.type!=='fashion'||!/^(?:(?:eschatonian|eschitonian)\s+)?hermetics?\s+robes$/i.test(name))return null;
 const effects=item.effects?.contents??item.effects??[];
 if(effects.some(e=>(e.system?.changes??[]).some(c=>c.key===MAGICK_AREA_KEY)))return null;
 return {name:'Avatar of Destruction — Magick area +1 m',img:'systems/10kswordsfoundry/assets/icons/fashion.svg',
  transfer:true,disabled:false,description:'<p>Rules 2.0.3 p.135. While the Hermetic Robes are equipped, Magicks with areas gain +1 m to their pattern size. Casting range is unchanged.</p>',
  system:{changes:[{key:MAGICK_AREA_KEY,type:'add',value:'1',phase:'initial',priority:20}]}};
}
export function prepareFashionEffects(item){
 const effect=hermeticAreaEffect(item);if(!effect)return;
 item.updateSource({effects:[...item.toObject().effects,effect]});
}
export async function ensureFashionEffects(item){
 const effect=hermeticAreaEffect(item);if(effect)await item.createEmbeddedDocuments('ActiveEffect',[effect]);
}
export async function repairFashionEffects(){
 if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
 const items=[...game.items.contents],actors=[...game.actors.contents];
 for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
 for(const actor of actors)items.push(...actor.items.contents);
 const seen=new Set();
 for(const item of items){
  if(seen.has(item.uuid))continue;seen.add(item.uuid);
  await ensureFashionEffects(item);
 }
}
export function magickAreaSize(type,shape,size,actorSystem){
 return type==='magick'&&shape!=='none'?Math.max(0,size+Number(actorSystem.magickAreaBonus??0)):size;
}
