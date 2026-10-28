import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import TicketModal from '../components/TicketModal';
import Notice from '../components/Notice';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function ConfirmationPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/bookings/${id}`)
      .then(res => {
        setBooking(res.data);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Could not fetch booking confirmation.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="text-secondary mt-2">Loading confirmation...</p>
      </div>
    );
  }

  return (
    <div className="confirmation-page py-4">
      <Notice text={error} type="error" />

      <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 mx-auto overflow-hidden shadow-lg" style={{ maxWidth: '640px' }}>
        <div className="card-header bg-success bg-opacity-25 border-bottom border-success border-opacity-25 p-4 text-center">
          <div className="success-icon-badge mx-auto mb-3">
            <i className="bi bi-check-lg fs-1 text-success"></i>
          </div>
          <span className="badge bg-success text-white text-uppercase px-3 py-1 mb-2">Booking Confirmed</span>
          <h2 className="fw-bolder text-white mb-1">You're going to the movies!</h2>
          <p className="text-white-50 small mb-0">Your tickets have been reserved and sent to your account.</p>
        </div>

        {booking && (
          <div className="p-4 p-md-5">
            <div className="d-flex gap-3 align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
              {booking.movie?.posterUrl && (
                <img
                  src={booking.movie.posterUrl}
                  alt={booking.movie.title}
                  className="rounded object-fit-cover"
                  style={{ width: '80px', height: '110px' }}
                />
              )}
              <div>
                <h4 className="fw-bold text-white mb-1">{booking.movie?.title}</h4>
                <div className="text-secondary small">{booking.movie?.language} · {booking.movie?.durationMinutes} min</div>
                <div className="text-warning small mt-1">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {booking.theatre?.name}, {booking.theatre?.city}
                </div>
              </div>
            </div>

            <div className="row g-3 text-secondary small mb-4">
              <div className="col-6">
                <span className="text-uppercase text-secondary d-block">Date & Showtime</span>
                <strong className="text-light fs-6">
                  {booking.show?.startsAt ? new Date(booking.show.startsAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'N/A'}
                  {' at '}
                  {booking.show?.startsAt ? new Date(booking.show.startsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                </strong>
              </div>

              <div className="col-6 text-end">
                <span className="text-uppercase text-secondary d-block">Seats Reserved</span>
                <div className="d-flex gap-1 justify-content-end flex-wrap mt-1">
                  {booking.seats?.map(s => (
                    <span key={s} className="badge bg-warning text-dark fw-bold">{s}</span>
                  ))}
                </div>
              </div>

              <div className="col-6">
                <span className="text-uppercase text-secondary d-block">Booking Reference</span>
                <code className="text-warning fs-6">{booking._id}</code>
              </div>

              <div className="col-6 text-end">
                <span className="text-uppercase text-secondary d-block">Amount Paid</span>
                <strong className="text-success fs-5">{money(booking.totalAmount)}</strong>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-warning btn-lg fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowTicketModal(true)}
              >
                <i className="bi bi-ticket-perforated-fill"></i> View & Print Digital Pass
              </button>

              <div className="row g-2 mt-1">
                <div className="col-6">
                  <Link to="/bookings" className="btn btn-outline-secondary w-100 text-light">
                    My Bookings
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/" className="btn btn-outline-warning w-100">
                    Book Another Movie
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTicketModal && booking && (
        <TicketModal
          booking={booking}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </div>
  );
}
