import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DONUT_COLORS } from '../../../constants/dashboardColors';

interface OrderStatusDonutProps {
  statuses: { status: string; label: string; count: number; percentage: number }[];
  loading?: boolean;
}

const OrderStatusDonut: React.FC<OrderStatusDonutProps> = ({ statuses, loading }) => {
  return (
    <div style={{ borderRadius: 10, padding: '12px 14px', background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e5e7eb)', height: '100%' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #0f172a)', marginBottom: 8 }}>Order Status</div>
      {loading ? (
        <div className="analytics-skeleton" style={{ height: 140, borderRadius: 10 }} />
      ) : statuses.length === 0 ? (
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No active orders</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie
                data={statuses} cx="50%" cy="50%" innerRadius={28} outerRadius={42}
                dataKey="count" startAngle={90} endAngle={-270} paddingAngle={2}
              >
                {statuses.map(s => (
                  <Cell key={s.status} fill={DONUT_COLORS[s.status] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, _n: any, entry: any) => [`${v} orders`, entry?.payload?.label]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
            {statuses.map(s => (
              <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: DONUT_COLORS[s.status] || '#94a3b8', flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--text-secondary, #64748b)' }}>{s.label}</span>
                <span style={{ color: 'var(--text-primary, #0f172a)', fontWeight: 600 }}>{s.percentage}%</span>
                <span style={{ color: '#94a3b8', width: 24, textAlign: 'right' }}>{s.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderStatusDonut;
