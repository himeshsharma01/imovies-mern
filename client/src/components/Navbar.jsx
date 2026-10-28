import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbg sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-warning" to="/">
          <span className="brand-icon">🎬</span>
          <span className="brand-text">IMOVIES</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/">
                <i className="bi bi-film me-1"></i> Movies
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/theatres">
                <i className="bi bi-geo-alt me-1"></i> Cinemas
              </NavLink>
            </li>
            {user && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/bookings">
                  <i className="bi bi-ticket-perforated me-1"></i> My Bookings
                </NavLink>
              </li>
            )}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/admin">
                  <i className="bi bi-shield-lock me-1"></i> Admin Panel
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <Link to="/profile" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 text-light text-decoration-none">
                  <div className="user-avatar-badge">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="user-name-text">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="badge bg-warning text-dark px-1 py-0 small">Admin</span>
                  )}
                </Link>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout} title="Sign Out">
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-outline-light btn-sm px-3" to="/login">
                  Sign In
                </Link>
                <Link className="btn btn-warning btn-sm px-3 fw-medium" to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
