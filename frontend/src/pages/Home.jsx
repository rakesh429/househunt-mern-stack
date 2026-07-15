import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import { Search, MapPin, Shield, Star, Users, Briefcase } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick search form values
  const [city, setCity] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await axios.get('/properties?limit=3');
      setFeatured(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?city=${city}&type=${type}`);
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section
        className="py-5 text-center text-white d-flex align-items-center justify-content-center position-relative"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(9, 13, 22, 0.95), rgba(79, 70, 229, 0.4)), url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '85vh',
        }}
      >
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 text-uppercase fw-bold tracking-wide">
                Next-Gen Home Finding
              </span>
              <h1 className="display-4 fw-extrabold mb-4" style={{ fontFamily: 'Outfit' }}>
                Discover Your Perfect Rental Sanctuary
              </h1>
              <p className="lead text-light opacity-90 mb-5">
                Connecting tenants and owners directly with verified homes, transparent pricing, and instant booking processes.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="glass-panel p-3 d-flex flex-column flex-md-row gap-2 shadow-lg align-items-center">
                <div className="d-flex align-items-center bg-white text-dark rounded-3 px-3 py-2 flex-fill w-100">
                  <MapPin className="text-primary me-2" />
                  <input
                    type="text"
                    className="border-0 w-100 bg-transparent text-dark"
                    placeholder="Enter city (e.g. Delhi, Bangalore)..."
                    style={{ outline: 'none' }}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="d-flex align-items-center bg-white text-dark rounded-3 px-3 py-2 flex-fill w-100">
                  <select
                    className="border-0 w-100 bg-transparent text-dark"
                    style={{ outline: 'none' }}
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="">Property Category</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="House">House</option>
                    <option value="Hostel">Hostel</option>
                    <option value="PG">PG</option>
                    <option value="Office">Office</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 w-md-auto px-4 py-2 d-flex align-items-center justify-content-center gap-2">
                  <Search size={18} /> Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-5 container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
          <div>
            <span className="text-primary fw-semibold text-uppercase tracking-wider small">Handpicked Properties</span>
            <h2 className="fw-bold fs-1 m-0">Featured Listings</h2>
          </div>
          <Link to="/search" className="btn btn-outline-primary rounded-pill px-4 mt-3 mt-md-0">
            View All Properties
          </Link>
        </div>

        {loading ? (
          <div className="row g-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="col-md-4">
                <div className="card glass-card p-3">
                  <div className="skeleton skeleton-image mb-3"></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-secondary">No featured listings found. Run database seeding.</h5>
          </div>
        ) : (
          <div className="row g-4">
            {featured.map((item) => (
              <div key={item._id} className="col-md-4">
                <PropertyCard property={item} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Counter Statistics */}
      <section className="py-5 bg-dark text-white border-top border-bottom border-secondary text-center">
        <div className="container py-4">
          <div className="row g-4">
            <div className="col-md-4">
              <h2 className="display-4 fw-extrabold text-primary mb-1">5K+</h2>
              <p className="text-secondary small uppercase tracking-wider">Happy Renters Connected</p>
            </div>
            <div className="col-md-4">
              <h2 className="display-4 fw-extrabold text-info mb-1">1,200+</h2>
              <p className="text-secondary small uppercase tracking-wider">Premium Listings Managed</p>
            </div>
            <div className="col-md-4">
              <h2 className="display-4 fw-extrabold text-warning mb-1">99.8%</h2>
              <p className="text-secondary small uppercase tracking-wider">Tenant Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-5 container text-center">
        <span className="text-primary fw-semibold text-uppercase tracking-wider small">Explore Destinations</span>
        <h2 className="fw-bold fs-1 mb-5">Search by Cities</h2>
        <div className="row g-3 justify-content-center">
          {['Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad'].map((cityName) => (
            <div key={cityName} className="col-6 col-md-3">
              <div
                onClick={() => navigate(`/search?city=${cityName}`)}
                className="p-4 glass-card border rounded-4 d-flex flex-column align-items-center justify-content-center cursor-pointer shadow-sm"
                style={{ cursor: 'pointer' }}
              >
                <span className="fs-1 mb-2">📍</span>
                <h5 className="fw-bold m-0">{cityName}</h5>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-light border-top border-bottom text-dark">
        <div className="container py-4 text-center">
          <span className="text-primary fw-semibold text-uppercase tracking-wider small">Testimonials</span>
          <h2 className="fw-bold fs-1 mb-5">Tenant & Landlord Stories</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-md-5">
              <div className="card glass-panel border p-4 text-start h-100 shadow-sm">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                    alt="user"
                    className="rounded-circle"
                    style={{ width: '50px', height: '50px' }}
                  />
                  <div>
                    <h6 className="fw-bold m-0 text-dark">Sarah Jenkins</h6>
                    <span className="text-muted small">Tenant, NY Apartment</span>
                  </div>
                </div>
                <p className="m-0 text-secondary italic">
                  "Finding an apartment in New York was a nightmare until I tried HouseHunt. Within two days, I had a scheduled viewing, directly chatted with John, and secured my booking online. The UI is gorgeous!"
                </p>
              </div>
            </div>
            <div className="col-md-5">
              <div className="card glass-panel border p-4 text-start h-100 shadow-sm">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                    alt="user"
                    className="rounded-circle"
                    style={{ width: '50px', height: '50px' }}
                  />
                  <div>
                    <h6 className="fw-bold m-0 text-dark">David Martinez</h6>
                    <span className="text-muted small">Property Owner, FL</span>
                  </div>
                </div>
                <p className="m-0 text-secondary italic">
                  "HouseHunt gave me a clean dashboard to track my multiple villas, view guest ratings, approve bookings, and monitor my total revenue. I highly recommend it to any property owner."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
