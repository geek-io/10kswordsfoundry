// Rules 2.1 Cultivator Discovery options: Classes (2.1 rulebook pp.44-48), Alignments, Cultures, Truths and Perversions (earlier book pp.50-65, 70-71, 312-345).
// A Class is stored as a Job item flagged class21; it records the Class and its allotments and never touches Cultivations.
import {escapeHTML} from "./resolution.mjs?v=0.2.45";

const SYSTEM = "10kswordsfoundry";
const int = value => Number.isSafeInteger(Number(value)) ? Number(value) : 0;
export const class21 = item => item?.flags?.[SYSTEM]?.class21 ?? null;
export const option21 = item => item?.flags?.[SYSTEM]?.option21 ?? null;
export const OPTION_LABELS_21 = Object.freeze({alignment: "Alignment", culture: "Culture", truth: "Truth", perversion: "Perversion"});

/** Summary lines for a Class's allotments (2.1 rulebook pp.44-48). */
export function classSummary21(data) {
  const stars = n => "✦".repeat(Math.max(0, int(n)));
  const cults = Object.entries(data?.cultivations ?? {}).toSorted((a, b) => Number(b[0]) - Number(a[0])).map(([rating, count]) => `${stars(rating)} × ${int(count)}`);
  return {cores: (data?.cores ?? []).map(stars).join(", "), cultivations: cults.join(", "), assets: stars(data?.assets), gear: String(data?.gear ?? ""), magPerD6: int(data?.magPerD6)};
}

/** Starting ♄ for a Class: its multiplier × one d6. */
export const startingMag21 = (data, d6) => Math.max(0, int(data?.magPerD6)) * Math.max(1, Math.min(6, int(d6)));

/** Replace the character's 2.1 Class with this one. A 2.0.3 Job on the same character is left alone. */
export async function applyClass21(actor, item) {
  if (!actor.isOwner) throw new Error("You cannot change this character's Class.");
  const info = class21(item);
  if (!info) throw new Error("Expected a 2.1 Class.");
  const data = item.inCompendium ? game.items.fromCompendium(item, {clearFolder: true}) : item.toObject();
  delete data._id; delete data.folder;
  const old = actor.items.filter(owned => owned.type === "job" && class21(owned)).map(owned => owned.id);
  if (old.length) await actor.deleteEmbeddedDocuments("Item", old);
  const [created] = await actor.createEmbeddedDocuments("Item", [data]);
  const summary = classSummary21(info);
  const roll = await new foundry.dice.Roll("1d6").evaluate();
  const mag = startingMag21(info, roll.total);
  await foundry.documents.ChatMessage.create({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), rolls: [roll],
    content: `<section class="r21-chat"><h3>Class · ${escapeHTML(item.name)}</h3>
      <ul class="r21-mods"><li><strong>Cores:</strong> ${summary.cores}</li><li><strong>Cultivations:</strong> ${summary.cultivations}</li>
      <li><strong>Assets:</strong> ${summary.assets} to buy</li>${summary.gear ? `<li><strong>Supply:</strong> ${escapeHTML(summary.gear)}</li>` : ""}
      <li><strong>Starting ♄:</strong> ${summary.magPerD6.toLocaleString()} × d6 (${roll.total}) = <strong>${mag.toLocaleString()} mag</strong></li></ul>
      <p class="hint">Assign the Stars and add the Assets, gear and ♄ on the sheet; nothing was changed automatically.</p></section>`});
  return created;
}

/** After a Discovery option lands on a 2.1 character, mirror Culture and Alignment into the sheet's fields. */
export async function recordOption21(actor, item) {
  const kind = option21(item)?.kind;
  if (kind === "culture") await actor.update({"system.culture": item.name});
  else if (kind === "alignment") await actor.update({"system.alignment": item.name});
}
