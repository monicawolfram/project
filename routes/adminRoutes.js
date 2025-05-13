const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


// Middleware for authentication (example placeholder)
const authenticateAdmin = (req, res, next) => {
  // Placeholder for authentication logic
  next();
};


// Routes
router.get('/dashboard', authenticateAdmin, adminController.dashboard);
router.post('/create-user', authenticateAdmin, adminController.createUser);


//
router.get('/admin_account', adminController.admin_account);
router.get('/admin_users', adminController.admin_users);
router.get('/admin_resourcestatus', adminController.admin_resourcestatus);
router.get('/admin_report', adminController.admin_report);
router.get('/admin_itsupport', adminController.admin_itsupport);
router.get('/admin_massage', adminController.admin_massage);
router.get('/admin_librarian', adminController.admin_librarian);


module.exports = router;
