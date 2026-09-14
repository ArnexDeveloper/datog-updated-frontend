import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiService } from '../../services/api';
import RecordPaymentModal from '../Orders/RecordPaymentModal';

// ── Type -> display metadata (bucket, emoji, colors) ───────────────────────
// Backend notification `type` strings map onto the panel's 7 recognized
// kinds. Any other backend type (system_alert, low_stock_alert, etc.) is
// filtered out of this panel entirely — it's covered by NotificationsPage.

type Bucket = 'orders' | 'payments' | 'reminders';

interface TypeMeta {
  bucket: Bucket;
  emoji: string;
  bg: string;
  tagColor: string;
  label: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  delivery_overdue:  { bucket: 'orders',    emoji: '⏳', bg: '#fef3c7', tagColor: '#92400e', label: 'Order overdue' },
  payment_pending:   { bucket: 'payments',  emoji: '💰', bg: '#fee2e2', tagColor: '#991b1b', label: 'Payment pending' },
  birthday_wish:     { bucket: 'reminders', emoji: '🎂', bg: '#fce7f3', tagColor: '#9d174d', label: 'Birthday' },
  anniversary_wish:  { bucket: 'reminders', emoji: '💍', bg: '#f0fdf4', tagColor: '#065f46', label: 'Anniversary' },
  trial_reminder:    { bucket: 'orders',    emoji: '📅', bg: '#ede9fe', tagColor: '#5b21b6', label: 'Trial scheduled' },
  order_ready:       { bucket: 'orders',    emoji: '✅', bg: '#f0fdf4', tagColor: '#15803d', label: 'Order ready' },
  payment_received:  { bucket: 'payments',  emoji: '💳', bg: '#f0fdf4', tagColor: '#15803d', label: 'Payment received' },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'trial_pending', label: 'Trial Pending' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const FILTER_TABS: { key: 'all' | Bucket; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'payments', label: 'Payments' },
  { key: 'reminders', label: 'Reminders' },
];

const timeAgo = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const waLink = (phone: string, text: string) => {
  const digits = (phone || '').replace(/\D/g, '');
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(text)}`;
};

const NotificationFab: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, counts, actions } = useNotifications() as any;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | Bucket>('all');
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unread = counts?.totalUnread || 0;

  // Close on outside click (both panel and FAB live in this same wrapper)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setStatusDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  };

  const relevant = (notifications || []).filter((n: any) => TYPE_META[n.type]);
  const filtered = tab === 'all' ? relevant : relevant.filter((n: any) => TYPE_META[n.type]?.bucket === tab);

  const closeAfterNavigate = (path: string) => {
    setTimeout(() => setOpen(false), 300);
    navigate(path);
  };

  const handleRowClick = (n: any) => {
    if (!n.isRead) actions.markAsRead([n._id]);
    if (n.referenceType === 'order' && n.referenceId) closeAfterNavigate(`/orders/${n.referenceId}`);
    else if (n.referenceType === 'customer') closeAfterNavigate('/customers');
    else setOpen(false);
  };

  const handleUpdateStatus = async (n: any, status: string) => {
    try {
      await apiService.updateOrderStatus(n.referenceId, status);
      await actions.markAsRead([n._id]);
      setStatusDropdownId(null);
      showToast('Status updated ✓');
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  const handleConfirmTrial = async (n: any) => {
    try {
      await apiService.updateOrderStatus(n.referenceId, 'trial_pending');
      await actions.markAsRead([n._id]);
      showToast('Trial confirmed ✓');
    } catch (err) {
      showToast('Failed to confirm trial');
    }
  };

  const handleRecordPayment = async (n: any) => {
    try {
      const res = await apiService.getOrder(n.referenceId);
      const order = res.data?.data;
      if (!order) return;
      setPaymentModalOrder({
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        payment: order.payment,
        notificationId: n._id,
      });
    } catch (err) {
      showToast('Failed to open order');
    }
  };

  const handleWhatsApp = (n: any, text: string) => {
    window.open(waLink(n.customerPhone, text), '_blank');
    if (!n.isRead) actions.markAsRead([n._id]);
  };

  const handleViewOrder = (n: any) => {
    if (!n.isRead) actions.markAsRead([n._id]);
    setOpen(false);
    navigate(`/orders/${n.referenceId}`);
  };

  const renderQuickAction = (n: any) => {
    const meta = TYPE_META[n.type];
    const baseStyle = (border: string, color: string, bg: string, hoverBg: string): React.CSSProperties & Record<string, any> => ({
      display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5, padding: '3px 10px',
      borderRadius: 20, fontSize: 10, fontWeight: 600, border: `1.5px solid ${border}`,
      color, background: bg, cursor: 'pointer', transition: 'all 0.15s',
    });

    switch (n.type) {
      case 'delivery_overdue':
        return (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              style={baseStyle('#f59e0b', '#92400e', '#fffbeb', '#fef3c7')}
              onClick={(e) => { e.stopPropagation(); setStatusDropdownId(statusDropdownId === n._id ? null : n._id); }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fef3c7')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fffbeb')}
            >
              Update Status →
            </button>
            {statusDropdownId === n._id && (
              <div
                onClick={e => e.stopPropagation()}
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 1050, minWidth: 140, overflow: 'hidden' }}
              >
                {STATUS_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => handleUpdateStatus(n, opt.value)}
                    style={{ padding: '7px 12px', fontSize: 11.5, color: '#374151', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'payment_pending':
        return (
          <button
            type="button"
            style={baseStyle('#22c55e', '#15803d', '#f0fdf4', '#dcfce7')}
            onClick={(e) => { e.stopPropagation(); handleRecordPayment(n); }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}
          >
            Record Payment →
          </button>
        );
      case 'birthday_wish':
        return (
          <button
            type="button"
            style={baseStyle('#ec4899', '#9d174d', '#fdf2f8', '#fce7f3')}
            onClick={(e) => {
              e.stopPropagation();
              handleWhatsApp(n, `Happy Birthday ${n.customerName || ''}! 🎂 Wishing you a wonderful day. — Da Tog's Designer Lounge`);
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fce7f3')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fdf2f8')}
          >
            Send WhatsApp 🎂
          </button>
        );
      case 'anniversary_wish':
        return (
          <button
            type="button"
            style={baseStyle('#14b8a6', '#065f46', '#f0fdf4', '#ccfbf1')}
            onClick={(e) => {
              e.stopPropagation();
              handleWhatsApp(n, `Happy Anniversary ${n.customerName || ''}! 💍 Wishing you both a beautiful day. — Da Tog's Designer Lounge`);
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#ccfbf1')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}
          >
            Send WhatsApp 💍
          </button>
        );
      case 'trial_reminder':
        return (
          <button
            type="button"
            style={baseStyle('#a855f7', '#5b21b6', '#faf5ff', '#ede9fe')}
            onClick={(e) => { e.stopPropagation(); handleConfirmTrial(n); }}
            onMouseEnter={e => (e.currentTarget.style.background = '#ede9fe')}
            onMouseLeave={e => (e.currentTarget.style.background = '#faf5ff')}
          >
            Confirm Trial →
          </button>
        );
      case 'order_ready':
        return (
          <button
            type="button"
            style={baseStyle('#25d366', '#065f46', '#f0fdf4', '#dcfce7')}
            onClick={(e) => {
              e.stopPropagation();
              handleWhatsApp(n, `Hi ${n.customerName || ''}, your order is ready for pickup! Please visit Da Tog's Designer Lounge at your convenience. 📦`);
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}
          >
            Notify Customer →
          </button>
        );
      case 'payment_received':
        return (
          <button
            type="button"
            style={baseStyle('#3b82f6', '#1e40af', '#eff6ff', '#dbeafe')}
            onClick={(e) => { e.stopPropagation(); handleViewOrder(n); }}
            onMouseEnter={e => (e.currentTarget.style.background = '#dbeafe')}
            onMouseLeave={e => (e.currentTarget.style.background = '#eff6ff')}
          >
            View Order →
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={wrapRef}>
      {/* Panel */}
      <div
        className="notif-fab-panel"
        style={{
          position: 'fixed', bottom: 88, right: 24, width: 320, background: '#fff',
          borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden', zIndex: 1000, transformOrigin: 'bottom right',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s',
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(20px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div style={{ background: '#1a1a1a', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#c9900a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Notifications</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)' }}>
                {unread > 0 ? `${unread} unread alert${unread === 1 ? '' : 's'}` : 'All caught up ✓'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => actions.markAllAsRead()}
              style={{ background: 'none', border: 'none', fontSize: 10, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ background: '#fafafa', borderBottom: '1px solid #f3f4f6', padding: '0 12px', display: 'flex' }}>
          {FILTER_TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setStatusDropdownId(null); }}
              style={{
                padding: '8px 10px', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t.key ? '#c9900a' : '#9ca3af',
                fontWeight: tab === t.key ? 600 : 400,
                borderBottom: tab === t.key ? '2px solid #c9900a' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="notif-fab-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
              Nothing here right now.
            </div>
          )}
          {filtered.map((n: any) => {
            const meta = TYPE_META[n.type];
            return (
              <div
                key={n._id}
                onClick={() => handleRowClick(n)}
                style={{
                  padding: '11px 14px', borderBottom: '1px solid #f9fafb', display: 'flex', gap: 10,
                  cursor: 'pointer', position: 'relative', transition: 'background 0.12s',
                  background: n.isRead ? 'transparent' : '#fffbeb',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = n.isRead ? '#fafafa' : '#fef3c7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'transparent' : '#fffbeb'; }}
              >
                {!n.isRead && (
                  <span style={{ position: 'absolute', top: 14, right: 12, width: 7, height: 7, borderRadius: '50%', background: '#c9900a' }} />
                )}
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {meta.emoji}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{n.title}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 20, background: meta.bg, color: meta.tagColor }}>
                      {meta.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{timeAgo(n.createdAt)}</div>
                  {renderQuickAction(n)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', background: '#fafafa', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => closeAfterNavigate('/notifications')}
            style={{ background: 'none', border: 'none', fontSize: 11.5, fontWeight: 600, color: '#c9900a', cursor: 'pointer' }}
          >
            View all notifications →
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen(prev => !prev)}
        className={`notif-fab-btn${unread > 0 ? ' notif-fab-pulse' : ''}`}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 54, height: 54, borderRadius: '50%', background: '#c9900a',
          boxShadow: '0 4px 16px rgba(201,144,10,0.4), 0 2px 6px rgba(0,0,0,0.15)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Bell size={22} color="#fff" />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderRadius: '50%',
            background: '#ef4444', border: '2px solid #fff', fontSize: 10, fontWeight: 700, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed', bottom: 24, left: 24, background: '#1a1a1a', color: '#fff',
            padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, zIndex: 9999,
          }}
          className="notif-fab-toast"
        >
          {toast}
        </div>
      )}

      {/* Record Payment modal — above the panel */}
      {paymentModalOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100 }}>
          <RecordPaymentModal
            orderId={paymentModalOrder._id}
            orderNumber={paymentModalOrder.orderNumber}
            customerName={paymentModalOrder.customer?.name}
            totalAmount={paymentModalOrder.payment?.total}
            currentBalance={paymentModalOrder.payment?.balance || 0}
            onClose={() => setPaymentModalOrder(null)}
            onSaved={async () => {
              await actions.markAsRead([paymentModalOrder.notificationId]);
              await actions.fetchNotificationCounts();
              setPaymentModalOrder(null);
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes notifFabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,144,10,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(201,144,10,0); }
        }
        .notif-fab-pulse { animation: notifFabPulse 2s infinite; }
        .notif-fab-list { scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
        @keyframes notifFabToastIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .notif-fab-toast { animation: notifFabToastIn 0.2s ease-out; }
        @media (max-width: 640px) {
          .notif-fab-panel { right: 8px !important; left: 8px !important; width: auto !important; bottom: 80px !important; }
          .notif-fab-btn { bottom: 16px !important; right: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default NotificationFab;
