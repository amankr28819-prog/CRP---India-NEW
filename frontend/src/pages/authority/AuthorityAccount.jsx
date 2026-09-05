import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Shield,
  Briefcase,
  Layers,
  MapPin,
  Camera,
  Trash2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  KeyRound,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, getImageUrl } from '../../services/api';

export default function AuthorityAccount() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);

  // Tabs: 'profile' or 'security'
  const [activeTab, setActiveTab] = useState('profile');

  // Name editing
  const [name, setName] = useState(user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // Photo upload / removal
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle Photo Select & Upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please select a smaller photo.', 'error');
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, JPEG, PNG, or WebP images are allowed.', 'error');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.uploadProfilePicture(formData);
      if (res.success && res.user) {
        updateUser(res.user);
        showToast('Official profile photo updated successfully.', 'success');
      } else {
        showToast('Failed to update profile photo.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Remove Photo
  const handleRemovePhoto = async () => {
    try {
      setIsRemovingPhoto(true);
      const res = await api.removeProfilePicture();
      if (res.success && res.user) {
        updateUser(res.user);
        showToast('Official profile photo removed successfully.', 'success');
      } else {
        showToast('Failed to remove profile photo.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove profile photo.', 'error');
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  // Handle Name Save
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    try {
      setIsSavingName(true);
      setNameError('');
      setNameSuccess('');
      const res = await api.updateProfile({ name: name.trim() });
      if (res.success && res.user) {
        updateUser(res.user);
        setNameSuccess('Profile name updated successfully.');
        showToast('Profile name updated successfully.', 'success');
      }
    } catch (err) {
      setNameError(err.message || 'Failed to update name.');
      showToast(err.message || 'Failed to update name.', 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password cannot be identical to current password.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await api.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (res.success) {
        setPasswordSuccess('Password changed successfully.');
        showToast('Password changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Please verify current password.');
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const avatarUrl = user?.avatar ? getImageUrl(user.avatar) : '';
  const userInitials = (user?.name || 'O')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isMainAdmin = user?.authorityRole === 'authority_admin' || user?.role === 'authority_admin';
  const roleLabel = isMainAdmin
    ? 'Main Municipal Authority (Chief Admin)'
    : 'Category Authority Officer';

  const categoryLabel = user?.assignedCategory || 'All Municipal Categories (Central Oversight)';

  return (
    <div className="container" style={{ padding: '28px 16px 64px 16px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link to="/authority/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Municipal Authority
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Officer Profile & Credentials</span>
      </div>

      {/* Header Banner Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar with Upload Badge */}
          <div style={{ position: 'relative', width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0 }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'var(--color-primary)',
                border: '2px solid var(--border-subtle)'
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || 'Officer Avatar'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {userInitials}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload profile photo"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                border: '2px solid var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Camera size={13} />
            </button>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {user?.name}
              </h1>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: isMainAdmin ? 'rgba(37, 99, 235, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  color: isMainAdmin ? 'var(--color-primary)' : 'var(--color-accent-green)'
                }}
              >
                {roleLabel}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {user?.email} • {user?.department || 'Municipal Administration'}
            </div>
          </div>
        </div>

        {/* Quick Official Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '10px 18px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              Jurisdiction
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Bengaluru Urban
            </div>
          </div>

          <div
            style={{
              padding: '10px 18px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              Allocated Scope
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
              {isMainAdmin ? 'All 7 Categories' : user?.assignedCategory}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Navigation Tabs + Active View */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }} className="authority-account-grid">
        {/* Left Navigation Sidebar */}
        <aside
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignSelf: 'flex-start'
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 12px 8px 12px' }}>
            Officer Settings
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'profile' ? 600 : 500,
              color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--text-primary)',
              backgroundColor: activeTab === 'profile' ? 'var(--color-primary-light, #EFF6FF)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={17} style={{ color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
            <span>Profile & Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'security' ? 600 : 500,
              color: activeTab === 'security' ? 'var(--color-primary)' : 'var(--text-primary)',
              backgroundColor: activeTab === 'security' ? 'var(--color-primary-light, #EFF6FF)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={17} style={{ color: activeTab === 'security' ? 'var(--color-primary)' : 'var(--text-muted)' }} />
            <span>Change Password</span>
          </button>

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '8px', paddingTop: '8px' }}>
            <Link
              to="/authority/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none'
              }}
            >
              <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </aside>

        {/* Right Content Area */}
        <main style={{ minWidth: 0 }}>
          {/* TAB 1: PROFILE & CREDENTIALS */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Profile Photo Management */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Official Profile Picture
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  This image is displayed to identify your administrative account in the Municipal Authority portal.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-primary)',
                      border: '2px solid var(--border-subtle)',
                      flexShrink: 0
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Current Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '1.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {userInitials}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoSelect}
                      style={{ display: 'none' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto || isRemovingPhoto}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                        <span>{user?.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                      </button>

                      {user?.avatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isUploadingPhoto || isRemovingPhoto}
                          className="btn btn-secondary btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--color-status-rejected, #DC2626)',
                            borderColor: 'var(--border-subtle)'
                          }}
                        >
                          {isRemovingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          <span>Delete Photo</span>
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Supports JPG, PNG, or WebP. Maximum file size: 5MB.
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information (Name) */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Personal Information
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  Update your officer contact display name.
                </p>

                {nameSuccess && (
                  <div className="alert alert-success" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem' }}>{nameSuccess}</span>
                  </div>
                )}

                {nameError && (
                  <div className="alert alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem' }}>{nameError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveName}>
                  <div className="form-group" style={{ maxWidth: '460px' }}>
                    <label className="form-label" htmlFor="officerName">
                      Officer Full Name <span className="required">*</span>
                    </label>
                    <input
                      id="officerName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Vikramaditya Sen"
                      className="form-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingName || !name.trim() || name === user?.name}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {isSavingName ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Save Name</span>
                  </button>
                </form>
              </div>

              {/* Administrative Credentials (Read-only / Security Bound) */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Shield size={20} style={{ color: 'var(--color-primary)' }} />
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Official Authority Credentials & Scope
                  </h2>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  These credentials and permissions are centrally assigned by Municipal Administration and enforced by the backend server.
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px'
                  }}
                >
                  {/* Email */}
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      <Mail size={13} /> Official Email
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {user?.email}
                    </div>
                  </div>

                  {/* Authority Role */}
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      <Shield size={13} /> Role & Clearance
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: isMainAdmin ? 'var(--color-primary)' : 'var(--color-accent-green)', marginTop: '4px' }}>
                      {roleLabel}
                    </div>
                  </div>

                  {/* Department */}
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      <Building2 size={13} /> Department
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {user?.department || 'Central Administration'}
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      <Layers size={13} /> Assigned Category
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {categoryLabel}
                    </div>
                  </div>

                  {/* Designation */}
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      <Briefcase size={13} /> Designation
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {user?.designation || 'Zonal Authority Officer'}
                    </div>
                  </div>

                  {/* Area / Jurisdiction */}
                  <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      <MapPin size={13} /> Jurisdiction Area
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                      Bengaluru Urban Division
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <ShieldAlert size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Authority roles, assigned categories, and jurisdictional rights cannot be altered from the officer portal. Contact the Municipal Commissioner's IT Cell for administrative transfers.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <KeyRound size={20} style={{ color: 'var(--color-primary)' }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Change Account Password
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Keep your administrative account secure. You must verify your current password before saving a new one.
              </p>

              {passwordSuccess && (
                <div className="alert alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem' }}>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="alert alert-error" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem' }}>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ maxWidth: '440px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="currentPassword">
                    Current Password <span className="required">*</span>
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newPassword">
                    New Password <span className="required">*</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="form-input"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Password must be at least 6 characters long.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm New Password <span className="required">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="form-input"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="btn btn-primary btn-md"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}
                >
                  {isChangingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .authority-account-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
