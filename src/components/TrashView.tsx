import type { Note } from '../db/models';
import { formatRelativeTime } from '../lib/time';
import EmptyState from './EmptyState';
import { MenuIcon, RestoreIcon, TrashIcon } from './icons';

interface TrashViewProps {
  notes: Note[];
  onRestore: (id: string) => void;
  onDeleteForever: (note: Note) => void;
  onOpenSidebar: () => void;
}

export default function TrashView({ notes, onRestore, onDeleteForever, onOpenSidebar }: TrashViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="rounded-md p-1.5 text-ink-dim hover:bg-white/5 hover:text-ink lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-ink">Trash</h2>
        <p className="font-mono text-xs text-ink-faint">({notes.length})</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {notes.length === 0 ? (
          <EmptyState
            icon={<TrashIcon className="h-6 w-6" />}
            title="Trash is empty"
            message="Notes you move to trash will appear here so you can restore them."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border-strong"
              >
                <p className="truncate text-sm font-medium text-ink">
                  {note.title || 'Untitled note'}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-faint">
                  Trashed {formatRelativeTime(note.deleted_at ?? note.updated_at)}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <button
                    onClick={() => onRestore(note.id)}
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:border-accent/50 hover:bg-accent/10"
                  >
                    <RestoreIcon className="h-3.5 w-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={() => onDeleteForever(note)}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-ink-faint transition-colors hover:bg-danger/15 hover:text-danger"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
