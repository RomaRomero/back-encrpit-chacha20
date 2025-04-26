const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/sendMessage', authMiddleware, messageController.sendMessage);
router.get('/getMessages', authMiddleware, messageController.getMessages);

module.exports = router;
