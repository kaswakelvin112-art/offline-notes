import type { Note } from '../db/models';
import { formatRelativeTime } from '../lib/time';
import { StarIcon } from './icons';

interface NoteListItemProps {
  note: Note;
  selected: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
}

export default function NoteListItem({ note, selected, onSelect, onTogglePin }: NoteListItemProps) {
  const preview = note.snippet;
  return (
    <div
      className={`group rounded-lg border p-3 transition-colors ${
        selected
          ? 'border-accent bg-surface-2'
          : 'border-border bg-surface hover:border-border-strong hover:bg-surface-2/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={onSelect}
          className={`min-w-0 flex-1 truncate text-left text-sm font-medium ${
            selected ? 'text-accent' : 'text-ink'
          }`}
        >
          {note.title || 'Untitled note'}
        </button>
        <button
          onClick={onTogglePin}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          aria-pressed={note.pinned}
          title={note.pinned ? 'Unpin' : 'Pin to top'}
          className={`shrink-0 rounded-md p-1 transition-colors ${
            note.pinned
              ? 'text-warn'
              : 'text-ink-faint opacity-0 group-hover:opacity-100 hover:text-warn focus-visible:opacity-100'
          }`}
        >
          <StarIcon className="h-4 w-4" filled={note.pinned} />
        </button>
      </div>
      <button onClick={onSelect} className="block w-full text-left">
        {preview && <p className="mt-1 truncate text-xs text-ink-dim">{preview}</p>}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] text-ink-faint">{formatRelativeTime(note.updated_at)}</span>
          {note.tags.length > 0 && (
            <span className="flex min-w-0 gap-1">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="truncate rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint"
                >
                  {tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[10px] text-ink-faint">+{note.tags.length - 2}</span>
              )}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
