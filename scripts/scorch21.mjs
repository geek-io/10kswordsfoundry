// Rules 2.1 Alpha p.52: Scorch. Burning or installing past 0 Flame goes negative; each point is -1 to all Checks and
// every new point of Scorch calls for a Deviation Check (Physique + Adamance + Sidhi Stage vs Demand 3 + Scorch).
import {checkFormula21, deviationDemand21, deviationPool21, DEVIATIONS_21} from "./rules21.mjs?v=0.2.14";
import {escapeHTML} from "./resolution.mjs?v=0.2.14";

const int = value => Math.trunc(Number(value) || 0);
const SYSTEM = "10kswordsfoundry";

/** Asks before a spend that goes past 0 Flame. Resolves true to continue. */
export async function confirmScorch21(actor, {burn = 0, install = 0, name = "This"} = {}) {
  const available = Math.max(0, int(actor.system.availableArdor)), need = int(burn) + int(install);
  const over = Math.max(0, need - available), scorch = int(actor.system.scorch) + over;
  return foundry.applications.api.DialogV2.confirm({window: {title: "Scorch"},
    content: `<p>${escapeHTML(name)} needs ${need} Flame; ${available} is available.</p>
      <p>Going on puts <strong>${over}</strong> into Scorch (Scorch ${scorch}: -${scorch} to all Checks) and calls for a Deviation Check: Physique + Adamance + Sidhi Stage vs Demand ${deviationDemand21(scorch)} (Alpha p.52).</p>`,
    rejectClose: false});
}

/** Rolls the Deviation Check after Scorch was added; on a failure rolls d6 on the Deviation table. */
export async function deviationCheck21(actor, scorch) {
  const system = actor.system, demand = deviationDemand21(scorch), pool = deviationPool21(system);
  const roll = await new foundry.dice.Roll(checkFormula21(pool)).evaluate();
  const active = r => r.dice.flatMap(die => die.results.filter(entry => entry.active !== false && !entry.discarded).map(entry => entry.result));
  const results = active(roll);
  const strikes = results.filter(value => value >= 4).length, success = strikes >= demand;
  let table = "";
  if (!success) {
    const d6 = await new foundry.dice.Roll("1d6").evaluate();
    const face = Math.min(6, Math.max(1, int(active(d6)[0]))), entry = DEVIATIONS_21[face];
    table = `<p class="r21-result failure"><strong>Deviation (d6 = ${face}): ${escapeHTML(entry.label)}.</strong> ${escapeHTML(entry.text)}</p>`;
  }
  const content = `<section class="r21-chat"><h3>Deviation Check · Scorch ${int(scorch)}</h3>
    <p class="r21-result ${success ? "success" : "failure"}"><strong>${strikes} Strikes</strong> vs Demand ${demand} — ${success ? "it works; the Scorch stays" : "Sidhi Deviation"}</p>
    <p>Pool ${pool}: Physique + Adamance + Sidhi Stage.</p>${table}
    <p class="hint">Each point of Scorch is -1 to all Checks. Burnt Flame still returns 1 per week, clearing Scorch first; releasing installed Flame also clears Scorch first (Alpha p.52).</p></section>`;
  return roll.toMessage({speaker: foundry.documents.ChatMessage.getSpeaker({actor}), flavor: content, flags: {[SYSTEM]: {deviation21: {scorch: int(scorch), strikes, demand, success}}}},
    {messageMode: game.settings.get("core", "messageMode")});
}
