import React, { useEffect, useRef, useState } from 'react';
import { apiService } from '../../services/api';

export interface PickedCustomer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface CustomerPickerProps {
  value: PickedCustomer | null;
  onChange: (customer: PickedCustomer | null) => void;
}

const CustomerPicker: React.FC<CustomerPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PickedCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await apiService.searchCustomers(query.trim());
        setResults(res?.data?.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const select = (c: PickedCustomer) => {
    onChange(c);
    setQuery('');
    setResults([]);
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
        {value ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, color: '#111827' }}>{value.name}</span>
            <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value.phone}
            </span>
          </span>
        ) : (
          <span style={{ color: '#9ca3af' }}>Search customer by name or phone…</span>
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
              placeholder="Type at least 2 characters…"
              style={{
                width: '100%', padding: '6px 9px', border: '1px solid #e5e7eb', borderRadius: 5,
                fontSize: 12.5, boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '14px 12px', fontSize: 12.5, color: '#9ca3af', textAlign: 'center' }}>Searching…</div>
            ) : query.trim().length < 2 ? (
              <div style={{ padding: '14px 12px', fontSize: 12.5, color: '#9ca3af', textAlign: 'center' }}>Type to search</div>
            ) : results.length === 0 ? (
              <div style={{ padding: '14px 12px', fontSize: 12.5, color: '#9ca3af', textAlign: 'center' }}>No matching customers</div>
            ) : (
              results.map(c => (
                <div
                  key={c._id}
                  onMouseDown={() => select(c)}
                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f6f6f6' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: '#111827' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{[c.phone, c.email].filter(Boolean).join(' · ')}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPicker;
