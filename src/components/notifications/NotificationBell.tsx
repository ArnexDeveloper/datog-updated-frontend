import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDrawer from './NotificationDrawer';

const NotificationBell = () => {
  const [bumping, setBumping] = useState(false);
  const buttonRef = useRef(null);
  const { counts, loading, bumpTick, drawerOpen, toggleDrawer, closeDrawer } = useNotifications() as any;

  // Bump the badge briefly whenever a genuinely new notification arrives
  useEffect(() => {
    if (!bumpTick) return;
    setBumping(true);
    const t = setTimeout(() => setBumping(false), 300);
    return () => clearTimeout(t);
  }, [bumpTick]);

  return (
    <div className="notifications">
      <button
        ref={buttonRef}
        onClick={toggleDrawer}
        className="notification-btn"
        disabled={loading}
        title="Notifications"
      >
        🔔
        {counts.totalUnread > 0 && (
          <span
            className="notification-badge"
            style={{ transform: bumping ? 'scale(1.4)' : 'scale(1)', transition: 'transform 0.2s ease' }}
          >
            {counts.totalUnread > 99 ? '99+' : counts.totalUnread}
          </span>
        )}
      </button>

      <NotificationDrawer isOpen={drawerOpen} onClose={closeDrawer} />
    </div>
  );
};

export default NotificationBell;
