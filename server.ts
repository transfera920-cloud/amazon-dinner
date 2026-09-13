import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import './server/db.js';
import authRoutes from './server/routes/auth.js';
import categoriesRoutes from './server/routes/categories.js';
import driveTimeRoutes from './server/routes/driveTimeOptions.js';
import siteTextRoutes from './server/routes/siteText.js';
import searchRoutes from './server/routes/search.js';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes FIRST
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/drive-time-options', driveTimeRoutes);
  app.use('/api/site-text', siteTextRoutes);
  app.use('/api/search', searchRoutes);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // Prevent SPA fallback from intercepting unmatched /api routes
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
