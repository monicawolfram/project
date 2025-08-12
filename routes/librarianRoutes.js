const express = require('express');
const router = express.Router();
const librarianController = require('../controllers/librarianController');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/books');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;

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


// Papers routes
router.get('/papers/available', librarianController.getAvailablePapers);
router.get('/papers', authenticateLibrarian, librarianController.getPapers);
router.get('/search/paper', librarianController.searchPapers);
router.get('/deleted-papers', authenticateLibrarian, librarianController.getDeletedPapers);
router.delete('/delete/paper/:id', authenticateLibrarian, librarianController.deletePaper);
router.get('/papers/:id', authenticateLibrarian, librarianController.getPaperById);
router.post('/papers/add', authenticateLibrarian, upload.single('paper_image'), librarianController.addPaper);
router.put('/papers/:id', authenticateLibrarian, upload.single('paper_image'), librarianController.updatePaper);
router.delete('/remove/paper/:id', authenticateLibrarian, librarianController.removePaper);
router.get('/borrowed/papers', authenticateLibrarian, librarianController.getBorrowedPapers);
router.get('/departments/catalogs', librarianController.getDepartmentsCatalogs);


// PROJECT ROUTES
router.get('/projects/available', librarianController.getAvailableProjects);
router.get('/projects', authenticateLibrarian, librarianController.getProjects);
router.get('/search/project', librarianController.searchProjects);
router.get('/deleted-projects', authenticateLibrarian, librarianController.getDeletedProjects);
router.delete('/delete/project/:id', authenticateLibrarian, librarianController.deleteProject);
router.get('/projects/:id', authenticateLibrarian, librarianController.getProjectById);
router.post('/projects/add', authenticateLibrarian, upload.single('project_image'), librarianController.addProject);
router.put('/projects/:id', authenticateLibrarian, upload.single('project_image'), librarianController.updateProject);
router.delete('/remove/project/:id', authenticateLibrarian, librarianController.removeProject);
router.get('/borrowed/projects', authenticateLibrarian, librarianController.getBorrowedProjects);
router.get('/departments/projects', librarianController.getDepartmentsProjects);




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
router.get('/generate-paper-code', librarianController.generatePaperCode);
router.get('/generate-project-code', librarianController.generateProjectCode);
router.get('/requests/resource-by-code/:code', librarianController.getRequestsByResourceCode);
router.put('/requests/approve/:code', librarianController.approveRequest);




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