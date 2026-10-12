import { readFile, access, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
const manifest = JSON.parse(await readFile("system.json", "utf8"));
assert.equal(manifest.id, "10kswordsfoundry");
assert.equal(manifest.compatibility.minimum, "14");
assert.equal(manifest.compatibility.verified, "14.367");
assert.equal(manifest.compatibility.maximum, "14");
assert.equal(manifest.version, JSON.parse(await readFile("package.json", "utf8")).version);
assert.deepEqual(manifest.esmodules, [`scripts/entry-${manifest.version}.mjs`]);
// Check the complete local module graph, including the cache version of every import.
const visited = new Set();
async function checkModule(path) {
  if (visited.has(path)) return;
  visited.add(path);
  const source = await readFile(path, "utf8");
  for (const [, specifier] of source.matchAll(/import\s+(?:[^;]*?from\s+)?["'](\.[^"']+)["']/g)) {
    const [relative, query] = specifier.split("?");
    assert.equal(query, `v=${manifest.version}`, `Missing/stale module cache version: ${path} -> ${specifier}`);
    await checkModule(resolve(dirname(path), relative));
  }
}
await checkModule(resolve(manifest.esmodules[0]));
// Dynamically loaded browser modules are part of the runtime too.
await checkModule(resolve("scripts/browser.mjs"));
await checkModule(resolve("scripts/importer.mjs"));
await checkModule(resolve("scripts/item-creator.mjs"));
for(const font of ["Inter-Variable.ttf","Inter-OFL.txt"]) await access(`assets/fonts/${font}`);
for (const path of [...manifest.esmodules, ...manifest.styles, ...manifest.languages.map(l => l.path), "templates/actor.hbs", "templates/item.hbs"]) await access(path);
for (const path of manifest.languages.map(l => l.path)) JSON.parse(await readFile(path, "utf8"));
for (const file of await readdir("scripts")) if (file.endsWith(".mjs")) execFileSync(process.execPath, ["--check", `scripts/${file}`]);
console.log("Manifest references, JSON, versions, and JavaScript syntax passed. Foundry runtime testing remains required.");

for(const pack of manifest.packs??[]) {assert.equal(pack.type,'Item');await access(`${pack.path}/CURRENT`);}
