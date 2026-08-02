import React, { useState } from 'react';
import useAnalyticsDashboard, { Period } from '../../../hooks/useAnalyticsDashboard';
import KPICard from './KPICard';
import SalesChart from './SalesChart';
import OrderStatusDonut from './OrderStatusDonut';
import EmployeeTable from './EmployeeTable';
import TopProducts from './TopProducts';
import RecentOrdersMini from './RecentOrdersMini';
import RevenueTrend12Mo from './RevenueTrend12Mo';
import QuickMetrics from './QuickMetrics';
import './AnalyticsSection.css';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const fmtRevenue = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${(v / 1000).toFixed(1)}K`;

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const AnalyticsSection: React.FC = () => {
  const {
    period, setPeriod, chartView, setChartView, employeePeriod, setEmployeePeriod,
    dateRange, setDateRange, kpis, salesChart, orderStatus, employees, topProducts,
    recentOrders, revenueTrend, yoyChange, quickMetrics, loading,
  } = useAnalyticsDashboard();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');

  const applyDateRange = () => {
    if (fromInput && toInput) {
      setDateRange({ start: fromInput, end: toInput });
      setPickerOpen(false);
    }
  };

  const clearDateRange = () => {
    setDateRange({ start: null, end: null });
    setFromInput('');
    setToInput('');
    setPickerOpen(false);
  };

  const dateRangeLabel = dateRange.start && dateRange.end
    ? `${fmtDate(dateRange.start)} – ${fmtDate(dateRange.end)}`
    : 'Custom range';

  const handleExport = () => {
    if (!kpis) return;
    const rows: (string | number)[][] = [
      ['Metric', 'Value'],
      ['Period', period],
      ['Revenue', kpis.revenue],
      ['Total Orders', kpis.total_orders],
      ['New Customers', kpis.new_customers],
      ['Pending Orders', kpis.pending_orders],
      ['Overdue Orders', kpis.overdue_orders],
      [],
      ['Employee', 'Orders', 'Revenue'],
      ...employees.map(e => [e.name, e.orders, e.revenue]),
      [],
      ['Product', 'Orders'],
      ...topProducts.map(p => [p.name, p.count]),
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datog-dashboard-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpiCards = kpis ? [
    {
      label: 'Total Revenue', icon: '💰', iconBg: '#fffbeb', accentColor: '#c9900a',
      value: fmtRevenue(kpis.revenue), change: kpis.revenue_change, changeLabel: 'vs last period',
    },
    {
      label: 'Total Orders', icon: '📋', iconBg: '#eff6ff', accentColor: '#2563eb',
      value: String(kpis.total_orders), change: kpis.orders_change, changeLabel: 'vs last period',
    },
    {
      label: 'Customers', icon: '👥', iconBg: '#f5f3ff', accentColor: '#7c3aed',
      value: String(kpis.total_customers), change: kpis.customers_change, changeLabel: 'new this period',
    },
    {
      label: 'Pending Orders', icon: '⏳', iconBg: '#fff1f2', accentColor: '#dc2626',
      value: String(kpis.pending_orders), change: kpis.overdue_orders, changeLabel: 'overdue today', changeDanger: true,
    },
  ] : [];

  return (
    <div className="analytics-section">
      <div className="analytics-topbar">
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>Analytics Dashboard</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>Datog Designer Lounge · Bhopal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <div className="analytics-period-toggle">
            {PERIODS.map(p => (
              <button
                key={p.value}
                className={!dateRange.start && period === p.value ? 'active' : ''}
                onClick={() => { setDateRange({ start: null, end: null }); setPeriod(p.value); }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="analytics-date-input" onClick={() => setPickerOpen(o => !o)} style={{ cursor: 'pointer' }}>
            {dateRangeLabel}
          </button>
          {pickerOpen && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20, display: 'flex',
              flexDirection: 'column', gap: 6, minWidth: 180
            }}>
              <label style={{ fontSize: 9, color: '#64748b' }}>From
                <input type="date" value={fromInput} onChange={e => setFromInput(e.target.value)} style={{ display: 'block', width: '100%', fontSize: 11, padding: 4, marginTop: 2 }} />
              </label>
              <label style={{ fontSize: 9, color: '#64748b' }}>To
                <input type="date" value={toInput} onChange={e => setToInput(e.target.value)} style={{ display: 'block', width: '100%', fontSize: 11, padding: 4, marginTop: 2 }} />
              </label>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <button onClick={applyDateRange} style={{ flex: 1, fontSize: 10, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 0', cursor: 'pointer' }}>Apply</button>
                <button onClick={clearDateRange} style={{ flex: 1, fontSize: 10, background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 5, padding: '4px 0', cursor: 'pointer' }}>Clear</button>
              </div>
            </div>
          )}
          <button className="analytics-export-btn" onClick={handleExport}>⬇ Export</button>
        </div>
      </div>

      <div className="analytics-row-4">
        {loading || !kpis ? (
          Array.from({ length: 4 }).map((_, i) => <KPICard key={i} loading label="" icon="" iconBg="" accentColor="" value="" changeLabel="" />)
        ) : (
          kpiCards.map(c => <KPICard key={c.label} {...c} />)
        )}
      </div>

      <div className="analytics-row-2-1">
        <SalesChart data={salesChart} view={chartView} onViewChange={setChartView} loading={loading} />
        <OrderStatusDonut statuses={orderStatus} loading={loading} />
      </div>

      <div className="analytics-row-3">
        <EmployeeTable employees={employees} period={employeePeriod} onPeriodChange={setEmployeePeriod} loading={loading} />
        <TopProducts products={topProducts} loading={loading} />
        <RecentOrdersMini orders={recentOrders} loading={loading} />
      </div>

      <div className="analytics-row-2-1">
        <RevenueTrend12Mo months={revenueTrend} yoyChange={yoyChange} loading={loading} />
        <QuickMetrics metrics={quickMetrics} loading={loading} />
      </div>
    </div>
  );
};

export default AnalyticsSection;
