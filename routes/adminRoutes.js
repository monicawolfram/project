const express = require('express');
const router = express.Router();
const path = require('path');
const adminController = require('../controllers/adminController');
const upload = require('../config/upload');

// Middleware for authentication (example placeholder)
const authenticateAdmin = (req, res, next) => {
  // Placeholder for authentication logic
  next();
};

// Routes
router.get('/dashboard', authenticateAdmin, adminController.dashboard);
router.post('/create-user', authenticateAdmin, adminController.createUser);
router.get('/view-users', adminController.getAllUsers);
router.post('/add-user', upload.single('photo'), adminController.addUser);
router.put('/update-user/:id', upload.single('photo'), adminController.updateUser);
router.delete('/delete-user/:id', adminController.deleteUser);
router.get('/librarian-activities', adminController.getLibrarianActivities);
router.put('/approve-user/:id', adminController.approveUser);
router.get('/view-users', adminController.viewUsers);
router.delete('/delete-users-bulk', adminController.deleteUsersBulk);
router.patch('/approve-users-bulk', adminController.approvePendingUsers);
router.put('/update-users-bulk', adminController.updateUsersBulk);
router.get('/view-users', adminController.viewAllUsers);
//
router.get('/admin_account', adminController.admin_account);
router.get('/admin_users', adminController.admin_users);
router.get('/admin_resourcestatus', adminController.admin_resourcestatus);
router.get('/admin_report', adminController.admin_report);
router.get('/admin_itsupport', adminController.admin_itsupport);
router.get('/admin_massage', adminController.admin_massage);
router.get('/librarian_Activities', adminController.librarian_Activities);


module.exports = router;
