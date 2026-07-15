const express = require('express');
const router = express.Router();
const { getOwnerStats, getMyProperties } = require('../controllers/owner.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('owner', 'admin'));

router.get('/stats', getOwnerStats);
router.get('/properties', getMyProperties);

module.exports = router;
