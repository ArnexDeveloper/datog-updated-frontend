import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const MeasurementForm = ({ measurement, customers, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customer: '',
    garmentType: 'shirt',
    unit: 'inch',
    // Upper body measurements
    chest: '',
    waist: '',
    hip: '',
    shoulder: '',
    armLength: '',
    armHole: '',
    bicep: '',
    forearm: '',
    wrist: '',
    neck: '',
    // Shirt/Kurta specific
    shirtLength: '',
    kurtalLength: '',
    // Lower body measurements
    inseam: '',
    outseam: '',
    thigh: '',
    knee: '',
    calf: '',
    ankle: '',
    rise: '',
    // Women's specific measurements
    bust: '',
    underBust: '',
    blouseLength: '',
    skirtLength: '',
    dressLength: '',
    // Additional measurements
    height: '',
    weight: '',
    // Custom measurements
    customMeasurements: [],
    notes: ''
  });

  const [customMeasurement, setCustomMeasurement] = useState({
    name: '',
    value: '',
    unit: 'inch'
  });

  const garmentTypes = [
    'shirt', 'pant', 'suit', 'blazer', 'kurta', 'pajama', 'sherwani',
    'lehenga', 'saree_blouse', 'dress', 'skirt', 'top', 'jacket',
    'coat', 'waistcoat', 'dhoti', 'churidar', 'salwar', 'dupatta', 'other'
  ];

  const units = ['inch', 'cm', 'mm'];

  useEffect(() => {
    if (measurement) {
      setFormData({
        customer: measurement.customer._id || measurement.customer,
        garmentType: measurement.garmentType,
        unit: measurement.unit || 'inch',
        chest: measurement.chest || '',
        waist: measurement.waist || '',
        hip: measurement.hip || '',
        shoulder: measurement.shoulder || '',
        armLength: measurement.armLength || '',
        armHole: measurement.armHole || '',
        bicep: measurement.bicep || '',
        forearm: measurement.forearm || '',
        wrist: measurement.wrist || '',
        neck: measurement.neck || '',
        shirtLength: measurement.shirtLength || '',
        kurtalLength: measurement.kurtalLength || '',
        inseam: measurement.inseam || '',
        outseam: measurement.outseam || '',
        thigh: measurement.thigh || '',
        knee: measurement.knee || '',
        calf: measurement.calf || '',
        ankle: measurement.ankle || '',
        rise: measurement.rise || '',
        bust: measurement.bust || '',
        underBust: measurement.underBust || '',
        blouseLength: measurement.blouseLength || '',
        skirtLength: measurement.skirtLength || '',
        dressLength: measurement.dressLength || '',
        height: measurement.height || '',
        weight: measurement.weight || '',
        customMeasurements: measurement.customMeasurements || [],
        notes: measurement.notes || ''
      });
    }
  }, [measurement]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : (isNaN(Number(value)) ? value : Number(value))
    }));
  };

  const addCustomMeasurement = () => {
    if (customMeasurement.name && customMeasurement.value) {
      setFormData(prev => ({
        ...prev,
        customMeasurements: [
          ...prev.customMeasurements,
          {
            ...customMeasurement,
            value: Number(customMeasurement.value)
          }
        ]
      }));
      setCustomMeasurement({ name: '', value: '', unit: 'inch' });
    }
  };

  const removeCustomMeasurement = (index) => {
    setFormData(prev => ({
      ...prev,
      customMeasurements: prev.customMeasurements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer) {
      setError('Please select a customer');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Filter out empty measurements
      const cleanedData = { ...formData };
      Object.keys(cleanedData).forEach(key => {
        if (typeof cleanedData[key] === 'string' && cleanedData[key] === '') {
          delete cleanedData[key];
        }
      });

      if (measurement) {
        await apiService.updateMeasurement(measurement._id, cleanedData);
      } else {
        await apiService.createMeasurement(cleanedData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save measurement');
    } finally {
      setLoading(false);
    }
  };

  const getMeasurementFields = () => {
    const { garmentType } = formData;

    const commonFields = [
      { name: 'chest', label: 'Chest' },
      { name: 'waist', label: 'Waist' },
      { name: 'hip', label: 'Hip' },
      { name: 'shoulder', label: 'Shoulder' }
    ];

    const upperBodyFields = [
      { name: 'armLength', label: 'Arm Length' },
      { name: 'armHole', label: 'Arm Hole' },
      { name: 'bicep', label: 'Bicep' },
      { name: 'forearm', label: 'Forearm' },
      { name: 'wrist', label: 'Wrist' },
      { name: 'neck', label: 'Neck' }
    ];

    const lowerBodyFields = [
      { name: 'inseam', label: 'Inseam' },
      { name: 'outseam', label: 'Outseam' },
      { name: 'thigh', label: 'Thigh' },
      { name: 'knee', label: 'Knee' },
      { name: 'calf', label: 'Calf' },
      { name: 'ankle', label: 'Ankle' },
      { name: 'rise', label: 'Rise' }
    ];

    const womenFields = [
      { name: 'bust', label: 'Bust' },
      { name: 'underBust', label: 'Under Bust' }
    ];

    const lengthFields = {
      shirt: [{ name: 'shirtLength', label: 'Shirt Length' }],
      kurta: [{ name: 'kurtalLength', label: 'Kurta Length' }],
      dress: [{ name: 'dressLength', label: 'Dress Length' }],
      skirt: [{ name: 'skirtLength', label: 'Skirt Length' }],
      saree_blouse: [{ name: 'blouseLength', label: 'Blouse Length' }]
    };

    let fields = [];

    switch (garmentType) {
      case 'shirt':
      case 'kurta':
      case 'blazer':
      case 'jacket':
      case 'coat':
        fields = [...commonFields, ...upperBodyFields, ...(lengthFields[garmentType] || [])];
        break;
      case 'pant':
      case 'churidar':
      case 'pajama':
      case 'dhoti':
        fields = [
          { name: 'waist', label: 'Waist' },
          { name: 'hip', label: 'Hip' },
          ...lowerBodyFields
        ];
        break;
      case 'dress':
      case 'saree_blouse':
      case 'lehenga':
        fields = [...commonFields, ...upperBodyFields, ...womenFields, ...(lengthFields[garmentType] || [])];
        break;
      case 'skirt':
      case 'salwar':
        fields = [
          { name: 'waist', label: 'Waist' },
          { name: 'hip', label: 'Hip' },
          ...(lengthFields[garmentType] || [])
        ];
        break;
      case 'suit':
        fields = [...commonFields, ...upperBodyFields, ...lowerBodyFields];
        break;
      default:
        fields = commonFields;
    }

    return fields;
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>{measurement ? 'Edit Measurement' : 'New Measurement'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="measurement-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customer">Customer *</label>
                <select
                  id="customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="garmentType">Garment Type *</label>
                <select
                  id="garmentType"
                  name="garmentType"
                  value={formData.garmentType}
                  onChange={handleInputChange}
                  required
                >
                  {garmentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Measurements ({formData.unit})</h3>
            <div className="measurements-grid">
              {getMeasurementFields().map(field => (
                <div key={field.name} className="form-group">
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    type="number"
                    step="0.25"
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Measurements */}
          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="height">Height ({formData.unit})</label>
                <input
                  type="number"
                  step="0.25"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Custom Measurements */}
          <div className="form-section">
            <h3>Custom Measurements</h3>
            <div className="custom-measurements-section">
              <div className="custom-measurement-input">
                <input
                  type="text"
                  placeholder="Measurement name"
                  value={customMeasurement.name}
                  onChange={(e) => setCustomMeasurement(prev => ({ ...prev, name: e.target.value }))}
                />
                <input
                  type="number"
                  step="0.25"
                  placeholder="Value"
                  value={customMeasurement.value}
                  onChange={(e) => setCustomMeasurement(prev => ({ ...prev, value: e.target.value }))}
                />
                <select
                  value={customMeasurement.unit}
                  onChange={(e) => setCustomMeasurement(prev => ({ ...prev, unit: e.target.value }))}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <button type="button" onClick={addCustomMeasurement} className="btn btn-sm btn-secondary">
                  Add
                </button>
              </div>

              {formData.customMeasurements.length > 0 && (
                <div className="custom-measurements-list">
                  {formData.customMeasurements.map((custom, index) => (
                    <div key={index} className="custom-measurement-item">
                      <span>{custom.name}: {custom.value} {custom.unit}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomMeasurement(index)}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Any special notes or requirements..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (measurement ? 'Update Measurement' : 'Save Measurement')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeasurementForm;