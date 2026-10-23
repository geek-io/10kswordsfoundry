import { AFFINITIES, modifierProfile } from "./modifiers.mjs?v=0.1.51";
export function attackCultivation(system) {
  return AFFINITIES[system.affinity?.trim().toLowerCase()] ?? (system.weaponType === "ranged" ? "grc" : "vio");
}
// Rules 2.0.3 pp.66, 70–71, 73. Position and situational rulings are supplied by the player.
export function combatModifiers(system, input = {}) {
  const targets = Number(input.targets ?? 1), allies = Number(input.allies ?? 0);
  if (!Number.isSafeInteger(targets) || targets < 1 || !Number.isSafeInteger(allies) || allies < 0) throw new Error("Targets must be at least one; adjacent allies cannot be negative.");
  const called = Number(input.called ?? 0);
  if (![0,-1,-3,-6].includes(called)) throw new Error("Choose a valid called shot.");
  const parts=[];
  const add=(label,value)=>{if(value) parts.push({label,value});};
  add("Flanking",allies); add("Cleave",targets>1 && !input.area ? -targets : 0);
  add("Cover",input.cover?-2:0); add("Concealed",input.concealed?-2:0);
  add("Called shot",called); add("Surprise",input.surprise?3:0);
  add("High ground",input.highGround?1:0); add("Ultragravity",input.ultragravity?-2:0);
  add("Sabotaged",input.sabotaged?-2:0);
  add("Dual attack",input.dual?-3:0);
  const range=modifierProfile(system).range;
  let distance=null;
  if(input.distance !== undefined && input.distance !== "") {
    const horizontal=Number(input.distance), vertical=Number(input.height || 0);
    if(!Number.isFinite(horizontal)||horizontal<0||!Number.isFinite(vertical)) throw new Error("Enter a nonnegative distance and a valid elevation difference.");
    distance=Math.max(horizontal,Math.abs(vertical));
    if(system.weaponType !== "ranged" && distance>range) throw new Error(`Target is outside this weapon's ${range} m melee reach.`);
    if(system.weaponType === "ranged" && (distance>range || distance<=1) && input.rangePenalty !== false) add("Ranged distance",-2);
  }
  return {parts, bonus:parts.reduce((sum,part)=>sum+part.value,0), targets, distance, range};
}
