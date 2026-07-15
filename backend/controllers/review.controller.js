const Review = require('../models/Review');
const Property = require('../models/Property');

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      property: propertyId,
      author: req.user.id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this property' });
    }

    const review = await Review.create({
      property: propertyId,
      author: req.user.id,
      rating: Number(rating),
      comment,
    });

    // Populate user details for returning
    await review.populate('author', 'name avatar');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify creator or admin
    if (review.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete review' });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
