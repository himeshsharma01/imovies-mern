import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Notice from '../components/Notice';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState('rating');
  const [error, setError] = useState('');

  const genresList = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Horror', 'Romance', 'Adventure'];

  useEffect(() => {
    setLoading(true);
    const params = { sort };
    if (q.trim()) params.q = q.trim();
    if (genre && genre !== 'All') params.genre = genre;
    if (language) params.language = language;

    api.get('/movies', { params })
      .then(res => {
        setMovies(res.data.items || []);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load movies. Please check connection.');
      })
      .finally(() => setLoading(false));
  }, [q, genre, language, sort]);

  const featuredMovie = movies.length > 0 ? movies[0] : null;

  return (
    <div className="home-page">
      {/* Hero Showcase Banner */}
      {featuredMovie && !q && !genre && !language && (
        <section
          className="hero-banner mb-5 p-4 p-md-5 rounded-4 position-relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(16, 16, 24, 0.95) 25%, rgba(16, 16, 24, 0.7) 60%, rgba(16, 16, 24, 0.3) 100%), url(${featuredMovie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top'
          }}
        >
          <div className="row align-items-center">
            <div className="col-lg-7 col-md-9 position-relative z-1">
              <span className="badge bg-warning text-dark fw-bold text-uppercase px-3 py-1 mb-3">
                <i className="bi bi-star-fill me-1"></i> Featured Premiere
              </span>
              <h1 className="display-4 fw-bolder text-white mb-2 leading-tight">
                {featuredMovie.title}
              </h1>
              <div className="d-flex align-items-center gap-3 text-secondary mb-3 flex-wrap small">
                <span className="text-warning fw-bold fs-6">
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  {featuredMovie.rating ? `${featuredMovie.rating} / 10` : 'New'}
                </span>
                <span>•</span>
                <span>{featuredMovie.durationMinutes} mins</span>
                <span>•</span>
                <span>{featuredMovie.language}</span>
                <span>•</span>
                <span>{featuredMovie.genres?.join(', ')}</span>
              </div>
              <p className="lead text-white-50 mb-4 line-clamp-3">
                {featuredMovie.description}
              </p>
              <div className="d-flex gap-3">
                <Link to={`/movies/${featuredMovie._id}`} className="btn btn-warning btn-lg px-4 fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-ticket-perforated-fill"></i> Book Tickets
                </Link>
                <Link to={`/movies/${featuredMovie._id}`} className="btn btn-outline-light btn-lg px-4">
                  Movie Details
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Discovery Filters Bar */}
      <div className="filters-container p-3 p-md-4 rounded-4 bg-dark border border-secondary border-opacity-25 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-lg-4 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search movies, genres, keywords..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
              {q && (
                <button className="btn btn-outline-secondary" onClick={() => setQ('')} type="button">
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Language Selector */}
          <div className="col-lg-3 col-md-3 col-6">
            <select
              className="form-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="col-lg-3 col-md-3 col-6">
            <select
              className="form-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="rating">Top Rated</option>
              <option value="title">Title (A-Z)</option>
              <option value="duration">Runtime</option>
              <option value="oldest">Release Order</option>
            </select>
          </div>

          <div className="col-lg-2 col-md-12 text-lg-end text-secondary small">
            <span>Showing <strong>{movies.length}</strong> movies</span>
          </div>
        </div>

        {/* Genre Quick Filters */}
        <div className="d-flex gap-2 flex-wrap mt-3 pt-3 border-top border-secondary border-opacity-25">
          {genresList.map(g => {
            const isSelected = (genre === '' && g === 'All') || genre === g;
            return (
              <button
                key={g}
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${isSelected ? 'btn-warning fw-semibold' : 'btn-outline-secondary text-light'}`}
                onClick={() => setGenre(g === 'All' ? '' : g)}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <Notice text={error} type="error" />

      {/* Movies Grid Section */}
      <div className="section-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-white mb-0">
            {q ? `Search results for "${q}"` : genre ? `${genre} Movies` : 'Now Showing in Cinemas'}
          </h3>
          <p className="text-secondary small mb-0">Select a movie to explore showtimes and book seats.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary mt-2">Loading movies catalog...</p>
        </div>
      ) : movies.length > 0 ? (
        <div className="row g-4">
          {movies.map(movie => (
            <div className="col-6 col-md-4 col-lg-3" key={movie._id}>
              <div className="movie-card-enhanced h-100 d-flex flex-column">
                <Link to={`/movies/${movie._id}`} className="poster-link position-relative overflow-hidden d-block">
                  <img
                    src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700'}
                    alt={movie.title}
                    className="card-img-top movie-card-poster"
                    loading="lazy"
                  />
                  <div className="card-badge-rating position-absolute top-0 end-0 m-2 px-2 py-1 rounded bg-dark bg-opacity-75 text-warning fw-bold small">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {movie.rating ? movie.rating.toFixed(1) : '—'}
                  </div>
                  <div className="card-overlay-hover d-flex align-items-center justify-content-center">
                    <span className="btn btn-warning btn-sm fw-bold px-3 py-2 rounded-pill">
                      Book Now <i className="bi bi-arrow-right"></i>
                    </span>
                  </div>
                </Link>

                <div className="p-3 d-flex flex-column flex-grow-1">
                  <h5 className="card-title text-truncate fw-bold mb-1" title={movie.title}>
                    <Link to={`/movies/${movie._id}`} className="text-light text-decoration-none hover-warning">
                      {movie.title}
                    </Link>
                  </h5>
                  <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
                    <span className="badge bg-secondary bg-opacity-25 text-light">{movie.language}</span>
                    <span>•</span>
                    <span>{movie.durationMinutes} min</span>
                  </div>
                  <p className="text-secondary small mb-3 flex-grow-1 line-clamp-2">
                    {movie.genres?.join(', ')}
                  </p>
                  <Link to={`/movies/${movie._id}`} className="btn btn-outline-warning btn-sm w-100 fw-medium">
                    Showtimes & Seats
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 p-4 rounded-4 bg-dark border border-secondary border-opacity-25">
          <i className="bi bi-camera-reels fs-1 text-secondary mb-3 d-block"></i>
          <h4>No movies found</h4>
          <p className="text-secondary small">We couldn't find any movie matching your search criteria.</p>
          <button className="btn btn-warning btn-sm mt-2" onClick={() => { setQ(''); setGenre(''); setLanguage(''); }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Experience Features Banner */}
      <section className="experience-features mt-5 pt-4">
        <div className="row g-4 text-center">
          <div className="col-md-3 col-6">
            <div className="p-4 rounded-4 bg-dark border border-secondary border-opacity-25 h-100">
              <i className="bi bi-badge-4k fs-2 text-warning mb-2 d-block"></i>
              <h6 className="fw-bold text-light">4K Laser Visuals</h6>
              <p className="text-secondary small mb-0">Crystal-clear projection with lifelike cinematic depth.</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-4 rounded-4 bg-dark border border-secondary border-opacity-25 h-100">
              <i className="bi bi-soundwave fs-2 text-warning mb-2 d-block"></i>
              <h6 className="fw-bold text-light">Dolby Atmos</h6>
              <p className="text-secondary small mb-0">Immersive three-dimensional acoustic soundscapes.</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-4 rounded-4 bg-dark border border-secondary border-opacity-25 h-100">
              <i className="bi bi-broadcast-pin fs-2 text-warning mb-2 d-block"></i>
              <h6 className="fw-bold text-light">Real-Time Seats</h6>
              <p className="text-secondary small mb-0">Live Socket.IO updates ensure zero double bookings.</p>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-4 rounded-4 bg-dark border border-secondary border-opacity-25 h-100">
              <i className="bi bi-arrow-repeat fs-2 text-warning mb-2 d-block"></i>
              <h6 className="fw-bold text-light">Instant Refund</h6>
              <p className="text-secondary small mb-0">One-click cancellation before showtime with demo refunds.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
