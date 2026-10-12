export const AMMO = {
  dart:{label:"Dart",family:"launcher"}, bluntDart:{label:"Blunt Dart",family:"launcher",damage:"impact"},
  arrow:{label:"Arrow",family:"bow"}, bluntArrow:{label:"Blunt Arrow",family:"bow",damage:"impact"},
  bolt:{label:"Bolt",family:"crossbow"}, grenadeBolt:{label:"Grenade Bolt",family:"crossbow",damage:"burn",note:"Explodes in a 1 m burst."},
  bullet:{label:"Bullet",family:"gun"}, fireshot:{label:"Fireshot",family:"gun",modifier:"blaze"},
  glaveshot:{label:"Glaveshot",family:"gun",damage:"ruination"}, roundshot:{label:"Roundshot",family:"gun",damage:"impact",modifier:"crushing"},
  custom:{label:"Custom",family:"custom"}
};
export const AMMO_CHOICES=Object.fromEntries(Object.entries(AMMO).map(([key,value])=>[key,value.label]));
export const AMMO_FAMILIES={none:"No ammo / legacy field",launcher:"Launcher",bow:"Bow",crossbow:"Crossbow",gun:"Gun",custom:"Any ammo"};
export function selectedAmmo(actor, weapon, override="") {
  const id=override || weapon.system.ammoId;
  if (!id) {
    if (!['none',undefined].includes(weapon.system.ammoFamily) && !weapon.system.ammo?.type?.trim()) throw new Error("Choose an ammo stack for this weapon.");
    return null;
  }
  const ammo=actor.items.get(id);
  if(ammo?.type!=="ammunition") throw new Error("The selected ammo stack is no longer available.");
  const kind=AMMO[ammo.system.ammoType] ?? AMMO.custom;
  if(![undefined,'none','custom',kind.family].includes(weapon.system.ammoFamily) && kind.family!=='custom') throw new Error("This ammo type does not fit the selected weapon.");
  return {item:ammo,...kind};
}
