import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import Notice from '../components/Notice';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(0); // 0 = Today, 1 = Tomorrow, 2 = Next Day
  const [selectedCity, setSelectedCity] = useState('');

  // Generate 3 consecutive dates for filters
  const dateOptions = [0, 1, 2].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      offset,
      label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateString: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      fullDate: d
    };
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/movies/${id}`),
      api.get('/shows', { params: { movie: id } })
    ])
      .then(([movieRes, showsRes]) => {
        setMovie(movieRes.data);
        setShows(showsRes.data || []);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Could not load movie details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="text-secondary mt-2">Loading showtimes and details...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-5">
        <Notice text={error || 'Movie not found.'} type="error" />
        <Link to="/" className="btn btn-warning mt-3">Back to Movies</Link>
      </div>
    );
  }

  // Extract unique cities from shows
  const availableCities = Array.from(new Set(shows.map(s => s.theatre?.city).filter(Boolean)));

  // Filter shows based on selected date and city
  const filteredShows = shows.filter(show => {
    const showDate = new Date(show.startsAt);
    const targetDate = dateOptions[selectedDate].fullDate;

    const matchesDate =
      showDate.getFullYear() === targetDate.getFullYear() &&
      showDate.getMonth() === targetDate.getMonth() &&
      showDate.getDate() === targetDate.getDate();

    const matchesCity = !selectedCity || show.theatre?.city?.toLowerCase() === selectedCity.toLowerCase();

    // Only show future shows if today
    const isFuture = selectedDate > 0 || showDate > new Date();

    return matchesDate && matchesCity && isFuture;
  });

  // Group shows by Theatre
  const groupedByTheatre = filteredShows.reduce((acc, show) => {
    const theatreId = show.theatre?._id || 'unknown';
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatre,
        shows: []
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  return (
    <div className="movie-details-page">
      {/* Back button */}
      <div className="mb-4">
        <Link to="/" className="text-secondary text-decoration-none hover-warning d-inline-flex align-items-center gap-1 small">
          <i className="bi bi-chevron-left"></i> Back to all movies
        </Link>
      </div>

      {/* Movie Details Header Card */}
      <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 overflow-hidden mb-5">
        <div className="row g-0">
          <div className="col-md-4 col-lg-3">
            <img
              src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700'}
              alt={movie.title}
              className="w-100 h-100 object-fit-cover rounded-start-4"
              style={{ minHeight: '380px' }}
            />
          </div>
          <div className="col-md-8 col-lg-9 p-4 p-md-5 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge bg-warning text-dark fw-bold">NOW SHOWING</span>
                <span className="badge bg-secondary bg-opacity-50 text-light">{movie.language}</span>
                <span className="badge bg-dark border border-secondary text-light">
                  <i className="bi bi-clock me-1"></i> {movie.durationMinutes} min
                </span>
                <span className="badge bg-dark border border-secondary text-warning fw-bold">
                  <i className="bi bi-star-fill text-warning me-1"></i> {movie.rating ? `${movie.rating} / 10` : '—'}
                </span>
              </div>

              <h1 className="fw-bolder text-white display-5 mb-2">{movie.title}</h1>

              <div className="d-flex gap-2 mb-3 flex-wrap">
                {movie.genres?.map(genre => (
                  <span key={genre} className="badge bg-dark border border-secondary border-opacity-50 text-light px-2 py-1">
                    {genre}
                  </span>
                ))}
              </div>

              <h6 className="text-secondary text-uppercase fw-semibold small mb-2">Synopsis</h6>
              <p className="text-light text-opacity-75 leading-relaxed mb-4">
                {movie.description}
              </p>
            </div>

            <div className="border-top border-secondary border-opacity-25 pt-3 d-flex gap-3 text-secondary small">
              <div>
                <strong className="text-light d-block">Language</strong>
                <span>{movie.language}</span>
              </div>
              <div className="border-start border-secondary border-opacity-25 ps-3">
                <strong className="text-light d-block">Cinema Sound</strong>
                <span>Dolby Atmos 7.1</span>
              </div>
              <div className="border-start border-secondary border-opacity-25 ps-3">
                <strong className="text-light d-block">Screen Experience</strong>
                <span>4K Laser Screen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Notice text={error} type="error" />

      {/* Showtime Booking Section */}
      <section className="showtimes-section">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-white mb-1">Select Showtime</h3>
            <p className="text-secondary small mb-0">Choose your preferred day, cinema location, and showtime.</p>
          </div>

          {/* City Filter Pills */}
          {availableCities.length > 0 && (
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className={`btn btn-sm ${selectedCity === '' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
                onClick={() => setSelectedCity('')}
              >
                All Cities
              </button>
              {availableCities.map(city => (
                <button
                  key={city}
                  type="button"
                  className={`btn btn-sm ${selectedCity === city ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
                  onClick={() => setSelectedCity(city)}
                >
                  <i className="bi bi-geo-alt me-1"></i> {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Selector Tabs */}
        <div className="date-tabs-container d-flex gap-3 mb-4 overflow-x-auto pb-2">
          {dateOptions.map(opt => {
            const isSelected = selectedDate === opt.offset;
            return (
              <button
                key={opt.offset}
                type="button"
                className={`date-tab-card btn text-start p-3 rounded-3 ${isSelected ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
                style={{ minWidth: '130px' }}
                onClick={() => setSelectedDate(opt.offset)}
              >
                <div className="small text-uppercase opacity-75">{opt.label}</div>
                <div className="fs-5 fw-bold">{opt.dateString}</div>
              </button>
            );
          })}
        </div>

        {/* Grouped Shows Listing */}
        {Object.keys(groupedByTheatre).length > 0 ? (
          <div className="theatres-shows-list d-flex flex-column gap-3">
            {Object.values(groupedByTheatre).map(({ theatre, shows: tShows }) => (
              <div key={theatre._id} className="p-4 rounded-4 bg-dark border border-secondary border-opacity-25">
                <div className="row align-items-center g-3">
                  <div className="col-lg-4 col-md-5">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary bg-opacity-25 text-warning">
                        <i className="bi bi-building"></i>
                      </span>
                      <h5 className="fw-bold text-light mb-0">{theatre.name}</h5>
                    </div>
                    <p className="text-secondary small mb-0 mt-1">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                      {theatre.address}, {theatre.city}
                    </p>
                  </div>

                  <div className="col-lg-8 col-md-7">
                    <div className="d-flex gap-3 flex-wrap">
                      {tShows.map(show => {
                        const timeString = new Date(show.startsAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        });
                        const availableSeats = show.availableSeats ?? show.seats?.filter(s => s.status === 'available').length;

                        return (
                          <Link
                            key={show._id}
                            to={`/shows/${show._id}`}
                            className="showtime-card btn btn-outline-warning p-2 px-3 text-start rounded-3 d-flex flex-column justify-content-between text-decoration-none"
                            style={{ minWidth: '135px' }}
                          >
                            <span className="fw-bold fs-6 text-warning">{timeString}</span>
                            <div className="d-flex justify-content-between align-items-center gap-2 mt-1">
                              <span className="text-light small fw-medium">{money(show.price)}</span>
                              <span className="badge bg-dark text-success border border-success border-opacity-50 small">
                                {availableSeats} left
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 p-4 rounded-4 bg-dark border border-secondary border-opacity-25">
            <i className="bi bi-calendar-x fs-1 text-secondary mb-3 d-block"></i>
            <h5 className="text-light">No showtimes available</h5>
            <p className="text-secondary small">
              There are no shows scheduled for this date and city combination. Please try selecting a different date or city above.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
