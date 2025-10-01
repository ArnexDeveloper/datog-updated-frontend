import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    orders: 0,
    customers: 0,
    invoices: 0,
    users: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load admin dashboard data
      const dashboardResponse = await apiService.getAdminDashboard();
      if (dashboardResponse.data.success) {
        const dashboardData = dashboardResponse.data.data;
        setStats({
          orders: dashboardData.overview.totalOrders,
          customers: dashboardData.overview.totalCustomers,
          invoices: 0, // Will be updated when invoices are implemented
          users: dashboardData.overview.totalEmployees
        });

        // Map backend order data to frontend format
        const mappedOrders = dashboardData.recentOrders.map((order: any) => ({
          id: order.orderNumber,
          customer: order.customer.name,
          garment: order.garments?.[0]?.name || 'N/A',
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
          date: new Date(order.createdAt).toLocaleDateString()
        }));
        setRecentOrders(mappedOrders);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={loadDashboardData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Elite Designer Lounge Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orders">📋</div>
          <div className="stat-content">
            <h3>{stats.orders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">👥</div>
          <div className="stat-content">
            <h3>{stats.customers}</h3>
            <p>Customers</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon invoices">💰</div>
          <div className="stat-content">
            <h3>{stats.invoices}</h3>
            <p>Invoices</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon users">⚙️</div>
          <div className="stat-content">
            <h3>{stats.users}</h3>
            <p>System Users</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-content">
        <div className="recent-orders">
          <h2>Recent Orders</h2>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Garment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.garment}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions - Below Orders Table */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate('/orders/new')}>
            <span className="action-icon">➕</span>
            <span>New Order</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/customers')}>
            <span className="action-icon">👤</span>
            <span>Add Customer</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/orders')}>
            <span className="action-icon">📊</span>
            <span>View Orders</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/employees')}>
            <span className="action-icon">💼</span>
            <span>Manage Staff</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;