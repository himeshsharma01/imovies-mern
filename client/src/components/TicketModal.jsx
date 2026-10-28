import React from 'react';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function TicketModal({ booking, onClose }) {
  if (!booking) return null;

  const showDate = booking.show?.startsAt ? new Date(booking.show.startsAt) : null;
  const formattedDate = showDate ? showDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
  const formattedTime = showDate ? showDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div className="ticket-modal-card">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-25 no-print">
          <h5 className="modal-title m-0 text-warning d-flex align-items-center gap-2">
            <i className="bi bi-ticket-detailed"></i> Digital Cinema Pass
          </h5>
          <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
        </div>

        {/* Printable Ticket Area */}
        <div className="ticket-wrapper p-4" id="printable-ticket">
          <div className="ticket-header d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="badge bg-warning text-dark fw-bold text-uppercase px-2 py-1">IMOVIES ADMIT ONE</span>
              <h4 className="fw-bold text-white mt-1 mb-0">{booking.movie?.title}</h4>
              <span className="text-secondary small">{booking.movie?.language} · {booking.movie?.genres?.join(', ')}</span>
            </div>
            {booking.movie?.posterUrl && (
              <img
                src={booking.movie.posterUrl}
                alt={booking.movie.title}
                className="ticket-poster rounded"
              />
            )}
          </div>

          <div className="ticket-divider my-3">
            <div className="punch-hole punch-left"></div>
            <div className="dashed-line"></div>
            <div className="punch-hole punch-right"></div>
          </div>

          <div className="row g-3 py-2">
            <div className="col-6">
              <span className="text-secondary small text-uppercase">Cinema Hall</span>
              <div className="fw-semibold text-light">{booking.theatre?.name}</div>
              <div className="text-secondary small">{booking.theatre?.city}</div>
            </div>
            <div className="col-6 text-end">
              <span className="text-secondary small text-uppercase">Date & Showtime</span>
              <div className="fw-semibold text-warning">{formattedDate}</div>
              <div className="fw-bold text-light">{formattedTime}</div>
            </div>

            <div className="col-12 mt-3">
              <div className="p-3 rounded bg-dark border border-secondary border-opacity-50 d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-secondary small text-uppercase d-block">Reserved Seats</span>
                  <div className="d-flex gap-2 flex-wrap mt-1">
                    {booking.seats?.map(seat => (
                      <span key={seat} className="seat-badge-print px-2 py-1 rounded bg-warning text-dark fw-bold">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-end">
                  <span className="text-secondary small text-uppercase d-block">Total Paid</span>
                  <span className="fs-5 fw-bold text-success">{money(booking.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="col-12 text-secondary small">
              <div className="d-flex justify-content-between">
                <span>Booking ID: <code className="text-warning">{booking._id}</code></span>
                <span className="badge bg-success bg-opacity-25 text-success border border-success">
                  {booking.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode & QR Code simulation */}
          <div className="barcode-container mt-4 text-center pt-3 border-top border-secondary border-opacity-25">
            <div className="barcode-lines mb-2"></div>
            <div className="text-secondary small font-monospace tracking-widest">{booking._id?.toUpperCase()}</div>
            <div className="text-white-50 small mt-1">Present this pass at the entrance counter or automated scanner.</div>
          </div>
        </div>

        <div className="p-3 border-top border-secondary border-opacity-25 d-flex justify-content-end gap-2 no-print">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-warning btn-sm d-flex align-items-center gap-1" onClick={handlePrint}>
            <i className="bi bi-printer"></i> Print / Save Pass
          </button>
        </div>
      </div>
    </div>
  );
}
