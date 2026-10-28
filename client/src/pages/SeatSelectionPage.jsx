import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';
import PaymentModal from '../components/PaymentModal';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function SeatSelectionPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadShow = () => {
    return api.get(`/shows/${id}`)
      .then(res => {
        setShow(res.data);
        setMessage('');
      })
      .catch(err => {
        setMessage(err.response?.data?.message || 'Could not load show details.');
      });
  };

  useEffect(() => {
    setLoading(true);
    loadShow().finally(() => setLoading(false));

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('seats:updated', data => {
      if (data.showId === id) {
        // Automatically sync seats in real time
        loadShow();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const toggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 10) {
        setMessage('You can select a maximum of 10 seats per booking.');
        return;
      }
      setSelectedSeats(prev => [...prev, seatNumber]);
      setMessage('');
    }
  };

  const handleProceedToPayment = () => {
    if (!user) {
      navigate('/login', { state: { returnUrl: `/shows/${id}` } });
      return;
    }
    if (selectedSeats.length === 0) {
      setMessage('Please select at least one available seat to proceed.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmBooking = async ({ method }) => {
    setBusy(true);
    setMessage('');
    try {
      const res = await api.post('/bookings', {
        showId: id,
        seats: selectedSeats,
        paymentMethod: method
      });
      setShowPaymentModal(false);
      navigate(`/confirmation/${res.data._id}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Booking transaction failed. Please try again.';
      setMessage(errMsg);
      loadShow();
      setShowPaymentModal(false);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="text-secondary mt-2">Loading seating layout...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="text-center py-5">
        <Notice text={message || 'Show not found or unavailable.'} type="error" />
        <Link to="/" className="btn btn-warning mt-3">Back to Movies</Link>
      </div>
    );
  }

  // Group seats by Row (Letter prefix)
  const rowsMap = {};
  show.seats?.forEach(seat => {
    const rowChar = seat.seatNumber.match(/[A-Z]/)?.[0] || 'A';
    if (!rowsMap[rowChar]) rowsMap[rowChar] = [];
    rowsMap[rowChar].push(seat);
  });

  // Sort seats numerically in each row
  Object.keys(rowsMap).forEach(rowChar => {
    rowsMap[rowChar].sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(/[^\d]/g, ''), 10);
      const numB = parseInt(b.seatNumber.replace(/[^\d]/g, ''), 10);
      return numA - numB;
    });
  });

  const rowLetters = Object.keys(rowsMap).sort();

  const showDate = new Date(show.startsAt);
  const formattedShowDate = showDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  const formattedShowTime = showDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="seat-selection-page pb-5">
      {/* Header Info */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <Link to={`/movies/${show.movie?._id}`} className="text-secondary text-decoration-none hover-warning small d-inline-flex align-items-center gap-1 mb-1">
            <i className="bi bi-chevron-left"></i> Change Showtime
          </Link>
          <h2 className="fw-bolder text-white mb-1">{show.movie?.title}</h2>
          <div className="d-flex align-items-center gap-2 text-secondary small flex-wrap">
            <span className="text-warning fw-semibold">{show.theatre?.name}</span>
            <span>•</span>
            <span>{show.theatre?.city}</span>
            <span>•</span>
            <span>{formattedShowDate} at {formattedShowTime}</span>
            <span>•</span>
            <span className="badge bg-secondary bg-opacity-25 text-light">{money(show.price)} / seat</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {socketConnected ? (
            <span className="badge bg-success bg-opacity-25 text-success border border-success d-flex align-items-center gap-1">
              <span className="pulse-dot bg-success"></span> Live Sync Connected
            </span>
          ) : (
            <span className="badge bg-secondary text-light">Connecting to live seat sync...</span>
          )}
        </div>
      </div>

      <Notice text={message} type="warning" onDismiss={() => setMessage('')} />

      {/* Screen Graphic */}
      <div className="cinema-screen-container text-center my-4">
        <div className="screen-curve-glow mb-2"></div>
        <div className="screen-text text-uppercase small text-secondary fw-bold letter-spacing-2">
          SCREEN THIS WAY
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="seat-legend-bar d-flex justify-content-center gap-4 text-secondary small my-4 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <span className="legend-box available"></span>
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="legend-box selected"></span>
          <span>Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="legend-box booked"></span>
          <span>Booked / Taken</span>
        </div>
      </div>

      {/* Interactive Seat Grid */}
      <div className="seat-hall-wrapper p-3 p-md-4 rounded-4 bg-dark border border-secondary border-opacity-25 mx-auto mb-5" style={{ maxWidth: '780px' }}>
        <div className="d-flex flex-column gap-2">
          {rowLetters.map(rowChar => (
            <div key={rowChar} className="d-flex align-items-center justify-content-center gap-2">
              <span className="row-label text-secondary fw-bold small text-center" style={{ width: '24px' }}>
                {rowChar}
              </span>
              <div className="d-flex gap-1 gap-md-2 flex-wrap justify-content-center">
                {rowsMap[rowChar].map(seat => {
                  const isBooked = seat.status === 'booked';
                  const isSelected = selectedSeats.includes(seat.seatNumber);

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      disabled={isBooked}
                      className={`seat-btn ${isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available'}`}
                      onClick={() => toggleSeat(seat.seatNumber)}
                      title={`${seat.seatNumber} - ${money(show.price)} ${isBooked ? '(Booked)' : ''}`}
                    >
                      {seat.seatNumber.replace(/[A-Z]/g, '')}
                    </button>
                  );
                })}
              </div>
              <span className="row-label text-secondary fw-bold small text-center" style={{ width: '24px' }}>
                {rowChar}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="booking-summary-sticky p-3 p-md-4 rounded-4 bg-dark border border-warning border-opacity-50 shadow-lg d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning text-dark fw-bold">
              {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected
            </span>
            <span className="text-secondary small">Max 10 seats</span>
          </div>
          <div className="d-flex gap-1 flex-wrap">
            {selectedSeats.length > 0 ? (
              selectedSeats.map(s => (
                <span key={s} className="badge bg-secondary text-light px-2 py-1">
                  {s} <i className="bi bi-x ms-1 cursor-pointer" onClick={() => toggleSeat(s)}></i>
                </span>
              ))
            ) : (
              <span className="text-secondary small">Select your preferred seats on the hall map above.</span>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-3">
          <div className="text-md-end">
            <span className="text-secondary small d-block">Estimated Total</span>
            <span className="fs-4 fw-bolder text-warning">
              {money(selectedSeats.length * show.price)}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-warning btn-lg px-4 fw-bold d-flex align-items-center gap-2"
            disabled={selectedSeats.length === 0 || busy}
            onClick={handleProceedToPayment}
          >
            <span>Proceed to Checkout</span>
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showPaymentModal && (
        <PaymentModal
          show={show}
          seats={selectedSeats}
          onConfirm={handleConfirmBooking}
          onCancel={() => setShowPaymentModal(false)}
          busy={busy}
        />
      )}
    </div>
  );
}
