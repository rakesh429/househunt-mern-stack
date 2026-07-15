import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Home, Plus, Trash2, Check, X, ShieldAlert, TrendingUp, Key } from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');

  // Dashboard Statistics State
  const [stats, setStats] = useState(null);
  const [myProperties, setMyProperties] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Property Creation Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [area, setArea] = useState(1000);
  const [type, setType] = useState('Apartment');
  const [purpose, setPurpose] = useState('Rent');
  const [parking, setParking] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await axios.get('/owner/stats');
      setStats(statsRes.data.data);

      // Fetch owner listings
      const propsRes = await axios.get('/owner/properties');
      setMyProperties(propsRes.data.data);

      // Fetch bookings requests
      const bookingsRes = await axios.get('/bookings');
      setIncomingBookings(bookingsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title || !price || !city || !address) {
      setFormError('Please fill all required fields');
      return;
    }

    try {
      // Post property creation body
      await axios.post('/properties', {
        title,
        description,
        address,
        city,
        state,
        country,
        price: Number(price),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: Number(area),
        type,
        purpose,
        parking,
        petsAllowed,
        furnished,
        images: imageUrl ? [imageUrl] : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setAddress('');
      setCity('');
      setState('');
      setPrice('');
      setPurpose('Rent');
      setImageUrl('');
      setShowAddForm(false);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to list property');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Delete this property listing?')) return;
    try {
      await axios.delete(`/properties/${id}`);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete property listing');
    }
  };

  const handleRespondToBooking = async (bookingId, response) => {
    try {
      await axios.put(`/bookings/${bookingId}/respond`, { status: response });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      <h2 className="fw-bold mb-4">Owner Dashboard</h2>

      {/* Stats Cards Row */}
      {stats && (
        <div className="row g-3 mb-5">
          <div className="col-md-3">
            <div className="card glass-panel border p-3 shadow-sm">
              <span className="text-secondary small uppercase tracking-wider">Total Properties</span>
              <h3 className="fw-bold m-0 text-dark">{stats.totalProperties}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-panel border p-3 shadow-sm">
              <span className="text-secondary small uppercase tracking-wider">Active Bookings</span>
              <h3 className="fw-bold m-0 text-success">{stats.statusCounts?.Approved || 0}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-panel border p-3 shadow-sm">
              <span className="text-secondary small uppercase tracking-wider font-bold">Total Earnings</span>
              <h3 className="fw-bold m-0 text-primary">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-panel border p-3 shadow-sm">
              <span className="text-secondary small uppercase tracking-wider">Pending Approvals</span>
              <h3 className="fw-bold m-0 text-warning">{stats.pendingProperties}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Menu Tabs Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold border-0 ${activeTab === 'properties' ? 'active border-bottom border-primary text-primary' : 'text-secondary bg-transparent'}`}
            onClick={() => setActiveTab('properties')}
          >
            My Listings ({myProperties.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold border-0 ${activeTab === 'requests' ? 'active border-bottom border-primary text-primary' : 'text-secondary bg-transparent'}`}
            onClick={() => setActiveTab('requests')}
          >
            Lease Requests ({incomingBookings.length})
          </button>
        </li>
      </ul>

      {/* Tab Contents */}
      {activeTab === 'properties' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold m-0">Listed Properties</h4>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary btn-sm rounded-pill px-4 d-flex align-items-center gap-1">
              <Plus size={16} /> Add Property
            </button>
          </div>

          {/* Add Property Form Toggle Block */}
          {showAddForm && (
            <div className="card glass-card border p-4 mb-4 shadow-sm">
              <h5 className="fw-bold mb-3">List New Property</h5>
              {formError && <div className="alert alert-danger">{formError}</div>}
              <form onSubmit={handleCreateProperty}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Title *</label>
                    <input type="text" className="form-control rounded-3" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-secondary">Price (₹) *</label>
                    <input type="number" className="form-control rounded-3" value={price} onChange={(e) => setPrice(e.target.value)} required />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-semibold text-secondary">Purpose</label>
                    <select className="form-select rounded-3" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                      <option value="Rent">For Rent</option>
                      <option value="Sale">For Sale</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-semibold text-secondary">Type</label>
                    <select className="form-select rounded-3" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="House">House</option>
                      <option value="Hostel">Hostel</option>
                      <option value="PG">PG</option>
                      <option value="Office">Office</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">Address *</label>
                    <input type="text" className="form-control rounded-3" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-secondary">City *</label>
                    <input type="text" className="form-control rounded-3" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-secondary">State *</label>
                    <input type="text" className="form-control rounded-3" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-secondary">Bedrooms</label>
                    <input type="number" className="form-control rounded-3" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-secondary">Bathrooms</label>
                    <input type="number" className="form-control rounded-3" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-secondary">Area (Sq Ft)</label>
                    <input type="number" className="form-control rounded-3" value={area} onChange={(e) => setArea(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-secondary">Direct Image URL</label>
                    <input type="text" className="form-control rounded-3" placeholder="https://unsplash..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                  </div>

                  {/* Boolean settings */}
                  <div className="col-md-12 d-flex gap-4 py-2">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="formParking" checked={parking} onChange={(e) => setParking(e.target.checked)} />
                      <label className="form-check-label small text-secondary" htmlFor="formParking">Parking Available</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="formPets" checked={petsAllowed} onChange={(e) => setPetsAllowed(e.target.checked)} />
                      <label className="form-check-label small text-secondary" htmlFor="formPets">Pets Allowed</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="formFurnished" checked={furnished} onChange={(e) => setFurnished(e.target.checked)} />
                      <label className="form-check-label small text-secondary" htmlFor="formFurnished">Fully Furnished</label>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary">Detailed Description</label>
                    <textarea rows={3} className="form-control rounded-3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4 justify-content-end">
                  <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-sm btn-outline-secondary rounded-pill px-3">Cancel</button>
                  <button type="submit" className="btn btn-sm btn-primary rounded-pill px-4">Submit Property</button>
                </div>
              </form>
            </div>
          )}

          {myProperties.length === 0 ? (
            <div className="text-center py-5 glass-panel border rounded-4">
              <Home size={40} className="text-secondary mb-3" />
              <p className="text-secondary small">You haven't listed any properties yet.</p>
            </div>
          ) : (
            <div className="table-responsive bg-white rounded-4 shadow-sm border">
              <table className="table align-middle m-0">
                <thead className="table-light">
                  <tr>
                    <th>Listing Details</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Moderation Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myProperties.map((p) => (
                    <tr key={p._id}>
                      <td className="fw-bold">{p.title}</td>
                      <td>{p.type}</td>
                      <td className="fw-bold text-primary">₹{p.price.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge px-3 py-2 rounded-pill small ${p.status === 'Approved' ? 'bg-success' : p.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button onClick={() => handleDeleteProperty(p._id)} className="btn btn-outline-danger btn-sm rounded-circle p-2" title="Remove Listing">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <h4 className="fw-bold mb-4">Rental Lease Enquiries</h4>
          {incomingBookings.length === 0 ? (
            <p className="text-secondary text-center py-4">No lease requests found.</p>
          ) : (
            <div className="table-responsive bg-white rounded-4 shadow-sm border">
              <table className="table align-middle m-0">
                <thead className="table-light">
                  <tr>
                    <th>Tenant Details</th>
                    <th>Dates Required</th>
                    <th>Rate Offered</th>
                    <th>Status</th>
                    <th className="text-end">Moderation</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingBookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div className="fw-bold">{b.tenant?.name || 'User Client'}</div>
                        <div className="small text-secondary">{b.tenant?.email}</div>
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
                      <td className="text-end">
                        {b.status === 'Pending' && (
                          <div className="d-flex gap-2 justify-content-end">
                            <button onClick={() => handleRespondToBooking(b._id, 'Approved')} className="btn btn-sm btn-success rounded-circle p-2" title="Approve Request">
                              <Check size={16} />
                            </button>
                            <button onClick={() => handleRespondToBooking(b._id, 'Rejected')} className="btn btn-sm btn-danger rounded-circle p-2" title="Reject Request">
                              <X size={16} />
                            </button>
                          </div>
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
    </div>
  );
};

export default OwnerDashboard;
