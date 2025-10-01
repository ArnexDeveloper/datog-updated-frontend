import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import MeasurementForm from './MeasurementForm';
import MeasurementTemplates from './MeasurementTemplates';
import './Measurements.css';

const Measurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedGarmentType, setSelectedGarmentType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    garmentType: 'all',
    customer: 'all'
  });

  const garmentTypes = [
    'shirt', 'pant', 'suit', 'blazer', 'kurta', 'pajama', 'sherwani',
    'lehenga', 'saree_blouse', 'dress', 'skirt', 'top', 'jacket',
    'coat', 'waistcoat', 'dhoti', 'churidar', 'salwar', 'dupatta', 'other'
  ];

  useEffect(() => {
    loadMeasurements();
    loadCustomers();
  }, [filters]);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        garmentType: filters.garmentType !== 'all' ? filters.garmentType : undefined,
        customer: filters.customer !== 'all' ? filters.customer : undefined
      };
      const response = await apiService.getMeasurements(params);
      if (response.data.success) {
        setMeasurements(response.data.data);
      }
    } catch (err) {
      setError('Failed to load measurements');
      console.error('Error loading measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await apiService.getCustomers({ isActive: 'true' });
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadMeasurements();
  };

  const handleAddMeasurement = () => {
    setEditingMeasurement(null);
    setShowAddForm(true);
  };

  const handleEditMeasurement = (measurement) => {
    setEditingMeasurement(measurement);
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingMeasurement(null);
    loadMeasurements();
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      try {
        await apiService.deleteMeasurement(measurementId);
        loadMeasurements();
      } catch (err) {
        setError('Failed to delete measurement');
        console.error('Error deleting measurement:', err);
      }
    }
  };

  const getCustomerMeasurements = (customerId) => {
    return measurements.filter(m => m.customer._id === customerId);
  };

  const groupMeasurementsByCustomer = () => {
    const grouped: any = {};
    measurements.forEach((measurement: any) => {
      const customerId = measurement.customer._id;
      if (!grouped[customerId]) {
        grouped[customerId] = {
          customer: measurement.customer,
          measurements: []
        };
      }
      grouped[customerId].measurements.push(measurement);
    });
    return Object.values(grouped);
  };

  const formatMeasurementValue = (value: any, unit: any) => {
    return value ? `${value} ${unit || 'inch'}` : '-';
  };

  const getRelevantMeasurements = (measurement: any) => {
    const { garmentType } = measurement;
    const commonFields = ['chest', 'waist', 'hip', 'shoulder'];

    switch (garmentType) {
      case 'shirt':
      case 'kurta':
      case 'blazer':
      case 'jacket':
        return [...commonFields, 'armLength', 'neck', 'shirtLength', 'kurtalLength'];
      case 'pant':
      case 'churidar':
      case 'pajama':
        return ['waist', 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'rise'];
      case 'dress':
      case 'saree_blouse':
        return [...commonFields, 'bust', 'underBust', 'armLength', 'dressLength', 'blouseLength'];
      case 'skirt':
        return ['waist', 'hip', 'skirtLength'];
      default:
        return commonFields;
    }
  };

  if (loading && measurements.length === 0) {
    return (
      <div className="measurements-loading">
        <div className="spinner"></div>
        <p>Loading measurements...</p>
      </div>
    );
  }

  return (
    <div className="measurements">
      <div className="measurements-header">
        <h1>Measurement Management</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowTemplates(true)}>
            📏 Templates
          </button>
          <button className="btn btn-primary" onClick={handleAddMeasurement}>
            + New Measurement
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="measurements-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div className="filters">
          <select
            value={filters.garmentType}
            onChange={(e) => setFilters(prev => ({ ...prev, garmentType: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Garments</option>
            {garmentTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={filters.customer}
            onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Customers</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-card" onClick={() => setSelectedCustomer('')}>
          <div className="action-icon">👥</div>
          <div className="action-content">
            <h3>By Customer</h3>
            <p>View measurements grouped by customers</p>
          </div>
        </div>
        <div className="action-card" onClick={() => setSelectedGarmentType('')}>
          <div className="action-icon">👔</div>
          <div className="action-content">
            <h3>By Garment</h3>
            <p>View measurements by garment type</p>
          </div>
        </div>
        <div className="action-card" onClick={() => setShowTemplates(true)}>
          <div className="action-icon">📏</div>
          <div className="action-content">
            <h3>Templates</h3>
            <p>Manage measurement templates</p>
          </div>
        </div>
      </div>

      {/* Measurements Display */}
      <div className="measurements-content">
        {measurements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📏</div>
            <h3>No measurements found</h3>
            <p>Start by taking your first customer measurement</p>
            <button className="btn btn-primary" onClick={handleAddMeasurement}>
              Take Measurement
            </button>
          </div>
        ) : (
          <div className="measurements-grid">
            {groupMeasurementsByCustomer().map((group: any) => (
              <div key={group.customer._id} className="customer-measurements-card">
                <div className="customer-header">
                  <div className="customer-info">
                    <h3>{group.customer.name}</h3>
                    <p>{group.customer.phone}</p>
                  </div>
                  <div className="measurement-count">
                    {group.measurements.length} measurement{group.measurements.length > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="measurements-list">
                  {group.measurements.map((measurement: any) => (
                    <div key={measurement._id} className="measurement-item">
                      <div className="measurement-header">
                        <div className="garment-info">
                          <span className="garment-type">
                            {measurement.garmentType.charAt(0).toUpperCase() + measurement.garmentType.slice(1)}
                          </span>
                          <span className="measurement-date">
                            {new Date(measurement.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="measurement-actions">
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEditMeasurement(measurement)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteMeasurement(measurement._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="measurement-values">
                        {getRelevantMeasurements(measurement).map(field => (
                          measurement[field] && (
                            <div key={field} className="measurement-field">
                              <span className="field-name">
                                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                              </span>
                              <span className="field-value">
                                {formatMeasurementValue(measurement[field], measurement.unit)}
                              </span>
                            </div>
                          )
                        ))}
                      </div>

                      {measurement.notes && (
                        <div className="measurement-notes">
                          <strong>Notes:</strong> {measurement.notes}
                        </div>
                      )}

                      {measurement.customMeasurements && measurement.customMeasurements.length > 0 && (
                        <div className="custom-measurements">
                          <strong>Custom Measurements:</strong>
                          {measurement.customMeasurements.map((custom, idx) => (
                            <span key={idx} className="custom-measurement">
                              {custom.name}: {custom.value} {custom.unit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Measurement Form Modal */}
      {showAddForm && (
        <MeasurementForm
          measurement={editingMeasurement}
          customers={customers}
          onClose={handleFormClose}
          onSave={loadMeasurements}
        />
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <MeasurementTemplates
          onClose={() => setShowTemplates(false)}
          garmentTypes={garmentTypes}
        />
      )}
    </div>
  );
};

export default Measurements;