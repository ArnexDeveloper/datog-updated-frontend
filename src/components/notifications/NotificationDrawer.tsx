import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDrawerItem from './NotificationDrawerItem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TABS: Array<{ key: 'all' | 'orders' | 'customers' | 'alerts'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'customers', label: 'Customers' },
  { key: 'alerts', label: 'Alerts' },
];

export default function NotificationDrawer({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const {
    counts,
    loading,
    filter,
    setFilter,
    drawerNotifications,
    drawerTabCounts,
    actions: { markAsRead, markAllAsRead },
  } = useNotifications() as any;

  const handleMarkRead = (id: string) => markAsRead([id]);

  const handleMarkAllRead = () => {
    if (counts.totalUnread === 0) return;
    markAllAsRead();
  };

  const handleViewAll = () => {
    navigate('/notifications');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.28)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.28s ease',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 310,
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.10)',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, color: '#c9900a' }}>🔔</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Notifications</span>
          {counts.totalUnread > 0 && (
            <span style={{
              background: '#dc2626', color: '#fff', fontSize: 10.5, fontWeight: 700,
              borderRadius: 999, padding: '2px 8px',
            }}>
              {counts.totalUnread} new
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            style={{
              marginLeft: 'auto', width: 26, height: 26, borderRadius: 6,
              border: 'none', background: '#f1f5f9',
              cursor: 'pointer', fontSize: 13, color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          {TABS.map(tab => {
            const active = filter === tab.key;
            const count = drawerTabCounts?.[tab.key] ?? 0;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: active ? '#0f172a' : '#94a3b8',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid #c9900a' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {loading && drawerNotifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
              Loading…
            </div>
          ) : drawerNotifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>🔔</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                All caught up!
              </div>
              <div style={{ fontSize: 11 }}>No notifications in this category</div>
            </div>
          ) : (
            drawerNotifications.map((n: any) => (
              <NotificationDrawerItem
                key={n._id}
                notification={n}
                onMarkRead={handleMarkRead}
                onClose={onClose}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderTop: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={counts.totalUnread === 0}
            style={{
              border: 'none', background: 'transparent', cursor: counts.totalUnread === 0 ? 'default' : 'pointer',
              fontSize: 11.5, fontWeight: 600,
              color: counts.totalUnread === 0 ? '#cbd5e1' : '#2563eb',
              padding: 0,
            }}
          >
            Mark all as read
          </button>
          <button
            type="button"
            onClick={handleViewAll}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 11.5, fontWeight: 500, color: '#64748b', padding: 0,
            }}
          >
            View all →
          </button>
        </div>
      </div>
    </>
  );
}
