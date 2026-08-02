import type { Folder } from '../db/models';
import type { View } from '../types';
import FolderList from './FolderList';
import TagFilterList from './TagFilterList';
import SyncStatus from './SyncStatus';
import {
  CloseIcon,
  FileTextIcon,
  PlusIcon,
  TrashIcon,
} from './icons';

interface SidebarProps {
  folders: Folder[];
  tags: string[];
  activeFolderId: string | null | undefined;
  activeTag: string | null;
  view: View;
  pendingCount: number;
  trashedCount: number;
  onSelectAllNotes: () => void;
  onSelectFolder: (id: string | null) => void;
  onToggleTag: (tag: string) => void;
  onSelectTrash: () => void;
  onNewNote: () => void;
  onNewFolder: () => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onClose: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{children}</span>;
}

export default function Sidebar(props: SidebarProps) {
  const {
    folders,
    tags,
    activeFolderId,
    activeTag,
    view,
    pendingCount,
    trashedCount,
    onSelectAllNotes,
    onSelectFolder,
    onToggleTag,
    onSelectTrash,
    onNewNote,
    onNewFolder,
    onRenameFolder,
    onDeleteFolder,
    onClose,
  } = props;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink">
            <FileTextIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-ink">Notes</h1>
            <p className="font-mono text-[10px] leading-tight text-ink-faint">offline workspace</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="rounded-md p-1.5 text-ink-faint hover:bg-white/5 hover:text-ink lg:hidden"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
        <button
          onClick={onNewNote}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-ink transition hover:brightness-110"
        >
          <PlusIcon className="h-4 w-4" />
          New note
        </button>

        <nav className="flex flex-col gap-0.5">
          <button
            onClick={onSelectAllNotes}
            className={`rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
              view === 'notes' && activeFolderId === undefined && !activeTag
                ? 'bg-surface-2 font-medium text-accent'
                : 'text-ink-dim hover:bg-white/5 hover:text-ink'
            }`}
          >
            All notes
          </button>
          <button
            onClick={onSelectTrash}
            className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
              view === 'trash' ? 'bg-surface-2 font-medium text-accent' : 'text-ink-dim hover:bg-white/5 hover:text-ink'
            }`}
          >
            <span className="flex items-center gap-2">
              <TrashIcon className="h-4 w-4" />
              Trash
            </span>
            {trashedCount > 0 && (
              <span className="rounded-full bg-danger/15 px-1.5 py-0.5 font-mono text-[10px] text-danger">
                {trashedCount}
              </span>
            )}
          </button>
        </nav>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <SectionLabel>Folders</SectionLabel>
            <button
              onClick={onNewFolder}
              aria-label="New folder"
              className="rounded p-1 text-ink-faint hover:text-accent"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <FolderList
            folders={folders}
            activeFolderId={activeFolderId}
            onSelect={onSelectFolder}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
          />
        </section>

        {tags.length > 0 && (
          <section className="flex flex-col gap-2">
            <SectionLabel>Tags</SectionLabel>
            <TagFilterList tags={tags} activeTag={activeTag} onToggle={onToggleTag} />
          </section>
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <SyncStatus pendingCount={pendingCount} />
      </div>
    </div>
  );
}
