const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../db/library.db');
const db = new Database(dbPath);

console.log('🧹 Resetting Library Database to Clean Production State...');

// 1. Clear all transaction & test activity tables
db.exec(`
  DELETE FROM transactions;
  DELETE FROM reservations;
  DELETE FROM reviews;
  DELETE FROM wishlists;
  DELETE FROM audit_log;
  DELETE FROM notifications;
  DELETE FROM reading_progress;
  DELETE FROM wallet_transactions;
  DELETE FROM marketplace_books;
  DELETE FROM book_purchases;
`);
console.log('✓ Cleared all historical borrowings, reservations, reviews, wallet records, and logs.');

// 2. Reset all books to full available quantities
db.exec(`
  UPDATE books SET
    available_qty = quantity,
    book_status = 'available'
`);
console.log('✓ Reset all book inventory: available_qty = quantity for all books.');

// 3. Reset user accounts to clean baseline
db.exec(`
  DELETE FROM users WHERE email NOT IN ('admin@library.com', 'member@library.com');
  UPDATE users SET wallet_balance = 2500, max_books = 999 WHERE role = 'admin';
  UPDATE users SET wallet_balance = 1200, max_books = 3 WHERE role = 'member';
`);
console.log('✓ Cleaned user accounts (Admin: admin@library.com, Member: member@library.com).');

// 4. Vacuum and optimize SQLite database
db.exec('VACUUM;');

const stats = {
  books: db.prepare('SELECT COUNT(*) c FROM books').get().c,
  users: db.prepare('SELECT COUNT(*) c FROM users').get().c,
  transactions: db.prepare('SELECT COUNT(*) c FROM transactions').get().c,
  wallet_transactions: db.prepare('SELECT COUNT(*) c FROM wallet_transactions').get().c
};

console.log('\n✨ Database is now 100% fresh and clean for deployment:');
console.table(stats);
