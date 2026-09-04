import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import CustomerPicker, { PickedCustomer } from './CustomerPicker';

interface LineItem {
  description: string;
  size: string;
  quantity: number;
  rate: number;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  paid: { bg: '#f0fdf4', text: '#15803d', border: '#22c55e', label: 'Paid' },
  partial: { bg: '#fffbeb', text: '#92400e', border: '#f59e0b', label: 'Partial' },
  pending: { bg: '#fff1f2', text: '#dc2626', border: '#fca5a5', label: 'Unpaid' },
};

const emptyItem = (): LineItem => ({ description: '', size: '', quantity: 1, rate: 0 });

const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'gpay', label: 'GPay' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 5,
  fontSize: 13, height: 36, boxSizing: 'border-box'
};

const CustomInvoiceCreate: React.FC = () => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<PickedCustomer | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInMobile, setWalkInMobile] = useState('');
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [advanceMethod, setAdvanceMethod] = useState('cash');
  const [advanceReference, setAdvanceReference] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    setItems(prev => prev.map((it, i) => i === index ? {
      ...it,
      [field]: field === 'description' || field === 'size' ? value : Number(value) || 0
    } : it));
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (index: number) => setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);

  const subtotal = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.rate || 0), 0);
  const total = Math.max(0, subtotal - (discount || 0));
  const balanceDue = Math.max(0, total - (advancePaid || 0));
  const status = advancePaid >= total && total > 0 ? 'paid' : advancePaid > 0 ? 'partial' : 'pending';
  const badge = STATUS_STYLE[status];

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = async () => {
    setError('');
    if (!customer && !(isWalkIn && walkInName.trim())) {
      setError('Please select a customer or enter a walk-in name');
      return;
    }
    const validItems = items.filter(it => it.description.trim());
    if (validItems.length === 0) {
      setError('Please add at least one line item with a description');
      return;
    }
    try {
      setSaving(true);
      const res = await apiService.createCustomInvoice({
        customer: isWalkIn ? undefined : customer?._id,
        walkInName: isWalkIn ? walkInName.trim() : undefined,
        walkInMobile: isWalkIn ? walkInMobile.trim() || undefined : undefined,
        items: validItems,
        discount,
        advancePaid,
        advanceMethod: advancePaid > 0 ? advanceMethod : undefined,
        advanceReference: advancePaid > 0 ? (advanceReference.trim() || undefined) : undefined,
        deliveryDate: deliveryDate || undefined,
        notes: notes || undefined,
      });
      const invoiceId = res?.data?.data?._id;
      if (invoiceId) {
        navigate(`/invoices/${invoiceId}`);
      } else {
        navigate('/invoices');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Create Custom Invoice</h2>
        <button
          onClick={() => navigate('/invoices')}
          style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, marginBottom: 12, border: '1px solid #fecaca', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {/* Customer */}
        <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Customer</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isWalkIn}
                onChange={e => setIsWalkIn(e.target.checked)}
                style={{ width: 16, height: 16, flexShrink: 0, accentColor: '#c9900a' }}
              />
              Walk-in customer (no profile)
            </label>
          </div>
          {isWalkIn ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input
                type="text"
                value={walkInName}
                onChange={e => setWalkInName(e.target.value)}
                placeholder="Walk-in customer name"
                style={inputStyle}
              />
              <input
                type="tel"
                value={walkInMobile}
                onChange={e => setWalkInMobile(e.target.value)}
                placeholder="Mobile no."
                style={inputStyle}
              />
            </div>
          ) : (
            <CustomerPicker value={customer} onChange={setCustomer} />
          )}
        </div>

        {/* Items */}
        <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Items</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 100px 100px 32px', gap: 8, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4, padding: '0 2px' }}>
            <span>Description</span><span>Size</span><span>Qty</span><span>Rate</span><span style={{ textAlign: 'right' }}>Amount</span><span />
          </div>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 100px 100px 32px', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <input type="text" value={it.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="e.g. Blazer alteration" style={inputStyle} />
              <input type="text" value={it.size} onChange={e => updateItem(i, 'size', e.target.value)} placeholder="e.g. M" style={inputStyle} />
              <input type="number" min={1} value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} style={inputStyle} />
              <input type="number" min={0} value={it.rate} onChange={e => updateItem(i, 'rate', e.target.value)} style={inputStyle} />
              <div style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: '#111827' }}>
                {fmt((it.quantity || 0) * (it.rate || 0))}
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                style={{ width: 28, height: 28, border: 'none', background: 'none', color: items.length === 1 ? '#d1d5db' : '#dc2626', cursor: items.length === 1 ? 'not-allowed' : 'pointer', fontSize: 16 }}
                title="Remove item"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            style={{ marginTop: 6, padding: '6px 12px', borderRadius: 6, border: '1px dashed #c9900a', background: '#fffbeb', color: '#92400e', fontSize: 12.5, cursor: 'pointer' }}
          >
            + Add Item
          </button>
        </div>

        {/* Totals */}
        <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9', background: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span style={{ fontWeight: 500 }}>{fmt(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: '#6b7280' }}>Discount</span>
            <input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} style={{ ...inputStyle, width: 120, height: 30 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 15, fontWeight: 700, borderTop: '1px solid #e5e7eb', marginTop: 4 }}>
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: '#16a34a' }}>Advance paid</span>
            <input type="number" min={0} value={advancePaid} onChange={e => setAdvancePaid(Number(e.target.value) || 0)} style={{ ...inputStyle, width: 120, height: 30 }} />
          </div>
          {advancePaid > 0 && (
            <div style={{ padding: '4px 0 8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', marginBottom: 8 }}>
                {PAYMENT_MODES.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setAdvanceMethod(m.value)}
                    style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid',
                      fontWeight: advanceMethod === m.value ? 600 : 400,
                      background: advanceMethod === m.value ? '#c9900a' : '#fff',
                      color: advanceMethod === m.value ? '#fff' : '#374151',
                      borderColor: advanceMethod === m.value ? '#c9900a' : '#d1d5db',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {advanceMethod !== 'cash' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <input
                    type="text"
                    value={advanceReference}
                    onChange={e => setAdvanceReference(e.target.value)}
                    placeholder="Transaction ID / Reference"
                    style={{ ...inputStyle, width: 220, height: 32 }}
                  />
                </div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: 15, fontWeight: 700, borderTop: '1px solid #e5e7eb', marginTop: 4 }}>
            <span>Balance due</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#dc2626' }}>{fmt(balanceDue)}</span>
              <span style={{
                borderRadius: 20, fontSize: 11, fontWeight: 600, padding: '2px 10px',
                background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`
              }}>
                {badge.label}
              </span>
            </span>
          </div>
        </div>

        {/* Delivery + notes */}
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Delivery date</label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} style={{ ...inputStyle, maxWidth: 220 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: 16, borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => navigate('/invoices')}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: '8px 18px', borderRadius: 6, border: 'none', background: '#c9900a', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Creating…' : 'Create Invoice →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomInvoiceCreate;
