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
exports.getAvailableBooks = (req, res) => {
  const sql = "SELECT id, title, author, department, shelf_no, draw_no, image FROM books WHERE status = 'available'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const formattedResults = results.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      department: book.department,
      shelf_no: book.shelf_no,
      draw_no: book.draw_no,
      image: book.image || 'default-book.png'  // fallback if image is null
    }));

    res.json(formattedResults);
  });
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
exports.addBook = (req, res) => {
  const {
    title, author, department, date_added,
    book_code, shelf_no, draw_no, year, toJson
  } = req.body;

  const book_image = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO books 
    (title, author, department, date_added, book_code, shelf_no, draw_no, year, image, status, is_deleted, is_borrowed) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'no', 'no')
  `;

  const values = [
    title, author, department, date_added,
    book_code, shelf_no, draw_no, year, book_image
  ];

  db.query(sql, values, (err, result) => {
    const isJson = toJson === 'true';

    if (err) {
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
        // Optionally: req.flash('error', errorMessage);
        return res.redirect('/librarian/viewandaddbook');
      }
    }

    if (isJson) {
      return res.json({ status: 'success', message: 'Book added successfully!' });
    } else {
      // Optionally: req.flash('success', 'Book added successfully!');
      return res.redirect('/librarian/viewandaddbook');
    }
  });
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