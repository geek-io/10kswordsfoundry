// Rules 2.1 Cultivator Discovery (2.1 rulebook pp.42-48, 62, 166): the eight Sutras as data and pure checks.
// Nothing here touches Foundry, so the creation tool, the chat card and the tests all read the same rules.
import {CORES, CORE_KEYS, CULTIVATIONS_21, CULTIVATION_KEYS_21, ASSETS_21, ATTACHMENT_STRENGTHS, carryLimit, encumbrance21, flameMaximum21} from "./rules21.mjs?v=0.2.45";
import {escapeHTML} from "./resolution.mjs?v=0.2.45";

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
export const STEPS_21 = Object.freeze({class: "1 · Class", cores: "2 · Cores", cultivations: "3 · Cultivations", assets: "4 · Assets", supply: "5 · Supply", identity: "6 · Identity", sect: "7 · Sect", sidhi: "8 · Sidhi", review: "Review"});
export const SUTRA_KEYS_21 = Object.freeze(Object.keys(STEPS_21).filter(key => key !== "review"));
// p.42 Sutra 7: the Sect's Cultivation starts at ✦✦, and the two Licenses must be ones the Cultivator qualifies for.
export const SECT_START_STARS_21 = 2, START_LICENSES_21 = 2, MIN_ATTACHMENTS_21 = 3;

const inRange = (value, [low, high]) => int(value) >= low && int(value) <= high;
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

/** A blank draft. Proletariat is the starting Class (p.42); everything else is the player's to fill in. */
export function emptyDraft21() {
  return {version: 1, name: "", classKey: DEFAULT_CLASS_21, subtype: "", cores: Object.fromEntries(CORE_KEYS.map(key => [key, 0])), skills: {},
    assets: [], maccaD6: 0, supply: [], culture: "", alignment: "", attachments: [{text: "", strength: 1}, {text: "", strength: 2}, {text: "", strength: 3}],
    sect: "", cultivation: "", barang: "", licenses: [], sectStory: "", sidhiColor: "", ajna: "", notes: "", log: []};
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
    log: list(data.log).slice(-60).map(entry => text(entry).slice(0, 200)).filter(Boolean)};
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
  const budget = CLASSES_21[draft.classKey].assets, spent = (draft.assets ?? []).reduce((sum, row) => sum + Math.max(0, int(row.stars)), 0);
  return {budget, spent, left: budget - spent};
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

  if (info.subtypes.length && !info.subtypes.some(entry => entry.label === draft.subtype)) issues.class.push(`Roll or choose the ${info.label} ${info.subtypeLabel.toLowerCase()} (d6).`);

  const cores = corePool21(draft);
  if (cores.remaining.size) issues.cores.push(`Still to assign: ${describeStars(cores.remaining)}.`);
  if (cores.extra.size) issues.cores.push(`${info.label} does not give: ${describeStars(cores.extra)}.`);

  for (const row of cultivationPool21(draft).rows) {
    if (!row.want) issues.cultivations.push(`${info.label} gives no Cultivations at ${stars21(row.rating)}; ${row.have} set.`);
    else if (row.have !== row.want) issues.cultivations.push(`${stars21(row.rating)}: ${row.have} of ${row.want} Cultivations chosen.`);
  }

  const assets = assetBudget21(draft), seen = new Set();
  if (assets.left < 0) issues.assets.push(`${assets.spent} Asset Stars bought; ${info.label} starts with ${assets.budget}.`);
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
  if (draft.licenses.length !== START_LICENSES_21) issues.sect.push(`Choose ${START_LICENSES_21} Licenses (${draft.licenses.length} chosen).`);
  for (const license of draft.licenses) {
    if (draft.sect && license.sect !== draft.sect) issues.sect.push(`${license.name} is not a ${draft.sect} License.`);
    else if (license.stars > SECT_START_STARS_21) issues.sect.push(`${license.name} needs ${license.cultivation || "the Sect Cultivation"} ${stars21(license.stars)}; you start at ${stars21(SECT_START_STARS_21)}.`);
  }
  if (draft.sect && !text(draft.sectStory)) notes.sect.push("How the Cultivator gained Sect Membership and Training is not written down yet.");

  if (!draft.sidhiColor) issues.sidhi.push("Choose the color of the Cultivator's Sidhi.");
  if (!text(draft.ajna)) issues.sidhi.push("Imagine her Ajna.");

  const count = Object.values(issues).reduce((sum, list) => sum + list.length, 0);
  return {issues, notes, count, complete: count === 0};
}

/** The Actor system data a finished draft becomes. Items (Class, Assets, Barang, Licenses, Supply) are added separately. */
export function actorSystem21(input) {
  const draft = normalizeDraft21(input), info = CLASSES_21[draft.classKey], supply = supplyBudget21(draft);
  const line = (label, value) => text(value) ? `<p><strong>${label}:</strong> ${escapeHTML(text(value)).replace(/\n+/g, "<br>")}</p>` : "";
  const notes = ["<h2>Cultivator Discovery</h2>", line("Class", `${info.label}${draft.subtype ? ` — ${draft.subtype}` : ""}`), line("Sect", draft.sect ? `${draft.sect} (${draft.cultivation} ${stars21(SECT_START_STARS_21)}), Barang: ${draft.barang}` : ""),
    line("Sect Membership", draft.sectStory), line("Sidhi color", draft.sidhiColor), line("Ajna", draft.ajna), line("Starting Macca", draft.maccaD6 ? `${info.maccaPerD6.toLocaleString("en-US")} × d6 (${draft.maccaD6}) = ${supply.total.toLocaleString("en-US")}; ${supply.spent.toLocaleString("en-US")} spent on Supply` : ""),
    line("Notes", draft.notes)].filter(Boolean).join("");
  return {cores: Object.fromEntries(CORE_KEYS.map(key => [key, Math.max(1, draft.cores[key])])), skills: Object.fromEntries(CULTIVATION_KEYS_21.map(key => [key, int(draft.skills[key])])),
    esoteric: draft.cultivation ? [{name: draft.cultivation, value: SECT_START_STARS_21, core: "spi"}] : [],
    attachments: draft.attachments.filter(row => text(row.text)).map(row => ({text: text(row.text), strength: row.strength})),
    culture: draft.culture, alignment: draft.alignment, mag: Math.max(0, supply.left), sidhi: 0, sidhiRealm: "desire", ardor: {max: flameMaximum21(0), burnt: 0, installed: 0}, notes};
}

export const STATUS_21 = Object.freeze({draft: "Draft", ready: "Ready for review", created: "Created"});

/** The chat card for a saved draft. The draft itself rides in the message flags; this is only its face. */
export function discoveryCard21(input, {ownerName = "", savedBy = "", gmNote = "", status = "", actorName = ""} = {}) {
  const draft = normalizeDraft21(input), info = CLASSES_21[draft.classKey], check = discoveryCheck21(draft);
  const state = status === "created" ? "created" : check.complete ? "ready" : "draft";
  const todo = SUTRA_KEYS_21.filter(key => check.issues[key].length).map(key => STEPS_21[key].replace(/^\d · /, ""));
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
