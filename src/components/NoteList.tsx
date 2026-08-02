import type { RefObject } from 'react';
import type { Note } from '../db/models';
import NoteListItem from './NoteListItem';
import EmptyState from './EmptyState';
import { FileTextIcon, MenuIcon, PlusIcon, SearchIcon } from './icons';

interface NoteListProps {
  title: string;
  notes: Note[];
  search: string;
  searchRef: RefObject<HTMLInputElement | null>;
  selectedNoteId: string | null;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onNewNote: () => void;
  onOpenSidebar: () => void;
}

export default function NoteList({
  title,
  notes,
  search,
  searchRef,
  selectedNoteId,
  onSearchChange,
  onSelect,
  onTogglePin,
  onNewNote,
  onOpenSidebar,
}: NoteListProps) {
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
        <h2 className="min-w-0 truncate text-sm font-semibold text-ink">{title}</h2>
        <button
          onClick={onNewNote}
          aria-label="New note"
          className="ml-auto rounded-md p-1.5 text-ink-dim hover:bg-white/5 hover:text-accent"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-3">
        {notes.length === 0 ? (
          search ? (
            <EmptyState
              icon={<SearchIcon className="h-6 w-6" />}
              title="No matches"
              message={`Nothing matches "${search}".`}
            />
          ) : (
            <EmptyState
              icon={<FileTextIcon className="h-6 w-6" />}
              title="No notes here yet"
              message="Create your first note to start writing."
              actionLabel="New note"
              onAction={onNewNote}
            />
          )
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                selected={selectedNoteId === note.id}
                onSelect={() => onSelect(note.id)}
                onTogglePin={() => onTogglePin(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
