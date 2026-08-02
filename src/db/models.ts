export type FolderId = string | null;

export function toIsoNow(): string {
  return new Date().toISOString();
}

// The Note is the domain model for everything in the app. Every note lives
// in IndexedDB, and rows returned from the database are mapped back into
// this class so the UI always deals with real instances, never raw rows.
export class Note {
  id: string;
  title: string;
  body: string;
  folder_id: FolderId;
  tags: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: string;
  pinned: boolean;

  constructor(data: Omit<Note, 'snippet'>) {
    this.id = data.id;
    this.title = data.title;
    this.body = data.body;
    this.folder_id = data.folder_id;
    this.tags = data.tags ?? [];
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
    this.user_id = data.user_id;
    this.pinned = data.pinned ?? false;
  }

  static create(input: {
    title?: string;
    body?: string;
    folder_id?: FolderId;
    tags?: string[];
    user_id: string;
  }): Note {
    const ts = toIsoNow();
    return new Note({
      id: crypto.randomUUID(),
      title: input.title ?? '',
      body: input.body ?? '',
      folder_id: input.folder_id ?? null,
      tags: input.tags ?? [],
      created_at: ts,
      updated_at: ts,
      deleted_at: null,
      user_id: input.user_id,
      pinned: false,
    });
  }

  get snippet(): string {
    return this.body.replace(/\s+/g, ' ').trim();
  }
}

export class Folder {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: string;

  constructor(data: Folder) {
    this.id = data.id;
    this.name = data.name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.deleted_at = data.deleted_at;
    this.user_id = data.user_id;
  }

  static create(input: { name: string; user_id: string }): Folder {
    const ts = toIsoNow();
    return new Folder({
      id: crypto.randomUUID(),
      name: input.name,
      created_at: ts,
      updated_at: ts,
      deleted_at: null,
      user_id: input.user_id,
    });
  }
}
