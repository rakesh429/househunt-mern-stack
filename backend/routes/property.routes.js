const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  toggleBookmark,
  getRecommendations,
} = require('../controllers/property.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { upload } = require('../utils/imageUpload');

router.get('/', getProperties);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', getProperty);

router.post(
  '/',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 5),
  createProperty
);

router.put(
  '/:id',
  protect,
  authorize('owner', 'admin'),
  upload.array('images', 5),
  updateProperty
);

router.delete('/:id', protect, authorize('owner', 'admin'), deleteProperty);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
