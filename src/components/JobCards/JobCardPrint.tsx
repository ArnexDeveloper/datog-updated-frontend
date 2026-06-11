import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

interface JobCardPrintProps {
  jobCardData: {
    serialNumber: string;
    garmentTypes: string[];
    bookingDate: string;
    deliveryDate: string;
    trialDate?: string;
    measurements: Record<string, any>;
    description?: string;
    tailor?: string;
    fit?: string;
  };
}

type Lang = 'en' | 'hi';

const T = {
  en: {
    shopName:     "DA TOG'S DESIGNER LOUNGE",
    jobCard:      '*** JOB CARD ***',
    jobNo:        'Job #',
    garment:      'Garment',
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
    printBtn:     'Print Job Card',
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
    garment:      'कपड़ा',
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
    printBtn:     'प्रिंट करें',
    labels: {
      Length: 'लंबाई', Chest: 'छाती', Shape: 'आकार', Tummy: 'पेट',
      Hips: 'कूल्हे', Neck: 'गर्दन', Shoulder: 'कंधा', Sleeves: 'आस्तीन',
      Biceps: 'बाइसेप्स', Forearms: 'अग्रभुज',
    } as Record<string, string>,
  },
};

// Maps DB field names → print label names
const DB_TO_LABEL: Record<string, string> = {
  chest: 'Chest', bust: 'Chest', waist: 'Tummy', hip: 'Hips',
  shoulder: 'Shoulder', armLength: 'Sleeves', neck: 'Neck',
  bicep: 'Biceps', forearm: 'Forearms',
  shirtLength: 'Length', outseam: 'Length', kurtalLength: 'Length',
  dressLength: 'Length', skirtLength: 'Length', blouseLength: 'Length',
};

const SKIP_KEYS = new Set([
  '_id','customer','order','garmentType','unit','takenBy','isActive',
  'version','createdAt','updatedAt','__v','customMeasurements','notes',
]);

function buildMeasurements(m: Record<string, any>): { label: string; value: number; unit: string }[] {
  if (!m || typeof m !== 'object') return [];
  const unit = m.unit || 'inch';
  const seen = new Set<string>();
  const result: { label: string; value: number; unit: string }[] = [];

  Object.entries(m).forEach(([k, v]) => {
    if (SKIP_KEYS.has(k)) return;
    const label = DB_TO_LABEL[k];
    if (label && typeof v === 'number' && v > 0 && !seen.has(label)) {
      seen.add(label);
      result.push({ label, value: v, unit });
    }
  });

  // custom measurements
  (m.customMeasurements || []).forEach((c: any) => {
    if (c.name && c.value > 0) {
      result.push({ label: c.name, value: c.value, unit: c.unit || unit });
    }
  });

  return result;
}

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

const JobCardPrint: React.FC<JobCardPrintProps> = ({ jobCardData }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>('en');
  const t = T[lang];

  const handlePrint = useReactToPrint({ contentRef: componentRef });

  const garmentName = jobCardData.garmentTypes[0] || '—';
  const garmentType = jobCardData.garmentTypes[1] || '';
  const unit = jobCardData.measurements?.unit || 'inch';
  const rows = buildMeasurements(jobCardData.measurements);
  const measNotes = jobCardData.measurements?.notes;

  return (
    <div>
      {/* Controls — hidden on print */}
      <div className="print:hidden flex items-center gap-3 mb-4 flex-wrap">
        {/* Language toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Language / भाषा:</span>
          {(['en', 'hi'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '3px 12px', borderRadius: '9999px', fontSize: '13px',
                cursor: 'pointer', border: '1px solid',
                background: lang === l ? '#1d4ed8' : '#fff',
                color: lang === l ? '#fff' : '#374151',
                borderColor: lang === l ? '#1d4ed8' : '#d1d5db',
                fontWeight: lang === l ? 600 : 400,
              }}
            >
              {l === 'en' ? 'English' : 'हिन्दी'}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePrint()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          🖨 {t.printBtn}
        </button>
      </div>

      {/* Printable receipt */}
      <div ref={componentRef} className="jcp-receipt">
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
          {t.shopName}
        </div>
        <div style={{ textAlign: 'center', fontSize: '10px', marginBottom: '4px' }}>
          {t.jobCard}
        </div>
        <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }} />

        {/* Job info */}
        <div style={{ fontSize: '11px', lineHeight: '1.7' }}>
          <div><strong>{t.jobNo}:</strong> {jobCardData.serialNumber}</div>
          <div><strong>{t.garment}:</strong> {garmentName}{garmentType ? ` (${garmentType})` : ''}</div>
          {jobCardData.fit && <div><strong>{t.fit}:</strong> {jobCardData.fit}</div>}
          {jobCardData.tailor && <div><strong>{t.tailor}:</strong> {jobCardData.tailor}</div>}
          <div><strong>{t.delivery}:</strong> {fmt(jobCardData.deliveryDate)}</div>
          {jobCardData.trialDate && <div><strong>{t.trial}:</strong> {fmt(jobCardData.trialDate)}</div>}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

        {/* Measurements table */}
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
          {t.measurements} ({unit})
        </div>
        {rows.length > 0 ? (
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
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #000', padding: '2px 4px' }}>
                    {lang === 'hi' ? `${t.labels[r.label] || r.label} (${r.label})` : r.label}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '2px 4px' }}>{r.value} {r.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ fontSize: '10px' }}>{t.noMeas}</div>
        )}

        {/* Notes */}
        {(measNotes || jobCardData.description) && (
          <>
            <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
            <div style={{ fontSize: '11px' }}>
              <strong>{t.notes}:</strong>
              {measNotes && <div style={{ marginTop: '2px' }}>{measNotes}</div>}
              {jobCardData.description && <div style={{ marginTop: '2px' }}>{jobCardData.description}</div>}
            </div>
          </>
        )}

        <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
        <div style={{ textAlign: 'center', fontSize: '10px' }}>{t.thankYou}</div>

        <style>{`
          .jcp-receipt {
            font-family: 'Courier New', Courier, monospace;
            width: 76mm;
            padding: 2mm;
            background: #fff;
            color: #000;
          }
          @media print {
            @page { size: 80mm auto; margin: 2mm; }
            body * { visibility: hidden; }
            .jcp-receipt, .jcp-receipt * { visibility: visible; }
            .jcp-receipt {
              position: absolute;
              left: 0; top: 0;
              width: 76mm;
              font-size: 11px;
              font-family: monospace;
            }
            .jcp-receipt table { width: 100%; border-collapse: collapse; font-size: 11px; }
            .jcp-receipt td, .jcp-receipt th { border: 1px solid #000; padding: 2px 4px; word-wrap: break-word; }
            * {
              page-break-inside: avoid !important;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default JobCardPrint;
