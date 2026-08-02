import { useRef, useState } from 'react';
import { useNotes, useFolders, useAllTags, useTrashedNotes, usePendingChangeCount } from './hooks/useNotesData';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  createNote,
  updateNote,
  softDeleteNote,
  restoreNote,
  hardDeleteNote,
  createFolder,
  renameFolder,
  softDeleteFolder,
  restoreFolder,
  type Note,
  type Folder,
} from './db';
import type { ToastState, View } from './types';

import AppShell from './components/AppShell';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor, { type EditorMode } from './components/NoteEditor';
import TrashView from './components/TrashView';
import EmptyState from './components/EmptyState';
import ConfirmDialog from './components/ConfirmDialog';
import PromptDialog from './components/PromptDialog';
import Toast from './components/Toast';
import { FileTextIcon } from './components/icons';

type DialogState =
  | { kind: 'confirm-note'; note: Note }
  | { kind: 'confirm-folder'; folder: Folder }
  | { kind: 'confirm-permanent'; note: Note }
  | { kind: 'prompt-folder' }
  | { kind: 'prompt-rename'; folder: Folder }
  | null;

let toastCounter = 0;

export default function App() {
  const [view, setView] = useState<View>('notes');
  const [activeFolderId, setActiveFolderId] = useState<string | null | undefined>(undefined);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const folders = useFolders();
  const tags = useAllTags();
  const notes = useNotes({
    folder_id: activeFolderId ?? undefined,
    tag: activeTag ?? undefined,
    search: search || undefined,
  });
  const trashed = useTrashedNotes();
  const pendingCount = usePendingChangeCount();

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  function pushToast(message: string, opts: { actionLabel?: string; onAction?: () => void } = {}) {
    setToast({ id: ++toastCounter, message, ...opts });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  // ---- create / edit -------------------------------------------------------

  async function handleNewNote() {
    const note = await createNote({
      title: '',
      body: '',
      folder_id: activeFolderId ?? null,
      tags: activeTag ? [activeTag] : [],
    });
    setView('notes');
    setSelectedNoteId(note.id);
    closeSidebar();
  }

  async function handleDuplicate(note: Note) {
    const copy = await createNote({
      title: note.title ? `${note.title} copy` : '',
      body: note.body,
      folder_id: note.folder_id,
      tags: note.tags,
    });
    setView('notes');
    setSelectedNoteId(copy.id);
  }

  async function handleTogglePin(note: Note) {
    await updateNote(note.id, { pinned: !note.pinned });
  }

  async function handleAddTag(tag: string) {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, { tags: [...selectedNote.tags, tag] });
  }

  async function handleRemoveTag(tag: string) {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, { tags: selectedNote.tags.filter((t) => t !== tag) });
  }

  // ---- delete + restore ------------------------------------------------------

  function requestDeleteNote(note: Note) {
    setDialog({ kind: 'confirm-note', note });
  }

  async function confirmDeleteNote() {
    if (!dialog || dialog.kind !== 'confirm-note') return;
    const { note } = dialog;
    await softDeleteNote(note.id);
    if (selectedNoteId === note.id) setSelectedNoteId(null);
    setDialog(null);
    pushToast('Note moved to trash', {
      actionLabel: 'Undo',
      onAction: () => void restoreNote(note.id),
    });
  }

  function requestDeleteForever(note: Note) {
    setDialog({ kind: 'confirm-permanent', note });
  }

  async function confirmDeleteForever() {
    if (!dialog || dialog.kind !== 'confirm-permanent') return;
    await hardDeleteNote(dialog.note.id);
    setDialog(null);
    pushToast('Note permanently deleted');
  }

  function requestDeleteFolder(folder: Folder) {
    setDialog({ kind: 'confirm-folder', folder });
  }

  async function confirmDeleteFolder() {
    if (!dialog || dialog.kind !== 'confirm-folder') return;
    const { folder } = dialog;
    await softDeleteFolder(folder.id);
    setDialog(null);
    pushToast('Folder deleted', {
      actionLabel: 'Undo',
      onAction: () => void restoreFolder(folder.id),
    });
  }

  async function handleRestoreNote(id: string) {
    await restoreNote(id);
  }

  // ---- folders ---------------------------------------------------------------

  function requestNewFolder() {
    setDialog({ kind: 'prompt-folder' });
  }

  function requestRenameFolder(folder: Folder) {
    setDialog({ kind: 'prompt-rename', folder });
  }

  async function submitFolderName(name: string) {
    if (dialog?.kind === 'prompt-folder') {
      await createFolder({ name });
    } else if (dialog?.kind === 'prompt-rename') {
      await renameFolder(dialog.folder.id, name);
    }
    setDialog(null);
  }

  // ---- navigation ---------------------------------------------------------------

  function selectAllNotes() {
    setView('notes');
    setActiveFolderId(undefined);
    setActiveTag(null);
    closeSidebar();
  }

  function selectFolder(id: string | null) {
    setView('notes');
    setActiveFolderId(id);
    closeSidebar();
  }

  function selectTrash() {
    setView('trash');
    setSelectedNoteId(null);
    closeSidebar();
  }

  function toggleTag(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  function handleSelectNote(id: string) {
    setSelectedNoteId(id);
    closeSidebar();
  }

  function handleBackToNotes() {
    setSelectedNoteId(null);
  }

  // ---- shortcuts -----------------------------------------------------------------

  useKeyboardShortcuts({
    onNewNote: () => void handleNewNote(),
    onNewFolder: requestNewFolder,
    onFocusSearch: () => {
      if (view === 'notes') searchRef.current?.focus();
    },
    onTogglePreview: () => {
      if (selectedNote) setEditorMode((m) => (m === 'edit' ? 'preview' : 'edit'));
    },
    onEscape: () => {
      if (dialog) return;
      if (sidebarOpen) setSidebarOpen(false);
      else if (selectedNoteId) setSelectedNoteId(null);
    },
  });

  // ---- render --------------------------------------------------------------------

  const listTitle = search
    ? 'Search results'
    : activeTag
      ? `#${activeTag}`
      : activeFolderId !== undefined
        ? (folders.find((f) => f.id === activeFolderId)?.name ?? 'Notes')
        : 'All notes';

  const sidebar = (
    <Sidebar
      folders={folders}
      tags={tags}
      activeFolderId={activeFolderId}
      activeTag={activeTag}
      view={view}
      pendingCount={pendingCount}
      trashedCount={trashed.length}
      onSelectAllNotes={selectAllNotes}
      onSelectFolder={selectFolder}
      onToggleTag={toggleTag}
      onSelectTrash={selectTrash}
      onNewNote={() => void handleNewNote()}
      onNewFolder={requestNewFolder}
      onRenameFolder={requestRenameFolder}
      onDeleteFolder={requestDeleteFolder}
      onClose={closeSidebar}
    />
  );

  const list =
    view === 'trash' ? (
      <TrashView
        notes={trashed}
        onRestore={(id) => void handleRestoreNote(id)}
        onDeleteForever={requestDeleteForever}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    ) : (
      <NoteList
        title={listTitle}
        notes={notes}
        search={search}
        searchRef={searchRef}
        selectedNoteId={selectedNoteId}
        onSearchChange={setSearch}
        onSelect={handleSelectNote}
        onTogglePin={(id) => {
          const note = notes.find((n) => n.id === id);
          if (note) void handleTogglePin(note);
        }}
        onNewNote={() => void handleNewNote()}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
    );

  const editor = selectedNote ? (
    <NoteEditor
      key={selectedNote.id}
      note={selectedNote}
      mode={editorMode}
      onModeChange={setEditorMode}
      onTogglePin={() => void handleTogglePin(selectedNote)}
      onDuplicate={() => void handleDuplicate(selectedNote)}
      onDelete={() => requestDeleteNote(selectedNote)}
      onAddTag={(tag) => void handleAddTag(tag)}
      onRemoveTag={(tag) => void handleRemoveTag(tag)}
      onBack={handleBackToNotes}
      onOpenSidebar={() => setSidebarOpen(true)}
    />
  ) : (
    <EmptyState
      icon={<FileTextIcon className="h-6 w-6" />}
      title={view === 'trash' ? 'Viewing trash' : 'Select a note'}
      message={
        view === 'trash'
          ? 'Go back to your notes to start writing.'
          : 'Pick a note from the list, or create a new one to get started.'
      }
      actionLabel="New note"
      onAction={() => void handleNewNote()}
    />
  );

  return (
    <>
      <AppShell
        sidebar={sidebar}
        list={list}
        editor={editor}
        editorVisible={!!selectedNoteId && view === 'notes'}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={closeSidebar}
      />

      {dialog?.kind === 'confirm-note' && (
        <ConfirmDialog
          title="Move note to trash?"
          message={
            <>
              <strong className="text-ink">{dialog.note.title || 'Untitled note'}</strong> will be
              moved to trash. You can restore it anytime from the Trash view.
            </>
          }
          confirmLabel="Move to trash"
          onConfirm={() => void confirmDeleteNote()}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'confirm-folder' && (
        <ConfirmDialog
          title="Delete folder?"
          message={
            <>
              <strong className="text-ink">{dialog.folder.name}</strong> will be deleted. Its notes
              are moved to “All notes” and nothing else is lost.
            </>
          }
          confirmLabel="Delete folder"
          onConfirm={() => void confirmDeleteFolder()}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'confirm-permanent' && (
        <ConfirmDialog
          title="Delete forever?"
          message={
            <>
              <strong className="text-ink">{dialog.note.title || 'Untitled note'}</strong> will be
              permanently removed. This cannot be undone.
            </>
          }
          confirmLabel="Delete forever"
          onConfirm={() => void confirmDeleteForever()}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'prompt-folder' && (
        <PromptDialog
          title="New folder"
          placeholder="Folder name"
          submitLabel="Create"
          onSubmit={(name) => void submitFolderName(name)}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'prompt-rename' && (
        <PromptDialog
          title="Rename folder"
          label={dialog.folder.name}
          initialValue={dialog.folder.name}
          submitLabel="Rename"
          onSubmit={(name) => void submitFolderName(name)}
          onCancel={() => setDialog(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}
