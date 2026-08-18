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

interface RecordInvoicePaymentModalProps {
  invoiceId: string;
  invoiceNumber: string;
  currentBalance: number;
  onClose: () => void;
  onSaved: (payment: any) => void;
}

const RecordInvoicePaymentModal: React.FC<RecordInvoicePaymentModalProps> = ({ invoiceId, invoiceNumber, currentBalance, onClose, onSaved }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [mode, setMode] = useState('cash');
  const [date, setDate] = useState(todayStr());
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const amountNum = Number(amount) || 0;
  const balanceAfter = Math.max(0, currentBalance - amountNum);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const handleSave = async () => {
    setError('');
    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (amountNum > currentBalance) {
      setError(`Amount cannot exceed the balance due (${fmt(currentBalance)})`);
      return;
    }
    try {
      setSaving(true);
      const res = await apiService.updateInvoicePayment(invoiceId, {
        amount: amountNum,
        method: mode,
        date,
        reference: reference || undefined,
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
          <h3 className="text-lg font-semibold text-gray-900">💵 Record Payment — {invoiceNumber}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error && (
            <div style={{ background: '#fff2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, border: '1px solid #fecaca', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount received (₹)</label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment mode</label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_MODES.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  style={{
                    padding: '5px 12px', borderRadius: 9999, fontSize: 12.5, cursor: 'pointer',
                    border: '1px solid', fontWeight: mode === m.value ? 600 : 400,
                    background: mode === m.value ? '#1d4ed8' : '#fff',
                    color: mode === m.value ? '#fff' : '#374151',
                    borderColor: mode === m.value ? '#1d4ed8' : '#d1d5db',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Transaction ID (optional)</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. UPI ref 123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
            <span className="text-sm text-gray-600">Balance after this payment</span>
            <span className={`text-base font-bold ${balanceAfter > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(balanceAfter)}</span>
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

export default RecordInvoicePaymentModal;
