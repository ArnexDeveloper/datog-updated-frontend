import React, { useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { apiService } from '../../services/api';
import RecordInvoicePaymentModal from './RecordInvoicePaymentModal';

interface InvoiceActionsProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  invoiceId?: string;
  invoiceNumber?: string;
  subtotal?: number;
  balanceDue?: number;
  orderNumber?: string;
  customerPhone?: string;
  onPaymentRecorded?: (payment: any) => void;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ contentRef, invoiceId, invoiceNumber, subtotal, balanceDue, orderNumber, customerPhone, onPaymentRecorded }) => {
  const [sendStatus, setSendStatus] = useState<{ state: 'idle' | 'sending' | 'success' | 'error'; message?: string }>({ state: 'idle' });
  const [waConnected, setWaConnected] = useState<boolean | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    (apiService as any).getWhatsAppStatus()
      .then((res: any) => setWaConnected(!!res?.data?.connected))
      .catch(() => setWaConnected(false));
  }, []);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${invoiceNumber || 'Invoice'}`,
  });

  const handleSendWhatsAppPDF = async () => {
    if (!invoiceId || !waConnected || sendStatus.state === 'sending') return;
    setSendStatus({ state: 'sending' });
    try {
      const res = await (apiService as any).sendInvoiceWhatsApp(invoiceId);
      setSendStatus({ state: 'success', message: res?.data?.message || 'Invoice sent' });
    } catch (e: any) {
      setSendStatus({ state: 'error', message: e?.response?.data?.error || 'WhatsApp send failed — check connection' });
    } finally {
      setTimeout(() => setSendStatus({ state: 'idle' }), 4000);
    }
  };

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
      {!!balanceDue && balanceDue > 0 && invoiceId && (
        <button onClick={() => setShowPaymentModal(true)} style={btn}>💵 Record Payment</button>
      )}
      <button onClick={handleWhatsApp} style={btn}>WhatsApp</button>
      <button
        onClick={handleSendWhatsAppPDF}
        disabled={sendStatus.state === 'sending' || !waConnected}
        title={waConnected === false ? 'Link WhatsApp from the admin settings to enable this' : undefined}
        style={waConnected === false ? btnDisabled : btn}
      >
        {sendStatus.state === 'sending'
          ? 'Sending…'
          : waConnected === false
            ? 'WhatsApp not connected'
            : '📎 Send PDF via WhatsApp'}
      </button>
      <button onClick={handleEmail} style={btn}>✉ Email</button>
      {sendStatus.state === 'success' && (
        <span style={{ fontSize: 12, color: '#15803d' }}>✓ {sendStatus.message}</span>
      )}
      {sendStatus.state === 'error' && (
        <span style={{ fontSize: 12, color: '#dc2626' }}>✕ {sendStatus.message}</span>
      )}
      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#666' }}>1 page · print ready</span>

      {showPaymentModal && invoiceId && (
        <RecordInvoicePaymentModal
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber || ''}
          currentBalance={balanceDue || 0}
          onClose={() => setShowPaymentModal(false)}
          onSaved={(payment) => {
            setShowPaymentModal(false);
            onPaymentRecorded?.(payment);
          }}
        />
      )}
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

const btnDisabled: React.CSSProperties = {
  ...btn, background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed'
};

export default InvoiceActions;
