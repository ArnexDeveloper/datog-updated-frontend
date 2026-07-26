import React, { useEffect, useRef, useState } from 'react';
import { getTypeConfig } from '../../constants/notificationConfig';
import type { ToastData } from '../../hooks/useToasts';

interface Props {
  toast: ToastData;
  onRemove: (id: string) => void;
  onOpenDrawer: (referenceType?: string, referenceId?: string) => void;
}

export default function Toast({ toast, onRemove, onOpenDrawer }: Props) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(toast.duration);
  const pausedRef = useRef(false);

  const meta = getTypeConfig(toast.type);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 320);
  }, [onRemove, toast.id]);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const tick = () => {
      if (!pausedRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const left = Math.max(0, remainingRef.current - elapsed);
        setProgress((left / toast.duration) * 100);
        if (left <= 0) {
          handleClose();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseEnter = () => {
    if (pausedRef.current) return;
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current));
    pausedRef.current = true;
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    pausedRef.current = false;
  };

  const handleBodyClick = () => {
    onOpenDrawer(toast.referenceType, toast.referenceId);
    handleClose();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: 295,
        background: '#ffffff',
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
        borderLeft: `4px solid ${meta.color}`,
        overflow: 'hidden',
        transform: visible ? 'translateX(0)' : 'translateX(340px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease',
        pointerEvents: 'all',
      }}
    >
      <div onClick={handleBodyClick} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 12px 8px', cursor: 'pointer' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: meta.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, flexShrink: 0,
        }}>
          {meta.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: meta.color, marginBottom: 3,
          }}>
            {meta.tag}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {toast.title}
          </div>
          {toast.message && (
            <div style={{
              fontSize: 10, color: '#64748b',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {toast.message}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          aria-label="Dismiss"
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            color: '#94a3b8', fontSize: 14, lineHeight: 1, padding: 2, flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ height: 3, background: '#f1f5f9' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(to right, ${meta.color}, ${meta.color}88)`,
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
}
