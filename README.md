# Stackroom — Modern Library Management System

A high-performance Library Management System built with a Node.js/Express backend, dual-database architecture (**SQLite WAL Engine** + **MongoDB & Mongoose ODM**), and a rich vanilla HTML/CSS/JS frontend.

---

## 🚀 Features

- **Dual Database Storage**: High-speed local SQLite WAL mode + MongoDB / MongoDB Atlas cloud synchronization.
- **1-Click Data Migration**: Seamlessly transfer all users, books, loans, reviews, and logs between SQLite and MongoDB.
- **eBook Studio Reader**: Multi-chapter in-browser reader with automatic pagination, chapter index, and reading progress telemetry.
- **Project Gutenberg API**: 1-click import of 70,000+ timeless public-domain classics via RapidAPI.
- **Google Books & OpenLibrary Autocomplete**: Instant ISBN/Title cataloging with cover art retrieval.
- **Peer-to-Peer Marketplace & Wallet**: Buy, sell, or rent used books using the built-in digital wallet system.
- **Circulation & Due-Date Reminders**: 14-day loan lifecycle, automated late fines, renewals, and reservation waitlists.

---

## 🍃 MongoDB Configuration

Stackroom supports both **local MongoDB** and **MongoDB Atlas** cloud clusters.

### 1. Configure `.env`
Create or edit your `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your-secret-key

# Local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/library_management

# MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/library_management?retryWrites=true&w=majority

RAPIDAPI_GUTENBERG_KEY=bee57f22e6msh3fdbb0e121225dbp1b767bjsn1e6527bce86e
RAPIDAPI_GUTENBERG_HOST=project-gutenberg-free-books-api1.p.rapidapi.com
```

### 2. Run Data Migration (SQLite → MongoDB)
Migrate all your existing SQLite books, users, and borrowing history into MongoDB:

```bash
# Dry-run verification (no writes):
node scripts/migrate-to-mongo.js --dry-run

# Full live migration:
node scripts/migrate-to-mongo.js

# Custom MongoDB target URI:
node scripts/migrate-to-mongo.js --uri="mongodb+srv://user:pass@cluster.mongodb.net/library"
```

You can also trigger migration with **1-click from the Admin Settings UI** (`Settings` → `Database Architecture & MongoDB`).

---

## 📁 Project Structure

```
library-management-system/
├── server.js                  # Express backend + all REST API endpoints
├── .env                       # Environment variables (MongoDB URI, JWT secret)
├── .env.example               # Sample environment config template
├── db/
│   ├── database.js            # SQLite schema, indices, WAL mode
│   ├── mongo.js               # MongoDB connection manager & latency monitor
│   └── library.db             # Local SQLite database
├── models/                    # Mongoose Schemas & Models
│   ├── User.js                # Users & authentication
│   ├── Book.js                # Books & eBook content
│   ├── Transaction.js         # Circulation, borrowings, fines
│   ├── Category.js            # Subject categories
│   ├── Reservation.js         # Waitlist & hold requests
│   ├── Review.js              # Ratings & reviews
│   ├── Wishlist.js            # User wishlists
│   ├── AuditLog.js            # Security audit logs
│   ├── Notification.js        # Member notification system
│   ├── Setting.js             # Key-value dynamic settings
│   ├── ReadingProgress.js     # eBook reading progress tracking
│   ├── WalletTransaction.js   # Digital wallet ledger
│   ├── MarketplaceBook.js     # Peer-to-peer marketplace listings
│   ├── BookPurchase.js        # Book order transactions
│   └── index.js               # Clean exports of all models
├── scripts/
│   └── migrate-to-mongo.js    # SQLite to MongoDB migration utility
├── public/
│   └── index.html             # Frontend SPA (HTML/CSS/JS, no build step)
├── package.json
└── README.md
```

---

## 🔑 Demo Logins

| Role | Email | Password |
|---|---|---|
| **Admin (Librarian)** | `admin@library.com` | `admin123` |
| **Member** | `member@library.com` | `member123` |

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & Express
- **Databases**: SQLite (better-sqlite3 WAL mode) + MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **APIs**: RapidAPI Project Gutenberg API + Google Books API / OpenLibrary
- **Frontend**: Vanilla HTML5, CSS3 Variables, JavaScript ES6+
