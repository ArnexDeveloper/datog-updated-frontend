import React, { useState } from 'react';
import axios from "axios";
import { Ruler } from 'lucide-react';

interface MeasurementsProps {
  formData: any;
  handleMeasurementChange: (name: string, value: string) => void;
  loadSavedMeasurements?: () => void;
  saveMeasurements?: () => void;
  onNext?: () => void;
  setFormData: (updater: (prev: any) => any) => void;
}

export default function Measurements({
  formData,
  handleMeasurementChange,
  onNext,
  setFormData,
}: MeasurementsProps) {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [hasExistingMeasurements, setHasExistingMeasurements] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // Track active product tab

  const getMeasurements = async (id: string) => {
    try {
      const response = await axios.get(`${baseURL}/measurements/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response || !response.data) {
        throw new Error("No DNS: Could not connect to the server");
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // measurement not found
      }
      throw error;
    }
  };

  const createMeasurements = async (measurements: any) => {
    return axios.post(`${baseURL}/measurements`, measurements, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  const updateMeasurements = async (id: string, measurements: any) => {
    return axios.put(`${baseURL}/measurements/${id}`, measurements, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  // ----------- HANDLERS -----------

  const handleGetMeasurements = async () => {
    try {
      setLoading(true);
      const measurementsData = await getMeasurements(formData.id);

      if (!measurementsData) {
        alert("No saved measurements found. Please fill in the fields.");
        setHasExistingMeasurements(false);
        return;
      }

      // ✅ Merge into formData
      setFormData((prev: any) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          ...measurementsData,
        },
      }));

      setHasExistingMeasurements(true);
    } catch (error: any) {
      console.error("Failed to get measurements:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      const measurementsPayload = formData.measurements;

      if (!measurementsPayload || Object.keys(measurementsPayload).length === 0) {
        alert("Please fill out the measurements before continuing.");
        return;
      }

      if (hasExistingMeasurements) {
        // ✅ Update flow
        await updateMeasurements(formData.id, measurementsPayload);
        console.log("Measurements updated successfully");
      } else {
        // ✅ Create flow
        await createMeasurements(measurementsPayload);
        console.log("Measurements created successfully");
      }

      if (onNext) onNext();
    } catch (error: any) {
      console.error("Failed to save measurements:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ----------- MEASUREMENT FIELD DEFINITIONS -----------

  // Define measurement fields based on product type
  const getMeasurementFields = (productType: string) => {
    const normalizedType = productType.toLowerCase();

    // Shirt/Kurta/Kurti/Kamize measurements
    if (['shirt', 'kurta', 'kurti', 'kamize', 'pathni', 'jubba', 'blouse'].includes(normalizedType)) {
      return [
        { key: 'chest', label: 'Chest/Bust', placeholder: '40' },
        { key: 'waist', label: 'Waist', placeholder: '34' },
        { key: 'shoulder', label: 'Shoulder', placeholder: '18' },
        { key: 'length', label: 'Length', placeholder: '30' },
        { key: 'sleeve', label: 'Sleeve', placeholder: '24' },
      ];
    }

    // Pant/Trouser measurements
    if (['trousers', 'pant', 'pajamas', 'shalwars', 'dhoti'].includes(normalizedType)) {
      return [
        { key: 'waist', label: 'Waist', placeholder: '32' },
        { key: 'hip', label: 'Hip', placeholder: '38' },
        { key: 'length', label: 'Length', placeholder: '42' },
        { key: 'inseam', label: 'Inseam', placeholder: '32' },
        { key: 'thigh', label: 'Thigh', placeholder: '24' },
      ];
    }

    // Jacket/Blazer/Coat measurements
    if (['blazer', 'jacket', 'west-coat', 'sherwani', 'over-coat', 'trench-coat'].includes(normalizedType)) {
      return [
        { key: 'chest', label: 'Chest', placeholder: '42' },
        { key: 'waist', label: 'Waist', placeholder: '36' },
        { key: 'shoulder', label: 'Shoulder', placeholder: '19' },
        { key: 'length', label: 'Length', placeholder: '28' },
        { key: 'sleeve', label: 'Sleeve', placeholder: '25' },
      ];
    }

    // Dress/Gown measurements
    if (['gowne', 'one-pec', 'kaftan'].includes(normalizedType)) {
      return [
        { key: 'bust', label: 'Bust', placeholder: '36' },
        { key: 'waist', label: 'Waist', placeholder: '28' },
        { key: 'hip', label: 'Hip', placeholder: '38' },
        { key: 'shoulder', label: 'Shoulder', placeholder: '16' },
        { key: 'length', label: 'Dress Length', placeholder: '42' },
      ];
    }

    // Skirt measurements
    if (['skirts', 'garara', 'sharara'].includes(normalizedType)) {
      return [
        { key: 'waist', label: 'Waist', placeholder: '28' },
        { key: 'hip', label: 'Hip', placeholder: '38' },
        { key: 'length', label: 'Length', placeholder: '40' },
      ];
    }

    // Default measurements for other items
    return [
      { key: 'chest', label: 'Chest/Bust', placeholder: '40' },
      { key: 'waist', label: 'Waist', placeholder: '34' },
      { key: 'shoulder', label: 'Shoulder', placeholder: '18' },
      { key: 'length', label: 'Length', placeholder: '30' },
    ];
  };

  // Get icon for product type
  const getProductIcon = (productType: string) => {
    const normalizedType = productType.toLowerCase();
    if (['shirt', 'kurta', 'kurti', 'kamize'].includes(normalizedType)) return '👔';
    if (['trousers', 'pant', 'pajamas', 'shalwars'].includes(normalizedType)) return '👖';
    if (['blazer', 'jacket', 'west-coat', 'sherwani'].includes(normalizedType)) return '🧥';
    if (['gowne', 'one-pec', 'kaftan'].includes(normalizedType)) return '👗';
    if (['skirts', 'garara', 'sharara'].includes(normalizedType)) return '🩱';
    return '📏';
  };

  // ----------- UI -----------

  // Get unique products that need measurements
  const productsNeedingMeasurements = formData.products?.filter((p: any) =>
    p.category !== 'accessory' && p.type !== 'accessory'
  ) || [];

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ruler className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Measurement Center</h2>
              <p className="text-amber-100 text-sm">Enter measurements for each product</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleGetMeasurements}
              disabled={loading}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all disabled:opacity-50 border border-white/30"
            >
              {loading ? "Loading..." : "Load Saved"}
            </button>
          </div>
        </div>
      </div>

      {!formData.gender ? (
        <div className="bg-amber-100 p-6 rounded-xl text-amber-800 border-2 border-amber-200">
          <p className="text-center font-medium">
            ⚠️ Please select a gender in the Customer Details step to see measurement fields.
          </p>
        </div>
      ) : productsNeedingMeasurements.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-xl text-blue-800 border-2 border-blue-200">
          <p className="text-center font-medium">
            ℹ️ No products added yet. Add products in the previous step to enter measurements.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-amber-200">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b bg-gray-50">
            {productsNeedingMeasurements.map((product: any, index: number) => (
              <button
                key={product.id || index}
                onClick={() => setActiveTab(index)}
                className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-all ${
                  activeTab === index
                    ? 'bg-white text-amber-600 border-b-2 border-amber-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <span className="text-2xl">{getProductIcon(product.id)}</span>
                  <span>{product.name}</span>
                  {product.quantity > 1 && (
                    <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                      ×{product.quantity}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {productsNeedingMeasurements.length > 0 && activeTab < productsNeedingMeasurements.length && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Measurements for {productsNeedingMeasurements[activeTab].name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    All measurements in inches
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {getMeasurementFields(productsNeedingMeasurements[activeTab].id).map((field: any) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.measurements[field.key] || ''}
                          onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none transition-colors pr-16"
                        />
                        <span className="absolute right-3 top-3 text-gray-400 text-sm">
                          inches
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {productsNeedingMeasurements.length > 0 && onNext && (
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-600">
            💡 Tip: Switch tabs to enter measurements for different products
          </div>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Ruler className="w-5 h-5" />
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      )}
    </div>
  );
}