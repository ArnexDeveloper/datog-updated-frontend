import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { RevenueTrendMonth } from '../../../hooks/useAnalyticsDashboard';

interface RevenueTrend12MoProps {
  months: RevenueTrendMonth[];
  yoyChange: number;
  loading?: boolean;
}

const fmtFull = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const RevenueTrend12Mo: React.FC<RevenueTrend12MoProps> = ({ months, yoyChange, loading }) => {
  const max = Math.max(1, ...months.map(m => m.revenue));

  return (
    <div style={{ borderRadius: 10, padding: '12px 14px', background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e5e7eb)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>Revenue Trend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: yoyChange >= 0 ? '#16a34a' : '#dc2626' }}>
          {yoyChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {yoyChange >= 0 ? '+' : ''}{yoyChange}% YoY
        </div>
      </div>
      {loading ? (
        <div className="analytics-skeleton" style={{ height: 120, borderRadius: 10 }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110 }}>
          {months.map(m => (
            <div key={`${m.year}-${m.month}`} title={`${m.month_label} ${m.year}: ${fmtFull(m.revenue)}`}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}
            >
              <div style={{
                width: '70%', minHeight: 2,
                height: `${(m.revenue / max) * 90}px`,
                background: m.is_current_month ? '#c9900a' : '#fde68a',
                opacity: m.is_current_month ? 1 : 0.7,
                borderRadius: '2px 2px 0 0',
              }} />
              <span style={{ fontSize: 7, color: '#94a3b8' }}>{m.month_label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RevenueTrend12Mo;
