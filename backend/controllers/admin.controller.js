const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// Get Admin Statistics
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Calculate revenue from approved bookings
    const approvedBookings = await Booking.find({ status: 'Approved' });
    const totalRevenue = approvedBookings.reduce((sum, b) => sum + b.price, 0);

    // Distribution by Property Type
    const categories = await Property.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Status distribution
    const statuses = await Property.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent properties
    const recentProperties = await Property.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('property', 'title')
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue,
        categories,
        statuses,
        recentProperties,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve or Reject Property listing
exports.respondToProperty = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid property status' });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete properties owned by this user
    await Property.deleteMany({ owner: user._id });
    // Delete bookings related to this user
    await Booking.deleteMany({ $or: [{ tenant: user._id }, { owner: user._id }] });

    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User and associated listings deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Listings (Pending + Approved + Rejected)
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
