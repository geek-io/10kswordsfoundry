// Rules 2.1 Cultivator Discovery (2.1 rulebook pp.42-48, 62, 166): the eight Sutras as data and pure checks.
// From 0.2.47 a first step sets the starting Sidhi Stage or XP agreed with the Intercessor (pp.100-101, 108); the XP is spent on
// Sidhi Progression (Core and Cultivation Stars, Assets, Licenses) inside the later steps. From 0.2.48 XP can also buy another Sect:
// a Cultivator may ingest a different Barang and cultivate it (p.236); the book prints no price for that, so the tool charges what
// p.100 does print, the new Sect's Cultivation Stars (3 × the new rating) and 10 XP for each of its Licenses.
// Nothing here touches Foundry, so the creation tool, the chat card and the tests all read the same rules.
import {CORES, CORE_KEYS, CULTIVATIONS_21, CULTIVATION_KEYS_21, ASSETS_21, ATTACHMENT_STRENGTHS, carryLimit, encumbrance21, flameMaximum21} from "./rules21.mjs?v=0.2.50";
import {escapeHTML} from "./resolution.mjs?v=0.2.50";

const int = value => Math.trunc(Number(value) || 0);
const text = value => String(value ?? "").trim();
export const stars21 = n => "✦".repeat(Math.max(0, int(n)));

// pp.44-48: Class is rolled on 3d6 or chosen; the default is Proletariat (p.42). Every other Sutra depends on it.
export const CLASSES_21 = Object.freeze({
  lumpenproletariat: {label: "Lumpenproletariat", roll: [3, 6], cores: [2, 2, 2, 2, 1, 1], cultivations: {2: 3, 1: 3}, assets: 1, supply: "One item, randomly rolled", maccaPerD6: 1, page: 44,
    subtypeLabel: "Type", subtypes: [{roll: [1, 3], label: "Reserve Army"}, {roll: [4, 5], label: "Underworld"}, {roll: [6, 6], label: "Declassed"}]},
  semiproletariat: {label: "Semiproletariat", roll: [7, 8], cores: [3, 2, 2, 2, 1, 1], cultivations: {2: 4, 1: 4}, assets: 2, supply: "", maccaPerD6: 40, page: 45, subtypes: []},
  proletariat: {label: "Proletariat", roll: [9, 12], cores: [3, 3, 2, 2, 1, 1], cultivations: {2: 5, 1: 5}, assets: 2, supply: "", maccaPerD6: 20, page: 45,
    subtypeLabel: "Sector", subtypes: [{roll: [1, 1], label: "Mining"}, {roll: [2, 2], label: "Agrarian"}, {roll: [3, 3], label: "Industry"}, {roll: [4, 4], label: "Service"}, {roll: [5, 5], label: "Transport"}, {roll: [6, 6], label: "Sect"}]},
  petitBourgeoisie: {label: "Petit Bourgeoisie", roll: [13, 13], cores: [3, 3, 3, 2, 1, 1], cultivations: {2: 5, 1: 5}, assets: 3, supply: "", maccaPerD6: 160, page: 46, subtypes: []},
  sphericalBourgeoisie: {label: "Spherical Bourgeoisie", roll: [14, 14], cores: [3, 3, 3, 2, 2, 1], cultivations: {3: 1, 2: 5, 1: 5}, assets: 4, supply: "", maccaPerD6: 200, page: 46,
    subtypeLabel: "Struggle", subtypes: [{roll: [1, 4], label: "Sub-Spherical or National Bourgeoisie"}, {roll: [5, 6], label: "World Bourgeoisie"}]},
  compradorBourgeois: {label: "Comprador Bourgeois", roll: [15, 15], cores: [3, 3, 3, 2, 2, 2], cultivations: {3: 2, 2: 5, 1: 5}, assets: 4, supply: "", maccaPerD6: 300, page: 47, subtypes: []},
  bureaucratCapitalists: {label: "Bureaucrat Capitalists", roll: [16, 16], cores: [3, 3, 3, 2, 2, 2], cultivations: {3: 2, 2: 5, 1: 5}, assets: 4, supply: "", maccaPerD6: 500, page: 47, subtypes: []},
  landlord: {label: "Landlord", roll: [17, 17], cores: [3, 3, 3, 3, 2, 2], cultivations: {3: 3, 2: 5, 1: 5}, assets: 5, supply: "", maccaPerD6: 800, page: 48, subtypes: []},
  heavenlyBourgeoisie: {label: "Heavenly Bourgeoisie", roll: [18, 18], cores: [4, 3, 3, 3, 2, 2], cultivations: {3: 5, 2: 5, 1: 5}, assets: 6, supply: "", maccaPerD6: 1000, page: 48, subtypes: []}
});
export const CLASS_KEYS_21 = Object.freeze(Object.keys(CLASSES_21));
export const DEFAULT_CLASS_21 = "proletariat";
export const STEPS_21 = Object.freeze({start: "1 · Starting Sidhi", class: "2 · Class", cores: "3 · Cores", cultivations: "4 · Cultivations", assets: "5 · Assets", supply: "6 · Supply",
  identity: "7 · Identity", sect: "8 · Sect", sidhi: "9 · Sidhi", review: "10 · Review"});
export const FIRST_STEP_21 = "start";
export const SUTRA_KEYS_21 = Object.freeze(Object.keys(STEPS_21).filter(key => key !== "review"));
// p.42 Sutra 7: the Sect's Cultivation starts at ✦✦, and the two Licenses must be ones the Cultivator qualifies for.
export const SECT_START_STARS_21 = 2, START_LICENSES_21 = 2, MIN_ATTACHMENTS_21 = 3, MAX_EXTRA_SECTS_21 = 2;

const inRange = (value, [low, high]) => int(value) >= low && int(value) <= high;

// pp.100-101 and 108: spent XP becomes Foundation, and each Desire Realm Stage needs a total of Foundation. A Cultivator cannot
// skip a Stage; ascending also takes a Tribulation and burning [10,000 × next Stage] ♄, which a character who starts higher has done.
export const SIDHI_STAGES_21 = Object.freeze([
  {stage: 0, name: "Stage 0", foundation: 0}, {stage: 1, name: "Lightning Gatherer", foundation: 50}, {stage: 2, name: "Karmic Furnace", foundation: 150},
  {stage: 3, name: "Demifiend", foundation: 300}, {stage: 4, name: "Revolt Shrine", foundation: 500}, {stage: 5, name: "Furious Deity", foundation: 750},
  {stage: 6, name: "Lucifer Consciousness", foundation: 1050}].map(Object.freeze));
export const MAX_START_XP_21 = 5000;
/** The highest Stage a Foundation total reaches. */
export const sidhiFromXp21 = xp => SIDHI_STAGES_21.filter(row => Math.max(0, int(xp)) >= row.foundation).at(-1).stage;
/** The XP agreed for the start: the Stage's Foundation, or the custom amount. */
export const startXp21 = draft => draft?.start?.mode === "xp" ? Math.max(0, Math.min(MAX_START_XP_21, int(draft.start.xp))) : SIDHI_STAGES_21[Math.max(0, Math.min(6, int(draft?.start?.sidhi)))].foundation;
/** The Stage the character starts at: the one chosen, or the one the custom XP reaches. */
export const startSidhi21 = draft => draft?.start?.mode === "xp" ? sidhiFromXp21(startXp21(draft)) : Math.max(0, Math.min(6, int(draft?.start?.sidhi)));

// p.100 Sidhi Progression: a new Core Star costs 5 × the new rating, a Cultivation Star 3 × the new rating (to 5), an Asset 4 × its new
// rating, a Sect License 10. Stars bought at Discovery sit on top of what the Class gives.
const steps = (from, count, cost) => { let sum = 0; for (let rating = from + 1; rating <= from + count; rating++) sum += cost * rating; return sum; };
const capped = (base, extra) => Math.max(0, Math.min(MAX_STAR_21 - Math.max(0, int(base)), int(extra)));
const MAX_STAR_21 = 5;
/** Core ratings after the XP Stars. */
export const finalCores21 = draft => Object.fromEntries(CORE_KEYS.map(key => [key, int(draft.cores?.[key]) + capped(draft.cores?.[key], draft.xpCores?.[key])]));
/** Basic Cultivation ratings after the XP Stars (only the rated ones). */
export const finalSkills21 = draft => Object.fromEntries(CULTIVATION_KEYS_21.map(key => [key, int(draft.skills?.[key]) + capped(draft.skills?.[key], draft.xpSkills?.[key])]).filter(([, value]) => value > 0));
/** The Sect Cultivation: ✦✦ from Sutra 7, plus any Stars bought with XP. */
export const sectStars21 = draft => SECT_START_STARS_21 + capped(SECT_START_STARS_21, draft.xpSect);
/**
 * The page of the final 423-page 2.1 rulebook that prints a catalog entry, read from its `source` ("Rules 2.1 (2.1 rulebook), p.198").
 * null when the entry comes from anything else (the Red Kalpa Manuscript one-shot, the playtest Sects). Catalog sources still carry the
 * 357-page numbering, which the final book shifts by +2 for pp.3–36 and +14 from p.37 on (see rules-basis-2.1.md, 0.2.44).
 */
export function bookPage21(source) {
  const match = /\(2\.1 rulebook\),\s*p\.(\d+)/i.exec(String(source ?? ""));
  if (!match) return null;
  const page = int(match[1]);
  return page >= 37 ? page + 14 : page >= 3 ? page + 2 : page;
}

/** Stars in a Sect's Cultivation: the Sutra 7 Sect, or a Sect whose Barang was bought with XP. 0 for a Sect the Cultivator does not hold. */
export function sectStarsFor21(draft, sect) {
  if (sect && sect === draft?.sect) return sectStars21(draft);
  const extra = (draft?.extraSects ?? []).find(row => row.sect === sect);
  return extra ? Math.max(0, Math.min(MAX_STAR_21, int(extra.stars))) : 0;
}
/** The two Sutra 7 Licenses are free; they must come from the first Sect. Every other License costs 10 XP. */
export const freeLicenses21 = draft => Math.min(START_LICENSES_21, (draft?.licenses ?? []).filter(row => row.sect === draft.sect).length);
/** XP for the extra Sects: their Cultivation bought from nothing at 3 × each new rating. */
const extraSectXp21 = draft => (draft?.extraSects ?? []).reduce((sum, row) => sum + steps(0, Math.max(0, Math.min(MAX_STAR_21, int(row.stars))), 3), 0);
/** How many Asset Stars each row takes from the Class budget (rows in order) and what the rest costs in XP. */
function assetXp21(draft) {
  let budget = CLASSES_21[draft.classKey].assets, xp = 0, stars = 0;
  for (const row of draft.assets ?? []) {
    const rating = Math.max(0, int(row.stars)), paid = Math.min(rating, Math.max(0, budget));
    budget -= paid;
    if (rating > paid) { stars += rating - paid; xp += paid ? steps(paid, rating - paid, 4) : 4 * rating; }
  }
  return {xp, stars};
}

/** The starting XP and where it went. Licenses past the first two cost 10 XP each. */
export function xpBudget21(draft) {
  const start = startXp21(draft), sidhi = startSidhi21(draft);
  const cores = CORE_KEYS.reduce((sum, key) => sum + steps(int(draft.cores?.[key]), capped(draft.cores?.[key], draft.xpCores?.[key]), 5), 0);
  const cultivations = CULTIVATION_KEYS_21.reduce((sum, key) => sum + steps(int(draft.skills?.[key]), capped(draft.skills?.[key], draft.xpSkills?.[key]), 3), 0);
  const sect = steps(SECT_START_STARS_21, capped(SECT_START_STARS_21, draft.xpSect), 3);
  const asset = assetXp21(draft), licenses = Math.max(0, (draft.licenses?.length ?? 0) - freeLicenses21(draft)) * 10, extraSects = extraSectXp21(draft);
  const spent = cores + cultivations + sect + asset.xp + licenses + extraSects;
  return {start, sidhi, stage: SIDHI_STAGES_21[sidhi], cores, cultivations, sect, assets: asset.xp, assetStars: asset.stars, licenses, extraSects, spent, left: start - spent,
    meridians: 2 + sidhi, flame: flameMaximum21(sidhi), next: SIDHI_STAGES_21[sidhi + 1] ?? null};
}
/** What one more Star costs, for the step pages. */
export const nextStarCost21 = (rating, per) => int(rating) >= MAX_STAR_21 ? null : per * (int(rating) + 1);
/** The Class a 3d6 total lands on (pp.44-48). */
export const classFromRoll21 = total => CLASS_KEYS_21.find(key => inRange(total, CLASSES_21[key].roll)) ?? null;
/** The d6 sub-table some Classes carry (type, sector, struggle). */
export const subtypeFromRoll21 = (classKey, d6) => CLASSES_21[classKey]?.subtypes.find(entry => inRange(d6, entry.roll))?.label ?? "";
export const rollLabel21 = ([low, high]) => low === high ? String(low) : `${low}-${high}`;
/** Starting Macca: the Class multiplier × one d6 (pp.44-48). */
export const startingMacca21 = (classKey, d6) => inRange(d6, [1, 6]) ? Math.max(0, int(CLASSES_21[classKey]?.maccaPerD6)) * int(d6) : 0;

// p.62: syllables, found by rolling 2d6 twice (row, then column). Columns are 2, 3, 4 … 10 and 11-12.
const NAME_ROWS = ["SA TA KA TAT DIN KET JO SONG TRANG ĲA", "ANG RA JU DEN TAN KAG JYA ME TUNG SUN", "MA GAN HA WI SANG A DA YU NA XUN", "HOM LING SU YA DJO LI JONG AD LAM RAM",
  "KI MOENG ZAN SAT MI UI ZON KEH TJIA YO", "JA FENG RENG TONG RI XE RO REO NE CHO", "O E KANG HAN WANG UA KI KUN LUN GO", "KASH INTA DA INDA JAM KU JOH TAR DE SERI",
  "RIN GEOH HYAN PRA RAI YOE ZOE KOH WU BU", "SUNG RIM LIM TAM KIEN DIA WA KON LOONG TEO", "SHOK CHIM GOT THA YUN TAL RA XOE YE YONG"];
export const NAME_SYLLABLES_21 = Object.freeze(NAME_ROWS.map(row => Object.freeze(row.split(" "))));
/** One syllable from two 2d6 totals: the row (2-12), then the column (2-10, with 11 and 12 sharing the last). */
export function nameSyllable21(row, column) {
  if (!inRange(row, [2, 12]) || !inRange(column, [2, 12])) return "";
  return NAME_SYLLABLES_21[int(row) - 2][Math.min(int(column), 11) - 2];
}
/** Syllables read as a name: SONG + KET → Songket. */
export const nameFromSyllables21 = syllables => { const joined = syllables.join("").toLocaleLowerCase(); return joined.charAt(0).toLocaleUpperCase() + joined.slice(1); };

// Sutra 8 only asks for a colour and an Ajna to be made up. These feed the "roll everything" button: the Ajna forms are the ones
// the book names (pp.42, 90); the colours are plain colour words, not from the book.
export const AJNA_FORMS_21 = Object.freeze(["a third eye", "a sunburst", "a full halo", "a half halo", "a crown", "a crest", "fire upon the brow", "a brow mark", "a jewel", "an unalome", "an aureole", "horns", "a moondisc"]);
export const SIDHI_COLORS_21 = Object.freeze(["white", "black", "red", "crimson", "orange", "gold", "yellow", "green", "jade", "teal", "blue", "indigo", "violet", "pink", "silver", "grey"]);

/** Fisher-Yates with a supplied 0-1 source, so tests can drive it. */
export function shuffle21(list, random = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.min(i, Math.floor(random() * (i + 1))); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/** Sutra 2 at random: the Class's six Star values dealt across the six Cores. */
export function randomCores21(classKey, random = Math.random) {
  const values = shuffle21(CLASSES_21[classKey].cores, random);
  return Object.fromEntries(CORE_KEYS.map((key, index) => [key, values[index]]));
}

/** Sutra 3 at random: the Class's Cultivation ratings dealt across randomly drawn basic Cultivations. */
export function randomCultivations21(classKey, random = Math.random) {
  const keys = shuffle21(CULTIVATION_KEYS_21, random), skills = {};
  let at = 0;
  for (const [rating, count] of Object.entries(CLASSES_21[classKey].cultivations).toSorted((a, b) => b[0] - a[0])) for (let n = 0; n < count; n++) skills[keys[at++]] = Number(rating);
  return skills;
}

/**
 * Spends the XP that is left at random on Sidhi Progression (p.100): Core Stars, Cultivation Stars, Sect Cultivation Stars and
 * Licenses. `kinds` limits what is bought; `licenses` is the pool of License rows ({uuid, name, stars, cultivation, sect}) to draw
 * from. Each purchase is tried and kept only if the XP still covers it. Assets are left alone: a new one must make sense in the
 * fiction (p.100). Changes the draft in place and returns a line per purchase.
 */
export function spendXpRandom21(draft, {kinds = ["cores", "cultivations", "sect", "licenses"], licenses = [], random = Math.random} = {}) {
  const pick = list => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
  draft.xpCores ??= {}; draft.xpSkills ??= {}; draft.extraSects ??= []; draft.licenses ??= [];
  const bought = [];
  const fits = () => xpBudget21(draft).left >= 0;
  const buyers = {
    cores: () => CORE_KEYS.filter(key => int(draft.cores?.[key]) > 0 && finalCores21(draft)[key] < MAX_STAR_21).map(key => () => {
      draft.xpCores[key] = int(draft.xpCores[key]) + 1;
      if (fits()) return `${CORES[key].abbr} ${stars21(finalCores21(draft)[key])}`;
      draft.xpCores[key] -= 1; return null;
    }),
    cultivations: () => CULTIVATION_KEYS_21.filter(key => int(finalSkills21(draft)[key]) < MAX_STAR_21).map(key => () => {
      draft.xpSkills[key] = int(draft.xpSkills[key]) + 1;
      if (fits()) return `${CULTIVATIONS_21[key].label} ${stars21(finalSkills21(draft)[key])}`;
      draft.xpSkills[key] -= 1; if (!draft.xpSkills[key]) delete draft.xpSkills[key]; return null;
    }),
    sect: () => [...(draft.sect && sectStars21(draft) < MAX_STAR_21 ? [() => {
      draft.xpSect = int(draft.xpSect) + 1;
      if (fits()) return `${draft.cultivation} ${stars21(sectStars21(draft))}`;
      draft.xpSect -= 1; return null;
    }] : []), ...draft.extraSects.filter(row => row.stars < MAX_STAR_21).map(row => () => {
      row.stars += 1;
      if (fits()) return `${row.cultivation} ${stars21(row.stars)}`;
      row.stars -= 1; return null;
    })],
    licenses: () => {
      if (draft.licenses.length >= xpBudget21(draft).meridians) return [];
      const chosen = new Set(draft.licenses.map(row => row.uuid));
      const open = licenses.filter(row => !chosen.has(row.uuid) && (row.sect === draft.sect || draft.extraSects.some(extra => extra.sect === row.sect)) && row.stars <= sectStarsFor21(draft, row.sect));
      return open.map(row => () => {
        draft.licenses.push({uuid: row.uuid, name: row.name, stars: row.stars, cultivation: row.cultivation, sect: row.sect});
        if (fits()) return `License: ${row.name}`;
        draft.licenses.pop(); return null;
      });
    }
  };
  for (let guard = 0; guard < 300 && xpBudget21(draft).left > 0; guard++) {
    const groups = kinds.map(kind => buyers[kind]?.() ?? []).filter(list => list.length);
    if (!groups.length) break;
    // A kind first, then an option inside it, so 30-odd Cultivations do not drown out the rest. Failed tries are dropped.
    let line = null;
    while (!line && groups.length) {
      const group = pick(groups), at = group.indexOf(pick(group));
      line = group[at]();
      if (!line) { group.splice(at, 1); if (!group.length) groups.splice(groups.indexOf(group), 1); }
    }
    if (!line) break;
    bought.push(line);
  }
  return bought;
}

/** A blank draft. Proletariat is the starting Class (p.42); everything else is the player's to fill in. */
export function emptyDraft21() {
  return {version: 1, name: "", classKey: DEFAULT_CLASS_21, subtype: "", cores: Object.fromEntries(CORE_KEYS.map(key => [key, 0])), skills: {},
    assets: [], maccaD6: 0, supply: [], culture: "", alignment: "", attachments: [{text: "", strength: 1}, {text: "", strength: 2}, {text: "", strength: 3}],
    sect: "", cultivation: "", barang: "", licenses: [], sectStory: "", sidhiColor: "", ajna: "", notes: "", log: [],
    start: {mode: "sidhi", sidhi: 0, xp: 0, agreed: false}, xpCores: {}, xpSkills: {}, xpSect: 0, extraSects: []};
}

/** Brings stored data (a chat card may hold anything) back to a well-formed draft. */
export function normalizeDraft21(raw) {
  const base = emptyDraft21(), data = raw && typeof raw === "object" ? raw : {};
  const list = value => Array.isArray(value) ? value : [];
  return {...base,
    name: text(data.name).slice(0, 120), classKey: CLASSES_21[data.classKey] ? data.classKey : DEFAULT_CLASS_21, subtype: text(data.subtype).slice(0, 80),
    cores: Object.fromEntries(CORE_KEYS.map(key => [key, Math.max(0, Math.min(5, int(data.cores?.[key])))])),
    skills: Object.fromEntries(CULTIVATION_KEYS_21.map(key => [key, Math.max(0, Math.min(5, int(data.skills?.[key])))]).filter(([, value]) => value > 0)),
    assets: list(data.assets).slice(0, 12).map(row => ({key: ASSETS_21[row?.key] ? row.key : "custom", stars: Math.max(0, Math.min(5, int(row?.stars))), detail: text(row?.detail).slice(0, 300)})),
    maccaD6: inRange(data.maccaD6, [1, 6]) ? int(data.maccaD6) : 0,
    supply: list(data.supply).slice(0, 60).map(row => ({uuid: text(row?.uuid), name: text(row?.name).slice(0, 160), price: Math.max(0, int(row?.price)), kg: Math.max(0, Math.round((Number(row?.kg) || 0) * 100) / 100), qty: Math.max(1, Math.min(99, int(row?.qty) || 1)), free: !!row?.free, note: text(row?.note).slice(0, 160)})).filter(row => row.uuid),
    culture: text(data.culture).slice(0, 80), alignment: text(data.alignment).slice(0, 80),
    attachments: list(data.attachments).slice(0, 20).map(row => ({text: String(row?.text ?? "").slice(0, 300), strength: Math.max(1, Math.min(3, int(row?.strength) || 1))})),
    sect: text(data.sect).slice(0, 80), cultivation: text(data.cultivation).slice(0, 80), barang: text(data.barang).slice(0, 120),
    licenses: list(data.licenses).slice(0, 8).map(row => ({uuid: text(row?.uuid), name: text(row?.name).slice(0, 160), stars: Math.max(0, int(row?.stars)), cultivation: text(row?.cultivation).slice(0, 80), sect: text(row?.sect).slice(0, 80)})).filter(row => row.uuid),
    sectStory: String(data.sectStory ?? "").slice(0, 2000), sidhiColor: text(data.sidhiColor).slice(0, 80), ajna: String(data.ajna ?? "").slice(0, 2000), notes: String(data.notes ?? "").slice(0, 4000),
    log: list(data.log).slice(-60).map(entry => text(entry).slice(0, 200)).filter(Boolean),
    start: {mode: data.start?.mode === "xp" ? "xp" : "sidhi", sidhi: Math.max(0, Math.min(6, int(data.start?.sidhi))), xp: Math.max(0, Math.min(MAX_START_XP_21, int(data.start?.xp))), agreed: !!data.start?.agreed},
    xpCores: Object.fromEntries(CORE_KEYS.map(key => [key, Math.max(0, Math.min(5, int(data.xpCores?.[key])))]).filter(([, value]) => value > 0)),
    xpSkills: Object.fromEntries(CULTIVATION_KEYS_21.map(key => [key, Math.max(0, Math.min(5, int(data.xpSkills?.[key])))]).filter(([, value]) => value > 0)),
    xpSect: Math.max(0, Math.min(3, int(data.xpSect))),
    extraSects: list(data.extraSects).slice(0, MAX_EXTRA_SECTS_21).map(row => ({sect: text(row?.sect).slice(0, 80), cultivation: text(row?.cultivation).slice(0, 80), barang: text(row?.barang).slice(0, 120), stars: Math.max(0, Math.min(MAX_STAR_21, int(row?.stars)))}))
      .filter((row, index, all) => row.sect && all.findIndex(other => other.sect === row.sect) === index)};
}

const tally = values => values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map());
const describeStars = counts => [...counts].toSorted((a, b) => b[0] - a[0]).map(([rating, count]) => `${stars21(rating)} × ${count}`).join(", ") || "none";

/** Sutra 2: which of the Class's Core Star values are still unassigned, and which assigned values the Class does not give. */
export function corePool21(draft) {
  const want = tally(CLASSES_21[draft.classKey].cores), have = tally(CORE_KEYS.map(key => int(draft.cores?.[key])).filter(value => value > 0));
  const remaining = new Map(), extra = new Map();
  for (const [rating, count] of want) if (count > (have.get(rating) ?? 0)) remaining.set(rating, count - (have.get(rating) ?? 0));
  for (const [rating, count] of have) if (count > (want.get(rating) ?? 0)) extra.set(rating, count - (want.get(rating) ?? 0));
  return {remaining, extra, done: !remaining.size && !extra.size};
}

/** Sutra 3: how many basic Cultivations sit at each rating against what the Class allots. */
export function cultivationPool21(draft) {
  const want = CLASSES_21[draft.classKey].cultivations;
  const have = tally(CULTIVATION_KEYS_21.map(key => int(draft.skills?.[key])).filter(value => value > 0));
  const ratings = [...new Set([...Object.keys(want).map(Number), ...have.keys()])].toSorted((a, b) => b - a);
  const rows = ratings.map(rating => ({rating, want: int(want[rating]), have: have.get(rating) ?? 0}));
  return {rows, done: rows.every(row => row.want === row.have)};
}

/** Sutra 4: Asset Stars bought against the Class's Stars to buy. */
export function assetBudget21(draft) {
  const budget = CLASSES_21[draft.classKey].assets, spent = (draft.assets ?? []).reduce((sum, row) => sum + Math.max(0, int(row.stars)), 0), xp = assetXp21(draft);
  return {budget, spent, left: budget - spent, xpStars: startXp21(draft) > 0 ? xp.stars : 0, xpCost: startXp21(draft) > 0 ? xp.xp : 0};
}

/** Sutra 5: Macca spent on Supply against the starting Macca. Lines marked free (Class Supply, Debt, Patron) cost nothing. */
export function supplyBudget21(draft) {
  const total = startingMacca21(draft.classKey, draft.maccaD6);
  const spent = (draft.supply ?? []).reduce((sum, row) => sum + (row.free ? 0 : Math.max(0, int(row.price)) * Math.max(1, int(row.qty))), 0);
  return {total, spent, left: total - spent, free: (draft.supply ?? []).filter(row => row.free).length};
}

/** Sutra 5 and p.182: what the Supply weighs against the Carry Limit (10 kg + Physique × 10 kg), and the encumbrance tier that follows. */
export function carryCheck21(draft) {
  const limit = carryLimit({cores: draft.cores}), kg = Math.round((draft.supply ?? []).reduce((sum, row) => sum + Math.max(0, Number(row.kg) || 0) * Math.max(1, int(row.qty)), 0) * 100) / 100;
  const tier = encumbrance21(kg, limit);
  return {limit, kg, tier, over: tier > 0, physique: int(draft.cores?.phy),
    text: tier ? `Carrying ${kg} kg against a Carry Limit of ${limit} kg: -${tier} to all Checks, -${tier} m/s Movement, +${tier} Speed, and no Lightness Technique (p.182).` : ""};
}

/** Sutras 2 and 3: the ratings a dropdown may still offer, given what is left in the pool. The current value always stays. */
export function coreChoices21(draft, key) {
  const left = corePool21(draft).remaining, current = int(draft.cores?.[key]);
  return [...new Set([...left.keys(), ...(current > 0 ? [current] : [])])].toSorted((a, b) => b - a);
}
export function cultivationChoices21(draft, key) {
  const current = int(draft.skills?.[key]);
  const open = cultivationPool21(draft).rows.filter(row => row.want > row.have).map(row => row.rating);
  return [...new Set([...open, ...(current > 0 ? [current] : [])])].toSorted((a, b) => a - b);
}

/**
 * Checks a draft against the eight Sutras. `issues` must be cleared before the character is complete;
 * `notes` are things the rules leave to the table, listed for the GM's review.
 */
export function discoveryCheck21(input) {
  const draft = normalizeDraft21(input), info = CLASSES_21[draft.classKey];
  const issues = Object.fromEntries(SUTRA_KEYS_21.map(key => [key, []])), notes = Object.fromEntries(SUTRA_KEYS_21.map(key => [key, []]));
  const xp = xpBudget21(draft);

  if (!draft.start.agreed) issues.start.push("Confirm that this starting Sidhi Stage and XP are what you and your Intercessor agreed on.");
  if (xp.left < 0) issues.start.push(`${xp.spent} XP is spent; the start gives ${xp.start}. Take ${-xp.left} XP of purchases back.`);
  if (xp.sidhi > 0) notes.start.push(`Starting at Sidhi ${xp.sidhi} (${xp.stage.name}) counts the Tribulations and the ♄ burnt to ascend (pp.101, 108) as already done.`);
  if (xp.left > 0 && xp.start > 0) notes.start.push(`${xp.left} XP is not spent yet. Foundation is spent XP (p.100); what is left goes onto the sheet as XP.`);
  if (xp.next && draft.start.mode === "xp" && xp.start > xp.stage.foundation) notes.start.push(`${xp.start} XP is past Sidhi ${xp.sidhi} (${xp.stage.foundation}) but short of Sidhi ${xp.next.stage}, which needs ${xp.next.foundation}.`);

  if (info.subtypes.length && !info.subtypes.some(entry => entry.label === draft.subtype)) issues.class.push(`Roll or choose the ${info.label} ${info.subtypeLabel.toLowerCase()} (d6).`);

  const cores = corePool21(draft);
  if (cores.remaining.size) issues.cores.push(`Still to assign: ${describeStars(cores.remaining)}.`);
  if (cores.extra.size) issues.cores.push(`${info.label} does not give: ${describeStars(cores.extra)}.`);

  for (const row of cultivationPool21(draft).rows) {
    if (!row.want) issues.cultivations.push(`${info.label} gives no Cultivations at ${stars21(row.rating)}; ${row.have} set.`);
    else if (row.have !== row.want) issues.cultivations.push(`${stars21(row.rating)}: ${row.have} of ${row.want} Cultivations chosen.`);
  }

  const assets = assetBudget21(draft), seen = new Set();
  if (assets.left < 0 && !xp.start) issues.assets.push(`${assets.spent} Asset Stars bought; ${info.label} starts with ${assets.budget}.`);
  else if (assets.left < 0) notes.assets.push(`${assets.xpStars} Asset Star${assets.xpStars === 1 ? "" : "s"} past the Class's ${assets.budget} are bought with ${assets.xpCost} XP (4 × the new rating, p.100).`);
  else if (assets.left > 0) notes.assets.push(`${assets.left} Asset Star${assets.left === 1 ? "" : "s"} left unspent.`);
  for (const row of draft.assets) {
    const asset = ASSETS_21[row.key];
    if (!asset.code) { issues.assets.push(`${asset.label} is not one of the 36 starting Assets (p.211).`); continue; }
    if (row.stars < asset.min || row.stars > asset.max) issues.assets.push(`${asset.label} takes ${asset.min === asset.max ? stars21(asset.min) : `${stars21(asset.min)}–${stars21(asset.max)}`}; it has ${row.stars || "no"} Star${row.stars === 1 ? "" : "s"}.`);
    if (seen.has(row.key) && row.key !== "capital") notes.assets.push(`${asset.label} is taken more than once; only Capital says you can hold several (p.211).`);
    seen.add(row.key);
    if (row.key === "debt") notes.assets.push("Debt is a Firm Attachment, “I owe [Creditor]”, and lends the item named (p.211): add both.");
  }

  const supply = supplyBudget21(draft);
  if (!draft.maccaD6) issues.supply.push(`Roll the d6 for starting Macca (${info.maccaPerD6.toLocaleString("en-US")} × d6).`);
  else if (supply.left < 0) issues.supply.push(`Supply costs ${supply.spent.toLocaleString("en-US")} Macca; starting Macca is ${supply.total.toLocaleString("en-US")}.`);
  if (supply.free) notes.supply.push(`${supply.free} Supply line${supply.free === 1 ? " is" : "s are"} marked free (Class Supply, Debt or Patron).`);
  if (info.supply && !supply.free) notes.supply.push(`${info.label} Supply: ${info.supply} (p.${info.page}).`);
  const carry = carryCheck21(draft);
  if (carry.over) notes.supply.push(carry.text);

  if (!draft.name) issues.identity.push("Find a Name.");
  if (!draft.culture) issues.identity.push("Choose, roll or make up a Culture.");
  if (!draft.alignment) issues.identity.push("Choose or roll an Alignment.");
  const written = draft.attachments.filter(row => text(row.text));
  if (written.length < MIN_ATTACHMENTS_21) issues.identity.push(`Write at least ${MIN_ATTACHMENTS_21} Attachments (${written.length} written).`);
  for (const [strength, label] of Object.entries(ATTACHMENT_STRENGTHS)) if (!written.some(row => row.strength === Number(strength))) issues.identity.push(`At least one Attachment should be ${label}.`);

  if (!draft.sect) issues.sect.push("Choose one Sect and ingest its Barang.");
  const firstSect = draft.licenses.filter(row => row.sect === draft.sect).length;
  if (firstSect < START_LICENSES_21) issues.sect.push(`Choose ${START_LICENSES_21} Licenses (${firstSect} chosen).`);
  else if (draft.licenses.length > START_LICENSES_21 && !xp.start) issues.sect.push(`Choose ${START_LICENSES_21} Licenses (${draft.licenses.length} chosen).`);
  if (draft.licenses.length > xp.meridians) issues.sect.push(`${draft.licenses.length} Licenses need as many open Meridians; Sidhi ${xp.sidhi} opens ${xp.meridians} (p.100).`);
  if (draft.extraSects.length && !xp.start) issues.sect.push("Another Sect is bought with XP, and this start has none. Remove it, or agree on XP in step 1.");
  for (const extra of draft.extraSects) {
    if (extra.sect === draft.sect) issues.sect.push(`${extra.sect} is already the Sutra 7 Sect.`);
    else notes.sect.push(`${extra.sect}: a second Barang can be ingested and cultivated without losing what was learned (p.236); it is created carried, since the sheet keeps one Barang ingested. ${extra.cultivation} ${stars21(extra.stars) || "at no Stars"} costs ${steps(0, extra.stars, 3)} XP. The book prints no price for a second Barang; this tool charges only the Cultivation Stars and 10 XP per License (p.100).`);
  }
  const held = new Set([draft.sect, ...draft.extraSects.map(row => row.sect)].filter(Boolean));
  for (const license of draft.licenses) {
    const stars = sectStarsFor21(draft, license.sect);
    if (draft.sect && !held.has(license.sect)) issues.sect.push(`${license.name} is not a ${[...held].join(" or ")} License.`);
    else if (license.stars > stars) issues.sect.push(`${license.name} needs ${license.cultivation || "the Sect Cultivation"} ${stars21(license.stars)}; you have ${stars21(stars) || "no Stars"}.`);
  }
  if (draft.sect && !text(draft.sectStory)) notes.sect.push("How the Cultivator gained Sect Membership and Training is not written down yet.");

  if (!draft.sidhiColor) issues.sidhi.push("Choose the color of the Cultivator's Sidhi.");
  if (!text(draft.ajna)) issues.sidhi.push("Imagine her Ajna.");

  const count = Object.values(issues).reduce((sum, list) => sum + list.length, 0);
  return {issues, notes, count, complete: count === 0};
}

/** The Actor system data a finished draft becomes. Items (Class, Assets, Barang, Licenses, Supply) are added separately. */
export function actorSystem21(input) {
  const draft = normalizeDraft21(input), info = CLASSES_21[draft.classKey], supply = supplyBudget21(draft), xp = xpBudget21(draft), cores = finalCores21(draft), skills = finalSkills21(draft);
  const line = (label, value) => text(value) ? `<p><strong>${label}:</strong> ${escapeHTML(text(value)).replace(/\n+/g, "<br>")}</p>` : "";
  const notes = ["<h2>Cultivator Discovery</h2>", line("Class", `${info.label}${draft.subtype ? ` — ${draft.subtype}` : ""}`), line("Sect", draft.sect ? `${draft.sect} (${draft.cultivation} ${stars21(sectStars21(draft))}), Barang: ${draft.barang}` : ""),
    line("Other Sects", draft.extraSects.map(row => `${row.sect} (${row.cultivation} ${stars21(row.stars) || "no Stars"}), Barang: ${row.barang}`).join("; ")),
    line("Starting Sidhi", xp.start || xp.sidhi ? `Sidhi ${xp.sidhi} (${xp.stage.name}) from ${xp.start} XP agreed with the Intercessor; ${xp.spent} spent at Discovery, ${Math.max(0, xp.left)} left` : ""),
    line("Sect Membership", draft.sectStory), line("Sidhi color", draft.sidhiColor), line("Ajna", draft.ajna), line("Starting Macca", draft.maccaD6 ? `${info.maccaPerD6.toLocaleString("en-US")} × d6 (${draft.maccaD6}) = ${supply.total.toLocaleString("en-US")}; ${supply.spent.toLocaleString("en-US")} spent on Supply` : ""),
    line("Notes", draft.notes)].filter(Boolean).join("");
  return {cores: Object.fromEntries(CORE_KEYS.map(key => [key, Math.max(1, cores[key])])), skills: Object.fromEntries(CULTIVATION_KEYS_21.map(key => [key, int(skills[key])])),
    esoteric: [...(draft.cultivation ? [{name: draft.cultivation, value: sectStars21(draft), core: "spi"}] : []),
      ...draft.extraSects.filter(row => row.cultivation && row.sect !== draft.sect).map(row => ({name: row.cultivation, value: row.stars, core: "spi"}))],
    attachments: draft.attachments.filter(row => text(row.text)).map(row => ({text: text(row.text), strength: row.strength})),
    culture: draft.culture, alignment: draft.alignment, mag: Math.max(0, supply.left), sidhi: xp.sidhi, sidhiRealm: "desire", ardor: {max: flameMaximum21(xp.sidhi), burnt: 0, installed: 0},
    xp: Math.max(0, xp.left), foundation: Math.min(xp.spent, xp.start), notes};
}

export const STATUS_21 = Object.freeze({draft: "Draft", ready: "Ready for review", created: "Created"});

/** The chat card for a saved draft. The draft itself rides in the message flags; this is only its face. */
export function discoveryCard21(input, {ownerName = "", savedBy = "", gmNote = "", status = "", actorName = ""} = {}) {
  const draft = normalizeDraft21(input), info = CLASSES_21[draft.classKey], check = discoveryCheck21(draft);
  const state = status === "created" ? "created" : check.complete ? "ready" : "draft";
  const todo = SUTRA_KEYS_21.filter(key => check.issues[key].length).map(key => STEPS_21[key].replace(/^\d+ · /, ""));
  const row = (label, value) => text(value) ? `<li><strong>${label}:</strong> ${escapeHTML(text(value))}</li>` : "";
  return `<section class="r21-chat discovery21-card" data-status="${state}"><h3>Cultivator Discovery · ${escapeHTML(draft.name || "Unnamed Cultivator")}</h3>
<ul class="r21-mods">${row("Player", ownerName)}${row("Class", `${info.label}${draft.subtype ? ` — ${draft.subtype}` : ""}`)}${row("Sect", draft.sect)}${row("Culture", draft.culture)}${row("Alignment", draft.alignment)}</ul>
<p class="discovery21-status"><strong>${STATUS_21[state]}</strong>${state === "created" ? ` — ${escapeHTML(actorName || draft.name)} is in the Actors tab.` : state === "ready" ? " — all eight Sutras are performed." : ` — still to do: ${escapeHTML(todo.join(", "))}.`}</p>
${text(gmNote) ? `<p class="discovery21-note"><strong>GM:</strong> ${escapeHTML(text(gmNote)).replace(/\n+/g, "<br>")}</p>` : ""}
${savedBy ? `<p class="hint">Last saved by ${escapeHTML(savedBy)}.</p>` : ""}
<div class="discovery21-buttons">${state === "created" ? `<button type="button" data-discovery21="sheet">Open character</button>` : ""}<button type="button" data-discovery21="open">${state === "created" ? "View Discovery" : "Open Discovery"}</button></div></section>`;
}

/** Only the player who saved the draft, or a GM, may open it. */
export const canOpenDiscovery21 = (user, ownerId, authorId) => !!user && (!!user.isGM || user.id === ownerId || user.id === authorId);
export {CORES as DISCOVERY_CORES, CULTIVATIONS_21 as DISCOVERY_CULTIVATIONS};
