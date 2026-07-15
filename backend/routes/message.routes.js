const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getChatUsers } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', sendMessage);
router.get('/users', getChatUsers);
router.get('/:userId', getMessages);

module.exports = router;
