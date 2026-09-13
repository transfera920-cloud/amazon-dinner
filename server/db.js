import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const dbPath = process.env.SQLITE_PATH || './data/app.db';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

class SQLiteWrapper {
  constructor(filepath) {
    this.rawDb = new DatabaseSync(filepath);
  }

  pragma(sql) {
    return this.rawDb.exec(`PRAGMA ${sql}`);
  }

  exec(sql) {
    return this.rawDb.exec(sql);
  }

  prepare(sql) {
    const stmt = this.rawDb.prepare(sql);
    return {
      get: (...args) => stmt.get(...args),
      all: (...args) => stmt.all(...args),
      run: (...args) => {
        const res = stmt.run(...args);
        return {
          lastInsertRowid: Number(res.lastInsertRowid),
          changes: Number(res.changes),
        };
      },
    };
  }

  transaction(fn) {
    return (...args) => {
      this.rawDb.exec('BEGIN');
      try {
        const result = fn(...args);
        this.rawDb.exec('COMMIT');
        return result;
      } catch (err) {
        this.rawDb.exec('ROLLBACK');
        throw err;
      }
    };
  }
}

export const db = new SQLiteWrapper(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  search_keyword TEXT NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS drive_time_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  minutes INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS site_text (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

// Seed default categories / drive-time options / site text ONLY if tables are empty.
// These are seed data the admin can freely edit/delete afterward — not hardcoded
// search results, and not a substitute for the admin's own configuration.
const categoryCount = db.prepare('SELECT COUNT(*) AS c FROM categories').get().c;
if (categoryCount === 0) {
  const insert = db.prepare(
    'INSERT INTO categories (label, search_keyword, is_custom, enabled, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  const defaults = [
    ['餐廳', '餐廳', 0],
    ['火鍋', '火鍋', 0],
    ['麵店', '麵店', 0],
    ['便利商店', '便利商店', 0],
    ['速食', '速食', 0],
    ['自訂', '', 1],
  ];
  defaults.forEach(([label, kw, isCustom], i) => insert.run(label, kw, isCustom, 1, i));
}

const driveTimeCount = db.prepare('SELECT COUNT(*) AS c FROM drive_time_options').get().c;
if (driveTimeCount === 0) {
  const insert = db.prepare(
    'INSERT INTO drive_time_options (minutes, enabled, sort_order) VALUES (?, ?, ?)'
  );
  [10, 15, 20, 30, 45, 60].forEach((m, i) => insert.run(m, 1, i));
}

const siteTextDefaults = {
  title: '下山慶功宴搜尋｜登山口附近餐廳與便利商店',
  meta_description: '輸入登山口名稱，透過 Google Maps 搜尋附近的餐廳、火鍋、麵店、便利商店等地點，依開車時間篩選。',
  search_button: '搜尋',
  no_results: '找不到符合條件的地點',
  no_results_hint: '可以嘗試擴大車程時間、更換搜尋類別，或修改搜尋關鍵字。',
  trailhead_placeholder: '',
};
const upsertText = db.prepare(
  'INSERT INTO site_text (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING'
);
Object.entries(siteTextDefaults).forEach(([k, v]) => upsertText.run(k, v));
