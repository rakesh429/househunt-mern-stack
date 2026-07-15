const express = require('express');
const router = express.Router();
const {
  getStats,
  respondToProperty,
  getAllUsers,
  deleteUser,
  getAllProperties,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/properties', getAllProperties);
router.put('/properties/:id/respond', respondToProperty);

module.exports = router;
