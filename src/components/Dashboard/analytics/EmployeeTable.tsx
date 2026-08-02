import React from 'react';
import { EmployeeStat, Period } from '../../../hooks/useAnalyticsDashboard';

interface EmployeeTableProps {
  employees: EmployeeStat[];
  period: Period;
  onPeriodChange: (p: Period) => void;
  loading?: boolean;
}

const RANK_STYLE = [
  { bg: '#fef3c7', text: '#92400e' }, // 1st gold
  { bg: '#f1f5f9', text: '#475569' }, // 2nd silver
  { bg: '#fde8cc', text: '#92400e' }, // 3rd bronze
];
const DEFAULT_RANK_STYLE = { bg: '#f8fafc', text: '#94a3b8' };

const initials = (name: string) => (name || '')
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map(p => p[0]?.toUpperCase())
  .join('');

const fmtMoney = (v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${v}`;

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, period, onPeriodChange, loading }) => {
  const maxOrders = Math.max(1, ...employees.map(e => e.orders));

  return (
    <div style={{ borderRadius: 10, padding: '12px 14px', background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #e5e7eb)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>Employee Performance</div>
        <select
          value={period}
          onChange={e => onPeriodChange(e.target.value as Period)}
          style={{ fontSize: 10, border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 6px', color: '#374151', background: '#fff' }}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
      {loading ? (
        <div className="analytics-skeleton" style={{ height: 140, borderRadius: 10 }} />
      ) : employees.length === 0 ? (
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No employees found</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {employees.map((e, i) => {
            const rank = RANK_STYLE[i] || DEFAULT_RANK_STYLE;
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%', background: rank.bg, color: rank.text,
                  fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {i + 1}
                </span>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', background: rank.bg, color: rank.text,
                  fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {initials(e.name)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary, #0f172a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>{e.role}</div>
                </div>
                <div style={{ width: 60, height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: `${(e.orders / maxOrders) * 100}%`, height: '100%', background: '#c9900a' }} />
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, width: 54 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>{e.orders} ord</div>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>{fmtMoney(e.revenue)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
