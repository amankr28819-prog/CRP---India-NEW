import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  AlertCircle,
  Loader2,
  Award,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api, getImageUrl } from '../../services/api';

export default function ProfileView() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);

  // Name editing
  const [name, setName] = useState(user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Avatar upload
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  // Voter ID Reveal State
  const [revealedVoterId, setRevealedVoterId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifyPasswordInput, setVerifyPasswordInput] = useState('');
  const [verifyPasswordError, setVerifyPasswordError] = useState('');
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [revealCountdown, setRevealCountdown] = useState(0);

  // Copy Account ID
  const [copiedId, setCopiedId] = useState(false);

  // Handle Name Save
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    try {
      setIsSavingName(true);
      const res = await api.updateProfile({ name: name.trim() });
      if (res.success && res.user) {
        updateUser(res.user);
        showToast('Profile name updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update name', 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  // Handle Photo File Select
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit. Please choose a smaller photo.', 'error');
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
        showToast('Profile picture updated successfully.', 'success');
      } else {
        showToast('Failed to update profile picture. Please try again.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile picture. Please try again.', 'error');
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
        showToast('Profile picture deleted successfully.', 'success');
      } else {
        showToast('Failed to delete profile picture. Please try again.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete profile picture. Please try again.', 'error');
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  // Handle Password Verification for Voter ID Reveal
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!verifyPasswordInput) {
      setVerifyPasswordError('Please enter your account password');
      return;
    }
    try {
      setIsVerifyingPassword(true);
      setVerifyPasswordError('');
      const res = await api.verifyPasswordForVoterId(verifyPasswordInput);
      if (res.success && res.voterId) {
        setRevealedVoterId(res.voterId);
        setShowPasswordModal(false);
        setVerifyPasswordInput('');
        showToast('Voter ID revealed securely for 60 seconds', 'success');

        // Security countdown: auto-mask after 60s
        setRevealCountdown(60);
        const timer = setInterval(() => {
          setRevealCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setRevealedVoterId(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setVerifyPasswordError(err.message || 'Incorrect password. Verification failed.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleHideVoterId = () => {
    setRevealedVoterId(null);
    setRevealCountdown(0);
  };

  // Format Voter ID masked display
  const rawVoterId = user?.voterId || '';
  const maskedVoterId = rawVoterId
    ? `••••••••${rawVoterId.slice(-4)}`
    : 'Not Registered';

  // Handle Copy Account ID
  const handleCopyId = () => {
    const idToCopy = user?._id || user?.id || '';
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopiedId(true);
      showToast('Account ID copied to clipboard', 'info');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const avatarUrl = user?.avatar ? getImageUrl(user.avatar) : '';
  const userInitials = (user?.name || 'C')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Registered Citizen';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Profile Summary Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Avatar with Camera Button */}
            <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || 'Profile Avatar'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--color-primary-light, #DBEAFE)'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--border-subtle)'
                  }}
                >
                  {userInitials}
                </div>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                title="Upload profile picture"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '28px',
                  height: '28px',
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
                {isUploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {user?.name}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
                    color: 'var(--color-accent-green, #15803D)'
                  }}
                >
                  <ShieldCheck size={12} />
                  <span>Verified Citizen</span>
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {user?.email}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Member since {formattedDate}
              </div>
            </div>
          </div>

          {/* Photo Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Camera size={14} />
              <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isRemovingPhoto}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--color-status-rejected)', borderColor: 'rgba(239, 68, 68, 0.3)', gap: '6px' }}
                title="Remove photo"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Citizen Karma & Civic Standing Card (Change 13) */}
      {user?.role === 'citizen' && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Award size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Citizen Karma & Civic Standing
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '580px', lineHeight: 1.5 }}>
                Citizen Karma reflects your net community support: <strong>Total Upvotes minus Total Downvotes</strong> across all your submitted complaints.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 24px',
                textAlign: 'center',
                minWidth: '120px'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Karma Score
              </div>
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: (user?.karma || 0) > 0 ? '#16A34A' : (user?.karma || 0) < 0 ? '#DC2626' : 'var(--text-secondary)'
                }}
              >
                {(user?.karma || 0) > 0 ? `+${user.karma}` : user?.karma || 0}
              </div>
            </div>
          </div>

          {/* Warnings and Suspensions Alerts if any (Change 11) */}
          {(user?.warningCount > 0 || (user?.isSuspended && user?.suspendedUntil && new Date(user.suspendedUntil) > new Date())) && (
            <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              {user?.isSuspended && user?.suspendedUntil && new Date(user.suspendedUntil) > new Date() ? (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1.5px solid #EF4444',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <ShieldAlert size={22} style={{ color: '#DC2626', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#DC2626' }}>
                      Account Suspended Until {new Date(user.suspendedUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#4B5563', marginTop: '2px' }}>
                      You have reached 3 administrative warnings. Grievance submission and community voting are temporarily disabled until the suspension ends.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <AlertTriangle size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.85rem', color: '#92400E' }}>
                    <strong>Administrative Warnings: {user.warningCount} / 3.</strong> (3 warnings trigger an automatic 30-day suspension. Warnings are issued for repeated misinformation or duplicate complaints).
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Voter-ID Immutable Identity Section (Change 14) */}
      {user?.role === 'citizen' ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '24px'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Official Voter-ID Verified Identity
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Permanently anchored to your verified Voter ID and cannot be modified.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Official Citizen Name */}
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Official Name
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#15803D',
                    backgroundColor: '#DCFCE7',
                    padding: '1px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Lock size={10} /> Verified & Locked
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
                <User size={18} style={{ color: 'var(--text-muted)' }} />
                <span>{user?.name}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Permanently anchored to your verified Voter ID and cannot be modified.
              </div>
            </div>

            {/* Official Constituency */}
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Registered Constituency
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#15803D',
                    backgroundColor: '#DCFCE7',
                    padding: '1px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Lock size={10} /> Verified & Locked
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--text-muted)' }} />
                <span>{user?.constituency || 'Jurisdiction Registered'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Permanently anchored to your verified Voter ID and cannot be modified.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Authority Name Update Section */
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '24px'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Authority Official Information
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Official administrative user record.
            </p>
          </div>

          <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                htmlFor="citizen-name"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}
              >
                Official Name
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 260px' }}>
                  <User
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                  <input
                    id="citizen-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter official name"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSavingName || name.trim() === (user?.name || '')}
                  className="btn btn-primary"
                  style={{ minWidth: '120px', gap: '6px' }}
                >
                  {isSavingName ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Name</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Verified Registered Identity Credentials */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Verified Registered Credentials
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            These details are bound to your verified civic registration record and cannot be altered directly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Email Address */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--color-accent-green)',
                  backgroundColor: 'var(--color-accent-green-bg)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <CheckCircle2 size={10} /> Verified
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Mail size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ wordBreak: 'break-all' }}>{user?.email || 'N/A'}</span>
            </div>
          </div>

          {/* Mobile Phone */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Mobile Number
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--color-accent-green)',
                  backgroundColor: 'var(--color-accent-green-bg)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <CheckCircle2 size={10} /> Verified
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
              <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              <span>{user?.phone ? `+91 ${user.phone}` : 'Not Provided'}</span>
            </div>
          </div>

          {/* Registered Dummy Voter ID */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Voter ID (EPIC)
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-accent-blue-bg)',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                Government Identifier
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
                <CreditCard size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ letterSpacing: revealedVoterId ? '0.08em' : '0.15em', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                  {revealedVoterId || maskedVoterId}
                </span>
              </div>

              {revealedVoterId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {revealCountdown > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {revealCountdown}s
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleHideVoterId}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                    title="Hide Voter ID"
                  >
                    <EyeOff size={13} />
                    <span>Hide</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVerifyPasswordError('');
                    setVerifyPasswordInput('');
                    setShowPasswordModal(true);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                  title="Reveal Voter ID with password confirmation"
                >
                  <Eye size={13} />
                  <span>Reveal</span>
                </button>
              )}
            </div>
          </div>

          {/* Account Unique ID */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Account UID
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: copiedId ? 'var(--color-accent-green)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                {copiedId ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
              <KeyRound size={15} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontFamily: 'monospace' }}>{user?._id || user?.id || '—'}</span>
            </div>
          </div>
        </div>

        {/* Security Notice Box */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(30, 64, 175, 0.05)',
            border: '1px solid rgba(30, 64, 175, 0.15)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}
        >
          <ShieldCheck size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong>Privacy & Verification Guard:</strong> Your dummy Voter ID is masked to safeguard your registered citizen credentials. Revealing it requires real-time password authentication, adhering to CRP India data governance standards.
          </div>
        </div>
      </div>

      {/* Password Verification Modal for Revealing Voter ID */}
      {showPasswordModal && (
        <div
          className="logout-modal-backdrop"
          onClick={() => setShowPasswordModal(false)}
          style={{ zIndex: 100 }}
        >
          <div
            className="logout-confirm-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light, #DBEAFE)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Confirm Identity
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Enter your password to reveal your registered Voter ID
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyPassword}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="verify-pass"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}
                >
                  Account Password
                </label>
                <input
                  id="verify-pass"
                  type="password"
                  value={verifyPasswordInput}
                  onChange={(e) => {
                    setVerifyPasswordInput(e.target.value);
                    setVerifyPasswordError('');
                  }}
                  placeholder="Enter current password"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: verifyPasswordError ? '1px solid var(--color-status-rejected)' : '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                {verifyPasswordError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-status-rejected)', fontSize: '0.8rem', marginTop: '6px' }}>
                    <AlertCircle size={14} />
                    <span>{verifyPasswordError}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPassword}
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', gap: '6px' }}
                >
                  {isVerifyingPassword ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Reveal ID</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
