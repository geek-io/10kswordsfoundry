// Equipment behavior requested by the user; bonuses are entered per item.
export function fashionResources(system, previous, next) {
  const bonus = (item, key) => item?.equipped ? Number(item[key] ?? 0) : 0;
  for (const item of [previous, next]) for (const key of ["armor", "ardor"]) {
    const value = Number(item?.[key] ?? 0);
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("Fashion bonuses must be nonnegative whole numbers.");
  }
  const armorDelta = bonus(next, "armor") - bonus(previous, "armor");
  const ardorDelta = bonus(next, "ardor") - bonus(previous, "ardor");
  const armorMax = Math.max(0, system.armor.max + armorDelta);
  const ardorMax = Math.max(0, system.ardor.max + ardorDelta);
  if (ardorMax < system.ardor.burnt + system.ardor.installed) {
    throw new Error("Free up enough Ardor before removing this Fashion bonus.");
  }
  return {
    armor: {max: armorMax, value: Math.min(armorMax, Math.max(0, system.armor.value + armorDelta))},
    ardor: {...system.ardor, max: ardorMax}
  };
}

const pending = new WeakMap();
// Save item state and resources together, including for synthetic token Actors.
export function changeFashion(actor, itemId, changes = {}, {remove = false, toggle = false} = {}) {
  const prior = pending.get(actor) ?? Promise.resolve();
  const task = prior.catch(() => {}).then(async () => {
    if (!actor.isOwner) throw new Error("You cannot change this character's Fashion.");
    const source = actor.toObject();
    const index = source.items.findIndex(item => item._id === itemId && item.type === "fashion");
    if (index < 0) throw new Error("This Fashion item is no longer on the character.");
    const previous = source.items[index];
    const next = foundry.utils.mergeObject(previous, changes, {inplace:false});
    if (toggle) next.system.equipped = !previous.system.equipped;
    Object.assign(source.system, fashionResources(source.system, previous.system, remove ? null : next.system));
    if (remove) source.items.splice(index, 1);
    else source.items[index] = next;
    const updated = await actor.update(source, {diff:false, recursive:false});
    if (!updated) throw new Error("The Fashion change was not saved.");
    return actor.items.get(itemId);
  });
  pending.set(actor, task);
  return task.finally(() => { if (pending.get(actor) === task) pending.delete(actor); });
}
