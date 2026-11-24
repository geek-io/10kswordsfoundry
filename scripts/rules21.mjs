// Rules 2.1 (from 0.2.13: the 2.1 Alpha, 56 pp.; earlier: the Red Kalpa Manuscript). Pure helpers, independent of Foundry
// for deterministic testing. Older page references use the manuscript's PDF page numbers; "Alpha p." marks the 2.1 Alpha.
// The 2.0.3 rules never import this module.

export const RULES_SETTING = "rulesVersion";
export const RULES_CHOICES = Object.freeze({"2.1": "2.1 — current rulebook (default)", "2.0": "2.0.3 — earlier rulebook"});

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

// 2.1 rulebook pp.211–218: the 36 d36 starting Assets (codes 11–66) with their Star ranges and pages.
export const ASSETS_21 = Object.freeze({
  debt: {code: "11", label: "Debt", min: 1, max: 5, page: 211},
  capital: {code: "12", label: "Capital", min: 1, max: 5, page: 211},
  jadeComplexion: {code: "13", label: "Jade Complexion Beauty", min: 1, max: 5, page: 212},
  wroughtLimb: {code: "14", label: "Wrought Limb", min: 1, max: 5, page: 212},
  standing: {code: "15", label: "Standing", min: 1, max: 5, page: 212},
  reputation: {code: "16", label: "Reputation", min: 1, max: 5, page: 212},
  loomAccess: {code: "21", label: "Loom Access", min: 2, max: 5, page: 213},
  mountainFrame: {code: "22", label: "Mountain Frame", min: 1, max: 3, page: 213},
  ghostEar: {code: "23", label: "Ghost Ear", min: 1, max: 3, page: 213},
  patron: {code: "24", label: "Patron", min: 1, max: 5, page: 214},
  intraIntBond: {code: "25", label: "Intra-Int Bond", min: 3, max: 3, page: 214},
  hollowConscience: {code: "26", label: "Hollow Conscience", min: 1, max: 3, page: 214},
  sheerStoneHeart: {code: "31", label: "Sheer Stone Heart", min: 1, max: 3, page: 214},
  intriguist: {code: "32", label: "Intriguist", min: 1, max: 3, page: 214},
  rawNerve: {code: "33", label: "Raw Nerve", min: 1, max: 3, page: 215},
  narcissus: {code: "34", label: "Narcissus", min: 1, max: 3, page: 215},
  wallflower: {code: "35", label: "Wallflower", min: 1, max: 3, page: 215},
  ironHand: {code: "36", label: "Iron Hand", min: 1, max: 3, page: 215},
  anvilHead: {code: "41", label: "Anvil Head", min: 1, max: 3, page: 215},
  springTendonLegs: {code: "42", label: "Spring-Tendon Legs", min: 1, max: 3, page: 215},
  pythonGrip: {code: "43", label: "Python Grip", min: 1, max: 3, page: 215},
  beastlyClaws: {code: "44", label: "Beastly Claws", min: 1, max: 3, page: 215},
  venomGlands: {code: "45", label: "Venom Glands", min: 1, max: 3, page: 216},
  hummingbirdPulse: {code: "46", label: "Hummingbird Pulse", min: 3, max: 3, page: 216},
  thirdEyeOpen: {code: "51", label: "Third Eye Open", min: 1, max: 1, page: 216},
  spineTerminalPort: {code: "52", label: "Spine Terminal Port", min: 2, max: 2, page: 216},
  tacticianSoul: {code: "53", label: "Tactician Soul", min: 2, max: 2, page: 216},
  shadowPersonality: {code: "54", label: "Shadow Personality", min: 1, max: 3, page: 216},
  adamantWill: {code: "55", label: "Adamant Will", min: 1, max: 3, page: 216},
  archivalMemory: {code: "56", label: "Archival Memory", min: 1, max: 3, page: 216},
  sleeplessSoul: {code: "61", label: "Sleepless Soul", min: 1, max: 5, page: 217},
  gutterTongue: {code: "62", label: "Gutter Tongue", min: 1, max: 3, page: 217},
  armory: {code: "63", label: "Armory", min: 1, max: 3, page: 217},
  cargoLineSlot: {code: "64", label: "Cargo Line Slot", min: 1, max: 5, page: 217},
  kin: {code: "65", label: "Kin", min: 1, max: 5, page: 218},
  reincarnationInsurance: {code: "66", label: "Reincarnation Insurance", min: 2, max: 5, page: 218},
  // No longer printed in the 2.1 book (2.1 Alpha, pp.46-48); kept so Assets already on characters stay valid.
  longCon: {code: "", label: "Long Con", min: 1, max: 3, page: null, legacy: true},
  karmicAgent: {code: "", label: "Karmic Agent", min: 1, max: 3, page: null, legacy: true},
  compartmentalMind: {code: "", label: "Compartmental Mind", min: 1, max: 3, page: null, legacy: true},
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
// 2.1 playtest (2026-11-15): each Part has [7 + PHYSIQUE + SIDHI STAGE] HP. (Was [3 + PHYSIQUE], Red Kalpa Manuscript p.14.)
export const BASE_PART_HP = 7;

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
  "Spirit Binding": [],
  "Sound Law": [],
  "Dual Cultivation": ["Dual"],
  // 2.1 rulebook (2026-11-16): Luciferian and Metomian.
  "Consummate Lie": [],
  "Black Mace": []
});
export const partFromD6 = roll => PART_KEYS.find(key => PARTS[key].d6 === roll) ?? null;

// pp.13, 32–36: states that alter Checks or Openings. Kept separate from the 2.0 conditions.
export const CONDITIONS_21 = Object.freeze({
  bleeding: {label: "Bleeding", page: 34, text: "A Bleeding Part loses [10 - Physique] HP (at least 1) after a minute and gives -1 to physical Checks. Does not stack on the same Part, but each Bleeding Part adds its -1 penalty."},
  offBalanced: {label: "Off-Balanced", page: "KTB 2.1", text: "-2 on the next Check in a KILL THE BUDDHA (lasts until the next turn ends). From Onslaught, Volley, or a Feint."},
  control: {label: "Control", page: "KTB 2.1", text: "A Part is grappled or pinned and cannot be moved (which Part is noted when the Control is set). Breaking free costs an Action, or the Fiction."},
  stunned: {label: "Stunned", page: 34, text: "Cannot do anything until the head clears (6 Ticks after a failed Stun Check, Demand 3; 2.1 p.121)."},
  knockdown: {label: "Knocked Down", page: 35, text: "Move only 2 m/s and -2 to Checks until you get up."},
  juggled: {label: "Juggled", page: 35, text: "Spinning in the air: lose all Openings and cannot Counter; attackers gain +2 dice."},
  burning: {label: "Aflame", page: 153, text: "Whole body, not per Part: 1 blast damage to a random Part every Tick; -1 to all Checks. Putting it out takes an Action and a fitting Check; water ends it. Inferno (burning oil, thermite, lava, magick fire): 2 blast damage per second, only drowned or starved of fuel."},
  suppressed: {label: "Suppressed", page: "Alpha 10", text: "Pinned by Suppression Fire: duck into cover or run out of the area; no other action for 3 seconds or until the Cut ends."},
  samadhi: {label: "Samadhi", page: "Alpha 53", text: "+2 to all Checks and ignore all dice penalties; heal 1 burnt Flame per 3 seconds; Samadhi Technicks and Magicks are open."},
  encumbered: {label: "Encumbered", page: 63, text: "-4 to all Checks."},
  drunk: {label: "Drunk", page: 14, text: "-2 to Checks until sober."},
  deviation: {label: "Sidhi Deviation", page: 18, text: "Every Cultivation falls to 1; learned Magicks and Technicks cannot be used."}
});

// KILL THE BUDDHA 2.1 damage types, chosen by weapon at the point of damage.
export const DAMAGE_TYPES_21 = Object.freeze({
  cut: {label: "Cut", text: "Inflicts Bleeding on the Part when it takes damage.", bleeds: true},
  crush: {label: "Crush", text: "Reduces the Part's Soak by 1 after dealing damage.", reduceSoak: 1},
  pierce: {label: "Pierce", text: "Ignores up to 2 Soak.", ignoreSoakUpTo: 2},
  blast: {label: "Blast", text: "Ignores all Soak and reduces the Part's Soak by 1 after dealing damage.", ignoreSoak: true, reduceSoak: 1},
  true: {label: "True", text: "Ignores all Soak.", ignoreSoak: true}
});
export const DAMAGE_TYPE_KEYS = Object.freeze(Object.keys(DAMAGE_TYPES_21));

/** Translate a 2.1 damage type into applyPartDamage options plus the after-effects the caller applies
 *  (reduceSoak → lower the Part's Soak; bleeds → set the Bleeding condition). Unknown type → plain damage. */
export function damageOptions21(type) {
  const spec = DAMAGE_TYPES_21[type] ?? {};
  return {ignoreSoak: !!spec.ignoreSoak, ignoreSoakUpTo: int(spec.ignoreSoakUpTo), reduceSoak: int(spec.reduceSoak), bleeds: !!spec.bleeds};
}

export const ATTACHMENT_STRENGTHS = Object.freeze({1: "Held", 2: "Firm", 3: "Heart"});

const int = value => Math.trunc(Number(value) || 0);
const stars = value => Math.max(0, Math.min(MAX_STARS, int(value)));

/** KTB 2.1 "Finding an Opening": 7 example maneuvers, each a contested Check (initiator vs target).
 *  `weapon: true` rolls the attacker's WEAPON pool (Core/Cultivation from the weapon); otherwise the
 *  initiator rolls `atkCore` + `atkSkill`. `emptyHand` is an unarmed check (Physique + Beast Shrine —
 *  the Empty Hand profile; the manuscript writes "EMPTY HAND CHECK" without naming the Core/Cultivation).
 *  `defCore` + `defSkill` is the target's opposed pool. */
export const MANEUVERS_21 = Object.freeze({
  onslaught: {label: "Onslaught", range: "melee", weapon: true, symmetric: true, defCore: "wit", defSkill: "beastShrine",
    text: "Win: force the loser up to 2 m (winner's choice) and may follow, staying within 1 m. The loser is Off-Balanced until the next turn ends."},
  volley: {label: "Volley", range: "ranged", weapon: true, ammo: 1, auto: true, defCore: "wit", defSkill: "thewsSinews",
    text: "Win: the target moves up to half Basic Move, or is Off-Balanced (winner's choice). [AUTO]: spend up to 3 more Ammo for 3 more dice."},
  analyze: {label: "Analyze", range: "any", atkCore: "mnd", atkSkill: "concreteAnalysis", defCore: "voc", defSkill: "beastShrine",
    text: "Win: the target reveals a weakness — +2 on the analyzer's next KILL THE BUDDHA against them."},
  feint: {label: "Feint", range: "melee", atkCore: "wit", atkSkill: "beastShrine", defCore: "wit", defSkill: "beastShrine",
    text: "Win: +2 on the feinter's next KILL THE BUDDHA against the target."},
  control: {label: "Control", range: "melee", emptyHand: true, atkCore: "phy", atkSkill: "beastShrine", defCore: "mot", defSkill: "beastShrine",
    text: "Win: Control a Limb; win by 2 Strikes to seize the Torso, by 3 the Head. A Controlled Part cannot move; breaking free costs an Action, or the Fiction."},
  throw: {label: "Throw", range: "melee", emptyHand: true, needsControl: true, atkCore: "phy", atkSkill: "beastShrine", defCore: "phy", defSkill: "thewsSinews",
    text: "After seizing a Part. Win: throw up to [Physique + leftover Strikes] m. Upward 3 m or more: airborne and Juggled. Downward: Knockdown."},
  disarm: {label: "Disarm", range: "melee", emptyHand: true, needsControl: true, atkCore: "phy", atkSkill: "beastShrine", defCore: "phy", defSkill: "thewsSinews",
    text: "After seizing a Part holding a weapon. Win: wrench the weapon away — fling it down, or toss it up to 3 m in any direction."}
});
export const MANEUVER_KEYS = Object.freeze(Object.keys(MANEUVERS_21));

/** Ticks (2.1 book p.22): SPEED = 7 - the higher of Wits / Mind; after an Act, Speed + Speed Modifiers is the RECOVERY
 *  added to the current Tick. The book states no minimum; floored at 1 so a READY always advances (recorded assumption).
 *  Note: distinct from the 2.0.x movement `speed` helper below. */
export function ticksSpeed21(wit, mnd = 0, modifier = 0) { return Math.max(1, 7 - Math.max(0, int(wit), int(mnd)) + int(modifier)); }
/** Flurry (2.1): after pressing the advantage `flurries` times, the next READY lands this many Ticks after
 *  the Tick you acted on: Speed + 2 x flurries (e.g. Speed 6, 3 flurries -> 12, so Tick 5 -> Tick 17). */
export function flurryReadyDelay21(speed, flurries) { return Math.max(0, int(speed)) + 2 * Math.max(0, int(flurries)); }

/** Resolves a contested maneuver from the two Strike counts. Pure: the chat layer applies conditions
 *  and renders the text. `margin` = leftover Strikes; `applyToDefender` is a condition to set on the
 *  target; `loserOffBalanced` names who is Off-Balanced for the symmetric Onslaught. */
export function maneuverOutcome21(key, atkStrikes, defStrikes, {physique = 0} = {}) {
  const spec = MANEUVERS_21[key];
  const a = Math.max(0, int(atkStrikes)), d = Math.max(0, int(defStrikes));
  const margin = a - d, win = margin > 0;
  const out = {margin, win, applyToDefender: null, loserOffBalanced: null, controlTier: null, throwDistance: null, summary: ""};
  if (!spec) return out;
  switch (key) {
    case "onslaught":
      if (margin > 0) { out.applyToDefender = "offBalanced"; out.loserOffBalanced = "defender"; out.summary = "Attacker wins: forces the target up to 2 m and may follow within 1 m; the target is Off-Balanced."; }
      else if (margin < 0) { out.loserOffBalanced = "attacker"; out.summary = "Target wins: the attacker is Off-Balanced and may be forced up to 2 m."; }
      else out.summary = "Tie: neither is forced off-balance.";
      break;
    case "volley":
      if (win) { out.applyToDefender = "offBalanced"; out.summary = "The target must move up to half Basic Move, or be Off-Balanced (winner's choice)."; }
      else out.summary = "Resisted: no movement, no Off-Balance.";
      break;
    case "analyze":
      out.summary = win ? "Weakness revealed: +2 on the attacker's next KILL THE BUDDHA against this target." : "Resisted: nothing revealed.";
      break;
    case "feint":
      out.summary = win ? "The feint lands: +2 on the attacker's next KILL THE BUDDHA against this target." : "Resisted: the feint is read.";
      break;
    case "control":
      if (win) { out.applyToDefender = "control"; out.controlTier = margin >= 3 ? "the Head" : margin >= 2 ? "the Torso" : "a Limb"; out.summary = `Control established on ${out.controlTier}.`; }
      else out.summary = "Resisted: no hold is seized.";
      break;
    case "throw":
      if (win) { out.throwDistance = Math.max(0, int(physique)) + margin; out.summary = `Thrown up to ${out.throwDistance} m. Upward 3 m or more: airborne and Juggled. Downward: Knockdown.`; }
      else out.summary = "Resisted: not thrown.";
      break;
    case "disarm":
      out.summary = win ? "The weapon is wrenched from the Controlled Part: fling it down, or toss it up to 3 m." : "Resisted: the grip holds.";
      break;
  }
  return out;
}

/** Total Stars held in an Asset key across the actor's Asset list. */
export function assetStars(assets = [], key) {
  return (assets ?? []).filter(asset => asset?.key === key).reduce((sum, asset) => sum + Math.max(0, int(asset.stars)), 0);
}

/** Assets as {key, stars} entries: Asset items plus any rows left in the older Asset list. */
export function allAssets21(system, items = []) {
  const owned = (items ?? []).filter(item => item?.type === "asset").map(item => ({key: item.system?.key ?? "custom", stars: int(item.system?.stars), name: item.name}));
  return [...(system?.assets ?? []), ...owned];
}

/** HP per Part: 7 + Physique + Sidhi Stage (2.1 playtest 2026-11-15), plus Mountain Frame (p.46) and Anvil Head (p.48). */
export function partMaximum(key, {bonus = 0, assets = [], physique = 0, sidhi = 0} = {}) {
  let max = BASE_PART_HP + Math.max(0, int(physique)) + Math.max(0, int(sidhi)) + int(bonus);
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
export function applyPartDamage({max, damage = 0, soak = 0}, amount, {crushing = false, ignoreSoak = false, soakPerPoint = null, ignoreSoakUpTo = 0} = {}) {
  const incoming = Math.max(0, int(amount));
  const cost = Math.max(1, int(soakPerPoint ?? (crushing ? 2 : 1)));
  // ignoreSoak ignores all Soak (TRUE/BLAST, Dagger Perfect); ignoreSoakUpTo ignores up to N (PIERCE = 2).
  const available = ignoreSoak ? 0 : Math.max(0, int(soak) - Math.max(0, int(ignoreSoakUpTo)));
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

/** pp.10, 94 (earlier manuscript): Speed = Physique + Wits + Peripheral Oracle + Stillness. Ticks use ticksSpeed21.
 *  Hummingbird Pulse no longer adds to Speed: it rolls the first READY d6 twice (2.1 rulebook p.216; see readyDice21). */
export function speed(system) {
  return int(system.cores?.phy) + int(system.cores?.wit) + int(system.skills?.peripheralOracle) + int(system.skills?.stillness)
    + int(system.speedBonus);
}

/** p.216 Hummingbird Pulse: roll the d6 at the start of a Structured Situation twice and take the better (lower, so earlier) result. */
export function readyDice21(assets = []) {
  return assetStars(assets, "hummingbirdPulse") > 0 ? "2d6kl1" : "1d6";
}

/** 2.1 book p.164: Morale maximum = 1 + Heart + Stillness, plus effects and equipped gear. */
export function moraleMaximum(system, gearBonus = 0) {
  return Math.max(0, 1 + int(system.cores?.spi) + int(system.skills?.stillness) + int(system.moraleBonus) + int(gearBonus));
}

/** p.63: Carry Limit = 10 kg + Physique × 10 kg. */
export function carryLimit(system) { return 10 + 10 * Math.max(0, int(system.cores?.phy)); }
/** 2.1 book p.182: carrying over the Carry Limit up to x2 is tier 2 (-2 Checks and Movement, +2 Speed), up to x3 tier 3, and so on. */
export function encumbrance21(carriedKg, limit) {
  const kg = Number(carriedKg) || 0, cap = Math.max(1, Number(limit) || 0);
  return kg > cap ? Math.max(2, Math.ceil(kg / cap)) : 0;
}
/** Ticks timing for an actor (2.1 book pp.21-23): Speed = 7 - higher of Wits / Mind; RECOVERY = Speed + Speed Modifiers
 *  (the heavier SPD of the readied weapons, encumbrance, and the sheet's Speed modifier `system.speedBonus`). First READY in a Structured Situation = d6 + Speed. */
export function ticks21(system, {weaponSpd = 0, encumbrance = 0} = {}) {
  const speed = ticksSpeed21(system.cores?.wit, system.cores?.mnd);
  const w = Math.max(0, int(weaponSpd)), e = Math.max(0, int(encumbrance)), modifier = int(system.speedBonus);
  return {speed, weaponSpd: w, encumbrance: e, modifier, recovery: Math.max(1, speed + w + e + modifier)};
}

/** 2.1 book p.132: Basic Move = Motorics m/s, Dash = Motorics + Physique, Step = Basic Move / 2 (rounded down; the book's
 * example gives Motorics 2 a Step of 1 m); 3D movement at half. p.182 encumbrance: over the Carry Limit, up to x2 = -2 Movement
 * (and -2 Checks, +2 Speed), up to x3 = -3, and so on. Disabled legs, knockdown, Spring-Tendon Legs and the Movement bonus as before. */
export function movement(system, {disabledLegs = 0, carriedKg = 0, cutSeconds = 3} = {}) {
  const bonus = int(system.moveBonus) + assetStars(system.assets, "springTendonLegs");
  let basic = Math.max(0, int(system.cores?.mot)) + bonus;
  const notes = [];
  const over = Math.max(0, Number(carriedKg) - carryLimit(system));
  const overload = encumbrance21(carriedKg, carryLimit(system));
  if (overload) {
    basic = Math.max(1, basic - overload);
    notes.push(`Encumbered: -${overload} m/s, -${overload} to all Checks, +${overload} Speed. No Lightness Technique.`);
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
  const dash = basic > 0 ? basic + Math.max(0, int(system.cores?.phy)) : 0;
  return {basic, dash, step: Math.floor(basic / 2), swim: Math.floor(basic / 2), perCut: basic * seconds, cutSeconds: seconds, notes, overloadKg: over, encumbrance: overload};
}

/** Automatic Check modifiers that follow from the character's state (pp.13–14, 32–35, 63; Alpha pp.16–17, 52–53). */
export function stateModifiers(system, {core = "", disabledTorso = false, encumbrance = 0} = {}) {
  const c = system.conditions21 ?? {};
  let parts = [];
  if (disabledTorso) parts.push({label: "Torso Disabled (winded)", value: -4});
  if (c.encumbered) parts.push({label: "Encumbered", value: -4});
  // 2.1 book p.182: carrying over the Carry Limit is -tier to all Checks. The Encumbered condition, when set by hand, stands in for it.
  else if (int(encumbrance) > 0) parts.push({label: "Over Carry Limit", value: -int(encumbrance)});
  if (c.knockdown) parts.push({label: "Knocked Down", value: -2});
  if (c.drunk) parts.push({label: "Drunk", value: -2});
  if (c.burning) parts.push({label: "Aflame", value: -1});
  if (c.bleeding && ["phy", "mot"].includes(core)) parts.push({label: "Bleeding (physical Check)", value: -1});
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

/** Opening rank of one KILL THE BUDDHA die (2026-11-14 engine change): 1–3 Whiff, 4–5 Quick, 6 Solid. No die yields Perfect; Perfects come only from fusing two Solids. */
export function openingRank(value) {
  if (!Number.isInteger(value) || value < 1 || value > 6) throw new RangeError("Expected d6 results.");
  return value === 6 ? "solid" : value >= 4 ? "quick" : "whiff";
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

// 2.1 book pp.192–195: Grips, Profiles, Modifiers, Material Grades and Affinities. Damage is a Core plus the Profile's bonus (Empty Hand deals PHYS).
export const GRIPS = Object.freeze({hilt: {label: "Hilt", mods: 2}, haft: {label: "Haft", mods: 3}, riser: {label: "Riser", mods: 3}, stock: {label: "Stock", mods: 2}});
export const PROFILES = Object.freeze({
  empty: {spd: 0, label: "Empty Hand", grip: null, core: "phy", skill: "beastShrine", range: 1, ranged: false, dmgCore: "phy", dmgAdd: 0, note: "Deals PHYS damage with no innate damage type (2.1 p.192); usually needed to establish Control."},
  dagger: {spd: 0, label: "Dagger", grip: "hilt", core: "mot", skill: "beastShrine", range: 1, ranged: false, dmgCore: "mot", dmgAdd: 0, note: "On a KILL, deal piercing damage to the Torso."},
  saber: {spd: 2, label: "Saber", grip: "hilt", core: "phy", skill: "beastShrine", range: 1, ranged: false, dmgCore: "phy", dmgAdd: 1, note: "+1 damage against Limbs."},
  sword: {spd: 1, label: "Sword", grip: "hilt", core: "phy", altCore: "mot", skill: "beastShrine", range: 1, ranged: false, dmgCore: "used", dmgAdd: 1, note: "Physique or Motorics + Beast Shrine; damage uses the same Core."},
  whip: {spd: 2, label: "Whip", grip: "hilt", core: "mot", skill: "thewsSinews", range: 3, ranged: false, dmgCore: "phy", dmgAdd: 0, note: "Farther reach, harder to wield."},
  bludgeon: {spd: 2, label: "Bludgeon", grip: "haft", core: "phy", skill: "beastShrine", range: 1, ranged: false, dmgCore: "phy", dmgAdd: 1, crushing: true, note: "Innate CRUSHING: soaking 1 damage costs 2 Soak."},
  cleaver: {spd: 2, label: "Cleaver", grip: "haft", core: "phy", skill: "beastShrine", range: 1, ranged: false, dmgCore: "phy", dmgAdd: 2, note: "x2 damage when chopping wood."},
  polearm: {spd: 2, label: "Polearm", grip: "haft", core: "phy", skill: "beastShrine", range: 3, ranged: false, dmgCore: "phy", dmgAdd: 1, note: "3 m reach."},
  shield: {spd: 0, label: "Shield", grip: "haft", core: "phy", skill: "beastShrine", range: 1, ranged: false, dmgCore: "phy", dmgAdd: 0, cover: "light", note: "Innate COVER: Light Cover while you are behind it (2.1 p.192)."},
  launcher: {spd: 1, label: "Launcher", grip: "haft", core: "mot", skill: "handEye", range: 20, ranged: true, dmgCore: "mot", dmgAdd: 0, note: "Slings, slingshots, slingstaffs."},
  bow: {spd: 2, label: "Bow", grip: "riser", core: "mot", skill: "handEye", range: 250, ranged: true, dmgCore: "mot", dmgAdd: 1, note: "Needs Physique 2+; requires Arrows."},
  crossbow: {spd: 2, label: "Crossbow", grip: "stock", core: "mot", skill: "handEye", range: 125, ranged: true, dmgCore: "mot", dmgAdd: 1, note: "Requires Bolts; silent."},
  handgun: {spd: 1, label: "Handgun", grip: "stock", core: "mot", skill: "handEye", range: 30, ranged: true, dmgCore: "mot", dmgAdd: 1, note: "Short bullets; revolvers by the bullet, 12-round magazines."},
  longgun: {spd: 2, label: "Longgun", grip: "stock", core: "mot", skill: "handEye", range: 400, ranged: true, dmgCore: "mot", dmgAdd: 2, note: "Always DOUBLEHAND; long gun bullets and magazines."}
});
export const WEAPON_MODS_21 = Object.freeze({
  auto: "AUTO — Suppression Fire; each Shoot uses 3 bullets",
  crushing: "CRUSHING — 2 Soak per damage soaked",
  great: "GREAT — two hands, x2 kg, +1 damage, +2 Speed modifier",
  colossal: "COLOSSAL — two hands, x4 kg, +2 damage, 2 m Knockback on damage, +3 Speed modifier",
  doublehand: "DOUBLEHAND — requires both hands",
  focus: "FOCUS — replaces Mudras",
  blaze: "BLAZE — 2-in-6 chance of Burning the target",
  artifact: "ARTIFACT — +1 damage, double Durability, +2 to Kill The Buddha",
  smashing: "SMASHING — triple damage against Durability",
  piercing: "PIERCING — damage ignores Soak",
  lacerating: "LACERATING — damage starts Bleeding in that Part",
  precise: "PRECISE — Kill The Buddha rerolls 1s, once",
  shock: "ELECTRIC — 1-in-6 chance of Stunning the target on contact",
  worn: "WORN — cannot be removed or disabled; no need to Ready",
  concealable: "CONCEALABLE — easily hidden",
  holy: "HOLY — +1 damage against INTRA-INTs",
  noetic: "NOETIC — damage goes to Morale instead of a Part",
  ritual: "RITUAL — +1 to Casting Checks while in one hand",
  almighty: "ALMIGHTY — damage cannot be lessened; Unblockable",
  thundering: "THUNDERING — heard up to 1 km",
  toxic: "TOXIC — delivers a Poison on any wound (three doses)",
  cover: "COVER — works as Light Cover while behind it",
  wall: "WALL — works as Heavy Cover while behind it",
  unblockable: "UNBLOCKABLE — a KILL THE BUDDHA with it cannot be Blocked",
  undodgeable: "UNDODGEABLE — a KILL THE BUDDHA with it cannot be Dodged",
  visceral: "VISCERAL — +1 damage against Parts without Soak"
});
// 2.1 book p.195: Affinities. A Refined or higher weapon can use the Affinity's Core for its Check, and then deals that Core's damage.
export const AFFINITIES_21 = Object.freeze({
  mighty: {label: "MIGHTY", core: "phy"}, razor: {label: "RAZOR", core: "mot"}, esoteric: {label: "ESOTERIC", core: "mnd"},
  arcane: {label: "ARCANE", core: "wit"}, lyrical: {label: "LYRICAL", core: "voc"}, psionic: {label: "PSIONIC", core: "spi"}
});
export const AFFINITY_KEYS = Object.freeze(Object.keys(AFFINITIES_21));
// 2.1 book p.195: Material Grades, BASE -> REFINED -> DIVINE -> IMMORTAL. Extra Mods and Durability are a note; base damage is applied.
export const GRADES_21 = Object.freeze({
  refined: {label: "Refined", damage: 0, text: "+1 Mod; x1.5 Durability"},
  divine: {label: "Divine", damage: 1, text: "+2 Mods; x2 Durability; +1 base damage"},
  immortal: {label: "Immortal", damage: 2, text: "+3 Mods; +2 base damage"}
});
export const GRADE_KEYS = Object.freeze(Object.keys(GRADES_21));
const CORE_ABBR = {phy: "PHYS", mot: "MOT", mnd: "MND", wit: "WIT", voc: "FAC", spi: "HRT"};

/** p.194 VISCERAL: +1 damage against Parts without Soak. */
export function visceralBonus21(visceral, soak) { return visceral && int(soak) <= 0 ? 1 : 0; }

/** p.194 MORPH X: the Profiles a weapon can morph into, from its comma-separated `morph` list, leaving out the Profile it has now. */
export function morphOptions21(r21 = {}) {
  const keys = String(r21?.morph ?? "").toLowerCase().split(/[^a-z]+/).filter(key => PROFILES[key] && key !== "empty");
  return [...new Set(keys)].filter(key => key !== r21?.profile);
}

/** Profile and modifiers for a weapon's 2.1 data; unconfigured weapons fall back to their 2.0 melee/ranged type.
 *  Pass the wielder's Cores (and the Core rolled, for Swords) to get the book's damage: Core + Profile bonus (book p.170). */
export function weaponProfile21(weapon, {cores = null, core = null} = {}) {
  const r21 = weapon?.r21 ?? {};
  const fallback = weapon?.weaponType === "ranged" ? "handgun" : "sword";
  const key = PROFILES[r21.profile] ? r21.profile : (weapon ? fallback : "empty");
  const base = PROFILES[key], mods = r21.mods ?? {};
  // p.195: when the Check is rolled with the Affinity's Core, the weapon deals that Core's damage.
  const affinity = AFFINITIES_21[r21.affinity] ?? null, viaAffinity = !!affinity && core === affinity.core;
  const dmgCore = viaAffinity ? affinity.core : base.dmgCore === "used" ? (["phy", "mot"].includes(core) ? core : base.core) : base.dmgCore;
  const grade = GRADES_21[r21.grade] ?? null;
  // Extra damage: the item's bonus, plus anything above the old flat base of 2 on weapons made before 0.2.15.
  let extra = int(r21.damageBonus) + Math.max(0, int(r21.damage ?? 2) - 2) + int(grade?.damage);
  let bonus = 0;
  const notes = [base.note];
  // GREAT grants FEROCIOUS (modifiers.mjs; 2.0 wires this too). A direct FEROCIOUS rating on the weapon still wins if higher.
  let ferocious = Math.max(0, int(r21.ferocious));
  // 2.1 rulebook p.194 (357-page edition): GREAT is +1 damage and +2 Speed modifier; COLOSSAL is +2 damage, 2 m Knockback and +3 Speed modifier.
  // The earlier "-1 to all violence Checks" is no longer printed.
  let spdMod = 0;
  if (mods.great) { extra += 1; spdMod = 2; ferocious = Math.max(ferocious, 1); notes.push("GREAT: +2 Speed modifier."); }
  if (mods.colossal) { extra += 2; spdMod = 3; notes.push("COLOSSAL: +3 Speed modifier; inflicts 2 m Knockback upon dealing damage."); }
  if (mods.artifact) { bonus += 2; extra += 1; }
  const crushing = !!mods.crushing || !!base.crushing;
  if (mods.crushing) notes.push("CRUSHING: soaking 1 damage costs 2 Soak.");
  if (mods.blaze) notes.push("BLAZE: 2-in-6 chance of Burning the target.");
  if (mods.piercing) notes.push("PIERCING: damage ignores Soak.");
  if (mods.lacerating) notes.push("LACERATING: damage starts Bleeding in that Part.");
  if (mods.precise) notes.push("PRECISE: 1s are rerolled once.");
  if (mods.shock) notes.push("ELECTRIC: 1-in-6 chance of Stunning the target on contact.");
  if (mods.visceral) notes.push("VISCERAL: +1 damage against Parts without Soak.");
  if (affinity) notes.push(`${affinity.label}: can use ${CORE_ABBR[affinity.core]} as its Core, and then deals ${CORE_ABBR[affinity.core]} damage.`);
  if (grade) notes.push(`${grade.label} grade: ${grade.text}.`);
  if (mods.holy) notes.push("HOLY: +1 damage against INTRA-INTs.");
  if (mods.noetic) notes.push("NOETIC: damage goes to Morale instead of a Part.");
  if (mods.almighty) notes.push("ALMIGHTY: damage cannot be lessened and is Unblockable.");
  if (mods.toxic) notes.push("TOXIC: delivers a Poison on any wound.");
  if (mods.unblockable) notes.push("UNBLOCKABLE: cannot be Blocked; Dodge instead.");
  if (mods.undodgeable) notes.push("UNDODGEABLE: cannot be Dodged; Block instead.");
  const cover = mods.wall ? "heavy" : (mods.cover || base.cover) ? "light" : "";
  if (mods.wall) notes.push("WALL: Heavy Cover while you are behind it.");
  else if (mods.cover) notes.push("COVER: Light Cover while you are behind it.");
  if (ferocious > 0) notes.push(`FEROCIOUS ${ferocious}: each 6 adds a die, up to ${ferocious}.`);
  // Without the wielder's Cores (item sheets, old callers) show the old flat figures: Empty Hand 1, weapons 2.
  const coreDamage = cores ? Math.max(0, int(cores[dmgCore])) + int(base.dmgAdd) : (key === "empty" ? 1 : 2);
  const damage = Math.max(0, coreDamage + extra);
  const add = int(base.dmgAdd) + extra;
  const damageText = `${viaAffinity ? CORE_ABBR[dmgCore] : base.dmgCore === "used" ? "PHYS/MOT" : CORE_ABBR[dmgCore]}${add ? ` + ${add}` : ""}`;
  // p.194 REACH X: +X m to the weapon's profile.
  const reach = Math.max(0, int(r21.reach));
  const range = (int(r21.range) > 0 ? int(r21.range) : base.range) + reach;
  if (reach) notes.push(`REACH ${reach}: +${reach} m.`);
  const morph = morphOptions21({...r21, profile: key});
  if (morph.length) notes.push(`MORPH: as an Action, becomes a ${morph.map(option => PROFILES[option].label).join(" / ")}.`);
  return {key, spd: int(base.spd) + spdMod, label: base.label, core: base.core, altCore: base.altCore ?? null, skill: base.skill, range, ranged: base.ranged,
    bonus, damage, damageText, rate: Math.max(1, int(r21.rate) || 1), auto: !!mods.auto, crushing, piercing: !!mods.piercing, precise: !!mods.precise,
    ferocious, cover, unblockable: !!(mods.unblockable || mods.almighty), undodgeable: !!mods.undodgeable, visceral: !!mods.visceral, affinity: affinity ? r21.affinity : "", affinityCore: affinity?.core ?? null,
    grade: grade ? r21.grade : "", morph, notes: notes.filter(Boolean)};
}

/** Firefight (2.1 book pp.119, 122). Cover is a ranged-combat problem: each instance of ranged damage has a chance of hitting it. */
export const COVER_21 = Object.freeze({
  light: {label: "Light Cover", chance: 2, parts: 1, text: "Covers about a quarter of the target: each instance of ranged damage has a 2-in-6 chance of hitting cover; 1 Body Part cannot be hit."},
  heavy: {label: "Heavy Cover", chance: 4, parts: 3, text: "Covers three quarters of the target: each instance of ranged damage has a 4-in-6 chance of hitting cover; 3 Body Parts cannot be hit."},
  full: {label: "Full Cover", chance: 6, parts: 6, text: "A full-on attack is impossible until the cover is weakened or removed."}
});
/** Which d6 results hit the cover instead of the target: 1-2 for Light, 1-4 for Heavy. */
export function coverHits21(rolls, cover) {
  const chance = COVER_21[cover]?.chance ?? 0;
  return (rolls ?? []).map(value => int(value) >= 1 && int(value) <= chance);
}
/** Aim: +1 die per Tick spent Aiming, to a maximum of Motorics; you do not fire on the Tick you start, and cannot move. */
export function aimBonus21(ticks, motorics) { return Math.max(0, Math.min(int(ticks), Math.max(0, int(motorics)))); }
/** Shooting something outside the weapon's range has a 4-in-6 chance of going wide. */
export function outOfRange21(distance, range) { const d = Number(distance); return distance !== "" && distance !== null && Number.isFinite(d) && Number.isFinite(Number(range)) && d > Number(range); }
export function goesWide21(d6) { return int(d6) >= 1 && int(d6) <= 4; }
/** A halved KILL THE BUDDHA pool, rounded down: the target of an Ambush (p.124), or someone attacked while Casting Magick (p.119). */
export function halvedPool21(pool) { return Math.floor(Math.max(0, int(pool)) / 2); }

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

/** Book p.93: Suppression Fire needs a ranged weapon with AUTO (the Alpha's Rate 15+ still qualifies). */
export const canSuppress = profile => !!profile?.ranged && (!!profile.auto || int(profile.rate) >= 15);

// 2.1 book p.117: the Winner of a KILL THE BUDDHA buys effects with their Strikes. Each damaging effect deals the weapon's damage.
export const STRIKE_BUYS_21 = Object.freeze({
  hit: {cost: 1, label: "HIT", text: "a Random or Controlled Part"},
  knockback: {cost: 1, label: "KNOCKBACK", text: "2 m"},
  body: {cost: 2, label: "BODY HIT", text: "the Torso"},
  called: {cost: 3, label: "CALLED HIT", text: "a Limb"},
  head: {cost: 4, label: "HEAD HIT", text: "the Head"}
});
const LIMB_KEYS = Object.freeze(Object.keys(PARTS).filter(key => PARTS[key].limb));

/** The choices one Strike-spending slot offers with `strikes` in hand: value, label, cost, and the Part hit ("random", a Part key, or "" for none). */
export function strikeOptions21(strikes) {
  const n = Math.max(0, int(strikes)), out = [];
  const add = (value, buy, part, label) => { if (STRIKE_BUYS_21[buy].cost <= n) out.push({value, buy, part, cost: STRIKE_BUYS_21[buy].cost, label: `${STRIKE_BUYS_21[buy].label} [${STRIKE_BUYS_21[buy].cost}] — ${label}`}); };
  add("hit:random", "hit", "random", "a random Part (rolls d6)");
  for (const key of Object.keys(PARTS)) add(`hit:${key}`, "hit", key, `Controlled Part: ${PARTS[key].label}`);
  add("knockback", "knockback", "", "Knockback 2 m, no damage");
  add("body", "body", "torso", "the Torso");
  for (const key of LIMB_KEYS) add(`called:${key}`, "called", key, PARTS[key].label);
  add("head", "head", "head", "the Head");
  return out;
}

/**
 * Checks a list of chosen effects against the Strikes won. Ranged weapons without AUTO (`single`) buy one effect only and
 * turn every Strike left over into +1 damage on it (p.117: a Bow with 3 Strikes hits a random Part for +2).
 */
export function strikePlan21(strikes, picks = [], {single = false} = {}) {
  const n = Math.max(0, int(strikes)), options = new Map(strikeOptions21(n).map(option => [option.value, option]));
  const chosen = picks.filter(Boolean);
  const unknown = chosen.find(value => !options.has(value));
  if (unknown) return {ok: false, error: `${n} Strike${n === 1 ? "" : "s"} cannot buy that effect.`, effects: [], spent: 0, left: n, extraDamage: 0};
  const effects = chosen.map(value => options.get(value)), spent = effects.reduce((sum, effect) => sum + effect.cost, 0);
  if (!effects.length) return {ok: false, error: "Choose at least one effect.", effects, spent, left: n, extraDamage: 0};
  if (single && effects.length > 1) return {ok: false, error: "A ranged weapon without AUTO buys a single effect; the other Strikes add damage.", effects, spent, left: n - spent, extraDamage: 0};
  if (spent > n) return {ok: false, error: `Those effects cost ${spent} Strikes; only ${n} were won.`, effects, spent, left: n - spent, extraDamage: 0};
  const extraDamage = single && effects[0].part ? n - spent : 0;
  return {ok: true, error: "", effects, spent, left: single ? 0 : n - spent, extraDamage};
}

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

/** 2.1 book p.202: each Armor Piece can have one fitted Mod (Left and Right pieces separately; a garment covering several
 *  Parts fits only one). Even at Soak 0 an intact Mod still works. `limbs` Mods fit Arm / Torso / Leg pieces only. */
export const ARMOR_MODS_21 = Object.freeze({
  breakaway: {label: "BREAKAWAY", fits: "any", soak: 0, text: "The book's entry is cut off (\"When this Part is\"); recorded on the piece, no effect applied."},
  sheathe: {label: "SHEATHE", fits: "limbs", soak: 0, text: "Conceals one designated hand tool or CONCEALABLE weapon; it can be drawn at any point."},
  reinforced: {label: "REINFORCED", fits: "any", soak: 1, text: "+1 Soak and doubled Durability."},
  silent: {label: "SILENT", fits: "any", soak: 0, text: "This Part does not make noise."},
  mourningLacquer: {label: "MOURNING LACQUER", fits: "any", soak: 1, text: "+1 Soak. When this armor reduces damage with its Soak, the attacker cannot Step on the next Tick.", onSoak: "the attacker cannot Step on the next Tick"},
  retributiveScript: {label: "RETRIBUTIVE SCRIPT", fits: "limbs", soak: 1, text: "+1 Soak. When this piece reduces damage with its Soak, deal 1 true damage back at the attacker.", onSoak: "deal 1 true damage back at the attacker"},
  magnetic: {label: "MAGNETIC", fits: "any", soak: 1, text: "+1 Soak. When this piece reduces damage with its Soak, a magnetic weapon is Controlled by the armor until another Action removes it.", onSoak: "if the weapon used was magnetic, it is Controlled by the armor until another Action is taken to remove it"},
  featherweight: {label: "FEATHERWEIGHT", fits: "any", soak: 0, text: "This Part's weight is halved."}
});
export const ARMOR_MOD_KEYS = Object.freeze(Object.keys(ARMOR_MODS_21));
/** Does the piece's Mod work on this Part? Only Parts the piece covers; Arm/Torso/Leg Mods never on the Head. */
export function armorModOn21(item, part) {
  const r21 = item?.system?.r21, mod = ARMOR_MODS_21[r21?.mod];
  if (!mod || !(int(r21.coverage?.[part]) > 0)) return null;
  return mod.fits === "limbs" && part === "head" ? null : r21.mod;
}

const PHYSICAL = ["weapon", "fashion", "gear", "accessory", "ammunition", "armor", "salvage"];
/** p.63: carried kilograms from item weights. Ammunition weight is per stack; other items multiply by quantity. */
export function itemWeight(items = []) {
  const total = items.filter(item => PHYSICAL.includes(item?.type)).reduce((sum, item) => {
    const kg = Math.max(0, Number(item.system?.r21?.weight) || 0) * (item.type !== "weapon" && item.system?.r21?.mod === "featherweight" ? 0.5 : 1);
    return sum + kg * (item.type === "ammunition" ? 1 : Math.max(0, Number(item.system?.quantity ?? 1) || 0));
  }, 0);
  return Math.round(total * 100) / 100;
}

/** Derived 2.1 values for an actor. `items` are plain item data ({type, system}). */
export function derive21(system, items = []) {
  const worn = items.filter(item => item?.system?.equipped && item.system.r21 && item.type !== "weapon");
  // Armor Mods (2.1 p.202): Reinforced, Mourning Lacquer, Retributive Script and Magnetic add +1 Soak to the Parts the piece covers.
  const modsOn = key => worn.map(item => armorModOn21(item, key)).filter(Boolean);
  const coverage = key => worn.reduce((sum, item) => sum + Math.max(0, int(item.system.r21.coverage?.[key])), 0) + modsOn(key).reduce((sum, mod) => sum + ARMOR_MODS_21[mod].soak, 0);
  const gearMorale = worn.reduce((sum, item) => sum + int(item.system.r21.morale), 0);
  const assets = allAssets21(system, items);
  system = {...system, assets};
  const parts = {};
  for (const key of PART_KEYS) {
    const stored = system.parts?.[key] ?? {};
    const max = partMaximum(key, {bonus: stored.hpBonus, assets, physique: system.cores?.phy, sidhi: system.sidhi});
    const soakMax = Math.max(0, int(stored.soakBase)) + coverage(key);
    parts[key] = {...partState(max, stored.damage), label: PARTS[key].label, soakMax, soak: Math.max(0, soakMax - Math.max(0, int(stored.soakLost))), armorMods: modsOn(key)};
  }
  const disabledLegs = ["rleg", "lleg"].filter(key => parts[key].disabled).length;
  const moraleMax = moraleMaximum(system, gearMorale);
  const itemKg = itemWeight(items), carriedKg = Math.round((itemKg + Math.max(0, Number(system.carriedKg) || 0)) * 100) / 100;
  const sidhi = Math.max(0, int(system.sidhi));
  return {parts, assets, flameMax: flameMaximum21(sidhi), meridians: meridians21(sidhi), scorch: Math.max(0, int(system.scorch)), speed: speed(system), moraleMax, morale: Math.max(0, Math.min(moraleMax, int(system.morale?.value))),
    shattered: int(system.morale?.value) <= 0, carryLimit: carryLimit(system),
    itemKg, carriedKg, movement: movement(system, {disabledLegs, carriedKg}),
    ticks: ticks21(system, {encumbrance: encumbrance21(carriedKg, carryLimit(system)),
      weaponSpd: Math.max(0, ...items.filter(item => item?.type === "weapon" && item.system?.equipped).map(item => weaponProfile21(item.system).spd))}),
    disabled: PART_KEYS.filter(key => parts[key].disabled)};
}

export {stars as clampStars};

/** 2.1 rulebook p.90: "A Cultivator has [3 + Sidhi Level] max Flames." (Was 2 + Sidhi, Red Kalpa Manuscript p.52, until 0.2.42.) */
export const flameMaximum21 = sidhi => 3 + Math.max(0, int(sidhi));

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
  return {burn, install, cultivation, stars, weapon: String(flags.weaponRequirement ?? "").trim(), variable: /\[X\]|\.\.\.|[✹❂]\s*(?:\/|or)\s*[✹❂]/i.test(flags.needs ?? ""),
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
  const profileNeed = {SWORD: "sword", SABER: "saber", POLEARM: "polearm", DAGGER: "dagger", HANDGUN: "handgun", LONGGUN: "longgun", BOW: "bow", CROSSBOW: "crossbow", WHIP: "whip", BLUDGEON: "bludgeon", CLEAVER: "cleaver", LAUNCHER: "launcher"};
  for (const [word, key] of Object.entries(profileNeed)) if (new RegExp(`\\b${word}S?\\b`).test(text)) checks.push(() => profiles.some(entry => entry.profile.key === key));
  if (/EMPTY HAND/.test(text)) checks.push(() => freeHand);
  if (/GREAT|COLOSSAL/.test(text)) checks.push(() => profiles.some(entry => entry.mods.great || entry.mods.colossal));
  if (/AUTO/.test(text)) checks.push(() => profiles.some(entry => entry.mods.auto));
  if (/AMMO/.test(text)) checks.push(() => profiles.some(entry => entry.profile.ranged));
  if (/MELEE WEAPON/.test(text)) checks.push(() => profiles.some(entry => !entry.profile.ranged));
  if (!checks.length) return {met: true, label: requirement, unknown: true};
  return {met: checks.some(check => check()), label: requirement};
}
