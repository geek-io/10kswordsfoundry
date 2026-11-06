// Rules 2.1 CHANGE GOD'S MIND (pp.39–52): pure rules for influence, Social Defense, Disposition, Mobs and Persistence.

const int = value => Math.trunc(Number(value) || 0);
export const STRENGTH_LABEL = Object.freeze({0: "None", 1: "Held", 2: "Firm", 3: "Heart"});

/** p.42–43: what is being asked, the Attachment strength it needs as leverage, and the Persistence (Morale) cost to rebuff it. */
export const PURPOSES21 = Object.freeze({
  favor: {label: "Favor: a small or inconvenient task", needs: 1, morale: 1, kind: "act"},
  risk: {label: "Risk: a risky or greatly inconvenient task", needs: 2, morale: 2, kind: "act"},
  ruin: {label: "Ruin: life-threatening, life-changing or years-long", needs: 3, morale: 3, kind: "act"},
  implant: {label: "Implant a Held Attachment", needs: 0, morale: 1, kind: "attachment", note: "Cannot contradict a strong existing belief (p.44)."},
  destroy: {label: "Weaken a Held Attachment (destroys it)", needs: 0, morale: 1, kind: "attachment"},
  heldToFirm: {label: "Strengthen Held → Firm (a week)", needs: 1, morale: 2, kind: "attachment", project: {checks: 2, days: 7}},
  firmToHeld: {label: "Weaken Firm → Held (two weeks)", needs: 1, morale: 2, kind: "attachment", project: {checks: 2, days: 7}},
  firmToHeart: {label: "Strengthen Firm → Heart (a month)", needs: 2, morale: 3, kind: "attachment", project: {checks: 4, days: 7}},
  heartToFirm: {label: "Weaken Heart → Firm (a month)", needs: 2, morale: 3, kind: "attachment", project: {checks: 4, days: 7}},
  inflame: {label: "Inflame an emotion", needs: 0, morale: 2, kind: "feeling", note: "The target chooses how it manifests; it counts as a Firm Attachment for Social Defense (p.46)."}
});

/** p.43, 47, 49: approaches and the Core + Cultivation they use. */
export const APPROACHES21 = Object.freeze({
  charisma: {label: "Charisma and magnanimity", core: "voc", skill: "cultOfPersonality"},
  heart: {label: "Emotional connection, willpower, presence", core: "voc", skill: "bleedingHeart"},
  critique: {label: "Sword-sharp rhetoric and logic", core: "voc", skill: "weaponOfCritique"},
  fastTalk: {label: "Fast talk, street smarts, deceit", core: "voc", skill: "spitInTheFace"},
  performance: {label: "Beauty of movement or performance", core: "voc", skill: "aestheticGlossolalia"},
  athletics: {label: "Elegant physical performance", core: "voc", skill: "thewsSinews"},
  threaten: {label: "Threatening: physical harm as leverage", core: "phy", skill: "beastShrine", threat: true},
  written: {label: "Written word (pamphlet, manifesto)", core: "mnd", skill: "aestheticGlossolalia", written: true},
  gestural: {label: "Gestures and body language only", core: "voc", skill: "aestheticGlossolalia", gestural: true}
});

/** pp.46–47: Disposition levels from 2d6, with the dice adjustment they give to persuade or convince. */
export const DISPOSITIONS21 = Object.freeze({
  violent: {label: "Violent", modifier: -6, range: "2 or less"},
  hostile: {label: "Hostile", modifier: -3, range: "3–5"},
  neutral: {label: "Neutral", modifier: 0, range: "6–8"},
  friendly: {label: "Friendly", modifier: 2, range: "9–11"},
  enthusiastic: {label: "Enthusiastic", modifier: 4, range: "12+"}
});
export function dispositionFromRoll21(total) {
  const value = int(total);
  return value <= 2 ? "violent" : value <= 5 ? "hostile" : value <= 8 ? "neutral" : value <= 11 ? "friendly" : "enthusiastic";
}

/** pp.47–48: mobs of size 1–5 (up to 15 / 100 / 300 / 800 / 1000 people). */
export const MOB_SIZES21 = Object.freeze({0: "One person", 1: "Up to 15", 2: "Up to 100", 3: "Up to 300", 4: "Up to 800", 5: "Up to 1000"});

/** The initiator's dice adjustments (pp.42–52). */
export function influenceModifiers21({purpose = "favor", leverage = 0, disposition = "neutral", mob = 0, materialShift = false, shaky = false, adjustment = 0} = {}) {
  const info = PURPOSES21[purpose] ?? PURPOSES21.favor, parts = [];
  if (info.needs > 0 && int(leverage) < info.needs) parts.push({label: `No ${STRENGTH_LABEL[info.needs]} Attachment to leverage`, value: -3});
  const mood = DISPOSITIONS21[disposition];
  if (mood?.modifier) parts.push({label: `Disposition: ${mood.label}`, value: mood.modifier});
  if (int(mob) > 0) parts.push({label: `Mob size ${Math.min(5, int(mob))}`, value: -Math.min(5, int(mob))});
  if (materialShift) parts.push({label: "Material shift", value: 4});
  if (shaky) parts.push({label: "Shaky Attachment", value: 3});
  if (int(adjustment)) parts.push({label: "Adjustment", value: int(adjustment)});
  return {parts, total: parts.reduce((sum, part) => sum + part.value, 0)};
}

/** p.48: the strongest opposing Attachment gives +2/+4/+6; an aligned one -1/-2/-3; equal strengths cancel. */
export function socialDefense21(opposing = 0, aligned = 0) {
  const against = Math.max(0, Math.min(3, int(opposing))), with_ = Math.max(0, Math.min(3, int(aligned)));
  if (against === with_) return {value: 0, label: against ? `Opposing and aligned ${STRENGTH_LABEL[against]} Attachments cancel` : "No relevant Attachment"};
  return against > with_ ? {value: against * 2, label: `Opposing ${STRENGTH_LABEL[against]} Attachment`} : {value: -with_, label: `Aligned ${STRENGTH_LABEL[with_]} Attachment`};
}

/** Strongest Attachment strengths among chosen roles ("oppose" / "align") from a list of Attachments. */
export function attachmentRoles21(attachments = [], roles = {}) {
  let opposing = 0, aligned = 0;
  attachments.forEach((entry, index) => {
    const strength = Math.max(0, Math.min(3, int(entry.strength)));
    if (roles[index] === "oppose") opposing = Math.max(opposing, strength);
    if (roles[index] === "align") aligned = Math.max(aligned, strength);
  });
  return {opposing, aligned};
}

/** p.43: the initiator must have more Strikes; ties go to the defender. */
export const influenceSucceeds21 = (initiatorStrikes, defenderStrikes) => int(initiatorStrikes) > int(defenderStrikes);

/** p.48: a mob defends with a static half pool, rounded down. */
export const mobDefense21 = pool => Math.max(0, Math.floor(int(pool) / 2));

/** p.49: written influence embeds the Strikes as a Demand; -2 if the reader has no invoked Attachment. */
export const writtenDemand21 = (strikes, invoked = true) => Math.max(1, int(strikes) - (invoked ? 0 : 2));

/**
 * pp.48–49 Persistence: rebuffing costs Morale by context (Favor 1, Risk 2, Ruin 3).
 * To refuse an action, the target must also invoke an unused Attachment at least as strong as the leverage.
 */
export function persistence21({purpose = "favor", leverage = 0, morale = 0, invoked = 0} = {}) {
  const info = PURPOSES21[purpose] ?? PURPOSES21.favor;
  const cost = info.morale;
  if (int(morale) < cost) return {allowed: false, cost, reason: `Needs ${cost} Morale; only ${int(morale)} left.`};
  if (info.kind === "act" && int(invoked) < Math.max(1, int(leverage))) return {allowed: false, cost, reason: `Invoke a different Attachment of ${STRENGTH_LABEL[Math.max(1, int(leverage))]} strength or better.`};
  return {allowed: true, cost, reason: ""};
}
