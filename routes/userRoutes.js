const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/dashboard', userController.dashboard);
router.get('/notifications', userController.getNotifications);
router.post('/send-feedback', userController.sendFeedback);


//
router.get('/', userController.interface);
router.get('/home', userController.home);
router.get('/books', userController.books);
router.get('/papers', userController.papers);
router.get('/projects', userController.projects);
router.get('/Attendance', userController.Attendance);
router.get('/borrowing', userController.borrowing);
router.get('/paying', userController.paying);
router.get('/resources', userController.resources);
router.get('/payment', userController.payment);
router.get('/profile', userController.profile);
router.get('/AboutUs', userController.AboutUs);
router.get('/help', userController.help);
module.exports = router;
