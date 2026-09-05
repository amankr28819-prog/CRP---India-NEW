import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  Award,
  FileText,
  Clock,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  UserCheck
} from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import BackButton from '../components/BackButton';
import StatusBadge from '../components/StatusBadge';

export default function CitizenPublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getCitizenPublicProfile(id);
        if (res.success && (res.profile || res.citizen)) {
          const prof = res.profile || res.citizen;
          setProfile(prof);
          setComplaints(prof.complaints || res.complaints || []);
        } else {
          setError(res.message || 'Citizen public profile not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load citizen profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Loading citizen public accountability record...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container" style={{ padding: '64px 20px', maxWidth: '600px' }}>
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <ShieldAlert size={20} />
          <div>
            <strong>Citizen Profile Unavailable</strong>
            <p style={{ marginTop: '4px' }}>{error || 'Unable to find the requested citizen record.'}</p>
          </div>
        </div>
        <BackButton fallback="/citizens" label="Back to Directory" />
      </div>
    );
  }

  const initials = (profile.name || 'C')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isCurrentlySuspended = profile.isSuspended && profile.suspendedUntil && new Date(profile.suspendedUntil) > new Date();

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px', maxWidth: '960px' }}>
      <div style={{ marginBottom: '24px' }}>
        <BackButton fallback="/citizens" label="Back to Directory" />
      </div>

      {/* Suspension Alert Banner if citizen is currently suspended */}
      {isCurrentlySuspended && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #EF4444',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <ShieldAlert size={24} style={{ color: '#DC2626', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#DC2626' }}>
              Account Currently Under 30-Day Administrative Suspension
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4B5563', marginTop: '2px' }}>
              This citizen has accumulated 3 administrative warnings for repeated misinformation or duplicate submissions.
              Account rights are suspended until{' '}
              <strong>{new Date(profile.suspendedUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Citizen Identity & Karma Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '28px 32px',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Custom Photo or Initials */}
            {profile.avatar ? (
              <img
                src={getImageUrl(profile.avatar)}
                alt={profile.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--border-subtle)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                  color: 'var(--color-primary, #1D4ED8)',
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid rgba(29, 78, 216, 0.25)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {initials}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {profile.name}
                </h1>
                <span
                  title="Voter-ID Verified Immutable Identity"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #86EFAC'
                  }}
                >
                  <UserCheck size={12} />
                  <span>Voter Verified</span>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={15} style={{ color: 'var(--text-muted)' }} />
                  <span>Constituency: <strong>{profile.constituency || 'Constituency Verified'}</strong></span>
                </div>
                {profile.createdAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
                    <span>Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Civic Karma Score Display */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-app, #F9FAFB)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '14px 24px',
              minWidth: '130px'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Citizen Karma
            </div>
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                lineHeight: 1.1,
                marginTop: '4px',
                color: (profile.karma || 0) > 0 ? '#16A34A' : (profile.karma || 0) < 0 ? '#DC2626' : 'var(--text-secondary)'
              }}
            >
              {(profile.karma || 0) > 0 ? `+${profile.karma}` : profile.karma || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Net Votes Received
            </div>
          </div>
        </div>

        {/* Change 10: 5 Exact Accountability Badges / Counters */}
        <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
            Public Civic Accountability Record
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px'
            }}
          >
            {/* 1. Misinformation Count: RED background */}
            <div
              style={{
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px 16px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {profile.misinformationCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '6px' }}>
                Misinformation
              </div>
            </div>

            {/* 2. Duplicate Count: ORANGE / DARK YELLOW background */}
            <div
              style={{
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px 16px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(217, 119, 6, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {profile.duplicateCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '6px' }}>
                Duplicates
              </div>
            </div>

            {/* 3. Total Complaints Submitted: LIGHT BLUE background */}
            <div
              style={{
                backgroundColor: '#0EA5E9',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px 16px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {profile.totalComplaints || 0}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '6px' }}>
                Total Complaints
              </div>
            </div>

            {/* 4. Warnings Count: RED TEXT */}
            <div
              style={{
                backgroundColor: 'var(--bg-app, #FFFFFF)',
                border: '2px solid #FCA5A5',
                color: '#DC2626',
                borderRadius: '8px',
                padding: '14px 16px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1, color: '#DC2626' }}>
                {profile.warningCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '6px', color: '#DC2626' }}>
                Warnings
              </div>
            </div>

            {/* 5. Suspensions Count: GREY background */}
            <div
              style={{
                backgroundColor: '#475569',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px 16px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(71, 85, 105, 0.2)'
              }}
            >
              <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                {profile.suspensionCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '6px' }}>
                Suspensions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Citizen's Public Grievances Feed */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Grievances Submitted by {profile.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Public record of reported civic complaints and current resolution states.
            </p>
          </div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Total: <strong>{complaints.length}</strong>
          </span>
        </div>

        {complaints.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <FileText size={36} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
              No Public Grievances
            </h3>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              This citizen has no active public complaints on file.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complaints.map((c) => (
              <div
                key={c._id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                      {c.category}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Ref: <strong>{c.referenceId}</strong>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • Filed on {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    {/* Flag tags */}
                    {c.flagStatus === 'misinformation' && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        Flagged Misinformation
                      </span>
                    )}
                    {c.flagStatus === 'duplicate' && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: '#FEF3C7',
                          color: '#D97706',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        Flagged Duplicate
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/complaints/${c.referenceId || c._id}`}
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      lineHeight: 1.3,
                      display: 'block'
                    }}
                  >
                    {c.title}
                  </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  {/* Community Net Score */}
                  <div
                    title={`Community Net Score: ${c.netScore || 0} (${c.upvotesCount || 0} up, ${c.downvotesCount || 0} down)`}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '16px',
                      backgroundColor: 'var(--bg-app, #F3F4F6)',
                      color: (c.netScore || 0) > 0 ? '#16A34A' : (c.netScore || 0) < 0 ? '#DC2626' : 'var(--text-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {(c.netScore || 0) > 0 ? `+${c.netScore}` : c.netScore || 0} votes
                  </div>

                  <StatusBadge status={c.status} />

                  <Link
                    to={`/complaints/${c.referenceId || c._id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
