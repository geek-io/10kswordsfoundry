// UI bounds complement the data model's validation of non-sheet updates.
const amount = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : fallback;
};

export function boundedResources(system, changed = "", healthMaximum = system.health.max, armorMaximum = system.armor.max) {
  const result = {};
  for (const key of ["health", "armor"]) {
    const max = amount(system[key].max);
    result[key] = { max, value: Math.min(amount(system[key].value), key === "health" ? amount(healthMaximum) : amount(armorMaximum)) };
  }
  let max = amount(system.ardor.max);
  let burnt = amount(system.ardor.burnt);
  let installed = amount(system.ardor.installed);
  // Editing one allocation must not silently spend or recover the other.
  if (changed === "system.ardor.burnt") {
    installed = Math.min(installed, max);
    burnt = Math.min(burnt, max - installed);
  } else if (changed === "system.ardor.max") {
    max = Math.max(max, burnt + installed);
  } else {
    burnt = Math.min(burnt, max);
    installed = Math.min(installed, max - burnt);
  }
  // Lowering maximum Ardor cannot erase existing expenditure/commitments.
  result.ardor = { max, burnt, installed };
  return result;
}

export function resourceLimits(system) {
  return {
    "system.health.value": { min: 0, max: system.health.max },
    "system.health.max": { min: 0 },
    "system.armor.value": { min: 0, max: system.armor.max },
    "system.armor.max": { min: 0 },
    "system.ardor.max": { min: system.ardor.burnt + system.ardor.installed },
    "system.ardor.burnt": { min: 0, max: system.ardor.max - system.ardor.installed },
    "system.ardor.installed": { min: 0, max: system.ardor.max - system.ardor.burnt }
  };
}
