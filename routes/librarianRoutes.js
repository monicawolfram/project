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
router.get('/departments/catalogs', librarianController.getDepartmentsCatalogs)

router.get('/librarians', librarianController.getAllLibrarians);

router.put('/task/:id', librarianController.updateTask);


router.post('/attachment/:id', librarianController.addAttachment);
router.delete('/attachment/:id/:attachmentId', librarianController.removeAttachment);
router.put('/attachment/:id/:attachmentId', librarianController.renameAttachment);


router.post('/papers/add', upload.single('paper_image'), librarianController.addPaper);
router.get('/papers/:search', librarianController.getPaperByCodeOrTitle);
router.delete('/papers/:search', librarianController.deletePaper);
router.get('/available-papers', librarianController.getAvailablePapers);
router.get('/deleted-papers', librarianController.getDeletedPapers);
router.get('/borrowed-papers', librarianController.getBorrowedPapers);
router.get('/paper-departments', librarianController.getPaperDepartments);
router.get('/new-papers', librarianController.getNewPapers);
router.get('/updated-papers', librarianController.getUpdatedPapers);

router.post('/projects/add', upload.single('project_image'), librarianController.addProject);
router.get('/projects/:code_or_title', librarianController.getProjectByCodeOrTitle);
router.delete('/projects/:code_or_title', librarianController.deleteProject);
router.get('/projects/available', librarianController.getAvailableProjects);
router.get('/deleted-projects', librarianController.getDeletedProjects);
router.get('/borrowed-projects', librarianController.getBorrowedProjects);
router.get('/departments/catalogs', librarianController.getDepartmentCatalogs);
router.get('/new-projects', librarianController.getNewProjects);
router.get('/updated-projects', librarianController.getUpdatedProjects);
router.get('/requests/all', librarianController.getAllRequests);
router.post('/requests/add', librarianController.addRequest);
router.put('/requests/update-status', librarianController.updateRequestStatus);
router.get('/inventory', librarianController.getAllInventory);
router.post('/inventory', librarianController.addInventory);
router.put('/inventory/:id', librarianController.updateInventoryStatus);
router.delete('/inventory/:id', librarianController.deleteInventory);
router.get('/all-messages', librarianController.getAllMessages);
router.post('/add-massages', librarianController.addMessage);
router.post('/report', librarianController.generateReport);
router.get('/generate/pdf', librarianController.generatePDF);
router.get('/generate/excel',librarianController.generateExcel);
router.get('/generate/svg', librarianController.generateSVG);
router.post('/it-support', upload.single('attachment'), librarianController.submitIssue);
router.post('/fines', librarianController.addFine);
router.get('/fines', librarianController.getAllFines);
router.delete('/fines/:id', librarianController.deleteFine);
router.put('/fines/:id', librarianController.updateFine);
router.get('/fines/:id', librarianController.getFineById);
router.get('/students', librarianController.getStudentUsers);
router.get('/librarians', librarianController.getLibrarianUsers);
router.get('/view-users', librarianController.getAllUsers);
router.post('/add-user', upload.single('photo'), librarianController.addUser);
router.get('/generate-book-code', librarianController.generateBookCode);


router.get('/requests/resource-by-code/:code', librarianController.getRequestsByResourceCode);





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
router.get('/Itsupport', librarianController.Itsupport);
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