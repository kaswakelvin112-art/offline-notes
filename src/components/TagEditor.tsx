import { useState, type KeyboardEvent } from 'react';
import { CloseIcon, PlusIcon } from './icons';

interface TagEditorProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

function normalize(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_\- ]/g, '');
}

export default function TagEditor({ tags, onAdd, onRemove }: TagEditorProps) {
  const [draft, setDraft] = useState('');

  function commit() {
    const tag = normalize(draft);
    if (tag && !tags.includes(tag)) onAdd(tag);
    setDraft('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="group inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent"
          >
            {tag}
            <button
              onClick={() => onRemove(tag)}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full p-0.5 text-accent/70 hover:bg-white/10 hover:text-danger"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <PlusIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder="Add a tag and press Enter"
          className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
}
