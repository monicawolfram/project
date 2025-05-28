const db = require('../db');
const path = require('path');
const { body, param, query, validationResult } = require('express-validator'); // Include validationResult


exports.interface = (req, res) => {
 res.render('librarian/librarian _interface');
};
exports.librarian_home = (req, res) => {
  res.render('librarian/librarian_home');
};
exports.librarian_category = (req, res) => {
 res.render('librarian/librarian_category');
};
exports.manageinventorylibrarian = (req, res) => {
  res.render('librarian/manageinventorylibrarian');
};
exports.managefines = (req, res) => {
 res.render('librarian/managefines');
};
exports.managerequestlibrarian= (req, res) => {
 res.render('librarian/managerequestlibrarian');
};
exports.manageusers = (req, res) => {
 res.render('librarian/manageusers');
};
exports.admin_account = (req, res) => {
 res.render('librarian/admin_account');
};
exports.booknotification = (req, res) => {
 res.render('librarian/booknotification');
};
exports.generatereport = (req, res) => {
 res.render('librarian/generatereport');
};
exports.Itsupport = (req, res) => {
 res.render('librarian/Itsupport');
};
exports.librarian_account = (req, res) => {
 res.render('librarian/librarian_account');
};
exports.massageandfeedback = (req, res) => {
 res.render('librarian/massageandfeedback');
};
exports.profile = (req, res) => {
 res.render('librarian/profile');
};
exports.requestnotification = (req, res) => {
 res.render('librarian/requestnotification');
};
exports.systemnotification = (req, res) => {
 res.render('librarian/systemnotification');
};
exports.viewallnotification = (req, res) => {
 res.render('librarian/viewallnotification');
};
exports.viewandaddbook = (req, res) => {
 res.render('librarian/viewandaddbook');   
};
exports.viewandaddpaper = (req, res) => {
  res.render('librarian/viewandaddpaper');
};
exports.viewandaddproject = (req, res) => {
  res.render('librarian/viewandaddproject');
};


// Controller to get available books
exports.getAvailableBooks = async (req, res) => {
  try {
    const [results] = await db.execute(
      "SELECT id, title, author, department, shelf_no, draw_no, image FROM books WHERE status = 'available' AND is_deleted = 'no'"
    );

    const formattedResults = results.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      department: book.department,
      shelf_no: book.shelf_no,
      draw_no: book.draw_no,
      image: book.image || 'default-book.png'
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Database error' });
  }
};









// Constants
const STATUS = { ACTIVE: 'no', DELETED: 'yes' };

// Validation middleware
const validateBook = [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('book_code').notEmpty().withMessage('Book code is required'),
];

// Controller functions
exports.dashboard = async (req, res) => {
  try {
    const [stats] = await db.query('SELECT COUNT(*) as total FROM books WHERE is_deleted = ?', [STATUS.ACTIVE]);
    res.json({ message: 'Dashboard', totalBooks: stats[0].total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const { department, is_borrowed } = req.query;
    let query = 'SELECT * FROM books WHERE is_deleted = ?';
    let params = [STATUS.ACTIVE];

    if (department) { query += ' AND department = ?'; params.push(department); }
    if (is_borrowed) { query += ' AND is_borrowed = ?'; params.push(is_borrowed); }

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookById = [
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const [results] = await db.query('SELECT * FROM books WHERE id = ? AND is_deleted = ?', [req.params.id, STATUS.ACTIVE]);
      if (results.length === 0) return res.status(404).json({ error: 'Book not found' });
      res.json(results[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];



// GET: Show Add Book Form
exports.getAddBookForm = (req, res) => {
  return res.render('librarian/viewandaddbook', { messages: req.flash() });
};
exports.addBook = async (req, res) => {
  const {
    title, author, department, date_added,
    book_code, shelf_no, draw_no, year, toJson
  } = req.body;

  const book_image = req.file ? req.file.filename : null;
  const isJson = toJson === 'true';

  const sql = `
    INSERT INTO books 
    (title, author, department, date_added, book_code, shelf_no, draw_no, year, image, status, is_deleted, is_borrowed) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'no', 'no')
  `;

  const values = [
    title, author, department, date_added,
    book_code, shelf_no, draw_no, year, book_image
  ];

  try {
    const [result] = await db.execute(sql, values);

    if (isJson) {
      return res.json({ status: 'success', message: 'Book added successfully!' });
    } else {
      return res.redirect('/librarian/viewandaddbook');
    }

  } catch (err) {
    console.error('❌ Database Insert Error:', err.sqlMessage);

    let errorMessage = 'Something went wrong while saving the book. Please try again later.';

    if (err.code === 'ER_BAD_NULL_ERROR') {
      errorMessage = 'Please fill all required fields.';
    } else if (err.code === 'ER_DUP_ENTRY') {
      errorMessage = 'A book with the same code already exists.';
    }

    if (isJson) {
      return res.status(400).json({ status: 'error', error: errorMessage });
    } else {
      return res.redirect('/librarian/viewandaddbook');
    }
  }
};



exports.searchBooks = async (req, res) => {
    const q = req.query.q;

    try {
        const [rows] = await db.execute(
            "SELECT id, book_code, title, author FROM books WHERE book_code LIKE ? OR title LIKE ?",
            [`%${q}%`, `%${q}%`]
        );
        res.json({ success: true, books: rows });
    } catch (err) {
        console.error("Database query failed:", err); // log full error
       res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.removeBook = async (req, res) => {
   const bookId = req.params.id;
    try {
        const [result] = await db.execute(
            "DELETE books FROM  books WHERE id = ?",
            [bookId]
        );
        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Book marked as deleted." });
        } else {
            res.json({ success: false, message: "Book not found." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "server error" });
    }
};

exports.getBorrowedBooks = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        b.id AS book_id,
        b.title,
        b.author,
        b.image,
        u.name AS borrower_name,
        u.email,
        br.borrowed_at,
        br.return_at,
        br.status
      FROM borrowed br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.user_id = u.id
      WHERE br.status = 'borrowed'
      ORDER BY br.borrowed_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching borrowed books:', err.message);
    res.status(500).json({ success: false, message: "server error" });
  }
};




exports.deleteBook = async (req, res) => {
    const bookId = req.params.id;
    try {
        const [result] = await db.execute(
            "UPDATE books SET is_deleted = 'yes', deleted_at = NOW() WHERE id = ?",
            [bookId]
        );
        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Book marked as deleted." });
        } else {
            res.json({ success: false, message: "Book not found." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getDeletedBooks = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, title, author,department,  shelf_no, draw_no, book_code, deleted_at, image FROM books WHERE is_deleted = 'yes'");
     const formattedResults = rows.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      department: book.department,
      shelf_no: book.shelf_no,
      draw_no: book.draw_no,
      book_code: book.book_code,
      deleted_at: book.deleted_at ? new Date(book.deleted_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : 'Not specified',
      image: book.image || 'default-book.png'
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error('Error fetching deleted books:', err);
    res.status(500).json({ error: 'Database error' });
  }
};


exports.updateBook = [
  validateBook,
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, author, department, book_code, shelf_no, draw_no, year } = req.body;
      const [result] = await db.query(
        'UPDATE books SET title = ?, author = ?, department = ?, book_code = ?, shelf_no = ?, draw_no = ?, year = ?, updated_at = NOW() WHERE id = ? AND is_deleted = ?',
        [title, author, department || null, book_code, shelf_no || null, draw_no || null, year || null, req.params.id, STATUS.ACTIVE]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
      res.json({ message: 'Book updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

exports.deleteBook = [
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const [result] = await db.query('UPDATE books SET is_deleted = ?, updated_at = NOW() WHERE id = ? AND is_deleted = ?', [STATUS.DELETED, req.params.id, STATUS.ACTIVE]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
      res.json({ message: 'Book deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

exports.librarian_interface = (req, res) => {
 res.render('librarian/librarian_interface');
}; 