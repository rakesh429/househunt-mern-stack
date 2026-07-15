# HouseHunt - Premium House Rent Management System

HouseHunt is a production-ready, full-stack MERN (MongoDB, Express, React, Node.js) application designed to facilitate rental agreements, home listing discovery, and direct chat interactions between tenants and landlords.

---

## Technical Architecture Overview

### Backend Features
- **Security Protocols**: Armed with Helmet headers, Rate limiting, CORS, Mongo Query Injection sanitizer, and XSS attack mitigation filters.
- **Data Models**: User, Property Listings, Bookings, Reviews, Notifications, and Direct Messages.
- **Mailer (SMTP)**: Direct Nodemailer connection with email templates and simulated console fallbacks.
- **Image Hosting**: Integrated Cloudinary support for multiple asset uploads with automatic mock local fallbacks.

### Frontend Features
- **Aesthetic Premium UI**: Implements custom glassmorphism panels, dark mode/light mode themes, responsive grid systems, and clean animations.
- **Search & Filters**: Multi-faceted filter triggers including location search, price limits, room parameters, and amenities tags.
- **Embedded Interactive Map**: Native OpenStreetMap Leaflet map.
- **Financial Toolkits**: Integrated Mortgage payment calculator, EMI calculator, and Rent affordability index.
- **Live Chats**: Direct messages between tenants and owners.

---

## Directory Layout

```
house-rent/
├── backend/
│   ├── config/             # DB & Cloudinary setups
│   ├── controllers/        # Express handlers
│   ├── middleware/         # Auth, Roles, Error boundary
│   ├── models/             # Mongoose schemas
│   ├── routes/             # REST endpoints
│   ├── utils/              # Mailer, Image processors
│   └── server.js           # Express main server
├── frontend/
│   ├── src/
│   │   ├── components/     # Cards, Navbar, Calculators
│   │   ├── context/        # Auth & Theme states
│   │   ├── pages/          # Search, Details, Dashboards
│   │   └── App.jsx         # App router wrapper
│   └── index.html
└── package.json            # Root workspaces run manager
```

---

## Installation & Running

### Prerequisites
1. **Node.js** (v16+)
2. **MongoDB** (Local or Atlas URI)

### Local Setup Instructions

1. **Install Dependencies**:
   Open a terminal in the root directory and run:
   ```bash
   npm run install-all
   ```

2. **Configure Environment Variables**:
   Verify/edit variables in `backend/.env`. (Default keys are supplied for mock local run).

3. **Start the Application**:
   To run both backend and frontend concurrently in development mode:
   ```bash
   # Run from root folder
   npm run dev
   ```
   Or launch services individually:
   ```bash
   # Launch Backend
   npm run backend-dev

   # Launch Frontend
   npm run frontend
   ```

4. **Verify Seed Listings**:
   The backend automatically seeds a series of properties in Austin, Miami, and New York on startup if the database collections are empty.

---

## Developer Quick Login Credentials
For rapid testing of dashboards and booking workflows, use these pre-seeded logins:

- **Admin Profile**: `admin@househunt.com` / `password123`
- **Landlord Profile**: `owner@househunt.com` / `password123`
- **Tenant Profile**: `user@househunt.com` / `password123`

---

## API Endpoint Documentation

| Category | Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Register a new user | No |
| **Auth** | `/api/auth/login` | `POST` | Authenticate credentials & return JWT | No |
| **Properties** | `/api/properties` | `GET` | Retrieve properties with filters & sorting | No |
| **Properties** | `/api/properties/:id` | `GET` | Retrieve a single property details | No |
| **Properties** | `/api/properties` | `POST` | Create property listings (Multer images) | Yes (Owner/Admin) |
| **Bookings** | `/api/bookings` | `POST` | Request a new property lease booking | Yes |
| **Bookings** | `/api/bookings/:id/respond`| `PUT` | Approve or Reject bookings | Yes (Owner/Admin) |
| **Messages** | `/api/messages` | `POST` | Send direct message chat | Yes |
| **Admin** | `/api/admin/stats` | `GET` | Retrieve global platform statistics | Yes (Admin) |

---

## Production Deployment Checklist

### Backend Deployment (Render / Heroku)
1. Link your git repository to Render.
2. Select **Web Service**, set Build Command to `npm install` (in backend subdirectory), and Start Command to `node server.js`.
3. Provide your production MongoDB Atlas Connection string as `MONGO_URI`.

### Frontend Deployment (Vercel / Netlify)
1. Import your workspace directory to Vercel.
2. Select the `frontend` folder as the root directory.
3. Keep default build presets (`vite build` and output directory `dist`).
4. Set Environment variable `VITE_API_URL` to point to your live backend endpoint.
