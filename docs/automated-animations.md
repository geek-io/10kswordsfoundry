# Automated Animations

The system optionally integrates with [Automated Animations](https://github.com/theripper93/autoanimations). It uses the current `AutomatedAnimations.playAnimation(sourceToken, item, options)` [external API](https://github.com/theripper93/autoanimations/blob/main/src/system-support/external.js). The upstream v7 source manifest targets Foundry v14. Install a published release compatible with your Foundry build.

## Setup

1. Install and enable Automated Animations and its required modules, **Sequencer** and **socketlib**, using Foundry’s module manager.
2. Install and enable the animation assets you want to use. Automated Animations supplies no animation assets; its README describes JB2A support. Configure its asset location as needed.
3. In **Configure Settings → 10,000 Swords Against Heaven**, leave **Automated Animations** enabled.
4. Open an owned weapon, Magick, or Technick. In its sheet header controls, choose **Automated Animations** (provided by the module) and configure an animation. Alternatively, match the item’s name in the module’s automatic recognition menu. Use the actual custom names of this system’s items; they will not all match built-in presets.
5. Place the acting character on the current scene, select its token if it has multiple linked copies, and target the desired tokens. Use the weapon’s Attack button or the ability’s Activate/Internalize/Special Ability control.

## Behavior

- One animation request runs from the acting client after the use produces its chat message. Other connected clients receive playback through the module; the system does not replay it from chat rendering.
- The real owned Item is passed to the API, preserving its `autoanimations` flags. Special Abilities use their parent Weapon/Fashion/Technick configuration.
- Ordinary checks, Defense, Interrupt, Rest, Release, and passive Trait toggles do not trigger this integration. Automated Animations handles its own Active Effect animations independently.
- Private/blind chat rolls are skipped to avoid revealing them through scene playback.
- The source must be on the current canvas. Synthetic/unlinked token actors use their own token. Linked actors use their single controlled matching token, or their only matching token. Ambiguous sources, missing tokens, disabled modules, and missing APIs are skipped.
- Targets are captured for the use and passed explicitly, including an empty list for animations that operate on the source. No target is automatically selected for you.
- Animations represent the attack/cast, not a confirmed hit. No hit targets are fabricated before the later opposed Defense. Defense results do not cause a second playback.
- Area sizes do not create Measured Templates or Regions. Template-based animations require additional setup and are not automatically supported by this integration.
- Cancellations and failed chat creation produce no animation request. API request failures are logged without changing game resources or roll results. The module and Sequencer manage their own subsequent playback.
- No module, animation library, paid asset, or preset configuration is bundled or installed by this change.

The module’s [ApplicationV2 header integration](https://github.com/theripper93/autoanimations/blob/main/src/index.js) supplies the item configuration controls. The system suppresses duplicate generic AA chat workflows only for messages already handled by this integration.
