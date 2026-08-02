import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartView } from '../../../hooks/useAnalyticsDashboard';

interface SalesChartProps {
  data: { label: string; revenue: number; orders: number }[];
  view: ChartView;
  onViewChange: (v: ChartView) => void;
  loading?: boolean;
}

const VIEWS: ChartView[] = ['daily', 'weekly', 'monthly'];

const fmtK = (v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

const SalesTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const revenue = payload.find((p: any) => p.dataKey === 'revenue')?.value ?? 0;
  const orders = payload.find((p: any) => p.dataKey === 'orders')?.value ?? 0;
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e5e7eb)', borderRadius: 6, padding: '6px 10px', fontSize: 11 }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ color: '#c9900a' }}>Revenue: ₹{Number(revenue).toLocaleString('en-IN')}</div>
      <div style={{ color: '#60a5fa' }}>Orders: {orders}</div>
    </div>
  );
};

const SalesChart: React.FC<SalesChartProps> = ({ data, view, onViewChange, loading }) => {
  return (
    <div style={{ borderRadius: 10, padding: '12px 14px', background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e5e7eb)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>Sales</div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 7, overflow: 'hidden', display: 'flex' }}>
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              style={{
                padding: '4px 10px', fontSize: 10, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: view === v ? '#0f172a' : '#fff', color: view === v ? '#fff' : '#94a3b8',
                textTransform: 'capitalize'
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="analytics-skeleton" style={{ height: 140, borderRadius: 10 }} />
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={data.length > 10 ? 2 : 0} />
            <YAxis yAxisId="rev" orientation="left" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={40} />
            <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
            <Tooltip content={<SalesTooltip />} />
            <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill="#c9900a" radius={[3, 3, 0, 0]} barSize={14} />
            <Bar yAxisId="ord" dataKey="orders" name="Orders" fill="#bfdbfe" radius={[3, 3, 0, 0]} barSize={8} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SalesChart;
