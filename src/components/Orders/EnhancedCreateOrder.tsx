import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

// Product categories based on client requirements
const PRODUCT_CATEGORIES = {
  BOTTOMS: {
    name: 'Bottoms',
    items: ['Trousers', 'Pajamas', 'Shalwars', 'Dhoti', 'Arhems', 'Petticoats', 'Skirts', 'Garara', 'Sharara']
  },
  UPPERS: {
    name: 'Uppers',
    items: ['Shirt', 'Kurta and Kurti', 'Kamize', 'Pathni', 'Jubba', 'Blouse', 'Shrags', 'Gown', 'Kaftan', 'Jacket', 'Froog', 'One Piece']
  },
  WESTCOATS: {
    name: 'Westcoats & Nehru Jackets',
    items: ['West Coat', 'Nehru', 'Shrug']
  },
  BLAZERS: {
    name: 'Blazers, Sherwani & Jackets',
    items: ['Blazer', 'Jothpuri', 'Sherwani', 'Over Coat', 'Trench Coats', 'Jackets']
  },
  ACCESSORIES: {
    name: 'Accessories',
    items: ['Dupatta', 'Shawl', 'Tuxedo Belt', 'Shoes/Sleepers/Sandals/Jutis', 'Safa', 'Katar and Knife', 'Perfume and Attr', 'Broches', 'Tie', 'Bow', 'Muffler', 'Scook', 'Watch', 'Buttons', 'Cufflings', 'Mala', 'Belts', 'Wallets/Bags/Clutches/Purses', 'Rings', 'Ear Rings', 'Necklace', 'Bangles']
  }
};

// Common accessories for different product types
const PRODUCT_ACCESSORIES = {
  'Trousers': ['Two Pocket', 'One Pocket', 'Belt Loops', 'Side Pocket', 'Back Pocket'],
  'Shirt': ['Full Sleeve', 'Half Sleeve', 'Collar Style', 'Button Type', 'Pocket'],
  'Kurta and Kurti': ['Full Sleeve', 'Half Sleeve', 'Collar Style', 'Side Slits'],
  'Blazer': ['One Button', 'Two Button', 'Three Button', 'Peak Lapel', 'Notch Lapel'],
  'Pajamas': ['Elastic Waist', 'Drawstring', 'Side Pocket'],
  'Shalwars': ['Elastic Waist', 'Drawstring', 'Churidar Style'],
  'Skirts': ['A-Line', 'Pencil', 'Pleated', 'Side Zip'],
  'West Coat': ['V-Neck', 'High Neck', 'Button Style'],
  'Sherwani': ['High Neck', 'Band Collar', 'Button Style', 'Churidar Bottom'],
  'Blouse': ['Sleeveless', 'Short Sleeve', 'Back Design', 'Neckline Style']
};

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  gender?: string;
}

interface SelectedProduct {
  id: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
  accessories: string[];
  measurements: Record<string, number>;
  specialInstructions: string;
}

interface OrderData {
  customer: Customer | null;
  products: SelectedProduct[];
  deliveryDate: string;
  trialDate: string;
  urgency: string;
  discount: number;
  discountType: 'percentage' | 'amount';
  advance: number;
  notes: string;
}

const EnhancedCreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Customer search and selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male'
  });

  // Product selection
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productSelection, setProductSelection] = useState<string>('');

  // Order data
  const [orderData, setOrderData] = useState<OrderData>({
    customer: null,
    products: [],
    deliveryDate: '',
    trialDate: '',
    urgency: 'medium',
    discount: 0,
    discountType: 'percentage',
    advance: 0,
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleCustomerCreate = async () => {
    try {
      setLoading(true);
      const response = await apiService.createCustomer(newCustomer);
      if (response.data.success) {
        const createdCustomer = response.data.data;
        setCustomers(prev => [...prev, createdCustomer]);
        setOrderData(prev => ({ ...prev, customer: createdCustomer }));
        setShowCustomerModal(false);
        setNewCustomer({ name: '', phone: '', email: '', gender: 'male' });
        setCurrentStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    if (!selectedCategory || !productSelection) return;

    const newProduct: SelectedProduct = {
      id: `${Date.now()}-${Math.random()}`,
      category: selectedCategory,
      name: productSelection,
      price: 0,
      quantity: 1,
      accessories: [],
      measurements: {},
      specialInstructions: ''
    };

    setOrderData(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));

    setSelectedCategory('');
    setProductSelection('');
  };

  const updateProduct = (productId: string, updates: Partial<SelectedProduct>) => {
    setOrderData(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      )
    }));
  };

  const removeProduct = (productId: string) => {
    setOrderData(prev => ({
      ...prev,
      products: prev.products.filter(product => product.id !== productId)
    }));
  };

  const calculateTotal = () => {
    const subtotal = orderData.products.reduce((sum, product) =>
      sum + (product.price * product.quantity), 0
    );

    let discountAmount = 0;
    if (orderData.discountType === 'percentage') {
      discountAmount = (subtotal * orderData.discount) / 100;
    } else {
      discountAmount = orderData.discount;
    }

    return {
      subtotal,
      discountAmount,
      total: subtotal - discountAmount,
      balance: (subtotal - discountAmount) - orderData.advance
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const { total } = calculateTotal();

      console.log('Order submission started...');
      console.log('Customer:', orderData.customer);
      console.log('Products:', orderData.products);
      console.log('Total calculated:', total);

      // Map product names to valid backend garment types
      const mapProductToGarmentType = (productName: string): string => {
        const mapping: Record<string, string> = {
          'Trousers': 'pant',
          'Pajamas': 'pajama',
          'Shalwars': 'salwar',
          'Dhoti': 'dhoti',
          'Arhems': 'other',
          'Petticoats': 'other',
          'Skirts': 'skirt',
          'Garara': 'other',
          'Sharara': 'other',
          'Shirt': 'shirt',
          'Kurta and Kurti': 'kurta',
          'Kamize': 'kurta',
          'Pathni': 'other',
          'Jubba': 'kurta',
          'Blouse': 'top',
          'Shrags': 'jacket',
          'Gown': 'dress',
          'Kaftan': 'dress',
          'Jacket': 'jacket',
          'Froog': 'other',
          'One Piece': 'dress',
          'West Coat': 'waistcoat',
          'Nehru': 'waistcoat',
          'Shrug': 'jacket',
          'Blazer': 'blazer',
          'Jothpuri': 'suit',
          'Sherwani': 'sherwani',
          'Over Coat': 'coat',
          'Trench Coats': 'coat',
          'Jackets': 'jacket'
        };
        return mapping[productName] || 'other';
      };

      const orderPayload = {
        customer: orderData.customer?._id,
        garments: orderData.products.map(product => ({
          type: mapProductToGarmentType(product.name),
          name: product.name,
          quantity: product.quantity,
          price: product.price,
          specialInstructions: product.specialInstructions || '',
          fit: 'regular'
        })),
        deliveryDate: orderData.deliveryDate,
        trialDate: orderData.trialDate || undefined,
        urgency: orderData.urgency,
        notes: orderData.notes,
        payment: {
          total: total,
          advance: orderData.advance
        }
      };

      console.log('Order payload:', JSON.stringify(orderPayload, null, 2));

      const response = await apiService.createOrder(orderPayload);
      console.log('Order creation response:', response.data);

      if (response.data.success) {
        setSuccess('Order created successfully!');
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !orderData.customer) {
      setError('Please select or create a customer');
      return;
    }
    if (currentStep === 2 && orderData.products.length === 0) {
      setError('Please add at least one product');
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              currentStep >= step
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Step 1: Select Customer</h2>

      {/* Customer Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Customer
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowCustomerModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            New Customer
          </button>
        </div>
      </div>

      {/* Customer List */}
      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredCustomers.map((customer) => (
          <div
            key={customer._id}
            onClick={() => setOrderData(prev => ({ ...prev, customer }))}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
              orderData.customer?._id === customer._id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-gray-600">{customer.phone} • {customer.email}</div>
            {customer.gender && (
              <div className="text-xs text-gray-500 capitalize">{customer.gender}</div>
            )}
          </div>
        ))}
        {filteredCustomers.length === 0 && customerSearch && (
          <div className="p-4 text-center text-gray-500">
            No customers found. Click "New Customer" to create one.
          </div>
        )}
      </div>

      {/* Selected Customer */}
      {orderData.customer && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900">Selected Customer:</h4>
          <div className="text-blue-800">{orderData.customer.name}</div>
          <div className="text-sm text-blue-600">
            {orderData.customer.phone} • {orderData.customer.email}
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Customer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="text"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={newCustomer.gender}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomerCreate}
                disabled={!newCustomer.name || !newCustomer.phone || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Continue with renderStep2, renderStep3, renderStep4...
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Step 2: Select Products</h2>

      {/* Gender Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedGender('male')}
            className={`px-4 py-2 rounded-md ${
              selectedGender === 'male'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setSelectedGender('female')}
            className={`px-4 py-2 rounded-md ${
              selectedGender === 'female'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setProductSelection('');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Category</option>
          {Object.entries(PRODUCT_CATEGORIES).map(([key, category]) => (
            <option key={key} value={key}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Product Selection */}
      {selectedCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
          <div className="flex gap-2">
            <select
              value={productSelection}
              onChange={(e) => setProductSelection(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Product</option>
              {PRODUCT_CATEGORIES[selectedCategory as keyof typeof PRODUCT_CATEGORIES].items.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <button
              onClick={addProduct}
              disabled={!productSelection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Selected Products */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Selected Products ({orderData.products.length})</h3>
        {orderData.products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.category}</p>
              </div>
              <button
                onClick={() => removeProduct(product.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => updateProduct(product.id, { quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Accessories */}
            {PRODUCT_ACCESSORIES[product.name] && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Accessories</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PRODUCT_ACCESSORIES[product.name].map((accessory) => (
                    <label key={accessory} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={product.accessories.includes(accessory)}
                        onChange={(e) => {
                          const accessories = e.target.checked
                            ? [...product.accessories, accessory]
                            : product.accessories.filter(a => a !== accessory);
                          updateProduct(product.id, { accessories });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{accessory}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea
                value={product.specialInstructions}
                onChange={(e) => updateProduct(product.id, { specialInstructions: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements for this product..."
              />
            </div>
          </div>
        ))}

        {orderData.products.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No products selected. Add products to continue.
          </div>
        )}
      </div>
    </div>
  );

  // Step 3 and 4 will be in the next part due to length...
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Step 3: Measurements & Details</h2>

      <div className="space-y-6">
        {orderData.products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-4">{product.name} - Measurements</h4>

            {/* Basic measurements for all products */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Chest/Bust', 'Waist', 'Length', 'Shoulder', 'Sleeve'].map((measurement) => (
                <div key={measurement}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {measurement} (inches)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={product.measurements[measurement] || ''}
                    onChange={(e) => {
                      const measurements = {
                        ...product.measurements,
                        [measurement]: parseFloat(e.target.value) || 0
                      };
                      updateProduct(product.id, { measurements });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Additional measurements based on product type */}
            {(product.name.toLowerCase().includes('trouser') || product.name.toLowerCase().includes('pant')) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {['Hip', 'Thigh', 'Inseam', 'Outseam'].map((measurement) => (
                  <div key={measurement}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {measurement} (inches)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={product.measurements[measurement] || ''}
                      onChange={(e) => {
                        const measurements = {
                          ...product.measurements,
                          [measurement]: parseFloat(e.target.value) || 0
                        };
                        updateProduct(product.id, { measurements });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const { subtotal, discountAmount, total, balance } = calculateTotal();

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 4: Order Summary & Payment</h2>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Order Summary</h3>
          <div className="space-y-3">
            {orderData.products.map((product) => (
              <div key={product.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{product.name}</span>
                  <span className="text-gray-600 ml-2">x{product.quantity}</span>
                </div>
                <span>₹{(product.price * product.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date *</label>
            <input
              type="date"
              value={orderData.deliveryDate}
              onChange={(e) => setOrderData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trial Date (Optional)</label>
            <input
              type="date"
              value={orderData.trialDate}
              onChange={(e) => setOrderData(prev => ({ ...prev, trialDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              max={orderData.deliveryDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <select
            value={orderData.urgency}
            onChange={(e) => setOrderData(prev => ({ ...prev, urgency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Discount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
            <select
              value={orderData.discountType}
              onChange={(e) => setOrderData(prev => ({ ...prev, discountType: e.target.value as 'percentage' | 'amount' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="amount">Fixed Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount {orderData.discountType === 'percentage' ? '(%)' : '(₹)'}
            </label>
            <input
              type="number"
              min="0"
              max={orderData.discountType === 'percentage' ? 100 : subtotal}
              value={orderData.discount}
              onChange={(e) => setOrderData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Advance Payment (₹)</label>
            <input
              type="number"
              min="0"
              max={total}
              value={orderData.advance}
              onChange={(e) => setOrderData(prev => ({ ...prev, advance: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
          <textarea
            value={orderData.notes}
            onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional instructions or notes..."
          />
        </div>

        {/* Payment Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Payment Summary</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-medium">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Advance Payment:</span>
              <span className="font-medium text-green-600">₹{orderData.advance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span>Balance Due:</span>
              <span className="font-medium text-red-600">₹{balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
            <p className="mt-2 text-sm text-gray-600">
              Complete order creation process
            </p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Orders
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !orderData.deliveryDate}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedCreateOrder;