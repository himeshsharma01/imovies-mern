import React, { useState } from 'react';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function PaymentModal({ show, seats, onConfirm, onCancel, busy }) {
  const [method, setMethod] = useState('upi');
  const [card, setCard] = useState({ number: '4532 •••• •••• 8821', name: 'Alex Johnson', expiry: '08/28', cvv: '912' });
  const [upiId, setUpiId] = useState('user@okaxis');
  const [bank, setBank] = useState('HDFC Bank');

  const basePrice = (seats.length * (show?.price || 0));
  const convenienceFee = seats.length * 20; // ₹20 convenience fee per ticket
  const grandTotal = basePrice + convenienceFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ method, grandTotal });
  };

  return (
    <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div className="payment-modal-card">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-25">
          <h5 className="modal-title m-0 text-warning d-flex align-items-center gap-2">
            <i className="bi bi-shield-lock-fill"></i> Secure Checkout
          </h5>
          <button type="button" className="btn-close btn-close-white" onClick={onCancel} disabled={busy} aria-label="Close"></button>
        </div>

        <div className="p-4">
          {/* Order Summary Header */}
          <div className="order-summary-box p-3 rounded mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="fw-bold text-white mb-0">{show.movie?.title}</h6>
                <span className="text-secondary small">{show.theatre?.name} · {show.theatre?.city}</span>
              </div>
              <span className="badge bg-warning text-dark fw-bold">{seats.length} Tickets</span>
            </div>
            <div className="d-flex justify-content-between text-secondary small pt-2 border-top border-secondary border-opacity-25">
              <span>Seats: <strong className="text-light">{seats.join(', ')}</strong></span>
              <span>Time: <strong className="text-light">{new Date(show.startsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong></span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <label className="form-label text-secondary small text-uppercase fw-semibold mb-2">Select Payment Method</label>
          <div className="btn-group w-100 mb-3" role="group">
            <button
              type="button"
              className={`btn btn-sm ${method === 'upi' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
              onClick={() => setMethod('upi')}
            >
              <i className="bi bi-qr-code-scan me-1"></i> UPI / QR
            </button>
            <button
              type="button"
              className={`btn btn-sm ${method === 'card' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
              onClick={() => setMethod('card')}
            >
              <i className="bi bi-credit-card me-1"></i> Cards
            </button>
            <button
              type="button"
              className={`btn btn-sm ${method === 'netbanking' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
              onClick={() => setMethod('netbanking')}
            >
              <i className="bi bi-bank me-1"></i> Net Banking
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {method === 'upi' && (
              <div className="method-box p-3 rounded mb-3 text-center">
                <div className="qr-box p-3 mx-auto mb-2 rounded bg-white" style={{ width: '140px', height: '140px' }}>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=imovies@upi%26pn=IMovies%20Cinemas"
                    alt="UPI QR Code"
                    className="w-100 h-100 object-fit-contain"
                  />
                </div>
                <div className="text-secondary small mb-2">Scan with Google Pay, PhonePe, or Paytm</div>
                <div className="input-group input-group-sm mb-1">
                  <span className="input-group-text bg-dark border-secondary text-secondary">UPI ID</span>
                  <input
                    type="text"
                    className="form-control"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="example@upi"
                    required
                  />
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="method-box p-3 rounded mb-3">
                <div className="mb-2">
                  <label className="form-label text-secondary small mb-1">Card Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={card.number}
                    onChange={e => setCard({ ...card, number: e.target.value })}
                    required
                  />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-8">
                    <label className="form-label text-secondary small mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={card.name}
                      onChange={e => setCard({ ...card, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label text-secondary small mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength="3"
                      className="form-control form-control-sm"
                      value={card.cvv}
                      onChange={e => setCard({ ...card, cvv: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-secondary small mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="form-control form-control-sm"
                    value={card.expiry}
                    onChange={e => setCard({ ...card, expiry: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="method-box p-3 rounded mb-3">
                <label className="form-label text-secondary small mb-1">Choose your Bank</label>
                <select
                  className="form-select form-select-sm mb-2"
                  value={bank}
                  onChange={e => setBank(e.target.value)}
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
                <span className="text-secondary small d-block">You will be securely redirected to your bank's authentication gateway.</span>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="fare-breakdown p-3 rounded bg-dark border border-secondary border-opacity-25 mb-4 small">
              <div className="d-flex justify-content-between text-secondary mb-1">
                <span>Tickets Subtotal ({seats.length} × {money(show.price)}):</span>
                <span className="text-light">{money(basePrice)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary mb-2">
                <span>Convenience Fee & Taxes:</span>
                <span className="text-light">{money(convenienceFee)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-6 text-white pt-2 border-top border-secondary border-opacity-25">
                <span>Total Amount:</span>
                <span className="text-warning">{money(grandTotal)}</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onCancel}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-warning px-4 fw-bold d-flex align-items-center gap-2"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill"></i> Pay {money(grandTotal)}
                  </>
                )}
              </button>
            </div>
            <div className="text-center text-secondary small mt-3">
              <i className="bi bi-shield-check text-success me-1"></i> Demo Sandbox: No real currency will be deducted.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
