import React, { useState } from 'react';
import { 
  FileText, 
  Coins, 
  Plus, 
  Trash2, 
  Coffee, 
  Bolt, 
  Snowflake, 
  HelpCircle,
  Clock,
  Save,
  CheckCircle,
  X
} from 'lucide-react';
import { ExpenseItem } from '../types';

interface ExpensesViewProps {
  expenses: ExpenseItem[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'time' | 'date'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<'Bahan Baku' | 'Operasional' | 'Lainnya'>('Bahan Baku');
  
  // States
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [savedItemName, setSavedItemName] = useState<string>('');
  const [showAllExpenses, setShowAllExpenses] = useState<boolean>(false);

  // Get today's date in WITA timezone
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: 'Asia/Makassar'
  }).format(new Date());

  // Calculate total expense today (filtered to today only)
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const totalExpenseToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onAddExpense({
      name: name.trim(),
      amount: numAmount,
      category,
    });

    setSavedItemName(name.trim());
    setName('');
    setAmount('');
    setCategory('Bahan Baku');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  // Helper to determine item icon
  const getCategoryIcon = (category: string, nameLower: string) => {
    const term = nameLower.toLowerCase();
    if (term.includes('kopi') || term.includes('arabika') || term.includes('robusta') || term.includes('susu') || term.includes('gula')) {
      return (
        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
          <Coffee className="h-5 w-5 text-amber-800" />
        </div>
      );
    }
    if (term.includes('es') || term.includes('batu') || term.includes('dingin') || term.includes('ice')) {
      return (
        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
          <Snowflake className="h-5 w-5 text-blue-500" />
        </div>
      );
    }
    if (category === 'Operasional' || term.includes('listrik') || term.includes('token') || term.includes('wifi') || term.includes('air')) {
      return (
        <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-200">
          <Bolt className="h-5 w-5 text-orange-600" />
        </div>
      );
    }
    return (
      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
        <HelpCircle className="h-5 w-5 text-gray-500" />
      </div>
    );
  };

  // Render expenses list (limited to 5 unless "Lihat Semua" is enabled)
  const renderedExpensesList = showAllExpenses ? expenses : expenses.slice(0, 4);

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-[#32170d]">
      {/* Header section */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#967259] uppercase">
          KAS KELUAR
        </span>
        <h1 className="text-3xl font-normal font-serif text-[#32170d] mt-2 italic">
          Input <span className="not-italic font-bold font-sans tracking-tight text-[#32170d]">Pengeluaran</span>
        </h1>
      </div>

      {/* Success alert message */}
      {showSuccess && (
        <div className="bg-[#32170d] border border-[#feb300] text-[#FAF9F5] p-4 rounded-xs flex items-center space-x-3 shadow-md animate-slide-up">
          <CheckCircle className="h-5 w-5 text-[#feb300] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-xs uppercase tracking-wider text-[#feb300]">Pengeluaran Tercatat!</p>
            <p className="text-xs text-[#FAF9F5]/80 mt-1">
              Pengeluaran untuk <strong>&ldquo;{savedItemName}&rdquo;</strong> berhasil disimpan ke inventaris harian.
            </p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="text-stone-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Total Hari Ini panel in Cozy Cafe Theme */}
      <div className="bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#967259] uppercase tracking-widest block">
            Hari Ini Terpakai
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#32170d] mt-1.5">
            Rp {totalExpenseToday.toLocaleString('id-ID')}
          </h2>
        </div>
        <div className="bg-[#32170d] p-3 rounded-xs text-[#feb300] border border-[#feb300]/30">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      {/* Request Form Container */}
      <div className="bg-[#FAF9F5] border border-[#967259]/15 rounded-xs p-5 space-y-4">
        <h3 className="font-serif font-bold text-[#32170d] text-base italic">Form Catat Kas Keluar</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-wider mb-1.5">
              Nama Barang / Keperluan Keluar
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Beli Es Batu Sachet"
              className="w-full h-11 px-4 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] placeholder-stone-400 focus:outline-none focus:border-[#32170d]"
            />
          </div>

          {/* Amount price */}
          <div>
            <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-wider mb-1.5">
              Tarif Biaya Belanja (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#967259]">
                Rp
              </span>
              <input 
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full h-11 pl-11 pr-4 bg-white border border-[#967259]/15 rounded-xs font-mono font-bold text-xs text-[#32170d] focus:outline-none focus:border-[#32170d]"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-[#967259] uppercase tracking-wider mb-1.5">
              Klasifikasi Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full h-11 px-4 bg-white border border-[#967259]/15 rounded-xs text-xs text-[#32170d] font-medium focus:outline-none focus:border-[#32170d]"
            >
              <option value="Bahan Baku">Bahan Baku</option>
              <option value="Operasional">Operasional</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full h-11 bg-[#32170d] hover:bg-[#4b2c20] text-[#feb300] font-bold text-xs uppercase tracking-widest rounded-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer border border-[#32170d]"
          >
            <Save className="h-4 w-4 text-[#feb300]" />
            <span>Catat Pengeluaran</span>
          </button>
        </form>
      </div>

      {/* Riwayat Hari Ini Logs List */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between pb-1.5 border-b border-[#967259]/15">
          <h3 className="font-serif font-bold text-[#32170d] text-base italic">Riwayat Keuangan</h3>
          <button
            onClick={() => setShowAllExpenses(!showAllExpenses)}
            className="font-sans text-[10px] uppercase font-bold tracking-wider text-[#967259] hover:text-[#32170d]"
          >
            {showAllExpenses ? 'MEMINIMALKAN' : 'LIHAT SEMUA &rarr;'}
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="bg-[#FAF9F5] border border-dashed border-[#967259]/25 text-center py-8 rounded-xs">
            <Coins className="h-6 w-6 text-stone-300 mx-auto mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#967259]">Nihil Pengeluaran</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {renderedExpensesList.map(exp => (
              <div 
                key={exp.id}
                className="bg-[#FAF9F5] border border-[#967259]/10 hover:border-[#32170d]/35 p-4 rounded-xs flex items-center justify-between hover:shadow-2xs transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 border border-[#967259]/10 bg-[#F0EBE1] text-[#32170d] rounded-xs flex-shrink-0">
                    <Coins className="h-4 w-4" />
                  </div>
                  
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-xs text-[#32170d] truncate">{exp.name}</p>
                    <div className="flex items-center space-x-2 text-[9px] font-mono font-bold tracking-wide text-stone-400 mt-0.5">
                      <span className="text-[#967259] uppercase rounded-sm">
                        {exp.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-0.5">
                        <Clock className="h-2.5 w-2.5 text-stone-300" />
                        <span>{exp.time}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="font-mono font-bold text-[#32170d] text-xs">
                    -Rp {exp.amount.toLocaleString('id-ID')}
                  </span>
                  
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1 rounded-sm text-stone-300 hover:text-red-700 transition-colors cursor-pointer"
                    title="Hapus Pengeluaran"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative Bottom Cashflow Card */}
      <div 
        className="relative overflow-hidden rounded-xs h-36 bg-cover bg-center text-white p-6 flex flex-col justify-end shadow-xs"
        style={{
          backgroundImage: `linear-gradient(rgba(50, 23, 13, 0.45), rgba(50, 23, 13, 0.9)), url('https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop')`,
        }}
      >
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#feb300] mb-1">
          Pantau Arus Kas — Vol. 04
        </span>
        <h3 className="text-sm font-serif italic text-stone-100">Presisi Alur Kas Keluar</h3>
        <p className="text-[10px] text-gray-300 mt-1">
          Pencatatan tertib menjauhkan dari kerugian tak terduga.
        </p>
      </div>
    </div>
  );
};
