import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import crpLogo from '../assets/crp-logo-transparent.png';
import crpInfrastructure from '../assets/crpInfrastructure.jpg';


export default function RoleSelection() {
  const navigate = useNavigate();
  const { selectPortal, isAuthority, isAuthenticated, requestPortalSwitch } = useAuth();
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [isCitizenHovered, setIsCitizenHovered] = React.useState(false);
  const [isAuthorityHovered, setIsAuthorityHovered] = React.useState(false);
  const [isHeadingHovered, setIsHeadingHovered] = React.useState(false);

  const handleSelectRole = (role) => {
    if (role === 'citizen') {
      if (isAuthenticated && isAuthority) {
        requestPortalSwitch();
        return;
      }
      selectPortal('citizen');
      navigate('/home');
    } else {
      selectPortal(role);
      if (isAuthenticated && isAuthority) {
        navigate('/authority/dashboard');
      } else {
        navigate('/authority/login');
      }
    }
  };

  const boxStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'all 0.25s ease',
};

const boxHover = (e) => {
  e.currentTarget.style.backgroundColor = isLightMode
    ? 'rgba(255, 255, 255, 0.95)'
    : 'rgba(15, 23, 42, 0.95)';

  e.currentTarget.style.borderColor = isLightMode
    ? 'rgba(0, 0, 0, 0.15)'
    : 'rgba(255, 255, 255, 0.2)';

  e.currentTarget.style.boxShadow =
    '0 12px 35px rgba(0, 0, 0, 0.25)';
};

const boxLeave = (e) => {
  e.currentTarget.style.backgroundColor =
    'rgba(255, 255, 255, 0.08)';

  e.currentTarget.style.borderColor =
    'rgba(255, 255, 255, 0.18)';

  e.currentTarget.style.boxShadow = 'none';
};

  return (
    <div
      className="role-selection-wrapper"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background layer with bleed to eliminate internal image border margins */}
      <div
        className="role-selection-bg"
        style={{
          position: 'absolute',
          top: '-40px',
          bottom: '-40px',
          left: '-40px',
          right: '-40px',
          backgroundImage: `
            linear-gradient(
              rgba(0, 0, 0, 0.45),
              rgba(0, 0, 0, 0.45)
            ),
            url(${crpInfrastructure})
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', maxWidth: '680px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* CRP Logo */}
<div
  style={{
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  }}
>
  <img
  src={crpLogo}
  alt="CRP India"
  style={{
    width: '300px',
    height: '180px',
    objectFit: 'contain',
    marginBottom: '16px'
  }}
/>
  
</div>

{/* Government Gateway Label */}
<div
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: '20px',
    border: '1px solid var(--border-subtle)',
    marginBottom: '24px',
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)'
  }}
>
  <ShieldCheck
    size={15}
    style={{ color: 'var(--color-accent-green)' }}
  />
  <span>
    Official Civic Grievance & Municipal Resolution Gateway
  </span>
</div>

    {/* Page heading */}
<div
  onMouseEnter={() => setIsHeadingHovered(true)}
  onMouseLeave={() => setIsHeadingHovered(false)}
 style={{
    backgroundColor: 'transparent',

  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',

    border: 'none',

    borderRadius: '16px',
    padding: '18px 32px',
    marginTop: '18px',
    marginBottom: '28px',
    textAlign: 'center',

   boxShadow: 'none',

    transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
}}
>
  <h1
    style={{
      margin: 0,
      color: '#FDBA74',
      fontSize: '40px',
      fontWeight: '700',
      lineHeight: '1.2',
    }}
  >
    CRP India
  </h1>

  <p
    style={{
      margin: '10px 0 0',
     color: '#A3E635',
      fontSize: '20px',
      fontWeight: '400',
    }}
  >
    How would you like to continue?
  </p>
  </div>
        {/* Two clean, professional options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', textAlign: 'left' }}>
          {/* Option 1: Citizen */}
          <div
            
  onClick={() => handleSelectRole('citizen')}
  onMouseEnter={() => setIsCitizenHovered(true)}
  onMouseLeave={() => setIsCitizenHovered(false)}
  style={{
    backgroundColor: isCitizenHovered
  ? (isLightMode
      ? 'rgba(255, 255, 255, 0.35)'
      : 'rgba(15, 23, 42, 0.35)')
  : 'rgba(15, 23, 42, 0.05)',

    backdropFilter: isCitizenHovered ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: isCitizenHovered ? 'blur(12px)' : 'none',

    border: 'none',

    borderRadius: '8px',
    padding: '28px 24px',
    cursor: 'pointer',

    transition:
      'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease',

    boxShadow: isCitizenHovered
      ? '0 8px 30px rgba(0, 0, 0, 0.25)'
      : '0 4px 20px rgba(0, 0, 0, 0.10)',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}
             
            
            
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}
              >
                <Users size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: isLightMode ? '#111827' : '#ffffff', marginBottom: '8px' }}>
                Citizen
              </h2>
              <p style={{ fontSize: '0.9rem', color: isLightMode ? '#374151' : '#d1d5db', lineHeight: 1.5 }}>
                Report and track civic issues in your area.
              </p>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '6px',color: '#3B82F6', fontWeight: 600, fontSize: '0.875rem' }}>
              <span>Enter Citizen Portal</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Option 2: Municipal Authority */}
          <div
            onClick={() => handleSelectRole('authority')}
            style={{
            backgroundColor: isAuthorityHovered
                  ? (isLightMode ? 'rgba(255, 255, 255, 0.35)' : 'rgba(15, 23, 42, 0.35)')
                  : 'rgba(15, 23, 42, 0.05)',

              backdropFilter: isAuthorityHovered ? 'blur(12px)' : 'none',
              WebkitBackdropFilter: isAuthorityHovered ? 'blur(12px)' : 'none',
            border: 'none',
              borderRadius: '8px',
              padding: '28px 24px',
              cursor: 'pointer',
            transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease',
            boxShadow: isAuthorityHovered
            ? '0 8px 30px rgba(0, 0, 0, 0.25)'
            : '0 4px 20px rgba(0, 0, 0, 0.10)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={() => setIsAuthorityHovered(true)}
            onMouseLeave={() => setIsAuthorityHovered(false)}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}
              >
                <Building2 size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: isLightMode ? '#111827' : '#ffffff', marginBottom: '8px' }}>
                Municipal Authority
              </h2>
              <p style={{ fontSize: '0.9rem', color: isLightMode ? '#374151' : '#d1d5db', lineHeight: 1.5 }}>
                Manage complaints and coordinate civic resolution.
              </p>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '6px',color: '#3B82F6', fontWeight: 600, fontSize: '0.875rem' }}>
              <span>Access Authority Portal</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* Security & Verification Notice */}
        <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.85)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-accent-green)' }} />
          <span>Secure SSL Encrypted • Direct municipal integration • Public Service Oversight</span>
        </div>
      </div>
    </div>
  );
}