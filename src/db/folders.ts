import { db } from './schema';
import { queueChange } from './syncQueue';
import { getLocalUserId } from '../lib/localUser';
import { Folder, toIsoNow } from './models';

export async function createFolder(input: { name: string }): Promise<Folder> {
  const folder = Folder.create({ name: input.name, user_id: getLocalUserId() });
  await db.folders.add(folder);
  await queueChange('folder', folder.id, 'upsert');
  return folder;
}

export async function renameFolder(id: string, name: string): Promise<void> {
  await db.folders.update(id, { name, updated_at: toIsoNow() });
  await queueChange('folder', id, 'upsert');
}

// Deleting a folder does not delete its notes — it un-files them
// (folder_id becomes null) so nothing disappears by accident.
export async function softDeleteFolder(id: string): Promise<void> {
  const notesInFolder = await db.notes.where('folder_id').equals(id).toArray();
  await Promise.all(
    notesInFolder.map((n) => db.notes.update(n.id, { folder_id: null, updated_at: toIsoNow() }))
  );
  await db.folders.update(id, { deleted_at: toIsoNow(), updated_at: toIsoNow() });
  await queueChange('folder', id, 'delete');
}

export async function restoreFolder(id: string): Promise<void> {
  await db.folders.update(id, { deleted_at: null, updated_at: toIsoNow() });
  await queueChange('folder', id, 'upsert');
}

export async function listFolders(): Promise<Folder[]> {
  const rows = await db.folders.filter((f) => !f.deleted_at).toArray();
  return rows
    .map((row) => new Folder(row))
    .sort((a, b) => a.name.localeCompare(b.name));
}
