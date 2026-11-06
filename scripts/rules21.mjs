// Rules 2.1 (from 0.2.13: the 2.1 Alpha, 56 pp.; earlier: the Red Kalpa Manuscript). Pure helpers, independent of Foundry
// for deterministic testing. Older page references use the manuscript's PDF page numbers; "Alpha p." marks the 2.1 Alpha.
// The 2.0.3 rules never import this module.

export const RULES_SETTING = "rulesVersion";
export const RULES_CHOICES = Object.freeze({"2.0": "2.0.3 — established", "2.1": "2.1 Alpha — testing"});

// p.5: six Cores replace the six 2.0 Cultivations, one to one. The 2026-11 test run renamed Voice to Face and
// Spirit to Heart (the 2.1 sect spoilers already print FACE and HEART). The data keys stay voc and spi.
export const CORES = Object.freeze({
  phy: {label: "Physique", abbr: "PHY", from: "vio", aliases: [], text: "How well built the body is and the ability to move it."},
  mot: {label: "Motorics", abbr: "MOT", from: "grc", aliases: [], text: "Movement, coordination, body balance, and general locomotion."},
  mnd: {label: "Mind", abbr: "MND", from: "dia", aliases: [], text: "Raw intellectual and rational capacity and reasoning."},
  wit: {label: "Wits", abbr: "WIT", from: "sav", aliases: [], text: "Reaction speed, quickness of thinking, and awareness."},
  voc: {label: "Face", abbr: "FAC", from: "wrd", aliases: ["Voice", "VOC", "Word"], text: "Charisma, charm, likability, and inherent magnetism."},
  spi: {label: "Heart", abbr: "HRT", from: "spi", aliases: ["Spirit", "SPI"], text: "Irrationality, emotional intelligence, feeling, and instinct."}
});
export const CORE_KEYS = Object.freeze(Object.keys(CORES));
/** Maps a 2.0 Cultivation key (vio, grc, …) to its 2.1 Core key. */
export const CORE_FROM_20 = Object.freeze(Object.fromEntries(Object.entries(CORES).map(([key, core]) => [core.from, key])));

// pp.77–85: the 30 basic Cultivations, rated 0–5 Stars. `core` is a convenience default for the
// roll dialog only; the table chooses the Core that fits the action (p.5).
export const CULTIVATIONS_21 = Object.freeze({
  adamance: {label: "Adamance", core: "phy", page: 77, text: "Resistance, endurance, perseverance; hunger, thirst, heat, cold, sleeplessness."},
  aestheticGlossolalia: {label: "Aesthetic Glossolalia", core: "voc", page: 78, text: "Expression and art: writing, music, image, movement, performance."},
  beastShrine: {label: "Beast Shrine", core: "phy", page: 78, text: "Close-range violence, weapons, pugilism, grappling, guarding."},
  bleedingHeart: {label: "Bleeding Heart", core: "voc", page: 78, text: "Empathy; appeal to emotions, understand feelings."},
  chronicle: {label: "Chronicle", core: "mnd", page: 78, text: "Academia, history, literature, philosophy; scholarly research."},
  concreteAnalysis: {label: "Concrete Analysis", core: "wit", page: 79, text: "Investigation, evidence, reconstructing events."},
  cultOfPersonality: {label: "Cult of Personality", core: "voc", page: 79, text: "Presence, charisma, speeches, commanding attention."},
  cyberneticHaruspex: {label: "Cybernetic Haruspex", core: "mnd", page: 79, text: "The Intrajala: programming, networks, machine interfaces."},
  dialectics: {label: "Dialectics", core: "mnd", page: 80, text: "Logic, syllogism, philosophy, mathematics, contradictions."},
  espionage: {label: "Espionage", core: "wit", page: 80, text: "Spycraft, surveillance, operational security."},
  handEye: {label: "Hand-Eye Coordination", core: "mot", page: 80, text: "Dexterity, sleight of hand, locks, aiming guns and bows."},
  machinePhysics: {label: "Machine Physics", core: "mnd", page: 80, text: "Engineering; diagnosing, repairing, modifying machines."},
  mandateOfHeaven: {label: "Mandate of Heaven", core: "mnd", page: 81, text: "Law: national, international, and (at 5 Stars) Cosmic."},
  manualLabor: {label: "Manual Labor", core: "phy", page: 81, text: "Work, fabrication, toil, construction, maintenance."},
  materialGnosis: {label: "Material Gnosis", core: "mnd", page: 81, text: "Sciences and natural philosophy; experiment and measurement."},
  mechanizedSeance: {label: "Mechanized Seance", core: "mot", page: 81, text: "Flight and spacecraft operation; Mobile Armors."},
  organizing: {label: "Organizing", core: "mnd", page: 82, text: "Organization, mobilization, logistics, budgets."},
  pavementSutra: {label: "Pavement Sutra", core: "wit", page: 82, text: "Street-smarts: lodgings, work, passage, rumors."},
  peripheralOracle: {label: "Peripheral Oracle", core: "wit", page: 82, text: "Senses: observation, listening, searching."},
  plutomancy: {label: "Plutomancy", core: "mnd", page: 82, text: "Economics, value, class relations, finance."},
  primevalMind: {label: "Primeval Mind", core: "wit", page: 83, text: "Survival: foraging, tracking, shelter, weather, beasts."},
  pulitika: {label: "Pulitika", core: "mnd", page: 83, text: "Politics, power, the art of war."},
  shadowPraxis: {label: "Shadow Praxis", core: "mot", page: 83, text: "Stealth: concealment, quiet movement, stalking."},
  spitInTheFace: {label: "Spit In The Face Of God", core: "voc", page: 83, text: "Lying, bluffing, socializing, reading behavior."},
  stillness: {label: "Stillness", core: "spi", page: 84, text: "Composure, meditation, deliberate action under duress."},
  succorTriage: {label: "Succor and Triage", core: "mnd", page: 84, text: "Medicine: first aid, diagnosis, treatment, surgery."},
  susurration: {label: "Susurration", core: "spi", page: 84, text: "Spiritual perception of xenolifeforms and anomalies."},
  thewsSinews: {label: "Thews And Sinews", core: "phy", page: 85, text: "Athletics: running, climbing, swimming, lifting."},
  weaponOfCritique: {label: "Weapon of Critique", core: "voc", page: 85, text: "Rhetoric and argument; debating, explaining ideas."},
  wheelCommunion: {label: "Wheel Communion", core: "mot", page: 85, text: "Land and near-surface vehicles; cycles, skeiners."}
});
export const CULTIVATION_KEYS_21 = Object.freeze(Object.keys(CULTIVATIONS_21));
export const MAX_STARS = 5;

// Alpha pp.44–48 (RK pp.45–49, older edition pp.86–96): d36 starting Assets. [5][5] is absent from the rules.
export const ASSETS_21 = Object.freeze({
  debt: {code: "11", label: "Debt", min: 1, max: 5, page: 44},
  capital: {code: "12", label: "Capital", min: 1, max: 5, page: 44},
  jadeComplexion: {code: "13", label: "Jade Complexion Beauty", min: 1, max: 5, page: 44},
  wroughtLimb: {code: "14", label: "Wrought Limb", min: 1, max: 4, page: 44},
  standing: {code: "15", label: "Standing", min: 1, max: 5, page: 45},
  reputation: {code: "16", label: "Reputation", min: 1, max: 5, page: 45},
  loomAccess: {code: "21", label: "Loom Access", min: 1, max: 4, page: 45},
  mountainFrame: {code: "22", label: "Mountain Frame", min: 1, max: 3, page: 45},
  ghostEar: {code: "23", label: "Ghost Ear", min: 1, max: 3, page: 45},
  patron: {code: "24", label: "Patron", min: 1, max: 5, page: 46},
  intraIntBond: {code: "25", label: "Intra-Int Bond", min: 3, max: 3, page: 46},
  hollowConscience: {code: "26", label: "Hollow Conscience", min: 1, max: 3, page: 46},
  sheerStoneHeart: {code: "31", label: "Sheer Stone Heart", min: 1, max: 3, page: 46},
  longCon: {code: "32", label: "Long Con", min: 1, max: 3, page: 46},
  rawNerve: {code: "33", label: "Raw Nerve", min: 1, max: 3, page: 46},
  narcissus: {code: "34", label: "Narcissus", min: 1, max: 3, page: 47},
  wallflower: {code: "35", label: "Wallflower", min: 1, max: 3, page: 47},
  karmicAgent: {code: "36", label: "Karmic Agent", min: 1, max: 3, page: 47},
  anvilHead: {code: "41", label: "Anvil Head", min: 1, max: 3, page: 47},
  springTendonLegs: {code: "42", label: "Spring-Tendon Legs", min: 1, max: 3, page: 47},
  pythonGrip: {code: "43", label: "Python Grip", min: 1, max: 3, page: 47},
  beastlyClaws: {code: "44", label: "Beastly Claws", min: 1, max: 3, page: 47},
  venomGlands: {code: "45", label: "Venom Glands", min: 1, max: 3, page: 47},
  hummingbirdPulse: {code: "46", label: "Hummingbird Pulse", min: 1, max: 3, page: 47},
  thirdEyeOpen: {code: "51", label: "Third Eye Open", min: 1, max: 1, page: 47},
  spineTerminalPort: {code: "52", label: "Spine Terminal Port", min: 2, max: 2, page: 47},
  tacticianSoul: {code: "53", label: "Tactician Soul", min: 2, max: 2, page: 47},
  compartmentalMind: {code: "54", label: "Compartmental Mind", min: 1, max: 3, page: 48},
  adamantWill: {code: "56", label: "Adamant Will", min: 1, max: 3, page: 48},
  archivalMemory: {code: "61", label: "Archival Memory", min: 1, max: 3, page: 48},
  sleeplessSoul: {code: "62", label: "Sleepless Soul", min: 1, max: 5, page: 48},
  gutterTongue: {code: "63", label: "Gutter Tongue", min: 1, max: 3, page: 48},
  armory: {code: "64", label: "Armory", min: 1, max: 3, page: 48},
  cargoLineSlot: {code: "65", label: "Cargo Line Slot", min: 1, max: 5, page: 48},
  reincarnationInsurance: {code: "66", label: "Reincarnation Insurance", min: 2, max: 5, page: 48},
  custom: {code: "", label: "Custom / other", min: 0, max: 5, page: null}
});

// p.31: hit locations, mapped to a d6.
export const PARTS = Object.freeze({
  rleg: {label: "Right Leg", d6: 1, limb: true},
  lleg: {label: "Left Leg", d6: 2, limb: true},
  rarm: {label: "Right Arm", d6: 3, limb: true},
  larm: {label: "Left Arm", d6: 4, limb: true},
  torso: {label: "Torso", d6: 5, limb: false},
  head: {label: "Head", d6: 6, limb: false}
});
export const PART_KEYS = Object.freeze(Object.keys(PARTS));
// Red Kalpa Manuscript (53 pp.) p.14: each Part has [3 + PHYSIQUE] HP.
export const BASE_PART_HP = 3;

// 2.1 playtest Sects (2026-11-06) renamed every Sect Cultivation. Older names (and the Alpha's own names, p.56)
// still count for Licenses and formulas, so existing characters keep their Esoteric Cultivations.
export const SECT_CULTIVATIONS_21 = Object.freeze({
  "Demon Body": ["Devil Tiger Blade", "Devil Body"],
  "Devil Beast": ["Liver Eating", "Shadow Beast"],
  "Sky Dragon": ["Heaven Raving Dragon"],
  "Black Sorcery": ["Eskaton Magick", "Eskaton Sorcery"],
  "Internal Elixir": [],
  "Solar Bow": ["Sun Piercing Killing Wind", "Sun-Piercing Killing Wind"],
  "White Sorcery": [],
  "Astral": ["Astral Cultivation"],
  "Divine Communion": [],
  "Vajra Fist": ["Dog Laughs At God"],
  "Red Gun": ["Fire Lancing"],
  "Sword Dialectics": [],
  "Techgnosis": ["Techgnosticism"],
  "Immortal Science": ["The Immortal Science"],
  "Sage Body": ["Great Sage Style"],
  "Spirit Binding": []
});
export const partFromD6 = roll => PART_KEYS.find(key => PARTS[key].d6 === roll) ?? null;

// pp.13, 32–36: states that alter Checks or Openings. Kept separate from the 2.0 conditions.
export const CONDITIONS_21 = Object.freeze({
  bleeding: {label: "Bleeding", page: 34, text: "-2 to physical Checks (Physique or Motorics) until staunched."},
  stunned: {label: "Stunned", page: 34, text: "Cannot do anything until the head clears (3 seconds after a failed Stun Check)."},
  knockdown: {label: "Knocked Down", page: 35, text: "Move only 2 m/s and -2 to all Actions until you get up."},
  juggled: {label: "Juggled", page: 35, text: "Spinning in the air: lose all Openings and cannot Counter; attackers gain +2 dice."},
  burning: {label: "Burning", page: "Alpha 16–17", text: "Whole body: 2 damage to a random Part every 3 seconds, ignoring Soak; -2 to all Checks. A Quick Opening pats out a small fire, a Solid Opening smothers it (and knocks you down); water ends it. Inferno: 3 damage per Cut, only drowned or starved."},
  suppressed: {label: "Suppressed", page: "Alpha 10", text: "Pinned by Suppression Fire: duck into cover or run out of the area; no other action for 3 seconds or until the Cut ends."},
  samadhi: {label: "Samadhi", page: "Alpha 53", text: "+2 to all Checks and ignore all dice penalties; heal 1 burnt Flame per 3 seconds; Samadhi Technicks and Magicks are open."},
  encumbered: {label: "Encumbered", page: 63, text: "-4 to all Checks."},
  drunk: {label: "Drunk", page: 14, text: "-2 to all actions until sober."},
  deviation: {label: "Sidhi Deviation", page: 18, text: "Every Cultivation falls to 1; learned Magicks and Technicks cannot be used."}
});

export const ATTACHMENT_STRENGTHS = Object.freeze({1: "Held", 2: "Firm", 3: "Heart"});

const int = value => Math.trunc(Number(value) || 0);
const stars = value => Math.max(0, Math.min(MAX_STARS, int(value)));

/** Total Stars held in an Asset key across the actor's Asset list. */
export function assetStars(assets = [], key) {
  return (assets ?? []).filter(asset => asset?.key === key).reduce((sum, asset) => sum + Math.max(0, int(asset.stars)), 0);
}

/** Assets as {key, stars} entries: Asset items plus any rows left in the older Asset list. */
export function allAssets21(system, items = []) {
  const owned = (items ?? []).filter(item => item?.type === "asset").map(item => ({key: item.system?.key ?? "custom", stars: int(item.system?.stars), name: item.name}));
  return [...(system?.assets ?? []), ...owned];
}

/** HP per Part: 3 + Physique (RK p.14), plus Mountain Frame (p.46) and Anvil Head (p.48). */
export function partMaximum(key, {bonus = 0, assets = [], physique = 0} = {}) {
  let max = BASE_PART_HP + Math.max(0, int(physique)) + int(bonus);
  const frame = assetStars(assets, "mountainFrame");
  if (key === "torso" && frame >= 1) max += 1;
  else if (PARTS[key]?.limb && frame >= 2) max += 1;
  else if (key === "head" && frame >= 3) max += 1;
  if (key === "head") {
    const anvil = assetStars(assets, "anvilHead");
    max += anvil >= 3 ? 2 : anvil >= 2 ? 1 : 0;
  }
  return Math.max(1, max);
}

/** Alpha p.11: a Part is Cleaved at the negative of half its maximum HP, rounded down (-2 for 5 HP). At least -1, so Disabled and Cleaved stay distinct. */
export const cleaveDepth = max => Math.max(1, Math.floor(Math.max(0, int(max)) / 2));

/** 0 HP disables a Part; reaching -[half its maximum, rounded down] cleaves it (Alpha p.11). Damage is stored, HP is derived. */
export function partState(max, damage) {
  const depth = cleaveDepth(max);
  const capped = Math.max(0, Math.min(max + depth, int(damage)));
  const hp = max - capped, cleaved = hp <= -depth;
  return {max, damage: capped, hp, cleaveAt: -depth, disabled: hp <= 0, cleaved, status: cleaved ? "Cleaved" : hp <= 0 ? "Disabled" : capped ? "Wounded" : "Whole"};
}

/** p.38/p.66: damage into an armoured Part removes Soak first. Crushing needs 2 Soak per point. */
export function applyPartDamage({max, damage = 0, soak = 0}, amount, {crushing = false, ignoreSoak = false, soakPerPoint = null} = {}) {
  const incoming = Math.max(0, int(amount));
  const cost = Math.max(1, int(soakPerPoint ?? (crushing ? 2 : 1)));
  const available = Math.max(0, int(soak));
  const absorbed = ignoreSoak ? 0 : Math.min(incoming, Math.floor(available / cost));
  const soakLoss = absorbed * cost;
  const before = partState(max, damage);
  const after = partState(max, before.damage + incoming - absorbed);
  return {absorbed, soakLoss, hpLoss: after.damage - before.damage, overflow: before.damage + incoming - absorbed - after.damage,
    before, after, newlyDisabled: !before.disabled && after.disabled, newlyCleaved: !before.cleaved && after.cleaved};
}

/** pp.14, 31: one point heals per X days, X being the Part's current damage; doubled without rest and meals. */
export function healingDays(damage, {sheltered = true} = {}) {
  const current = Math.max(0, int(damage));
  if (!current) return {next: 0, full: 0};
  let full = 0;
  for (let d = current; d > 0; d--) full += d;
  const factor = sheltered ? 1 : 2;
  return {next: current * factor, full: full * factor};
}

/** pp.10, 94: Speed = Physique + Wits + Peripheral Oracle + Stillness (+ Hummingbird Pulse). */
export function speed(system) {
  return int(system.cores?.phy) + int(system.cores?.wit) + int(system.skills?.peripheralOracle) + int(system.skills?.stillness)
    + int(system.speedBonus) + assetStars(system.assets, "hummingbirdPulse");
}

/** p.39 and Assets: Morale maximum = Heart + Stillness, plus effects and equipped gear. */
export function moraleMaximum(system, gearBonus = 0) {
  return Math.max(0, int(system.cores?.spi) + int(system.skills?.stillness) + int(system.moraleBonus) + int(gearBonus));
}

/** p.63: Carry Limit = 10 kg + Physique × 10 kg. */
export function carryLimit(system) { return 10 + 10 * Math.max(0, int(system.cores?.phy)); }

/** Alpha p.14: Basic Move = Physique + Motorics m/s (swimming and other 3D movement at half); within a Sword, move up to that per
 * second of the Cut, split as you like. p.32 disabled legs; p.35 knockdown; p.63 overload; Spring-Tendon Legs; Movement bonus. */
export function movement(system, {disabledLegs = 0, carriedKg = 0, cutSeconds = 3} = {}) {
  const bonus = int(system.moveBonus) + assetStars(system.assets, "springTendonLegs");
  let basic = Math.max(0, int(system.cores?.phy)) + Math.max(0, int(system.cores?.mot)) + bonus;
  const notes = [];
  const over = Math.max(0, Number(carriedKg) - carryLimit(system));
  const overload = Math.floor(over / 10);
  if (overload) {
    basic = Math.max(1, basic - overload);
    notes.push(`Over Carry Limit: -${overload} m/s.`);
  }
  if (disabledLegs >= 2) {
    basic = 0;
    notes.push("Both legs Disabled: crawl only.");
  } else if (disabledLegs === 1) {
    basic = Math.floor(basic / 2);
    notes.push("One leg Disabled: Movement halved.");
  }
  if (system.conditions21?.knockdown) {
    basic = Math.min(2, basic);
    notes.push("Knocked Down: 2 m/s until you get up.");
  }
  basic = Math.max(0, basic);
  const seconds = Math.max(1, int(cutSeconds));
  return {basic, swim: Math.floor(basic / 2), perCut: basic * seconds, cutSeconds: seconds, notes, overloadKg: over};
}

/** Automatic Check modifiers that follow from the character's state (pp.13–14, 32–35, 63; Alpha pp.16–17, 52–53). */
export function stateModifiers(system, {core = "", disabledTorso = false} = {}) {
  const c = system.conditions21 ?? {};
  let parts = [];
  if (disabledTorso) parts.push({label: "Torso Disabled (winded)", value: -4});
  if (c.encumbered) parts.push({label: "Encumbered", value: -4});
  if (c.knockdown) parts.push({label: "Knocked Down", value: -2});
  if (c.drunk) parts.push({label: "Drunk", value: -2});
  if (c.burning) parts.push({label: "Burning", value: -2});
  if (c.bleeding && ["phy", "mot"].includes(core)) parts.push({label: "Bleeding (physical Check)", value: -2});
  const fatigue = Math.max(0, int(system.fatigue) - assetStars(system.assets, "sleeplessSoul"));
  if (fatigue) parts.push({label: "Fatigue", value: -fatigue});
  const scorch = Math.max(0, int(system.scorch));
  if (scorch) parts.push({label: "Scorch", value: -scorch});
  const samadhi = !!c.samadhi;
  if (samadhi) parts = [...parts.filter(part => part.value > 0), {label: "Samadhi (penalties ignored)", value: 2}];
  return {total: parts.reduce((sum, part) => sum + part.value, 0), parts, ignorePenalties: samadhi};
}

/** Alpha p.53: Samadhi ignores every dice penalty. Drops negative situational modifiers when it applies. */
export const withoutPenalties = (mods, ignore) => ignore ? mods.filter(mod => mod.value >= 0) : mods;

/** Alpha p.53 Flow: rolling Strikes equal to the Demand + 3 enters Samadhi for 3 seconds. */
export const entersFlow = (strikes, demand) => int(strikes) >= int(demand) + 3;

/** p.5: Core + Cultivation. Nonpositive pools keep the 2.0 two-dice keep-lowest fallback (see p.13's "0 Check"). */
export function checkFormula21(pool) {
  if (!Number.isSafeInteger(pool)) throw new TypeError("Dice pool must be an integer.");
  return pool <= 0 ? "2d6kl1cs>=4" : `${pool}d6cs>=4`;
}

/** Opening rank of one KILL THE BUDDHA die (2026-11 test run): 1 Whiff, 2–3 Quick, 4–5 Solid, 6 Perfect. */
export function openingRank(value) {
  if (!Number.isInteger(value) || value < 1 || value > 6) throw new RangeError("Expected d6 results.");
  return value === 6 ? "perfect" : value >= 4 ? "solid" : value >= 2 ? "quick" : "whiff";
}

/** KILL THE BUDDHA Openings. `strikes` still counts dice of 4+ (Shoot Demand, random hit locations); `total` counts every Opening. */
export function openings(results = []) {
  const counts = {whiff: 0, quick: 0, solid: 0, perfect: 0};
  for (const value of results) counts[openingRank(value)]++;
  return {...counts, strikes: results.filter(value => value >= 4).length, total: counts.quick + counts.solid + counts.perfect};
}

/** p.25: two Openings of the same rank may fuse into one of the next rank; at most one extra Perfect this way. */
export function fusionOptions({quick = 0, solid = 0, perfect = 0} = {}) {
  return {quickToSolid: Math.floor(quick / 2), solidToPerfect: Math.min(1, Math.floor(solid / 2)), perfect};
}

/** RK p.17 Gambits: one predetermined Opening per die, in the repeating sequence Quick → Quick → Solid → Perfect (minimum one). */
export function staticOpenings(pool) {
  const dice = Math.max(1, Math.max(0, int(pool)));
  const counts = {whiff: 0, quick: 0, solid: 0, perfect: 0};
  for (let i = 0; i < dice; i++) counts[["quick", "quick", "solid", "perfect"][i % 4]]++;
  return {...counts, strikes: counts.solid + counts.perfect, total: dice};
}

/** p.29: ranged distance penalties, and -4 beyond the weapon's range. */
export function rangePenalty(distance, weaponRange = Infinity) {
  const d = Number(distance);
  if (!Number.isFinite(d) || d < 0) return {value: 0, label: "Distance not entered"};
  let value = d <= 15 ? 0 : d <= 30 ? -1 : d <= 60 ? -2 : d <= 120 ? -3 : d <= 240 ? -4 : d <= 400 ? -5 : -5 - Math.ceil((d - 400) / 100);
  const beyond = Number.isFinite(Number(weaponRange)) && d > Number(weaponRange);
  if (beyond) value -= 4;
  return {value, beyond, label: `${d} m${beyond ? " (beyond weapon range, -4)" : ""}`};
}

/** pp.22, 29, 64–67: how a measured target distance relates to the weapon's Reach or Firefight range. */
export function targetReach(profile, distance) {
  const d = distance === null || distance === "" ? NaN : Number(distance);
  if (!Number.isFinite(d) || d < 0) return {distance: null, penalty: 0, label: "distance unknown", warning: ""};
  const rounded = Math.round(d * 10) / 10;
  if (profile?.ranged) {
    const band = rangePenalty(rounded, profile.range);
    return {distance: rounded, penalty: band.value, label: `${rounded} m · range ${band.value >= 0 ? "+" : ""}${band.value}`, warning: band.beyond ? `beyond weapon range ${profile.range} m` : ""};
  }
  const reach = Number(profile?.range ?? 1);
  return {distance: rounded, penalty: 0, label: `${rounded} m`, warning: rounded > reach ? `beyond Reach ${reach} m` : ""};
}

/** pp.29–30: Shoot, Burst (+Rate dice), Full Auto (+Rate × 3 dice). Burst/Full Auto require AUTO and ≤30 m. */
export function firingMode(mode, {rate = 1, auto = false, distance = null} = {}) {
  const r = Math.max(1, int(rate));
  if (mode === "shoot") return {dice: 0, shots: null, random: false, label: "Shoot"};
  if (!auto) throw new Error("Burst and Full Auto require a weapon with the AUTO mod.");
  if (distance !== null && distance !== "" && Number(distance) > 30) throw new Error("Burst and Full Auto only work within 30 m.");
  if (mode === "burst") return {dice: r, shots: r, random: true, label: `Burst (+${r} dice)`};
  if (mode === "full") return {dice: r * 3, shots: r * 3, random: true, label: `Full Auto (+${r * 3} dice)`};
  throw new Error("Unknown firing mode.");
}

// pp.64–66: Grips, Profiles and Modifiers.
export const GRIPS = Object.freeze({hilt: {label: "Hilt", mods: 2}, haft: {label: "Haft", mods: 3}, riser: {label: "Riser", mods: 3}, stock: {label: "Stock", mods: 2}});
export const PROFILES = Object.freeze({
  empty: {label: "Empty Hand", grip: null, core: "phy", skill: "beastShrine", range: 1, ranged: false, damage: 1, note: "Deals 1 damage; usually needed to establish Control."},
  dagger: {label: "Dagger", grip: "hilt", core: "phy", skill: "beastShrine", range: 1, ranged: false, note: "Perfect Opening: Stab any Part, ignoring Soak."},
  saber: {label: "Saber", grip: "hilt", core: "phy", skill: "beastShrine", range: 1, ranged: false, note: "Chop: a Perfect Opening chops through a Limb for +1 damage."},
  sword: {label: "Sword", grip: "hilt", core: "phy", altCore: "mot", skill: "beastShrine", range: 1, ranged: false, note: "Physique or Motorics + Beast Shrine."},
  whip: {label: "Whip", grip: "hilt", core: "mot", skill: "thewsSinews", range: 3, ranged: false, note: "Farther reach, harder to wield."},
  bludgeon: {label: "Bludgeon", grip: "haft", core: "phy", skill: "beastShrine", range: 1, ranged: false, note: "Perfect Opening against a Soaked Part removes 2 Soak instead of 1."},
  cleaver: {label: "Cleaver", grip: "haft", core: "phy", skill: "beastShrine", range: 1, ranged: false, note: "Versatile: +1 to Primeval Mind Checks."},
  polearm: {label: "Polearm", grip: "haft", core: "phy", skill: "beastShrine", range: 3, ranged: false, note: "Farther effective reach."},
  launcher: {label: "Launcher", grip: "haft", core: "mot", skill: "handEye", range: 20, ranged: true, note: "Slings, slingshots, slingstaffs."},
  bow: {label: "Bow", grip: "riser", core: "mot", skill: "handEye", range: 250, ranged: true, note: "Requires Arrows; Rate 1."},
  crossbow: {label: "Crossbow", grip: "stock", core: "mot", skill: "handEye", range: 125, ranged: true, note: "Requires Bolts; silent."},
  handgun: {label: "Handgun", grip: "stock", core: "mot", skill: "handEye", range: 30, ranged: true, note: "Short bullets; revolvers by the bullet, 12-round magazines."},
  longgun: {label: "Longgun", grip: "stock", core: "mot", skill: "handEye", range: 400, ranged: true, note: "Long gun bullets; magazines."}
});
export const WEAPON_MODS_21 = Object.freeze({
  auto: "AUTO — Burst and Full Auto",
  crushing: "CRUSHING — 2 Soak per damage soaked",
  great: "GREAT — two hands, -1 violence Checks, +1 damage",
  colossal: "COLOSSAL — two hands, -1 violence Checks, +2 damage, Knockback",
  doublehand: "DOUBLEHAND — requires both hands",
  focus: "FOCUS — replaces Mudras",
  blaze: "BLAZE — 2-in-6 chance to set the Part on fire",
  artifact: "ARTIFACT — +1 damage, double Durability, +2 to Kill The Buddha",
  smashing: "SMASHING — triple damage against Durability"
});

/** Profile and modifiers for a weapon's 2.1 data; unconfigured weapons fall back to their 2.0 melee/ranged type. */
export function weaponProfile21(weapon) {
  const r21 = weapon?.r21 ?? {};
  const fallback = weapon?.weaponType === "ranged" ? "handgun" : "sword";
  const key = PROFILES[r21.profile] ? r21.profile : (weapon ? fallback : "empty");
  const base = PROFILES[key], mods = r21.mods ?? {};
  let bonus = 0, damage = key === "empty" ? 1 : Math.max(0, int(r21.damage ?? 2) || 2);
  const notes = [base.note];
  if (mods.great) { bonus -= 1; damage += 1; }
  if (mods.colossal) { bonus -= 1; damage += 2; notes.push("COLOSSAL: Knockback up to Physique or Knockdown."); }
  if (mods.artifact) { bonus += 2; damage += 1; } // RK p.32: ARTIFACT also deals +1 damage.
  if (mods.crushing) notes.push("CRUSHING: soaking 1 damage costs 2 Soak.");
  if (mods.blaze) notes.push("BLAZE: 2-in-6 chance to set the struck Part on fire.");
  if (int(r21.ferocious) > 0) notes.push(`FEROCIOUS ${int(r21.ferocious)}: each 6 adds a die, up to ${int(r21.ferocious)}.`);
  const range = int(r21.range) > 0 ? int(r21.range) : base.range;
  return {key, label: base.label, core: base.core, altCore: base.altCore ?? null, skill: base.skill, range, ranged: base.ranged,
    bonus, damage, rate: Math.max(1, int(r21.rate) || 1), auto: !!mods.auto, crushing: !!mods.crushing,
    ferocious: Math.max(0, int(r21.ferocious)), notes: notes.filter(Boolean)};
}

/** p.9: Sidhi Progression XP costs. Cultivations cap at 5 Stars. */
export function advancementCost(kind, currentRating) {
  const next = Math.max(0, int(currentRating)) + 1;
  if (kind === "core") return {next, xp: 5 * next};
  if (kind === "cultivation") {
    if (next > MAX_STARS) throw new Error("Cultivations can only be raised up to 5 Stars.");
    return {next, xp: 3 * next};
  }
  if (kind === "asset") return {next, xp: 4 * next};
  if (kind === "license") return {next: null, xp: 10};
  throw new Error("Unknown advancement.");
}

/** Alpha p.10: Suppression Fire needs a ranged weapon with a Rate of 15 or higher. */
export const canSuppress = profile => !!profile?.ranged && int(profile.rate) >= 15;

/** p.31: Heart + Adamance vs 2 + Disabled Parts, costing 1 Morale. */
export const incapacitationDemand = disabledParts => 2 + Math.max(0, int(disabledParts));

/** p.98: Magick Charges accumulate per Strike until they reach Potency. */
export function addCharges(current, strikes, potency) {
  const total = Math.max(0, int(current)) + Math.max(0, int(strikes));
  const goal = Math.max(1, int(potency) || 1);
  return total >= goal ? {charges: 0, unleashed: true, total} : {charges: total, unleashed: false, total};
}

/** Maps a 2.0 license prerequisite set onto the 2.1 Cores (VIO→PHY etc., p.5). */
export function qualifiesForLicense21(system, license) {
  const needs = license?.prerequisites ?? {};
  for (const [key, core] of Object.entries(CORE_FROM_20)) if (int(system.cores?.[core]) < int(needs[key])) return false;
  return int(system.sidhi) >= int(needs.sidhi);
}

const PHYSICAL = ["weapon", "fashion", "gear", "accessory", "ammunition", "armor", "salvage"];
/** p.63: carried kilograms from item weights. Ammunition weight is per stack; other items multiply by quantity. */
export function itemWeight(items = []) {
  const total = items.filter(item => PHYSICAL.includes(item?.type)).reduce((sum, item) => {
    const kg = Math.max(0, Number(item.system?.r21?.weight) || 0);
    return sum + kg * (item.type === "ammunition" ? 1 : Math.max(0, Number(item.system?.quantity ?? 1) || 0));
  }, 0);
  return Math.round(total * 100) / 100;
}

/** Derived 2.1 values for an actor. `items` are plain item data ({type, system}). */
export function derive21(system, items = []) {
  const worn = items.filter(item => item?.system?.equipped && item.system.r21 && item.type !== "weapon");
  const coverage = key => worn.reduce((sum, item) => sum + Math.max(0, int(item.system.r21.coverage?.[key])), 0);
  const gearMorale = worn.reduce((sum, item) => sum + int(item.system.r21.morale), 0);
  const assets = allAssets21(system, items);
  system = {...system, assets};
  const parts = {};
  for (const key of PART_KEYS) {
    const stored = system.parts?.[key] ?? {};
    const max = partMaximum(key, {bonus: stored.hpBonus, assets, physique: system.cores?.phy});
    const soakMax = Math.max(0, int(stored.soakBase)) + coverage(key);
    parts[key] = {...partState(max, stored.damage), label: PARTS[key].label, soakMax, soak: Math.max(0, soakMax - Math.max(0, int(stored.soakLost)))};
  }
  const disabledLegs = ["rleg", "lleg"].filter(key => parts[key].disabled).length;
  const moraleMax = moraleMaximum(system, gearMorale);
  const itemKg = itemWeight(items), carriedKg = Math.round((itemKg + Math.max(0, Number(system.carriedKg) || 0)) * 100) / 100;
  const sidhi = Math.max(0, int(system.sidhi));
  return {parts, assets, flameMax: flameMaximum21(sidhi), meridians: meridians21(sidhi), scorch: Math.max(0, int(system.scorch)), speed: speed(system), moraleMax, morale: Math.max(0, Math.min(moraleMax, int(system.morale?.value))),
    shattered: int(system.morale?.value) <= 0, carryLimit: carryLimit(system),
    itemKg, carriedKg, movement: movement(system, {disabledLegs, carriedKg}),
    disabled: PART_KEYS.filter(key => parts[key].disabled)};
}

export {stars as clampStars};

/** RK p.52: a Cultivator generally has [2 + Sidhi Level] Flame. */
export const flameMaximum21 = sidhi => 2 + Math.max(0, int(sidhi));

/** Alpha p.52 Scorch: burning or installing past 0 Flame goes negative. Free Flame is used first; the rest becomes Scorch.
 * Returns the new totals and how much Scorch this spend added. */
export function spendFlame21(ardor = {}, scorch = 0, {burn = 0, install = 0} = {}) {
  const max = Math.max(0, int(ardor.max)), burnt = Math.max(0, int(ardor.burnt)), installed = Math.max(0, int(ardor.installed));
  let free = Math.max(0, max - burnt - installed);
  const b = Math.max(0, int(burn)), i = Math.max(0, int(install));
  const burnFree = Math.min(b, free); free -= burnFree;
  const installFree = Math.min(i, free);
  const added = (b - burnFree) + (i - installFree);
  return {burnt: burnt + burnFree, installed: installed + installFree, scorch: Math.max(0, int(scorch)) + added, added, available: max - burnt - installed};
}

/** Recovering burnt Flame (1 per week, consumables, Samadhi) or releasing installed Flame clears Scorch first (Alpha p.52). */
export function recoverFlame21(ardor = {}, scorch = 0, {burnt = 0, installed = 0} = {}) {
  let s = Math.max(0, int(scorch));
  const fromScorch = Math.min(s, Math.max(0, int(burnt)) + Math.max(0, int(installed)));
  s -= fromScorch;
  let rest = fromScorch, b = Math.max(0, int(burnt)), inst = Math.max(0, int(installed));
  const takeB = Math.min(b, rest); b -= takeB; rest -= takeB; inst -= Math.min(inst, rest);
  return {burnt: Math.max(0, int(ardor.burnt) - b), installed: Math.max(0, int(ardor.installed) - inst), scorch: s};
}

/** Alpha p.52: Deviation Check, Physique + Adamance + Sidhi Stage vs Demand 3 + Scorch (after the spend). */
export const deviationDemand21 = scorch => 3 + Math.max(0, int(scorch));
export const deviationPool21 = system => int(system.cores?.phy) + int(system.skills?.adamance) + Math.max(0, int(system.sidhi));
export const DEVIATIONS_21 = Object.freeze({
  1: {label: "Rupture", text: "All Cultivations fall to 1 for a week; no Magick or Technick can be wielded."},
  2: {label: "Scatter", text: "All installed Flame is lost; the Meridians are sealed for a month and no License can be used."},
  3: {label: "Heart Demon", text: "A Demon INTRA-INT gestates from the strongest Heart Attachment and overwrites one License's Meridian. It argues against the Cultivator with CHANGE GOD'S MIND, using her own Core + Cultivation, and is Hostile."},
  4: {label: "Shut Down", text: "The vital soul is clamped into an Iron Casket: comatose for [Scorch] days."},
  5: {label: "Overflame", text: "She vents Purefire: 2 piercing damage to every Part and to everything within 3m, which catches fire. Every INTRA-INT within a kilometer knows her name and direction."},
  6: {label: "Sublation", text: "Gain something permanent from the Progression (a Core star, a Cultivation, an Asset, a License…). Then lose all Scorch and begin at 0 Flame."}
});

/** Alpha p.51 Self-Flame: how a Cultivator's Sidhi shows at a given amount of Flame burnt or installed at once. */
export function selfFlame21(amount) {
  const n = int(amount);
  if (n <= 0) return "";
  if (n === 1) return "Silent: only Susurration senses it.";
  if (n <= 4) return "Asterism: an iconic Ajna on or behind the head.";
  if (n <= 6) return "An aura in the Cultivator's chosen color and shape.";
  if (n === 7) return "A bonfire radiating at least 50m; Intramaterial Interference reveals her location.";
  return "Divine Mien: an otherworldly change of appearance for 30 minutes.";
}
/** RK p.52: 2 open Meridians at Sidhi 0, +1 per Sidhi Stage; each Magick or Technick fills one. */
export const meridians21 = sidhi => 2 + Math.max(0, int(sidhi));

// pp.100–101 (RK p.52): a Sidhi Realm limits how many Esoteric Techniques (Magicks and Technicks) can be Cultivated.
export const SIDHI_REALMS = Object.freeze({desire: {label: "Desire Realm", limit: 8}, form: {label: "Form Realm", limit: 16}, formless: {label: "Formless Realm", limit: 32}});
export const abilityLimit21 = realm => (SIDHI_REALMS[realm] ?? SIDHI_REALMS.desire).limit;

const normName = value => String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");

/** Every name a Sect Cultivation goes by (current name first), or just the name itself. */
export function sectCultivationNames21(name) {
  const key = normName(name);
  for (const [current, older] of Object.entries(SECT_CULTIVATIONS_21)) if ([current, ...older].some(entry => normName(entry) === key)) return [current, ...older];
  return [String(name ?? "")];
}

/** A named rating: a Core, a basic Cultivation or an Esoteric Cultivation, matched by name (older Sect names count). Null when unknown. */
export function namedRating21(system, name) {
  const key = normName(name);
  if (!key) return null;
  for (const [core, info] of Object.entries(CORES)) if ([info.label, info.abbr, ...info.aliases].some(name => normName(name) === key)) return int(system.cores?.[core]);
  for (const [skill, info] of Object.entries(CULTIVATIONS_21)) if (normName(info.label) === key) return int(system.skills?.[skill]);
  const names = new Set(sectCultivationNames21(name).map(normName));
  const eso = (system.esoteric ?? []).filter(entry => names.has(normName(entry.name)));
  return eso.length ? Math.max(...eso.map(entry => int(entry.value))) : null;
}

/** Sect text formulas such as [3 x DEVIL TIGER BLADE] or [FACE x 5] (older text: VOICE), evaluated for one character. */
export function bracketValues21(text, system) {
  const plain = String(text ?? "").replace(/<[^>]*>/g, " ");
  const found = new Map();
  for (const [, expr] of plain.matchAll(/\[([^\]]{1,60})\]/g)) {
    const tokens = expr.split(/\s*([+×x*])\s*/i).map(token => token.trim()).filter(Boolean);
    if (tokens.length % 2 === 0) continue;
    let named = false, ok = true;
    const values = tokens.filter((_, index) => index % 2 === 0).map(token => {
      if (/^\d[\d,]*$/.test(token)) return Number(token.replace(/,/g, ""));
      const rating = namedRating21(system, token);
      if (rating === null) ok = false; else named = true;
      return rating ?? 0;
    });
    if (!ok || !named) continue;
    const ops = tokens.filter((_, index) => index % 2 === 1).map(op => op === "+" ? "+" : "*");
    const sums = [values[0]];
    ops.forEach((op, index) => { if (op === "*") sums[sums.length - 1] *= values[index + 1]; else sums.push(values[index + 1]); });
    found.set(expr.trim(), sums.reduce((sum, value) => sum + value, 0));
  }
  return [...found].map(([expr, value]) => ({expr, value}));
}

/** Technick costs and requirements from the 2.1 Sect catalog flags, falling back to the item's own fields. */
export function technickInfo21(item) {
  const system = item?.system ?? {}, flags = item?.flags?.["10kswordsfoundry"]?.sect21 ?? {};
  let cultivation = flags.cultivation ?? "", stars = int(flags.stars);
  if (!cultivation) {
    const match = String(system.description ?? "").replace(/<[^>]*>/g, " ").match(/License:\s*([^✦<]+?)\s*(✦+)/i);
    if (match) { cultivation = match[1].trim(); stars = match[2].length; }
  }
  const burn = int(system.burnArdor), install = int(system.installArdor);
  return {burn, install, cultivation, stars, weapon: String(flags.weaponRequirement ?? "").trim(), variable: /\[X\]/i.test(flags.needs ?? ""),
    installed: !!system.equipped && int(system.paidArdor) > 0, paid: int(system.paidArdor)};
}

/** The Technick's License: its Esoteric Cultivation at the printed Stars (pp.100–101, Sect spoilers). */
export function licenseMet21(system, info) {
  if (!info?.cultivation || !info.stars) return {met: true, rating: null};
  const rating = namedRating21(system, info.cultivation);
  return {met: rating !== null && rating >= info.stars, rating};
}

/** Sect weapon requirements ("SWORDS or SABERS", "EMPTY HAND", "[AUTO] weapon", …) against equipped weapons. */
export function weaponRequirement21(requirement, weapons = [], {freeHand = true} = {}) {
  const text = String(requirement ?? "").toUpperCase();
  if (!text.trim()) return {met: true, label: ""};
  const profiles = weapons.map(system => ({profile: weaponProfile21(system), mods: system?.r21?.mods ?? {}}));
  const checks = [];
  const profileNeed = {SWORD: "sword", SABER: "saber", POLEARM: "polearm", DAGGER: "dagger", HANDGUN: "handgun", LONGGUN: "longgun", BOW: "bow", CROSSBOW: "crossbow", WHIP: "whip", BLUDGEON: "bludgeon", CLEAVER: "cleaver"};
  for (const [word, key] of Object.entries(profileNeed)) if (new RegExp(`\\b${word}S?\\b`).test(text)) checks.push(() => profiles.some(entry => entry.profile.key === key));
  if (/EMPTY HAND/.test(text)) checks.push(() => freeHand);
  if (/GREAT|COLOSSAL/.test(text)) checks.push(() => profiles.some(entry => entry.mods.great || entry.mods.colossal));
  if (/AUTO/.test(text)) checks.push(() => profiles.some(entry => entry.mods.auto));
  if (/AMMO/.test(text)) checks.push(() => profiles.some(entry => entry.profile.ranged));
  if (!checks.length) return {met: true, label: requirement, unknown: true};
  return {met: checks.some(check => check()), label: requirement};
}
