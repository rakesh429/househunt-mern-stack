const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a property title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please add address details'],
    },
    city: {
      type: String,
      required: [true, 'Please add city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please add country'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: 0.0,
    },
    longitude: {
      type: Number,
      default: 0.0,
    },
    price: {
      type: Number,
      required: [true, 'Please add price'],
    },
    images: {
      type: [String],
      required: [true, 'Please upload at least one image'],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Please add number of bedrooms'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Please add number of bathrooms'],
    },
    parking: {
      type: Boolean,
      default: false,
    },
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    furnished: {
      type: Boolean,
      default: false,
    },
    area: {
      type: Number, // In sq ft or sq meters
      required: [true, 'Please add area size'],
    },
    type: {
      type: String,
      required: [true, 'Please specify property type'],
      enum: ['Apartment', 'Villa', 'House', 'Hostel', 'PG', 'Office', 'Land', 'Commercial'],
    },
    purpose: {
      type: String,
      required: true,
      enum: ['Rent', 'Sale'],
      default: 'Rent',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews populate
PropertySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'property',
  justOne: false,
});

module.exports = mongoose.model('Property', PropertySchema);
const Property = mongoose.model('Property');
