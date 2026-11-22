// Rules 2.1 Cultivator Discovery tool (2.1 rulebook p.42): the starting Sidhi and the eight Sutras in one window, opened from the Actors tab.
// Nothing is written to the world while a draft is being worked on. "Save to chat" puts the draft on a whispered chat
// card; the player who saved it and any GM can reopen it from there, and a GM turns the finished draft into an Actor.
import {CORES, CORE_KEYS, CULTIVATIONS_21, CULTIVATION_KEYS_21, ASSETS_21, ATTACHMENT_STRENGTHS, PARTS, PART_KEYS, PROFILES, derive21} from "./rules21.mjs?v=0.2.49";
import {CLASSES_21, CLASS_KEYS_21, STEPS_21, SUTRA_KEYS_21, SECT_START_STARS_21, START_LICENSES_21, stars21, rollLabel21, classFromRoll21, subtypeFromRoll21, startingMacca21,
  nameSyllable21, nameFromSyllables21, emptyDraft21, normalizeDraft21, corePool21, cultivationPool21, assetBudget21, supplyBudget21, discoveryCheck21, actorSystem21,
  discoveryCard21, canOpenDiscovery21, carryCheck21, coreChoices21, cultivationChoices21, AJNA_FORMS_21, SIDHI_COLORS_21, shuffle21, randomCores21, randomCultivations21,
  FIRST_STEP_21, SIDHI_STAGES_21, MAX_START_XP_21, xpBudget21, finalCores21, finalSkills21, sectStars21, nextStarCost21, sectStarsFor21, freeLicenses21, MAX_EXTRA_SECTS_21,
  spendXpRandom21, bookPage21} from "./discovery-rules21.mjs?v=0.2.49";
import {usesRules21} from "./rules-version.mjs?v=0.2.49";
import {escapeHTML} from "./resolution.mjs?v=0.2.49";

const SYSTEM = "10kswordsfoundry";
const FLAG = "discovery21";
const SHOP_PACKS = ["weapons-21", "armor-21", "consumables-21", "accessories-21", "ammunition-21", "goods-21"];
const SHOP_LIMIT = 80;
// Weapon catalogs carry one "(profile)" entry per weapon type: a template for the item creator, not something on sale.
const isProfileTemplate = name => /\(profile\)\s*$/i.test(String(name ?? ""));
const starCount = value => (String(value ?? "").match(/✦/g) ?? []).length;
// The steps with their own dice, and whether XP buys anything there (p.100). Assets past the Class's Stars are left to the player:
// a new one must make sense in the fiction.
const ROLL_STEPS_21 = Object.freeze({class: {label: "Class"}, cores: {label: "Cores", xp: true}, cultivations: {label: "Cultivations", xp: true}, assets: {label: "Assets"},
  supply: {label: "Macca and Supply"}, identity: {label: "Name, Culture and Alignment"}, sect: {label: "Sect and Licenses", xp: true}, sidhi: {label: "Sidhi color and Ajna"}});
const int = value => Math.trunc(Number(value) || 0);
const macca = value => int(value).toLocaleString("en-US");
const option = (value, label, selected) => ({value, label, selected: String(value) === String(selected)});

let catalogPromise = null;
/** Everything the tool offers, read once from the 2.1 compendia: options, Assets, Sects, Licenses and the market. */
export function discoveryCatalog21() {
  catalogPromise ??= (async () => {
    const index = async (name, fields) => { const pack = game.packs.get(`${SYSTEM}.${name}`); return pack ? [...await pack.getIndex({fields})] : []; };
    const flag = entry => entry.flags?.[SYSTEM] ?? {};
    const options = await index("options-21", [`flags.${SYSTEM}`, "system.description"]);
    const html = entry => String(entry.system?.description ?? "");
    const byName = (a, b) => a.name.localeCompare(b.name);
    const cultures = options.filter(entry => flag(entry).option21?.kind === "culture").map(entry => ({name: entry.name, uuid: entry.uuid, description: html(entry), code: String(flag(entry).option21.codes?.[0] ?? "")})).toSorted((a, b) => a.code.localeCompare(b.code));
    const alignments = options.filter(entry => flag(entry).option21?.kind === "alignment").map(entry => ({name: entry.name, uuid: entry.uuid, description: html(entry), roll: String(flag(entry).option21.roll ?? "")})).toSorted((a, b) => int(a.roll) - int(b.roll));
    const classes = Object.fromEntries(options.filter(entry => flag(entry).class21).map(entry => [entry.name, entry.uuid]));
    const assetIndex = await index("assets-21", ["system.key", "system.description"]);
    const assets = Object.fromEntries(assetIndex.map(entry => [entry.system?.key, entry.uuid]));
    const assetText = Object.fromEntries(assetIndex.map(entry => [entry.system?.key, html(entry)]));
    const sects = (await index("barang-21", ["system.sect", "system.cultivation"])).map(entry => ({sect: entry.system?.sect ?? "", cultivation: entry.system?.cultivation ?? "", barang: entry.name, uuid: entry.uuid})).filter(row => row.sect).toSorted((a, b) => a.sect.localeCompare(b.sect));
    const licenses = (await index("sects-21", ["system.sect", "system.description", `flags.${SYSTEM}.sect21`])).map(entry => ({uuid: entry.uuid, name: entry.name, type: entry.type, description: html(entry), sect: entry.system?.sect ?? "", cultivation: flag(entry).sect21?.cultivation ?? "", stars: int(flag(entry).sect21?.stars), grants: []}));
    // Sect Gear is learned as a License too ("License: Red Gun ✦✦✦✦ — Gain the San Tou Liu Bi"). Its Sect is the one whose Barang
    // carries that Cultivation. Gear printed inside a Technick of the same name (Chakra Rod, Adamantine Noose) comes with that Technick.
    const sectOf = Object.fromEntries(sects.map(row => [row.cultivation, row.sect]));
    const bare = (name, sect) => { const low = name.toLowerCase(), prefix = `${sect.toLowerCase()} `; return (low.startsWith(prefix) ? low.slice(prefix.length) : low).trim(); };
    for (const entry of await index("sect-gear-21", ["system.description", `flags.${SYSTEM}.sect21`])) {
      const info = flag(entry).sect21 ?? {}, sect = sectOf[info.cultivation] ?? "";
      if (!sect) continue;
      const technick = licenses.find(row => row.sect === sect && row.name.toLowerCase() === bare(entry.name, sect));
      if (technick) { technick.grants.push({uuid: entry.uuid, name: entry.name}); continue; }
      licenses.push({uuid: entry.uuid, name: entry.name, type: entry.type, gear: true, description: html(entry), sect, cultivation: info.cultivation, stars: starCount(info.license), grants: []});
    }
    licenses.sort((a, b) => a.stars - b.stars || byName(a, b));
    const shop = [];
    // Only what the 2.1 rulebook prints is for sale at creation, with its page. Catalog entries kept from the Red Kalpa one-shot or the
    // playtest Sects stay in the compendiums for the GM but are not offered here.
    for (const name of SHOP_PACKS) for (const entry of await index(name, ["system.magCost", "system.rarity", "system.quantity", "system.description", "system.source", "system.r21.weight", "system.r21.coverage", "system.r21.profile"])) {
      const page = bookPage21(entry.system?.source);
      if (isProfileTemplate(entry.name) || !page) continue;
      const coverage = Object.fromEntries(PART_KEYS.map(key => [key, Math.max(0, int(entry.system?.r21?.coverage?.[key]))]));
      // Weight of one purchase: ammunition weighs per stack, everything else per piece (as the sheet counts it).
      const kg = Math.round(Math.max(0, Number(entry.system?.r21?.weight) || 0) * (entry.type === "ammunition" ? 1 : Math.max(1, int(entry.system?.quantity) || 1)) * 100) / 100;
      const profile = entry.type === "weapon" && PROFILES[entry.system?.r21?.profile] ? entry.system.r21.profile : "";
      shop.push({uuid: entry.uuid, name: entry.name, type: entry.type, price: Math.max(0, int(entry.system?.magCost)), rarity: entry.system?.rarity ?? "", pack: name, kg, coverage, description: html(entry), profile, page,
        covers: PART_KEYS.filter(key => coverage[key] > 0).map(key => `${PARTS[key].label} ${coverage[key]}`).join(", "), packLabel: game.packs.get(`${SYSTEM}.${name}`)?.metadata?.label ?? name});
    }
    shop.sort((a, b) => a.price - b.price || byName(a, b));
    return {cultures, alignments, classes, assets, assetText, sects, licenses, shop};
  })().catch(error => { catalogPromise = null; throw error; });
  return catalogPromise;
}

/** Rolls, and posts the roll to chat so the table sees every result (a button that lands on the same number twice still shows two rolls). */
async function dice(formula, flavor = "") {
  const roll = await new foundry.dice.Roll(formula).evaluate();
  if (flavor) try { await roll.toMessage({flavor: `<strong>Cultivator Discovery</strong> · ${escapeHTML(flavor)}`, speaker: {alias: game.user.name}}); } catch (error) { console.warn("10,000 Swords | Discovery roll was not posted.", error); }
  return {total: roll.total, results: roll.dice.flatMap(die => die.results.map(result => result.result))};
}

const discoveryFlags = message => message?.flags?.[SYSTEM]?.[FLAG] ?? null;
function draftFromFlags(flags) {
  try { return normalizeDraft21(JSON.parse(flags?.draftJSON ?? "null")); } catch { return emptyDraft21(); }
}

const HandlebarsApp = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2);
export class Discovery21 extends HandlebarsApp {
  static DEFAULT_OPTIONS = {classes: ["swords", "discovery21"], window: {title: "Cultivator Discovery · Rules 2.1", resizable: true}, position: {width: 900, height: 760},
    actions: {goto: Discovery21.goto, rollClass: Discovery21.rollClass, rollSubtype: Discovery21.rollSubtype, clearCores: Discovery21.clearCores, clearCultivations: Discovery21.clearCultivations,
      addAsset: Discovery21.addAsset, rollAsset: Discovery21.rollAsset, removeAsset: Discovery21.removeAsset, rollMacca: Discovery21.rollMacca, addSupply: Discovery21.addSupply,
      removeSupply: Discovery21.removeSupply, randomSupply: Discovery21.randomSupply, inspect: Discovery21.inspect, rollSyllable: Discovery21.rollSyllable, rollCulture: Discovery21.rollCulture,
      rollAlignment: Discovery21.rollAlignment, addAttachment: Discovery21.addAttachment, removeAttachment: Discovery21.removeAttachment, toggleLicense: Discovery21.toggleLicense,
      addSect: Discovery21.addSect, removeSect: Discovery21.removeSect, rollStep: Discovery21.rollStep,
      rollEverything: Discovery21.rollEverything, save: Discovery21.save, createActor: Discovery21.createActor, openActor: Discovery21.openActor}};
  static PARTS = {main: {template: `systems/${SYSTEM}/templates/discovery-21.hbs`, scrollable: [".discovery21-main"]}};

  constructor({message = null, ...options} = {}) {
    super({...options, id: `discovery21-${message?.id ?? foundry.utils.randomID()}`});
    const flags = discoveryFlags(message);
    this.messageId = message?.id ?? null;
    this.draft = flags ? draftFromFlags(flags) : emptyDraft21();
    this.ownerId = flags?.ownerId ?? game.user.id;
    this.gmNote = flags?.gmNote ?? "";
    this.status = flags?.status === "created" ? "created" : "draft";
    this.actorUuid = flags?.actorUuid ?? "";
    this.step = FIRST_STEP_21;
    this.dirty = false;
    this.shop = {query: "", pack: "", part: "", profile: "", affordable: false};
    this.assetPick = "debt";
  }

  get locked() { return this.status === "created"; }
  get ownerName() { return game.users.get(this.ownerId)?.name ?? "Unknown player"; }
  touch() { this.dirty = true; }
  log(text) { this.draft.log = [...(this.draft.log ?? []), text].slice(-60); }

  async _prepareContext() {
    const catalog = await discoveryCatalog21();
    this.catalog = catalog;
    const draft = this.draft, info = CLASSES_21[draft.classKey], check = discoveryCheck21(draft), step = this.step;
    const steps = Object.entries(STEPS_21).map(([key, label]) => {
      const count = key === "review" ? check.count : check.issues[key].length;
      return {key, label, active: key === step, badge: count ? String(count) : "✓", state: count ? "todo" : "done"};
    });
    const context = {steps, is: {[step]: true}, locked: this.locked, isGM: game.user.isGM, dirty: this.dirty, saved: !!this.messageId, created: this.status === "created",
      issues: check.issues[step] ?? [], notes: check.notes[step] ?? [], className: info.label, classPage: info.page, ownerName: this.ownerName, draft};
    const xp = xpBudget21(draft);
    context.xp = {...xp, any: xp.start > 0, over: xp.left < 0};
    // Every step but the first and the last has its own dice; the ones where XP buys something also offer a roll that spends it.
    context.roll = ROLL_STEPS_21[step] ? {step, label: ROLL_STEPS_21[step].label, xp: xp.start > 0 && !!ROLL_STEPS_21[step].xp} : null;
    // XP Stars on top of a rating: 0 … up to 5 Stars total, each option showing what that many Stars cost (p.100).
    const xpOptions = (base, extra, per) => Array.from({length: Math.max(0, 5 - int(base)) + 1}, (_, n) => {
      let cost = 0; for (let rating = int(base) + 1; rating <= int(base) + n; rating++) cost += per * rating;
      return option(n, n ? `+${n} (${cost} XP)` : "+0", Math.min(int(extra), Math.max(0, 5 - int(base))));
    });
    if (step === "start") {
      context.stages = SIDHI_STAGES_21.map(row => ({...row, selected: row.stage === xp.sidhi, stars: row.stage ? "✶".repeat(row.stage) : "—"}));
      context.startModes = [option("sidhi", "Start at a Sidhi Stage", draft.start.mode), option("xp", "Start with a custom amount of XP", draft.start.mode)];
      context.stageChoices = SIDHI_STAGES_21.map(row => option(row.stage, `Sidhi ${row.stage} — ${row.name} (${row.foundation} XP)`, draft.start.sidhi));
      context.maxXp = MAX_START_XP_21;
      context.customXp = draft.start.mode === "xp";
    }
    if (step === "class") {
      context.classes = CLASS_KEYS_21.map(key => { const row = CLASSES_21[key]; return {key, label: row.label, roll: rollLabel21(row.roll), selected: key === draft.classKey, cores: row.cores.map(stars21).join(", "),
        cultivations: Object.entries(row.cultivations).toSorted((a, b) => b[0] - a[0]).map(([rating, count]) => `${stars21(rating)} × ${count}`).join(", "), assets: stars21(row.assets), macca: `${macca(row.maccaPerD6)} × d6`, supply: row.supply, page: row.page}; });
      context.subtypes = info.subtypes.length ? {label: info.subtypeLabel, options: [option("", "—", draft.subtype), ...info.subtypes.map(entry => option(entry.label, `${rollLabel21(entry.roll)} · ${entry.label}`, draft.subtype))]} : null;
    }
    if (step === "cores") {
      const pool = corePool21(draft);
      // Only the Star values still unassigned are offered (plus the Core's own current value).
      const final = finalCores21(draft);
      context.coreRows = CORE_KEYS.map(key => ({key, label: CORES[key].label, abbr: CORES[key].abbr, text: CORES[key].text, options: [option(0, "—", draft.cores[key]), ...coreChoices21(draft, key).map(value => option(value, stars21(value), draft.cores[key]))],
        xpOptions: xpOptions(draft.cores[key], draft.xpCores[key], 5), final: stars21(final[key]) || "—", raised: final[key] > int(draft.cores[key])}));
      context.corePool = info.cores.map(stars21).join(", ");
      context.coreLeft = [...pool.remaining].toSorted((a, b) => b[0] - a[0]).flatMap(([rating, count]) => Array(count).fill(stars21(rating))).join(", ");
    }
    if (step === "cultivations") {
      const final = finalSkills21(draft);
      context.cultivationRows = CULTIVATION_KEYS_21.map(key => ({key, label: CULTIVATIONS_21[key].label, text: CULTIVATIONS_21[key].text, core: CORES[CULTIVATIONS_21[key].core].abbr, rated: int(final[key]) > 0,
        options: [option(0, "—", int(draft.skills[key])), ...cultivationChoices21(draft, key).map(value => option(value, stars21(value), int(draft.skills[key])))],
        xpOptions: xpOptions(draft.skills[key], draft.xpSkills[key], 3), final: stars21(final[key]), raised: int(final[key]) > int(draft.skills[key])}));
      context.cultivationPool = cultivationPool21(draft).rows.map(row => ({stars: stars21(row.rating), have: row.have, want: row.want, done: row.have === row.want}));
    }
    if (step === "assets") {
      const budget = assetBudget21(draft);
      context.assetBudget = {...budget, stars: stars21(budget.budget), over: budget.left < 0 && !xp.start};
      context.assetRows = draft.assets.map((row, index) => { const asset = ASSETS_21[row.key]; return {index, label: asset.label, code: asset.code, page: asset.page, detail: row.detail, description: catalog.assetText[row.key] ?? "",
        options: Array.from({length: Math.max(1, asset.max - asset.min + 1)}, (_, offset) => option(asset.min + offset, stars21(asset.min + offset), row.stars))}; });
      if (!ASSETS_21[this.assetPick]?.code) this.assetPick = "debt";
      context.assetChoices = Object.entries(ASSETS_21).filter(([, asset]) => asset.code).map(([key, asset]) => option(key, `[${asset.code[0]}][${asset.code[1]}] ${asset.label} (${asset.min === asset.max ? stars21(asset.min) : `${stars21(asset.min)}–${stars21(asset.max)}`})`, this.assetPick));
      context.assetPreview = {label: ASSETS_21[this.assetPick].label, page: ASSETS_21[this.assetPick].page, description: catalog.assetText[this.assetPick] ?? ""};
    }
    if (step === "supply") {
      const budget = supplyBudget21(draft), query = this.shop.query.trim().toLowerCase();
      context.macca = {rolled: !!draft.maccaD6, d6: draft.maccaD6, per: macca(info.maccaPerD6), total: macca(budget.total), spent: macca(budget.spent), left: macca(budget.left), over: budget.left < 0};
      context.classSupply = info.supply;
      const info21 = new Map(catalog.shop.map(row => [row.uuid, row]));
      context.supplyRows = draft.supply.map((row, index) => ({...row, index, priceText: macca(row.price), totalText: row.free ? "free" : macca(row.price * row.qty), kgText: `${Math.round(row.kg * row.qty * 100) / 100} kg`,
        covers: info21.get(row.uuid)?.covers ?? "", description: info21.get(row.uuid)?.description ?? "", page: info21.get(row.uuid)?.page ?? 0}));
      context.carry = carryCheck21(draft);
      const rows = catalog.shop.filter(row => (!query || row.name.toLowerCase().includes(query)) && (!this.shop.pack || row.pack === this.shop.pack) && (!this.shop.part || row.coverage[this.shop.part] > 0)
        && (!this.shop.profile || row.profile === this.shop.profile) && (!this.shop.affordable || row.price <= Math.max(0, budget.left)));
      const profiles = Object.keys(PROFILES).filter(key => catalog.shop.some(row => row.profile === key)).toSorted((a, b) => PROFILES[a].label.localeCompare(PROFILES[b].label));
      context.shop = {...this.shop, count: rows.length, shown: Math.min(rows.length, SHOP_LIMIT), rows: rows.slice(0, SHOP_LIMIT).map(row => ({...row, priceText: macca(row.price), kgText: row.kg ? `${row.kg} kg` : "—",
          typeLabel: `${game.i18n.localize(`TYPES.Item.${row.type}`)}${row.profile ? ` · ${PROFILES[row.profile].label}` : ""}`, dear: row.price > Math.max(0, budget.left)})),
        parts: [option("", "Covers any Part", this.shop.part), ...PART_KEYS.map(key => option(key, `Covers ${PARTS[key].label}`, this.shop.part))],
        profiles: [option("", "Any weapon type", this.shop.profile), ...profiles.map(key => option(key, PROFILES[key].label, this.shop.profile))],
        packs: [option("", "All catalogs", this.shop.pack), ...SHOP_PACKS.map(name => option(name, game.packs.get(`${SYSTEM}.${name}`)?.metadata?.label ?? name, this.shop.pack))]};
    }
    if (step === "identity") {
      const known = list => list.some(row => row.name === draft.culture);
      context.cultureChoices = [option("", "—", draft.culture), ...catalog.cultures.map(row => option(row.name, `[${row.code[0] ?? ""}][${row.code[1] ?? ""}] ${row.name}`, draft.culture))];
      context.cultureCustom = draft.culture && !known(catalog.cultures) ? draft.culture : "";
      context.cultureText = catalog.cultures.find(row => row.name === draft.culture)?.description ?? "";
      context.alignmentText = catalog.alignments.find(row => row.name === draft.alignment)?.description ?? "";
      context.alignmentChoices = [option("", "—", draft.alignment), ...catalog.alignments.map(row => option(row.name, `[${row.roll}] ${row.name}`, draft.alignment))];
      context.attachmentRows = draft.attachments.map((row, index) => ({index, text: row.text, options: Object.entries(ATTACHMENT_STRENGTHS).map(([value, label]) => option(value, `${label} (${value})`, row.strength))}));
    }
    if (step === "sect") {
      context.sectChoices = [option("", "—", draft.sect), ...catalog.sects.map(row => option(row.sect, `${row.sect} — ${row.cultivation}`, draft.sect))];
      const chosen = new Set(draft.licenses.map(row => row.uuid)), free = freeLicenses21(draft), open = draft.licenses.length < xp.meridians;
      // One License table per Sect held: the Sutra 7 Sect first, then any bought with XP. Gear is learned as a License as well.
      const block = (sect, stars, extra) => {
        const mine = catalog.licenses.filter(row => row.sect === sect);
        return {later: mine.filter(row => row.stars > stars).length, rows: mine.filter(row => row.stars <= stars).map(row => {
          const isChosen = chosen.has(row.uuid), freePick = !extra && free < START_LICENSES_21;
          return {...row, starText: stars21(row.stars), typeLabel: row.gear ? "Gear" : row.type === "magick" ? "Magick" : "Technick", grantText: (row.grants ?? []).map(entry => entry.name).join(", "),
            chosen: isChosen, full: !isChosen && !freePick && (xp.left < 10 || !open), costsXp: !isChosen && !freePick};
        })};
      };
      const have = draft.licenses.filter(row => row.sect === draft.sect).length;
      context.sect = draft.sect ? {name: draft.sect, cultivation: draft.cultivation, barang: draft.barang, stars: stars21(sectStars21(draft)), want: START_LICENSES_21, have: Math.min(have, START_LICENSES_21), meridians: xp.meridians,
        xpOptions: xpOptions(SECT_START_STARS_21, draft.xpSect, 3), extra: Math.max(0, draft.licenses.length - free), total: draft.licenses.length, ...block(draft.sect, sectStars21(draft), false)} : null;
      const starOptions = stars => Array.from({length: 6}, (_, n) => { let cost = 0; for (let rating = 1; rating <= n; rating++) cost += 3 * rating; return option(n, n ? `${stars21(n)} (${cost} XP)` : "— (0 XP)", stars); });
      context.extraSects = draft.extraSects.map((row, index) => ({...row, index, starText: stars21(row.stars) || "no Stars", starOptions: starOptions(row.stars), ...block(row.sect, row.stars, true)}));
      const held = new Set([draft.sect, ...draft.extraSects.map(row => row.sect)]);
      const others = catalog.sects.filter(row => !held.has(row.sect)).map(row => option(row.sect, `${row.sect} — ${row.cultivation}`, ""));
      context.addSect = draft.sect && xp.start > 0 && draft.extraSects.length < MAX_EXTRA_SECTS_21 && others.length ? {choices: others} : null;
    }
    if (step === "review") {
      const supply = supplyBudget21(draft), cores = finalCores21(draft), skills = finalSkills21(draft);
      context.review = {
        sutras: SUTRA_KEYS_21.map(key => ({label: STEPS_21[key], key, issues: check.issues[key], notes: check.notes[key], done: !check.issues[key].length})),
        complete: check.complete, todo: `${check.count} thing${check.count === 1 ? "" : "s"} still to do.`,
        cores: CORE_KEYS.map(key => `${CORES[key].abbr} ${stars21(cores[key]) || "—"}`).join(" · "),
        cultivations: Object.keys(skills).toSorted((a, b) => skills[b] - skills[a]).map(key => `${CULTIVATIONS_21[key].label} ${stars21(skills[key])}`).join(", "),
        sectStars: stars21(sectStars21(draft)), start: `Sidhi ${xp.sidhi} (${xp.stage.name})${xp.start ? ` · ${xp.start} XP agreed, ${xp.spent} spent, ${Math.max(0, xp.left)} left` : ""}`,
        assets: draft.assets.map(row => `${ASSETS_21[row.key].label} ${stars21(row.stars)}${row.detail ? ` (${row.detail})` : ""}`).join(", "),
        supply: draft.supply.map(row => `${row.qty > 1 ? `${row.qty} × ` : ""}${row.name}${row.free ? " (free)" : ""}`).join(", "),
        macca: draft.maccaD6 ? `${macca(supply.total)} starting, ${macca(supply.spent)} spent, ${macca(Math.max(0, supply.left))} carried` : "",
        attachments: draft.attachments.filter(row => row.text.trim()).map(row => ({text: row.text, strength: ATTACHMENT_STRENGTHS[row.strength]})),
        extraSects: draft.extraSects.map(row => `${row.sect} · ${row.cultivation} ${stars21(row.stars) || "(no Stars)"} · Barang: ${row.barang} (carried, not ingested)`).join("; "),
        licenses: draft.licenses.map(row => `${row.name} ${stars21(row.stars)}`).join(", "), subtype: draft.subtype, log: draft.log, gmNote: this.gmNote, hasActor: !!this.actorUuid};
    }
    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._listeners?.abort();
    this._listeners = new AbortController();
    const signal = this._listeners.signal, root = this.element;
    for (const input of root.querySelectorAll("[data-field]")) {
      const typed = input.tagName === "TEXTAREA" || (input.tagName === "INPUT" && ["text", "search"].includes(input.type));
      input.addEventListener(typed ? "input" : "change", () => {
        if (this.locked) return;
        const value = input.type === "checkbox" ? input.checked : input.dataset.number !== undefined ? int(input.value) : input.value;
        const before = carryCheck21(this.draft).tier;
        this.setField(input.dataset.field, value);
        this.touch();
        this.warnCarry(before);
        if (typed) this.refreshBadges(); else this.render();
      }, {signal});
    }
    for (const input of root.querySelectorAll("[data-shop]")) input.addEventListener(input.type === "search" ? "input" : "change", () => {
      this.shop[input.dataset.shop] = input.type === "checkbox" ? input.checked : input.value;
      if (input.type !== "search") return this.render();
      this._cursor = input.selectionStart;
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => { this._focusShop = true; this.render(); }, 200);
    }, {signal});
    if (this._focusShop) { const input = root.querySelector('[data-shop="query"]'); input?.focus(); if (input && this._cursor !== null) input.setSelectionRange(this._cursor, this._cursor); this._focusShop = false; }
    const pick = root.querySelector("[data-asset-pick]");
    pick?.addEventListener("change", () => { this.assetPick = pick.value; this.render(); }, {signal});
    const note = root.querySelector("[data-gm-note]");
    note?.addEventListener("input", () => { this.gmNote = note.value; this.touch(); }, {signal});
  }

  /** Writes one field of the draft; Class and Sect changes also clear what depended on the old choice. */
  setField(path, value) {
    if (path === "classKey") { if (!CLASSES_21[value] || value === this.draft.classKey) return; this.draft.classKey = value; this.draft.subtype = ""; return; }
    if (path === "sect") {
      const row = this.catalog?.sects.find(entry => entry.sect === value);
      // A new first Sect drops its old Licenses; Sects bought with XP keep theirs, unless the new choice is one of them.
      const extraSects = this.draft.extraSects.filter(extra => extra.sect !== row?.sect);
      Object.assign(this.draft, {sect: row?.sect ?? "", cultivation: row?.cultivation ?? "", barang: row?.barang ?? "", extraSects,
        licenses: this.draft.licenses.filter(license => extraSects.some(extra => extra.sect === license.sect))});
      return;
    }
    if (path === "cultureCustom") { this.draft.culture = String(value); return; }
    // Switching to custom XP starts from the chosen Stage's XP, so nothing already bought is lost.
    if (path === "start.mode") { if (value === "xp" && this.draft.start.mode !== "xp") this.draft.start.xp = xpBudget21(this.draft).start; this.draft.start.mode = value === "xp" ? "xp" : "sidhi"; this.draft.start.agreed = false; return; }
    if (path === "start.sidhi" || path === "start.xp") { this.draft.start[path.slice(6)] = Math.max(0, Math.min(path === "start.sidhi" ? 6 : MAX_START_XP_21, int(value))); this.draft.start.agreed = false; return; }
    if (path.startsWith("skills.")) { const key = path.slice(7); if (int(value) > 0) this.draft.skills[key] = int(value); else delete this.draft.skills[key]; return; }
    foundry.utils.setProperty(this.draft, path, value);
  }

  /** A visible warning when the Supply first goes over the Carry Limit, or climbs a tier (p.182). Nothing is refused. */
  warnCarry(before = 0) {
    const carry = carryCheck21(this.draft);
    if (carry.tier > before) ui.notifications.warn(`Over Carry. ${carry.text} You can still take it.`, {permanent: false});
  }

  refreshBadges() {
    const check = discoveryCheck21(this.draft);
    for (const badge of this.element.querySelectorAll("[data-badge]")) {
      const key = badge.dataset.badge, count = key === "review" ? check.count : check.issues[key]?.length ?? 0;
      badge.textContent = count ? String(count) : "✓";
      badge.classList.toggle("todo", !!count); badge.classList.toggle("done", !count);
    }
  }

  async close(options = {}) {
    if (this.dirty && !this.locked && !options.discard) {
      const leave = await foundry.applications.api.DialogV2.confirm({window: {title: "Cultivator Discovery"}, content: "<p>This Discovery has changes that are not saved to chat. Close and lose them?</p>", rejectClose: false});
      if (!leave) return this;
    }
    clearTimeout(this._searchTimer);
    this._listeners?.abort();
    return super.close(options);
  }

  static goto(event, target) { this.step = STEPS_21[target.dataset.step] ? target.dataset.step : FIRST_STEP_21; return this.render(); }

  static async rollClass() {
    const roll = await dice("3d6", "Class (3d6)"), key = classFromRoll21(roll.total);
    this.log(`Class 3d6 (${roll.results.join(", ")}) = ${roll.total}: ${CLASSES_21[key].label}`);
    this.setField("classKey", key); this.touch();
    return this.render();
  }
  /**
   * Rolls one step at random, the book's own dice where it gives a table (3d6 Class, d6 sub-table, d6 Macca, 2d6 twice per
   * syllable, d66 Culture, 2d6 Alignment, d66 Assets); the rest is drawn evenly. With `xp`, the XP left is then spent at random on
   * what that step can buy. Returns the lines for the chat summary.
   */
  async rollPart(key, {xp = false} = {}) {
    const catalog = this.catalog ?? await discoveryCatalog21(), random = this.random ?? Math.random, draft = this.draft, lines = [];
    const pick = list => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
    const say = text => { lines.push(text); this.log(`Roll · ${text}`); };
    const spend = kinds => { const bought = spendXpRandom21(draft, {kinds, licenses: catalog.licenses, random}); if (bought.length) say(`XP spent: ${bought.join(", ")} (${xpBudget21(draft).left} XP left)`); };
    const info = () => CLASSES_21[draft.classKey];
    if (key === "class") {
      const classRoll = await dice("3d6");
      draft.classKey = classFromRoll21(classRoll.total);
      draft.subtype = "";
      if (info().subtypes.length) { const roll = await dice("1d6"); draft.subtype = subtypeFromRoll21(draft.classKey, roll.total); }
      say(`Class 3d6 (${classRoll.results.join(", ")}) = ${classRoll.total}: ${info().label}${draft.subtype ? ` — ${draft.subtype}` : ""}`);
    }
    if (key === "cores") {
      draft.cores = randomCores21(draft.classKey, random);
      draft.xpCores = {};
      say(`Cores: ${CORE_KEYS.map(core => `${CORES[core].abbr} ${stars21(draft.cores[core])}`).join(" · ")}`);
      if (xp) spend(["cores"]);
    }
    if (key === "cultivations") {
      draft.skills = randomCultivations21(draft.classKey, random);
      draft.xpSkills = {};
      say(`Cultivations: ${Object.keys(draft.skills).map(skill => `${CULTIVATIONS_21[skill].label} ${stars21(draft.skills[skill])}`).join(", ")}`);
      if (xp) spend(["cultivations"]);
    }
    if (key === "assets") {
      draft.assets = [];
      let stars = info().assets;
      for (let tries = 0; stars > 0 && tries < 40; tries++) {
        const roll = await dice("2d6"), asset = Object.keys(ASSETS_21).find(entry => ASSETS_21[entry].code === roll.results.join(""));
        if (!asset || ASSETS_21[asset].min > stars || draft.assets.some(row => row.key === asset)) continue;
        const top = Math.min(ASSETS_21[asset].max, stars), bought = ASSETS_21[asset].min + Math.min(top - ASSETS_21[asset].min, Math.floor(random() * (top - ASSETS_21[asset].min + 1)));
        draft.assets.push({key: asset, stars: bought, detail: ""});
        stars -= bought;
      }
      say(`Assets: ${draft.assets.map(row => `${ASSETS_21[row.key].label} ${stars21(row.stars)}`).join(", ") || "none"}`);
    }
    if (key === "supply") {
      const maccaRoll = await dice("1d6");
      draft.maccaD6 = maccaRoll.total;
      draft.supply = [];
      const common = catalog.shop.filter(row => row.rarity === "common");
      if (info().supply && common.length) this.addSupplyRow(pick(common), {free: true, note: "Class Supply (random)"});
      let left = startingMacca21(draft.classKey, draft.maccaD6);
      for (let bought = 0; bought < 8; bought++) {
        const afford = catalog.shop.filter(row => row.price > 0 && row.price <= left);
        if (!afford.length) break;
        const row = pick(afford);
        this.addSupplyRow(row);
        left -= row.price;
      }
      say(`Macca ${macca(info().maccaPerD6)} × d6 (${maccaRoll.total}) = ${macca(startingMacca21(draft.classKey, draft.maccaD6))}; Supply: ${draft.supply.map(row => `${row.qty > 1 ? `${row.qty} × ` : ""}${row.name}${row.free ? " (free)" : ""}`).join(", ") || "nothing"}; ${macca(left)} left`);
      const carry = carryCheck21(draft);
      if (carry.over) { say(carry.text); ui.notifications.warn(`Over Carry. ${carry.text}`); }
    }
    if (key === "identity") {
      const syllables = [];
      for (let n = 1 + Math.floor(random() * 4); n > 0; n--) { const row = await dice("2d6"), column = await dice("2d6"); syllables.push(nameSyllable21(row.total, column.total)); }
      draft.name = nameFromSyllables21(syllables);
      say(`Name: ${draft.name} (${syllables.join(" + ")})`);
      const cultureRoll = await dice("2d6"), culture = catalog.cultures.find(row => row.code === cultureRoll.results.join("")) ?? pick(catalog.cultures);
      if (culture) { draft.culture = culture.name; say(`Culture d66 [${cultureRoll.results[0]}][${cultureRoll.results[1]}]: ${culture.name}`); }
      const alignRoll = await dice("2d6");
      const alignment = catalog.alignments.find(row => { const [low, high = low] = row.roll.split("-").map(Number); return alignRoll.total >= low && alignRoll.total <= high; }) ?? pick(catalog.alignments);
      if (alignment) { draft.alignment = alignment.name; say(`Alignment 2d6 = ${alignRoll.total}: ${alignment.name}`); }
    }
    if (key === "sect" && catalog.sects.length) {
      const sect = pick(catalog.sects);
      Object.assign(draft, {sect: sect.sect, cultivation: sect.cultivation, barang: sect.barang, xpSect: 0, extraSects: []});
      draft.licenses = shuffle21(catalog.licenses.filter(row => row.sect === sect.sect && row.stars <= sectStars21(draft)), random).slice(0, START_LICENSES_21)
        .map(row => ({uuid: row.uuid, name: row.name, stars: row.stars, cultivation: row.cultivation, sect: row.sect}));
      say(`Sect: ${sect.sect} (${sect.cultivation} ${stars21(sectStars21(draft))}, ${sect.barang}); Licenses: ${draft.licenses.map(row => row.name).join(", ") || "none"}`);
      if (xp) spend(["sect", "licenses"]);
    }
    if (key === "sidhi") {
      draft.sidhiColor = pick(SIDHI_COLORS_21);
      draft.ajna = pick(AJNA_FORMS_21);
      say(`Sidhi: ${draft.sidhiColor}; Ajna: ${draft.ajna}`);
    }
    return lines;
  }

  async postRolls(title, lines, hint) {
    try {
      await foundry.documents.ChatMessage.create({speaker: {alias: game.user.name},
        content: `<section class="r21-chat"><h3>Cultivator Discovery · ${escapeHTML(title)}</h3><ul class="r21-mods">${lines.map(text => `<li>${escapeHTML(text)}</li>`).join("")}</ul>${hint ? `<p class="hint">${escapeHTML(hint)}</p>` : ""}</section>`});
    } catch (error) { console.warn("10,000 Swords | The Discovery roll was not posted.", error); }
  }

  /** The dice on one step's page. `data-xp` makes the roll spend XP left on what that step buys. */
  static async rollStep(event, target) {
    const key = target.dataset.step, xp = target.dataset.xp === "1";
    if (this.locked || !ROLL_STEPS_21[key]) return;
    const lines = await this.rollPart(key, {xp: xp && !!ROLL_STEPS_21[key].xp});
    this.touch();
    await this.postRolls(`Rolled ${STEPS_21[key].replace(/^\d+ · /, "")}${xp ? " (spending XP)" : ""}`, lines);
    return this.render();
  }

  /**
   * Pure chaos: every step at random, in order. "Roll all (spend XP)" then spends the XP left at random across Core, Cultivation
   * and Sect Stars and extra Licenses; "Roll all (spend no XP)" leaves it all unspent. Attachments, the Sect story and notes are kept.
   */
  static async rollEverything(event, target) {
    if (this.locked) return;
    const xp = target?.dataset?.xp === "1";
    const ok = await foundry.applications.api.DialogV2.confirm({window: {title: "Pure chaos"},
      content: `<p>Roll <strong>everything</strong> at random: Class, Cores, Cultivations, Assets, Macca and Supply, Name, Culture, Alignment, Sect, Licenses, Sidhi color and Ajna?</p><p>${xp ? "The XP left is then <strong>spent at random</strong> on Core, Cultivation and Sect Stars and extra Licenses." : "<strong>No XP is spent</strong>; XP purchases made so far are cleared."}</p><p class="hint">This replaces what is in those steps now. The starting Sidhi, Attachments, the Sect story and your notes are kept; nothing is saved until you press Save to chat.</p>`, rejectClose: false});
    if (!ok) return;
    const lines = [];
    for (const key of Object.keys(ROLL_STEPS_21)) lines.push(...await this.rollPart(key));
    if (xp) {
      const bought = spendXpRandom21(this.draft, {licenses: (this.catalog ?? await discoveryCatalog21()).licenses, random: this.random ?? Math.random});
      if (bought.length) { const text = `XP spent: ${bought.join(", ")} (${xpBudget21(this.draft).left} XP left)`; lines.push(text); this.log(`Roll · ${text}`); }
    }
    this.touch();
    await this.postRolls(`Pure chaos${xp ? " (spending XP)" : ""}`, lines, "Rolled all at once. Attachments are still the player's to write.");
    this.step = "review";
    return this.render();
  }

  static async rollSubtype() {
    const info = CLASSES_21[this.draft.classKey];
    if (!info.subtypes.length) return;
    const roll = await dice("1d6", `${info.label} ${info.subtypeLabel.toLowerCase()} (d6)`);
    this.draft.subtype = subtypeFromRoll21(this.draft.classKey, roll.total);
    this.log(`${info.label} ${info.subtypeLabel.toLowerCase()} d6 = ${roll.total}: ${this.draft.subtype}`); this.touch();
    return this.render();
  }
  static clearCores() { for (const key of CORE_KEYS) this.draft.cores[key] = 0; this.touch(); return this.render(); }
  static clearCultivations() { this.draft.skills = {}; this.touch(); return this.render(); }

  static addAsset(event, target) {
    const key = target.closest("[data-asset-add]")?.querySelector("select")?.value;
    if (!ASSETS_21[key]?.code) return;
    this.draft.assets.push({key, stars: ASSETS_21[key].min, detail: ""}); this.touch();
    return this.render();
  }
  static async rollAsset() {
    const roll = await dice("2d6", "Asset (d66)"), code = roll.results.join("");
    const key = Object.keys(ASSETS_21).find(entry => ASSETS_21[entry].code === code);
    if (!key) return;
    this.draft.assets.push({key, stars: ASSETS_21[key].min, detail: ""});
    this.log(`Asset d66 = [${roll.results[0]}][${roll.results[1]}]: ${ASSETS_21[key].label}`); this.touch();
    return this.render();
  }
  static removeAsset(event, target) { this.draft.assets.splice(int(target.dataset.index), 1); this.touch(); return this.render(); }

  static async rollMacca() {
    const info = CLASSES_21[this.draft.classKey], roll = await dice("1d6", `Starting Macca (${macca(info.maccaPerD6)} × d6)`);
    this.draft.maccaD6 = roll.total;
    this.log(`Starting Macca ${macca(info.maccaPerD6)} × d6 (${roll.total}) = ${macca(startingMacca21(this.draft.classKey, roll.total))}`); this.touch();
    return this.render();
  }
  addSupplyRow(row, extra = {}) {
    const same = this.draft.supply.find(line => line.uuid === row.uuid && !!line.free === !!extra.free);
    if (same) same.qty = Math.min(99, same.qty + 1);
    else this.draft.supply.push({uuid: row.uuid, name: row.name, price: row.price, kg: row.kg, qty: 1, free: false, note: "", ...extra});
    this.touch();
  }
  static addSupply(event, target) {
    const row = this.catalog.shop.find(entry => entry.uuid === target.dataset.uuid);
    const before = carryCheck21(this.draft).tier;
    if (row) this.addSupplyRow(row);
    this.warnCarry(before);
    return this.render();
  }
  static removeSupply(event, target) { this.draft.supply.splice(int(target.dataset.index), 1); this.touch(); return this.render(); }
  /** "One item, randomly rolled" (p.44) names no table: one Common market entry is drawn, free, for the GM to confirm. */
  static async randomSupply() {
    const pool = this.catalog.shop.filter(row => row.rarity === "common");
    if (!pool.length) return ui.notifications.warn("No Common items were found in the 2.1 market catalogs.");
    const roll = await dice(`1d${pool.length}`, "Random Supply item"), row = pool[roll.total - 1], before = carryCheck21(this.draft).tier;
    this.addSupplyRow(row, {free: true, note: "Class Supply (random)"});
    this.warnCarry(before);
    this.log(`Random Supply item (1d${pool.length} = ${roll.total} of the Common market entries): ${row.name}`);
    return this.render();
  }
  static async inspect(event, target) {
    const doc = await foundry.utils.fromUuid(target.dataset.uuid);
    if (doc) doc.sheet.render({force: true}); else ui.notifications.warn("That entry is no longer in the compendium.");
  }

  static async rollSyllable() {
    const row = await dice("2d6", "Name syllable, row (2d6)"), column = await dice("2d6", "Name syllable, column (2d6)"), syllable = nameSyllable21(row.total, column.total);
    this.draft.name = nameFromSyllables21([this.draft.name, syllable]);
    this.log(`Name 2d6 twice (${row.total}, ${column.total}): ${syllable}`); this.touch();
    return this.render();
  }
  static async rollCulture() {
    const roll = await dice("2d6", "Culture (d66)"), code = roll.results.join(""), found = this.catalog.cultures.find(row => row.code === code);
    if (!found) return ui.notifications.warn(`No Culture is listed at [${roll.results[0]}][${roll.results[1]}].`);
    this.draft.culture = found.name;
    this.log(`Culture d66 = [${roll.results[0]}][${roll.results[1]}]: ${found.name}`); this.touch();
    return this.render();
  }
  static async rollAlignment() {
    const roll = await dice("2d6", "Alignment (2d6)");
    const found = this.catalog.alignments.find(row => { const [low, high = low] = row.roll.split("-").map(Number); return roll.total >= low && roll.total <= high; });
    if (!found) return ui.notifications.warn(`No Alignment is listed at ${roll.total}.`);
    this.draft.alignment = found.name;
    this.log(`Alignment 2d6 (${roll.results.join(", ")}) = ${roll.total}: ${found.name}`); this.touch();
    return this.render();
  }
  static addAttachment() { this.draft.attachments.push({text: "", strength: 1}); this.touch(); return this.render(); }
  static removeAttachment(event, target) { this.draft.attachments.splice(int(target.dataset.index), 1); this.touch(); return this.render(); }

  static toggleLicense(event, target) {
    const uuid = target.dataset.uuid, at = this.draft.licenses.findIndex(row => row.uuid === uuid);
    if (at >= 0) this.draft.licenses.splice(at, 1);
    else {
      const row = this.catalog.licenses.find(entry => entry.uuid === uuid), draft = this.draft;
      const held = row && (row.sect === draft.sect || draft.extraSects.some(extra => extra.sect === row.sect));
      if (!held || row.stars > sectStarsFor21(draft, row.sect)) return;
      // The two Sutra 7 Licenses of the first Sect are free. Every other License costs 10 XP (p.100) and needs an open Meridian.
      const xp = xpBudget21(draft), free = row.sect === draft.sect && freeLicenses21(draft) < START_LICENSES_21;
      if (!free && (xp.left < 10 || draft.licenses.length >= xp.meridians)) return ui.notifications.warn(xp.left < 10 ? "Another License costs 10 XP." : `Sidhi ${xp.sidhi} opens ${xp.meridians} Meridians.`);
      draft.licenses.push({uuid: row.uuid, name: row.name, stars: row.stars, cultivation: row.cultivation, sect: row.sect});
    }
    this.touch();
    return this.render();
  }

  /** Another Sect for XP: its Barang comes along (carried; the sheet keeps one ingested at a time) and its Cultivation starts at ✦. */
  static addSect(event, target) {
    const value = target.closest("[data-sect-add]")?.querySelector("select")?.value, row = this.catalog.sects.find(entry => entry.sect === value), draft = this.draft;
    if (!row || row.sect === draft.sect || draft.extraSects.some(extra => extra.sect === row.sect) || draft.extraSects.length >= MAX_EXTRA_SECTS_21) return;
    if (!xpBudget21(draft).start) return ui.notifications.warn("Another Sect is bought with XP; agree on starting XP in step 1 first.");
    draft.extraSects.push({sect: row.sect, cultivation: row.cultivation, barang: row.barang, stars: 1});
    this.log(`Another Sect: ${row.sect} (${row.cultivation} ✦, 3 XP)`); this.touch();
    return this.render();
  }
  static removeSect(event, target) {
    const [row] = this.draft.extraSects.splice(int(target.dataset.index), 1);
    if (row) this.draft.licenses = this.draft.licenses.filter(license => license.sect !== row.sect);
    this.touch();
    return this.render();
  }

  /** The chat card's data. The draft is kept as one JSON string so an update replaces it whole instead of merging into the old one. */
  cardData(extra = {}) {
    const draft = normalizeDraft21(this.draft), check = discoveryCheck21(draft);
    const flags = {draftJSON: JSON.stringify(draft), ownerId: this.ownerId, ownerName: this.ownerName, gmNote: this.gmNote, status: check.complete ? "ready" : "draft", savedBy: game.user.name, savedAt: Date.now(), actorUuid: "", actorName: "", ...extra};
    return {flags, content: discoveryCard21(draft, flags)};
  }

  async writeCard(extra = {}) {
    const {flags, content} = this.cardData(extra);
    const existing = this.messageId ? game.messages.get(this.messageId) : null;
    if (existing && (game.user.isGM || existing.isAuthor)) { await existing.update({content, [`flags.${SYSTEM}.${FLAG}`]: flags}); return existing; }
    const whisper = [...new Set([...game.users.filter(user => user.isGM).map(user => user.id), this.ownerId, game.user.id])];
    const message = await foundry.documents.ChatMessage.create({content, whisper, speaker: {alias: "Cultivator Discovery"}, flags: {[SYSTEM]: {[FLAG]: flags}}});
    this.messageId = message.id;
    return message;
  }

  static async save() {
    if (this.locked) return;
    await this.writeCard();
    this.dirty = false;
    ui.notifications.info(`${this.draft.name || "The Cultivator"} was saved to chat. The card is whispered to the GM and ${this.ownerName}.`);
    return this.render();
  }

  static async openActor() {
    const actor = this.actorUuid ? await foundry.utils.fromUuid(this.actorUuid) : null;
    if (actor) actor.sheet.render({force: true}); else ui.notifications.warn("That character is no longer in the Actors tab.");
  }

  /** GM only: turns the reviewed draft into an Actor owned by its player, then marks the card as created. */
  static async createActor() {
    if (!game.user.isGM) return ui.notifications.warn("Only a GM can create the character from a Discovery.");
    if (this.locked) return;
    const catalog = this.catalog ?? await discoveryCatalog21();
    const {draft, changed, missing} = await verifyDraft21(this.draft, catalog);
    this.draft = draft;
    if (changed.length) { this.touch(); await this.render(); }
    const check = discoveryCheck21(draft);
    const players = game.users.filter(user => !user.isGM);
    const problems = [...changed, ...missing.map(name => `${name} is no longer in the compendium and will be left out.`), ...SUTRA_KEYS_21.flatMap(key => check.issues[key].map(text => `${STEPS_21[key]}: ${text}`))];
    const input = await foundry.applications.api.DialogV2.prompt({window: {title: "Create character"},
      content: `<p>Create <strong>${escapeHTML(draft.name || "Unnamed Cultivator")}</strong> in the Actors tab?</p>
        <label>Owner <select name="owner"><option value="">No player owner</option>${players.map(user => `<option value="${user.id}" ${user.id === this.ownerId ? "selected" : ""}>${escapeHTML(user.name)}</option>`).join("")}</select></label>
        ${problems.length ? `<p><strong>Not complete yet:</strong></p><ul>${problems.map(text => `<li>${escapeHTML(text)}</li>`).join("")}</ul><p class="hint">Creating it now is the GM's call; the character can still be finished on its sheet.</p>` : `<p class="hint">All eight Sutras are performed.</p>`}`,
      ok: {label: problems.length ? "Create anyway" : "Create character", callback: (event, button) => ({owner: button.form.elements.owner.value})}, rejectClose: false});
    if (!input) return;
    const actor = await exportDiscovery21(draft, catalog, {ownerId: input.owner});
    if (input.owner) this.ownerId = input.owner;
    this.status = "created"; this.actorUuid = actor.uuid;
    await this.writeCard({status: "created", actorUuid: actor.uuid, actorName: actor.name});
    this.dirty = false;
    ui.notifications.info(`${actor.name} was created in the Actors tab.`);
    actor.sheet.render({force: true});
    return this.close({discard: true});
  }
}

/** Re-reads prices and License requirements from the compendia, so a card cannot carry figures the catalogs do not. */
export async function verifyDraft21(input, catalog) {
  const draft = normalizeDraft21(input), changed = [], missing = [];
  const shop = new Map(catalog.shop.map(row => [row.uuid, row])), licenses = new Map(catalog.licenses.map(row => [row.uuid, row]));
  for (const line of draft.supply) {
    const row = shop.get(line.uuid);
    if (!row) { missing.push(`${line.name} (not a 2.1 rulebook market item)`); continue; }
    line.kg = row.kg;
    if (row.price !== line.price) { changed.push(`${row.name} costs ${macca(row.price)} Macca in the catalog, not ${macca(line.price)}; the price was corrected.`); line.price = row.price; }
    line.name = row.name;
  }
  for (const line of draft.licenses) {
    const row = licenses.get(line.uuid);
    if (!row) { missing.push(line.name); continue; }
    if (row.stars !== line.stars || row.sect !== line.sect) changed.push(`${row.name} is a ${row.sect} License at ${stars21(row.stars)}; the entry was corrected.`);
    Object.assign(line, {name: row.name, stars: row.stars, sect: row.sect, cultivation: row.cultivation});
  }
  const sect = catalog.sects.find(row => row.sect === draft.sect);
  if (draft.sect && sect) Object.assign(draft, {cultivation: sect.cultivation, barang: sect.barang});
  for (const extra of draft.extraSects) { const row = catalog.sects.find(entry => entry.sect === extra.sect); if (row) Object.assign(extra, {cultivation: row.cultivation, barang: row.barang}); }
  return {draft, changed, missing};
}

/** Builds the Actor and its Items from a draft. Returns the new Actor. */
export async function exportDiscovery21(input, catalog, {ownerId = ""} = {}) {
  const draft = normalizeDraft21(input), info = CLASSES_21[draft.classKey];
  const copy = async (uuid, change = () => {}) => {
    const doc = uuid ? await foundry.utils.fromUuid(uuid) : null;
    if (!doc) return null;
    const data = game.items.fromCompendium(doc, {clearFolder: true});
    delete data._id;
    change(data, doc);
    return data;
  };
  const items = [];
  const add = async (uuid, change) => { const data = await copy(uuid, change); if (data) items.push(data); };
  await add(catalog.sects.find(row => row.sect === draft.sect)?.uuid, data => { data.system.ingested = true; });
  // A Sect bought with XP brings its Barang, carried: the sheet keeps one Barang ingested at a time, and Licenses learned stay (p.236).
  for (const extra of draft.extraSects) if (extra.sect !== draft.sect) await add(catalog.sects.find(row => row.sect === extra.sect)?.uuid, data => { data.system.ingested = false; });
  await add(catalog.classes[info.label], data => { if (draft.subtype) foundry.utils.setProperty(data, `flags.${SYSTEM}.class21.subtype`, draft.subtype); });
  await add(catalog.cultures.find(row => row.name === draft.culture)?.uuid);
  await add(catalog.alignments.find(row => row.name === draft.alignment)?.uuid);
  for (const row of draft.assets) await add(catalog.assets[row.key], data => { data.system.stars = row.stars; data.system.detail = row.detail; });
  const grants = new Map(catalog.licenses.map(row => [row.uuid, row.grants ?? []]));
  for (const row of draft.licenses) { await add(row.uuid); for (const gear of grants.get(row.uuid) ?? []) await add(gear.uuid); }
  // Ammunition weighs per stack on the sheet, so each magazine or quiver bought stays its own Item; everything else stacks.
  for (const row of draft.supply) {
    const first = await copy(row.uuid);
    if (!first) continue;
    if (first.type === "ammunition") for (let n = 0; n < row.qty; n++) items.push(foundry.utils.deepClone(first));
    else { first.system.quantity = Math.max(1, int(first.system.quantity) || 1) * row.qty; items.push(first); }
  }
  const ownership = {default: 0};
  if (ownerId && game.users.get(ownerId)) ownership[ownerId] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
  const actor = await getDocumentClass("Actor").create({name: draft.name || "Unnamed Cultivator", type: "wanderer", system: actorSystem21(draft), ownership});
  if (items.length) await actor.createEmbeddedDocuments("Item", items);
  // A new Cultivator starts with full Morale.
  await actor.update({"system.morale.value": derive21(actor.system, actor.items.contents).moraleMax});
  return actor;
}

const open = new Map();
/** Opens the tool: a blank Discovery, or the draft saved on a chat card. */
export function openDiscovery21({message = null} = {}) {
  if (!usesRules21()) return ui.notifications.warn("Cultivator Discovery follows the 2.1 rules. A GM can switch this world to Rules 2.1 in the system settings.");
  if (message) {
    const flags = discoveryFlags(message);
    if (!flags) return ui.notifications.warn("That card holds no Discovery.");
    if (!canOpenDiscovery21(game.user, flags.ownerId, message.author?.id)) return ui.notifications.warn("Only the player who saved this Discovery, or a GM, can open it.");
    const existing = open.get(message.id);
    if (existing?.rendered) return existing.render({force: true});
  }
  const app = new Discovery21({message});
  if (message) open.set(message.id, app);
  return app.render({force: true});
}

export function registerDiscovery21() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const flags = discoveryFlags(message);
    if (!flags) return;
    const allowed = canOpenDiscovery21(game.user, flags.ownerId, message.author?.id);
    for (const button of html.querySelectorAll("[data-discovery21]")) {
      if (!allowed) { button.remove(); continue; }
      button.addEventListener("click", async event => {
        event.preventDefault();
        try {
          if (button.dataset.discovery21 === "sheet") {
            const actor = flags.actorUuid ? await foundry.utils.fromUuid(flags.actorUuid) : null;
            if (actor) actor.sheet.render({force: true}); else ui.notifications.warn("That character is no longer in the Actors tab.");
          } else await openDiscovery21({message});
        } catch (error) { ui.notifications.error(error.message); }
      });
    }
  });
}
