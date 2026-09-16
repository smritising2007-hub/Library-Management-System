require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const { connectMongo, mongoose } = require('../db/mongo');
const {
  User,
  Book,
  Category,
  Transaction,
  Reservation,
  Review,
  Wishlist,
  AuditLog,
  Notification,
  Setting,
  ReadingProgress,
  WalletTransaction,
  MarketplaceBook,
  BookPurchase
} = require('../models');

async function migrateSqliteToMongo(options = {}) {
  const sqliteDbPath = options.sqliteDbPath || path.join(__dirname, '../db/library.db');
  const mongoUri = options.mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_management';
  const dryRun = !!options.dryRun;

  console.log('🚀 Starting SQLite to MongoDB Migration...');
  console.log(`📁 SQLite Path: ${sqliteDbPath}`);
  console.log(`🍃 Target MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
  if (dryRun) console.log('🔍 DRY RUN MODE: No data will be written to MongoDB.');

  const sqlite = new Database(sqliteDbPath, { readonly: true });
  
  let conn = null;
  if (!dryRun) {
    conn = await connectMongo(mongoUri);
    if (!conn) {
      throw new Error(`Failed to connect to MongoDB at ${mongoUri}. Please ensure MongoDB is running or check your connection string.`);
    }
  }

  const results = {
    users: 0,
    categories: 0,
    books: 0,
    transactions: 0,
    reservations: 0,
    reviews: 0,
    wishlists: 0,
    audit_logs: 0,
    notifications: 0,
    settings: 0,
    reading_progress: 0,
    wallet_transactions: 0,
    marketplace_books: 0,
    book_purchases: 0
  };

  try {
    // Helper to safely query tables that might be empty or missing
    function getTableRows(tableName) {
      try {
        return sqlite.prepare(`SELECT * FROM ${tableName}`).all();
      } catch (e) {
        return [];
      }
    }

    // 1. Migrate Users
    console.log('\n👤 Migrating Users...');
    const users = getTableRows('users');
    const userIdMap = new Map(); // sqlite_id -> mongo _id

    for (const u of users) {
      if (!dryRun) {
        let doc = await User.findOne({ email: u.email.toLowerCase() });
        if (!doc) {
          doc = new User({
            sqlite_id: u.id,
            name: u.name,
            email: u.email.toLowerCase(),
            password: u.password,
            role: u.role || 'member',
            sub_role: u.sub_role || 'member',
            max_books: u.max_books ?? 3,
            phone: u.phone || null,
            dark_mode: u.dark_mode ?? 0,
            wallet_balance: u.wallet_balance ?? 1200,
            created_at: u.created_at ? new Date(u.created_at) : new Date()
          });
          await doc.save();
        }
        userIdMap.set(u.id, doc._id);
      }
      results.users++;
    }
    console.log(`✓ Processed ${results.users} users`);

    // 2. Migrate Categories
    console.log('\n🏷️ Migrating Categories...');
    const categories = getTableRows('categories');
    for (const cat of categories) {
      if (!dryRun) {
        await Category.findOneAndUpdate(
          { name: cat.name },
          { sqlite_id: cat.id, name: cat.name },
          { upsert: true }
        );
      }
      results.categories++;
    }
    console.log(`✓ Processed ${results.categories} categories`);

    // 3. Migrate Books
    console.log('\n📚 Migrating Books...');
    const books = getTableRows('books');
    const bookIdMap = new Map(); // sqlite_id -> mongo _id

    for (const b of books) {
      if (!dryRun) {
        let doc = await Book.findOne({
          $or: [
            { sqlite_id: b.id },
            { isbn: b.isbn && b.isbn.trim() !== '' ? b.isbn : '__none__' },
            { title: b.title, author: b.author }
          ]
        });

        if (!doc) {
          doc = new Book({
            sqlite_id: b.id,
            title: b.title,
            author: b.author,
            isbn: b.isbn || '',
            publisher: b.publisher || '',
            category: b.category || 'General',
            quantity: b.quantity ?? 1,
            available_qty: b.available_qty ?? 1,
            shelf_location: b.shelf_location || 'A1',
            year_published: b.year_published || null,
            description: b.description || '',
            cover_url: b.cover_url || null,
            ebook_link: b.ebook_link || null,
            ebook_content: b.ebook_content || null,
            book_status: b.book_status || 'available',
            price: b.price ?? 299,
            created_at: b.created_at ? new Date(b.created_at) : new Date()
          });
          await doc.save();
        }
        bookIdMap.set(b.id, doc._id);
      }
      results.books++;
    }
    console.log(`✓ Processed ${results.books} books`);

    // 4. Migrate Transactions
    console.log('\n📖 Migrating Transactions (Borrowings)...');
    const transactions = getTableRows('transactions');
    for (const tr of transactions) {
      if (!dryRun) {
        const mongoUserId = userIdMap.get(tr.user_id);
        const mongoBookId = bookIdMap.get(tr.book_id);

        const exists = await Transaction.findOne({ sqlite_id: tr.id });
        if (!exists) {
          await Transaction.create({
            sqlite_id: tr.id,
            user: mongoUserId || null,
            sqlite_user_id: tr.user_id,
            book: mongoBookId || null,
            sqlite_book_id: tr.book_id,
            issue_date: tr.issue_date,
            due_date: tr.due_date,
            return_date: tr.return_date || null,
            fine: tr.fine || 0,
            fine_paid: tr.fine_paid || 0,
            status: tr.status || 'issued',
            renewed_count: tr.renewed_count || 0,
            notes: tr.notes || '',
            created_at: tr.created_at ? new Date(tr.created_at) : new Date()
          });
        }
      }
      results.transactions++;
    }
    console.log(`✓ Processed ${results.transactions} transactions`);

    // 5. Migrate Reservations
    console.log('\n⏳ Migrating Reservations...');
    const reservations = getTableRows('reservations');
    for (const r of reservations) {
      if (!dryRun) {
        const mongoUserId = userIdMap.get(r.user_id);
        const mongoBookId = bookIdMap.get(r.book_id);

        const exists = await Reservation.findOne({ sqlite_id: r.id });
        if (!exists) {
          await Reservation.create({
            sqlite_id: r.id,
            user: mongoUserId || null,
            sqlite_user_id: r.user_id,
            book: mongoBookId || null,
            sqlite_book_id: r.book_id,
            reserved_at: r.reserved_at ? new Date(r.reserved_at) : new Date(),
            status: r.status || 'waiting',
            notified_at: r.notified ? new Date() : null
          });
        }
      }
      results.reservations++;
    }
    console.log(`✓ Processed ${results.reservations} reservations`);

    // 6. Migrate Reviews
    console.log('\n⭐ Migrating Reviews...');
    const reviews = getTableRows('reviews');
    for (const rv of reviews) {
      if (!dryRun) {
        const mongoUserId = userIdMap.get(rv.user_id);
        const mongoBookId = bookIdMap.get(rv.book_id);

        const exists = await Review.findOne({ sqlite_id: rv.id });
        if (!exists) {
          await Review.create({
            sqlite_id: rv.id,
            user: mongoUserId || null,
            sqlite_user_id: rv.user_id,
            book: mongoBookId || null,
            sqlite_book_id: rv.book_id,
            rating: rv.rating,
            comment: rv.review_text || '',
            created_at: rv.created_at ? new Date(rv.created_at) : new Date()
          });
        }
      }
      results.reviews++;
    }
    console.log(`✓ Processed ${results.reviews} reviews`);

    // 7. Migrate Wishlists
    console.log('\n❤️ Migrating Wishlists...');
    const wishlists = getTableRows('wishlists');
    for (const w of wishlists) {
      if (!dryRun) {
        const mongoUserId = userIdMap.get(w.user_id);
        const mongoBookId = bookIdMap.get(w.book_id);
        await Wishlist.findOneAndUpdate(
          { sqlite_user_id: w.user_id, sqlite_book_id: w.book_id },
          {
            sqlite_id: w.id,
            user: mongoUserId || null,
            sqlite_user_id: w.user_id,
            book: mongoBookId || null,
            sqlite_book_id: w.book_id,
            created_at: w.created_at ? new Date(w.created_at) : new Date()
          },
          { upsert: true }
        );
      }
      results.wishlists++;
    }
    console.log(`✓ Processed ${results.wishlists} wishlists`);

    // 8. Migrate Audit Logs
    console.log('\n📝 Migrating Audit Logs...');
    const logs = getTableRows('audit_log');
    for (const log of logs) {
      if (!dryRun) {
        const exists = await AuditLog.findOne({ sqlite_id: log.id });
        if (!exists) {
          await AuditLog.create({
            sqlite_id: log.id,
            user_id: log.user_id,
            user_name: log.user_name || '',
            action: log.action,
            target_type: log.target_type || null,
            target_id: log.target_id || null,
            details: log.details || '',
            created_at: log.created_at ? new Date(log.created_at) : new Date()
          });
        }
      }
      results.audit_logs++;
    }
    console.log(`✓ Processed ${results.audit_logs} audit logs`);

    // 9. Migrate Notifications
    console.log('\n🔔 Migrating Notifications...');
    const notifs = getTableRows('notifications');
    for (const n of notifs) {
      if (!dryRun) {
        const mongoUserId = userIdMap.get(n.user_id);
        const exists = await Notification.findOne({ sqlite_id: n.id });
        if (!exists) {
          await Notification.create({
            sqlite_id: n.id,
            user: mongoUserId || null,
            sqlite_user_id: n.user_id,
            title: 'Notification',
            message: n.message,
            type: n.type || 'info',
            is_read: n.is_read === 1,
            created_at: n.created_at ? new Date(n.created_at) : new Date()
          });
        }
      }
      results.notifications++;
    }
    console.log(`✓ Processed ${results.notifications} notifications`);

    // 10. Migrate Settings
    console.log('\n⚙️ Migrating Settings...');
    const settings = getTableRows('settings');
    for (const s of settings) {
      if (!dryRun) {
        await Setting.findOneAndUpdate(
          { key: s.key },
          { key: s.key, value: s.value, updated_at: s.updated_at ? new Date(s.updated_at) : new Date() },
          { upsert: true }
        );
      }
      results.settings++;
    }
    console.log(`✓ Processed ${results.settings} settings`);

    // 11. Migrate Reading Progress
    console.log('\n📖 Migrating Reading Progress...');
    const rpList = getTableRows('reading_progress');
    for (const rp of rpList) {
      if (!dryRun) {
        const mongoUserId = userIdMap.get(rp.user_id);
        const mongoBookId = bookIdMap.get(rp.book_id);
        await ReadingProgress.findOneAndUpdate(
          { sqlite_user_id: rp.user_id, sqlite_book_id: rp.book_id },
          {
            user: mongoUserId || null,
            sqlite_user_id: rp.user_id,
            book: mongoBookId || null,
            sqlite_book_id: rp.book_id,
            progress_pct: rp.progress_pct || 0,
            updated_at: rp.updated_at ? new Date(rp.updated_at) : new Date()
          },
          { upsert: true }
        );
      }
      results.reading_progress++;
    }
    console.log(`✓ Processed ${results.reading_progress} reading progress entries`);

    // 12. Migrate Wallet Transactions
    console.log('\n💳 Migrating Wallet Transactions...');
    const wtList = getTableRows('wallet_transactions');
    for (const wt of wtList) {
      if (!dryRun) {
        const mongoUserId = userIdMap.get(wt.user_id);
        const exists = await WalletTransaction.findOne({ sqlite_id: wt.id });
        if (!exists) {
          await WalletTransaction.create({
            sqlite_id: wt.id,
            user: mongoUserId || null,
            sqlite_user_id: wt.user_id,
            type: wt.type,
            amount: wt.amount,
            reason: wt.reason,
            created_at: wt.created_at ? new Date(wt.created_at) : new Date()
          });
        }
      }
      results.wallet_transactions++;
    }
    console.log(`✓ Processed ${results.wallet_transactions} wallet transactions`);

    // 13. Migrate Marketplace Books
    console.log('\n🏪 Migrating Marketplace Books...');
    const mpList = getTableRows('marketplace_books');
    const mpIdMap = new Map();
    for (const mp of mpList) {
      if (!dryRun) {
        const mongoSellerId = userIdMap.get(mp.seller_id);
        const mongoBuyerId = mp.buyer_id ? userIdMap.get(mp.buyer_id) : null;
        let doc = await MarketplaceBook.findOne({ sqlite_id: mp.id });
        if (!doc) {
          doc = await MarketplaceBook.create({
            sqlite_id: mp.id,
            seller: mongoSellerId || null,
            sqlite_seller_id: mp.seller_id,
            title: mp.title,
            author: mp.author,
            category: mp.category || 'General',
            price: mp.price,
            condition: mp.condition || 'good',
            description: mp.description || '',
            cover_url: mp.cover_url || null,
            status: mp.status || 'active',
            buyer: mongoBuyerId || null,
            sqlite_buyer_id: mp.buyer_id || null,
            sold_at: mp.sold_at ? new Date(mp.sold_at) : null,
            created_at: mp.created_at ? new Date(mp.created_at) : new Date()
          });
        }
        mpIdMap.set(mp.id, doc._id);
      }
      results.marketplace_books++;
    }
    console.log(`✓ Processed ${results.marketplace_books} marketplace books`);

    // 14. Migrate Book Purchases
    console.log('\n🛍️ Migrating Book Purchases...');
    const bpList = getTableRows('book_purchases');
    for (const bp of bpList) {
      if (!dryRun) {
        const mongoUserId = userIdMap.get(bp.user_id);
        const mongoBookId = bp.book_id ? bookIdMap.get(bp.book_id) : null;
        const mongoMpId = bp.marketplace_id ? mpIdMap.get(bp.marketplace_id) : null;
        const exists = await BookPurchase.findOne({ sqlite_id: bp.id });
        if (!exists) {
          await BookPurchase.create({
            sqlite_id: bp.id,
            user: mongoUserId || null,
            sqlite_user_id: bp.user_id,
            book: mongoBookId || null,
            sqlite_book_id: bp.book_id || null,
            marketplace_book: mongoMpId || null,
            sqlite_marketplace_id: bp.marketplace_id || null,
            title: bp.title,
            price: bp.price,
            purchase_type: bp.purchase_type,
            payment_method: bp.payment_method || 'wallet',
            status: bp.status || 'completed',
            created_at: bp.created_at ? new Date(bp.created_at) : new Date()
          });
        }
      }
      results.book_purchases++;
    }
    console.log(`✓ Processed ${results.book_purchases} book purchases`);

    console.log('\n🎉 SQLite to MongoDB Migration completed successfully!');
    console.table(results);
    return { success: true, results };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const customUriArg = args.find(a => a.startsWith('--uri='));
  const mongoUri = customUriArg ? customUriArg.split('=')[1] : process.env.MONGODB_URI;

  migrateSqliteToMongo({ dryRun, mongoUri })
    .then(() => {
      if (mongoose.connection.readyState === 1) {
        mongoose.connection.close();
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { migrateSqliteToMongo };
