import { db } from './schema';

type QueueEntity = 'note' | 'folder';
type QueueOperation = 'upsert' | 'delete';

export type QueuedChange = {
  entity: QueueEntity;
  entity_id: string;
  operation: QueueOperation;
  created_at: string;
};

// Records "this entity needs to sync" so the future sync engine (plan
// step 4) has a queue to drain instead of having to diff the whole
// database against Supabase every time. Called from every create/update/
// delete in notes.ts and folders.ts — you don't need to call this
// yourself.
export async function queueChange(
  entity: QueueEntity,
  entityId: string,
  operation: QueueOperation
): Promise<void> {
  await db.pendingChanges.add({
    entity,
    entity_id: entityId,
    operation,
    created_at: new Date().toISOString(),
  });
}

// Once the sync engine successfully pushes a change to Supabase, it
// should call this to clear it from the queue. Left as a named export
// now so step 4 doesn't need to touch this file at all.
export async function clearQueuedChange(id: number): Promise<void> {
  await db.pendingChanges.delete(id);
}
