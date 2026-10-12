# Wanderer tokens and sidebar Actors

New Wanderers default to linked tokens; explicit link settings and NPC defaults are respected.

## Existing unlinked Wanderer (0.1.5)

As GM, open the up-to-date map Wanderer and click **Sync with sidebar**. Confirm using that map copy as the authoritative version. The existing sidebar Actor receives its current data, Items and Effects, retaining its ID, folder, ownership, and references. The selected token becomes linked, and future tokens from that Actor are linked by default. No duplicate Actor is created. Other unlinked tokens are not automatically linked.

Before writing, the system stores the original sidebar Actor and token sources in the Scene flag `10kswordsfoundry.linkBackups.<token-id>`. A previous snapshot is not overwritten on retry. If saving the snapshot fails, no Actor/token changes are made. If the sidebar write succeeds but linking fails, the notification reports partial completion and the snapshot remains available. This is a two-document update, not an atomic transaction. Recovery data can be retrieved by a GM through `scene.getFlag("10kswordsfoundry", "linkBackups.<token-id>")`; restoration is a deliberate import/update operation, not automatic.

The 0.1.4 duplicate-Actor workflow is superseded. If it was already used, its linked token keeps working; no Actor is automatically deleted or merged.

Local tests cover write order, preserved ID, full replacement options, and failures. Live 14.367 confirmation remains pending. Verify Health and owned Items update in both directions after sync.
