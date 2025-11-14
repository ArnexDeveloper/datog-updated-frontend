import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import Customers from './components/Customers/Customers';
import Orders from './components/Orders/Orders';
import OrdersNew from './components/Orders/OrdersNew';
import NewOrder from './components/Orders/NewOrder/NewOrder';
import SimpleCreateOrder from './components/Orders/SimpleCreateOrder';
import EnhancedCreateOrder from './components/Orders/EnhancedCreateOrder';
import OrderDetail from './components/Orders/OrderDetail';
import OrderEdit from './components/Orders/OrderEdit';
import OrderDocuments from './components/Orders/OrderDocuments';
import Measurements from './components/Measurements/Measurements';
import Employees from './components/Employees/Employees';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './styles/global.css';
import './App.css';

// Lazy/simple placeholders to avoid breaking imports if components are not yet created
const Fabrics = React.lazy(() => import('./components/Fabrics/Fabrics'));
const JobCards = React.lazy(() => import('./components/JobCards/JobCards'));
const Invoices = React.lazy(() => import('./components/Invoices/Invoices'));
const NotificationsPage = React.lazy(() => import('./components/notifications/NotificationsPage'));

function App() {
  const { isAuthenticated } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getUserData = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
        <div className="App theme-transition">
          <Routes>
            <Route
              path="/login"
              element={
                isLoggedIn ?
                  <Navigate to="/dashboard" replace /> :
                  <Login onLoginSuccess={handleLoginSuccess} />
              }
            />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="app-layout">
                    <Sidebar
                      isCollapsed={sidebarCollapsed}
                      onToggle={toggleSidebar}
                    />
                    <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                      <Header
                        user={getUserData()}
                        onLogout={handleLogout}
                      />
                      <div className="content-area">
                        <React.Suspense fallback={<div className="loading"><div className="spinner"></div>Loading...</div>}>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/orders" element={<OrdersNew />} />
                            <Route path="/orders/old" element={<Orders />} />
                            <Route path="/orders/new" element={<EnhancedCreateOrder />} />
                            <Route path="/orders/new-simple" element={<SimpleCreateOrder />} />
                            <Route path="/orders/new-stepper" element={<NewOrder />} />
                            <Route path="/orders/:id" element={<OrderDetail />} />
                            <Route path="/orders/:id/edit" element={<OrderEdit />} />
                            <Route path="/orders/:orderId/documents" element={<OrderDocuments />} />
                            <Route path="/measurements" element={<Measurements />} />
                            <Route path="/employees" element={<Employees />} />
                            <Route path="/job-cards" element={<JobCards />} />
                            <Route path="/fabrics" element={<Fabrics />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                          </Routes>
                        </React.Suspense>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
