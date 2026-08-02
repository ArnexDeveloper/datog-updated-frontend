import React from 'react';
import { TopProduct } from '../../../hooks/useAnalyticsDashboard';
import { productEmoji } from '../../../constants/dashboardColors';

interface TopProductsProps {
  products: TopProduct[];
  loading?: boolean;
}

const TopProducts: React.FC<TopProductsProps> = ({ products, loading }) => {
  const maxCount = Math.max(1, ...products.map(p => p.count));

  return (
    <div style={{ borderRadius: 10, padding: '12px 14px', background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e5e7eb)', height: '100%' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #0f172a)', marginBottom: 8 }}>Top Products</div>
      {loading ? (
        <div className="analytics-skeleton" style={{ height: 140, borderRadius: 10 }} />
      ) : products.length === 0 ? (
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No orders in this period</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {products.map(p => (
            <div key={p.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 13 }}>{productEmoji(p.name)}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary, #0f172a)', flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{p.count} orders</span>
              </div>
              <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(p.count / maxCount) * 100}%`, height: '100%', background: '#c9900a' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProducts;
