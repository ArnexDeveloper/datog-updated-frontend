import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { getMeasurementFields, resolveGarmentType } from '../../utils/garmentTypes';

const PRIORITIES: { value: string; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

interface Employee {
  _id: string;
  name: string;
}

interface MeasurementData {
  _id?: string;
  notes?: string;
  [key: string]: any;
}

interface GarmentRow {
  garmentIndex: number;
  type: string;
  name: string;
  quantity: number;
  assignedTo: string;
  priority: string;
  notes: string;
  specialInstructions: string;
  measurements: MeasurementData;
  measurementsExpanded: boolean;
}

interface GenerateJobCardsModalProps {
  orderId: string;
  orderNumber: string;
  onClose: () => void;
  onGenerated: (count: number) => void;
}

// Opens before job cards are actually created — one row per garment on the
// order, each with its own assignee/priority/quantity/measurements/notes,
// reviewed and editable here instead of being generated blind with
// hardcoded defaults straight from the Orders list. Fetches the order
// itself (rather than trusting whatever the Orders list already had in
// memory) because the list endpoint doesn't populate garment measurements.
const GenerateJobCardsModal: React.FC<GenerateJobCardsModalProps> = ({
  orderId, orderNumber, onClose, onGenerated
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customerId, setCustomerId] = useState<string>('');
  const [customerGender, setCustomerGender] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<GarmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiService.getEmployees({ limit: 100 })
      .then((res: any) => setEmployees(res.data?.data || []))
      .catch(() => setEmployees([]));

    apiService.getOrder(orderId)
      .then((res: any) => {
        const order = res.data?.data?.order;
        setCustomerId(order?.customer?._id || order?.customer || '');
        setCustomerGender(order?.customer?.gender);
        const garments = order?.garments || [];
        setRows(garments.map((g: any, i: number) => ({
          garmentIndex: i,
          type: g.type,
          name: g.name,
          quantity: g.quantity || 1,
          assignedTo: '',
          priority: 'medium',
          notes: '',
          specialInstructions: g.specialInstructions || '',
          measurements: g.measurements && typeof g.measurements === 'object' ? { ...g.measurements } : {},
          measurementsExpanded: false
        })));
      })
      .catch(() => setError('Failed to load order details'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const updateRow = (index: number, patch: Partial<GarmentRow>) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const updateMeasurement = (index: number, field: string, value: string) => {
    setRows(prev => prev.map((r, i) => {
      if (i !== index) return r;
      return {
        ...r,
        measurements: {
          ...r.measurements,
          [field]: value === '' ? undefined : parseFloat(value)
        }
      };
    }));
  };

  const applyToAll = (patch: Partial<GarmentRow>) => {
    setRows(prev => prev.map(r => ({ ...r, ...patch })));
  };

  // Saves each row's edited measurements before generating job cards — an
  // existing linked measurement document gets updated in place (which also
  // keeps the order itself in sync, since both point at the same
  // document); a garment with no measurement document yet gets a new one
  // created, whose id is passed through as this batch's override only
  // (see jobcard.controller.js) rather than also patching the order here.
  const saveMeasurementsAndBuildOverrides = async () => {
    const SKIP = ['_id', 'customer', 'order', 'garmentType', 'unit', 'takenBy', 'isActive', 'version', 'createdAt', 'updatedAt', '__v', 'customMeasurements', 'notes'];
    return Promise.all(rows.map(async (row) => {
      const measurementId = row.measurements?._id;
      const numericFields: Record<string, number> = {};
      for (const [k, v] of Object.entries(row.measurements || {})) {
        if (SKIP.includes(k)) continue;
        const num = parseFloat(v as any);
        if (!isNaN(num) && num > 0) numericFields[k] = num;
      }
      const hasValues = Object.keys(numericFields).length > 0;

      let measurementsOverride: string | undefined;
      if (hasValues) {
        if (measurementId) {
          await apiService.updateMeasurement(measurementId, { ...numericFields, notes: row.measurements.notes || undefined });
        } else {
          const payload = {
            customer: customerId,
            garmentType: resolveGarmentType(row.type),
            unit: 'inch',
            ...numericFields,
            notes: row.measurements.notes || undefined
          };
          const res = await apiService.createMeasurement(payload);
          measurementsOverride = res.data?.data?._id;
        }
      }

      return {
        garmentIndex: row.garmentIndex,
        assignedTo: row.assignedTo || undefined,
        priority: row.priority,
        notes: row.notes || undefined,
        specialInstructions: row.specialInstructions,
        quantity: row.quantity,
        measurements: measurementsOverride
      };
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const garmentOverrides = await saveMeasurementsAndBuildOverrides();
      const res = await apiService.generateJobCardsFromOrder(orderId, { garments: garmentOverrides });
      if (res.data?.success) {
        onGenerated(res.data.data?.length || rows.length);
      } else {
        setError(res.data?.message || 'Failed to generate job cards');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate job cards');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-base font-semibold text-gray-900">🧵 Generate Job Cards — Order #{orderNumber}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {!loading && (
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium text-gray-500">Apply to all:</span>
            <select
              className="text-xs border border-gray-300 rounded px-2 py-1"
              defaultValue=""
              onChange={e => { if (e.target.value) { applyToAll({ assignedTo: e.target.value }); e.target.value = ''; } }}
            >
              <option value="" disabled>Assign employee…</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
            <select
              className="text-xs border border-gray-300 rounded px-2 py-1"
              defaultValue=""
              onChange={e => { if (e.target.value) { applyToAll({ priority: e.target.value }); e.target.value = ''; } }}
            >
              <option value="" disabled>Set priority…</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1 }} className="px-5 py-3">
          {error && <div className="mb-3 px-3 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Loading order…</div>
          ) : (
            <div className="space-y-3">
              {rows.map((row, i) => {
                const measFields = getMeasurementFields(row.type, customerGender);
                return (
                  <div key={i} className="p-3 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-800">{row.name || row.type}</div>
                      <div>
                        <label className="text-xs text-gray-500 mr-2">Qty</label>
                        <input
                          type="number" min={1} value={row.quantity}
                          onChange={e => updateRow(i, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm text-center" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Employee</label>
                        <select
                          value={row.assignedTo}
                          onChange={e => updateRow(i, { assignedTo: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm">
                          <option value="">Me (default)</option>
                          {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                        <select
                          value={row.priority}
                          onChange={e => updateRow(i, { priority: e.target.value })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm">
                          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Notes for this job card</label>
                      <textarea
                        value={row.notes}
                        onChange={e => updateRow(i, { notes: e.target.value })}
                        rows={2}
                        placeholder="Any instructions for whoever picks this up…"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm resize-none" />
                    </div>
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Special Instructions</label>
                      <textarea
                        value={row.specialInstructions}
                        onChange={e => updateRow(i, { specialInstructions: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm resize-none" />
                    </div>

                    {measFields.length > 0 && (
                      <div className="border border-amber-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateRow(i, { measurementsExpanded: !row.measurementsExpanded })}
                          className="w-full flex justify-between items-center px-3 py-2 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                        >
                          <span className="text-xs font-medium text-amber-800 flex items-center gap-2">
                            📏 Measurements
                            {row.measurements?._id && (
                              <span className="text-xs px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full">Saved</span>
                            )}
                          </span>
                          <svg className={`w-3.5 h-3.5 text-amber-600 transition-transform ${row.measurementsExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {row.measurementsExpanded && (
                          <div className="p-3 bg-white grid grid-cols-2 md:grid-cols-3 gap-2">
                            {measFields.map(field => (
                              <div key={field.key}>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                                <div className="relative">
                                  <input
                                    type="number" step="0.1" min="0"
                                    placeholder={field.placeholder}
                                    value={row.measurements?.[field.key] ?? ''}
                                    onChange={e => updateMeasurement(i, field.key, e.target.value)}
                                    className="w-full px-2 py-1.5 pr-8 border border-gray-300 rounded-md text-sm focus:ring-amber-500 focus:border-amber-500" />
                                  <span className="absolute right-2 top-1.5 text-xs text-gray-400">{field.unit ?? 'in'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving || loading || rows.length === 0}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Generating…' : `Generate ${rows.length} Job Card${rows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateJobCardsModal;
