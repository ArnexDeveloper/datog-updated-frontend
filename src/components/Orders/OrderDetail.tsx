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
  fabricName?: string;
  fabricUsed?: number;
  fit: string;
  style?: string;
  specialInstructions?: string;
  price: number;
  status: string;
  category?: string;
  imageUrl?: string;
  measurements?: Record<string, any>;
}

interface PackageGarment {
  _id: string;
  type: string;
  name: string;
  fabricSource?: string;
  fabric?: Fabric;
  fabricName?: string;
  fabricUsed?: number;
  accessories?: string[];
  measurements?: Record<string, any>;
  notes?: string;
  status?: string;
}

interface OrderPackage {
  _id?: string;
  packageId?: string;
  packagePrice: number;
  quantity: number;
  garments: PackageGarment[];
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer;
  garments: Garment[];
  packages?: OrderPackage[];
  orderDate: string;
  deliveryDate: string;
  trialDate?: string;
  urgency: string;
  status: string;
  notes: string;
  pointsRedeemed?: number;
  creditRedeemed?: number;
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
      console.log('📦 Order Data Received:', response.data.data.order);
      console.log('🎨 Garments with images:', response.data.data.order.garments.map((g: any) => ({
        name: g.name,
        hasImage: !!g.imageUrl,
        imageUrl: g.imageUrl ? g.imageUrl.substring(0, 50) + '...' : 'no image'
      })));
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

          {/* Products & Accessories */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Individual Garments ({order.garments.length})
            </h3>

            {/* Check if any garments have images */}
            {!order.garments.some(g => g.imageUrl) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> No reference images found for this order. When creating new orders, you can upload product reference images in the order creation form.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {order.garments.map((garment, index) => (
                <div key={garment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{garment.name}</h4>
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
                    {(garment.fabric || garment.fabricName) && (
                      <div>
                        <span className="font-medium text-gray-700">Fabric:</span>
                        <span className="ml-2 text-gray-900">
                          {garment.fabric
                            ? `${garment.fabric.name} - ${garment.fabric.type} (${garment.fabric.color})`
                            : garment.fabricName
                          }
                        </span>
                      </div>
                    )}
                    {garment.fabricUsed && garment.fabricUsed > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Fabric Used:</span>
                        <span className="ml-2 text-gray-900">{garment.fabricUsed} meters</span>
                      </div>
                    )}
                  </div>

                  {/* Measurements */}
                  {garment.measurements && typeof garment.measurements === 'object' && (
                    <div className="mt-3 p-3 rounded border border-amber-200 bg-amber-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-amber-800">📏 Measurements</span>
                        {garment.measurements.unit && (
                          <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            {garment.measurements.unit}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1">
                        {([
                          ['chest',       'Chest'],
                          ['bust',        'Bust'],
                          ['waist',       'Waist'],
                          ['hip',         'Hip'],
                          ['shoulder',    'Shoulder'],
                          ['armLength',   'Arm Length'],
                          ['armHole',     'Arm Hole'],
                          ['bicep',       'Bicep'],
                          ['wrist',       'Wrist'],
                          ['neck',        'Neck'],
                          ['shirtLength', 'Shirt Length'],
                          ['kurtalLength','Kurta Length'],
                          ['dressLength', 'Dress Length'],
                          ['skirtLength', 'Skirt Length'],
                          ['blouseLength','Blouse Length'],
                          ['inseam',      'Inseam'],
                          ['outseam',     'Outseam'],
                          ['thigh',       'Thigh'],
                          ['knee',        'Knee'],
                          ['calf',        'Calf'],
                          ['ankle',       'Ankle'],
                          ['rise',        'Rise'],
                          ['height',      'Height'],
                          ['weight',      'Weight (kg)'],
                        ] as [string, string][])
                          .filter(([key]) => garment.measurements[key] != null && garment.measurements[key] > 0)
                          .map(([key, label]) => (
                            <div key={key} className="flex justify-between text-xs py-0.5 border-b border-amber-100">
                              <span className="text-amber-700 font-medium">{label}</span>
                              <span className="text-gray-800 font-semibold ml-2">
                                {garment.measurements[key]} {garment.measurements.unit || 'in'}
                              </span>
                            </div>
                          ))
                        }
                        {garment.measurements.customMeasurements?.map((cm: any) => (
                          <div key={cm.name} className="flex justify-between text-xs py-0.5 border-b border-amber-100">
                            <span className="text-amber-700 font-medium">{cm.name}</span>
                            <span className="text-gray-800 font-semibold ml-2">{cm.value} {cm.unit}</span>
                          </div>
                        ))}
                      </div>
                      {garment.measurements.notes && (
                        <p className="mt-2 text-xs text-amber-700 italic">{garment.measurements.notes}</p>
                      )}
                    </div>
                  )}

                  {garment.specialInstructions && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">Special Instructions:</span>
                      <p className="mt-1 text-sm text-gray-900">{garment.specialInstructions}</p>
                    </div>
                  )}

                  {garment.imageUrl && (
                    <div className="mt-3">
                      <span className="block font-medium text-gray-700 mb-2">Reference Image:</span>
                      <div className="relative inline-block">
                        <img
                          src={garment.imageUrl}
                          alt={`${garment.name} reference`}
                          className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-purple-300 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => window.open(garment.imageUrl, '_blank')}
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          Click to enlarge
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Packages */}
          {order.packages && order.packages.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Complete Packages ({order.packages.length})
              </h3>
              <div className="space-y-4">
                {order.packages.map((pkg, pkgIdx) => (
                  <div key={pkg._id || pkgIdx} className="rounded-lg border-2 overflow-hidden" style={{ borderColor: '#f59e0b' }}>
                    {/* Package header */}
                    <div className="flex justify-between items-center px-4 py-3" style={{ background: '#fffbeb' }}>
                      <div className="flex items-center gap-2">
                        <span>📦</span>
                        <span className="font-semibold text-sm" style={{ color: '#92400e' }}>
                          {pkg.garments.map(g => g.name).join(' + ')}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>
                          COMPLETE PACKAGE
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">
                          {pkg.quantity} × {formatCurrency(pkg.packagePrice)} = {formatCurrency(pkg.quantity * pkg.packagePrice)}
                        </p>
                      </div>
                    </div>
                    {/* Garments inside the package */}
                    <div className="divide-y divide-amber-100">
                      {pkg.garments.map((g, gi) => (
                        <div key={g._id || gi} className="px-4 py-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">{gi + 1}</span>
                              <span className="font-medium text-sm text-gray-900">{g.name}</span>
                              <span className="text-xs text-gray-500 capitalize">{g.type}</span>
                            </div>
                            {g.status && (
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(g.status)}`}>
                                {g.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                          {/* Fabric info */}
                          {(g.fabric || g.fabricName) && (
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Fabric:</span>{' '}
                              {g.fabric ? `${(g.fabric as any).name || g.fabricName}` : g.fabricName}
                              {g.fabricUsed ? ` · ${g.fabricUsed}m` : ''}
                            </p>
                          )}
                          {/* Accessories */}
                          {g.accessories && g.accessories.length > 0 && (
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Accessories:</span>{' '}
                              {g.accessories.join(', ')}
                            </p>
                          )}
                          {/* Measurements */}
                          {g.measurements && typeof g.measurements === 'object' && (g.measurements as any)._id && (
                            <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-100">
                              <p className="text-xs font-semibold text-amber-800 mb-1">📏 Measurements</p>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-0.5">
                                {([
                                  ['chest','Chest'],['shoulder','Shoulder'],['armLength','Sleeve'],
                                  ['neck','Neck'],['waist','Waist'],['hip','Hip'],
                                  ['thigh','Thigh'],['inseam','Inseam'],['outseam','Length'],
                                  ['rise','Rise'],['shirtLength','Shirt Length'],['blouseLength','Blouse Length'],
                                ] as [string,string][])
                                  .filter(([k]) => (g.measurements as any)[k] != null && (g.measurements as any)[k] > 0)
                                  .map(([k, lbl]) => (
                                    <div key={k} className="flex justify-between text-xs py-0.5 border-b border-amber-100">
                                      <span className="text-amber-700">{lbl}</span>
                                      <span className="font-semibold ml-1">{(g.measurements as any)[k]} {(g.measurements as any).unit || 'in'}</span>
                                    </div>
                                  ))}
                              </div>
                              {(g.measurements as any).notes && (
                                <p className="mt-1 text-xs text-amber-700 italic">{(g.measurements as any).notes}</p>
                              )}
                            </div>
                          )}
                          {/* Notes */}
                          {g.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">{g.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

            {/* Breakdown */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (gross)</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.payment.total)}</span>
              </div>

              {(order.pointsRedeemed ?? 0) > 0 && (
                <div className="flex justify-between text-blue-700 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">⭐</span> Points redeemed ({order.pointsRedeemed} pts)
                  </span>
                  <span>−{formatCurrency(order.pointsRedeemed ?? 0)}</span>
                </div>
              )}

              {(order.creditRedeemed ?? 0) > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">💳</span> Store credit used
                  </span>
                  <span>−{formatCurrency(order.creditRedeemed ?? 0)}</span>
                </div>
              )}

              {/* Net total after discounts */}
              {((order.pointsRedeemed ?? 0) > 0 || (order.creditRedeemed ?? 0) > 0) && (
                <div className="flex justify-between font-semibold text-gray-800 border-t border-gray-200 pt-2 mt-1">
                  <span>Net order total</span>
                  <span>{formatCurrency(Math.max(0, order.payment.total - (order.pointsRedeemed ?? 0) - (order.creditRedeemed ?? 0)))}</span>
                </div>
              )}

              <div className="flex justify-between text-green-600 font-medium">
                <span>Advance paid</span>
                <span>−{formatCurrency(order.payment.advance)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-2 mt-1">
                <span>Balance due</span>
                <span className={order.payment.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(order.payment.balance)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Status</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                order.payment.status === 'paid'    ? 'bg-green-100 text-green-800' :
                order.payment.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                      'bg-red-100 text-red-800'
              }`}>
                {order.payment.status.toUpperCase()}
              </span>
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