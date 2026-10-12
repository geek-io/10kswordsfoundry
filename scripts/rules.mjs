// Rules 2.0.3, p.25. Kept independent of Foundry for deterministic testing.
export const CULTIVATIONS = Object.freeze({
  vio: "Violence (Vio)", dia: "Dialectics (Dia)", grc: "Grace (Grc)",
  sav: "Savvy (Sav)", wrd: "Word (Wrd)", spi: "Spirit (Spi)"
});

export function checkFormula(pool) {
  if (!Number.isSafeInteger(pool)) throw new TypeError("Dice pool must be an integer.");
  return pool <= 0 ? "2d6kl1cs>=4" : `${pool}d6cs>=4`;
}

export function summarizeCheck(results, demand) {
  if (!Number.isSafeInteger(demand) || demand < 1) throw new RangeError("Demand must be a positive integer.");
  if (!results.length || results.some(n => !Number.isInteger(n) || n < 1 || n > 6)) {
    throw new RangeError("Expected active d6 results.");
  }
  const strikes = results.filter(n => n >= 4).length;
  const sixes = results.filter(n => n === 6).length;
  return { strikes, sixes, success: strikes >= demand };
}
