import Dexie, { type Table } from 'dexie';
import { Note, Folder } from './models';
import type { QueuedChange } from './syncQueue';

// One database, three tables:
//   - folders            your folder list
//   - notes              the notes themselves (tags live as an array field
//                         directly on the note — see the planning notes on
//                         why that's simpler than a separate tags table)
//   - pendingChanges      a queue of "things that still need to reach
//                         Supabase." Steps 1-3 of the plan don't touch this
//                         table at all — it just quietly fills up so the
//                         sync engine (step 4) has something to drain later.
//
// Every id is a client-generated UUID (not an autoincrement number) on
// purpose: a note created offline needs to keep the exact same id once
// it's pushed to Supabase, or "the same note" becomes two different rows
// in two different places.

class NotesAppDatabase extends Dexie {
  notes!: Table<Note, string>;
  folders!: Table<Folder, string>;
  pendingChanges!: Table<QueuedChange, number>;

  constructor() {
    super('notesApp');
    this.version(1).stores({
      folders: 'id, updated_at, deleted_at',
      notes: 'id, folder_id, updated_at, deleted_at, *tags',
      pendingChanges: '++id, entity, entity_id, created_at',
    });
  }
}

export const db = new NotesAppDatabase();

export default db;
