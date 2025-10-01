import React, { useState, useEffect } from 'react';

const BillingTab = ({ settings, onSaveSettings, loading, isAdmin }) => {
  const [formData, setFormData] = useState({
    currency: 'USD',
    taxRate: 18,
    invoicePrefix: 'INV-',
    netDays: 30,
    advancePercentage: 50
  });

  useEffect(() => {
    if (settings?.billing) {
      setFormData({
        currency: settings.billing.currency || 'USD',
        taxRate: settings.billing.taxRate || 18,
        invoicePrefix: settings.billing.invoicePrefix || 'INV-',
        netDays: settings.billing.paymentTerms?.netDays || 30,
        advancePercentage: settings.billing.paymentTerms?.advancePercentage || 50
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      billing: {
        currency: formData.currency,
        taxRate: formData.taxRate,
        invoicePrefix: formData.invoicePrefix,
        paymentTerms: {
          netDays: formData.netDays,
          advancePercentage: formData.advancePercentage
        }
      }
    });
  };

  return (
    <div className="tab-panel">
      <h3>Billing Configuration</h3>
      <p>Set up financial parameters for invoicing and pricing.</p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency">Currency:</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              disabled={loading || !isAdmin}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="taxRate">Tax Rate (%):</label>
            <input
              type="number"
              id="taxRate"
              name="taxRate"
              value={formData.taxRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              disabled={loading || !isAdmin}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="invoicePrefix">Invoice Prefix:</label>
            <input
              type="text"
              id="invoicePrefix"
              name="invoicePrefix"
              value={formData.invoicePrefix}
              onChange={handleChange}
              placeholder="INV-"
              maxLength={10}
              disabled={loading || !isAdmin}
            />
          </div>

          <div className="form-group">
            <label htmlFor="netDays">Net Payment Days:</label>
            <input
              type="number"
              id="netDays"
              name="netDays"
              value={formData.netDays}
              onChange={handleChange}
              min="1"
              disabled={loading || !isAdmin}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="advancePercentage">Advance Payment (%):</label>
          <input
            type="number"
            id="advancePercentage"
            name="advancePercentage"
            value={formData.advancePercentage}
            onChange={handleChange}
            min="0"
            max="100"
            disabled={loading || !isAdmin}
          />
        </div>

        {isAdmin && (
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BillingTab;