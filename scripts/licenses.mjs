import { CULTIVATIONS } from "./rules.mjs?v=0.1.45";

// Rules 2.0.3, PDF pp.127-185: ordered by first license page.
export const SECTS = Object.freeze({
  asuri: { name: "Asuri", page: 127 },
  aswang: { name: "Aswang", page: 131 },
  eschatonian: { name: "Eschatonian", page: 135 },
  fangshi: { name: "Fangshi", page: 139 },
  houyi: { name: "Houyi", page: 143 },
  immanent: { name: "Immanent", page: 147 },
  jyotisha: { name: "Jyotisha", page: 151 },
  katalonan: { name: "Katalonan", page: 155 },
  mendicant: { name: "Mendicant", page: 159 },
  nezha: { name: "Nezha", page: 163 },
  "sword-dialectician": { name: "Sword Dialectician", page: 167 },
  techgnostic: { name: "Techgnostic", page: 171 },
  ultramystic: { name: "Ultramystic", page: 175 },
  wukong: { name: "Wukong", page: 179 },
  zhongkui: { name: "Zhongkui", page: 183 }
});
export const LICENSE_CHOICES = Object.freeze(Object.fromEntries(
  Object.entries(SECTS).flatMap(([key, sect]) => ["Novice", "Expert", "Master"].map(rank =>
    [`${key}.${rank.toLowerCase()}`, `${sect.name} - ${rank}`]))
));
export const LICENSE_DENIED = "You do not meet the qualifications of this license";

export function qualifiesForLicense(actorSystem, licenseSystem) {
  const requirements = licenseSystem.prerequisites ?? {};
  return Object.keys(CULTIVATIONS).every(key =>
    Number(actorSystem.cultivations?.[key] ?? 0) >= Number(requirements[key] ?? 0))
    && Number(actorSystem.sidhi ?? 0) >= Number(requirements.sidhi ?? 0);
}

export const RANKS={novice:'Novice',expert:'Expert',master:'Master'};
export function licenseIdentity(system={}) {
 const legacy=LICENSE_CHOICES[system.sect];
 return legacy?{sect:SECTS[system.sect.split('.')[0]].name,rank:system.rank||system.sect.split('.')[1]}:{sect:system.sect??'',rank:system.rank||'novice'};
}
export function licenseLabel(system){const {sect,rank}=licenseIdentity(system);return `${sect} - ${RANKS[rank]??rank}`;}
