import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM site_text').all();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  res.json(map);
});

router.put('/admin', requireAdmin, (req, res) => {
  const updates = req.body || {};
  const upsert = db.prepare(
    'INSERT INTO site_text (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  const tx = db.transaction((entries) => {
    for (const [key, value] of entries) upsert.run(key, String(value));
  });
  tx(Object.entries(updates));
  res.json({ ok: true });
});

export default router;
