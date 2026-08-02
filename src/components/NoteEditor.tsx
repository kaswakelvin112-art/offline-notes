import { useState } from 'react';
import type { Note } from '../db/models';
import { updateNote } from '../db';
import { useAutosave } from '../hooks/useAutosave';
import { MarkdownView } from '../lib/markdown';
import { countCharacters, countWords, formatFullDate } from '../lib/time';
import TagEditor from './TagEditor';
import {
  ArrowLeftIcon,
  CopyIcon,
  MenuIcon,
  StarIcon,
  TrashIcon,
} from './icons';

export type EditorMode = 'edit' | 'preview';

function EditorIconButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-md p-1.5 transition-colors ${
        danger ? 'text-ink-dim hover:bg-danger/15 hover:text-danger' : 'text-ink-dim hover:bg-white/5 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

interface NoteEditorProps {
  note: Note;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onTogglePin: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onBack: () => void;
  onOpenSidebar: () => void;
}

export default function NoteEditor({
  note,
  mode,
  onModeChange,
  onTogglePin,
  onDuplicate,
  onDelete,
  onAddTag,
  onRemoveTag,
  onBack,
  onOpenSidebar,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const { schedule, flush } = useAutosave(
    { title, body },
    500,
    (draft) => void updateNote(note.id, { title: draft.title, body: draft.body })
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-1 border-b border-border px-3 py-2">
        <button
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="rounded-md p-1.5 text-ink-dim hover:bg-white/5 hover:text-ink lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onBack}
          aria-label="Back to notes"
          className="rounded-md p-1.5 text-ink-dim hover:bg-white/5 hover:text-ink lg:hidden"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="mx-2 flex rounded-lg border border-border bg-bg p-0.5">
          {(['edit', 'preview'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                mode === m ? 'bg-surface-2 text-accent' : 'text-ink-faint hover:text-ink'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <EditorIconButton label={note.pinned ? 'Unpin' : 'Pin to top'} onClick={onTogglePin}>
            <StarIcon className={`h-4 w-4 ${note.pinned ? 'text-warn' : ''}`} filled={note.pinned} />
          </EditorIconButton>
          <EditorIconButton label="Duplicate note" onClick={onDuplicate}>
            <CopyIcon className="h-4 w-4" />
          </EditorIconButton>
          <EditorIconButton label="Move to trash" onClick={onDelete} danger>
            <TrashIcon className="h-4 w-4" />
          </EditorIconButton>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            schedule();
          }}
          onBlur={flush}
          placeholder="Untitled note"
          className="w-full bg-transparent text-2xl font-semibold text-ink placeholder:text-ink-faint focus:outline-none"
        />

        <div className="mt-4">
          {mode === 'edit' ? (
            <textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                schedule();
              }}
              onBlur={flush}
              placeholder="Start writing… use **bold**, *italic*, `code`, # headings and more."
              className="min-h-[55vh] w-full resize-none bg-transparent text-sm leading-relaxed text-ink-dim placeholder:text-ink-faint focus:outline-none"
            />
          ) : (
            <MarkdownView source={body} />
          )}
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <TagEditor tags={note.tags} onAdd={onAddTag} onRemove={onRemoveTag} />
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border px-5 py-2.5 text-xs text-ink-faint">
        <span>
          {countWords(body)} words · {countCharacters(body)} chars
        </span>
        <span>Edited {formatFullDate(note.updated_at)}</span>
      </footer>
    </div>
  );
}
