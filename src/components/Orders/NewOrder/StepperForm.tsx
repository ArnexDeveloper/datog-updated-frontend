import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Stepper from './Stepper';
import { CustomerDetails, Measurements, ProductSelection, OrderSummary } from './forms';

const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";

export default function StepperForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    gender: '',
    address: '',
    measurements: {} as any,
    products: [] as any[],
    deliveryDate: '',
    advancePayment: 0,
    trialDate: '',
    urgency: 'medium',
    notes: '',
    fabric: '',
    fit: 'regular',
    style: '',
    specialInstructions: ''
  });

  const [savedMeasurements, setSavedMeasurements] = useState({
    male: {
      chest: 42,
      shoulder: 18,
      sleeveLength: 24,
      waist: 36,
      hip: 40,
      inseam: 32,
      shirtLength: 30,
    },
    female: {
      bust: 36,
      waist: 28,
      hip: 38,
      shoulder: 16,
      sleeveLength: 22,
      dressLength: 42,
      armhole: 16,
    }
  });

  const [fabrics, setFabrics] = useState([]);

  const products = [
    { id: '1', name: 'Formal Shirt', price: 45, category: ['mens'], type: 'shirt' },
    { id: '2', name: 'Dress Pant', price: 55, category: ['mens'], type: 'pants' },
    { id: '3', name: 'Suit', price: 200, category: ['mens'], type: 'suit' },
    { id: '4', name: 'Designer Kurta', price: 60, category: ['womens'], type: 'kurta' },
    { id: '5', name: 'Evening Dress', price: 85, category: ['womens'], type: 'dress' },
    { id: '6', name: 'Blouse', price: 40, category: ['womens'], type: 'blouse' },
  ];

  const steps = [
    { id: 0, title: 'Customer Details', icon: '👤' },
    { id: 1, title: 'Products', icon: '🛒' },
    { id: 2, title: 'Measurements', icon: '📏' },
    { id: 3, title: 'Summary', icon: '📄' },
  ];

  // Load fabrics on component mount
  useEffect(() => {
    const loadFabrics = async () => {
      try {
        const response = await axios.get(`${baseURL}/fabrics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.data?.success) {
          setFabrics(response.data.data);
        }
      } catch (error) {
        console.error('Error loading fabrics:', error);
      }
    };
    loadFabrics();
  }, []);

  const createCustomer = async (customerData: any) => {
    try {
      setIsCreatingCustomer(true);
      const response = await axios.post(`${baseURL}/customers`, customerData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('Customer created successfully:', response.data);

      // Update form data with created customer data
      Object.keys(customerData).forEach(key => {
        handleInputChange({
          target: {
            name: key,
            value: customerData[key]
          }
        } as any);
      });

      return response.data.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer. Please try again.');
      return null;
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const validateCustomerForm = () => {
    const requiredFields = ['name', 'phone', 'gender', 'address'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData] || String(formData[field as keyof typeof formData]).trim() === '');

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Validate customer form before proceeding
      if (!validateCustomerForm()) {
        return;
      }

      // Just proceed to next step (customer already created or found)
      setCurrentStep(currentStep + 1);
    }
    else if (currentStep === 1) {
      handleMeasurements();
      setCurrentStep(currentStep + 1);
    }
    else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMeasurementChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: { ...prev.measurements, [name]: value }
    }));
  };

  const handleProductSelect = (product: any) => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        ...product,
        quantity: 1,
        fabric: '',
        fit: 'regular',
        style: '',
        specialInstructions: '',
        measurements: JSON.stringify(formData.measurements)
      }]
    }));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p: any) =>
        p.id === id ? { ...p, quantity } : p
      )
    }));
  };

  const handleProductDetailChange = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p: any) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleRemoveProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((p: any) => p.id !== id)
    }));
  };

  const loadSavedMeasurements = () => {
    if (formData.gender) {
      setFormData(prev => ({
        ...prev,
        measurements: { ...savedMeasurements[formData.gender as keyof typeof savedMeasurements] }
      }));
    }
  };

  const saveMeasurements = () => {
    if (formData.gender) {
      setSavedMeasurements(prev => ({
        ...prev,
        [formData.gender]: { ...formData.measurements }
      }));
      alert('Measurements saved successfully!');
    }
  };

  const calculateTotal = () => {
    return formData.products.reduce((total: number, product: any) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const formatOrderData = () => {
    const garments = formData.products.map((product: any) => ({
      type: product.type,
      name: product.name,
      quantity: product.quantity,
      fabric: product.fabric,
      fabricUsed: 0,
      measurements: product.measurements,
      fit: product.fit,
      style: product.style,
      specialInstructions: product.specialInstructions,
      price: product.price * product.quantity,
      status: 'pending'
    }));

    return {
      customer: formData.id,
      garments,
      orderDate: new Date().toISOString(),
      trialDate: formData.trialDate,
      deliveryDate: formData.deliveryDate,
      urgency: formData.urgency,
      images: [],
      referenceImages: [],
      notes: formData.notes,
      payment: {
        total: calculateTotal(),
        advance: formData.advancePayment
      },
      assignedTo: '',
      status: 'pending'
    };
  };

  const handleSubmitOrder = async () => {
    try {
      const orderData = formatOrderData();
      const response = await axios.post(`${baseURL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      alert('Order submitted successfully!');
      setFormData({
        id: '',
        name: '',
        phone: '',
        email: '',
        gender: '',
        address: '',
        measurements: {},
        products: [],
        deliveryDate: '',
        advancePayment: 0,
        trialDate: '',
        urgency: 'medium',
        notes: '',
        fabric: '',
        fit: 'regular',
        style: '',
        specialInstructions: ''
      });
      setCurrentStep(0);
    } catch (error) {
      console.log(error);
      alert('Error submitting order. Please try again.');
    }
  };

  const handleMeasurements = async () => {
    try {
      const measurementData = {
        customer: localStorage.getItem('id') || formData.id,
        garmentType: 'shirt',
        unit: 'inch',
        chest: formData.measurements.chest || 0,
        waist: formData.measurements.waist || 0,
        shoulder: formData.measurements.shoulder || 0,
        armLength: formData.measurements.sleeveLength || 0,
        shirtLength: formData.measurements.shirtLength || 0,
        neck: formData.measurements.neck || 0,
        notes: formData.notes || ''
      };

      const response = await axios.post(`${baseURL}/measurements`, measurementData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('Measurements saved successfully:', response.data);
      alert('Measurements saved to database!');
    } catch (error) {
      console.log('Error saving measurements:', error);
      alert('Error saving measurements. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CustomerDetails
            formData={formData}
            handleInputChange={handleInputChange}
            onCreateCustomer={createCustomer}
            onNext={(selectedCustomer) => {
              if (selectedCustomer) {
                const { name, phone, email, gender, address, _id } = selectedCustomer;
                setFormData(prev => ({
                  ...prev,
                  id: _id || prev.id,
                  name: name || prev.name,
                  phone: phone || prev.phone,
                  email: email || prev.email,
                  gender: gender || prev.gender,
                  address: address || prev.address,
                }));
                if (_id) {
                  localStorage.setItem('id', _id);
                }
              }
              setCurrentStep(1);
            }}
          />
        );
      case 1:
        return (
          <ProductSelection
            formData={formData}
            products={products}
            handleProductSelect={handleProductSelect}
            handleQuantityChange={handleQuantityChange}
            handleProductDetailChange={handleProductDetailChange}
            handleRemoveProduct={handleRemoveProduct}
            fabrics={fabrics}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <Measurements
            formData={formData}
            handleMeasurementChange={handleMeasurementChange}
            loadSavedMeasurements={loadSavedMeasurements}
            saveMeasurements={saveMeasurements}
            setFormData={setFormData}
            onNext={async () => {
              await handleMeasurements();
              setCurrentStep(3);
            }}
          />
        );
      case 3:
        return (
          <OrderSummary
            formData={formData}
            setFormData={setFormData}
            calculateTotal={calculateTotal}
            handleSubmitOrder={handleSubmitOrder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-200">
        <div className="p-6 sm:p-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">New Tailoring Order</h1>
            <p className="text-amber-700">Complete the steps below to create a new order</p>
          </div>

          {/* Stepper Component */}
          <Stepper steps={steps} currentStep={currentStep} />

          {/* Form content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation: Back only. Next handled inside each step */}
          <div className="flex justify-between pt-6 border-t border-amber-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-5 py-2.5 rounded-lg transition-colors ${currentStep === 0 ? 'text-amber-300 cursor-not-allowed' : 'text-amber-700 hover:bg-amber-100'}`}
            >
              Back
            </button>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}