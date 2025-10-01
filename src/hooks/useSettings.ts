import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSettings();
      if (response.data.success) {
        setSettings(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load settings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.updateSettings(newSettings);
      if (response.data.success) {
        setSettings(response.data.data);
        return { success: true, message: 'Settings updated successfully' };
      } else {
        const errorMsg = response.data.message || 'Failed to update settings';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update settings';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.resetSettings();
      if (response.data.success) {
        setSettings(response.data.data);
        return { success: true, message: 'Settings reset successfully' };
      } else {
        const errorMsg = response.data.message || 'Failed to reset settings';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset settings';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await apiService.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tailor-shop-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, message: 'Data exported successfully' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Export failed' };
    }
  };

  const importData = async (file) => {
    try {
      setLoading(true);
      setError(null);
      const text = await file.text();
      const importData = JSON.parse(text);

      const response = await apiService.importData(importData);
      if (response.data.success) {
        await loadSettings(); // Reload settings
        return { success: true, message: 'Data imported successfully' };
      } else {
        const errorMsg = response.data.message || 'Failed to import data';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Import failed';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.clearAllData();
      if (response.data.success) {
        return { success: true, message: 'All data cleared successfully' };
      } else {
        const errorMsg = response.data.message || 'Failed to clear data';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to clear data';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateSettings,
    resetSettings,
    exportData,
    importData,
    clearAllData,
  };
};