// GM-selected rules version. From 0.2.50 new worlds start on 2.1; 2.0.3 stays selectable and its sheets and data are unchanged.
// A world that already has characters and never chose a version was running 2.0.3 by default: it is kept on 2.0.3 (pinExistingWorld20).
import {RULES_SETTING, RULES_CHOICES} from "./rules21.mjs?v=0.2.50";

const SYSTEM = "10kswordsfoundry";

export function registerRulesSetting() {
  game.settings.register(SYSTEM, RULES_SETTING, {
    name: "Rules version",
    hint: "Choose the ruleset used by character sheets and rolls in this world. 2.1 follows the current 10,000 Swords Against Heaven 2.1 rulebook and is the default for new worlds. 2.0.3 is the earlier rulebook, kept as it was. Switching keeps both sets of character data; nothing is converted or deleted.",
    scope: "world", config: true, restricted: true, type: String, choices: RULES_CHOICES, default: "2.1",
    onChange: () => {
      // The Compendium tab hides the 2.0.3 packs under 2.1 (and shows them again under 2.0.3).
      try { globalThis.ui?.compendium?.render?.(); } catch { /* the sidebar may not be up yet */ }
      for (const app of foundry.applications.instances?.values?.() ?? []) {
        const name = app.document?.documentName;
        if ((name === "Actor" || name === "Item") && app.rendered) app.render();
      }
    }
  });
}

/** True when a world should be kept on 2.0.3: it never stored a rules version (so it ran the old 2.0.3 default) and already has Actors or Items. */
export const keepsRules20 = (hasStoredChoice, documents) => !hasStoredChoice && Number(documents) > 0;

/** Run once per load by the active GM, before anything else reads the setting for long: stops the 2.1 default from switching an existing 2.0.3 world. */
export async function pinExistingWorld20() {
  try {
    if (!game.user?.isGM || game.users?.activeGM?.id !== game.user.id) return false;
    const key = `${SYSTEM}.${RULES_SETTING}`, world = game.settings.storage?.get?.("world");
    const stored = world?.getSetting?.(key) ?? world?.find?.(setting => setting.key === key);
    if (!keepsRules20(!!stored, (game.actors?.size ?? 0) + (game.items?.size ?? 0))) return false;
    await game.settings.set(SYSTEM, RULES_SETTING, "2.0");
    ui.notifications?.info("10,000 Swords: this world was already running Rules 2.0.3 and stays on it. New worlds now start on Rules 2.1; change it under Configure Settings → System → Rules version.", {permanent: true});
    return true;
  } catch (error) { console.warn("10,000 Swords | The rules version of this world could not be checked.", error); return false; }
}

/** This system's 2.0.3 compendia: the packs whose label ends "Rules 2.0.3". Hidden from the sidebar and the Compendium Browser while the world runs 2.1. */
export const isLegacyPack20 = pack => pack?.metadata?.packageName === SYSTEM && /Rules 2\.0\.3\s*$/.test(String(pack?.metadata?.label ?? ""));

export function rulesVersion() {
  try { return globalThis.game?.settings?.get(SYSTEM, RULES_SETTING) === "2.1" ? "2.1" : "2.0"; }
  catch { return "2.0"; }
}

export const usesRules21 = () => rulesVersion() === "2.1";
