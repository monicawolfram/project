const express = require('express');
const router = express.Router();
const librarianController = require('../controllers/librarianController');

// Middleware for authentication (example placeholder)
const authenticateLibrarian = (req, res, next) => {
  next();
};

// Routes
router.get('/dashboard', authenticateLibrarian, librarianController.dashboard);
// router.get('/manage-resources', authenticateLibrarian, librarianController.manageResources);
// router.post('/respond-feedback', authenticateLibrarian, librarianController.respondFeedback);
router.get('/books', authenticateLibrarian, librarianController.getBooks);
router.get('/books/:id', authenticateLibrarian,librarianController.getBookById); // Spread the array
router.post('/books', authenticateLibrarian, librarianController.addBook); // Spread the array
router.put('/books/:id', authenticateLibrarian, librarianController.updateBook); // Spread the array
router.delete('/books/:id', authenticateLibrarian, librarianController.deleteBook); // Spread the array

module.exports = router;