import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Package, 
  Edit3, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Coins,
  X,
  FileCheck2,
  Bookmark
} from 'lucide-react';
import { InventoryItem } from '../types';

interface StokViewProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onDeleteInventoryItem: (id: string) => void;
  currentUserRole: 'admin' | 'pegawai';
}

export const StokView: React.FC<StokViewProps> = ({ 
  inventory, 
  onAddInventoryItem, 
  onUpdateInventoryItem, 
  onDeleteInventoryItem,
  currentUserRole
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal controllers
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states for Add Item
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newQty, setNewQty] = useState<string>('0');
  const [newUnit, setNewUnit] = useState<string>('kg');
  const [newThreshold, setNewThreshold] = useState<string>('2');
  const [newImage, setNewImage] = useState<string>('');

  // Form states for Update Item
  const [updateName, setUpdateName] = useState<string>('');
  const [updateDesc, setUpdateDesc] = useState<string>('');
  const [updateQty, setUpdateQty] = useState<string>('0');
  const [updateUnit, setUpdateUnit] = useState<string>('');
  const [updateThreshold, setUpdateThreshold] = useState<string>('0');
  const [updateImage, setUpdateImage] = useState<string>('');

  // Filter items based on search input
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(item => item.quantity <= item.threshold).length;
  
  // Custom mock holding value calculation (e.g. estimate price per unit * quantity)
  // Let's give each item standard unit cost estimates:
  // Kopi robusta @ Rp 140.000/kg, Gula @ Rp 18.000/kg, Susu @ Rp 15.000/pcs, Indomie @ Rp 3.500/bks, Gudang Garam @ Rp 25.000/bks
  const getInventoryHoldingsValue = () => {
    let sum = 0;
    inventory.forEach(item => {
      const name = item.name.toLowerCase();
      let costPerUnit = 10000; // default
      if (name.includes('robusta')) costPerUnit = 140000;
      else if (name.includes('gula')) costPerUnit = 18000;
      else if (name.includes('susu')) costPerUnit = 15000;
      else if (name.includes('indomie')) costPerUnit = 3500;
      else if (name.includes('gudanggaram') || name.includes('gudang garam')) costPerUnit = 25000;
      else if (name.includes('arabika')) costPerUnit = 185000;
      
      sum += costPerUnit * item.quantity;
    });
    return sum;
  };

  // Status generator Badge
  const getBadgeType = (qty: number, threshold: number) => {
    if (qty === 0) return { label: 'OUT OF STOCK', style: 'bg-red-50 text-[#ba1a1a] border-red-100' };
    if (qty <= threshold) return { label: 'LOW STOCK', style: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'IN STOCK', style: 'bg-emerald-50 text-emerald-700 border-emerald-150' };
  };

  // Helper to handle file selection and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isUpdate: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar saja.');
      return;
    }

    if (file.size > 500 * 1024) {
      alert('Ukuran file gambar terlalu besar (maksimal 500 KB).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isUpdate) {
        setUpdateImage(base64String);
      } else {
        setNewImage(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenUpdate = (item: InventoryItem) => {
    setSelectedItem(item);
    setUpdateName(item.name);
    setUpdateDesc(item.description);
    setUpdateQty(String(item.quantity));
    setUpdateUnit(item.unit);
    setUpdateThreshold(String(item.threshold));
    setUpdateImage(item.image);
    setShowUpdateModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddInventoryItem({
      name: newName.trim(),
      description: newDesc.trim() || 'Supplies',
      quantity: Number(newQty) || 0,
      unit: newUnit,
      threshold: Number(newThreshold) || 0,
      image: newImage.trim()
    });

    // Reset Form
    setNewName('');
    setNewDesc('');
    setNewQty('0');
    setNewUnit('kg');
    setNewThreshold('2');
    setNewImage('');
    setShowAddModal(false);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    onUpdateInventoryItem({
      ...selectedItem,
      name: updateName.trim(),
      description: updateDesc.trim(),
      quantity: Number(updateQty) || 0,
      unit: updateUnit,
      threshold: Number(updateThreshold) || 0,
      image: updateImage.trim() || selectedItem.image
    });

    setShowUpdateModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in relative text-[#32170d]">
      {/* Header section Warkop Kita / Inventory */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#967259] uppercase">
          PERSEDIAAN GUDANG
        </span>
        <h1 className="text-3xl font-serif text-[#32170d] mt-2 italic font-light">
          Bahan <span className="not-italic font-bold font-sans tracking-tight text-[#32170d]">Persediaan</span>
        </h1>
        <p className="text-[11px] font-sans text-[#32170d]/70 mt-0.5 uppercase tracking-wide">
          Atur dan catat level restok bahan baku penting harian.
        </p>
      </div>

      {/* Input Search components */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#967259]" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama bahan / deskripsi..."
          className="w-full h-11 pl-11 pr-4 bg-[#FAF9F5] border border-[#967259]/15 rounded-xs text-xs text-[#32170d] placeholder-stone-450 focus:outline-none focus:border-[#32170d] focus:ring-0 shadow-2xs"
        />
      </div>

      {/* Quick stats indicators row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total stats card */}
        <div className="bg-[#FAF9F5] border border-[#967259]/15 p-4 rounded-xs flex items-center space-x-3.5 shadow-2xs text-left">
          <div className="bg-[#F0EBE1] p-2 rounded-xs text-[#32170d] border border-[#967259]/10">
            <Package className="h-4.5 w-4.5 text-[#feb300]" />
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold text-[#967259] uppercase tracking-widest block">Semua Bahan</span>
            <span className="font-serif font-bold text-[#32170d] text-sm italic">{totalItems} Ragam</span>
          </div>
        </div>

        {/* Low Stock count alert card */}
        <div className="bg-[#FAF9F5] border border-[#967259]/15 p-4 rounded-xs flex items-center space-x-3.5 shadow-2xs text-left">
          <div className="bg-amber-50 p-2.5 rounded-xs text-amber-800">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-700" />
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold text-[#967259] uppercase tracking-widest block">Stok Menipis</span>
            <span className="font-serif font-bold text-amber-700 text-sm italic">{lowStockCount} Benda</span>
          </div>
        </div>
      </div>

      {/* Big Coffee-Brown Holdings Value card banner */}
      <div className="bg-[#32170d] text-[#FAF9F5] p-5 rounded-xs flex items-center justify-between border border-[#32170d] shadow-sm">
        <div>
          <span className="text-[9px] font-bold text-[#feb300] uppercase tracking-[0.2em]">
            TAKSRAN HARGA GUDANG
          </span>
          <p className="text-xl font-serif font-bold text-white mt-1">
            Rp {getInventoryHoldingsValue().toLocaleString('id-ID')}
          </p>
          <p className="text-[9px] font-sans text-[#FAF9F5]/50 mt-1.5 italic">
            *Estimasi berdasarkan harga umum pasar
          </p>
        </div>
        
        {/* Add item button */}
        {currentUserRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#feb300] hover:bg-[#ffc233] text-[#32170d] px-4 py-2.5 rounded-xs font-bold text-[10px] uppercase tracking-widest flex items-center space-x-1.5 transition-colors cursor-pointer border border-[#feb300]"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah</span>
          </button>
        )}
      </div>

      {/* Raw materials list titles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#967259]/15">
          <span className="text-[10px] font-bold text-[#feb300] uppercase tracking-widest">
            DAFTAR BENDA INVENTARIS
          </span>
          <span className="text-[9px] bg-[#F0EBE1] text-[#32170d] border border-[#967259]/10 px-2 py-0.5 rounded-sm font-mono font-bold uppercase tracking-wider">
            {filteredInventory.length} item
          </span>
        </div>

        {/* Raw materials lists */}
        {filteredInventory.length === 0 ? (
          <div className="bg-[#FAF9F5] border border-dashed border-[#967259]/25 text-center py-10 rounded-xs">
            <Package className="h-6 w-6 text-stone-350 mx-auto mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#967259]">Persediaan tidak ditemukan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInventory.map(item => {
              const badge = getBadgeType(item.quantity, item.threshold);
              let badgeColorStyle = 'bg-stone-50 text-stone-700 border-stone-200/50';
              if (item.quantity === 0) badgeColorStyle = 'bg-red-50 text-red-800 border-red-200/50';
              else if (item.quantity <= item.threshold) badgeColorStyle = 'bg-amber-50 text-amber-700 border-amber-200/50';

              return (
                <div 
                  key={item.id}
                  className="bg-[#FAF9F5] border border-[#967259]/10 hover:border-[#32170d]/35 p-4 rounded-xs flex items-center space-x-3 transition-colors"
                >
                  {/* Photo thumbnail */}
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xs object-cover flex-shrink-0 bg-stone-100 border border-[#967259]/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xs bg-[#F0EBE1] border border-[#967259]/10 flex-shrink-0 flex items-center justify-center">
                      <Package className="h-5 w-5 text-[#967259]/50" />
                    </div>
                  )}

                  {/* Body metadata */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-[#32170d] truncate">{item.name}</h4>
                    <p className="text-[10px] font-sans font-medium text-stone-400 truncate mt-0.5">{item.description}</p>
                    
                    {/* Status badge wrapper */}
                    <div className="flex items-center space-x-2 mt-2 flex-wrap gap-y-1">
                      <span className="font-mono font-bold text-[11px] text-[#32170d]">
                        {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)} {item.unit}
                      </span>
                      <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-xs border uppercase ${badgeColorStyle}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Update button */}
                  {currentUserRole === 'admin' && (
                    <button
                      onClick={() => handleOpenUpdate(item)}
                      className="bg-[#F0EBE1] border border-[#967259]/20 hover:border-[#32170d]/40 hover:bg-[#FAF9F5] text-[#32170d] p-2.5 rounded-xs font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3 text-[#967259]" />
                      <span>Ubah</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Plus action button down right for mobile shortcuts accessibility */}
      {currentUserRole === 'admin' && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-16 right-5 z-45 bg-[#32170d] hover:bg-[#4b2c20] text-[#feb300] p-4 rounded-full shadow-lg border border-[#feb300]/40 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          title="Add Inventory Item"
        >
          <Plus className="h-5 w-5 text-[#feb300]" />
        </button>
      )}

      {/* Modal overlays 1: Add Item modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#32170d]/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF9F5] w-full max-w-md rounded-xs border border-[#967259]/30 shadow-2xl overflow-hidden animate-slide-up my-8">
            <div className="bg-[#32170d] text-[#FAF9F5] p-5 flex items-center justify-between border-b border-[#feb300]/20">
              <span className="font-serif font-bold text-sm italic text-[#feb300]">Tambah Bahan Baku</span>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-stone-300 hover:text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 space-y-4 text-left">
              {/* Name */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Nama Barang</label>
                <input 
                  type="text" 
                  required
                  placeholder="Kopi Arabika Toraja"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] focus:outline-none focus:border-[#32170d]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Deskripsi / Subtitle (opsional)</label>
                <input 
                  type="text" 
                  placeholder="Premium Single Origin Stock"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] focus:outline-none focus:border-[#32170d]"
                />
              </div>

              {/* Photo Upload / Link */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Foto / Gambar Bahan</label>
                <div className="flex items-center space-x-3 bg-white p-3 border border-[#967259]/15 rounded-xs">
                  {newImage ? (
                    <img 
                      src={newImage} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-xs object-cover bg-stone-150 border border-[#967259]/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xs bg-[#F0EBE1] border border-[#967259]/10 flex-shrink-0 flex items-center justify-center">
                      <Package className="h-5 w-5 text-[#967259]/50" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <input 
                        type="file" 
                        accept="image/*"
                        id="new-photo-upload"
                        onChange={(e) => handleFileChange(e, false)}
                        className="hidden"
                      />
                      <label 
                        htmlFor="new-photo-upload"
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-[#967259]/15 bg-[#FAF9F5] hover:bg-[#F0EBE1] text-[9px] font-bold uppercase tracking-wider text-[#32170d] rounded-xs cursor-pointer select-none transition-colors"
                      >
                        Pilih File Foto
                      </label>
                    </div>
                    <input 
                      type="text"
                      placeholder="Atau tempel URL gambar..."
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      className="w-full h-8 px-2 bg-stone-50 border border-[#967259]/15 rounded-xs text-[10px] text-[#32170d] focus:outline-none focus:border-[#32170d] placeholder-stone-400"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity and Unit in row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Jumlah</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs font-mono font-bold text-[#32170d] focus:outline-none focus:border-[#32170d]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Satuan</label>
                  <input 
                    type="text" 
                    required
                    placeholder="kg, bks, pcs, L"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] focus:outline-none focus:border-[#32170d]"
                  />
                </div>
              </div>

              {/* Threshold for low stock warning */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Batas Minimal (Low Stock)</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] focus:outline-none focus:border-[#32170d]"
                />
              </div>

              {/* Action triggers */}
              <button 
                type="submit"
                className="w-full h-11 bg-[#32170d] hover:bg-[#4b2c20] border border-[#32170d] text-[#feb300] font-bold text-xs uppercase tracking-widest rounded-xs flex items-center justify-center space-x-2 cursor-pointer mt-4"
              >
                <Check className="h-4.5 w-4.5 text-[#feb300]" />
                <span>Simpan Bahan</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal overlays 2: Update Item Modal */}
      {showUpdateModal && selectedItem && (
        <div className="fixed inset-0 bg-[#32170d]/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF9F5] w-full max-w-md rounded-xs border border-[#967259]/30 shadow-2xl overflow-hidden animate-slide-up my-8">
            <div className="bg-[#32170d] text-[#FAF9F5] p-5 flex items-center justify-between border-b border-[#feb300]/20">
              <div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#feb300] block opacity-85">PERBARUI STOK</span>
                <span className="font-serif font-bold text-sm text-white italic truncate block mt-0.5">{selectedItem.name}</span>
              </div>
              <button 
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedItem(null);
                }}
                className="text-stone-300 hover:text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="p-5 space-y-4 text-left">
              {/* Quick stock adjustment step buttons */}
              <div className="bg-[#F0EBE1] border border-[#967259]/10 p-4 rounded-xs space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#32170d] block">Ubah Cepat Jumlah Persediaan</span>
                <div className="flex items-center justify-around space-x-2">
                  <button
                    type="button"
                    onClick={() => setUpdateQty(prev => {
                      const num = Number(prev) || 0;
                      return String(Math.max(0, num - 5));
                    })}
                    className="bg-white hover:bg-[#F0EBE1] border border-[#967259]/15 text-[#32170d] font-mono text-xs py-2 px-3 rounded-xs font-bold cursor-pointer"
                  >
                    - 5
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateQty(prev => {
                      const num = Number(prev) || 0;
                      return String(Math.max(0, num - 1));
                    })}
                    className="bg-white hover:bg-[#F0EBE1] border border-[#967259]/15 text-[#32170d] font-mono text-xs py-2 px-3 rounded-xs font-bold cursor-pointer"
                  >
                    - 1
                  </button>
                  
                  <span className="font-mono text-base font-extrabold text-[#32170d] px-1">
                    {(() => {
                      const num = Number(updateQty) || 0;
                      return num % 1 === 0 ? num : num.toFixed(1);
                    })()}
                  </span>

                  <button
                    type="button"
                    onClick={() => setUpdateQty(prev => {
                      const num = Number(prev) || 0;
                      return String(num + 1);
                    })}
                    className="bg-white hover:bg-[#F0EBE1] border border-[#967259]/15 text-[#32170d] font-mono text-xs py-2 px-3 rounded-xs font-bold cursor-pointer"
                  >
                    + 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateQty(prev => {
                      const num = Number(prev) || 0;
                      return String(num + 5);
                    })}
                    className="bg-white hover:bg-[#F0EBE1] border border-[#967259]/15 text-[#32170d] font-mono text-xs py-2 px-3 rounded-xs font-bold cursor-pointer"
                  >
                    + 5
                  </button>
                </div>
              </div>

              {/* Title Edit */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Nama Bahan</label>
                <input 
                  type="text" 
                  required
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] focus:outline-none"
                />
              </div>

              {/* Description Edit */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Deskripsi / Kegunaan</label>
                <input 
                  type="text" 
                  value={updateDesc}
                  onChange={(e) => setUpdateDesc(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] focus:outline-none"
                />
              </div>

              {/* Photo Upload / Link Edit */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Foto / Gambar Bahan</label>
                <div className="flex items-center space-x-3 bg-white p-3 border border-[#967259]/15 rounded-xs">
                  {updateImage ? (
                    <img 
                      src={updateImage} 
                      alt="Preview" 
                      className="w-12 h-12 rounded-xs object-cover bg-stone-150 border border-[#967259]/10 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xs bg-[#F0EBE1] border border-[#967259]/10 flex-shrink-0 flex items-center justify-center">
                      <Package className="h-5 w-5 text-[#967259]/50" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <input 
                        type="file" 
                        accept="image/*"
                        id="update-photo-upload"
                        onChange={(e) => handleFileChange(e, true)}
                        className="hidden"
                      />
                      <label 
                        htmlFor="update-photo-upload"
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-[#967259]/15 bg-[#FAF9F5] hover:bg-[#F0EBE1] text-[9px] font-bold uppercase tracking-wider text-[#32170d] rounded-xs cursor-pointer select-none transition-colors"
                      >
                        Pilih File Foto
                      </label>
                    </div>
                    <input 
                      type="text"
                      placeholder="Atau tempel URL gambar..."
                      value={updateImage}
                      onChange={(e) => setUpdateImage(e.target.value)}
                      className="w-full h-8 px-2 bg-stone-50 border border-[#967259]/15 rounded-xs text-[10px] text-[#32170d] focus:outline-none placeholder-stone-400"
                    />
                  </div>
                </div>
              </div>

              {/* Exact Quantity and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Jumlah Eksak</label>
                  <input 
                    type="number" 
                    step="any"
                    required
                    value={updateQty}
                    onChange={(e) => setUpdateQty(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs font-mono font-bold text-xs text-[#32170d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Satuan</label>
                  <input 
                    type="text" 
                    required
                    value={updateUnit}
                    onChange={(e) => setUpdateUnit(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] focus:outline-none"
                  />
                </div>
              </div>

              {/* Threshold indicator */}
              <div>
                <label className="block text-[9px] font-bold text-[#967259] uppercase tracking-widest mb-1.5 font-sans">Batas Minimal Peringatan (Low Stock)</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  value={updateThreshold}
                  onChange={(e) => setUpdateThreshold(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#967259]/15 rounded-xs text-xs text-gray-850 focus:outline-none"
                />
              </div>

               {/* Save & Delete triggers */}
              <div className="flex space-x-3 pt-2">
                {/* Delete button option */}
                <button 
                  type="button"
                  onClick={() => {
                    onDeleteInventoryItem(selectedItem.id);
                    setShowUpdateModal(false);
                    setSelectedItem(null);
                  }}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-[#ba1a1a] p-3 rounded-xs text-sm flex items-center justify-center cursor-pointer transition-colors"
                  title="Hapus Bahan Baku"
                >
                  <Trash2 className="h-5 w-5" />
                </button>

                {/* Save button */}
                <button 
                  type="submit"
                  className="flex-1 h-12 bg-[#32170d] hover:bg-[#4b2c20] border border-[#32170d] text-[#feb300] font-bold text-xs uppercase tracking-widest rounded-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <Check className="h-4.5 w-4.5 text-[#feb300]" />
                  <span>Terapkan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
