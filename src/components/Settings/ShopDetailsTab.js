import React, { useState, useEffect } from 'react';

const ShopDetailsTab = ({ settings, onSaveSettings, loading, isAdmin }) => {
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (settings?.shopDetails) {
      setFormData({
        shopName: settings.shopDetails.shopName || '',
        address: settings.shopDetails.address || '',
        phone: settings.shopDetails.phone || '',
        email: settings.shopDetails.email || ''
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      shopDetails: formData
    });
  };

  return (
    <div className="tab-panel">
      <h3>Shop Information</h3>
      <p>Configure basic business information displayed on invoices and throughout the system.</p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shopName">Shop Name:</label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="Elite Designer Lounge"
              maxLength={100}
              disabled={loading || !isAdmin}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="info@elitedesignerlounge.com"
              disabled={loading || !isAdmin}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              disabled={loading || !isAdmin}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Fashion Street, Design City, DC 12345"
            rows={4}
            maxLength={500}
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

export default ShopDetailsTab;