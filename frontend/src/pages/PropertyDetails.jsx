import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Calculators from '../components/Calculators';
import PropertyCard from '../components/PropertyCard';
import { MapPin, Calendar, MessageSquare, Star, Sparkles, Check, X, ShieldAlert } from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Leaflet map element ref
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/properties/${id}`);
      setProperty(res.data.data);

      // Fetch recommendations
      try {
        const recRes = await axios.get('/properties/recommendations');
        setRecommendations(recRes.data.data.filter((p) => p._id !== id).slice(0, 3));
      } catch (e) {
        // Fallback recommendations if user not logged in
        const recRes = await axios.get('/properties?limit=4');
        setRecommendations(recRes.data.data.filter((p) => p._id !== id).slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Map using raw Leaflet to guarantee robust compatibility
  useEffect(() => {
    if (property && mapRef.current && !mapInstance.current) {
      const L = window.L;
      if (L) {
        const lat = property.latitude || 40.7128;
        const lng = property.longitude || -74.006;
        
        mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance.current);

        L.marker([lat, lng])
          .addTo(mapInstance.current)
          .bindPopup(property.title)
          .openPopup();
      }
    }
    
    // Cleanup map on unmount/re-render
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [property]);

  // Handle Booking Submit
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (property.purpose === 'Sale') {
      try {
        await axios.post('/bookings', {
          propertyId: property._id,
          startDate,
          endDate: startDate,
          price: property.price,
        });
        setBookingSuccess(true);
        setBookingError('');
      } catch (err) {
        setBookingError(err.response?.data?.message || 'Purchase inquiry failed');
      }
      return;
    }

    if (!startDate || !endDate) {
      setBookingError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = (end - start) / (1000 * 60 * 60 * 24 * 30);

    if (months <= 0) {
      setBookingError('End date must be after start date');
      return;
    }

    try {
      const calculatedPrice = Math.round(property.price * Math.max(months, 0.5));
      await axios.post('/bookings', {
        propertyId: property._id,
        startDate,
        endDate,
        price: calculatedPrice,
      });
      setBookingSuccess(true);
      setBookingError('');
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking request failed');
    }
  };

  // Handle Review Submit
  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post('/reviews', {
        propertyId: property._id,
        rating,
        comment,
      });
      
      // Add review to state
      setProperty((prev) => ({
        ...prev,
        reviews: [...prev.reviews, res.data.data],
      }));
      setReviewSuccess(true);
      setReviewError('');
      setComment('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading property...</span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-5 text-center">
        <h4>Property listing not found.</h4>
        <Link to="/" className="btn btn-primary rounded-pill mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row">
        {/* Main Details Panel */}
        <div className="col-lg-8">
          <h1 className="fw-bold tracking-tight mb-2">{property.title}</h1>
          <div className="d-flex align-items-center gap-1 text-secondary mb-4">
            <MapPin size={18} className="text-primary" />
            <span>{property.address}, {property.city}, {property.state}, {property.country}</span>
          </div>

          {/* Gallery Carousel */}
          <div id="propertyImagesCarousel" className="carousel slide shadow rounded-4 overflow-hidden mb-5" data-bs-ride="carousel">
            <div className="carousel-inner" style={{ height: '450px' }}>
              {property.images.map((image, idx) => (
                <div key={idx} className={`carousel-item h-100 ${idx === 0 ? 'active' : ''}`}>
                  <img src={image} className="d-block w-100 h-100 object-fit-cover" alt={`view-${idx}`} />
                </div>
              ))}
            </div>
            {property.images.length > 1 && (
              <>
                <button className="carousel-control-prev" type="button" data-bs-target="#propertyImagesCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#propertyImagesCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
              </>
            )}
          </div>

          {/* Core Specs */}
          <div className="row g-3 mb-5">
            <div className="col-6 col-md-3">
              <div className="bg-light p-3 rounded-4 text-center border">
                <span className="text-muted d-block small">Monthly Rent</span>
                <h4 className="fw-bold m-0 text-primary">₹{property.price.toLocaleString('en-IN')}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-light p-3 rounded-4 text-center border">
                <span className="text-muted d-block small">Configuration</span>
                <h4 className="fw-bold m-0 text-dark">{property.bedrooms} BHK</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-light p-3 rounded-4 text-center border">
                <span className="text-muted d-block small">Bathrooms</span>
                <h4 className="fw-bold m-0 text-dark">{property.bathrooms}</h4>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-light p-3 rounded-4 text-center border">
                <span className="text-muted d-block small">Super Built Area</span>
                <h4 className="fw-bold m-0 text-dark">{property.area} <span className="fs-6 fw-normal">SqFt</span></h4>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <h4 className="fw-bold mb-3">About this Listing</h4>
            <p className="text-secondary leading-relaxed" style={{ fontSize: '1.05rem' }}>
              {property.description}
            </p>
          </div>

          {/* Amenities Details list */}
          <div className="mb-5">
            <h4 className="fw-bold mb-3">Amenities</h4>
            <div className="row g-2">
              <div className="col-6 col-md-4 d-flex align-items-center gap-2">
                {property.parking ? <Check className="text-success" /> : <X className="text-danger" />}
                <span className="text-secondary">Parking Available</span>
              </div>
              <div className="col-6 col-md-4 d-flex align-items-center gap-2">
                {property.petsAllowed ? <Check className="text-success" /> : <X className="text-danger" />}
                <span className="text-secondary">Pets Allowed</span>
              </div>
              <div className="col-6 col-md-4 d-flex align-items-center gap-2">
                {property.furnished ? <Check className="text-success" /> : <X className="text-danger" />}
                <span className="text-secondary">Fully Furnished</span>
              </div>
            </div>
          </div>

          {/* OpenStreetMap Map Location */}
          <div className="mb-5">
            <h4 className="fw-bold mb-3">Location Map</h4>
            <div ref={mapRef} className="rounded-4 shadow" style={{ height: '300px', width: '100%' }}></div>
          </div>

          {/* Reviews List & Add Review Form */}
          <div className="mb-5">
            <h4 className="fw-bold mb-3">Property Reviews ({property.reviews?.length || 0})</h4>
            {property.reviews?.length === 0 ? (
              <div className="p-4 bg-light rounded-4 text-center text-muted mb-4 border">
                No reviews yet. Be the first to leave one!
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 mb-4">
                {property.reviews?.map((review) => (
                  <div key={review._id} className="card p-3 border-0 bg-light rounded-4 shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={review.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                          alt="reviewer"
                          className="rounded-circle"
                          style={{ width: '35px', height: '35px' }}
                        />
                        <h6 className="fw-bold m-0 text-dark">{review.author?.name}</h6>
                      </div>
                      <div className="d-flex align-items-center text-warning gap-1 small">
                        <Star size={14} fill="#ffc107" />
                        <span className="fw-semibold text-dark">{review.rating}</span>
                      </div>
                    </div>
                    <p className="m-0 text-secondary small">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Write Review */}
            {user ? (
              <div className="card glass-panel border p-4 rounded-4 shadow-sm">
                <h5 className="fw-bold mb-3">Write a Review</h5>
                {reviewSuccess && <div className="alert alert-success">Review submitted successfully!</div>}
                {reviewError && <div className="alert alert-danger">{reviewError}</div>}
                <form onSubmit={handleReview}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Rating</label>
                    <select className="form-select rounded-3" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                      <option value={5}>5 Stars - Excellent</option>
                      <option value={4}>4 Stars - Very Good</option>
                      <option value={3}>3 Stars - Good</option>
                      <option value={2}>2 Stars - Poor</option>
                      <option value={1}>1 Star - Horrible</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Comment</label>
                    <textarea
                      rows={3}
                      className="form-control rounded-3"
                      placeholder="Share your experience living here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary rounded-pill btn-sm px-4">
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-secondary small">Please <Link to="/login" className="text-primary fw-semibold">Sign In</Link> to submit a review.</p>
            )}
          </div>

          {/* Financial Calculators */}
          <Calculators defaultPrice={property.price} />
        </div>

        {/* Sidebar Reservation Form */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '100px', zIndex: '1' }}>
            <div className="card border-0 glass-panel shadow p-4 rounded-4 mb-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fs-5 fw-bold text-secondary">{property.purpose === 'Sale' ? 'Purchase Price:' : 'Monthly Rate:'}</span>
                <span className="fs-3 fw-bold text-primary">₹{property.price.toLocaleString('en-IN')}</span>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-4">
                  <span className="fs-1 d-block mb-3">🎉</span>
                  <h5 className="fw-bold text-success">Inquiry Sent!</h5>
                  <p className="text-secondary small">
                    {property.purpose === 'Sale'
                      ? 'Your purchase interest query has been sent to the owner. Track responses in your Account Dashboard.'
                      : 'Your reservation query was delivered to the property landlord. Track states in your Dashboard.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking}>
                  {bookingError && <div className="alert alert-danger small py-2">{bookingError}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      {property.purpose === 'Sale' ? 'Target Closing Date' : 'Start Lease Date'}
                    </label>
                    <div className="input-group">
                      <span className="input-group-text"><Calendar size={16} /></span>
                      <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  {property.purpose !== 'Sale' && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">End Lease Date</label>
                      <div className="input-group">
                        <span className="input-group-text"><Calendar size={16} /></span>
                        <input
                          type="date"
                          className="form-control"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required={property.purpose !== 'Sale'}
                        />
                      </div>
                    </div>
                  )}
                  
                  <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 font-bold shadow mb-3">
                    {property.purpose === 'Sale' ? 'Submit Purchase Offer' : 'Submit Booking Request'}
                  </button>
                </form>
              )}

              {/* Chat Owner trigger */}
              {user && user.id !== property.owner?._id && (
                <button
                  onClick={() => navigate(`/chat?receiverId=${property.owner?._id}`)}
                  className="btn btn-outline-secondary w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  <MessageSquare size={16} /> Chat with Landlord
                </button>
              )}
            </div>

            {/* Owner Details Profile Card */}
            <div className="card border p-3 rounded-4 shadow-sm bg-white">
              <h6 className="fw-bold mb-3 text-secondary uppercase tracking-wider small">Property Owner</h6>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={property.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                  alt="owner"
                  className="rounded-circle shadow-sm"
                  style={{ width: '50px', height: '50px' }}
                />
                <div>
                  <h6 className="fw-bold m-0 text-dark">{property.owner?.name}</h6>
                  <span className="text-secondary small">{property.owner?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Slider / Row */}
      {recommendations.length > 0 && (
        <section className="py-5 mt-5 border-top">
          <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <Sparkles className="text-primary animate-pulse" />
            AI Recommended Properties
          </h3>
          <div className="row g-4">
            {recommendations.map((item) => (
              <div key={item._id} className="col-md-4">
                <PropertyCard property={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PropertyDetails;
