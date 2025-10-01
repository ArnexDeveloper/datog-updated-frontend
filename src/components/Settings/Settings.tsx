import React, { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import ShopDetailsTab from './ShopDetailsTab';
import BillingTab from './BillingTab';
import AppearanceTab from './AppearanceTab';
import DataManagementTab from './DataManagementTab';
import SystemInfoPanel from './SystemInfoPanel';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('shop-details');
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState(null);

  const { settings, loading, error, updateSettings } = useSettings();
  const { user, isAdmin } = useAuth();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSettingsChange = () => {
    setHasChanges(true);
  };

  const handleSaveSettings = async (newSettings) => {
    const result = await updateSettings(newSettings);
    if (result.success) {
      setHasChanges(false);
      showNotification(result.message, 'success');
    } else {
      showNotification(result.message, 'error');
    }
  };

  const tabs = [
    { id: 'shop-details', label: 'Shop Details', component: ShopDetailsTab },
    { id: 'billing', label: 'Billing', component: BillingTab },
    { id: 'appearance', label: 'Appearance', component: AppearanceTab },
    { id: 'data-management', label: 'Data Management', component: DataManagementTab },
  ];

  if (loading && !settings) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="settings-error">
        <h2>Error Loading Settings</h2>
        <p>{error}</p>
      </div>
    );
  }

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your Elite Designer Lounge system configuration and preferences
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Welcome, {user?.name} ({user?.role})
          </div>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={notification.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
              </svg>
              {notification.message}
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } disabled:opacity-50`}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={loading}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

        <div className="tab-content">
          {ActiveTabComponent && (
            <ActiveTabComponent
              settings={settings}
              onSaveSettings={handleSaveSettings}
              loading={loading}
              isAdmin={isAdmin()}
              showNotification={showNotification}
            />
          )}
        </div>
        </div>

        <SystemInfoPanel />

        {hasChanges && (
          <div className="unsaved-changes-bar">
            <span>You have unsaved changes</span>
            <div>
              <button
                onClick={() => setHasChanges(false)}
                className="btn-secondary"
              >
                Discard Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;