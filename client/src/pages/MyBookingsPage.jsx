import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Notice from '../components/Notice';
import TicketModal from '../components/TicketModal';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [activeTab, setActiveTab] = useState('all'); // all | upcoming | past
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadBookings = () => {
    return api.get('/bookings/mine')
      .then(res => {
        setBookings(res.data || []);
      })
      .catch(err => {
        setMessage(err.response?.data?.message || 'Could not load your bookings.');
        setMessageType('error');
      });
  };

  useEffect(() => {
    setLoading(true);
    loadBookings().finally(() => setLoading(false));
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setBusy(true);
    try {
      await api.patch(`/bookings/${cancellingBooking._id}/cancel`);
      setMessage(`Booking ${cancellingBooking._id} successfully cancelled. Demo refund processed.`);
      setMessageType('success');
      setCancellingBooking(null);
      loadBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel booking.');
      setMessageType('error');
    } finally {
      setBusy(false);
    }
  };

  const now = new Date();

  const filteredBookings = bookings.filter(b => {
    const showTime = b.show?.startsAt ? new Date(b.show.startsAt) : null;
    const isUpcoming = b.status === 'confirmed' && showTime && showTime > now;

    if (activeTab === 'upcoming') return isUpcoming;
    if (activeTab === 'past') return !isUpcoming || b.status === 'cancelled';
    return true;
  });

  return (
    <div className="my-bookings-page py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bolder text-white mb-1">My Bookings</h2>
          <p className="text-secondary small mb-0">View all your cinema reservations, digital passes, and order history.</p>
        </div>

        {/* Filter Tabs */}
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('all')}
          >
            All ({bookings.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'upcoming' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'past' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('past')}
          >
            Past & Cancelled
          </button>
        </div>
      </div>

      <Notice text={message} type={messageType} onDismiss={() => setMessage('')} />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="text-secondary mt-2">Loading reservations...</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {filteredBookings.map(b => {
            const showTime = b.show?.startsAt ? new Date(b.show.startsAt) : null;
            const isFuture = showTime && showTime > now;
            const canCancel = b.status === 'confirmed' && isFuture;

            const formattedDate = showTime ? showTime.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : 'Showtime unavailable';

            const formattedTime = showTime ? showTime.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : '';

            return (
              <div key={b._id} className="booking-card-rich p-3 p-md-4 rounded-4 bg-dark border border-secondary border-opacity-25">
                <div className="row g-3 align-items-center">
                  {/* Poster Thumbnail */}
                  <div className="col-auto">
                    <img
                      src={b.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700'}
                      alt={b.movie?.title}
                      className="rounded object-fit-cover booking-thumb"
                      style={{ width: '85px', height: '115px' }}
                    />
                  </div>

                  {/* Info details */}
                  <div className="col">
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge ${b.status === 'confirmed' ? 'bg-success' : 'bg-danger'} text-white`}>
                        {b.status?.toUpperCase()}
                      </span>
                      {isFuture && b.status === 'confirmed' && (
                        <span className="badge bg-warning text-dark fw-bold">
                          <i className="bi bi-clock-history me-1"></i> Upcoming
                        </span>
                      )}
                      <span className="text-secondary small font-monospace">ID: {b._id}</span>
                    </div>

                    <h5 className="fw-bold text-white mb-1">{b.movie?.title || 'Movie'}</h5>
                    <div className="text-secondary small mb-2">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                      {b.theatre?.name}, {b.theatre?.city}
                    </div>

                    <div className="d-flex align-items-center gap-3 text-secondary small flex-wrap">
                      <div className="text-light">
                        <i className="bi bi-calendar3 me-1 text-warning"></i>
                        <strong>{formattedDate} {formattedTime}</strong>
                      </div>
                      <div>•</div>
                      <div>
                        Seats: <strong className="text-warning">{b.seats?.join(', ')}</strong> ({b.seats?.length} seats)
                      </div>
                      <div>•</div>
                      <div>
                        Total: <strong className="text-success">{money(b.totalAmount)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-12 col-md-auto d-flex flex-md-column gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-warning btn-sm fw-medium d-flex align-items-center justify-content-center gap-1"
                      onClick={() => setSelectedTicket(b)}
                    >
                      <i className="bi bi-ticket-perforated"></i> View E-Pass
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setCancellingBooking(b)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5 p-4 rounded-4 bg-dark border border-secondary border-opacity-25">
          <i className="bi bi-ticket-perforated fs-1 text-secondary mb-3 d-block"></i>
          <h4>No bookings found</h4>
          <p className="text-secondary small">
            {activeTab === 'upcoming'
              ? 'You have no upcoming cinema shows scheduled.'
              : 'You have not made any bookings yet.'}
          </p>
          <Link to="/" className="btn btn-warning btn-sm mt-2">
            Explore Movies Now
          </Link>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          booking={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card bg-dark border border-danger border-opacity-50 rounded-4 p-4 text-center shadow-lg" style={{ maxWidth: '420px' }}>
            <div className="mb-3 text-danger fs-1">
              <i className="bi bi-exclamation-octagon-fill"></i>
            </div>
            <h5 className="fw-bold text-white mb-2">Cancel this reservation?</h5>
            <p className="text-secondary small mb-3">
              Are you sure you want to cancel your tickets for <strong>{cancellingBooking.movie?.title}</strong>?
              Your reserved seats ({cancellingBooking.seats?.join(', ')}) will be released immediately and a full refund of {money(cancellingBooking.totalAmount)} will be credited back.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setCancellingBooking(null)}
                disabled={busy}
              >
                Keep Tickets
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleCancelBooking}
                disabled={busy}
              >
                {busy ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
