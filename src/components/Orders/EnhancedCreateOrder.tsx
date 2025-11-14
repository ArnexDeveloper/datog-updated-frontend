import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShoppingBag, User, Check, Calendar, DollarSign } from 'lucide-react';
import { apiService } from '../../services/api';

const PRODUCT_CATEGORIES = {
  BOTTOMS: {
    name: 'Bottoms',
    items: ['Trousers', 'Pajamas', 'Shalwars', 'Dhoti', 'Arhems', 'Petticoats', 'Skirts', 'Garara', 'Sharara'],
    icon: '👖'
  },
  UPPERS: {
    name: 'Uppers',
    items: ['Shirt', 'Kurta and Kurti', 'Kamize', 'Pathni', 'Jubba', 'Blouse', 'Shrags', 'Gown', 'Kaftan', 'Jacket', 'Froog', 'One Piece'],
    icon: '👔'
  },
  WESTCOATS: {
    name: 'Westcoats & Nehru Jackets',
    items: ['West Coat', 'Nehru', 'Shrug'],
    icon: '🦺'
  },
  BLAZERS: {
    name: 'Blazers, Sherwani & Jackets',
    items: ['Blazer', 'Jothpuri', 'Sherwani', 'Over Coat', 'Trench Coats', 'Jackets'],
    icon: '🧥'
  },
  ACCESSORIES: {
    name: 'Accessories',
    items: ['Dupatta', 'Shawl', 'Tuxedo Belt', 'Shoes/Sleepers/Sandals/Jutis', 'Safa', 'Katar and Knife', 'Perfume and Attr', 'Broches', 'Tie', 'Bow', 'Muffler', 'Scook', 'Watch', 'Buttons', 'Cufflings', 'Mala', 'Belts', 'Wallets/Bags/Clutches/Purses', 'Rings', 'Ear Rings', 'Necklace', 'Bangles'],
    icon: '👜'
  }
};

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

const MEASUREMENT_FIELDS = {
  'Shirt': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'],
  'Kurta and Kurti': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'],
  'Trousers': ['Waist', 'Hip', 'Length', 'Inseam', 'Thigh'],
  'Pajamas': ['Waist', 'Hip', 'Length'],
  'Shalwars': ['Waist', 'Hip', 'Length'],
  'Blazer': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'],
  'Sherwani': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'],
  'West Coat': ['Chest', 'Waist', 'Shoulder', 'Length'],
  'Gown': ['Bust', 'Waist', 'Hip', 'Shoulder', 'Length'],
  'Skirts': ['Waist', 'Hip', 'Length']
};

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  gender?: string;
}

interface Fabric {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  fabricSource: 'lounge' | 'customer';
  fabric: string;
  fabricUsed: number;
  customerFabricDetails: {
    description: string;
    type: string;
    color: string;
    quantity: number;
  };
  accessories: string[];
  measurements: Record<string, number>;
  specialInstructions: string;
}

const EnhancedCreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<'customer' | 'products' | 'finalize'>('customer');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProductType, setActiveProductType] = useState<string | null>(null);
  const [activeProductInstance, setActiveProductInstance] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [trialDate, setTrialDate] = useState('');
  const [advance, setAdvance] = useState(0);
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data from API
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    dateOfBirth: ''
  });

  useEffect(() => {
    loadCustomers();
    loadFabrics();
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

  const loadFabrics = async () => {
    try {
      const response = await apiService.getFabrics({ limit: 100 });
      if (response.data.success) {
        setFabrics(response.data.data);
      }
    } catch (err) {
      console.error('Error loading fabrics:', err);
    }
  };

  const handleCustomerCreate = async () => {
    try {
      setLoading(true);
      const response = await apiService.createCustomer(newCustomer);
      if (response.data.success) {
        const createdCustomer = response.data.data;
        setCustomers(prev => [...prev, createdCustomer]);
        setCustomer(createdCustomer);
        setShowCustomerModal(false);
        setNewCustomer({ name: '', phone: '', email: '', gender: 'male', dateOfBirth: '' });
        setMainTab('products');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const getAllProducts = () => {
    const allProducts: Array<{ name: string; category: string; categoryName: string }> = [];
    Object.entries(PRODUCT_CATEGORIES).forEach(([categoryKey, category]) => {
      category.items.forEach(item => {
        allProducts.push({
          name: item,
          category: categoryKey,
          categoryName: category.name
        });
      });
    });
    return allProducts;
  };

  const filteredProducts = selectedCategory
    ? PRODUCT_CATEGORIES[selectedCategory as keyof typeof PRODUCT_CATEGORIES].items.filter(item =>
        item.toLowerCase().includes(productSearch.toLowerCase())
      )
    : getAllProducts().filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      );

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.name]) {
      acc[product.name] = [];
    }
    acc[product.name].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const selectCustomer = (c: Customer) => {
    setCustomer(c);
    setMainTab('products');
  };

  const addProduct = (productName: string, categoryKey: string) => {
    const newProduct: Product = {
      id: `${Date.now()}-${Math.random()}`,
      name: productName,
      category: categoryKey,
      price: 0,
      quantity: 1,
      fabricSource: 'lounge',
      fabric: '',
      fabricUsed: 0,
      customerFabricDetails: {
        description: '',
        type: '',
        color: '',
        quantity: 0
      },
      accessories: [],
      measurements: {},
      specialInstructions: ''
    };

    setProducts([...products, newProduct]);
    setActiveProductType(productName);
    setActiveProductInstance(newProduct.id);
    setSelectedCategory('');
    setProductSearch('');
  };

  const updateProduct = (productId: string, field: keyof Product, value: any) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, [field]: value } : p
    ));
  };

  const updateProductNested = (productId: string, parent: 'customerFabricDetails', field: string, value: any) => {
    setProducts(products.map(p =>
      p.id === productId ? {
        ...p,
        [parent]: { ...p[parent], [field]: value }
      } : p
    ));
  };

  const removeProduct = (productId: string) => {
    const productToRemove = products.find(p => p.id === productId);
    const remaining = products.filter(p => p.id !== productId);
    setProducts(remaining);

    if (activeProductInstance === productId && productToRemove) {
      const sameTypeProducts = remaining.filter(p => p.name === productToRemove.name);
      if (sameTypeProducts.length > 0) {
        setActiveProductInstance(sameTypeProducts[0].id);
      } else {
        const productTypes = Object.keys(remaining.reduce((acc, p) => {
          acc[p.name] = true;
          return acc;
        }, {} as Record<string, boolean>));

        if (productTypes.length > 0) {
          const firstType = productTypes[0];
          setActiveProductType(firstType);
          const firstInstance = remaining.find(p => p.name === firstType);
          if (firstInstance) setActiveProductInstance(firstInstance.id);
        } else {
          setActiveProductType(null);
          setActiveProductInstance(null);
        }
      }
    }
  };

  const toggleAccessory = (productId: string, accessory: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const accessories = p.accessories.includes(accessory)
          ? p.accessories.filter(a => a !== accessory)
          : [...p.accessories, accessory];
        return { ...p, accessories };
      }
      return p;
    }));
  };

  const updateMeasurement = (productId: string, field: string, value: number) => {
    setProducts(products.map(p =>
      p.id === productId ? {
        ...p,
        measurements: { ...p.measurements, [field]: value }
      } : p
    ));
  };

  const calculateTotal = () => {
    const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    return {
      subtotal,
      total: subtotal,
      balance: subtotal - advance
    };
  };

  const { subtotal, total, balance } = calculateTotal();

  const getProductIcon = (name: string) => {
    if (name.includes('Shirt') || name.includes('Kurta')) return '👔';
    if (name.includes('Trouser') || name.includes('Pajama') || name.includes('Shalwar')) return '👖';
    if (name.includes('Blazer') || name.includes('Sherwani') || name.includes('Jacket')) return '🧥';
    if (name.includes('Gown') || name.includes('Dress')) return '👗';
    if (name.includes('Skirt') || name.includes('Garara') || name.includes('Sharara')) return '🩱';
    if (name.includes('West Coat') || name.includes('Nehru')) return '🦺';
    return '📦';
  };

  const canProceedToFinalize = customer && products.length > 0 && products.every(p => p.price > 0);
  const productTypes = Object.keys(groupedProducts);

  const handleSubmit = async () => {
    if (!deliveryDate) {
      setError('Please select a delivery date');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const mapProductToGarmentType = (productName: string): string => {
        const mapping: Record<string, string> = {
          // Bottoms
          'Trousers': 'pant',
          'Pajamas': 'pajama',
          'Shalwars': 'salwar',
          'Dhoti': 'dhoti',
          'Arhems': 'other',
          'Petticoats': 'other',
          'Skirts': 'skirt',
          'Garara': 'other',
          'Sharara': 'other',
          // Uppers
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
          // Westcoats & Nehru
          'West Coat': 'waistcoat',
          'Nehru': 'waistcoat',
          'Shrug': 'jacket',
          // Blazers & Formal
          'Blazer': 'blazer',
          'Jothpuri': 'suit',
          'Sherwani': 'sherwani',
          'Over Coat': 'coat',
          'Trench Coats': 'coat',
          'Jackets': 'jacket',
          // Accessories
          'Dupatta': 'dupatta',
          'Shawl': 'shawl',
          'Tuxedo Belt': 'belts',
          'Tie': 'tie',
          'Bow': 'bow',
          'Safa': 'safa',
          'Shoes/Sleepers/Sandals/Jutis': 'shoes',
          'Belt': 'belts',
          'Belts': 'belts'
        };
        return mapping[productName] || 'other';
      };

      const orderPayload = {
        customer: customer?._id,
        garments: products.map(product => ({
          type: mapProductToGarmentType(product.name),
          name: product.name,
          quantity: product.quantity,
          price: product.price,
          specialInstructions: product.specialInstructions || '',
          fit: 'regular',
          fabricSource: product.fabricSource,
          accessories: product.accessories || [],
          // Send measurements as inline object (backend will need to handle this)
          // Note: Backend expects ObjectId, but we're sending inline for now
          measurementData: product.measurements && Object.keys(product.measurements).length > 0 ? {
            ...product.measurements,
            garmentType: mapProductToGarmentType(product.name),
            unit: 'inch'
          } : undefined,
          ...(product.fabricSource === 'lounge' && {
            fabric: product.fabric,
            fabricUsed: product.fabricUsed
          }),
          ...(product.fabricSource === 'customer' && {
            customerFabricDetails: product.customerFabricDetails
          })
        })),
        deliveryDate: deliveryDate,
        trialDate: trialDate || undefined,
        urgency: priority,
        notes: notes,
        payment: {
          total: total,
          advance: advance
        }
      };

      console.log('📦 Order Payload being sent:', JSON.stringify(orderPayload, null, 2));

      const response = await apiService.createOrder(orderPayload);

      if (response.data.success) {
        console.log('✅ Order created successfully:', response.data);
        setSuccess('Order created successfully!');
        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Create New Order</h1>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Back to Orders
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setMainTab('customer')}
              disabled={mainTab === 'customer'}
              className={`px-5 py-3 text-sm font-semibold border-b-3 transition-all ${
                mainTab === 'customer'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>1. Customer</span>
                {customer && <Check className="w-3 h-3 text-green-600" />}
              </div>
            </button>

            <button
              onClick={() => customer && setMainTab('products')}
              disabled={!customer}
              className={`px-5 py-3 text-sm font-semibold border-b-3 transition-all ${
                mainTab === 'products'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : customer
                  ? 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>2. Products</span>
                {products.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                    {products.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => canProceedToFinalize && setMainTab('finalize')}
              disabled={!canProceedToFinalize}
              className={`px-5 py-3 text-sm font-semibold border-b-3 transition-all ${
                mainTab === 'finalize'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : canProceedToFinalize
                  ? 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>3. Finalize</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-800">{success}</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* CUSTOMER TAB */}
        {mainTab === 'customer' && (
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-bold mb-4">Select Customer</h2>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredCustomers.map(c => (
                <button
                  key={c._id}
                  onClick={() => selectCustomer(c)}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{c.name}</div>
                      <div className="text-xs text-gray-600">{c.phone}</div>
                      <div className="text-xs text-gray-500 truncate">{c.email}</div>
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setShowCustomerModal(true)}
                className="p-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-blue-600 font-medium text-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Add New Customer</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {mainTab === 'products' && (
          <div className="space-y-4">
            {/* Selected Customer Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-sm text-blue-900">{customer?.name}</span>
                  <span className="text-blue-700 text-xs">{customer?.phone}</span>
                </div>
                <button
                  onClick={() => setMainTab('customer')}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Add Product Section */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-bold mb-3">Add Product</h3>

              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {!productSearch && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                      selectedCategory === ''
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                        selectedCategory === key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                {selectedCategory ? (
                  filteredProducts.map(item => (
                    <button
                      key={item}
                      onClick={() => addProduct(item, selectedCategory)}
                      className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="text-2xl mb-1">{getProductIcon(item)}</div>
                      <div className="text-xs font-medium text-gray-900 line-clamp-2">{item}</div>
                    </button>
                  ))
                ) : (
                  filteredProducts.map(item => (
                    <button
                      key={item.name}
                      onClick={() => addProduct(item.name, item.category)}
                      className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="text-2xl mb-1">{getProductIcon(item.name)}</div>
                      <div className="text-xs font-medium text-gray-900 line-clamp-2">{item.name}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Product Type Tabs with Inner Instance Tabs */}
            {productTypes.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Outer Tabs - Product Types */}
                <div className="flex overflow-x-auto bg-gray-50 border-b">
                  {productTypes.map(productType => (
                    <button
                      key={productType}
                      onClick={() => {
                        setActiveProductType(productType);
                        setActiveProductInstance(groupedProducts[productType][0].id);
                      }}
                      className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-3 transition-all ${
                        activeProductType === productType
                          ? 'border-blue-600 bg-white text-blue-600'
                          : 'border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{getProductIcon(productType)}</span>
                        <span className="text-xs">{productType}</span>
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {groupedProducts[productType].length}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Inner Tabs - Product Instances */}
                {activeProductType && groupedProducts[activeProductType] && (
                  <div>
                    {groupedProducts[activeProductType].length > 1 && (
                      <div className="flex overflow-x-auto bg-blue-50 border-b">
                        {groupedProducts[activeProductType].map((prod, index) => (
                          <button
                            key={prod.id}
                            onClick={() => setActiveProductInstance(prod.id)}
                            className={`flex-shrink-0 px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                              activeProductInstance === prod.id
                                ? 'border-blue-600 bg-white text-blue-600'
                                : 'border-transparent text-gray-600 hover:bg-blue-100'
                            }`}
                          >
                            {activeProductType} #{index + 1}
                            {prod.quantity > 1 && (
                              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                ×{prod.quantity}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Active Product Instance Content */}
                    {(() => {
                      const product = groupedProducts[activeProductType].find(p => p.id === activeProductInstance);
                      if (!product) return null;

                      return (
                        <div key={product.id} className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                              <p className="text-xs text-gray-600">
                                {PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]?.name} • Instance #{groupedProducts[activeProductType].indexOf(product) + 1}
                              </p>
                            </div>
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="px-3 py-1.5 text-xs text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Price and Quantity */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Price (₹) *
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={product.price || ''}
                                  onChange={(e) => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                  placeholder="Enter price"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={product.quantity}
                                  onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Fabric Source */}
                            {product.category !== 'ACCESSORIES' && (
                              <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                                <label className="block text-xs font-semibold text-amber-900 mb-2">
                                  Fabric Source *
                                </label>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 bg-white rounded-lg border hover:border-amber-400 transition-colors">
                                    <input
                                      type="radio"
                                      name={`fabric-${product.id}`}
                                      value="lounge"
                                      checked={product.fabricSource === 'lounge'}
                                      onChange={(e) => updateProduct(product.id, 'fabricSource', e.target.value as 'lounge' | 'customer')}
                                      className="w-4 h-4"
                                    />
                                    <div className="text-xs">
                                      <div className="font-semibold">Lounge</div>
                                    </div>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer p-2 bg-white rounded-lg border hover:border-amber-400 transition-colors">
                                    <input
                                      type="radio"
                                      name={`fabric-${product.id}`}
                                      value="customer"
                                      checked={product.fabricSource === 'customer'}
                                      onChange={(e) => updateProduct(product.id, 'fabricSource', e.target.value as 'lounge' | 'customer')}
                                      className="w-4 h-4"
                                    />
                                    <div className="text-xs">
                                      <div className="font-semibold">Customer</div>
                                    </div>
                                  </label>
                                </div>

                                {product.fabricSource === 'lounge' && (
                                  <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-lg border">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Fabric *
                                      </label>
                                      <select
                                        value={product.fabric}
                                        onChange={(e) => updateProduct(product.id, 'fabric', e.target.value)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                      >
                                        <option value="">Select...</option>
                                        {fabrics.map(f => (
                                          <option key={f._id} value={f._id}>
                                            {f.name} ({f.quantity}m)
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Used (m) *
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={product.fabricUsed || ''}
                                        onChange={(e) => updateProduct(product.id, 'fabricUsed', parseFloat(e.target.value) || 0)}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                        placeholder="2.5"
                                      />
                                    </div>
                                  </div>
                                )}

                                {product.fabricSource === 'customer' && (
                                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs font-semibold text-blue-900 mb-2">
                                      Customer Fabric (Optional)
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={product.customerFabricDetails.description}
                                        onChange={(e) => updateProductNested(product.id, 'customerFabricDetails', 'description', e.target.value)}
                                        placeholder="Description"
                                        className="px-2 py-1.5 text-xs border rounded-lg"
                                      />
                                      <input
                                        type="text"
                                        value={product.customerFabricDetails.type}
                                        onChange={(e) => updateProductNested(product.id, 'customerFabricDetails', 'type', e.target.value)}
                                        placeholder="Type"
                                        className="px-2 py-1.5 text-xs border rounded-lg"
                                      />
                                      <input
                                        type="text"
                                        value={product.customerFabricDetails.color}
                                        onChange={(e) => updateProductNested(product.id, 'customerFabricDetails', 'color', e.target.value)}
                                        placeholder="Color"
                                        className="px-2 py-1.5 text-xs border rounded-lg"
                                      />
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={product.customerFabricDetails.quantity || ''}
                                        onChange={(e) => updateProductNested(product.id, 'customerFabricDetails', 'quantity', parseFloat(e.target.value) || 0)}
                                        placeholder="Quantity (meters)"
                                        className="px-2 py-1.5 text-xs border rounded-lg"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Accessories */}
                            {PRODUCT_ACCESSORIES[product.name as keyof typeof PRODUCT_ACCESSORIES] && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                  Accessories
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                  {PRODUCT_ACCESSORIES[product.name as keyof typeof PRODUCT_ACCESSORIES].map(accessory => (
                                    <label key={accessory} className="flex items-center space-x-1.5 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={product.accessories.includes(accessory)}
                                        onChange={() => toggleAccessory(product.id, accessory)}
                                        className="w-3 h-3"
                                      />
                                      <span className="text-xs font-medium">{accessory}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Measurements */}
                            {MEASUREMENT_FIELDS[product.name as keyof typeof MEASUREMENT_FIELDS] && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">
                                  Measurements (inches)
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                  {MEASUREMENT_FIELDS[product.name as keyof typeof MEASUREMENT_FIELDS].map(field => (
                                    <div key={field}>
                                      <label className="block text-xs text-gray-600 mb-1">{field}</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={product.measurements[field] || ''}
                                        onChange={(e) => updateMeasurement(product.id, field, parseFloat(e.target.value) || 0)}
                                        placeholder="0.0"
                                        className="w-full px-2 py-1.5 text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Special Instructions */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Special Instructions
                              </label>
                              <textarea
                                value={product.specialInstructions}
                                onChange={(e) => updateProduct(product.id, 'specialInstructions', e.target.value)}
                                rows={2}
                                placeholder="Any special requirements..."
                                className="w-full px-3 py-2 text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No products added yet. Select products above to continue.</p>
              </div>
            )}

            {/* Continue Button */}
            {products.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setMainTab('finalize')}
                  disabled={!canProceedToFinalize}
                  className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Continue to Finalize →
                </button>
              </div>
            )}
          </div>
        )}

        {/* FINALIZE TAB */}
        {mainTab === 'finalize' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-bold mb-3">Customer Details</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{customer?.name}</div>
                    <div className="text-xs text-gray-600">{customer?.phone}</div>
                    <div className="text-xs text-gray-500">{customer?.email}</div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-bold mb-3">Order Summary</h3>
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getProductIcon(product.name)}</span>
                          <div>
                            <div className="font-semibold text-sm">{product.name}</div>
                            <div className="text-xs text-gray-600">Qty: {product.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">₹{(product.price * product.quantity).toFixed(2)}</div>
                          <div className="text-xs text-gray-600">₹{product.price} each</div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Fabric:</span>
                          <span className="ml-1 font-medium capitalize">{product.fabricSource}</span>
                        </div>
                        {product.accessories.length > 0 && (
                          <div>
                            <span className="text-gray-600">Accessories:</span>
                            <span className="ml-1 font-medium">{product.accessories.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold">Delivery Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Delivery Date *
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Order Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Any additional instructions..."
                    className="w-full px-3 py-2 text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 bg-white rounded-lg shadow p-4 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="text-base font-bold">Payment</h3>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 pb-3 border-b">
                  {products.map(product => (
                    <div key={product.id} className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        {product.name} ×{product.quantity}
                      </span>
                      <span className="font-medium">₹{(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="py-3 border-b">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Advance Payment (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={total}
                      value={advance || ''}
                      onChange={(e) => setAdvance(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-xs text-gray-600">Balance Due</span>
                    <span className="text-lg font-bold text-red-600">₹{balance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Checklist */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Customer Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-700">{products.length} Product(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {deliveryDate ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">Delivery Date Set</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        <span className="text-xs font-medium text-gray-500">Set Delivery Date</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Create Order Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!deliveryDate || loading}
                  className="w-full mt-4 px-4 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {loading ? 'Creating...' : 'Create Order'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Review all details before creating
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl lg:max-w-4xl md:max-w-2xl">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Create New Customer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={newCustomer.dateOfBirth}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
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
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-5 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomerCreate}
                disabled={!newCustomer.name || !newCustomer.phone || loading}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCreateOrder;
