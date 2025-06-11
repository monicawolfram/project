const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/dashboard', userController.dashboard);
router.get('/notifications', userController.getNotifications);
router.post('/send-feedback', userController.sendFeedback);
router.get('/fetch-user', userController.getUserByReg_no);
router.get('/attendance/:regNo', userController.getAttendanceByMonthYear);
router.get('/borrowed-resources/:id', userController.getBorrowedResources);
router.post('/pay-fine', userController.payFine);
router.get('/payments/:regNo', userController.getPaymentHistoryByRegNo);


//
router.get('/interface', userController.interface);
router.get('/home', userController.home);
router.get('/rules_and_regulation', userController.rules_and_regulation);
router.get('/books', userController.books);
router.get('/cs', userController.cs);
router.get('/yearone', userController.yearone);
router.get('/yeartwo', userController.yeartwo);
router.get('/yearthree', userController.yearthree); 
router.get('/yearfour', userController.yearfour);
router.get('/It', userController.It);
router.get('/cse', userController.cse);
router.get('/civil', userController.civil);
router.get('/education', userController.education);
router.get('/eee', userController.eee);
router.get('/mech', userController.mech);
router.get('/isne', userController.isne);
router.get('/mechactronics', userController.mechactronics);
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
