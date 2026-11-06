// Rules 2.1 targeting: reads the user's targeted tokens and measures distance from the acting token.
// Canvas access is isolated here so the roll workflows stay testable without a scene.

/** The acting token: a synthetic token's own object, the single controlled token, or the only token on the scene. */
export function actingToken(actor, placeables = globalThis.canvas?.tokens?.placeables ?? []) {
  if (!actor) return null;
  if (actor.token?.object) return actor.token.object;
  const matches = placeables.filter(token => token.actor === actor || (token.actor?.uuid && token.actor.uuid === actor.uuid));
  const controlled = matches.filter(token => token.controlled);
  if (controlled.length === 1) return controlled[0];
  return matches.length === 1 ? matches[0] : null;
}

/** Scene distance between two token centres, in scene units (metres). Uses the grid measurement when available. */
export function measureTokens(from, to, scene = globalThis.canvas) {
  if (!from?.center || !to?.center) return null;
  try {
    const path = scene?.grid?.measurePath?.([from.center, to.center]);
    if (Number.isFinite(path?.distance)) return Math.round(path.distance * 10) / 10;
  } catch { /* fall back to straight-line distance */ }
  const pixels = scene?.dimensions?.distancePixels;
  if (!Number.isFinite(pixels) || pixels <= 0) return null;
  return Math.round(Math.hypot(to.center.x - from.center.x, to.center.y - from.center.y) / pixels * 10) / 10;
}

/** Targeted tokens with actors, excluding the acting token itself, with their distance from it. */
export function collectTargets(actor, {source = actingToken(actor), tokens = [...(globalThis.game?.user?.targets ?? [])]} = {}) {
  return tokens.filter(token => token?.actor && token !== source).map(token => ({
    tokenUuid: token.document?.uuid ?? "",
    actorUuid: token.actor.uuid ?? "",
    name: token.name ?? token.document?.name ?? token.actor.name ?? "Target",
    distance: source ? measureTokens(source, token) : null
  }));
}
