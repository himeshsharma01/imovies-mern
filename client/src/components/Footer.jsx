import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-section mt-5">
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold text-warning d-flex align-items-center gap-2 mb-3">
              <span>🎬</span> IMOVIES CINEMAS
            </h5>
            <p className="text-secondary small leading-relaxed">
              Experience movie magic in high-definition digital cinema, Dolby Atmos sound, and ultra-comfortable recliner seating. Reserve your front-row seat to the best stories today.
            </p>
            <div className="d-flex gap-3 text-secondary">
              <span className="badge bg-dark border border-secondary text-light">Real-Time Sync</span>
              <span className="badge bg-dark border border-secondary text-light">Instant E-Ticket</span>
              <span className="badge bg-dark border border-secondary text-light">Easy Cancellation</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-light fw-semibold mb-3">Quick Links</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-decoration-none text-secondary hover-warning">All Movies</Link></li>
              <li><Link to="/theatres" className="text-decoration-none text-secondary hover-warning">Cinema Locations</Link></li>
              <li><Link to="/bookings" className="text-decoration-none text-secondary hover-warning">My Bookings</Link></li>
              <li><Link to="/admin" className="text-decoration-none text-secondary hover-warning">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-3 col-6">
            <h6 className="text-light fw-semibold mb-3">Cinema Tech</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-0">
              <li><i className="bi bi-badge-4k me-1"></i> 4K Laser Projection</li>
              <li><i className="bi bi-soundwave me-1"></i> Dolby Atmos 64-Channel</li>
              <li><i className="bi bi-badge-vr me-1"></i> IMAX Experience</li>
              <li><i className="bi bi-shield-check me-1"></i> Safe & Clean Halls</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-12">
            <h6 className="text-light fw-semibold mb-3">Customer Support</h6>
            <p className="text-secondary small mb-2">Have a question regarding your booking?</p>
            <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 text-white-50 small">
              <div className="d-flex align-items-center gap-2 mb-1 text-light">
                <i className="bi bi-envelope-fill text-warning"></i> support@imovies.local
              </div>
              <div>Available Daily 09:00 AM – 11:00 PM</div>
            </div>
          </div>
        </div>

        <div className="border-top border-secondary border-opacity-25 mt-4 pt-4 text-center text-secondary small d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div>© {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.</div>
          <div className="d-flex gap-3">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
