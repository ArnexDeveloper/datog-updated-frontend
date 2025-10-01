import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import CustomSelect from '../Employees/CustomSelect';
import { apiService } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import './OrderStepper.css';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface Fabric {
  _id: string;
  name: string;
  type: string;
  color: string;
  pricePerUnit: number;
  unit: string;
  availableStock: number;
}

interface Measurement {
  _id: string;
  customer: {
    _id: string;
    name: string;
  };
  garmentType: string;
  measurements: Record<string, number>;
}

interface Garment {
  type: string;
  name: string;
  quantity: number;
  fabric: string;
  fabricUsed: number;
  fit: string;
  style: string;
  specialInstructions: string;
  price: number;
  measurements?: string;
}

interface OrderData {
  customer: string;
  garments: Garment[];
  deliveryDate: string;
  urgency: string;
  notes: string;
  payment: {
    total: number;
    advance: number;
  };
}

interface OrderStepperProps {
  order?: any;
  onSubmit: (orderData: OrderData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
  title: string;
  description: string;
}

const StepIndicator: React.FC<StepProps> = ({ isActive, isCompleted, stepNumber, title, description }) => (
  <div className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
    <div className="step-number">
      {isCompleted ? '✓' : stepNumber}
    </div>
    <div className="step-content">
      <div className="step-title">{title}</div>
      <div className="step-description">{description}</div>
    </div>
  </div>
);

const garmentTypes = [
  'shirt', 'pant', 'suit', 'blazer', 'kurta', 'pajama', 'sherwani',
  'lehenga', 'saree_blouse', 'dress', 'skirt', 'top', 'jacket',
  'coat', 'waistcoat', 'dhoti', 'churidar', 'salwar', 'dupatta', 'other'
];

const OrderStepper: React.FC<OrderStepperProps> = ({ order, onSubmit, onCancel, loading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [orderData, setOrderData] = useState<OrderData>({
    customer: order?.customer?._id || order?.customer || '',
    garments: order?.garments || [{
      type: 'shirt',
      name: '',
      quantity: 1,
      fabric: '',
      fabricUsed: 0,
      fit: 'regular',
      style: '',
      specialInstructions: '',
      price: 0
    }],
    deliveryDate: order?.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
    urgency: order?.urgency || 'medium',
    notes: order?.notes || '',
    payment: {
      total: order?.payment?.total || 0,
      advance: order?.payment?.advance || 0
    }
  });

  const { actions } = useNotifications();
  const showNotification = (message: string, type: string) => {
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadFabrics();
    loadMeasurements();
  }, []);

  useEffect(() => {
    // Calculate total price when garments change
    const total = orderData.garments.reduce((sum, garment) => sum + (garment.price * garment.quantity), 0);
    setOrderData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        total
      }
    }));
  }, [orderData.garments]);

  const loadCustomers = async () => {
    try {
      const response = await apiService.getCustomers({ isActive: 'true', limit: 100 });
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadFabrics = async () => {
    try {
      const response = await apiService.getFabrics({ limit: 200 });
      if (response.data.success) {
        setFabrics(response.data.data);
      }
    } catch (err) {
      console.error('Error loading fabrics:', err);
    }
  };

  const loadMeasurements = async () => {
    try {
      const response = await apiService.getMeasurements({ limit: 200 });
      if (response.data.success) {
        setMeasurements(response.data.data);
      }
    } catch (err) {
      console.error('Error loading measurements:', err);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!orderData.customer) {
          newErrors.customer = 'Please select a customer';
        }
        if (!orderData.deliveryDate) {
          newErrors.deliveryDate = 'Please select a delivery date';
        } else if (new Date(orderData.deliveryDate) <= new Date()) {
          newErrors.deliveryDate = 'Delivery date must be in the future';
        }
        break;

      case 2:
        orderData.garments.forEach((garment, index) => {
          if (!garment.name.trim()) {
            newErrors[`garment_${index}_name`] = 'Garment name is required';
          }
          if (garment.quantity < 1) {
            newErrors[`garment_${index}_quantity`] = 'Quantity must be at least 1';
          }
          if (garment.price < 0) {
            newErrors[`garment_${index}_price`] = 'Price cannot be negative';
          }
        });
        if (orderData.garments.length === 0) {
          newErrors.garments = 'At least one garment is required';
        }
        break;

      case 3:
        if (orderData.payment.advance < 0) {
          newErrors.advance = 'Advance payment cannot be negative';
        }
        if (orderData.payment.advance > orderData.payment.total) {
          newErrors.advance = 'Advance payment cannot exceed total amount';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep(3)) {
      try {
        await onSubmit(orderData);
      } catch (error) {
        console.error('Error submitting order:', error);
      }
    }
  };

  const addGarment = () => {
    setOrderData(prev => ({
      ...prev,
      garments: [
        ...prev.garments,
        {
          type: 'shirt',
          name: '',
          quantity: 1,
          fabric: '',
          fabricUsed: 0,
          fit: 'regular',
          style: '',
          specialInstructions: '',
          price: 0
        }
      ]
    }));
  };

  const removeGarment = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      garments: prev.garments.filter((_, i) => i !== index)
    }));
  };

  const updateGarment = (index: number, field: keyof Garment, value: any) => {
    setOrderData(prev => ({
      ...prev,
      garments: prev.garments.map((garment, i) =>
        i === index ? { ...garment, [field]: value } : garment
      )
    }));
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Order Details';
      case 2: return 'Garments';
      case 3: return 'Payment & Notes';
      case 4: return 'Review & Submit';
      default: return '';
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Order Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="form-row">
          <div className="form-group">
            <Label htmlFor="customer">Customer *</Label>
            <CustomSelect
              value={orderData.customer}
              onValueChange={(value) => setOrderData(prev => ({ ...prev, customer: value }))}
              options={[
                { value: '', label: 'Select Customer' },
                ...customers.map(customer => ({
                  value: customer._id,
                  label: `${customer.name} - ${customer.phone}`
                }))
              ]}
              placeholder="Select Customer"
            />
            {errors.customer && <span className="error-text">{errors.customer}</span>}
          </div>

          <div className="form-group">
            <Label htmlFor="deliveryDate">Delivery Date *</Label>
            <Input
              type="date"
              id="deliveryDate"
              value={orderData.deliveryDate}
              onChange={(e) => setOrderData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
            />
            {errors.deliveryDate && <span className="error-text">{errors.deliveryDate}</span>}
          </div>

          <div className="form-group">
            <Label htmlFor="urgency">Urgency</Label>
            <CustomSelect
              value={orderData.urgency}
              onValueChange={(value) => setOrderData(prev => ({ ...prev, urgency: value }))}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
              placeholder="Select urgency"
            />
          </div>
        </div>

        {orderData.customer && (
          <div className="customer-info">
            <h4>Selected Customer Information</h4>
            {(() => {
              const selectedCustomer = customers.find(c => c._id === orderData.customer);
              return selectedCustomer ? (
                <div className="customer-details">
                  <p><strong>Name:</strong> {selectedCustomer.name}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Garments</CardTitle>
          <Button type="button" variant="outline" onClick={addGarment}>
            + Add Garment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {orderData.garments.map((garment, index) => (
          <div key={index} className="garment-form">
            <div className="garment-header">
              <h4>Garment {index + 1}</h4>
              {orderData.garments.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeGarment(index)}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <Label>Type *</Label>
                <CustomSelect
                  value={garment.type}
                  onValueChange={(value) => updateGarment(index, 'type', value)}
                  options={garmentTypes.map(type => ({
                    value: type,
                    label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
                  }))}
                  placeholder="Select type"
                />
              </div>

              <div className="form-group">
                <Label>Name *</Label>
                <Input
                  type="text"
                  value={garment.name}
                  onChange={(e) => updateGarment(index, 'name', e.target.value)}
                  placeholder="Enter garment name"
                />
                {errors[`garment_${index}_name`] && (
                  <span className="error-text">{errors[`garment_${index}_name`]}</span>
                )}
              </div>

              <div className="form-group">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min="1"
                  value={garment.quantity}
                  onChange={(e) => updateGarment(index, 'quantity', parseInt(e.target.value) || 1)}
                />
                {errors[`garment_${index}_quantity`] && (
                  <span className="error-text">{errors[`garment_${index}_quantity`]}</span>
                )}
              </div>

              <div className="form-group">
                <Label>Price *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={garment.price}
                  onChange={(e) => updateGarment(index, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="Enter price"
                />
                {errors[`garment_${index}_price`] && (
                  <span className="error-text">{errors[`garment_${index}_price`]}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Label>Fabric</Label>
                <CustomSelect
                  value={garment.fabric}
                  onValueChange={(value) => updateGarment(index, 'fabric', value)}
                  options={[
                    { value: '', label: 'Select Fabric' },
                    ...fabrics.map(fabric => ({
                      value: fabric._id,
                      label: `${fabric.name} - ${fabric.type} (${fabric.color}) - ₹${fabric.pricePerUnit}/${fabric.unit}`
                    }))
                  ]}
                  placeholder="Select fabric"
                />
              </div>

              <div className="form-group">
                <Label>Measurements</Label>
                <CustomSelect
                  value={garment.measurements || ''}
                  onValueChange={(value) => updateGarment(index, 'measurements', value)}
                  options={[
                    { value: '', label: 'Select Measurements' },
                    ...measurements
                      .filter(m => m.customer._id === orderData.customer)
                      .map(measurement => ({
                        value: measurement._id,
                        label: `${measurement.customer.name} - ${measurement.garmentType}`
                      }))
                  ]}
                  placeholder="Select measurements"
                />
              </div>

              <div className="form-group">
                <Label>Fit</Label>
                <CustomSelect
                  value={garment.fit}
                  onValueChange={(value) => updateGarment(index, 'fit', value)}
                  options={[
                    { value: 'slim', label: 'Slim' },
                    { value: 'regular', label: 'Regular' },
                    { value: 'loose', label: 'Loose' },
                    { value: 'custom', label: 'Custom' }
                  ]}
                  placeholder="Select fit"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Label>Fabric Used (meters)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={garment.fabricUsed}
                  onChange={(e) => updateGarment(index, 'fabricUsed', parseFloat(e.target.value) || 0)}
                  placeholder="Enter fabric used"
                />
              </div>

              <div className="form-group">
                <Label>Style</Label>
                <Input
                  type="text"
                  value={garment.style}
                  onChange={(e) => updateGarment(index, 'style', e.target.value)}
                  placeholder="Enter style details"
                />
              </div>
            </div>

            <div className="form-group">
              <Label>Special Instructions</Label>
              <textarea
                value={garment.specialInstructions}
                onChange={(e) => updateGarment(index, 'specialInstructions', e.target.value)}
                rows={2}
                placeholder="Any special instructions for this garment..."
                className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none rounded-md"
              />
            </div>
          </div>
        ))}

        {errors.garments && <span className="error-text">{errors.garments}</span>}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Payment & Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="form-row">
          <div className="form-group">
            <Label>Total Amount</Label>
            <Input
              type="number"
              value={orderData.payment.total}
              readOnly
              className="readonly-field"
            />
          </div>

          <div className="form-group">
            <Label>Advance Payment</Label>
            <Input
              type="number"
              min="0"
              max={orderData.payment.total}
              value={orderData.payment.advance}
              onChange={(e) => setOrderData(prev => ({
                ...prev,
                payment: { ...prev.payment, advance: parseFloat(e.target.value) || 0 }
              }))}
              placeholder="Enter advance amount"
            />
            {errors.advance && <span className="error-text">{errors.advance}</span>}
          </div>

          <div className="form-group">
            <Label>Remaining Amount</Label>
            <Input
              type="number"
              value={orderData.payment.total - orderData.payment.advance}
              readOnly
              className="readonly-field"
            />
          </div>
        </div>

        <div className="form-group">
          <Label>Order Notes</Label>
          <textarea
            value={orderData.notes}
            onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            placeholder="Any additional notes or special requirements for this order..."
            className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none rounded-md"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Review Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="review-section">
          <h4>Customer Information</h4>
          {(() => {
            const selectedCustomer = customers.find(c => c._id === orderData.customer);
            return selectedCustomer ? (
              <div className="review-details">
                <p><strong>Name:</strong> {selectedCustomer.name}</p>
                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                <p><strong>Email:</strong> {selectedCustomer.email}</p>
              </div>
            ) : null;
          })()}
        </div>

        <div className="review-section">
          <h4>Order Details</h4>
          <div className="review-details">
            <p><strong>Delivery Date:</strong> {new Date(orderData.deliveryDate).toLocaleDateString()}</p>
            <p><strong>Urgency:</strong> <Badge variant="outline">{orderData.urgency.toUpperCase()}</Badge></p>
          </div>
        </div>

        <div className="review-section">
          <h4>Garments ({orderData.garments.length})</h4>
          <div className="garments-review">
            {orderData.garments.map((garment, index) => (
              <div key={index} className="garment-review-item">
                <div className="garment-summary">
                  <h5>{garment.name} ({garment.type})</h5>
                  <p>Quantity: {garment.quantity} × ₹{garment.price} = ₹{garment.quantity * garment.price}</p>
                  {garment.fabric && (
                    <p className="fabric-info">
                      Fabric: {fabrics.find(f => f._id === garment.fabric)?.name || 'Selected'}
                    </p>
                  )}
                  {garment.specialInstructions && (
                    <p className="instructions">Instructions: {garment.specialInstructions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="review-section">
          <h4>Payment Summary</h4>
          <div className="payment-summary">
            <div className="payment-row">
              <span>Total Amount:</span>
              <span className="amount">₹{orderData.payment.total}</span>
            </div>
            <div className="payment-row">
              <span>Advance Payment:</span>
              <span className="amount">₹{orderData.payment.advance}</span>
            </div>
            <div className="payment-row final">
              <span>Remaining Amount:</span>
              <span className="amount">₹{orderData.payment.total - orderData.payment.advance}</span>
            </div>
          </div>
        </div>

        {orderData.notes && (
          <div className="review-section">
            <h4>Additional Notes</h4>
            <p className="notes">{orderData.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="order-stepper">
      {/* Step Indicators */}
      <div className="steps-header">
        <StepIndicator
          isActive={currentStep === 1}
          isCompleted={currentStep > 1}
          stepNumber={1}
          title="Order Details"
          description="Customer and delivery information"
        />
        <StepIndicator
          isActive={currentStep === 2}
          isCompleted={currentStep > 2}
          stepNumber={2}
          title="Garments"
          description="Add garments and specifications"
        />
        <StepIndicator
          isActive={currentStep === 3}
          isCompleted={currentStep > 3}
          stepNumber={3}
          title="Payment & Notes"
          description="Payment details and notes"
        />
        <StepIndicator
          isActive={currentStep === 4}
          isCompleted={false}
          stepNumber={4}
          title="Review"
          description="Review and submit order"
        />
      </div>

      {/* Step Content */}
      <div className="step-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation */}
      <div className="step-navigation">
        <div className="nav-left">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious} disabled={loading}>
              Previous
            </Button>
          )}
        </div>

        <div className="nav-right">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>

          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={loading}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  {order ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                order ? 'Update Order' : 'Create Order'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStepper;