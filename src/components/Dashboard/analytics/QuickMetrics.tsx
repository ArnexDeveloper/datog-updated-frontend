import React from 'react';
import { Clock, Repeat, IndianRupee, Star, Percent } from 'lucide-react';
import { QuickMetricsData } from '../../../hooks/useAnalyticsDashboard';

interface QuickMetricsProps {
  metrics: QuickMetricsData | null;
  loading?: boolean;
}

const QuickMetrics: React.FC<QuickMetricsProps> = ({ metrics, loading }) => {
  const items = metrics ? [
    { icon: Clock, label: 'Avg delivery time', value: `${metrics.avg_delivery_days} days` },
    { icon: Repeat, label: 'Repeat customers', value: `${metrics.repeat_customer_pct}%` },
    { icon: IndianRupee, label: 'Avg order value', value: `₹${metrics.avg_order_value.toLocaleString('en-IN')}` },
    { icon: Star, label: 'Package orders', value: `${metrics.package_order_pct}%` },
    { icon: Percent, label: 'Advance collected', value: `${metrics.advance_collection_pct}%` },
  ] : [];

  return (
    <div style={{ borderRadius: 10, padding: '12px 14px', background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e5e7eb)' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #0f172a)', marginBottom: 8 }}>Quick Metrics</div>
      {loading || !metrics ? (
        <div className="analytics-skeleton" style={{ height: 160, borderRadius: 10 }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(item => (
            <div key={item.label} style={{
              background: '#f8fafc', borderRadius: 7, padding: '7px 10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <item.icon size={13} color="#c9900a" />
                <span style={{ fontSize: 10, color: '#64748b' }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickMetrics;
