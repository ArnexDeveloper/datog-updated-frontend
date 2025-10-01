import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import './Invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    order: '', 
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // Default to 30 days from now
    notes: '', 
    items: [], 
    total: 0 
  });
  const [payment, setPayment] = useState({ amount: 0, method: 'cash', reference: '', notes: '' });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [iRes, oRes] = await Promise.all([
        apiService.getInvoices({ limit: 50 }).catch((e) => { throw e; }),
        apiService.getOrders({ status: 'ready', limit: 50 }).catch(async () => {
          // Fallback: fetch without filter if backend rejects filter or fails
          try {
            return await apiService.getOrders({ limit: 50 });
          } catch (err) {
            throw err;
          }
        })
      ]);
      setInvoices(iRes?.data?.data || []);
      setOrders(oRes?.data?.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setForm({ 
      order: '', 
      dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // Default to 30 days from now
      notes: '', 
      items: [], 
      total: 0 
    });
    setShowForm(true);
  };

  const createInvoice = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Use backend generation from order to populate items/customer
      const payload = {
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        notes: form.notes || '',
      };
      
      console.log('Generating invoice for order:', form.order, 'with payload:', payload);
      const response = await apiService.generateInvoiceFromOrder(form.order, payload);
      console.log('Invoice generation response:', response);
      
      setShowForm(false);
      await loadData();
    } catch (e) {
      console.error('Invoice generation error:', e);
      setError(e?.response?.data?.message || e?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const applyPayment = async (invoiceId) => {
    try {
      setLoading(true);
      await apiService.updateInvoicePayment(invoiceId, payment);
      setPayment({ amount: 0, method: 'cash', reference: '', notes: '' });
      await loadData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h2>Invoices</h2>
        <button className="primary" onClick={openCreate}>+ Create Invoice</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="list-card">
        {loading ? <div className="loading">Loading...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNumber || inv._id?.slice(-6)}</td>
                  <td>{inv.order?.orderNumber}</td>
                  <td>{inv.order?.customer?.name}</td>
                  <td>₹{inv.total || inv.order?.payment?.total || 0}</td>
                  <td>{inv.payment?.status || (inv.order?.payment?.status || 'pending')}</td>
                  <td>
                    <div className="actions">
                      <button onClick={async () => {
                        try {
                          const res = await apiService.getInvoicePDF(inv._id);
                          const blob = new Blob([res.data], { type: 'application/pdf' });
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, '_blank');
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          alert('Failed to download invoice PDF');
                          console.error('Invoice PDF error:', err);
                        }
                      }}>Download PDF</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Invoice</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={createInvoice}>
              <div className="form-row">
                <label>Order</label>
                <select value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} required>
                  <option value="">{orders.length ? 'Select Order' : 'No eligible orders found'}</option>
                  {orders.map(o => (
                    <option key={o._id} value={o._id}>{o.orderNumber} - {o.customer?.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary" disabled={loading}>{loading ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
