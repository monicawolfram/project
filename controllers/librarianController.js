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
        id AS book_id,
        title,
        author,
        image,
        borrowed_by,
        borrowed_at,
        return_at,
        status
      FROM books
      WHERE is_borrowed = 'yes' AND is_deleted = 'no'
      ORDER BY borrowed_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching borrowed books:', err.message);
    res.status(500).json({ success: false, message: err });
  }
};

exports.getDepartmentsCatalogs = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        department,
        title,
        author,
        year,
        book_code,
        status,
        type,        -- 'book', 'paper', or 'project'
        image
      FROM books
      WHERE is_deleted = 'no'
      ORDER BY department, type, title
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching department catalogs:", err.message);
    res.status(500).json({ success: false, message: err });
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



exports.getAllLibrarians = async (req, res) => {
  const sql = `
    SELECT 
      l.id AS librarian_id, l.*, 
      u.name, u.email, u.role,
      GROUP_CONCAT(a.id, ':', a.filename) AS attachments_raw
    FROM librarians l
    JOIN users u ON l.user_id = u.id
    LEFT JOIN attachments a ON l.id = a.librarian_id
    GROUP BY l.id
  `;

  try {
    const [results] = await db.query(sql); // use await instead of callback

    results.forEach(l => {
      l.attachments = [];
      if (l.attachments_raw) {
        const files = l.attachments_raw.split(',');
        l.attachments = files.map(f => {
          const [id, filename] = f.split(':');
          return { id: Number(id), filename };
        });
      }
      delete l.attachments_raw;
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateTask = (req, res) => {
  const { task } = req.body;
  const { id } = req.params;

  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  db.query('UPDATE librarians SET task = ? WHERE id = ?', [task, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Task updated.' });
  });
};




exports.updateStatus = (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  db.query('UPDATE librarians SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Status updated.' });
  });
};

exports.updateComment = (req, res) => {
  const { comment } = req.body;
  const { id } = req.params;
  db.query('UPDATE librarians SET comment = ? WHERE id = ?', [comment, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Comment saved.' });
  });
};

exports.addAttachment = (req, res) => {
  const { filename } = req.body; // <-- this needs req.body to be defined!
  const { id } = req.params;

  db.query(
    'INSERT INTO attachments (librarian_id, filename) VALUES (?, ?)',
    [id, filename],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Attachment added.' });
    }
  );
};

exports.removeAttachment = (req, res) => {
  const { attachmentId } = req.params;
  db.query('DELETE FROM attachments WHERE id = ?', [attachmentId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Attachment deleted.' });
  });
};

exports.renameAttachment = (req, res) => {
  const { attachmentId } = req.params;
  const { filename } = req.body;
  db.query('UPDATE attachments SET filename = ? WHERE id = ?', [filename, attachmentId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Attachment renamed.' });
  });
};
