const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/dashboard', userController.dashboard);
router.get('/notifications', userController.getNotifications);
router.post('/send-feedback', userController.sendFeedback);

module.exports = router;
