# 0.1.37 checks

Root cause: the pack builder wrote full effect objects into items.effects. Foundry’s server EmbeddedCollectionField.expandEmbedded expects IDs there and reads items.effects sublevel records keyed by item ID + effect ID. Earlier JSON round-trip checks verified the incorrect representation and therefore missed the bug.

138 regression tests passed. Repair tests cover world, owned, and token copies, existing manual effects, Level preservation, stock matching, and one-time execution.

The installed server embedded-record loader reconstructed all 44 effects from the rebuilt databases without missing-record warnings. Pack builds now run this check automatically. Adamance read from disk was applied through the real installed core Actor method and field engine at Levels 1/3, yielding maximum Health 7/9 with saved base 6 on both Actor types; document transport is simulated. The release ZIP is separately extracted and checked through the same embedded-record loader.

Live Foundry 14.367 QA remains pending: restart with the update, enter as GM, then open Adamance in the system compendium and verify an effect row exists in its Effects tab. Verify the matching previously empty world/Actor copy received its effect, and your manually created copy is unchanged. Drag a fresh copy to a character and confirm Hale boxes scale with Level when active.
