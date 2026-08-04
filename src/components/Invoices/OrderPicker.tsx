import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STATUS_COLORS } from '../../constants/dashboardColors';

interface OrderOption {
  _id: string;
  orderNumber: string;
  customer?: { name?: string; phone?: string };
  status?: string;
  deliveryDate?: string;
  payment?: { total?: number };
}

interface OrderPickerProps {
  orders: OrderOption[];
  value: string;
  onChange: (id: string) => void;
}

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

const OrderStatusPill: React.FC<{ status?: string }> = ({ status }) => {
  const s = STATUS_COLORS[status || 'pending'] || { bg: '#f1f5f9', text: '#64748b' };
  return (
    <span style={{
      display: 'inline-block', borderRadius: 10, fontSize: 9.5, fontWeight: 600,
      padding: '2px 7px', background: s.bg, color: s.text, textTransform: 'capitalize', flexShrink: 0
    }}>
      {(status || 'pending').replace('_', ' ')}
    </span>
  );
};

const OrderPicker: React.FC<OrderPickerProps> = ({ orders, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => orders.find(o => o._id === value), [orders, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q)
    );
  }, [orders, query]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const select = (o: OrderOption) => {
    onChange(o._id);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13,
          height: 36, boxSizing: 'border-box', background: '#fff', cursor: 'pointer', textAlign: 'left'
        }}
      >
        {selected ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, color: '#111827', flexShrink: 0 }}>{selected.orderNumber}</span>
            <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected.customer?.name || '—'}
            </span>
          </span>
        ) : (
          <span style={{ color: '#9ca3af' }}>{orders.length ? 'Select order…' : 'No orders found'}</span>
        )}
        <span style={{ color: '#9ca3af', fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden'
        }}>
          <div style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search order # or customer…"
              style={{
                width: '100%', padding: '6px 9px', border: '1px solid #e5e7eb', borderRadius: 5,
                fontSize: 12.5, boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '14px 12px', fontSize: 12.5, color: '#9ca3af', textAlign: 'center' }}>
                No matching orders
              </div>
            ) : (
              filtered.map(o => (
                <div
                  key={o._id}
                  onMouseDown={() => select(o)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer',
                    background: o._id === value ? '#f9fafb' : 'transparent',
                    borderBottom: '1px solid #f6f6f6'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = o._id === value ? '#f9fafb' : 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 12.5, color: '#111827' }}>{o.orderNumber}</span>
                    <OrderStatusPill status={o.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, fontSize: 11, color: '#6b7280' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.customer?.name || '—'}
                    </span>
                    <span style={{ flexShrink: 0, marginLeft: 8 }}>
                      ₹{(o.payment?.total || 0).toLocaleString('en-IN')} · Due {fmtDate(o.deliveryDate)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPicker;
