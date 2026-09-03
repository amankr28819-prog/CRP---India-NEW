import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Trash2,
  Lightbulb,
  Droplet,
  Dam,
  Trees,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export const CATEGORIES = [
  {
    name: 'Roads & Potholes',
    slug: 'roads-potholes',
    icon: AlertTriangle,
    description: 'Potholes, broken roads, damaged pavements, and missing manhole covers.'
  },
  {
    name: 'Garbage & Sanitation',
    slug: 'garbage-sanitation',
    icon: Trash2,
    description: 'Overflowing dumpsters, uncollected trash, and dirty streets.'
  },
  {
    name: 'Streetlights',
    slug: 'streetlights',
    icon: Lightbulb,
    description: 'Broken streetlights, flickering lamps, and exposed wires.'
  },
  {
    name: 'Water Supply',
    slug: 'water-supply',
    icon: Droplet,
    description: 'Dirty water, burst pipelines, and low water pressure.'
  },
  {
    name: 'Drainage',
    slug: 'drainage',
    icon: Dam,
    description: 'Clogged drains, overflowing sewers, and flooded roads.'
  },
  {
    name: 'Public Spaces',
    slug: 'public-spaces',
    icon: Trees,
    description: 'Damaged park benches, broken play equipment, and neglected grounds.'
  },
  {
    name: 'Other Issues',
    slug: 'other-issues',
    icon: HelpCircle,
    description: 'Encroachment, noise nuisance, and other local hazards.'
  }
];

export default function CategorySelect() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSelect = (slug) => {
    navigate(`/report/${slug}`);
  };

  return (
    <div className="container" style={{ padding: '32px 20px 56px 20px' }}>
      {/* Back Button */}
      <button
        type="button"
        onClick={handleBack}
        className="btn btn-secondary btn-sm"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
        aria-label="Back to previous page"
      >
        <ArrowLeft size={15} />
        <span>Back</span>
      </button>

      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Report an Issue</h1>
        <p className="page-subtitle">
          Choose the category that matches your problem:
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.slug}
              onClick={() => handleSelect(cat.slug)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '130px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cat.name}
                  </h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {cat.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 600, marginTop: '14px' }}>
                <span>Report this issue</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassurance Banner */}
      <div style={{ marginTop: '28px', padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldCheck size={18} style={{ color: 'var(--color-accent-green)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          You will receive a unique Reference ID after submitting to track progress at any time.
        </div>
      </div>
    </div>
  );
}