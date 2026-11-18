import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

// The 2.1 Bestiary compendium (final 2.1 rulebook pp.346-373), built by tools/worldbeings21/gen_bestiary.mjs.
const manifest = JSON.parse(readFileSync("system.json", "utf8"));
const {folders, actors} = JSON.parse(readFileSync("data/bestiary-21.json", "utf8"));

test("the Bestiary is an Actor compendium beside the 2.1 World Beings, with one folder", () => {
  const names = manifest.packs.map(pack => pack.name), pack = manifest.packs.find(p => p.name === "bestiary-21");
  assert.equal(pack.type, "Actor"); assert.equal(pack.label, "2.1 World Beings · Bestiary"); assert.equal(pack.path, "packs/bestiary-21");
  assert.equal(names.indexOf("bestiary-21"), names.indexOf("worldbeings-21") + 1);
  assert.equal(folders.length, 1); assert.equal(folders[0].name, "Bestiary"); assert.equal(folders[0].type, "Actor");
});

test("71 World Beings, each a 2.1 npc with unique ids, a page and its stat-block items", () => {
  assert.equal(actors.length, 71);
  const ids = new Set();
  for (const actor of actors) {
    assert.equal(actor.type, "npc"); assert.equal(actor.folder, folders[0]._id); assert.match(actor._id, /^[a-z0-9]{16}$/);
    const page = actor.flags["10kswordsfoundry"].bestiary21.page; assert.ok(page >= 346 && page <= 373, actor.name);
    assert.ok(Number.isInteger(actor.system.sidhi) && actor.system.ardor.max > 0, actor.name);
    assert.ok(actor.items.length > 0, actor.name);
    for (const id of [actor._id, ...actor.items.map(item => item._id)]) { assert.ok(!ids.has(id), `${actor.name}: ${id}`); ids.add(id); }
    for (const item of actor.items) {
      assert.ok(item.name && item.type && item.img, `${actor.name}: ${item.name}`);
      assert.equal(item.system.equipped ?? false, item.type === "weapon" ? item.system.equipped : false, `${actor.name}: ${item.name} only weapons start readied`);
    }
  }
  assert.equal(new Set(actors.map(a => a.name)).size, actors.length);
});

test("versions printed as Sidhi X/Y/Z become one actor each, and the short Goblins of pp.372-373 are in", () => {
  const names = actors.map(a => a.name);
  for (const name of ["Aristocrat (Sidhi 0)", "Aristocrat (Sidhi 3)", "Aristocrat (Sidhi 5)", "Crane Goblin", "Fire-Lance Goblin", "Dagger Goblin (p.372)", "Saber Goblin (p.372)"]) assert.ok(names.includes(name), name);
  const lance = actors.find(a => a.name === "Fire-Lance Goblin");
  assert.equal(lance.system.sidhi, 4); assert.equal(lance.items.filter(i => i.type === "magick").length, 3, "Fulm, Blare and Scathe matched to the 2.1 Sects catalog");
});
