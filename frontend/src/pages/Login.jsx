import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, ShieldAlert, Sparkles } from 'lucide-react';

const Login = () => {
  const { login, otpLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Login toggler
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (useOtp) {
      if (!otpSent) {
        // Request OTP
        try {
          const axios = require('axios');
          await axios.post('/auth/otp/request', { email });
          setOtpSent(true);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
          setLoading(false);
        }
      } else {
        // Verify OTP
        const res = await otpLogin(email, otp);
        if (res.success) {
          navigate('/');
        } else {
          setError(res.message);
          setLoading(false);
        }
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
        setLoading(false);
      }
    }
  };

  // Helper autofills for fast testing
  const handleAutofill = (role) => {
    if (role === 'admin') {
      setEmail('admin@househunt.com');
      setPassword('password123');
    } else if (role === 'owner') {
      setEmail('owner@househunt.com');
      setPassword('password123');
    } else {
      setEmail('user@househunt.com');
      setPassword('password123');
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
          <h3 className="fw-bold mt-2 text-dark">Welcome back</h3>
          <p className="text-secondary small">Access your HouseHunt rental portal</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white"><Mail size={16} className="text-secondary" /></span>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password (if not OTP) */}
          {!useOtp && (
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><Key size={16} className="text-secondary" /></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* OTP Code Input (if OTP active) */}
          {useOtp && otpSent && (
            <div className="mb-4">
              <label className="form-label small fw-semibold text-secondary">Enter 6-Digit OTP</label>
              <input
                type="text"
                className="form-control text-center fs-5"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-100 rounded-pill py-2 font-bold mb-3 d-flex align-items-center justify-content-center gap-2">
            <LogIn size={18} />
            {loading ? 'Authenticating...' : useOtp && !otpSent ? 'Send OTP Code' : 'Sign In'}
          </button>
        </form>

        {/* OTP Toggle Mode */}
        <div className="text-center mb-4">
          <button onClick={() => setUseOtp(!useOtp)} className="btn btn-sm btn-link text-decoration-none text-primary">
            {useOtp ? 'Use Password Sign In' : 'Sign In using OTP'}
          </button>
        </div>

        {/* Quick Testing Profiles Block */}
        <div className="p-3 bg-light rounded-4 border mb-4">
          <div className="d-flex align-items-center gap-1 mb-2">
            <Sparkles size={14} className="text-warning" />
            <span className="small fw-bold text-dark">Developer Fast Sign-In:</span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button onClick={() => handleAutofill('admin')} className="btn btn-xs btn-outline-dark rounded-pill px-2 py-1" style={{ fontSize: '0.75rem' }}>
              Admin
            </button>
            <button onClick={() => handleAutofill('owner')} className="btn btn-xs btn-outline-primary rounded-pill px-2 py-1" style={{ fontSize: '0.75rem' }}>
              Landlord
            </button>
            <button onClick={() => handleAutofill('tenant')} className="btn btn-xs btn-outline-info rounded-pill px-2 py-1" style={{ fontSize: '0.75rem' }}>
              Tenant
            </button>
          </div>
        </div>

        <p className="text-center text-secondary small m-0">
          New to HouseHunt? <Link to="/register" className="text-primary fw-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
