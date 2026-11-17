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
/** A short ammo readout for a ranged weapon: the loaded magazine, a linked stack, or the family pool the actor carries.
 *  Returns {count, label, kind} or null when the weapon tracks no ammo. Pure (no Foundry calls beyond item reads). */
export function ammoSummary21(actor, weapon) {
  const sys = weapon?.system ?? {};
  const items = actor?.items?.contents ?? [];
  const get = id => items.find(item => item.id === id || item._id === id) ?? null;
  const n = value => (Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0);
  if (sys.ammo?.type?.trim()) return {count: n(sys.ammo.quantity), label: sys.ammo.type.trim(), kind: "magazine"};
  if (sys.ammoId) {
    const stack = get(sys.ammoId);
    if (stack?.type === "ammunition") return {count: n(stack.system?.quantity), label: stack.name, kind: "stack"};
  }
  const family = sys.ammoFamily;
  if (family && !["none", undefined].includes(family)) {
    const stacks = items.filter(item => item.type === "ammunition"
      && (family === "custom" || (AMMO[item.system?.ammoType] ?? AMMO.custom).family === family || (AMMO[item.system?.ammoType] ?? AMMO.custom).family === "custom"));
    if (stacks.length) return {count: stacks.reduce((sum, item) => sum + n(item.system?.quantity), 0), label: `${AMMO_FAMILIES[family] ?? family} ammo`, kind: "family"};
  }
  return null;
}

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
