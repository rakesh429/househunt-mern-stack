const express = require('express');
const router = express.Router();
const { createReview, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
