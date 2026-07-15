const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: '*', // For local/development convenience
}));

// Set security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off for leaflet maps/external resources loading on same ports
  })
);

// Prevent NoSQL query injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 200, // Limit each IP to 200 requests per window
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Set static folder for local upload simulation
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection status middleware
app.use('/api', (req, res, next) => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    // Local MongoDB is offline. Intercept with memory emulator fallback.
    const mockDbMiddleware = require('./middleware/mockDb');
    return mockDbMiddleware(req, res, next);
  }
  next();
});

// Mount routers
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/properties', require('./routes/property.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/owner', require('./routes/owner.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Basic Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'HouseHunt API is running smoothly' });
});

// Centralized error handling
app.use(errorHandler);

// Database Auto-seeding Script
const seedData = async () => {
  try {
    const User = require('./models/User');
    const Property = require('./models/Property');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding database with default users and properties...');

      // Create Admin
      const admin = await User.create({
        name: 'System Admin',
        email: 'admin@househunt.com',
        password: 'password123',
        role: 'admin',
        isVerified: true,
      });

      // Create Property Owner
      const owner = await User.create({
        name: 'Rajesh Sharma',
        email: 'owner@househunt.com',
        password: 'password123',
        role: 'owner',
        isVerified: true,
      });

      // Create regular user
      const user = await User.create({
        name: 'Jagan',
        email: 'user@househunt.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
      });

      // Create beautiful property listings (Indian Style)
      const listings = [
        {
          title: 'Premium 2 BHK Apartment near Koramangala',
          description: 'A gorgeous modern 2 BHK apartment in the heart of Bangalore. Features ceiling-to-floor windows, smart appliances, high-speed fiber internet, and access to a rooftop lounge.',
          address: '80 Feet Rd, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          latitude: 12.9352,
          longitude: 77.6245,
          price: 28000,
          bedrooms: 2,
          bathrooms: 2,
          area: 1200,
          parking: true,
          petsAllowed: true,
          furnished: true,
          type: 'Apartment',
          purpose: 'Rent',
          status: 'Approved',
          owner: owner._id,
          images: [
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
          ],
        },
        {
          title: 'Luxury 4 BHK Villa with Private Garden',
          description: 'Experience pure luxury in this expansive 4 BHK villa. Boasting a massive private garden, custom patio, modular kitchen, and 24/7 security backups.',
          address: 'Bandra West, Link Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          latitude: 19.0596,
          longitude: 72.8295,
          price: 65000000, // 6.5 Crores
          bedrooms: 4,
          bathrooms: 4,
          area: 3500,
          parking: true,
          petsAllowed: false,
          furnished: true,
          type: 'Villa',
          purpose: 'Sale',
          status: 'Approved',
          owner: owner._id,
          images: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          ],
        },
        {
          title: 'Spacious 3 BHK Residential Independent House',
          description: 'A lovely, spacious family house located in a quiet residential neighborhood. Perfect for families looking for a large backyard, local parks, and highly rated school systems.',
          address: 'Sector 62, Noida',
          city: 'Delhi NCR',
          state: 'Uttar Pradesh',
          country: 'India',
          latitude: 28.6273,
          longitude: 77.3725,
          price: 18000000, // 1.8 Crore
          bedrooms: 3,
          bathrooms: 3,
          area: 2200,
          parking: true,
          petsAllowed: true,
          furnished: false,
          type: 'House',
          purpose: 'Sale',
          status: 'Approved',
          owner: owner._id,
          images: [
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
          ],
        },
        {
          title: 'Premium PG for Working Professionals',
          description: 'High-quality paying guest accommodation. Inclusive of organic homemade meals, central AC, laundry facilities, high-speed WiFi, and 24/7 security backups.',
          address: 'Hitech City, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          latitude: 17.4483,
          longitude: 78.3741,
          price: 8500,
          bedrooms: 1,
          bathrooms: 1,
          area: 350,
          parking: false,
          petsAllowed: false,
          furnished: true,
          type: 'PG',
          purpose: 'Rent',
          status: 'Approved',
          owner: owner._id,
          images: [
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
          ],
        },
      ];

      await Property.insertMany(listings);
      console.log('Database successfully seeded!');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  // Only seed if database connection is successfully established
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    await seedData();
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
