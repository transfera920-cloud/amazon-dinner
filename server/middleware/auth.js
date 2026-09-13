import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: '未登入' });
  }
  try {
    const jwtSecret = process.env.JWT_SECRET || 'trail-dinner-secret-key-default-2026';
    const payload = jwt.verify(token, jwtSecret);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: '登入已過期，請重新登入' });
  }
}
