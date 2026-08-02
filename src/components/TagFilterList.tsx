import { TagIcon } from './icons';

interface TagFilterListProps {
  tags: string[];
  activeTag: string | null;
  onToggle: (tag: string) => void;
}

export default function TagFilterList({ tags, activeTag, onToggle }: TagFilterListProps) {
  if (tags.length === 0) {
    return <p className="px-2 text-xs text-ink-faint">No tags yet.</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const active = activeTag === tag;
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-xs transition-colors ${
              active
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-border text-ink-dim hover:border-accent hover:text-accent'
            }`}
          >
            <TagIcon className="h-3 w-3" />
            {tag}
          </button>
        );
      })}
    </div>
  );
}
