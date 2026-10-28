import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import TheatresPage from './pages/TheatresPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPages';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }
  return user?.role === 'admin' ? children : <Navigate to="/login" replace />;
}

function Shell({ children }) {
  return (
    <div className="app-layout d-flex flex-column min-vh-100">
      <Navbar />
      <main className="container flex-grow-1 py-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies/:id" element={<MovieDetailsPage />} />
          <Route path="/shows/:id" element={<SeatSelectionPage />} />
          <Route path="/theatres" element={<TheatresPage />} />
          <Route
            path="/confirmation/:id"
            element={
              <ProtectedRoute>
                <ConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage register />} />
          <Route
            path="*"
            element={
              <div className="text-center py-5">
                <i className="bi bi-compass fs-1 text-warning mb-3 d-block"></i>
                <h2 className="fw-bold text-white mb-2">Page Not Found</h2>
                <p className="text-secondary small mb-4">The page or screen you are looking for does not exist.</p>
                <Link to="/" className="btn btn-warning px-4">
                  Return to Home
                </Link>
              </div>
            }
          />
        </Routes>
      </Shell>
    </AuthProvider>
  );
}
