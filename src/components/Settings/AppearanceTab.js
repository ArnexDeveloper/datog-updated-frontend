import React, { useState, useEffect } from 'react';

const AppearanceTab = ({ settings, onSaveSettings, loading, isAdmin }) => {
  const [formData, setFormData] = useState({
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
    currencyDisplay: 'symbol'
  });

  useEffect(() => {
    if (settings?.appearance) {
      setFormData({
        theme: settings.appearance.theme || 'light',
        dateFormat: settings.appearance.dateFormat || 'MM/DD/YYYY',
        currencyDisplay: settings.appearance.currencyDisplay || 'symbol'
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
      appearance: formData
    });

    // Apply theme immediately
    if (formData.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  return (
    <div className="tab-panel">
      <h3>Theme Preferences</h3>
      <p>Control the visual appearance of the application.</p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="theme">Theme:</label>
            <select
              id="theme"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              disabled={loading || !isAdmin}
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dateFormat">Date Format:</label>
            <select
              id="dateFormat"
              name="dateFormat"
              value={formData.dateFormat}
              onChange={handleChange}
              disabled={loading || !isAdmin}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (EU Format)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="currencyDisplay">Currency Display:</label>
          <select
            id="currencyDisplay"
            name="currencyDisplay"
            value={formData.currencyDisplay}
            onChange={handleChange}
            disabled={loading || !isAdmin}
          >
            <option value="symbol">Symbol ($, €, £)</option>
            <option value="code">Code (USD, EUR, GBP)</option>
            <option value="name">Name (US Dollar, Euro, British Pound)</option>
          </select>
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

export default AppearanceTab;