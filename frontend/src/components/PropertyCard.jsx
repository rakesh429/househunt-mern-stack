import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Eye, Home } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PropertyCard = ({ property, onBookmarkToggle }) => {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(
    user?.wishlist?.includes(property._id) || false
  );
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to bookmark properties');
      return;
    }
    setBookmarkLoading(true);
    try {
      const res = await axios.post(`/properties/${property._id}/bookmark`);
      setBookmarked(res.data.isBookmarked);
      if (onBookmarkToggle) {
        onBookmarkToggle(property._id, res.data.isBookmarked);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const mainImage = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="card glass-card h-100 position-relative">
      {/* Property Category Tag */}
      <span className="position-absolute top-3 start-3 badge bg-primary z-2 px-3 py-2 rounded-pill shadow-sm">
        {property.purpose === 'Sale' ? 'For Sale' : 'For Rent'} • {property.type}
      </span>

      {/* Bookmark button */}
      <button
        onClick={handleBookmark}
        disabled={bookmarkLoading}
        className="btn position-absolute top-3 end-3 bg-white text-danger z-2 p-2 rounded-circle shadow border-0 d-flex align-items-center justify-content-center"
        style={{ width: '40px', height: '40px', transition: 'all 0.2s ease' }}
        title="Save Listing"
      >
        <Heart
          size={20}
          fill={bookmarked ? '#dc3545' : 'transparent'}
          className={bookmarkLoading ? 'opacity-50' : 'interactive-icon'}
        />
      </button>

      {/* Property Image Container */}
      <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={mainImage}
          alt={property.title}
          className="w-100 h-100 object-fit-cover transition-all"
          style={{ transition: 'transform 0.5s ease' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div
          className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-dark text-white d-flex align-items-end"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            height: '90px',
          }}
        >
          <h4 className="fw-bold m-0 text-white" style={{ fontFamily: 'Outfit' }}>
            ₹{property.price.toLocaleString('en-IN')}
            {property.purpose !== 'Sale' && <span className="fs-6 fw-normal text-light">/month</span>}
          </h4>
        </div>
      </div>

      {/* Card Details */}
      <div className="card-body d-flex flex-column p-4">
        <h5 className="card-title fw-bold text-truncate mb-2" title={property.title}>
          {property.title}
        </h5>
        
        <div className="d-flex align-items-center gap-1 text-secondary mb-3 small">
          <MapPin size={16} className="text-primary" />
          <span>{property.address}, {property.city}</span>
        </div>

        {/* Property Features */}
        <div className="d-flex justify-content-between border-top border-bottom py-2 my-2 text-secondary small">
          <div className="text-center">
            <span className="d-block fw-bold text-dark">{property.bedrooms} BHK</span>
            <span>Rooms</span>
          </div>
          <div className="text-center">
            <span className="d-block fw-bold text-dark">{property.bathrooms}</span>
            <span>Baths</span>
          </div>
          <div className="text-center">
            <span className="d-block fw-bold text-dark">{property.area}</span>
            <span>Sq Ft</span>
          </div>
        </div>

        <div className="mt-auto pt-3">
          <Link
            to={`/properties/${property._id}`}
            className="btn btn-outline-primary w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
          >
            <Eye size={16} /> View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
