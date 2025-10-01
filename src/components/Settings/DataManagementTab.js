import React from 'react';
import { useSettings } from '../../hooks/useSettings';

const DataManagementTab = ({ isAdmin, showNotification }) => {
  const { exportData, importData, resetSettings, clearAllData, loading } = useSettings();

  const handleExport = async () => {
    const result = await exportData();
    showNotification(result.message, result.success ? 'success' : 'error');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const result = await importData(file);
      showNotification(result.message, result.success ? 'success' : 'error');
      e.target.value = ''; // Reset file input
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      const result = await resetSettings();
      showNotification(result.message, result.success ? 'success' : 'error');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete ALL data (orders, customers, invoices). Are you absolutely sure?')) {
      if (window.confirm('This is your final warning. All data will be lost forever. Continue?')) {
        const result = await clearAllData();
        showNotification(result.message, result.success ? 'warning' : 'error');
      }
    }
  };

  return (
    <div className="tab-panel">
      <div className="data-section">
        <h3>Data Export & Import</h3>
        <p>Backup and restore system data.</p>

        <div className="button-group">
          <button
            onClick={handleExport}
            disabled={loading}
            className="btn btn-success"
          >
            Export All Data
          </button>

          <label className="btn btn-secondary file-input-label">
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={loading || !isAdmin}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {isAdmin && (
        <div className="data-section danger-zone">
          <h3>Data Management</h3>
          <div className="warning-box">
            <strong>Warning:</strong> These actions are irreversible. Please ensure you have a backup before proceeding.
          </div>

          <div className="button-group">
            <button
              onClick={handleReset}
              disabled={loading}
              className="btn btn-secondary"
            >
              Reset Settings to Default
            </button>

            <button
              onClick={handleClearAll}
              disabled={loading}
              className="btn btn-danger"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagementTab;