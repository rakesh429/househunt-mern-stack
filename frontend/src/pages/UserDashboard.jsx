import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { User as UserIcon, Calendar, Heart, Shield, Settings } from 'lucide-react';

const UserDashboard = () => {
  const { user, loadUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Favorites state
  const [savedProperties, setSavedProperties] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchWishlist();
  }, []);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await axios.get('/bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchWishlist = async () => {
    setSavedLoading(true);
    try {
      const res = await axios.get('/properties');
      // Filter local wishlist items using user.wishlist ids
      if (user?.wishlist) {
        setSavedProperties(res.data.data.filter((p) => user.wishlist.includes(p._id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavedLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    try {
      const res = await axios.put('/auth/updatedetails', {
        name,
        email,
        notificationsEnabled,
      });
      setProfileSuccess(true);
      // Reload token info
      const token = localStorage.getItem('token');
      if (token) loadUser(token);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.put(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const handleWishlistToggle = (propertyId, isBookmarked) => {
    if (!isBookmarked) {
      setSavedProperties((prev) => prev.filter((p) => p._id !== propertyId));
    }
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row">
        {/* Left Hand Sidebar Tabs */}
        <div className="col-lg-3 mb-4">
          <div className="card glass-panel border p-3 shadow-sm text-center">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt="avatar"
              className="rounded-circle mx-auto mb-3 shadow-sm border border-3 border-primary"
              style={{ width: '80px', height: '80px' }}
            />
            <h5 className="fw-bold text-dark m-0">{user?.name}</h5>
            <span className="badge bg-secondary mb-4 mt-1 px-3 py-1 rounded-pill">{user?.role}</span>

            <div className="d-flex flex-column gap-2 text-start">
              <button
                className={`btn w-100 rounded-3 border-0 py-2 d-flex align-items-center gap-2 small text-start ${activeTab === 'bookings' ? 'btn-primary text-white' : 'btn-light text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('bookings')}
              >
                <Calendar size={16} /> My Rental Bookings
              </button>
              <button
                className={`btn w-100 rounded-3 border-0 py-2 d-flex align-items-center gap-2 small text-start ${activeTab === 'wishlist' ? 'btn-primary text-white' : 'btn-light text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <Heart size={16} /> Bookmarked Properties
              </button>
              <button
                className={`btn w-100 rounded-3 border-0 py-2 d-flex align-items-center gap-2 small text-start ${activeTab === 'profile' ? 'btn-primary text-white' : 'btn-light text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('profile')}
              >
                <Settings size={16} /> Profile Settings
              </button>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="col-lg-9">
          {activeTab === 'bookings' && (
            <div className="card glass-card border p-4 shadow-sm">
              <h4 className="fw-bold mb-4">Rental History & Bookings</h4>
              {bookingsLoading ? (
                <p>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <div className="text-center py-5">
                  <span className="fs-1 d-block mb-2">📅</span>
                  <p className="text-secondary small">You haven't requested any property bookings yet.</p>
                  <Link to="/search" className="btn btn-primary btn-sm rounded-pill px-4">Browse Listings</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Dates</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b._id}>
                          <td>
                            <Link to={`/properties/${b.property?._id}`} className="fw-bold text-dark text-decoration-none">
                              {b.property?.title}
                            </Link>
                          </td>
                          <td className="small text-secondary">
                            {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                          </td>
                          <td className="fw-bold text-primary">₹{b.price.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`badge px-3 py-2 rounded-pill small ${b.status === 'Approved' ? 'bg-success' : b.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.status === 'Pending' && (
                              <button onClick={() => handleCancelBooking(b._id)} className="btn btn-sm btn-outline-danger rounded-pill px-3">
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="card glass-card border p-4 shadow-sm">
              <h4 className="fw-bold mb-4">Saved Properties</h4>
              {savedLoading ? (
                <p>Loading saved wishlist...</p>
              ) : savedProperties.length === 0 ? (
                <div className="text-center py-5">
                  <span className="fs-1 d-block mb-2">❤️</span>
                  <p className="text-secondary small">Your bookmarks folder is empty.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {savedProperties.map((p) => (
                    <div key={p._id} className="col-md-6">
                      <PropertyCard property={p} onBookmarkToggle={handleWishlistToggle} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card glass-card border p-4 shadow-sm">
              <h4 className="fw-bold mb-4">Edit Profile Settings</h4>
              {profileSuccess && <div className="alert alert-success">Profile details updated successfully!</div>}
              {profileError && <div className="alert alert-danger">{profileError}</div>}
              <form onSubmit={handleProfileSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Email Address</label>
                    <input
                      type="email"
                      className="form-control rounded-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch py-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notifSwitch"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      />
                      <label className="form-check-label small fw-semibold text-secondary" htmlFor="notifSwitch">
                        Enable email & booking notifications
                      </label>
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary rounded-pill btn-sm px-4 mt-4">
                  Save Settings
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
