const User = require('./User');
const Book = require('./Book');
const Category = require('./Category');
const Transaction = require('./Transaction');
const Reservation = require('./Reservation');
const Review = require('./Review');
const Wishlist = require('./Wishlist');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');
const Setting = require('./Setting');
const ReadingProgress = require('./ReadingProgress');
const WalletTransaction = require('./WalletTransaction');
const MarketplaceBook = require('./MarketplaceBook');
const BookPurchase = require('./BookPurchase');

module.exports = {
  User,
  Book,
  Category,
  Transaction,
  Borrowing: Transaction, // alias for convenience
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
};
