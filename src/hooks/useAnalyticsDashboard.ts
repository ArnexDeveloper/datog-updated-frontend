import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';

export type Period = 'today' | 'week' | 'month' | 'year';
export type ChartView = 'daily' | 'weekly' | 'monthly';

export interface Kpis {
  revenue: number;
  revenue_change: number;
  advance_collected: number;
  total_orders: number;
  orders_change: number;
  new_customers: number;
  total_customers: number;
  customers_change: number;
  pending_orders: number;
  overdue_orders: number;
}

export interface SalesChartPoint { label: string; revenue: number; orders: number; }
export interface OrderStatusEntry { status: string; label: string; count: number; percentage: number; }
export interface EmployeeStat { id: string; name: string; role: string; orders: number; revenue: number; }
export interface TopProduct { name: string; count: number; }
export interface RecentOrder {
  id: string; order_number: string; customer_name: string; amount: number;
  status: string; delivery_date: string; created_at: string;
}
export interface RevenueTrendMonth {
  month_label: string; year: number; month: number; revenue: number; orders: number; is_current_month: boolean;
}
export interface QuickMetricsData {
  avg_delivery_days: number; repeat_customer_pct: number; avg_order_value: number;
  package_order_pct: number; advance_collection_pct: number;
}

interface DateRange { start: string | null; end: string | null; }

const useAnalyticsDashboard = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [chartView, setChartView] = useState<ChartView>('weekly');
  const [employeePeriod, setEmployeePeriod] = useState<Period>('month');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [salesChart, setSalesChart] = useState<SalesChartPoint[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusEntry[]>([]);
  const [employees, setEmployees] = useState<EmployeeStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendMonth[]>([]);
  const [yoyChange, setYoyChange] = useState(0);
  const [quickMetrics, setQuickMetrics] = useState<QuickMetricsData | null>(null);

  const periodParams = useCallback(() => (
    dateRange.start && dateRange.end
      ? { startDate: dateRange.start, endDate: dateRange.end }
      : { period }
  ), [period, dateRange]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = periodParams();
      const [kpiRes, chartRes, statusRes, empRes, prodRes, ordRes, trendRes, metricsRes] = await Promise.all([
        apiService.getAnalyticsKpis(params),
        apiService.getAnalyticsSalesChart({ ...params, view: chartView }),
        apiService.getAnalyticsOrderStatus(),
        apiService.getAnalyticsEmployees({ period: employeePeriod }),
        apiService.getAnalyticsTopProducts(params),
        apiService.getAnalyticsRecentOrders(),
        apiService.getAnalyticsRevenueTrend(),
        apiService.getAnalyticsQuickMetrics(),
      ]);

      setKpis(kpiRes.data.data);
      setSalesChart(chartRes.data.data);
      setOrderStatus(statusRes.data.data.statuses);
      setEmployees(empRes.data.data.employees);
      setTopProducts(prodRes.data.data.products);
      setRecentOrders(ordRes.data.data.orders);
      setRevenueTrend(trendRes.data.data.months);
      setYoyChange(trendRes.data.data.yoy_change);
      setQuickMetrics(metricsRes.data.data);
    } catch (err) {
      console.error('Analytics dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [periodParams, chartView, employeePeriod]);

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, [period, dateRange]);

  useEffect(() => {
    apiService.getAnalyticsSalesChart({ ...periodParams(), view: chartView })
      .then(res => setSalesChart(res.data.data))
      .catch(err => console.error('Sales chart fetch error:', err));
    /* eslint-disable-next-line */
  }, [chartView]);

  useEffect(() => {
    apiService.getAnalyticsEmployees({ period: employeePeriod })
      .then(res => setEmployees(res.data.data.employees))
      .catch(err => console.error('Employees fetch error:', err));
  }, [employeePeriod]);

  return {
    period, setPeriod,
    chartView, setChartView,
    employeePeriod, setEmployeePeriod,
    dateRange, setDateRange,
    kpis, salesChart, orderStatus, employees,
    topProducts, recentOrders, revenueTrend, yoyChange, quickMetrics,
    loading, refetch: fetchAll,
  };
};

export default useAnalyticsDashboard;
