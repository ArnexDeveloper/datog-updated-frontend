import React, { useState, useEffect } from 'react';

// ─── Product definitions ───────────────────────────────────────────────────

interface ProductDef {
  id: string; ico: string; name: string;
  cat: 'Bottoms' | 'Uppers' | 'Westcoats' | 'Blazers' | 'Accessories';
  price: number; accs: string[]; meas: string[];
}

export const PRODUCTS: ProductDef[] = [
  // Bottoms
  { id:'trousers',  ico:'👖', name:'Trousers',       cat:'Bottoms',     price:85,  accs:['Two Pocket','One Pocket','Belt Loops','Side Pocket','Back Pocket'], meas:['Waist','Hip','Thigh','Inseam','Length'] },
  { id:'pajamas',   ico:'👘', name:'Pajamas',         cat:'Bottoms',     price:45,  accs:['Elastic Waist','Drawstring','Side Pocket'],                         meas:['Waist','Hip','Length'] },
  { id:'shalwars',  ico:'👗', name:'Shalwars',        cat:'Bottoms',     price:60,  accs:['Elastic Waist','Drawstring','Churidar Style'],                      meas:['Waist','Hip','Length'] },
  { id:'dhoti',     ico:'🧣', name:'Dhoti',           cat:'Bottoms',     price:50,  accs:['Drawstring'],                                                        meas:['Waist','Hip','Length'] },
  { id:'arhems',    ico:'👗', name:'Arhems',          cat:'Bottoms',     price:55,  accs:['Elastic Waist','Side Pocket'],                                       meas:['Waist','Hip','Length'] },
  { id:'paticoats', ico:'🩱', name:'Paticoats',       cat:'Bottoms',     price:40,  accs:['Elastic Waist','Drawstring'],                                        meas:['Waist','Hip','Length'] },
  { id:'skirts',    ico:'👗', name:'Skirts',          cat:'Bottoms',     price:70,  accs:['A-Line','Pencil','Pleated','Side Zip'],                              meas:['Waist','Hip','Length'] },
  { id:'garara',    ico:'👗', name:'Garara',          cat:'Bottoms',     price:120, accs:['Elastic Waist','Embroidery'],                                        meas:['Waist','Hip','Length'] },
  { id:'sharara',   ico:'👗', name:'Sharara',         cat:'Bottoms',     price:130, accs:['Elastic Waist','Embroidery'],                                        meas:['Waist','Hip','Length'] },
  // Uppers
  { id:'shirt',        ico:'👔', name:'Shirt',           cat:'Uppers', price:65,  accs:['Full Sleeve','Half Sleeve','Collar Style','Button Type','Pocket'], meas:['Chest','Waist','Shoulder','Length','Sleeve'] },
  { id:'kurta',        ico:'🧥', name:'Kurta',            cat:'Uppers', price:80,  accs:['Full Sleeve','Half Sleeve','Collar Style','Side Slits'],           meas:['Chest','Waist','Shoulder','Length','Sleeve'] },
  { id:'kurti',        ico:'👘', name:'Kurti',            cat:'Uppers', price:75,  accs:['Full Sleeve','Half Sleeve','Collar Style','Side Slits'],           meas:['Chest','Waist','Shoulder','Length','Sleeve'] },
  { id:'kamize',       ico:'👗', name:'Kamize',           cat:'Uppers', price:90,  accs:['Full Sleeve','Half Sleeve','Collar Style'],                        meas:['Chest','Waist','Length','Sleeve'] },
  { id:'pathni',       ico:'👗', name:'Pathni',           cat:'Uppers', price:85,  accs:['Full Sleeve','Half Sleeve'],                                       meas:['Chest','Waist','Length','Sleeve'] },
  { id:'jubba',        ico:'🧥', name:'Jubba',            cat:'Uppers', price:110, accs:['Full Sleeve','Collar Style'],                                      meas:['Chest','Waist','Shoulder','Length','Sleeve'] },
  { id:'blouse',       ico:'👚', name:'Blouse',           cat:'Uppers', price:60,  accs:['Sleeveless','Short Sleeve','Back Design','Neckline Style'],        meas:['Chest','Waist','Shoulder','Length'] },
  { id:'shrags',       ico:'🧥', name:'Shrags',           cat:'Uppers', price:70,  accs:['Open Front','Belted'],                                             meas:['Chest','Shoulder','Length','Sleeve'] },
  { id:'gowne',        ico:'👗', name:'Gowne',            cat:'Uppers', price:150, accs:['Sleeveless','Embroidery','Train'],                                  meas:['Chest','Waist','Hip','Shoulder','Length'] },
  { id:'kaftan',       ico:'🧥', name:'Kaftan',           cat:'Uppers', price:95,  accs:['Full Sleeve','Embroidery','Side Slits'],                           meas:['Chest','Waist','Length','Sleeve'] },
  { id:'jacket-upper', ico:'🧥', name:'Jacket (Upper)',   cat:'Uppers', price:120, accs:['Single Breasted','Double Breasted','Zip Front','Button Front'],    meas:['Chest','Waist','Shoulder','Length','Sleeve'] },
  { id:'froog',        ico:'🧥', name:'Froog',            cat:'Uppers', price:85,  accs:['Full Sleeve','Collar Style'],                                      meas:['Chest','Waist','Shoulder','Length'] },
  { id:'one-pec',      ico:'👗', name:'One Piece',        cat:'Uppers', price:140, accs:['Sleeveless','Short Sleeve','Belt'],                                meas:['Chest','Waist','Hip','Length','Sleeve'] },
  // Westcoats
  { id:'west-coat', ico:'🎩', name:'West Coat',     cat:'Westcoats', price:180, accs:['V-Neck','High Neck','Button Style'],   meas:['Chest','Shoulder','Length'] },
  { id:'nehru',     ico:'🎩', name:'Nehru Jacket',  cat:'Westcoats', price:160, accs:['Pocket','Buttons','Collar'],           meas:['Chest','Shoulder','Length'] },
  { id:'shrug',     ico:'🧣', name:'Shrug',         cat:'Westcoats', price:100, accs:['Open Front','Belted'],                 meas:['Chest','Shoulder','Length'] },
  // Blazers & Sherwani
  { id:'blazer',       ico:'🥼', name:'Blazer',        cat:'Blazers', price:200, accs:['One Button','Two Button','Three Button','Peak Lapel','Notch Lapel'], meas:['Chest','Shoulder','Sleeve','Length','Neck'] },
  { id:'jothpuri',     ico:'🥼', name:'Jothpuri',      cat:'Blazers', price:220, accs:['One Button','Two Button','Pocket'],                                   meas:['Chest','Shoulder','Sleeve','Length'] },
  { id:'sherwani',     ico:'🧣', name:'Sherwani',      cat:'Blazers', price:350, accs:['High Neck','Band Collar','Button Style','Churidar Bottom'],           meas:['Chest','Shoulder','Sleeve','Length','Neck'] },
  { id:'over-coat',    ico:'🧥', name:'Over Coat',     cat:'Blazers', price:250, accs:['Single Breasted','Double Breasted','Pocket'],                         meas:['Chest','Shoulder','Sleeve','Length'] },
  { id:'trench-coat',  ico:'🧥', name:'Trench Coat',   cat:'Blazers', price:270, accs:['Double Breasted','Belt','Pocket'],                                    meas:['Chest','Shoulder','Sleeve','Length'] },
  { id:'jacket-formal',ico:'🥼', name:'Formal Jacket', cat:'Blazers', price:190, accs:['Single Breasted','Double Breasted','Zip Front','Button Front'],       meas:['Chest','Shoulder','Sleeve','Length'] },
  // Accessories
  { id:'dupatta',    ico:'🧣', name:'Dupatta',    cat:'Accessories', price:45,  accs:[], meas:[] },
  { id:'shawl',      ico:'🧣', name:'Shawl',      cat:'Accessories', price:60,  accs:[], meas:[] },
  { id:'tuxedo-belt',ico:'🎽', name:'Tuxedo Belt',cat:'Accessories', price:40,  accs:[], meas:[] },
  { id:'shoes',      ico:'👟', name:'Shoes',      cat:'Accessories', price:120, accs:[], meas:['Size'] },
  { id:'sleepers',   ico:'🩴', name:'Sleepers',   cat:'Accessories', price:50,  accs:[], meas:['Size'] },
  { id:'sandals',    ico:'👡', name:'Sandals',     cat:'Accessories', price:65,  accs:[], meas:['Size'] },
  { id:'jutis',      ico:'👞', name:'Jutis',       cat:'Accessories', price:70,  accs:[], meas:['Size'] },
  { id:'safa',       ico:'🎩', name:'Safa',        cat:'Accessories', price:80,  accs:[], meas:[] },
  { id:'perfume',    ico:'🌸', name:'Perfume',     cat:'Accessories', price:75,  accs:[], meas:[] },
  { id:'brooches',   ico:'💍', name:'Brooches',   cat:'Accessories', price:30,  accs:[], meas:[] },
  { id:'tie',        ico:'👔', name:'Tie',         cat:'Accessories', price:35,  accs:[], meas:[] },
  { id:'bow',        ico:'🎀', name:'Bow',         cat:'Accessories', price:25,  accs:[], meas:[] },
  { id:'muffler',    ico:'🧣', name:'Muffler',     cat:'Accessories', price:40,  accs:[], meas:[] },
  { id:'scarf',      ico:'🧣', name:'Scarf',       cat:'Accessories', price:35,  accs:[], meas:[] },
  { id:'watch',      ico:'⌚', name:'Watch',       cat:'Accessories', price:150, accs:[], meas:[] },
  { id:'buttons',    ico:'🔘', name:'Buttons',     cat:'Accessories', price:15,  accs:[], meas:[] },
  { id:'cufflinks',  ico:'💎', name:'Cufflinks',   cat:'Accessories', price:45,  accs:[], meas:[] },
  { id:'mala',       ico:'📿', name:'Mala',        cat:'Accessories', price:55,  accs:[], meas:[] },
  { id:'belts',      ico:'🎽', name:'Belts',       cat:'Accessories', price:50,  accs:[], meas:['Waist'] },
  { id:'wallets',    ico:'👛', name:'Wallets',     cat:'Accessories', price:60,  accs:[], meas:[] },
  { id:'bags',       ico:'👜', name:'Bags',        cat:'Accessories', price:100, accs:[], meas:[] },
  { id:'clutches',   ico:'👜', name:'Clutches',    cat:'Accessories', price:80,  accs:[], meas:[] },
  { id:'purses',     ico:'👛', name:'Purses',      cat:'Accessories', price:70,  accs:[], meas:[] },
  { id:'rings',      ico:'💍', name:'Rings',       cat:'Accessories', price:65,  accs:[], meas:[] },
  { id:'earrings',   ico:'💎', name:'Earrings',    cat:'Accessories', price:45,  accs:[], meas:[] },
  { id:'necklace',   ico:'📿', name:'Necklace',    cat:'Accessories', price:120, accs:[], meas:[] },
  { id:'bangles',    ico:'🔮', name:'Bangles',     cat:'Accessories', price:40,  accs:[], meas:[] },
];

function getProd(id: string): ProductDef | undefined {
  return PRODUCTS.find(p => p.id === id);
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface CustomerFabricDetails {
  description: string; type: string; color: string; quantity: number; notes: string;
}

const emptyCustomerFabric = (): CustomerFabricDetails => ({
  description: '', type: '', color: '', quantity: 0, notes: ''
});

export interface GarmentData {
  gid: string;
  productId: string;
  productName: string;
  fabricSource: 'lounge' | 'customer';
  fabricName: string;
  fabricUsed: number;
  customerFabricDetails: CustomerFabricDetails;
  accessories: string[];
  measurements: Record<string, string>;
  notes: string;
  imageLabel: string;
}

export interface PackageItem {
  type: 'package';
  pkgId: string;
  packagePrice: number;
  quantity: number;
  garments: GarmentData[];
}

export interface IndividualItem {
  type: 'individual';
  uid: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  fabricSource: 'lounge' | 'customer';
  fabricName: string;
  fabricUsed: number;
  customerFabricDetails: CustomerFabricDetails;
  accessories: string[];
  measurements: Record<string, string>;
  notes: string;
  imageLabel: string;
}

export type OrderItem = PackageItem | IndividualItem;

function makeGarment(productId: string): GarmentData {
  const prod = getProd(productId);
  return {
    gid: `g_${productId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    productId,
    productName: prod?.name || productId,
    fabricSource: 'lounge',
    fabricName: '',
    fabricUsed: 0,
    customerFabricDetails: emptyCustomerFabric(),
    accessories: [],
    measurements: {},
    notes: '',
    imageLabel: '',
  };
}

function isGarmentFilled(g: GarmentData): boolean {
  return !!(g.fabricName && (g.accessories.length > 0 || Object.values(g.measurements).some(v => v)));
}

// ─── Fabric sub-form ─────────────────────────────────────────────────────

interface FabricFormProps {
  fabricSource: 'lounge' | 'customer';
  fabricName: string;
  fabricUsed: number;
  customerFabricDetails: CustomerFabricDetails;
  fabrics: any[];
  onSourceChange: (v: 'lounge' | 'customer') => void;
  onFabricNameChange: (v: string) => void;
  onFabricUsedChange: (v: number) => void;
  onCustomerDetailChange: (field: keyof CustomerFabricDetails, v: any) => void;
}

function FabricForm({
  fabricSource, fabricName, fabricUsed, customerFabricDetails, fabrics,
  onSourceChange, onFabricNameChange, onFabricUsedChange, onCustomerDetailChange,
}: FabricFormProps) {
  return (
    <div className="mb-3 p-3 rounded-lg" style={{ background: '#fefce8', border: '1px solid #fef9c3' }}>
      <div className="text-xs font-medium text-gray-600 mb-2">
        Fabric source <span className="text-red-500">*</span>
      </div>
      <div className="flex mb-3">
        {(['lounge', 'customer'] as const).map(src => (
          <button
            key={src}
            type="button"
            onClick={() => onSourceChange(src)}
            style={fabricSource === src
              ? { background: '#fff7ed', borderColor: '#f59e0b', color: '#92400e' }
              : { background: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
            className={`flex-1 flex items-center gap-2 px-3 py-2 text-xs border transition-colors
              ${src === 'lounge' ? 'rounded-l-md' : 'rounded-r-md border-l-0'}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 transition-colors
              ${fabricSource === src ? 'border-red-500 bg-red-500' : 'border-gray-300'}`} />
            {src === 'lounge' ? 'Lounge fabric' : "Customer's fabric"}
          </button>
        ))}
      </div>
      {fabricSource === 'lounge' ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fabric <span className="text-red-500">*</span></label>
            <select
              value={fabricName}
              onChange={e => onFabricNameChange(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs bg-white"
            >
              <option value="">Select...</option>
              {fabrics.map((f: any) => <option key={f._id} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Used (m) <span className="text-red-500">*</span></label>
            <input
              type="number" step="0.1" min="0"
              value={fabricUsed || ''}
              onChange={e => onFabricUsedChange(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs bg-white"
              placeholder="2.5"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <input type="text" value={customerFabricDetails.description}
              onChange={e => onCustomerDetailChange('description', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs bg-white"
              placeholder="Describe fabric" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <input type="text" value={customerFabricDetails.type}
              onChange={e => onCustomerDetailChange('type', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs bg-white"
              placeholder="e.g. Cotton, Silk" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Label / Color</label>
            <input type="text" value={customerFabricDetails.color}
              onChange={e => onCustomerDetailChange('color', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs bg-white"
              placeholder="Fabric label" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Qty (m)</label>
            <input type="number" step="0.1" min="0"
              value={customerFabricDetails.quantity || ''}
              onChange={e => onCustomerDetailChange('quantity', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs bg-white"
              placeholder="2.5" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

interface Props {
  formData: any;
  fabrics?: any[];
  onProductsChange: (products: OrderItem[]) => void;
  onNext?: () => void;
}

export default function ProductSelection({ formData, fabrics = [], onProductsChange, onNext }: Props) {
  const [items, setItems] = useState<OrderItem[]>(() => {
    const ex = formData.products || [];
    if (ex.length > 0 && (ex[0].type === 'individual' || ex[0].type === 'package')) return ex;
    return [];
  });
  const [outerTab, setOuterTab] = useState<string | null>(null);
  const [innerTab, setInnerTab] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<string[]>([]);
  const [pickerPrice, setPickerPrice] = useState<number>(0);
  const [pickerQty, setPickerQty] = useState<number>(1);
  const [filterCat, setFilterCat] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Propagate items to parent formData
  useEffect(() => {
    onProductsChange(items);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalCount = items.reduce((acc, x) =>
    x.type === 'package' ? acc + x.garments.length : acc + 1, 0);

  const visibleProducts = PRODUCTS.filter(p => {
    if (filterCat !== 'All' && p.cat !== filterCat) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // ── Mutations ──

  const mutate = (fn: (prev: OrderItem[]) => OrderItem[]) => setItems(fn);

  const addIndiv = (productId: string) => {
    const prod = getProd(productId)!;
    const uid = `iv_${productId}_${Date.now()}`;
    const item: IndividualItem = {
      type: 'individual', uid, productId, productName: prod.name,
      price: prod.price, quantity: 1,
      fabricSource: 'lounge', fabricName: '', fabricUsed: 0,
      customerFabricDetails: emptyCustomerFabric(),
      accessories: [], measurements: {}, notes: '', imageLabel: '',
    };
    mutate(prev => [...prev, item]);
    setOuterTab(uid);
    setPickerOpen(false);
  };

  const removeIndiv = (uid: string) => {
    mutate(prev => {
      const next = prev.filter(x => !(x.type === 'individual' && x.uid === uid));
      if (outerTab === uid) {
        const first = next[0];
        setOuterTab(first ? (first.type === 'individual' ? first.uid : first.pkgId) : null);
      }
      return next;
    });
  };

  const updateIndiv = (uid: string, field: string, value: any) => {
    mutate(prev => prev.map(x =>
      x.type === 'individual' && x.uid === uid ? { ...x, [field]: value } : x
    ));
  };

  const confirmPkg = () => {
    if (!pickerSelected.length) return;
    const pkgId = `pkg_${Date.now()}`;
    const garments = pickerSelected.map(pid => makeGarment(pid));
    const pkg: PackageItem = { type: 'package', pkgId, packagePrice: pickerPrice, quantity: pickerQty, garments };
    mutate(prev => [...prev, pkg]);
    setPickerOpen(false);
    setPickerSelected([]);
    setPickerPrice(0);
    setPickerQty(1);
    setOuterTab(pkgId);
    setInnerTab(garments[0].gid);
  };

  const removePkg = (pkgId: string) => {
    mutate(prev => {
      const next = prev.filter(x => !(x.type === 'package' && x.pkgId === pkgId));
      if (outerTab === pkgId) {
        const first = next[0];
        setOuterTab(first ? (first.type === 'individual' ? first.uid : first.pkgId) : null);
        setInnerTab(null);
      }
      return next;
    });
  };

  const updatePkg = (pkgId: string, field: 'packagePrice' | 'quantity', value: any) => {
    mutate(prev => prev.map(x =>
      x.type === 'package' && x.pkgId === pkgId ? { ...x, [field]: value } : x
    ));
  };

  const updateGarment = (pkgId: string, gid: string, field: string, value: any) => {
    mutate(prev => prev.map(x => {
      if (x.type !== 'package' || x.pkgId !== pkgId) return x;
      return { ...x, garments: x.garments.map(g => g.gid === gid ? { ...g, [field]: value } : g) };
    }));
  };

  const selectOuter = (id: string) => {
    setOuterTab(id);
    setPickerOpen(false);
    const pkg = items.find(x => x.type === 'package' && x.pkgId === id) as PackageItem | undefined;
    if (pkg) setInnerTab(pkg.garments[0]?.gid || null);
  };

  // ── Derived ──

  const activePkg = outerTab ? items.find(x => x.type === 'package' && x.pkgId === outerTab) as PackageItem | undefined : undefined;
  const activeIndiv = outerTab ? items.find(x => x.type === 'individual' && x.uid === outerTab) as IndividualItem | undefined : undefined;
  const activeGarment = activePkg
    ? (activePkg.garments.find(g => g.gid === innerTab) || activePkg.garments[0])
    : null;

  // ── Render helpers ──

  const renderPriceStrip = (price: number, qty: number, onPrice: (v: number) => void, onQty: (v: number) => void) => (
    <div className="grid grid-cols-2 gap-3 px-4 py-2.5" style={{ background: '#fffdf9', borderBottom: '1px solid #fde68a' }}>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Package price (₹) <span className="text-red-500">*</span></label>
        <div className="flex items-center overflow-hidden rounded-md" style={{ border: '2px solid #f59e0b' }}>
          <div className="px-2.5 h-8 flex items-center text-sm font-medium flex-shrink-0"
            style={{ background: '#fffbeb', color: '#d97706', borderRight: '1px solid #fde68a' }}>₹</div>
          <input type="number" value={price || ''} onChange={e => onPrice(parseFloat(e.target.value) || 0)}
            className="flex-1 h-8 px-2 text-sm font-medium outline-none border-none bg-white"
            style={{ color: '#92400e' }} placeholder="Enter combined price" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
        <input type="number" min="1" value={qty}
          onChange={e => onQty(parseInt(e.target.value) || 1)}
          className="w-full h-8 px-2 border border-gray-200 rounded-md text-sm bg-white" />
      </div>
    </div>
  );

  const renderGarmentForm = (pkg: PackageItem, garment: GarmentData) => {
    const prod = getProd(garment.productId);
    if (!prod) return null;
    const gIdx = pkg.garments.indexOf(garment);
    return (
      <div className="p-4 overflow-y-auto" style={{ maxHeight: '320px' }}>
        <div className="mb-2">
          <div className="text-sm font-medium text-gray-800">{prod.ico} {prod.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{prod.cat} · part of package</div>
        </div>
        {/* Info notice */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs mb-3"
          style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
          ℹ️ Price is set once for the whole package above. Fill accessories, fabric and image for each garment tab.
        </div>
        {/* Image upload */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg mb-3"
          style={{ border: '1px dashed #c4b5fd', background: '#fdf4ff' }}>
          <button type="button" className="px-3 py-1.5 text-xs rounded border bg-white text-purple-700 border-purple-300 hover:bg-purple-50">
            Choose file
          </button>
          <span className="text-xs text-gray-400">{garment.imageLabel || 'No file chosen'}</span>
          <span className="ml-auto text-xs font-medium text-purple-700">Reference image (optional)</span>
        </div>
        {/* Fabric */}
        <FabricForm
          fabricSource={garment.fabricSource} fabricName={garment.fabricName}
          fabricUsed={garment.fabricUsed} customerFabricDetails={garment.customerFabricDetails}
          fabrics={fabrics}
          onSourceChange={v => updateGarment(pkg.pkgId, garment.gid, 'fabricSource', v)}
          onFabricNameChange={v => updateGarment(pkg.pkgId, garment.gid, 'fabricName', v)}
          onFabricUsedChange={v => updateGarment(pkg.pkgId, garment.gid, 'fabricUsed', v)}
          onCustomerDetailChange={(field, v) => updateGarment(pkg.pkgId, garment.gid, 'customerFabricDetails', { ...garment.customerFabricDetails, [field]: v })}
        />
        {/* Accessories */}
        {prod.accs.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-2">Accessories</div>
            <div className="flex flex-wrap gap-3">
              {prod.accs.map(acc => (
                <label key={acc} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3"
                    checked={garment.accessories.includes(acc)}
                    onChange={e => {
                      const next = e.target.checked
                        ? [...garment.accessories, acc]
                        : garment.accessories.filter(a => a !== acc);
                      updateGarment(pkg.pkgId, garment.gid, 'accessories', next);
                    }} />
                  {acc}
                </label>
              ))}
            </div>
          </div>
        )}
        {/* Measurements */}
        {prod.meas.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-2">Measurements (inches)</div>
            <div className="grid grid-cols-5 gap-2">
              {prod.meas.map(m => (
                <div key={m}>
                  <label className="block text-xs text-gray-400 mb-1">{m}</label>
                  <input type="number" step="0.5" placeholder="—"
                    value={garment.measurements[m] || ''}
                    onChange={e => updateGarment(pkg.pkgId, garment.gid, 'measurements', { ...garment.measurements, [m]: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs text-right bg-white" />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Notes */}
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-500 mb-1">Special instructions</div>
          <textarea value={garment.notes} rows={2} placeholder={`Any special requirements for ${prod.name}…`}
            onChange={e => updateGarment(pkg.pkgId, garment.gid, 'notes', e.target.value)}
            className="w-full px-2 py-2 border border-gray-200 rounded-md text-xs resize-none bg-white" />
        </div>
        {/* Nav */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <button type="button" disabled={gIdx === 0}
            onClick={() => setInnerTab(pkg.garments[gIdx - 1]?.gid)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">
            ← Previous
          </button>
          <span className="text-xs text-gray-400">{prod.name} · {gIdx + 1} of {pkg.garments.length}</span>
          {gIdx < pkg.garments.length - 1 ? (
            <button type="button" onClick={() => setInnerTab(pkg.garments[gIdx + 1].gid)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Next garment →
            </button>
          ) : (
            <button type="button"
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700">
              ✓ Package complete
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderFormArea = () => {
    // ── Package picker ──
    if (pickerOpen) {
      const sel = pickerSelected;
      return (
        <div>
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
            <span>📦</span>
            <span className="text-xs font-medium" style={{ color: '#92400e' }}>Building new complete package</span>
            <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>COMPLETE PACKAGE</span>
            <span className="text-xs ml-1" style={{ color: '#b45309' }}>· one price for all garments below</span>
          </div>
          {renderPriceStrip(pickerPrice, pickerQty, setPickerPrice, setPickerQty)}
          <div className="p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-3">
              🖱️ Select garments to add to this package
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {PRODUCTS.filter(p => p.cat !== 'Accessories').map(p => (
                <button key={p.id} type="button"
                  onClick={() => setPickerSelected(prev =>
                    prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                  )}
                  className={`border rounded-lg p-2 text-center cursor-pointer transition-all ${sel.includes(p.id)
                    ? 'border-green-400 bg-green-50 border-2'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}`}>
                  <div className="text-xl mb-1">{p.ico}</div>
                  <div className="text-xs text-gray-600 font-medium leading-tight">{p.name}</div>
                  {sel.includes(p.id) && <div className="text-xs text-green-700 font-medium mt-1">✓ Added</div>}
                </button>
              ))}
            </div>
            <div className="text-xs font-medium text-gray-500 mb-2">Garments in this package</div>
            <div className="flex flex-wrap gap-2 mb-4 min-h-8 items-center">
              {sel.length === 0
                ? <span className="text-xs text-gray-400">No garments selected — click above to add</span>
                : sel.map(id => {
                    const p = getProd(id)!;
                    return (
                      <span key={id} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-gray-100 border border-gray-200">
                        {p.ico} {p.name}
                        <button type="button" onClick={() => setPickerSelected(prev => prev.filter(x => x !== id))}
                          className="text-red-500 hover:text-red-700 ml-0.5">×</button>
                      </span>
                    );
                  })}
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={sel.length === 0} onClick={confirmPkg}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                ✓ Confirm Package · {sel.length} garment{sel.length !== 1 ? 's' : ''}
              </button>
              <button type="button"
                onClick={() => { setPickerOpen(false); setPickerSelected([]); setOuterTab(items[0] ? (items[0].type === 'individual' ? items[0].uid : items[0].pkgId) : null); }}
                className="px-3 py-2 rounded-lg text-xs border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── Empty state ──
    if (!outerTab || (!activePkg && !activeIndiv)) {
      return (
        <div className="p-10 text-center text-gray-400">
          <div className="text-4xl mb-3 opacity-30">🛍️</div>
          <div className="text-sm">
            Add a product from the grid above, or click{' '}
            <strong className="text-amber-800">+ Complete Package</strong> to bundle garments
          </div>
        </div>
      );
    }

    // ── Package form ──
    if (activePkg && activeGarment) {
      const pkgName = activePkg.garments.map(g => getProd(g.productId)?.name).join(' + ');
      return (
        <div>
          {/* Package top bar */}
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span>📦</span>
              <span className="text-xs font-medium" style={{ color: '#92400e' }}>{pkgName}</span>
              <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>COMPLETE PACKAGE</span>
              <span className="text-xs" style={{ color: '#b45309' }}>· {activePkg.garments.length} garments · one combined price</span>
            </div>
            <button type="button" onClick={() => removePkg(activePkg.pkgId)}
              className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 bg-white hover:bg-red-50 flex-shrink-0">
              Remove package
            </button>
          </div>
          {/* Price strip */}
          {renderPriceStrip(
            activePkg.packagePrice, activePkg.quantity,
            v => updatePkg(activePkg.pkgId, 'packagePrice', v),
            v => updatePkg(activePkg.pkgId, 'quantity', v),
          )}
          {/* Garment sub-tabs */}
          <div className="flex overflow-x-auto" style={{ background: '#f9fafb', borderBottom: '1.5px solid #e5e7eb' }}>
            {activePkg.garments.map(g => {
              const gProd = getProd(g.productId);
              const done = isGarmentFilled(g);
              const isAct = innerTab === g.gid;
              return (
                <button key={g.gid} type="button" onClick={() => setInnerTab(g.gid)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-r border-gray-200 transition-colors whitespace-nowrap"
                  style={{
                    color: isAct ? '#2563eb' : '#6b7280',
                    background: isAct ? '#fff' : 'transparent',
                    borderBottom: isAct ? '2.5px solid #2563eb' : '2.5px solid transparent',
                  }}>
                  {gProd?.ico} {gProd?.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {done ? 'filled' : 'pending'}
                  </span>
                </button>
              );
            })}
          </div>
          {renderGarmentForm(activePkg, activeGarment)}
        </div>
      );
    }

    // ── Individual item form ──
    if (activeIndiv) {
      const prod = getProd(activeIndiv.productId);
      if (!prod) return null;
      return (
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '460px' }}>
          <div className="text-sm font-medium text-gray-800 mb-0.5">{prod.ico} {prod.name}</div>
          <div className="text-xs text-gray-400 mb-4">{prod.cat} · Individual garment</div>
          {/* Price + Qty */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" value={activeIndiv.price || ''}
                onChange={e => updateIndiv(activeIndiv.uid, 'price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white"
                placeholder="Enter price" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Quantity</label>
              <input type="number" min="1" value={activeIndiv.quantity}
                onChange={e => updateIndiv(activeIndiv.uid, 'quantity', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white" />
            </div>
          </div>
          {/* Image upload */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg mb-4"
            style={{ border: '1px dashed #c4b5fd', background: '#fdf4ff' }}>
            <button type="button" className="px-3 py-1.5 text-xs rounded border bg-white text-purple-700 border-purple-300 hover:bg-purple-50">
              Choose file
            </button>
            <span className="text-xs text-gray-400">{activeIndiv.imageLabel || 'No file chosen'}</span>
            <span className="ml-auto text-xs font-medium text-purple-700">Reference image</span>
          </div>
          {/* Fabric */}
          <FabricForm
            fabricSource={activeIndiv.fabricSource} fabricName={activeIndiv.fabricName}
            fabricUsed={activeIndiv.fabricUsed} customerFabricDetails={activeIndiv.customerFabricDetails}
            fabrics={fabrics}
            onSourceChange={v => updateIndiv(activeIndiv.uid, 'fabricSource', v)}
            onFabricNameChange={v => updateIndiv(activeIndiv.uid, 'fabricName', v)}
            onFabricUsedChange={v => updateIndiv(activeIndiv.uid, 'fabricUsed', v)}
            onCustomerDetailChange={(field, v) => updateIndiv(activeIndiv.uid, 'customerFabricDetails', { ...activeIndiv.customerFabricDetails, [field]: v })}
          />
          {/* Accessories */}
          {prod.accs.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Accessories</div>
              <div className="flex flex-wrap gap-3">
                {prod.accs.map(acc => (
                  <label key={acc} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" className="w-3 h-3"
                      checked={activeIndiv.accessories.includes(acc)}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...activeIndiv.accessories, acc]
                          : activeIndiv.accessories.filter(a => a !== acc);
                        updateIndiv(activeIndiv.uid, 'accessories', next);
                      }} />
                    {acc}
                  </label>
                ))}
              </div>
            </div>
          )}
          {/* Measurements */}
          {prod.meas.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Measurements (inches)</div>
              <div className="grid grid-cols-5 gap-2">
                {prod.meas.map(m => (
                  <div key={m}>
                    <label className="block text-xs text-gray-400 mb-1">{m}</label>
                    <input type="number" step="0.5" placeholder="—"
                      value={activeIndiv.measurements[m] || ''}
                      onChange={e => updateIndiv(activeIndiv.uid, 'measurements', { ...activeIndiv.measurements, [m]: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs text-right bg-white" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Notes */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-1">Special instructions</div>
            <textarea value={activeIndiv.notes} rows={2}
              onChange={e => updateIndiv(activeIndiv.uid, 'notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm resize-none bg-white"
              placeholder={`Any special requirements for ${prod.name}…`} />
          </div>
          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <button type="button" onClick={() => removeIndiv(activeIndiv.uid)}
              className="px-3 py-1.5 text-xs border border-red-300 text-red-600 bg-white rounded-md hover:bg-red-50">
              Remove
            </button>
            {onNext && items.length > 0 && (
              <button type="button" onClick={onNext}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Continue to Measurements →
              </button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // ── Full render ──

  return (
    <div className="space-y-4">
      {/* Customer bar */}
      {formData.name && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-800 bg-blue-50 border border-blue-200">
          <span>👤</span>
          <span>{formData.name}</span>
          {formData.phone && <span className="text-blue-600 font-normal ml-1">{formData.phone}</span>}
        </div>
      )}

      {/* Product selection area */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Add Product</div>
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg mb-3 bg-white">
          <span className="text-gray-400 text-sm">🔍</span>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..." className="flex-1 text-sm outline-none bg-transparent" />
        </div>
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 items-center mb-4">
          {['All', 'Bottoms', 'Uppers', 'Westcoats', 'Blazers', 'Accessories'].map(cat => (
            <button key={cat} type="button" onClick={() => setFilterCat(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterCat === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-500 border-gray-200 bg-white hover:bg-gray-50'}`}>
              {cat}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button type="button"
            onClick={() => { setPickerOpen(true); setPickerSelected([]); setPickerPrice(0); setPickerQty(1); setOuterTab('__picker__'); }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>
            📦 + Complete Package
          </button>
        </div>
        {/* Product grid */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {visibleProducts.map(p => {
            const hasOne = items.some(x => x.type === 'individual' && x.productId === p.id);
            return (
              <button key={p.id} type="button" onClick={() => addIndiv(p.id)}
                className={`border rounded-lg p-2 text-center transition-all cursor-pointer ${hasOne
                  ? 'border-green-400 bg-green-50 border-2'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'}`}>
                <div className="text-lg mb-1">{p.ico}</div>
                <div className="text-xs text-gray-600 font-medium leading-tight">{p.name}</div>
                {hasOne && <div className="text-xs text-green-700 font-medium mt-1">+ more</div>}
              </button>
            );
          })}
        </div>
        <div className="border-b border-gray-200 mb-0" />
      </div>

      {/* Outer tabs + form shell */}
      <div>
        {(items.length > 0 || pickerOpen) && (
          <div className="flex overflow-x-auto" style={{ border: '1px solid #e5e7eb', borderBottom: 'none', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
            {pickerOpen && (
              <div className="flex items-center gap-2 px-4 py-2.5 border-r border-gray-200 text-xs font-medium flex-shrink-0 whitespace-nowrap"
                style={{ color: '#d97706', background: '#fffdf5' }}>
                📦 New Package
                <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>PKG</span>
              </div>
            )}
            {items.map(item => {
              if (item.type === 'package') {
                const names = item.garments.map(g => getProd(g.productId)?.name || '').join(' + ');
                const label = names.length > 24 ? names.slice(0, 22) + '…' : names;
                const isAct = !pickerOpen && outerTab === item.pkgId;
                return (
                  <button key={item.pkgId} type="button" onClick={() => selectOuter(item.pkgId)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-r border-gray-200 transition-colors whitespace-nowrap"
                    style={{
                      color: isAct ? '#d97706' : '#92400e',
                      background: isAct ? '#fff' : '#fffdf5',
                      borderBottom: isAct ? '2px solid #f59e0b' : '2px solid transparent',
                    }}>
                    📦 {label}
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: '#f59e0b', color: '#1a0f00' }}>PKG</span>
                  </button>
                );
              }
              const prod = getProd(item.productId);
              const sameType = items.filter(x => x.type === 'individual' && x.productId === item.productId) as IndividualItem[];
              const idx = sameType.findIndex(x => x.uid === item.uid) + 1;
              const label = sameType.length > 1 ? `${prod?.ico} ${prod?.name} #${idx}` : `${prod?.ico} ${prod?.name}`;
              const isAct = !pickerOpen && outerTab === item.uid;
              return (
                <button key={item.uid} type="button" onClick={() => selectOuter(item.uid)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-r border-gray-200 transition-colors whitespace-nowrap"
                  style={{
                    color: isAct ? '#2563eb' : '#6b7280',
                    background: isAct ? '#fff' : '#f9fafb',
                    borderBottom: isAct ? '2px solid #2563eb' : '2px solid transparent',
                  }}>
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium text-white ${isAct ? 'bg-blue-600' : 'bg-gray-400'}`}>
                    {item.quantity}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div className={`border border-gray-200 bg-white ${items.length > 0 || pickerOpen ? 'border-t-0 rounded-b-lg' : 'rounded-lg'}`}>
          {renderFormArea()}
        </div>
      </div>

      {/* Continue button */}
      {items.length > 0 && !pickerOpen && onNext && (
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-500">
            {totalCount} garment{totalCount !== 1 ? 's' : ''} added
            {items.filter(x => x.type === 'package').length > 0 &&
              ` · ${items.filter(x => x.type === 'package').length} package${items.filter(x => x.type === 'package').length !== 1 ? 's' : ''}`}
          </div>
          <button type="button" onClick={onNext}
            className="px-6 py-2.5 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 transition-colors">
            Continue to Measurements →
          </button>
        </div>
      )}
    </div>
  );
}
