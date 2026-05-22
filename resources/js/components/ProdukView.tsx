import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Bookmark, 
  Grid, 
  DollarSign, 
  CupSoda, 
  Milk, 
  Droplets, 
  GlassWater, 
  Soup, 
  Utensils, 
  Cookie,
  Layers,
  ArrowRightLeft,
  Settings,
  Coffee
} from 'lucide-react';
import { Product, InventoryItem, Category } from '../types';

interface ProdukViewProps {
  products: Product[];
  inventory: InventoryItem[];
  categories: Category[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: number) => void;
}

export const ProdukView: React.FC<ProdukViewProps> = ({
  products,
  inventory,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Minuman');

  // Modals controllers
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states - Add Product
  const [newName, setNewName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newCategory, setNewCategory] = useState<string>('Minuman');
  const [newIcon, setNewIcon] = useState<string>('Coffee');
  const [connectRecipe, setConnectRecipe] = useState<boolean>(false);
  const [newRecipeInventoryId, setNewRecipeInventoryId] = useState<string>('');
  const [newRecipeDeductAmount, setNewRecipeDeductAmount] = useState<string>('0');

  // Form states - Update Product
  const [updateName, setUpdateName] = useState<string>('');
  const [updatePrice, setUpdatePrice] = useState<number>(0);
  const [updateCategory, setUpdateCategory] = useState<string>('Minuman');
  const [updateIcon, setUpdateIcon] = useState<string>('');
  const [updateConnectRecipe, setUpdateConnectRecipe] = useState<boolean>(false);
  const [updateRecipeInventoryId, setUpdateRecipeInventoryId] = useState<string>('');
  const [updateRecipeDeductAmount, setUpdateRecipeDeductAmount] = useState<string>('0');

  // Form states - Add Category
  const [newCatName, setNewCatName] = useState<string>('');

  // Fallback selectedCategory to first category when categories are updated or current selection doesn't exist
  React.useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.name === selectedCategory)) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Handle default selection when modals open
  React.useEffect(() => {
    if (showAddModal && categories.length > 0) {
      setNewCategory(categories[0].name);
    }
  }, [showAddModal, categories]);

  React.useEffect(() => {
    if (showUpdateModal && selectedProduct) {
      setUpdateCategory(selectedProduct.category);
    }
  }, [showUpdateModal, selectedProduct]);

  // Filter products by category and search term
  const filteredProducts = products.filter(p => 
    p.category === selectedCategory &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Available icons list
  const availableIcons = [
    { name: 'Coffee', label: 'Kopi', component: <Coffee className="h-4 w-4" /> },
    { name: 'CupSoda', label: 'Minuman', component: <CupSoda className="h-4 w-4" /> },
    { name: 'Milk', label: 'Susu', component: <Milk className="h-4 w-4" /> },
    { name: 'Droplets', label: 'Air', component: <Droplets className="h-4 w-4" /> },
    { name: 'GlassWater', label: 'Gelas', component: <GlassWater className="h-4 w-4" /> },
    { name: 'Soup', label: 'Kuah', component: <Soup className="h-4 w-4" /> },
    { name: 'Utensils', label: 'Makanan', component: <Utensils className="h-4 w-4" /> },
    { name: 'Cookie', label: 'Snack', component: <Cookie className="h-4 w-4" /> }
  ];

  // Helper to render product icon
  const renderProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee': return <Coffee className="h-5 w-5 text-[#feb300]" />;
      case 'CupSoda': return <CupSoda className="h-5 w-5 text-red-800" />;
      case 'Milk': return <Milk className="h-5 w-5 text-amber-800" />;
      case 'Droplets': return <Droplets className="h-5 w-5 text-blue-800" />;
      case 'GlassWater': return <GlassWater className="h-5 w-5 text-[#7e5700]" />;
      case 'Soup': return <Soup className="h-5 w-5 text-orange-800" />;
      case 'Utensils': return <Utensils className="h-5 w-5 text-amber-950" />;
      case 'Cookie': return <Cookie className="h-5 w-5 text-yellow-950" />;
      default: return <CupSoda className="h-5 w-5 text-gray-700" />;
    }
  };

  const handleOpenUpdate = (product: Product) => {
    setSelectedProduct(product);
    setUpdateName(product.name);
    setUpdatePrice(product.price);
    setUpdateCategory(product.category);
    setUpdateIcon(product.icon);
    
    if (product.recipe_inventory_id) {
      setUpdateConnectRecipe(true);
      setUpdateRecipeInventoryId(product.recipe_inventory_id);
      setUpdateRecipeDeductAmount(String(product.recipe_deduct_amount || 0));
    } else {
      setUpdateConnectRecipe(false);
      setUpdateRecipeInventoryId(inventory[0]?.id || '');
      setUpdateRecipeDeductAmount('0');
    }

    setShowUpdateModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const productId = 'p_' + Date.now();
    const productData: Product = {
      id: productId,
      name: newName.trim(),
      price: Number(newPrice),
      category: newCategory,
      icon: newIcon,
      recipe_inventory_id: connectRecipe && newRecipeInventoryId ? newRecipeInventoryId : null,
      recipe_deduct_amount: connectRecipe && newRecipeInventoryId ? Number(newRecipeDeductAmount) : null
    };

    onAddProduct(productData);

    // Reset Form
    setNewName('');
    setNewPrice(0);
    setNewCategory(categories[0]?.name || 'Minuman');
    setNewIcon('Coffee');
    setConnectRecipe(false);
    setNewRecipeInventoryId('');
    setNewRecipeDeductAmount('0');
    setShowAddModal(false);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !updateName.trim()) return;

    onUpdateProduct({
      ...selectedProduct,
      name: updateName.trim(),
      price: Number(updatePrice),
      category: updateCategory,
      icon: updateIcon,
      recipe_inventory_id: updateConnectRecipe && updateRecipeInventoryId ? updateRecipeInventoryId : null,
      recipe_deduct_amount: updateConnectRecipe && updateRecipeInventoryId ? Number(updateRecipeDeductAmount) : null
    });

    setShowUpdateModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in relative text-[#32170d]">
      {/* Header */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#967259] uppercase">
          MANAJEMEN BARANG
        </span>
        <h1 className="text-3xl font-serif text-[#32170d] mt-2 italic font-light">
          Daftar <span className="not-italic font-bold font-sans tracking-tight text-[#32170d]">Menu Warkop</span>
        </h1>
        <p className="text-[11px] font-sans text-stone-500 mt-0.5 uppercase tracking-wide">
          Atur harga, kategori, icon visual, dan pemetaan resep bahan baku menu.
        </p>
      </div>

      {/* Search and Add buttons */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama menu..."
            className="w-full h-11 pl-4 pr-4 bg-white border border-[#967259]/15 rounded-xs text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#32170d] focus:ring-0 shadow-2xs"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="h-11 bg-white hover:bg-stone-50 border border-[#967259]/15 text-[#32170d] px-5 rounded-xs font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Layers className="h-4 w-4 text-[#967259]" />
            <span>Kategori</span>
          </button>
          <button
            onClick={() => {
              // Set default recipe inventory selection if available
              if (inventory.length > 0 && !newRecipeInventoryId) {
                setNewRecipeInventoryId(inventory[0].id);
              }
              setNewRecipeDeductAmount('0');
              setShowAddModal(true);
            }}
            className="h-11 bg-[#32170d] hover:bg-[#4b2c20] text-white px-5 rounded-xs font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-[#32170d] shadow-2xs"
          >
            <Plus className="h-4 w-4 text-[#feb300]" />
            <span>Tambah Menu</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-[#967259]/15 pb-2 overflow-x-auto scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border-b-2 shrink-0 ${
              selectedCategory === cat.name
                ? 'border-[#32170d] text-[#32170d]'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            {cat.name} ({products.filter(p => p.category === cat.name).length})
          </button>
        ))}
      </div>

      {/* Products list */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#FAF9F5] border border-dashed border-[#967259]/25 text-center py-14 rounded-xs">
          <Grid className="h-8 w-8 text-stone-300 mx-auto mb-2" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#967259]">
            Belum ada menu di kategori ini
          </p>
          <p className="text-[10px] text-stone-400 mt-1 uppercase">
            Silakan tambahkan produk baru di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(product => {
            const recipeItem = inventory.find(i => i.id === product.recipe_inventory_id);
            return (
              <div 
                key={product.id}
                className="bg-white border border-[#967259]/10 hover:border-[#967259]/35 p-4 rounded-xs flex items-center justify-between space-x-3 transition-colors shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-[#F0EBE1]/45 flex items-center justify-center border border-[#967259]/10 flex-shrink-0">
                    {renderProductIcon(product.icon)}
                  </div>
                  {/* Metadata */}
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm text-[#32170d] truncate">{product.name}</h4>
                    <p className="text-[11px] font-mono font-bold text-[#feb300] mt-0.5">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                    {/* Recipe badge */}
                    {recipeItem ? (
                      <span className="inline-flex items-center space-x-1 text-[8px] font-bold text-stone-500 bg-stone-50 border border-stone-200/50 px-1.5 py-0.5 rounded-xs mt-1.5 uppercase">
                        <ArrowRightLeft className="h-2 w-2 text-[#feb300]" />
                        <span>Potong {product.recipe_deduct_amount} {recipeItem.unit} {recipeItem.name}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[8px] font-bold text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded-xs mt-1.5 uppercase border border-dashed border-stone-200">
                        Tanpa Resep
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenUpdate(product)}
                  className="bg-[#FAF9F5] border border-[#967259]/15 hover:border-[#967259]/40 hover:bg-[#F0EBE1]/40 text-[#32170d] p-2.5 rounded-xs font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-stone-500" />
                  <span>Ubah</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#32170d]/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF9F5] w-full max-w-md rounded-xs border border-[#967259]/30 shadow-2xl overflow-hidden animate-slide-up my-8">
            <div className="bg-[#32170d] text-white p-5 flex items-center justify-between border-b border-[#feb300]/20">
              <span className="font-serif font-bold text-sm italic text-[#feb300]">Tambah Menu Jualan</span>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-stone-300 hover:text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 space-y-4 text-left">
              {/* Product Name */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1.5 font-sans">Nama Menu</label>
                <input 
                  type="text" 
                  required
                  placeholder="Kopi Hitam Toraja"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#967259]/20 rounded-xs text-xs text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300]"
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1.5 font-sans">Harga Jual (Rp)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="5000"
                    value={newPrice || ''}
                    onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                    className="w-full h-11 px-3 bg-white border border-[#967259]/20 rounded-xs text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1.5 font-sans">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 px-2 bg-white border border-[#967259]/20 rounded-xs text-xs text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1.5 font-sans">Icon Visual</label>
                <div className="grid grid-cols-4 gap-2 bg-white p-3 border border-[#967259]/20 rounded-xs">
                  {availableIcons.map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setNewIcon(item.name)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xs border text-[8px] font-bold uppercase transition-all duration-150 ${
                        newIcon === item.name
                          ? 'border-[#32170d] bg-[#32170d] text-white shadow-2xs'
                          : 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-750'
                      }`}
                      title={item.label}
                    >
                      {item.component}
                      <span className="text-[7px] mt-1.5 truncate max-w-full">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mapped Recipe Checkbox */}
              <div className="bg-[#F0EBE1]/30 border border-[#967259]/15 p-4 rounded-xs space-y-3">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={connectRecipe}
                    onChange={(e) => {
                      setConnectRecipe(e.target.checked);
                      if (e.target.checked && inventory.length > 0 && !newRecipeInventoryId) {
                        setNewRecipeInventoryId(inventory[0].id);
                      }
                    }}
                    className="rounded-sm border-[#967259]/25 text-[#32170d] focus:ring-[#feb300] h-4 w-4"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#32170d]">
                    Hubungkan ke Stok Bahan Baku (Resep)
                  </span>
                </label>

                {connectRecipe && (
                  <div className="animate-slide-up space-y-3 pt-1 border-t border-[#967259]/10">
                    {inventory.length === 0 ? (
                      <p className="text-[9px] font-bold text-red-700 uppercase">
                        ⚠️ Tidak ada bahan baku persediaan. Silakan tambah bahan baku dulu di tab Stok.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                        <div>
                          <label className="block text-[8px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1">Bahan Baku</label>
                          <select
                            value={newRecipeInventoryId}
                            onChange={(e) => setNewRecipeInventoryId(e.target.value)}
                            className="w-full h-10 px-2 bg-white border border-[#967259]/20 rounded-xs text-[11px] text-gray-800 focus:outline-none"
                          >
                            {inventory.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1">
                            Takaran per Porsi ({inventory.find(i => i.id === newRecipeInventoryId)?.unit || ''})
                          </label>
                          <input
                            type="number"
                            step="any"
                            required={connectRecipe}
                            placeholder="0.015"
                            value={newRecipeDeductAmount}
                            onChange={(e) => setNewRecipeDeductAmount(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-[#967259]/20 rounded-xs text-[11px] font-mono text-gray-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button 
                type="submit"
                className="w-full h-11 bg-[#feb300] hover:bg-[#ffba38] border border-[#feb300] text-[#32170d] font-black text-xs uppercase tracking-widest rounded-xs flex items-center justify-center space-x-2 cursor-pointer mt-4"
              >
                <Check className="h-4.5 w-4.5 text-[#32170d]" />
                <span>Simpan Menu</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update Product */}
      {showUpdateModal && selectedProduct && (
        <div className="fixed inset-0 bg-[#32170d]/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF9F5] w-full max-w-md rounded-xs border border-[#967259]/30 shadow-2xl overflow-hidden animate-slide-up my-8">
            <div className="bg-[#32170d] text-white p-5 flex items-center justify-between border-b border-[#feb300]/20">
              <div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#feb300] block opacity-85">PERBARUI BARANG</span>
                <span className="font-serif font-bold text-sm text-white italic truncate block mt-0.5">{selectedProduct.name}</span>
              </div>
              <button 
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedProduct(null);
                }}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="p-5 space-y-4 text-left">
              {/* Product Name */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1.5 font-sans">Nama Menu</label>
                <input 
                  type="text" 
                  required
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#967259]/20 rounded-xs text-xs text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300]"
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1.5 font-sans">Harga Jual (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={updatePrice || ''}
                    onChange={(e) => setUpdatePrice(parseInt(e.target.value) || 0)}
                    className="w-full h-11 px-3 bg-white border border-[#967259]/20 rounded-xs text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1.5 font-sans">Kategori</label>
                  <select
                    value={updateCategory}
                    onChange={(e) => setUpdateCategory(e.target.value)}
                    className="w-full h-11 px-2 bg-white border border-[#967259]/20 rounded-xs text-xs text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1.5 font-sans">Icon Visual</label>
                <div className="grid grid-cols-4 gap-2 bg-white p-3 border border-[#967259]/20 rounded-xs">
                  {availableIcons.map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setUpdateIcon(item.name)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xs border text-[8px] font-bold uppercase transition-all duration-150 ${
                        updateIcon === item.name
                          ? 'border-[#32170d] bg-[#32170d] text-white shadow-2xs'
                          : 'border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-750'
                      }`}
                      title={item.label}
                    >
                      {item.component}
                      <span className="text-[7px] mt-1.5 truncate max-w-full">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mapped Recipe Checkbox */}
              <div className="bg-[#F0EBE1]/30 border border-[#967259]/15 p-4 rounded-xs space-y-3">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateConnectRecipe}
                    onChange={(e) => {
                      setUpdateConnectRecipe(e.target.checked);
                      if (e.target.checked && inventory.length > 0 && !updateRecipeInventoryId) {
                        setUpdateRecipeInventoryId(inventory[0].id);
                      }
                    }}
                    className="rounded-sm border-[#967259]/25 text-[#32170d] focus:ring-[#feb300] h-4 w-4"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#32170d]">
                    Hubungkan ke Stok Bahan Baku (Resep)
                  </span>
                </label>

                {updateConnectRecipe && (
                  <div className="animate-slide-up space-y-3 pt-1 border-t border-[#967259]/10">
                    {inventory.length === 0 ? (
                      <p className="text-[9px] font-bold text-red-700 uppercase">
                        ⚠️ Tidak ada bahan baku persediaan. Silakan tambah bahan baku dulu di tab Stok.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                        <div>
                          <label className="block text-[8px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1">Bahan Baku</label>
                          <select
                            value={updateRecipeInventoryId}
                            onChange={(e) => setUpdateRecipeInventoryId(e.target.value)}
                            className="w-full h-10 px-2 bg-white border border-[#967259]/20 rounded-xs text-[11px] text-gray-800 focus:outline-none"
                          >
                            {inventory.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-bold text-[#967259]/80 uppercase tracking-widest mb-1">
                            Takaran per Porsi ({inventory.find(i => i.id === updateRecipeInventoryId)?.unit || ''})
                          </label>
                          <input
                            type="number"
                            step="any"
                            required={updateConnectRecipe}
                            value={updateRecipeDeductAmount}
                            onChange={(e) => setUpdateRecipeDeductAmount(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-[#967259]/20 rounded-xs text-[11px] font-mono text-gray-800 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit & Delete options */}
              <div className="flex space-x-3 pt-2">
                {/* Delete button option */}
                <button 
                  type="button"
                  onClick={() => {
                    onDeleteProduct(selectedProduct.id);
                    setShowUpdateModal(false);
                    setSelectedProduct(null);
                  }}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-[#ba1a1a] p-3 rounded-xs text-sm flex items-center justify-center cursor-pointer transition-colors"
                  title="Hapus Menu"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                {/* Save button */}
                <button 
                  type="submit"
                  className="flex-1 h-12 bg-[#feb300] hover:bg-[#ffba38] border border-[#feb300] text-[#32170d] font-black text-xs uppercase tracking-widest rounded-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <Check className="h-4.5 w-4.5 text-[#32170d]" />
                  <span>Terapkan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Kelola Kategori */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-[#32170d]/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF9F5] w-full max-w-md rounded-xs border border-[#967259]/30 shadow-2xl overflow-hidden animate-slide-up my-8">
            <div className="bg-[#32170d] text-white p-5 flex items-center justify-between border-b border-[#feb300]/20">
              <div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#feb300] block opacity-85">KELOLA KATEGORI</span>
                <span className="font-serif font-bold text-sm text-white italic truncate block mt-0.5">Daftar Kategori Menu</span>
              </div>
              <button 
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCatName('');
                }}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-left">
              {/* Form Tambah Kategori */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCatName.trim()) return;
                  onAddCategory(newCatName.trim());
                  setNewCatName('');
                }}
                className="space-y-2.5"
              >
                <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest font-sans">Tambah Kategori Baru</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Kopi Spesial"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 h-11 px-3 bg-white border border-[#967259]/20 rounded-xs text-xs text-gray-800 focus:outline-none focus:border-[#feb300] focus:ring-1 focus:ring-[#feb300]"
                  />
                  <button 
                    type="submit"
                    className="h-11 bg-[#32170d] hover:bg-[#4b2c20] border border-[#32170d] text-white font-bold text-xs uppercase tracking-widest px-4 rounded-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#feb300]" />
                    <span>Tambah</span>
                  </button>
                </div>
              </form>

              {/* List Kategori Terdaftar */}
              <div className="space-y-2.5">
                <label className="block text-[9px] font-bold text-[#967259]/80 uppercase tracking-widest font-sans">Kategori Terdaftar</label>
                <div className="max-h-60 overflow-y-auto border border-[#967259]/15 rounded-xs divide-y divide-[#967259]/15 bg-white">
                  {categories.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400 italic">Belum ada kategori terdaftar.</div>
                  ) : (
                    categories.map(cat => {
                      const count = products.filter(p => p.category === cat.name).length;
                      return (
                        <div key={cat.id} className="flex items-center justify-between p-3">
                          <div className="min-w-0 flex-1 flex items-center justify-between pr-2">
                            <span className="text-xs font-bold text-gray-800 truncate">{cat.name}</span>
                            <span className="text-[9px] font-bold text-stone-400 bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded-xs ml-2 uppercase tracking-wide shrink-0">
                              {count} Menu
                            </span>
                          </div>
                          
                          {/* Hapus Kategori Bawaan Proteksi */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) {
                                onDeleteCategory(cat.id);
                              }
                            }}
                            className="text-stone-400 hover:text-red-750 p-1 rounded-xs transition-colors cursor-pointer shrink-0"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Notice banner */}
              <div className="bg-[#F0EBE1]/40 border border-[#967259]/15 p-3.5 rounded-xs text-[10px] text-stone-500 font-sans leading-relaxed">
                ℹ️ **Proteksi Keamanan Data**: Kategori yang sedang digunakan oleh menu aktif di database **tidak dapat dihapus** guna mencegah kesalahan sistem. Ubah atau hapus produk jualan tersebut terlebih dahulu.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
