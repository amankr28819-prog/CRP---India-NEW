import React, { useState } from 'react';
import {
  HelpCircle,
  PhoneCall,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  ExternalLink,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SupportView() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqs = [
    {
      q: 'How quickly are civic complaints resolved by municipal authorities?',
      a: 'Turnaround times vary by department and urgency: Emergency hazards (major water mains, fallen power lines, deep arterial potholes) are attended to within 24 to 48 hours. Routine sanitation, garbage clearing, and streetlighting are typically redressed within 3 to 7 working days.'
    },
    {
      q: 'What should I do if my complaint is marked as "Rejected"?',
      a: 'If a complaint is marked as Rejected, check the remarks provided by the inspecting officer. Rejections typically occur when an issue falls outside municipal jurisdiction (e.g. private residential property) or duplicate complaints already exist. You can submit a new grievance with additional landmarks and photos if required.'
    },
    {
      q: 'Can I edit or update a complaint once it has been submitted?',
      a: 'To maintain official audit integrity, submitted grievance details (title, description, GPS coordinates) cannot be edited after assignment. However, you can track the status live and communicate with municipal officers via follow-up comments on the grievance tracking page.'
    },
    {
      q: 'Is my personal information or Voter ID visible to other citizens?',
      a: 'No. Your phone number, email address, and dummy Voter ID are protected under CRP India data confidentiality guidelines. Only designated municipal nodal officers assigned to your ward can verify your contact info for on-site inspection inquiries.'
    },
    {
      q: 'How do I escalate an unresolved complaint exceeding the standard SLA?',
      a: 'If your grievance remains pending beyond 14 working days without active municipal updates, you can contact the Chief Municipal Grievance Officer via the toll-free helpline at 1800-11-2026 or email crpindianew@gmail.com citing your Reference ID.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Help & Citizen Support
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Official government helplines, reporting instructions, and frequently asked questions.
        </p>
      </div>

      {/* Official Helplines Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* Toll-free card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent-blue-bg, #DBEAFE)',
              color: 'var(--color-primary, #1E40AF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <PhoneCall size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              National Civic Helpline
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 4px 0' }}>
              1800-11-2026
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Toll-Free • 24x7 Multi-lingual Assistance
            </div>
          </div>
        </div>

        {/* Email card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
              color: 'var(--color-accent-green, #15803D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Mail size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Official Grievance Desk
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 4px 0', wordBreak: 'break-all' }}>
              crpindianew@gmail.com
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Expected response within 24 working hours
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Grievance Lifecycle Guide */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Civic Complaint Redressal Process
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
          How your complaint moves from citizen submission to on-ground municipal rectification.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                1
              </span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Lodge Report</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Submit high-resolution photo evidence, landmark details, and accurate device GPS coordinates.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                2
              </span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Nodal Routing</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Automated category routing assigns your grievance to the designated municipal zone and ward engineer.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                3
              </span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Field Repair</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              Municipal maintenance crew inspects the site, executes repairs, and logs timestamped milestone remarks.
            </p>
          </div>

          <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-accent-green, #15803D)', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                4
              </span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Proof & Close</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              The officer must upload a verifiable after-photo to mark the issue as officially Resolved.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <FileQuestion size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Frequently Asked Questions
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
          Quick answers regarding grievance filing, tracking, and municipal procedures.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: isOpen ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {faq.q}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
