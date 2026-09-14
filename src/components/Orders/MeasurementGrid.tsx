import React, { useCallback, useMemo } from 'react';

// ─── Measurement row definitions ──────────────────────────────────────────
// Fixed-order, gender + body-part measurement chart. `field` is the
// underlying grid-storage / Measurement-schema field name (shared between a
// row's Upper Body and Lower Body incarnation, e.g. Length/Hip appear in
// both lists but store to the same field — only one is ever editable for a
// given garment since a garment is classified as exactly one body part).
// `key` is the row's own render/navigation identity and is always unique
// (body-part-prefixed) so React keys and Tab/Enter navigation never collide.

export interface MeasurementRowDef {
  key: string;
  field: string;
  label: string;
  unit: string;
  section: string;
  isText?: boolean;
}

export type FieldDef = [field: string, label: string];

// Male — Upper Body (12, exact order)
const MALE_UPPER_FIELDS: FieldDef[] = [
  ['length', 'Length'], ['chest', 'Chest'], ['shape', 'Shape'], ['tummy', 'Tummy'],
  ['hip', 'Hip'], ['neck', 'Neck'], ['shoulder', 'Shoulder'], ['sleeves', 'Sleeves'],
  ['bicep', 'Biceps'], ['forearm', 'Forearm'], ['mori', 'Mori'], ['armHole', 'Armhole'],
];
// Male — Lower Body (8, exact order)
const LOWER_FIELDS: FieldDef[] = [
  ['length', 'Length'], ['waist', 'Waist'], ['hip', 'Hip'], ['thigh', 'Thigh'],
  ['knee', 'Knee'], ['calf', 'Calf'], ['bottom', 'Bottom'], ['flyU', 'Fly (U)'],
];
// Female — Upper Body (15, exact order)
const FEMALE_UPPER_FIELDS: FieldDef[] = [
  ['length', 'Length'], ['upperBust', 'Upper Bust'], ['midBust', 'Mid Bust'], ['underBust', 'Under Bust'],
  ['bustPoint', 'Bust Point'], ['shape', 'Shape'], ['tummy', 'Tummy'], ['hip', 'Hip'],
  ['neck', 'Neck'], ['shoulder', 'Shoulder'], ['sleeves', 'Sleeves'], ['bicep', 'Biceps'],
  ['forearm', 'Forearm'], ['mori', 'Mori'], ['armHole', 'Armhole'],
];
// Female — Lower Body is identical to Male — Lower Body (8, exact order)

const buildRows = (fields: FieldDef[], section: string, prefix: string): MeasurementRowDef[] =>
  fields.map(([field, label]) => ({ key: `${prefix}_${field}`, field, label, unit: 'in', section }));

const NOTES_ROW: MeasurementRowDef = { key: 'notes', field: 'notes', label: 'Tailor Notes', unit: '', section: 'Notes', isText: true };

const MALE_ROWS: MeasurementRowDef[] = [
  ...buildRows(MALE_UPPER_FIELDS, 'Upper Body', 'upper'),
  ...buildRows(LOWER_FIELDS, 'Lower Body', 'lower'),
  NOTES_ROW,
];
const FEMALE_ROWS: MeasurementRowDef[] = [
  ...buildRows(FEMALE_UPPER_FIELDS, 'Upper Body', 'upper'),
  ...buildRows(LOWER_FIELDS, 'Lower Body', 'lower'),
  NOTES_ROW,
];

// Customer gender determines which fixed field list applies; defaults to the
// male chart when gender isn't set on the customer profile.
export function getMeasurementRows(gender?: string): MeasurementRowDef[] {
  return gender === 'female' ? FEMALE_ROWS : MALE_ROWS;
}

// The single gender+body-part field list (field/label, exact spec order) —
// used wherever a saved measurement needs to be displayed or printed rather
// than edited in the grid (Order Detail view, Job Card print template).
export function getOrderedFields(gender?: string, bodyPart?: string): FieldDef[] {
  if (bodyPart === 'lower') return LOWER_FIELDS;
  return gender === 'female' ? FEMALE_UPPER_FIELDS : MALE_UPPER_FIELDS;
}

// ─── N/A logic ────────────────────────────────────────────────────────────

const BOTTOM_GARMENTS = new Set([
  'Trousers','Pajamas','Shalwars','Dhoti','Arhems','Petticoats',
  'Skirts','Garara','Sharara','Churidar',
]);
const SHORT_UPPERS = new Set([
  'Shirt','Blouse','West Coat','Nehru','Blazer','Jothpuri',
  'Shrug','Jackets','Over Coat','Trench Coats',
]);
const LONG_UPPERS = new Set([
  'Kurta and Kurti','Kamize','Pathni','Jubba','Kaftan',
  'One Piece','Gown','Sherwani','Froog',
]);

// rowKey is the unique, body-part-prefixed row identity (e.g. 'upper_length',
// 'lower_hip') — a row is N/A when its body part doesn't match the garment's.
// An unclassified garment (not in any of the three sets above) shows every
// row as applicable, matching the previous grid's fallback behaviour.
export function isNACell(rowKey: string, garmentName: string): boolean {
  if (rowKey === 'notes') return false;
  const isBottom = BOTTOM_GARMENTS.has(garmentName);
  const isUpper  = SHORT_UPPERS.has(garmentName) || LONG_UPPERS.has(garmentName);
  if (rowKey.startsWith('upper_')) return isBottom;
  if (rowKey.startsWith('lower_')) return isUpper;
  return false;
}

// Classifies a garment as upper or lower body so the submitted measurement
// document can be tagged with the matching bodyPart. Unclassified garments
// (not in any of the three sets) are treated as upper by default.
export function getGarmentBodyPart(garmentName: string): 'upper' | 'lower' {
  return BOTTOM_GARMENTS.has(garmentName) ? 'lower' : 'upper';
}

// ─── Column grouping ──────────────────────────────────────────────────────

export interface GridColumn {
  id: string;
  garmentName: string;
  garmentIco: string;
  groupType: 'package' | 'individual';
  packageId?: string;
  packageLabel?: string;
  groupIndex: number;
}

const PKG_PALETTE = [
  // blue
  { band: '#1e3a5f', bandText: '#93c5fd', hdr: '#eff6ff', hdrBorder: '#2563eb', cellFilled: '#dbeafe', cellFilledText: '#1d4ed8' },
  // purple
  { band: '#3b1f5e', bandText: '#c4b5fd', hdr: '#f5f3ff', hdrBorder: '#7c3aed', cellFilled: '#ede9fe', cellFilledText: '#6d28d9' },
  // orange
  { band: '#431407', bandText: '#fed7aa', hdr: '#fff7ed', hdrBorder: '#ea580c', cellFilled: '#ffedd5', cellFilledText: '#c2410c' },
  // teal
  { band: '#134e4a', bandText: '#99f6e4', hdr: '#f0fdfa', hdrBorder: '#0d9488', cellFilled: '#ccfbf1', cellFilledText: '#0f766e' },
];
const INDIV_PALETTE = {
  band: '#1e3730', bandText: '#6ee7b7', hdr: '#f0fdf4', hdrBorder: '#16a34a', cellFilled: '#dcfce7', cellFilledText: '#15803d',
};

function getPalette(col: GridColumn) {
  if (col.groupType === 'individual') return INDIV_PALETTE;
  return PKG_PALETTE[col.groupIndex % PKG_PALETTE.length];
}

// ─── Status ───────────────────────────────────────────────────────────────

function colStatus(colId: string, garmentName: string, grid: GridData, rows: MeasurementRowDef[]): 'complete' | 'partial' | 'empty' {
  const applicableFields = new Set<string>();
  rows.forEach(r => { if (!r.isText && !isNACell(r.key, garmentName)) applicableFields.add(r.field); });
  const applicable = Array.from(applicableFields);
  const filled = applicable.filter(f => (grid[colId]?.[f] || '') !== '').length;
  if (filled === 0) return 'empty';
  if (filled === applicable.length) return 'complete';
  return 'partial';
}

// ─── Types ────────────────────────────────────────────────────────────────

export type GridData = Record<string, Record<string, string>>;

interface Props {
  columns: GridColumn[];
  grid: GridData;
  unit: 'inches' | 'cm';
  customerName: string;
  gender?: string;
  onGridChange: (colId: string, key: string, value: string) => void;
  onUnitChange: (u: 'inches' | 'cm') => void;
  onLoadProfile: () => void;
  onSaveProfile: () => void;
  onBack: () => void;
  onContinue: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function MeasurementGrid({
  columns, grid, unit, customerName, gender,
  onGridChange, onUnitChange, onLoadProfile, onSaveProfile,
  onBack, onContinue,
}: Props) {

  const rows = useMemo(() => getMeasurementRows(gender), [gender]);

  // Tab/Enter navigation
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    rowKey: string, colId: string
  ) => {
    const rowIdx = rows.findIndex(r => r.key === rowKey);
    const colIdx = columns.findIndex(c => c.id === colId);

    if (e.key === 'Tab') {
      e.preventDefault();
      // next non-NA in same row
      for (let ci = colIdx + 1; ci < columns.length; ci++) {
        if (!isNACell(rowKey, columns[ci].garmentName)) {
          document.getElementById(`cell_${rowKey}_${columns[ci].id}`)?.focus();
          return;
        }
      }
      // wrap to next row
      for (let ri = rowIdx + 1; ri < rows.length; ri++) {
        for (let ci = 0; ci < columns.length; ci++) {
          if (!isNACell(rows[ri].key, columns[ci].garmentName)) {
            document.getElementById(`cell_${rows[ri].key}_${columns[ci].id}`)?.focus();
            return;
          }
        }
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      // next non-NA in same column
      for (let ri = rowIdx + 1; ri < rows.length; ri++) {
        if (!isNACell(rows[ri].key, columns[colIdx].garmentName)) {
          document.getElementById(`cell_${rows[ri].key}_${colId}`)?.focus();
          return;
        }
      }
    }
  }, [columns, rows]);

  // Build group span info for the band header row
  const groupSpans: Array<{ id: string; label: string; span: number; groupIndex: number; groupType: 'package' | 'individual' }> = [];
  columns.forEach(col => {
    const last = groupSpans[groupSpans.length - 1];
    const key = col.groupType === 'package' ? col.packageId! : '__individual__';
    if (last && last.id === key) {
      last.span++;
    } else {
      groupSpans.push({
        id: key,
        label: col.groupType === 'package' ? (col.packageLabel || key) : 'Individual Garments',
        span: 1,
        groupIndex: col.groupIndex,
        groupType: col.groupType,
      });
    }
  });

  // Progress strip
  const progressItems: Array<{ label: string; stats: string; color: string }> = groupSpans.map(gs => {
    const cols = columns.filter(c =>
      gs.groupType === 'package' ? c.packageId === gs.id : c.groupType === 'individual'
    );
    const palette = gs.groupType === 'individual'
      ? INDIV_PALETTE
      : PKG_PALETTE[gs.groupIndex % PKG_PALETTE.length];
    const statParts = cols.map(c => {
      const st = colStatus(c.id, c.garmentName, grid, rows);
      const stLabel = st === 'complete' ? '✓ done' : st === 'partial' ? '~ partial' : '○ empty';
      return `${c.garmentName}: ${stLabel}`;
    });
    return { label: gs.label, stats: statParts.join(' · '), color: palette.hdrBorder };
  });

  // Unique sections (preserve order, no duplicates)
  const sections = rows.reduce<string[]>((acc, r) => {
    if (!acc.includes(r.section)) acc.push(r.section);
    return acc;
  }, []);

  return (
    <div className="flex flex-col" style={{ height: '100%', minHeight: 0 }}>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium text-blue-800">
          👤 {customerName}
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
          {(['inches', 'cm'] as const).map(u => (
            <button key={u} type="button" onClick={() => onUnitChange(u)}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${unit === u ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
              {u}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <button type="button" onClick={onLoadProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md bg-white hover:bg-gray-50">
          🔖 Load Profile
        </button>
        <button type="button" onClick={onSaveProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md bg-white hover:bg-gray-50">
          💾 Save Profile
        </button>
        <span className="ml-auto text-xs text-gray-400 hidden md:block">
          Tab → next cell &nbsp;·&nbsp; Enter → below
        </span>
      </div>

      {/* Progress strip */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0 text-xs">
        {progressItems.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="w-px h-4 bg-gray-200" />}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="font-semibold" style={{ color: item.color }}>{item.label}</span>
              <span className="text-gray-500">— {item.stats}</span>
            </div>
          </React.Fragment>
        ))}
        {progressItems.length === 0 && (
          <span className="text-gray-400">No garments added — go back to Products</span>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 158 }} />
            {columns.map(c => <col key={c.id} style={{ width: 110 }} />)}
          </colgroup>

          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            {/* Band row */}
            <tr>
              <th rowSpan={2}
                style={{ background: '#1e2433', borderRight: '2px solid #374151', borderBottom: '2px solid #374151', padding: '9px 12px', width: 158, verticalAlign: 'bottom', position: 'sticky', left: 0, zIndex: 11 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Measurement</div>
                <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>body part / type</div>
              </th>
              {groupSpans.map(gs => {
                const pal = gs.groupType === 'individual'
                  ? INDIV_PALETTE
                  : PKG_PALETTE[gs.groupIndex % PKG_PALETTE.length];
                return (
                  <th key={gs.id} colSpan={gs.span}
                    style={{ background: pal.band, color: pal.bandText, textAlign: 'center', padding: '7px 8px', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,0.12)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center justify-center gap-1.5">
                      {gs.groupType === 'package' ? '📦' : '👔'} {gs.label}
                      {gs.groupType === 'package' && (
                        <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 8, padding: '2px 6px', borderRadius: 3, fontWeight: 700 }}>PKG</span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>

            {/* Column header row */}
            <tr>
              {columns.map(col => {
                const pal = getPalette(col);
                const st = colStatus(col.id, col.garmentName, grid, rows);
                const stBg = st === 'complete' ? '#dcfce7' : st === 'partial' ? '#fef9c3' : '#f1f5f9';
                const stColor = st === 'complete' ? '#15803d' : st === 'partial' ? '#854d0e' : '#64748b';
                return (
                  <th key={col.id}
                    style={{ background: pal.hdr, borderBottom: `2px solid ${pal.hdrBorder}`, borderRight: '1px solid #e8edf3', padding: '7px 8px', verticalAlign: 'top', width: 110, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{col.garmentIco} {col.garmentName}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{col.groupType === 'package' ? col.packageLabel : 'Individual'}</div>
                    <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700, background: stBg, color: stColor }}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sections.map(section => {
              const sectionRows = rows.filter(r => r.section === section);
              return (
                <React.Fragment key={section}>
                  {/* Section header */}
                  <tr>
                    <td colSpan={columns.length + 1}
                      style={{ background: '#f8fafc', borderRight: '2px solid #e0e7ef', borderBottom: '1px solid #e0e7ef', padding: '6px 12px', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', position: 'sticky', left: 0 }}>
                      {section === 'Upper Body' ? '↑' : section === 'Lower Body' ? '↓' : '✏'} {section}
                    </td>
                  </tr>

                  {sectionRows.map((row, rowIdx) => {
                    const even = rowIdx % 2 === 0;
                    const rowBg = even ? '#fafbfc' : '#fff';
                    return (
                      <tr key={row.key}>
                        {/* Frozen left label */}
                        <td style={{ position: 'sticky', left: 0, zIndex: 5, background: rowBg, borderRight: '2px solid #e0e7ef', borderBottom: '1px solid #edf2f7', width: 158, verticalAlign: 'middle' }}>
                          <div style={{ padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 16, height: 16, borderRadius: 3, fontSize: 9, fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {rowIdx + 1}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', flex: 1 }}>{row.label}</span>
                            {row.unit && (
                              <span style={{ fontSize: 9, color: '#cbd5e1', background: '#f8fafc', padding: '1px 5px', borderRadius: 3, fontWeight: 500 }}>
                                {unit === 'cm' ? 'cm' : row.unit}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Data cells */}
                        {columns.map(col => {
                          const na = isNACell(row.key, col.garmentName);
                          const pal = getPalette(col);
                          const val = grid[col.id]?.[row.field] || '';
                          const hasVal = val !== '' && val !== 'N/A';
                          const cellBg = na
                            ? '#f8fafc'
                            : even
                            ? (hasVal ? pal.cellFilled : '#fafcff')
                            : (hasVal ? pal.cellFilled : '#fff');

                          if (row.isText) {
                            return (
                              <td key={col.id} style={{ borderRight: '1px solid #edf2f7', borderBottom: '1px solid #edf2f7', padding: 0, width: 110, background: cellBg }}>
                                <input
                                  id={`cell_${row.key}_${col.id}`}
                                  type="text"
                                  value={val}
                                  onChange={e => onGridChange(col.id, row.field, e.target.value)}
                                  onKeyDown={e => handleKeyDown(e, row.key, col.id)}
                                  placeholder="note…"
                                  style={{ border: 'none', outline: 'none', width: '100%', height: 34, fontSize: 10, color: '#64748b', background: 'transparent', padding: '0 8px', fontStyle: 'italic' }}
                                />
                              </td>
                            );
                          }

                          if (na) {
                            return (
                              <td key={col.id} style={{ borderRight: '1px solid #edf2f7', borderBottom: '1px solid #edf2f7', padding: 0, width: 110, background: '#f8fafc', textAlign: 'center', verticalAlign: 'middle' }}>
                                <input
                                  type="text" value="N/A" readOnly tabIndex={-1}
                                  style={{ border: 'none', outline: 'none', width: '100%', height: 34, textAlign: 'center', fontSize: 10, fontWeight: 400, color: '#e2e8f0', background: 'transparent', cursor: 'not-allowed' }}
                                />
                              </td>
                            );
                          }

                          return (
                            <td key={col.id} style={{ borderRight: '1px solid #edf2f7', borderBottom: '1px solid #edf2f7', padding: 0, width: 110, background: cellBg, textAlign: 'center', verticalAlign: 'middle' }}>
                              <input
                                id={`cell_${row.key}_${col.id}`}
                                type="number"
                                step="0.5"
                                value={val}
                                onChange={e => onGridChange(col.id, row.field, e.target.value)}
                                onKeyDown={e => handleKeyDown(e, row.key, col.id)}
                                placeholder="—"
                                style={{
                                  border: 'none', outline: 'none', width: '100%', height: 34,
                                  textAlign: 'center', fontSize: 12, fontWeight: hasVal ? 700 : 400,
                                  color: hasVal ? pal.cellFilledText : '#94a3b8',
                                  background: 'transparent', padding: '0 4px',
                                }}
                                onFocus={e => { e.currentTarget.style.boxShadow = 'inset 0 0 0 2px #6366f1'; e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.color = '#4f46e5'; }}
                                onBlur={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = hasVal ? pal.cellFilledText : '#94a3b8'; }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-gray-200 flex-shrink-0">
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {groupSpans.map(gs => {
            const pal = gs.groupType === 'individual' ? INDIV_PALETTE : PKG_PALETTE[gs.groupIndex % PKG_PALETTE.length];
            return (
              <div key={gs.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: pal.hdr, border: `1px solid ${pal.hdrBorder}` }} />
                {gs.label}
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f8fafc', border: '1px solid #e2e8f0' }} />
            N/A
          </div>
        </div>
        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
            ← Back
          </button>
          <button type="button" onClick={onContinue}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Continue to Finalize →
          </button>
        </div>
      </div>
    </div>
  );
}
