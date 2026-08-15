import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import RecordPaymentModal from './RecordPaymentModal';
import OrderActionsDropdown, { DropdownAction } from './OrderActionsDropdown';

const OrdersNew = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    filter: searchParams.get('filter') || '',
    page: 1,
    limit: 10
  });
  const [searchInput, setSearchInput] = useState('');
  const [paymentModalOrder, setPaymentModalOrder] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const clearShortcutFilter = () => {
    setFilters(prev => ({ ...prev, filter: '', page: 1 }));
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('filter');
      return next;
    });
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
    'in-progress': 'bg-purple-100 text-purple-800 border border-purple-200',
    completed: 'bg-green-100 text-green-800 border border-green-200',
    delivered: 'bg-gray-100 text-gray-800 border border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200'
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getOrders(filters);
      setOrders(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleGenerateJobCards = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await apiService.generateJobCardsFromOrder(orderId, {
        priority: 'medium',
        notes: 'Generated from order'
      });

      if (response.data.success) {
        alert(`${response.data.data.length} job card(s) created successfully!`);
        // Optionally navigate to job cards view
        navigate('/job-cards');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to generate job cards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage customer orders and track their progress
          </p>
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Order
        </button>
      </div>

      {/* Shortcut filter chip */}
      {filters.filter === 'balance_due' && (
        <div style={{
          background: '#fffbeb', border: '1px solid #f59e0b', color: '#92400e',
          borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16
        }}>
          Showing: Orders with balance due
          <button
            onClick={clearShortcutFilter}
            aria-label="Clear filter"
            style={{ color: '#92400e', fontSize: 14, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filters.status === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {Object.keys(statusColors).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-3 py-1 text-sm rounded-full capitalize ${
                    filters.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow rounded-lg">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match your current search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.garments?.length || 0} item(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.payment?.total || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {(() => {
                        const actions: DropdownAction[] = [
                          { key: 'view', label: 'View Order', icon: '👁️', onClick: () => navigate(`/orders/${order._id}`) },
                          { key: 'edit', label: 'Edit Order', icon: '✏️', onClick: () => navigate(`/orders/${order._id}/edit`) },
                          { key: 'jobcards', label: 'Generate Job Cards', icon: '🧵', onClick: () => handleGenerateJobCards(order._id) },
                        ];
                        if (order.payment?.balance > 0) {
                          actions.push({ key: 'payment', label: 'Record Payment', icon: '💵', onClick: () => setPaymentModalOrder(order) });
                        }
                        return (
                          <OrderActionsDropdown
                            actions={actions}
                            isOpen={openDropdownId === order._id}
                            onOpen={() => setOpenDropdownId(order._id)}
                            onClose={() => setOpenDropdownId(prev => (prev === order._id ? null : prev))}
                          />
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {orders.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(filters.page - 1) * filters.limit + 1} to{' '}
            {Math.min(filters.page * filters.limit, orders.length)} of {orders.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page <= 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={orders.length < filters.limit}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {paymentModalOrder && (
        <RecordPaymentModal
          orderId={paymentModalOrder._id}
          orderNumber={paymentModalOrder.orderNumber}
          currentBalance={paymentModalOrder.payment?.balance || 0}
          onClose={() => setPaymentModalOrder(null)}
          onSaved={(payment: any) => {
            setOrders(prev => prev.map(o => o._id === paymentModalOrder._id ? { ...o, payment } : o));
            setPaymentModalOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrdersNew;