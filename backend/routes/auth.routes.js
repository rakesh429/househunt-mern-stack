const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  requestOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
  updateDetails,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/otp/request', requestOtp);
router.post('/otp/verify', verifyOtp);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/refresh-token', refreshToken);

router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

module.exports = router;
