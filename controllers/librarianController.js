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

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Insert department only if it doesn't exist
    const checkDeptSQL = `SELECT * FROM departments WHERE name = ?`;
    const [deptRows] = await conn.execute(checkDeptSQL, [department]);

    if (deptRows.length === 0) {
      const insertDeptSQL = `
        INSERT INTO departments (name, image, page)
        VALUES (?, ?, ?)
      `;

      const imagePath = `/uploads/books/${book_image}`; // use book's uploaded image
      const page = department.toLowerCase(); // assume you have routes for these

      await conn.execute(insertDeptSQL, [department, imagePath, page]);
    }

    // 2. Insert book
    const insertBookSQL = `
      INSERT INTO books 
      (title, author, department, date_added, book_code, shelf_no, draw_no, year, image, status, is_deleted, is_borrowed) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'no', 'no')
    `;

    const bookValues = [
      title, author, department, date_added,
      book_code, shelf_no, draw_no, year, book_image
    ];

    await conn.execute(insertBookSQL, bookValues);

    await conn.commit();

    if (isJson) {
      return res.json({ status: 'success', message: 'Book and department added successfully!' });
    } else {
      return res.redirect('/librarian/viewandaddbook');
    }

  } catch (err) {
    await conn.rollback();
    console.error('❌ Transaction Error:', err.sqlMessage);

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

  } finally {
    conn.release();
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



exports.addPaper = async (req, res) => {
  const {
    title,
    author,
    department,
    date_added,
    paper_code,
    shelf_no,
    draw_no,
    year,
    to_json
  } = req.body;

  const paper_image = req.file ? req.file.filename : null;
  const isJson = to_json === 'true';

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Insert department only if it doesn't exist
    const checkDeptSQL = `SELECT * FROM departments WHERE name = ?`;
    const [deptRows] = await conn.execute(checkDeptSQL, [department]);

    if (deptRows.length === 0) {
      const insertDeptSQL = `
        INSERT INTO departments (name, image, page)
        VALUES (?, ?, ?)
      `;

      const imagePath = `/uploads/papers/${paper_image}`; // use paper's uploaded image
      const page = department.toLowerCase(); // assume page naming convention

      await conn.execute(insertDeptSQL, [department, imagePath, page]);
    }

    // 2. Insert paper
    const insertPaperSQL = `
      INSERT INTO papers
      (title, author, department, date_added, paper_code, shelf_no, draw_no, year, image, status, is_deleted, is_borrowed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'no', 'no')
    `;

    const paperValues = [
      title, author, department, date_added,
      paper_code, shelf_no, draw_no, year, paper_image
    ];

    await conn.execute(insertPaperSQL, paperValues);

    await conn.commit();

    if (isJson) {
      return res.json({ status: 'success', message: 'Paper and department added successfully!' });
    } else {
      return res.redirect('/librarian/papers');
    }

  } catch (err) {
    await conn.rollback();
    console.error('❌ Transaction Error:', err.sqlMessage || err);

    let errorMessage = 'Something went wrong while saving the paper. Please try again later.';

    if (err.code === 'ER_BAD_NULL_ERROR') {
      errorMessage = 'Please fill all required fields.';
    } else if (err.code === 'ER_DUP_ENTRY') {
      errorMessage = 'A paper with the same code already exists.';
    }

    if (isJson) {
      return res.status(400).json({ status: 'error', error: errorMessage });
    } else {
      return res.redirect('/librarian/papers');
    }

  } finally {
    conn.release();
  }
};

exports.getPaperByCodeOrTitle = (req, res) => {
  const searchValue = req.params.search;

  const sql = `SELECT * FROM papers WHERE paper_code = ? OR title = ? LIMIT 1`;
  db.query(sql, [searchValue, searchValue], (err, results) => {
    if (err) {
      console.error('Error retrieving paper:', err);
      return res.status(500).json({ error: 'Failed to retrieve paper' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    res.json(results[0]);
  });
};
exports.deletePaper = (req, res) => {
  const searchValue = req.params.search;

  const sql = `DELETE FROM papers WHERE paper_code = ? OR title = ?`;
  db.query(sql, [searchValue, searchValue], (err, result) => {
    if (err) {
      console.error('Error deleting paper:', err);
      return res.status(500).json({ error: 'Failed to delete paper' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Paper not found or already deleted' });
    }

    res.json({ message: 'Paper removed successfully' });
  });
};
exports.getAvailablePapers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM papers WHERE status = 'available'");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching available papers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getDeletedPapers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM papers WHERE status = 'deleted'");
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch deleted papers:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getBorrowedPapers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT papers.*, users.name AS borrower_name
      FROM papers
      JOIN borrowed_resources ON borrowed_resources.resource_id = papers.id
        AND borrowed_resources.resource_type = 'paper'
      JOIN users ON users.id = borrowed_resources.user_id
      WHERE borrowed_resources.status = 'borrowed'
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch borrowed papers' });
  }
};

exports.getPaperDepartments = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT department FROM papers");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};
exports.getNewPapers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM papers 
      WHERE date_added >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      AND status = 'available'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch new papers' });
  }
};
exports.getUpdatedPapers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM papers 
      WHERE updated_at >= DATE_SUB(CURDATE(), INTERVAL 5 DAY)
      AND status = 'available'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch updated papers' });
  }
};


exports.addProject = async (req, res) => {
  try {
    const {
      title, author, department, date_added,
      project_code, shelf_no, draw_no, year
    } = req.body;

   
    if (!title || !author || !department || !date_added || !project_code || !shelf_no || !draw_no || !year) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const project_image = req.file ? req.file.filename : 'default.jpg';

    const sql = `
      INSERT INTO projects 
        (title, author, department, date_added, project_code, shelf_no, draw_no, year, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(sql, [
      title, author, department, date_added,
      project_code, shelf_no, draw_no, year, project_image
    ]);

   
    //REDIRECT TO DIFFERE NT ROUTE
    res.redirect('/librarian/viewandaddproject');

  } catch (err) {
    console.error("Error in addProject:", err);
    res.status(500).json({ message: 'Error adding project' });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const [projects] = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(projects);
  } catch (err) {
    console.error('❌ Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};
exports.getProjectByCodeOrTitle = async (req, res) => {
  try {
    const keyword = req.params.code_or_title;

    const [rows] = await db.execute(
      `SELECT * FROM projects WHERE project_code = ? OR title = ? LIMIT 1`,
      [keyword, keyword]
    );

    if (rows.length === 0) {
      return res.json({ message: 'Project not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getProjectByCodeOrTitle:", err);
    res.status(500).json({ message: 'Error fetching project' });
  }
};
exports.deleteProject = async (req, res) => {
  try {
    const keyword = req.params.code_or_title;

    const [result] = await db.execute(
      `DELETE FROM projects WHERE project_code = ? OR title = ?`,
      [keyword, keyword]
    );

    if (result.affectedRows === 0) {
      return res.json({ message: 'Project not found or already deleted.' });
    }

    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    console.error("Error in deleteProject:", err);
    res.status(500).json({ message: 'Error deleting project' });
  }
};
exports.getAvailableProjects = async (req, res) => {
  try {
    const sql = `
      SELECT id, title, author, year, department, image
      FROM projects
      WHERE is_deleted = 0 AND is_borrowed = 0
      ORDER BY date_added DESC
    `;

    const [projects] = await db.execute(sql);

    const formatted = projects.map(project => ({
      id: project.id,
      title: project.title,
      author: project.author,
      year: project.year,
      department: project.department,
      image: project.image || 'default.jpg'
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching available projects:', err);
    res.status(500).json({ message: 'Error fetching available projects' });
  }
};


exports.getDeletedProjects = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT * FROM projects
      WHERE is_deleted = 'yes'
      ORDER BY deleted_at DESC
    `);
    res.json(projects);
  } catch (err) {
    console.error('❌ Failed to fetch deleted projects:', err);
    res.status(500).json({ error: 'Failed to load deleted projects' });
  }
};
exports.getBorrowedProjects = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.name AS borrower_name, br.borrowed_at, br.return_at
      FROM borrowed_resources br
      JOIN projects p ON p.id = br.resource_id
      JOIN users u ON u.id = br.user_id
      WHERE br.resource_type = 'project'
      ORDER BY br.borrowed_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Failed to fetch borrowed projects:', err);
    res.status(500).json({ error: 'Failed to fetch borrowed projects' });
  }
};
exports.getDepartmentCatalogs = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM your_catalog_table WHERE is_deleted = 'no'`);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching department catalogs:', error);
    res.status(500).json({ success: false, message: 'Failed to load department catalogs.' });
  }
};
exports.getNewProjects = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT * FROM projects
      WHERE is_deleted = 'no'
      ORDER BY date_added DESC
      LIMIT 10
    `);
    res.json(projects);
  } catch (err) {
    console.error('❌ Failed to fetch new projects:', err);
    res.status(500).json({ error: 'Failed to load new projects' });
  }
};
exports.getUpdatedProjects = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT * FROM projects
      WHERE is_deleted = 'no'
      ORDER BY last_updated DESC
      LIMIT 10
    `);
    res.json(projects);
  } catch (err) {
    console.error('❌ Failed to fetch updated projects:', err);
    res.status(500).json({ error: 'Failed to load updated projects' });
  }
};

// GET: All borrow requests
exports.getAllRequests = async (req, res) => {
  const regNo = req.query.reg_no;

  try {
    let sql = `SELECT * FROM borrow_requests`;
    const params = [];

    if (regNo) {
      sql += ' WHERE borrower_id LIKE ?';
      params.push(`%${regNo}%`);
    }

    sql += ' ORDER BY borrow_date DESC';

    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST: Add a new request to borrow_requests
exports.addRequest = async (req, res) => {
  const { reg_no, name, resource, title } = req.body;

  if (!reg_no || !name || !resource || !title) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  const sql = `
    INSERT INTO borrow_requests 
    (borrower_id, borrower_name, resource_type, title, borrow_date, return_date, status)
    VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Pending')
  `;

  try {
    const [result] = await db.execute(sql, [reg_no, name, resource, title]);
    res.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    console.error('Add request error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};
exports.updateRequestStatus = async (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ success: false, error: 'Missing id or status' });
  }

  const sql = `UPDATE borrow_requests SET status = ? WHERE id = ?`;

  try {
    const [result] = await db.execute(sql, [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

exports.getAllInventory = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM inventory ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.addInventory = async (req, res) => {
  const { name, resource, title, date, status } = req.body;
  if (!name || !resource || !title || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO inventory (name, resource, title, date, status) VALUES (?, ?, ?, ?, ?)',
      [name, resource, title, date, status || 'Available']
    );
    res.status(201).json({ id: result.insertId, name, resource, title, date, status: status || 'Available' });
  } catch (error) {
    console.error('Error adding inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateInventoryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const [result] = await db.execute('UPDATE inventory SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.deleteInventory = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM inventory WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// GET /all-messages
exports.getAllMessages = async (req, res) => {
  try {
    const [messages] = await db.execute('SELECT * FROM suggestions ORDER BY date_sent DESC');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.addMessage = async (req, res) => {
  const { name, type, message, attachment, status } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO messages (name, type, message, attachment, status) VALUES (?, ?, ?, ?, ?)',
      [name, type, message, attachment || '', status || 'Opened']
    );
    res.status(201).json({ message: 'Message saved', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateReport = async (req, res) => {
  const { reportType } = req.body;

  try {
    let query;
    switch (reportType) {
      case 'Borrowing Trends':
        // Count how many times each resource was borrowed
        query = `
          SELECT resource_id, resource_type, COUNT(*) AS borrow_count
          FROM borrow_records
          GROUP BY resource_id, resource_type
          ORDER BY borrow_count DESC
        `;
        break;

      case 'Late Returns':
        // Records where return_date is after due date (assuming you track due_date elsewhere)
        // If you don't have due_date column in this table, adjust or join accordingly.
        query = `
          SELECT resource_id, borrower_reg_no, borrow_date, return_date, status
          FROM borrow_records
          WHERE return_date > DATE_ADD(borrow_date, INTERVAL 14 DAY) -- example due date = borrow_date + 14 days
        `;
        break;

      case 'Fine Collections':
        // Assuming fines are in a separate fines table — adjust accordingly.
        query = `
          SELECT reg_no, amount, reason, date_paid
          FROM fines
          ORDER BY date_paid DESC
        `;
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    const [rows] = await db.execute(query);
    req.app.locals.lastReportData = rows;

    res.json({ success: true, rows });
  } catch (err) {
    console.error('Error generating report data:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.generatePDF = async (req, res) => {
  try {
    const { reportType } = req.query;

    let query;
    switch (reportType) {
      case 'Borrowing Trends':
        query = `SELECT title, COUNT(*) AS borrow_count FROM borrow_records GROUP BY title ORDER BY borrow_count DESC`;
        break;
      case 'Late Returns':
        query = `SELECT title, reg_no, return_date, due_date FROM borrow_records WHERE return_date > due_date`;
        break;
      case 'Fine Collections':
        query = `SELECT reg_no, amount, reason, date_paid FROM fines ORDER BY date_paid DESC`;
        break;
      default:
        query = `SELECT * FROM borrow_requests ORDER BY borrow_date DESC`;
    }

    const [data] = await db.execute(query);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Library Report', { align: 'center' });
    doc.moveDown();

    if (reportType === 'Borrowing Trends') {
      data.forEach((row, i) => {
        doc.fontSize(12).text(`${i + 1}. ${row.title} - Borrowed ${row.borrow_count} times`);
      });
    } else if (reportType === 'Late Returns') {
      data.forEach((row, i) => {
        doc.fontSize(12).text(`${i + 1}. ${row.title} - Reg No: ${row.reg_no} - Returned: ${row.return_date} (Due: ${row.due_date})`);
      });
    } else if (reportType === 'Fine Collections') {
      data.forEach((row, i) => {
        doc.fontSize(12).text(`${i + 1}. Reg No: ${row.reg_no} - Amount: ${row.amount} - Reason: ${row.reason} - Date: ${row.date_paid}`);
      });
    } else {
      data.forEach((row, i) => {
        doc.fontSize(12).text(`${i + 1}. ${row.borrower_name} - ${row.resource_type} - ${row.borrow_date}`);
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate PDF');
  }
};
exports.generateExcel = async (req, res) => {
  try {
    const data = req.app.locals.lastReportData;
    if (!data || data.length === 0) {
      return res.status(400).send('No report data available to generate Excel.');
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    const columns = Object.keys(data[0]).map(key => ({ header: key.toUpperCase(), key }));
    sheet.columns = columns;

    data.forEach(row => sheet.addRow(row));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error in generateExcel:', err);
    res.status(500).send('Failed to generate Excel');
  }
};
exports.generateSVG = async (req, res) => {
  try {
    const data = req.app.locals.lastReportData;
    if (!data || data.length === 0) {
      return res.status(400).send('No report data available to generate SVG.');
    }

    // Example: Show a simple SVG with count of rows
    const rowCount = data.length;
    const svgContent = `<?xml version="1.0" standalone="no"?>
<svg width="600" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="white"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="green">
    Library Report - ${rowCount} entries
  </text>
</svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', 'attachment; filename=report.svg');
    res.send(svgContent);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate SVG');
  }
};
exports.submitIssue = async (req, res) => {
  try {
    const { issueType, description, priority } = req.body;
    const attachment = req.file ? req.file.filename : null;

    if (!description || !issueType || !priority) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert issue into database
    await db.execute(
      `INSERT INTO it_support_issues (issue_type, description, priority, attachment, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [issueType, description, priority, attachment]
    );

    // (Optional) Notify admin by saving to notifications table or sending email

    res.json({ message: 'Issue submitted successfully and sent to admin.' });
  } catch (err) {
    console.error('Error submitting IT issue:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.addFine = async (req, res) => {
  const { id, resource, date, amount, status } = req.body;
  if (!id || !resource || !date || !amount || !status) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    await db.execute(
      `INSERT INTO fines (borrower_reg_no, resource_title, fine_date, fine_amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [id, resource, date, amount, status]
    );
    res.json({ success: true, message: 'Fine added successfully' });
  } catch (err) {
    console.error('Error adding fine:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getAllFines = async (req, res) => {
  try {
    const [fines] = await db.execute('SELECT * FROM fines ORDER BY fine_date DESC');
    res.json({ success: true, fines });
  } catch (err) {
    console.error('Error fetching fines:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.deleteFine = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM fines WHERE id = ?', [id]);
    res.json({ success: true, message: 'Fine deleted' });
  } catch (err) {
    console.error('Error deleting fine:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.updateFine = async (req, res) => {
  const { resource, date, amount, status } = req.body;
  const { id } = req.params;

  if (!resource || !date || !amount || !status) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    await db.execute(
      `UPDATE fines SET resource_title = ?, fine_date = ?, fine_amount = ?, status = ? WHERE borrower_reg_no = ?`,
      [resource, date, amount, status, id]
    );
    res.json({ success: true, message: 'Fine updated successfully' });
  } catch (err) {
    console.error('Error updating fine:', err);
    res.status(500).json({ success: false });
  }
};
exports.getFineById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(`SELECT * FROM fines WHERE borrower_reg_no = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Fine not found' });
    res.json({ success: true, fine: rows[0] });
  } catch (err) {
    console.error('Error fetching fine:', err);
    res.status(500).json({ success: false });
  }
};

// Get all student users
exports.getStudentUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT name, reg_no, department, year, photo FROM users WHERE role = 'student'`
    );

    const studentsWithPhoto = rows.map(user => ({
      ...user,
      photo_url: user.photo
        ? `/uploads/users/${user.photo}`
        : '/images/default-user.png',
    }));

    res.json(studentsWithPhoto);
  } catch (err) {
    console.error('❌ Error fetching students:', err);
    res.status(500).json([]);
  }
};

// Get all librarian users
exports.getLibrarianUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT name, reg_no, department, year, photo FROM users WHERE role = 'librarian'`
    );

    const librariansWithPhoto = rows.map(user => ({
      ...user,
      photo_url: user.photo
        ? `/uploads/users/${user.photo}`
        : '/images/default-user.png',
    }));

    res.json(librariansWithPhoto);
  } catch (err) {
    console.error('❌ Error fetching librarians:', err);
    res.status(500).json([]);
  }
};



exports.getAllUsers = async (req, res) => {
  try {
    // Query relevant user fields
    const [users] = await db.execute(`
      SELECT name, reg_no, department, year, role, photo
      FROM users
      ORDER BY role, name
    `);

    // Map photo to full URL (fallback to default image)
    const usersWithPhotoUrl = users.map(user => ({
      ...user,
      photo_url: user.photo
        ? `/uploads/users/${user.photo}`
        : '/images/default-user.png', // fallback default
    }));

    res.json(usersWithPhotoUrl);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


exports.addUser = async (req, res) => {
  try {
    const {
      name,
      reg_no,
      department,
      program,
      college,
      year,
      role,
      gender,
      phone_no
    } = req.body;

    const photoFilename = req.file ? req.file.filename : null;

    if (!name || !reg_no || !department || !program || !college || !year || !role || !gender || !phone_no) {
      return res.status(400).json({ error: 'Missing required user fields' });
    }

    const sql = `
      INSERT INTO users 
      (name, reg_no, department, program, college, year, role, gender, phone_no, photo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      reg_no,
      department,
      program,
      college,
      year,
      role,
      gender,
      phone_no,
      photoFilename
    ];

    await db.execute(sql, values);
    res.json({ message: 'User added successfully' });

  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Server error while saving user' });
  }
};

exports.generateBookCode = async (req, res) => {
  try {
    // Get the latest book_code ordered descending
    const [rows] = await db.execute(`
      SELECT book_code 
      FROM books 
      WHERE book_code LIKE 'BK____' 
      ORDER BY book_code DESC 
      LIMIT 1
    `);

    let newCode = 'BK0001';

    if (rows.length > 0 && rows[0].book_code) {
      const lastCode = rows[0].book_code; // e.g. 'BK0035'
      const numericPart = parseInt(lastCode.slice(2), 10); // Get '0035' -> 35
      const nextNumber = numericPart + 1;
      newCode = 'BK' + String(nextNumber).padStart(4, '0'); // 'BK0036'
    }

    res.json({ bookCode: newCode });
  } catch (error) {
    console.error('Error generating book code:', error);
    res.status(500).json({ error: 'Failed to generate book code' });
  }
};
exports.generatePaperCode = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT paper_code 
      FROM papers 
      WHERE paper_code LIKE 'PP____' 
      ORDER BY paper_code DESC 
      LIMIT 1
    `);

    let newCode = 'PP0001';

    if (rows.length > 0 && rows[0].paper_code) {
      const lastCode = rows[0].paper_code;
      const numericPart = parseInt(lastCode.slice(2), 10);
      const nextNumber = numericPart + 1;
      newCode = 'PP' + String(nextNumber).padStart(4, '0');
    }

    res.json({ paperCode: newCode });
  } catch (error) {
    console.error('Error generating paper code:', error);
    res.status(500).json({ error: 'Failed to generate paper code' });
  }
};
exports.generateProjectCode = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT project_code 
      FROM projects 
      WHERE project_code LIKE 'PR____' 
      ORDER BY project_code DESC 
      LIMIT 1
    `);

    let newCode = 'PR0001';

    if (rows.length > 0 && rows[0].project_code) {
      const lastCode = rows[0].project_code;
      const numericPart = parseInt(lastCode.slice(2), 10);
      const nextNumber = numericPart + 1;
      newCode = 'PR' + String(nextNumber).padStart(4, '0');
    }

    res.json({ projectCode: newCode });
  } catch (error) {
    console.error('Error generating project code:', error);
    res.status(500).json({ error: 'Failed to generate project code' });
  }
};

exports.getRequestsByResourceCode = async (req, res) => {
  const { code } = req.params;

  try {
    if (!code || code.length < 2) {
      return res.status(400).json({ success: false, message: "Invalid code format." });
    }

    const prefix = code.substring(0, 2).toUpperCase();
    let type = '';
    let resource = null;

    if (prefix === 'BK') {
      type = 'book';
      const [[book]] = await db.execute(
        `SELECT * FROM books WHERE book_code = ? AND is_deleted = 'no'`,
        [code]
      );
      if (book) resource = book;
    } else if (prefix === 'PP') {
      type = 'paper';
      const [[paper]] = await db.execute(
        `SELECT * FROM papers WHERE paper_code = ? AND is_deleted = 'no'`,
        [code]
      );
      if (paper) resource = paper;
    } else if (prefix === 'PR') {
      type = 'project';
      const [[project]] = await db.execute(
        `SELECT * FROM projects WHERE project_code = ? AND is_deleted = 'no'`,
        [code]
      );
      if (project) resource = project;
    } else {
      return res.status(400).json({ success: false, message: "Unrecognized code prefix." });
    }

    if (!resource) {
      return res.json({ success: false, message: "No resource found with this code." });
    }

    const [requests] = await db.execute(
      `SELECT * FROM borrow_requests WHERE resource_code = ? ORDER BY id DESC`,
      [code]
    );

    res.json({ success: true, resource: { ...resource, type }, requests });
  } catch (error) {
    console.error("Error fetching resource by code:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.approveRequest = async (req, res) => {
  const { code } = req.params;

  try {
    const [result] = await db.execute(
      `UPDATE requests SET status = 'approved' WHERE resource_code = ?`,
      [code]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    res.json({ success: true, message: 'Request approved successfully.' });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};


