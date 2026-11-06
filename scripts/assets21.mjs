// Rules 2.1 Assets and Barang as Items (2026-11 test run). Assets: Alpha pp.44–48; Barang: Alpha pp.50–51 and the playtest Sects.
import {ASSETS_21, advancementCost, sectCultivationNames21} from "./rules21.mjs?v=0.2.14";
import {escapeHTML} from "./resolution.mjs?v=0.2.14";

const SYSTEM = "10kswordsfoundry";
const int = value => Math.trunc(Number(value) || 0);
const norm = value => String(value ?? "").toLowerCase().replace(/[^a-z]/g, "");

/** Item data for an Asset row from the older 2.1 Asset list. */
export function assetItemData(row) {
  const info = ASSETS_21[row?.key] ?? ASSETS_21.custom;
  const label = row?.key === "custom" || !ASSETS_21[row?.key] ? (row?.name || "Asset") : info.label;
  return {name: label, type: "asset", img: "systems/10kswordsfoundry/assets/icons/asset.svg",
    system: {key: ASSETS_21[row?.key] ? row.key : "custom", stars: Math.max(0, Math.min(5, int(row?.stars))), detail: row?.key === "custom" ? "" : String(row?.name ?? ""),
      description: row?.notes ? `<p>${escapeHTML(row.notes)}</p>` : "", source: info.page ? `Rules 2.1 (2.1 Alpha), p.${info.page}` : "", tags: "2.1, Asset"}};
}

/** Sheet rows for Asset items, with the XP cost of the next Star (4 × new Star, RK p.3). */
export function assetRows21(actor) {
  return (actor.items?.contents ?? []).filter(item => item.type === "asset").toSorted((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).map(item => {
    const info = ASSETS_21[item.system.key] ?? ASSETS_21.custom, stars = int(item.system.stars);
    const max = info.max || 5, min = info.min || 0;
    return {id: item.id, name: item.name, detail: item.system.detail, stars, starText: "✦".repeat(stars), code: info.code, page: info.page,
      range: info.code ? `${"✦".repeat(Math.max(1, min))}${max > min ? `–${"✦".repeat(max)}` : ""}` : "", canRaise: stars < max, cost: stars < max ? advancementCost("asset", stars).xp : null};
  });
}

/** Sheet rows for Barang items. */
export function barangRows21(actor) {
  return (actor.items?.contents ?? []).filter(item => item.type === "barang").toSorted((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map(item => ({id: item.id, name: item.name, sect: item.system.sect, cultivation: item.system.cultivation, weapons: item.system.weapons, ingested: !!item.system.ingested}));
}

/** Raises an Asset by one Star for 4 × the new Star in XP. */
export async function raiseAsset21(actor, item) {
  if (item?.type !== "asset") throw new Error("Choose an Asset.");
  const info = ASSETS_21[item.system.key] ?? ASSETS_21.custom, stars = int(item.system.stars), max = info.max || 5;
  if (stars >= max) throw new Error(`${item.name} cannot go above ${max} Stars.`);
  const {next, xp} = advancementCost("asset", stars), have = int(actor.toObject().system.xp);
  if (have < xp) throw new Error(`${item.name} ${"✦".repeat(next)} costs ${xp} XP; you have ${have}.`);
  const ok = await foundry.applications.api.DialogV2.confirm({window: {title: "Sidhi Progression"},
    content: `<p>Spend <strong>${xp} XP</strong> to raise ${escapeHTML(item.name)} to ${"✦".repeat(next)}?</p><p class="hint">Gaining an Asset must make sense in the fiction and costs 4 × the new Asset rating in XP (Alpha p.5).</p>`, rejectClose: false});
  if (!ok) return null;
  await actor.update({"system.xp": have - xp});
  return actor.updateEmbeddedDocuments("Item", [{_id: item.id, "system.stars": next}]);
}

/** Ingests a Barang: it becomes the heart of the Cultivation Womb. One Barang at a time; ejecting keeps what was Cultivated (RK p.52). */
export async function ingestBarang21(actor, item) {
  if (item?.type !== "barang") throw new Error("Choose a Barang.");
  const others = (actor.items?.contents ?? []).filter(entry => entry.type === "barang" && entry.id !== item.id && entry.system.ingested);
  const source = actor.toObject().system, esoteric = source.esoteric ?? [];
  const names = new Set(sectCultivationNames21(item.system.cultivation).map(norm));
  const known = esoteric.some(entry => names.has(norm(entry.name)));
  const input = await foundry.applications.api.DialogV2.prompt({window: {title: `Ingest ${item.name}`},
    content: `<p>Ingest <strong>${escapeHTML(item.name)}</strong>${item.system.sect ? ` (${escapeHTML(item.system.sect)})` : ""}?</p>
      ${others.length ? `<p class="hint">This ejects ${others.map(entry => escapeHTML(entry.name)).join(", ")}. Magicks and Technicks already Cultivated stay with you (Alpha p.51).</p>` : ""}
      ${item.system.cultivation && !known ? `<label><input type="checkbox" name="grant" checked> Add ${escapeHTML(item.system.cultivation)} at ✦✦ to Esoteric Cultivations (Wanderer Discovery, Alpha p.5)</label>` : ""}`,
    ok: {label: "Ingest", callback: (event, button) => ({grant: !!button.form.elements.namedItem?.("grant")?.checked})}, rejectClose: false});
  if (!input) return null;
  if (input.grant) await actor.update({"system.esoteric": [...esoteric, {name: item.system.cultivation, value: 2, core: "spi"}]});
  await actor.updateEmbeddedDocuments("Item", [...others.map(entry => ({_id: entry.id, "system.ingested": false})), {_id: item.id, "system.ingested": true}]);
  return foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}),
    content: `<section class="r21-chat"><p><strong>${escapeHTML(actor.name)}</strong> ingests the Barang <strong>${escapeHTML(item.name)}</strong>${item.system.cultivation ? `, Cultivating ${escapeHTML(item.system.cultivation)}` : ""}.</p></section>`});
}

/** Ejects a Barang. The Cultivator keeps every Magick, Technick and License already Cultivated (RK p.52). */
export async function ejectBarang21(actor, item) {
  if (item?.type !== "barang" || !item.system.ingested) throw new Error("That Barang is not ingested.");
  const ok = await foundry.applications.api.DialogV2.confirm({window: {title: `Eject ${item.name}`},
    content: `<p>Eject ${escapeHTML(item.name)}? It burrows out or is vomited up and becomes inert. What you have Cultivated stays with you (Alpha p.51).</p>`, rejectClose: false});
  if (!ok) return null;
  return actor.updateEmbeddedDocuments("Item", [{_id: item.id, "system.ingested": false}]);
}

/**
 * Alpha p.5: attaining a new Sect License needs the appropriate Barang to be ingested. Returns a warning for a Sect
 * Technick or Magick added to a character with no matching ingested Barang, or "" when it is fine or not a Sect ability.
 */
export function licenseBarangWarning21(actor, item) {
  if (!["technique", "magick"].includes(item?.type) || actor?.type !== "character") return "";
  const sect21 = item.flags?.[SYSTEM]?.sect21;
  if (!sect21?.cultivation) return "";
  const names = new Set(sectCultivationNames21(sect21.cultivation).map(norm));
  const sect = norm(item.system?.sect);
  const ingested = (actor.items?.contents ?? []).filter(entry => entry.type === "barang" && entry.system.ingested);
  if (ingested.some(entry => names.has(norm(entry.system.cultivation)) || (sect && norm(entry.system.sect) === sect))) return "";
  return `${item.name}: a new ${sect21.cultivation} License needs the ${item.system?.sect || "Sect"}'s Barang ingested (Alpha p.5). Licenses already Cultivated stay usable.`;
}

/** One-time world migration: rows of the older 2.1 Asset list become Asset items. Only the active GM runs it. */
export async function migrateAssets21() {
  if (!game.user?.isActiveGM) return;
  const actors = [...game.actors];
  for (const scene of game.scenes ?? []) for (const token of scene.tokens ?? []) if (!token.actorLink && token.actor) actors.push(token.actor);
  let moved = 0;
  for (const actor of actors) {
    const rows = actor.toObject().system.assets ?? [];
    if (!rows.length) continue;
    await actor.createEmbeddedDocuments("Item", rows.map(assetItemData));
    await actor.update({"system.assets": []});
    moved += rows.length;
  }
  if (moved) ui.notifications.info(`10,000 Swords: moved ${moved} Asset row(s) to Asset items.`);
}

export {SYSTEM as ASSET_SYSTEM};
