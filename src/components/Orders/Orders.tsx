import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import CustomModal from '../Employees/CustomModal';
import CustomSelect from '../Employees/CustomSelect';
import OrderStepper from './OrderStepper';
import { apiService } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showOrderStepper, setShowOrderStepper] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    dateRange: 'all',
    customer: 'all'
  });
  const [showJobCardForm, setShowJobCardForm] = useState(false);
  const [selectedOrderForJobCard, setSelectedOrderForJobCard] = useState(null);

  const { actions } = useNotifications();
  const showNotification = (message, type) => {
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadFabrics();
    loadMeasurements();
    loadEmployees();
    loadStats();
  }, [currentPage, searchTerm, filters, sortBy, sortOrder]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        forceCloseAllModals();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const forceCloseAllModals = () => {
    setShowOrderStepper(false);
    setShowOrderDetail(false);
    setShowJobCardForm(false);
    setEditingOrder(null);
    setSelectedOrder(null);
    setSelectedOrderForJobCard(null);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: filters.status === 'all' ? undefined : filters.status,
        urgency: filters.urgency === 'all' ? undefined : filters.urgency,
        sortBy,
        sortOrder
      };

      const response = await apiService.getOrders(params);
      if (response.data.success) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Failed to load orders');
      showNotification('Failed to load orders', 'error');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await apiService.getCustomers({ limit: 100 });
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadStats = async () => {
    // Stats functionality to be implemented when backend API is available
    try {
      // For now, just calculate basic stats from the orders
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const inProgressOrders = orders.filter(order => order.status === 'in_progress').length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;

      setStats({
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
  };

  const loadFabrics = async () => {
    try {
      const response = await apiService.getFabrics({ limit: 100 });
      if (response.data.success) {
        setFabrics(response.data.data);
      }
    } catch (err) {
      console.error('Error loading fabrics:', err);
    }
  };

  const loadMeasurements = async () => {
    try {
      const response = await apiService.getMeasurements({ limit: 100 });
      if (response.data.success) {
        setMeasurements(response.data.data);
      }
    } catch (err) {
      console.error('Error loading measurements:', err);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await apiService.getEmployees({ limit: 100 });
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const handleUrgencyFilter = (urgency) => {
    setFilters(prev => ({ ...prev, urgency }));
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleOrderClick = async (order) => {
    try {
      const response = await apiService.getOrder(order._id);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setShowOrderDetail(true);
      }
    } catch (err) {
      showNotification('Failed to load order details', 'error');
    }
  };

  const handleAddOrder = () => {
    setEditingOrder(null);
    setShowOrderStepper(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowOrderStepper(true);
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      setLoading(true);
      if (editingOrder) {
        await apiService.updateOrder(editingOrder._id, orderData);
        showNotification('Order updated successfully', 'success');
      } else {
        await apiService.createOrder(orderData);
        showNotification('Order created successfully', 'success');
      }
      setShowOrderStepper(false);
      setEditingOrder(null);
      loadOrders();
      loadStats();
    } catch (err) {
      const message = err.response?.data?.message || (editingOrder ? 'Failed to update order' : 'Failed to create order');
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStepperCancel = () => {
    setShowOrderStepper(false);
    setEditingOrder(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await apiService.deleteOrder(orderId);
        showNotification('Order deleted successfully', 'success');
        loadOrders();
        loadStats();
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to delete order';
        showNotification(message, 'error');
      }
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      showNotification('Order status updated successfully', 'success');
      loadOrders();
      loadStats();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update order status';
      showNotification(message, 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      case 'urgent': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <h1>Order Management</h1>
          <p className="text-muted-foreground">Manage customer orders and track their progress</p>
        </div>
        <div className="orders-header-actions">
          <Button onClick={handleAddOrder}>
            Create New Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <span className="h-4 w-4">📋</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <span className="h-4 w-4">⏳</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <span className="h-4 w-4">🔄</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <span className="h-4 w-4">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="orders-filters">
            <div className="search-container">
              <Input
                placeholder="Search orders by customer name, order ID, or phone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-row">
              <div className="filter-group">
                <Label htmlFor="status-filter">Status</Label>
                <CustomSelect
                  value={filters.status}
                  onValueChange={handleStatusFilter}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'delivered', label: 'Delivered' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                  placeholder="Filter by status"
                />
              </div>

              <div className="filter-group">
                <Label htmlFor="urgency-filter">Urgency</Label>
                <CustomSelect
                  value={filters.urgency}
                  onValueChange={handleUrgencyFilter}
                  options={[
                    { value: 'all', label: 'All Urgency' },
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' }
                  ]}
                  placeholder="Filter by urgency"
                />
              </div>

              <div className="filter-group">
                <Label htmlFor="sort-by">Sort By</Label>
                <CustomSelect
                  value={sortBy}
                  onValueChange={setSortBy}
                  options={[
                    { value: 'orderDate', label: 'Order Date' },
                    { value: 'deliveryDate', label: 'Delivery Date' },
                    { value: 'customerName', label: 'Customer Name' },
                    { value: 'status', label: 'Status' },
                    { value: 'totalAmount', label: 'Total Amount' }
                  ]}
                  placeholder="Sort by"
                />
              </div>

              <div className="filter-group">
                <Label htmlFor="sort-order">Order</Label>
                <CustomSelect
                  value={sortOrder}
                  onValueChange={setSortOrder}
                  options={[
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' }
                  ]}
                  placeholder="Sort order"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              Loading orders...
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <Button onClick={loadOrders} variant="outline">
                Retry
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found</p>
              {searchTerm && (
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="orders-grid">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="order-card"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="order-card-header">
                      <div className="order-info">
                        <h3>Order #{order.orderNumber || order._id.slice(-6)}</h3>
                        <p className="customer-name">{order.customer?.name || 'Unknown Customer'}</p>
                        <p className="customer-phone">{order.customer?.phone}</p>
                      </div>
                      <div className="order-badges">
                        <Badge variant={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge variant={getUrgencyBadgeColor(order.urgency)}>
                          {order.urgency}
                        </Badge>
                      </div>
                    </div>

                    <div className="order-card-body">
                      <div className="order-details">
                        <div className="detail-item">
                          <span className="detail-label">Garments:</span>
                          <span>{order.garments?.length || 0}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Total:</span>
                          <span className="amount">₹{order.payment?.total || 0}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Advance:</span>
                          <span className="amount">₹{order.payment?.advance || 0}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Balance:</span>
                          <span className="amount">₹{(order.payment?.total || 0) - (order.payment?.advance || 0)}</span>
                        </div>
                      </div>

                      <div className="order-dates">
                        <div className="date-item">
                          <span className="date-label">Order Date:</span>
                          <span>{formatDate(order.orderDate)}</span>
                        </div>
                        <div className="date-item">
                          <span className="date-label">Delivery:</span>
                          <span>{formatDate(order.deliveryDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="order-card-actions">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order._id}/documents`);
                        }}
                      >
                        🖨️ Print
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrder(order);
                        }}
                      >
                        Edit
                      </Button>
                      <CustomSelect
                        value={order.status}
                        onValueChange={(newStatus) => {
                          handleStatusUpdate(order._id, newStatus);
                        }}
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'in_progress', label: 'In Progress' },
                          { value: 'completed', label: 'Completed' },
                          { value: 'delivered', label: 'Delivered' },
                          { value: 'cancelled', label: 'Cancelled' }
                        ]}
                        placeholder="Update status"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order._id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <Button
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>

                  <span className="pagination-info">
                    Page {currentPage} of {pagination.pages} ({pagination.total} total)
                  </span>

                  <Button
                    variant="outline"
                    disabled={currentPage >= pagination.pages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Stepper Modal */}
      <CustomModal
        isOpen={showOrderStepper}
        onClose={handleOrderStepperCancel}
        title={editingOrder ? 'Edit Order' : 'Create New Order'}
        size="xl"
      >
        <OrderStepper
          order={editingOrder}
          onSubmit={handleOrderSubmit}
          onCancel={handleOrderStepperCancel}
          loading={loading}
        />
      </CustomModal>

      {/* Order Detail Modal */}
      <CustomModal
        isOpen={showOrderDetail}
        onClose={() => setShowOrderDetail(false)}
        title="Order Details"
        size="xl"
      >
        {selectedOrder && (
          <div className="order-detail">
            <div className="order-detail-header">
              <h3>Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</h3>
              <div className="order-detail-badges">
                <Badge variant={getStatusBadgeColor(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
                <Badge variant={getUrgencyBadgeColor(selectedOrder.urgency)}>
                  {selectedOrder.urgency}
                </Badge>
              </div>
            </div>

            <div className="order-detail-content">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
                <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
              </div>

              <div className="detail-section">
                <h4>Order Information</h4>
                <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
                <p><strong>Delivery Date:</strong> {formatDate(selectedOrder.deliveryDate)}</p>
                <p><strong>Urgency:</strong> {selectedOrder.urgency}</p>
                {selectedOrder.notes && (
                  <p><strong>Notes:</strong> {selectedOrder.notes}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Payment Information</h4>
                <p><strong>Total Amount:</strong> ₹{selectedOrder.payment?.total || 0}</p>
                <p><strong>Advance Paid:</strong> ₹{selectedOrder.payment?.advance || 0}</p>
                <p><strong>Balance Due:</strong> ₹{(selectedOrder.payment?.total || 0) - (selectedOrder.payment?.advance || 0)}</p>
              </div>

              <div className="detail-section">
                <h4>Garments ({selectedOrder.garments?.length || 0})</h4>
                {selectedOrder.garments?.map((garment, index) => (
                  <div key={index} className="garment-detail">
                    <h5>Garment {index + 1}</h5>
                    <p><strong>Type:</strong> {garment.type}</p>
                    <p><strong>Fabric:</strong> {garment.fabric?.name}</p>
                    <p><strong>Quantity:</strong> {garment.quantity}</p>
                    <p><strong>Price:</strong> ₹{garment.price}</p>
                    {garment.measurements && (
                      <div className="measurements">
                        <strong>Measurements:</strong>
                        <ul>
                          {Object.entries(garment.measurements).map(([key, value]) => (
                            <li key={key}>{key}: {String(value)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-actions">
              <Button
                onClick={() => {
                  navigate(`/orders/${selectedOrder._id}/documents`);
                  setShowOrderDetail(false);
                }}
              >
                🖨️ Print Documents
              </Button>
              <Button
                onClick={() => {
                  setShowOrderDetail(false);
                  handleEditOrder(selectedOrder);
                }}
              >
                Edit Order
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowOrderDetail(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default Orders;