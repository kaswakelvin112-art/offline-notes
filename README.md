# Offline Notes — local CRUD layer (Step 1 of the plan)

This is Step 1 from the architecture plan: everything runs against
IndexedDB only, no Supabase yet. It's tested and working — see
`test-core.mjs` for the checks it passed (filtering, tags, search, soft
delete, folder deletion un-filing its notes, and the sync queue quietly
recording every change).

## What's here

```
src/
├── lib/localUser.js       ← visitor identity (localStorage UUID)
├── db/
│   ├── schema.js            ← Dexie database + table definitions
│   ├── notes.js              ← createNote, updateNote, softDeleteNote, listNotes, listAllTags
│   ├── folders.js            ← createFolder, renameFolder, softDeleteFolder, listFolders
│   └── syncQueue.js          ← records "this needs to sync" — step 4 will drain this later
├── hooks/useNotesData.js  ← useNotes, useFolders, useAllTags, usePendingChangeCount
└── App.jsx                 ← a working example UI wired to all of the above
```

## Installing into your existing Vite + React + Tailwind project

```bash
npm install dexie dexie-react-hooks
```

Then copy the `src/lib`, `src/db`, and `src/hooks` folders into your
project's `src/`. `App.jsx` is a full working example — either replace
your current `App.jsx` with it to see everything running end to end, or
just pilfer pieces of it (the sidebar, the editor) into your own layout.
None of the logic in `db/` or `hooks/` depends on how the UI looks.

## Trying it

```bash
npm run dev
```

Create a folder, create a note, add tags by creating notes with
`tags: ['school']` in the code (there's no tag-adding UI yet in this
example — that's an easy next addition once you're ready). Refresh the
page — everything's still there, because it's in IndexedDB, not memory.
Open dev tools → Application → IndexedDB → `notesApp` to see the raw
data.

## What's intentionally NOT here yet

- Any Supabase code, auth, or sign-up flow (plan steps 2-3)
- Anything that actually reads `pendingChanges` and pushes it anywhere
  (plan step 4) — right now it just fills up quietly, which is correct
  for this stage
- A tag-adding UI (the data layer supports it — `tags` is just an array
  on the note — the example UI just doesn't have an input for it yet)
- Realtime cross-device updates (plan step 5)

Each of those is a clean next step whenever you're ready for it — the
foundation underneath won't need to change to support them.
