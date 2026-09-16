const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.warn('⚠️ better-sqlite3 not available in this environment. Using mock/memory fallback.');
  Database = class MockDatabase {
    constructor() {}
    pragma() {}
    exec() {}
    prepare() {
      return {
        get: () => ({ c: 0 }),
        all: () => [],
        run: () => ({ changes: 0, lastInsertRowid: 1 })
      };
    }
  };
}

let dbPath = path.join(__dirname, 'library.db');
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/library.db';
  try {
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, tmpDbPath);
    }
  } catch (_) {}
  dbPath = tmpDbPath;
}

let db;
try {
  db = new Database(dbPath);
  if (db.pragma) {
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
} catch (e) {
  console.warn('⚠️ SQLite initialization warning:', e.message);
  db = new Database(null);
}

// ---------- SCHEMA (non-destructive, all IF NOT EXISTS) ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','member')) DEFAULT 'member',
  max_books INTEGER DEFAULT 3,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  publisher TEXT,
  category TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  available_qty INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL REFERENCES books(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  return_date TEXT,
  fine INTEGER DEFAULT 0,
  fine_paid INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued' CHECK(status IN ('issued','returned')),
  renewed_count INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL REFERENCES books(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  reserved_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting','fulfilled','cancelled')),
  notified INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL REFERENCES books(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(book_id, user_id)
);
CREATE TABLE IF NOT EXISTS wishlists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL REFERENCES books(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(book_id, user_id)
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  details TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS reading_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  book_id INTEGER NOT NULL REFERENCES books(id),
  progress_pct INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, book_id)
);
`);

// Safe ALTER TABLE for upgrading existing databases
// Safe ALTER TABLE for upgrading existing databases
function safeAlter(sql) {
  try { db.exec(sql); } catch (_) { /* column already exists — safe to ignore */ }
}
safeAlter(`ALTER TABLE users ADD COLUMN phone TEXT`);
safeAlter(`ALTER TABLE users ADD COLUMN sub_role TEXT DEFAULT 'member'`);
safeAlter(`ALTER TABLE users ADD COLUMN dark_mode INTEGER DEFAULT 0`);
safeAlter(`ALTER TABLE users ADD COLUMN wallet_balance INTEGER DEFAULT 500`);
safeAlter(`ALTER TABLE books ADD COLUMN shelf_location TEXT`);
safeAlter(`ALTER TABLE books ADD COLUMN year_published INTEGER`);
safeAlter(`ALTER TABLE books ADD COLUMN description TEXT`);
safeAlter(`ALTER TABLE books ADD COLUMN cover_url TEXT`);
safeAlter(`ALTER TABLE books ADD COLUMN ebook_link TEXT`);
safeAlter(`ALTER TABLE books ADD COLUMN book_status TEXT DEFAULT 'available'`);
safeAlter(`ALTER TABLE books ADD COLUMN price INTEGER DEFAULT 299`);
safeAlter(`ALTER TABLE books ADD COLUMN ebook_content TEXT`);
safeAlter(`ALTER TABLE transactions ADD COLUMN notes TEXT`);

// Additional Tables for Marketplace, Wallet, and Purchases
db.exec(`
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK(type IN ('credit','debit')),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS marketplace_books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT,
  price INTEGER NOT NULL,
  condition TEXT DEFAULT 'good' CHECK(condition IN ('new','like_new','good','fair')),
  description TEXT,
  cover_url TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','sold','delisted')),
  buyer_id INTEGER REFERENCES users(id),
  sold_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS book_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  book_id INTEGER REFERENCES books(id),
  marketplace_id INTEGER REFERENCES marketplace_books(id),
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  purchase_type TEXT NOT NULL CHECK(purchase_type IN ('library_sale','marketplace')),
  payment_method TEXT DEFAULT 'wallet',
  status TEXT DEFAULT 'completed',
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// ---------- CONSTANTS ----------
const FINE_PER_DAY = 5;   // ₹ per day
const LOAN_DAYS   = 14;   // default loan period
const MAX_RENEWALS = 1;   // max renewals per loan

// ---------- SEED (only if fresh database) ----------
try {
  const userCount = db.prepare('SELECT COUNT(*) c FROM users').get()?.c || 0;
  if (userCount === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (name,email,password,role,max_books,wallet_balance) VALUES (?,?,?,?,?,?)'
    );
    insertUser.run('Library Admin',  'admin@library.com',  bcrypt.hashSync('admin123',  8), 'admin',  999, 2500);
    insertUser.run('Vinay Kumar',    'member@library.com', bcrypt.hashSync('member123', 8), 'member', 3,   1200);

    const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
    [
      'Fiction','Science Fiction','Mystery','Computer Science',
      'History','Philosophy','Psychology','Science','Technology',
    ].forEach(c => insertCat.run(c));
  }

  const bookCount = db.prepare('SELECT COUNT(*) c FROM books').get()?.c || 0;
  if (bookCount === 0) {
    const insertBook = db.prepare(`
      INSERT INTO books (title, author, category, isbn, publisher, year_published, quantity, available_qty, shelf_location, price, cover_url, ebook_link, description, book_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `);
    const seedCatalog = [
      ['Pride and Prejudice', 'Jane Austen', 'Fiction', 'GUTENBERG-1342', 'T. Egerton', 1813, 4, 4, 'A-12', 249, 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg', 'https://www.gutenberg.org/ebooks/1342.html.images', 'A timeless romantic comedy depicting Elizabeth Bennet and Mr. Darcy.'],
      ['The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'GUTENBERG-64317', "Charles Scribner's Sons", 1925, 3, 3, 'A-15', 299, 'https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg', 'https://www.gutenberg.org/ebooks/64317.html.images', 'The story of Jay Gatsby and his passion for Daisy Buchanan in the Jazz Age.'],
      ['Frankenstein; Or, The Modern Prometheus', 'Mary Shelley', 'Science Fiction', 'GUTENBERG-84', 'Lackington', 1818, 3, 3, 'B-04', 219, 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg', 'https://www.gutenberg.org/ebooks/84.html.images', 'The definitive science fiction classic of Victor Frankenstein and his creature.'],
      ['Dracula', 'Bram Stoker', 'Fiction', 'GUTENBERG-345', 'Constable', 1897, 4, 4, 'B-09', 259, 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg', 'https://www.gutenberg.org/ebooks/345.html.images', 'The legendary Gothic horror novel of Count Dracula and Professor Van Helsing.'],
      ['The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', 'Mystery', 'GUTENBERG-1661', 'George Newnes', 1892, 5, 5, 'M-01', 279, 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg', 'https://www.gutenberg.org/ebooks/1661.html.images', 'Twelve detective mysteries featuring Sherlock Holmes and Dr. John Watson.'],
      ['Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Computer Science', '9780132350884', 'Prentice Hall', 2008, 4, 4, 'CS-10', 499, 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg', null, 'Essential software craftsmanship principles for writing clean, readable code.'],
      ['Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 'Computer Science', '9780201633610', 'Addison-Wesley', 1994, 3, 3, 'CS-12', 549, 'https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg', null, 'Foundational catalog of 23 object-oriented software design patterns.'],
      ['Atomic Habits', 'James Clear', 'Psychology', '9780735211292', 'Avery', 2018, 5, 5, 'PS-08', 350, 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg', null, 'Practical framework for building lasting positive habits and continuous improvement.'],
      ['Meditations', 'Marcus Aurelius', 'Philosophy', 'GUTENBERG-2680', 'Gutenberg', 180, 4, 4, 'P-01', 199, 'https://www.gutenberg.org/cache/epub/2680/pg2680.cover.medium.jpg', 'https://www.gutenberg.org/ebooks/2680.html.images', 'Private reflections on Stoic philosophy, personal discipline, and virtue.'],
      ['Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'History', '9780062316097', 'Harper', 2014, 4, 4, 'H-03', 420, 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg', null, 'A sweeping narrative exploring how Homo sapiens conquered planet Earth.']
    ];
    seedCatalog.forEach(row => insertBook.run(...row));
  }
} catch (e) {
  console.warn('⚠️ Seeding note:', e.message);
}

// Ensure default prices and eBook content exist on all books if upgraded
safeAlter(`UPDATE books SET price = 299 WHERE price IS NULL`);
safeAlter(`UPDATE users SET wallet_balance = 1200 WHERE wallet_balance IS NULL OR wallet_balance = 0`);

module.exports = { db, FINE_PER_DAY, LOAN_DAYS, MAX_RENEWALS };


