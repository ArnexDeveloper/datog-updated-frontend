import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationBell from '../notifications/NotificationBell';
import { apiService } from '../../services/api';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchData, setSearchData] = useState({
    customers: [],
    orders: [],
    invoices: [],
    fabrics: []
  });
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const { toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Define quick links and navigation options
  const quickLinks = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard', category: 'Navigation' },
    { icon: '👥', label: 'Customers', path: '/customers', category: 'Navigation' },
    { icon: '📋', label: 'Orders', path: '/orders', category: 'Navigation' },
    { icon: '📏', label: 'Measurements', path: '/measurements', category: 'Navigation' },
    { icon: '👔', label: 'Job Cards', path: '/job-cards', category: 'Navigation' },
    { icon: '🧵', label: 'Fabrics', path: '/fabrics', category: 'Navigation' },
    { icon: '💰', label: 'Invoices', path: '/invoices', category: 'Navigation' },
    { icon: '🔔', label: 'Notifications', path: '/notifications', category: 'Navigation' },
    { icon: '⚙️', label: 'Settings', path: '/settings', category: 'Navigation' },
  ];

  const quickActions = [
    { icon: '➕', label: 'Add New Customer', path: '/customers?action=new', category: 'Quick Actions' },
    { icon: '🛍️', label: 'Create Order', path: '/orders?action=new', category: 'Quick Actions' },
    { icon: '📝', label: 'New Job Card', path: '/job-cards?action=new', category: 'Quick Actions' },
    { icon: '💳', label: 'Generate Invoice', path: '/invoices?action=new', category: 'Quick Actions' },
    { icon: '📈', label: 'View Reports', path: '/dashboard', category: 'Quick Actions' },
    { icon: '🔍', label: 'Advanced Search', path: '/search', category: 'Quick Actions' },
  ];

  // Fetch search data when component mounts
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [customersRes, ordersRes, invoicesRes, fabricsRes] = await Promise.all([
          apiService.getCustomers({ limit: 10 }),
          apiService.getOrders({ limit: 10 }),
          apiService.getInvoices({ limit: 10 }),
          apiService.getFabrics({ limit: 10 })
        ]);

        setSearchData({
          customers: customersRes.data?.data?.customers || [],
          orders: ordersRes.data?.data?.orders || [],
          invoices: invoicesRes.data?.data?.invoices || [],
          fabrics: fabricsRes.data?.data?.fabrics || []
        });
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    };

    fetchSearchData();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to a search results page or filter current page
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const handleQuickLinkClick = (link) => {
    navigate(link.path);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const getSearchResults = () => {
    if (!searchQuery.trim()) {
      return {
        navigation: quickLinks,
        actions: quickActions,
        customers: [],
        orders: [],
        invoices: [],
        fabrics: []
      };
    }

    const query = searchQuery.toLowerCase();

    // Filter navigation links
    const filteredNavigation = quickLinks.filter(link =>
      link.label.toLowerCase().includes(query)
    );

    // Filter actions
    const filteredActions = quickActions.filter(action =>
      action.label.toLowerCase().includes(query)
    );

    // Filter real data
    const filteredCustomers = searchData.customers.filter(customer =>
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.email?.toLowerCase().includes(query)
    ).slice(0, 5);

    const filteredOrders = searchData.orders.filter(order =>
      order.orderNumber?.toLowerCase().includes(query) ||
      order.customer?.name?.toLowerCase().includes(query)
    ).slice(0, 5);

    const filteredInvoices = searchData.invoices.filter(invoice =>
      invoice.invoiceNumber?.toLowerCase().includes(query) ||
      invoice.customer?.name?.toLowerCase().includes(query)
    ).slice(0, 5);

    const filteredFabrics = searchData.fabrics.filter(fabric =>
      fabric.name?.toLowerCase().includes(query) ||
      fabric.color?.toLowerCase().includes(query) ||
      fabric.type?.toLowerCase().includes(query)
    ).slice(0, 5);

    return {
      navigation: filteredNavigation,
      actions: filteredActions,
      customers: filteredCustomers,
      orders: filteredOrders,
      invoices: filteredInvoices,
      fabrics: filteredFabrics
    };
  };

  const handleDataItemClick = (type, item) => {
    switch (type) {
      case 'customer':
        navigate(`/customers/${item._id}`);
        break;
      case 'order':
        navigate(`/orders/${item._id}`);
        break;
      case 'invoice':
        navigate(`/invoices/${item._id}`);
        break;
      case 'fabric':
        navigate(`/fabrics/${item._id}`);
        break;
      default:
        break;
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Datog Designer Lounge</h1>
        </div>

        <div className="flex-1 max-w-lg mx-8" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers, orders, invoices..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSearchResults(true)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>

          {showSearchResults && (
            <div className="search-dropdown">
              <div className="search-results">
                {(() => {
                  const results = getSearchResults();
                  const hasResults = results.navigation.length > 0 || results.actions.length > 0 ||
                                   results.customers.length > 0 || results.orders.length > 0 ||
                                   results.invoices.length > 0 || results.fabrics.length > 0;

                  if (searchQuery.trim() === '') {
                    return (
                      <>
                        <div className="search-section">
                          <div className="search-section-title">Quick Navigation</div>
                          {results.navigation.map((link, index) => (
                            <button
                              key={index}
                              className="search-item search-item-small"
                              onClick={() => handleQuickLinkClick(link)}
                            >
                              <span className="search-icon">{link.icon}</span>
                              <span className="search-label">{link.label}</span>
                            </button>
                          ))}
                        </div>
                        <div className="search-divider"></div>
                        <div className="search-section">
                          <div className="search-section-title">Quick Actions</div>
                          {results.actions.map((action, index) => (
                            <button
                              key={index}
                              className="search-item search-item-small"
                              onClick={() => handleQuickLinkClick(action)}
                            >
                              <span className="search-icon">{action.icon}</span>
                              <span className="search-label">{action.label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  }

                  if (!hasResults) {
                    return (
                      <div className="search-no-results">
                        <span className="search-icon">🔍</span>
                        <span>No results found for "{searchQuery}"</span>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Navigation Results */}
                      {results.navigation.length > 0 && (
                        <>
                          <div className="search-section">
                            <div className="search-section-title">Navigation</div>
                            {results.navigation.map((link, index) => (
                              <button
                                key={index}
                                className="search-item search-item-small"
                                onClick={() => handleQuickLinkClick(link)}
                              >
                                <span className="search-icon">{link.icon}</span>
                                <span className="search-label">{link.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="search-divider"></div>
                        </>
                      )}

                      {/* Action Results */}
                      {results.actions.length > 0 && (
                        <>
                          <div className="search-section">
                            <div className="search-section-title">Actions</div>
                            {results.actions.map((action, index) => (
                              <button
                                key={index}
                                className="search-item search-item-small"
                                onClick={() => handleQuickLinkClick(action)}
                              >
                                <span className="search-icon">{action.icon}</span>
                                <span className="search-label">{action.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="search-divider"></div>
                        </>
                      )}

                      {/* Customer Results */}
                      {results.customers.length > 0 && (
                        <>
                          <div className="search-section">
                            <div className="search-section-title">Customers</div>
                            {results.customers.map((customer, index) => (
                              <button
                                key={index}
                                className="search-item search-item-small"
                                onClick={() => handleDataItemClick('customer', customer)}
                              >
                                <span className="search-icon">👤</span>
                                <span className="search-label">{customer.name}</span>
                                <span className="search-category">{customer.phone}</span>
                              </button>
                            ))}
                          </div>
                          <div className="search-divider"></div>
                        </>
                      )}

                      {/* Order Results */}
                      {results.orders.length > 0 && (
                        <>
                          <div className="search-section">
                            <div className="search-section-title">Orders</div>
                            {results.orders.map((order, index) => (
                              <button
                                key={index}
                                className="search-item search-item-small"
                                onClick={() => handleDataItemClick('order', order)}
                              >
                                <span className="search-icon">📋</span>
                                <span className="search-label">{order.orderNumber}</span>
                                <span className="search-category">{order.customer?.name}</span>
                              </button>
                            ))}
                          </div>
                          <div className="search-divider"></div>
                        </>
                      )}

                      {/* Invoice Results */}
                      {results.invoices.length > 0 && (
                        <>
                          <div className="search-section">
                            <div className="search-section-title">Invoices</div>
                            {results.invoices.map((invoice, index) => (
                              <button
                                key={index}
                                className="search-item search-item-small"
                                onClick={() => handleDataItemClick('invoice', invoice)}
                              >
                                <span className="search-icon">💰</span>
                                <span className="search-label">{invoice.invoiceNumber}</span>
                                <span className="search-category">₹{invoice.charges?.total}</span>
                              </button>
                            ))}
                          </div>
                          <div className="search-divider"></div>
                        </>
                      )}

                      {/* Fabric Results */}
                      {results.fabrics.length > 0 && (
                        <>
                          <div className="search-section">
                            <div className="search-section-title">Fabrics</div>
                            {results.fabrics.map((fabric, index) => (
                              <button
                                key={index}
                                className="search-item search-item-small"
                                onClick={() => handleDataItemClick('fabric', fabric)}
                              >
                                <span className="search-icon">🧵</span>
                                <span className="search-label">{fabric.name}</span>
                                <span className="search-category">{fabric.color}</span>
                              </button>
                            ))}
                          </div>
                          <div className="search-divider"></div>
                        </>
                      )}

                      {/* Global Search Option */}
                      <button
                        className="search-item search-submit"
                        onClick={() => handleSearchSubmit({ preventDefault: () => {} })}
                      >
                        <span className="search-icon">🔍</span>
                        <span className="search-label">Search all for "{searchQuery}"</span>
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</div>
                <div className="text-xs text-gray-500">{user?.role || 'Administrator'}</div>
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user?.name || 'Admin User'}</div>
                      <div className="text-sm text-gray-500">{user?.email || 'admin@designerlounge.com'}</div>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                    <span className="ml-auto text-xs text-blue-500">Soon</span>
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    disabled
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Change Password
                    <span className="ml-auto text-xs text-blue-500">Soon</span>
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={toggleTheme}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d={isDark ? "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" : "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"} />
                    </svg>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      
    </header>
  );
};

export default Header;