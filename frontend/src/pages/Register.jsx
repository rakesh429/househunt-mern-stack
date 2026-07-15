import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, User, ShieldAlert } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user (tenant) or owner (landlord)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register(name, email, password, role);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center py-5 fade-in"
      style={{ minHeight: '80vh' }}
    >
      <div className="card glass-panel border p-5 shadow-lg rounded-4" style={{ width: '450px' }}>
        <div className="text-center mb-4">
          <span className="fs-1">🏠</span>
          <h3 className="fw-bold mt-2 text-dark">Create Account</h3>
          <p className="text-secondary small">Sign up to explore or rent properties</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><User size={16} className="text-secondary" /></span>
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><Mail size={16} className="text-secondary" /></span>
              <input
                type="email"
                className="form-control"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><Key size={16} className="text-secondary" /></span>
              <input
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="mb-4">
            <label className="form-label small fw-semibold text-secondary">I want to:</label>
            <select className="form-select rounded-3" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Search / Rent Properties (Tenant)</option>
              <option value="owner">List my properties (Owner)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-100 rounded-pill py-2 font-bold mb-3">
            {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-secondary small m-0">
          Already have an account? <Link to="/login" className="text-primary fw-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
