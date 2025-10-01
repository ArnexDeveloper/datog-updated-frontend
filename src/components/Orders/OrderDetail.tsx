import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface Fabric {
  _id: string;
  name: string;
  type: string;
  color: string;
}

interface Garment {
  _id: string;
  type: string;
  name: string;
  quantity: number;
  fabric?: Fabric;
  fabricUsed?: number;
  fit: string;
  style?: string;
  specialInstructions?: string;
  price: number;
  status: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer;
  garments: Garment[];
  orderDate: string;
  deliveryDate: string;
  trialDate?: string;
  urgency: string;
  status: string;
  notes: string;
  payment: {
    total: number;
    advance: number;
    balance: number;
    status: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getOrder(id!);
      setOrder(response.data.data.order);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error || 'Order not found'}</div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-2 text-sm text-gray-600">
            Order #{order.orderNumber}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/orders/${order._id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Order
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Orders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
            <div className="flex space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                {order.status.replace('-', ' ').toUpperCase()}
              </span>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getUrgencyColor(order.urgency)}`}>
                {order.urgency.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{order.customer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{order.customer.phone}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{order.customer.email}</p>
              </div>
            </div>
          </div>

          {/* Garments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Garments ({order.garments.length})</h3>
            <div className="space-y-4">
              {order.garments.map((garment, index) => (
                <div key={garment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{garment.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{garment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {garment.quantity} × {formatCurrency(garment.price)} = {formatCurrency(garment.quantity * garment.price)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(garment.status)}`}>
                        {garment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Fit:</span>
                      <span className="ml-2 text-gray-900 capitalize">{garment.fit}</span>
                    </div>
                    {garment.style && (
                      <div>
                        <span className="font-medium text-gray-700">Style:</span>
                        <span className="ml-2 text-gray-900">{garment.style}</span>
                      </div>
                    )}
                    {garment.fabric && (
                      <div>
                        <span className="font-medium text-gray-700">Fabric:</span>
                        <span className="ml-2 text-gray-900">
                          {garment.fabric.name} - {garment.fabric.type} ({garment.fabric.color})
                        </span>
                      </div>
                    )}
                    {garment.fabricUsed && (
                      <div>
                        <span className="font-medium text-gray-700">Fabric Used:</span>
                        <span className="ml-2 text-gray-900">{garment.fabricUsed} meters</span>
                      </div>
                    )}
                  </div>

                  {garment.specialInstructions && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">Special Instructions:</span>
                      <p className="mt-1 text-sm text-gray-900">{garment.specialInstructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Notes</h3>
              <p className="text-gray-900">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">{formatCurrency(order.payment.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Advance Paid:</span>
                <span className="font-medium text-green-600">{formatCurrency(order.payment.advance)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600">Balance Due:</span>
                <span className="font-medium text-red-600">{formatCurrency(order.payment.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  order.payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.payment.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Important Dates</h3>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-medium text-gray-700">Order Date</span>
                <span className="text-sm text-gray-900">{formatDate(order.orderDate)}</span>
              </div>
              {order.trialDate && (
                <div>
                  <span className="block text-sm font-medium text-gray-700">Trial Date</span>
                  <span className="text-sm text-gray-900">{formatDate(order.trialDate)}</span>
                </div>
              )}
              <div>
                <span className="block text-sm font-medium text-gray-700">Delivery Date</span>
                <span className="text-sm text-gray-900">{formatDate(order.deliveryDate)}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">Last Updated</span>
                <span className="text-sm text-gray-900">{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Assignment */}
          {order.assignedTo && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned To</h3>
              <div>
                <p className="font-medium text-gray-900">{order.assignedTo.name}</p>
                <p className="text-sm text-gray-600">{order.assignedTo.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;