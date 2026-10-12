# Conditions, Rest, and injury Samadhi

Sources: rules 2.0.3 PDF pp.2 (Full Rest), 51 (Samadhi), 64 (Actions), 67 (Sutra), 78 (conditions). User specifically requests clearing all Ardor, including installed, on Full Rest.

## Rest and injury

Rest asks “Would you like to perform a Full Rest?” No/cancel changes nothing. Yes heals one Health capped at maximum, zeros burnt/installed Ardor, ends Samadhi, restores three Actions and resets bloodiedSamadhiUsed. Armor and conditions remain unchanged. The player confirms the one-day/two-meal requirement; the system does not consume unspecified food or advance world time for everyone.

A Wanderer update decreasing saved Health from above 3 to 1–3 consumes the injury trigger and enters Samadhi, unless already active. This includes damage skipping directly to Critical. Zero Health does not grant a new state. One update saves Health, the used marker, Samadhi and the burnt-Ardor refund together. Healing and unrelated updates do not trigger it. Damage while already in Samadhi uses the once-per-rest trigger but does not extend duration or restore more Ardor. After resting while still Bloody, a Wanderer must first heal above 3 and become Bloody again: merely remaining Bloody is not a new transition. Existing injured actors are not retroactively granted the trigger on upgrade. Effective Health changes caused only by Active Effects are not damage updates.

## Active conditions

| Condition | Applied behavior |
| --- | --- |
| Confusion | Blocks Cast (mantras require speech); speech comprehension remains narrative |
| Daze | -1 checkBonus, included in checks, attacks, casting and Defense |
| Encumbered | Halves Cultivations, rounding down; MOV 1; blocks Attack, Cast, Spend Action and Interrupt |
| Hesitant | Blocks attacks and Magick marked Hostile; beneficial Magick remains available |
| Hobbled | MOV -2, GRC -2, minimum zero |
| Knockdown | MOV 1; blocks attacks and Cast; Spend Action can represent standing/crawling/flailing |
| Stun | Removes one remaining Action on application, never below zero; blocks Interrupt while active |
| Stagger | -2 defenseBonus |

Base values remain saved unchanged. With Encumbered and Hobbled together, halve Cultivations first, then subtract Hobbled's two GRC; the book does not specify combined ordering. MOV 1 overrides numeric movement penalties for Encumbered/Knockdown. Checkbox removal cures only that condition. Reapplying Stun after removing it is a new application and costs an Action again.

Actions are explicitly tracked: attacks consume the profile cost; generic casting checks currently consume one (spell-specific costs still need manual adjustment), Defense consumes none. Other checks are not assumed to be Actions; use Spend Action when appropriate. Interrupt consumes one and enforces Stun. Use New Round to refill three; it does not clear conditions or advance the shared Combat round, so it does not expire Samadhi. No automatic token movement enforcement, universal action classification or custom LSUV initiative is claimed. Restrictions only apply to system-provided controls, not chat macros from other modules.

Validation: rule/unit tests, real Foundry 14.364 model/dice checks with document/UI transport stand-ins, package validation. Live 14.367 tests still needed for token Health changes, Rest cancellation, condition checkbox persistence and new controls.
