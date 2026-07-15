const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/mailer');

// Request a booking
exports.createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate, price } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot book your own property' });
    }

    // Check if property is already booked for these dates (simplified check)
    const existingBooking = await Booking.findOne({
      property: propertyId,
      status: 'Approved',
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'Property is already booked for the selected dates' });
    }

    const booking = await Booking.create({
      property: propertyId,
      tenant: req.user.id,
      owner: property.owner,
      startDate,
      endDate,
      price,
    });

    // Create Notification for the Owner
    await Notification.create({
      user: property.owner,
      title: 'New Booking Request',
      message: `You have received a booking request for "${property.title}"`,
      type: 'Booking',
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Respond to booking request (Owner approves/rejects)
exports.respondToBooking = async (req, res) => {
  try {
    const { status } = req.body; // Approved or Rejected
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status response' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('property')
      .populate('tenant', 'name email')
      .populate('owner', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify owner
    if (booking.owner._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to respond' });
    }

    booking.status = status;
    if (status === 'Approved') {
      booking.paymentStatus = 'Paid'; // Mock payment process completion
    }
    await booking.save();

    // Create notification for tenant
    await Notification.create({
      user: booking.tenant._id,
      title: `Booking Request ${status}`,
      message: `Your booking request for "${booking.property.title}" has been ${status.toLowerCase()}`,
      type: 'Booking',
    });

    // Email tenant
    await sendEmail({
      email: booking.tenant.email,
      subject: `HouseHunt - Booking Request ${status}`,
      message: `Hello ${booking.tenant.name},\n\nYour booking request for "${booking.property.title}" from ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()} has been ${status.toUpperCase()} by the owner.\n\nThank you for choosing HouseHunt!`,
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify tenant, owner, or admin
    const isTenant = booking.tenant.toString() === req.user.id;
    const isOwner = booking.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isTenant && !isOwner && !isAdmin) {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Notify other party
    const targetUser = isTenant ? booking.owner : booking.tenant;
    await Notification.create({
      user: targetUser,
      title: 'Booking Cancelled',
      message: `Booking has been cancelled for booking ID ${booking._id}`,
      type: 'Booking',
    });

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User's Bookings (For tenants/owners)
exports.getBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'owner') {
      bookings = await Booking.find({ owner: req.user.id })
        .populate('property')
        .populate('tenant', 'name email avatar')
        .sort({ createdAt: -1 });
    } else {
      // Default: tenants
      bookings = await Booking.find({ tenant: req.user.id })
        .populate('property')
        .populate('owner', 'name email avatar')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
