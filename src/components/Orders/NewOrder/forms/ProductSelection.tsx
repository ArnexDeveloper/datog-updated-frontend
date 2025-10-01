import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string[];
  quantity?: number;
  fabric?: string;
  fit?: string;
  style?: string;
  specialInstructions?: string;
}

interface Fabric {
  _id: string;
  name: string;
}

interface ProductSelectionProps {
  formData: any;
  products: Product[];
  handleProductSelect: (product: Product) => void;
  handleQuantityChange: (id: string, quantity: number) => void;
  handleProductDetailChange: (id: string, field: string, value: string) => void;
  handleRemoveProduct: (id: string) => void;
  fabrics?: Fabric[];
  onNext?: () => void;
}

export default function ProductSelection({
  formData,
  handleProductSelect,
  handleQuantityChange,
  handleProductDetailChange,
  handleRemoveProduct,
  fabrics = [],
  onNext
}: ProductSelectionProps) {
  // Enhanced product data categorized by type
  const allProducts: Product[] = [
    // BOTTOMS
    { id: 'trousers', name: 'Trousers', price: 85, category: ['male', 'female'] },
    { id: 'pajamas', name: 'Pajamas', price: 45, category: ['male', 'female'] },
    { id: 'shalwars', name: 'Shalwars', price: 60, category: ['male', 'female'] },
    { id: 'dhoti', name: 'Dhoti', price: 50, category: ['male'] },
    { id: 'arhems', name: 'Arhems', price: 55, category: ['female'] },
    { id: 'paticoats', name: 'Paticoats', price: 40, category: ['female'] },
    { id: 'skirts', name: 'Skirts', price: 70, category: ['female'] },
    { id: 'garara', name: 'Garara', price: 120, category: ['female'] },
    { id: 'sharara', name: 'Sharara', price: 130, category: ['female'] },

    // UPPERS
    { id: 'shirt', name: 'Shirt', price: 65, category: ['male', 'female'] },
    { id: 'kurta', name: 'Kurta', price: 80, category: ['male'] },
    { id: 'kurti', name: 'Kurti', price: 75, category: ['female'] },
    { id: 'kamize', name: 'Kamize', price: 90, category: ['female'] },
    { id: 'pathni', name: 'Pathni', price: 85, category: ['female'] },
    { id: 'jubba', name: 'Jubba', price: 110, category: ['male'] },
    { id: 'blouse', name: 'Blouse', price: 60, category: ['female'] },
    { id: 'shrags', name: 'Shrags', price: 70, category: ['male', 'female'] },
    { id: 'gowne', name: 'Gowne', price: 150, category: ['female'] },
    { id: 'kaftan', name: 'Kaftan', price: 95, category: ['male', 'female'] },
    { id: 'jacket-upper', name: 'Jacket (Upper)', price: 120, category: ['male', 'female'] },
    { id: 'froog', name: 'Froog', price: 85, category: ['male', 'female'] },
    { id: 'one-pec', name: 'One Piece', price: 140, category: ['female'] },

    // WESTCOATS AND NEHRU JACKETS
    { id: 'west-coat', name: 'West Coat', price: 180, category: ['male', 'female'] },
    { id: 'nehru', name: 'Nehru Jacket', price: 160, category: ['male'] },
    { id: 'shrug', name: 'Shrug', price: 100, category: ['female'] },

    // FORMAL WEAR
    { id: 'blazer', name: 'Blazer', price: 200, category: ['male', 'female'] },
    { id: 'jothpuri', name: 'Jothpuri', price: 220, category: ['male'] },
    { id: 'sherwani', name: 'Sherwani', price: 350, category: ['male'] },
    { id: 'over-coat', name: 'Over Coat', price: 250, category: ['male', 'female'] },
    { id: 'trench-coat', name: 'Trench Coat', price: 270, category: ['male', 'female'] },
    { id: 'jacket-formal', name: 'Formal Jacket', price: 190, category: ['male', 'female'] },

    // ACCESSORIES
    { id: 'dupatta', name: 'Dupatta', price: 45, category: ['female'] },
    { id: 'shawl', name: 'Shawl', price: 60, category: ['male', 'female'] },
    { id: 'tuxedo-belt', name: 'Tuxedo Belt', price: 40, category: ['male'] },
    { id: 'shoes', name: 'Shoes', price: 120, category: ['male', 'female'] },
    { id: 'sleepers', name: 'Sleepers', price: 50, category: ['male', 'female'] },
    { id: 'sandals', name: 'Sandals', price: 65, category: ['male', 'female'] },
    { id: 'jutis', name: 'Jutis', price: 70, category: ['male', 'female'] },
    { id: 'safa', name: 'Safa', price: 80, category: ['male'] },
    { id: 'katar', name: 'Katar', price: 90, category: ['male'] },
    { id: 'knife', name: 'Knife', price: 45, category: ['male'] },
    { id: 'perfume', name: 'Perfume', price: 75, category: ['male', 'female'] },
    { id: 'brooches', name: 'Brooches', price: 30, category: ['female'] },
    { id: 'tie', name: 'Tie', price: 35, category: ['male'] },
    { id: 'bow', name: 'Bow', price: 25, category: ['male'] },
    { id: 'muffler', name: 'Muffler', price: 40, category: ['male', 'female'] },
    { id: 'scarf', name: 'Scarf', price: 35, category: ['female'] },
    { id: 'watch', name: 'Watch', price: 150, category: ['male', 'female'] },
    { id: 'buttons', name: 'Buttons', price: 15, category: ['male', 'female'] },
    { id: 'cufflinks', name: 'Cufflinks', price: 45, category: ['male'] },
    { id: 'mala', name: 'Mala', price: 55, category: ['female'] },
    { id: 'belts', name: 'Belts', price: 50, category: ['male', 'female'] },
    { id: 'wallets', name: 'Wallets', price: 60, category: ['male', 'female'] },
    { id: 'bags', name: 'Bags', price: 100, category: ['male', 'female'] },
    { id: 'clutches', name: 'Clutches', price: 80, category: ['female'] },
    { id: 'purses', name: 'Purses', price: 70, category: ['female'] },
    { id: 'rings', name: 'Rings', price: 65, category: ['male', 'female'] },
    { id: 'earrings', name: 'Earrings', price: 45, category: ['female'] },
    { id: 'necklace', name: 'Necklace', price: 120, category: ['female'] },
    { id: 'bangles', name: 'Bangles', price: 40, category: ['female'] },
  ];

  // Simple filtering logic based on formData.gender
  const filteredProducts = formData.gender
    ? allProducts.filter(product => product.category.includes(formData.gender.toLowerCase()))
    : allProducts;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-amber-900">Product Selection</h2>

      {formData.gender && (
        <div className="bg-amber-100 p-3 rounded-lg">
          <p className="text-amber-800 font-medium">
            Showing products for: <span className="capitalize">{formData.gender}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="border border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all bg-amber-50/30 hover:bg-amber-50">
            <h3 className="font-semibold text-amber-900">{product.name}</h3>
            <p className="text-amber-700 font-medium">₹{product.price}</p>
            <button
              onClick={() => handleProductSelect(product)}
              className="mt-3 w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Add to Order
            </button>
          </div>
        ))}
      </div>

      {formData.products.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Selected Products</h3>
          <div className="space-y-4">
            {formData.products.map((product: any) => (
              <div key={product.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200 transition-colors hover:bg-amber-100/50">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-medium text-amber-900">{product.name}</h4>
                    <p className="text-sm text-amber-700">₹{product.price} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-white rounded-lg border border-amber-300">
                      <button
                        onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                        className="p-1 text-amber-700 hover:bg-amber-100 rounded-l-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-amber-900">{product.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                        className="p-1 text-amber-700 hover:bg-amber-100 rounded-r-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">Fabric</label>
                    <select
                      value={product.fabric}
                      onChange={(e) => handleProductDetailChange(product.id, 'fabric', e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select Fabric</option>
                      {fabrics.map(fabric => (
                        <option key={fabric._id} value={fabric.name}>{fabric.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">Fit</label>
                    <select
                      value={product.fit}
                      onChange={(e) => handleProductDetailChange(product.id, 'fit', e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    >
                      <option value="regular">Regular</option>
                      <option value="slim">Slim</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-amber-800 mb-1">Style/Design Notes</label>
                    <input
                      type="text"
                      value={product.style}
                      onChange={(e) => handleProductDetailChange(product.id, 'style', e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                      placeholder="e.g., French cuffs, pleated front, etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-amber-800 mb-1">Special Instructions</label>
                    <textarea
                      value={product.specialInstructions}
                      onChange={(e) => handleProductDetailChange(product.id, 'specialInstructions', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                      placeholder="Any special requests or instructions"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {onNext && (
            <div className="flex justify-end mt-6">
              <button
                onClick={onNext}
                className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}