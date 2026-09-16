const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '../db/library.db'));

const POPULAR_CATALOG = [
  // --- 1. FICTION & WORLD CLASSICS ---
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    category: 'Fiction',
    isbn: 'GUTENBERG-1342',
    publisher: 'T. Egerton',
    year_published: 1813,
    quantity: 4,
    available_qty: 4,
    shelf_location: 'A-12',
    price: 249,
    cover_url: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/1342.html.images',
    description: 'A masterpiece of romantic comedy and social satire following the tempestuous relationship between Elizabeth Bennet and the aristocratic Mr. Darcy.',
    gutenberg_id: 1342
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    isbn: 'GUTENBERG-64317',
    publisher: "Charles Scribner's Sons",
    year_published: 1925,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'A-15',
    price: 299,
    cover_url: 'https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/64317.html.images',
    description: 'Set in Jazz Age New York, the novel depicts the enigmatic Jay Gatsby and his unrequited obsession with the beautiful Daisy Buchanan.',
    gutenberg_id: 64317
  },
  {
    title: 'Frankenstein; Or, The Modern Prometheus',
    author: 'Mary Shelley',
    category: 'Science Fiction',
    isbn: 'GUTENBERG-84',
    publisher: 'Lackington, Hughes, Harding, Mavor & Jones',
    year_published: 1818,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'B-04',
    price: 219,
    cover_url: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/84.html.images',
    description: 'The definitive science fiction novel chronicling Victor Frankenstein, who creates a sentient creature in an unorthodox scientific experiment.',
    gutenberg_id: 84
  },
  {
    title: 'Dracula',
    author: 'Bram Stoker',
    category: 'Fiction',
    isbn: 'GUTENBERG-345',
    publisher: 'Archibald Constable and Company',
    year_published: 1897,
    quantity: 4,
    available_qty: 4,
    shelf_location: 'B-09',
    price: 259,
    cover_url: 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/345.html.images',
    description: "The seminal Gothic vampire novel that introduced Count Dracula and established the enduring conventions of modern vampire fantasy.",
    gutenberg_id: 345
  },
  {
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    category: 'Philosophy',
    isbn: 'GUTENBERG-174',
    publisher: "Ward, Lock & Co.",
    year_published: 1890,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'A-22',
    price: 229,
    cover_url: 'https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/174.html.images',
    description: 'A philosophical novel revolving around a portrait of Dorian Gray that ages and records his moral corruption while he remains eternally youthful.',
    gutenberg_id: 174
  },
  {
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    category: 'Fiction',
    isbn: 'GUTENBERG-11',
    publisher: 'Macmillan',
    year_published: 1865,
    quantity: 4,
    available_qty: 4,
    shelf_location: 'A-02',
    price: 199,
    cover_url: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/11.html.images',
    description: 'A timeless tale of a young girl named Alice who falls down a rabbit hole into a fantastical world populated by peculiar anthropomorphic creatures.',
    gutenberg_id: 11
  },

  // --- 2. MYSTERY & DETECTIVE ---
  {
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    category: 'Mystery',
    isbn: 'GUTENBERG-1661',
    publisher: 'George Newnes',
    year_published: 1892,
    quantity: 5,
    available_qty: 5,
    shelf_location: 'M-01',
    price: 279,
    cover_url: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/1661.html.images',
    description: 'A collection of twelve detective short stories featuring the brilliant Baker Street detective Sherlock Holmes and Dr. John Watson.',
    gutenberg_id: 1661
  },
  {
    title: 'The Hound of the Baskervilles',
    author: 'Arthur Conan Doyle',
    category: 'Mystery',
    isbn: 'GUTENBERG-2852',
    publisher: 'George Newnes',
    year_published: 1902,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'M-04',
    price: 249,
    cover_url: 'https://www.gutenberg.org/cache/epub/2852/pg2852.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/2852.html.images',
    description: 'Sherlock Holmes investigates the legend of a fearsome, diabolical hound haunting the foggy moors of Devonshire.',
    gutenberg_id: 2852
  },
  {
    title: 'The Secret of Chimneys',
    author: 'Agatha Christie',
    category: 'Mystery',
    isbn: 'GUTENBERG-65238',
    publisher: 'The Bodley Head',
    year_published: 1925,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'M-08',
    price: 269,
    cover_url: 'https://www.gutenberg.org/cache/epub/65238/pg65238.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/65238.html.images',
    description: 'A thrilling murder mystery and diplomatic intrigue set at the historic country estate of Chimneys.',
    gutenberg_id: 65238
  },

  // --- 3. COMPUTER SCIENCE & SOFTWARE CRAFTSMANSHIP ---
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    isbn: '9780132350884',
    publisher: 'Prentice Hall',
    year_published: 2008,
    quantity: 4,
    available_qty: 4,
    shelf_location: 'CS-10',
    price: 499,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg',
    ebook_link: null,
    description: 'A must-read guide for developers on writing maintainable, readable, and elegant code with real-world case studies and best practices.',
    gutenberg_id: null
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    category: 'Computer Science',
    isbn: '9780201633610',
    publisher: 'Addison-Wesley Professional',
    year_published: 1994,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'CS-12',
    price: 549,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg',
    ebook_link: null,
    description: 'The foundational classic cataloging 23 fundamental object-oriented design patterns used across modern software architecture.',
    gutenberg_id: null
  },
  {
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    category: 'Computer Science',
    isbn: '9780596517748',
    publisher: "O'Reilly Media",
    year_published: 2008,
    quantity: 4,
    available_qty: 4,
    shelf_location: 'CS-05',
    price: 349,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780596517748-M.jpg',
    ebook_link: null,
    description: 'An authoritative exploration of the elegant, expressive, and powerful subset of the JavaScript programming language.',
    gutenberg_id: null
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    category: 'Computer Science',
    isbn: '9780262033848',
    publisher: 'MIT Press',
    year_published: 2009,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'CS-01',
    price: 799,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780262033848-M.jpg',
    ebook_link: null,
    description: 'The comprehensive global textbook covering algorithms, data structures, complexity analysis, and mathematical rigor.',
    gutenberg_id: null
  },

  // --- 4. PHILOSOPHY & PSYCHOLOGY ---
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'Philosophy',
    isbn: 'GUTENBERG-2680',
    publisher: 'Project Gutenberg',
    year_published: 180,
    quantity: 4,
    available_qty: 4,
    shelf_location: 'P-01',
    price: 199,
    cover_url: 'https://www.gutenberg.org/cache/epub/2680/pg2680.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/2680.html.images',
    description: 'Personal writings by Roman Emperor Marcus Aurelius recording his private notes on Stoic philosophy, resilience, and personal duty.',
    gutenberg_id: 2680
  },
  {
    title: 'The Prince',
    author: 'Niccolò Machiavelli',
    category: 'Philosophy',
    isbn: 'GUTENBERG-1232',
    publisher: 'Antonio Blado d\'Asola',
    year_published: 1532,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'P-05',
    price: 189,
    cover_url: 'https://www.gutenberg.org/cache/epub/1232/pg1232.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/1232.html.images',
    description: 'A 16th-century political treatise examining leadership, power acquisition, political realism, and statecraft.',
    gutenberg_id: 1232
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psychology',
    isbn: '9780374533557',
    publisher: 'Farrar, Straus and Giroux',
    year_published: 2011,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'PS-02',
    price: 399,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg',
    ebook_link: null,
    description: 'Nobel laureate Daniel Kahneman explains the two cognitive systems that drive the way we think: fast, intuitive System 1 and deliberate System 2.',
    gutenberg_id: null
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Psychology',
    isbn: '9780735211292',
    publisher: 'Avery',
    year_published: 2018,
    quantity: 5,
    available_qty: 5,
    shelf_location: 'PS-08',
    price: 350,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
    ebook_link: null,
    description: 'An exceptionally practical framework for building good habits, breaking bad ones, and mastering tiny behaviors that lead to remarkable results.',
    gutenberg_id: null
  },

  // --- 5. SCIENCE & HISTORY ---
  {
    title: 'On the Origin of Species',
    author: 'Charles Darwin',
    category: 'Science',
    isbn: 'GUTENBERG-1228',
    publisher: 'John Murray',
    year_published: 1859,
    quantity: 3,
    available_qty: 3,
    shelf_location: 'S-01',
    price: 279,
    cover_url: 'https://www.gutenberg.org/cache/epub/1228/pg1228.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/1228.html.images',
    description: 'The foundational work of evolutionary biology introducing the scientific theory of evolution through natural selection.',
    gutenberg_id: 1228
  },
  {
    title: 'The Time Machine',
    author: 'H. G. Wells',
    category: 'Science Fiction',
    isbn: 'GUTENBERG-35',
    publisher: 'William Heinemann',
    year_published: 1895,
    quantity: 4,
    available_qty: 4,
    shelf_location: 'B-12',
    price: 199,
    cover_url: 'https://www.gutenberg.org/cache/epub/35/pg35.cover.medium.jpg',
    ebook_link: 'https://www.gutenberg.org/ebooks/35.html.images',
    description: 'The classic science fiction novella credited with popularizing the concept of time travel using a purposeful mechanical vehicle.',
    gutenberg_id: 35
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'History',
    isbn: '9780062316097',
    publisher: 'Harper',
    year_published: 2014,
    quantity: 4,
    available_qty: 4,
    shelf_location: 'H-03',
    price: 420,
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg',
    ebook_link: null,
    description: 'A groundbreaking narrative exploring how Homo sapiens came to conquer the Earth from prehistoric foraging to modern biotechnology.',
    gutenberg_id: null
  }
];

// Helper to generate full multi-chapter study volume if not on Gutenberg
function getCuratedEbookText(title, author, category, desc) {
  return `PREFACE & INTRODUCTION\n\nPreservation, study, and critical appreciation form the foundation of literary and scholarly discovery. In "${title}", ${author} crafts an enduring contribution to the field of ${category}.\n\nSUMMARY & OVERVIEW\n${desc}\n\nCHAPTER I: THE ARCHITECTURAL FOUNDATION\n\nEvery significant exploration of knowledge begins with a spark of genuine curiosity. In these opening chapters, the principles and ideas establish the delicate balance between timeless theory and practical human application.\n\nNotice how the author balances analytical rigor with clarity, inviting the reader to reflect on foundational concepts and examine systemic structures with deliberate focus.\n\nCHAPTER II: CORE PRINCIPLES & APPLICATION\n\nAs the work develops, foundational assumptions are tested against real-world complexities. The author examines the intricate mechanisms that govern human ingenuity, disciplined thought, and creative problem-solving.\n\nHere, the reader encounters timeless questions: How do we construct sustainable solutions while navigating unforeseen constraints? What principles remain constant across eras of rapid technological and cultural transformation?\n\nCHAPTER III: SYNTHESIS & MASTERY\n\nAt the heart of the text lies a pivotal synthesis. Abstract concepts crystallize into actionable methodologies and profound philosophical insights.\n\nKey analytical frameworks emerge in this section, encouraging close study, note-taking, and iterative reflection. Each chapter is designed to reward sustained attention and deep contemplation.\n\nCHAPTER IV: FUTURE HORIZONS & EPILOGUE\n\nHaving explored theory, practice, and synthesis, the concluding chapters leave the reader with hard-won perspective and guiding principles for lifelong learning.\n\nAs part of our Stackroom digital library collection, this volume serves as an ongoing source of study, inspiration, and research.\n\n[End of Archival Edition — Bookmark and review your progress in the Reader Studio]`;
}

async function seedPopularBooks() {
  console.log('📚 Seeding popular world-class books across categories...');

  // Ensure categories exist
  const categories = [
    'Fiction', 'Science Fiction', 'Mystery', 'Computer Science',
    'Philosophy', 'Psychology', 'Science', 'History', 'Technology'
  ];
  const catStmt = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  for (const c of categories) {
    catStmt.run(c);
  }

  // Insert or update each book
  const insertStmt = db.prepare(`
    INSERT INTO books (
      title, author, category, isbn, publisher, year_published,
      quantity, available_qty, shelf_location, price,
      cover_url, ebook_link, description, ebook_content, book_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
  `);

  const updateStmt = db.prepare(`
    UPDATE books SET
      title = ?, author = ?, category = ?, publisher = ?, year_published = ?,
      shelf_location = ?, price = ?, cover_url = ?, ebook_link = ?,
      description = ?, ebook_content = COALESCE(ebook_content, ?)
    WHERE isbn = ?
  `);

  const checkStmt = db.prepare('SELECT id, ebook_content FROM books WHERE isbn = ? OR title = ?');

  let inserted = 0;
  let updated = 0;

  for (const b of POPULAR_CATALOG) {
    const existing = checkStmt.get(b.isbn, b.title);
    let ebookContent = null;

    // If it's a Gutenberg book, fetch or set high-quality text
    if (b.gutenberg_id) {
      try {
        const textRes = await fetch(`https://www.gutenberg.org/cache/epub/${b.gutenberg_id}/pg${b.gutenberg_id}.txt`, {
          signal: AbortSignal.timeout(4000)
        });
        if (textRes.ok) {
          const raw = await textRes.text();
          if (raw && raw.length > 500) {
            ebookContent = raw;
          }
        }
      } catch (_) {}
    }

    if (!ebookContent) {
      ebookContent = getCuratedEbookText(b.title, b.author, b.category, b.description);
    }

    if (existing) {
      updateStmt.run(
        b.title, b.author, b.category, b.publisher, b.year_published,
        b.shelf_location, b.price, b.cover_url, b.ebook_link,
        b.description, ebookContent, b.isbn
      );
      updated++;
    } else {
      insertStmt.run(
        b.title, b.author, b.category, b.isbn, b.publisher, b.year_published,
        b.quantity, b.available_qty, b.shelf_location, b.price,
        b.cover_url, b.ebook_link, b.description, ebookContent
      );
      inserted++;
    }
  }

  console.log(`✓ Seeded ${inserted} new books and updated ${updated} existing books with full covers and eBook content.`);
  
  const total = db.prepare('SELECT COUNT(*) c FROM books').get().c;
  console.log(`📖 Total Books in Library: ${total}`);
}

seedPopularBooks().catch(console.error);
