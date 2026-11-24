// Rules 2.1 World Being stat blocks (2.1 rulebook Bestiary, pp.345-373 of the final book). Pure: no Foundry globals.
//   NAME ✦ genus            SIDHI X   (or X/Y/Z: one World Being per printed Sidhi version)
//   lore, then Move · Dash · Step, Speed · Flame · Morale, Parts HP
//   ARMOR(S), WEAPONS, CORES, CULTIVATIONS, LICENSES, ASSETS, TRAITS, DROPS
// Short blocks (final book pp.372-373) have no "✦ genus": NAME, lore, "Move Nm · Speed N", "Sidhi N · Flame N · Morale N",
//   "Parts HP N · Block Nd Dodge Nd", "WEAPONS Name (pool, range, damage)", then the same sections. They are rewritten into the long form first.
// Printed numbers are authoritative: Part HP, Soak, Move, Morale and Flame are stored so the sheet shows them.
import {CORES, PARTS, PART_KEYS, PROFILES, ASSETS_21, BASE_PART_HP, ticksSpeed21, flameMaximum21} from "./rules21.mjs?v=0.2.50";
import {rating21, titleName21} from "./import21.mjs?v=0.2.50";

const HEADER = /^([A-Z][A-Z0-9 '’,.\-]*?)\s*✦\s*([a-z][a-z \-?]*?)(?:\s+SIDHI\s+(\d+(?:\/\d+)*))?$/;
const SECTION = /^(ARMORS?|WEAPONS|CORES(?: & CULTIVATIONS)?|CULTIVATIONS|LICENSES|ASSETS|TRAITS|DROPS)(?:\s*\[[^\]]*\])?$/;
const ENTRY = /^([A-Z0-9][A-Z0-9 '’"“”,.\-\/&]*?)\s*(✦+)?\s*(?:\[(\d+)\+\])?\s*(?:·\s*([✹❂]+))?\s*—\s*(.*)$/;
const esc = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const norm = value => String(value ?? "").normalize("NFKD").toLowerCase().replace(/[’'ʼ]s\b/g, "").replace(/[^a-z0-9]/g, "");
const int = value => Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
const glyphs = (text, glyph) => (String(text ?? "").match(new RegExp(glyph, "gu")) ?? []).length;
const CORE_WORDS = {PHYS: "phy", MOT: "mot", WIT: "wit", MND: "mnd", HRT: "spi", FAC: "voc"};
const WEAPON_WORDS = [[/\b(SABER|KATANA)\b/, "saber"], [/\b(DAGGER|KNIFE|KERIS)\b/, "dagger"], [/\b(SWORD|BLADE)\b/, "sword"], [/\b(WHIP|LASH)\b/, "whip"], [/\bSHIELD\b/, "shield"],
  [/\b(CANE|MACE|CLUB|HAMMER|CUDGEL|MAUL|BATON)\b/, "bludgeon"], [/\b(AXE|CLEAVER)\b/, "cleaver"], [/\b(SPEAR|LANCE|HALBERD|POLEARM|STAFF|GLAIVE|TRIDENT|PITCHFORK)\b/, "polearm"],
  [/\b(CROSSBOW|ARBALEST)\b/, "crossbow"], [/\b(BOW|LONGBOW)\b/, "bow"], [/\b(SLING|BLOWGUN|LAUNCHER)\b/, "launcher"],
  [/\b(DERRINGER|PISTOL|HANDGUN|REVOLVER|NEEDLER)\b/, "handgun"], [/\b(LONGGUN|RIFLE|CANNON|SHOTGUN|MUSKET)\b/, "longgun"]];
const DAMAGE_20 = {cut: "cut", crush: "impact"};
const embedded = data => { const copy = structuredClone(data); for (const key of ["_id", "id", "folder", "ownership", "sort", "_stats"]) delete copy[key]; for (const effect of copy.effects ?? []) delete effect._id; return copy; };

const SHORT_NAME = /^[A-Z][A-Z0-9 '’,.\-]{2,40}$/;
const shortStart = (lines, i) => SHORT_NAME.test(lines[i]) && !SECTION.test(lines[i]) && !/^\d/.test(lines[i])
  && lines.slice(i + 1, i + 8).some((next, n, all) => /^Sidhi\s+\d+\s*·/.test(next) && !all.slice(0, n).some(line => SECTION.test(line) || HEADER.test(line)));
/** Rewrites short stat blocks (no "✦ genus") into the long Bestiary form, leaving every other line as it is. */
function longForm(lines) {
  const out = [];
  let mode = null, weapon = "";
  const flush = () => {
    for (const [, rawName, inside] of weapon.matchAll(/([^()]+?)\s*\(([^)]*)\)/g)) {
      const name = rawName.replace(/^[\s,;·]+/, "").trim(), pool = inside.match(/\b(\d+)d\b/)?.[1] ?? "", range = inside.match(/\b(\d+)\s*m\b/)?.[1];
      const dmg = inside.match(/\b(\d+)\s+(cut|crush|pierce|blast|true|noetic)\b/i), hint = WEAPON_WORDS.find(([pattern]) => pattern.test(inside.toUpperCase()))?.[1];
      out.push([`${name} (${pool ? `${pool}d` : ""})`, range && `${range}m`, dmg && `${dmg[1]} ${dmg[2].toLowerCase()}`, hint && `profile ${hint}`, `printed: ${inside.replace(/\s+/g, " ").replaceAll("·", ",").trim()}`].filter(Boolean).join(" · "));
    }
    weapon = "";
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (HEADER.test(line)) { if (mode === "weapon") flush(); mode = null; out.push(line); continue; }
    if (shortStart(lines, i)) {
      if (mode === "weapon") flush();
      const sidhi = lines.slice(i + 1, i + 8).map(next => next.match(/^Sidhi\s+(\d+)/)?.[1]).find(Boolean);
      out.push(`${line} ✦ world being SIDHI ${sidhi}`); mode = "head"; continue;
    }
    if (!mode) { out.push(line); continue; }
    if (mode === "weapon" && (SECTION.test(line) || /^CASTING\b/.test(line))) { flush(); mode = "body"; }
    if (mode === "weapon") { weapon += ` ${line}`; continue; }
    const weapons = line.match(/^WEAPONS\s+(\S.*)$/);
    if (weapons) { out.push("WEAPONS"); weapon = weapons[1]; mode = "weapon"; continue; }
    if (/^CASTING\b/.test(line) && mode === "head") { out.push("WEAPONS", line); mode = "body"; continue; }
    const section = line.match(SECTION);
    if (section) { mode = section[1] === "LICENSES" ? "licenses" : "body"; out.push(line); continue; }
    if (mode === "licenses") {
      const m = line.includes("—") ? null : line.match(/^([A-Z][A-Z0-9 '’\-]*[A-Z0-9])\s*(?:([✹❂]+)(?:\s+(.*))?|\s+(\d+\s+Charge\b.*))$/);
      if (m) { out.push(`${m[1]}${m[2] ? ` · ${m[2]}` : ""} — ${m[3] ?? m[4] ?? ""}`); continue; }
    }
    out.push(line);
  }
  if (mode === "weapon") flush();
  return out;
}

/** True when the text holds at least one 2.1 Bestiary header ("NAME ✦ genus", or a short block) with its stat lines. */
export function isWorldBeing21(text) {
  const lines = String(text ?? "").replaceAll("\r", "").split("\n").map(line => line.replace(/[ \t]+/g, " ").trim()).filter(Boolean);
  return lines.some((line, index) => shortStart(lines, index)) || lines.some((line, index) => HEADER.test(line) && lines.slice(index + 1, index + 14).some(next => /^(?:SIDHI\s+\d|Move\s+\d)/.test(next) || /\bSIDHI\s+\d/.test(line)));
}
/** One value out of a printed "a/b/c" run for the chosen Sidhi version. */
function pick(value, index, total) {
  const parts = String(value ?? "").split("/").map(part => part.trim());
  return parts.length === total ? parts[index] : parts[0];
}
const number = (value, index, total) => { const text = pick(value, index, total); return /^✦+$/.test(text) ? text.length : int(String(text).replace(/[^\d-]/g, "")); };
function entries(lines, starts) {
  const out = [];
  for (const line of lines) { if (starts(line) || !out.length) out.push(line); else out[out.length - 1] += (out.at(-1).endsWith("-") ? "" : " ") + line; }
  return out.map(entry => entry.replace(/\s+/g, " ").trim()).filter(Boolean);
}
/** Maps printed Part names onto the six Parts the sheet has. Returns {map: {partKey: {label, hp}}, extra: [...]}. */
function fitParts(list) {
  const map = {}, extra = [];
  const byName = name => /HEAD|SKULL|SEAL|CROWN/.test(name) ? "head" : /TORSO|BODY|ABDOMEN|CHEST|TRUNK|BASE/.test(name) ? "torso"
    : /\bR\b.*(HIND ?LEG|LEG|FOOT)|RIGHT.*LEG/.test(name) ? "rleg" : /\bL\b.*(HIND ?LEG|LEG|FOOT)|LEFT.*LEG/.test(name) ? "lleg"
    : /\bR\b.*(FORELEG|ARM|WING|CLAW|EDGE|HAND)|RIGHT.*ARM/.test(name) ? "rarm" : /\bL\b.*(FORELEG|ARM|WING|CLAW|EDGE|HAND)|LEFT.*ARM/.test(name) ? "larm" : null;
  // The six ordinary Parts keep their own places first; wings, forelegs and the like then take what is free.
  const exact = {HEAD: "head", TORSO: "torso", "R ARM": "rarm", "L ARM": "larm", "R LEG": "rleg", "L LEG": "lleg"};
  const rest = [], left = [];
  for (const part of list) { const key = exact[part.label]; if (key && !map[key]) map[key] = part; else rest.push(part); }
  for (const part of rest) { const key = byName(part.label); if (key && !map[key]) map[key] = part; else left.push(part); }
  for (const part of left) { const key = PART_KEYS.find(k => !map[k]); if (key) map[key] = part; else extra.push(part); }
  return {map, extra};
}

function oneWorldBeing(blockLines, index, total, sidhiList, worldItems) {
  const header = blockLines[0].match(HEADER), warnings = [], items = [];
  const sidhi = int(sidhiList[index]);
  const sectionAt = blockLines.findIndex((line, i) => i > 0 && SECTION.test(line));
  const head = blockLines.slice(1, sectionAt < 0 ? blockLines.length : sectionAt).filter(line => !/^SIDHI\s+[\d/]+$/.test(line));
  const moveAt = head.findIndex(line => /^Move\s+\d/.test(line));
  const lore = head.slice(0, moveAt < 0 ? head.length : moveAt).join(" ").replace(/\s+/g, " ").trim();
  const stats = head.slice(Math.max(0, moveAt)).join(" ");
  const stat = label => { const m = stats.match(new RegExp(`\\b${label}\\s+(\\d+(?:/\\d+)*)`)); return m ? number(m[1], index, total) : null; };
  const printed = {move: stat("Move"), dash: stat("Dash"), step: stat("Step"), speed: stat("Speed"), flame: stat("Flame"), morale: stat("Morale")};
  // Sections.
  const sections = {};
  let current = null;
  for (const line of blockLines.slice(sectionAt < 0 ? blockLines.length : sectionAt)) {
    const m = line.match(SECTION);
    if (m) { current = m[1].replace(/^ARMORS$/, "ARMOR").replace(/^CORES.*$/, "CORES"); sections[current] ??= []; continue; }
    // A lone number is a page number, unless it is a one-digit rating wrapped off the end of a Cultivation line.
    const wrapped = current === "CULTIVATIONS" && /^\d$/.test(line) && /[A-Za-z]$/.test(sections[current].at(-1) ?? "");
    if (current && (wrapped || !/^\d{1,3}$/.test(line))) sections[current].push(line);
  }
  // Cores and Cultivations.
  const cores = Object.fromEntries(Object.keys(CORES).map(key => [key, 1])), skills = {}, esoteric = [];
  const coreText = (sections.CORES ?? []).join(" ");
  for (const [, word, value] of coreText.matchAll(/\b(PHYS|MOT|WIT|MND|HRT|FAC)\s+(\d+(?:\/\d+)*)/g)) cores[CORE_WORDS[word]] = number(value, index, total);
  const missing = Object.keys(CORE_WORDS).filter(word => !new RegExp(`\\b${word}\\s+\\d`).test(coreText));
  if (missing.length) warnings.push(`Cores not found: ${missing.join(", ")}; left at 1.`);
  for (const entry of (sections.CULTIVATIONS ?? []).join(" ").split("·").map(part => part.trim()).filter(Boolean)) {
    const m = entry.match(/^(.+?)\s+(\d+(?:\/\d+)*|✦+)$/);
    if (!m) { warnings.push(`Cultivation not read: "${entry}".`); continue; }
    const value = number(m[2], index, total), known = rating21(m[1]);
    if (known?.kind === "skill") skills[known.key] = value;
    else if (known?.kind === "core") warnings.push(`${m[1]} is a Core, not a Cultivation; ignored under CULTIVATIONS.`);
    else { esoteric.push({name: known?.name ?? titleName21(m[1]), value, core: "spi"}); if (!known) warnings.push(`${titleName21(m[1])}: not a 2.1 Cultivation by that name; added as an Esoteric Cultivation.`); }
  }
  // Parts: HP and Soak.
  const derivedHP = BASE_PART_HP + cores.phy + sidhi;
  const parts = Object.fromEntries(PART_KEYS.map(key => [key, {damage: 0, hpBonus: 0, soakBase: 0, soakLost: 0}]));
  const partsText = stats.slice(Math.max(0, stats.search(/\bParts\b/)));
  const listed = [...partsText.matchAll(/\[?(\d+(?:-\d+)?)\]?\s+([A-Z][A-Z /]*?)\s+(\d+(?:\/\d+)*)\s*HP(?:\s*\(([^)]*)\))?/g)].map(m => ({roll: m[1], label: m[2].trim(), hp: number(m[3], index, total), note: m[4] ?? ""}));
  const uniform = partsText.match(/\bParts\s+(?:HP\s+(\d+(?:\/\d+)*)|(\d+(?:\/\d+)*)\s*HP)/);
  const partNotes = [];
  if (listed.length) {
    const fit = fitParts(listed), die = partsText.match(/\[(\d*d6)\]/)?.[1] ?? "d6";
    for (const key of PART_KEYS) if (fit.map[key]) parts[key].hpBonus = fit.map[key].hp - derivedHP;
    partNotes.push(`Printed Parts [${die}]: ${listed.map(part => `${part.roll} ${part.label} ${part.hp} HP${part.note ? ` (${part.note})` : ""}`).join(" · ")}`);
    partNotes.push(`On the sheet: ${PART_KEYS.filter(key => fit.map[key]).map(key => `${PARTS[key].label} = ${fit.map[key].label}`).join(", ")}.`);
    warnings.push(`This World Being has its own Parts (${listed.map(part => part.label).join(", ")}). The sheet has six fixed Parts; each printed Part was placed on one of them and the mapping is in the notes.${fit.extra.length ? ` No slot left for: ${fit.extra.map(part => part.label).join(", ")} — track it by hand.` : ""}`);
  } else if (uniform) { const hp = number(uniform[1] ?? uniform[2], index, total); for (const key of PART_KEYS) parts[key].hpBonus = hp - derivedHP; }
  else warnings.push(`No Parts HP found; the sheet shows ${derivedHP} HP per Part (7 + Physique + Sidhi).`);
  // Armor: Soak is stored on the Parts; the piece itself is carried, unequipped, so it is not counted twice.
  const find = (name, types) => worldItems.filter(item => types.includes(item.type) && norm(item.name) === norm(name))
    .sort((a, b) => (a.importPriority ?? 0) - (b.importPriority ?? 0) || String(a._importUuid ?? a._id ?? "").localeCompare(String(b._importUuid ?? b._id ?? "")))[0];
  const applies = gate => { if (!gate) return true; const list = gate.split("/").map(Number); return list.some(n => sidhiList.map(int).includes(n)) ? list.includes(sidhi) : list.includes(index + 1); };
  const armorNotes = [];
  for (const entry of entries(sections.ARMOR ?? [], line => /^[A-Z0-9][A-Z0-9 '’"“”\-]*?(?:\s*\[[\d/]+\])?\s*(?:—|\()/.test(line))) {
    const m = entry.match(/^(.+?)\s*(?:\[([\d/]+)\])?\s*—\s*([A-Z/ ]+?)\s+Soak\s+(\d+(?:\/\d+)*)\s*(?:·\s*(.*))?$/);
    const name = (m?.[1] ?? entry.split(/\s*[—(]/)[0]).trim(), gate = m?.[2] ?? entry.match(/\[([\d/]+)\]/)?.[1];
    if (!applies(gate)) continue;
    armorNotes.push(entry);
    const coverage = Object.fromEntries(PART_KEYS.map(key => [key, 0]));
    if (m) {
      const soak = number(m[4], index, total);
      for (const word of m[3].split("/").map(part => part.trim())) {
        const keys = word === "ALL" ? PART_KEYS : /HEAD|HELM/.test(word) ? ["head"] : /TORSO|BODY/.test(word) ? ["torso"] : /ARM/.test(word) ? ["rarm", "larm"] : /LEG/.test(word) ? ["rleg", "lleg"] : [];
        if (!keys.length) warnings.push(`${titleName21(name)}: "${word}" is not a Part the sheet has; its Soak was not placed.`);
        for (const key of keys) { coverage[key] = soak; parts[key].soakBase += soak; }
      }
    } else warnings.push(`${titleName21(name)}: no "— PART Soak N" found; kept as a note with no Soak.`);
    const match = find(name, ["fashion"]);
    const item = match ? embedded(typeof match.toObject === "function" ? match.toObject() : match) : {name: titleName21(name), type: "fashion", system: {description: "", source: "World Being stat block", gearSlot: "fashion", r21: {coverage, morale: 0, weight: 0}}};
    item.system = {...item.system, equipped: false, description: `${item.system?.description ?? ""}<p><strong>Stat block:</strong> ${esc(entry)}</p>`};
    if (match) warnings.push(`${titleName21(name)}: matched ${match.name} from ${match.importSource ?? "World items"}.`);
    items.push(item);
  }
  // Weapons: readied, with the printed pool and damage noted. Damage is matched through the item's Extra damage.
  let poolNotes = 0, hand = 0, casting = "";
  for (const entry of entries(sections.WEAPONS ?? [], line => /^[A-Z0-9][A-Z0-9 '’"“”\-.]*?\s*(?:\((?:\d|\))|\[SIDHI\s*\d+\+\]\s*—)/.test(line) || /^CASTING\b/.test(line))) {
    if (/^CASTING\b/.test(entry)) { casting = entry; continue; }
    const gated = entry.match(/^(.+?)\s*\[SIDHI\s*(\d+)\+\]\s*—\s*(.*)$/);
    if (gated && sidhi < int(gated[2])) continue;
    const m = gated ? [entry, gated[1], "", gated[3]] : entry.match(/^(.+?)\s*\(([\dd/]*)\)\s*·\s*(.*)$/);
    if (!m) { warnings.push(`Weapon not read: "${entry}".`); continue; }
    const isRange = part => /^\d[\d,]*\s*m\b/.test(part);
    const name = m[1].trim(), pool = m[2] ? number(m[2].replaceAll("d", ""), index, total) : null, segments = m[3].split("·").map(part => part.trim());
    const dmg = segments.find(part => !isRange(part) && /^\d+(?:\/\d+)*\s+[A-Za-z]+$/.test(part))?.match(/^(\d+(?:\/\d+)*)\s+(.+)$/), range = segments.find(isRange);
    const damage = dmg ? number(dmg[1], index, total) : 0, kind = (dmg?.[2] ?? "").toLowerCase(), metres = range ? int(range.replace(/,/g, "")) : 0;
    const rounds = segments.map(part => part.match(/^(\d+)\s+(.*rounds?|arrows?|bolts?|shots?)$/i)).find(Boolean);
    const hinted = segments.map(part => part.match(/^profile (\w+)$/)?.[1]).find(Boolean);
    const profile = WEAPON_WORDS.find(([pattern]) => pattern.test(name.toUpperCase()))?.[1] ?? (PROFILES[hinted] ? hinted : "empty"), base = PROFILES[profile];
    const expected = cores[base.dmgCore === "used" ? base.core : base.dmgCore] + base.dmgAdd, bonus = dmg ? damage - expected : 0;
    const expectedPool = cores[base.core] + int(skills[base.skill]);
    if (pool !== null && expectedPool !== pool) poolNotes++;
    const noetic = /noetic|morale/.test(kind);
    const match = find(name, ["weapon"]);
    const item = match ? embedded(typeof match.toObject === "function" ? match.toObject() : match) : {name: titleName21(name), type: "weapon", system: {description: "", source: "World Being stat block",
      weaponType: base.ranged || metres > 5 ? "ranged" : "melee", range: Math.max(1, metres || base.range), ammoFamily: "none", ...(DAMAGE_20[kind] ? {damageType: DAMAGE_20[kind]} : {}),
      r21: {profile, grip: "", damage: 2, damageBonus: Math.max(0, bonus), range: metres && metres !== base.range ? metres : 0, rate: 1, capacity: rounds ? int(rounds[1]) : 0, ferocious: 0, shield: 0, reach: 0, affinity: "", grade: "", morph: "", mods: noetic ? {noetic: true} : {}, weight: 0}}};
    if (!match && !dmg) warnings.push(`${titleName21(name)}: no damage figure read; the sheet shows its ${base.label} profile (${expected}).`);
    if (!match && bonus < 0) warnings.push(`${titleName21(name)}: prints ${damage} damage, less than its ${base.label} profile gives (${expected}); the sheet will show ${expected}.`);
    if (match) warnings.push(`${titleName21(name)}: matched ${match.name} from ${match.importSource ?? "World items"}; its own damage rules apply.`);
    if (!match && kind && !/cut|crush|pierce|blast|true|noetic|morale/.test(kind)) warnings.push(`${titleName21(name)}: deals "${dmg[2]}", not a damage type; apply it by hand.`);
    item.system = {...item.system, equipped: true, gearSlot: hand++ % 2 ? "left" : "right", ...(rounds ? {ammo: {type: titleName21(rounds[2]), quantity: int(rounds[1])}} : {}),
      description: `${item.system?.description ?? ""}<p><strong>Stat block:</strong> ${esc(entry)}</p><p>${pool === null ? "No pool printed" : `Printed pool ${pool}d`}; the sheet rolls ${CORES[base.core].label} + ${base.skill === "handEye" ? "Hand-Eye Coordination" : base.skill === "thewsSinews" ? "Thews And Sinews" : "Beast Shrine"} (${expectedPool}d).${noetic ? " NOETIC: its damage goes to Morale." : kind ? ` Choose ${esc(kind)} damage when applying it.` : ""}</p>`};
    items.push(item);
  }
  if (poolNotes) warnings.push(`${poolNotes} weapon pool${poolNotes > 1 ? "s differ" : " differs"} from Core + Cultivation; the printed pool is on each weapon. Add the difference as a modifier when rolling.`);
  // Licenses, Assets and Traits.
  const named = (list, starts = line => ENTRY.test(line)) => entries(list ?? [], starts).map(entry => ({entry, m: entry.match(ENTRY)}));
  for (const {entry, m} of named(sections.LICENSES)) {
    if (!m) { warnings.push(`License not read: "${entry.slice(0, 50)}".`); continue; }
    if (m[3] && sidhi < int(m[3])) continue;
    const name = m[1].trim(), match = find(name, ["technique", "magick"]);
    const item = match ? embedded(typeof match.toObject === "function" ? match.toObject() : match)
      : {name: titleName21(name), type: "technique", system: {description: "", source: "World Being stat block", apCost: 0, burnArdor: glyphs(m[4], "✹"), installArdor: glyphs(m[4], "❂")}};
    item.system = {...item.system, equipped: false, description: `${item.system?.description ?? ""}<p><strong>Stat block${m[4] ? ` (${m[4]})` : ""}:</strong> ${esc(m[5])}</p>`};
    warnings.push(match ? `${titleName21(name)}: matched ${match.name} from ${match.importSource ?? "World items"}.` : `${titleName21(name)}: no Technick or Magick by that name; made a Technick from the stat-block text.`);
    items.push(item);
  }
  for (const {entry, m} of named(sections.ASSETS)) {
    if (!m) { warnings.push(`Asset not read: "${entry.slice(0, 50)}".`); continue; }
    const name = m[1].trim(), key = Object.entries(ASSETS_21).find(([, info]) => norm(info.label) === norm(name))?.[0] ?? "custom", match = find(name, ["asset"]);
    const item = match ? embedded(typeof match.toObject === "function" ? match.toObject() : match) : {name: titleName21(name), type: "asset", system: {description: "", source: "World Being stat block", key}};
    item.system = {...item.system, key: item.system.key ?? key, stars: Math.min(5, Math.max(1, (m[2] ?? "✦").length)), detail: m[5].slice(0, 200), description: `${item.system?.description ?? ""}<p><strong>Stat block:</strong> ${esc(m[5])}</p>`};
    items.push(item);
  }
  for (const {entry, m} of named(sections.TRAITS)) {
    if (!m) { warnings.push(`Trait not read: "${entry.slice(0, 50)}".`); continue; }
    items.push({name: titleName21(m[1].trim()), type: "trait", system: {description: `<p>${esc(m[5])}</p>`, source: "World Being stat block", tags: "2.1, World Being, Trait", level: 1, active: true}});
  }
  const drops = (sections.DROPS ?? []).join(" ").replace(/\s+/g, " ").trim();
  // Printed totals against the sheet's own arithmetic.
  const system = {sidhi, cores, skills, esoteric, parts, ardor: {max: printed.flame ?? flameMaximum21(sidhi), burnt: 0, installed: 0}};
  const moraleDerived = 1 + cores.spi + int(skills.stillness);
  if (printed.morale !== null) { system.moraleBonus = printed.morale - moraleDerived; system.morale = {value: printed.morale}; }
  if (printed.move !== null) system.moveBonus = printed.move - cores.mot;
  const differs = [];
  const move = printed.move ?? cores.mot;
  if (printed.dash !== null && printed.dash !== move + cores.phy) differs.push(`Dash ${printed.dash} (sheet: ${move + cores.phy})`);
  if (printed.step !== null && printed.step !== Math.floor(move / 2)) differs.push(`Step ${printed.step} (sheet: ${Math.floor(move / 2)})`);
  if (printed.speed !== null && printed.speed !== ticksSpeed21(cores.wit, cores.mnd)) differs.push(`Speed ${printed.speed} (sheet: ${ticksSpeed21(cores.wit, cores.mnd)})`);
  if (differs.length) warnings.push(`Printed values the sheet works out differently: ${differs.join("; ")}. The printed line is in the notes.`);
  if (printed.move === null) warnings.push("No Move / Dash / Step line found.");
  if (printed.flame === null) warnings.push("No Flame value found; using 3 + Sidhi.");
  const genus = header[2].trim();
  system.notes = [`<p><strong>${esc(titleName21(header[1]))}</strong> ✦ ${esc(genus)} · Sidhi ${sidhi}${total > 1 ? ` (printed as ${sidhiList.join("/")})` : ""}</p>`, lore && `<p><em>${esc(lore)}</em></p>`,
    stats && `<p><strong>Printed:</strong> ${esc(stats)}</p>`, ...partNotes.map(note => `<p>${esc(note)}</p>`), armorNotes.length && `<p><strong>Armor:</strong> ${armorNotes.map(esc).join("; ")}. Its Soak is on the Parts; the pieces are carried unequipped.</p>`,
    casting && `<p><strong>${esc(casting)}</strong></p>`, drops && `<p><strong>Drops:</strong> ${esc(drops)}</p>`].filter(Boolean).join("");
  warnings.push("Soak, Part HP, Move, Morale and Flame follow the printed block. Weapons start readied; Licenses start un-internalized.");
  return {actor: {name: `${titleName21(header[1])}${total > 1 ? ` (Sidhi ${sidhi})` : ""}`, type: "npc", system, items}, warnings};
}

/** Rules 2.1 stat blocks -> [{actor, warnings}]. `versions`: "all" or a 1-based index into a printed Sidhi run such as 0/3/5. */
export function parseWorldBeings21(text, worldItems = [], {versions = "all"} = {}) {
  if (!String(text ?? "").trim()) throw new Error("Paste a World Being stat block first.");
  if (text.length > 2000000) throw new Error("Import at most 2 MB at a time.");
  const lines = longForm(text.replace(/­/g, "").replaceAll("\r", "").split("\n").map(line => line.replace(/[ \t]+/g, " ").trim()).filter(Boolean));
  const starts = lines.map((line, index) => HEADER.test(line) ? index : -1).filter(index => index >= 0);
  if (!starts.length) throw new Error("No 2.1 stat block found. Each one starts with a line such as: BANDIT ✦ human   SIDHI 0/3/5 (short blocks: a NAME line followed by Move, Sidhi and Parts lines)");
  const records = [];
  starts.forEach((start, n) => {
    const block = lines.slice(start, starts[n + 1] ?? lines.length);
    const sidhiText = block[0].match(HEADER)[3] ?? block.slice(1, 5).map(line => line.match(/^SIDHI\s+(\d+(?:\/\d+)*)$/)?.[1]).find(Boolean);
    const sidhiList = (sidhiText ?? "0").split("/");
    const chosen = versions === "all" ? sidhiList.map((_, index) => index) : [Math.min(sidhiList.length, Math.max(1, int(versions))) - 1];
    for (const index of chosen) {
      const record = oneWorldBeing(block, index, sidhiList.length, sidhiList, worldItems);
      if (!sidhiText) record.warnings.unshift("No SIDHI line found; Sidhi 0 was assumed.");
      records.push(record);
    }
  });
  if (records.length > 50) throw new Error("More than 50 World Beings in one batch. Import fewer pages, or pick one Sidhi version.");
  return records;
}
