import type { Folder } from '../db/models';
import { FolderIcon, PencilIcon, TrashIcon } from './icons';

interface FolderItemProps {
  folder: Folder;
  active: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function FolderItem({ folder, active, onSelect, onRename, onDelete }: FolderItemProps) {
  return (
    <li className="group flex items-center rounded-lg">
      <button
        onClick={onSelect}
        title={folder.name}
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${
          active ? 'bg-surface-2 text-accent' : 'text-ink-dim hover:bg-white/5 hover:text-ink'
        }`}
      >
        <FolderIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{folder.name}</span>
      </button>
      <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          onClick={onRename}
          aria-label={`Rename ${folder.name}`}
          className="rounded-md p-1.5 text-ink-faint hover:text-accent"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete ${folder.name}`}
          className="rounded-md p-1.5 text-ink-faint hover:text-danger"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
