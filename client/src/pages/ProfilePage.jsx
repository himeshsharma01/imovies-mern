import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Notice from '../components/Notice';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileMsg, setProfileMsg] = useState({ text: '', type: 'info' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: 'info' });
  const [busyProfile, setBusyProfile] = useState(false);
  const [busyPassword, setBusyPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setBusyProfile(true);
    setProfileMsg({ text: '', type: 'info' });
    try {
      const res = await api.put('/auth/profile', profileForm);
      updateUser(res.data.user);
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setBusyProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }

    setBusyPassword(true);
    setPasswordMsg({ text: '', type: 'info' });
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to change password.', type: 'error' });
    } finally {
      setBusyPassword(false);
    }
  };

  return (
    <div className="profile-page py-3">
      <div className="mb-4">
        <h2 className="fw-bolder text-white mb-1">Account & Security</h2>
        <p className="text-secondary small mb-0">Manage your profile details and account security settings.</p>
      </div>

      <div className="row g-4">
        {/* Profile Card & Avatar */}
        <div className="col-lg-4">
          <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4 text-center">
            <div className="user-profile-avatar mx-auto mb-3">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h4 className="fw-bold text-white mb-1">{user?.name}</h4>
            <p className="text-secondary small mb-2">{user?.email}</p>
            <div className="d-flex justify-content-center gap-2 mb-4">
              <span className={`badge ${user?.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary text-light'} fw-bold text-uppercase px-3 py-1`}>
                {user?.role === 'admin' ? 'Administrator' : 'Cinema Club Member'}
              </span>
            </div>

            <div className="border-top border-secondary border-opacity-25 pt-3 d-flex flex-column gap-2">
              <Link to="/bookings" className="btn btn-outline-warning btn-sm w-100">
                <i className="bi bi-ticket-perforated me-1"></i> View My Bookings
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn btn-warning btn-sm w-100 fw-medium">
                  <i className="bi bi-shield-lock me-1"></i> Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Update Forms */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            {/* Update Profile Form */}
            <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-person-gear text-warning"></i> Personal Details
              </h5>
              <Notice text={profileMsg.text} type={profileMsg.type} onDismiss={() => setProfileMsg({ text: '', type: 'info' })} />
              <form onSubmit={handleUpdateProfile}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileForm.email}
                      onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-warning btn-sm px-4 fw-medium" disabled={busyProfile}>
                  {busyProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="card bg-dark border border-secondary border-opacity-25 rounded-4 p-4">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-shield-lock text-warning"></i> Change Password
              </h5>
              <Notice text={passwordMsg.text} type={passwordMsg.type} onDismiss={() => setPasswordMsg({ text: '', type: 'info' })} />
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label text-secondary small">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter existing password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">New Password (8+ characters)</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Min 8 characters"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary small">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Repeat new password"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-warning btn-sm px-4 fw-medium" disabled={busyPassword}>
                  {busyPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
