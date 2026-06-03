import React, { useState, useEffect, useCallback, useRef } from 'react';

export type ToastType = 'trial' | 'urgent' | 'warning' | 'lowstock' | 'info';

export interface ToastNotification {
  id: string;
  type: ToastType;
  icon: string;
  title: string;
  message: string;
  duration?: number;
}

const DEFAULT_DURATION = 7000;
const MAX_VISIBLE = 5;
const STAGGER_MS = 1100;

interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);
  const dur = toast.duration ?? DEFAULT_DURATION;
  const dismissedRef = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 320);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const pct = Math.max(0, 100 - ((now - start) / dur) * 100);
      setProgress(pct);
      if (pct > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        dismiss();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dur, dismiss]);

  return (
    <div className={`dash-toast dash-toast--${toast.type}${exiting ? ' dash-toast--exit' : ''}`}>
      <span className="dash-toast__icon">{toast.icon}</span>
      <div className="dash-toast__body">
        <strong className="dash-toast__title">{toast.title}</strong>
        <span className="dash-toast__msg">{toast.message}</span>
      </div>
      <button className="dash-toast__close" onClick={dismiss} aria-label="Dismiss notification">
        ×
      </button>
      <span className="dash-toast__bar" style={{ width: `${progress}%` }} />
    </div>
  );
};

interface DashboardToastsProps {
  notifications: ToastNotification[];
}

const DashboardToasts: React.FC<DashboardToastsProps> = ({ notifications }) => {
  const [visible, setVisible] = useState<ToastNotification[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (notifications.length === 0 || initialized.current) return;
    initialized.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];

    notifications.forEach((n, i) => {
      const t = setTimeout(() => {
        setVisible(prev => (prev.length < MAX_VISIBLE ? [...prev, n] : prev));
      }, i * STAGGER_MS);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  const dismiss = useCallback((id: string) => {
    setVisible(prev => prev.filter(t => t.id !== id));
  }, []);

  if (visible.length === 0) return null;

  return (
    <div className="dash-toasts" role="region" aria-label="Notifications">
      {visible.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
};

export default DashboardToasts;
