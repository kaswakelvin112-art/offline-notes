// Production server for the built Vite app.
//
// This is a plain Node/Express process so the app can be deployed to Render
// as a web service (not just a static site). It serves the compiled `dist/`
// folder with SPA fallback and production cache headers.
//
// When the sync/API layer lands (plan step 4+), this same server is where you
// add your API routes (e.g. `app.use('/api', ...)`) — the static serving here
// just keeps working.

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = process.env.PORT || 3000;

if (!existsSync(distDir)) {
  console.error(`dist/ not found at ${distDir}. Run \`npm run build\` first.`);
  process.exit(1);
}

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

// Health check used by Render's health checker.
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// Hashed assets (Vite names them index-<hash>.js/css) are immutable —
// safe to cache for a year with no cache-busting.
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), { maxAge: '1y', immutable: true })
);

// Everything else static. HTML is never cached so new deploys go live at once.
app.use(
  express.static(distDir, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// SPA fallback: unknown GET paths render the app shell (index.html).
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`offline-notes listening on http://localhost:${port}`);
});
