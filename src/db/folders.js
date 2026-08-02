import { db } from './schema.js';
import { queueChange } from './syncQueue.js';
import { getLocalUserId } from '../lib/localUser.js';

function now() {
  return new Date().toISOString();
}

export async function createFolder({ name }) {
  const folder = {
    id: crypto.randomUUID(),
    name,
    created_at: now(),
    updated_at: now(),
    deleted_at: null,
    user_id: getLocalUserId(),
  };
  await db.folders.add(folder);
  await queueChange('folder', folder.id, 'upsert');
  return folder;
}

export async function renameFolder(id, name) {
  await db.folders.update(id, { name, updated_at: now() });
  await queueChange('folder', id, 'upsert');
}

// Deleting a folder does not delete its notes — it un-files them
// (folder_id becomes null) so nothing disappears by accident.
export async function softDeleteFolder(id) {
  const notesInFolder = await db.notes.where('folder_id').equals(id).toArray();
  await Promise.all(
    notesInFolder.map((n) => db.notes.update(n.id, { folder_id: null, updated_at: now() }))
  );
  await db.folders.update(id, { deleted_at: now(), updated_at: now() });
  await queueChange('folder', id, 'delete');
}

export async function listFolders() {
  const folders = await db.folders.filter((f) => !f.deleted_at).toArray();
  return folders.sort((a, b) => a.name.localeCompare(b.name));
}
