// Rules 2.1 KILL THE BUDDHA exchange state (pp.23–28). Pure functions: every operation returns a new state.
// Openings resolve in Speed Tiers (Quick, then Solid, then Perfect). Counters need an Opening of equal or higher rank;
// Greater Counters grant a Quick Opening, Overwhelming Counters a Minor or Solid one, which act immediately.

export const TIERS = Object.freeze(["quick", "solid", "perfect"]);
export const RANK = Object.freeze({quick: 1, solid: 2, perfect: 3});
export const RANK_LABEL = Object.freeze({quick: "Quick", solid: "Solid", perfect: "Perfect", whiff: "Whiff", done: "Resolved"});
const int = value => Math.max(0, Math.trunc(Number(value) || 0));
const clone = value => structuredClone(value);

export function newExchange21() {
  return {tier: "quick", participants: [], declarations: [], log: [], seq: 0};
}

function participantOf(state, key) {
  const participant = state.participants.find(entry => entry.key === key);
  if (!participant) throw new Error("That combatant is not in this KILL THE BUDDHA.");
  return participant;
}

function requireOpen(state) {
  if (state.tier === "done") throw new Error("This KILL THE BUDDHA has been resolved.");
}

/** Adds a roll. Joining after the Quick tier forfeits Openings of tiers that have already passed (Interruption, p.27). */
export function addParticipant21(state, roll) {
  requireOpen(state);
  const next = clone(state);
  if (!roll?.key) throw new Error("This roll cannot join the exchange.");
  if (next.participants.some(entry => entry.key === roll.key)) throw new Error(`${roll.name} is already in this KILL THE BUDDHA.`);
  const open = {quick: int(roll.quick), solid: int(roll.solid), perfect: int(roll.perfect), whiff: int(roll.whiff)};
  const lost = [];
  for (const tier of TIERS) {
    if (RANK[tier] >= RANK[next.tier]) break;
    if (open[tier]) lost.push(`${open[tier]} ${RANK_LABEL[tier]}`);
    open[tier] = 0;
  }
  next.participants.push({key: roll.key, name: String(roll.name ?? "Combatant"), actorUuid: roll.actorUuid ?? "", tokenUuid: roll.tokenUuid ?? "",
    weapon: roll.weapon ?? "", damage: int(roll.damage) || 1, crushing: !!roll.crushing, open, bonus: {quick: 0, solid: 0}, fusedPerfect: 0, sidhiBurnt: 0});
  next.log.push(`${roll.name} joins at the ${RANK_LABEL[next.tier]} tier${lost.length ? `, losing ${lost.join(" and ")} Opening(s)` : ""}.`);
  return next;
}

/** Commits an Opening to a maneuver. Ordinary Openings act in their own tier; bonus Openings from Counters act at once. */
export function declare21(state, key, rank, {text = "", target = "", bonus = false} = {}) {
  requireOpen(state);
  const next = clone(state), participant = participantOf(next, key);
  if (!RANK[rank]) throw new Error("Choose Quick, Solid or Perfect.");
  if (bonus) {
    if (!participant.bonus[rank]) throw new Error(`${participant.name} has no bonus ${RANK_LABEL[rank]} Opening from a Counter.`);
    participant.bonus[rank] -= 1;
  } else {
    if (rank !== next.tier) throw new Error(`${RANK_LABEL[rank]} Openings act in the ${RANK_LABEL[rank]} tier; it is now the ${RANK_LABEL[next.tier]} tier (p.23).`);
    if (!participant.open[rank]) throw new Error(`${participant.name} has no ${RANK_LABEL[rank]} Opening left.`);
    participant.open[rank] -= 1;
  }
  if (target) participantOf(next, target);
  const declaration = {id: ++next.seq, kind: "maneuver", by: key, rank, tier: next.tier, text: String(text).trim(), target, bonus: !!bonus, countered: false};
  next.declarations.push(declaration);
  next.log.push(`${participant.name}: ${RANK_LABEL[rank]}${bonus ? " (from a Counter)" : ""} — ${declaration.text || "maneuver"}${target ? ` → ${participantOf(next, target).name}` : ""}.`);
  return next;
}

/** pp.26–27: Counter a maneuver of the current tier (or a bonus maneuver) with an Opening of equal or higher rank. */
export function counter21(state, key, rank, declarationId, {text = ""} = {}) {
  requireOpen(state);
  const next = clone(state), participant = participantOf(next, key);
  const target = next.declarations.find(entry => entry.id === declarationId);
  if (!target || target.kind !== "maneuver") throw new Error("Choose a maneuver to Counter.");
  if (target.countered) throw new Error("That maneuver has already been Countered.");
  if (target.by === key) throw new Error("You cannot Counter your own maneuver.");
  if (!target.bonus && target.tier !== next.tier) throw new Error("Counters only apply to the current Strike Rank (p.26).");
  if (!RANK[rank] || RANK[rank] < RANK[target.rank]) throw new Error(`Countering a ${RANK_LABEL[target.rank]} Opening needs a ${RANK_LABEL[target.rank]} Opening or better.`);
  if (participant.open[rank]) participant.open[rank] -= 1;
  else if (participant.bonus[rank]) participant.bonus[rank] -= 1;
  else throw new Error(`${participant.name} has no ${RANK_LABEL[rank]} Opening left to Counter with.`);
  const gap = RANK[rank] - RANK[target.rank];
  const kind = rank === "perfect" && target.rank === "quick" ? "overwhelming" : gap === 1 ? "greater" : "counter";
  if (kind === "greater") participant.bonus.quick += 1;
  if (kind === "overwhelming") participant.bonus.solid += 1;
  const declaration = {id: ++next.seq, kind, by: key, rank, tier: next.tier, text: String(text).trim(), target: target.by, counters: target.id, bonus: false, countered: false};
  target.countered = true;
  target.counteredBy = declaration.id;
  next.declarations.push(declaration);
  const owner = participantOf(next, target.by).name;
  const reward = kind === "greater" ? " Greater Counter: a Quick Opening back, right now." : kind === "overwhelming" ? " Overwhelming Counter: a Minor or Solid Opening, right now." : "";
  next.log.push(`${participant.name} Counters ${owner}'s ${RANK_LABEL[target.rank]} maneuver with a ${RANK_LABEL[rank]} Opening.${reward}`);
  return next;
}

/** p.25: two equal Openings fuse into the next rank; only one extra Perfect Opening may be made this way. */
export function fuse21(state, key, rank) {
  requireOpen(state);
  const next = clone(state), participant = participantOf(next, key);
  const up = {quick: "solid", solid: "perfect"}[rank];
  if (!up) throw new Error("Only Quick or Solid Openings can be fused.");
  if (participant.open[rank] < 2) throw new Error(`Fusing needs two ${RANK_LABEL[rank]} Openings.`);
  if (up === "perfect" && participant.fusedPerfect >= 1) throw new Error("Only one extra Perfect Opening can be gained by fusing (p.25).");
  participant.open[rank] -= 2;
  participant.open[up] += 1;
  if (up === "perfect") participant.fusedPerfect += 1;
  next.log.push(`${participant.name} fuses two ${RANK_LABEL[rank]} Openings into a ${RANK_LABEL[up]} Opening.`);
  return next;
}

/** p.26: a Cultivator may burn 1 Sidhi to raise an Opening one rank, or turn a Whiff into a Quick Opening. */
export function sidhi21(state, key, rank) {
  requireOpen(state);
  const next = clone(state), participant = participantOf(next, key);
  const up = {whiff: "quick", quick: "solid", solid: "perfect"}[rank];
  if (!up) throw new Error("Choose a Whiff, Quick or Solid Opening to upgrade.");
  if (!participant.open[rank]) throw new Error(`${participant.name} has no ${RANK_LABEL[rank]} to upgrade.`);
  if (RANK[up] < RANK[next.tier]) throw new Error(`A ${RANK_LABEL[up]} Opening could no longer act in the ${RANK_LABEL[next.tier]} tier.`);
  participant.open[rank] -= 1;
  participant.open[up] += 1;
  participant.sidhiBurnt += 1;
  next.log.push(`${participant.name} burns 1 Sidhi: ${RANK_LABEL[rank]} → ${RANK_LABEL[up]}.`);
  return next;
}

/** Moves to the next Speed Tier. Unused Openings of the finished tier and unused Counter bonuses are lost. */
export function advance21(state) {
  requireOpen(state);
  const next = clone(state), finished = next.tier;
  for (const participant of next.participants) {
    const lost = participant.open[finished] + participant.bonus.quick + participant.bonus.solid;
    if (lost) next.log.push(`${participant.name} lets ${lost} unused Opening(s) pass.`);
    participant.open[finished] = 0;
    participant.bonus = {quick: 0, solid: 0};
  }
  next.tier = TIERS[TIERS.indexOf(finished) + 1] ?? "done";
  next.log.push(next.tier === "done" ? "KILL THE BUDDHA ends." : `${RANK_LABEL[next.tier]} Openings resolve now.`);
  return next;
}

/** Maneuvers that still land on a target (not Countered) — candidates for damage. */
export const landing21 = state => state.declarations.filter(entry => entry.kind === "maneuver" && !entry.countered && entry.target);

export const OPERATIONS21 = Object.freeze({add: addParticipant21, declare: declare21, counter: counter21, fuse: fuse21, sidhi: sidhi21, advance: advance21});

/** Runs one named operation with its arguments. */
export function applyOperation21(state, op) {
  const fn = OPERATIONS21[op?.type];
  if (!fn) throw new Error("Unknown exchange action.");
  return fn(state, ...(op.args ?? []));
}
