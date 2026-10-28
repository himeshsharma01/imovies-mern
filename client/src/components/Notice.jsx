import React from 'react';

export default function Notice({ text, type = 'info', onDismiss }) {
  if (!text) return null;

  const alertClass = type === 'error' ? 'alert-danger' :
                     type === 'success' ? 'alert-success' :
                     type === 'warning' ? 'alert-warning' : 'alert-info';

  const iconClass = type === 'error' ? 'bi-exclamation-triangle-fill' :
                    type === 'success' ? 'bi-check-circle-fill' :
                    type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';

  return (
    <div className={`alert ${alertClass} d-flex align-items-center justify-content-between py-2 px-3 mb-3 fade show`} role="alert">
      <div className="d-flex align-items-center gap-2">
        <i className={`bi ${iconClass}`}></i>
        <div>{text}</div>
      </div>
      {onDismiss && (
        <button type="button" className="btn-close btn-close-white ms-2" onClick={onDismiss} aria-label="Close"></button>
      )}
    </div>
  );
}
