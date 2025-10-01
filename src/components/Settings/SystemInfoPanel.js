import React from 'react';
import { useSystemInfo } from '../../hooks/useSystemInfo';

const SystemInfoPanel = () => {
  const { systemInfo, loading, error, loadSystemInfo } = useSystemInfo();

  if (loading) {
    return (
      <div className="system-info-panel">
        <h3>System Information</h3>
        <p>Loading system information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-info-panel">
        <h3>System Information</h3>
        <p className="error">Failed to load system information: {error}</p>
        <button onClick={loadSystemInfo} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="system-info-panel">
      <h3>System Information</h3>

      {systemInfo && (
        <div className="info-grid">
          <div className="info-item">
            <label>Application Version:</label>
            <span>{systemInfo.version}</span>
          </div>

          <div className="info-item">
            <label>Last Updated:</label>
            <span>{new Date(systemInfo.lastUpdated).toLocaleString()}</span>
          </div>

          <div className="info-item">
            <label>Last Backup:</label>
            <span>{systemInfo.lastBackup ? new Date(systemInfo.lastBackup).toLocaleString() : 'Never'}</span>
          </div>

          <div className="info-section">
            <h4>Database Statistics</h4>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-value">{systemInfo.dataStats?.orders || 0}</span>
                <span className="stat-label">Orders</span>
              </div>
              <div className="stat">
                <span className="stat-value">{systemInfo.dataStats?.customers || 0}</span>
                <span className="stat-label">Customers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{systemInfo.dataStats?.invoices || 0}</span>
                <span className="stat-label">Invoices</span>
              </div>
              <div className="stat">
                <span className="stat-value">{systemInfo.dataStats?.users || 0}</span>
                <span className="stat-label">Users</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h4>Storage Information</h4>
            <div className="info-item">
              <label>Location:</label>
              <span>{systemInfo.storageInfo?.location || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <label>Auto Backup:</label>
              <span>{systemInfo.storageInfo?.autoBackup ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="info-item">
              <label>Backup Frequency:</label>
              <span>{systemInfo.storageInfo?.backupFrequency || 'Not Set'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="panel-actions">
        <button onClick={loadSystemInfo} disabled={loading} className="btn btn-secondary">
          Refresh System Info
        </button>
      </div>
    </div>
  );
};

export default SystemInfoPanel;