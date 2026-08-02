import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { Note, Folder } from '../db/models';
import {
  queryNotes,
  listFolders,
  listAllTags,
  listTrashedNotes,
  type NoteFilters,
} from '../db';

// These hooks re-render automatically whenever the underlying IndexedDB
// data changes — including changes made by createNote/updateNote/etc.
// elsewhere in the app, or (later) by the sync engine pulling in changes
// from another device. You never need to manually refetch.

export function useNotes(filters: NoteFilters = {}): Note[] {
  return (
    useLiveQuery(
      () => queryNotes(filters),
      [filters.folder_id, filters.tag, filters.search]
    ) ?? []
  );
}

export function useFolders(): Folder[] {
  return useLiveQuery(() => listFolders(), []) ?? [];
}

export function useTrashedNotes(): Note[] {
  return useLiveQuery(() => listTrashedNotes(), []) ?? [];
}

export function useAllTags(): string[] {
  return useLiveQuery(() => listAllTags(), []) ?? [];
}

// Handy in a "Synced ✓" / "Offline · 3 pending" style indicator.
export function usePendingChangeCount(): number {
  return useLiveQuery(() => db.pendingChanges.count(), []) ?? 0;
}
