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
  ShieldCheck
} from 'lucide-react';

export const CATEGORIES = [
  {
    name: 'Roads & Potholes',
    slug: 'roads-potholes',
    icon: AlertTriangle,
    description: 'Potholes, broken pavement, surface craters, uneven asphalt, missing manhole covers on roadways.'
  },
  {
    name: 'Garbage & Sanitation',
    slug: 'garbage-sanitation',
    icon: Trash2,
    description: 'Uncollected community dumpsters, dead animal removal, commercial waste dumping, street sweeping.'
  },
  {
    name: 'Streetlights',
    slug: 'streetlights',
    icon: Lightbulb,
    description: 'Non-functional street lamps, flickering fixtures, exposed electrical cables, timing controller faults.'
  },
  {
    name: 'Water Supply',
    slug: 'water-supply',
    icon: Droplet,
    description: 'Contaminated tap water supply, low supply pressure, mainline pipeline leakage, erratic timing.'
  },
  {
    name: 'Drainage',
    slug: 'drainage',
    icon: Dam,
    description: 'Clogged stormwater drains, overflowing domestic sewer lines, waterlogging during light rainfall.'
  },
  {
    name: 'Public Spaces',
    slug: 'public-spaces',
    icon: Trees,
    description: 'Damaged municipal park equipment, illegal hoarding, broken footpath pavers, neglected public grounds.'
  },
  {
    name: 'Other Issues',
    slug: 'other-issues',
    icon: HelpCircle,
    description: 'Civic encroachment, noise violations beyond permissible hours, unattended public hazards.'
  }
];

export default function CategorySelect() {
  const navigate = useNavigate();

  const handleSelect = (slug) => {
    // Immediately navigate to complaint form without intermediate button
    navigate(`/report/${slug}`);
  };

  return (
    <div className="container" style={{ padding: '36px 20px 64px 20px' }}>
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Report a Civic Grievance</h1>
        <p className="page-subtitle">
          Select the category that best describes the civic issue in your locality.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
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
                padding: '22px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 600, marginTop: '16px' }}>
                <span>File report under this category</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassurance Banner */}
      <div style={{ marginTop: '36px', padding: '16px 20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldCheck size={20} style={{ color: 'var(--color-accent-green)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          All complaints are logged on the public municipal ledger and assigned a verifiable tracking reference ID upon submission.
        </div>
      </div>
    </div>
  );
}