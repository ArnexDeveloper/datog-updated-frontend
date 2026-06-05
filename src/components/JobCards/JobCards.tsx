import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { apiService } from '../../services/api';
import './JobCards.css';

// ── Measurement helpers ────────────────────────────────────────────────────────

const MEASUREMENT_LABELS: Record<string, string> = {
  chest: 'Chest/Bust', bust: 'Bust', waist: 'Waist', hip: 'Hip',
  shoulder: 'Shoulder', armLength: 'Sleeve', armHole: 'Arm Hole', neck: 'Neck',
  shirtLength: 'Shirt Length', kurtalLength: 'Kurta Length',
  inseam: 'Inseam', outseam: 'Length/Outseam', thigh: 'Thigh',
  knee: 'Knee', calf: 'Calf', ankle: 'Ankle', rise: 'Rise',
  blouseLength: 'Blouse Length', skirtLength: 'Skirt Length', dressLength: 'Dress Length',
};

const SKIP_KEYS = new Set([
  '_id','customer','order','garmentType','unit','takenBy','isActive',
  'version','createdAt','updatedAt','__v','customMeasurements','notes'
]);

// Maps DB field names → JobCardPrint label names
const DB_TO_PRINT_LABEL: Record<string, string> = {
  chest: 'Chest', bust: 'Chest', waist: 'Tummy', hip: 'Hips',
  shoulder: 'Shoulder', armLength: 'Sleeves', neck: 'Neck',
  bicep: 'Biceps', forearm: 'Forearms',
  shirtLength: 'Length', outseam: 'Length', kurtalLength: 'Length',
  dressLength: 'Length', skirtLength: 'Length', blouseLength: 'Length',
};

function buildPrintMeasurements(m: any): Record<string, number> {
  if (!m || typeof m !== 'object') return {};
  const result: Record<string, number> = {};
  Object.entries(m).forEach(([k, v]) => {
    if (SKIP_KEYS.has(k)) return;
    const label = DB_TO_PRINT_LABEL[k];
    if (label && typeof v === 'number' && v > 0 && !result[label]) {
      result[label] = v;
    }
  });
  return result;
}

// ── Measurement field definitions (per garment type) ─────────────────────────

const getMeasurementFields = (type: string): { key: string; label: string; placeholder: string }[] => {
  const t = type.toLowerCase();
  if (['shirt','kurta','kurti','kamize','pathni','jubba','blouse'].includes(t))
    return [
      { key: 'chest',       label: 'Chest/Bust', placeholder: '40' },
      { key: 'waist',       label: 'Waist',      placeholder: '34' },
      { key: 'shoulder',    label: 'Shoulder',   placeholder: '18' },
      { key: 'armLength',   label: 'Sleeve',     placeholder: '24' },
      { key: 'shirtLength', label: 'Length',     placeholder: '30' },
      { key: 'neck',        label: 'Neck',       placeholder: '16' },
    ];
  if (['trousers','pant','pajama','pajamas','shalwars','dhoti','churidar','salwar'].includes(t))
    return [
      { key: 'waist',   label: 'Waist',  placeholder: '32' },
      { key: 'hip',     label: 'Hip',    placeholder: '38' },
      { key: 'outseam', label: 'Length', placeholder: '42' },
      { key: 'inseam',  label: 'Inseam', placeholder: '32' },
      { key: 'thigh',   label: 'Thigh',  placeholder: '24' },
      { key: 'rise',    label: 'Rise',   placeholder: '11' },
    ];
  if (['blazer','jacket','west-coat','waistcoat','sherwani','coat','suit'].includes(t))
    return [
      { key: 'chest',       label: 'Chest',    placeholder: '42' },
      { key: 'waist',       label: 'Waist',    placeholder: '36' },
      { key: 'shoulder',    label: 'Shoulder', placeholder: '19' },
      { key: 'armLength',   label: 'Sleeve',   placeholder: '25' },
      { key: 'shirtLength', label: 'Length',   placeholder: '28' },
      { key: 'neck',        label: 'Neck',     placeholder: '16' },
    ];
  if (['dress','gowne','one-pec','kaftan'].includes(t))
    return [
      { key: 'bust',        label: 'Bust',         placeholder: '36' },
      { key: 'waist',       label: 'Waist',        placeholder: '28' },
      { key: 'hip',         label: 'Hip',          placeholder: '38' },
      { key: 'shoulder',    label: 'Shoulder',     placeholder: '16' },
      { key: 'dressLength', label: 'Dress Length', placeholder: '42' },
    ];
  if (['skirt','skirts','garara','sharara','lehenga'].includes(t))
    return [
      { key: 'waist',       label: 'Waist',  placeholder: '28' },
      { key: 'hip',         label: 'Hip',    placeholder: '38' },
      { key: 'skirtLength', label: 'Length', placeholder: '40' },
    ];
  // default
  return [
    { key: 'chest',       label: 'Chest/Bust', placeholder: '40' },
    { key: 'waist',       label: 'Waist',      placeholder: '34' },
    { key: 'shoulder',    label: 'Shoulder',   placeholder: '18' },
    { key: 'shirtLength', label: 'Length',     placeholder: '30' },
  ];
};

const VALID_MEASUREMENT_TYPES = [
  'shirt','pant','suit','blazer','kurta','pajama','sherwani',
  'lehenga','saree_blouse','dress','skirt','top','jacket',
  'coat','waistcoat','dhoti','churidar','salwar','dupatta'
];

const resolveGarmentType = (type: string): string => {
  const t = type.toLowerCase();
  if (VALID_MEASUREMENT_TYPES.includes(t)) return t;
  if (['trousers','pajamas','shalwars'].includes(t)) return 'pant';
  if (['kurti','kamize','pathni','jubba'].includes(t)) return 'kurta';
  if (['west-coat'].includes(t)) return 'waistcoat';
  if (['gowne','one-pec','kaftan'].includes(t)) return 'dress';
  if (['skirts','garara','sharara'].includes(t)) return 'skirt';
  return 'other';
};

// ── Measurement panel (inline row detail) ─────────────────────────────────────

const MeasurementPanel = ({ measurements }: { measurements: any }) => {
  if (!measurements || typeof measurements !== 'object' || !measurements._id) {
    return <p className="jc-no-meas">No measurements recorded for this garment.</p>;
  }
  const unit = measurements.unit || 'inch';
  const fields = Object.entries(measurements)
    .filter(([k, v]) => !SKIP_KEYS.has(k) && typeof v === 'number' && (v as number) > 0)
    .map(([k, v]) => ({ key: k, label: MEASUREMENT_LABELS[k] || k, value: v as number }));

  if (fields.length === 0)
    return <p className="jc-no-meas">Measurement record exists but no values entered yet.</p>;

  return (
    <div className="jc-meas-panel">
      <div className="jc-meas-grid">
        {fields.map(f => (
          <div key={f.key} className="jc-meas-cell">
            <span className="jc-meas-label">{f.label}</span>
            <span className="jc-meas-value">{f.value} <span className="jc-meas-unit">{unit}</span></span>
          </div>
        ))}
      </div>
      {measurements.notes && (
        <p className="jc-meas-notes"><strong>Notes:</strong> {measurements.notes}</p>
      )}
      {measurements.customMeasurements?.length > 0 && (
        <div className="jc-meas-custom">
          <strong>Custom:</strong>
          {measurements.customMeasurements.map((cm: any, i: number) => (
            <span key={i} className="jc-meas-custom-item">{cm.name}: {cm.value} {cm.unit || unit}</span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Printable job card ─────────────────────────────────────────────────────────

const PRINT_LABELS = ['Length','Chest','Shape','Tummy','Hips','Neck','Shoulder','Sleeves','Biceps','Forearms'];

type Lang = 'en' | 'hi';

const T = {
  en: {
    shopName:     "DA TOG'S DESIGNER LOUNGE",
    jobCard:      '*** JOB CARD ***',
    jobNo:        'Job #',
    order:        'Order',
    garment:      'Garment',
    qty:          'Qty',
    fit:          'Fit',
    tailor:       'Tailor',
    delivery:     'Delivery',
    trial:        'Trial',
    measurements: 'MEASUREMENTS',
    measurement:  'Measurement',
    value:        'Value',
    notes:        'Notes for Tailor',
    noMeas:       'No measurements recorded',
    thankYou:     'Thank You',
    labels: {
      Length: 'Length', Chest: 'Chest', Shape: 'Shape', Tummy: 'Tummy',
      Hips: 'Hips', Neck: 'Neck', Shoulder: 'Shoulder', Sleeves: 'Sleeves',
      Biceps: 'Biceps', Forearms: 'Forearms',
    } as Record<string, string>,
  },
  hi: {
    shopName:     'दा टोग्स डिज़ाइनर लाउंज',
    jobCard:      '*** जॉब कार्ड ***',
    jobNo:        'जॉब नं.',
    order:        'ऑर्डर',
    garment:      'कपड़ा',
    qty:          'मात्रा',
    fit:          'फिट',
    tailor:       'दर्जी',
    delivery:     'डिलीवरी',
    trial:        'ट्रायल',
    measurements: 'माप',
    measurement:  'माप',
    value:        'मूल्य',
    notes:        'दर्जी के लिए नोट्स',
    noMeas:       'कोई माप दर्ज नहीं है',
    thankYou:     'धन्यवाद',
    labels: {
      Length: 'लंबाई', Chest: 'छाती', Shape: 'आकार', Tummy: 'पेट',
      Hips: 'कूल्हे', Neck: 'गर्दन', Shoulder: 'कंधा', Sleeves: 'आस्तीन',
      Biceps: 'बाइसेप्स', Forearms: 'अग्रभुज',
    } as Record<string, string>,
  },
};

interface PrintableCardProps {
  job: any;
  lang?: Lang;
}
const PrintableCard = React.forwardRef<HTMLDivElement, PrintableCardProps>(({ job, lang = 'en' }, ref) => {
  const t = T[lang];
  const measurements = buildPrintMeasurements(job.garment?.measurements);
  const unit = job.garment?.measurements?.unit || 'inch';
  const filledRows = PRINT_LABELS.filter(label => measurements[label] != null);
  const customMeasurements = (job.garment?.measurements?.customMeasurements || [])
    .filter((c: any) => c.value > 0);

  return (
    <div ref={ref} className="jc-print-card job-card-print-area">
      {/* Business header */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
        {t.shopName}
      </div>
      <div style={{ textAlign: 'center', fontSize: '10px', marginBottom: '4px' }}>
        {t.jobCard}
      </div>
      <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }} />

      {/* Job info */}
      <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
        <div><strong>{t.jobNo}:</strong> {job.jobNumber}</div>
        <div><strong>{t.order}:</strong> {job.order?.orderNumber || '—'}</div>
        <div><strong>{t.garment}:</strong> {job.garment?.name} ({job.garment?.type})</div>
        <div><strong>{t.qty}:</strong> {job.garment?.quantity} &nbsp; <strong>{t.fit}:</strong> {job.garment?.fit || '—'}</div>
        <div><strong>{t.tailor}:</strong> {job.assignedTo?.name || '—'}</div>
        <div><strong>{t.delivery}:</strong> {job.deliveryDate ? new Date(job.deliveryDate).toLocaleDateString('en-IN') : '—'}</div>
        {job.trialDate && (
          <div><strong>{t.trial}:</strong> {new Date(job.trialDate).toLocaleDateString('en-IN')}</div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      {/* Measurements table */}
      <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
        {t.measurements} ({unit})
      </div>
      {filledRows.length > 0 || customMeasurements.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left', fontWeight: 'bold' }}>
                {t.measurement}
              </th>
              <th style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left', fontWeight: 'bold' }}>
                {t.value}
              </th>
            </tr>
          </thead>
          <tbody>
            {filledRows.map(label => (
              <tr key={label}>
                <td style={{ border: '1px solid #000', padding: '2px 4px' }}>
                  {lang === 'hi' ? `${t.labels[label] || label} (${label})` : label}
                </td>
                <td style={{ border: '1px solid #000', padding: '2px 4px' }}>{measurements[label]} {unit}</td>
              </tr>
            ))}
            {customMeasurements.map((c: any, i: number) => (
              <tr key={`custom-${i}`}>
                <td style={{ border: '1px solid #000', padding: '2px 4px' }}>{c.name}</td>
                <td style={{ border: '1px solid #000', padding: '2px 4px' }}>{c.value} {c.unit || unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ fontSize: '10px' }}>{t.noMeas}</div>
      )}

      {/* Notes */}
      {(job.garment?.specialInstructions || job.notes || job.garment?.measurements?.notes) && (
        <>
          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
          <div style={{ fontSize: '11px' }}>
            <strong>{t.notes}:</strong>
            {job.garment?.measurements?.notes && (
              <div style={{ marginTop: '2px' }}>{job.garment.measurements.notes}</div>
            )}
            {job.garment?.specialInstructions && (
              <div style={{ marginTop: '2px' }}>{job.garment.specialInstructions}</div>
            )}
            {job.notes && (
              <div style={{ marginTop: '2px' }}>{job.notes}</div>
            )}
          </div>
        </>
      )}

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
      <div style={{ textAlign: 'center', fontSize: '10px' }}>{t.thankYou}</div>

      <style>{`
        .jc-print-card {
          font-family: 'Courier New', Courier, monospace;
          width: 76mm;
          padding: 2mm;
          background: #fff;
          color: #000;
        }
        @media print {
          @page {
            size: 80mm auto;
            margin: 2mm;
          }

          body * {
            visibility: hidden;
          }

          .job-card-print-area, .job-card-print-area * {
            visibility: visible;
          }

          .job-card-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 76mm;
            font-size: 11px;
            font-family: monospace;
          }

          .job-card-print-area table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          .job-card-print-area td, .job-card-print-area th {
            border: 1px solid #000;
            padding: 2px 4px;
            word-wrap: break-word;
          }

          * {
            page-break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>
    </div>
  );
});
PrintableCard.displayName = 'PrintableCard';

// ── Edit modal ─────────────────────────────────────────────────────────────────

interface EditModalProps {
  job: any;
  employees: any[];
  onClose: () => void;
  onSaved: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ job, employees, onClose, onSaved }) => {
  const existingMeas = job.garment?.measurements;
  const hasSavedMeas = existingMeas && typeof existingMeas === 'object' && existingMeas._id;

  const [form, setForm] = useState({
    status:              job.status || 'assigned',
    priority:            job.priority || 'medium',
    assignedTo:          job.assignedTo?._id || job.assignedTo || '',
    deliveryDate:        job.deliveryDate ? new Date(job.deliveryDate).toISOString().split('T')[0] : '',
    trialDate:           job.trialDate ? new Date(job.trialDate).toISOString().split('T')[0] : '',
    estimatedHours:      job.estimatedHours ?? '',
    notes:               job.notes || '',
    garmentFit:          job.garment?.fit || 'regular',
    specialInstructions: job.garment?.specialInstructions || '',
  });

  // Initialise measurement values from the populated measurement document
  const [measForm, setMeasForm] = useState<Record<string, string>>(() => {
    if (!hasSavedMeas) return {};
    const init: Record<string, string> = {};
    const mFields = getMeasurementFields(job.garment?.type || '');
    mFields.forEach(f => {
      const val = existingMeas[f.key];
      if (val != null) init[f.key] = String(val);
    });
    // also notes
    if (existingMeas.notes) init['_notes'] = existingMeas.notes;
    return init;
  });

  const [measOpen, setMeasOpen] = useState(hasSavedMeas);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const measFields = getMeasurementFields(job.garment?.type || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMeasChange = (key: string, value: string) => {
    setMeasForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // 1. Status change goes through the dedicated endpoint (preserves history)
      if (form.status !== job.status) {
        await apiService.updateJobCardStatus(job._id, form.status);
      }

      // 2. Save measurements if the section is open and any values were entered
      if (measOpen) {
        const numericValues: Record<string, number> = {};
        measFields.forEach(f => {
          const v = parseFloat(measForm[f.key] || '');
          if (!isNaN(v) && v > 0) numericValues[f.key] = v;
        });

        const hasValues = Object.keys(numericValues).length > 0;
        if (hasValues) {
          const payload = {
            ...numericValues,
            notes: measForm['_notes'] || undefined,
          };
          if (hasSavedMeas) {
            await apiService.updateMeasurement(existingMeas._id, payload);
          } else {
            const resolvedType = resolveGarmentType(job.garment?.type || '');
            const newMeas = await apiService.createMeasurement({
              customer:    job.customer?._id || job.customer,
              garmentType: resolvedType,
              unit:        'inch',
              ...payload,
            });
            // Link the new measurement to the job card garment
            const newMeasId = newMeas.data?.data?._id;
            if (newMeasId) {
              await apiService.updateJobCard(job._id, { garment: { measurements: newMeasId } } as any);
            }
          }
        }
      }

      // 3. Update the rest of the job card fields
      await apiService.updateJobCard(job._id, {
        priority:       form.priority,
        assignedTo:     form.assignedTo,
        deliveryDate:   form.deliveryDate,
        trialDate:      form.trialDate || undefined,
        estimatedHours: form.estimatedHours !== '' ? Number(form.estimatedHours) : undefined,
        notes:          form.notes,
        garment: {
          fit:                 form.garmentFit,
          specialInstructions: form.specialInstructions,
        },
      });

      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'measurements' | 'details'>('measurements');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="jc-edit-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="jc-edit-header">
          <div>
            <h3>Edit Job Card</h3>
            <span className="jc-edit-subtitle">{job.jobNumber} · {job.garment?.name} ({job.garment?.type})</span>
          </div>
          <button className="jc-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="jc-tabs">
          <button
            type="button"
            className={`jc-tab ${activeTab === 'measurements' ? 'jc-tab--active' : ''}`}
            onClick={() => setActiveTab('measurements')}
          >
            📏 Measurements
            {hasSavedMeas && <span className="jc-tab-chip">Saved</span>}
          </button>
          <button
            type="button"
            className={`jc-tab ${activeTab === 'details' ? 'jc-tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📋 Job Details
          </button>
        </div>

        {error && <div className="jc-edit-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Tab: Measurements ── */}
          {activeTab === 'measurements' && (
            <div className="jc-tab-body">
              <p className="jc-meas-edit-hint">All measurements in inches · {job.garment?.type}</p>
              <div className="jc-meas-edit-grid">
                {measFields.map(f => (
                  <div key={f.key} className="jc-form-group">
                    <label>{f.label}</label>
                    <div className="jc-meas-input-wrap">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={f.placeholder}
                        value={measForm[f.key] ?? ''}
                        onChange={e => handleMeasChange(f.key, e.target.value)}
                      />
                      <span className="jc-meas-unit-tag">in</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="jc-form-group" style={{ marginTop: 14 }}>
                <label>Measurement Notes <span className="jc-optional">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. prefers loose on shoulders"
                  value={measForm['_notes'] ?? ''}
                  onChange={e => handleMeasChange('_notes', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── Tab: Job Details ── */}
          {activeTab === 'details' && (
            <div className="jc-tab-body">
              <div className="jc-form-row">
                <div className="jc-form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    {['assigned','cutting','stitching','finishing','trial','ready','delivered','on_hold'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="jc-form-group">
                  <label>Priority</label>
                  <select name="priority" value={form.priority} onChange={handleChange}>
                    {['low','medium','high','urgent'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="jc-form-row">
                <div className="jc-form-group">
                  <label>Assigned To</label>
                  <select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                    <option value="">— select employee —</option>
                    {employees.map((emp: any) => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="jc-form-group">
                  <label>Estimated Hours</label>
                  <input
                    type="number" name="estimatedHours" min="0" step="0.5"
                    value={form.estimatedHours} onChange={handleChange} placeholder="e.g. 4"
                  />
                </div>
              </div>

              <div className="jc-form-row">
                <div className="jc-form-group">
                  <label>Delivery Date</label>
                  <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange} required />
                </div>
                <div className="jc-form-group">
                  <label>Trial Date <span className="jc-optional">(optional)</span></label>
                  <input type="date" name="trialDate" value={form.trialDate} onChange={handleChange} />
                </div>
              </div>

              <div className="jc-form-row">
                <div className="jc-form-group">
                  <label>Fit</label>
                  <select name="garmentFit" value={form.garmentFit} onChange={handleChange}>
                    {['slim','regular','loose','custom'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="jc-form-group jc-form-full">
                <label>Special Instructions</label>
                <textarea
                  name="specialInstructions" rows={3}
                  value={form.specialInstructions} onChange={handleChange}
                  placeholder="Stitching notes, design details…"
                />
              </div>

              <div className="jc-form-group jc-form-full">
                <label>Internal Notes</label>
                <textarea
                  name="notes" rows={3}
                  value={form.notes} onChange={handleChange}
                  placeholder="Any internal tracking notes…"
                />
              </div>
            </div>
          )}

          <div className="jc-edit-footer">
            <button type="button" className="jc-btn-cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="jc-btn-save" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Print modal ────────────────────────────────────────────────────────────────

interface PrintModalProps {
  job: any;
  onClose: () => void;
}

const PrintModal: React.FC<PrintModalProps> = ({ job, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>('en');
  const handlePrint = useReactToPrint({ contentRef: printRef });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="jc-print-modal" onClick={e => e.stopPropagation()}>
        <div className="jc-edit-header">
          <h3>Print Job Card — {job.jobNumber}</h3>
          <button className="jc-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Language toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Language / भाषा:</span>
          <button
            onClick={() => setLang('en')}
            style={{
              padding: '4px 14px', borderRadius: '9999px', fontSize: '13px', cursor: 'pointer', border: '1px solid',
              background: lang === 'en' ? '#1d4ed8' : '#fff',
              color: lang === 'en' ? '#fff' : '#374151',
              borderColor: lang === 'en' ? '#1d4ed8' : '#d1d5db',
              fontWeight: lang === 'en' ? 600 : 400,
            }}
          >English</button>
          <button
            onClick={() => setLang('hi')}
            style={{
              padding: '4px 14px', borderRadius: '9999px', fontSize: '13px', cursor: 'pointer', border: '1px solid',
              background: lang === 'hi' ? '#1d4ed8' : '#fff',
              color: lang === 'hi' ? '#fff' : '#374151',
              borderColor: lang === 'hi' ? '#1d4ed8' : '#d1d5db',
              fontWeight: lang === 'hi' ? 600 : 400,
            }}
          >हिन्दी</button>
        </div>

        <div className="jc-print-preview">
          <PrintableCard ref={printRef} job={job} lang={lang} />
        </div>
        <div className="jc-edit-footer">
          <button type="button" className="jc-btn-cancel" onClick={onClose}>Close</button>
          <button type="button" className="jc-btn-save" onClick={() => handlePrint()}>
            🖨 Print Job Card
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const JobCards = () => {
  const [jobs, setJobs]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [filters, setFilters]     = useState({ status: '', priority: '', search: '' });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingJob, setEditingJob]   = useState<any | null>(null);
  const [printingJob, setPrintingJob] = useState<any | null>(null);
  const [employees, setEmployees]     = useState<any[]>([]);
  const [showCreateInfo, setShowCreateInfo] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getJobCards({ ...filters, limit: 50 });
      setJobs(res?.data?.data || res?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load job cards');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await apiService.getEmployees({});
      const list = res?.data?.data || res?.data || [];
      setEmployees(list);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    loadJobs();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiService.updateJobCardStatus(id, status);
      await loadJobs();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Status update failed');
    }
  };

  const openPdf = async (id: string) => {
    try {
      const res = await apiService.getJobCardPDF(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to generate PDF');
    }
  };

  const handleEditSaved = async () => {
    setEditingJob(null);
    await loadJobs();
  };

  const toggleRow = (id: string) =>
    setExpandedRow(prev => (prev === id ? null : id));

  return (
    <div className="jobcards-page">
      <div className="page-header">
        <h2>Job Cards</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateInfo(true)}>
          Create Job Card
        </button>
      </div>

      {/* Filters */}
      <div className="toolbar">
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {['assigned','cutting','stitching','finishing','trial','ready','delivered','on_hold'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priority</option>
          {['low','medium','high','urgent'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="text" placeholder="Search…" value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
        />
        <button onClick={loadJobs} disabled={loading}>Apply</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="list-card">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 32 }} />
                <th>Job #</th>
                <th>Garment</th>
                <th>Customer</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => {
                const hasMeas  = j.garment?.measurements && typeof j.garment.measurements === 'object' && j.garment.measurements._id;
                const isExpanded = expandedRow === j._id;

                return (
                  <React.Fragment key={j._id}>
                    <tr className={isExpanded ? 'jc-row-expanded' : ''}>
                      <td>
                        <button className="jc-expand-btn" onClick={() => toggleRow(j._id)}
                          title={isExpanded ? 'Collapse' : 'View details'}>
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </td>
                      <td className="jc-job-num">{j.jobNumber}</td>
                      <td>
                        <div>{j.garment?.name}</div>
                        <div className="jc-sub">{j.garment?.type} ×{j.garment?.quantity}</div>
                        {hasMeas && <span className="jc-meas-badge">📏 Measurements</span>}
                      </td>
                      <td>
                        <div>{j.customer?.name || '–'}</div>
                        <div className="jc-sub">{j.customer?.phone}</div>
                      </td>
                      <td>{j.assignedTo?.name || '–'}</td>
                      <td>
                        <select value={j.status} onChange={e => updateStatus(j._id, e.target.value)}>
                          {['assigned','cutting','stitching','finishing','trial','ready','delivered','on_hold'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>{j.deliveryDate ? new Date(j.deliveryDate).toLocaleDateString() : '–'}</td>
                      <td>
                        <div className="jc-action-btns">
                          <button className="jc-btn-edit" onClick={() => setEditingJob(j)} title="Edit job card">
                            ✏️ Edit
                          </button>
                          <button className="jc-btn-print" onClick={() => setPrintingJob(j)} title="Print job card">
                            🖨 Print
                          </button>
                          <button className="btn" onClick={() => openPdf(j._id)} title="Download PDF">
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="jc-detail-row">
                        <td colSpan={8}>
                          <div className="jc-detail-panel">
                            <div className="jc-detail-sections">
                              {/* Garment info */}
                              <div className="jc-detail-section">
                                <h4 className="jc-section-title">Garment Details</h4>
                                <div className="jc-info-grid">
                                  <div><span className="jc-info-label">Type</span><span>{j.garment?.type}</span></div>
                                  <div><span className="jc-info-label">Fit</span><span>{j.garment?.fit || '–'}</span></div>
                                  <div><span className="jc-info-label">Quantity</span><span>{j.garment?.quantity}</span></div>
                                  <div><span className="jc-info-label">Priority</span><span className={`jc-priority-${j.priority}`}>{j.priority}</span></div>
                                  {j.garment?.fabric && (
                                    <div><span className="jc-info-label">Fabric</span><span>{j.garment.fabric.name}</span></div>
                                  )}
                                  {j.trialDate && (
                                    <div><span className="jc-info-label">Trial Date</span><span>{new Date(j.trialDate).toLocaleDateString()}</span></div>
                                  )}
                                  {j.estimatedHours != null && (
                                    <div><span className="jc-info-label">Est. Hours</span><span>{j.estimatedHours}h</span></div>
                                  )}
                                </div>
                                {j.garment?.specialInstructions && (
                                  <div className="jc-instructions">
                                    <span className="jc-info-label">Instructions</span>
                                    <p>{j.garment.specialInstructions}</p>
                                  </div>
                                )}
                                {j.notes && (
                                  <div className="jc-instructions">
                                    <span className="jc-info-label">Notes</span>
                                    <p>{j.notes}</p>
                                  </div>
                                )}
                              </div>

                              {/* Measurements */}
                              <div className="jc-detail-section jc-meas-section">
                                <h4 className="jc-section-title">📏 Measurements</h4>
                                <MeasurementPanel measurements={j.garment?.measurements} />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {jobs.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    No job cards found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editingJob && (
        <EditModal
          job={editingJob}
          employees={employees}
          onClose={() => setEditingJob(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Print modal */}
      {printingJob && (
        <PrintModal job={printingJob} onClose={() => setPrintingJob(null)} />
      )}

      {/* Create info modal */}
      {showCreateInfo && (
        <div className="modal-overlay" onClick={() => setShowCreateInfo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create Job Card</h3>
            <p>Job cards are generated from orders using the "Job Cards" button in the Orders table.</p>
            <ol>
              <li>Go to Orders</li>
              <li>Find the order</li>
              <li>Click the "Job Cards" button in the Actions column</li>
            </ol>
            <div className="modal-actions">
              <button onClick={() => setShowCreateInfo(false)}>Close</button>
              <button onClick={() => { setShowCreateInfo(false); window.location.href = '/orders'; }}>
                Go to Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCards;
