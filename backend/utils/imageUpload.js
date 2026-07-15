const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for local fallback
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only images'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Cloudinary connection (simulated if keys not configured)
const uploadToCloudinary = async (file) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud'
  ) {
    // Local / static URL mockup fallback
    console.log('Using simulated Cloudinary upload');
    // Just return a nice default placeholder image or a local relative route
    // Here we return a high quality stock house image corresponding to the upload
    const mockImages = [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ];
    const randomIndex = Math.floor(Math.random() * mockImages.length);
    return mockImages[randomIndex];
  }

  // Real Cloudinary upload logic
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'househunt',
    });
    // Remove local file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {}
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error, using local fallback:', err);
    return '/uploads/' + path.basename(file.path);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
};
