import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const dismissTimerRef = useRef(null);
  const exitTimerRef = useRef(null);

  const hideToast = useCallback(() => {
    setIsExiting(true);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setToast(null);
      setIsExiting(false);
    }, 240);
  }, []);

  const showToast = useCallback(({ title, message, type = 'success', duration = 3500 }) => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

    setIsExiting(false);
    setToast({
      id: Date.now(),
      title,
      message,
      type,
      duration
    });

    dismissTimerRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className={`crp-toast ${isExiting ? 'is-exiting' : ''}`}>
            <div className="toast-icon-badge">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={hideToast}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
            <div
              className="toast-progress-bar"
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
