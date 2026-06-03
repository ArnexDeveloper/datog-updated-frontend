import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import MeasurementForm from './MeasurementForm';
import MeasurementTemplates from './MeasurementTemplates';
import './Measurements.css';

// ── Garment icons ────────────────────────────────────────────────────────────
const GARMENT_ICONS: Record<string, string> = {
  shirt: '👔', pant: '👖', suit: '🥼', blazer: '🥼', kurta: '🧥',
  pajama: '👘', sherwani: '🧣', lehenga: '👗', saree_blouse: '👗',
  dress: '👗', skirt: '🩱', top: '👚', jacket: '🧥', coat: '🧥',
  waistcoat: '🎩', dhoti: '🧣', churidar: '👖', salwar: '👘',
  dupatta: '🪡', other: '📏',
};

const GARMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  shirt:       { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  pant:        { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  suit:        { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  blazer:      { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
  kurta:       { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  pajama:      { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  sherwani:    { bg: '#fdf4ff', text: '#a21caf', border: '#f0abfc' },
  lehenga:     { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  saree_blouse:{ bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  dress:       { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  skirt:       { bg: '#fdf4ff', text: '#a21caf', border: '#f0abfc' },
  jacket:      { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  coat:        { bg: '#f8fafc', text: '#475569', border: '#cbd5e1' },
  waistcoat:   { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  other:       { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
};

function getGarmentColor(type: string) {
  return GARMENT_COLORS[type] || GARMENT_COLORS.other;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatField(key: string) {
  const labels: Record<string, string> = {
    chest: 'Chest', bust: 'Bust', waist: 'Waist', hip: 'Hip',
    shoulder: 'Shoulder', armLength: 'Sleeve', armHole: 'Arm Hole',
    bicep: 'Bicep', forearm: 'Forearm', wrist: 'Wrist', neck: 'Neck',
    shirtLength: 'Shirt Len', kurtalLength: 'Kurta Len',
    inseam: 'Inseam', outseam: 'Length', thigh: 'Thigh',
    knee: 'Knee', calf: 'Calf', ankle: 'Ankle', rise: 'Rise',
    dressLength: 'Dress Len', skirtLength: 'Skirt Len', blouseLength: 'Blouse Len',
    height: 'Height', weight: 'Weight',
  };
  return labels[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

const SKIP_FIELDS = new Set([
  '_id', 'customer', 'order', 'garmentType', 'unit', 'takenBy',
  'isActive', 'version', 'createdAt', 'updatedAt', '__v',
  'customMeasurements', 'notes',
]);

const FIELD_ORDER = [
  'chest', 'bust', 'waist', 'hip', 'shoulder', 'armLength', 'armHole',
  'bicep', 'wrist', 'neck', 'shirtLength', 'kurtalLength', 'dressLength',
  'skirtLength', 'blouseLength', 'inseam', 'outseam', 'thigh', 'knee',
  'calf', 'ankle', 'rise', 'height', 'weight',
];

function getRelevantFields(measurement: any) {
  const ordered = FIELD_ORDER.filter(
    f => measurement[f] != null && measurement[f] > 0
  );
  const extra = Object.keys(measurement).filter(
    k => !SKIP_FIELDS.has(k) && !FIELD_ORDER.includes(k)
      && typeof measurement[k] === 'number' && measurement[k] > 0
  );
  return [...ordered, ...extra];
}

// Avatar gradient colours cycling through a palette
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#1d4ed8,#3b82f6)',
  'linear-gradient(135deg,#065f46,#10b981)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#c2410c,#f97316)',
  'linear-gradient(135deg,#be123c,#f43f5e)',
  'linear-gradient(135deg,#0369a1,#38bdf8)',
];

// ── Component ────────────────────────────────────────────────────────────────

const Measurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedGarmentType, setSelectedGarmentType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ garmentType: 'all', customer: 'all' });
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const garmentTypes = [
    'shirt','pant','suit','blazer','kurta','pajama','sherwani',
    'lehenga','saree_blouse','dress','skirt','top','jacket',
    'coat','waistcoat','dhoti','churidar','salwar','dupatta','other'
  ];

  useEffect(() => { loadMeasurements(); loadCustomers(); }, [filters]);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        garmentType: filters.garmentType !== 'all' ? filters.garmentType : undefined,
        customer: filters.customer !== 'all' ? filters.customer : undefined,
      };
      const r = await apiService.getMeasurements(params);
      if (r.data.success) setMeasurements(r.data.data);
    } catch { setError('Failed to load measurements'); }
    finally { setLoading(false); }
  };

  const loadCustomers = async () => {
    try {
      const r = await apiService.getCustomers({ isActive: 'true' });
      if (r.data.success) setCustomers(r.data.data);
    } catch {}
  };

  const handleSearch = (e: any) => { e.preventDefault(); loadMeasurements(); };

  const handleDeleteMeasurement = async (id: string) => {
    if (!window.confirm('Delete this measurement record?')) return;
    try {
      await apiService.deleteMeasurement(id);
      loadMeasurements();
    } catch { setError('Failed to delete measurement'); }
  };

  const groupByCustomer = () => {
    const grouped: any = {};
    (measurements as any[]).forEach((m: any) => {
      const cid = m.customer._id;
      if (!grouped[cid]) grouped[cid] = { customer: m.customer, measurements: [] };
      grouped[cid].measurements.push(m);
    });
    return Object.values(grouped) as any[];
  };

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading && (measurements as any[]).length === 0) {
    return (
      <div className="meas-loading">
        <div className="meas-spinner" />
        <p>Loading measurements…</p>
      </div>
    );
  }

  const groups = groupByCustomer();
  const totalRecords = (measurements as any[]).length;

  return (
    <div className="meas-page">

      {/* ── Header ── */}
      <div className="meas-page-header">
        <div>
          <h1 className="meas-page-title">Measurements</h1>
          <p className="meas-page-sub">
            {totalRecords} record{totalRecords !== 1 ? 's' : ''} across {groups.length} customer{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="meas-header-actions">
          <button className="meas-btn meas-btn-outline" onClick={() => setShowTemplates(true)}>
            📏 Templates
          </button>
          <button className="meas-btn meas-btn-primary" onClick={() => { setEditingMeasurement(null); setShowAddForm(true); }}>
            + New Measurement
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="meas-alert">
          {error}
          <button onClick={() => setError(null)} className="meas-alert-close">×</button>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="meas-controls">
        <form onSubmit={handleSearch} className="meas-search-form">
          <div className="meas-search-wrap">
            <span className="meas-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by customer name…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="meas-search-input"
            />
          </div>
          <button type="submit" className="meas-btn meas-btn-outline meas-btn-sm">Search</button>
        </form>

        <div className="meas-filters">
          <select
            value={filters.garmentType}
            onChange={e => setFilters(p => ({ ...p, garmentType: e.target.value }))}
            className="meas-filter-select"
          >
            <option value="all">All Garments</option>
            {garmentTypes.map(t => (
              <option key={t} value={t}>
                {GARMENT_ICONS[t] || '📏'} {t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={filters.customer}
            onChange={e => setFilters(p => ({ ...p, customer: e.target.value }))}
            className="meas-filter-select"
          >
            <option value="all">All Customers</option>
            {(customers as any[]).map((c: any) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Quick action pills ── */}
      <div className="meas-quick-pills">
        <button className="meas-pill" onClick={() => setShowAddForm(true)}>
          <span>➕</span> New Record
        </button>
        <button className="meas-pill" onClick={() => setShowTemplates(true)}>
          <span>📐</span> Templates
        </button>
        <button className="meas-pill" onClick={() => { setSearchTerm(''); setFilters({ garmentType: 'all', customer: 'all' }); loadMeasurements(); }}>
          <span>↺</span> Reset filters
        </button>
      </div>

      {/* ── Content ── */}
      {groups.length === 0 ? (
        <div className="meas-empty">
          <div className="meas-empty-icon">📏</div>
          <h3>No measurements yet</h3>
          <p>Start by taking your first customer measurement</p>
          <button className="meas-btn meas-btn-primary" onClick={() => setShowAddForm(true)}>
            Take First Measurement
          </button>
        </div>
      ) : (
        <div className="meas-groups">
          {groups.map((group: any, gi: number) => {
            const gradient = AVATAR_GRADIENTS[gi % AVATAR_GRADIENTS.length];
            return (
              <div key={group.customer._id} className="meas-customer-card">

                {/* Customer header */}
                <div className="meas-customer-head">
                  <div className="meas-customer-left">
                    <div className="meas-avatar" style={{ background: gradient }}>
                      {getInitials(group.customer.name)}
                    </div>
                    <div className="meas-customer-info">
                      <h3 className="meas-customer-name">{group.customer.name}</h3>
                      <span className="meas-customer-phone">{group.customer.phone}</span>
                    </div>
                  </div>
                  <div className="meas-customer-right">
                    <span className="meas-count-badge">
                      {group.measurements.length} record{group.measurements.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      className="meas-btn meas-btn-ghost meas-btn-sm"
                      onClick={() => { setEditingMeasurement(null); setShowAddForm(true); }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Measurement records */}
                <div className="meas-records">
                  {group.measurements.map((m: any) => {
                    const col = getGarmentColor(m.garmentType);
                    const fields = getRelevantFields(m);
                    const isExpanded = expandedCards.has(m._id);
                    const previewFields = isExpanded ? fields : fields.slice(0, 6);

                    return (
                      <div key={m._id} className="meas-record">

                        {/* Record header row */}
                        <div className="meas-record-top">
                          <div className="meas-record-meta">
                            <span
                              className="meas-garment-badge"
                              style={{ background: col.bg, color: col.text, borderColor: col.border }}
                            >
                              {GARMENT_ICONS[m.garmentType] || '📏'}
                              {' '}
                              {m.garmentType.charAt(0).toUpperCase() + m.garmentType.slice(1).replace('_', ' ')}
                            </span>
                            <span className="meas-record-date">
                              📅 {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="meas-unit-tag">{m.unit || 'inch'}</span>
                          </div>
                          <div className="meas-record-actions">
                            <button
                              className="meas-btn meas-btn-ghost meas-btn-xs"
                              onClick={() => { setEditingMeasurement(m); setShowAddForm(true); }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="meas-btn meas-btn-danger meas-btn-xs"
                              onClick={() => handleDeleteMeasurement(m._id)}
                            >
                              🗑
                            </button>
                          </div>
                        </div>

                        {/* Measurement chips grid */}
                        {fields.length > 0 ? (
                          <>
                            <div className="meas-chips-grid">
                              {previewFields.map(field => (
                                <div key={field} className="meas-chip">
                                  <span className="meas-chip-label">{formatField(field)}</span>
                                  <span className="meas-chip-value" style={{ color: col.text }}>
                                    {m[field]}
                                    <span className="meas-chip-unit">{m.unit || 'in'}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                            {fields.length > 6 && (
                              <button className="meas-expand-btn" onClick={() => toggleExpand(m._id)}>
                                {isExpanded ? '▲ Show less' : `▼ Show ${fields.length - 6} more`}
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="meas-no-values">No measurement values recorded yet.</p>
                        )}

                        {/* Custom measurements */}
                        {m.customMeasurements && m.customMeasurements.length > 0 && (
                          <div className="meas-custom-wrap">
                            <span className="meas-custom-label">Custom</span>
                            {m.customMeasurements.map((c: any, ci: number) => (
                              <span key={ci} className="meas-custom-chip">
                                {c.name}: <strong>{c.value}</strong> {c.unit}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {m.notes && (
                          <div className="meas-notes">
                            <span className="meas-notes-icon">💬</span>
                            {m.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showAddForm && (
        <MeasurementForm
          measurement={editingMeasurement}
          customers={customers}
          onClose={() => { setShowAddForm(false); setEditingMeasurement(null); loadMeasurements(); }}
          onSave={loadMeasurements}
        />
      )}
      {showTemplates && (
        <MeasurementTemplates
          onClose={() => setShowTemplates(false)}
          garmentTypes={garmentTypes}
        />
      )}
    </div>
  );
};

export default Measurements;
