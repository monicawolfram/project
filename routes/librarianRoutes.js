const express = require('express');
const router = express.Router();
const librarianController = require('../controllers/librarianController');
const upload = require('../config/upload'); // adjust path

// Middleware for authentication (example placeholder)
const authenticateLibrarian = (req, res, next) => {
  next();
};

// Routes
router.get('/dashboard', authenticateLibrarian, librarianController.dashboard);
// router.get('/manage-resources', authenticateLibrarian, librarianController.manageResources);
// router.post('/respond-feedback', authenticateLibrarian, librarianController.respondFeedback);
router.get('/books/available', librarianController.getAvailableBooks);
router.get('/books', authenticateLibrarian, librarianController.getBooks);
router.get('/search/book', librarianController.searchBooks);
router.get('/deleted-books/', authenticateLibrarian,librarianController.getDeletedBooks);
router.delete('/delete/book/:id', librarianController.deleteBook); 
router.get('/books/:id', authenticateLibrarian,librarianController.getBookById); // Spread the array
router.post('/books', authenticateLibrarian, librarianController.addBook); // Spread the array
router.put('/books/:id', authenticateLibrarian, librarianController.updateBook); // Spread the array
router.delete('/books/:id', authenticateLibrarian, librarianController.deleteBook); // Spread the array
router.post('/books/add', upload.single('book_image'), librarianController.addBook);
router.get('/add-book',  authenticateLibrarian, librarianController.getAddBookForm);
router.delete('/remove/book/:id', authenticateLibrarian, librarianController.removeBook); // Spread the array
router.get('/borrowed/books', authenticateLibrarian, librarianController.getBorrowedBooks);



// This will serve interface.html when visiting /api/librarian/
router.get('/librarian_interface', librarianController.librarian_interface);
router.get('/librarian_home', librarianController.librarian_home);
router.get('/librarian_category', librarianController.librarian_category);
router.get('/manageinventorylibrarian', librarianController.manageinventorylibrarian);
router.get('/managefines', librarianController.managefines);
router.get('/managerequestlibrarian', librarianController.managerequestlibrarian);
router.get('/manageusers', librarianController.manageusers);
router.get('/admin_account', librarianController.admin_account);
router.get('/booknotification', librarianController.booknotification);
router.get('/generatereport', librarianController.generatereport);
router.get('/Itsupport.html', librarianController.Itsupport);
router.get('/librarian_account', librarianController.librarian_account);
router.get('/massageandfeedback', librarianController.massageandfeedback);
router.get('/profile', librarianController.profile);
router.get('/requestnotification', librarianController.requestnotification);
router.get('/systemnotification', librarianController.systemnotification);
router.get('/viewallnotification', librarianController.viewallnotification);
router.get('/viewandaddbook', librarianController.viewandaddbook);
router.get('/viewandaddpaper', librarianController.viewandaddpaper);
router.get('/viewandaddproject', librarianController.viewandaddproject);



module.exports = router;