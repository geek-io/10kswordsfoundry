// Rules 2.1 Cultivator Discovery tool (2.1 rulebook p.42): the eight Sutras in one window, opened from the Actors tab.
// Nothing is written to the world while a draft is being worked on. "Save to chat" puts the draft on a whispered chat
// card; the player who saved it and any GM can reopen it from there, and a GM turns the finished draft into an Actor.
import {CORES, CORE_KEYS, CULTIVATIONS_21, CULTIVATION_KEYS_21, ASSETS_21, ATTACHMENT_STRENGTHS, PARTS, PART_KEYS, derive21} from "./rules21.mjs?v=0.2.45";
import {CLASSES_21, CLASS_KEYS_21, STEPS_21, SUTRA_KEYS_21, SECT_START_STARS_21, START_LICENSES_21, stars21, rollLabel21, classFromRoll21, subtypeFromRoll21, startingMacca21,
  nameSyllable21, nameFromSyllables21, emptyDraft21, normalizeDraft21, corePool21, cultivationPool21, assetBudget21, supplyBudget21, discoveryCheck21, actorSystem21,
  discoveryCard21, canOpenDiscovery21, carryCheck21, coreChoices21, cultivationChoices21, AJNA_FORMS_21, SIDHI_COLORS_21, shuffle21, randomCores21, randomCultivations21} from "./discovery-rules21.mjs?v=0.2.45";
import {usesRules21} from "./rules-version.mjs?v=0.2.45";
import {escapeHTML} from "./resolution.mjs?v=0.2.45";

const SYSTEM = "10kswordsfoundry";
const FLAG = "discovery21";
const SHOP_PACKS = ["weapons-21", "armor-21", "consumables-21", "accessories-21", "ammunition-21", "goods-21"];
const SHOP_LIMIT = 80;
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
    const licenses = (await index("sects-21", ["system.sect", "system.description", `flags.${SYSTEM}.sect21`])).map(entry => ({uuid: entry.uuid, name: entry.name, type: entry.type, description: html(entry), sect: entry.system?.sect ?? "", cultivation: flag(entry).sect21?.cultivation ?? "", stars: int(flag(entry).sect21?.stars)}))
      .toSorted((a, b) => a.stars - b.stars || byName(a, b));
    const shop = [];
    for (const name of SHOP_PACKS) for (const entry of await index(name, ["system.magCost", "system.rarity", "system.quantity", "system.description", "system.r21.weight", "system.r21.coverage"])) {
      const coverage = Object.fromEntries(PART_KEYS.map(key => [key, Math.max(0, int(entry.system?.r21?.coverage?.[key]))]));
      // Weight of one purchase: ammunition weighs per stack, everything else per piece (as the sheet counts it).
      const kg = Math.round(Math.max(0, Number(entry.system?.r21?.weight) || 0) * (entry.type === "ammunition" ? 1 : Math.max(1, int(entry.system?.quantity) || 1)) * 100) / 100;
      shop.push({uuid: entry.uuid, name: entry.name, type: entry.type, price: Math.max(0, int(entry.system?.magCost)), rarity: entry.system?.rarity ?? "", pack: name, kg, coverage, description: html(entry),
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
    this.step = "class";
    this.dirty = false;
    this.shop = {query: "", pack: "", part: "", affordable: false};
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
    if (step === "class") {
      context.classes = CLASS_KEYS_21.map(key => { const row = CLASSES_21[key]; return {key, label: row.label, roll: rollLabel21(row.roll), selected: key === draft.classKey, cores: row.cores.map(stars21).join(", "),
        cultivations: Object.entries(row.cultivations).toSorted((a, b) => b[0] - a[0]).map(([rating, count]) => `${stars21(rating)} × ${count}`).join(", "), assets: stars21(row.assets), macca: `${macca(row.maccaPerD6)} × d6`, supply: row.supply, page: row.page}; });
      context.subtypes = info.subtypes.length ? {label: info.subtypeLabel, options: [option("", "—", draft.subtype), ...info.subtypes.map(entry => option(entry.label, `${rollLabel21(entry.roll)} · ${entry.label}`, draft.subtype))]} : null;
    }
    if (step === "cores") {
      const pool = corePool21(draft);
      // Only the Star values still unassigned are offered (plus the Core's own current value).
      context.coreRows = CORE_KEYS.map(key => ({key, label: CORES[key].label, abbr: CORES[key].abbr, text: CORES[key].text, options: [option(0, "—", draft.cores[key]), ...coreChoices21(draft, key).map(value => option(value, stars21(value), draft.cores[key]))]}));
      context.corePool = info.cores.map(stars21).join(", ");
      context.coreLeft = [...pool.remaining].toSorted((a, b) => b[0] - a[0]).flatMap(([rating, count]) => Array(count).fill(stars21(rating))).join(", ");
    }
    if (step === "cultivations") {
      context.cultivationRows = CULTIVATION_KEYS_21.map(key => ({key, label: CULTIVATIONS_21[key].label, text: CULTIVATIONS_21[key].text, core: CORES[CULTIVATIONS_21[key].core].abbr, rated: int(draft.skills[key]) > 0,
        options: [option(0, "—", int(draft.skills[key])), ...cultivationChoices21(draft, key).map(value => option(value, stars21(value), int(draft.skills[key])))]}));
      context.cultivationPool = cultivationPool21(draft).rows.map(row => ({stars: stars21(row.rating), have: row.have, want: row.want, done: row.have === row.want}));
    }
    if (step === "assets") {
      const budget = assetBudget21(draft);
      context.assetBudget = {...budget, stars: stars21(budget.budget), over: budget.left < 0};
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
        covers: info21.get(row.uuid)?.covers ?? "", description: info21.get(row.uuid)?.description ?? ""}));
      context.carry = carryCheck21(draft);
      const rows = catalog.shop.filter(row => (!query || row.name.toLowerCase().includes(query)) && (!this.shop.pack || row.pack === this.shop.pack) && (!this.shop.part || row.coverage[this.shop.part] > 0) && (!this.shop.affordable || row.price <= Math.max(0, budget.left)));
      context.shop = {...this.shop, count: rows.length, shown: Math.min(rows.length, SHOP_LIMIT), rows: rows.slice(0, SHOP_LIMIT).map(row => ({...row, priceText: macca(row.price), kgText: row.kg ? `${row.kg} kg` : "—", typeLabel: game.i18n.localize(`TYPES.Item.${row.type}`), dear: row.price > Math.max(0, budget.left)})),
        parts: [option("", "Covers any Part", this.shop.part), ...PART_KEYS.map(key => option(key, `Covers ${PARTS[key].label}`, this.shop.part))],
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
      const chosen = new Set(draft.licenses.map(row => row.uuid)), mine = catalog.licenses.filter(row => row.sect === draft.sect);
      context.sect = draft.sect ? {name: draft.sect, cultivation: draft.cultivation, barang: draft.barang, stars: stars21(SECT_START_STARS_21), want: START_LICENSES_21, have: draft.licenses.length, later: mine.filter(row => row.stars > SECT_START_STARS_21).length} : null;
      context.licenseRows = mine.filter(row => row.stars <= SECT_START_STARS_21).map(row => ({...row, starText: stars21(row.stars), typeLabel: row.type === "magick" ? "Magick" : "Technick", chosen: chosen.has(row.uuid), full: !chosen.has(row.uuid) && draft.licenses.length >= START_LICENSES_21}));
    }
    if (step === "review") {
      const supply = supplyBudget21(draft);
      context.review = {
        sutras: SUTRA_KEYS_21.map(key => ({label: STEPS_21[key], key, issues: check.issues[key], notes: check.notes[key], done: !check.issues[key].length})),
        complete: check.complete, todo: `${check.count} thing${check.count === 1 ? "" : "s"} still to do.`,
        cores: CORE_KEYS.map(key => `${CORES[key].abbr} ${stars21(draft.cores[key]) || "—"}`).join(" · "),
        cultivations: CULTIVATION_KEYS_21.filter(key => int(draft.skills[key]) > 0).toSorted((a, b) => draft.skills[b] - draft.skills[a]).map(key => `${CULTIVATIONS_21[key].label} ${stars21(draft.skills[key])}`).join(", "),
        assets: draft.assets.map(row => `${ASSETS_21[row.key].label} ${stars21(row.stars)}${row.detail ? ` (${row.detail})` : ""}`).join(", "),
        supply: draft.supply.map(row => `${row.qty > 1 ? `${row.qty} × ` : ""}${row.name}${row.free ? " (free)" : ""}`).join(", "),
        macca: draft.maccaD6 ? `${macca(supply.total)} starting, ${macca(supply.spent)} spent, ${macca(Math.max(0, supply.left))} carried` : "",
        attachments: draft.attachments.filter(row => row.text.trim()).map(row => ({text: row.text, strength: ATTACHMENT_STRENGTHS[row.strength]})),
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
      Object.assign(this.draft, {sect: row?.sect ?? "", cultivation: row?.cultivation ?? "", barang: row?.barang ?? "", licenses: []});
      return;
    }
    if (path === "cultureCustom") { this.draft.culture = String(value); return; }
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

  static goto(event, target) { this.step = STEPS_21[target.dataset.step] ? target.dataset.step : "class"; return this.render(); }

  static async rollClass() {
    const roll = await dice("3d6", "Class (3d6)"), key = classFromRoll21(roll.total);
    this.log(`Class 3d6 (${roll.results.join(", ")}) = ${roll.total}: ${CLASSES_21[key].label}`);
    this.setField("classKey", key); this.touch();
    return this.render();
  }
  /**
   * Pure chaos: every Sutra at random. The book's own dice are rolled where it gives a table (3d6 Class, d6 sub-table,
   * d6 Macca, 2d6 twice per syllable, d66 Culture, 2d6 Alignment, d66 Assets); the rest is drawn evenly. Attachments,
   * the Sect story and notes are left for the player. One chat message lists the outcome.
   */
  static async rollEverything() {
    if (this.locked) return;
    const ok = await foundry.applications.api.DialogV2.confirm({window: {title: "Pure chaos"},
      content: "<p>Roll <strong>everything</strong> at random: Class, Cores, Cultivations, Assets, Macca and Supply, Name, Culture, Alignment, Sect, Licenses, Sidhi color and Ajna?</p><p class=\"hint\">This replaces what is in those steps now. Attachments, the Sect story and your notes are kept; nothing is saved until you press Save to chat.</p>", rejectClose: false});
    if (!ok) return;
    const catalog = this.catalog ?? await discoveryCatalog21(), random = this.random ?? Math.random, draft = this.draft, lines = [];
    const pick = list => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
    const say = text => { lines.push(text); this.log(`Chaos · ${text}`); };

    const classRoll = await dice("3d6");
    draft.classKey = classFromRoll21(classRoll.total);
    const info = CLASSES_21[draft.classKey];
    draft.subtype = "";
    if (info.subtypes.length) { const roll = await dice("1d6"); draft.subtype = subtypeFromRoll21(draft.classKey, roll.total); }
    say(`Class 3d6 (${classRoll.results.join(", ")}) = ${classRoll.total}: ${info.label}${draft.subtype ? ` — ${draft.subtype}` : ""}`);

    draft.cores = randomCores21(draft.classKey, random);
    say(`Cores: ${CORE_KEYS.map(key => `${CORES[key].abbr} ${stars21(draft.cores[key])}`).join(" · ")}`);
    draft.skills = randomCultivations21(draft.classKey, random);
    say(`Cultivations: ${Object.keys(draft.skills).map(key => `${CULTIVATIONS_21[key].label} ${stars21(draft.skills[key])}`).join(", ")}`);

    draft.assets = [];
    let stars = info.assets;
    for (let tries = 0; stars > 0 && tries < 40; tries++) {
      const roll = await dice("2d6"), key = Object.keys(ASSETS_21).find(entry => ASSETS_21[entry].code === roll.results.join(""));
      if (!key || ASSETS_21[key].min > stars || draft.assets.some(row => row.key === key)) continue;
      const top = Math.min(ASSETS_21[key].max, stars), bought = ASSETS_21[key].min + Math.min(top - ASSETS_21[key].min, Math.floor(random() * (top - ASSETS_21[key].min + 1)));
      draft.assets.push({key, stars: bought, detail: ""});
      stars -= bought;
    }
    say(`Assets: ${draft.assets.map(row => `${ASSETS_21[row.key].label} ${stars21(row.stars)}`).join(", ") || "none"}`);

    const maccaRoll = await dice("1d6");
    draft.maccaD6 = maccaRoll.total;
    draft.supply = [];
    const common = catalog.shop.filter(row => row.rarity === "common");
    if (info.supply && common.length) this.addSupplyRow(pick(common), {free: true, note: "Class Supply (random)"});
    let left = startingMacca21(draft.classKey, draft.maccaD6);
    for (let bought = 0; bought < 8; bought++) {
      const afford = catalog.shop.filter(row => row.price > 0 && row.price <= left);
      if (!afford.length) break;
      const row = pick(afford);
      this.addSupplyRow(row);
      left -= row.price;
    }
    say(`Macca ${macca(info.maccaPerD6)} × d6 (${maccaRoll.total}) = ${macca(startingMacca21(draft.classKey, draft.maccaD6))}; Supply: ${draft.supply.map(row => `${row.qty > 1 ? `${row.qty} × ` : ""}${row.name}${row.free ? " (free)" : ""}`).join(", ") || "nothing"}; ${macca(left)} left`);
    const carry = carryCheck21(draft);
    if (carry.over) say(carry.text);

    const syllables = [];
    for (let n = 1 + Math.floor(random() * 4); n > 0; n--) { const row = await dice("2d6"), column = await dice("2d6"); syllables.push(nameSyllable21(row.total, column.total)); }
    draft.name = nameFromSyllables21(syllables);
    say(`Name: ${draft.name} (${syllables.join(" + ")})`);
    const cultureRoll = await dice("2d6"), culture = catalog.cultures.find(row => row.code === cultureRoll.results.join("")) ?? pick(catalog.cultures);
    if (culture) { draft.culture = culture.name; say(`Culture d66 [${cultureRoll.results[0]}][${cultureRoll.results[1]}]: ${culture.name}`); }
    const alignRoll = await dice("2d6");
    const alignment = catalog.alignments.find(row => { const [low, high = low] = row.roll.split("-").map(Number); return alignRoll.total >= low && alignRoll.total <= high; }) ?? pick(catalog.alignments);
    if (alignment) { draft.alignment = alignment.name; say(`Alignment 2d6 = ${alignRoll.total}: ${alignment.name}`); }

    if (catalog.sects.length) {
      const sect = pick(catalog.sects);
      Object.assign(draft, {sect: sect.sect, cultivation: sect.cultivation, barang: sect.barang});
      draft.licenses = shuffle21(catalog.licenses.filter(row => row.sect === sect.sect && row.stars <= SECT_START_STARS_21), random).slice(0, START_LICENSES_21)
        .map(row => ({uuid: row.uuid, name: row.name, stars: row.stars, cultivation: row.cultivation, sect: row.sect}));
      say(`Sect: ${sect.sect} (${sect.cultivation} ${stars21(SECT_START_STARS_21)}, ${sect.barang}); Licenses: ${draft.licenses.map(row => row.name).join(", ") || "none"}`);
    }
    draft.sidhiColor = pick(SIDHI_COLORS_21);
    draft.ajna = pick(AJNA_FORMS_21);
    say(`Sidhi: ${draft.sidhiColor}; Ajna: ${draft.ajna}`);

    this.touch();
    if (carry.over) ui.notifications.warn(`Over Carry. ${carry.text}`);
    try {
      await foundry.documents.ChatMessage.create({speaker: {alias: game.user.name},
        content: `<section class="r21-chat"><h3>Cultivator Discovery · Pure chaos</h3><ul class="r21-mods">${lines.map(text => `<li>${escapeHTML(text)}</li>`).join("")}</ul><p class="hint">Rolled all at once. Attachments are still the player's to write.</p></section>`});
    } catch (error) { console.warn("10,000 Swords | The chaos roll was not posted.", error); }
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
      const row = this.catalog.licenses.find(entry => entry.uuid === uuid);
      if (!row || row.sect !== this.draft.sect || row.stars > SECT_START_STARS_21 || this.draft.licenses.length >= START_LICENSES_21) return;
      this.draft.licenses.push({uuid: row.uuid, name: row.name, stars: row.stars, cultivation: row.cultivation, sect: row.sect});
    }
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
    if (!row) { missing.push(line.name); continue; }
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
  await add(catalog.classes[info.label], data => { if (draft.subtype) foundry.utils.setProperty(data, `flags.${SYSTEM}.class21.subtype`, draft.subtype); });
  await add(catalog.cultures.find(row => row.name === draft.culture)?.uuid);
  await add(catalog.alignments.find(row => row.name === draft.alignment)?.uuid);
  for (const row of draft.assets) await add(catalog.assets[row.key], data => { data.system.stars = row.stars; data.system.detail = row.detail; });
  for (const row of draft.licenses) await add(row.uuid);
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
