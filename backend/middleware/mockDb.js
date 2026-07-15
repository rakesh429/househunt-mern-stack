// In-Memory Database Emulator for Zero-Configuration Runs

// Pre-seeded Memory Databases
global.mockUsers = global.mockUsers || [
  {
    _id: 'admin-id',
    name: 'System Admin',
    email: 'admin@househunt.com',
    password: 'password123',
    role: 'admin',
    isVerified: true,
    wishlist: [],
    recentlyViewed: [],
    notificationsEnabled: true,
  },
  {
    _id: 'owner-id',
    name: 'Rajesh Sharma',
    email: 'owner@househunt.com',
    password: 'password123',
    role: 'owner',
    isVerified: true,
    wishlist: [],
    recentlyViewed: [],
    notificationsEnabled: true,
  },
  {
    _id: 'user-id',
    name: 'Jagan',
    email: 'user@househunt.com',
    password: 'password123',
    role: 'user',
    isVerified: true,
    wishlist: ['prop-1'],
    recentlyViewed: [],
    notificationsEnabled: true,
  },
];

global.mockProperties = global.mockProperties || [
  {
    _id: 'prop-1',
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
    owner: { _id: 'owner-id', name: 'Rajesh Sharma', email: 'owner@househunt.com' },
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    _id: 'prop-2',
    title: 'Luxury 4 BHK Villa with Private Garden',
    description: 'Experience pure luxury in this expansive 4 BHK villa. Boasting a massive private garden, custom patio, modular kitchen, and 24/7 security backups.',
    address: 'Bandra West, Link Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.0596,
    longitude: 72.8295,
    price: 65000000, // 6.5 Crore
    bedrooms: 4,
    bathrooms: 4,
    area: 3500,
    parking: true,
    petsAllowed: false,
    furnished: true,
    type: 'Villa',
    purpose: 'Sale',
    status: 'Approved',
    owner: { _id: 'owner-id', name: 'Rajesh Sharma', email: 'owner@househunt.com' },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    _id: 'prop-3',
    title: 'Spacious 3 BHK Independent House',
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
    owner: { _id: 'owner-id', name: 'Rajesh Sharma', email: 'owner@househunt.com' },
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

global.mockBookings = global.mockBookings || [];
global.mockMessages = global.mockMessages || [];
global.mockNotifications = global.mockNotifications || [];
global.mockReviews = global.mockReviews || [];

// Helper to decode simulated bearer token
const getMockUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return global.mockUsers.find((u) => u._id === token || u.email === token);
};

const mockDbMiddleware = (req, res, next) => {
  const url = req.path;
  const method = req.method;

  // 1. Auth Mock Endpoints
  if (url === '/auth/login' && method === 'POST') {
    const { email, password } = req.body;
    const user = global.mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    return res.status(200).json({ success: true, accessToken: user._id, refreshToken: user._id, user });
  }

  if (url === '/auth/register' && method === 'POST') {
    const { name, email, password, role } = req.body;
    if (global.mockUsers.find((u) => u.email === email)) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const newUser = {
      _id: 'user-' + Date.now(),
      name,
      email,
      password,
      role: role || 'user',
      isVerified: true,
      wishlist: [],
      recentlyViewed: [],
      notificationsEnabled: true,
    };
    global.mockUsers.push(newUser);
    return res.status(201).json({ success: true, accessToken: newUser._id, refreshToken: newUser._id, user: newUser });
  }

  if (url === '/auth/me' && method === 'GET') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    return res.status(200).json({ success: true, data: currentUser });
  }

  if (url === '/auth/updatedetails' && method === 'PUT') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { name, email, notificationsEnabled } = req.body;
    currentUser.name = name || currentUser.name;
    currentUser.email = email || currentUser.email;
    currentUser.notificationsEnabled = notificationsEnabled ?? currentUser.notificationsEnabled;
    return res.status(200).json({ success: true, data: currentUser });
  }

  if (url === '/auth/google' && method === 'POST') {
    const { email, name } = req.body;
    let user = global.mockUsers.find((u) => u.email === email);
    if (!user) {
      user = {
        _id: 'user-' + Date.now(),
        name,
        email,
        password: 'password123',
        role: 'user',
        isVerified: true,
        wishlist: [],
        recentlyViewed: [],
        notificationsEnabled: true,
      };
      global.mockUsers.push(user);
    }
    return res.status(200).json({ success: true, accessToken: user._id, refreshToken: user._id, user });
  }

  // 2. Properties Mock Endpoints
  if (url === '/properties' && method === 'GET') {
    const { city, type, minPrice, maxPrice, purpose } = req.query;
    let filtered = [...global.mockProperties].filter((p) => p.status === 'Approved');

    if (city) {
      filtered = filtered.filter((p) => p.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (type) {
      filtered = filtered.filter((p) => p.type === type);
    }
    if (purpose) {
      filtered = filtered.filter((p) => p.purpose === purpose);
    }
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    return res.status(200).json({ success: true, count: filtered.length, data: filtered });
  }

  if (url.startsWith('/properties/') && method === 'GET') {
    const parts = url.split('/');
    const id = parts[2];
    
    // Check if recommendations endpoint
    if (id === 'recommendations') {
      return res.status(200).json({ success: true, data: global.mockProperties.slice(0, 3) });
    }

    const property = global.mockProperties.find((p) => p._id === id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    
    // Attach reviews
    const reviews = global.mockReviews.filter((r) => r.property === id);
    return res.status(200).json({ success: true, data: { ...property, reviews } });
  }

  if (url === '/properties' && method === 'POST') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const newProp = {
      _id: 'prop-' + Date.now(),
      ...req.body,
      status: currentUser.role === 'admin' ? 'Approved' : 'Pending',
      owner: { _id: currentUser._id, name: currentUser.name, email: currentUser.email },
      images: req.body.images || ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80'],
    };
    global.mockProperties.push(newProp);
    return res.status(201).json({ success: true, data: newProp });
  }

  if (url.startsWith('/properties/') && url.endsWith('/bookmark') && method === 'POST') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = url.split('/')[2];
    const index = currentUser.wishlist.indexOf(id);
    if (index > -1) {
      currentUser.wishlist.splice(index, 1);
      return res.status(200).json({ success: true, isBookmarked: false });
    } else {
      currentUser.wishlist.push(id);
      return res.status(200).json({ success: true, isBookmarked: true });
    }
  }

  if (url.startsWith('/properties/') && method === 'DELETE') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = url.split('/')[2];
    global.mockProperties = global.mockProperties.filter((p) => p._id !== id);
    return res.status(200).json({ success: true, message: 'Property deleted' });
  }

  // 3. Bookings Mock Endpoints
  if (url === '/bookings' && method === 'POST') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { propertyId, startDate, endDate, price } = req.body;
    const property = global.mockProperties.find((p) => p._id === propertyId);
    
    const newBooking = {
      _id: 'book-' + Date.now(),
      property,
      tenant: { _id: currentUser._id, name: currentUser.name, email: currentUser.email },
      owner: property.owner,
      startDate,
      endDate,
      price,
      status: 'Pending',
      paymentStatus: 'Pending',
    };
    global.mockBookings.push(newBooking);

    // Create landlord notification
    global.mockNotifications.push({
      _id: 'notif-' + Date.now(),
      user: property.owner._id,
      title: 'New Booking Request',
      message: `You have received a lease request for "${property.title}"`,
      type: 'Booking',
      read: false,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, data: newBooking });
  }

  if (url === '/bookings' && method === 'GET') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const myBookings = global.mockBookings.filter(
      (b) => b.tenant._id === currentUser._id || b.owner._id === currentUser._id
    );
    return res.status(200).json({ success: true, data: myBookings });
  }

  if (url.startsWith('/bookings/') && url.endsWith('/respond') && method === 'PUT') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = url.split('/')[2];
    const { status } = req.body;
    const booking = global.mockBookings.find((b) => b._id === id);
    if (booking) {
      booking.status = status;
      if (status === 'Approved') booking.paymentStatus = 'Paid';
      
      // Notify tenant
      global.mockNotifications.push({
        _id: 'notif-' + Date.now(),
        user: booking.tenant._id,
        title: `Lease Request ${status}`,
        message: `Your booking request for "${booking.property?.title}" was ${status.toLowerCase()}`,
        type: 'Booking',
        read: false,
        createdAt: new Date(),
      });
    }
    return res.status(200).json({ success: true, data: booking });
  }

  if (url.startsWith('/bookings/') && url.endsWith('/cancel') && method === 'PUT') {
    const id = url.split('/')[2];
    const booking = global.mockBookings.find((b) => b._id === id);
    if (booking) booking.status = 'Cancelled';
    return res.status(200).json({ success: true, data: booking });
  }

  // 4. Messages Mock Endpoints
  if (url === '/messages' && method === 'POST') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { receiverId, message } = req.body;
    const newMsg = {
      _id: 'msg-' + Date.now(),
      sender: currentUser._id,
      receiver: receiverId,
      message,
      read: false,
      createdAt: new Date(),
    };
    global.mockMessages.push(newMsg);
    return res.status(201).json({ success: true, data: newMsg });
  }

  if (url === '/messages/users' && method === 'GET') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    // Find all users except current
    const users = global.mockUsers.filter((u) => u._id !== currentUser._id);
    const chatUsers = users.map((u) => {
      const chatMsgs = global.mockMessages.filter(
        (m) => (m.sender === currentUser._id && m.receiver === u._id) || (m.sender === u._id && m.receiver === currentUser._id)
      );
      const lastMsg = chatMsgs.length > 0 ? chatMsgs[chatMsgs.length - 1] : null;

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        unreadCount: chatMsgs.filter((m) => m.receiver === currentUser._id && !m.read).length,
        lastMessage: lastMsg ? lastMsg.message : '',
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
      };
    });

    return res.status(200).json({ success: true, data: chatUsers });
  }

  if (url.startsWith('/messages/') && method === 'GET') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const otherUserId = url.split('/')[2];
    
    const chatMsgs = global.mockMessages.filter(
      (m) => (m.sender === currentUser._id && m.receiver === otherUserId) || (m.sender === otherUserId && m.receiver === currentUser._id)
    );

    // Mark as read
    chatMsgs.forEach((m) => {
      if (m.receiver === currentUser._id) m.read = true;
    });

    return res.status(200).json({ success: true, data: chatMsgs });
  }

  // 5. Notifications Mock Endpoints
  if (url === '/notifications' && method === 'GET') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const myNotifs = global.mockNotifications.filter((n) => n.user === currentUser._id);
    return res.status(200).json({ success: true, data: myNotifs });
  }

  if (url === '/notifications/read' && method === 'PUT') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    global.mockNotifications.forEach((n) => {
      if (n.user === currentUser._id) n.read = true;
    });
    return res.status(200).json({ success: true, message: 'Marked read' });
  }

  // 6. Reviews Mock Endpoints
  if (url === '/reviews' && method === 'POST') {
    const currentUser = getMockUser(req);
    if (!currentUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { propertyId, rating, comment } = req.body;
    const newRev = {
      _id: 'rev-' + Date.now(),
      property: propertyId,
      author: { _id: currentUser._id, name: currentUser.name },
      rating,
      comment,
      createdAt: new Date(),
    };
    global.mockReviews.push(newRev);
    return res.status(201).json({ success: true, data: newRev });
  }

  // 7. Dashboards Stats Mock Endpoints
  if (url === '/owner/stats' && method === 'GET') {
    const currentUser = getMockUser(req);
    const properties = global.mockProperties.filter((p) => p.owner?._id === currentUser?._id);
    const bookings = global.mockBookings.filter((b) => b.owner?._id === currentUser?._id);
    
    return res.status(200).json({
      success: true,
      data: {
        totalProperties: properties.length,
        totalBookings: bookings.length,
        totalRevenue: bookings.filter((b) => b.status === 'Approved').reduce((s, b) => s + b.price, 0),
        pendingProperties: properties.filter((p) => p.status === 'Pending').length,
        statusCounts: {
          Approved: bookings.filter((b) => b.status === 'Approved').length,
          Pending: bookings.filter((b) => b.status === 'Pending').length,
        },
      },
    });
  }

  if (url === '/owner/properties' && method === 'GET') {
    const currentUser = getMockUser(req);
    const properties = global.mockProperties.filter((p) => p.owner?._id === currentUser?._id);
    return res.status(200).json({ success: true, data: properties });
  }

  if (url === '/admin/stats' && method === 'GET') {
    const approvedBookings = global.mockBookings.filter((b) => b.status === 'Approved');
    return res.status(200).json({
      success: true,
      data: {
        totalUsers: global.mockUsers.length,
        totalProperties: global.mockProperties.length,
        totalBookings: global.mockBookings.length,
        totalRevenue: approvedBookings.reduce((sum, b) => sum + b.price, 0),
        categories: [
          { _id: 'Apartment', count: global.mockProperties.filter((p) => p.type === 'Apartment').length },
          { _id: 'Villa', count: global.mockProperties.filter((p) => p.type === 'Villa').length },
          { _id: 'House', count: global.mockProperties.filter((p) => p.type === 'House').length },
        ],
      },
    });
  }

  if (url === '/admin/users' && method === 'GET') {
    return res.status(200).json({ success: true, data: global.mockUsers });
  }

  if (url.startsWith('/admin/users/') && method === 'DELETE') {
    const id = url.split('/')[3];
    global.mockUsers = global.mockUsers.filter((u) => u._id !== id);
    return res.status(200).json({ success: true, message: 'User deleted' });
  }

  if (url === '/admin/properties' && method === 'GET') {
    return res.status(200).json({ success: true, data: global.mockProperties });
  }

  if (url.startsWith('/admin/properties/') && url.endsWith('/respond') && method === 'PUT') {
    const id = url.split('/')[3];
    const { status } = req.body;
    const property = global.mockProperties.find((p) => p._id === id);
    if (property) property.status = status;
    return res.status(200).json({ success: true, data: property });
  }

  // Pass-through other routes
  next();
};

module.exports = mockDbMiddleware;
