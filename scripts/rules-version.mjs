// GM-selected rules version. 2.0.3 stays the default; 2.1 is opt-in for testing.
import {RULES_SETTING, RULES_CHOICES} from "./rules21.mjs?v=0.2.40";

const SYSTEM = "10kswordsfoundry";

export function registerRulesSetting() {
  game.settings.register(SYSTEM, RULES_SETTING, {
    name: "Rules version",
    hint: "Choose the ruleset used by character sheets and rolls in this world. 2.0.3 is the established, tested ruleset. 2.1 (Red Kalpa Manuscript) is in testing: Cores, Cultivations, KILL THE BUDDHA, Body Parts, Morale, Attachments and Assets. Switching keeps both sets of character data; nothing is converted or deleted.",
    scope: "world", config: true, restricted: true, type: String, choices: RULES_CHOICES, default: "2.0",
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

/** This system's 2.0.3 compendia: the packs whose label ends "Rules 2.0.3". Hidden from the sidebar and the Compendium Browser while the world runs 2.1. */
export const isLegacyPack20 = pack => pack?.metadata?.packageName === SYSTEM && /Rules 2\.0\.3\s*$/.test(String(pack?.metadata?.label ?? ""));

export function rulesVersion() {
  try { return globalThis.game?.settings?.get(SYSTEM, RULES_SETTING) === "2.1" ? "2.1" : "2.0"; }
  catch { return "2.0"; }
}

export const usesRules21 = () => rulesVersion() === "2.1";
