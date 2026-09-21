// The single job-card print design used everywhere in the app — the
// JobCards module's own print button, the Order module's "Print Job Card"
// button, and the Order Documents page. Keeping this in one place is what
// stops the print layout from drifting apart between those screens the way
// it had before (JobCards.tsx had this design; OrderDetail.tsx/
// OrderDocuments.tsx used an older, visually different one — JobCardPrint.tsx).
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useHindiText } from '../../hooks/useHindiText';
import SkeletonLine from './SkeletonLine';
import { getOrderedFields } from '../Orders/MeasurementGrid';

export const SKIP_KEYS = new Set([
  '_id', 'customer', 'order', 'garmentType', 'unit', 'takenBy', 'isActive',
  'version', 'createdAt', 'updatedAt', '__v', 'customMeasurements', 'notes'
]);

// Only for measurement records saved before the gender + body-part chart
// existed (no `gender`/`bodyPart` field at all) — maps their old flat field
// names onto a print label. Anything with gender/bodyPart set goes through
// the canonical getOrderedFields chart below instead, the same one the
// edit forms and the order-detail measurement grid use — this used to be
// the ONLY path, which is why most saved measurements (shape, mori, mori,
// thigh, knee, mismatched 'hip'/'waist' names, etc.) printed as blank even
// though the edit form showed them fine.
const LEGACY_DB_TO_PRINT_LABEL: Record<string, string> = {
  chest: 'Chest', bust: 'Chest', waist: 'Tummy', hip: 'Hips',
  shoulder: 'Shoulder', armLength: 'Sleeves', neck: 'Neck',
  bicep: 'Biceps', forearm: 'Forearms',
  shirtLength: 'Length', outseam: 'Length', kurtalLength: 'Length',
  dressLength: 'Length', skirtLength: 'Length', blouseLength: 'Length',
};

export interface PrintMeasurementRow { label: string; value: number }

export function buildPrintMeasurements(m: any): PrintMeasurementRow[] {
  if (!m || typeof m !== 'object') return [];
  const rows: PrintMeasurementRow[] = [];
  const seen = new Set<string>();

  if (m.gender || m.bodyPart) {
    getOrderedFields(m.gender, m.bodyPart).forEach(([field, label]) => {
      if (typeof m[field] === 'number' && m[field] > 0 && !seen.has(label)) {
        rows.push({ label, value: m[field] });
        seen.add(label);
      }
    });
  } else {
    // No gender/bodyPart at all means this measurement predates the chart,
    // so its fields use the old flat naming instead — never mix the two
    // passes, since several raw field names (waist, hip, ...) exist in both
    // and would otherwise print the same value twice under different labels.
    Object.entries(m).forEach(([k, v]) => {
      if (SKIP_KEYS.has(k)) return;
      const label = LEGACY_DB_TO_PRINT_LABEL[k];
      if (label && typeof v === 'number' && v > 0 && !seen.has(label)) {
        rows.push({ label, value: v as number });
        seen.add(label);
      }
    });
  }

  return rows;
}

// Garment type / fit are fixed schema enums (not free text), so they can be
// safely translated for the Hindi print card — unlike garment.name or a
// tailor's name, which are free-form data and stay as entered.
const GARMENT_TYPE_HI: Record<string, string> = {
  shirt: 'शर्ट', pant: 'पैंट', suit: 'सूट', blazer: 'ब्लेज़र', kurta: 'कुर्ता',
  pajama: 'पजामा', sherwani: 'शेरवानी', lehenga: 'लहंगा', saree_blouse: 'साड़ी ब्लाउज़',
  dress: 'ड्रेस', skirt: 'स्कर्ट', top: 'टॉप', jacket: 'जैकेट', coat: 'कोट',
  waistcoat: 'वेस्टकोट', dhoti: 'धोती', churidar: 'चूड़ीदार', salwar: 'सलवार',
  dupatta: 'दुपट्टा', other: 'अन्य',
};

const FIT_HI: Record<string, string> = {
  slim: 'स्लिम', regular: 'रेगुलर', loose: 'ढीला', custom: 'कस्टम',
};

export type Lang = 'en' | 'hi';

export const T = {
  en: {
    shopName:     "DA TOG'S DESIGNER LOUNGE",
    jobCard:      '*** JOB CARD ***',
    jobNo:        'Job #',
    order:        'Order',
    garment:      'Garment',
    qty:          'Qty',
    fit:          'Fit',
    accessories:  'Accessories',
    tailor:       'Tailor',
    delivery:     'Delivery',
    trial:        'Trial',
    measurements: 'MEASUREMENTS',
    measurement:  'Measurement',
    value:        'Value',
    notes:        'Notes for Tailor',
    manualNotes:  'Notes (write here)',
    noMeas:       'No measurements recorded',
    thankYou:     'Thank You',
    gender:       'Gender',
    male:         'Male',
    female:       'Female',
    category:     'Category',
    upper:        'Upper',
    bottom:       'Bottom',
    labels: {
      Length: 'Length', Chest: 'Chest', Shape: 'Shape', Tummy: 'Tummy',
      Hips: 'Hips', Neck: 'Neck', Shoulder: 'Shoulder', Sleeves: 'Sleeves',
      Biceps: 'Biceps', Forearms: 'Forearms',
      'Chest/Bust': 'Chest/Bust', Sleeve: 'Sleeve', Waist: 'Waist',
      Hip: 'Hip', Inseam: 'Inseam', Thigh: 'Thigh', Rise: 'Rise',
      Forearm: 'Forearm', Mori: 'Mori', Armhole: 'Armhole',
      'Upper Bust': 'Upper Bust', 'Mid Bust': 'Mid Bust', 'Under Bust': 'Under Bust',
      'Bust Point': 'Bust Point', Knee: 'Knee', Calf: 'Calf', Bottom: 'Bottom', 'Fly (U)': 'Fly (U)',
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
    accessories:  'एक्सेसरीज़',
    tailor:       'दर्जी',
    delivery:     'डिलीवरी',
    trial:        'ट्रायल',
    measurements: 'माप',
    measurement:  'माप',
    value:        'मूल्य',
    notes:        'दर्जी के लिए नोट्स',
    manualNotes:  'नोट्स (यहाँ लिखें)',
    noMeas:       'कोई माप दर्ज नहीं है',
    thankYou:     'धन्यवाद',
    gender:       'लिंग',
    male:         'पुरुष',
    female:       'महिला',
    category:     'श्रेणी',
    upper:        'ऊपरी',
    bottom:       'निचला',
    labels: {
      Length: 'लंबाई', Chest: 'छाती', Shape: 'आकार', Tummy: 'पेट',
      Hips: 'कूल्हे', Neck: 'गर्दन', Shoulder: 'कंधा', Sleeves: 'आस्तीन',
      Biceps: 'बाइसेप्स', Forearms: 'अग्रभुज',
      'Chest/Bust': 'छाती/बस्ट', Sleeve: 'आस्तीन', Waist: 'कमर',
      Hip: 'कूल्हा', Inseam: 'भीतरी लंबाई', Thigh: 'जांघ', Rise: 'राइज़',
      Forearm: 'अग्रबाहु', Mori: 'मोरी', Armhole: 'आर्महोल',
      'Upper Bust': 'ऊपरी बस्ट', 'Mid Bust': 'मध्य बस्ट', 'Under Bust': 'अंडर बस्ट',
      'Bust Point': 'बस्ट पॉइंट', Knee: 'घुटना', Calf: 'पिंडली', Bottom: 'बॉटम', 'Fly (U)': 'फ्लाई (यू)',
    } as Record<string, string>,
  },
};

// The `job` shape every caller must build, whether it comes from a real
// JobCard record (JobCards module) or is assembled from order + garment
// data (Order module / Order Documents — there's no JobCard record yet).
export interface PrintableJob {
  jobNumber: string;
  order?: { orderNumber?: string };
  garment?: {
    name?: string;
    type?: string;
    quantity?: number;
    fit?: string;
    accessories?: string[];
    specialInstructions?: string;
    measurements?: any;
  };
  assignedTo?: { name?: string };
  notes?: string;
}

interface PrintableJobCardProps {
  job: PrintableJob;
  lang?: Lang;
  onTranslationStateChange?: (state: { loading: boolean; error: boolean }) => void;
}

const PrintableJobCard = React.forwardRef<HTMLDivElement, PrintableJobCardProps>(({ job, lang = 'en', onTranslationStateChange }, ref) => {
  const t = T[lang];
  const measurementRows = buildPrintMeasurements(job.garment?.measurements);
  const unit = job.garment?.measurements?.unit || 'inch';
  const customMeasurements = (job.garment?.measurements?.customMeasurements || [])
    .filter((c: any) => c.value > 0);

  // Notes are free text (not a fixed enum like garment type/fit), so they're
  // machine-translated on demand rather than looked up in a dictionary.
  const measNotes = useHindiText(job.garment?.measurements?.notes, lang);
  const specialInstructions = useHindiText(job.garment?.specialInstructions, lang);
  const jobNotes = useHindiText(job.notes, lang);
  // Accessories are free-typed by staff (no fixed enum), so — like notes —
  // they go through machine translation rather than a lookup table.
  const accessories = useHindiText(job.garment?.accessories?.join(', '), lang);

  const translating = measNotes.loading || specialInstructions.loading || jobNotes.loading || accessories.loading;
  const translateError = measNotes.error || specialInstructions.error || jobNotes.error || accessories.error;

  useEffect(() => {
    onTranslationStateChange?.({ loading: translating, error: translateError });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translating, translateError]);

  return (
    <div ref={ref} className="jc-print-card job-card-print-area">
      {/* Business header */}
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '19px', marginBottom: '2px' }}>
        {t.shopName}
      </div>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
        {t.jobCard}
      </div>
      <div style={{ borderTop: '1px dashed #000', margin: '3px 0' }} />

      {/* Job info */}
      <div style={{ fontSize: '15px', lineHeight: '1.7', fontWeight: 700 }}>
        <div><strong>{t.jobNo}:</strong> {job.jobNumber}</div>
        <div><strong>{t.order}:</strong> {job.order?.orderNumber || '—'}</div>
        <div>
          <strong>{t.garment}:</strong> {job.garment?.name} ({lang === 'hi' ? (GARMENT_TYPE_HI[job.garment?.type || ''] || job.garment?.type) : job.garment?.type})
        </div>
        <div>
          <strong>{t.qty}:</strong> {job.garment?.quantity} &nbsp;
          <strong>{t.fit}:</strong> {job.garment?.fit ? (lang === 'hi' ? (FIT_HI[job.garment.fit] || job.garment.fit) : job.garment.fit) : '—'}
        </div>
        {job.garment?.accessories && job.garment.accessories.length > 0 && (
          <div><strong>{t.accessories}:</strong> {accessories.text}</div>
        )}
        <div><strong>{t.tailor}:</strong> {job.assignedTo?.name || '—'}</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />

      {/* Measurements table */}
      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
        {t.measurements} ({unit})
      </div>
      {measurementRows.length > 0 || customMeasurements.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', fontWeight: 700 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'left', fontWeight: 700 }}>
                {t.measurement}
              </th>
              <th style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'left', fontWeight: 700 }}>
                {t.value}
              </th>
            </tr>
          </thead>
          <tbody>
            {measurementRows.map(({ label, value }) => (
              <tr key={label}>
                <td style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 700 }}>
                  {lang === 'hi' ? `${t.labels[label] || label} (${label})` : label}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 700 }}>{value} {unit}</td>
              </tr>
            ))}
            {customMeasurements.map((c: any, i: number) => (
              <tr key={`custom-${i}`}>
                <td style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 700 }}>{c.name}</td>
                <td style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 700 }}>{c.value} {c.unit || unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ fontSize: '14px', fontWeight: 700 }}>{t.noMeas}</div>
      )}

      {/* Digital notes — special instructions / measurement notes / job notes
          already entered in the system, shown only when present. */}
      {(job.garment?.specialInstructions || job.notes || job.garment?.measurements?.notes) && (
        <>
          <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
          <div style={{ fontSize: '15px', fontWeight: 700 }}>
            <strong>{t.notes}:</strong>
            {translating ? (
              <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <SkeletonLine width="88%" />
                <SkeletonLine width="62%" />
              </div>
            ) : (
              <>
                {job.garment?.measurements?.notes && (
                  <div style={{ marginTop: '2px' }}>{measNotes.text}</div>
                )}
                {job.garment?.specialInstructions && (
                  <div style={{ marginTop: '2px' }}>{specialInstructions.text}</div>
                )}
                {job.notes && (
                  <div style={{ marginTop: '2px' }}>{jobNotes.text}</div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Manual notes — always present, blank, so the tailor can jot down
          anything by hand on the physical printout. */}
      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
      <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>{t.manualNotes}:</div>
      <div style={{ borderBottom: '1px solid #000', height: '16px' }} />
      <div style={{ borderBottom: '1px solid #000', height: '16px', marginTop: '10px' }} />

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }} />
      <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>{t.thankYou}</div>

      <style>{`
        @keyframes jc-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes jc-spin {
          to { transform: rotate(360deg); }
        }
        .jc-print-card {
          font-family: 'IBM Plex Sans', sans-serif;
          width: 76mm;
          padding: 2mm;
          background: #fff;
          color: #000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
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
            font-size: 15px;
            font-weight: 700;
            font-family: 'IBM Plex Sans', sans-serif;
            box-shadow: none;
          }

          .job-card-print-area table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
            font-weight: 700;
          }

          .job-card-print-area th {
            border: 1px solid #000;
            padding: 3px 4px;
            word-wrap: break-word;
            font-weight: 700;
          }

          .job-card-print-area td {
            border: 1px solid #000;
            padding: 6px 4px;
            word-wrap: break-word;
            font-weight: 700;
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
PrintableJobCard.displayName = 'PrintableJobCard';

export default PrintableJobCard;

// Bundles the language toggle + print button + card together, for screens
// that embed the job card directly (Order module, Order Documents) rather
// than building their own modal chrome around it the way the JobCards
// module's own print modal does.
interface JobCardPrintPanelProps {
  job: PrintableJob;
  title?: string;
}

export const JobCardPrintPanel: React.FC<JobCardPrintPanelProps> = ({ job, title }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(false);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  return (
    <div>
      <div className="print:hidden" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {title && <h3 style={{ fontSize: '16px', fontWeight: 600, marginRight: 'auto' }}>{title}</h3>}
        <span style={{ fontSize: '13px', color: '#6b7280' }}>Language / भाषा:</span>
        {(['en', 'hi'] as Lang[]).map(l => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            disabled={translating}
            style={{
              padding: '4px 14px', borderRadius: '9999px', fontSize: '13px',
              cursor: translating ? 'not-allowed' : 'pointer', border: '1px solid',
              background: lang === l ? '#1d4ed8' : '#fff',
              color: lang === l ? '#fff' : '#374151',
              borderColor: lang === l ? '#1d4ed8' : '#d1d5db',
              fontWeight: lang === l ? 600 : 400,
              opacity: translating ? 0.7 : 1,
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            {translating && l === 'hi' && lang === 'hi' && (
              <span style={{
                display: 'inline-block', width: 12, height: 12, border: '2px solid currentColor',
                borderTopColor: 'transparent', borderRadius: '50%', animation: 'jc-spin 0.6s linear infinite', marginRight: 5
              }} />
            )}
            {l === 'en' ? 'English' : 'हिन्दी'}
          </button>
        ))}
        {translateError && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>Translation failed. Please try again.</span>
        )}
        <button
          type="button"
          onClick={() => handlePrint()}
          style={{
            padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
            background: '#1d4ed8', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          🖨 Print Job Card
        </button>
      </div>

      <PrintableJobCard
        ref={printRef}
        job={job}
        lang={lang}
        onTranslationStateChange={({ loading, error }) => {
          setTranslating(loading);
          setTranslateError(error);
        }}
      />
    </div>
  );
};
