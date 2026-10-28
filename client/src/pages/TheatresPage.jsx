import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Notice from '../components/Notice';

export default function TheatresPage() {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = cityFilter ? { city: cityFilter } : {};
    api.get('/theatres', { params })
      .then(res => {
        setTheatres(res.data || []);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Could not load cinema theatres.');
      })
      .finally(() => setLoading(false));
  }, [cityFilter]);

  const cities = ['All', 'Bhopal', 'Mumbai', 'Delhi', 'Bengaluru'];

  return (
    <div className="theatres-page py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bolder text-white mb-1">Cinema Locations</h2>
          <p className="text-secondary small mb-0">Experience cinema at its finest across premier theatres equipped with cutting-edge audiovisual systems.</p>
        </div>

        {/* City Filter */}
        <div className="d-flex gap-2 flex-wrap">
          {cities.map(c => {
            const isSelected = (cityFilter === '' && c === 'All') || cityFilter === c;
            return (
              <button
                key={c}
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${isSelected ? 'btn-warning fw-semibold' : 'btn-outline-secondary text-light'}`}
                onClick={() => setCityFilter(c === 'All' ? '' : c)}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <Notice text={error} type="error" />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="text-secondary mt-2">Loading cinema locations...</p>
        </div>
      ) : theatres.length > 0 ? (
        <div className="row g-4">
          {theatres.map(theatre => (
            <div className="col-md-6" key={theatre._id}>
              <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-warning text-dark fw-bold text-uppercase px-2 py-1">
                      <i className="bi bi-geo-alt-fill me-1"></i> {theatre.city}
                    </span>
                    <span className="badge bg-dark border border-secondary text-secondary small">
                      {theatre.totalSeats} Capacity Seats
                    </span>
                  </div>

                  <h4 className="fw-bold text-white mb-1">{theatre.name}</h4>
                  <p className="text-secondary small mb-3">
                    <i className="bi bi-pin-map-fill text-danger me-1"></i>
                    {theatre.address}
                  </p>

                  <div className="d-flex gap-2 flex-wrap mb-4">
                    <span className="badge bg-secondary bg-opacity-25 text-light small">
                      <i className="bi bi-soundwave text-warning me-1"></i> Dolby Atmos
                    </span>
                    <span className="badge bg-secondary bg-opacity-25 text-light small">
                      <i className="bi bi-badge-4k text-warning me-1"></i> 4K Laser
                    </span>
                    <span className="badge bg-secondary bg-opacity-25 text-light small">
                      <i className="bi bi-cup-straw text-warning me-1"></i> Gourmet Lounge
                    </span>
                    <span className="badge bg-secondary bg-opacity-25 text-light small">
                      <i className="bi bi-car-front text-warning me-1"></i> Valet Parking
                    </span>
                  </div>
                </div>

                <div className="border-top border-secondary border-opacity-25 pt-3 d-flex justify-content-between align-items-center">
                  <span className="text-success small fw-medium">
                    <i className="bi bi-check-circle-fill me-1"></i> Open & Booking Available
                  </span>
                  <Link to="/" className="btn btn-outline-warning btn-sm">
                    View Shows
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 p-4 rounded-4 bg-dark border border-secondary border-opacity-25">
          <i className="bi bi-building-x fs-1 text-secondary mb-3 d-block"></i>
          <h4 className="text-light">No theatres found</h4>
          <p className="text-secondary small">No cinemas match your selected city filter.</p>
        </div>
      )}
    </div>
  );
}
