import type { Folder } from '../db/models';
import FolderItem from './FolderItem';

interface FolderListProps {
  folders: Folder[];
  activeFolderId: string | null | undefined;
  onSelect: (id: string | null) => void;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

export default function FolderList({
  folders,
  activeFolderId,
  onSelect,
  onRename,
  onDelete,
}: FolderListProps) {
  if (folders.length === 0) {
    return <p className="px-2 text-xs text-ink-faint">No folders yet.</p>;
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          active={activeFolderId === folder.id}
          onSelect={() => onSelect(folder.id)}
          onRename={() => onRename(folder)}
          onDelete={() => onDelete(folder)}
        />
      ))}
    </ul>
  );
}
