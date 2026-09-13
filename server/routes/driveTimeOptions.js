import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM drive_time_options WHERE enabled = 1 ORDER BY sort_order ASC')
    .all();
  res.json(rows);
});

router.get('/admin', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM drive_time_options ORDER BY sort_order ASC').all();
  res.json(rows);
});

router.post('/admin', requireAdmin, (req, res) => {
  const { minutes, sort_order } = req.body || {};
  if (!minutes || minutes <= 0) return res.status(400).json({ error: '請輸入有效的分鐘數' });
  const info = db
    .prepare('INSERT INTO drive_time_options (minutes, enabled, sort_order) VALUES (?, 1, ?)')
    .run(minutes, sort_order ?? 999);
  res.json({ id: info.lastInsertRowid });
});

router.put('/admin/:id', requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM drive_time_options WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '找不到這個選項' });
  const { minutes, enabled, sort_order } = req.body || {};
  db.prepare(
    'UPDATE drive_time_options SET minutes = ?, enabled = ?, sort_order = ? WHERE id = ?'
  ).run(
    minutes ?? existing.minutes,
    enabled !== undefined ? (enabled ? 1 : 0) : existing.enabled,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  res.json({ ok: true });
});

router.delete('/admin/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM drive_time_options WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
