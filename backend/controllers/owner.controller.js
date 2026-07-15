const Property = require('../models/Property');
const Booking = require('../models/Booking');

// Get Owner Dashboard Stats
exports.getOwnerStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Total Properties
    const totalProperties = await Property.countDocuments({ owner: ownerId });

    // Properties under approval review
    const pendingProperties = await Property.countDocuments({ owner: ownerId, status: 'Pending' });

    // Bookings related to owner's properties
    const bookings = await Booking.find({ owner: ownerId });
    const totalBookings = bookings.length;

    // Revenue calculations (from approved/paid bookings)
    const approvedBookings = bookings.filter((b) => b.status === 'Approved');
    const totalRevenue = approvedBookings.reduce((sum, b) => sum + b.price, 0);

    // Bookings by Status
    const statusCounts = {
      Pending: bookings.filter((b) => b.status === 'Pending').length,
      Approved: bookings.filter((b) => b.status === 'Approved').length,
      Rejected: bookings.filter((b) => b.status === 'Rejected').length,
      Cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
    };

    // Revenue per Property
    const revenuePerProperty = await Booking.aggregate([
      { $match: { owner: new (require('mongoose').Types.ObjectId)(ownerId), status: 'Approved' } },
      { $group: { _id: '$property', revenue: { $sum: '$price' } } },
      { $lookup: { from: 'properties', localField: '_id', foreignField: '_id', as: 'propertyDetails' } },
      { $unwind: '$propertyDetails' },
      { $project: { title: '$propertyDetails.title', revenue: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        pendingProperties,
        totalBookings,
        totalRevenue,
        statusCounts,
        revenuePerProperty,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Owner's Properties
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
