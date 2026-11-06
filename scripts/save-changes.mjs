// Document#update resolves to undefined both when a hook cancels the update and when nothing would change
// (for example a 0 AP, 0 Flame special attack). Only the first is a failure.
export async function saveChanges(document,changes,options={}){
 let diff=null;
 try{diff=document.updateSource(foundry.utils.deepClone(changes),{dryRun:true,recursive:options.recursive});}catch{diff=null;}
 if(diff&&foundry.utils.isEmpty(diff))return true;
 return !!(await document.update(changes,options));
}
