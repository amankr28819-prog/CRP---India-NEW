import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

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
    }, 220);
  }, []);

  const showToast = useCallback((arg, maybeType = 'success', duration = 3500) => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

    let message = '';
    let title = '';
    let type = 'success';
    let dur = 3500;

    if (typeof arg === 'string') {
      message = arg;
      if (typeof maybeType === 'string') {
        type = maybeType;
      }
      if (typeof maybeType === 'number') {
        dur = maybeType;
      } else if (typeof duration === 'number') {
        dur = duration;
      }
    } else if (arg && typeof arg === 'object') {
      message = arg.message || '';
      title = arg.title || '';
      type = arg.type || 'success';
      dur = arg.duration || 3500;
    }

    setIsExiting(false);
    setToast({
      id: Date.now(),
      title,
      message,
      type,
      duration: dur
    });

    dismissTimerRef.current = setTimeout(() => {
      hideToast();
    }, dur);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className={`crp-toast crp-toast--${toast.type} ${isExiting ? 'is-exiting' : ''}`}>
            <div className="toast-icon-badge">
              {toast.type === 'error' ? (
                <AlertCircle size={18} strokeWidth={2.5} />
              ) : toast.type === 'warning' ? (
                <AlertTriangle size={18} strokeWidth={2.5} />
              ) : toast.type === 'info' ? (
                <Info size={18} strokeWidth={2.5} />
              ) : (
                <CheckCircle2 size={18} strokeWidth={2.5} />
              )}
            </div>
            <div className="toast-content">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={hideToast}
              aria-label="Dismiss notification"
            >
              <X size={15} />
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
