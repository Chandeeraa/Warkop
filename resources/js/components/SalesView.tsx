import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  Save, 
  CheckCircle,
  CupSoda,
  Milk,
  Droplets,
  GlassWater,
  Soup,
  Utensils,
  Cookie,
  ChevronDown,
  ChevronUp,
  X,
  Coffee
} from 'lucide-react';
import { Product, SaleItem, SaleTransaction, InventoryItem, Category } from '../types';

interface SalesViewProps {
  products: Product[];
  inventory: InventoryItem[];
  categories: Category[];
  onAddSale: (sale: Omit<SaleTransaction, 'id' | 'date' | 'time'>) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ products, inventory, categories, onAddSale }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Cart state: map of productId to quantity
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  
  // Manual input state
  const [manualAmount, setManualAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Cart list visible
  const [showCartDetails, setShowCartDetails] = useState<boolean>(false);
  
  // Success toast/message state
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [savedAmount, setSavedAmount] = useState<number>(0);

  // Set default category when categories load
  React.useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Filter products by selected category, search term, and stock availability
  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Check recipe stock availability
    if (p.recipe_inventory_id) {
      const recipeItem = inventory.find(inv => inv.id === p.recipe_inventory_id);
      if (!recipeItem) return false;
      
      const minRequired = p.recipe_deduct_amount || 0;
      return recipeItem.quantity > 0 && recipeItem.quantity >= minRequired;
    }
    
    return true; // No recipe mapping means unlimited stock
  });

  // Helper to resolve Icons from string name safely
  const renderProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="h-6 w-6 text-[#feb300]" />;
      case 'CupSoda': return <CupSoda className="h-6 w-6 text-red-500" />;
      case 'Milk': return <Milk className="h-6 w-6 text-amber-600" />;
      case 'Droplets': return <Droplets className="h-6 w-6 text-sky-500" />;
      case 'GlassWater': return <GlassWater className="h-6 w-6 text-sky-400" />;
      case 'Soup': return <Soup className="h-6 w-6 text-amber-700" />;
      case 'Utensils': return <Utensils className="h-6 w-6 text-amber-800" />;
      case 'Cookie': return <Cookie className="h-6 w-6 text-amber-900" />;
      default: return <CupSoda className="h-6 w-6 text-stone-500" />;
    }
  };

  // Add Item to cart
  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Remove / Decrement Item in cart
  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: current - 1
      };
    });
  };

  // Completely delete from cart
  const clearProductFromCart = (productId: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  // Total calculations
  const cartItemsCount = Object.values(cart).reduce((a: number, b: number) => a + b, 0);
  
  const cartItemsPrice = Object.entries(cart).reduce((sum: number, [productId, qty]) => {
    const prod = products.find(p => p.id === productId);
    return sum + (prod ? prod.price * (qty as number) : 0);
  }, 0);

  const numManualAmount = parseFloat(manualAmount) || 0;
  const totalOrderAmount = cartItemsPrice + numManualAmount;

  // Handle Save
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalOrderAmount <= 0) return;

    const items: SaleItem[] = Object.entries(cart).map(([productId, qty]) => {
      const prod = products.find(p => p.id === productId)!;
      return {
        productId,
        name: prod.name,
        price: prod.price,
        quantity: qty as number
      };
    });

    onAddSale({
      items,
      manualAmount: numManualAmount,
      notes,
      totalAmount: totalOrderAmount
    });

    // Reset everything
    setSavedAmount(totalOrderAmount);
    setCart({});
    setManualAmount('');
    setNotes('');
    setShowCartDetails(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-36 relative animate-fade-in text-[#32170d]">
      {/* Header screen */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#967259] uppercase">
          KASIR WARKOP
        </span>
        <h1 className="text-3xl font-normal font-serif text-[#32170d] mt-2 italic">
          Input <span className="not-italic font-bold font-sans tracking-tight text-[#32170d]">Penjualan</span>
        </h1>
      </div>

      {/* Success alert message */}
      {showSuccess && (
        <div className="bg-[#32170d] border border-[#feb300] text-[#FAF9F5] p-4 rounded-xs flex items-center space-x-3 shadow-md animate-slide-up">
          <CheckCircle className="h-5 w-5 text-[#feb300] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-xs uppercase tracking-wider text-[#feb300]">Penjualan Tersimpan</p>
            <p className="text-xs text-[#FAF9F5]/80 mt-1">
              Transaksi sebesar <strong>Rp {savedAmount.toLocaleString('id-ID')}</strong> berhasil dicatatkan.
            </p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="text-stone-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Category selector chips */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-[#967259] uppercase tracking-widest">Kategori</span>
        <div className="flex space-x-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2 rounded-xs font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat.name
                  ? 'bg-[#32170d] text-[#feb300]'
                  : 'bg-[#FAF9F5] border border-[#967259]/15 text-[#32170d]/60 hover:bg-[#F0EBE1]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari menu..."
          className="w-full h-10 pl-4 pr-4 bg-[#FAF9F5] border border-[#967259]/15 rounded-xs text-xs text-[#32170d] placeholder-stone-400 focus:outline-none focus:border-[#32170d] focus:ring-0 shadow-2xs"
        />
      </div>

      {/* Products Grid */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-[#967259] uppercase tracking-widest">Menu Terfavorit</span>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-2 bg-[#FAF9F5] border border-dashed border-[#967259]/25 text-center py-10 rounded-xs">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#967259]">
                Tidak ada menu tersedia
              </p>
              <p className="text-[9px] text-[#32170d]/50 mt-1 uppercase">
                Menu belum dibuat atau bahan baku resep sedang habis!
              </p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const qtyInCart = cart[product.id] || 0;
              return (
                <div 
                  key={product.id}
                  className="bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-4 flex flex-col justify-between space-y-4 hover:border-[#32170d]/40 transition-all relative"
                >
                  {/* Visual badge highlight if item selected */}
                  {qtyInCart > 0 && (
                    <span className="absolute top-2 right-2 bg-[#32170d] text-[#feb300] text-[9px] font-mono font-bold h-5 w-5 border border-[#967259]/30 rounded-full flex items-center justify-center">
                      {qtyInCart}
                    </span>
                  )}

                  {/* Top decorative identity circle with icon */}
                  <div className="w-10 h-10 rounded-full bg-[#F0EBE1] flex items-center justify-center border border-[#967259]/10">
                    {renderProductIcon(product.icon)}
                  </div>

                  {/* Details */}
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#32170d]">{product.name}</h4>
                    <p className="text-[10px] font-mono tracking-wider font-semibold text-[#967259] mt-1">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Stepper Add Button / Control */}
                  {qtyInCart > 0 ? (
                    <div className="flex items-center justify-between bg-[#F0EBE1] border border-[#967259]/15 rounded-xs overflow-hidden">
                      <button 
                        onClick={() => removeFromCart(product.id)}
                        className="p-1.5 py-2 hover:bg-[#FAF9F5] text-[#32170d] flex-1 flex justify-center cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-bold text-xs text-[#32170d] px-1.5">{qtyInCart}</span>
                      <button 
                        onClick={() => addToCart(product.id)}
                        className="p-1.5 py-2 hover:bg-[#FAF9F5] text-[#32170d] flex-1 flex justify-center cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-[#32170d] hover:bg-[#4b2c20] text-[#feb300] py-2 px-3 rounded-xs font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-1 transition-colors cursor-pointer border border-[#32170d]"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Tambahkan</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Manual Input Custom Orders Section */}
      <div className="bg-[#F0EBE1]/40 border border-[#967259]/15 p-5 rounded-xs space-y-4">
        <h4 className="text-[10px] font-bold text-[#32170d] uppercase tracking-widest flex items-center space-x-1.5">
          <span>📝</span>
          <span>BIAYA DAN CATATAN MANUAL</span>
        </h4>

        {/* Dynamic numerical fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-wider mb-1">Tambahan Biaya Bebas (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                Rp
              </span>
              <input
                type="number"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="0"
                className="w-full h-11 pl-11 pr-4 bg-[#FAF9F5] border border-[#967259]/15 rounded-xs font-mono font-bold text-xs text-[#32170d] placeholder-[#32170d]/20 focus:outline-none focus:border-[#32170d] focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-wider mb-1">Keterangan Lainnya (opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: req gula sedikit, no straw"
              className="w-full h-11 px-4 bg-[#FAF9F5] border border-[#967259]/15 rounded-xs text-xs text-[#32170d] placeholder-[#32170d]/40 focus:outline-none focus:border-[#32170d] focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Cart Summary Drawer Panel */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#32170d] text-[#FAF9F5] shadow-2xl rounded-t-xs z-40 transition-transform duration-300 border-t border-[#feb300]/30">
        
        {/* Toggleable Itemized Details */}
        {showCartDetails && Object.keys(cart).length > 0 && (
          <div className="p-4 border-b border-[#FAF9F5]/10 max-h-52 overflow-y-auto space-y-3 bg-[#241009] rounded-t-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#feb300]">Rincian Transaksi</span>
              <button 
                onClick={() => setCart({})}
                className="text-[9px] text-red-400 font-bold uppercase tracking-wider hover:underline cursor-pointer"
              >
                Reset Semua
              </button>
            </div>
            
            <div className="space-y-2">
              {Object.entries(cart).map(([productId, qty]) => {
                const prod = products.find(p => p.id === productId);
                if (!prod) return null;
                return (
                  <div key={productId} className="flex justify-between items-center text-xs text-stone-300">
                    <div>
                      <p className="font-serif font-bold text-stone-100">{prod.name}</p>
                      <p className="text-[10px] font-mono text-[#feb300]">Rp {prod.price.toLocaleString('id-ID')} &times; {qty}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-[#FAF9F5]">Rp {(prod.price * (qty as number)).toLocaleString('id-ID')}</span>
                      <div className="flex items-center bg-black/25 rounded-sm overflow-hidden border border-white/10">
                        <button 
                          onClick={() => removeFromCart(productId)}
                          className="px-2 py-0.5 text-stone-300 hover:bg-white/10 cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="px-1.5 text-[10px] font-bold text-center min-w-4 text-white">{qty}</span>
                        <button 
                          onClick={() => addToCart(productId)}
                          className="px-2 py-0.5 text-stone-300 hover:bg-white/10 cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 flex flex-col space-y-3 bg-[#32170d]">
          {/* Top Indicator row click to toggle details */}
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => {
              if (Object.keys(cart).length > 0) {
                setShowCartDetails(!showCartDetails);
              }
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[#241009] border border-[#967259]/15 p-2 rounded-xs">
                <ShoppingBag className="h-4.5 w-4.5 text-[#feb300]" />
              </div>
              <div>
                <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#feb300]">
                  {cartItemsCount} ITEM TERPILIH
                </p>
                <p className="text-xl font-serif font-semibold italic text-[#FAF9F5] mt-0.5">
                  Rp {totalOrderAmount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Expander indicators */}
            {Object.keys(cart).length > 0 && (
              <div className="text-[#feb300] hover:text-white transition-colors p-1 bg-white/5 rounded-xs">
                {showCartDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            )}
          </div>

          {/* Form execute save button */}
          <button
            onClick={handleSaveSale}
            disabled={totalOrderAmount === 0}
            className={`w-full h-11 rounded-xs font-semibold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer ${
              totalOrderAmount > 0 
                ? 'bg-[#feb300] hover:bg-[#ffc233] text-[#32170d]'
                : 'bg-[#FAF9F5]/5 text-[#FAF9F5]/20 border border-[#FAF9F5]/5 cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4" />
            <span>Simpan Transaksi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
