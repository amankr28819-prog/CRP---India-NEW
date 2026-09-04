import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Eye,
  Sliders,
  CheckCircle2,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export default function SettingsView() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [emailUpdates, setEmailUpdates] = useState(
    user?.settings?.notifications?.emailUpdates ?? true
  );
  const [complaintStatusAlerts, setComplaintStatusAlerts] = useState(
    user?.settings?.notifications?.complaintStatus ?? true
  );
  const [reducedMotion, setReducedMotion] = useState(
    user?.settings?.accessibility?.reducedMotion ?? false
  );
  const [highContrast, setHighContrast] = useState(
    user?.settings?.accessibility?.highContrast ?? false
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
      await api.updateSettings({ theme: newTheme });
      updateUser((prev) => ({
        ...prev,
        settings: { ...prev?.settings, theme: newTheme }
      }));
    } catch {
      // theme context already updated locally
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        theme,
        notifications: {
          emailUpdates,
          complaintStatus: complaintStatusAlerts
        },
        accessibility: {
          reducedMotion,
          highContrast
        }
      };

      const res = await api.updateSettings(payload);
      if (res.success && res.settings) {
        updateUser((prev) => ({
          ...prev,
          settings: res.settings
        }));
        showToast('Account preferences saved successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Account Preferences & Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Personalize your appearance theme, notification alerts, and accessibility options.
        </p>
      </div>

      {/* Theme Preferences */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Display Theme
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 18px 0' }}>
          Choose how CRP India appears to you on your devices.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              border: theme === 'light' ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              backgroundColor: theme === 'light' ? 'var(--color-primary-light, #EFF6FF)' : 'var(--bg-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              textAlign: 'left'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#D97706',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Sun size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                Light Mode
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Clean daytime civic look
              </div>
            </div>
            {theme === 'light' && <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />}
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              border: theme === 'dark' ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              backgroundColor: theme === 'dark' ? 'rgba(30, 64, 175, 0.15)' : 'var(--bg-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              textAlign: 'left'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#0F172A',
                color: '#60A5FA',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Moon size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Dark Mode
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Reduced glare for evening use
              </div>
            </div>
            {theme === 'dark' && <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Bell size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Notification Preferences
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 18px 0' }}>
          Configure how you receive grievance status alerts and announcements.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Updates */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Email Milestone Updates
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Receive emails when your complaint is assigned or officially resolved
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailUpdates}
              onChange={(e) => setEmailUpdates(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </label>

          {/* In-app alerts */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Complaint Status Alerts
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Display real-time notification badges in your header and account dropdown
              </div>
            </div>
            <input
              type="checkbox"
              checked={complaintStatusAlerts}
              onChange={(e) => setComplaintStatusAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </label>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sliders size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Accessibility Options
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 18px 0' }}>
          Assistive UI settings designed for high legibility and comfort.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Reduced Motion */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Reduced Motion
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Minimize animations and slide transitions across portal views
              </div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </label>

          {/* High Contrast */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                High Contrast Elements
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Sharpen border outlines and text contrast for enhanced visual clarity
              </div>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="btn btn-primary"
          style={{ minWidth: '160px', gap: '8px' }}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Preferences...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
