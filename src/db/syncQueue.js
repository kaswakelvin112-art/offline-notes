import { db } from './schema.js';

// Records "this entity needs to sync" so the future sync engine (plan
// step 4) has a queue to drain instead of having to diff the whole
// database against Supabase every time. Called from every create/update/
// delete in notes.js and folders.js — you don't need to call this
// yourself.
export async function queueChange(entity, entityId, operation) {
  await db.pendingChanges.add({
    entity,       // 'note' | 'folder'
    entity_id: entityId,
    operation,    // 'upsert' | 'delete'
    created_at: new Date().toISOString(),
  });
}

// Once the sync engine successfully pushes a change to Supabase, it
// should call this to clear it from the queue. Left as a named export
// now so step 4 doesn't need to touch this file at all.
export async function clearQueuedChange(id) {
  await db.pendingChanges.delete(id);
}
