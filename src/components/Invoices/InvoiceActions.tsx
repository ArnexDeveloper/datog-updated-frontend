import React from 'react';
import { useReactToPrint } from 'react-to-print';

interface InvoiceActionsProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  invoiceNumber?: string;
  subtotal?: number;
  balanceDue?: number;
  orderNumber?: string;
  customerPhone?: string;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ contentRef, invoiceNumber, subtotal, balanceDue, orderNumber, customerPhone }) => {
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${invoiceNumber || 'Invoice'}`,
  });

  const handleWhatsApp = () => {
    const msg = `Invoice ${invoiceNumber || ''} from Da Tog's Designer Lounge\n` +
      `Amount: ₹${Number(subtotal || 0).toLocaleString('en-IN')}\n` +
      `Balance due: ₹${Number(balanceDue || 0).toLocaleString('en-IN')}\n` +
      `Order: ${orderNumber || ''}`;
    const phoneDigits = (customerPhone || '').replace(/\D/g, '');
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = `Invoice ${invoiceNumber || ''} - Da Tog's Designer Lounge`;
    const body = `Amount: ₹${Number(subtotal || 0).toLocaleString('en-IN')}\nBalance due: ₹${Number(balanceDue || 0).toLocaleString('en-IN')}\nOrder: ${orderNumber || ''}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="invoice-toolbar print:hidden" style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 740, marginBottom: 4
    }}>
      <button onClick={() => handlePrint()} style={btnPrimary}>🖨 Print</button>
      <button onClick={() => handlePrint()} style={btn}>⬇ Download PDF</button>
      <button onClick={handleWhatsApp} style={btn}>WhatsApp</button>
      <button onClick={handleEmail} style={btn}>✉ Email</button>
      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#666' }}>1 page · print ready</span>
    </div>
  );
};

const btn: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff',
  color: '#374151', fontSize: 13, cursor: 'pointer'
};

const btnPrimary: React.CSSProperties = {
  ...btn, background: '#c9900a', borderColor: '#c9900a', color: '#fff', fontWeight: 600
};

export default InvoiceActions;
