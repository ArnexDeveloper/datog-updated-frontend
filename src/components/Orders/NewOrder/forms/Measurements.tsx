import React, { useState } from 'react';
import axios from "axios";

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

  // ----------- UI -----------

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-900">Measurements</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleGetMeasurements}
            disabled={loading}
            className="px-4 py-2 bg-amber-200 text-amber-900 rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Saved"}
          </button>

          {onNext && (
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Next"}
            </button>
          )}
        </div>
      </div>

      {!formData.gender ? (
        <div className="bg-amber-100 p-4 rounded-lg text-amber-800 border border-amber-200">
          Please select a gender in the Customer Details step to see measurement fields.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(formData.gender === 'male' ?
            {
              chest: 'Chest (in)',
              shoulder: 'Shoulder (in)',
              sleeveLength: 'Sleeve Length (in)',
              waist: 'Waist (in)',
              hip: 'Hip (in)',
              inseam: 'Inseam (in)',
              shirtLength: 'Shirt Length (in)',
            } :
            {
              bust: 'Bust (in)',
              waist: 'Waist (in)',
              hip: 'Hip (in)',
              shoulder: 'Shoulder (in)',
              sleeveLength: 'Sleeve Length (in)',
              dressLength: 'Dress Length (in)',
              armhole: 'Armhole (in)',
            }
          ).map(([key, label]) => (
            <div key={key} className="bg-amber-50 p-4 rounded-lg border border-amber-100 transition-colors hover:bg-amber-100/50">
              <label className="block text-sm font-medium text-amber-800 mb-2">{label}</label>
              <input
                type="number"
                value={formData.measurements[key] || ''}
                onChange={(e) => handleMeasurementChange(key, e.target.value)}
                className="w-full px-4 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white transition-colors"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}