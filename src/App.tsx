import { useState } from 'react';
import { useNotes, useFolders, useAllTags, usePendingChangeCount } from './hooks/useNotesData';
import { createNote, updateNote, softDeleteNote } from './db/notes';
import { createFolder, softDeleteFolder } from './db/folders';


export default function App() {
  const [activeFolder, setActiveFolder] = useState(undefined); // undefined = "All notes"
  const [activeTag, setActiveTag] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const folders = useFolders();
  const tags = useAllTags();
  const notes = useNotes({
    folder_id: activeFolder,
    tag: activeTag ?? undefined,
    search: search || undefined,
  });
  const pendingCount = usePendingChangeCount();

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  async function handleNewNote() {
    const note = await createNote({
      title: 'Untitled note',
      body: '',
      folder_id: activeFolder ?? null,
      tags: activeTag ? [activeTag] : [],
    });
    setSelectedNoteId(note.id);
  }

  async function handleNewFolder() {
    const name = window.prompt('Folder name');
    if (name && name.trim()) await createFolder({ name: name.trim() });
  }

  return (
    <div className="min-h-screen bg-[#120F2A] text-[#F4F1FF] flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-white/10 p-4 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">Notes</span>
          <span className="text-xs font-mono text-[#B3ACDB]">
            {pendingCount > 0 ? `${pendingCount} pending` : 'saved locally'}
          </span>
        </div>

        <button
          onClick={handleNewNote}
          className="bg-[#FF5D73] text-[#2A0A0F] font-semibold rounded-lg py-2 text-sm hover:-translate-y-0.5 transition"
        >
          + New note
        </button>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#B3ACDB]">FOLDERS</span>
            <button onClick={handleNewFolder} className="text-xs text-[#FFC857] hover:underline">
              + add
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            <li>
              <button
                onClick={() => setActiveFolder(undefined)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                  activeFolder === undefined ? 'bg-[#261E5C] text-[#5EEAD4]' : 'text-[#B3ACDB] hover:bg-white/5'
                }`}
              >
                All notes
              </button>
            </li>
            {folders.map((f) => (
              <li key={f.id} className="group flex items-center">
                <button
                  onClick={() => setActiveFolder(f.id)}
                  className={`flex-1 text-left px-2 py-1.5 rounded text-sm ${
                    activeFolder === f.id ? 'bg-[#261E5C] text-[#5EEAD4]' : 'text-[#B3ACDB] hover:bg-white/5'
                  }`}
                >
                  {f.name}
                </button>
                <button
                  onClick={() => softDeleteFolder(f.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#B3ACDB] hover:text-[#FF5D73] px-2"
                  aria-label={`Delete ${f.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        {tags.length > 0 && (
          <div>
            <span className="text-xs font-mono text-[#B3ACDB] block mb-2">TAGS</span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(activeTag === t ? null : t)}
                  className={`text-xs font-mono px-2 py-1 rounded-full border ${
                    activeTag === t
                      ? 'bg-[#5EEAD4] text-[#0A2620] border-[#5EEAD4]'
                      : 'border-white/10 text-[#B3ACDB] hover:border-[#5EEAD4]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Notes list */}
      <section className="w-80 shrink-0 border-r border-white/10 p-4 flex flex-col gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="bg-[#261E5C] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5EEAD4]"
        />
        <div className="flex flex-col gap-2 overflow-y-auto">
          {notes.length === 0 && (
            <p className="text-sm text-[#B3ACDB] text-center py-8">No notes here yet.</p>
          )}
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNoteId(n.id)}
              className={`text-left rounded-lg p-3 border ${
                selectedNoteId === n.id
                  ? 'bg-[#261E5C] border-[#FF5D73]'
                  : 'bg-[#1E1949] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-medium text-sm truncate">{n.title || 'Untitled note'}</div>
              <div className="text-xs text-[#B3ACDB] truncate mt-1">{n.body || 'No content yet'}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Editor */}
      <main className="flex-1 p-6">
        {!selectedNote ? (
          <p className="text-[#B3ACDB] text-sm">Select a note, or create a new one.</p>
        ) : (
          <div className="max-w-2xl flex flex-col gap-3">
            <input
              value={selectedNote.title}
              onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
              className="bg-transparent text-2xl font-semibold focus:outline-none"
              placeholder="Untitled note"
            />
            <textarea
              value={selectedNote.body}
              onChange={(e) => updateNote(selectedNote.id, { body: e.target.value })}
              className="bg-transparent text-sm text-[#B3ACDB] focus:outline-none min-h-[300px] resize-none"
              placeholder="Start writing..."
            />
            <button
              onClick={() => {
                softDeleteNote(selectedNote.id);
                setSelectedNoteId(null);
              }}
              className="self-start text-xs text-[#B3ACDB] hover:text-[#FF5D73]"
            >
              Delete note
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
