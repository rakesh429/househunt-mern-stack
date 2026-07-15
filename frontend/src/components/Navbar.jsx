import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, LogOut, User, Menu, MessageSquare, Search } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter((n) => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await axios.put('/notifications/read');
      setUnreadCount(0);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top px-3 shadow-lg">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.6rem' }}>🏠</span>
          <span className="fw-bold tracking-wide text-white">HouseHunt</span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <Menu className="text-white" size={24} />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2 align-items-center">
            <li className="nav-item">
              <Link className="nav-link text-light d-flex align-items-center gap-1" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light d-flex align-items-center gap-1" to="/search">
                <Search size={16} /> Search
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-outline-light border-0 d-flex align-items-center p-2 rounded-circle"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-warning" />}
            </button>

            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light border-0 position-relative d-flex align-items-center p-2 rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={handleMarkAsRead}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg py-2 mt-2 border-0 rounded-4" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                    <li className="px-3 py-2 border-bottom">
                      <h6 className="m-0 fw-bold">Notifications</h6>
                    </li>
                    {notifications.length === 0 ? (
                      <li className="px-3 py-4 text-center text-muted">No notifications</li>
                    ) : (
                      notifications.map((notif) => (
                        <li key={notif._id} className={`px-3 py-2 border-bottom ${!notif.read ? 'bg-light text-dark' : 'text-secondary'}`}>
                          <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{notif.title}</div>
                          <div style={{ fontSize: '0.75rem' }}>{notif.message}</div>
                          <div className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Messages Nav icon */}
                <Link to="/chat" className="btn btn-outline-light border-0 p-2 rounded-circle position-relative" title="Direct Chats">
                  <MessageSquare size={20} />
                </Link>

                {/* Dashboard Router */}
                {user.role === 'admin' && (
                  <Link className="btn btn-outline-info rounded-pill px-3 btn-sm" to="/admin-dashboard">
                    Admin Panel
                  </Link>
                )}
                {user.role === 'owner' && (
                  <Link className="btn btn-outline-primary rounded-pill px-3 btn-sm text-white" to="/owner-dashboard">
                    Owner Panel
                  </Link>
                )}
                {user.role === 'user' && (
                  <Link className="btn btn-outline-light rounded-pill px-3 btn-sm" to="/user-dashboard">
                    My Account
                  </Link>
                )}

                {/* Logout Button */}
                <button onClick={handleLogout} className="btn btn-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-light btn-sm rounded-pill px-3" to="/login">
                  Sign In
                </Link>
                <Link className="btn btn-primary btn-sm rounded-pill px-3" to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
