const db = require('../db');
const path = require('path');
const faq = require('../utils/faqAnswers');

exports.dashboard = (req, res) => {
  res.json({ message: 'User Dashboard' });
};

exports.getNotifications = (req, res) => {
  const query = 'SELECT * FROM notifications WHERE role = "user" ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};

exports.interface = (req, res) => {
 res.render('user/interface');
}; 
exports.home = (req, res) => {
 res.render('user/home');
};
exports.rules_and_regulation = (req, res) => {
 res.render('user/rules_and_regulation');
};
exports.books = (req, res) => {
 res.render('user/books');
};


exports.Logout = async (req, res) => {
  try {
    const sessionUser = req.session.user;

    if (sessionUser && sessionUser.reg_no) {
      const reg_no = sessionUser.reg_no;
      const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
      const timeOut = new Date().toTimeString().split(' ')[0]; // 'HH:MM:SS'

      // Update today's attendance record with time_out
      await db.execute(
        `UPDATE attendance
         SET time_out = ?
         WHERE reg_no = ? AND date = ?`,
        [timeOut, reg_no, today]
      );
    }

    // Destroy session after updating attendance
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error("Error destroying session during logout:", err);
          return res.redirect('/');
        }
        res.clearCookie('connect.sid', { path: '/' });
        return res.redirect('/');
      });
    } else {
      res.redirect('/');
    }

  } catch (error) {
    console.error("Error during logout/attendance update:", error);
    res.redirect('/');
  }
};


exports.cs = (req, res) => {
 res.render('user/cs');
};
exports.yearone = (req, res) => {
 res.render('user/yearone');
};
exports.yeartwo = (req, res) => {
 res.render('user/yeartwo');
};
exports.yearthree= (req, res) => {
 res.render('user/yearthree');
};
exports.yearfour = (req, res) => {
 res.render('user/yearfour');
};
exports.It = (req, res) => {
 res.render('user/It');
};
exports.cse = (req, res) => {
 res.render('user/cse');
};
  exports.civil = (req, res) => {
 res.render('user/civil');
};
exports.education = (req, res) => {
 res.render('user/education');
};
exports.eee = (req, res) => {
 res.render('user/eee');
};
exports.mech = (req, res) => {
 res.render('user/mech');
};
exports.isne = (req, res) => {
 res.render('user/isne');
};
exports.mechactronics = (req, res) => {
 res.render('user/mechactronics');
};
exports.papers = (req, res) => {
 res.render('user/papers');
};
exports.projects = (req, res) => {
 res.render('user/projects');
};

exports.Attendance = async (req, res) => {
  try {
    const sessionUser = req.session.user;

    if (!sessionUser || !sessionUser.reg_no) {
      // If no session or user, redirect to login or show error
      return res.redirect('/login');
    }

    const reg_no = sessionUser.reg_no;
    const name = sessionUser.name || "User";

    const now = new Date();
    const month = req.query.month || now.getMonth() + 1;  // 1-12
    const year = req.query.year || now.getFullYear();

    // Fetch attendance for logged-in user
    const [attendanceRows] = await db.execute(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date,
              TIME_FORMAT(time_in, '%H:%i') AS time_in,
              TIME_FORMAT(time_out, '%H:%i') AS time_out
       FROM attendance
       WHERE reg_no = ? AND MONTH(date) = ? AND YEAR(date) = ?
       ORDER BY date ASC`,
      [reg_no, month, year]
    );

    // Render the attendance page with user and attendance data
    res.render('user/Attendance', {
      user: { reg_no, name },
      attendance: attendanceRows,
      selectedMonth: month,
      selectedYear: year
    });
  } catch (error) {
    console.error("Error rendering attendance page:", error);
    res.status(500).send("Internal Server Error");
  }
};

 
exports.borrowing = (req, res) => {
 res.render('user/borrowing');
};
exports.paying = (req, res) => {
 res.render('user/paying');
};
exports.resources = (req, res) => {
 res.render('user/resources');
};

exports.borrow = async (req, res) => {
  const sessionUser = req.session.user;

  if (!sessionUser || !sessionUser.reg_no) {
    return res.redirect('/login'); // or return 401 error
  }

  try {
    const regNo = sessionUser.reg_no;

    // Fetch name from DB
    const [rows] = await db.execute(
      'SELECT name FROM users WHERE reg_no = ?',
      [regNo]
    );

    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const name = rows[0].name;

    // Render borrow form with pre-filled borrowerId and borrowerName
    res.render('user/borrow', {
      borrowerId: regNo,
      borrowerName: name
    });

  } catch (err) {
    console.error('Error fetching user info for borrow page:', err);
    res.status(500).send('Internal server error');
  }
};


exports.payment = (req, res) => {
 res.render('user/payment');
};

exports.profile = async (req, res) => {
  try { 
    const sessionUser = req.session.user;


    if (!sessionUser || !sessionUser.reg_no) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User session not found' });
    }

    const regNo = sessionUser.reg_no;
    const [rows] = await db.execute('SELECT * FROM users WHERE reg_no = ?', [regNo]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.render('user/profile', { user: rows[0] });

  } catch (err) {
    console.error("Profile Fetch Error:", err);  // This will show full error in console
    res.status(500).json({ success: false, message: 'Server not responding. Please try again later.' });
  }
};



exports.AboutUs = (req, res) => {
 res.render('user/AboutUs');
};
exports.help = (req, res) => {
 res.render('user/help');
};
exports.register = (req, res) => {
 res.render('user/register');     
};


exports.sendFeedback = (req, res) => {
  const { user_id, subject, message } = req.body;
  if (!user_id || !subject || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const sql = 'INSERT INTO feedback (user_id, subject, message) VALUES (?, ?, ?)';
  db.query(sql, [user_id, subject, message], (err) => {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.json({ message: 'Feedback sent' });
  });
};

exports.getUserByReg_no = async (req, res) => {
  const reg_no = req.query.reg;  // <-- get from query param 'reg'
  if (!reg_no) {
    return res.status(400).json({ success: false, message: "reg query parameter is required" });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE reg_no = ?", [reg_no]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = rows[0];
    res.json({
      success: true,
      name: user.name,
      reg_no: user.reg_no,
      program: user.program,
      department: user.department,
      gender: user.gender,
      college: user.college,
      year: user.year,
      role: user.role,
      Time_In: user.time_in,
      Time_Out: user.time_out,
      image: user.photo
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFlatAttendance = async (req, res) => {
  try {
    const { regNo } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const query = `
      SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date,
             TIME_FORMAT(time_in, '%H:%i') AS time_in,
             TIME_FORMAT(time_out, '%H:%i') AS time_out
      FROM attendance
      WHERE reg_no = ? AND MONTH(date) = ? AND YEAR(date) = ?
      ORDER BY date ASC
    `;

    const [rows] = await db.execute(query, [regNo, month, year]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching flat attendance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBorrowedResources = async (req, res) => {
  const regNo = req.params.userId;

  if (!regNo) {
    return res.status(400).json({ message: 'Missing user registration number' });
  }

  try {
    const [rows] = await db.execute(`
      SELECT 
        br.id,
        br.borrower_id,
        br.borrower_name,
        br.resource_type,
        br.borrow_date,
        br.return_date,
        br.status
      FROM borrow_requests br
      WHERE br.borrower_id = ?
      ORDER BY br.borrow_date DESC
    `, [regNo]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching borrowed resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.payFine = async (req, res) => {
  const { borrowerID, resourceType, resourceId, paymentMethod } = req.body;

  try {
    await db.execute(`
      UPDATE borrowing_transactions
      SET payment_status = 'Paid', receipt_method = ?
      WHERE borrower_id = ? AND resource_type = ? AND resource_id = ? AND payment_status = 'Unpaid'
    `, [paymentMethod, borrowerID, resourceType, resourceId]);

    res.json({ message: 'Payment successful' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPaymentHistoryFromSession = (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.student_id) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const studentId = req.session.user.student_id;

  const query = `
    SELECT 
      users.student_id AS studentId,
      users.student_name AS studentName,
      payments.payment_date AS date,
      payments.amount,
      payments.payment_method AS method,
      payments.status
    FROM payments
    JOIN users ON payments.user_id = users.id
    WHERE users.student_id = ?
    ORDER BY payments.payment_date DESC
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching payments:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
};


exports.registerUser = async (req, res) => {
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

    const missingFields = [];
    const roleUpper = role?.toUpperCase();

    // Basic required fields
    if (!name) missingFields.push('name');
    if (!reg_no) missingFields.push('reg_no');
    if (!college) missingFields.push('college');
    if (!role) missingFields.push('role');
    if (!gender) missingFields.push('gender');
    if (!phone_no) missingFields.push('phone_no');
    if (!photoFilename) missingFields.push('photo');

    const requiresAcademicFields = ['STUDENT', 'GUEST'].includes(roleUpper);
    if (requiresAcademicFields) {
      if (!department) missingFields.push('department');
      if (!program) missingFields.push('program');
      if (!year) missingFields.push('year');
    }

    // Return if any required fields are missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required registration fields',
        missingFields
      });
    }

    // 🔠 Name validation: at least 2 words
    const nameWords = name.trim().split(/\s+/);
    if (nameWords.length < 2) {
      return res.status(400).json({
        error: 'Please enter at least two names (e.g., First and Last name).'
      });
    }

    // 🔢 reg_no validation:
    if (roleUpper === 'STUDENT') {
      if (!/^\d{11}$/.test(reg_no)) {
        return res.status(400).json({
          error: 'Wrong registration number please try Again.'
        });
      }
    } else {
      if (reg_no.length < 5) {
        return res.status(400).json({
          error: 'Wrong registration number please try Again.'
        });
      }
    }

    // 🔍 Check for duplicates
    const [existing] = await db.execute('SELECT reg_no FROM users WHERE reg_no = ?', [reg_no]);
    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Registration number already exists.'
      });
    }

    // ✅ Insert
    const sql = `
      INSERT INTO users 
      (name, reg_no, department, program, college, year, role, gender, phone_no, photo, is_approved) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      name,
      reg_no,
      department || null,
      program || null,
      college,
      year || null,
      role,
      gender,
      phone_no,
      photoFilename,
      'no'
    ];

    await db.execute(sql, values);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.'
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    return res.status(500).json({ error: 'Something went wrong while registering the user.' });
  }
};



exports.getBookDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT b1.*
      FROM books b1
      INNER JOIN (
        SELECT department, MIN(id) as min_id
        FROM books
        WHERE is_deleted = 'no'
        GROUP BY department
      ) b2 ON b1.id = b2.min_id
      ORDER BY b1.department ASC
    `);

    const data = rows.map(book => ({
      department: book.department,
      image: book.image,
      page: book.department.toLowerCase().replace(/\s+/g, '-')
    }));

    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching department catalogs:', err);
    res.status(500).json({ error: 'Failed to load departments' });
  }
};
exports.getBooksByDepartment = async (req, res) => {
  const dept = req.params.department;

  try {
    // Get reg_no from session (make sure user is logged in)
    const regNo = req.session?.user?.reg_no;
    if (!regNo) {
      // If no reg_no in session, redirect or handle unauthorized
      return res.redirect('/login'); // or other appropriate action
    }

    
    const [users] = await db.execute(
      "SELECT * FROM users WHERE reg_no = ? LIMIT 1",
      [regNo]
    );

    if (users.length === 0) {
      return res.status(404).send('User not found.');
    }

    const borrowerId = users[0].reg_no;
    const borrowerName = users[0].name;

    // Now query books
    const [books] = await db.execute(
      "SELECT * FROM books WHERE department = ? AND is_deleted = 'no' ORDER BY title ASC",
      [dept]
    );

    return res.render('user/book_list', {
      books: books,
      department: dept,
      message: books.length === 0 ? 'No books found.' : null,
      borrowerId,
      borrowerName
    });

  } catch (err) {
    console.error('❌ Error in getBooksByDepartment:', err);
    res.status(500).render('user/book_list', {
      books: [],
      department: dept,
      message: 'Failed to fetch books.',
      borrowerId: null,
      borrowerName: null
    });
  }
};
exports.viewBooksByDepartment = (req, res) => {
  const dept = req.params.department;
  res.redirect(`/user/books/${dept}`);
};


// Get all departments from the "departments" table
exports.getPaperDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p1.*
      FROM papers p1
      INNER JOIN (
        SELECT department, MIN(id) as min_id
        FROM papers
        WHERE is_deleted = 'no'
        GROUP BY department
      ) p2 ON p1.id = p2.min_id
      ORDER BY p1.department ASC
    `);

    const data = rows.map(paper => ({
      department: paper.department,
      image: paper.image_url,
      page: paper.department.toLowerCase().replace(/\s+/g, '-')
    }));

    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching paper departments:', err);
    res.status(500).json({ error: 'Failed to load paper departments' });
  }
};
exports.getPapersByDepartment = async (req, res) => {
  const dept = req.params.department;

  try {
    // Get reg_no from session (check if user logged in)
    const regNo = req.session?.user?.reg_no;
    if (!regNo) {
      return res.redirect('/login');
    }

    // Fetch user info
    const [users] = await db.execute(
      "SELECT * FROM users WHERE reg_no = ? LIMIT 1",
      [regNo]
    );

    if (users.length === 0) {
      return res.status(404).send('User not found.');
    }

    const borrowerId = users[0].reg_no;
    const borrowerName = users[0].name;

    // Fetch papers for this department
    const [papers] = await db.execute(
      "SELECT * FROM papers WHERE department = ? AND is_deleted = 'no' ORDER BY title ASC",
      [dept]
    );

    return res.render('user/paper_list', {
      papers: papers,
      department: dept,
      message: papers.length === 0 ? 'No papers found.' : null,
      borrowerId,
      borrowerName
    });

  } catch (err) {
    console.error('❌ Error in getPapersByDepartment:', err);
    res.status(500).render('user/paper_list', {
      papers: [],
      department: dept,
      message: 'Failed to fetch papers.',
      borrowerId: null,
      borrowerName: null
    });
  }
};
exports.viewPapersByDepartment = (req, res) => {
  const dept = req.params.department;
  res.redirect(`/user/papers/${dept}`);
};

exports.getProjectDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DISTINCT department FROM projects WHERE is_deleted = 'no' ORDER BY department ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load departments' });
  }
};
exports.showProjectsByDepartment = async (req, res) => {
  const dept = req.params.department;

  try {
    // Use LOWER for case insensitive match & trim
    const [projects] = await db.execute(
      `SELECT id, title, author, year, image 
       FROM projects 
       WHERE LOWER(TRIM(department)) = LOWER(TRIM(?)) AND is_deleted = 'no' 
       ORDER BY date_added DESC`,
      [dept.trim()]
    );

    if (projects.length === 0) {
      return res.render('user/project_list', {
        projects: [],
        department: dept,
        message: 'No projects found for this department.'
      });
    }

    res.render('user/project_list', {
      projects,
      department: dept,
      message: null
    });
  } catch (err) {
    console.error('❌ Error fetching projects:', err);
    res.status(500).render('user/project_list', {
      projects: [],
      department: dept,
      message: 'Failed to fetch projects.'
    });
  }
};

exports.viewProjectsByDepartment = (req, res) => {
  const dept = req.params.department;
  res.redirect(`/user/show-projects/${dept}`);
};

exports.getProjectsByDepartment = async (req, res) => {
  try {
    const department = req.params.department;
    if (!department) {
      return res.status(400).json({ message: 'Department required' });
    }

    const [rows] = await db.execute(`
      SELECT id, image, title, author, status, year, project_code, date_added 
      FROM projects 
      WHERE LOWER(TRIM(department)) = LOWER(TRIM(?)) AND is_deleted = 'no' 
      ORDER BY date_added DESC
    `, [department.trim()]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No projects found for this department' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error loading projects:', err);
    res.status(500).json({ message: 'Error loading projects' });
  }
};
exports.submitBorrow = async (req, res) => {
  const {
    borrower_id,
    borrower_name,
    resource_type,
    resource_code, // <-- added
    borrow_date,
    return_date
  } = req.body;

  // Check all required fields
  if (!borrower_id || !borrower_name || !resource_type || !resource_code || !borrow_date || !return_date) {
    return res.json({ success: false, error: 'All fields are required' });
  }

  const query = `
    INSERT INTO borrow_requests 
    (borrower_id, borrower_name, resource_type, resource_code, borrow_date, return_date, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending')
  `;

  try {
    await db.execute(query, [
      borrower_id,
      borrower_name,
      resource_type,
      resource_code,  // <-- added
      borrow_date,
      return_date
    ]);

    res.json({ success: true, redirect: `/user/borrowed-resources/${borrower_id}` });

  } catch (err) {
    console.error('DB Insert Error:', err);
    res.json({ success: false, error: 'Database error' });
  }
};

// Route: POST /user/set-session
exports.setSession = async (req, res) => {
  const { reg_no } = req.body;

  if (!reg_no) {
    return res.status(400).json({ success: false, message: 'reg_no is required' });
  }

  try {
    const [rows] = await db.execute('SELECT name FROM users WHERE reg_no = ?', [reg_no]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const name = rows[0].name;

    // Set the server-side session
    req.session.user = { reg_no, name };

    res.json({ success: true, message: 'Session set successfully' });
  } catch (err) {
    console.error('Error setting session:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
exports.postAttendance = async (req, res) => {
  try {
    const { reg_no, date, time_in } = req.body;

    if (!reg_no || !date || !time_in) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if there’s any attendance record for this user today
    const [existing] = await db.execute(
      `SELECT id, time_in, time_out FROM attendance WHERE reg_no = ? AND date = ? ORDER BY id DESC LIMIT 1`,
      [reg_no, date]
    );

    if (existing.length > 0) {
      const lastRecord = existing[0];

      if (lastRecord.time_in && !lastRecord.time_out) {
        // Still logged in → log out
        const now = new Date();
        const timeOut = now.toTimeString().split(':').slice(0, 2).join(':');

        await db.execute(
          `UPDATE attendance SET time_out = ? WHERE id = ?`,
          [timeOut, lastRecord.id]
        );

        return res.json({ type: 'logout', message: 'Logout time recorded', time_out: timeOut });
      } else {
        // Already logged out → start new session
        await db.execute(
          `INSERT INTO attendance (reg_no, time_in, date) VALUES (?, ?, ?)`,
          [reg_no, time_in, date]
        );

        return res.json({ type: 'login', message: 'New login session started', time_in });
      }
    }

    // No record yet today → first login
    await db.execute(
      `INSERT INTO attendance (reg_no, time_in, date) VALUES (?, ?, ?)`,
      [reg_no, time_in, date]
    );

    res.json({ type: 'login', message: 'Login time recorded', time_in });
  } catch (error) {
    console.error('Error inserting attendance:', error);
    res.status(500).json({ message: 'Server error while inserting attendance' });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const sessionUser = req.session.user;

    if (!sessionUser || !sessionUser.reg_no) {
      return res.status(401).json({ success: false, message: "No session or reg_no found" });
    }

    const reg_no = sessionUser.reg_no;

    // For testing, return reg_no only (uncomment below to fetch data)
    // return res.json({ reg_no });

    const { month, year } = req.query;

    if (!month || !year)
      return res.status(400).json({ success: false, message: "Month and year required" });

    const [rows] = await db.execute(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date,
              TIME_FORMAT(time_in, '%H:%i') AS time_in,
              TIME_FORMAT(time_out, '%H:%i') AS time_out
       FROM attendance
       WHERE reg_no = ? AND MONTH(date) = ? AND YEAR(date) = ?
       ORDER BY date ASC`,
      [reg_no, month, year]
    );

    res.json(rows);

  } catch (err) {
    console.error("Error fetching user attendance:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.saveSuggestion = async (req, res) => {
  try {
    const { type, message, regNo } = req.body;

    if (!type || !message.trim()) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const cleanMessage = message.trim().toLowerCase();
    let answer = null;

    if (type === 'question') {
      // Try to find a matching key in faq
      for (let key in faq) {
        if (cleanMessage.includes(key)) {
          answer = faq[key];
          break;
        }
      }

      // If no matching FAQ, set a default fallback answer
      if (!answer) {
        answer = "Thank you for your question! Our librarian will get back to you shortly.";
      }
    }

    await db.execute(
      `INSERT INTO suggestions (message_type, content, answer, reg_no) VALUES (?, ?, ?, ?)`,
      [type, message.trim(), answer, regNo || null]
    );

    return res.status(200).json({
      message: 'Message sent successfully.',
      autoAnswer: answer,
    });

  } catch (err) {
    console.error('Error saving message:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.saveQuestion = async (req, res) => {
  try {
    const { type, message, reg_no } = req.body;

    if (!message || type !== 'question') {
      return res.status(400).json({ message: 'Invalid input. Question is required.' });
    }

    // Optional auto-answer logic
    let autoAnswer = '';
    const lower = message.toLowerCase();
    if (lower.includes('book') || lower.includes('borrow')) {
      autoAnswer = 'To borrow a book, visit the Resources > Books section, then click "Request" on a book.';
    } else if (lower.includes('hour')) {
      autoAnswer = 'Library hours are 8:30am - 4:30pm, Monday to Friday.';
    }

    // Insert into DB
    const query = `
      INSERT INTO support_messages (message_type, content, answer, reg_no, date_sent)
      VALUES (?, ?, ?, ?, NOW())
    `;
    await db.execute(query, ['question', message, autoAnswer || null, reg_no || null]);

    res.status(200).json({
      message: 'Question submitted successfully.',
      autoAnswer: autoAnswer || null,
    });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ message: 'Server error while saving question.' });
  }
};
exports.getAllResourcesStatus = async (req, res) => {
  try {
    // 1. Fetch all resources (books, papers, projects)
    const [resources] = await db.execute(`
      SELECT id, title AS resource, 'book' AS type, date_added
      FROM books WHERE is_deleted = 'no'
      UNION ALL
      SELECT id, title AS resource, 'paper' AS type, date_added
      FROM papers WHERE is_deleted = 'no'
      UNION ALL
      SELECT id, title AS resource, 'project' AS type, date_added
      FROM projects WHERE is_deleted = 'no'
      ORDER BY date_added DESC
    `);

    // 2. Fetch borrow records with borrower name (no is_deleted filter here)
    const [borrowRecords] = await db.execute(`
      SELECT br.resource_id, br.resource_type, u.name AS borrower_name, br.borrow_date, br.return_date, br.status
      FROM borrow_records br
      LEFT JOIN users u ON br.borrower_reg_no = u.reg_no
      ORDER BY br.borrow_date DESC
    `);

    // 3. Prepare map keyed by resource_type + resource_id to get latest borrow record
    const borrowMap = new Map();
    for (const record of borrowRecords) {
      const key = record.resource_type + '-' + record.resource_id;
      if (!borrowMap.has(key)) {
        borrowMap.set(key, record);
      }
    }

    const now = new Date();
    const NEW_THRESHOLD_DAYS = 7;

    // 4. Merge resource and borrow data
    const result = resources.map(res => {
      const key = res.type + '-' + res.id;
      const latestBorrow = borrowMap.get(key);
      const dateAdded = new Date(res.date_added);
      const isNew = (now - dateAdded) / (1000 * 60 * 60 * 24) <= NEW_THRESHOLD_DAYS;

      let status = 'available';
      let borrower = '';
      let borrowDate = '';
      let returnDate = '';

      if (latestBorrow) {
        borrower = latestBorrow.borrower_name || '';
        borrowDate = latestBorrow.borrow_date
          ? new Date(latestBorrow.borrow_date).toISOString().split('T')[0]
          : '';
        returnDate = latestBorrow.return_date
          ? new Date(latestBorrow.return_date).toISOString().split('T')[0]
          : '';

        if (latestBorrow.status === 'borrowed') {
          status = 'borrowed';
        } else if (latestBorrow.status === 'returned') {
          status = 'returned';
        }
      } else if (isNew) {
        status = 'new';
      }

      return {
        resource: res.resource,
        type: res.type,
        status,
        borrower,
        borrowDate,
        returnDate,
        dateAdded: res.date_added
          ? new Date(res.date_added).toISOString().split('T')[0]
          : '',
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching all resources status:', error);
    res.status(500).json({ message: 'Server error fetching resources' });
  }
};







