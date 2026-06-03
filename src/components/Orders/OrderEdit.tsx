import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

interface MeasurementData {
  _id?: string;
  chest?: number;
  bust?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  armLength?: number;
  armHole?: number;
  neck?: number;
  shirtLength?: number;
  inseam?: number;
  outseam?: number;
  thigh?: number;
  knee?: number;
  calf?: number;
  ankle?: number;
  rise?: number;
  blouseLength?: number;
  skirtLength?: number;
  dressLength?: number;
  notes?: string;
  [key: string]: any;
}

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
    imageUrl?: string;
    measurements?: MeasurementData;
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

// Returns measurement fields relevant to a garment type
const getMeasurementFields = (type: string): { key: string; label: string; placeholder: string }[] => {
  const t = type.toLowerCase();
  if (['shirt', 'kurta', 'kurti', 'kamize', 'pathni', 'jubba', 'blouse'].includes(t))
    return [
      { key: 'chest', label: 'Chest/Bust', placeholder: '40' },
      { key: 'waist', label: 'Waist', placeholder: '34' },
      { key: 'shoulder', label: 'Shoulder', placeholder: '18' },
      { key: 'armLength', label: 'Sleeve', placeholder: '24' },
      { key: 'shirtLength', label: 'Length', placeholder: '30' },
      { key: 'neck', label: 'Neck', placeholder: '16' },
    ];
  if (['trousers', 'pant', 'pajamas', 'shalwars', 'dhoti'].includes(t))
    return [
      { key: 'waist', label: 'Waist', placeholder: '32' },
      { key: 'hip', label: 'Hip', placeholder: '38' },
      { key: 'outseam', label: 'Length', placeholder: '42' },
      { key: 'inseam', label: 'Inseam', placeholder: '32' },
      { key: 'thigh', label: 'Thigh', placeholder: '24' },
    ];
  if (['blazer', 'jacket', 'west-coat', 'sherwani', 'over-coat', 'trench-coat'].includes(t))
    return [
      { key: 'chest', label: 'Chest', placeholder: '42' },
      { key: 'waist', label: 'Waist', placeholder: '36' },
      { key: 'shoulder', label: 'Shoulder', placeholder: '19' },
      { key: 'armLength', label: 'Sleeve', placeholder: '25' },
      { key: 'shirtLength', label: 'Length', placeholder: '28' },
    ];
  if (['gowne', 'one-pec', 'kaftan', 'dress'].includes(t))
    return [
      { key: 'bust', label: 'Bust', placeholder: '36' },
      { key: 'waist', label: 'Waist', placeholder: '28' },
      { key: 'hip', label: 'Hip', placeholder: '38' },
      { key: 'shoulder', label: 'Shoulder', placeholder: '16' },
      { key: 'dressLength', label: 'Dress Length', placeholder: '42' },
    ];
  if (['skirts', 'garara', 'sharara', 'skirt'].includes(t))
    return [
      { key: 'waist', label: 'Waist', placeholder: '28' },
      { key: 'hip', label: 'Hip', placeholder: '38' },
      { key: 'skirtLength', label: 'Length', placeholder: '40' },
    ];
  return [
    { key: 'chest', label: 'Chest/Bust', placeholder: '40' },
    { key: 'waist', label: 'Waist', placeholder: '34' },
    { key: 'shoulder', label: 'Shoulder', placeholder: '18' },
    { key: 'shirtLength', label: 'Length', placeholder: '30' },
  ];
};

const VALID_GARMENT_TYPES = [
  'shirt','pant','suit','blazer','kurta','pajama','sherwani',
  'lehenga','saree_blouse','dress','skirt','top','jacket',
  'coat','waistcoat','dhoti','churidar','salwar','dupatta'
];

const resolveGarmentType = (type: string): string => {
  const t = type.toLowerCase();
  if (VALID_GARMENT_TYPES.includes(t)) return t;
  if (['trousers', 'pajamas', 'shalwars'].includes(t)) return 'pant';
  if (['kurti', 'kamize', 'pathni', 'jubba'].includes(t)) return 'kurta';
  if (['west-coat'].includes(t)) return 'waistcoat';
  if (['gowne', 'one-pec', 'kaftan'].includes(t)) return 'dress';
  if (['skirts', 'garara', 'sharara'].includes(t)) return 'skirt';
  return 'other';
};

const OrderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [expandedMeasurements, setExpandedMeasurements] = useState<{ [key: number]: boolean }>({});

  const [formData, setFormData] = useState({
    status: '',
    urgency: '',
    deliveryDate: '',
    notes: '',
    advance: 0,
    garments: [] as any[]
  });

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getOrder(id!);
      const orderData = response.data.data.order;
      setOrder(orderData);

      setFormData({
        status: orderData.status,
        urgency: orderData.urgency,
        deliveryDate: new Date(orderData.deliveryDate).toISOString().split('T')[0],
        notes: orderData.notes || '',
        advance: orderData.payment.advance,
        garments: (orderData.garments || []).map((g: any) => ({
          ...g,
          measurements: typeof g.measurements === 'object' && g.measurements !== null
            ? { ...g.measurements }
            : undefined
        }))
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

  const handleGarmentChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      garments: prev.garments.map((g, i) =>
        i === index ? { ...g, [field]: value } : g
      )
    }));
  };

  const handleMeasurementChange = (garmentIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      garments: prev.garments.map((g, i) => {
        if (i !== garmentIndex) return g;
        const existing = g.measurements || {};
        return {
          ...g,
          measurements: {
            ...existing,
            [field]: value === '' ? undefined : parseFloat(value)
          }
        };
      })
    }));
  };

  const toggleMeasurements = (index: number) => {
    setExpandedMeasurements(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Save/update measurements for each garment first
      const garmentsWithUpdatedMeasurements = await Promise.all(
        formData.garments.map(async (g) => {
          const mData: MeasurementData = g.measurements || {};
          const measurementId: string | undefined = mData._id;

          // Pull out all numeric measurement values (skip _id, notes if empty)
          const numericFields: Record<string, number> = {};
          const SKIP = ['_id', 'customer', 'order', 'garmentType', 'unit', 'takenBy', 'isActive', 'version', 'createdAt', 'updatedAt', '__v', 'customMeasurements'];
          for (const [k, v] of Object.entries(mData)) {
            if (SKIP.includes(k)) continue;
            if (k === 'notes') continue;
            const num = parseFloat(v as string);
            if (!isNaN(num) && num > 0) numericFields[k] = num;
          }

          const hasValues = Object.keys(numericFields).length > 0;

          if (!hasValues) {
            // No measurement data — keep existing reference or skip
            return { ...g, measurements: measurementId || undefined };
          }

          if (measurementId) {
            // Update existing measurement document
            const payload = { ...numericFields, notes: mData.notes || undefined };
            await apiService.updateMeasurement(measurementId, payload);
            return { ...g, measurements: measurementId };
          } else {
            // Create new measurement document
            const resolvedType = resolveGarmentType(g.type);
            const payload = {
              customer: order.customer._id,
              garmentType: resolvedType,
              unit: 'inch',
              ...numericFields,
              notes: mData.notes || undefined
            };
            const res = await apiService.createMeasurement(payload);
            const newId = res.data?.data?._id;
            return { ...g, measurements: newId || undefined };
          }
        })
      );

      const updateData = {
        status: formData.status,
        urgency: formData.urgency,
        deliveryDate: formData.deliveryDate,
        notes: formData.notes,
        payment: {
          ...order.payment,
          advance: formData.advance,
          total: garmentsWithUpdatedMeasurements.reduce((sum, g) => sum + (g.price * g.quantity), 0)
        },
        customer: order.customer._id,
        garments: garmentsWithUpdatedMeasurements.map(g => ({
          type: g.type,
          name: g.name,
          quantity: g.quantity,
          price: g.price,
          specialInstructions: g.specialInstructions || '',
          category: g.category || 'garment',
          fabricName: g.fabricName || '',
          fit: g.fit || '',
          style: g.style || '',
          imageUrl: g.imageUrl || '',
          measurements: g.measurements || undefined
        }))
      };

      await apiService.updateOrder(order._id, updateData);
      setSuccess('Order updated successfully!');
      setTimeout(() => navigate(`/orders/${order._id}`), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGarment = () => {
    setFormData(prev => ({
      ...prev,
      garments: [...prev.garments, {
        _id: `new-${Date.now()}`,
        type: 'shirt',
        name: 'New Garment',
        quantity: 1,
        price: 0,
        specialInstructions: '',
        category: 'garment',
        fabricName: '',
        fit: 'regular',
        style: '',
        imageUrl: ''
      }]
    }));
  };

  const handleRemoveGarment = (index: number) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      setFormData(prev => ({
        ...prev,
        garments: prev.garments.filter((_, i) => i !== index)
      }));
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

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
          <button onClick={() => navigate('/orders')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
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

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
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
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select id="urgency" name="urgency" value={formData.urgency} onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Delivery Date */}
          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
            <input type="date" id="deliveryDate" name="deliveryDate" value={formData.deliveryDate}
              onChange={handleInputChange} min={minDate.toISOString().split('T')[0]}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>

          {/* Payment */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                <input type="text" value={formatCurrency(order.payment.total)} readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
              </div>
              <div>
                <label htmlFor="advance" className="block text-sm font-medium text-gray-700 mb-2">Advance Payment (₹)</label>
                <input type="number" id="advance" name="advance" value={formData.advance}
                  onChange={handleInputChange} min="0" max={order.payment.total} step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Balance</label>
                <input type="text" value={formatCurrency(order.payment.total - formData.advance)} readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={4}
              placeholder="Any special instructions or updates..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>

          {/* Products */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Products & Accessories</h3>
              <button type="button" onClick={handleAddGarment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                + Add Product
              </button>
            </div>

            <div className="space-y-4">
              {formData.garments.map((garment, index) => {
                const measFields = getMeasurementFields(garment.type);
                const mData: MeasurementData = garment.measurements || {};
                const hasSavedMeasurements = !!mData._id;
                const isExpanded = !!expandedMeasurements[index];

                return (
                  <div key={garment._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {/* Garment header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                          <input type="text" value={garment.name}
                            onChange={(e) => handleGarmentChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                          <select value={garment.type}
                            onChange={(e) => handleGarmentChange(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                            <option value="shirt">Shirt</option>
                            <option value="kurta">Kurta</option>
                            <option value="trousers">Trousers</option>
                            <option value="blazer">Blazer</option>
                            <option value="jacket">Jacket</option>
                            <option value="west-coat">West Coat</option>
                            <option value="sherwani">Sherwani</option>
                          </select>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleRemoveGarment(index)}
                        className="ml-3 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" value={garment.quantity}
                          onChange={(e) => handleGarmentChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          min="1" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input type="number" value={garment.price}
                          onChange={(e) => handleGarmentChange(index, 'price', parseFloat(e.target.value) || 0)}
                          min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Fit</label>
                        <select value={garment.fit}
                          onChange={(e) => handleGarmentChange(index, 'fit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                          <option value="slim">Slim</option>
                          <option value="regular">Regular</option>
                          <option value="loose">Loose</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                        <select value={garment.category}
                          onChange={(e) => handleGarmentChange(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                          <option value="garment">Garment</option>
                          <option value="accessory">Accessory</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Fabric</label>
                        <input type="text" value={garment.fabricName || ''}
                          onChange={(e) => handleGarmentChange(index, 'fabricName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Optional" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                        <input type="text" value={garment.style || ''}
                          onChange={(e) => handleGarmentChange(index, 'style', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Optional" />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Special Instructions</label>
                      <textarea value={garment.specialInstructions || ''}
                        onChange={(e) => handleGarmentChange(index, 'specialInstructions', e.target.value)}
                        rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Any special notes..." />
                    </div>

                    {/* Measurements section */}
                    {garment.category !== 'accessory' && (
                      <div className="mt-3 border border-amber-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleMeasurements(index)}
                          className="w-full flex justify-between items-center px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                        >
                          <span className="text-sm font-medium text-amber-800 flex items-center gap-2">
                            📏 Measurements
                            {hasSavedMeasurements && (
                              <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full">Saved</span>
                            )}
                          </span>
                          <svg
                            className={`w-4 h-4 text-amber-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isExpanded && (
                          <div className="p-4 bg-white">
                            <p className="text-xs text-gray-500 mb-3">All measurements in inches</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {measFields.map(field => (
                                <div key={field.key}>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      placeholder={field.placeholder}
                                      value={mData[field.key] ?? ''}
                                      onChange={(e) => handleMeasurementChange(index, field.key, e.target.value)}
                                      className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <span className="absolute right-2 top-2 text-xs text-gray-400">in</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                              <input
                                type="text"
                                placeholder="e.g. prefers loose fit"
                                value={mData.notes ?? ''}
                                onChange={(e) => handleMeasurementChange(index, 'notes', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm flex justify-between">
                      <span className="font-medium text-gray-700">Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(garment.quantity * garment.price)}</span>
                    </div>
                  </div>
                );
              })}

              {formData.garments.length === 0 && (
                <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                  <p className="text-gray-500">No products added. Click "Add Product" to add items to this order.</p>
                </div>
              )}

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(formData.garments.reduce((sum, g) => sum + (g.price * g.quantity), 0))}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 flex justify-end space-x-3">
            <button type="button" onClick={() => navigate(`/orders/${order._id}`)} disabled={saving}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {saving ? 'Saving...' : 'Update Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEdit;
