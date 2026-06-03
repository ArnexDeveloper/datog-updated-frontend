import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { apiService } from '../../services/api';
import DashboardToasts, { ToastNotification } from './DashboardToasts';
import './Dashboard.css';

/* ── helpers ─────────────────────────────────────────────────── */
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmtShort = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
};
const fmtFull = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

const fmtTime = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const URGENCY_COLOR: Record<string, string> = {
  urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e'
};

/* ── chart tooltip ────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, currency = false }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <p className="chart-tooltip__label">{label}</p>}
      {payload.map((e: any) => (
        <p key={e.name} className="chart-tooltip__row" style={{ color: e.color || e.fill }}>
          <span className="chart-tooltip__key">{e.name}:</span>{' '}
          <span className="chart-tooltip__val">{currency ? fmtFull(e.value) : e.value}</span>
        </p>
      ))}
    </div>
  );
};

const DonutLabel = ({ cx, cy, label, sub }: any) => (
  <>
    <text x={cx} y={cy - 8}  textAnchor="middle" className="donut-center-label">{label}</text>
    <text x={cx} y={cy + 12} textAnchor="middle" className="donut-center-sub">{sub}</text>
  </>
);

/* ── notification builder ─────────────────────────────────────── */
const buildNotifications = (data: any): ToastNotification[] => {
  const notifs: ToastNotification[] = [];

  // 1. Trials today
  (data.trialsDueToday || []).forEach((o: any) => {
    notifs.push({
      id: `trial-${o._id}`,
      type: 'trial',
      icon: '🗓️',
      title: 'Trial Today',
      message: `Order #${o.orderNumber} — ${o.customer?.name}`,
      duration: 9000
    });
  });

  // 2. Deliveries due TODAY (was broken before — now uses separate deliveryDueToday list)
  (data.deliveryDueToday || []).forEach((o: any) => {
    notifs.push({
      id: `deltoday-${o._id}`,
      type: 'urgent',
      icon: '🔴',
      title: 'Delivery Due Today!',
      message: `Order #${o.orderNumber} — ${o.customer?.name}`,
      duration: 12000
    });
  });

  // 3. Orders due in next 1-3 days
  const now = new Date();
  (data.ordersDueSoon || []).forEach((o: any) => {
    const hours = (new Date(o.deliveryDate).getTime() - now.getTime()) / 3600000;
    const days  = Math.ceil(hours / 24);
    notifs.push({
      id: `soon-${o._id}`,
      type: hours <= 48 ? 'urgent' : 'warning',
      icon: hours <= 48 ? '🚨' : '⏰',
      title: days === 1 ? 'Delivery Tomorrow!' : `Due in ${days} days`,
      message: `Order #${o.orderNumber} — ${o.customer?.name}`,
      duration: hours <= 48 ? 10000 : 7000
    });
  });

  // 4. Low stock
  const ls = data.overview?.lowStockFabrics ?? 0;
  if (ls > 0) notifs.push({
    id: 'low-stock', type: 'lowstock', icon: '📦',
    title: 'Low Stock Alert',
    message: `${ls} fabric${ls !== 1 ? 's' : ''} running low on stock`
  });

  // 5. Urgent jobs
  const uj = data.overview?.urgentJobs ?? 0;
  if (uj > 0) notifs.push({
    id: 'urgent-jobs', type: 'info', icon: '⚡',
    title: 'Urgent Jobs',
    message: `${uj} urgent job card${uj !== 1 ? 's' : ''} need attention`
  });

  return notifs;
};

/* ── Today Detail Modal ───────────────────────────────────────── */
type ModalType = 'trials' | 'deliveries' | null;

interface TodayModalProps {
  type: ModalType;
  trials: any[];
  deliveries: any[];
  onClose: () => void;
}

const TodayModal: React.FC<TodayModalProps> = ({ type, trials, deliveries, onClose }) => {
  if (!type) return null;
  const isTrials    = type === 'trials';
  const rows        = isTrials ? trials : deliveries;
  const title       = isTrials ? "Today's Trial Orders" : "Today's Delivery Orders";
  const emptyMsg    = isTrials ? 'No trial orders scheduled for today.' : 'No deliveries due today.';

  return (
    <div className="today-modal-overlay" onClick={onClose}>
      <div className="today-modal" onClick={e => e.stopPropagation()}>
        <div className={`today-modal__header today-modal__header--${type}`}>
          <span className="today-modal__title-icon">{isTrials ? '🗓️' : '🚚'}</span>
          <h3>{title}</h3>
          <button className="today-modal__close" onClick={onClose}>×</button>
        </div>

        {rows.length === 0 ? (
          <p className="today-modal__empty">{emptyMsg}</p>
        ) : (
          <div className="today-modal__body">
            <table className="today-modal__table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                  {isTrials ? <th>Trial Time</th> : <th>Urgency</th>}
                  {!isTrials && <th>Balance</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((o: any) => (
                  <tr key={o._id}>
                    <td className="today-modal__order-no">#{o.orderNumber}</td>
                    <td>{o.customer?.name || '—'}</td>
                    <td>{o.customer?.phone || '—'}</td>
                    <td>
                      <span className={`status ${o.status?.toLowerCase()}`}>{o.status}</span>
                    </td>
                    {isTrials ? (
                      <td>{fmtTime(o.trialDate)}</td>
                    ) : (
                      <td>
                        <span
                          className="urgency-badge"
                          style={{ background: URGENCY_COLOR[o.urgency] || '#6b7280' }}
                        >
                          {o.urgency || 'medium'}
                        </span>
                      </td>
                    )}
                    {!isTrials && (
                      <td className="today-modal__balance">
                        {o.payment?.balance > 0 ? fmtFull(o.payment.balance) : <span className="paid-tag">Paid</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── main component ───────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();

  const [overview,         setOverview]         = useState<any>({});
  const [revenue,          setRevenue]          = useState({ total: 0, monthly: 0, paid: 0, pending: 0 });
  const [recentOrders,     setRecentOrders]     = useState<any[]>([]);
  const [monthlyTrends,    setMonthlyTrends]    = useState<any[]>([]);
  const [topCustomers,     setTopCustomers]     = useState<any[]>([]);
  const [trialsDueToday,   setTrialsDueToday]   = useState<any[]>([]);
  const [deliveryDueToday, setDeliveryDueToday] = useState<any[]>([]);
  const [toastNotifs,      setToastNotifs]      = useState<ToastNotification[]>([]);
  const [activeModal,      setActiveModal]      = useState<ModalType>(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);

  useEffect(() => { loadDashboard(); /* eslint-disable-next-line */ }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAdminDashboard();
      if (!res.data.success) return;
      const d = res.data.data;

      setOverview(d.overview || {});
      setRevenue(d.revenue  || { total: 0, monthly: 0, paid: 0, pending: 0 });
      setTopCustomers((d.topCustomers  || []).slice(0, 5));
      setTrialsDueToday(d.trialsDueToday   || []);
      setDeliveryDueToday(d.deliveryDueToday || []);

      setMonthlyTrends(
        (d.monthlyTrends || []).map((t: any) => ({
          month:   MONTH_NAMES[t._id.month - 1],
          Revenue: Math.round(t.revenue),
          Orders:  t.orders
        }))
      );
      setRecentOrders(
        (d.recentOrders || []).map((o: any) => ({
          id:       o.orderNumber,
          customer: o.customer?.name || '—',
          garment:  o.garments?.[0]?.name || 'N/A',
          status:   o.status?.charAt(0).toUpperCase() + o.status?.slice(1),
          date:     new Date(o.createdAt).toLocaleDateString()
        }))
      );
      setToastNotifs(buildNotifications(d));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── chart data ───────────────────────────────────────────── */
  const revenueDonut   = [
    { name: 'Paid',    value: revenue.paid,    color: '#22c55e' },
    { name: 'Pending', value: revenue.pending, color: '#f97316' }
  ];
  const totalRevDonut  = revenue.paid + revenue.pending;
  const custBarData    = topCustomers.map(c => ({
    name:  c.customerName?.split(' ').slice(0, 2).join(' ') || '—',
    Spent: Math.round(c.totalSpent),
    Orders: c.orderCount
  }));

  /* ── today-card helpers ───────────────────────────────────── */
  const previewNames = (list: any[], max = 2) => {
    const names = list.slice(0, max).map(o => o.customer?.name?.split(' ')[0] || '—');
    const extra = list.length - max;
    return extra > 0 ? `${names.join(', ')} +${extra} more` : names.join(', ');
  };

  if (loading) return (
    <div className="dashboard-loading"><div className="spinner" /><p>Loading dashboard...</p></div>
  );
  if (error) return (
    <div className="dashboard-error">
      <h3>Error Loading Dashboard</h3><p>{error}</p>
      <button onClick={loadDashboard} className="btn btn-primary">Retry</button>
    </div>
  );

  return (
    <div className="dashboard">
      <DashboardToasts notifications={toastNotifs} />

      {/* Detail modal */}
      <TodayModal
        type={activeModal}
        trials={trialsDueToday}
        deliveries={deliveryDueToday}
        onClose={() => setActiveModal(null)}
      />

      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to Datog Designer Lounge Management System</p>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orders">📋</div>
          <div className="stat-content">
            <h3>{overview.totalOrders ?? 0}</h3>
            <p>Total Orders</p>
            <span className="stat-sub">This month: {overview.ordersThisMonth ?? 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon invoices">💰</div>
          <div className="stat-content">
            <h3>{fmtShort(revenue.total)}</h3>
            <p>Total Revenue</p>
            <span className="stat-sub">Monthly: {fmtShort(revenue.monthly)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon customers">⏳</div>
          <div className="stat-content">
            <h3>{overview.pendingOrders ?? 0}</h3>
            <p>Pending Orders</p>
            <span className="stat-sub stat-sub--warn">
              {overview.urgentJobs ?? 0} urgent job{(overview.urgentJobs ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-content">
            <h3>{overview.totalCustomers ?? 0}</h3>
            <p>Customers</p>
            <span className="stat-sub">{overview.totalEmployees ?? 0} active employees</span>
          </div>
        </div>
      </div>

      {/* ── Today's Activity Cards ───────────────────────────── */}
      <div className="today-cards">
        {/* Trials today */}
        <button
          className="today-card today-card--trial"
          onClick={() => setActiveModal('trials')}
        >
          <div className="today-card__top">
            <span className="today-card__icon">🗓️</span>
            <span className="today-card__label">Today's Trials</span>
          </div>
          <div className="today-card__count">{trialsDueToday.length}</div>
          <div className="today-card__preview">
            {trialsDueToday.length === 0
              ? 'No trials scheduled today'
              : previewNames(trialsDueToday)}
          </div>
          <div className="today-card__cta">View details →</div>
        </button>

        {/* Deliveries today */}
        <button
          className="today-card today-card--delivery"
          onClick={() => setActiveModal('deliveries')}
        >
          <div className="today-card__top">
            <span className="today-card__icon">🚚</span>
            <span className="today-card__label">Today's Deliveries</span>
          </div>
          <div className="today-card__count">{deliveryDueToday.length}</div>
          <div className="today-card__preview">
            {deliveryDueToday.length === 0
              ? 'No deliveries due today'
              : previewNames(deliveryDueToday)}
          </div>
          <div className="today-card__cta">View details →</div>
        </button>
      </div>

      {/* ── Revenue Trend ────────────────────────────────────── */}
      <div className="chart-card chart-card--full">
        <div className="chart-card__head">
          <h2>Revenue &amp; Orders Trend</h2>
          <span className="chart-card__sub">Last 6 months</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyTrends} margin={{ top: 6, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#d4af37" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary,#e5e7eb)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary,#6b7280)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rev" orientation="left"  tickFormatter={fmtShort} tick={{ fontSize: 11, fill: 'var(--text-secondary,#6b7280)' }} axisLine={false} tickLine={false} width={56} />
            <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: 'var(--text-secondary,#6b7280)' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Area yAxisId="rev" type="monotone" dataKey="Revenue" stroke="#d4af37" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#d4af37', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Area yAxisId="ord" type="monotone" dataKey="Orders"  stroke="#3b82f6" strokeWidth={2}   fill="url(#ordGrad)" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Monthly Orders + Revenue Donut ───────────────────── */}
      <div className="charts-row-2">
        <div className="chart-card">
          <div className="chart-card__head">
            <h2>Monthly Orders</h2>
            <span className="chart-card__sub">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthlyTrends} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-primary,#e5e7eb)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary,#6b7280)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary,#6b7280)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Orders" radius={[5, 5, 0, 0]}>
                {monthlyTrends.map((_: any, i: number) => (
                  <Cell key={i} fill={i === monthlyTrends.length - 1 ? '#b8860b' : '#d4af37'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card--center">
          <div className="chart-card__head">
            <h2>Revenue Breakdown</h2>
            <span className="chart-card__sub">Paid vs pending</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={revenueDonut} cx="50%" cy="50%" innerRadius={62} outerRadius={85} paddingAngle={3} dataKey="value" labelLine={false}>
                {revenueDonut.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => fmtFull(v)} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} formatter={(value, entry: any) => (
                <span style={{ color: 'var(--text-primary)' }}>{value} ({fmtShort(entry.payload.value)})</span>
              )} />
              {totalRevDonut > 0 && (
                <DonutLabel cx="50%" cy="47%"
                  label={`${Math.round((revenue.paid / totalRevDonut) * 100)}%`}
                  sub="paid"
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top Customers ────────────────────────────────────── */}
      {custBarData.length > 0 && (
        <div className="chart-card chart-card--full">
          <div className="chart-card__head">
            <h2>Top Customers by Revenue</h2>
            <span className="chart-card__sub">All time</span>
          </div>
          <ResponsiveContainer width="100%" height={custBarData.length * 44 + 20}>
            <BarChart data={custBarData} layout="vertical" margin={{ top: 0, right: 60, left: 8, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-primary,#e5e7eb)" />
              <XAxis type="number" tickFormatter={fmtShort} tick={{ fontSize: 11, fill: 'var(--text-secondary,#6b7280)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-primary,#111)' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<ChartTooltip currency />} />
              <Bar dataKey="Spent" fill="#d4af37" radius={[0, 5, 5, 0]}
                label={{ position: 'right', formatter: fmtShort, fontSize: 11, fill: 'var(--text-secondary)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Recent Orders ────────────────────────────────────── */}
      <div className="dashboard-content">
        <div className="recent-orders">
          <h2>Recent Orders</h2>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Garment</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer}</td>
                    <td>{o.garment}</td>
                    <td><span className={`status ${o.status?.toLowerCase().replace(' ', '-')}`}>{o.status}</span></td>
                    <td>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate('/orders/new')}>
            <span className="action-icon">➕</span><span>New Order</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/customers')}>
            <span className="action-icon">👤</span><span>Add Customer</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/orders')}>
            <span className="action-icon">📊</span><span>View Orders</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/employees')}>
            <span className="action-icon">💼</span><span>Manage Staff</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
