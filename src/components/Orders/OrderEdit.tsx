import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer;
  garments: Array<{
    _id: string;
    type: string;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
    category?: string;
    fabricName?: string;
    fit?: string;
    style?: string;
  }>;
  deliveryDate: string;
  urgency: string;
  status: string;
  notes: string;
  payment: {
    total: number;
    advance: number;
  };
}

const OrderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState({
    status: '',
    urgency: '',
    deliveryDate: '',
    notes: '',
    advance: 0
  });

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
      const orderData = response.data.data.order;
      setOrder(orderData);

      // Set form data from order
      setFormData({
        status: orderData.status,
        urgency: orderData.urgency,
        deliveryDate: new Date(orderData.deliveryDate).toISOString().split('T')[0],
        notes: orderData.notes || '',
        advance: orderData.payment.advance
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update basic order details
      const updateData = {
        status: formData.status,
        urgency: formData.urgency,
        deliveryDate: formData.deliveryDate,
        notes: formData.notes,
        payment: {
          ...order.payment,
          advance: formData.advance
        },
        customer: order.customer._id,
        garments: order.garments.map(g => ({
          type: g.type,
          name: g.name,
          quantity: g.quantity,
          price: g.price,
          specialInstructions: g.specialInstructions || ''
        }))
      };

      await apiService.updateOrder(order._id, updateData);
      setSuccess('Order updated successfully!');

      setTimeout(() => {
        navigate(`/orders/${order._id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
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

  if (error && !order) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
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

  if (!order) return null;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Order</h1>
            <p className="mt-2 text-sm text-gray-600">
              Order #{order.orderNumber} - {order.customer.name}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/orders/${order._id}`)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              View Details
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="trial_pending">Trial Pending</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Delivery Date */}
          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Date
            </label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleInputChange}
              min={minDate.toISOString().split('T')[0]}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Payment Update */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={formatCurrency(order.payment.total)}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="advance" className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Payment (₹)
                </label>
                <input
                  type="number"
                  id="advance"
                  name="advance"
                  value={formData.advance}
                  onChange={handleInputChange}
                  min="0"
                  max={order.payment.total}
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remaining Balance
                </label>
                <input
                  type="text"
                  value={formatCurrency(order.payment.total - formData.advance)}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="border-t pt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Any special instructions or updates..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Products & Accessories Summary (Read-only) */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Products & Accessories Summary</h3>
            <div className="space-y-3">
              {order.garments.map((garment, index) => (
                <div key={garment._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{garment.name}</span>
                        {garment.category && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            garment.category === 'accessory'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {garment.category.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 capitalize">{garment.type.replace('-', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {garment.quantity} × {formatCurrency(garment.price)} = {formatCurrency(garment.quantity * garment.price)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    {garment.fit && (
                      <div>
                        <span className="font-medium">Fit:</span> <span className="capitalize">{garment.fit}</span>
                      </div>
                    )}
                    {garment.fabricName && (
                      <div>
                        <span className="font-medium">Fabric:</span> <span>{garment.fabricName}</span>
                      </div>
                    )}
                    {garment.style && (
                      <div>
                        <span className="font-medium">Style:</span> <span>{garment.style}</span>
                      </div>
                    )}
                  </div>

                  {garment.specialInstructions && (
                    <div className="mt-2 p-2 bg-white rounded text-sm">
                      <span className="font-medium text-gray-700">Instructions:</span>
                      <p className="text-gray-600">{garment.specialInstructions}</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded font-medium">
                <span>Total:</span>
                <span>{formatCurrency(order.payment.total)}</span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="border-t pt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/orders/${order._id}`)}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {saving ? 'Saving...' : 'Update Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEdit;