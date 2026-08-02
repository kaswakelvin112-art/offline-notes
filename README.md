# Offline Notes — local CRUD layer (Step 1 of the plan)

This is Step 1 from the architecture plan: everything runs against
IndexedDB only, no Supabase yet — filtering, tags, search, soft delete,
folder deletion un-filing its notes, and a sync queue quietly recording
every change.

## What's here

```
src/
├── lib/localUser.ts       ← visitor identity (localStorage UUID)
├── db/
│   ├── models.ts            ← class Note, class Folder (the domain model)
│   ├── schema.ts            ← Dexie database + table definitions
│   ├── notes.ts             ← createNote, updateNote, softDeleteNote, restoreNote,
│   │                          queryNotes (shared filter/sort), listTrashedNotes, listAllTags
│   ├── folders.ts           ← createFolder, renameFolder, softDeleteFolder, restoreFolder
│   └── syncQueue.ts         ← records "this needs to sync" — step 4 will drain this later
├── hooks/
│   ├── useNotesData.ts      ← useNotes, useFolders, useTrashedNotes, useAllTags, usePendingChangeCount
│   ├── useAutosave.ts       ← debounced autosave (keeps the sync queue from spamming per keystroke)
│   └── useKeyboardShortcuts.ts
├── components/              ← AppShell, Sidebar, FolderList, NoteList, NoteEditor,
│                              TrashView, dialogs, Toast, EmptyState, SyncStatus, icons
└── App.tsx                  ← thin shell wiring the state above together
```

The data layer is TypeScript but deliberately class-based: `Note` and `Folder`
are the canonical shapes, the db functions return instances, and the React
components type against them.

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

Create a folder, create a note, tag it with the tag editor in the note view,
filter by folder or tag from the sidebar, search from the list, move a note to
trash (with an Undo toast) and restore it from the Trash view. Refresh the
page — everything's still there, because it's in IndexedDB, not memory. Open
dev tools → Application → IndexedDB → `notesApp` to see the raw data.

## What's intentionally NOT here yet

- Any Supabase code, auth, or sign-up flow (plan steps 2-3)
- Anything that actually reads `pendingChanges` and pushes it anywhere
  (plan step 4) — right now it just fills up quietly, which is correct
  for this stage
- A soft-delete to permanent-delete policy that waits on the sync engine
  (`hardDeleteNote` exists and is wired to the Trash UI, but it's meant to
  only run once Supabase has confirmed the deletion)
- Realtime cross-device updates (plan step 5)

Each of those is a clean next step whenever you're ready for it — the
foundation underneath won't need to change to support them.

## Deploying to Render

The app's data lives entirely in your browser's IndexedDB, but it's deployed
as a **web service** (Node) rather than a static site: a tiny Express server
(`server.js`) serves the built Vite app, and the same process is where the
API/sync endpoints will live when those land (plan step 4+) — no redeploy
restructuring needed later.

1. Push this repo to GitHub.
2. In the [Render dashboard](https://dashboard.render.com/), click
   **New + → Blueprint**, select the repo, and deploy. `render.yaml` in the
   repo root already configures everything:
   - build command `npm ci && npm run build`
   - start command `npm start` (runs `server.js` on the injected `PORT`)
   - health check at `/healthz`
   - immutable caching on hashed `/assets/*`, `no-cache` on HTML, SPA
     fallback so client routes load `index.html`
   - Node version pinned via `.node-version`
3. That's it. Your URL will be `https://<service>.onrender.com`.

Notes:
- Each user's notes stay in their own browser — nothing is shared or stored
  on the server yet. When cross-device sync arrives (plan step 4+), you add
  API routes to `server.js` and a database service, and the frontend keeps
  talking to the same origin.
- Try it locally in production mode with
  `npm run build && npm start`, then open `http://localhost:3000`.
