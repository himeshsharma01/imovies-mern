import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';

export default function AuthPage({ register = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const returnUrl = location.state?.returnUrl || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(register ? '/auth/register' : '/auth/login', form);
      navigate(returnUrl, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const fillAdminDemo = () => {
    setForm({
      name: 'IMovies Admin',
      email: 'admin@imovies.local',
      password: 'Admin123!'
    });
    setError('');
  };

  const fillUserDemo = () => {
    setForm({
      name: 'Alex Johnson',
      email: 'user@imovies.local',
      password: 'User123!'
    });
    setError('');
  };

  return (
    <div className="auth-page py-4">
      <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 mx-auto p-4 p-md-5 shadow-lg" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <span className="brand-icon fs-1 d-block mb-1">🎬</span>
          <h2 className="fw-bolder text-white mb-1">
            {register ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-secondary small mb-0">
            {register
              ? 'Join IMovies to book cinema tickets and manage reservations.'
              : 'Sign in to access your digital tickets and seat bookings.'}
          </p>
        </div>

        <Notice text={error} type="error" onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit}>
          {register && (
            <div className="mb-3">
              <label className="form-label text-secondary small">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-secondary text-secondary">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your full name"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label text-secondary small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-secondary">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-secondary">
                <i className="bi bi-key"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="At least 8 characters"
                minLength="8"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold py-2 mb-3"
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              register ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box */}
        <div className="demo-credentials-box p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25 my-3">
          <div className="text-secondary small fw-bold text-uppercase mb-2 text-center">
            <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Logins
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-warning btn-sm flex-fill"
              onClick={fillAdminDemo}
            >
              Fill Admin
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm flex-fill text-light"
              onClick={fillUserDemo}
            >
              Fill Demo User
            </button>
          </div>
        </div>

        <div className="text-center text-secondary small mt-3">
          {register ? (
            <>Already have an account? <Link to="/login" className="text-warning text-decoration-none fw-semibold">Sign In</Link></>
          ) : (
            <>New to IMovies? <Link to="/register" className="text-warning text-decoration-none fw-semibold">Create an account</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
