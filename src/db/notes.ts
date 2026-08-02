import { db } from './schema';
import { queueChange } from './syncQueue';
import { getLocalUserId } from '../lib/localUser';
import { Note, toIsoNow } from './models';

export interface NoteFilters {
  folder_id?: string | null;
  tag?: string;
  search?: string;
}

// Shared query logic — used both by the imperative db functions below and
// by the live hooks so filtering/sorting only ever exists in one place.
export async function queryNotes(filters: NoteFilters = {}): Promise<Note[]> {
  let collection = db.notes.filter((n) => !n.deleted_at);

  if (filters.folder_id !== undefined) {
    collection = collection.and((n) => n.folder_id === filters.folder_id);
  }
  if (filters.tag) {
    collection = collection.and((n) => n.tags.includes(filters.tag as string));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    collection = collection.and(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );
  }

  const results = await collection.toArray();
  return results
    .map((row) => new Note(row))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.updated_at < b.updated_at ? 1 : -1;
    });
}

// title/body are the note's content. folder_id may be null (an
// "unfiled" note). tags is a plain array of strings, e.g. ['school', 'urgent'].
export async function createNote(input: {
  title?: string;
  body?: string;
  folder_id?: string | null;
  tags?: string[];
} = {}): Promise<Note> {
  const note = Note.create({ ...input, user_id: getLocalUserId() });
  await db.notes.add(note);
  await queueChange('note', note.id, 'upsert');
  return note;
}

// Pass only the fields you're changing, e.g. updateNote(id, { title: 'New title' }).
// updated_at is always refreshed — this is what the future sync engine's
// last-write-wins conflict resolution compares.
export async function updateNote(id: string, changes: Partial<Note>): Promise<Note | undefined> {
  const patch = { ...changes, updated_at: toIsoNow() };
  await db.notes.update(id, patch);
  await queueChange('note', id, 'upsert');
  const row = await db.notes.get(id);
  return row ? new Note(row) : undefined;
}

// Soft delete: marks the note as deleted but keeps the row. This is what
// lets the sync engine tell Supabase "this got deleted" instead of the
// deletion silently never propagating. Deleted notes are excluded from
// every list/query below.
export async function softDeleteNote(id: string): Promise<void> {
  await db.notes.update(id, { deleted_at: toIsoNow(), updated_at: toIsoNow() });
  await queueChange('note', id, 'delete');
}

export async function restoreNote(id: string): Promise<void> {
  await db.notes.update(id, { deleted_at: null, updated_at: toIsoNow() });
  await queueChange('note', id, 'upsert');
}

// Only call this after the sync engine confirms Supabase has the
// deletion too — this is real, permanent removal with no undo.
export async function hardDeleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  const row = await db.notes.get(id);
  return row ? new Note(row) : undefined;
}

export async function listNotes(filters: NoteFilters = {}): Promise<Note[]> {
  return queryNotes(filters);
}

// Deleted notes for the trash view, most recently trashed first.
export async function listTrashedNotes(): Promise<Note[]> {
  const rows = await db.notes.filter((n) => !!n.deleted_at).toArray();
  return rows
    .map((row) => new Note(row))
    .sort((a, b) => (a.deleted_at! < b.deleted_at! ? 1 : -1));
}

// Every distinct tag currently in use, across all non-deleted notes —
// useful for rendering a tag filter list in the sidebar.
export async function listAllTags(): Promise<string[]> {
  const notes = await db.notes.filter((n) => !n.deleted_at).toArray();
  const tagSet = new Set<string>();
  notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
