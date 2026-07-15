const express = require('express');
const router = express.Router();
const {
  createBooking,
  respondToBooking,
  cancelBooking,
  getBookings,
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id/respond', respondToBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
