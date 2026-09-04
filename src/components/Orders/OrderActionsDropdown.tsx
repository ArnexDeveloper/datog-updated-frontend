import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

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

interface MenuPosition {
  top: number;
  bottom: number;
  right: number;
  openUpward: boolean;
}

const OrderActionsDropdown: React.FC<OrderActionsDropdownProps> = ({ actions, isOpen, onOpen, onClose }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const openUpward = rect.bottom + 200 > window.innerHeight;
    setPosition({
      top: rect.bottom + 4,
      bottom: window.innerHeight - rect.top + 4,
      right: window.innerWidth - rect.right,
      openUpward
    });
  };

  // Close on outside click — the menu is portaled to document.body, so it's
  // outside wrapRef; check both it and the menu itself before closing.
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

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Reposition on scroll (capture phase catches scroll on any nested scroll
  // container, e.g. the table's horizontal-scroll wrapper) and on resize.
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
    if (!isOpen) updatePosition();
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

      {isOpen && position && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="actions-dropdown"
          style={{
            position: 'fixed',
            ...(position.openUpward ? { bottom: position.bottom } : { top: position.top }),
            right: position.right,
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default OrderActionsDropdown;
