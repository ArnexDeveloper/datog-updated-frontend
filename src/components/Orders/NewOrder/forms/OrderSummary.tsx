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
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Products & Measurements</h3>
        <div className="space-y-4">
          {/* Individual items */}
          {formData.products.filter((p: any) => p.type === 'individual' || (!p.type && p.id)).map((product: any, i: number) => (
            <div key={product.uid || product.id || i} className="bg-white p-4 rounded-lg border border-amber-200">
              <div className="flex justify-between mb-2">
                <span className="text-amber-900 font-semibold">{product.productName || product.name} × {product.quantity}</span>
                <span className="font-semibold text-amber-900">₹{(product.price || 0) * (product.quantity || 1)}</span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${product.fabricSource === 'lounge' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {product.fabricSource === 'lounge' ? 'Lounge Fabric' : "Customer's Fabric"}
              </span>
              {product.fabricName && <p className="text-xs text-amber-700 mt-1">Fabric: {product.fabricName}</p>}
              {product.accessories?.length > 0 && <p className="text-xs text-amber-700 mt-1">Accessories: {product.accessories.join(', ')}</p>}
              {product.notes && <p className="text-xs text-amber-600 mt-1 italic">{product.notes}</p>}
            </div>
          ))}

          {/* Package items */}
          {formData.products.filter((p: any) => p.type === 'package').map((pkg: any) => (
            <div key={pkg.pkgId} className="bg-white rounded-lg border-2 overflow-hidden" style={{ borderColor: '#f59e0b' }}>
              <div className="flex justify-between items-center px-4 py-3" style={{ background: '#fffbeb' }}>
                <div className="flex items-center gap-2">
                  <span>📦</span>
                  <span className="font-semibold text-sm" style={{ color: '#92400e' }}>
                    {pkg.garments.map((g: any) => g.productName).join(' + ')}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>PKG</span>
                </div>
                <span className="font-semibold text-amber-900">₹{(pkg.packagePrice || 0) * (pkg.quantity || 1)}</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                {pkg.garments.map((g: any, gi: number) => (
                  <div key={g.gid || gi} className="flex items-start gap-2 text-sm text-amber-800">
                    <span className="text-xs bg-amber-100 rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0">{gi + 1}</span>
                    <div>
                      <span className="font-medium">{g.productName}</span>
                      {g.fabricName && <span className="text-xs text-amber-600 ml-2">· {g.fabricSource === 'lounge' ? 'Lounge' : 'Customer'} fabric: {g.fabricName}</span>}
                      {g.accessories?.length > 0 && <span className="text-xs text-amber-600 ml-2">· {g.accessories.join(', ')}</span>}
                    </div>
                  </div>
                ))}
                <div className="text-xs text-amber-600 pt-1">Qty: {pkg.quantity} · Combined price: ₹{pkg.packagePrice}</div>
              </div>
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