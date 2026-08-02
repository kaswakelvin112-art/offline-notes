import { db } from './schema.js';
import { queueChange } from './syncQueue.js';
import { getLocalUserId } from '../lib/localUser.js';

function now() {
  return new Date().toISOString();
}

// title/body are the note's content. folder_id may be null (an
// "unfiled" note). tags is a plain array of strings, e.g. ['school', 'urgent'].
export async function createNote({ title = '', body = '', folder_id = null, tags = [] } = {}) {
  const note = {
    id: crypto.randomUUID(),
    title,
    body,
    folder_id,
    tags,
    created_at: now(),
    updated_at: now(),
    deleted_at: null,
    user_id: getLocalUserId(),
  };
  await db.notes.add(note);
  await queueChange('note', note.id, 'upsert');
  return note;
}

// Pass only the fields you're changing, e.g. updateNote(id, { title: 'New title' }).
// updated_at is always refreshed — this is what the future sync engine's
// last-write-wins conflict resolution compares.
export async function updateNote(id, changes) {
  const patch = { ...changes, updated_at: now() };
  await db.notes.update(id, patch);
  await queueChange('note', id, 'upsert');
  return db.notes.get(id);
}

// Soft delete: marks the note as deleted but keeps the row. This is what
// lets the sync engine tell Supabase "this got deleted" instead of the
// deletion silently never propagating. Deleted notes are excluded from
// every list/query below.
export async function softDeleteNote(id) {
  await db.notes.update(id, { deleted_at: now(), updated_at: now() });
  await queueChange('note', id, 'delete');
}

export async function restoreNote(id) {
  await db.notes.update(id, { deleted_at: null, updated_at: now() });
  await queueChange('note', id, 'upsert');
}

// Only call this after the sync engine confirms Supabase has the
// deletion too — this is real, permanent removal with no undo.
export async function hardDeleteNote(id) {
  await db.notes.delete(id);
}

export async function getNoteById(id) {
  return db.notes.get(id);
}

// filters: { folder_id, tag, search }
// - folder_id: only notes in that folder
// - tag: only notes that include this tag
// - search: case-insensitive match against title + body
export async function listNotes(filters = {}) {
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
}

// Every distinct tag currently in use, across all non-deleted notes —
// useful for rendering a tag filter list in the sidebar.
export async function listAllTags() {
  const notes = await db.notes.filter((n) => !n.deleted_at).toArray();
  const tagSet = new Set();
  notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
