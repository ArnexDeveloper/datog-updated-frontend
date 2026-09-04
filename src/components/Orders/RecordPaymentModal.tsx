import React, { useState } from 'react';
import { apiService } from '../../services/api';

const PAYMENT_MODES: { value: string; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'gpay', label: 'GPay' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

interface RecordPaymentModalProps {
  orderId: string;
  orderNumber: string;
  currentBalance: number;
  onClose: () => void;
  onSaved: (payment: any) => void;
}

interface SplitRow {
  id: number;
  amount: number | '';
  mode: string;
  reference: string;
}

let splitIdSeq = 0;
const newSplit = (mode = 'cash'): SplitRow => ({ id: splitIdSeq++, amount: '', mode, reference: '' });

// Records one or more payments (e.g. part-cash + part-UPI) against an order's
// balance in a single submission, instead of the user reopening this modal
// once per payment mode.
const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ orderId, orderNumber, currentBalance, onClose, onSaved }) => {
  const [splits, setSplits] = useState<SplitRow[]>([newSplit()]);
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const updateSplit = (id: number, patch: Partial<SplitRow>) => {
    setSplits(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSplit = () => {
    const lastMode = splits[splits.length - 1]?.mode;
    const nextMode = PAYMENT_MODES.find(m => m.value !== lastMode)?.value || 'cash';
    setSplits(prev => [...prev, newSplit(nextMode)]);
  };

  const removeSplit = (id: number) => {
    setSplits(prev => (prev.length > 1 ? prev.filter(s => s.id !== id) : prev));
  };

  const totalAmount = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const balanceAfter = Math.max(0, currentBalance - totalAmount);

  const handleSave = async () => {
    setError('');
    const validSplits = splits.filter(s => Number(s.amount) > 0);
    if (validSplits.length === 0) {
      setError('Enter at least one payment amount');
      return;
    }
    if (totalAmount > currentBalance) {
      setError(`Total cannot exceed the balance due (${fmt(currentBalance)})`);
      return;
    }
    try {
      setSaving(true);
      const res = await apiService.addOrderPayment(orderId, {
        payments: validSplits.map(s => ({
          amount: Number(s.amount),
          method: s.mode,
          reference: s.reference.trim() || undefined,
        })),
        date,
      });
      onSaved(res?.data?.data?.payment);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">💵 Record Payment — {orderNumber}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-5 py-4 space-y-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <div style={{ background: '#fff2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, border: '1px solid #fecaca', fontSize: 13 }}>
              {error}
            </div>
          )}

          {splits.map((split, i) => (
            <div key={split.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
              {splits.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">Payment {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSplit(split.id)}
                    className="text-gray-400 hover:text-red-600 text-sm leading-none"
                    title="Remove this payment"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount received (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={split.amount}
                  onChange={e => updateSplit(split.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })}
                  placeholder="0"
                  autoFocus={i === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment mode</label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_MODES.map(m => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => updateSplit(split.id, { mode: m.value })}
                      style={{
                        padding: '5px 12px', borderRadius: 9999, fontSize: 12.5, cursor: 'pointer',
                        border: '1px solid', fontWeight: split.mode === m.value ? 600 : 400,
                        background: split.mode === m.value ? '#1d4ed8' : '#fff',
                        color: split.mode === m.value ? '#fff' : '#374151',
                        borderColor: split.mode === m.value ? '#1d4ed8' : '#d1d5db',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Transaction ID (optional)</label>
                <input
                  type="text"
                  value={split.reference}
                  onChange={e => updateSplit(split.id, { reference: e.target.value })}
                  placeholder="e.g. UPI ref 123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSplit}
            className="w-full px-3 py-2 border border-dashed border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            + Add another payment mode
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={todayStr()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total received</span>
              <span className="font-semibold text-gray-900">{fmt(totalAmount)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">Balance after</span>
              <span className={`font-bold ${balanceAfter > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(balanceAfter)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Payment ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
