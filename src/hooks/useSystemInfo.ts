import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSystemInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSystemInfo();
      if (response.data.success) {
        setSystemInfo(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load system information');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemInfo();
  }, []);

  return {
    systemInfo,
    loading,
    error,
    loadSystemInfo,
  };
};