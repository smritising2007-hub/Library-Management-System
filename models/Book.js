const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  sqlite_id: { type: Number, index: true },
  title: { type: String, required: true, trim: true, index: true },
  author: { type: String, required: true, trim: true, index: true },
  isbn: { type: String, trim: true, default: '' },
  publisher: { type: String, default: '' },
  category: { type: String, default: 'General', index: true },
  quantity: { type: Number, default: 1, min: 0 },
  available_qty: { type: Number, default: 1, min: 0 },
  shelf_location: { type: String, default: 'A1' },
  year_published: { type: Number, default: null },
  description: { type: String, default: '' },
  cover_url: { type: String, default: null },
  ebook_link: { type: String, default: null },
  ebook_content: { type: String, default: null },
  book_status: { type: String, enum: ['available', 'borrowed', 'reserved', 'maintenance'], default: 'available' },
  price: { type: Number, default: 299 },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookSchema.index({ title: 'text', author: 'text', category: 'text', description: 'text' });

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
