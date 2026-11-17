# 0.2.21 testing and validation

Scope: a Dice So Nice integration for the 2.1 ruleset — "Force player dice (2.1)". Code only; no catalog, pack, template or 2.0.3 change.

## The problem (diagnosed, not assumed)

Rolling through a character sheet showed generic/other dice instead of the player's own Dice So Nice set, only on linked PC sheets, and intermittently. Investigation established, in order:

- **The system does not touch Dice So Nice and uses no `eval`** — `grep` of all of `scripts/` found no `dice-so-nice`/appearance flags and no `eval`/`new Function`. So the dice choice is not coming from 10k Swords code.
- **The server sets no CSP** — Caddy (the active reverse proxy) and Foundry's own config contain no `Content-Security-Policy`. The console's "`eval` is blocked" error therefore originates above them (a CDN/Cloudflare rule or a browser-extension setting), which also explains the "hard to replicate" intermittency.
- **Dice So Nice resolves the dice appearance from a User**, not an actor: its `Dice3D.APPEARANCE(user)` reads `user.getFlag("dice-so-nice","appearance")`, and on `createChatMessage` it builds `{roll, user: message.author ?? game.user, …}` and fires the **`diceSoNiceRollStart`** hook before animating, passing `context.user` through to `animateRolls({author: context.user, …})`. So a hook may override `context.user`, and that User's appearance is what animates. (Read from the installed module, `modules/dice-so-nice/main.js`.)

Because every 2.1 roll is spoken by a character, another client (commonly the GM driving a linked PC) can end up as the resolved user, so the character's dice do not follow the character's player.

## The change

`scripts/animations.mjs` adds `registerDiceSoNice21()`, wired into `scripts/system.mjs` `init` after `registerAnimations()`:

- Registers a world setting **`forcePlayerDice21`** ("Force player dice (2.1)", default **on**).
- Registers a `diceSoNiceRollStart` hook that, when the setting is on and the world uses the 2.1 rules, looks up the message's speaker actor, finds the **player assigned to that character** (`game.users.find(u => !u.isGM && u.character?.id === actor.id)`), and sets `context.user` to that player — so Dice So Nice animates the character's dice with that player's appearance on every client.
- A `/r` command (or any message with no character speaker) resolves no actor, so the hook returns without changing anything. The whole hook is wrapped in try/catch so a dice-appearance lookup can never block or fail a roll.

This writes no dice data and overrides nothing unless a character has an assigned player; it only points Dice So Nice at that player when it animates.

## Tests

`node --test`: **258 pass / 9 fail** — no new failures (the 9 are the same pre-existing ones). `node --check` passes on `animations.mjs`, `system.mjs` and `entry-0.2.21.mjs`. The hook needs Foundry globals (`game.messages`, `game.users`, the DSN module), so it is validated in Foundry, not in the unit suite.

## Not verified here (pending at the table)

- With **Force player dice (2.1)** on: a roll from a linked PC sheet animates with that character's player's configured Dice So Nice set, for that player and for the GM, matching what a `/r` shows that player.
- Turning the setting **off** returns Dice So Nice to its own resolution.
- If dice still fall back to a generic set with the setting on, the remaining cause is the **CSP `eval` block** (test a clean browser profile with extensions disabled; check the CDN/Cloudflare managed headers for `playexd.online` for a `Content-Security-Policy` missing `'unsafe-eval'`, which Foundry and Dice So Nice both require).
