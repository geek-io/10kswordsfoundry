// GM-selected rules version. 2.0.3 stays the default; 2.1 is opt-in for testing.
import {RULES_SETTING, RULES_CHOICES} from "./rules21.mjs?v=0.2.14";

const SYSTEM = "10kswordsfoundry";

export function registerRulesSetting() {
  game.settings.register(SYSTEM, RULES_SETTING, {
    name: "Rules version",
    hint: "Choose the ruleset used by character sheets and rolls in this world. 2.0.3 is the established, tested ruleset. 2.1 (Red Kalpa Manuscript) is in testing: Cores, Cultivations, KILL THE BUDDHA, Body Parts, Morale, Attachments and Assets. Switching keeps both sets of character data; nothing is converted or deleted.",
    scope: "world", config: true, restricted: true, type: String, choices: RULES_CHOICES, default: "2.0",
    onChange: () => {
      for (const app of foundry.applications.instances?.values?.() ?? []) {
        const name = app.document?.documentName;
        if ((name === "Actor" || name === "Item") && app.rendered) app.render();
      }
    }
  });
}

export function rulesVersion() {
  try { return globalThis.game?.settings?.get(SYSTEM, RULES_SETTING) === "2.1" ? "2.1" : "2.0"; }
  catch { return "2.0"; }
}

export const usesRules21 = () => rulesVersion() === "2.1";
