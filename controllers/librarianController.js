const db = require('../db');
const path = require('path');
const { body, param, query, validationResult } = require('express-validator'); // Include validationResult


exports.interface = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/librarian _interface.ejs'));
};
exports.librarian_home = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/librarian_home.ejs'));
};
exports.librarian_category = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/librarian_category.ejs'));
};
exports.manageinventorylibrarian = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/manageinventorylibrarian.ejs'));
};
exports.managefines = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/managefines.ejs'));
};
exports.managerequestlibrarian= (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/managerequestlibrarian.ejs'));
};
exports.manageusers = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/manageusers.ejs'));
};
exports.admin_account = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/admin_account.ejs'));
};
exports.booknotification = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/booknotification.ejs'));
};
exports.generatereport = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/generatereport.ejs'));
};
exports.Itsupport = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/Itsupport.ejs'));
};
exports.librarian_account = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/librarian_account.ejs'));
};
exports.massageandfeedback = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/massageandfeedback.ejs'));
};
exports.profile = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/profile.ejs'));
};
exports.requestnotification = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/requestnotification.ejs'));
};
exports.systemnotification = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/systemnotification.ejs'));
};
exports.viewallnotification = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/librarian/viewallnotification.ejs'));
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
    book_code, shelf_no, draw_no, year,
    to_json
  } = req.body;

  const wantsJson = to_json === 'true' || to_json === true;

  if (!title || !author || !department || !date_added || !book_code || !shelf_no || !draw_no || !year) {
    const message = 'Please fill in all required fields.';

    if (wantsJson) {
      return res.status(400).json({ success: false, message });
    }

    req.flash('error', message);
    return res.redirect('/librarian/add-book'); // Redirect to the form route
  }

  const sql = `
    INSERT INTO books (
      title, author, department, date_added,
      book_code, is_deleted, is_borrowed, borrowed_by,
      shelf_no, draw_no, year, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, 'no', 'no', NULL, ?, ?, ?, NOW(), NOW())
  `;

  const values = [title, author, department, date_added, book_code, shelf_no, draw_no, year];

  db.query(sql, values, (err, result) => {
    if (err) {
      let message = 'Database error. Please try again.';
      if (err.code === 'ER_DUP_ENTRY') {
        message = 'Book code already exists.';
      }

      if (wantsJson) {
        return res.status(500).json({ success: false, message });
      }

      req.flash('error', message);
      return res.render('librarian/viewandaddbook', { messages: req.flash() });
    }

    const message = 'Book added successfully!';

    if (wantsJson) {
      return res.status(200).json({ success: true, message });
    }

    req.flash('success', message);
    return res.render('librarian/viewandaddbook', { messages: req.flash() });
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
  res.sendFile(path.join(__dirname, '../views/librarian/librarian_interface.ejs'));
}; 