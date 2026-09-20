# Offline Notes

Offline Notes is a lightweight, local-first note-taking app built for users who want to write, organize, and manage notes without depending on a remote database or login system. The app keeps everything on the browser using IndexedDB so notes remain available even after refresh or offline use.

## What the project does

This project allows users to:

- Create and edit notes quickly
- Organize notes into folders
- Add and manage tags
- Search notes by keyword
- Filter notes by folder or tag
- Move notes to trash and restore them when needed
- Keep data saved locally in the browser
- Experience a clean, simple layout focused on writing

It is designed to be a personal note dashboard that feels fast, reliable, and private.

## Technologies used

This project uses:

- React for the user interface
- TypeScript for type-safe app logic
- Vite for development and bundling
- Dexie for IndexedDB access
- Express for the lightweight server deployment setup
- Tailwind CSS for styling
- Node.js for the project runtime

## Project highlights

- Local-first architecture with IndexedDB persistence
- Soft-delete workflow with restore support
- Folder and tag-based organization
- Search and filtering for quick access
- Responsive UI for desktop and browser-based use
- Prepared for future sync or backend integration

## Screenshots

![Offline Notes dashboard](public/offlinenotes%20images/initialized%20page.png)

![Note editor view](public/offlinenotes%20images/a%20note%20made.png)

## Getting started

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Author

Built and maintained by Muyinza.

This project is a personal portfolio-style app demonstrating a practical offline notes workflow with browser-based storage and modern frontend tooling.

## Notes

The app currently focuses on local persistence rather than cloud sync, which makes it ideal for private, offline-first note management. It can be extended later with backend sync, authentication, or multi-device syncing when needed.
