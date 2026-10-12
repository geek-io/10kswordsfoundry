// Rules 2.0.3 pp.100-101, 103. Contextual consequences remain explicit reminders.
export const MODIFIERS = {
  almighty:"Attacks inflict Ruination and ignore Armor.", artifact:"+2 attack dice. Inherent only; cannot be crafted.",
  blaze:"Set the target on fire: 1 Burn at each round end.",
  colossal:"Two-action attack; -2 ATK, -2 MOV, +2 m range, both hands. Each uncancelled 5+ deals +1 Wound; inflict Stun on wounding.",
  concealable:"Can be folded smaller and hidden.", crushing:"Each Wound removes 2 Armor rather than 1.",
  disarming:"+2 on attempts to disarm.", doublehand:"Requires both hands.", electric:"Inflicts Stun.",
  ferocious:"Each uncancelled Critical Strike deals +1 Wound.", focus:"Can replace mudras.",
  mystic:"Attacks inflict Burn and ignore Armor.", holy:"Against Spirits, Demons, or similar entities: Ruination and +1 Wound per uncancelled Critical Strike.",
  frost:"Inflicts Hobble.", great:"-1 MOV, +1 m range, both hands, and Ferocious. Cannot combine with Colossal.",
  lacerating:"On wounding, the target bleeds; subsequent attacks against them deal +1 Wound.",
  piercing:"Ignores Armor.", precise:"Reroll 1s.", psionic:"Attacks inflict Trauma and ignore Armor.",
  unblockable:"Cannot be blocked, parried, or deflected. Inherent only; cannot be crafted.",
  undodgeable:"Cannot be dodged or avoided. Inherent only; cannot be crafted.", reach:"+1 m range.",
  ritual:"+1 to ritual and prayer checks.", shield:"+1 Defense while wielded.", thundering:"Audible up to 50 m.",
  toxic:"Quick Poison: every 10 minutes, Demand 3 SPI or 2 Burn.", visceral:"+1 ATK against a target with no Armor.",
  worn:"Worn or attached; cannot be disarmed."
};
export const MODIFIER_CHOICES = Object.fromEntries(Object.keys(MODIFIERS).map(key=>[key,key.toUpperCase()]));
export const AFFINITIES={brute:"vio",nimble:"grc",noetic:"dia",keen:"sav",lyric:"wrd",occult:"spi"};
export function modifierKeys(system, ammo = null) {
  const keys = new Set(Object.entries(system.properties ?? {}).filter(([,value])=>value).map(([key])=>key));
  for (const mod of system.mods ?? []) {
    const key=(mod.rule || mod.name || "").trim().toLowerCase();
    if (key in MODIFIERS) keys.add(key);
  }
  if (ammo?.modifier) keys.add(ammo.modifier);
  if (keys.has("great")) {keys.add("ferocious");keys.add("doublehand");}
  if (keys.has("colossal")) keys.add("doublehand");
  return keys;
}
export function modifierProfile(system, {unarmored=false,holyTarget=false,ammo=null}={}) {
  const keys=modifierKeys(system,ammo);
  const conversions=new Set(ammo?.damage?[ammo.damage]:[]);
  if(keys.has("mystic")) conversions.add("burn");
  if(keys.has("psionic")) conversions.add("trauma");
  if(keys.has("almighty") || (keys.has("holy") && holyTarget)) conversions.add("ruination");
  const damageTypes=conversions.size?[...conversions]:[system.damageType||'cut'];
  const damage=damageTypes.join(' / ');
  return {keys:[...keys], attack:(keys.has("artifact")?2:0)-(keys.has("colossal")?2:0)+(keys.has("visceral")&&unarmored?1:0),
    movement:keys.has("colossal")?-2:keys.has("great")?-1:0,
    range:Number(system.range??1)+(keys.has("colossal")?2:0)+(keys.has("great")?1:0)+(keys.has("reach")?1:0),
    hands:keys.has("doublehand")?2:1, actions:keys.has("colossal")?2:1, precise:keys.has("precise"),
    damage, ignoresArmor:keys.has("piercing") || damageTypes.every(type=>["burn","trauma","ruination"].includes(type)),
    armorPerWound:keys.has("crushing")?2:1,
    criticalExtra:(keys.has("ferocious")?1:0)+(keys.has("holy")&&holyTarget?1:0),
    fivePlusExtra:keys.has("colossal")?1:0,
    reminders:[...(damageTypes.length>1?['Multiple damage conversions apply; resolve which Wound type applies at the table.']:[]),...[...keys].map(key=>`${key.toUpperCase()}: ${MODIFIERS[key]}`).filter(Boolean)]};
}
