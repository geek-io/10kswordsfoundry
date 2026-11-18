// Build data/bestiary-21.json: the Bestiary of the final 2.1 rulebook (423 pages), pp.346-373, as World Being actors.
// The pages are read with the system's own column reader and 2.1 stat-block importer, so the compendium holds exactly
// what importing those pages in Foundry gives. Licenses, weapons and armor named in a block are matched to the 2.1 catalogs.
// Usage: node tools/worldbeings21/gen_bestiary.mjs <rulebook.pdf> [first-last]     (needs poppler's pdftotext)
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {pdfColumnText} from '../../scripts/pdf-reader.mjs';
import {parseWorldBeings21, isWorldBeing21} from '../../scripts/worldbeing-import21.mjs';
import {defaultItemIcon} from '../../scripts/item-icons.mjs';

const [pdf, range = '346-373'] = process.argv.slice(2);
if (!pdf) throw new Error('Usage: node tools/worldbeings21/gen_bestiary.mjs <rulebook.pdf> [first-last]');
const [first, last] = range.split('-').map(Number);
const uid = (...parts) => createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 16);
const un = s => s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Poppler word boxes as pdf.js-style text items, for the column reader. */
function pageText(n) {
  const html = execFileSync('pdftotext', ['-f', String(n), '-l', String(n), '-bbox-layout', pdf, '-'], {encoding: 'utf8', maxBuffer: 1e8});
  const page = html.match(/<page width="([\d.]+)" height="([\d.]+)"/), width = Number(page[1]), height = Number(page[2]), items = [];
  for (const line of html.matchAll(/<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([\s\S]*?)<\/line>/g))
    for (const w of line[5].matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([\s\S]*?)<\/word>/g))
      items.push({str: un(w[5]), transform: [1, 0, 0, 1, Number(w[1]), height - Number(line[4])], width: Number(w[3]) - Number(w[1]), height: (Number(line[4]) - Number(line[2])) * 0.8});
  return pdfColumnText(items, width);
}

// Catalog items the stat blocks may name. Same order of preference as in Foundry: packs by collection name.
const manifest = JSON.parse(readFileSync('system.json', 'utf8'));
const candidates = [];
for (const pack of manifest.packs.filter(p => p.type === 'Item' && p.name.endsWith('-21')).sort((a, b) => a.name.localeCompare(b.name)))
  for (const item of JSON.parse(readFileSync(`data/${pack.name}.json`, 'utf8')).items)
    candidates.push({...item, type: item.type === 'armor' ? 'fashion' : item.type, _importUuid: `Compendium.10kswordsfoundry.${pack.name}.Item.${item._id}`, importPriority: 1, importSource: pack.label});

const folder = {_id: uid('folder', 'bestiary-21', 'Bestiary'), name: 'Bestiary', folder: null, type: 'Actor', sorting: 'a', sort: 0, color: null};
const actors = [], seen = new Set(), report = [];
for (let n = first; n <= last; n++) {
  const text = pageText(n);
  if (!isWorldBeing21(text)) continue;
  for (const {actor, warnings} of parseWorldBeings21(text, candidates)) {
    // The short blocks on pp.372-373 repeat a name from the main Bestiary; the later one carries its page.
    if (seen.has(actor.name)) actor.name = `${actor.name} (p.${n})`;
    if (seen.has(actor.name)) throw new Error(`Two World Beings named ${actor.name}`);
    seen.add(actor.name);
    const id = uid('bestiary21', actor.name);
    const raw = actor.items.map(item => { const copy = structuredClone(item); delete copy._importUuid; delete copy.importPriority; delete copy.importSource; return copy; });
    // Stat-block weapons stay readied and everything else unequipped, as the in-app import leaves them. Foundry fills in
    // the remaining defaults of each data model when the compendium is read.
    const items = raw.map((item, index) => {
      const itemId = uid(id, String(index), item.name), system = structuredClone(item.system ?? {});
      if (Object.hasOwn(system, 'equipped') && item.type !== 'weapon') system.equipped = false;
      if (item.type === 'weapon') system.ammoId = '';
      for (const key of ['paidCarry', 'paidMeridians', 'paidArdor']) if (Object.hasOwn(system, key)) system[key] = 0;
      const copy = {...item, system, name: String(item.name).trim(), img: defaultItemIcon(item.type, item.img) ?? 'icons/svg/item-bag.svg'};
      delete copy.folder; delete copy.sort;
      return {...copy, _id: itemId, sort: (index + 1) * 1000, effects: (item.effects ?? []).map((effect, e) => ({...structuredClone(effect), _id: uid(itemId, 'effect', String(e))}))};
    });
    actors.push({_id: id, name: actor.name, type: 'npc', img: 'icons/svg/mystery-man.svg', folder: folder._id, sort: actors.length * 1000,
      system: actor.system, items, effects: [], prototypeToken: {name: actor.name, actorLink: false},
      flags: {'10kswordsfoundry': {bestiary21: {page: n}, rules21: {pack: 'bestiary-21'}}}});
    report.push(`p.${n} ${actor.name}: ${items.length} items; ${warnings.length} notes`);
  }
}
writeFileSync('data/bestiary-21.json', JSON.stringify({folders: [folder], actors}, null, 1) + '\n');
console.log(report.join('\n'));
console.log(`${actors.length} World Beings from pp.${first}-${last}.`);
