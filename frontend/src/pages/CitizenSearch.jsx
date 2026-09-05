import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, User, ShieldAlert, Award, AlertTriangle, X, ExternalLink, Users } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import BackButton from '../components/BackButton';

export default function CitizenSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [constituencyFilter, setConstituencyFilter] = useState('');
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchCitizens = async (query = '', constituency = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.searchCitizens({ q: query, constituency });
      if (res.success) {
        setCitizens(res.citizens || []);
      } else {
        setCitizens([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to search citizen directory.');
      setCitizens([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    // Initial fetch of active directory entries
    fetchCitizens();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCitizens(searchTerm, constituencyFilter);
  };

  const handleClear = () => {
    setSearchTerm('');
    setConstituencyFilter('');
    fetchCitizens('', '');
  };

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px' }}>
        <BackButton fallback="/dashboard" label="Back to Dashboard" />
      </div>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light, #EFF6FF)',
              color: 'var(--color-primary, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={20} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Citizen Civic Directory
          </h1>
        </div>
        <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Search verified citizens by name or constituency to review public accountability records, civic karma scores, and grievance activity.
        </p>
      </div>

      {/* Search Form Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr)) auto', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Citizen Name (Partial Match)
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input"
                placeholder="Search citizen name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Constituency
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input"
                placeholder="e.g. South Delhi, Bangalore Central..."
                value={constituencyFilter}
                onChange={(e) => setConstituencyFilter(e.target.value)}
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', height: '40px' }}
            >
              <Search size={15} />
              <span>Search</span>
            </button>

            {(searchTerm || constituencyFilter) && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                disabled={loading}
                title="Clear filters"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', height: '40px' }}
              >
                <X size={15} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </form>

        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          🔒 <strong>Privacy Assurance:</strong> Confidential PII (voter card numbers, emails, phone numbers, and physical residential addresses) is strictly protected and never displayed.
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Directory Records {hasSearched && `(${citizens.length})`}
          </h2>
          {loading && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching directory...</span>}
        </div>

        {citizens.length === 0 && !loading && (
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
            <Users size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Verified Citizens Found
            </h3>
            <p style={{ fontSize: '0.875rem', margin: 0, maxWidth: '440px', marginInline: 'auto' }}>
              {searchTerm || constituencyFilter
                ? 'Try adjusting your search query or removing the constituency filter.'
                : 'No registered citizens match the specified criteria.'}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {citizens.map((citizen) => {
            const initials = (citizen.name || 'C')
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={citizen._id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div>
                  {/* Avatar & Citizen Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    {citizen.avatar ? (
                      <img
                        src={getImageUrl(citizen.avatar)}
                        alt={citizen.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                          color: 'var(--color-primary, #1D4ED8)',
                          fontWeight: 700,
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid rgba(29, 78, 216, 0.2)'
                        }}
                      >
                        {initials}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {citizen.name}
                        </span>
                        {citizen.isSuspended && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              backgroundColor: '#475569',
                              color: '#FFFFFF',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            Suspended
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <MapPin size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {citizen.constituency || 'Jurisdiction Verified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accountability Metrics Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                      backgroundColor: 'var(--bg-app, #F9FAFB)',
                      padding: '10px 8px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Karma
                      </div>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: (citizen.karma || 0) > 0 ? '#16A34A' : (citizen.karma || 0) < 0 ? '#DC2626' : 'var(--text-secondary)'
                        }}
                      >
                        {(citizen.karma || 0) > 0 ? `+${citizen.karma}` : citizen.karma || 0}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Filed
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {citizen.totalComplaints || 0}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Warnings
                      </div>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: (citizen.warningCount || 0) > 0 ? '#DC2626' : 'var(--text-secondary)'
                        }}
                      >
                        {citizen.warningCount || 0}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Suspended
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: (citizen.suspensionCount || 0) > 0 ? '#475569' : 'var(--text-secondary)' }}>
                        {citizen.suspensionCount || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Public Profile Button */}
                <Link
                  to={`/citizens/${citizen._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <span>View Public Profile</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
