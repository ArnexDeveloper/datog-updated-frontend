import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      path: '/dashboard',
      active: true
    },
    {
      icon: '👥',
      label: 'Customers',
      path: '/customers',
      active: true,
      comingSoon: false
    },
    {
      icon: '📋',
      label: 'Orders',
      path: '/orders',
      active: true,
      comingSoon: false
    },
    {
      icon: '📏',
      label: 'Measurements',
      path: '/measurements',
      active: true,
      comingSoon: false
    },
    {
      icon: '👨‍💼',
      label: 'Employees',
      path: '/employees',
      active: true,
      comingSoon: false
    },
    {
      icon: '👔',
      label: 'Job Cards',
      path: '/job-cards',
      active: true,
      comingSoon: false
    },
    {
      icon: '🧵',
      label: 'Fabrics',
      path: '/fabrics',
      active: true,
      comingSoon: false
    },
    {
      icon: '💰',
      label: 'Invoices',
      path: '/invoices',
      active: true,
      comingSoon: false
    },
    {
      icon: '🔔',
      label: 'Notifications',
      path: '/notifications',
      active: true,
      comingSoon: false
    },
    {
      icon: '⚙️',
      label: 'Settings',
      path: '/settings',
      active: true
    }
  ];

  const handleNavigation = (item) => {
    if (item.comingSoon) {
      return;
    }
    navigate(item.path);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">✂️</span>
          {!isCollapsed && (
            <div className="logo-text">
              <h3>Designer Lounge</h3>
              <span>Management System</span>
            </div>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <button
                className={`nav-link ${isActivePath(item.path) ? 'active' : ''} ${item.comingSoon ? 'disabled' : ''}`}
                onClick={() => handleNavigation(item)}
                disabled={item.comingSoon}
                title={isCollapsed ? item.label : (item.comingSoon ? 'Coming Soon' : '')}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="nav-label">
                    {item.label}
                    {item.comingSoon && <span className="coming-soon-badge">Soon</span>}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="system-status">
            <div className="status-indicator online"></div>
            <span>System Online</span>
          </div>
          <div className="version-info">
            Version 1.0.0
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;