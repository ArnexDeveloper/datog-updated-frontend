import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import InvoiceDocument from './InvoiceDocument';
import InvoiceActions from './InvoiceActions';
import './InvoiceDocument.css';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const [invoice, setInvoice] = useState<any>(null);
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [invRes, settingsRes] = await Promise.all([
          apiService.getInvoice(id),
          apiService.getSettings().catch(() => null),
        ]);
        setInvoice(invRes?.data?.data || null);
        setShopDetails(settingsRes?.data?.data?.shopDetails || null);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (!loading && invoice && searchParams.get('print') === '1') {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [loading, invoice, searchParams]);

  if (loading) {
    return <div className="loading"><div className="spinner"></div>Loading invoice...</div>;
  }

  if (error || !invoice) {
    return (
      <div style={{ padding: 24 }}>
        <div className="error-banner">{error || 'Invoice not found'}</div>
        <button onClick={() => navigate('/invoices')} style={{ marginTop: 12 }}>Back to Invoices</button>
      </div>
    );
  }

  return (
    <div className="invoice-page-bg">
      <InvoiceActions
        contentRef={contentRef}
        invoiceId={id}
        invoiceNumber={invoice.invoiceNumber}
        subtotal={invoice.charges?.total ?? invoice.charges?.subtotal}
        balanceDue={invoice.payment?.balanceDue}
        orderNumber={invoice.order?.orderNumber}
        customerPhone={invoice.customer?.phone}
        onPaymentRecorded={(payment) => setInvoice((prev: any) => prev ? { ...prev, payment } : prev)}
      />
      <InvoiceDocument ref={contentRef} invoice={invoice} shopDetails={shopDetails} />
    </div>
  );
};

export default InvoiceDetail;
