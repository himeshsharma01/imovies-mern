import React, { useState, useEffect } from 'react';
import api from '../api';
import Notice from '../components/Notice';

const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | movies | theatres | shows | bookings | users
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ text: '', type: 'info' });

  // Forms State
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    posterUrl: '',
    durationMinutes: 120,
    genres: 'Action, Thriller',
    language: 'Hindi',
    rating: 8.0,
    active: true
  });

  const [editingMovie, setEditingMovie] = useState(null);

  const [newTheatre, setNewTheatre] = useState({
    name: '',
    city: 'Bhopal',
    address: '',
    totalSeats: 60
  });

  const [editingTheatre, setEditingTheatre] = useState(null);

  const [newShow, setNewShow] = useState({
    movie: '',
    theatre: '',
    startsAt: '',
    price: 220,
    rows: 6,
    seatsPerRow: 10
  });

  const loadAllData = async () => {
    try {
      const [statsRes, moviesRes, theatresRes, showsRes, bookingsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/movies?all=true&limit=100'),
        api.get('/theatres'),
        api.get('/shows'),
        api.get('/bookings'),
        api.get('/admin/users')
      ]);

      setStats(statsRes.data);
      setMovies(moviesRes.data.items || []);
      setTheatres(theatresRes.data || []);
      setShows(showsRes.data || []);
      setBookings(bookingsRes.data || []);
      setUsers(usersRes.data || []);

      if (moviesRes.data.items?.length > 0 && theatresRes.data?.length > 0) {
        setNewShow(s => ({
          ...s,
          movie: s.movie || moviesRes.data.items[0]._id,
          theatre: s.theatre || theatresRes.data[0]._id
        }));
      }
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Could not load admin management data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Movie actions
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newMovie,
        durationMinutes: Number(newMovie.durationMinutes),
        rating: Number(newMovie.rating),
        genres: typeof newMovie.genres === 'string'
          ? newMovie.genres.split(',').map(g => g.trim()).filter(Boolean)
          : newMovie.genres
      };
      await api.post('/movies', payload);
      setNotice({ text: 'Movie created successfully!', type: 'success' });
      setNewMovie({
        title: '',
        description: '',
        posterUrl: '',
        durationMinutes: 120,
        genres: 'Action, Thriller',
        language: 'Hindi',
        rating: 8.0,
        active: true
      });
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to create movie.', type: 'error' });
    }
  };

  const handleUpdateMovie = async (e) => {
    e.preventDefault();
    if (!editingMovie) return;
    try {
      const payload = {
        ...editingMovie,
        durationMinutes: Number(editingMovie.durationMinutes),
        rating: Number(editingMovie.rating),
        genres: typeof editingMovie.genres === 'string'
          ? editingMovie.genres.split(',').map(g => g.trim()).filter(Boolean)
          : editingMovie.genres
      };
      await api.put(`/movies/${editingMovie._id}`, payload);
      setNotice({ text: 'Movie updated successfully!', type: 'success' });
      setEditingMovie(null);
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to update movie.', type: 'error' });
    }
  };

  const handleDeleteMovie = async (movieId, movieTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${movieTitle}"?`)) return;
    try {
      await api.delete(`/movies/${movieId}`);
      setNotice({ text: `Movie "${movieTitle}" deleted.`, type: 'success' });
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to delete movie.', type: 'error' });
    }
  };

  // Theatre actions
  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      await api.post('/theatres', {
        ...newTheatre,
        totalSeats: Number(newTheatre.totalSeats)
      });
      setNotice({ text: 'Theatre created successfully!', type: 'success' });
      setNewTheatre({ name: '', city: 'Bhopal', address: '', totalSeats: 60 });
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to create theatre.', type: 'error' });
    }
  };

  const handleUpdateTheatre = async (e) => {
    e.preventDefault();
    if (!editingTheatre) return;
    try {
      await api.put(`/theatres/${editingTheatre._id}`, {
        ...editingTheatre,
        totalSeats: Number(editingTheatre.totalSeats)
      });
      setNotice({ text: 'Theatre updated successfully!', type: 'success' });
      setEditingTheatre(null);
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to update theatre.', type: 'error' });
    }
  };

  const handleDeleteTheatre = async (theatreId, theatreName) => {
    if (!window.confirm(`Delete theatre "${theatreName}"?`)) return;
    try {
      await api.delete(`/theatres/${theatreId}`);
      setNotice({ text: `Theatre "${theatreName}" deleted.`, type: 'success' });
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to delete theatre.', type: 'error' });
    }
  };

  // Show actions
  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shows', {
        ...newShow,
        price: Number(newShow.price),
        rows: Number(newShow.rows),
        seatsPerRow: Number(newShow.seatsPerRow),
        startsAt: new Date(newShow.startsAt).toISOString()
      });
      setNotice({ text: 'Show created with seats layout!', type: 'success' });
      setNewShow(s => ({ ...s, startsAt: '', price: 220 }));
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to create show.', type: 'error' });
    }
  };

  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Delete this show? Any confirmed tickets will be cancelled and refunded.')) return;
    try {
      await api.delete(`/shows/${showId}`);
      setNotice({ text: 'Show and related bookings removed.', type: 'success' });
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to delete show.', type: 'error' });
    }
  };

  // Booking actions
  const handleAdminCancelBooking = async (bookingId) => {
    if (!window.confirm(`Cancel booking ${bookingId} and issue refund?`)) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setNotice({ text: `Booking ${bookingId} cancelled and refunded.`, type: 'success' });
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to cancel booking.', type: 'error' });
    }
  };

  // User actions
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of user to "${newRole}"?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setNotice({ text: `User role updated to ${newRole}.`, type: 'success' });
      loadAllData();
    } catch (err) {
      setNotice({ text: err.response?.data?.message || 'Failed to update role.', type: 'error' });
    }
  };

  return (
    <div className="admin-dashboard-page py-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="badge bg-warning text-dark fw-bold text-uppercase px-2 py-1 mb-1">
            <i className="bi bi-shield-lock-fill me-1"></i> Executive Control Center
          </span>
          <h2 className="fw-bolder text-white mb-0">IMovies Administration</h2>
        </div>

        {/* Tab Navigation */}
        <div className="btn-group flex-wrap" role="group">
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-graph-up me-1"></i> Overview
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'movies' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('movies')}
          >
            <i className="bi bi-film me-1"></i> Movies ({movies.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'theatres' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('theatres')}
          >
            <i className="bi bi-geo-alt me-1"></i> Theatres ({theatres.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'shows' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('shows')}
          >
            <i className="bi bi-calendar-event me-1"></i> Shows ({shows.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="bi bi-ticket-perforated me-1"></i> Bookings ({bookings.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-warning' : 'btn-outline-secondary text-light'}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-1"></i> Users ({users.length})
          </button>
        </div>
      </div>

      <Notice text={notice.text} type={notice.type} onDismiss={() => setNotice({ text: '', type: 'info' })} />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="text-secondary mt-2">Loading administration systems...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="admin-overview">
              <div className="row g-3 mb-4">
                <div className="col-lg-3 col-6">
                  <div className="p-3 rounded-4 bg-dark border border-secondary border-opacity-25">
                    <span className="text-secondary small text-uppercase">Total Revenue</span>
                    <h3 className="fw-bolder text-warning mt-1 mb-0">{money(stats?.totalRevenue || 0)}</h3>
                    <span className="text-success small"><i className="bi bi-arrow-up-right"></i> Confirmed bookings</span>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="p-3 rounded-4 bg-dark border border-secondary border-opacity-25">
                    <span className="text-secondary small text-uppercase">Confirmed Bookings</span>
                    <h3 className="fw-bolder text-white mt-1 mb-0">{stats?.confirmedBookings || 0}</h3>
                    <span className="text-secondary small">{stats?.totalBookings || 0} total requests</span>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="p-3 rounded-4 bg-dark border border-secondary border-opacity-25">
                    <span className="text-secondary small text-uppercase">Active Catalog</span>
                    <h3 className="fw-bolder text-white mt-1 mb-0">{stats?.totalMovies || 0} Movies</h3>
                    <span className="text-secondary small">Across {stats?.totalTheatres || 0} cinemas</span>
                  </div>
                </div>
                <div className="col-lg-3 col-6">
                  <div className="p-3 rounded-4 bg-dark border border-secondary border-opacity-25">
                    <span className="text-secondary small text-uppercase">Scheduled Shows</span>
                    <h3 className="fw-bolder text-white mt-1 mb-0">{stats?.totalShows || 0} Shows</h3>
                    <span className="text-secondary small">{stats?.totalUsers || 0} registered members</span>
                  </div>
                </div>
              </div>

              {/* Recent Bookings Stream */}
              <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-warning"></i> Recent Booking Activity
                </h5>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0 small">
                    <thead>
                      <tr className="text-secondary text-uppercase">
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Movie</th>
                        <th>Cinema</th>
                        <th>Seats</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentBookings?.length > 0 ? (
                        stats.recentBookings.map(b => (
                          <tr key={b._id}>
                            <td><code>{b._id?.slice(-6)}</code></td>
                            <td>
                              <div className="fw-semibold text-light">{b.user?.name || 'Customer'}</div>
                              <div className="text-secondary small">{b.user?.email}</div>
                            </td>
                            <td>{b.movie?.title || 'Movie'}</td>
                            <td>{b.theatre?.name}</td>
                            <td>
                              <span className="badge bg-warning text-dark">{b.seats?.join(', ')}</span>
                            </td>
                            <td className="fw-bold text-success">{money(b.totalAmount)}</td>
                            <td>
                              <span className={`badge ${b.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="text-secondary">
                              {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4 text-secondary">No recent bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOVIES */}
          {activeTab === 'movies' && (
            <div className="admin-movies">
              <div className="row g-4">
                {/* Add Movie Form */}
                <div className="col-lg-5">
                  <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                    <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-plus-circle text-warning"></i> Add New Movie
                    </h5>
                    <form onSubmit={handleCreateMovie}>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Movie Title</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          value={newMovie.title}
                          onChange={e => setNewMovie({ ...newMovie, title: e.target.value })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Description / Synopsis</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows="3"
                          required
                          value={newMovie.description}
                          onChange={e => setNewMovie({ ...newMovie, description: e.target.value })}
                        ></textarea>
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Poster Image URL</label>
                        <input
                          type="url"
                          className="form-control form-control-sm"
                          placeholder="https://..."
                          value={newMovie.posterUrl}
                          onChange={e => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                        />
                      </div>
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <label className="form-label text-secondary small mb-1">Runtime (min)</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control form-control-sm"
                            required
                            value={newMovie.durationMinutes}
                            onChange={e => setNewMovie({ ...newMovie, durationMinutes: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-secondary small mb-1">Rating (0-10)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="form-control form-control-sm"
                            value={newMovie.rating}
                            onChange={e => setNewMovie({ ...newMovie, rating: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-secondary small mb-1">Language</label>
                          <select
                            className="form-select form-select-sm"
                            value={newMovie.language}
                            onChange={e => setNewMovie({ ...newMovie, language: e.target.value })}
                          >
                            <option value="Hindi">Hindi</option>
                            <option value="English">English</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="form-label text-secondary small mb-1">Genres (comma separated)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={newMovie.genres}
                            onChange={e => setNewMovie({ ...newMovie, genres: e.target.value })}
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-warning btn-sm w-100 fw-bold">
                        Add Movie to Catalog
                      </button>
                    </form>
                  </div>
                </div>

                {/* Movies List */}
                <div className="col-lg-7">
                  <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                    <h5 className="fw-bold text-white mb-3">Active Catalog ({movies.length})</h5>
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {movies.map(m => (
                        <div key={m._id} className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center gap-2">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={m.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700'}
                              alt={m.title}
                              className="rounded object-fit-cover"
                              style={{ width: '45px', height: '60px' }}
                            />
                            <div>
                              <div className="fw-bold text-light">{m.title}</div>
                              <span className="text-secondary small">{m.language} · {m.durationMinutes} min · ★ {m.rating}</span>
                              <div className="text-secondary small">{m.genres?.join(', ')}</div>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => setEditingMovie({
                                ...m,
                                genres: Array.isArray(m.genres) ? m.genres.join(', ') : m.genres
                              })}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteMovie(m._id, m.title)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THEATRES */}
          {activeTab === 'theatres' && (
            <div className="admin-theatres">
              <div className="row g-4">
                <div className="col-lg-5">
                  <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                    <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-building-add text-warning"></i> Add Cinema Theatre
                    </h5>
                    <form onSubmit={handleCreateTheatre}>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Theatre / Multiplex Name</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          value={newTheatre.name}
                          onChange={e => setNewTheatre({ ...newTheatre, name: e.target.value })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">City</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          value={newTheatre.city}
                          onChange={e => setNewTheatre({ ...newTheatre, city: e.target.value })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Address</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          value={newTheatre.address}
                          onChange={e => setNewTheatre({ ...newTheatre, address: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-secondary small mb-1">Total Capacity Seats</label>
                        <input
                          type="number"
                          min="10"
                          max="200"
                          className="form-control form-control-sm"
                          required
                          value={newTheatre.totalSeats}
                          onChange={e => setNewTheatre({ ...newTheatre, totalSeats: e.target.value })}
                        />
                      </div>
                      <button type="submit" className="btn btn-warning btn-sm w-100 fw-bold">
                        Add Cinema
                      </button>
                    </form>
                  </div>
                </div>

                <div className="col-lg-7">
                  <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                    <h5 className="fw-bold text-white mb-3">Cinema Theatres ({theatres.length})</h5>
                    <div className="d-flex flex-column gap-2">
                      {theatres.map(t => (
                        <div key={t._id} className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                          <div>
                            <span className="badge bg-warning text-dark small fw-bold me-2">{t.city}</span>
                            <strong className="text-light">{t.name}</strong>
                            <div className="text-secondary small mt-1">{t.address} ({t.totalSeats} seats)</div>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => setEditingTheatre(t)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteTheatre(t._id, t.name)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHOWS */}
          {activeTab === 'shows' && (
            <div className="admin-shows">
              <div className="row g-4">
                <div className="col-lg-5">
                  <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                    <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-calendar-plus text-warning"></i> Schedule Show
                    </h5>
                    <form onSubmit={handleCreateShow}>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Select Movie</label>
                        <select
                          className="form-select form-select-sm"
                          required
                          value={newShow.movie}
                          onChange={e => setNewShow({ ...newShow, movie: e.target.value })}
                        >
                          {movies.map(m => (
                            <option key={m._id} value={m._id}>{m.title} ({m.language})</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Select Cinema Hall</label>
                        <select
                          className="form-select form-select-sm"
                          required
                          value={newShow.theatre}
                          onChange={e => setNewShow({ ...newShow, theatre: e.target.value })}
                        >
                          {theatres.map(t => (
                            <option key={t._id} value={t._id}>{t.name} — {t.city}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Date & Time</label>
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm"
                          required
                          value={newShow.startsAt}
                          onChange={e => setNewShow({ ...newShow, startsAt: e.target.value })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary small mb-1">Ticket Base Price (₹)</label>
                        <input
                          type="number"
                          min="50"
                          step="10"
                          className="form-control form-control-sm"
                          required
                          value={newShow.price}
                          onChange={e => setNewShow({ ...newShow, price: e.target.value })}
                        />
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-secondary small mb-1">Rows (Letters A-Z)</label>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            className="form-control form-control-sm"
                            value={newShow.rows}
                            onChange={e => setNewShow({ ...newShow, rows: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-secondary small mb-1">Seats / Row</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            className="form-control form-control-sm"
                            value={newShow.seatsPerRow}
                            onChange={e => setNewShow({ ...newShow, seatsPerRow: e.target.value })}
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-warning btn-sm w-100 fw-bold">
                        Create Show & Generate Seats
                      </button>
                    </form>
                  </div>
                </div>

                <div className="col-lg-7">
                  <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                    <h5 className="fw-bold text-white mb-3">Scheduled Shows ({shows.length})</h5>
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      {shows.map(s => {
                        const showDate = new Date(s.startsAt);
                        const isPast = showDate < new Date();
                        const bookedSeats = s.bookedSeats ?? s.seats?.filter(seat => seat.status === 'booked').length;
                        const totalSeats = s.totalSeats ?? s.seats?.length;

                        return (
                          <div key={s._id} className="p-3 rounded-3 bg-black bg-opacity-40 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center gap-2">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span className={`badge ${isPast ? 'bg-secondary' : 'bg-success'}`}>
                                  {isPast ? 'Expired' : 'Upcoming'}
                                </span>
                                <strong className="text-light">{s.movie?.title || 'Movie'}</strong>
                              </div>
                              <div className="text-secondary small">
                                {s.theatre?.name} · {showDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at {showDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </div>
                              <div className="text-secondary small mt-1">
                                Seats: <strong className="text-warning">{bookedSeats}</strong> / {totalSeats} booked ({money(s.price)})
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteShow(s._id)}
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="admin-bookings">
              <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-white m-0">Customer Reservations Ledger ({bookings.length})</h5>
                </div>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0 small">
                    <thead>
                      <tr className="text-secondary text-uppercase">
                        <th>Reference</th>
                        <th>User</th>
                        <th>Movie</th>
                        <th>Cinema</th>
                        <th>Showtime</th>
                        <th>Seats</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b._id}>
                          <td><code>{b._id?.slice(-8)}</code></td>
                          <td>
                            <div className="fw-semibold text-light">{b.user?.name || 'Customer'}</div>
                            <div className="text-secondary small">{b.user?.email}</div>
                          </td>
                          <td>{b.movie?.title || 'Movie'}</td>
                          <td>{b.theatre?.name}</td>
                          <td>
                            {b.show?.startsAt ? new Date(b.show.startsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </td>
                          <td>
                            <span className="badge bg-warning text-dark">{b.seats?.join(', ')}</span>
                          </td>
                          <td className="fw-bold text-success">{money(b.totalAmount)}</td>
                          <td>
                            <span className={`badge ${b.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.status === 'confirmed' && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleAdminCancelBooking(b._id)}
                              >
                                Cancel / Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USERS */}
          {activeTab === 'users' && (
            <div className="admin-users">
              <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
                <h5 className="fw-bold text-white mb-3">Registered Users Directory ({users.length})</h5>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0 small">
                    <thead>
                      <tr className="text-secondary text-uppercase">
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Member Since</th>
                        <th>Role Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td><code>{u._id?.slice(-8)}</code></td>
                          <td className="fw-semibold text-light">{u.name}</td>
                          <td className="text-secondary">{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary text-light'}`}>
                              {u.role?.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-secondary">
                            {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`btn btn-sm ${u.role === 'admin' ? 'btn-outline-secondary' : 'btn-outline-warning'}`}
                              onClick={() => handleToggleUserRole(u._id, u.role)}
                            >
                              {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Movie Modal */}
      {editingMovie && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card bg-dark border border-warning border-opacity-50 rounded-4 p-4 shadow-lg" style={{ maxWidth: '520px', width: '100%' }}>
            <h5 className="fw-bold text-warning mb-3">Edit Movie</h5>
            <form onSubmit={handleUpdateMovie}>
              <div className="mb-2">
                <label className="form-label text-secondary small mb-1">Title</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  value={editingMovie.title}
                  onChange={e => setEditingMovie({ ...editingMovie, title: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary small mb-1">Description</label>
                <textarea
                  className="form-control form-control-sm"
                  rows="3"
                  required
                  value={editingMovie.description}
                  onChange={e => setEditingMovie({ ...editingMovie, description: e.target.value })}
                ></textarea>
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary small mb-1">Poster URL</label>
                <input
                  type="url"
                  className="form-control form-control-sm"
                  value={editingMovie.posterUrl}
                  onChange={e => setEditingMovie({ ...editingMovie, posterUrl: e.target.value })}
                />
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label text-secondary small mb-1">Runtime (min)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={editingMovie.durationMinutes}
                    onChange={e => setEditingMovie({ ...editingMovie, durationMinutes: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-secondary small mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    value={editingMovie.rating}
                    onChange={e => setEditingMovie({ ...editingMovie, rating: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small mb-1">Genres</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={editingMovie.genres}
                  onChange={e => setEditingMovie({ ...editingMovie, genres: e.target.value })}
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingMovie(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Theatre Modal */}
      {editingTheatre && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
          <div className="card bg-dark border border-warning border-opacity-50 rounded-4 p-4 shadow-lg" style={{ maxWidth: '480px', width: '100%' }}>
            <h5 className="fw-bold text-warning mb-3">Edit Theatre</h5>
            <form onSubmit={handleUpdateTheatre}>
              <div className="mb-2">
                <label className="form-label text-secondary small mb-1">Theatre Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  value={editingTheatre.name}
                  onChange={e => setEditingTheatre({ ...editingTheatre, name: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary small mb-1">City</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  value={editingTheatre.city}
                  onChange={e => setEditingTheatre({ ...editingTheatre, city: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary small mb-1">Address</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  value={editingTheatre.address}
                  onChange={e => setEditingTheatre({ ...editingTheatre, address: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small mb-1">Total Capacity</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  required
                  value={editingTheatre.totalSeats}
                  onChange={e => setEditingTheatre({ ...editingTheatre, totalSeats: e.target.value })}
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingTheatre(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
