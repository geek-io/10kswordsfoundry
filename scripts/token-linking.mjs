export function setWandererTokenDefault(actor, data) {
  if (actor.type !== "wanderer" || data.prototypeToken?.actorLink !== undefined) return;
  actor.updateSource({ "prototypeToken.actorLink": true });
}

export async function preserveAndLinkWanderer(token) {
  if (token.actorLink || token.actor?.type !== "wanderer") throw new Error("Select an unlinked Wanderer token.");
  const actor = token.baseActor;
  if (!actor || !token.parent) throw new Error("The original sidebar Wanderer or Scene could not be found.");
  const data = token.actor.toObject();
  const original = actor.toObject();
  // Keep a recovery snapshot out of the Actor directory, before changing either document.
  const backupKey = `linkBackups.${token.id}`;
  if (!token.parent.getFlag("10kswordsfoundry", backupKey)) {
    await token.parent.setFlag("10kswordsfoundry", backupKey, {
      savedAt: new Date().toISOString(), actor: original, token: token.toObject()
    });
  }
  data._id = actor.id;
  data.ownership = original.ownership;
  data.folder = original.folder;
  data.prototypeToken = { ...original.prototypeToken, actorLink: true };
  // Foundry's full-document replacement path also replaces owned Items/Effects,
  // including removals, while keeping the world Actor ID and references intact.
  const updated = await actor.update(data, { diff: false, recursive: false });
  if (!updated) throw new Error("The sidebar update was cancelled. The token remains unlinked.");
  try {
    await token.update({ actorLink: true });
  } catch (error) {
    throw new Error(`The sidebar Wanderer was updated, but linking failed. A recovery snapshot is saved on the Scene. ${error.message}`);
  }
  return actor;
}
