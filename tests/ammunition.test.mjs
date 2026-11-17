import test from "node:test";
import assert from "node:assert/strict";
import {ammoSummary21} from "../scripts/ammunition.mjs";

const actor = items => ({items: {contents: items.map(i => ({id: i.id, _id: i.id, type: i.type ?? "ammunition", name: i.name, system: i.system}))}});
const weapon = system => ({system});

test("ammoSummary21: loaded magazine reads the weapon's own ammo quantity", () => {
  assert.deepEqual(ammoSummary21(actor([]), weapon({ammo: {type: "Bullet", quantity: 5}})),
    {count: 5, label: "Bullet", kind: "magazine"});
});

test("ammoSummary21: a linked ammo stack reads that item's quantity and name", () => {
  const a = actor([{id: "a1", name: "War Arrows", system: {ammoType: "arrow", quantity: 12}}]);
  assert.deepEqual(ammoSummary21(a, weapon({ammoId: "a1", ammoFamily: "bow"})),
    {count: 12, label: "War Arrows", kind: "stack"});
});

test("ammoSummary21: with no linked stack, sums the matching family the actor carries", () => {
  const a = actor([
    {id: "b1", name: "Bullets", system: {ammoType: "bullet", quantity: 3}},
    {id: "b2", name: "Fireshot", system: {ammoType: "fireshot", quantity: 2}},
    {id: "c1", name: "Arrows", system: {ammoType: "arrow", quantity: 9}}]);
  assert.deepEqual(ammoSummary21(a, weapon({ammoFamily: "gun"})),
    {count: 5, label: "Gun ammo", kind: "family"});
});

test("ammoSummary21: no tracked ammo returns null", () => {
  assert.equal(ammoSummary21(actor([]), weapon({ammoFamily: "none"})), null);
  assert.equal(ammoSummary21(actor([]), weapon({})), null);
  assert.equal(ammoSummary21(actor([{id: "x", name: "Arrows", system: {ammoType: "arrow", quantity: 9}}]), weapon({ammoFamily: "gun"})), null);
});
