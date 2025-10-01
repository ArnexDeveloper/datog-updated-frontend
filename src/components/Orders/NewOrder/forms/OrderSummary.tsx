import React from 'react';

interface OrderSummaryProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
  calculateTotal: () => number;
  handleSubmitOrder: () => void;
}

export default function OrderSummary({
  formData,
  setFormData,
  calculateTotal,
  handleSubmitOrder
}: OrderSummaryProps) {
  const total = calculateTotal();

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-amber-900">Order Summary</h2>

      <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Customer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-amber-700">Name</p>
            <p className="font-medium text-amber-900">{formData.name || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-amber-700">Phone</p>
            <p className="font-medium text-amber-900">{formData.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-amber-700">Email</p>
            <p className="font-medium text-amber-900">{formData.email || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-amber-700">Gender</p>
            <p className="font-medium text-amber-900">{formData.gender || 'Not specified'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-amber-700">Address</p>
            <p className="font-medium text-amber-900">{formData.address || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Measurements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(formData.measurements).map(([key, value]) => (
            <div key={key} className="bg-amber-100/50 p-3 rounded-lg">
              <p className="text-sm text-amber-700 capitalize">{key}</p>
              <p className="font-medium text-amber-900">{String(value ?? '')}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Products</h3>
        <div className="space-y-3">
          {formData.products.map((product: any) => (
            <div key={product.id} className="py-2 border-b border-amber-200 last:border-0">
              <div className="flex justify-between mb-1">
                <span className="text-amber-900 font-medium">{product.name} × {product.quantity}</span>
                <span className="font-medium text-amber-900">₹{product.price * product.quantity}</span>
              </div>
              {product.fabric && <p className="text-sm text-amber-700">Fabric: {product.fabric}</p>}
              {product.fit && <p className="text-sm text-amber-700">Fit: {product.fit}</p>}
              {product.style && <p className="text-sm text-amber-700">Style: {product.style}</p>}
              {product.specialInstructions && <p className="text-sm text-amber-700">Instructions: {product.specialInstructions}</p>}
            </div>
          ))}
          <div className="border-t border-amber-300 pt-3 mt-3 font-semibold flex justify-between text-amber-900">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-amber-800 mb-2">Trial Date</label>
          <input
            type="date"
            value={formData.trialDate}
            onChange={(e) => setFormData(prev => ({ ...prev, trialDate: e.target.value }))}
            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-800 mb-2">Delivery Date</label>
          <input
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-800 mb-2">Urgency</label>
          <select
            value={formData.urgency}
            onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50/50 transition-colors"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-800 mb-2">Advance Payment (₹)</label>
          <input
            type="number"
            value={formData.advancePayment}
            onChange={(e) => setFormData(prev => ({ ...prev, advancePayment: parseFloat(e.target.value) }))}
            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50/50 transition-colors"
            placeholder="0.00"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-amber-800 mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50/50 transition-colors"
            placeholder="Any additional notes for this order"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
        >
          Print Invoice
        </button>
        <button
          onClick={handleSubmitOrder}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
}