import React, { useEffect, useRef, useState } from 'react';

export interface DropdownAction {
  key: string;
  label: string;
  icon: string;
  onClick: () => void;
  danger?: boolean;
  separatorBefore?: boolean;
}

interface OrderActionsDropdownProps {
  actions: DropdownAction[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const OrderActionsDropdown: React.FC<OrderActionsDropdownProps> = ({ actions, isOpen, onOpen, onClose }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openUpward, setOpenUpward] = useState(false);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setOpenUpward(rect.bottom + 200 > window.innerHeight);
    }
    isOpen ? onClose() : onOpen();
  };

  return (
    <div ref={wrapRef} className="actions-dropdown-wrap" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="actions-btn"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px',
          borderRadius: 6, border: '1px solid #e2e8f0', background: '#ffffff', color: '#374151',
          fontSize: 11, fontWeight: 500, cursor: 'pointer'
        }}
      >
        Actions ▾
      </button>

      {isOpen && (
        <div
          className="actions-dropdown"
          style={{
            position: 'absolute', right: 0,
            ...(openUpward ? { bottom: 'calc(100% + 4px)' } : { top: 'calc(100% + 4px)' }),
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 10000, minWidth: 160, overflow: 'hidden'
          }}
        >
          {actions.map(action => (
            <React.Fragment key={action.key}>
              {action.separatorBefore && (
                <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
              )}
              <div
                onClick={() => { action.onClick(); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  fontSize: 12, color: action.danger ? '#dc2626' : '#374151', cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = action.danger ? '#fff1f2' : '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderActionsDropdown;
