function numericPath(root,path){
 let value=root;
 for(const part of path.split('.')){
  if(['__proto__','prototype','constructor'].includes(part.toLowerCase())||!value||typeof value!=='object')throw new Error(`Unknown effect variable: ${path}`);
  const key=Object.keys(value).find(k=>k.toLowerCase()===part.toLowerCase());
  if(key===undefined)throw new Error(`Unknown effect variable: ${path}`);value=value[key];
 }
 if(typeof value!=='number'||!Number.isFinite(value))throw new Error(`Effect variable must be numeric: ${path}`);
 return value;
}
export function resolveEffectValue(value,effect,target){
 if(typeof value!=='string')return value;
 const item=effect?.parent?.documentName==='Item'?effect.parent:null;
 const itemSystem=item?.system?.toObject?.()??item?.system;
 const actorSystem=target?.system?.toObject?.()??target?.system;
 return value.replace(/@?\b(?:(item|actor)\.)?system\.([a-z_][\w]*(?:\.[a-z_][\w]*)*)/gi,(_,scope,path)=>{
  const root=scope?.toLowerCase()==='actor'?actorSystem:scope?.toLowerCase()==='item'?itemSystem:itemSystem??actorSystem;
  return `(${numericPath(root,path)})`;
 });
}
