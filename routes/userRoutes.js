const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const path = require('path');

const multer = require('multer');

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

router.get('/home', userController.home);
router.get('/dashboard', userController.dashboard);
router.get('/notifications', userController.getNotifications);
router.post('/send-feedback', userController.sendFeedback);
router.get('/fetch-user', userController.getUserByReg_no);
router.get('/flat-attendance/:regNo', userController.getFlatAttendance);
router.post('/attendance', userController.postAttendance);

router.get('/borrowed-resources/:userId', userController.getBorrowedResources);
router.post('/pay-fine', userController.payFine);
router.get('/payments/:regNo', userController.getPaymentHistoryByRegNo);
router.post('/register', upload.single('photo'), userController.registerUser);

router.get('/papers', userController.papers); // optional static view
router.get('/papers/departments', userController.getPaperDepartments);
router.get('/show-papers/:department', userController.getPapersByDepartment);

router.get('/projects', userController.projects);
router.get('/projects/departments', userController.getProjectDepartments);
router.get('/show-projects/:department', userController.showProjectsByDepartment);
router.get('/projects/:department', userController.getProjectsByDepartment);
router.post('/borrow', userController.submitBorrow);
router.post('/set-session', userController.setSession);
router.post('/save-suggestion', userController.saveSuggestion);
router.post('/save-question', userController.saveQuestion);
router.get('/resources/all', userController.getAllResourcesStatus);



//
router.get('/interface', userController.interface);

router.get('/rules_and_regulation', userController.rules_and_regulation);

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
router.get('/my-attendance', userController.getMyAttendance);
router.get('/borrowing', userController.borrowing);
router.get('/paying', userController.paying);
router.get('/resources', userController.resources);
router.get('/borrow', userController.borrow);
router.get('/payment', userController.payment);
router.get('/profile', userController.profile);
router.get('/AboutUs', userController.AboutUs);
router.get('/help', userController.help);
router.get('/register', userController.register);

router.get('/books', userController.books);
router.get('/logout', userController.Logout);
router.get('/books/departments', userController.getBookDepartments);
router.get('/books/:department', userController.getBooksByDepartment);
router.get('/show-books/:department', userController.getBooksByDepartment);
module.exports = router;
