import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  pricePerUnit: number;
}

const SimpleCreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState({
    customer: '',
    garmentType: 'shirt',
    garmentName: '',
    quantity: 1,
    fabric: '',
    price: 0,
    deliveryDate: '',
    urgency: 'medium',
    notes: '',
    advance: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersRes, fabricsRes] = await Promise.all([
        apiService.getCustomers({ isActive: 'true', limit: 100 }),
        apiService.getFabrics({ limit: 100 })
      ]);

      if (customersRes.data.success) {
        setCustomers(customersRes.data.data);
      }
      if (fabricsRes.data.success) {
        setFabrics(fabricsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load customers and fabrics');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const orderData = {
        customer: formData.customer,
        garments: [{
          type: formData.garmentType,
          name: formData.garmentName,
          quantity: formData.quantity,
          fabric: formData.fabric || undefined,
          price: formData.price
        }],
        deliveryDate: formData.deliveryDate,
        urgency: formData.urgency,
        notes: formData.notes,
        payment: {
          total: formData.price * formData.quantity,
          advance: formData.advance
        }
      };

      const response = await apiService.createOrder(orderData);

      if (response.data.success) {
        setSuccess('Order created successfully!');
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
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

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
            <p className="mt-2 text-sm text-gray-600">
              Simple order creation for testing
            </p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Orders
          </button>
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
          {/* Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date *
              </label>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                min={minDate.toISOString().split('T')[0]}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Garment Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Garment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="garmentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Garment Type *
                </label>
                <select
                  id="garmentType"
                  name="garmentType"
                  value={formData.garmentType}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="shirt">Shirt</option>
                  <option value="pant">Pant</option>
                  <option value="suit">Suit</option>
                  <option value="blazer">Blazer</option>
                  <option value="kurta">Kurta</option>
                  <option value="pajama">Pajama</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="garmentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Garment Name *
                </label>
                <input
                  type="text"
                  id="garmentName"
                  name="garmentName"
                  value={formData.garmentName}
                  onChange={handleInputChange}
                  placeholder="e.g., Formal Shirt"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price per piece (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="fabric" className="block text-sm font-medium text-gray-700 mb-2">
                  Fabric (Optional)
                </label>
                <select
                  id="fabric"
                  name="fabric"
                  value={formData.fabric}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Fabric</option>
                  {fabrics.map(fabric => (
                    <option key={fabric._id} value={fabric._id}>
                      {fabric.name} - {fabric.type} ({fabric.color}) - ₹{fabric.pricePerUnit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
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
          </div>

          {/* Payment Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.price * formData.quantity}
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
                  max={formData.price * formData.quantity}
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remaining Amount (₹)
                </label>
                <input
                  type="number"
                  value={(formData.price * formData.quantity) - formData.advance}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any special instructions or notes..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="border-t pt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleCreateOrder;