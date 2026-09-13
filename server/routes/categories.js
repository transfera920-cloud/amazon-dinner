import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: front-end search page reads enabled categories only.
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM categories WHERE enabled = 1 ORDER BY sort_order ASC')
    .all();
  res.json(rows);
});

// Admin: full list including disabled ones, for the management screen.
router.get('/admin', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
  res.json(rows);
});

router.post('/admin', requireAdmin, (req, res) => {
  const { label, search_keyword, is_custom, sort_order } = req.body || {};
  if (!label) return res.status(400).json({ error: '請輸入類別名稱' });
  const info = db
    .prepare(
      'INSERT INTO categories (label, search_keyword, is_custom, enabled, sort_order) VALUES (?, ?, ?, 1, ?)'
    )
    .run(label, search_keyword || '', is_custom ? 1 : 0, sort_order ?? 999);
  res.json({ id: info.lastInsertRowid });
});

router.put('/admin/:id', requireAdmin, (req, res) => {
  const { label, search_keyword, is_custom, enabled, sort_order } = req.body || {};
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '找不到這個類別' });
  db.prepare(
    `UPDATE categories SET label = ?, search_keyword = ?, is_custom = ?, enabled = ?, sort_order = ?
     WHERE id = ?`
  ).run(
    label ?? existing.label,
    search_keyword ?? existing.search_keyword,
    is_custom !== undefined ? (is_custom ? 1 : 0) : existing.is_custom,
    enabled !== undefined ? (enabled ? 1 : 0) : existing.enabled,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/admin/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
