const db = require('../db');
const path = require('path');
const { body, param, query, validationResult } = require('express-validator'); // Include validationResult


exports.interface = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/librarian _interface.html'));
};
exports.librarian_home = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/librarian_home.html'));
};
exports.librarian_category = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/librarian_category.html'));
};
exports.manageinventorylibrarian = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/manageinventorylibrarian.html'));
};
exports.managefines = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/managefines.html'));
};
exports.managerequestlibrarian= (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/managerequestlibrarian.html'));
};
exports.manageusers = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/manageusers.html'));
};
exports.admin_account = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/admin_account.html'));
};
exports.booknotification = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/booknotification.html'));
};
exports.generatereport = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/generatereport.html'));
};
exports.Itsupport = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/Itsupport.html'));
};
exports.librarian_account = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/librarian_account.html'));
};
exports.massageandfeedback = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/massageandfeedback.html'));
};
exports.profile = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/profile.html'));
};
exports.requestnotification = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/requestnotification.html'));
};
exports.systemnotification = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/systemnotification.html'));
};
exports.viewallnotification = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/librarian/viewallnotification.html'));
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

exports.addBook = [
  validateBook,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, author, department, book_code, shelf_no, draw_no, year } = req.body;
      const [result] = await db.query(
        'INSERT INTO books (title, author, department, book_code, shelf_no, draw_no, year, date_added, is_deleted, is_borrowed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, NOW(), NOW())',
        [title, author, department || null, book_code, shelf_no || null, draw_no || null, year || null, STATUS.ACTIVE, STATUS.ACTIVE]
      );
      res.status(201).json({ id: result.insertId, message: 'Book added successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

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
  res.sendFile(path.join(__dirname, '../public/librarian/librarian_interface.html'));
}; 