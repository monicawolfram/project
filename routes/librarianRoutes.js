const express = require('express');
const router = express.Router();
const librarianController = require('../controllers/librarianController');

router.get('/dashboard', librarianController.dashboard);
router.get('/manage-resources', librarianController.manageResources);
router.post('/respond-feedback', librarianController.respondFeedback);

module.exports = router;
