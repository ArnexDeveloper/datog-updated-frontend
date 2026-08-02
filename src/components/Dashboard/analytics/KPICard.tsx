import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../constants/dashboardColors';

export interface KPICardProps {
  label: string;
  icon: string;
  iconBg: string;
  accentColor: string;
  value: string;
  change?: number;
  changeLabel: string;
  changeDanger?: boolean;
  loading?: boolean;
}

const KPICardSkeleton: React.FC = () => (
  <div className="analytics-skeleton" style={{ height: 90, borderRadius: 10 }} />
);

const KPICard: React.FC<KPICardProps> = ({ label, icon, iconBg, accentColor, value, change, changeLabel, changeDanger, loading }) => {
  if (loading) return <KPICardSkeleton />;

  const isNegativeOrDanger = changeDanger || (typeof change === 'number' && change < 0);
  const changeColor = isNegativeOrDanger ? COLORS.red : COLORS.green;
  const ChangeIcon = changeDanger ? AlertCircle : (typeof change === 'number' && change < 0 ? TrendingDown : TrendingUp);

  return (
    <div style={{
      borderRadius: 10, padding: '12px 14px', background: 'var(--card-bg, #fff)',
      border: '1px solid var(--card-border, #e5e7eb)', borderLeft: `3px solid ${accentColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary, #0f172a)', marginTop: 2 }}>{value}</div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
        }}>
          {icon}
        </div>
      </div>
      {(typeof change === 'number' || changeDanger) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 10.5 }}>
          <ChangeIcon size={12} color={changeColor} />
          <span style={{ color: changeColor, fontWeight: 600 }}>
            {changeDanger ? change : `${change! > 0 ? '+' : ''}${change}%`}
          </span>
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>{changeLabel}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
