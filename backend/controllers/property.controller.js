const Property = require('../models/Property');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/imageUpload');

// Create Property
exports.createProperty = async (req, res) => {
  try {
    const propertyData = { ...req.body };
    propertyData.owner = req.user.id;

    // Handle uploaded images if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }
    } else if (req.body.images) {
      // Allow passing URLs directly for ease of seeding or custom clients
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else {
      // Fallback default image
      imageUrls = ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'];
    }
    propertyData.images = imageUrls;

    // Status logic: admins/owners might auto-approve, or set to Pending
    propertyData.status = req.user.role === 'admin' ? 'Approved' : 'Pending';

    const property = await Property.create(propertyData);

    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Properties with Filters/Sorting/Pagination
exports.getProperties = async (req, res) => {
  try {
    const {
      city,
      type,
      purpose,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      parking,
      petsAllowed,
      furnished,
      sortBy,
      page = 1,
      limit = 9,
    } = req.query;

    const query = { status: 'Approved' };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }
    if (purpose) {
      query.purpose = purpose;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (bedrooms) {
      query.bedrooms = Number(bedrooms);
    }
    if (bathrooms) {
      query.bathrooms = Number(bathrooms);
    }
    if (parking !== undefined) {
      query.parking = parking === 'true';
    }
    if (petsAllowed !== undefined) {
      query.petsAllowed = petsAllowed === 'true';
    }
    if (furnished !== undefined) {
      query.furnished = furnished === 'true';
    }

    let queryExec = Property.find(query).populate('owner', 'name email avatar');

    // Sorting
    if (sortBy === 'lowestPrice') {
      queryExec = queryExec.sort({ price: 1 });
    } else if (sortBy === 'highestPrice') {
      queryExec = queryExec.sort({ price: -1 });
    } else if (sortBy === 'newest') {
      queryExec = queryExec.sort({ createdAt: -1 });
    } else {
      // Default: Newest
      queryExec = queryExec.sort({ createdAt: -1 });
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    queryExec = queryExec.skip(skip).limit(limitNum);

    const properties = await queryExec;
    const total = await Property.countDocuments(query);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pages: Math.ceil(total / limitNum),
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Property Details
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate({
        path: 'reviews',
        populate: { path: 'author', select: 'name avatar' },
      });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // If request has verified user, add to recently viewed
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_access_token_1234567890_househunt');
        const user = await User.findById(decoded.id);
        if (user) {
          user.recentlyViewed = [
            property._id,
            ...user.recentlyViewed.filter((id) => id.toString() !== property._id.toString()),
          ].slice(0, 5); // Keep last 5
          await user.save();
        }
      } catch (err) {}
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Property
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this listing' });
    }

    const propertyData = { ...req.body };

    // Handling image upload update if files are present
    if (req.files && req.files.length > 0) {
      let imageUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }
      propertyData.images = imageUrls;
    }

    property = await Property.findByIdAndUpdate(req.params.id, propertyData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await property.deleteOne();

    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Bookmark / Favorite
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.id;

    const isBookmarked = user.wishlist.includes(propertyId);

    if (isBookmarked) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    } else {
      user.wishlist.push(propertyId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      wishlist: user.wishlist,
      isBookmarked: !isBookmarked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Property Recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('recentlyViewed wishlist');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // AI/Algorithm recommendation fallback: Match types, cities, and average pricing of wishlist or recently viewed properties
    const searchBase = [...user.wishlist, ...user.recentlyViewed];

    if (searchBase.length === 0) {
      // Return top-rated or popular properties
      const popular = await Property.find({ status: 'Approved' }).limit(4).sort({ price: 1 });
      return res.status(200).json({ success: true, data: popular, message: 'Default recommendations (popular)' });
    }

    // Extract preferred features
    const preferredTypes = [...new Set(searchBase.map((p) => p.type))];
    const preferredCities = [...new Set(searchBase.map((p) => p.city))];
    const avgPrice = searchBase.reduce((sum, p) => sum + p.price, 0) / searchBase.length;

    // Search properties in preferred categories, around similar pricing (+/- 40%)
    const recommended = await Property.find({
      status: 'Approved',
      _id: { $nin: searchBase.map((p) => p._id) },
      $or: [
        { type: { $in: preferredTypes } },
        { city: { $in: preferredCities } },
        { price: { $gte: avgPrice * 0.6, $lte: avgPrice * 1.4 } },
      ],
    }).limit(6);

    res.status(200).json({ success: true, data: recommended });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
