import React, { useState } from 'react';

const MeasurementTemplates = ({ onClose, garmentTypes }) => {
  const [selectedGarment, setSelectedGarment] = useState('shirt');

  const measurementTemplates = {
    shirt: [
      { name: 'chest', label: 'Chest', required: true },
      { name: 'waist', label: 'Waist', required: true },
      { name: 'shoulder', label: 'Shoulder', required: true },
      { name: 'armLength', label: 'Arm Length', required: true },
      { name: 'neck', label: 'Neck', required: true },
      { name: 'shirtLength', label: 'Shirt Length', required: true },
      { name: 'bicep', label: 'Bicep', required: false },
      { name: 'armHole', label: 'Arm Hole', required: false },
      { name: 'forearm', label: 'Forearm', required: false },
      { name: 'wrist', label: 'Wrist', required: false }
    ],
    pant: [
      { name: 'waist', label: 'Waist', required: true },
      { name: 'hip', label: 'Hip', required: true },
      { name: 'inseam', label: 'Inseam', required: true },
      { name: 'outseam', label: 'Outseam', required: true },
      { name: 'thigh', label: 'Thigh', required: true },
      { name: 'knee', label: 'Knee', required: false },
      { name: 'calf', label: 'Calf', required: false },
      { name: 'ankle', label: 'Ankle', required: false },
      { name: 'rise', label: 'Rise', required: true }
    ],
    kurta: [
      { name: 'chest', label: 'Chest', required: true },
      { name: 'waist', label: 'Waist', required: true },
      { name: 'shoulder', label: 'Shoulder', required: true },
      { name: 'armLength', label: 'Arm Length', required: true },
      { name: 'neck', label: 'Neck', required: true },
      { name: 'kurtalLength', label: 'Kurta Length', required: true },
      { name: 'bicep', label: 'Bicep', required: false },
      { name: 'armHole', label: 'Arm Hole', required: false }
    ],
    dress: [
      { name: 'bust', label: 'Bust', required: true },
      { name: 'waist', label: 'Waist', required: true },
      { name: 'hip', label: 'Hip', required: true },
      { name: 'shoulder', label: 'Shoulder', required: true },
      { name: 'armLength', label: 'Arm Length', required: true },
      { name: 'dressLength', label: 'Dress Length', required: true },
      { name: 'underBust', label: 'Under Bust', required: false },
      { name: 'armHole', label: 'Arm Hole', required: false }
    ],
    blazer: [
      { name: 'chest', label: 'Chest', required: true },
      { name: 'waist', label: 'Waist', required: true },
      { name: 'shoulder', label: 'Shoulder', required: true },
      { name: 'armLength', label: 'Arm Length', required: true },
      { name: 'neck', label: 'Neck', required: true },
      { name: 'shirtLength', label: 'Blazer Length', required: true },
      { name: 'bicep', label: 'Bicep', required: true },
      { name: 'armHole', label: 'Arm Hole', required: true }
    ],
    skirt: [
      { name: 'waist', label: 'Waist', required: true },
      { name: 'hip', label: 'Hip', required: true },
      { name: 'skirtLength', label: 'Skirt Length', required: true }
    ],
    saree_blouse: [
      { name: 'bust', label: 'Bust', required: true },
      { name: 'waist', label: 'Waist', required: true },
      { name: 'shoulder', label: 'Shoulder', required: true },
      { name: 'armLength', label: 'Arm Length', required: true },
      { name: 'blouseLength', label: 'Blouse Length', required: true },
      { name: 'underBust', label: 'Under Bust', required: false },
      { name: 'armHole', label: 'Arm Hole', required: false }
    ]
  };

  const measurementGuide = {
    chest: 'Measure around the fullest part of the chest, under the arms',
    waist: 'Measure around the natural waistline',
    hip: 'Measure around the fullest part of the hips',
    shoulder: 'Measure from shoulder point to shoulder point across the back',
    armLength: 'Measure from shoulder to wrist with arm slightly bent',
    neck: 'Measure around the base of the neck',
    shirtLength: 'Measure from the highest point of shoulder to desired shirt length',
    kurtalLength: 'Measure from the highest point of shoulder to desired kurta length',
    inseam: 'Measure from crotch to ankle along the inside of the leg',
    outseam: 'Measure from waist to ankle along the outside of the leg',
    thigh: 'Measure around the fullest part of the thigh',
    bust: 'Measure around the fullest part of the bust',
    blouseLength: 'Measure from shoulder to desired blouse length',
    dressLength: 'Measure from shoulder to desired dress length',
    skirtLength: 'Measure from waist to desired skirt length'
  };

  const currentTemplate = measurementTemplates[selectedGarment] || [];

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>Measurement Templates & Guide</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="templates-content">
          <div className="templates-sidebar">
            <h3>Garment Types</h3>
            <div className="garment-list">
              {Object.keys(measurementTemplates).map(garmentType => (
                <button
                  key={garmentType}
                  className={`garment-item ${selectedGarment === garmentType ? 'active' : ''}`}
                  onClick={() => setSelectedGarment(garmentType)}
                >
                  <span className="garment-icon">👔</span>
                  <span className="garment-name">
                    {garmentType.charAt(0).toUpperCase() + garmentType.slice(1).replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="templates-main">
            <div className="template-header">
              <h3>
                {selectedGarment.charAt(0).toUpperCase() + selectedGarment.slice(1).replace('_', ' ')} Measurements
              </h3>
              <p>Required measurements are marked with *</p>
            </div>

            <div className="measurement-template">
              <div className="measurements-checklist">
                {currentTemplate.map(measurement => (
                  <div key={measurement.name} className="measurement-item">
                    <div className="measurement-info">
                      <label className="measurement-label">
                        <input
                          type="checkbox"
                          defaultChecked={measurement.required}
                          disabled={measurement.required}
                        />
                        <span className="checkmark"></span>
                        {measurement.label}
                        {measurement.required && <span className="required">*</span>}
                      </label>
                    </div>
                    <div className="measurement-guide">
                      {measurementGuide[measurement.name] || 'Standard measurement technique applies'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="template-tips">
              <h4>📏 Measurement Tips</h4>
              <ul>
                <li>Always take measurements over light clothing or undergarments</li>
                <li>Keep the measuring tape snug but not tight</li>
                <li>Ensure the person stands straight with arms relaxed</li>
                <li>Take measurements at the same time of day for consistency</li>
                <li>Record measurements in the preferred unit (inches/cm)</li>
                <li>Double-check critical measurements</li>
                <li>Note any special requirements or fitting preferences</li>
              </ul>
            </div>

            <div className="template-actions">
              <button className="btn btn-secondary" onClick={onClose}>
                Close Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementTemplates;