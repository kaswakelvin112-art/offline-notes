import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema.js';

// These hooks re-render automatically whenever the underlying IndexedDB
// data changes — including changes made by createNote/updateNote/etc.
// elsewhere in the app, or (later) by the sync engine pulling in changes
// from another device. You never need to manually refetch.

// filters: { folder_id, tag, search } — same shape as listNotes()
export function useNotes(filters = {}) {
  return useLiveQuery(async () => {
    let collection = db.notes.filter((n) => !n.deleted_at);

    if (filters.folder_id !== undefined) {
      collection = collection.and((n) => n.folder_id === filters.folder_id);
    }
    if (filters.tag) {
      collection = collection.and((n) => n.tags.includes(filters.tag));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      collection = collection.and(
        (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }

    const results = await collection.toArray();
    return results.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  }, [filters.folder_id, filters.tag, filters.search]) ?? [];
}

export function useFolders() {
  return useLiveQuery(async () => {
    const folders = await db.folders.filter((f) => !f.deleted_at).toArray();
    return folders.sort((a, b) => a.name.localeCompare(b.name));
  }, []) ?? [];
}

export function useAllTags() {
  return useLiveQuery(async () => {
    const notes = await db.notes.filter((n) => !n.deleted_at).toArray();
    const tagSet = new Set();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, []) ?? [];
}

// Handy in a "Synced ✓" / "Offline · 3 pending" style indicator.
export function usePendingChangeCount() {
  return useLiveQuery(() => db.pendingChanges.count(), []) ?? 0;
}
