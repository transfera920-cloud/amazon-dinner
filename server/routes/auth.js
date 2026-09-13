import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();

// Front end calls this first to decide whether to show "create admin account"
// or "login" — there is never a default admin/admin account.
router.get('/status', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) AS c FROM admin_users').get().c;
  res.json({ setupRequired: count === 0 });
});

// Only works once — rejected if an admin account already exists.
router.post('/setup', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) AS c FROM admin_users').get().c;
  if (count > 0) {
    return res.status(409).json({ error: '管理員帳號已經建立過了，請直接登入' });
  }
  const { username, password } = req.body || {};
  if (!username || !password || password.length < 8) {
    return res.status(400).json({ error: '請提供帳號，密碼至少 8 碼' });
  }
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, hash);
  const jwtSecret = process.env.JWT_SECRET || 'trail-dinner-secret-key-default-2026';
  const token = jwt.sign({ username }, jwtSecret, { expiresIn: '12h' });
  res.json({ token });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: '帳號或密碼錯誤' });
  }
  const jwtSecret = process.env.JWT_SECRET || 'trail-dinner-secret-key-default-2026';
  const token = jwt.sign({ username }, jwtSecret, { expiresIn: '12h' });
  res.json({ token });
});

export default router;
