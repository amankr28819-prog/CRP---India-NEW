import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  FileQuestion
} from 'lucide-react';
import BackButton from '../components/BackButton';

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      id: 1,
      question: "What is CRP India?",
      answer: "CRP India is a civic reporting platform that allows citizens to report local problems such as potholes, garbage, broken streetlights, water issues, and drainage problems and track their resolution."
    },
    {
      id: 2,
      question: "Who can use CRP India?",
      answer: "Any citizen can create an account and use the platform to report civic problems in their area. Municipal authorities can use the authority portal to manage and resolve complaints."
    },
    {
      id: 3,
      question: "How do I report a civic problem?",
      answer: "Log in to your Citizen account, select the issue category, enter the complaint details and location, provide the required GPS location, and submit the complaint."
    },
    {
      id: 4,
      question: "Is providing my location mandatory?",
      answer: "Yes. Location information is required when submitting a complaint so that the issue can be correctly identified and assigned to the appropriate local authority."
    },
    {
      id: 5,
      question: "Can I upload photos with my complaint?",
      answer: "Yes. You can upload photographs as evidence when reporting a problem. These photos help municipal officials understand and verify the issue."
    },
    {
      id: 6,
      question: "How can I track my complaint?",
      answer: "After submitting a complaint, you receive a unique Reference ID. Use this Reference ID on the Track Complaint page to view the current status and progress of your complaint."
    },
    {
      id: 7,
      question: "Can I see whether my complaint has been resolved?",
      answer: "Yes. You can track the complaint status through your Reference ID. When an authority resolves the issue, the resolution details and supporting resolution photograph, if uploaded by the authority, will be visible to the citizen."
    },
    {
      id: 8,
      question: "Who handles the complaints?",
      answer: "Complaints are routed to the appropriate municipal department or local authority based on the issue category and location."
    },
    {
      id: 9,
      question: "Do I have to pay to submit a complaint?",
      answer: "No. CRP India does not charge citizens a filing fee for submitting civic complaints."
    },
    {
      id: 10,
      question: "Is an account required to report an issue?",
      answer: "Yes. Citizens must be logged in to their account before submitting a complaint. This helps maintain complaint history and allows citizens to track their reports."
    },
    {
      id: 11,
      question: "What happens after I submit a complaint?",
      answer: "Your complaint is recorded with its details and location, assigned to the relevant municipal authority, and can then be tracked using your Reference ID."
    },
    {
      id: 12,
      question: "Can I edit my complaint after submitting it?",
      answer: "To maintain the accuracy and integrity of submitted complaints, complaint details should not be changed after submission. If there is an important issue with your complaint, contact the appropriate support channel."
    },
    {
      id: 13,
      question: "How does CRP India protect my information?",
      answer: "CRP India uses the information provided by citizens for account management, complaint processing, communication, and grievance resolution. Please read our Privacy Policy for more information."
    },
    {
      id: 14,
      question: "How can I contact CRP India?",
      answer: "You can contact CRP India through the support details provided in the footer, including the toll-free helpline and official email address."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const filteredFaqs = faqData.filter(faq => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ padding: '36px 0 64px 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <BackButton fallback="/" />

        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '12px'
            }}
          >
            <HelpCircle size={15} />
            <span>Help Center & Knowledge Base</span>
          </div>

          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '10px'
            }}
          >
            Frequently Asked Questions
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}
          >
            Find quick answers to common questions about CRP India.
          </p>

          {/* Quick Search */}
          <div style={{ position: 'relative', marginTop: '20px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="form-input"
              style={{ paddingLeft: '42px', height: '44px', fontSize: '0.9rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Accordion List Container */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '32px'
          }}
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id}
                  style={{
                    borderBottom: index < filteredFaqs.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      background: isOpen ? 'var(--bg-subtle)' : 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      gap: '16px',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isOpen) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: isOpen ? 'var(--color-primary)' : 'var(--text-muted)',
                          fontWeight: 700,
                          minWidth: '22px'
                        }}
                      >
                        {String(faq.id).padStart(2, '0')}.
                      </span>
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      size={18}
                      style={{
                        color: isOpen ? 'var(--color-primary)' : 'var(--text-muted)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '12px 20px 20px 54px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.925rem',
                        lineHeight: 1.65,
                        backgroundColor: 'var(--bg-subtle)',
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FileQuestion size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ fontWeight: 600, marginBottom: '6px' }}>No questions found matching "{searchQuery}"</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try searching with a different term or clear the filter.</p>
            </div>
          )}
        </div>

        {/* Still Have Questions Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Still have questions or need assistance?
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Our citizen grievance support team is ready to help. You can reach out through our official helpline or email support anytime.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '4px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)'
              }}
            >
              <Phone size={14} style={{ color: 'var(--color-primary)' }} />
              <span>Toll-Free: <strong>1800-11-2026</strong></span>
            </div>
            <a
              href="mailto:crpindianew@gmail.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                textDecoration: 'none'
              }}
            >
              <Mail size={14} />
              <span>crpindianew@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
