import React from 'react';

const COLORS = {
  gold: '#c9900a',
  darkBg: '#1a1a1a',
  paperWarm: '#f9f6f0',
  paperBorder: '#e8e0d0',
  cuttingBg: '#fafaf8',
  cuttingBorder: '#c0b8b0',
  cuttingLine: '#ece6de',
  cuttingHead: '#f5f0e8',
  cuttingLabel: '#7a6b54',
  statusPartial: { bg: '#fffbeb', text: '#92400e', border: '#f59e0b' },
  statusPaid: { bg: '#f0fdf4', text: '#15803d', border: '#22c55e' },
  statusUnpaid: { bg: '#fff1f2', text: '#dc2626', border: '#fca5a5' },
  balanceDue: '#dc2626',
  advanceGreen: '#16a34a',
};

const CUTTING_ROWS = 18;

interface Fabric { _id?: string; name?: string; type?: string; color?: string; }

interface Garment {
  _id?: string;
  type?: string;
  name?: string;
  quantity?: number;
  fabricSource?: 'customer' | 'lounge';
  fabric?: Fabric;
  fabricName?: string;
  customerFabricDetails?: { description?: string; type?: string; color?: string };
  fit?: string;
  style?: string;
  specialInstructions?: string;
  price?: number;
}

interface PackageGarment {
  type?: string;
  name?: string;
  fabricSource?: 'customer' | 'lounge';
  fabric?: Fabric;
  fabricName?: string;
  customerFabricDetails?: { description?: string; type?: string; color?: string };
  notes?: string;
}

interface OrderPackage {
  packageId?: string;
  packagePrice?: number;
  quantity?: number;
  garments: PackageGarment[];
}

interface Order {
  orderNumber?: string;
  deliveryDate?: string;
  garments?: Garment[];
  packages?: OrderPackage[];
  assignedTo?: { name?: string; role?: string };
}

interface Customer {
  name?: string;
  phone?: string;
  email?: string;
}

interface Invoice {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  order?: Order;
  customer?: Customer;
  charges?: { subtotal?: number; total?: number };
  payment?: { totalPaid?: number; balanceDue?: number; status?: string };
  notes?: string;
  generatedBy?: { name?: string; email?: string };
}

interface ShopDetails {
  shopName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface InvoiceDocumentProps {
  invoice: Invoice;
  shopDetails?: ShopDetails;
}

const fmtMoney = (n?: number) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusStyle = (status?: string) => {
  if (status === 'paid') return { ...COLORS.statusPaid, label: 'Paid' };
  if (status === 'partial') return { ...COLORS.statusPartial, label: 'Partial' };
  if (status === 'overdue') return { ...COLORS.statusUnpaid, label: 'Overdue' };
  return { ...COLORS.statusUnpaid, label: 'Unpaid' };
};

const fabricLabel = (g: Garment | PackageGarment) => {
  if (g.fabricSource === 'customer') {
    return g.customerFabricDetails?.description || g.customerFabricDetails?.type || 'Customer fabric';
  }
  return g.fabric?.name || g.fabricName || 'Lounge fabric';
};

const sourceLabel = (source?: string) => (source === 'customer' ? 'Customer' : 'Lounge');

type Row = {
  type: 'package' | 'individual';
  name: string;
  garments: string[];
  fabric: string;
  fabricSource: string;
  fit: string;
  details: string;
  quantity: number;
  rate: number;
  amount: number;
};

const buildRows = (order?: Order): Row[] => {
  const rows: Row[] = [];

  (order?.garments || []).forEach((g) => {
    rows.push({
      type: 'individual',
      name: g.name || 'Garment',
      garments: [],
      fabric: fabricLabel(g),
      fabricSource: sourceLabel(g.fabricSource),
      fit: g.fit || '',
      details: g.style || g.specialInstructions || '',
      quantity: g.quantity || 1,
      rate: g.price || 0,
      amount: (g.price || 0) * (g.quantity || 1),
    });
  });

  (order?.packages || []).forEach((pkg) => {
    const sources = new Set((pkg.garments || []).map((g) => g.fabricSource));
    rows.push({
      type: 'package',
      name: 'Complete Package',
      garments: (pkg.garments || []).map((g) => g.name || 'Garment'),
      fabric: (pkg.garments || []).map(fabricLabel).join(' · '),
      fabricSource: sources.size > 1 ? 'Mixed' : sourceLabel((pkg.garments || [])[0]?.fabricSource),
      fit: '',
      details: (pkg.garments || []).map((g) => g.notes).filter(Boolean).join(', '),
      quantity: pkg.quantity || 1,
      rate: pkg.packagePrice || 0,
      amount: (pkg.packagePrice || 0) * (pkg.quantity || 1),
    });
  });

  return rows;
};

const InvoiceDocument = React.forwardRef<HTMLDivElement, InvoiceDocumentProps>(({ invoice, shopDetails }, ref) => {
  const order = invoice.order || {};
  const customer = invoice.customer || {};
  const rows = buildRows(order);
  const subtotal = invoice.charges?.total ?? invoice.charges?.subtotal ?? 0;
  const advancePaid = invoice.payment?.totalPaid ?? 0;
  const balanceDue = invoice.payment?.balanceDue ?? Math.max(0, subtotal - advancePaid);
  const badge = statusStyle(invoice.payment?.status);
  const createdBy = invoice.generatedBy;

  return (
    <div id="invoice-paper" ref={ref} className="invoice-paper">
      {/* HEADER */}
      <div style={{ background: COLORS.gold, padding: '13px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>Da Tog's</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>Designer Lounge</div>
          <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
            {shopDetails?.address || 'Bhopal, Madhya Pradesh · India'}
          </div>
          <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.6)' }}>
            {shopDetails?.phone || '+91 82238 31963'} · {shopDetails?.email || 'datog@gmail.com'} · GSTIN: 23XXXXX1234Z1X
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
            Tax Invoice
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>#{invoice.invoiceNumber || '—'}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)' }}>Order: {order.orderNumber || '—'}</div>
          <span style={{
            display: 'inline-block', marginTop: 4, borderRadius: 20, fontSize: 8, fontWeight: 600,
            padding: '2px 8px', background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`
          }}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* META STRIP */}
      <div style={{ background: COLORS.paperWarm, borderBottom: `1px solid ${COLORS.paperBorder}`, padding: '7px 26px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={metaLabel}>Billed To</div>
          <div style={metaValue}>{customer.name || '—'}</div>
          <div style={metaSub}>{[customer.phone, customer.email].filter(Boolean).join(' · ')}</div>
        </div>
        <div>
          <div style={metaLabel}>Invoice Date</div>
          <div style={metaValue}>{fmtDate(invoice.invoiceDate)}</div>
        </div>
        <div>
          <div style={metaLabel}>Delivery Date</div>
          <div style={metaValue}>{fmtDate(order.deliveryDate)}</div>
          <div style={{ fontSize: 8, color: COLORS.gold, fontWeight: 600 }}>On delivery</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={metaLabel}>Created By</div>
          <div style={metaValue}>{createdBy?.name || '—'}</div>
          <div style={metaSub}>{createdBy ? 'Employee' : ''}</div>
        </div>
      </div>

      {/* BODY: two columns */}
      <div style={{ display: 'flex', padding: '12px 26px', gap: 16 }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <SectionTitle title="Order Items" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ background: COLORS.paperWarm, borderTop: `2px solid ${COLORS.gold}`, borderBottom: '1px solid #e0d8cc' }}>
                <th style={{ ...th, width: '36%', textAlign: 'left' }}>Item</th>
                <th style={{ ...th, width: '30%', textAlign: 'left' }}>Fabric</th>
                <th style={{ ...th, width: '8%', textAlign: 'right' }}>Qty</th>
                <th style={{ ...th, width: '13%', textAlign: 'right' }}>Rate</th>
                <th style={{ ...th, width: '13%', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0ece6' }}>
                  <td style={{ ...td, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{row.name}</span>
                      {row.type === 'package' && (
                        <span style={{ fontSize: 7, background: '#eff6ff', color: '#1e40af', borderRadius: 3, padding: '1px 5px' }}>PKG</span>
                      )}
                    </div>
                    {row.type === 'package' ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 3 }}>
                        {row.garments.map((g, gi) => (
                          <span key={gi} style={tag}>{g}</span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ marginTop: 3 }}>
                        <span style={tag}>{order.garments?.[i]?.type || ''}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ ...td, textAlign: 'left', color: '#888', fontSize: 8.5 }}>
                    <div>{row.fabric}</div>
                    <div>{row.fabricSource}{row.fit ? ` · ${row.fit}` : ''}</div>
                    {row.details && <div>{row.details}</div>}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>{row.quantity}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{fmtMoney(row.rate)}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 500 }}>{fmtMoney(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Subtotal rows */}
          <div style={{ borderTop: '1px solid #e0d8cc', marginTop: 4 }}>
            <SummaryRow label="Subtotal" value={fmtMoney(subtotal)} />
            <SummaryRow label="Advance received" value={`−${fmtMoney(advancePaid)}`} valueColor={COLORS.advanceGreen} labelColor={COLORS.advanceGreen} />
            <div style={{ background: COLORS.paperWarm, borderTop: `2px solid ${COLORS.gold}`, padding: '6px 7px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>Balance due</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.balanceDue }}>{fmtMoney(balanceDue)}</span>
            </div>
          </div>

          {/* Payment box */}
          <div style={{ background: COLORS.paperWarm, border: `1px solid ${COLORS.paperBorder}`, borderLeft: `3px solid ${COLORS.gold}`, borderRadius: 2, padding: '7px 10px', marginTop: 10 }}>
            <div style={metaLabel}>Payment Methods Accepted</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
              <PaymentMethod label="UPI ID" value="datog@upi" />
              <PaymentMethod label="GPay/PhonePe" value={shopDetails?.phone || '+91 82238 31963'} />
              <PaymentMethod label="Bank (SBI)" value="XXXX XXXX XX21" />
              <PaymentMethod label="Cash" value="Accepted in store" />
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, borderTop: '1px dashed #c8bfb0', paddingTop: 8 }}>
            <div>
              <div style={{ height: 24 }} />
              <div style={{ width: 100, height: 1, background: '#aaa' }} />
              <div style={sigLabel}>Customer Signature</div>
            </div>
            <div style={{ maxWidth: 160, textAlign: 'center', fontSize: 8, color: '#888' }}>
              Alterations free within 7 days of delivery. All garments subject to final fitting.
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ height: 24 }} />
              <div style={{ width: 100, height: 1, background: '#aaa', marginLeft: 'auto' }} />
              <div style={sigLabel}>Authorised Signature</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — cutting chart */}
        <div style={{ width: 200, flexShrink: 0, background: COLORS.cuttingBg, display: 'flex', flexDirection: 'column' }}>
          <SectionTitle title="Fabric Cutting Chart" />
          <div style={{ border: `1px solid ${COLORS.cuttingBorder}`, borderRadius: 3, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: COLORS.darkBg, padding: '5px 9px' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#fff' }}>Cutting measurements</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>Fill manually before cutting</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: COLORS.cuttingHead, borderBottom: `1px solid #c8bfb0` }}>
              {['Piece', 'Length', 'Width'].map((h, i) => (
                <div key={h} style={{
                  fontSize: 7, fontWeight: 700, color: COLORS.cuttingLabel, textTransform: 'uppercase',
                  textAlign: 'center', padding: '4px 0', borderRight: i < 2 ? '1px solid #c8bfb0' : 'none'
                }}>
                  {h}
                </div>
              ))}
            </div>
            {Array.from({ length: CUTTING_ROWS }).map((_, r) => (
              <div key={r} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', minHeight: 26,
                borderBottom: r < CUTTING_ROWS - 1 ? `1px solid ${COLORS.cuttingLine}` : 'none'
              }}>
                {[0, 1, 2].map((c) => (
                  <div key={c} style={{ background: '#fff', borderRight: c < 2 ? '1px solid #ddd6cc' : 'none' }} />
                ))}
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', borderTop: '1px solid #c8bfb0' }}>
              <div style={{ fontSize: 7, textTransform: 'uppercase', color: COLORS.cuttingLabel, background: COLORS.cuttingHead, borderRight: '1px solid #c8bfb0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Notes
              </div>
              <div style={{ minHeight: 28, background: '#fff' }} />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: COLORS.darkBg, padding: '7px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>Da Tog's Designer Lounge</span>
        <span style={{ fontSize: 8, color: '#666' }}>Computer-generated invoice · No physical stamp required</span>
        <span style={{ fontSize: 8, color: '#555' }}>Page 1 of 1</span>
      </div>

      {/* Watermark */}
      <div style={{
        position: 'absolute', bottom: 50, right: 20, fontSize: 52, fontWeight: 900,
        color: 'rgba(201, 144, 10, 0.04)', transform: 'rotate(-30deg)', textTransform: 'uppercase',
        letterSpacing: 4, pointerEvents: 'none', userSelect: 'none'
      }}>
        DATOG
      </div>
    </div>
  );
});

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
    <span style={{ fontSize: 7.5, textTransform: 'uppercase', color: '#9a8a70', whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>{title}</span>
    <span style={{ flex: 1, height: 1, background: '#e8e0d0' }} />
  </div>
);

const SummaryRow: React.FC<{ label: string; value: string; valueColor?: string; labelColor?: string }> = ({ label, value, valueColor, labelColor }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 7px', fontSize: 9.5 }}>
    <span style={{ color: labelColor || '#555' }}>{label}</span>
    <span style={{ color: valueColor || '#1a1a1a', fontWeight: 500 }}>{value}</span>
  </div>
);

const PaymentMethod: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div style={metaLabel}>{label}</div>
    <div style={{ fontSize: 9.5, fontWeight: 500, color: '#1a1a1a' }}>{value}</div>
  </div>
);

const metaLabel: React.CSSProperties = { fontSize: 7.5, textTransform: 'uppercase', color: '#9a8a70', letterSpacing: '0.05em' };
const metaValue: React.CSSProperties = { fontSize: 10.5, fontWeight: 500, color: '#1a1a1a' };
const metaSub: React.CSSProperties = { fontSize: 8.5, color: '#777' };
const sigLabel: React.CSSProperties = { fontSize: 7.5, textTransform: 'uppercase', color: '#9a8a70', letterSpacing: '0.07em', marginTop: 4 };
const th: React.CSSProperties = { fontSize: 7.5, textTransform: 'uppercase', color: '#9a8a70', padding: '5px 7px', fontWeight: 600 };
const td: React.CSSProperties = { padding: '6px 7px', verticalAlign: 'top' };
const tag: React.CSSProperties = { fontSize: 7, background: '#f0ece6', border: '1px solid #e0d8cc', borderRadius: 3, padding: '1px 5px', color: '#555' };

export default InvoiceDocument;
