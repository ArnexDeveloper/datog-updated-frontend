import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';
import OrderSummaryPrint from './OrderSummaryPrint';
import JobCardPrint from '../JobCards/JobCardPrint';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  garments: Array<{
    _id: string;
    name: string;
    type: string;
    quantity: number;
    measurements?: any;
    fit?: string;
    fabricSource: string;
    specialInstructions?: string;
  }>;
  orderDate: string;
  trialDate?: string;
  deliveryDate: string;
  payment: {
    total: number;
    advance: number;
    balance: number;
  };
  notes?: string;
  status: string;
}

const OrderDocuments: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGarmentIndex, setSelectedGarmentIndex] = useState(0);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrder(orderId!);
      if (response.data.success) {
        setOrder(response.data.data.order);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error || 'Order not found'}
        </div>
      </div>
    );
  }

  // Transform order data for OrderSummaryPrint
  const orderSummaryData = {
    orderNumber: order.orderNumber || '',
    customerName: order.customer?.name || 'N/A',
    customerPhone: order.customer?.phone || 'N/A',
    bookingDate: order.orderDate || new Date().toISOString(),
    trialDate: order.trialDate,
    deliveryDate: order.deliveryDate || new Date().toISOString(),
    totalAmount: order.payment?.total || 0,
    advance: order.payment?.advance || 0,
    balance: order.payment?.balance || 0,
    shafa: '', // Can be added to order model if needed
    juti: '', // Can be added to order model if needed
    garments: order.garments?.map(g => ({
      name: g.name || '',
      type: g.type || '',
      measurements: g.measurements || {},
      fit: g.fit || 'regular'
    })) || [],
    notes: order.notes || ''
  };

  // Transform data for Job Card (for selected garment)
  const selectedGarment = order.garments?.[selectedGarmentIndex];
  const jobCardData = {
    serialNumber: `${order.orderNumber || 'N/A'}-${selectedGarmentIndex + 1}`,
    garmentTypes: [selectedGarment?.name || 'N/A', selectedGarment?.type || 'N/A'],
    bookingDate: order.orderDate || new Date().toISOString(),
    deliveryDate: order.deliveryDate || new Date().toISOString(),
    measurements: selectedGarment?.measurements || {},
    description: selectedGarment?.specialInstructions || ''
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Documents - {order.orderNumber}
        </h1>
        <p className="text-gray-600">
          Customer: {order.customer?.name || 'N/A'} | Status: {order.status}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => document.getElementById('order-summary')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium"
          >
            Order Summary
          </button>
          <button
            onClick={() => document.getElementById('job-cards')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium"
          >
            Job Cards
          </button>
        </div>
      </div>

      {/* Order Summary Section */}
      <div id="order-summary" className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Order Summary (Store Tracking)</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <OrderSummaryPrint orderData={orderSummaryData} />
        </div>
      </div>

      {/* Job Cards Section */}
      <div id="job-cards" className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Job Cards (Production)</h2>

        {/* Garment Selector */}
        {order.garments && order.garments.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Garment for Job Card:
            </label>
            <select
              value={selectedGarmentIndex}
              onChange={(e) => setSelectedGarmentIndex(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {order.garments.map((garment, index) => (
                <option key={index} value={index}>
                  {garment?.name || 'Garment'} (Qty: {garment?.quantity || 1})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <JobCardPrint jobCardData={jobCardData} />
        </div>

        {order.garments && order.garments.length > 1 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This order has {order.garments.length} garments.
              Use the dropdown above to generate job cards for each garment individually.
              In production, you would print a separate job card for each garment.
            </p>
          </div>
        )}
      </div>

      {/* Print All Button */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => {
            const orderSummaryEl = document.querySelector('.order-summary-print');
            if (orderSummaryEl) {
              // Trigger print for order summary
              window.print();
            }
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Print Order Summary
        </button>
        <button
          onClick={() => {
            const jobCardEl = document.querySelector('.job-card-print');
            if (jobCardEl) {
              // Trigger print for job card
              window.print();
            }
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Print Current Job Card
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Printing Instructions:</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li><strong>Order Summary:</strong> Use A4 paper (portrait orientation) for store tracking</li>
          <li><strong>Job Card:</strong> Use A5 paper (landscape orientation) for production floor</li>
          <li>Each garment in the order gets its own separate job card</li>
          <li>Print multiple copies of job cards if needed for different production stages</li>
        </ul>
      </div>
    </div>
  );
};

export default OrderDocuments;
