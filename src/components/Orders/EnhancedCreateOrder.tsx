import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShoppingBag, User, Check, Calendar, DollarSign, Ruler } from 'lucide-react';
import { apiService } from '../../services/api';
import MeasurementGrid, { GridColumn, GridData } from './MeasurementGrid';

// ─── Static data ────────────────────────────────────────────────────────────

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

// Products available for package garments (non-accessories)
const PACKAGE_GARMENT_OPTIONS = [
  { name: 'Trousers', ico: '👖', cat: 'Bottoms', meas: ['Waist', 'Hip', 'Thigh', 'Inseam', 'Length'], accs: ['Two Pocket', 'One Pocket', 'Belt Loops', 'Side Pocket', 'Back Pocket'] },
  { name: 'Pajamas', ico: '👘', cat: 'Bottoms', meas: ['Waist', 'Hip', 'Length'], accs: ['Elastic Waist', 'Drawstring', 'Side Pocket'] },
  { name: 'Shalwars', ico: '👗', cat: 'Bottoms', meas: ['Waist', 'Hip', 'Length'], accs: ['Elastic Waist', 'Drawstring'] },
  { name: 'Skirts', ico: '👗', cat: 'Bottoms', meas: ['Waist', 'Hip', 'Length'], accs: ['A-Line', 'Pencil', 'Pleated', 'Side Zip'] },
  { name: 'Shirt', ico: '👔', cat: 'Uppers', meas: ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'], accs: ['Full Sleeve', 'Half Sleeve', 'Collar Style', 'Button Type', 'Pocket'] },
  { name: 'Kurta and Kurti', ico: '🧥', cat: 'Uppers', meas: ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'], accs: ['Full Sleeve', 'Half Sleeve', 'Collar Style', 'Side Slits'] },
  { name: 'Kamize', ico: '👗', cat: 'Uppers', meas: ['Chest', 'Waist', 'Length', 'Sleeve'], accs: ['Full Sleeve', 'Half Sleeve', 'Collar Style'] },
  { name: 'Blouse', ico: '👚', cat: 'Uppers', meas: ['Chest', 'Waist', 'Shoulder', 'Length'], accs: ['Sleeveless', 'Short Sleeve', 'Back Design', 'Neckline Style'] },
  { name: 'Gown', ico: '👗', cat: 'Uppers', meas: ['Chest', 'Waist', 'Hip', 'Shoulder', 'Length'], accs: ['Sleeveless', 'Embroidery', 'Train'] },
  { name: 'West Coat', ico: '🎩', cat: 'Westcoats', meas: ['Chest', 'Shoulder', 'Length'], accs: ['V-Neck', 'High Neck', 'Button Style'] },
  { name: 'Nehru', ico: '🎩', cat: 'Westcoats', meas: ['Chest', 'Shoulder', 'Length'], accs: ['Pocket', 'Buttons', 'Collar'] },
  { name: 'Blazer', ico: '🥼', cat: 'Blazers', meas: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Neck'], accs: ['One Button', 'Two Button', 'Three Button', 'Peak Lapel', 'Notch Lapel'] },
  { name: 'Jothpuri', ico: '🥼', cat: 'Blazers', meas: ['Chest', 'Shoulder', 'Sleeve', 'Length'], accs: ['One Button', 'Two Button', 'Pocket'] },
  { name: 'Sherwani', ico: '🧣', cat: 'Blazers', meas: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Neck'], accs: ['High Neck', 'Band Collar', 'Button Style', 'Churidar Bottom'] },
  { name: 'Over Coat', ico: '🧥', cat: 'Blazers', meas: ['Chest', 'Shoulder', 'Sleeve', 'Length'], accs: ['Single Breasted', 'Double Breasted', 'Pocket'] },
  { name: 'Jackets', ico: '🥼', cat: 'Blazers', meas: ['Chest', 'Shoulder', 'Sleeve', 'Length'], accs: ['Single Breasted', 'Double Breasted', 'Zip Front', 'Button Front'] },
];

const PRODUCT_ACCESSORIES: Record<string, string[]> = {
  'Trousers': ['Two Pocket', 'One Pocket', 'Belt Loops', 'Side Pocket', 'Back Pocket'],
  'Shirt': ['Full Sleeve', 'Half Sleeve', 'Collar Style', 'Button Type', 'Pocket'],
  'Kurta and Kurti': ['Full Sleeve', 'Half Sleeve', 'Collar Style', 'Side Slits'],
  'Blazer': ['One Button', 'Two Button', 'Three Button', 'Peak Lapel', 'Notch Lapel'],
  'Pajamas': ['Elastic Waist', 'Drawstring', 'Side Pocket'],
  'Shalwars': ['Elastic Waist', 'Drawstring', 'Churidar Style'],
  'Skirts': ['A-Line', 'Pencil', 'Pleated', 'Side Zip'],
  'West Coat': ['V-Neck', 'High Neck', 'Button Style'],
  'Sherwani': ['High Neck', 'Band Collar', 'Button Style', 'Churidar Bottom'],
  'Blouse': ['Sleeveless', 'Short Sleeve', 'Back Design', 'Neckline Style'],
  'Jothpuri': ['One Button', 'Two Button', 'Pocket'],
  'Nehru': ['Pocket', 'Buttons', 'Collar'],
  'Over Coat': ['Single Breasted', 'Double Breasted', 'Pocket'],
  'Jackets': ['Single Breasted', 'Double Breasted', 'Zip Front', 'Button Front'],
  'Kamize': ['Full Sleeve', 'Half Sleeve', 'Collar Style'],
  'Gown': ['Sleeveless', 'Embroidery', 'Train'],
};

const MEASUREMENT_FIELDS: Record<string, string[]> = {
  'Shirt': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'],
  'Kurta and Kurti': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'],
  'Trousers': ['Waist', 'Hip', 'Length', 'Inseam', 'Thigh'],
  'Pajamas': ['Waist', 'Hip', 'Length'],
  'Shalwars': ['Waist', 'Hip', 'Length'],
  'Blazer': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'],
  'Sherwani': ['Chest', 'Waist', 'Shoulder', 'Length', 'Sleeve'],
  'West Coat': ['Chest', 'Waist', 'Shoulder', 'Length'],
  'Gown': ['Bust', 'Waist', 'Hip', 'Shoulder', 'Length'],
  'Skirts': ['Waist', 'Hip', 'Length'],
  'Jothpuri': ['Chest', 'Shoulder', 'Sleeve', 'Length'],
  'Nehru': ['Chest', 'Shoulder', 'Length'],
  'Kamize': ['Chest', 'Waist', 'Length', 'Sleeve'],
  'Over Coat': ['Chest', 'Shoulder', 'Sleeve', 'Length'],
  'Jackets': ['Chest', 'Shoulder', 'Sleeve', 'Length'],
  'Blouse': ['Chest', 'Waist', 'Shoulder', 'Length'],
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Customer {
  _id: string; name: string; phone: string; email: string; gender?: string;
}

interface Fabric {
  _id: string; name: string; quantity: number; unit: string;
}

interface Product {
  id: string; name: string; category: string; price: number; quantity: number;
  fabricSource: 'lounge' | 'customer'; fabric: string; fabricUsed: number;
  customerFabricDetails: { description: string; type: string; color: string; quantity: number };
  accessories: string[]; measurements: Record<string, number>;
  specialInstructions: string; imageUrl?: string;
}

interface PackageGarment {
  id: string; productName: string; productIco: string;
  fabricSource: 'lounge' | 'customer'; fabric: string; fabricUsed: number;
  customerFabricDetails: { description: string; type: string; color: string; quantity: number };
  accessories: string[]; measurements: Record<string, number>; notes: string;
}

interface Package {
  id: string; price: number; quantity: number; garments: PackageGarment[];
}

// ─── Component ───────────────────────────────────────────────────────────────

const EnhancedCreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<'customer' | 'products' | 'measurements' | 'finalize'>('customer');
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
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', gender: 'male', dateOfBirth: '' });

  // ── Measurement state ──
  const [measurementGrid, setMeasurementGrid] = useState<GridData>({});
  const [measurementUnit, setMeasurementUnit] = useState<'inches' | 'cm'>('inches');

  // ── Credit / Points state ──
  const [availablePoints, setAvailablePoints] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [creditToUse, setCreditToUse] = useState(0);

  // ── Package state ──
  const [packages, setPackages] = useState<Package[]>([]);
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [activeGarmentId, setActiveGarmentId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<string[]>([]);
  const [pickerPrice, setPickerPrice] = useState<number>(0);
  const [pickerQty, setPickerQty] = useState<number>(1);

  useEffect(() => { loadCustomers(); loadFabrics(); }, []);

  const loadCustomers = async () => {
    try {
      const r = await apiService.getCustomers({ isActive: 'true', limit: 100 });
      if (r.data.success) setCustomers(r.data.data);
    } catch {}
  };

  const loadFabrics = async () => {
    try {
      const r = await apiService.getFabrics({ limit: 100 });
      if (r.data.success) setFabrics(r.data.data);
    } catch {}
  };

  const handleCustomerCreate = async () => {
    try {
      setLoading(true);
      const r = await apiService.createCustomer(newCustomer);
      if (r.data.success) {
        const c = r.data.data;
        setCustomers(prev => [...prev, c]);
        setCustomer(c);
        setShowCustomerModal(false);
        setNewCustomer({ name: '', phone: '', email: '', gender: 'male', dateOfBirth: '' });
        setMainTab('products');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally { setLoading(false); }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const getAllProducts = () => {
    const all: Array<{ name: string; category: string; categoryName: string }> = [];
    Object.entries(PRODUCT_CATEGORIES).forEach(([key, cat]) => {
      cat.items.forEach(item => all.push({ name: item, category: key, categoryName: cat.name }));
    });
    return all;
  };

  const filteredProducts = selectedCategory
    ? PRODUCT_CATEGORIES[selectedCategory as keyof typeof PRODUCT_CATEGORIES].items.filter(i => i.toLowerCase().includes(productSearch.toLowerCase()))
    : getAllProducts().filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const groupedProducts = products.reduce((acc, p) => {
    if (!acc[p.name]) acc[p.name] = [];
    acc[p.name].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  const selectCustomer = async (c: Customer) => {
    setCustomer(c);
    setPointsToUse(0);
    setCreditToUse(0);
    setMainTab('products');
    try {
      const res = await (apiService as any).getCustomerCredit(c._id);
      if (res.data.success) {
        setAvailablePoints(res.data.data.loyaltyPoints || 0);
        setAvailableCredit(res.data.data.storeCredit || 0);
      }
    } catch { /* non-fatal */ }
  };

  const addProduct = (productName: string, categoryKey: string) => {
    const np: Product = {
      id: `${Date.now()}-${Math.random()}`, name: productName, category: categoryKey,
      price: 0, quantity: 1, fabricSource: 'lounge', fabric: '', fabricUsed: 0,
      customerFabricDetails: { description: '', type: '', color: '', quantity: 0 },
      accessories: [], measurements: {}, specialInstructions: '', imageUrl: ''
    };
    setProducts([...products, np]);
    setActiveProductType(productName);
    setActiveProductInstance(np.id);
    setActivePackageId(null);
    setSelectedCategory('');
    setProductSearch('');
    setPickerOpen(false);
  };

  const updateProduct = (id: string, field: keyof Product, value: any) =>
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));

  const updateProductNested = (id: string, parent: 'customerFabricDetails', field: string, value: any) =>
    setProducts(products.map(p => p.id === id ? { ...p, [parent]: { ...p[parent], [field]: value } } : p));

  const removeProduct = (id: string) => {
    const toRemove = products.find(p => p.id === id);
    const remaining = products.filter(p => p.id !== id);
    setProducts(remaining);
    if (activeProductInstance === id && toRemove) {
      const same = remaining.filter(p => p.name === toRemove.name);
      if (same.length > 0) { setActiveProductInstance(same[0].id); }
      else {
        const types = Object.keys(remaining.reduce((a, p) => { a[p.name] = true; return a; }, {} as Record<string, boolean>));
        if (types.length > 0) { setActiveProductType(types[0]); setActiveProductInstance(remaining.find(p => p.name === types[0])?.id || null); }
        else { setActiveProductType(null); setActiveProductInstance(null); }
      }
    }
  };

  const toggleAccessory = (id: string, acc: string) =>
    setProducts(products.map(p => p.id === id ? { ...p, accessories: p.accessories.includes(acc) ? p.accessories.filter(a => a !== acc) : [...p.accessories, acc] } : p));

  const updateMeasurement = (id: string, field: string, value: number) =>
    setProducts(products.map(p => p.id === id ? { ...p, measurements: { ...p.measurements, [field]: value } } : p));

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => updateProduct(id, 'imageUrl', reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Package handlers ──

  const openPackagePicker = () => {
    setPickerOpen(true);
    setPickerSelected([]);
    setPickerPrice(0);
    setPickerQty(1);
    setActivePackageId(null);
    setActiveProductType(null);
    setActiveProductInstance(null);
    setSelectedCategory('');
  };

  const confirmPackage = () => {
    if (!pickerSelected.length) return;
    const id = 'pkg_' + Date.now();
    const garments: PackageGarment[] = pickerSelected.map(name => {
      const g = PACKAGE_GARMENT_OPTIONS.find(p => p.name === name);
      return {
        id: `g_${name}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        productName: name, productIco: g?.ico || '📦',
        fabricSource: 'lounge', fabric: '', fabricUsed: 0,
        customerFabricDetails: { description: '', type: '', color: '', quantity: 0 },
        accessories: [], measurements: {}, notes: ''
      };
    });
    const pkg: Package = { id, price: pickerPrice, quantity: pickerQty, garments };
    setPackages(prev => [...prev, pkg]);
    setPickerOpen(false);
    setPickerSelected([]);
    setActivePackageId(id);
    setActiveGarmentId(garments[0].id);
    setActiveProductType(null);
    setActiveProductInstance(null);
  };

  const removePackage = (pkgId: string) => {
    setPackages(prev => prev.filter(p => p.id !== pkgId));
    if (activePackageId === pkgId) {
      setActivePackageId(null);
      setActiveGarmentId(null);
      const types = Object.keys(groupedProducts);
      if (types.length > 0) { setActiveProductType(types[0]); setActiveProductInstance(groupedProducts[types[0]][0]?.id || null); }
    }
  };

  const updatePackage = (pkgId: string, field: 'price' | 'quantity', value: any) =>
    setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, [field]: value } : p));

  const updateGarment = (pkgId: string, garmentId: string, field: string, value: any) =>
    setPackages(prev => prev.map(p => p.id !== pkgId ? p : {
      ...p,
      garments: p.garments.map(g => g.id !== garmentId ? g : { ...g, [field]: value })
    }));

  const updateGarmentNested = (pkgId: string, garmentId: string, parent: 'customerFabricDetails', field: string, value: any) =>
    setPackages(prev => prev.map(p => p.id !== pkgId ? p : {
      ...p,
      garments: p.garments.map(g => g.id !== garmentId ? g : { ...g, [parent]: { ...g[parent], [field]: value } })
    }));

  const toggleGarmentAcc = (pkgId: string, garmentId: string, acc: string) =>
    setPackages(prev => prev.map(p => p.id !== pkgId ? p : {
      ...p,
      garments: p.garments.map(g => g.id !== garmentId ? g : {
        ...g, accessories: g.accessories.includes(acc) ? g.accessories.filter(a => a !== acc) : [...g.accessories, acc]
      })
    }));

  const updateGarmentMeasurement = (pkgId: string, garmentId: string, field: string, value: number) =>
    setPackages(prev => prev.map(p => p.id !== pkgId ? p : {
      ...p,
      garments: p.garments.map(g => g.id !== garmentId ? g : { ...g, measurements: { ...g.measurements, [field]: value } })
    }));

  // ── Totals / validation ──

  const calculateTotal = () => {
    const indiv = products.reduce((s, p) => s + (p.price * p.quantity), 0);
    const pkgTotal = packages.reduce((s, p) => s + (p.price * p.quantity), 0);
    const subtotal = indiv + pkgTotal;
    const pointsDiscount = Math.min(pointsToUse, availablePoints); // 1 pt = ₹1
    const creditDiscount = Math.min(creditToUse, availableCredit);
    const balanceDue = Math.max(0, subtotal - pointsDiscount - creditDiscount - advance);
    return { subtotal, total: subtotal, pointsDiscount, creditDiscount, balance: balanceDue };
  };

  const { subtotal, total, pointsDiscount, creditDiscount, balance } = calculateTotal();

  const canProceedToFinalize = customer && (products.length > 0 || packages.length > 0) &&
    products.every(p => p.price > 0) && packages.every(p => p.price > 0);

  const getProductIcon = (name: string) => {
    if (name.includes('Shirt') || name.includes('Kurta')) return '👔';
    if (name.includes('Trouser') || name.includes('Pajama') || name.includes('Shalwar')) return '👖';
    if (name.includes('Blazer') || name.includes('Sherwani') || name.includes('Jacket')) return '🧥';
    if (name.includes('Gown') || name.includes('Dress')) return '👗';
    if (name.includes('Skirt') || name.includes('Garara') || name.includes('Sharara')) return '🩱';
    if (name.includes('West Coat') || name.includes('Nehru')) return '🦺';
    return '📦';
  };

  // Build the flat column list for the measurement grid
  const gridColumns: GridColumn[] = useMemo(() => {
    const cols: GridColumn[] = [];
    packages.forEach((pkg, pkgIdx) => {
      pkg.garments.forEach(g => {
        cols.push({
          id: `pkg_${pkg.id}_${g.id}`,
          garmentName: g.productName,
          garmentIco: g.productIco,
          groupType: 'package',
          packageId: pkg.id,
          packageLabel: pkg.garments.map(x => x.productName).join(' + '),
          groupIndex: pkgIdx,
        });
      });
    });
    products.forEach(p => {
      cols.push({
        id: `indiv_${p.id}`,
        garmentName: p.name,
        garmentIco: getProductIcon(p.name),
        groupType: 'individual',
        groupIndex: packages.length,
      });
    });
    return cols;
  }, [packages, products]); // eslint-disable-line

  const handleGridChange = (colId: string, key: string, value: string) => {
    setMeasurementGrid(prev => ({
      ...prev,
      [colId]: { ...(prev[colId] || {}), [key]: value },
    }));
  };

  const productTypes = Object.keys(groupedProducts);

  // ── Submit ──

  const mapToGarmentType = (name: string): string => {
    const map: Record<string, string> = {
      'Trousers': 'pant', 'Pajamas': 'pajama', 'Shalwars': 'salwar', 'Dhoti': 'dhoti',
      'Arhems': 'other', 'Petticoats': 'other', 'Skirts': 'skirt', 'Garara': 'other', 'Sharara': 'other',
      'Shirt': 'shirt', 'Kurta and Kurti': 'kurta', 'Kamize': 'kurta', 'Pathni': 'other',
      'Jubba': 'kurta', 'Blouse': 'top', 'Shrags': 'jacket', 'Gown': 'dress', 'Kaftan': 'dress',
      'Jacket': 'jacket', 'Froog': 'other', 'One Piece': 'dress',
      'West Coat': 'waistcoat', 'Nehru': 'waistcoat', 'Shrug': 'jacket',
      'Blazer': 'blazer', 'Jothpuri': 'suit', 'Sherwani': 'sherwani',
      'Over Coat': 'coat', 'Trench Coats': 'coat', 'Jackets': 'jacket',
      'Dupatta': 'dupatta', 'Shawl': 'shawl', 'Tuxedo Belt': 'belts', 'Tie': 'tie', 'Bow': 'bow',
      'Safa': 'safa', 'Shoes/Sleepers/Sandals/Jutis': 'shoes', 'Belt': 'belts', 'Belts': 'belts'
    };
    return map[name] || 'other';
  };

  const handleSubmit = async () => {
    if (!deliveryDate) { setError('Please select a delivery date'); return; }
    try {
      setLoading(true);
      setError('');
      const payload = {
        customer: customer?._id,
        garments: products.map(p => {
          const colId = `indiv_${p.id}`;
          const gridMeas = measurementGrid[colId] || {};
          const hasMeas = Object.values(gridMeas).some(v => v !== '' && v !== undefined);
          return {
            type: mapToGarmentType(p.name), name: p.name, quantity: p.quantity, price: p.price,
            specialInstructions: p.specialInstructions || '', fit: 'regular',
            fabricSource: p.fabricSource, accessories: p.accessories || [],
            imageUrl: p.imageUrl || '',
            measurementData: hasMeas
              ? { ...gridMeas, garmentType: mapToGarmentType(p.name), unit: measurementUnit === 'cm' ? 'cm' : 'inch' }
              : undefined,
            ...(p.fabricSource === 'lounge' && { fabric: p.fabric, fabricUsed: p.fabricUsed }),
            ...(p.fabricSource === 'customer' && { customerFabricDetails: p.customerFabricDetails })
          };
        }),
        packages: packages.map(pkg => ({
          packageId: pkg.id, packagePrice: pkg.price, quantity: pkg.quantity,
          garments: pkg.garments.map(g => {
            const colId = `pkg_${pkg.id}_${g.id}`;
            const gridMeas = measurementGrid[colId] || {};
            const hasMeas = Object.values(gridMeas).some(v => v !== '' && v !== undefined);
            return {
              type: mapToGarmentType(g.productName), name: g.productName,
              fabricSource: g.fabricSource, accessories: g.accessories || [],
              notes: g.notes || '',
              measurementData: hasMeas
                ? { ...gridMeas, garmentType: mapToGarmentType(g.productName), unit: measurementUnit === 'cm' ? 'cm' : 'inch' }
                : undefined,
              ...(g.fabricSource === 'lounge' && { fabric: g.fabric, fabricUsed: g.fabricUsed }),
              ...(g.fabricSource === 'customer' && { customerFabricDetails: g.customerFabricDetails })
            };
          })
        })),
        deliveryDate, trialDate: trialDate || undefined, urgency: priority, notes,
        pointsRedeemed: pointsDiscount,
        creditRedeemed: creditDiscount,
        payment: { total, advance }
      };
      const r = await apiService.createOrder(payload);
      if (r.data.success) {
        setSuccess('Order created successfully!');
        setTimeout(() => navigate('/orders'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create order');
    } finally { setLoading(false); }
  };

  // ─── Render helpers ──────────────────────────────────────────────────────

  const renderFabricForm = (
    productId: string, fabricSource: 'lounge' | 'customer', fabric: string, fabricUsed: number,
    custFab: { description: string; type: string; color: string; quantity: number },
    onSource: (v: 'lounge' | 'customer') => void,
    onFabric: (v: string) => void,
    onFabricUsed: (v: number) => void,
    onCustField: (field: string, v: any) => void
  ) => (
    <div className="p-3 rounded-lg" style={{ background: '#fefce8', border: '1px solid #fef9c3' }}>
      <label className="block text-xs font-semibold mb-2" style={{ color: '#92400e' }}>
        Fabric Source <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {(['lounge', 'customer'] as const).map(src => (
          <label key={src}
            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${fabricSource === src ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200 hover:border-amber-300'}`}>
            <input type="radio" name={`fabric-${productId}`} value={src}
              checked={fabricSource === src} onChange={() => onSource(src)} className="w-3 h-3" />
            <span className="text-xs font-medium capitalize">{src === 'lounge' ? 'Lounge Fabric' : "Customer's Fabric"}</span>
          </label>
        ))}
      </div>
      {fabricSource === 'lounge' ? (
        <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-lg border border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fabric *</label>
            <select value={fabric} onChange={e => onFabric(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg">
              <option value="">Select...</option>
              {fabrics.map(f => <option key={f._id} value={f._id}>{f.name} ({f.quantity}m)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Used (m) *</label>
            <input type="number" min="0" step="0.1" value={fabricUsed || ''}
              onChange={e => onFabricUsed(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg" placeholder="2.5" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
          {[['description', 'Description'], ['type', 'Type'], ['color', 'Color']].map(([field, label]) => (
            <input key={field} type="text" placeholder={label}
              value={custFab[field as keyof typeof custFab] as string || ''}
              onChange={e => onCustField(field, e.target.value)}
              className="px-2 py-1.5 text-xs border border-blue-200 rounded-lg bg-white" />
          ))}
          <input type="number" min="0" step="0.1" placeholder="Qty (m)"
            value={custFab.quantity || ''}
            onChange={e => onCustField('quantity', parseFloat(e.target.value) || 0)}
            className="px-2 py-1.5 text-xs border border-blue-200 rounded-lg bg-white" />
        </div>
      )}
    </div>
  );

  // ─── JSX ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Create New Order</h1>
          <button onClick={() => navigate('/orders')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            Back to Orders
          </button>
        </div>
      </div>

      {/* Step tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {([
              { id: 'customer',     label: '1. Customer',     icon: <User className="w-4 h-4" />,     done: !!customer },
              { id: 'products',     label: '2. Products',     icon: <ShoppingBag className="w-4 h-4" />, count: products.length + packages.length, disabled: !customer },
              { id: 'measurements', label: '3. Measurements', icon: <Ruler className="w-4 h-4" />,     disabled: !canProceedToFinalize },
              { id: 'finalize',     label: '4. Finalize',     icon: <Calendar className="w-4 h-4" />,  disabled: !canProceedToFinalize },
            ] as any[]).map(tab => (
              <button key={tab.id}
                onClick={() => !tab.disabled && setMainTab(tab.id as any)}
                disabled={tab.disabled}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${mainTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : tab.disabled ? 'border-transparent text-gray-400 cursor-not-allowed' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.done && !tab.count && <Check className="w-3 h-3 text-green-600" />}
                  {tab.count > 0 && <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">{tab.count}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>
        </div>
      )}
      {success && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{success}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* ─── CUSTOMER TAB ─────────────────────────────────────────────────── */}
        {mainTab === 'customer' && (
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-bold mb-4">Select Customer</h2>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" autoFocus />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredCustomers.map(c => (
                <button key={c._id} onClick={() => selectCustomer(c)}
                  className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-all">
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
              <button onClick={() => setShowCustomerModal(true)}
                className="p-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-blue-600 font-medium text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /><span>Add New Customer</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ─── PRODUCTS TAB ─────────────────────────────────────────────────── */}
        {mainTab === 'products' && (
          <div className="space-y-4">
            {/* Customer bar */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm text-blue-900">{customer?.name}</span>
                <span className="text-blue-700 text-xs">{customer?.phone}</span>
              </div>
              <button onClick={() => setMainTab('customer')} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Change</button>
            </div>

            {/* Add Product section */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-bold mb-3">Add Product</h3>
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* Category filter + Complete Package pill */}
              {!productSearch && (
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                  <button onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    All
                  </button>
                  {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => (
                    <button key={key} onClick={() => setSelectedCategory(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${selectedCategory === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      <span>{cat.icon}</span><span>{cat.name}</span>
                    </button>
                  ))}
                  {/* ── Complete Package pill ── */}
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <button onClick={openPackagePicker}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap"
                    style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>
                    📦 + Complete Package
                  </button>
                </div>
              )}

              {/* Product grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                {selectedCategory ? (
                  (filteredProducts as string[]).map(item => (
                    <button key={item} onClick={() => addProduct(item, selectedCategory)}
                      className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <div className="text-2xl mb-1">{getProductIcon(item)}</div>
                      <div className="text-xs font-medium text-gray-900 line-clamp-2">{item}</div>
                    </button>
                  ))
                ) : (
                  (filteredProducts as Array<{ name: string; category: string; categoryName: string }>).map(item => (
                    <button key={item.name} onClick={() => addProduct(item.name, item.category)}
                      className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <div className="text-2xl mb-1">{getProductIcon(item.name)}</div>
                      <div className="text-xs font-medium text-gray-900 line-clamp-2">{item.name}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Outer tabs: individual types + packages */}
            {(productTypes.length > 0 || packages.length > 0 || pickerOpen) && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Tab bar */}
                <div className="flex overflow-x-auto bg-gray-50 border-b">
                  {/* Individual product type tabs */}
                  {productTypes.map(productType => (
                    <button key={productType}
                      onClick={() => { setActiveProductType(productType); setActiveProductInstance(groupedProducts[productType][0].id); setActivePackageId(null); setPickerOpen(false); }}
                      className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeProductType === productType && !activePackageId && !pickerOpen ? 'border-blue-600 bg-white text-blue-600' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{getProductIcon(productType)}</span>
                        <span className="text-xs">{productType}</span>
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{groupedProducts[productType].length}</span>
                      </div>
                    </button>
                  ))}

                  {/* Package tabs */}
                  {packages.map(pkg => {
                    const label = pkg.garments.map(g => g.productName).join(' + ');
                    const short = label.length > 26 ? label.slice(0, 24) + '…' : label;
                    const isAct = activePackageId === pkg.id && !pickerOpen;
                    return (
                      <button key={pkg.id}
                        onClick={() => { setActivePackageId(pkg.id); setActiveGarmentId(pkg.garments[0]?.id || null); setActiveProductType(null); setActiveProductInstance(null); setPickerOpen(false); }}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap"
                        style={{ borderBottomColor: isAct ? '#f59e0b' : 'transparent', color: isAct ? '#d97706' : '#92400e', background: isAct ? '#fff' : '#fffdf5' }}>
                        📦 {short}
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>PKG</span>
                      </button>
                    );
                  })}

                  {/* Picker tab (while picker is open) */}
                  {pickerOpen && (
                    <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap"
                      style={{ borderBottomColor: '#f59e0b', color: '#d97706', background: '#fffdf5' }}>
                      📦 New Package
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>PKG</span>
                    </div>
                  )}
                </div>

                {/* ── Package picker panel ── */}
                {pickerOpen && (
                  <div>
                    <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                      <span>📦</span>
                      <span className="text-sm font-medium" style={{ color: '#92400e' }}>Building new complete package</span>
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>COMPLETE PACKAGE</span>
                      <span className="text-xs ml-1" style={{ color: '#b45309' }}>· one price for all garments</span>
                    </div>
                    {/* Package price + qty */}
                    <div className="grid grid-cols-2 gap-3 px-4 py-3" style={{ background: '#fffdf9', borderBottom: '1px solid #fde68a' }}>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Package price (₹) <span className="text-red-500">*</span></label>
                        <div className="flex items-center overflow-hidden rounded-md border-2" style={{ borderColor: '#f59e0b' }}>
                          <div className="px-2.5 h-9 flex items-center text-sm font-medium flex-shrink-0"
                            style={{ background: '#fffbeb', color: '#d97706', borderRight: '1px solid #fde68a' }}>₹</div>
                          <input type="number" value={pickerPrice || ''}
                            onChange={e => setPickerPrice(parseFloat(e.target.value) || 0)}
                            className="flex-1 h-9 px-2 text-sm font-medium outline-none border-none bg-white"
                            style={{ color: '#92400e' }} placeholder="Combined price for all garments" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                        <input type="number" min="1" value={pickerQty}
                          onChange={e => setPickerQty(parseInt(e.target.value) || 1)}
                          className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm" />
                      </div>
                    </div>
                    {/* Garment picker grid */}
                    <div className="p-4">
                      <p className="text-xs font-medium text-gray-500 mb-3">🖱️ Select garments to add to this package</p>
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4 max-h-60 overflow-y-auto">
                        {PACKAGE_GARMENT_OPTIONS.map(p => {
                          const sel = pickerSelected.includes(p.name);
                          return (
                            <button key={p.name} type="button"
                              onClick={() => setPickerSelected(prev => sel ? prev.filter(x => x !== p.name) : [...prev, p.name])}
                              className={`border rounded-lg p-2 text-center cursor-pointer transition-all ${sel ? 'border-green-400 bg-green-50 border-2' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}`}>
                              <div className="text-xl mb-1">{p.ico}</div>
                              <div className="text-xs text-gray-700 font-medium leading-tight">{p.name}</div>
                              {sel && <div className="text-xs text-green-700 font-medium mt-1">✓</div>}
                            </button>
                          );
                        })}
                      </div>
                      {/* Selected chips */}
                      <p className="text-xs font-medium text-gray-500 mb-2">Garments in this package</p>
                      <div className="flex flex-wrap gap-2 mb-4 min-h-8 items-center">
                        {pickerSelected.length === 0
                          ? <span className="text-xs text-gray-400">No garments selected — click above to add</span>
                          : pickerSelected.map(name => {
                              const g = PACKAGE_GARMENT_OPTIONS.find(p => p.name === name);
                              return (
                                <span key={name} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-gray-100 border border-gray-200">
                                  {g?.ico} {name}
                                  <button type="button" onClick={() => setPickerSelected(prev => prev.filter(x => x !== name))}
                                    className="text-red-500 hover:text-red-700 ml-0.5 font-bold">×</button>
                                </span>
                              );
                            })}
                      </div>
                      <div className="flex gap-2">
                        <button type="button" disabled={pickerSelected.length === 0} onClick={confirmPackage}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                          ✓ Confirm Package · {pickerSelected.length} garment{pickerSelected.length !== 1 ? 's' : ''}
                        </button>
                        <button type="button"
                          onClick={() => { setPickerOpen(false); setPickerSelected([]); }}
                          className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Active package form ── */}
                {!pickerOpen && activePackageId && (() => {
                  const pkg = packages.find(p => p.id === activePackageId);
                  if (!pkg) return null;
                  const garment = pkg.garments.find(g => g.id === activeGarmentId) || pkg.garments[0];
                  if (!garment) return null;
                  const gDef = PACKAGE_GARMENT_OPTIONS.find(p => p.name === garment.productName);
                  const gIdx = pkg.garments.indexOf(garment);
                  return (
                    <div>
                      {/* Package top bar */}
                      <div className="flex items-center justify-between px-4 py-3" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>📦</span>
                          <span className="font-semibold text-sm" style={{ color: '#92400e' }}>{pkg.garments.map(g => g.productName).join(' + ')}</span>
                          <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>COMPLETE PACKAGE</span>
                          <span className="text-xs" style={{ color: '#b45309' }}>· {pkg.garments.length} garments · one combined price</span>
                        </div>
                        <button type="button" onClick={() => removePackage(pkg.id)}
                          className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 bg-white hover:bg-red-50 flex-shrink-0">
                          Remove package
                        </button>
                      </div>
                      {/* Package price strip */}
                      <div className="grid grid-cols-2 gap-3 px-4 py-3" style={{ background: '#fffdf9', borderBottom: '1px solid #fde68a' }}>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Package price (₹) — one price for all {pkg.garments.length} garments <span className="text-red-500">*</span></label>
                          <div className="flex items-center overflow-hidden rounded-md border-2" style={{ borderColor: '#f59e0b' }}>
                            <div className="px-2.5 h-9 flex items-center text-sm font-medium flex-shrink-0"
                              style={{ background: '#fffbeb', color: '#d97706', borderRight: '1px solid #fde68a' }}>₹</div>
                            <input type="number" value={pkg.price || ''}
                              onChange={e => updatePackage(pkg.id, 'price', parseFloat(e.target.value) || 0)}
                              className="flex-1 h-9 px-2 text-sm font-medium outline-none border-none bg-white"
                              style={{ color: '#92400e' }} placeholder="Enter combined price" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                          <input type="number" min="1" value={pkg.quantity}
                            onChange={e => updatePackage(pkg.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm" />
                        </div>
                      </div>
                      {/* Garment sub-tabs */}
                      <div className="flex overflow-x-auto" style={{ background: '#f9fafb', borderBottom: '1.5px solid #e5e7eb' }}>
                        {pkg.garments.map(g => {
                          const filled = !!(g.fabric || g.customerFabricDetails.description) && (g.accessories.length > 0 || Object.values(g.measurements).some(v => v));
                          const isAct = activeGarmentId === g.id;
                          return (
                            <button key={g.id} type="button"
                              onClick={() => setActiveGarmentId(g.id)}
                              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-r border-gray-200 transition-colors whitespace-nowrap"
                              style={{ color: isAct ? '#2563eb' : '#6b7280', background: isAct ? '#fff' : 'transparent', borderBottom: isAct ? '2.5px solid #2563eb' : '2.5px solid transparent' }}>
                              {g.productIco} {g.productName}
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${filled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                {filled ? 'filled' : 'pending'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {/* Garment form */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{garment.productIco} {garment.productName}</h3>
                            <p className="text-xs text-gray-500">Part of package · garment {gIdx + 1} of {pkg.garments.length}</p>
                          </div>
                        </div>
                        {/* Info notice */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs mb-4"
                          style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
                          ℹ️ Price is set once for the whole package above. Fill fabric, accessories and measurements for each garment tab.
                        </div>
                        <div className="space-y-4">
                          {/* Fabric */}
                          {renderFabricForm(
                            `${pkg.id}_${garment.id}`,
                            garment.fabricSource, garment.fabric, garment.fabricUsed, garment.customerFabricDetails,
                            v => updateGarment(pkg.id, garment.id, 'fabricSource', v),
                            v => updateGarment(pkg.id, garment.id, 'fabric', v),
                            v => updateGarment(pkg.id, garment.id, 'fabricUsed', v),
                            (field, v) => updateGarmentNested(pkg.id, garment.id, 'customerFabricDetails', field, v)
                          )}
                          {/* Accessories */}
                          {gDef && gDef.accs.length > 0 && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">Accessories</label>
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {gDef.accs.map(acc => (
                                  <label key={acc} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                    <input type="checkbox" className="w-3 h-3"
                                      checked={garment.accessories.includes(acc)}
                                      onChange={() => toggleGarmentAcc(pkg.id, garment.id, acc)} />
                                    <span className="text-xs font-medium">{acc}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Measurements */}
                          {gDef && gDef.meas.length > 0 && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">Measurements (inches)</label>
                              <div className="grid grid-cols-5 gap-2">
                                {gDef.meas.map(field => (
                                  <div key={field}>
                                    <label className="block text-xs text-gray-600 mb-1">{field}</label>
                                    <input type="number" step="0.1" min="0" placeholder="—"
                                      value={garment.measurements[field] || ''}
                                      onChange={e => updateGarmentMeasurement(pkg.id, garment.id, field, parseFloat(e.target.value) || 0)}
                                      className="w-full px-2 py-1.5 text-xs border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-right" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Notes */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Special Instructions for {garment.productName}</label>
                            <textarea value={garment.notes} rows={2}
                              onChange={e => updateGarment(pkg.id, garment.id, 'notes', e.target.value)}
                              className="w-full px-3 py-2 text-xs border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                              placeholder="Any special requirements..." />
                          </div>
                          {/* Garment navigation */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <button type="button" disabled={gIdx === 0}
                              onClick={() => setActiveGarmentId(pkg.garments[gIdx - 1]?.id)}
                              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">
                              ← Previous
                            </button>
                            <span className="text-xs text-gray-400">{garment.productName} · {gIdx + 1} of {pkg.garments.length}</span>
                            {gIdx < pkg.garments.length - 1 ? (
                              <button type="button" onClick={() => setActiveGarmentId(pkg.garments[gIdx + 1].id)}
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Next garment →
                              </button>
                            ) : (
                              <button type="button"
                                className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                                ✓ Package complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Individual product instance content ── */}
                {!pickerOpen && !activePackageId && activeProductType && groupedProducts[activeProductType] && (() => {
                  const product = groupedProducts[activeProductType].find(p => p.id === activeProductInstance);
                  if (!product) return null;
                  return (
                    <div>
                      {/* Inner instance tabs */}
                      {groupedProducts[activeProductType].length > 1 && (
                        <div className="flex overflow-x-auto bg-blue-50 border-b">
                          {groupedProducts[activeProductType].map((prod, index) => (
                            <button key={prod.id} onClick={() => setActiveProductInstance(prod.id)}
                              className={`flex-shrink-0 px-4 py-2 text-xs font-medium border-b-2 transition-all ${activeProductInstance === prod.id ? 'border-blue-600 bg-white text-blue-600' : 'border-transparent text-gray-600 hover:bg-blue-100'}`}>
                              {activeProductType} #{index + 1}
                              {prod.quantity > 1 && <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">×{prod.quantity}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Product form */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                            <p className="text-xs text-gray-600">
                              {PRODUCT_CATEGORIES[product.category as keyof typeof PRODUCT_CATEGORIES]?.name} · Instance #{groupedProducts[activeProductType].indexOf(product) + 1}
                            </p>
                          </div>
                          <button onClick={() => removeProduct(product.id)}
                            className="px-3 py-1.5 text-xs text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium">
                            Remove
                          </button>
                        </div>
                        <div className="space-y-4">
                          {/* Price + Qty */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹) *</label>
                              <input type="number" min="0" step="0.01" value={product.price || ''}
                                onChange={e => updateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                placeholder="Enter price" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                              <input type="number" min="1" value={product.quantity}
                                onChange={e => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                            </div>
                          </div>
                          {/* Image */}
                          <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                            <label className="block text-xs font-semibold text-purple-900 mb-2">Product Reference Image</label>
                            <input type="file" accept="image/*"
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(product.id, f); }}
                              className="w-full px-3 py-2 text-xs border border-purple-300 rounded-lg bg-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200" />
                            {product.imageUrl && (
                              <div className="relative mt-2">
                                <img src={product.imageUrl} alt="ref" className="w-full h-40 object-cover rounded-lg border-2 border-purple-300" />
                                <button onClick={() => updateProduct(product.id, 'imageUrl', '')}
                                  className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">Remove</button>
                              </div>
                            )}
                          </div>
                          {/* Fabric */}
                          {product.category !== 'ACCESSORIES' && renderFabricForm(
                            product.id, product.fabricSource, product.fabric, product.fabricUsed, product.customerFabricDetails,
                            v => updateProduct(product.id, 'fabricSource', v),
                            v => updateProduct(product.id, 'fabric', v),
                            v => updateProduct(product.id, 'fabricUsed', v),
                            (field, v) => updateProductNested(product.id, 'customerFabricDetails', field, v)
                          )}
                          {/* Accessories */}
                          {PRODUCT_ACCESSORIES[product.name] && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">Accessories</label>
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {PRODUCT_ACCESSORIES[product.name].map(acc => (
                                  <label key={acc} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                                    <input type="checkbox" checked={product.accessories.includes(acc)}
                                      onChange={() => toggleAccessory(product.id, acc)} className="w-3 h-3" />
                                    <span className="text-xs font-medium">{acc}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Measurements */}
                          {MEASUREMENT_FIELDS[product.name] && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">Measurements (inches)</label>
                              <div className="grid grid-cols-5 gap-2">
                                {MEASUREMENT_FIELDS[product.name].map(field => (
                                  <div key={field}>
                                    <label className="block text-xs text-gray-600 mb-1">{field}</label>
                                    <input type="number" step="0.1" min="0" value={product.measurements[field] || ''} placeholder="0.0"
                                      onChange={e => updateMeasurement(product.id, field, parseFloat(e.target.value) || 0)}
                                      className="w-full px-2 py-1.5 text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Instructions */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Special Instructions</label>
                            <textarea value={product.specialInstructions}
                              onChange={e => updateProduct(product.id, 'specialInstructions', e.target.value)}
                              rows={2} placeholder="Any special requirements..."
                              className="w-full px-3 py-2 text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Empty state when nothing selected */}
                {!pickerOpen && !activePackageId && !activeProductType && (
                  <div className="p-10 text-center text-gray-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a product tab above to fill in details</p>
                  </div>
                )}
              </div>
            )}

            {(productTypes.length === 0 && packages.length === 0 && !pickerOpen) && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No products added yet. Select products above or click <strong className="text-amber-800">+ Complete Package</strong>.</p>
              </div>
            )}

            {(products.length > 0 || packages.length > 0) && (
              <div className="flex justify-end">
                <button onClick={() => setMainTab('measurements')} disabled={!canProceedToFinalize}
                  className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
                  Continue to Measurements →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── MEASUREMENTS TAB ────────────────────────────────────────────── */}
        {mainTab === 'measurements' && (
          <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column' }}>
            {gridColumns.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-400 p-10">
                <Ruler className="w-12 h-12 opacity-30 mb-3" />
                <p className="text-sm">No garments to measure. Go back and add products.</p>
                <button type="button" onClick={() => setMainTab('products')}
                  className="mt-4 px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600">
                  ← Back to Products
                </button>
              </div>
            ) : (
              <MeasurementGrid
                columns={gridColumns}
                grid={measurementGrid}
                unit={measurementUnit}
                customerName={customer?.name || ''}
                onGridChange={handleGridChange}
                onUnitChange={setMeasurementUnit}
                onLoadProfile={() => {/* Future: load from API */}}
                onSaveProfile={() => {/* Future: save to API */}}
                onBack={() => setMainTab('products')}
                onContinue={() => setMainTab('finalize')}
              />
            )}
          </div>
        )}

        {/* ─── FINALIZE TAB ─────────────────────────────────────────────────── */}
        {mainTab === 'finalize' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {/* Customer */}
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
                  {/* Individual products */}
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
                        <div><span className="text-gray-600">Fabric:</span><span className="ml-1 font-medium capitalize">{product.fabricSource}</span></div>
                        {product.accessories.length > 0 && <div><span className="text-gray-600">Accessories:</span><span className="ml-1 font-medium">{product.accessories.length}</span></div>}
                      </div>
                    </div>
                  ))}
                  {/* Packages */}
                  {packages.map(pkg => (
                    <div key={pkg.id} className="rounded-lg border-2 overflow-hidden" style={{ borderColor: '#f59e0b' }}>
                      <div className="flex justify-between items-center px-4 py-3" style={{ background: '#fffbeb' }}>
                        <div className="flex items-center gap-2">
                          <span>📦</span>
                          <span className="font-semibold text-sm" style={{ color: '#92400e' }}>{pkg.garments.map(g => g.productName).join(' + ')}</span>
                          <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>PKG</span>
                        </div>
                        <span className="font-bold text-sm text-amber-900">₹{(pkg.price * pkg.quantity).toFixed(2)}</span>
                      </div>
                      <div className="px-4 py-3 bg-white space-y-1.5">
                        {pkg.garments.map((g, i) => (
                          <div key={g.id} className="flex items-center gap-2 text-xs text-gray-700">
                            <span className="bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 flex-shrink-0 font-medium">{i + 1}</span>
                            <span className="font-medium">{g.productIco} {g.productName}</span>
                            {g.accessories.length > 0 && <span className="text-gray-500">· {g.accessories.join(', ')}</span>}
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 pt-1">Qty: {pkg.quantity} · Package price: ₹{pkg.price}</div>
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Date *</label>
                    <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Order Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="Any additional instructions..."
                    className="w-full px-3 py-2 text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Payment sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 bg-white rounded-lg shadow p-4 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="text-base font-bold">Payment</h3>
                </div>
                <div className="space-y-2 pb-3 border-b">
                  {products.map(p => (
                    <div key={p.id} className="flex justify-between text-xs">
                      <span className="text-gray-600">{p.name} ×{p.quantity}</span>
                      <span className="font-medium">₹{(p.price * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {packages.map(pkg => (
                    <div key={pkg.id} className="flex justify-between text-xs">
                      <span className="flex items-center gap-1" style={{ color: '#92400e' }}>
                        📦 {pkg.garments.map(g => g.productName).join(' + ')} ×{pkg.quantity}
                      </span>
                      <span className="font-medium">₹{(pkg.price * pkg.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="py-2 border-b">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* ── Loyalty Points redemption ── */}
                {availablePoints > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Loyalty Points</div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-1 flex justify-between items-center">
                      <span className="text-blue-800 font-medium text-xs flex items-center gap-1">⭐ Available: {availablePoints} pts</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Use:</span>
                        <input type="number" min="0" max={availablePoints} step="10"
                          value={pointsToUse || ''}
                          onChange={e => setPointsToUse(Math.min(parseInt(e.target.value) || 0, availablePoints))}
                          className="w-14 border border-blue-300 rounded px-1.5 py-0.5 text-xs font-bold text-blue-700 text-center" />
                        <span className="text-xs text-blue-600">pts</span>
                      </div>
                    </div>
                    {pointsToUse > 0 && (
                      <div className="text-xs text-blue-600 text-right mb-2">{pointsToUse} pts = −₹{pointsToUse} off</div>
                    )}
                  </div>
                )}

                {/* ── Store Credit redemption ── */}
                {availableCredit > 0 && (
                  <div className="pt-1">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Store Credit</div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-1 flex justify-between items-center">
                      <span className="text-green-800 font-medium text-xs flex items-center gap-1">💳 Available: ₹{availableCredit.toFixed(0)}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Use: ₹</span>
                        <input type="number" min="0" max={availableCredit} step="50"
                          value={creditToUse || ''}
                          onChange={e => setCreditToUse(Math.min(parseFloat(e.target.value) || 0, availableCredit))}
                          className="w-16 border border-green-300 rounded px-1.5 py-0.5 text-xs font-bold text-green-700 text-center" />
                      </div>
                    </div>
                    {creditToUse > 0 && (
                      <div className="text-xs text-green-600 text-right mb-2">₹{(availableCredit - creditToUse).toFixed(0)} will remain in credit</div>
                    )}
                  </div>
                )}

                {/* ── Summary breakdown ── */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs space-y-1">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-blue-600 font-medium">
                      <span className="flex items-center gap-1">⭐ Points disc.</span><span>−₹{pointsDiscount.toFixed(0)}</span>
                    </div>
                  )}
                  {creditDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span className="flex items-center gap-1">💳 Store credit</span><span>−₹{creditDiscount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200 mt-1">
                    <span>Balance Due</span><span className="text-red-600">₹{balance.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Advance Payment (₹)</label>
                  <input type="number" min="0" value={advance || ''}
                    onChange={e => setAdvance(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
                </div>

                {/* Checklist */}
                <div className="mt-3 pt-3 border-t space-y-1.5">
                  <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-xs text-green-700 font-medium">Customer Selected</span></div>
                  {products.length > 0 && <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-xs text-green-700 font-medium">{products.length} Individual Product{products.length !== 1 ? 's' : ''}</span></div>}
                  {packages.length > 0 && <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-xs text-green-700 font-medium">{packages.length} Complete Package{packages.length !== 1 ? 's' : ''}</span></div>}
                  {pointsDiscount > 0 && <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-xs text-green-700 font-medium">{pointsToUse} pts redeemed</span></div>}
                  {creditDiscount > 0 && <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-xs text-green-700 font-medium">₹{creditDiscount.toFixed(0)} credit used</span></div>}
                  <div className="flex items-center gap-2">
                    {deliveryDate
                      ? <><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-xs text-green-700 font-medium">Delivery Date Set</span></>
                      : <><div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full" /><span className="text-xs text-gray-500">Set Delivery Date</span></>}
                  </div>
                </div>
                <button onClick={handleSubmit} disabled={!deliveryDate || loading}
                  className="w-full mt-4 px-4 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2">
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Check className="w-4 h-4" />}
                  {loading ? 'Creating...' : 'Create Order'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">Review all details before creating</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <h3 className="text-xl font-semibold mb-6 text-gray-900">Create New Customer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['name', 'Name *', 'text', 'Enter customer name'], ['phone', 'Phone *', 'tel', 'Enter phone number'], ['email', 'Email', 'email', 'Enter email (optional)']].map(([field, label, type, placeholder]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={(newCustomer as any)[field]}
                    onChange={e => setNewCustomer(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" value={newCustomer.dateOfBirth}
                  onChange={e => setNewCustomer(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={newCustomer.gender}
                  onChange={e => setNewCustomer(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCustomerModal(false)}
                className="px-5 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button onClick={handleCustomerCreate} disabled={!newCustomer.name || !newCustomer.phone || loading}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
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
