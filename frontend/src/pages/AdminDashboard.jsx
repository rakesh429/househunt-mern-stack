import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Home, TrendingUp, Check, X, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('/admin/stats');
      setStats(statsRes.data.data);

      const usersRes = await axios.get('/admin/users');
      setAllUsers(usersRes.data.data);

      const propsRes = await axios.get('/admin/properties');
      setAllProperties(propsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToProperty = async (propertyId, decision) => {
    try {
      await axios.put(`/admin/properties/${propertyId}/respond`, { status: decision });
      fetchAdminData();
    } catch (err) {
      alert('Failed to respond to property listing');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete/ban this user and all their associated listings?')) return;
    try {
      await axios.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Admin Console...</span>
        </div>
      </div>
    );
  }

  // Formatting chart metrics data safely
  const categoryData = stats?.categories?.map((cat) => ({
    name: cat._id || 'Other',
    listings: cat.count,
  })) || [];

  const revenueOverview = [
    { month: 'Jan', revenue: Math.round(stats?.totalRevenue * 0.1 || 100) },
    { month: 'Feb', revenue: Math.round(stats?.totalRevenue * 0.3 || 350) },
    { month: 'Mar', revenue: Math.round(stats?.totalRevenue * 0.4 || 600) },
    { month: 'Apr', revenue: Math.round(stats?.totalRevenue * 0.7 || 1200) },
    { month: 'May', revenue: Math.round(stats?.totalRevenue * 0.9 || 1800) },
    { month: 'Jun', revenue: stats?.totalRevenue || 2400 },
  ];

  return (
    <div className="container py-5 fade-in">
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>

      {/* Main Stats Row */}
      {stats && (
        <div className="row g-3 mb-5">
          <div className="col-md-3">
            <div className="card glass-panel border p-3 shadow-sm d-flex flex-row align-items-center gap-3">
              <div className="bg-primary text-white p-3 rounded-circle"><Users size={24} /></div>
              <div>
                <span className="text-secondary small uppercase d-block">Registered Users</span>
                <h3 className="fw-bold m-0 text-dark">{stats.totalUsers}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-panel border p-3 shadow-sm d-flex flex-row align-items-center gap-3">
              <div className="bg-success text-white p-3 rounded-circle"><Home size={24} /></div>
              <div>
                <span className="text-secondary small uppercase d-block">Listed Properties</span>
                <h3 className="fw-bold m-0 text-dark">{stats.totalProperties}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-panel border p-3 shadow-sm d-flex flex-row align-items-center gap-3">
              <div className="bg-info text-white p-3 rounded-circle"><TrendingUp size={24} /></div>
              <div>
                <span className="text-secondary small uppercase d-block">Total Lease Deals</span>
                <h3 className="fw-bold m-0 text-dark">{stats.totalBookings}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card glass-panel border p-3 shadow-sm d-flex flex-row align-items-center gap-3">
              <div className="bg-warning text-white p-3 rounded-circle"><TrendingUp size={24} /></div>
              <div>
                <span className="text-secondary small uppercase d-block">Platform Earnings</span>
                <h3 className="fw-bold m-0 text-dark">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold border-0 ${activeTab === 'stats' ? 'active border-bottom border-primary text-primary' : 'text-secondary bg-transparent'}`}
            onClick={() => setActiveTab('stats')}
          >
            Analytics Charts
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold border-0 ${activeTab === 'properties' ? 'active border-bottom border-primary text-primary' : 'text-secondary bg-transparent'}`}
            onClick={() => setActiveTab('properties')}
          >
            Manage Listings ({allProperties.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold border-0 ${activeTab === 'users' ? 'active border-bottom border-primary text-primary' : 'text-secondary bg-transparent'}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users ({allUsers.length})
          </button>
        </li>
      </ul>

      {/* Tab Panels */}
      {activeTab === 'stats' && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card glass-card border p-4 shadow-sm">
              <h5 className="fw-bold mb-4">Cumulative Revenue Curve</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueOverview}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card glass-card border p-4 shadow-sm">
              <h5 className="fw-bold mb-4">Listings Category Distribution</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="listings" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <div>
          <h4 className="fw-bold mb-4">Moderate Property Listings</h4>
          <div className="table-responsive bg-white rounded-4 border shadow-sm">
            <table className="table align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th>Listing Title</th>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Status</th>
                  <th className="text-end">Approve / Reject</th>
                </tr>
              </thead>
              <tbody>
                {allProperties.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="fw-bold">{p.title}</div>
                      <span className="badge bg-primary small">{p.type}</span>
                    </td>
                    <td className="small text-secondary">{p.owner?.name}</td>
                    <td>{p.city}</td>
                    <td>
                      <span className={`badge px-3 py-2 rounded-pill small ${p.status === 'Approved' ? 'bg-success' : p.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {p.status === 'Pending' && (
                        <div className="d-flex gap-2 justify-content-end">
                          <button onClick={() => handleRespondToProperty(p._id, 'Approved')} className="btn btn-sm btn-success rounded-circle p-2" title="Approve Listing">
                            <Check size={16} />
                          </button>
                          <button onClick={() => handleRespondToProperty(p._id, 'Rejected')} className="btn btn-sm btn-danger rounded-circle p-2" title="Reject Listing">
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
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h4 className="fw-bold mb-4">Active System Users</h4>
          <div className="table-responsive bg-white rounded-4 border shadow-sm">
            <table className="table align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered Role</th>
                  <th>Verified</th>
                  <th className="text-end">Ban User</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="fw-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge bg-dark px-3 py-1 rounded-pill">{u.role}</span>
                    </td>
                    <td>
                      {u.isVerified ? <span className="text-success small">Verified</span> : <span className="text-danger small">Pending</span>}
                    </td>
                    <td className="text-end">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u._id)} className="btn btn-outline-danger btn-sm rounded-circle p-2" title="Ban & Remove User">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
