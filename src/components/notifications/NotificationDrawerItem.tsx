import React from 'react';
import { useNavigate } from 'react-router-dom';
import { timeAgo } from '../../utils/timeAgo';
import { getTypeConfig } from '../../constants/notificationConfig';

export interface DrawerNotification {
  _id: string;
  type: string;
  title: string;
  message?: string;
  isRead?: boolean;
  isUrgent?: boolean;
  referenceType?: 'order' | 'customer' | 'invoice';
  referenceId?: string;
  createdAt?: string;
  data?: { order?: { _id?: string }; customer?: { _id?: string }; invoice?: { _id?: string } };
}

interface Props {
  notification: DrawerNotification;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export default function NotificationDrawerItem({ notification, onMarkRead, onClose }: Props) {
  const navigate = useNavigate();
  const meta = getTypeConfig(notification.type);
  const unread = !notification.isRead;

  const handleClick = () => {
    if (unread) onMarkRead(notification._id);

    const refType = notification.referenceType || (notification.data?.order ? 'order' : notification.data?.customer ? 'customer' : notification.data?.invoice ? 'invoice' : undefined);
    const refId = notification.referenceId || notification.data?.order?._id || notification.data?.customer?._id || notification.data?.invoice?._id;

    if (refType && refId) {
      const path = refType === 'order' ? `/orders/${refId}` : refType === 'customer' ? `/customers/${refId}` : `/invoices/${refId}`;
      navigate(path);
    }
    onClose();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '12px 14px',
        borderLeft: `3px solid ${meta.color}`,
        borderBottom: '1px solid #f1f5f9',
        background: unread ? '#fafbff' : '#ffffff',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
      onMouseLeave={e => { e.currentTarget.style.background = unread ? '#fafbff' : '#ffffff'; }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: meta.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}>
              {notification.title}
            </span>
            {unread && (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 4 }} />
            )}
          </div>
          {notification.message && (
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>
              {notification.message}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
            <span style={{ fontSize: 10.5, color: '#94a3b8' }}>{timeAgo(notification.createdAt)}</span>
            {notification.type === 'delivery_overdue' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#fff1f2', border: '1px solid #fecdd3',
                borderRadius: 20, padding: '2px 8px',
                fontSize: 10, fontWeight: 600, color: '#dc2626',
              }}>
                ⚠ Urgent — act now
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
