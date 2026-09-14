import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

export interface StatusMeta {
  label: string;
  bg: string;
  color: string;
  emoji: string;
}

export const ORDER_STATUS_META: Record<string, StatusMeta> = {
  pending:       { label: 'Pending',       bg: '#fef9c3', color: '#713f12', emoji: '⏳' },
  in_progress:   { label: 'In Progress',   bg: '#dbeafe', color: '#1e3a8a', emoji: '🔵' },
  trial_pending: { label: 'Trial Pending', bg: '#ede9fe', color: '#4c1d95', emoji: '📅' },
  ready:         { label: 'Ready',         bg: '#dcfce7', color: '#14532d', emoji: '✅' },
  delivered:     { label: 'Delivered',     bg: '#f1f5f9', color: '#334155', emoji: '📦' },
  cancelled:     { label: 'Cancelled',     bg: '#ffe4e6', color: '#881337', emoji: '❌' },
};

export const ORDER_STATUS_KEYS = Object.keys(ORDER_STATUS_META);

interface OrderStatusPillProps {
  status: string;
  count?: number;
  disabled?: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (status: string) => void;
}

interface MenuPosition {
  top: number;
  bottom: number;
  left: number;
  openUpward: boolean;
}

// Compact status pill (soft fill + emoji + count badge) that replaces the old
// plain <select> — still opens a small menu on click to change status inline.
const OrderStatusPill: React.FC<OrderStatusPillProps> = ({ status, count, disabled, isOpen, onOpen, onClose, onChange }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const meta = ORDER_STATUS_META[status] || { label: status, bg: '#f1f5f9', color: '#334155', emoji: '•' };

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const openUpward = rect.bottom + 260 > window.innerHeight;
    setPosition({
      top: rect.bottom + 4,
      bottom: window.innerHeight - rect.top + 4,
      left: rect.left,
      openUpward
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) updatePosition();
    isOpen ? onClose() : onOpen();
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 0, border: 'none',
          borderRadius: 9999, background: meta.bg, color: meta.color,
          fontSize: 12, fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.6 : 1, padding: 0, overflow: 'hidden'
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px' }}>
          <span>{meta.emoji}</span>
          <span>{meta.label}</span>
        </span>
        {typeof count === 'number' && (
          <span style={{
            background: 'rgba(0,0,0,0.18)', color: 'inherit', fontSize: 11, fontWeight: 700,
            padding: '5px 8px', minWidth: 20, textAlign: 'center'
          }}>
            {count}
          </span>
        )}
      </button>

      {isOpen && position && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            ...(position.openUpward ? { bottom: position.bottom } : { top: position.top }),
            left: position.left,
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 10000, minWidth: 170, overflow: 'hidden'
          }}
        >
          {ORDER_STATUS_KEYS.map(key => {
            const m = ORDER_STATUS_META[key];
            return (
              <div
                key={key}
                onClick={() => { onClose(); if (key !== status) onChange(key); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  fontSize: 12.5, color: '#374151', cursor: 'pointer',
                  background: key === status ? '#f8fafc' : 'transparent'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = key === status ? '#f8fafc' : 'transparent'; }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px',
                  borderRadius: 9999, background: m.bg, color: m.color, fontWeight: 600, fontSize: 11.5
                }}>
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </span>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};

export default OrderStatusPill;
