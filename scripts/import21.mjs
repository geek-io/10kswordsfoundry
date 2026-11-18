// Rules 2.1 text importer (2.1 rulebook, 357-page edition). Pure: no Foundry globals.
// Reads the book's own layouts: Sect Technicks / Magicks / Gear (pp.224-303), market cards for weapons, armor,
// accessories, talismans and goods (pp.186-207), Assets (pp.211-218), plus labelled "Name: ..." records.
// Everything read is kept in the Description; values the book does not print are left at their defaults.
import {CORES, CULTIVATIONS_21, PROFILES, WEAPON_MODS_21, AFFINITY_KEYS, GRADE_KEYS, ASSETS_21, PART_KEYS, sectCultivationNames21} from "./rules21.mjs?v=0.2.42";

export const IMPORT_TYPES_21 = Object.freeze({weapon: "Weapon", fashion: "Armor & Clothing", gear: "Gear / Consumable / Talisman", accessory: "Accessory", ammunition: "Ammo", salvage: "Salvage",
  technique: "Technick", magick: "Magick", trait: "Trait", asset: "Asset", barang: "Barang"});
/** Sect Cultivation -> Sect (2.1 rulebook pp.224-303). */
export const SECT_OF_CULTIVATION_21 = Object.freeze({"Demon Body": "Asuri", "Devil Beast": "Aswang", "Sky Dragon": "Dracontine", "Black Sorcery": "Eskatonian", "Internal Elixir": "Fangshi", "Solar Bow": "Houyi",
  "White Sorcery": "Imma", "Astral": "Jyotisha", "Divine Communion": "Katalonan", "Vajra Fist": "Mendicant", "Red Gun": "Nezha", "Sword Dialectics": "Sword Dialectician", "Techgnosis": "Techgnostic",
  "Immortal Science": "Ultramystic", "Sage Body": "Wukong", "Spirit Binding": "Zhongkui", "Sound Law": "Bidadari", "Dual Cultivation": "Sapphire Star", "Consummate Lie": "Luciferian", "Black Mace": "Metomian"});
const SYSTEM = "10kswordsfoundry";
const RARITIES = ["common", "uncommon", "enhanced", "rare", "deluxe", "prestige"];
const GRIP = {empty: "", shield: "", dagger: "hilt", saber: "hilt", sword: "hilt", whip: "hilt", cleaver: "haft", bludgeon: "haft", polearm: "haft", launcher: "haft", bow: "riser", crossbow: "stock", handgun: "stock", longgun: "stock"};
const AMMO_FAMILY = {bow: "bow", crossbow: "crossbow", launcher: "launcher", handgun: "gun", longgun: "gun"};
const PROFILE_WORDS = {"EMPTY HAND": "empty", DAGGER: "dagger", SABER: "saber", SWORD: "sword", WHIP: "whip", BLUDGEON: "bludgeon", CLEAVER: "cleaver", POLEARM: "polearm", SHIELD: "shield", LAUNCHER: "launcher",
  CROSSBOW: "crossbow", BOW: "bow", HANDGUN: "handgun", LONGGUN: "longgun"};
const MOD_WORDS = {...Object.fromEntries(Object.keys(WEAPON_MODS_21).map(key => [key.toUpperCase(), key])), ELECTRIC: "shock", SHOCK: "shock"};

const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const norm = value => String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");
const tidy = value => String(value ?? "").replace(/­/g, "").replace(/\r/g, "").replace(/[ \t]+/g, " ");
const para = (...parts) => parts.filter(Boolean).map(part => `<p>${part}</p>`).join("");
const upper = line => /[A-Z]/.test(line) && line === line.toUpperCase();
const count = (text, glyph) => (String(text ?? "").match(new RegExp(glyph, "gu")) ?? []).length;
const MAKERS = new Set(["AWW", "HDF", "TMNI", "VATAC", "MORTAR", "YEI", "MA", "TTC", "SSA", "TDF", "EXK", "LCP", "KC", "KA", "AT-CR", "ELIXIR"]);
/** Title Case that keeps the book's maker marks (HDF, AWW, MA, ...) in capitals. */
export function titleName21(name) {
  return tidy(name).trim().split(" ").map(word => MAKERS.has(word.replace(/[^A-Z-]/g, "")) ? word
    : word.toLowerCase().replace(/(^|[-“"'‘(])([a-zà-ÿ])/g, (m, lead, letter) => lead + letter.toUpperCase()).replace(/([’'])S\b/i, "$1s")).join(" ")
    .replace(/\b(Of|And|The|To|In|A)\b/g, (word, _w, offset) => offset ? word.toLowerCase() : word);
}
/** Lines that were wrapped by the page become one paragraph; a line ending a sentence closes it. */
function paragraphs(lines) {
  const out = [];
  let current = "";
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { if (current) out.push(current); current = ""; continue; }
    current = current ? (current.endsWith("-") && /^[a-z]/.test(line) ? current.slice(0, -1) + line : `${current} ${line}`) : line;
  }
  if (current) out.push(current);
  return out;
}

/** A named rating in the book's spelling -> {kind, key|name}. Cores, basic Cultivations, then Sect (Esoteric) Cultivations. */
export function rating21(name) {
  const key = norm(name);
  if (!key) return null;
  const aliases = {phys: "phy", mind: "mnd", wits: "wit", face: "voc", fac: "voc", heart: "spi", hrt: "spi", thews: "thewsSinews", handeye: "handEye", handeyecoordination: "handEye", succor: "succorTriage", spitinthefaceofgod: "spitInTheFace"};
  for (const [core, info] of Object.entries(CORES)) if ([core, info.label, info.abbr, ...info.aliases].some(entry => norm(entry) === key) || aliases[key] === core) return {kind: "core", key: core, label: info.label};
  for (const [skill, info] of Object.entries(CULTIVATIONS_21)) if (norm(info.label) === key || aliases[key] === skill) return {kind: "skill", key: skill, label: info.label};
  const names = sectCultivationNames21(name);
  if (SECT_OF_CULTIVATION_21[names[0]]) return {kind: "esoteric", name: names[0], label: names[0]};
  return null;
}

// ---------- block boundaries ----------
const CARD = /^(?:([1-6])\s+)?(\d+(?:\.\d+)?)\s*KG\s+(.+?)$/i;
const TYPE_LABEL = /\s*\b(Technick|Magick|Gear|License)\s*$/i;
const ASSET_CODE = /^([1-6])\s?([1-6])$/, STAR_RANGE = /^(✦+)\s*[-–—]\s*(✦+)$/;
function cardHeader(line) {
  const match = tidy(line).trim().match(CARD);
  if (!match) return null;
  const words = match[3].trim().split(" "), at = words.findIndex(word => RARITIES.includes(word.toLowerCase()));
  if (at < 0 || at > 3) return null;
  let rest = words.slice(at + 1).join(" "), price = null, priceText = "";
  const money = rest.match(/\s*(N\/A|[\d,]+)\s*♄?\s*$/i);
  if (money && (/♄\s*$/.test(rest) || /N\/A$/i.test(rest))) { priceText = money[1]; price = /N\/A/i.test(money[1]) ? null : Number(money[1].replaceAll(",", "")); rest = rest.slice(0, money.index).trim(); }
  if (!rest) return null;
  return {d6: match[1] ? Number(match[1]) : null, weight: Number(match[2]), maker: words.slice(0, at).join(" "), rarity: words[at].toLowerCase(), kind: rest.toUpperCase(), price, priceText};
}
/** Splits pasted or PDF text into records. Returns [{kind, lines, heading}], where heading is the last section title seen (BOW, HEAD, ...). */
export function splitText21(text) {
  const lines = tidy(text).split("\n").map(line => line.trim());
  const starts = [];
  let heading = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^---+$/.test(line)) { lines[i] = ""; starts.push({at: i + 1, kind: "auto", heading}); continue; }
    if (/^name\s*:/i.test(line)) { starts.push({at: i, kind: "labelled", heading}); continue; }
    if (cardHeader(line)) {
      // A Sect Gear entry owns the card that follows it.
      const last = starts.at(-1);
      if (last?.kind === "ability" && /gear$/i.test(last.label) && !last.card) { last.card = true; continue; }
      starts.push({at: i, kind: "card", heading});
      continue;
    }
    if (ASSET_CODE.test(line) && (STAR_RANGE.test(lines[i + 1] ?? "") || STAR_RANGE.test(lines[i - 1] ?? ""))) {
      const at = STAR_RANGE.test(lines[i - 1] ?? "") ? i - 1 : i;
      if (starts.at(-1)?.at !== at) starts.push({at, kind: "asset", heading});
      continue;
    }
    const title = line.replace(TYPE_LABEL, "").trim();
    if (TYPE_LABEL.test(line) && !line.includes(":") && (!title || upper(title)) && !/[.✹❂✦\[\]]/.test(title)) {
      let at = i;
      while (at > 0) { const prior = lines[at - 1]; if (!prior || !upper(prior) || /[.:✹❂✦\[\]♄]/.test(prior) || /^(?:LICENSE|NEEDS|\d+)\b/.test(prior) || cardHeader(prior)) break; at--; }
      if (!title && at === i) continue;
      starts.push({at, kind: "ability", heading, label: line.match(TYPE_LABEL)[1]});
      continue;
    }
    if (line && upper(line) && line.length <= 24 && !/[\d✦:.♄]/.test(line) && (Object.keys(PROFILE_WORDS).some(word => line.replace(/S$/, "") === word || line === word) || /^(HEAD|TORSO|ARMS|LEGS|ACCESSORIES|TALISMANS|TOOLS|SALVAGE|CONSUMABLES)$/.test(line))) heading = line;
  }
  if (!starts.length || starts[0].at > 0) {
    const lead = lines.slice(0, starts[0]?.at ?? lines.length);
    // Free text with no recognisable layout is offered as one entry only when it is short; a whole page of prose is not an item.
    if (lead.some(Boolean) && !starts.length && lead.filter(Boolean).length <= 25) starts.unshift({at: 0, kind: "auto", heading: ""});
  }
  starts.sort((a, b) => a.at - b.at);
  return starts.map((start, index) => ({kind: start.kind, heading: start.heading, label: start.label ?? "", lines: lines.slice(start.at, starts[index + 1]?.at ?? lines.length)}))
    .map(block => ({...block, lines: block.lines.filter((line, index, all) => line || (index > 0 && index < all.length - 1))}))
    .filter(block => block.lines.some(line => line && !/^\d+$/.test(line)));
}

// ---------- Sect Technicks, Magicks and Gear ----------
function needs21(text) {
  const [costs, ...rest] = String(text ?? "").split(";");
  const requirement = rest.join(";").trim() || (/[a-z]{3,}/i.test(costs.replace(/[✹❂\s\[\]X.…/+or-]+/gi, "")) ? costs.replace(/^[✹❂\s—–-]+/u, "").trim() : "");
  return {text: String(text ?? "").trim(), burn: count(costs, "✹"), install: count(costs, "❂"), requirement};
}
function abilityItem(block, chosenType) {
  const lines = block.lines.filter(line => !/^\d{1,3}$/.test(line)), warnings = [];
  const end = lines.findIndex(line => TYPE_LABEL.test(line));
  const label = lines[end].match(TYPE_LABEL)[1].toLowerCase();
  const name = [...lines.slice(0, end), lines[end].replace(TYPE_LABEL, "")].join(" ").replace(/\s+/g, " ").trim();
  const body = lines.slice(end + 1);
  const licenseAt = body.findIndex(line => /^license\b/i.test(line));
  const license = licenseAt >= 0 ? body[licenseAt].match(/^license\s+(.+?)\s*(✦+)?\s*$/i) : null;
  const cultivationRaw = license?.[1] ?? "", stars = license?.[2]?.length ?? 0;
  const known = rating21(cultivationRaw), cultivation = known?.kind === "esoteric" ? known.name : titleName21(cultivationRaw);
  const sect = SECT_OF_CULTIVATION_21[cultivation] ?? "";
  if (!license) warnings.push("No LICENSE line found; add the Esoteric Cultivation and Stars by hand.");
  else if (!sect) warnings.push(`${cultivation}: not a Sect Cultivation the system knows; the Sect was left blank.`);
  const flavor = paragraphs(body.slice(0, Math.max(0, licenseAt))).join(" ");
  let rest = body.slice(licenseAt + 1);
  const needsLine = rest[0] && /^needs\b/i.test(rest[0]) ? rest.shift() : "";
  const needs = needs21(needsLine.replace(/^needs\s*/i, ""));
  const flags = {sect21: {cultivation, stars, needs: needs.text, weaponRequirement: needs.requirement, license: cultivation}};
  const head = [flavor ? `<em>${esc(flavor)}</em>` : "", license ? `<strong>License:</strong> ${esc(cultivation)} ${"✦".repeat(stars)}` : "", needsLine ? `<strong>Needs:</strong> ${esc(needs.text || "—")}` : ""];
  if (label === "gear") {
    const cardAt = rest.findIndex(line => cardHeader(line));
    if (cardAt >= 0) {
      const grant = paragraphs(rest.slice(0, cardAt)).join(" ");
      const record = cardItem({lines: rest.slice(cardAt), heading: ""}, chosenType, {lead: [head[0], `${head[1]}${grant ? ` — ${esc(grant)}` : ""}`], sect});
      record.item.flags = {[SYSTEM]: {...record.item.flags?.[SYSTEM], ...flags}};
      record.item.system.tags = [record.item.system.tags, sect, cultivation].filter(Boolean).join(", ");
      return record;
    }
    warnings.push("No item card (weight, rarity and kind) followed this Gear entry; it was read as plain Gear.");
    return {item: {name: titleName21(name), type: "gear", system: {description: para(...head, ...paragraphs(rest).map(esc)), tags: ["2.1", "Sect Gear", sect, cultivation].filter(Boolean).join(", ")}, flags: {[SYSTEM]: flags}}, warnings};
  }
  const type = label === "magick" ? "magick" : "technique";
  const system = {sect, apCost: 0, burnArdor: needs.burn, installArdor: needs.install, tags: [sect, cultivation, "✦".repeat(stars), type === "magick" ? "Magick" : "Technick"].filter(Boolean).join(", ")};
  if (type === "magick") {
    const text = rest.join("\n");
    const field = (key, stop) => text.match(new RegExp(`\\b${key}S?\\s*:?\\s+([\\s\\S]+?)(?=\\s*(?:\\||\\n)?\\s*\\b(?:${stop})\\b\\s*:?|$)`, "i"))?.[1]?.replace(/\s+/g, " ").replace(/\s*\|\s*$/, "").trim() ?? "";
    system.mantra = field("MANTRA", "MUDRA|CHECK|CHARGE TIME|EFFECT");
    system.mudra = field("MUDRA", "CHECK|CHARGE TIME|EFFECT|MANTRA");
    const check = field("CHECK", "CHARGE TIME|EFFECT"), charge = Number(text.match(/CHARGE TIME\s*:?\s*(\d+)/i)?.[1] ?? 0);
    const [coreName, skillName] = check.split("+").map(part => part.trim());
    const core = rating21(coreName), skill = rating21(skillName);
    system.r21 = {potency: Math.max(1, charge), castTime: charge ? String(charge) : "", core: core?.kind === "core" ? core.key : "spi", skill: skill ? skill.label : titleName21(skillName ?? cultivation), bonus: 0};
    if (!check) warnings.push("No CHECK line found; the casting Core and Cultivation are defaults.");
    if (!charge) warnings.push("No CHARGE TIME found.");
  }
  if (/\[X\]|\.\.\.|…/.test(needs.text)) warnings.push("Variable cost: set the Flame for each use by hand.");
  system.description = para(...head, ...paragraphs(rest).map(esc));
  return {item: {name: titleName21(name), type, system, flags: {[SYSTEM]: flags}}, warnings};
}

// ---------- market cards ----------
function modsFrom(text, system, warnings) {
  const r21 = system.r21, tags = [];
  for (const raw of text.split(/[✦,]/).map(part => part.trim()).filter(Boolean)) {
    const [, word, number] = raw.toUpperCase().match(/^([A-Z]+(?: [A-Z]+)?)\s*(\d+)?$/) ?? [];
    if (!word) continue;
    if (word === "FEROCIOUS") { r21.ferocious = Number(number ?? 1); tags.push(`FEROCIOUS${number ? ` ${number}` : ""}`); }
    else if (word === "REACH") { r21.reach = Number(number ?? 1); tags.push(`REACH ${r21.reach}`); }
    else if (AFFINITY_KEYS.includes(word.toLowerCase())) { r21.affinity = word.toLowerCase(); tags.push(word); }
    else if (MOD_WORDS[word]) { r21.mods[MOD_WORDS[word]] = true; tags.push(word); }
    else if (word === "SHIELD") { r21.shield = Number(number ?? 1); tags.push(`SHIELD${number ? ` ${number}` : ""}`); }
    else if (PROFILE_WORDS[word]) tags.push(word);
    else { warnings.push(`${word}: not a weapon Mod the system applies; it stays in the Description.`); tags.push(word); }
  }
  return tags;
}
const knownMod = word => !!(MOD_WORDS[word] || AFFINITY_KEYS.includes(word.toLowerCase()) || ["FEROCIOUS", "REACH", "SHIELD"].includes(word) || PROFILE_WORDS[word]);
/** A Mods line: short uppercase words between ✦, most of which are Mods the book lists. */
function isModLine(line) {
  if (!upper(line) || /[.\[\]:]/.test(line)) return false;
  const words = line.split(/[✦,]/).map(part => part.trim().replace(/\s*\d+$/, "")).filter(Boolean);
  const known = words.filter(knownMod).length;
  return words.length > 0 && words.every(word => /^[A-Z]+(?: [A-Z]+)?$/.test(word)) && known >= 1 && known * 2 >= words.length;
}
function coverage(kind, soak) {
  const parts = Object.fromEntries(PART_KEYS.map(key => [key, 0])), notes = [];
  const text = kind.toUpperCase();
  if (/HEAD|HELM/.test(text)) parts.head = soak;
  if (/TORSO|BODY/.test(text)) parts.torso = soak;
  if (/LIMBS|ARMS\b/.test(text)) parts.rarm = parts.larm = soak;
  else if (/\bARM\b/.test(text)) { parts.rarm = soak; notes.push("Covers one Arm: the right arm was chosen; move the Soak to the left arm on the item sheet if needed."); }
  if (/LIMBS|LEGS\b/.test(text)) parts.rleg = parts.lleg = soak;
  else if (/\bLEG\b/.test(text)) { parts.rleg = parts.lleg = soak; }
  if (/\bALL\b|FULL BODY/.test(text)) for (const key of PART_KEYS) parts[key] = soak;
  return {parts, notes};
}
function cardItem(block, chosenType, {lead = [], sect = ""} = {}) {
  const lines = block.lines.filter(line => !/^\d{1,3}$/.test(line)), header = cardHeader(lines[0]), warnings = [];
  let rest = lines.slice(1);
  const name = rest.shift() ?? "";
  const trailing = rest.findLastIndex(line => /^(?:N\/A|[\d,]+)\s*♄$/.test(line));
  if (header.price === null && !header.priceText && trailing >= 0) { const text = rest.splice(trailing, 1)[0].replace(/\s*♄$/, ""); header.priceText = text; header.price = /N\/A/i.test(text) ? null : Number(text.replaceAll(",", "")); }
  const kind = header.kind, words = kind.replace(/\bBASE\b|\bPIECE\b/g, " ").replace(/\s+/g, " ").trim();
  const grade = GRADE_KEYS.find(key => new RegExp(`\\b${key}\\b`, "i").test(kind)) ?? "";
  let profile = Object.entries(PROFILE_WORDS).find(([word]) => new RegExp(`\\b${word}\\b`).test(kind))?.[1] ?? "";
  const tagged = {};
  rest = rest.filter(line => { const m = line.match(/^((?:grip|profile|material|mods|soak)_)\s*(.*)$/i); if (!m) return true;
    for (const [, key, value] of line.matchAll(/(grip|profile|material|mods|soak)_\s*(.*?)(?=\s+(?:grip|profile|material|mods|soak)_|$)/gi)) tagged[key.toLowerCase()] = value.trim(); return false; });
  if (tagged.profile && PROFILE_WORDS[tagged.profile.toUpperCase()]) profile = PROFILE_WORDS[tagged.profile.toUpperCase()];
  const headingProfile = PROFILE_WORDS[block.heading?.replace(/S$/, "")] ?? PROFILE_WORDS[block.heading ?? ""];
  // The book's card line and its section heading sometimes disagree (a bow printed as "BASE BLUDGEON"). The card line is kept; the reader is told.
  if (profile && headingProfile && headingProfile !== profile && !tagged.profile) warnings.push(`The card says ${PROFILES[profile].label}, but the nearest section heading was ${PROFILES[headingProfile].label}. Check the Profile; on two-column pages the heading may belong to the other column.`);
  const armor = !profile && (/\b(HEAD|TORSO|ARMS?|LEGS?|LIMBS|BODY)\b/.test(kind) || tagged.soak !== undefined);
  const type = profile ? "weapon" : armor ? "fashion" : /ACCESSORY/.test(kind) ? "accessory" : /AMMO|ARROW|BOLT|BULLET|MAGAZINE/.test(kind) ? "ammunition" : /SALVAGE/.test(kind) ? "salvage" : "gear";
  const system = {rarity: header.rarity, quantity: 1, magCost: header.price ?? 0, source: "Rules 2.1 import"};
  const summary = `<strong>${esc([header.maker && titleName21(header.maker), titleName21(header.rarity), titleName21(kind)].filter(Boolean).join(" "))} · ${header.weight} kg · ${header.price === null ? `Price ${esc(header.priceText || "not printed")}` : `${header.price.toLocaleString("en-US")} ♄`}</strong>${header.d6 ? ` · d6: ${header.d6}` : ""}`;
  if (header.price === null) warnings.push("No price printed; the cost is 0, not a claim that the item is free.");
  const extra = [];
  if (type === "weapon") {
    system.weaponType = PROFILES[profile].ranged ? "ranged" : "melee"; system.range = PROFILES[profile].range; system.damageType = ["bludgeon", "empty", "shield"].includes(profile) ? "impact" : "cut";
    system.ammoFamily = AMMO_FAMILY[profile] ?? "none"; system.gearSlot = "carry";
    system.r21 = {profile, grip: GRIP[profile], damage: 2, damageBonus: 0, range: 0, rate: 1, capacity: 0, ferocious: 0, shield: 0, reach: 0, affinity: "", grade, morph: "", mods: {}, weight: header.weight};
    if (tagged.grip && !["hilt", "haft", "riser", "stock"].includes(tagged.grip.toLowerCase())) warnings.push(`Grip "${tagged.grip}" is not one the system lists; the ${PROFILES[profile].label} default was used.`);
    else if (tagged.grip) system.r21.grip = tagged.grip.toLowerCase();
    const modLine = tagged.mods ?? (rest[0] && isModLine(rest[0]) ? rest.shift() : "");
    const tags = modLine ? modsFrom(modLine, system, warnings) : [];
    if (tags.length) extra.push(`<strong>Mods:</strong> ${esc(tags.join(" ✦ "))}`);
    if (tagged.material) extra.push(`<strong>Material:</strong> ${esc(titleName21(tagged.material))}`);
    const capacity = rest.join(" ").match(/\b(?:holds|magazine of|capacity of)\s+(\d+)/i); if (capacity) system.r21.capacity = Number(capacity[1]);
    system.tags = ["2.1", "Weapon", PROFILES[profile].label, ...tags].join(", ");
    extra.unshift(`<strong>${esc([system.r21.grip && titleName21(system.r21.grip), PROFILES[profile].label, grade && titleName21(grade)].filter(Boolean).join(" · "))}</strong>`);
  } else {
    const glyphs = tagged.soak === undefined ? null : count(tagged.soak, "⛨") || Number(tagged.soak.match(/\d+/)?.[0] ?? 0);
    const cover = type === "fashion" ? coverage(/\b(HEAD|HELM|TORSO|ARMS?|LEGS?|LIMBS|BODY|ALL)\b/.test(words) ? words : `${words} ${(block.heading ?? "").replace(/S$/, "")}`, glyphs ?? 0) : {parts: Object.fromEntries(PART_KEYS.map(key => [key, 0])), notes: []};
    warnings.push(...(glyphs ? cover.notes : []));
    system.gearSlot = type === "fashion" ? "fashion" : "carry";
    system.r21 = {coverage: cover.parts, morale: 0, weight: header.weight};
    const text = rest.join(" ");
    const morale = text.match(/([+-]\d+)\s+(?:max\s+)?Morale\b/i); if (morale && type !== "gear") system.r21.morale = Number(morale[1]);
    if (type === "fashion") {
      extra.push(`<strong>Soak:</strong> ${glyphs ? `${glyphs} on ${PART_KEYS.filter(key => cover.parts[key]).map(key => ({rleg: "Right Leg", lleg: "Left Leg", rarm: "Right Arm", larm: "Left Arm", torso: "Torso", head: "Head"})[key]).join(", ") || "no Part (set the coverage by hand)"}` : "—"}`);
      if (glyphs && !PART_KEYS.some(key => cover.parts[key])) warnings.push("Soak is printed but the Parts covered could not be read; set the coverage on the item sheet.");
      if (tagged.soak === undefined) warnings.push("No soak_ line found; Soak is 0.");
    }
    if (type === "gear" && /TALISMAN|ESOTERY|CONSUMABLE|PILL|POTION|ELIXIR/.test(kind)) {
      const heal = text.match(/Heal (\d+) HP/i), flame = text.match(/Recover (\d+) burnt Flame/i), mor = text.match(/Heal (\d+) Morale/i);
      if (heal || flame || mor) system.consumable = {enabled: true, apCost: 0, health: Number(heal?.[1] ?? 0), burntArdor: Number(flame?.[1] ?? 0), morale: Number(mor?.[1] ?? 0), allHealth: false, allBurntArdor: false};
    }
    system.tags = ["2.1", type === "fashion" ? "Armor" : titleName21(words)].join(", ");
  }
  if (sect) system.tags = `${system.tags}, ${sect}`;
  system.description = para(...lead, summary, ...extra, ...paragraphs(rest).map(esc));
  warnings.push("Rules text and flavor are kept together in the Description; effects beyond Soak, Mods and Morale are not automated.");
  if (chosenType && type !== chosenType && ["weapon", "fashion", "gear", "accessory", "ammunition", "salvage"].includes(chosenType) && !profile && !armor && type === "gear") return {item: {name: titleName21(name), type: chosenType, system: chosenType === "fashion" ? system : {...system, gearSlot: "carry"}}, warnings};
  return {item: {name: titleName21(name), type, system}, warnings};
}

// ---------- Assets ----------
function assetItem(block) {
  const lines = block.lines.filter(Boolean), warnings = [];
  const code = lines.find(line => ASSET_CODE.test(line)), range = lines.find(line => STAR_RANGE.test(line))?.match(STAR_RANGE);
  const body = lines.filter(line => line !== code && !STAR_RANGE.test(line) && !/^\d{3}$/.test(line));
  const name = body.shift() ?? "", digits = code.replace(/\s/g, "");
  const key = Object.entries(ASSETS_21).find(([, info]) => norm(info.label) === norm(name))?.[0] ?? "custom";
  if (key === "custom") warnings.push("Not one of the 36 printed Assets by name; imported as a custom Asset with no automated effect.");
  const min = range?.[1].length ?? 1, max = range?.[2].length ?? 5;
  return {item: {name: titleName21(name), type: "asset", system: {key, stars: min, detail: "", tags: `2.1, Asset, [${digits[0]}][${digits[1]}]`, source: "Rules 2.1 import",
    description: para(`<strong>[${digits[0]}][${digits[1]}] ${esc(titleName21(name))}</strong> · ${"✦".repeat(min)}–${"✦".repeat(max)}`, ...paragraphs(body).map(esc))},
    flags: {[SYSTEM]: {asset21: {code: digits, minStars: min, maxStars: max}}}}, warnings};
}

// ---------- labelled records ----------
const LABELS = {type: "type", rarity: "rarity", weight: "weight", price: "price", cost: "price", soak: "soak", covers: "covers", coverage: "covers", profile: "profile", grip: "grip", grade: "grade", "material grade": "grade", affinity: "affinity",
  mods: "mods", modifiers: "mods", ferocious: "ferocious", reach: "reach", range: "range", capacity: "capacity", magazine: "capacity", license: "license", needs: "needs", mantra: "mantra", mudra: "mudra", check: "check",
  "charge time": "charge", sect: "sect", stars: "stars", morale: "morale", quantity: "quantity", cultivation: "cultivation", source: "source", description: "description", effect: "effect"};
function labelledItem(block, chosenType) {
  const lines = block.lines.filter(Boolean), fields = {}, free = [], warnings = ["Read from labelled lines; anything without a label is in the Description."];
  for (const line of lines) {
    const match = line.match(/^([A-Za-z ]{2,16}):\s*(.*)$/), key = match && (match[1].toLowerCase() === "name" ? "name" : LABELS[match[1].toLowerCase()]);
    if (key && !(key in fields)) fields[key] = match[2].trim(); else free.push(line);
  }
  const typeWords = {weapon: "weapon", armor: "fashion", armour: "fashion", clothing: "fashion", fashion: "fashion", gear: "gear", consumable: "gear", talisman: "gear", accessory: "accessory", ammo: "ammunition", ammunition: "ammunition", salvage: "salvage",
    technick: "technique", technique: "technique", magick: "magick", trait: "trait", asset: "asset", barang: "barang"};
  const type = typeWords[norm(fields.type)] ?? chosenType ?? "gear";
  const name = fields.name ?? free.shift() ?? "";
  const price = fields.price ? Number(fields.price.replace(/[^\d.]/g, "")) || 0 : 0, weight = fields.weight ? Number(fields.weight.replace(/[^\d.]/g, "")) || 0 : 0;
  const text = [fields.description, fields.effect && `EFFECT: ${fields.effect}`, ...free].filter(Boolean);
  if (["technique", "magick"].includes(type)) {
    const label = type === "magick" ? "Magick" : "Technick";
    const fake = [`${name.toUpperCase()} ${label}`, fields.license ? `LICENSE ${fields.license}` : "", fields.license ? `NEEDS ${fields.needs ?? "—"}` : "", fields.mantra ? `MANTRA: ${fields.mantra}` : "", fields.mudra ? `MUDRA: ${fields.mudra}` : "",
      fields.check ? `CHECK: ${fields.check}` : "", fields.charge ? `CHARGE TIME: ${fields.charge}` : "", ...text].filter(Boolean);
    const record = abilityItem({lines: fake}, chosenType);
    if (fields.sect) record.item.system.sect = titleName21(fields.sect);
    record.item.name = titleName21(name);
    return record;
  }
  if (type === "asset") {
    const key = Object.entries(ASSETS_21).find(([, info]) => norm(info.label) === norm(name))?.[0] ?? "custom";
    return {item: {name: titleName21(name), type, system: {key, stars: Math.min(5, Math.max(1, count(fields.stars, "✦") || Number(fields.stars) || 1)), detail: "", description: para(...text.map(esc)), tags: "2.1, Asset", source: fields.source ?? "Rules 2.1 import"}}, warnings};
  }
  if (type === "barang") return {item: {name: titleName21(name), type, system: {sect: titleName21(fields.sect ?? ""), cultivation: titleName21(fields.cultivation ?? ""), description: para(...text.map(esc)), tags: "2.1, Barang", source: fields.source ?? "Rules 2.1 import"}}, warnings};
  if (type === "trait") return {item: {name: titleName21(name), type, system: {description: para(...text.map(esc)), tags: "2.1, Trait", source: fields.source ?? "Rules 2.1 import"}}, warnings};
  const rarity = RARITIES.includes(norm(fields.rarity)) ? norm(fields.rarity) : "common";
  const kind = type === "weapon" ? `BASE ${(fields.profile ?? "sword").toUpperCase()}${fields.grade ? ` ${fields.grade.toUpperCase()}` : ""}` : type === "fashion" ? `${(fields.covers ?? "TORSO").toUpperCase()} PIECE` : type.toUpperCase();
  const card = [`${weight} KG ${rarity.toUpperCase()} ${kind} ${fields.price ? `${price}♄` : ""}`.trim(), name.toUpperCase(), fields.grip ? `grip_ ${fields.grip}` : "", fields.soak !== undefined ? `soak_ ${fields.soak}` : "",
    [fields.mods, fields.affinity, fields.ferocious && `FEROCIOUS ${fields.ferocious}`, fields.reach && `REACH ${fields.reach}`].filter(Boolean).length ? `mods_ ${[fields.mods, fields.affinity, fields.ferocious && `FEROCIOUS ${fields.ferocious}`, fields.reach && `REACH ${fields.reach}`].filter(Boolean).join(" ✦ ")}` : "", ...text].filter(Boolean);
  const record = cardItem({lines: card, heading: ""}, chosenType);
  record.item.name = titleName21(name); record.item.type = type === "fashion" || type === "weapon" ? record.item.type : type;
  if (fields.quantity) record.item.system.quantity = Math.max(1, Number(fields.quantity) || 1);
  if (fields.morale && record.item.system.r21) record.item.system.r21.morale = Number(fields.morale) || 0;
  if (fields.range && record.item.system.r21 && type === "weapon") record.item.system.r21.range = Number(fields.range.replace(/[^\d]/g, "")) || 0;
  if (fields.capacity && type === "weapon") record.item.system.r21.capacity = Number(fields.capacity) || 0;
  if (fields.source) record.item.system.source = fields.source;
  record.warnings = record.warnings.filter(w => !/No soak_ line/.test(w) || type === "fashion").concat(warnings);
  return record;
}

/** Rules 2.1 text -> [{item, warnings}]. `chosenType` is the importer's default item type and only decides unlabelled leftovers. */
export function textItems21(text, chosenType = "gear") {
  const records = [];
  for (const block of splitText21(text)) {
    const lines = block.lines.filter(Boolean);
    try {
      if (block.kind === "ability") records.push(abilityItem(block, chosenType));
      else if (block.kind === "card") records.push(cardItem(block, chosenType));
      else if (block.kind === "asset") records.push(assetItem(block));
      else if (block.kind === "labelled") records.push(labelledItem(block, chosenType));
      else if (chosenType === "asset" && lines.length > 1 && upper(lines[0])) records.push(assetItem({lines: ["1 1", "✦ - ✦✦✦✦✦", ...lines]}));
      else {
        // Leading page furniture (section titles, prose) is not an item: an entry needs an uppercase name and some text under it.
        const named = lines.findIndex(line => upper(line) && line.length <= 60 && !/^\d+$/.test(line));
        if (named < 0 || lines.length - named < 2) continue;
        records.push({item: {name: titleName21(lines[named]), type: chosenType, system: {description: para(...paragraphs(lines.slice(named + 1)).map(esc)), source: "Rules 2.1 import"}},
          warnings: ["No 2.1 layout recognised (no Technick / Magick / Gear label, item card, Asset code or Name: line). The first uppercase line became the name; the rest is the Description."]});
      }
    } catch (error) { throw new Error(`Could not read the entry starting "${(lines[0] ?? "").slice(0, 40)}": ${error.message}`); }
  }
  return records.filter(record => record.item.name);
}
