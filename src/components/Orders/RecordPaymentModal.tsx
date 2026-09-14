import React, { useState } from 'react';
import { apiService } from '../../services/api';

const PAYMENT_MODES: { value: string; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'gpay', label: 'GPay' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'bank_transfer', label: 'Bank' },
  { value: 'card', label: 'Card' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

interface RecordPaymentModalProps {
  orderId: string;
  orderNumber: string;
  customerName?: string;
  totalAmount?: number;
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

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// Records one or more payments (e.g. part-cash + part-UPI) against an order's
// balance in a single submission — a live summary sidebar on the left plus a
// tab per payment on the right, instead of the user reopening this modal
// once per payment mode.
const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  orderId, orderNumber, customerName, totalAmount, currentBalance, onClose, onSaved
}) => {
  const [splits, setSplits] = useState<SplitRow[]>([newSplit()]);
  const [activeSplitId, setActiveSplitId] = useState<number>(splits[0].id);
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateSplit = (id: number, patch: Partial<SplitRow>) => {
    setSplits(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSplit = () => {
    const lastMode = splits[splits.length - 1]?.mode;
    const nextMode = PAYMENT_MODES.find(m => m.value !== lastMode)?.value || 'cash';
    const s = newSplit(nextMode);
    setSplits(prev => [...prev, s]);
    setActiveSplitId(s.id);
  };

  const removeSplit = (id: number) => {
    setSplits(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(s => s.id !== id);
      if (activeSplitId === id) setActiveSplitId(next[0].id);
      return next;
    });
  };

  const totalPaidSoFar = Math.max(0, (totalAmount ?? currentBalance) - currentBalance);
  const totalAmountEntered = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const balanceAfter = Math.max(0, currentBalance - totalAmountEntered);
  const activeSplit = splits.find(s => s.id === activeSplitId) || splits[0];

  const handleSave = async () => {
    setError('');
    const validSplits = splits.filter(s => Number(s.amount) > 0);
    if (validSplits.length === 0) {
      setError('Enter at least one payment amount');
      return;
    }
    if (totalAmountEntered > currentBalance) {
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" style={{ display: 'flex', overflow: 'hidden' }}>
        {/* Left sidebar — live order summary */}
        <div style={{ width: 140, flexShrink: 0, background: '#f9fafb', borderRight: '1px solid #e5e7eb', padding: '16px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 2 }}>Order</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12, wordBreak: 'break-word' }}>#{orderNumber}</div>

          {customerName && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 2 }}>Customer</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 12, wordBreak: 'break-word' }}>{customerName}</div>
            </>
          )}

          {typeof totalAmount === 'number' && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 2 }}>Total</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{fmt(totalAmount)}</div>
            </>
          )}

          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 2 }}>Paid so far</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 12 }}>{fmt(totalPaidSoFar)}</div>

          <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0 12px' }} />

          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Balance due</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626', lineHeight: 1.1 }}>{fmt(balanceAfter)}</div>
        </div>

        {/* Right panel — form */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-base font-semibold text-gray-900">💵 Record Payment</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 4, padding: '10px 12px 0', flexWrap: 'wrap' }}>
            {splits.map((split, i) => (
              <button
                key={split.id}
                type="button"
                onClick={() => setActiveSplitId(split.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                  borderRadius: '8px 8px 0 0', border: '1px solid #e5e7eb', borderBottom: 'none',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  background: activeSplitId === split.id ? '#ffffff' : '#f3f4f6',
                  color: activeSplitId === split.id ? '#111827' : '#6b7280',
                }}
              >
                Payment {i + 1}
                {splits.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); removeSplit(split.id); }}
                    style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1 }}
                    title="Remove this payment"
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={addSplit}
              style={{
                padding: '6px 12px', borderRadius: '8px 8px 0 0', border: '1px dashed #c9900a', borderBottom: 'none',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: '#fffbeb', color: '#92400e'
              }}
            >
              + Add
            </button>
          </div>

          <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', flex: 1, overflowY: 'auto' }}>
            {error && (
              <div style={{ background: '#fff2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, border: '1px solid #fecaca', fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

            {activeSplit && (
              <div>
                <div style={{ marginBottom: 14 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount received (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={activeSplit.amount || ''}
                    onChange={e => updateSplit(activeSplit.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })}
                    placeholder="0"
                    autoFocus
                    style={{
                      width: '100%', padding: '8px 10px', border: '2px solid #c9900a', borderRadius: 8,
                      fontSize: 24, fontWeight: 700, color: '#c9900a', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment mode</label>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_MODES.map(m => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => updateSplit(activeSplit.id, { mode: m.value })}
                        style={{
                          padding: '5px 12px', borderRadius: 9999, fontSize: 12.5, cursor: 'pointer',
                          border: '1px solid', fontWeight: activeSplit.mode === m.value ? 600 : 400,
                          background: activeSplit.mode === m.value ? '#c9900a' : '#fff',
                          color: activeSplit.mode === m.value ? '#fff' : '#374151',
                          borderColor: activeSplit.mode === m.value ? '#c9900a' : '#d1d5db',
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Transaction ID (optional)</label>
                  <input
                    type="text"
                    value={activeSplit.reference}
                    onChange={e => updateSplit(activeSplit.id, { reference: e.target.value })}
                    placeholder="e.g. UPI ref 123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={todayStr()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {splits.length > 1 && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
                Total across {splits.length} payments: <strong>{fmt(totalAmountEntered)}</strong>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 px-4 py-3 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: '#16a34a' }}
              className="px-4 py-2 text-white rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Payment ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPaymentModal;
