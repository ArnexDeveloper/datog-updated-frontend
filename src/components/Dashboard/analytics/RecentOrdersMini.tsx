import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RecentOrder } from '../../../hooks/useAnalyticsDashboard';
import { STATUS_COLORS } from '../../../constants/dashboardColors';

interface RecentOrdersMiniProps {
  orders: RecentOrder[];
  loading?: boolean;
}

const RecentOrdersMini: React.FC<RecentOrdersMiniProps> = ({ orders, loading }) => {
  const navigate = useNavigate();

  return (
    <div style={{ borderRadius: 10, padding: '12px 14px', background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e5e7eb)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>Recent Orders</div>
        <button
          onClick={() => navigate('/orders')}
          style={{ fontSize: 10, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
        >
          View all →
        </button>
      </div>
      {loading ? (
        <div className="analytics-skeleton" style={{ height: 140, borderRadius: 10 }} />
      ) : orders.length === 0 ? (
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No orders yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {orders.map(o => {
            const style = STATUS_COLORS[o.status] || { bg: '#f8fafc', text: '#64748b' };
            return (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => navigate(`/orders/${o.id}`)}
                  style={{ fontSize: 10.5, color: '#2563eb', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, width: 78, textAlign: 'left' }}
                >
                  {o.order_number}
                </button>
                <span style={{ fontSize: 10.5, color: 'var(--text-secondary, #64748b)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {o.customer_name}
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--text-primary, #0f172a)', flexShrink: 0 }}>
                  ₹{o.amount.toLocaleString('en-IN')}
                </span>
                <span style={{
                  borderRadius: 10, fontSize: 9, fontWeight: 600, padding: '2px 7px', flexShrink: 0,
                  background: style.bg, color: style.text
                }}>
                  {o.status.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersMini;
